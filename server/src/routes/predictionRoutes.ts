/**
 * DeepAstro Phase 5 — Prediction Ledger & Calibration Routes
 * Endpoints for immutable prediction ledger, user outcome recording,
 * and system calibration evaluation.
 */

import { Router, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { PredictionLedger, PredictionOutcome } from '../learning/PredictionLedger.js';
import { PredictionCalibrationEngine } from '../learning/PredictionCalibrationEngine.js';

const router = Router();

// GET /api/predictions — List predictions for the active user
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';
    const predictions = PredictionLedger.getUserPredictions(userId);

    res.json({
      success: true,
      userId,
      count: predictions.length,
      predictions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/predictions/calibration — Internal system calibration metrics
router.get('/calibration', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string);
    const predictions = userId
      ? PredictionLedger.getUserPredictions(userId)
      : PredictionLedger.getAllPredictions();

    const metrics = PredictionCalibrationEngine.computeMetricsV2(predictions);

    res.json({
      success: true,
      calibration: metrics,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/predictions/:id — Fetch a single prediction record
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const predictionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const prediction = PredictionLedger.getPrediction(predictionId);

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction record not found.' });
    }

    res.json({
      success: true,
      prediction,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/predictions/:id/outcome — User reports prediction outcome
router.post('/:id/outcome', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const predictionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { outcome, userNotes } = req.body;

    const validOutcomes: PredictionOutcome[] = [
      'HAPPENED',
      'PARTIALLY_HAPPENED',
      'DID_NOT_HAPPEN',
      'TIMING_WRONG',
      'TOO_VAGUE',
      'NOT_ENOUGH_INFORMATION',
      'UNKNOWN',
    ];

    if (!outcome || !validOutcomes.includes(outcome as PredictionOutcome)) {
      return res.status(400).json({
        error: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`,
      });
    }

    const updated = PredictionLedger.recordOutcome(
      predictionId,
      outcome as PredictionOutcome,
      userNotes
    );

    if (!updated) {
      return res.status(404).json({ error: 'Prediction record not found.' });
    }

    res.json({
      success: true,
      message: 'Outcome successfully recorded in prediction ledger.',
      prediction: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router as predictionRoutes };
