/**
 * DeepAstro Past Life Intelligence Routes (SoulTrace Engine v1.0)
 * Endpoints for generating, reading, and auditing past-life insights.
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../database/db.js';
import {
  PastLifeIntelligenceEngine,
  PastLifeCardEngine,
  PastLifeEvidenceEngine,
  PastLifeAstrologyEngine,
  PastLifeNumerologyEngine,
} from '../intelligence/pastlife/index.js';

const router = Router();

// 1. POST /api/intelligence/past-life/generate
router.post('/generate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = db.getBirthProfile(userId);
    const { format, language, include_numerology, include_vedic_sources, include_purana_context, overrides } = req.body;

    const result = PastLifeIntelligenceEngine.generate(userId, profile, {
      format: format || 'insight_card',
      language: language || 'en',
      include_numerology: include_numerology !== false,
      include_vedic_sources: include_vedic_sources !== false,
      include_purana_context: include_purana_context !== false,
      overrides,
    });

    if (!result.success || !result.data) {
      return res.status(400).json({
        error: result.error || 'PAST_LIFE_ANALYSIS_UNAVAILABLE',
        message: 'Birth data incomplete for authentic past-life calculation.',
        missingFields: result.missingFields || [],
      });
    }

    const cardPayload = format === 'soul_journey'
      ? PastLifeCardEngine.formatForSoulJourney(result.data)
      : PastLifeCardEngine.formatForInsightCard(result.data);

    return res.status(200).json({
      status: 'SUCCESS',
      readingId: result.data.id,
      schema: result.data,
      card: cardPayload,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'INTERNAL_CALCULATION_ERROR',
      message: error.message || 'An error occurred while calculating past life intelligence.',
    });
  }
});

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
router.post('/:id/regenerate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const readingId = String(req.params.id);

    const existing = PastLifeIntelligenceEngine.getReading(readingId, userId);
    if (!existing.success || !existing.data) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Original reading not found.' });
    }

    const profile = db.getBirthProfile(userId);
    const regenerated = PastLifeIntelligenceEngine.generate(userId, profile, {
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
