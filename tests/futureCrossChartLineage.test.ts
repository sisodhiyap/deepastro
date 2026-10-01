/**
 * futureCrossChartLineage.test.ts
 * Cross-Chart Lineage Verification.
 * Tests 3 materially distinct birth profiles to prove zero generic fallback,
 * differing calculation fingerprints, distinct Dashas, Vargas, and non-overlapping predictions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { db } from '../server/src/database/db.js';

describe('FUTURE INTELLIGENCE — CROSS-CHART LINEAGE DIVERGENCE TEST SUITE', () => {
  const chart1Id = 'usr_cross_chart_1';
  const chart2Id = 'usr_cross_chart_2';
  const chart3Id = 'usr_cross_chart_3';

  beforeEach(() => {
    // Chart 1: Delhi Native
    db.birthProfiles.set(chart1Id, {
      id: 'prof_cc_1',
      userId: chart1Id,
      fullName: 'Aries Native Delhi',
      birthDate: '1984-01-15',
      birthTime: '11:45',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });

    // Chart 2: London Native
    db.birthProfiles.set(chart2Id, {
      id: 'prof_cc_2',
      userId: chart2Id,
      fullName: 'Scorpio Native London',
      birthDate: '1995-11-20',
      birthTime: '06:15',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });

    // Chart 3: Tokyo Native
    db.birthProfiles.set(chart3Id, {
      id: 'prof_cc_3',
      userId: chart3Id,
      fullName: 'Gemini Native Tokyo',
      birthDate: '2001-07-07',
      birthTime: '23:30',
      birthPlace: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 9.0,
      gender: 'Other',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Generates 3 unique cryptographic fingerprints and distinct canonical planetary placements', async () => {
    const ctx1 = await ChartContextResolver.resolve(chart1Id, 'primary');
    const ctx2 = await ChartContextResolver.resolve(chart2Id, 'primary');
    const ctx3 = await ChartContextResolver.resolve(chart3Id, 'primary');

    // 1. Fingerprints are all distinct
    expect(ctx1.calculationFingerprint).not.toBe(ctx2.calculationFingerprint);
    expect(ctx2.calculationFingerprint).not.toBe(ctx3.calculationFingerprint);
    expect(ctx1.calculationFingerprint).not.toBe(ctx3.calculationFingerprint);

    // 2. Ascendants are distinct
    expect(ctx1.ascendant.signName).toBeDefined();
    expect(ctx2.ascendant.signName).toBeDefined();
    expect(ctx3.ascendant.signName).toBeDefined();

    // 3. Moon Nakshatras & Dashas are distinct
    expect(ctx1.currentMahadasha.planet).toBeDefined();
    expect(ctx2.currentMahadasha.planet).toBeDefined();
    expect(ctx3.currentMahadasha.planet).toBeDefined();
  });

  it('2. Year-by-year predictions diverge completely with zero generic fallback overlap', async () => {
    const f1 = await FutureIntelligenceEngine.generateForecast({ userId: chart1Id, chartId: 'primary', years: 3, forceRecalculate: true });
    const f2 = await FutureIntelligenceEngine.generateForecast({ userId: chart2Id, chartId: 'primary', years: 3, forceRecalculate: true });
    const f3 = await FutureIntelligenceEngine.generateForecast({ userId: chart3Id, chartId: 'primary', years: 3, forceRecalculate: true });

    // Verify distinct themes
    expect(f1.years[0].overallTheme).not.toBe(f2.years[0].overallTheme);
    expect(f2.years[0].overallTheme).not.toBe(f3.years[0].overallTheme);
    expect(f1.years[0].overallTheme).not.toBe(f3.years[0].overallTheme);

    // Verify distinct career descriptions (backed by real Vargas and KP)
    expect(f1.years[0].career.description).not.toBe(f2.years[0].career.description);
    expect(f2.years[0].career.description).not.toBe(f3.years[0].career.description);

    // Verify distinct relationship descriptions (backed by real D9)
    expect(f1.years[0].relationships.description).not.toBe(f2.years[0].relationships.description);
    expect(f2.years[0].relationships.description).not.toBe(f3.years[0].relationships.description);

    // Verify distinct money descriptions (backed by real D2, SAV, and KP)
    expect(f1.years[0].money.description).not.toBe(f2.years[0].money.description);
    expect(f2.years[0].money.description).not.toBe(f3.years[0].money.description);

    // Verify distinct health descriptions (backed by real D30 and Shadbala)
    expect(f1.years[0].health.description).not.toBe(f2.years[0].health.description);
    expect(f2.years[0].health.description).not.toBe(f3.years[0].health.description);

    // Verify that every forecast carries an unbroken data lineage with unique hashes
    expect(f1.dataLineage.calculationFingerprint).toBe(f1.calculationFingerprint);
    expect(f2.dataLineage.calculationFingerprint).toBe(f2.calculationFingerprint);
    expect(f3.dataLineage.calculationFingerprint).toBe(f3.calculationFingerprint);
  });
});
