/**
 * Learning & Prediction Intelligence Routes
 * Exposes endpoints for curated predictions, daily personalized intelligence,
 * user outcome feedback submission, and "Why this prediction?" evidence queries.
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../astrology/CalculationSnapshot.js';
import { CuratedPredictionEngine } from '../learning/CuratedPredictionEngine.js';
import { DailyPersonalizedIntelligenceEngine } from '../learning/DailyPersonalizedIntelligence.js';
import { OutcomeLearningEngine } from '../learning/OutcomeLearningEngine.js';
import { PredictionErrorClassifier } from '../learning/PredictionErrorClassifier.js';
import { db } from '../database/db.js';

const router = Router();

// Helper to obtain or build CalculationSnapshot for a user
function getSnapshotForUser(userId: string, bodyProfile?: any) {
  if (bodyProfile && bodyProfile.birthDate && bodyProfile.birthTime) {
    const factSet = VedicAstroEngine.createAstrologyFactSet({
      name: bodyProfile.name || 'User',
      birthDate: bodyProfile.birthDate,
      birthTime: bodyProfile.birthTime,
      birthPlace: bodyProfile.birthPlace || 'Location',
      latitude: Number(bodyProfile.latitude) || 27.1767,
      longitude: Number(bodyProfile.longitude) || 78.0081,
      timezone: Number(bodyProfile.timezone) || 5.5,
    });
    return CalculationSnapshotEngine.createSnapshot(factSet, userId);
  }

  const birthProfile = db.getBirthProfile(userId);
  if (!birthProfile) {
    throw new Error('No birth profile found. Please provide birth profile data or save one in your account.');
  }

  const factSet = VedicAstroEngine.createAstrologyFactSet({
    name: birthProfile.fullName,
    birthDate: birthProfile.birthDate,
    birthTime: birthProfile.birthTime,
    birthPlace: birthProfile.birthPlace,
    latitude: birthProfile.latitude,
    longitude: birthProfile.longitude,
    timezone: birthProfile.timezone,
  });
  return CalculationSnapshotEngine.createSnapshot(factSet, userId, birthProfile.id);
}

// 1. Generate Curated Personalized Prediction
router.post('/predict', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { domain, question, birthProfile } = req.body;
    const targetDomain = domain || 'Career';

    const snapshot = getSnapshotForUser(userId, birthProfile);
    const prediction = CuratedPredictionEngine.generatePrediction(
      userId,
      snapshot,
      targetDomain,
      question
    );

    res.json({ success: true, prediction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Generate Daily Personalized Intelligence
router.post('/daily', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { targetDate, birthProfile } = req.body;

    const snapshot = getSnapshotForUser(userId, birthProfile);
    const dailyForecast = DailyPersonalizedIntelligenceEngine.generateDailyForecast(
      userId,
      snapshot,
      targetDate
    );

    res.json({ success: true, dailyForecast });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Submit Outcome Feedback & Trigger Diagnostic Pipeline
router.post('/feedback', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { predictionId, rating, notes, actualOutcomeDescription, outcomeDate } = req.body;

    if (!predictionId || !rating) {
      return res.status(400).json({ success: false, error: 'predictionId and rating are required' });
    }

    const { feedbackRecord } = OutcomeLearningEngine.recordFeedback(userId, {
      predictionId,
      rating,
      notes,
      actualOutcomeDescription,
      outcomeDate,
    });

    // If feedback indicates discrepancy or inaccuracy, trigger 6-step error diagnosis
    let investigation;
    const isNegative = ['inaccurate', 'wrong_timing', 'wrong_life_area', 'too_generic'].includes(rating);
    if (isNegative) {
      const prediction = db.predictionRecords.get(predictionId);
      if (prediction) {
        let snapshot;
        if (prediction.snapshotId) {
          const snapRecord = db.calculationSnapshots.get(prediction.snapshotId);
          snapshot = snapRecord?.payload;
        }
        investigation = PredictionErrorClassifier.diagnose(prediction, rating, snapshot, notes);
      }
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully as USER_OUTCOME_EVIDENCE.',
      feedback: feedbackRecord,
      investigation,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. "Why this prediction?" Evidence Exposer
router.get('/why/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const predictionId = String(req.params.id);
    const prediction = db.predictionRecords.get(predictionId);

    if (!prediction || prediction.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Prediction not found or unauthorized' });
    }

    res.json({
      success: true,
      predictionId: prediction.id,
      headline: prediction.headline,
      evidenceGraph: prediction.evidenceGraph,
      rulesApplied: prediction.rulesApplied,
      sourcesCited: prediction.sourcesCited,
      confidenceModel: prediction.confidenceModel,
      uncertainties: prediction.uncertainties,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
