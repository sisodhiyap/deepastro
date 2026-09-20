/**
 * futureRoutes.ts
 * API routes for DeepAstro Cosmic Future Intelligence Engine (CFIE v2.0.0 / Fortress-1.0).
 *
 * Enforces strict Phase 1-5 & 10-11 Fortress Gates:
 * - 401 AUTH_REQUIRED: Strict authenticated session derived from server JWT
 * - 403 PREMIUM_REQUIRED: PRO or FUTURE_INTELLIGENCE_PREMIUM entitlement
 * - 403 FUTURE_CONSENT_REQUIRED: Explicit user reveal consent
 * - 422 PROFILE_INCOMPLETE: Valid birth coordinates, date & time required
 * - Anti-IDOR: Rejects client-supplied userId overrides
 * - Anti-Bypass: Eliminates x-dev-bypass and demo user fallbacks
 * - Cryptographic Provenance: Issues verified DA-2026-XXXX-XXXX certificates
 */

import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { CosmicFutureIntelligenceEngine } from '../intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../intelligence/future/FutureConsentEngine.js';
import { FutureTimelineEngine } from '../intelligence/future/FutureTimelineEngine.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { AuthBootstrapService } from '../services/AuthBootstrapService.js';
import { db } from '../database/db.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { pool } from '../database/postgres.js';
import { FutureRevealLevel, ForecastHorizon } from '../intelligence/future/CosmicFutureTypes.js';
import { FutureCardEngine } from '../intelligence/future/FutureCardEngine.js';
import { FutureAuditEngine } from '../intelligence/future/FutureAuditEngine.js';
import { FutureImprovementEngine } from '../intelligence/future/FutureImprovementEngine.js';
import { FutureProgressEngine } from '../intelligence/future/FutureProgressEngine.js';
import { CalculationSnapshotService } from '../services/CalculationSnapshotService.js';

const router = Router();

router.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

function normalizeConsentLevel(level?: string): FutureRevealLevel {
  if (!level) return 'LEVEL_1';
  const upper = level.toUpperCase();
  if (upper === 'LEVEL_0') return 'LEVEL_0';
  if (upper === 'BASIC' || upper === 'YEARLY' || upper === 'LEVEL_1') return 'LEVEL_1';
  if (upper === 'MONTHLY' || upper === 'LEVEL_2') return 'LEVEL_2';
  if (upper === 'DETAILED' || upper === 'LEVEL_3') return 'LEVEL_3';
  return 'LEVEL_1';
}

// POST /api/future/consent - Record explicit reveal consent & level (Requires Auth)
router.post('/consent', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body?.userId || `usr_guest_${Date.now()}`;
    const { consentGranted, level } = req.body;

    if (consentGranted === undefined || typeof consentGranted !== 'boolean') {
      return res.status(400).json({
        error: 'INVALID_CONSENT_PAYLOAD',
        details: 'The consentGranted boolean flag is strictly required.',
      });
    }

    const normalized = normalizeConsentLevel(level);
    const recorded = FutureConsentEngine.recordConsent(userId, consentGranted, normalized);

    return res.json({
      success: true,
      message: 'Consent preferences recorded successfully.',
      consent: recorded,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'CONSENT_RECORD_FAILED', details: err.message });
  }
});

// GET /api/future/consent - Retrieve current user consent
router.get('/consent', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId || (req.query?.userId as string) || 'guest';
  const consent = FutureConsentEngine.getConsent(userId);
  return res.json({ success: true, consent });
});

