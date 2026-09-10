/**
 * Admin Self-Learning Lab Routes
 * Provides administrative oversight on telemetry, error classifications,
 * regression gates, and versioned rule promotions.
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { SelfLearningLabService } from '../learning/SelfLearningLabService.js';
import { SelfImprovementLoop } from '../learning/SelfImprovementLoop.js';
import { db } from '../database/db.js';

const router = Router();

// Middleware: Enforce Admin Role
function requireAdminRole(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Administrative access required' });
  }
  next();
}

// 1. Get Self-Learning Lab Dashboard Telemetry
router.get('/stats', requireAuth, requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = SelfLearningLabService.getDashboardStats();
    res.json({ success: true, labStats: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. List Improvement Proposals
router.get('/proposals', requireAuth, requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const proposals = Array.from(db.improvementProposals.values());
    res.json({ success: true, count: proposals.length, proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create Improvement Proposal
router.post('/proposals', requireAuth, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, targetEngine, proposedChanges } = req.body;
    const proposal = SelfImprovementLoop.createProposal({
      title,
      description,
      targetEngine,
      proposedChanges,
      createdBy: req.user!.userId,
    });
    res.status(201).json({ success: true, proposal });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Run Automated Regression Gate on a Proposal
router.post('/proposals/:id/regression', requireAuth, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const proposalId = String(req.params.id);
    const summary = SelfImprovementLoop.runRegressionGate(proposalId);
    res.json({ success: true, proposalId, regressionTestSummary: summary });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Approve Proposal
router.post('/proposals/:id/approve', requireAuth, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const proposalId = String(req.params.id);
    const result = SelfImprovementLoop.approveProposal(proposalId, req.user!.userId);
    res.json({ success: true, message: 'Proposal approved and engine version updated.', result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Reject Proposal
router.post('/proposals/:id/reject', requireAuth, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const proposalId = String(req.params.id);
    const { reason } = req.body;
    const rejected = SelfImprovementLoop.rejectProposal(proposalId, req.user!.userId, reason || 'Unspecified');
    res.json({ success: true, proposal: rejected });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
