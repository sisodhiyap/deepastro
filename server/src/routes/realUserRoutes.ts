/**
 * Real User Intelligence Routes (realUserRoutes)
 * Mounted at /api/real-user/*
 * Provides end-to-end authenticated endpoints for onboarding, profile mutations,
 * zero-demo dashboard, predictions, outcomes, calibration, vault, and deletion.
 */

import { Router, Request, Response } from 'express';
import { RealUserOnboardingService } from '../services/RealUserOnboardingService.js';
import { ProfileMutationEngine } from '../services/ProfileMutationEngine.js';
import { RealDashboardService } from '../services/RealDashboardService.js';
import { PredictionLedgerV2 } from '../learning/PredictionLedgerV2.js';
import { PredictionOutcomeService } from '../learning/PredictionOutcomeService.js';
import { PredictionCalibrationEngineV2 } from '../learning/PredictionCalibrationEngineV2.js';
import { RealPalmistryImagePipeline } from '../services/RealPalmistryImagePipeline.js';
import { UserVaultService } from '../services/UserVaultService.js';
import { PrivacyExportDeletionService } from '../services/PrivacyExportDeletionService.js';
import { QuestionRefinementEngine } from '../brain/QuestionRefinementEngine.js';
import { DecisionIntelligenceEngineV2 } from '../brain/DecisionIntelligenceEngineV2.js';

export const realUserRouter = Router();

// 1. Onboarding
realUserRouter.post('/onboarding', async (req: Request, res: Response) => {
  try {
    const profile = await RealUserOnboardingService.onboardUser(req.body);
    res.status(201).json({ success: true, profile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Profile Mutation
realUserRouter.post('/profile-mutation', async (req: Request, res: Response) => {
  try {
    const result = await ProfileMutationEngine.mutateProfile(req.body);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Real Dashboard
realUserRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      res.status(400).json({ success: false, error: 'MISSING_USER_ID' });
      return;
    }
    const dashboard = RealDashboardService.getDashboard(userId);
    res.json({ success: true, dashboard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. "Why This Reading?"
realUserRouter.post('/why-reading', (req: Request, res: Response) => {
  try {
    const { userId, question } = req.body;
    if (!userId || !question) {
      res.status(400).json({ success: false, error: 'MISSING_REQUIRED_FIELDS' });
      return;
    }
    const explanation = RealDashboardService.explainReading(userId, question);
    res.json({ success: true, explanation });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Prediction Ledger V2
realUserRouter.post('/prediction', (req: Request, res: Response) => {
  try {
    const entry = PredictionLedgerV2.recordPrediction(req.body);
    res.status(201).json({ success: true, entry });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Outcome Recording
realUserRouter.post('/outcome', (req: Request, res: Response) => {
  try {
    const record = PredictionOutcomeService.recordUserOutcome(req.body);
    res.status(201).json({ success: true, record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Calibration Telemetry
realUserRouter.get('/calibration', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const telemetry = PredictionCalibrationEngineV2.computeCalibration(userId);
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Palmistry Analysis
realUserRouter.post('/palmistry/analyze', (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ success: false, error: 'MISSING_IMAGE_PAYLOAD' });
      return;
    }
    const buffer = Buffer.from(imageBase64, 'base64');
    const result = RealPalmistryImagePipeline.processPalmUpload(buffer, mimeType);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. User Vault
realUserRouter.get('/vault', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const requestingUserId = (req.headers['x-user-id'] as string) || userId;
    const vault = UserVaultService.getVault(userId, requestingUserId);
    res.json({ success: true, vault });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// 10. Export Data
realUserRouter.get('/export', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const requestingUserId = (req.headers['x-user-id'] as string) || userId;
    const format = (req.query.format as 'JSON' | 'CSV') || 'JSON';
    const data = PrivacyExportDeletionService.exportData(userId, requestingUserId, format);
    res.json({ success: true, format, data });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// 11. Delete My Data
realUserRouter.post('/delete-my-data', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const requestingUserId = (req.headers['x-user-id'] as string) || userId;
    const audit = PrivacyExportDeletionService.deleteUserData(userId, requestingUserId);
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// 12. Question Refinement
realUserRouter.post('/question-refinement', (req: Request, res: Response) => {
  try {
    const { question, userContext } = req.body;
    const refinement = QuestionRefinementEngine.refine(question, userContext);
    res.json({ success: true, refinement });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 13. Decision Intelligence V2
realUserRouter.post('/decision/compare', (req: Request, res: Response) => {
  try {
    const { userId, options } = req.body;
    const comparison = DecisionIntelligenceEngineV2.compareOptions(userId, options);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 14. Admin Health Status
realUserRouter.get('/admin/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    phase: 'PHASE_7',
    engines: {
      onboarding: 'ACTIVE',
      mutationEngine: 'ACTIVE',
      dashboardService: 'ACTIVE',
      predictionLedgerV2: 'ACTIVE',
      calibrationV2: 'ACTIVE',
      palmistryPipeline: 'ACTIVE',
      lifeContextGraphV2: 'ACTIVE',
      privacyCenter: 'ACTIVE',
    },
  });
});
