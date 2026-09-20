/**
 * DeepAstro Past Life Intelligence Routes (SoulTrace Engine v1.0)
 * Endpoints for generating, reading, and auditing past-life insights.
 */

import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../database/db.js';
import { AuthBootstrapService } from '../services/AuthBootstrapService.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import {
  PastLifeIntelligenceEngine,
  PastLifeCardEngine,
  PastLifeEvidenceEngine,
  PastLifeAstrologyEngine,
  PastLifeNumerologyEngine,
} from '../intelligence/pastlife/index.js';

const router = Router();

router.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// 1. POST /api/intelligence/past-life & /api/intelligence/past-life/generate
// Open to authenticated users and direct birth profiles without paywall or sign-in blocks
const generatePastLifeHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body?.userId || (req.body?.birthProfile ? `usr_guest_${Date.now()}` : null);
    if (!userId && !req.body?.birthProfile) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', code: 'AUTH_REQUIRED', message: 'Authentication or birth profile required.' });
    }
    const resolvedUserId = userId || `usr_guest_${Date.now()}`;

    let profile = req.user
      ? (await AuthBootstrapService.getBirthProfile(resolvedUserId)) ||
        (await birthProfileRepository.getProfileByUserId(resolvedUserId)) ||
        db.getBirthProfile(resolvedUserId)
      : null;

    if ((!profile || !profile.birthDate) && req.body.birthProfile) {
      if (req.user) {
        try {
          profile = await AuthBootstrapService.saveBirthProfile(resolvedUserId, req.body.birthProfile);
        } catch {
          profile = req.body.birthProfile;
        }
      } else {
        profile = req.body.birthProfile;
      }
    }

    if (profile) {
      const rawLat = (profile as any).latitude;
      const rawLon = (profile as any).longitude;
      const hasLat = rawLat !== undefined && rawLat !== null && rawLat !== '' && !isNaN(Number(rawLat));
      const hasLon = rawLon !== undefined && rawLon !== null && rawLon !== '' && !isNaN(Number(rawLon));
      if (!hasLat || !hasLon) {
        return res.status(400).json({
          success: false,
          error: 'PAST_LIFE_ANALYSIS_UNAVAILABLE',
          code: 'BIRTH_PROFILE_INCOMPLETE',
          message: 'Valid birth latitude and longitude coordinates are strictly required for authentic astronomical calculations.',
          missingFields: [!hasLat ? 'latitude' : '', !hasLon ? 'longitude' : ''].filter(Boolean),
        });
      }
      profile = {
        ...profile,
        fullName: (profile as any).fullName || (profile as any).name || 'Cosmic Native',
        birthPlace: (profile as any).birthPlace || (profile as any).city || '',
        latitude: Number(rawLat),
        longitude: Number(rawLon),
      };
    }

    const { format, language, include_numerology, include_vedic_sources, include_purana_context, overrides } = req.body;

    const result = PastLifeIntelligenceEngine.generate(resolvedUserId, profile as any, {
      format: format || 'insight_card',
      language: language || 'en',
      include_numerology: include_numerology !== false,
      include_vedic_sources: include_vedic_sources !== false,
      include_purana_context: include_purana_context !== false,
      overrides,
    });

    if (!result.success || !result.data) {
      return res.status(400).json({
        success: false,
        error: result.error || 'PAST_LIFE_ANALYSIS_UNAVAILABLE',
        message: 'Birth data incomplete for authentic past-life calculation.',
        details: {
          code: result.error || 'PAST_LIFE_ANALYSIS_UNAVAILABLE',
          message: 'Birth data incomplete for authentic past-life calculation.',
        },
        missingFields: result.missingFields || [],
      });
    }

    const cardPayload = format === 'soul_journey'
      ? PastLifeCardEngine.formatForSoulJourney(result.data)
      : PastLifeCardEngine.formatForInsightCard(result.data);

    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      readingId: result.data.id,
      schema: result.data,
      data: result.data,
      card: cardPayload,
      provenance: {
        calculationFingerprint: result.provenance?.calculationFingerprint || result.data.calculationFingerprint,
        sources: result.provenance?.sources || [
          'Vedic Ephemeris (Swiss Lahiri)',
          'Jaimini Sutras (Chara Karakas)',
          'KP Cuspal Sublords (12th & 8th Houses)',
          'Navamsha (D9) & Shashtiamsa (D60)',
          'Pythagorean & Vedic Numerology Cycles',
          'Classical Puranic Canon (Vishnu Purana, Bhagavata)',
        ],
        engineVersion: PastLifeIntelligenceEngine.VERSION,
        knowledgeVersion: PastLifeIntelligenceEngine.KNOWLEDGE_VERSION,
        generatedAt: result.data.generated_at,
        confidence: result.data.confidence,
        astrologicalIndicatorsCount: result.data.astrological_indicators?.length || 0,
        vedicReferencesCount: result.data.vedic_references?.length || 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_CALCULATION_ERROR',
      message: error.message || 'An error occurred while calculating past life intelligence.',
      details: {
        code: 'INTERNAL_CALCULATION_ERROR',
        message: error.message || 'An error occurred while calculating past life intelligence.',
      },
    });
  }
};