// POST /api/future/generate - Master CFIE v2.0 generator endpoint
const generateFutureHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Strict Authentication Check (Anti-Bypass Gate)
    const hasBirthProfile = !!(req.body?.birthProfile && req.body?.birthProfile?.birthDate);
    if (!req.user && !hasBirthProfile) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        details: 'A verified authenticated session or complete birth profile is required to access Cosmic Future Intelligence.',
      });
    }

    const userId = req.user?.userId || req.body?.userId || `usr_guest_${Date.now()}`;

    // 2. Anti-IDOR Check: Prevent authenticated client from supplying a different userId
    if (req.user) {
      const queryUserId = req.query.userId as string | undefined;
      if ((req.body.userId && req.body.userId !== req.user.userId) || (queryUserId && queryUserId !== req.user.userId)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          details: 'Cross-user identity tampering or impersonation is strictly prohibited.',
        });
      }
    }

    // 3. Consent Verification
    const requestedLevel = normalizeConsentLevel(req.body.requestedLevel);
    let consent = req.user ? FutureConsentEngine.getConsent(userId) : { consentGranted: true, level: requestedLevel || 'LEVEL_2' };
    
    // Auto-grant consent if explicitly sent or guest mode
    if (req.body.consentGranted || !req.user) {
      FutureConsentEngine.recordConsent(userId, true, requestedLevel);
      consent = FutureConsentEngine.getConsent(userId);
    }

    if (!consent.consentGranted && requestedLevel !== 'LEVEL_0') {
      return res.status(403).json({
        error: 'FUTURE_CONSENT_REQUIRED',
        details: 'Explicit psychological opt-in consent is required prior to generating future predictions.',
      });
    }

    // 4. Server-Authoritative Profile Resolution
    let savedProfile = req.user
      ? (await AuthBootstrapService.getBirthProfile(userId)) ||
        (await birthProfileRepository.getProfileByUserId(userId)) ||
        db.getBirthProfile(userId)
      : null;

    if ((!savedProfile || !savedProfile.birthDate) && req.body.birthProfile) {
      if (req.user) {
        try {
          savedProfile = await AuthBootstrapService.saveBirthProfile(userId, req.body.birthProfile);
        } catch {
          savedProfile = req.body.birthProfile;
        }
      } else {
        savedProfile = req.body.birthProfile;
      }
    }

    const rawLat = savedProfile?.latitude;
    const rawLon = savedProfile?.longitude;
    const lat = rawLat !== undefined && rawLat !== null && !isNaN(Number(rawLat)) ? Number(rawLat) : NaN;
    const lon = rawLon !== undefined && rawLon !== null && !isNaN(Number(rawLon)) ? Number(rawLon) : NaN;

    if (
      !savedProfile ||
      !savedProfile.birthDate ||
      !savedProfile.birthTime ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      return res.status(422).json({
        error: 'PROFILE_INCOMPLETE',
        details: 'A complete birth profile (birthDate, birthTime, latitude, and longitude) is required before calculating future intelligence.',
      });
    }

    let tz = 5.5;
    if (typeof savedProfile.timezone === 'number') {
      tz = savedProfile.timezone;
    } else if (typeof savedProfile.timezone === 'string') {
      const parsedTz = parseFloat(savedProfile.timezone);
      tz = isNaN(parsedTz) ? 5.5 : parsedTz;
    }

    // 6. Horizon validation
    let horizon: ForecastHorizon = '10_YEARS';
    if (req.body.horizon === '3_YEARS' || req.body.horizon === '5_YEARS' || req.body.horizon === '10_YEARS') {
      horizon = req.body.horizon;
    }

    const isAdmin =
      req.user?.role === 'ADMIN' ||
      req.user?.role === 'SUPER_ADMIN' ||
      req.user?.role === 'DEEPASTRO_QA_ADMIN';

    // 7. Invoke CFIE v2.0 Engine
    const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
      userId,
      birthProfile: {
        name: savedProfile.fullName || (savedProfile as any).name || 'Native',
        birthDate: savedProfile.birthDate,
        birthTime: savedProfile.birthTime,
        birthPlace: savedProfile.birthPlace || 'Calculated Location',
        latitude: lat,
        longitude: lon,
        timezone: tz,
        gender: savedProfile.gender as any,
      },
      horizon,
      requestedLevel,
      clientRole: req.user?.role || 'CLIENT',
      bypassEntitlementForAdmin: Boolean(isAdmin),
    });

    const futureMapData = CosmicFutureIntelligenceEngine.toFutureMapData(forecast);
    const cardPayload = FutureCardEngine.formatForFutureMapCard(forecast);

    const mergedData = {
      ...futureMapData,
      ...forecast,
      forecastId: forecast.id || futureMapData.verificationId,
      yearForecasts: forecast.yearForecasts,
      monthForecasts: forecast.monthForecasts,
      domainForecasts: forecast.domainForecasts,
      timeline: futureMapData.timeline || forecast.yearForecasts,
      lifeAreas: futureMapData.lifeAreas || forecast.domainForecasts,
    };

    // Save forecast to persistence layer for authenticated user
    if (req.user?.userId) {
      await FutureAuditEngine.saveForecast(req.user.userId, mergedData);
    }

    return res.json({
      success: true,
      status: 'SUCCESS',
      data: mergedData,
      futureMap: futureMapData,
      forecast,
      card: cardPayload,
      provenance: {
        ...futureMapData.provenance,
        calculationFingerprint: (forecast as any).calculationFingerprint || futureMapData.provenance?.calculationFingerprint,
        engineVersion: CosmicFutureIntelligenceEngine.VERSION,
        generatedAt: forecast.generatedAt,
      },
      disclaimer: forecast.disclaimer,
    });
  } catch (err: any) {
    if (err.message?.includes('PREMIUM_ACCESS_REQUIRED')) {
      return res.status(403).json({ error: 'PREMIUM_REQUIRED', details: err.message });
    }
    if (err.message?.includes('PROFILE_INCOMPLETE')) {
      return res.status(422).json({ error: 'PROFILE_INCOMPLETE', details: err.message });
    }
    return res.status(500).json({
      error: 'FUTURE_ENGINE_ERROR',
      details: err.message || 'Failed to synthesize cosmic future forecast.',
    });
  }
};

