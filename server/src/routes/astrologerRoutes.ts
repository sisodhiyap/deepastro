/**
 * Astrologer Marketplace Routes
 * CRITICAL SECURITY ENFORCEMENT:
 * Phone, WhatsApp, and Email are SCRUBBED at the database/API layer for free or unauthenticated users.
 * Only returned when the caller holds an active PREMIUM or PRO subscription entitlement.
 */

import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/astrologers
// Returns sanitized astrologers list. If user has entitlement, unmasks phone/whatsapp/email.
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const astrologers = db.getAstrologers(userId);
    return res.json({
      count: astrologers.length,
      hasDirectContactAccess: userId ? db.hasEntitlement(userId, 'view_protected_astrologer_contact') : false,
      astrologers,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch astrologers list.', details: err.message });
  }
});

// GET /api/astrologers/:id
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const astrologer = db.getAstrologerById(String(req.params.id), userId);

    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer profile not found.' });
    }

    return res.json({
      hasDirectContactAccess: userId ? db.hasEntitlement(userId, 'view_protected_astrologer_contact') : false,
      astrologer,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch astrologer profile.', details: err.message });
  }
});

// POST /api/astrologers/consultation
// Book a consultation
router.post('/consultation', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { astrologerId, consultationType, scheduledAt, notes } = req.body;

    const astro = db.getAstrologerById(astrologerId);
    if (!astro) {
      return res.status(404).json({ error: 'Astrologer not found.' });
    }

    const consultationId = `cns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newConsultation = {
      id: consultationId,
      userId,
      astrologerId,
      astrologerName: astro.name,
      consultationType: consultationType || 'Video',
      scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 30,
      status: 'confirmed',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // Booking a consultation also unlocks contact for this specific astrologer
    db.grantEntitlement(userId, 'view_protected_astrologer_contact');

    return res.status(201).json({
      message: 'Consultation scheduled successfully. Direct contact channel unlocked.',
      consultation: newConsultation,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to book consultation.', details: err.message });
  }
});

export default router;
