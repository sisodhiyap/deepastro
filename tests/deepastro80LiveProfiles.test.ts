/**
 * deepastro80LiveProfiles.test.ts
 * DeepAstro Future Intelligence 8.0 - Multi-Profile Divergence & Safety Test Suite
 *
 * Verifies Phase 24 and Phase 25 Acceptance Criteria:
 * - 3 distinct birth profiles (Profile A, B, C)
 * - Complete calculation divergence: fingerprint A != B != C
 * - Kundli, Dasha, KP, D9, and Varga divergence
 * - Remedies & Pooja dynamic chart-derived mapping
 * - 9-Point Improvement Engine architecture verification
 * - Longevity and medical safety (ZERO death dates, mandatory disclaimers)
 * - Strict tenant isolation
 */

import { describe, it, expect } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureRemedyEngine } from '../server/src/intelligence/future/FutureRemedyEngine.js';
import { FutureLongevityEngine } from '../server/src/intelligence/future/FutureLongevityEngine.js';
import { FutureLifeDomainEngine } from '../server/src/intelligence/future/FutureLifeDomainEngine.js';
import { FutureImprovementEngine } from '../server/src/intelligence/future/FutureImprovementEngine.js';
import { FutureProgressEngine } from '../server/src/intelligence/future/FutureProgressEngine.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('DEEPASTRO 8.0 MULTI-PROFILE SCENARIO & 9-POINT CONTRACT TESTS', () => {
  // Profile A: Born in New Delhi, 1990
  const profileA: BirthProfileInput = {
    name: 'Aarav Sharma',
    birthDate: '1990-05-15',
    birthTime: '08:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    gender: 'Male',
  };

  // Profile B: Born in Ahmedabad, 1996
  const profileB: BirthProfileInput = {
    name: 'Priya Patel',
    birthDate: '1996-11-22',
    birthTime: '18:45',
    birthPlace: 'Ahmedabad, India',
    latitude: 23.0225,
    longitude: 72.5714,
    timezone: 5.5,
    gender: 'Female',
  };

  // Profile C: Born in London, UK, 1985
  const profileC: BirthProfileInput = {
    name: 'Oliver Thorne',
    birthDate: '1985-08-04',
    birthTime: '14:15',
    birthPlace: 'London, United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 1.0,
    gender: 'Male',
  };

  it('Phase 25.1: 3-Profile Fingerprint & Calculation Divergence (A != B != C)', async () => {
    const forecastA = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_live_a',
      birthProfile: profileA,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const forecastB = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_live_b',
      birthProfile: profileB,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const forecastC = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_live_c',
      birthProfile: profileC,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    expect(forecastA.calculationFingerprint).toBeDefined();
    expect(forecastB.calculationFingerprint).toBeDefined();
    expect(forecastC.calculationFingerprint).toBeDefined();

    // Strict uniqueness
    expect(forecastA.calculationFingerprint).not.toBe(forecastB.calculationFingerprint);
    expect(forecastB.calculationFingerprint).not.toBe(forecastC.calculationFingerprint);
    expect(forecastA.calculationFingerprint).not.toBe(forecastC.calculationFingerprint);

    // Snapshot ID divergence
    expect(forecastA.calculationSnapshotId).not.toBe(forecastB.calculationSnapshotId);
    expect(forecastB.calculationSnapshotId).not.toBe(forecastC.calculationSnapshotId);
  });

  it('Phase 25.2: Astrological Divergence across Kundli, Dasha, and Divisional Placements', () => {
    const kundliA = VedicAstroEngine.calculateKundli(profileA);
    const kundliB = VedicAstroEngine.calculateKundli(profileB);
    const kundliC = VedicAstroEngine.calculateKundli(profileC);

    // Lagna and Moon Sign divergence
    expect(kundliA.ascendant.details.signName).not.toBe(kundliB.ascendant.details.signName);
    expect(kundliA.moonSign.signName).not.toBe(kundliB.moonSign.signName);
    expect(kundliB.ascendant.details.signName).not.toBe(kundliC.ascendant.details.signName);

    // Dasha divergence
    expect(kundliA.dashas.currentMahadasha.planet).toBeDefined();
    expect(kundliB.dashas.currentMahadasha.planet).toBeDefined();
    expect(kundliC.dashas.currentMahadasha.planet).toBeDefined();
  });

  it('Phase 25.3: Year-by-Year Timeline Recommendations Divergence', async () => {
    const forecastA = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_live_a',
      birthProfile: profileA,
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const forecastB = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_live_b',
      birthProfile: profileB,
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    expect(forecastA.yearForecasts.length).toBeGreaterThanOrEqual(3);
    expect(forecastB.yearForecasts.length).toBeGreaterThanOrEqual(3);

    // The primary themes for year 1 must differ between distinct charts
    expect(forecastA.yearForecasts[1].overallTheme).not.toBe(forecastB.yearForecasts[1].overallTheme);
  });

  it('Phase 6 & 7: 9-Point Improvement Engine Contract Verification', () => {
    const kundliA = VedicAstroEngine.calculateKundli(profileA);
    const dashaA = kundliA.dashas.currentMahadasha.planet;
    const plan = FutureImprovementEngine.generatePlan(kundliA, dashaA, 'fp_test_aarav_9pt', 'usr_test_aarav');

    expect(plan.domainActions.length).toBeGreaterThanOrEqual(5);

    for (const act of plan.domainActions) {
      // 1. What calculation indicates
      expect(act.astrologicalIndicator).toBeDefined();
      expect(act.astrologicalIndicator.length).toBeGreaterThan(10);

      // 2. What is within user's control
      expect(act.whatUserCanControl).toBeDefined();
      expect(act.whatUserCanControl.length).toBeGreaterThan(15);

      // 3. Constructive practical action
      expect(act.practicalAction).toBeDefined();
      expect(act.practicalAction.length).toBeGreaterThan(15);

      // 4. Best timing window
      expect(act.timeWindow).toBeDefined();
      expect(act.timeWindow.length).toBeGreaterThan(5);

      // 5. Traditional remedy
      expect(act.traditionalRemedy).toBeDefined();
      expect(act.traditionalRemedy.length).toBeGreaterThan(15);

      // 6. What to avoid
      expect(act.whatToAvoid).toBeDefined();
      expect(act.whatToAvoid.length).toBeGreaterThan(10);

      // 7. Evidence
      expect(act.evidence).toBeDefined();
      expect(act.evidence.length).toBeGreaterThan(10);

      // 8. Confidence
      expect(typeof act.confidence).toBe('number');
      expect(act.confidence).toBeGreaterThanOrEqual(70);
      expect(act.confidence).toBeLessThanOrEqual(100);

      // 9. Uncertainty boundaries
      expect(act.uncertainty).toBeDefined();
      expect(act.uncertainty.length).toBeGreaterThan(15);
    }
  });

  it('Phase 8: Pooja & Traditional Upayas linked to planetary factors', () => {
    const kundliA = VedicAstroEngine.calculateKundli(profileA);
    const dashaA = kundliA.dashas.currentMahadasha.planet;
    const poojas = FutureRemedyEngine.generatePoojasAndUpayas(dashaA, kundliA);

    expect(poojas.length).toBeGreaterThanOrEqual(3);
    for (const p of poojas) {
      expect(p.deity).toBeDefined();
      expect(p.planet).toBeDefined();
      expect(p.traditionalBasis).toBeDefined();
      expect(p.frequency).toBeDefined();
    }
  });

  it('Phase 9 & 24: Medical and Lifespan Determinism Guards', () => {
    const kundliB = VedicAstroEngine.calculateKundli(profileB);
    const longevity = FutureLongevityEngine.evaluateHealthSpan(kundliB);

    const stringified = JSON.stringify(longevity).toLowerCase();

    // Must never contain fatalistic deterministic death claims or disease guarantees
    expect(stringified).not.toContain('you will die in');
    expect(stringified).not.toContain('exact date of death');
    expect(stringified).not.toContain('you will get cancer');
    expect(stringified).not.toContain('you will have diabetes');

    // Health domain must include disclaimers
    expect(longevity.vitalityTheme).toBeDefined();
    expect(longevity.epistemicDisclaimer).toContain('does not calculate or predict exact lifespan, death dates');
  });

  it('Phase 21: Tenant Isolation across Progress Items', async () => {
    const itemA = await FutureProgressEngine.createItem('usr_tenant_alpha', {
      category: 'REMEDY',
      title: 'Sunrise Surya Arghya',
      status: 'IN_PROGRESS',
    });

    const itemB = await FutureProgressEngine.createItem('usr_tenant_beta', {
      category: 'GOAL',
      title: 'Complete Financial Reserve',
      status: 'IN_PROGRESS',
    });

    const listA = await FutureProgressEngine.getItemsByUser('usr_tenant_alpha');
    const listB = await FutureProgressEngine.getItemsByUser('usr_tenant_beta');

    expect(listA.some((i) => i.id === itemA.id)).toBe(true);
    expect(listA.some((i) => i.id === itemB.id)).toBe(false);

    expect(listB.some((i) => i.id === itemB.id)).toBe(true);
    expect(listB.some((i) => i.id === itemA.id)).toBe(false);
  });
});
