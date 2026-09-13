import { Router, Request, Response } from 'express';
import { UniversalChatService } from '../chatbot/UniversalChatService.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';

export function registerUniversalChatRoutes(router: Router) {
  // POST /api/ai/universal-chat
  router.post('/universal-chat', async (req: Request, res: Response) => {
    try {
      const { message, birthProfile } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message query cannot be empty.' });
      }

      let profile = birthProfile;
      if (!profile && (req as any).user) {
        profile =
          (await birthProfileRepository.getProfileByUserId((req as any).user.userId)) ||
          db.getBirthProfile((req as any).user.userId);
      }

      const response = await UniversalChatService.answerQuestion(message, profile);
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to process universal chat query' });
    }
  });
}
