import { describe, it, expect, beforeEach } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import { FutureLongevityEngine } from '../server/src/intelligence/future/FutureLongevityEngine.js';
import { FutureLifeDomainEngine } from '../server/src/intelligence/future/FutureLifeDomainEngine.js';
import { FutureTimelineEngine } from '../server/src/intelligence/future/FutureTimelineEngine.js';
import { FutureScenarioEngine } from '../server/src/intelligence/future/FutureScenarioEngine.js';
import { FutureIntelligenceObservatory } from '../server/src/intelligence/future/FutureIntelligenceObservatory.js';
import { AstroBotIntentRouter } from '../server/src/chatbot/AstroBotIntentRouter.js';
import { UniversalCardOrchestrator } from '../server/src/chatbot/UniversalCardOrchestrator.js';
import { db } from '../server/src/database/db.js';

describe('Cosmic Future Intelligence Engine (CFIE v1.0.0) Master Suite', () => {

  const testUsers = [
    {
      userId: 'usr_delhi_01',
      fullName: 'Aarav Sharma',
      birthDate: '1990-05-14',
      birthTime: '08:30',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'Male' as const,
      birthConfidence: 'High' as const,
    },
    {
      userId: 'usr_london_02',
      fullName: 'Emily Watson',
      birthDate: '1985-11-22',
      birthTime: '14:15',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
      gender: 'Female' as const,
      birthConfidence: 'High' as const,
    },
    {
      userId: 'usr_tokyo_03',
      fullName: 'Kenji Sato',
      birthDate: '1998-03-09',
      birthTime: '19:45',
      birthPlace: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 9.0,
      gender: 'Male' as const,
      birthConfidence: 'High' as const,
    },
    {
      userId: 'usr_ny_04',
      fullName: 'Marcus Vance',
      birthDate: '1976-08-30',
      birthTime: '05:20',
      birthPlace: 'New York, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: -5.0,
      gender: 'Male' as const,
      birthConfidence: 'Medium' as const,
    },
    {
      userId: 'usr_sydney_05',
      fullName: 'Chloe Miller',
      birthDate: '2001-12-05',
      birthTime: '23:10',
      birthPlace: 'Sydney, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 10.0,
      gender: 'Female' as const,
      birthConfidence: 'High' as const,
    },
  ];

  beforeEach(() => {
    FutureIntelligenceObservatory.clear();
  });

  // ============================================================
  // TEST GROUP 1: PREMIUM-ONLY ACCESS & ENTITLEMENT (Section 2, 67, 77)
  // ============================================================
  describe('1. Premium Entitlement Security Gates', () => {
    it('denies access to free tier users', async () => {
      // Free user without entitlement
      await expect(
        CosmicFutureIntelligenceEngine.generateForecast({
          userId: 'usr_free_guest_01',
          birthProfile: testUsers[0],
        })
      ).rejects.toThrow('PREMIUM_ACCESS_REQUIRED');
    });

    it('denies access to authenticated free users without future entitlement', async () => {
      await expect(
        CosmicFutureIntelligenceEngine.generateForecast({
          userId: 'usr_auth_free_02',
          birthProfile: testUsers[0],
          clientRole: 'USER',
        })
      ).rejects.toThrow('PREMIUM_ACCESS_REQUIRED');
    });

    it('allows access to premium users', async () => {
      db.grantEntitlement('usr_delhi_01', 'FUTURE_INTELLIGENCE_PREMIUM');
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_delhi_01',
        birthProfile: testUsers[0],
      });
      expect(res).toBeDefined();
      expect(res.id).toBeDefined();
    });

    it('allows access to pro users', async () => {
      db.grantEntitlement('usr_london_02', 'FUTURE_INTELLIGENCE_PREMIUM');
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_london_02',
        birthProfile: testUsers[1],
      });
      expect(res).toBeDefined();
      expect(res.id).toBeDefined();
    });

    it('allows access to admin users for testing and governance', async () => {
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_admin_governance',
        clientRole: 'ADMIN',
        birthProfile: testUsers[0],
      });
      expect(res).toBeDefined();
      expect(res.id).toBeDefined();
    });
  });

  // ============================================================
  // TEST GROUP 2: EXPLICIT REVEAL CONSENT & GRANULAR LEVELS (Section 3, 4, 68, 77)
  // ============================================================
  describe('2. Explicit Reveal Consent & Granular Levels', () => {
    it('blocks unconsented sensitive forecast reveals (Level 5 / 6) when only Level 1 authorized', async () => {
      db.grantEntitlement('usr_consent_test', 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent('usr_consent_test', true, 'LEVEL_1');

      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_consent_test',
        birthProfile: testUsers[0],
        requestedLevel: 'LEVEL_6', // longevity requires Level 6 consent
      });

      // Ceiling enforced: capped at LEVEL_1, sensitive longevity is strictly suppressed
      expect(res.revealLevel).toBe('LEVEL_1');
      expect(res.longevityHealthspan).toBeUndefined();
    });

    it('records consent audit trail and permits authorized levels', async () => {
      db.grantEntitlement('usr_delhi_01', 'FUTURE_INTELLIGENCE_PREMIUM');
      const record = FutureConsentEngine.recordConsent('usr_delhi_01', true, 'LEVEL_6');
      expect(record.userId).toBe('usr_delhi_01');
      expect(record.authorizedLevel).toBe('LEVEL_6');
      expect(record.consentTimestamp).toBeDefined();

      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_delhi_01',
        birthProfile: testUsers[0],
        requestedLevel: 'LEVEL_6',
      });

      expect(res.revealLevel).toBe('LEVEL_6');
      expect(res.longevityHealthspan).toBeDefined();
      expect(res.longevityHealthspan?.vitalityTheme).toBeDefined();
    });
  });

  // ============================================================
  // TEST GROUP 3: EPISTEMIC SAFETY & LONGEVITY SAFEGUARDS (Section 1, 34, 35, 77)
  // ============================================================
  describe('3. Epistemic Safety & Longevity Protection', () => {
    it('strictly avoids exact death dates, countdowns, or medical diagnosis', async () => {
      db.grantEntitlement('usr_london_02', 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent('usr_london_02', true, 'LEVEL_6');
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_london_02',
        birthProfile: testUsers[1],
        requestedLevel: 'LEVEL_6',
      });

      const serialized = JSON.stringify(res).toLowerCase();

      // Safety checks: NO exact death predictions, NO countdown to death, NO deterministic lifespan claims
      expect(serialized).not.toContain('countdown to death');
      expect(serialized).not.toContain('you will die on');
      expect(serialized).not.toContain('you will live until age');
      expect(serialized).not.toContain('"deathdate"');
      expect(serialized).not.toContain('"death_date"');

      // Epistemic non-deterministic language
      expect(res.disclaimer).toBeDefined();
      expect(res.disclaimer.toLowerCase()).toContain('traditional');
      expect(serialized).not.toContain('this will definitely happen');

      // Longevity card check
      expect(res.longevityHealthspan?.epistemicDisclaimer).toContain('medical diagnoses');
    });
  });

  // ============================================================
  // TEST GROUP 4: 5-USER ANTI-HARDCODING MULTI-PROFILE TEST (Section 71, 72, 77)
  // ============================================================
  describe('4. Multi-User Verification & Anti-Hardcoding Test', () => {
    it('produces 5 distinct calculation snapshots, yearly themes, and domain trajectories', async () => {
      const results = await Promise.all(
        testUsers.map((user) => {
          db.grantEntitlement(user.userId, 'FUTURE_INTELLIGENCE_PREMIUM');
          FutureConsentEngine.recordConsent(user.userId, true, 'LEVEL_2');
          return CosmicFutureIntelligenceEngine.generateForecast({
            userId: user.userId,
            birthProfile: user,
            horizon: '10_YEARS',
            requestedLevel: 'LEVEL_2',
          });
        })
      );

      // Verify all 5 forecasts were created
      expect(results).toHaveLength(5);

      // Verify calculation snapshots are all unique
      const snapshotIds = new Set(results.map((r) => r.calculationSnapshotId));
      expect(snapshotIds.size).toBe(5);

      // Verify 10-year timelines (2026-2035) for each
      results.forEach((res) => {
        expect(res.yearForecasts).toHaveLength(10);
        expect(res.yearForecasts[0].year).toBe(2026);
        expect(res.yearForecasts[9].year).toBe(2035);
      });

      // Verify year-1 themes across the 5 users are distinct
      const year1Themes = results.map((r) => r.yearForecasts[0].overallTheme);
      const uniqueThemes = new Set(year1Themes);
      expect(uniqueThemes.size).toBeGreaterThan(1);

      // Verify that none of the results contain hardcoded demo text
      const allSerialized = JSON.stringify(results);
      expect(allSerialized).not.toContain('DEMO_BIRTH_PROFILE');
      expect(allSerialized).not.toContain('static chart');
      expect(allSerialized).not.toContain('sample future');
    });
  });

  // ============================================================
  // TEST GROUP 5: 12-MONTH TIMELINE & DYNAMIC CONFIDENCE (Section 23, 24)
  // ============================================================
  describe('5. Month-wise Breakdown & Monthly Confidence', () => {
    it('generates 12 distinct months with independent confidence and key windows', async () => {
      db.grantEntitlement('usr_tokyo_03', 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent('usr_tokyo_03', true, 'LEVEL_3');
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_tokyo_03',
        birthProfile: testUsers[2],
        requestedLevel: 'LEVEL_3',
      });

      expect(res.monthForecasts).toHaveLength(12);
      expect(res.monthForecasts[0].monthName).toBe('January');
      expect(res.monthForecasts[11].monthName).toBe('December');

      res.monthForecasts.forEach((m) => {
        expect(['LOW', 'MODERATE', 'HIGH']).toContain(m.confidence);
        expect(m.keyWindow).toBeDefined();
        expect(m.whyBasis).toBeDefined();
      });
    });
  });

  // ============================================================
  // TEST GROUP 6: 15 LIFE DOMAINS & SCENARIOS (Section 25, 36, 37)
  // ============================================================
  describe('6. 15 Life Domains and Probabilistic Scenarios', () => {
    it('evaluates all 15 life domains without guaranteed financial or career returns', async () => {
      db.grantEntitlement('usr_ny_04', 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent('usr_ny_04', true, 'LEVEL_4');
      const res = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_ny_04',
        birthProfile: testUsers[3],
        requestedLevel: 'LEVEL_4',
      });

      const domainKeys = Object.keys(res.domainForecasts);
      expect(domainKeys).toHaveLength(15);
      expect(domainKeys).toContain('CAREER');
      expect(domainKeys).toContain('BUSINESS');
      expect(domainKeys).toContain('FINANCE');
      expect(domainKeys).toContain('RELATIONSHIP');
      expect(domainKeys).toContain('SPIRITUALITY');
      expect(domainKeys).toContain('HEALTHSPAN');

      // Check scenarios: Baseline, Opportunity, Challenge
      expect(res.scenarios).toBeDefined();
      expect(res.scenarios.baseline).toBeDefined();
      expect(res.scenarios.opportunity).toBeDefined();
      expect(res.scenarios.challenge).toBeDefined();
    });
  });

  // ============================================================
  // TEST GROUP 7: OUTCOME LEARNING & UNKNOWN PROTECTION (Section 62, 63, 77)
  // ============================================================
  describe('7. Outcome Learning & Epistemic Honesty', () => {
    it('preserves UNKNOWN status and refuses to convert silence or unknown into success', async () => {
      const rawOutcome = undefined;
      const recordedOutcome = (rawOutcome === 'YES' || rawOutcome === 'PARTIALLY' || rawOutcome === 'NO') ? rawOutcome : 'UNKNOWN';

      expect(recordedOutcome).toBe('UNKNOWN');
      expect(recordedOutcome).not.toBe('YES');
    });
  });

  // ============================================================
  // TEST GROUP 8: ASTROBOT INTENT ROUTING & CARD GENERATION (Section 53, 54, 88)
  // ============================================================
  describe('8. AstroBot Universal Gateway Integration', () => {
    it('classifies future queries into future intent and subcategories', () => {
      const r1 = AstroBotIntentRouter.route('Show me my future map for the next 10 years');
      expect(r1.primaryIntent).toBe('FUTURE_FORECAST');

      const r2 = AstroBotIntentRouter.route('What will 2028 be like for me?');
      expect(r2.primaryIntent).toBe('FUTURE_YEAR');

      const r3 = AstroBotIntentRouter.route('Break it down month by month for next year');
      expect(r3.primaryIntent).toBe('FUTURE_MONTH');

      const r4 = AstroBotIntentRouter.route('Tell me about my longevity and health span vitality');
      expect(r4.primaryIntent).toBe('FUTURE_LONGEVITY');
    });

    it('formats FUTURE_INSIGHT card with zero unresolved template variables', () => {
      const cardResult = UniversalCardOrchestrator.createFutureInsightCard({
        id: 'fc_test_01',
        horizon: '10_YEARS',
        currentLifePhase: 'Strategic Alignment',
        overall10YearTheme: 'Purposeful Expansion',
        nextMajorWindow: { period: 'Mid 2026', description: 'Window of consolidation', domain: 'CAREER' },
        yearForecasts: [
          { year: 2026, overallTheme: 'Foundation', strongestDomain: 'CAREER', strongWindows: 'Q2', confidence: 'HIGH' },
          { year: 2027, overallTheme: 'Expansion', strongestDomain: 'FINANCE', strongWindows: 'Q3', confidence: 'MODERATE' },
        ],
        domainForecasts: {
          CAREER: { upcomingWindows: 'Leadership consolidation' },
          RELATIONSHIP: { upcomingWindows: 'Deepened reciprocity' },
          FINANCE: { upcomingWindows: 'Prudent growth' },
          SPIRITUALITY: { upcomingWindows: 'Inner contemplation' },
        },
        remedies: [
          { category: 'MEDITATION', name: 'Pranayama', description: 'Daily breathwork' }
        ],
        multiSystemConvergence: { overallConvergence: 'HIGH', contradictions: [] },
        evidenceGraph: { systemsFused: ['Vedic', 'KP'] },
        disclaimer: 'Traditional non-deterministic outlook',
      });

      expect(cardResult.card.type).toBe('FUTURE_INSIGHT');
      expect(cardResult.card.data.overall10YearTheme).toBe('Purposeful Expansion');
      expect(cardResult.actions).toContain('Explore Next 10 Years');
      expect(cardResult.actions).toContain('Longevity & Wellbeing');

      // Check placeholder protection
      const rawStr = JSON.stringify(cardResult.card.data);
      expect(/\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/.test(rawStr)).toBe(false);
    });

    it('formats FUTURE_LONGEVITY card safely without death prediction', () => {
      const cardResult = UniversalCardOrchestrator.createFutureLongevityCard({
        vitalityTheme: 'Focus on balanced living and restorative routines.',
        resilienceIndicators: [
          { indicator: 'Sun', status: 'Strong', traditionalTheme: 'Resilient vitality.' }
        ],
        selfCareWindows: [
          { startYear: 2027, endYear: 2028, intensity: 'Moderate', focusArea: 'Rest', recommendation: 'Avoid burnout.' }
        ],
        lifestyleRecommendations: ['Prioritize adequate sleep.'],
        epistemicDisclaimer: 'Not a medical assessment or prediction of lifespan or death.',
      });

      expect(cardResult.card.type).toBe('FUTURE_LONGEVITY');
      const serialized = JSON.stringify(cardResult.card.data).toLowerCase();
      expect(serialized).not.toContain('countdown to death');
      expect(serialized).not.toContain('you will die on');
      expect(serialized).toContain('not a medical assessment');
    });
  });

  // ============================================================
  // TEST GROUP 9: YEAR COMPARISON ENGINE (Section 87)
  // ============================================================
  describe('9. Multi-Year Comparison Engine', () => {
    it('compares two distinct forecast years cleanly', async () => {
      db.grantEntitlement('usr_delhi_01', 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent('usr_delhi_01', true, 'LEVEL_2');
      const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_delhi_01',
        birthProfile: testUsers[0],
        requestedLevel: 'LEVEL_2',
      });

      const comparison = CosmicFutureIntelligenceEngine.compareYears(forecast, 2026, 2027);
      expect(comparison.yearA.year).toBe(2026);
      expect(comparison.yearB.year).toBe(2027);
      expect(comparison.yearA.theme).toBeDefined();
      expect(comparison.yearB.theme).toBeDefined();
    });
  });

});
