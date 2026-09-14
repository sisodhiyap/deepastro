import { Router, Request, Response } from 'express';
import { UniversalChatService } from '../chatbot/UniversalChatService.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { pool } from '../database/postgres.js';

export function registerUniversalChatRoutes(router: Router) {
  const handler = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const message = req.body.message || req.body.query || req.body.question;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message query cannot be empty.' });
      }

      // Security / IDOR Gate: If body specifies a userId that differs from authenticated session, reject
      if (req.user && req.body.userId && req.body.userId !== req.user.userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          details: 'Client cannot request insights for an arbitrary or foreign user_id.',
        });
      }

      const effectiveUserId = req.user?.userId || req.body.userId || 'user_default';

      let profile = req.body.birthProfile;
      if (!profile && req.user) {
        profile =
          (await birthProfileRepository.getProfileByUserId(req.user.userId)) ||
          db.getBirthProfile(req.user.userId);

        if (!profile) {
          try {
            const bpRes = await pool.query('SELECT * FROM birth_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.userId]);
            if (bpRes.rows.length > 0) {
              const row = bpRes.rows[0];
              profile = {
                fullName: row.full_name,
                birthDate: row.birth_date ? new Date(row.birth_date).toISOString().split('T')[0] : '',
                birthTime: row.birth_time ? String(row.birth_time).substring(0, 5) : '',
                birthPlace: row.birth_place,
                latitude: Number(row.latitude),
                longitude: Number(row.longitude),
                timezone: Number(row.timezone),
                gender: row.gender,
              };
            }
          } catch (err) {
            console.warn('[UniversalChatRoutes] Error querying birth_profiles:', err);
          }
        }
      }

      const response = await UniversalChatService.answerQuestion(message, profile, effectiveUserId);
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to process universal chat query' });
    }
  };

  // Support both /universal-chat and /query endpoints
  router.post('/universal-chat', optionalAuth, handler);
  router.post('/query', optionalAuth, handler);
}
