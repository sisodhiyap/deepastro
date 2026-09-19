/**
 * Feedback Routes - DeepAstro 7.4
 * Secure, structured feedback mechanism for user-reported calculation, UI, and performance observations.
 * In accordance with Phase 16: Feedback telemetry NEVER alters deterministic mathematical calculations.
 */

import { Router, Response } from 'express';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { pool } from '../database/postgres.js';
import crypto from 'crypto';

const router = Router();

export interface UserFeedbackPayload {
  feedbackId: string;
  userId: string;
  module: string;
  category: string;
  message: string;
  rating?: number;
  calculationFingerprint?: string;
  engineVersion?: string;
  appVersion?: string;
  createdAt: string;
}

// In-memory telemetry cache for serverless resiliency
const feedbackMemoryStore = new Map<string, UserFeedbackPayload>();

// POST /api/feedback - Submit structured telemetry feedback
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      module = 'general',
      category = 'general',
      message,
      rating,
      calculationFingerprint,
      engineVersion = '7.4.0',
      appVersion = '7.4.0',
    } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_FEEDBACK_MESSAGE',
        error: 'Please provide a feedback message with at least 3 characters.',
      });
    }

    const validCategories = [
      'calculation_issue',
      'incorrect_birth_data',
      'ui_problem',
      'layout_issue',
      'confusing_result',
      'missing_feature',
      'performance_issue',
      'general',
    ];

    const cleanCategory = validCategories.includes(category) ? category : 'general';
    const userId = req.user?.userId || 'guest_user';
    const feedbackId = `fb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const record: UserFeedbackPayload = {
      feedbackId,
      userId,
      module: String(module).slice(0, 50),
      category: cleanCategory,
      message: message.trim().slice(0, 2000),
      rating: typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : undefined,
      calculationFingerprint: calculationFingerprint ? String(calculationFingerprint).slice(0, 100) : undefined,
      engineVersion: String(engineVersion).slice(0, 30),
      appVersion: String(appVersion).slice(0, 30),
      createdAt,
    };

    feedbackMemoryStore.set(feedbackId, record);

    // Persist to PostgreSQL if available
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS platform_feedback (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL,
          module VARCHAR(64) NOT NULL,
          category VARCHAR(64) NOT NULL,
          message TEXT NOT NULL,
          rating INT,
          calculation_fingerprint VARCHAR(128),
          engine_version VARCHAR(32),
          app_version VARCHAR(32),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(
        `INSERT INTO platform_feedback 
         (id, user_id, module, category, message, rating, calculation_fingerprint, engine_version, app_version, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          record.feedbackId,
          record.userId,
          record.module,
          record.category,
          record.message,
          record.rating || null,
          record.calculationFingerprint || null,
          record.engineVersion,
          record.appVersion,
          record.createdAt,
        ]
      );
    } catch (dbErr) {
      console.warn('[Feedback] PostgreSQL write error, retained in telemetry memory:', dbErr);
    }

    return res.status(201).json({
      success: true,
      feedbackId,
      message: 'Thank you for your feedback. It has been recorded for platform quality telemetry.',
      data: {
        feedbackId,
        category: record.category,
        module: record.module,
        createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      code: 'FEEDBACK_SUBMISSION_FAILED',
      error: 'Failed to record feedback.',
      details: err.message,
    });
  }
});

// GET /api/feedback/my - Retrieve authenticated user's submitted feedback
router.get('/my', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    let list: UserFeedbackPayload[] = [];
    try {
      const dbRes = await pool.query(
        'SELECT id as "feedbackId", user_id as "userId", module, category, message, rating, calculation_fingerprint as "calculationFingerprint", engine_version as "engineVersion", app_version as "appVersion", created_at as "createdAt" FROM platform_feedback WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      list = dbRes.rows;
    } catch {
      list = Array.from(feedbackMemoryStore.values()).filter((f) => f.userId === userId);
    }

    return res.json({
      success: true,
      feedbacks: list,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
