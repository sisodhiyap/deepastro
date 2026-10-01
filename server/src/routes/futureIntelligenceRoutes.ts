/**
 * futureIntelligenceRoutes.ts
 * Dedicated REST API routes for Future Intelligence & Year-by-Year Prediction Engine (FUTURE_INTELLIGENCE_V1).
 * Strictly server-authoritative: Never accepts planetary positions from the client.
 */

import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { FutureIntelligenceEngine } from '../intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { futureIntelligenceRepository } from '../database/repositories/FutureIntelligenceRepository.js';
import { ChartContextResolver } from '../intelligence/future-intelligence/ChartContextResolver.js';
import { CalculationSnapshotService } from '../services/CalculationSnapshotService.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';

const router = Router();

router.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Helper: Resolve effective authenticated user ID or guest fallback
function resolveUserId(req: AuthenticatedRequest): string {
  if (req.user?.userId) return req.user.userId;
  const guestHeader = req.headers['x-guest-user-id'] as string;
  if (guestHeader) return guestHeader;
  return 'usr_guest_future';
}

/**
 * GET /api/future-intelligence/charts
 * Lists available Kundlis for the user (Primary chart + any saved family/partner/child charts).
 */
router.get('/charts', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = resolveUserId(req);

    // 1. Get Primary Profile
    let primaryProfile: any = null;
    const bpRes = await CalculationSnapshotService.getCanonicalBirthProfile(userId);
    if (bpRes.isValid && bpRes.profile) {
      primaryProfile = bpRes.profile;
    } else {
      primaryProfile = (await birthProfileRepository.getProfileByUserId(userId)) || db.getBirthProfile(userId);
    }

    const charts: any[] = [];
    if (primaryProfile && primaryProfile.birthDate && primaryProfile.birthTime) {
      const fp = CalculationSnapshotService.generateFingerprint(primaryProfile, 'Lahiri');
      charts.push({
        id: 'primary',
        name: primaryProfile.fullName || primaryProfile.name || 'Primary Birth Chart',
        relationship: 'Self',
        birthDate: primaryProfile.birthDate,
        birthTime: String(primaryProfile.birthTime).slice(0, 5),
        birthPlace: primaryProfile.birthPlace || 'Calculated Coordinates',
        latitude: Number(primaryProfile.latitude),
        longitude: Number(primaryProfile.longitude),
        timezone: Number(primaryProfile.timezone || 5.5),
        gender: primaryProfile.gender || 'Other',
        calculationFingerprint: fp,
        isPrimary: true,
      });
    }

    // 2. Get additional saved charts
    const saved = await futureIntelligenceRepository.getSavedCharts(userId);
    for (const sc of saved) {
      if (sc.id !== 'primary') {
        const fp = sc.calculationFingerprint || CalculationSnapshotService.generateFingerprint(sc as any, 'Lahiri');
        charts.push({
          id: sc.id,
          name: sc.name,
          relationship: sc.relationship || 'Family Member',
          birthDate: sc.birthDate,
          birthTime: sc.birthTime,
          birthPlace: sc.birthPlace,
          latitude: sc.latitude,
          longitude: sc.longitude,
          timezone: sc.timezone,
          gender: sc.gender,
          calculationFingerprint: fp,
          isPrimary: false,
        });
      }
    }

    return res.json({
      success: true,
      charts,
      count: charts.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'FAILED_TO_LOAD_CHARTS', details: err.message });
  }
});

/**
 * POST /api/future-intelligence/charts
 * Saves a new Kundli (e.g. Partner, Child, Family Member).
 */
router.post('/charts', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const { name, birthDate, birthTime, birthPlace, latitude, longitude, timezone, gender, relationship } = req.body;

    if (!name || !birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'INVALID_CHART_PAYLOAD',
        details: 'Name, birthDate, birthTime, latitude, and longitude are required.',
      });
    }

    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const chartRecord = {
      id: chartId,
      userId,
      name: String(name).trim(),
      birthDate: String(birthDate).trim(),
      birthTime: String(birthTime).trim().slice(0, 5),
      birthPlace: String(birthPlace || 'Location').trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: Number(timezone || 5.5),
      gender: gender || 'Other',
      relationship: relationship || 'Family Member',
      calculationFingerprint: CalculationSnapshotService.generateFingerprint({
        name,
        birthDate,
        birthTime,
        birthPlace,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone: Number(timezone || 5.5),
      } as any, 'Lahiri'),
      createdAt: new Date().toISOString(),
    };

    await futureIntelligenceRepository.saveSavedChart(chartRecord);

    return res.status(201).json({
      success: true,
      message: 'Kundli saved successfully.',
      chart: chartRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'FAILED_TO_SAVE_CHART', details: err.message });
  }
});

/**
 * POST /api/future-intelligence/generate
 * Generates or retrieves cached future forecast.
 * Inputs: { chartId, startDate, years }
 */
