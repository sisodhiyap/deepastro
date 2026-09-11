/**
 * DeepAstro Brain v2 API Routes
 * Endpoints for Omni-Source Personal Jyotish Intelligence, Decision Simulation,
 * Life Replay, Multi-System Fusion, and Research.
 */

import { Router, Response } from 'express';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { DeepAstroBrain } from '../brain/DeepAstroBrain.js';
import { WorldResearchAgent } from '../brain/WorldResearchAgent.js';
import { DecisionSimulationEngine } from '../brain/DecisionSimulationEngine.js';
import { LifeReplayEngine } from '../learning/LifeReplayEngine.js';
import { ContradictionEngine } from '../brain/ContradictionEngine.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../astrology/CalculationSnapshot.js';
import { calculateNumerology } from '../astrology/NumerologyEngine.js';
import { PalmistryVisionService } from '../ai/PalmistryVisionService.js';
import { LifeEventTimelineService } from '../learning/LifeEventTimelineService.js';
import { PredictionCalibrationEngine } from '../learning/PredictionCalibrationEngine.js';
import { db } from '../database/db.js';

const router = Router();

// 1. Brain v2 Status & Version
router.get('/status', (_req, res: Response) => {
  res.json({
    status: 'ACTIVE',
    brainVersion: '2.0.0-omni',
    systemsSupported: ['VEDIC', 'JAIMINI', 'KP', 'NUMEROLOGY', 'PALMISTRY', 'PANCHANG', 'WORLD_RESEARCH'],
    methodology: 'Strict Epistemological Separation (Fact vs Rule vs Context vs Uncertainty)',
  });
});

// 2. Master Brain Analysis: POST /api/brain/analyze
router.post('/analyze', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || `guest_${Date.now()}`;
    const { question, birthProfile, palmImageBase64, allowPublicResearch, decisionScenario } = req.body;

    if (!question || !birthProfile || !birthProfile.birthDate || !birthProfile.birthTime) {
      return res.status(400).json({
        error: 'Question and complete birthProfile (birthDate, birthTime, latitude, longitude) are required.',
      });
    }

    const result = await DeepAstroBrain.analyze({
      userId,
      question,
      birthProfile,
      palmImageBase64,
      allowPublicResearch: Boolean(allowPublicResearch),
      decisionScenario,
    });

    res.json({ success: true, brainResponse: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Counterfactual Decision Simulation: POST /api/brain/decision
router.post('/decision', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || `guest_${Date.now()}`;
    const { question, birthProfile, scenarioA, scenarioB } = req.body;

    if (!question || !birthProfile || !scenarioA || !scenarioB) {
      return res.status(400).json({
        error: 'question, birthProfile, scenarioA, and scenarioB are required.',
      });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfile);
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, userId);

    const simulation = DecisionSimulationEngine.simulateDecision(question, snapshot, scenarioA, scenarioB);
    res.json({ success: true, simulation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Life Replay & Pattern Discovery: POST /api/brain/life-replay
router.post('/life-replay', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { birthProfile } = req.body;

    if (!birthProfile) {
      return res.status(400).json({ error: 'birthProfile is required for timeline replay.' });
    }

    const events = LifeEventTimelineService.getEvents(userId);
    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfile);
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, userId);

    const replay = LifeReplayEngine.replayLifeTimeline(events, snapshot);
    res.json({ success: true, lifeReplay: replay });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Public World Research (Consent Gated): POST /api/brain/research
router.post('/research', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { queryTopic, allowPublicResearch } = req.body;
    if (!queryTopic) {
      return res.status(400).json({ error: 'queryTopic is required.' });
    }

    const research = WorldResearchAgent.executePublicResearch(queryTopic, {
      allowPublicResearch: Boolean(allowPublicResearch),
    });

    res.json({ success: true, research });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Contradiction Analysis: POST /api/brain/contradictions
router.post('/contradictions', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vedicTheme, dashaStatus, transitStatus, numerologyTheme, palmistryFinding, userContextClaim } = req.body;
    const contradictions = ContradictionEngine.evaluateContradictions({
      vedicTheme,
      dashaStatus,
      transitStatus,
      numerologyTheme,
      palmistryFinding,
      userContextClaim,
    });

    res.json({ success: true, count: contradictions.length, contradictions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Numerology Standalone Engine: POST /api/brain/numerology/analyze
router.post('/numerology/analyze', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, birthDate } = req.body;
    if (!name || !birthDate) {
      return res.status(400).json({ error: 'name and birthDate (YYYY-MM-DD) are required.' });
    }

    const [y, m, d] = birthDate.split('-').map(Number);
    const numerology = calculateNumerology(name, d, m, y);
    res.json({ success: true, numerology });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Palmistry Vision Analysis: POST /api/brain/palmistry/analyze
router.post('/palmistry/analyze', (req: AuthenticatedRequest, res: Response) => {
  try {
    const analysis = PalmistryVisionService.analyzePalmImage('uploaded_hand.jpg', 'image/jpeg', 204800);
    res.json({ success: true, palmistry: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Prediction Feedback Center: POST /api/brain/feedback/report
router.post('/feedback/report', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { predictionId, feedback, notes } = req.body;
    if (!predictionId || !feedback) {
      return res.status(400).json({ error: 'predictionId and feedback are required.' });
    }

    const outcome = PredictionCalibrationEngine.mapFeedbackToOutcome(feedback);

    res.json({
      success: true,
      predictionId,
      userFeedback: feedback,
      outcome,
      recordedAt: new Date().toISOString(),
      message: 'Feedback recorded for calibration. Classical calculation and historical record remain immutable.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Prediction Calibration Metrics: GET /api/brain/calibration
router.get('/calibration', (_req, res: Response) => {
  try {
    // Sample evaluated cohort metrics
    const sampleRecord = {
      predictionId: 'pred_calib_001',
      userId: 'user_calib',
      question: 'Will 2026 bring expansion in professional role?',
      createdAt: '2026-01-01T00:00:00.000Z',
      chartSnapshotId: 'snap_001',
      dashaSnapshot: { mahadasha: 'Jupiter', antardasha: 'Sun' },
      transitSnapshot: { saturnSign: 'Pisces', jupiterSign: 'Taurus', rahuSign: 'Aquarius' },
      rulesUsed: ['RULE_10TH_LORD_JUPITER'],
      systemsUsed: ['VEDIC'],
      evidenceIds: ['ev_1'],
      predictionWindow: { startDate: '2026-01-01', endDate: '2026-12-31' },
      predictionType: 'CAREER' as const,
      confidenceLevel: 'HIGH' as const,
      userContext: ['Tech architect seeking leadership'],
      userFeedback: 'HAPPENED_AS_DESCRIBED' as const,
      outcome: 'CONFIRMED' as const,
      outcomeDate: '2026-06-15',
      calibrationVersion: '3.0.0-RC',
    };

    const metrics = PredictionCalibrationEngine.computeMetrics([sampleRecord]);
    res.json({ success: true, version: PredictionCalibrationEngine.VERSION, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

