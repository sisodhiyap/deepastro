/**
 * DeepAstro Daily Personalized Intelligence Test Suite
 * Validates:
 * 1. Daily forecast generation using chart, dasha, transit, and panchang.
 * 2. Meaningful differentiation between different users/charts/goals.
 * 3. AI guardrails: strict absence of medical diagnosis, guaranteed financial outcomes, or fear-based fatalism.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { DailyPersonalizedIntelligenceEngine } from '../server/src/learning/DailyPersonalizedIntelligence.js';
import { UserMemoryService } from '../server/src/learning/UserMemoryService.js';
import { db } from '../server/src/database/db.js';

describe('DeepAstro Daily Personalized Intelligence Suite', () => {
  const userA = 'user_arjun_delhi';
  const userB = 'user_sarah_london';

  // Chart A: Pisces Ascendant (Deepti in Agra)
  const factSetA = VedicAstroEngine.createAstrologyFactSet({
    name: 'Arjun',
    birthDate: '1988-03-02',
    birthTime: '07:15',
    birthPlace: 'Agra, UP, India',
    latitude: 27.1767,
    longitude: 78.0081,
    timezone: 5.5,
  });
  const snapshotA = CalculationSnapshotEngine.createSnapshot(factSetA, userA);

  // Chart B: Scorpio Ascendant (London birth)
  const factSetB = VedicAstroEngine.createAstrologyFactSet({
    name: 'Sarah',
    birthDate: '1995-11-20',
    birthTime: '15:30',
    birthPlace: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
  });
  const snapshotB = CalculationSnapshotEngine.createSnapshot(factSetB, userB);

  beforeEach(() => {
    db.userMemories.clear();
    db.predictionRecords.clear();
  });

  it('generates a complete daily personalized forecast with panchang and transit activations', () => {
    const forecast = DailyPersonalizedIntelligenceEngine.generateDailyForecast(userA, snapshotA);

    expect(forecast.id).toBeDefined();
    expect(forecast.userId).toBe(userA);
    expect(forecast.panchangSummary.tithi).toBeDefined();
    expect(forecast.panchangSummary.vara).toBeDefined();
    expect(forecast.panchangSummary.nakshatra).toBeDefined();
    expect(forecast.activeDasha.mahadasha).toBe(snapshotA.dashas.currentMahadasha);
    expect(forecast.keyTransitActivation).toBeDefined();
    expect(forecast.personalizedGuidance.length).toBeGreaterThan(50);
    expect(forecast.favorableActions.length).toBeGreaterThan(0);
    expect(forecast.cautions).toBeDefined();
    expect(forecast.disclaimer).toContain('Vedic daily guidance reflects energetic planetary currents');
  });

  it('guarantees meaningful differentiation across differing charts and goals', () => {
    // Give User A a tech startup goal
    UserMemoryService.addMemory(userA, {
      category: 'goals',
      content: 'Scaling cloud microservices infrastructure',
      source: 'USER_EXPLICIT',
    });

    // Give User B a creative writing goal
    UserMemoryService.addMemory(userB, {
      category: 'goals',
      content: 'Publishing historical fiction novel',
      source: 'USER_EXPLICIT',
    });

    const forecastA = DailyPersonalizedIntelligenceEngine.generateDailyForecast(userA, snapshotA);
    const forecastB = DailyPersonalizedIntelligenceEngine.generateDailyForecast(userB, snapshotB);

    // Cosmic themes must differ based on different Lagna and Dashas
    expect(forecastA.cosmicTheme).not.toBe(forecastB.cosmicTheme);
    expect(forecastA.cosmicTheme).toContain('Aquarius');
    expect(forecastB.cosmicTheme).not.toContain('Aquarius');

    // Personalized guidance must incorporate distinct goals
    expect(forecastA.personalizedGuidance).toContain('Scaling cloud microservices');
    expect(forecastB.personalizedGuidance).toContain('Publishing historical fiction novel');
    expect(forecastA.personalizedGuidance).not.toBe(forecastB.personalizedGuidance);
  });

  it('strictly enforces safety guardrails against medical diagnosis and guaranteed financial claims', () => {
    const forecast = DailyPersonalizedIntelligenceEngine.generateDailyForecast(userA, snapshotA);
    const fullText = (forecast.personalizedGuidance + ' ' + forecast.cautions).toLowerCase();

    // Forbidden fatalistic medical diagnosis terms
    const forbiddenMedical = ['cancer', 'heart attack', 'fatal illness', 'stroke', 'tumor', 'lethal'];
    for (const term of forbiddenMedical) {
      expect(fullText).not.toContain(term);
    }

    // Forbidden guaranteed financial claims
    const forbiddenFinancial = ['guaranteed lottery', '100% profit', 'surefire jackpot', 'get rich quick'];
    for (const term of forbiddenFinancial) {
      expect(fullText).not.toContain(term);
    }

    // Forbidden fear-based remedies
    const forbiddenFear = ['curse will destroy', 'wrath of god', 'irreparable doom'];
    for (const term of forbiddenFear) {
      expect(fullText).not.toContain(term);
    }
  });
});
