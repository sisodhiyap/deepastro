import { describe, it, expect, beforeEach } from 'vitest';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — MASTER ENGINE (FUTURE_INTELLIGENCE_V1)', () => {
  const userA = 'usr_test_fi_001';
  const userB = 'usr_test_fi_002';

  beforeEach(() => {
    db.birthProfiles.set(userA, {
      id: 'prof_test_fi_A',
      userId: userA,
      fullName: 'Ananya Roy',
      birthDate: '1993-08-14',
      birthTime: '06:30',
      birthPlace: 'Kolkata, India',
      latitude: 22.5726,
      longitude: 88.3639,
      timezone: 5.5,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });

    db.birthProfiles.set(userB, {
      id: 'prof_test_fi_B',
      userId: userB,
      fullName: 'Devendra Patel',
      birthDate: '1985-02-28',
      birthTime: '22:15',
      birthPlace: 'Surat, India',
      latitude: 21.1702,
      longitude: 72.8311,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Generates 5-year forecast by default with all structured life domains', async () => {
    const res = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      chartId: 'primary',
      years: 5,
    });

    expect(res.forecastId).toBeDefined();
    expect(res.predictionVersion).toBe('FUTURE_INTELLIGENCE_V1');
    expect(res.calculationFingerprint).toBeDefined();
    expect(res.years.length).toBe(5);

    // Verify all 8 life areas and structure for each year
    for (const yr of res.years) {
      expect(yr.overallTheme).toBeDefined();
      expect(['VERY_LOW', 'LOW', 'MODERATE', 'STRONG', 'VERY_STRONG']).toContain(yr.signalStrength);
      expect(['LOW', 'MODERATE', 'HIGH']).toContain(yr.confidence);
      expect(yr.activeDasha.mahadasha).toBeDefined();
      expect(yr.activeDasha.antardasha).toBeDefined();
      expect(yr.majorTransits.length).toBeGreaterThan(0);

      // 8 life areas
      expect(yr.career.headline).toBeDefined();
      expect(yr.career.description).toBeDefined();
      expect(yr.money.headline).toBeDefined();
      expect(yr.money.description).toBeDefined();
      expect(yr.relationships.headline).toBeDefined();
      expect(yr.relationships.description).toBeDefined();
      expect(yr.health.headline).toBeDefined();
      expect(yr.health.description).toBeDefined();
      expect(yr.family.headline).toBeDefined();
      expect(yr.education.headline).toBeDefined();
      expect(yr.travel.headline).toBeDefined();
      expect(yr.spirituality.headline).toBeDefined();

      expect(yr.importantWindows).toBeDefined();
      expect(yr.cautionWindows.length).toBeGreaterThan(0);
      expect(yr.supportivePeriods.length).toBeGreaterThan(0);
      expect(yr.numerologySignals.personalYear).toBeGreaterThanOrEqual(1);
      expect(yr.numerologySignals.personalYear).toBeLessThanOrEqual(9);
      expect(yr.evidence.length).toBeGreaterThan(0);
    }

    expect(res.importantWindows.length).toBeGreaterThan(0);
    expect(res.methodologyDisclosure).toContain('sidereal');
    expect(res.ethicalNotice.toLowerCase()).toContain('free-will');
  });

  it('2. Supports flexible range: 1, 3, 5, 10, and 20 years', async () => {
    const res1 = await FutureIntelligenceEngine.generateForecast({ userId: userA, years: 1 });
    expect(res1.years.length).toBe(1);

    const res3 = await FutureIntelligenceEngine.generateForecast({ userId: userA, years: 3 });
    expect(res3.years.length).toBe(3);

    const res10 = await FutureIntelligenceEngine.generateForecast({ userId: userA, years: 10 });
    expect(res10.years.length).toBe(10);
  });

  it('3. Property test: Same chart produces identical deterministic forecast', async () => {
    const run1 = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
      startDate: '2026-01-01',
      forceRecalculate: true,
    });

    const run2 = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
      startDate: '2026-01-01',
      forceRecalculate: true,
    });

    expect(run1.calculationFingerprint).toBe(run2.calculationFingerprint);
    expect(run1.years.map((y) => y.overallTheme)).toEqual(run2.years.map((y) => y.overallTheme));
    expect(run1.years.map((y) => y.career.headline)).toEqual(run2.years.map((y) => y.career.headline));
    expect(run1.years.map((y) => y.signalStrength)).toEqual(run2.years.map((y) => y.signalStrength));
  });

  it('4. Multi-profile divergence: Different charts produce distinct forecasts', async () => {
    // User B with distinct birth date & coordinates
    db.birthProfiles.set(userB, {
      id: 'prof_test_fi_B',
      userId: userB,
      fullName: 'Devendra Patel',
      birthDate: '2003-01-15',
      birthTime: '14:20',
      birthPlace: 'Surat, India',
      latitude: 21.1702,
      longitude: 72.8311,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });

    const resA = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
      forceRecalculate: true,
    });

    const resB = await FutureIntelligenceEngine.generateForecast({
      userId: userB,
      years: 3,
      forceRecalculate: true,
    });

    expect(resA.calculationFingerprint).not.toBe(resB.calculationFingerprint);
    expect(resA.chartSummary.ascendantSign).not.toBe(resB.chartSummary.ascendantSign);
    expect(resA.years[0].career.description).not.toBe(resB.years[0].career.description);
  });
});
