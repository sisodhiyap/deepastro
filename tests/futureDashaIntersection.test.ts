import { describe, it, expect, beforeEach } from 'vitest';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { DashaForecastEngine } from '../server/src/intelligence/future-intelligence/DashaForecastEngine.js';
import { FutureSiderealTransitEngine } from '../server/src/intelligence/future-intelligence/TransitEngine.js';
import { DashaTransitIntersectionEngine } from '../server/src/intelligence/future-intelligence/DashaTransitIntersectionEngine.js';
import { ContradictionEngine } from '../server/src/intelligence/future-intelligence/ContradictionEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — DASHA + TRANSIT INTERSECTION', () => {
  const testUserId = 'usr_test_intersection_001';

  beforeEach(() => {
    db.birthProfiles.set(testUserId, {
      id: 'prof_test_inter_1',
      userId: testUserId,
      fullName: 'Aarav Destiny',
      birthDate: '1995-10-24',
      birthTime: '08:15',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Intersects Mahadasha + Antardasha + Major Transits to generate structured signals', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');
    const dasha = DashaForecastEngine.getDashaForYear(context, 2027);
    const transits = FutureSiderealTransitEngine.calculateTransitsForYear(context, 2027);

    const signals = DashaTransitIntersectionEngine.evaluateIntersection(context, dasha, transits);

    expect(signals.length).toBeGreaterThan(0);
    const validCategories = [
      'CAREER_EXPANSION',
      'FINANCIAL_FOCUS',
      'RELATIONSHIP_ACTIVATION',
      'EDUCATION_PERIOD',
      'HEALTH_ROUTINE_FOCUS',
      'TRAVEL_FOREIGN_CONNECTION',
      'SPIRITUAL_DEVELOPMENT',
      'PROPERTY_HOME_FOCUS',
      'CREATIVE_PERIOD',
      'NETWORK_EXPANSION',
      'RESPONSIBILITY_PERIOD',
      'TRANSFORMATION_PERIOD',
    ];

    for (const sig of signals) {
      expect(validCategories).toContain(sig.category);
      expect(sig.score).toBeGreaterThanOrEqual(0);
      expect(sig.score).toBeLessThanOrEqual(100);
      expect(sig.evidence.length).toBeGreaterThan(0);
      expect(['VERY_LOW', 'LOW', 'MODERATE', 'STRONG', 'VERY_STRONG']).toContain(sig.strength);
    }
  });

  it('2. Detects Dasha progression across future years', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const dasha2026 = DashaForecastEngine.getDashaForYear(context, 2026);
    const dasha2036 = DashaForecastEngine.getDashaForYear(context, 2036);

    expect(dasha2026.targetDate).toBe('2026-07-01');
    expect(dasha2036.targetDate).toBe('2036-07-01');

    // Over 10 years, either Mahadasha or Antardasha will have advanced
    const changed =
      dasha2026.mahadasha !== dasha2036.mahadasha ||
      dasha2026.antardasha !== dasha2036.antardasha;
    expect(changed).toBe(true);
  });

  it('3. ContradictionEngine preserves opposing forces without erasing tension', () => {
    const mixedEvidence = [
      {
        source: 'DASHA' as const,
        rule: 'Jupiter Career Rule',
        value: 'Benefic Jupiter Mahadasha pushes career expansion.',
        weight: 0.35,
        direction: 'SUPPORTIVE' as const,
      },
      {
        source: 'TRANSIT' as const,
        rule: 'Saturn 10th House Pressure',
        value: 'Saturn transit tests endurance and imposes structural friction.',
        weight: 0.30,
        direction: 'CHALLENGING' as const,
      },
    ];

    const result = ContradictionEngine.evaluateEvidence('CAREER_EXPANSION', mixedEvidence);

    expect(result.hasContradiction).toBe(true);
    expect(result.supportiveCount).toBe(1);
    expect(result.challengingCount).toBe(1);
    expect(result.tensionSummary).toContain('Contrasting Signals');
    expect(result.synthesizedOutcome).toContain('Expansion with increased responsibility');
  });
});