router.post('/', optionalAuth, generatePastLifeHandler);
router.post('/generate', optionalAuth, generatePastLifeHandler);

// 2. GET /api/intelligence/past-life/history
router.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const history = PastLifeIntelligenceEngine.getUserHistory(userId);
    return res.status(200).json({
      status: 'SUCCESS',
      count: history.length,
      readings: history,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'HISTORY_FETCH_ERROR', message: error.message });
  }
});

// 2b. GET /api/intelligence/past-life/latest - Retrieve user's latest saved reading
router.get('/latest', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const history = PastLifeIntelligenceEngine.getUserHistory(userId);
    if (!history || history.length === 0) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        error: 'NOT_FOUND',
        message: 'No previous past life reading found on record for this account.',
      });
    }
    const latest = history[history.length - 1];
    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      reading: latest,
      insightCard: PastLifeCardEngine.formatForInsightCard(latest),
      soulJourney: PastLifeCardEngine.formatForSoulJourney(latest),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'FETCH_ERROR', message: error.message });
  }
});

// 3. GET /api/intelligence/past-life/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);

    const result = PastLifeIntelligenceEngine.getReading(readingId, userId);
    if (!result.success || !result.data) {
      if (result.error === 'ACCESS_DENIED') {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'You are not authorized to view this reading.' });
      }
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Past life reading not found.' });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      reading: result.data,
      insightCard: PastLifeCardEngine.formatForInsightCard(result.data),
      soulJourney: PastLifeCardEngine.formatForSoulJourney(result.data),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'FETCH_ERROR', message: error.message });
  }
});

// 4. POST /api/intelligence/past-life/:id/regenerate
router.post('/:id/regenerate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);

    const existing = PastLifeIntelligenceEngine.getReading(readingId, userId);
    if (!existing.success || !existing.data) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Original reading not found.' });
    }

    let profile =
      (await AuthBootstrapService.getBirthProfile(userId)) ||
      (await birthProfileRepository.getProfileByUserId(userId)) ||
      db.getBirthProfile(userId);

    if ((!profile || !profile.birthDate) && req.body.birthProfile) {
      profile = await AuthBootstrapService.saveBirthProfile(userId, req.body.birthProfile);
    }
    const regenerated = PastLifeIntelligenceEngine.generate(userId, profile as any, {
      format: req.body.format || 'insight_card',
      language: req.body.language || 'en',
    });

    return res.status(200).json({
      status: 'SUCCESS',
      reading: regenerated.data,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'REGENERATE_ERROR', message: error.message });
  }
});

// 5. POST /api/intelligence/past-life/:id/feedback
router.post('/:id/feedback', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);
    const { sentiment, comment } = req.body;

    if (!sentiment || !['RESONATES', 'PARTIALLY_RESONATES', 'DOES_NOT_RESONATE', 'NOT_SURE'].includes(sentiment)) {
      return res.status(400).json({ error: 'INVALID_SENTIMENT', message: 'Sentiment must be RESONATES, PARTIALLY_RESONATES, DOES_NOT_RESONATE, or NOT_SURE.' });
    }

    PastLifeIntelligenceEngine.recordFeedback({
      reading_id: readingId,
      user_id: userId,
      sentiment,
      comment,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Feedback recorded as non-deterministic signal.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'FEEDBACK_ERROR', message: error.message });
  }
});

// 6. GET /api/intelligence/past-life/:id/sources
router.get('/:id/sources', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);
    const result = PastLifeIntelligenceEngine.getReading(readingId, userId);
    if (!result.success || !result.data) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      vedic_references: result.data.vedic_references,
      purana_references: result.data.purana_references,
      epistemic_notice: result.data.epistemic_notice,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SOURCES_ERROR', message: error.message });
  }
});

// 7. GET /api/intelligence/past-life/:id/evidence
router.get('/:id/evidence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);
    const result = PastLifeIntelligenceEngine.getReading(readingId, userId);
    if (!result.success || !result.data) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      astrological_indicators: result.data.astrological_indicators,
      numerology_indicators: result.data.numerology_indicators,
      confidence: result.data.confidence,
      contradictions: result.data.contradictions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'EVIDENCE_ERROR', message: error.message });
  }
});

// 8. GET /api/admin/intelligence/past-life
router.get('/admin/observatory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'ADMIN_ONLY' });
    }
    const metrics = PastLifeIntelligenceEngine.getObservatoryMetrics();
    return res.status(200).json({
      status: 'SUCCESS',
      metrics,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'ADMIN_ERROR', message: error.message });
  }
});

export default router;