router.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const { chartId = 'primary', startDate, years = 5, forceRecalculate = false } = req.body;

    // Optional birth profile inline bootstrap if user has no saved profile yet
    if (req.body.birthProfile && req.body.birthProfile.birthDate) {
      const bp = req.body.birthProfile;
      await birthProfileRepository.createProfile({
        userId,
        fullName: bp.name || bp.fullName || 'Cosmic Native',
        birthDate: bp.birthDate,
        birthTime: bp.birthTime,
        birthPlace: bp.birthPlace || 'Location',
        latitude: Number(bp.latitude || 28.6139),
        longitude: Number(bp.longitude || 77.2090),
        timezone: Number(bp.timezone || 5.5),
        gender: bp.gender || 'Other',
      });
    }

    const forecast = await FutureIntelligenceEngine.generateForecast({
      userId,
      chartId,
      startDate,
      years: Number(years),
      forceRecalculate: Boolean(forceRecalculate),
    });

    return res.json({
      success: true,
      forecastId: forecast.forecastId,
      chartId: forecast.chartId,
      calculationFingerprint: forecast.calculationFingerprint,
      predictionVersion: forecast.predictionVersion,
      forecastRange: forecast.forecastRange,
      startDate: forecast.startDate,
      endDate: forecast.endDate,
      chartSummary: forecast.chartSummary,
      currentPeriod: forecast.currentPeriod,
      nextMajorTransition: forecast.nextMajorTransition,
      nextSignificantWindow: forecast.nextSignificantWindow,
      years: forecast.years,
      importantWindows: forecast.importantWindows,
      evidence: forecast.years.flatMap((y) => y.evidence),
      engineCoverage: forecast.engineCoverage,
      dataLineage: forecast.dataLineage,
      methodologyDisclosure: forecast.methodologyDisclosure,
      ethicalNotice: forecast.ethicalNotice,
    });
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', details: err.message });
    }
    if (err.message?.includes('CHART_NOT_FOUND')) {
      return res.status(404).json({ error: 'CHART_NOT_FOUND', details: err.message });
    }
    if (
      err.message?.includes('PREDICTION_CONTEXT_INCOMPLETE') ||
      err.message?.includes('INVALID_COORDINATES')
    ) {
      return res.status(422).json({
        success: false,
        code: 'PREDICTION_CONTEXT_INCOMPLETE',
        error: 'PREDICTION_CONTEXT_INCOMPLETE',
        details: err.message,
        missingEngines: ['D1_RASHI_ENGINE', 'VIMSHOTTARI_DASHA_ENGINE', 'VARGA_SHODASHAVARGA_ENGINE', 'KP_STELLAR_ENGINE'],
      });
    }
    return res.status(500).json({
      error: 'FUTURE_INTELLIGENCE_ERROR',
      details: err.message || 'Failed to generate Future Intelligence forecast.',
    });
  }
});

/**
 * GET /api/future-intelligence/:forecastId
 * Retrieves an existing forecast by forecastId with privacy checks.
 */
router.get('/:forecastId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const forecastId = String(req.params.forecastId);
    const userId = resolveUserId(req);

    const { forecast, years, windows } = await futureIntelligenceRepository.getForecastById(forecastId);
    if (!forecast) {
      return res.status(404).json({ error: 'FORECAST_NOT_FOUND', details: 'Forecast not found.' });
    }

    // Privacy Gate (Section 35): User A cannot access User B's forecast
    if (req.user && forecast.userId !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        details: 'You do not have permission to access this forecast.',
      });
    }

    // Resolve context for metadata formatting
    const context = await ChartContextResolver.resolve(forecast.userId, forecast.chartId);
    const formatted = (FutureIntelligenceEngine as any).formatCachedResult(forecast, years, windows, context);

    return res.json({
      success: true,
      data: formatted,
      forecast: formatted,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'FETCH_ERROR', details: err.message });
  }
});

/**
 * GET /api/future-intelligence/:forecastId/year/:year
 * Retrieves specific year forecast with complete 12-month breakdown.
 */
router.get('/:forecastId/year/:year', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const forecastId = String(req.params.forecastId);
    const year = String(req.params.year);
    const targetYear = parseInt(year, 10);
    if (isNaN(targetYear)) {
      return res.status(400).json({ error: 'INVALID_YEAR', details: 'Year must be a valid number.' });
    }

    const { forecast, years } = await futureIntelligenceRepository.getForecastById(forecastId);
    if (!forecast) {
      return res.status(404).json({ error: 'FORECAST_NOT_FOUND', details: 'Forecast not found.' });
    }

    const yearData = years.find((y) => y.year === targetYear);
    if (!yearData) {
      return res.status(404).json({ error: 'YEAR_NOT_FOUND', details: `Forecast for year ${targetYear} not found.` });
    }

    // Compute month-by-month analysis
    const context = await ChartContextResolver.resolve(forecast.userId, forecast.chartId);
    const { MonthlyForecastEngine } = await import('../intelligence/future-intelligence/MonthlyForecastEngine.js');
    const months = MonthlyForecastEngine.calculateMonthsForYear(context, targetYear);

    return res.json({
      success: true,
      year: targetYear,
      forecast: yearData,
      months,
      evidence: yearData.evidenceJson,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'FETCH_YEAR_ERROR', details: err.message });
  }
});

/**
 * POST /api/future-intelligence/:forecastId/regenerate
 * Force regeneration of forecast.
 */
router.post('/:forecastId/regenerate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const forecastId = String(req.params.forecastId);
    const userId = resolveUserId(req);

    const { forecast } = await futureIntelligenceRepository.getForecastById(forecastId);
    if (!forecast) {
      return res.status(404).json({ error: 'FORECAST_NOT_FOUND', details: 'Forecast not found.' });
    }

    if (req.user && forecast.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', details: 'Unauthorized.' });
    }

    const totalYears = parseInt(forecast.forecastHorizon.split('_')[0], 10) || 5;

    const regenerated = await FutureIntelligenceEngine.generateForecast({
      userId: forecast.userId,
      chartId: forecast.chartId,
      startDate: forecast.startDate,
      years: totalYears,
      forceRecalculate: true,
    });

    return res.json({
      success: true,
      message: 'Forecast regenerated successfully.',
      forecast: regenerated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'REGENERATE_ERROR', details: err.message });
  }
});

export default router;