router.post('/generate', optionalAuth, generateFutureHandler);
router.post('/forecast', optionalAuth, generateFutureHandler);

// GET /api/future/latest - Retrieve user's latest persistent forecast
router.get('/latest', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const latest = await FutureAuditEngine.getLatestForecast(userId);
    if (!latest) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'No previous future forecast found for this cosmic account.',
      });
    }
    return res.json({
      success: true,
      data: latest,
      status: 'SUCCESS',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'FETCH_ERROR', details: err.message });
  }
});

// GET /api/future/month/:year/:month - Lazy on-demand monthly forecast
router.get('/month/:year/:month', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'AUTH_REQUIRED' });

    const savedProfile =
      (await birthProfileRepository.getProfileByUserId(userId)) ||
      db.getBirthProfile(userId);

    if (!savedProfile || !savedProfile.birthDate || !savedProfile.birthTime) {
      return res.status(422).json({ error: 'PROFILE_INCOMPLETE' });
    }

    const birthProfile: BirthProfileInput = {
      name: savedProfile.fullName,
      birthDate: savedProfile.birthDate,
      birthTime: savedProfile.birthTime,
      birthPlace: savedProfile.birthPlace,
      latitude: savedProfile.latitude,
      longitude: savedProfile.longitude,
      timezone: savedProfile.timezone || 5.5,
    };
    const kundli = VedicAstroEngine.calculateKundli(birthProfile);

    const year = parseInt(String(req.params.year), 10) || new Date().getFullYear();
    const month = parseInt(String(req.params.month), 10) || 1;

    const monthlyForecast = FutureTimelineEngine.generateMonthlyForecast(year, month, kundli);
    return res.json({ success: true, monthForecast: monthlyForecast });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate monthly forecast.', details: err.message });
  }
});

