/**
 * Life Event Timeline Service
 * Manages user-recorded life milestones (career, marriage, relocation, etc.)
 * and optionally correlates them with the native's historical Vimshottari Dasha periods.
 * 
 * Strict Privacy:
 * - Only the owning user can view, edit, or delete their recorded events.
 * - Events marked PRIVATE are never injected into AI personalization prompts.
 */

import { db, LifeEventRecord } from '../database/db.js';
export type { LifeEventRecord };
import { AstrologyFactSet } from '../astrology/AstrologyFactSet.js';

export type LifeEventType =
  | 'education'
  | 'career'
  | 'promotion'
  | 'business'
  | 'relationship'
  | 'marriage'
  | 'relocation'
  | 'financial_milestone'
  | 'achievement'
  | 'setback'
  | 'spiritual_milestone'
  | 'custom';

export interface AddLifeEventInput {
  eventDate: string; // YYYY-MM-DD
  eventType: LifeEventType;
  title: string;
  description?: string;
  userConfirmation?: 'CONFIRMED' | 'TENTATIVE' | 'UNVERIFIED';
  source?: string;
  privacyState?: 'PRIVATE' | 'PERSONALIZATION_ONLY';
}

export class LifeEventTimelineService {
  /**
   * Retrieves all life events for a user, sorted chronologically
   */
  public static getEvents(
    userId: string,
    options?: { personalizationOnly?: boolean }
  ): LifeEventRecord[] {
    const all = Array.from(db.lifeEvents.values()).filter(e => e.userId === userId);
    const filtered = options?.personalizationOnly
      ? all.filter(e => e.privacyState === 'PERSONALIZATION_ONLY')
      : all;

    return filtered.sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }

  /**
   * Adds a life event, optionally correlating it with the native's astrological chart
   */
  public static addEvent(
    userId: string,
    input: AddLifeEventInput,
    factSet?: AstrologyFactSet
  ): LifeEventRecord {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Event title cannot be empty');
    }
    if (!input.eventDate || isNaN(Date.parse(input.eventDate))) {
      throw new Error('Valid event date (YYYY-MM-DD) is required');
    }

    const correlations = factSet
      ? this.correlateWithChart(input.eventDate, factSet)
      : undefined;

    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record: LifeEventRecord = {
      id,
      userId,
      eventDate: input.eventDate,
      eventType: input.eventType,
      title: input.title.trim(),
      description: input.description?.trim(),
      userConfirmation: input.userConfirmation || 'CONFIRMED',
      source: input.source || 'USER_INPUT',
      privacyState: input.privacyState || 'PERSONALIZATION_ONLY',
      astrologicalCorrelations: correlations,
      createdAt: new Date().toISOString(),
    };

    db.lifeEvents.set(id, record);
    return record;
  }

  /**
   * Updates an existing life event
   */
  public static updateEvent(
    userId: string,
    eventId: string,
    updates: Partial<AddLifeEventInput>
  ): LifeEventRecord {
    const event = db.lifeEvents.get(eventId);
    if (!event || event.userId !== userId) {
      throw new Error('Life event not found or access denied');
    }

    if (updates.title !== undefined) {
      if (updates.title.trim().length === 0) throw new Error('Title cannot be empty');
      event.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      event.description = updates.description.trim();
    }
    if (updates.eventType !== undefined) {
      event.eventType = updates.eventType;
    }
    if (updates.eventDate !== undefined) {
      if (isNaN(Date.parse(updates.eventDate))) throw new Error('Invalid event date');
      event.eventDate = updates.eventDate;
    }
    if (updates.userConfirmation !== undefined) {
      event.userConfirmation = updates.userConfirmation;
    }
    if (updates.privacyState !== undefined) {
      event.privacyState = updates.privacyState;
    }

    db.lifeEvents.set(eventId, event);
    return event;
  }

  /**
   * Deletes a life event
   */
  public static deleteEvent(userId: string, eventId: string): boolean {
    const event = db.lifeEvents.get(eventId);
    if (!event || event.userId !== userId) {
      return false;
    }
    db.lifeEvents.delete(eventId);
    return true;
  }

  /**
   * Identifies which Mahadasha was active during a historical date
   */
  public static correlateWithChart(
    eventDateStr: string,
    factSet: AstrologyFactSet
  ): { activeMahadasha?: string; eventDate: string; birthDate: string } {
    const eventTime = new Date(eventDateStr).getTime();
    const birthTime = new Date(factSet.profile.birthDate).getTime();

    if (eventTime < birthTime) {
      return { activeMahadasha: 'Pre-Birth', eventDate: eventDateStr, birthDate: factSet.profile.birthDate };
    }

    let activeLord: string | undefined;
    for (const dasha of factSet.dashas.allMahadashas) {
      const start = new Date(dasha.startDate).getTime();
      const end = new Date(dasha.endDate).getTime();
      if (eventTime >= start && eventTime <= end) {
        activeLord = dasha.planet;
        break;
      }
    }

    return {
      activeMahadasha: activeLord || 'Unknown',
      eventDate: eventDateStr,
      birthDate: factSet.profile.birthDate,
    };
  }
}
