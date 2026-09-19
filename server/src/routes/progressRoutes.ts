/**
 * DeepAstro User Progress Tracking API
 * Tracks user journey, completed milestones, and persistent workspace state
 * so users can return after days/weeks and continue right where they left off.
 */

import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { pool } from '../database/postgres.js';
import { db } from '../database/db.js';

export interface UserProgressData {
  userId: string;
  profileCompleted: boolean;
  kundliGenerated: boolean;
  kpViewed: boolean;
  vargaViewed: boolean;
  pastLifeViewed: boolean;
  futureViewed: boolean;
  cosmicHubUsed: boolean;
  tarotSessionsCount: number;
  completedOnboarding: boolean;
  lastActiveTab: string;
  updatedAt: string;
}

const memoryProgress: Map<string, UserProgressData> = new Map();

const defaultProgress = (userId: string): UserProgressData => ({
  userId,
  profileCompleted: false,
  kundliGenerated: false,
  kpViewed: false,
  vargaViewed: false,
  pastLifeViewed: false,
  futureViewed: false,
  cosmicHubUsed: false,
  tarotSessionsCount: 0,
  completedOnboarding: false,
  lastActiveTab: 'home',
  updatedAt: new Date().toISOString(),
});

const router = Router();

router.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// GET /api/progress/me - Retrieve current authenticated user progress
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 1. Try PostgreSQL if live
    if (pool) {
      try {
        const pgRes = await pool.query(
          `SELECT progress_payload FROM user_progress WHERE user_id = $1 LIMIT 1;`,
          [userId]
        );
        if (pgRes.rows.length > 0) {
          const payload = pgRes.rows[0].progress_payload;
          const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
          memoryProgress.set(userId, parsed);
          return res.json({ success: true, progress: parsed });
        }
      } catch {
        // Continue to memory
      }
    }

    // 2. Fall back to memory
    const existing = memoryProgress.get(userId) || defaultProgress(userId);
    
    // Auto-detect profile completion from birthProfile
    const bp = db.getBirthProfile(userId);
    if (bp && bp.birthDate && bp.latitude) {
      existing.profileCompleted = true;
    }

    return res.json({ success: true, progress: existing });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_FETCH_FAILED', details: err.message });
  }
});

// POST /api/progress/track - Update milestone or navigation progress
router.post('/track', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body?.userId;
    if (!userId) {
      return res.status(400).json({ error: 'USER_ID_REQUIRED' });
    }

    const updates = req.body || {};
    const existing = memoryProgress.get(userId) || defaultProgress(userId);

    const merged: UserProgressData = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };

    memoryProgress.set(userId, merged);

    // Save to PostgreSQL if live
    if (pool) {
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS user_progress (
            user_id VARCHAR(64) PRIMARY KEY,
            progress_payload JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );`
        );
        await pool.query(
          `INSERT INTO user_progress (user_id, progress_payload, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id) DO UPDATE SET progress_payload = EXCLUDED.progress_payload, updated_at = NOW();`,
          [userId, JSON.stringify(merged)]
        );
      } catch {
        // Fall back gracefully
      }
    }

    return res.json({ success: true, progress: merged });
  } catch (err: any) {
    return res.status(500).json({ error: 'PROGRESS_TRACK_FAILED', details: err.message });
  }
});

export default router;