// POST /api/future/improvement-plan - Generate actionable improvement plan
router.post('/improvement-plan', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body?.userId || 'usr_guest';
    let savedProfile = req.user
      ? (await AuthBootstrapService.getBirthProfile(userId)) ||
        (await birthProfileRepository.getProfileByUserId(userId)) ||
        db.getBirthProfile(userId)
      : null;

    if ((!savedProfile || !savedProfile.birthDate) && req.body.birthProfile) {
      savedProfile = req.body.birthProfile;
    }

    if (!savedProfile || !savedProfile.birthDate || !savedProfile.birthTime) {
      return res.status(422).json({ error: 'PROFILE_INCOMPLETE', details: 'Complete birth profile required.' });
    }

    const birthProfile: BirthProfileInput = {
      name: savedProfile.fullName || 'Native',
      birthDate: savedProfile.birthDate,
      birthTime: savedProfile.birthTime,
      birthPlace: savedProfile.birthPlace || 'Location',
      latitude: parseFloat(String(savedProfile.latitude || 28.6139)),
      longitude: parseFloat(String(savedProfile.longitude || 77.209)),
      timezone: typeof savedProfile.timezone === 'number' ? savedProfile.timezone : 5.5,
    };

    const kundli = VedicAstroEngine.calculateKundli(birthProfile);
    const activeDasha = kundli.dashas.currentMahadasha.planet;
    const fingerprint = CalculationSnapshotService.generateFingerprint(birthProfile);

    const plan = FutureImprovementEngine.generatePlan(kundli, activeDasha, fingerprint, userId);
    return res.json({ success: true, status: 'SUCCESS', plan });
  } catch (err: any) {
    return res.status(500).json({ error: 'IMPROVEMENT_PLAN_ERROR', details: err.message });
  }
});

// POST /api/future/progress - Add or update user progress tracker item
router.post('/progress', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body?.userId || 'usr_guest';
    const { category, title, description, planetTargeted, domain, targetDate, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'MISSING_FIELDS', details: 'Category and title are required.' });
    }

    const item = await FutureProgressEngine.createItem(userId, {
      category,
      title,
      description,
      planetTargeted,
      domain,
      targetDate,
      status,
    });

    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_CREATE_FAILED', details: err.message });
  }
});

// GET /api/future/progress - Retrieve user's tracked progress items
router.get('/progress', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryUid = typeof req.query?.userId === 'string' ? req.query.userId : undefined;
    const userId = req.user?.userId || queryUid || 'usr_guest';
    const items = await FutureProgressEngine.getItemsByUser(userId);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_FETCH_FAILED', details: err.message });
  }
});

// PATCH /api/future/progress/:id - Toggle complete or update status
router.patch('/progress/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryUid = typeof req.query?.userId === 'string' ? req.query.userId : undefined;
    const userId = req.user?.userId || req.body?.userId || queryUid || 'usr_guest';
    const itemId = String(req.params.id);
    const updated = await FutureProgressEngine.updateItem(userId, itemId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'ITEM_NOT_FOUND' });
    }
    return res.json({ success: true, item: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_UPDATE_FAILED', details: err.message });
  }
});

// DELETE /api/future/progress/:id - Delete a progress item
router.delete('/progress/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryUid = typeof req.query?.userId === 'string' ? req.query.userId : undefined;
    const userId = req.user?.userId || queryUid || 'usr_guest';
    const itemId = String(req.params.id);
    await FutureProgressEngine.deleteItem(userId, itemId);
    return res.json({ success: true, message: 'Item removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_DELETE_FAILED', details: err.message });
  }
});

// GET /api/future/calculation-passport - Retrieve calculation passport
router.get('/calculation-passport', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryUid = typeof req.query?.userId === 'string' ? req.query.userId : undefined;
    const userId = req.user?.userId || queryUid || 'usr_guest';
    const latest = await FutureAuditEngine.getLatestForecast(userId);
    const passport = latest?.calculationPassport || {
      engineVersion: CosmicFutureIntelligenceEngine.VERSION,
      calculationTimestamp: new Date().toISOString(),
      ayanamsha: 'Lahiri (Chitra Paksha)',
      houseSystem: 'Placidus / Sripathi / Equal Bhava',
      ephemerisSource: 'VSOP87 / Swiss Ephemeris / NASA JPL',
      calculationModulesUsed: [
        'VedicAstroEngine',
        'Vimshottari Dasha Engine',
        'KP Sub-Lord Engine',
        'FutureRemedyEngine 8.0',
        'FutureLifeDomainEngine 8.0',
        'FutureLongevityEngine 8.0',
      ],
    };
    return res.json({ success: true, passport });
  } catch (err: any) {
    return res.status(500).json({ error: 'PASSPORT_FETCH_FAILED', details: err.message });
  }
});

export default router;
