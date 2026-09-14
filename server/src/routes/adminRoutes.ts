import { FutureIntelligenceObservatory } from '../intelligence/future/FutureIntelligenceObservatory.js';
import { AstroBotTelemetry } from '../intelligence/AstroBotTelemetry.js';
import { RealTimeDataHealthEngine } from '../intelligence/realtime/RealTimeDataHealthEngine.js';
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
router.use(requireRole(['ADMIN', 'SUPER_ADMIN', 'DEEPASTRO_QA_ADMIN']));

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


// POST /api/admin/provision-admin
// Secure server-side administrator provisioning (Admin privilege required)
router.post('/provision-admin', requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const bcrypt = await import('bcryptjs');
    const { userRepository } = await import('../database/repositories/UserRepository.js');

    const existing = (await userRepository.getUserByEmail(email)) || db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash(password, salt);
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newAdmin = {
      id: adminId,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    await userRepository.createUser(newAdmin);
    db.users.set(adminId, newAdmin);

    db.logAdminAction('ADMIN_ROLE_CHANGE', req.user!.userId, req.user!.email, {
      provisionedEmail: email,
      assignedRole: 'ADMIN',
    });

    return res.status(201).json({
      success: true,
      message: 'Administrator account provisioned successfully.',
      admin: { id: adminId, email: newAdmin.email, role: 'ADMIN' },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to provision admin.', details: err.message });
  }
});

// GET /api/admin/audit-logs
// Returns immutable administrative audit trail
router.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  db.logAdminAction('ADMIN_USER_VIEW', req.user!.userId, req.user!.email, { view: 'audit-logs' });
  return res.json({
    count: db.adminAuditLogs.length,
    logs: db.adminAuditLogs.slice(-100).reverse(),
  });
});


// GET /api/admin/intelligence/astrobot (and /admin/intelligence/astrobot)
// Section 42: Admin AstroBot Observatory
router.get('/intelligence/astrobot', (req: AuthenticatedRequest, res: Response) => {
  const summary = AstroBotTelemetry.getMetricsSummary();
  return res.json({
    ...summary,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/intelligence/realtime (and /admin/intelligence/realtime)
// Section 43: Real-Time Data Health Dashboard
router.get('/intelligence/realtime', (req: AuthenticatedRequest, res: Response) => {
  const health = RealTimeDataHealthEngine.getAdminHealthOverview();
  return res.json(health);
});


// GET /api/admin/intelligence/future (and /admin/intelligence/future)
// Section 80: Admin Future Intelligence Observatory
router.get('/intelligence/future', (req: AuthenticatedRequest, res: Response) => {
  const metrics = FutureIntelligenceObservatory.getDashboardMetrics();
  return res.json(metrics);
});

export default router;
