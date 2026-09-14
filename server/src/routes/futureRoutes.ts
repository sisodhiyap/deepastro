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
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { CosmicFutureIntelligenceEngine } from '../intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../intelligence/future/FutureConsentEngine.js';
import { FutureTimelineEngine } from '../intelligence/future/FutureTimelineEngine.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { pool } from '../database/postgres.js';
import { FutureRevealLevel, ForecastHorizon } from '../intelligence/future/CosmicFutureTypes.js';

const router = Router();

function normalizeConsentLevel(level?: string): FutureRevealLevel {
  if (!level) return 'LEVEL_1';
  const upper = level.toUpperCase();
  if (upper === 'LEVEL_0') return 'LEVEL_0';
  if (upper === 'BASIC' || upper === 'YEARLY' || upper === 'LEVEL_1') return 'LEVEL_1';
  if (upper === 'MONTHLY' || upper === 'LEVEL_2') return 'LEVEL_2';
  if (upper === 'DETAILED' || upper === 'LEVEL_3') return 'LEVEL_3';
  if (upper === 'SENSITIVE' || upper === 'LEVEL_4') return 'LEVEL_4';
  if (upper === 'LEVEL_5') return 'LEVEL_5';
  if (upper === 'LONGEVITY' || upper === 'LEVEL_6') return 'LEVEL_6';
  return 'LEVEL_1';
}

// POST /api/future/consent - Record explicit reveal consent & level (Requires Auth)
router.post('/consent', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        details: 'Authentication is strictly required to record future reveal consent.',
      });
    }

    const { consentGranted, level } = req.body;
    const mappedLevel = normalizeConsentLevel(level);

    const consent = FutureConsentEngine.recordConsent(
      userId,
      Boolean(consentGranted),
      mappedLevel
    );

    return res.json({ success: true, consent });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record consent.', details: err?.message });
  }
});

// GET /api/future/consent - Retrieve current user consent
router.get('/consent', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'AUTH_REQUIRED' });
    }
    const consent = FutureConsentEngine.getConsent(userId);
    return res.json({ success: true, consent });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch consent.', details: err?.message });
  }
});

// POST /api/future/generate - Master CFIE v2.0 generator endpoint
const generateFutureHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Strict Authentication Check (Anti-Bypass Gate)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        details: 'A verified authenticated session is mandatory to access Cosmic Future Intelligence.',
      });
    }

    const userId = req.user.userId;

    // 2. Anti-IDOR Check: Prevent client from supplying a different userId in body
    if (req.body.userId && req.body.userId !== userId) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        details: 'Cross-user identity tampering or impersonation is strictly prohibited.',
      });
    }

    // 3. Subscription & Entitlement Check (PREMIUM / PRO only)
    const hasPremium =
      db.hasEntitlement(userId, 'FUTURE_INTELLIGENCE_PREMIUM') ||
      db.hasEntitlement(userId, 'PRO');
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (!hasPremium && !isAdmin) {
      return res.status(403).json({
        error: 'PREMIUM_REQUIRED',
        details: 'Cosmic Future Intelligence is an elite premium feature reserved for Pro and Premium members.',
      });
    }

    // 4. Consent Enforcement
    const requestedLevel = normalizeConsentLevel(req.body.requestedLevel);
    const consent = FutureConsentEngine.getConsent(userId);

    if (!consent.consentGranted && requestedLevel !== 'LEVEL_0') {
      return res.status(403).json({
        error: 'FUTURE_CONSENT_REQUIRED',
        details: 'Explicit psychological opt-in consent is required prior to generating future predictions.',
      });
    }

    // 5. Server-Authoritative Profile Resolution (Zero Synthetic Fallbacks)
    const savedProfile =
      (await birthProfileRepository.getProfileByUserId(userId)) ||
      db.getBirthProfile(userId);

    if (
      !savedProfile ||
      !savedProfile.birthDate ||
      !savedProfile.birthTime ||
      typeof savedProfile.latitude !== 'number' ||
      typeof savedProfile.longitude !== 'number'
    ) {
      return res.status(422).json({
        error: 'PROFILE_INCOMPLETE',
        details: 'A complete birth profile (birthDate, birthTime, latitude, and longitude) is required before calculating future intelligence.',
      });
    }

    // 6. Horizon validation
    let horizon: ForecastHorizon = '10_YEARS';
    if (req.body.horizon === '3_YEARS' || req.body.horizon === '5_YEARS' || req.body.horizon === '10_YEARS') {
      horizon = req.body.horizon;
    }

    // 7. Invoke CFIE v2.0 Engine
    const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
      userId,
      birthProfile: {
        name: savedProfile.fullName,
        birthDate: savedProfile.birthDate,
        birthTime: savedProfile.birthTime,
        birthPlace: savedProfile.birthPlace,
        latitude: savedProfile.latitude,
        longitude: savedProfile.longitude,
        timezone: savedProfile.timezone || 5.5,
        gender: savedProfile.gender,
      },
      horizon,
      requestedLevel,
      clientRole: req.user.role,
    });

    const futureMapData = CosmicFutureIntelligenceEngine.toFutureMapData(forecast);

    return res.json({
      success: true,
      data: futureMapData,
      provenance: futureMapData.provenance,
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

router.post('/generate', requireAuth, generateFutureHandler);
router.post('/forecast', requireAuth, generateFutureHandler);

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

// GET /api/future/sources - Verified classical Jyotish sources and rule versions
router.get('/sources', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    engineVersion: CosmicFutureIntelligenceEngine.VERSION,
    classicalSources: [
      { name: 'Brihat Parashara Hora Shastra', authority: 'Sage Parashara', domain: 'Dignities, Yogas, Bhava Lords, Vimshottari Dasha' },
      { name: 'Phaladeepika', authority: 'Mantreswara', domain: 'Transit (Gochara) Results, Upachaya Activation' },
      { name: 'Jaimini Upadesha Sutras', authority: 'Maharishi Jaimini', domain: 'Chara Dasha, Atmakaraka, Amatyakaraka' },
      { name: 'KP Readers I–VI', authority: 'Prof. K.S. Krishnamurti', domain: 'Placidus Cusps, Sub-Lords, Precision Event Timing' },
      { name: 'Saravali', authority: 'Kalyana Varma', domain: 'Planetary Combinations & Raja Yogas' },
    ],
  });
});

export default router;
