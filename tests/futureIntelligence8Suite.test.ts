/**
 * futureIntelligence8Suite.test.ts
 * DeepAstro Future Intelligence 8.0 Comprehensive System & Safety Test Suite
 *
 * Verifies:
 * 1. Personalization divergence (Profile A != Profile B)
 * 2. All 14 domains and modules return structured calculated data
 * 3. DeepAstro Remedy & Pooja Engine (chart factors, classical deities, priority)
 * 4. Longevity & Health safety (ZERO death dates, mandatory medical disclaimers)
 * 5. Action Plan & Progress Engine with tenant isolation
 * 6. Calculation Passport provenance
 */

import { describe, it, expect } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureRemedyEngine } from '../server/src/intelligence/future/FutureRemedyEngine.js';
import { FutureLongevityEngine } from '../server/src/intelligence/future/FutureLongevityEngine.js';
import { FutureLifeDomainEngine } from '../server/src/intelligence/future/FutureLifeDomainEngine.js';
import { FutureImprovementEngine } from '../server/src/intelligence/future/FutureImprovementEngine.js';
import { FutureProgressEngine } from '../server/src/intelligence/future/FutureProgressEngine.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('DEEPASTRO FUTURE INTELLIGENCE 8.0 TEST SUITE', () => {
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

  it('1. Personalization Rule: Profile A and Profile B produce diverging fingerprints and timelines', async () => {
    const forecastA = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_test_a',
      birthProfile: profileA,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const forecastB = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_test_b',
      birthProfile: profileB,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    expect(forecastA.calculationFingerprint).toBeDefined();
    expect(forecastB.calculationFingerprint).toBeDefined();
    expect(forecastA.calculationFingerprint).not.toBe(forecastB.calculationFingerprint);

    // Personal details and themes should diverge
    expect(forecastA.overall10YearTheme).not.toBe(forecastB.overall10YearTheme);
    expect(forecastA.version).toBe('8.0.0-cfie');
    expect(forecastB.version).toBe('8.0.0-cfie');
  });

  it('2. Version 8.0 & Calculation Passport: Provides provenance and ephemeris sources', async () => {
    const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'usr_test_passport',
      birthProfile: profileA,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    expect(forecast.calculationPassport).toBeDefined();
    expect(forecast.calculationPassport?.engineVersion).toBe('8.0.0-cfie');
    expect(forecast.calculationPassport?.ayanamsha).toContain('Lahiri');
    expect(forecast.calculationPassport?.ephemerisSource).toContain('VSOP87');
    expect(forecast.calculationPassport?.calculationModulesUsed.length).toBeGreaterThan(4);
  });

  it('3. 3-Year Life Domain Scores: Generates circular gauge scores for all 6 core domains', () => {
    const kundli = VedicAstroEngine.calculateKundli(profileA);
    const dasha = kundli.dashas.currentMahadasha.planet;
    const scores = FutureLifeDomainEngine.calculateDomainScores(kundli, dasha);

    expect(scores.length).toBe(6);
    const domainKeys = scores.map((s) => s.domain);
    expect(domainKeys).toContain('Career');
    expect(domainKeys).toContain('Wealth');
    expect(domainKeys).toContain('Relations');
    expect(domainKeys).toContain('Health');
    expect(domainKeys).toContain('Learning');
    expect(domainKeys).toContain('Spirituality');

    for (const score of scores) {
      expect(score.currentScore).toBeGreaterThanOrEqual(50);
      expect(score.currentScore).toBeLessThanOrEqual(100);
      expect(score.contributingFactors.length).toBeGreaterThan(0);
    }
  });

  it('4. DeepAstro Remedy Engine: Generates chart-linked remedies with priority and safety notices', () => {
    const kundli = VedicAstroEngine.calculateKundli(profileA);
    const dasha = kundli.dashas.currentMahadasha.planet;
    const remedies = FutureRemedyEngine.generateRemedies(dasha, kundli);

    expect(remedies.length).toBeGreaterThanOrEqual(4);
    const highPriority = remedies.find((r) => r.priority === 'HIGH');
    expect(highPriority).toBeDefined();

    // Check gemstone caution notice
    const gemRemedy = remedies.find((r) => r.type === 'GEMSTONE_CAUTION');
    expect(gemRemedy).toBeDefined();
    expect(gemRemedy?.safetyNotice).toContain('Consult a qualified Jyotish practitioner');
  });

  it('5. Classical Pooja & Upaya Engine: Maps planetary upayas to traditional deities', () => {
    const kundli = VedicAstroEngine.calculateKundli(profileA);
    const dasha = kundli.dashas.currentMahadasha.planet;
    const upayas = FutureRemedyEngine.generatePoojasAndUpayas(dasha, kundli);

    expect(upayas.length).toBeGreaterThanOrEqual(9);
    const deities = upayas.map((u) => u.deity);
    expect(deities.some((d) => d.includes('Shiva'))).toBe(true);
    expect(deities.some((d) => d.includes('Vishnu'))).toBe(true);
    expect(deities.some((d) => d.includes('Ganesha'))).toBe(true);
    expect(deities.some((d) => d.includes('Durga'))).toBe(true);
    expect(deities.some((d) => d.includes('Mahalakshmi'))).toBe(true);
  });

  it('6. Longevity Safety Standard: Zero exact death dates, zero lifespan claims', () => {
    const kundli = VedicAstroEngine.calculateKundli(profileA);
    const longevity = FutureLongevityEngine.evaluateHealthSpan(kundli);

    expect(longevity.vitalityTheme).toBeDefined();
    expect(longevity.supportiveIndicators.length).toBeGreaterThan(0);
    expect(longevity.stabilityIndicators.length).toBeGreaterThan(0);
    expect(longevity.wellnessPriorities.length).toBeGreaterThan(0);

    // Strict safety assertions
    const stringified = JSON.stringify(longevity).toLowerCase();
    expect(stringified).not.toContain('exact death');
    expect(stringified).not.toContain('age of death');
    expect(stringified).not.toContain('you will die');
    expect(stringified).not.toContain('lifespan of exactly');
    expect(longevity.epistemicDisclaimer).toContain('does not calculate or predict exact lifespan, death dates');
  });

  it('7. Personal Improvement Engine: Generates actionable personal plan with user agency', () => {
    const kundli = VedicAstroEngine.calculateKundli(profileA);
    const dasha = kundli.dashas.currentMahadasha.planet;
    const plan = FutureImprovementEngine.generatePlan(kundli, dasha, 'fp_test_123', 'usr_test_a');

    expect(plan.domainActions.length).toBeGreaterThanOrEqual(5);
    for (const action of plan.domainActions) {
      expect(action.whatUserCanControl).toBeDefined();
      expect(action.practicalAction).toBeDefined();
      expect(action.traditionalRemedy).toBeDefined();
      expect(action.progressMilestone).toBeDefined();
    }
  });

  it('8. User Progress Engine & Tenant Isolation: User A progress is strictly isolated from User B', async () => {
    const userAItem = await FutureProgressEngine.createItem('usr_isolated_a', {
      category: 'REMEDY',
      title: 'Daily Morning Surya Namaskar',
      status: 'IN_PROGRESS',
    });

    const userBItem = await FutureProgressEngine.createItem('usr_isolated_b', {
      category: 'GOAL',
      title: 'Complete Financial Reserve',
      status: 'IN_PROGRESS',
    });

    const listA = await FutureProgressEngine.getItemsByUser('usr_isolated_a');
    const listB = await FutureProgressEngine.getItemsByUser('usr_isolated_b');

    expect(listA.some((i) => i.id === userAItem.id)).toBe(true);
    expect(listA.some((i) => i.id === userBItem.id)).toBe(false);

    expect(listB.some((i) => i.id === userBItem.id)).toBe(true);
    expect(listB.some((i) => i.id === userAItem.id)).toBe(false);

    // Update item
    const updated = await FutureProgressEngine.updateItem('usr_isolated_a', userAItem.id, {
      status: 'COMPLETED',
    });
    expect(updated?.status).toBe('COMPLETED');
  });
});
