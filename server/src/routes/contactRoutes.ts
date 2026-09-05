/**
 * Contact Us Routes
 * Handles user inquiries, astrologer partnership requests, and support tickets.
 */

import { Router, Request, Response } from 'express';
import { db, ContactMessageRecord } from '../database/db.js';

const router = Router();

// POST /api/contact
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const contactId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ContactMessageRecord = {
      id: contactId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      category: category || 'Support',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.push(newMsg);

    return res.status(201).json({
      message: 'Your cosmic message has been received by the DeepAstro team.',
      ticketId: contactId,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit contact message.', details: err.message });
  }
});

export default router;
