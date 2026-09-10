/**
 * Admin Dashboard & Telemetry Routes
 * Comprehensive SaaS metrics, token usage tracking across OpenAI/Gemini/Grok,
 * user management, and dynamic feature flag controls.
 */

import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { dbClient } from '../database/postgres.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

import { EnvLoader } from '../config/envLoader.js';

const router = Router();

// Apply strict Role-Based Access Control: ADMIN or SUPER_ADMIN required for all admin routes
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// GET /api/admin/metrics
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  let usersCount = db.users.size;
  if (dbClient.isLive()) {
    try {
      const uRes = await dbClient.query('SELECT COUNT(*) FROM users;');
      if (uRes.rows.length > 0) {
        usersCount = parseInt(uRes.rows[0].count, 10) || usersCount;
      }
    } catch {
      // fallback to memory map count
    }
  }
  const astrologersCount = db.astrologers.size;
  const subscriptionsCount = db.subscriptions.size;

  let totalTokens = 0;
  let cloudCostCents = 0;
  let localTokens = 0;

  const providerStats: Record<string, { requests: number; tokens: number; latencyAvg: number; costType: string }> = {
    OpenAI: { requests: 0, tokens: 0, latencyAvg: 0, costType: 'Cloud API Billed' },
    DeepSeek: { requests: 0, tokens: 0, latencyAvg: 0, costType: 'Cloud API Billed' },
    OpenRouter: { requests: 0, tokens: 0, latencyAvg: 0, costType: 'Cloud API Billed' },
    Gemini: { requests: 0, tokens: 0, latencyAvg: 0, costType: 'Cloud API Billed' },
    Grok: { requests: 0, tokens: 0, latencyAvg: 0, costType: 'Cloud API Billed' },
    Ollama: { requests: 0, tokens: 0, latencyAvg: 0, costType: '$0 API Cost (Local Compute)' },
  };

  for (const log of db.aiUsageLogs) {
    totalTokens += log.totalTokens;
    if (log.provider === 'Ollama') {
      localTokens += log.totalTokens;
    } else {
      cloudCostCents += log.estimatedCostCents;
    }

    if (providerStats[log.provider]) {
      providerStats[log.provider].requests += 1;
      providerStats[log.provider].tokens += log.totalTokens;
    }
  }

  // Provider health statuses
  const keyStatuses = EnvLoader.getKeyStatuses();

  return res.json({
    overview: {
      totalUsers: usersCount,
      activeSubscriptions: subscriptionsCount,
      monthlyRecurringRevenueCents: subscriptionsCount * 49900,
      totalAstrologers: astrologersCount,
      totalConsultations: db.consultations.size,
      totalAiRequests: db.aiUsageLogs.length,
      totalAiTokensUsed: totalTokens,
      cloudApiCostUSD: parseFloat((cloudCostCents / 100).toFixed(2)),
      localComputeTokens: localTokens,
      localComputeNote: 'Ollama uses on-device GPU/CPU compute ($0 Cloud API Cost)',
    },
    providerHealth: keyStatuses,
    aiUsageByProvider: providerStats,
    featureFlags: db.featureFlags,
    recentAiLogs: db.aiUsageLogs.slice(-10).reverse(),
  });
});

// POST /api/admin/feature-flags
router.post('/feature-flags', (req: AuthenticatedRequest, res: Response) => {
  const { flags } = req.body;
  if (flags && typeof flags === 'object') {
    Object.assign(db.featureFlags, flags);
  }
  return res.json({
    message: 'Feature flags updated successfully.',
    featureFlags: db.featureFlags,
  });
});

// GET /api/admin/users
router.get('/users', (_req, res: Response) => {
  const users = Array.from(db.users.values()).map((u) => {
    const profile = db.getProfile(u.id);
    const sub = db.getSubscription(u.id);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      fullName: profile?.fullName || 'Cosmic Seeker',
      planId: sub.planId,
      createdAt: u.createdAt,
    };
  });
  return res.json({ count: users.length, users });
});

export default router;
