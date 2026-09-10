/**
 * DeepAstro Life Event Timeline Test Suite
 * Validates:
 * 1. Life event logging across education, career, marriage, relocation.
 * 2. Astrological correlation with native's historical Vimshottari Mahadashas.
 * 3. Privacy state filtering: PRIVATE vs PERSONALIZATION_ONLY.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LifeEventTimelineService } from '../server/src/learning/LifeEventTimelineService.js';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { db } from '../server/src/database/db.js';

describe('DeepAstro Life Event Timeline Suite', () => {
  const userId = 'user_chronos_88';

  // Deepti benchmark chart for astrological correlation
  const deeptiFactSet = VedicAstroEngine.createAstrologyFactSet({
    name: 'Deepti',
    birthDate: '1988-03-02',
    birthTime: '07:15',
    birthPlace: 'Agra, UP, India',
    latitude: 27.1767,
    longitude: 78.0081,
    timezone: 5.5,
  });

  beforeEach(() => {
    db.lifeEvents.clear();
  });

  it('records life events and orders them chronologically', () => {
    LifeEventTimelineService.addEvent(userId, {
      eventDate: '2015-06-15',
      eventType: 'marriage',
      title: 'Wedding in New Delhi',
    });

    LifeEventTimelineService.addEvent(userId, {
      eventDate: '2010-08-01',
      eventType: 'education',
      title: 'Graduated Master of Computer Science',
    });

    LifeEventTimelineService.addEvent(userId, {
      eventDate: '2020-01-10',
      eventType: 'relocation',
      title: 'Relocated to Bangalore',
    });

    const events = LifeEventTimelineService.getEvents(userId);
    expect(events).toHaveLength(3);
    // Chronological ascending check
    expect(events[0].eventType).toBe('education');
    expect(events[1].eventType).toBe('marriage');
    expect(events[2].eventType).toBe('relocation');
  });

  it('correlates historical life events with active Vimshottari Mahadasha', () => {
    // In 1990 (Deepti was ~2 years old), Ketu Mahadasha was active
    const event1 = LifeEventTimelineService.addEvent(
      userId,
      {
        eventDate: '1990-04-10',
        eventType: 'education',
        title: 'Early Childhood Milestone',
      },
      deeptiFactSet
    );

    expect(event1.astrologicalCorrelations?.activeMahadasha).toBe('Ketu');

    // In 1995 (Deepti was ~7 years old), Venus Mahadasha was active
    const event2 = LifeEventTimelineService.addEvent(
      userId,
      {
        eventDate: '1995-05-15',
        eventType: 'achievement',
        title: 'Primary School Honors',
      },
      deeptiFactSet
    );

    expect(event2.astrologicalCorrelations?.activeMahadasha).toBe('Venus');
  });

  it('enforces privacy states: PRIVATE events are excluded from personalization contexts', () => {
    LifeEventTimelineService.addEvent(userId, {
      eventDate: '2021-03-01',
      eventType: 'career',
      title: 'Promoted to Staff Engineering Lead',
      privacyState: 'PERSONALIZATION_ONLY',
    });

    LifeEventTimelineService.addEvent(userId, {
      eventDate: '2022-08-15',
      eventType: 'relationship',
      title: 'PRIVATE: Personal reflective counseling',
      privacyState: 'PRIVATE',
    });

    // Total events for management
    const all = LifeEventTimelineService.getEvents(userId);
    expect(all).toHaveLength(2);

    // Filtered for personalization prompt context
    const personalizationContext = LifeEventTimelineService.getEvents(userId, {
      personalizationOnly: true,
    });
    expect(personalizationContext).toHaveLength(1);
    expect(personalizationContext[0].eventType).toBe('career');
    expect(personalizationContext.some(e => e.privacyState === 'PRIVATE')).toBe(false);
  });
});
