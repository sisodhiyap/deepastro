/**
 * Subscription Routes
 * Manage tiers (FREE, PREMIUM, PRO), instant upgrades, and payment status.
 */

import { Router, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/subscription/plans
router.get('/plans', (_req, res: Response) => {
  const plans = SubscriptionService.getPlans();
  return res.json({ plans });
});

// GET /api/subscription/current
router.get('/current', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const sub = SubscriptionService.getUserSubscription(userId);
  return res.json({ subscription: sub });
});

// POST /api/subscription/upgrade
router.post('/upgrade', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { planId } = req.body;

    if (!['FREE', 'PREMIUM', 'PRO'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid cosmic plan tier.' });
    }

    const result = SubscriptionService.upgradePlan(userId, planId);

    return res.json({
      message: `Successfully ascended to DeepAstro ${planId} tier.`,
      ...result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process subscription upgrade.', details: err.message });
  }
});

export default router;
