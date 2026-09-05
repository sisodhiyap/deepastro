/**
 * System Verification & Audit Center API Routes
 * Endpoints powering the live dashboard at /admin/system-verification
 */

import { Router, Request, Response } from 'express';
import { SystemVerificationEngine } from '../systemVerification/verificationEngine.js';

const router = Router();

// GET /api/system-verification/status
router.get('/status', (_req: Request, res: Response) => {
  const status = SystemVerificationEngine.getStatus();
  return res.json(status);
});

// POST /api/system-verification/run
router.post('/run', async (req: Request, res: Response) => {
  const { category } = req.body;
  try {
    const reportPromise = SystemVerificationEngine.executeRun(category);
    // Return 202 Accepted immediately or await if fast
    res.json({
      message: 'System verification execution initiated.',
      categoryFilter: category || 'ALL',
      status: 'RUNNING',
    });
    // Let it continue in background
    await reportPromise;
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/system-verification/history
router.get('/history', (_req: Request, res: Response) => {
  const status = SystemVerificationEngine.getStatus();
  return res.json({ history: status.history });
});

// GET /api/system-verification/report
router.get('/report', (_req: Request, res: Response) => {
  const status = SystemVerificationEngine.getStatus();
  if (!status.latestReport) {
    return res.status(404).json({ error: 'No verification report generated yet. Run tests first.' });
  }
  return res.json(status.latestReport);
});

export default router;
