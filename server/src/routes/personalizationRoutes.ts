/**
 * Personalization & Memory Routes ("My Cosmic Memory")
 * Implements strict tenant-isolated endpoints for memory management, life events,
 * and user preferences.
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { PersonalizationProfileService } from '../learning/PersonalizationProfile.js';
import { UserMemoryService } from '../learning/UserMemoryService.js';
import { LifeEventTimelineService } from '../learning/LifeEventTimelineService.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { db } from '../database/db.js';

const router = Router();

// 1. Get Personalization Profile
router.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = PersonalizationProfileService.getProfile(userId);
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Update Personalization Profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updated = PersonalizationProfileService.updateProfile(userId, req.body);
    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Get User Memories
router.get('/memory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const category = req.query.category as string;
    const memories = category
      ? UserMemoryService.getMemoriesByCategory(userId, category as any)
      : UserMemoryService.getMemories(userId, { includeWhenDisabled: true });
    res.json({ success: true, count: memories.length, memories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Add User Memory
router.post('/memory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { category, content, source, confidence, userConfirmed, memoryType, provenance } = req.body;
    const memory = UserMemoryService.addMemory(userId, {
      category,
      content,
      source: source || 'USER_EXPLICIT',
      confidence,
      userConfirmed,
      memoryType,
      provenance,
    });
    res.status(201).json({ success: true, memory });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Edit User Memory
router.put('/memory/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const memoryId = String(req.params.id);
    const updated = UserMemoryService.editMemory(userId, memoryId, req.body);
    res.json({ success: true, memory: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Forget Specific Memory
router.delete('/memory/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const memoryId = String(req.params.id);
    const deleted = UserMemoryService.forgetMemory(userId, memoryId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Memory not found or unauthorized' });
    }
    res.json({ success: true, message: 'Memory forgotten successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Forget All Memories ("Clean Slate")
router.delete('/memory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const count = UserMemoryService.forgetAllMemories(userId);
    res.json({ success: true, message: `Successfully forgotten ${count} memories`, deletedCount: count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Get Life Events Timeline
router.get('/events', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const events = LifeEventTimelineService.getEvents(userId);
    res.json({ success: true, count: events.length, events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Add Life Event
router.post('/events', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { eventDate, eventType, title, description, userConfirmation, privacyState } = req.body;

    // Retrieve user's birth profile if available to auto-correlate with Dasha
    let factSet;
    const birthProfile = db.getBirthProfile(userId);
    if (birthProfile) {
      try {
        factSet = VedicAstroEngine.createAstrologyFactSet({
          name: birthProfile.fullName,
          birthDate: birthProfile.birthDate,
          birthTime: birthProfile.birthTime,
          birthPlace: birthProfile.birthPlace,
          latitude: birthProfile.latitude,
          longitude: birthProfile.longitude,
          timezone: birthProfile.timezone,
        });
      } catch {
        // Continue without factSet if calculation fails
      }
    }

    const event = LifeEventTimelineService.addEvent(
      userId,
      {
        eventDate,
        eventType,
        title,
        description,
        userConfirmation,
        privacyState,
      },
      factSet
    );

    res.status(201).json({ success: true, event });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 10. Delete Life Event
router.delete('/events/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const eventId = String(req.params.id);
    const deleted = LifeEventTimelineService.deleteEvent(userId, eventId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }
    res.json({ success: true, message: 'Life event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Export Complete Personalization & Memory Data
router.get('/export', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const exportData = db.exportUserData(userId);
    res.json({ success: true, export: exportData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
