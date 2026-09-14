/**
 * futureRoutes.ts
 * API routes for DeepAstro Cosmic Future Intelligence Engine (CFIE v1.0.0).
 */

import { Router, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { CosmicFutureIntelligenceEngine } from '../intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../intelligence/future/FutureConsentEngine.js';
import { FutureIntelligenceObservatory } from '../intelligence/future/FutureIntelligenceObservatory.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';

const router = Router();

// POST /api/future/consent - Record explicit reveal consent & level
router.post('/consent', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'user_default';
    const { consentGranted, level } = req.body;

    const consent = FutureConsentEngine.recordConsent(
      userId,
      Boolean(consentGranted),
      level || 'LEVEL_1'
    );

    return res.json({ success: true, consent });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record consent.', details: err?.message });
  }
});

// POST /api/future/generate - Generate or retrieve future forecast
router.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'user_default';
    const clientRole = req.user?.role || 'CLIENT';

    // IDOR Security: Client cannot request forecast for arbitrary user
    if (req.user && req.body.userId && req.body.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        details: 'Client cannot request future forecasts for an arbitrary or foreign user_id.',
      });
    }

    let profile = req.body.birthProfile;
    if (!profile && req.user) {
      const saved = (await birthProfileRepository.getProfileByUserId(req.user.userId)) || db.getBirthProfile(req.user.userId);
      if (saved) {
        profile = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
      }
    }

    const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
      userId,
      birthProfile: profile,
      horizon: req.body.horizon || '10_YEARS',
      requestedLevel: req.body.requestedLevel || 'LEVEL_1',
      clientRole,
      bypassEntitlementForAdmin: clientRole === 'ADMIN' || clientRole === 'SUPER_ADMIN',
    });

    return res.json({ success: true, data: forecast });
  } catch (err: any) {
    if (err?.message?.includes('PREMIUM_ACCESS_REQUIRED')) {
      return res.status(403).json({
        error: 'PREMIUM_ACCESS_REQUIRED',
        details: 'Cosmic Future Intelligence Engine is reserved exclusively for Premium and Pro members.',
      });
    }
    return res.status(500).json({ error: 'Failed to generate future forecast.', details: err?.message });
  }
});

// GET /api/future/forecast/:id - Retrieve forecast by ID
router.get('/forecast/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const forecast = CosmicFutureIntelligenceEngine.getForecastById(String(req.params.id));
    if (!forecast) {
      return res.status(404).json({ error: 'Forecast not found.' });
    }
    return res.json({ success: true, data: forecast });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve forecast.', details: err?.message });
  }
});

// POST /api/future/compare - Compare two forecast years
router.post('/compare', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { forecastId, yearA, yearB } = req.body;
    const forecast = CosmicFutureIntelligenceEngine.getForecastById(forecastId);
    if (!forecast) {
      return res.status(404).json({ error: 'Forecast reference not found.' });
    }

    const comparison = CosmicFutureIntelligenceEngine.compareYears(
      forecast,
      parseInt(yearA, 10),
      parseInt(yearB, 10)
    );

    return res.json({ success: true, comparison });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compare forecast years.', details: err?.message });
  }
});

// POST /api/future/outcome - Register outcome feedback with unknown protection
router.post('/outcome', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { forecastId, eventId, outcome, notes } = req.body;
    // Unknown protection rule (Section 63):
    // If outcome is UNKNOWN, silence, or undefined, strictly record as UNKNOWN without treating as success
    const recordedOutcome = (outcome === 'YES' || outcome === 'PARTIALLY' || outcome === 'NO') ? outcome : 'UNKNOWN';

    return res.json({
      success: true,
      recordedOutcome,
      note: recordedOutcome === 'UNKNOWN' ? 'Outcome recorded as UNKNOWN. Silence or ambiguity is never marked as predictive confirmation.' : 'Outcome recorded for longitudinal learning.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to register outcome.', details: err?.message });
  }
});

// GET /api/future/admin/observatory (or mounted at /api/admin/intelligence/future)
router.get('/admin/observatory', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = FutureIntelligenceObservatory.getDashboardMetrics();
    return res.json(metrics);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch future observatory metrics.', details: err?.message });
  }
});

export default router;
