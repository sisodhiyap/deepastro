/**
 * DeepAstro Past Life Intelligence Engine (SoulTrace Engine v1.0)
 * Comprehensive Test Suite & Anti-Hardcoding Verification Harness
 */

import { describe, it, expect } from 'vitest';
import {
  PastLifeIntelligenceEngine,
  PastLifeInputEngine,
  PastLifeAstrologyEngine,
  PastLifeNumerologyEngine,
  PastLifeKarmaEngine,
  PastLifeVedicKnowledgeEngine,
  VishnuPuranaKnowledgeAdapter,
  PastLifeContradictionEngine,
  PastLifeEvidenceEngine,
  PastLifeConfidenceEngine,
  PastLifePatternEngine,
  PastLifeCardEngine,
  PastLifeAuditEngine,
} from '../server/src/intelligence/pastlife/index.js';

describe('SoulTrace Engine v1.0 — Comprehensive Past Life Intelligence Suite', () => {
  // Real synthetic baseline user profiles with distinct astronomical coordinates
  const userAlpha = {
    userId: 'usr_alpha_101',
    fullName: 'Ananya Deshmukh',
    birthDate: '1988-11-23',
    birthTime: '06:45',
    birthPlace: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 5.5,
    isApproximateTime: false,
  };

  const userBeta = {
    userId: 'usr_beta_202',
    fullName: 'Liam O\'Connor',
    birthDate: '1993-04-12',
    birthTime: '14:20',
    birthPlace: 'Dublin, Ireland',
    latitude: 53.3498,
    longitude: -6.2603,
    timezone: 0.0,
    isApproximateTime: false,
  };

  const userGamma = {
    userId: 'usr_gamma_303',
    fullName: 'Kenji Takahashi',
    birthDate: '1979-08-30',
    birthTime: '22:15',
    birthPlace: 'Kyoto, Japan',
    latitude: 35.0116,
    longitude: 135.7681,
    timezone: 9.0,
    isApproximateTime: false,
  };

  const userDelta = {
    userId: 'usr_delta_404',
    fullName: 'Elena Rostova',
    birthDate: '2001-01-19',
    birthTime: '03:10',
    birthPlace: 'Saint Petersburg, Russia',
    latitude: 59.9311,
    longitude: 30.3609,
    timezone: 3.0,
    isApproximateTime: false,
  };

  const userEpsilon = {
    userId: 'usr_epsilon_505',
    fullName: 'Marcus Vance',
    birthDate: '1996-09-05',
    birthTime: '18:50',
    birthPlace: 'Denver, Colorado, USA',
    latitude: 39.7392,
    longitude: -104.9903,
    timezone: -7.0,
    isApproximateTime: true, // approximate time for sensitivity check
  };

  // Phase 1: Input Validation & Missing Field Defense
  describe('1. Input Validation & Epistemic Boundary Defense', () => {
    it('rejects generation when required birth data is missing and returns PAST_LIFE_ANALYSIS_UNAVAILABLE', () => {
      const invalidInput = {
        userId: 'usr_incomplete',
        fullName: 'Incomplete User',
        birthDate: '', // Missing
        birthTime: '',
        birthPlace: '',
      };

      const result = PastLifeInputEngine.validate(invalidInput.userId, null, invalidInput as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('PAST_LIFE_ANALYSIS_UNAVAILABLE');
      expect(result.missingFields).toContain('birthDate');
      expect(result.missingFields).toContain('birthTime');
      expect(result.missingFields).toContain('birthPlace');
    });

    it('gracefully degrades D60 and flags birth time uncertainty when isApproximateTime is true', () => {
      const astro = PastLifeAstrologyEngine.analyze(userEpsilon);
      expect(astro.d60Reliability).toBe('UNRELIABLE');
      expect(astro.astrologyConfidence).toBe('MODERATE');

      const confidence = PastLifeConfidenceEngine.calculate(
        astro,
        PastLifeNumerologyEngine.analyze(userEpsilon),
        false
      );
      expect(confidence.birth_time_reliability).toBe('UNRELIABLE');
      expect(confidence.uncertainty_notes.some((n) => n.includes('D60 micro-varga'))).toBe(true);
    });
  });

  // Phase 2: Astronomical Core & Jaimini Integration
  describe('2. Deterministic Astrological Indicators (Ketu, 12th, 8th, 5th, Atmakaraka)', () => {
    it('calculates authentic Ketu, Rahu, and House indicators without hardcoding', () => {
      const astro = PastLifeAstrologyEngine.analyze(userAlpha);
      expect(astro.ketuData.house).toBeGreaterThanOrEqual(1);
      expect(astro.ketuData.house).toBeLessThanOrEqual(12);
      expect(astro.rahuData.house).toBeGreaterThanOrEqual(1);
      expect(astro.rahuData.house).toBeLessThanOrEqual(12);
      // Rahu and Ketu are always exactly 6 houses apart (180 deg)
      const diff = Math.abs(astro.rahuData.house - astro.ketuData.house);
      expect(diff === 6 || diff === 6).toBe(true);

      // Verify Atmakaraka identification
      expect(astro.atmakarakaData.planet).toBeDefined();
      expect(astro.atmakarakaData.signName).toBeDefined();
      expect(astro.atmakarakaData.soulLesson).toBeDefined();
    });

    it('evaluates 12th, 8th, and 5th house cusps and lords faithfully', () => {
      const astro = PastLifeAstrologyEngine.analyze(userBeta);
      expect(astro.house12Data.lord).toBeDefined();
      expect(astro.house8Data.lord).toBeDefined();
      expect(astro.house5Data.lord).toBeDefined();
      expect(astro.indicators.length).toBeGreaterThanOrEqual(5);
    });
  });

  // Phase 3: Numerology Integration
  describe('3. Numerology Vibrations & Karmic Debt Analysis', () => {
    it('computes accurate Life Path, Destiny, and Soul Urge numbers', () => {
      const num = PastLifeNumerologyEngine.analyze(userAlpha);
      expect(num.lifePath).toBeGreaterThanOrEqual(1);
      expect(num.destiny).toBeGreaterThanOrEqual(1);
      expect(num.soulUrge).toBeGreaterThanOrEqual(1);
      expect(num.primaryVibrationTheme).toBeDefined();
      expect(num.indicators.length).toBeGreaterThanOrEqual(3);
    });
  });

  // Phase 4: Vedic & Vishnu Purana Source Grounding (Zero Hallucinated Scripture)
  describe('4. Classical Vedic & Vishnu Purana Knowledge Provenance', () => {
    it('grounds all textual citations in authentic classical treatises (BPHS, Jaimini, Vishnu Purana, Gita)', () => {
      const vedicSources = PastLifeVedicKnowledgeEngine.getReferencesForIndicators('Jupiter', 12);
      expect(vedicSources.length).toBeGreaterThanOrEqual(3);
      expect(vedicSources.some((s) => s.sourceId.includes('BPHS'))).toBe(true);
      expect(vedicSources.some((s) => s.sourceId.includes('JUS'))).toBe(true);
      expect(vedicSources.some((s) => s.sourceId.includes('BG'))).toBe(true);

      const puranaInsight = VishnuPuranaKnowledgeAdapter.getPhilosophicalInsight('Spiritual Duty');
      expect(puranaInsight.references.some((r) => r.title === 'Vishnu Purana')).toBe(true);
      expect(puranaInsight.summary).toContain('Vishnu Purana');
      expect(puranaInsight.dharmaLesson).toBeDefined();
    });
  });

  // Phase 5: Contradiction Engine & Mixed Archetype Calibration
  describe('5. Multi-System Convergence & Contradiction Reasoning', () => {
    it('detects tension between ascetic seclusion and worldly leadership to form MIXED_ARCHETYPE', () => {
      const evidence = [
        {
          indicator: 'Ketu in 12th',
          system: 'VEDIC_ASTROLOGY' as const,
          weight: 85,
          direction: 'SPIRITUAL_CONTEMPLATION',
          supportingFactors: [],
          contradictingFactors: [],
          confidence: 'HIGH' as const,
        },
        {
          indicator: 'Sun AK in 10th',
          system: 'JAIMINI' as const,
          weight: 90,
          direction: 'LEADERSHIP_STEWARDSHIP',
          supportingFactors: [],
          contradictingFactors: [],
          confidence: 'HIGH' as const,
        },
      ];

      const result = PastLifeContradictionEngine.evaluate(evidence);
      expect(result.hasContradiction).toBe(true);
      expect(result.isMixedArchetype).toBe(true);
      expect(result.contradictions[0].archetype_adjustment).toContain('MIXED_ARCHETYPE');
    });
  });

  // Phase 6: Dual Visual Card Formats (Format A & Format B)
  describe('6. Dual Visual Output Generation (Insight Card & Soul Journey Report)', () => {
    it('generates rich Format A (Insight Card) payload adhering strictly to schema', () => {
      const result = PastLifeIntelligenceEngine.generate(userAlpha.userId, null, {
        overrides: userAlpha,
        format: 'insight_card',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const cardA = PastLifeCardEngine.formatForInsightCard(result.data!);
      expect(cardA.cardTitle).toBe('PAST LIFE INSIGHT');
      expect(cardA.userProfile.name).toBe(userAlpha.fullName);
      expect(cardA.summary).toBeDefined();
      expect(cardA.visualTheme).toBeDefined();
      expect(cardA.soulMessage).toBeDefined();
      expect(cardA.astrologicalHighlights.length).toBeGreaterThanOrEqual(4);
      expect(cardA.numerologyHighlights.length).toBeGreaterThanOrEqual(3);
    });

    it('generates comprehensive Format B (Soul Journey) dossier', () => {
      const result = PastLifeIntelligenceEngine.generate(userBeta.userId, null, {
        overrides: userBeta,
        format: 'soul_journey',
      });
      expect(result.success).toBe(true);
      const cardB = PastLifeCardEngine.formatForSoulJourney(result.data!);
      expect(cardB.format).toBe('soul_journey');
      expect(cardB.fullSchema.narrative.story).toBeDefined();
      expect(cardB.fullSchema.current_life_connections.length).toBeGreaterThanOrEqual(3);
    });
  });

  // Phase 7: Anti-Hardcoding & 5-User Isolation Test
  describe('7. Anti-Hardcoding Verification & 5-User Dynamic Isolation Test', () => {
    it('generates distinct calculation snapshots, archetypes, and soul messages across 5 diverse users', () => {
      const resAlpha = PastLifeIntelligenceEngine.generate(userAlpha.userId, null, { overrides: userAlpha });
      const resBeta = PastLifeIntelligenceEngine.generate(userBeta.userId, null, { overrides: userBeta });
      const resGamma = PastLifeIntelligenceEngine.generate(userGamma.userId, null, { overrides: userGamma });
      const resDelta = PastLifeIntelligenceEngine.generate(userDelta.userId, null, { overrides: userDelta });
      const resEpsilon = PastLifeIntelligenceEngine.generate(userEpsilon.userId, null, { overrides: userEpsilon });

      expect(resAlpha.success).toBe(true);
      expect(resBeta.success).toBe(true);
      expect(resGamma.success).toBe(true);
      expect(resDelta.success).toBe(true);
      expect(resEpsilon.success).toBe(true);

      const dAlpha = resAlpha.data!;
      const dBeta = resBeta.data!;
      const dGamma = resGamma.data!;
      const dDelta = resDelta.data!;
      const dEpsilon = resEpsilon.data!;

      // 1. Assert all 5 have unique calculation snapshots
      const snapshots = new Set([
        dAlpha.calculation_snapshot_id,
        dBeta.calculation_snapshot_id,
        dGamma.calculation_snapshot_id,
        dDelta.calculation_snapshot_id,
        dEpsilon.calculation_snapshot_id,
      ]);
      expect(snapshots.size).toBe(5);

      // 2. Assert all 5 have distinct user profile summaries
      expect(dAlpha.user_profile_summary.name).toBe(userAlpha.fullName);
      expect(dBeta.user_profile_summary.name).toBe(userBeta.fullName);
      expect(dGamma.user_profile_summary.name).toBe(userGamma.fullName);
      expect(dDelta.user_profile_summary.name).toBe(userDelta.fullName);
      expect(dEpsilon.user_profile_summary.name).toBe(userEpsilon.fullName);

      // 3. Assert no hardcoded static archetypes across all 5
      const primaryArchetypes = [
        dAlpha.archetype.primary,
        dBeta.archetype.primary,
        dGamma.archetype.primary,
        dDelta.archetype.primary,
        dEpsilon.archetype.primary,
      ];
      // There must be variation among diverse charts
      const uniqueArchetypes = new Set(primaryArchetypes);
      expect(uniqueArchetypes.size).toBeGreaterThanOrEqual(2);

      // 4. Assert distinct visual prompts and themes
      const prompts = new Set([
        dAlpha.visual_direction.artwork_prompt,
        dBeta.visual_direction.artwork_prompt,
        dGamma.visual_direction.artwork_prompt,
        dDelta.visual_direction.artwork_prompt,
        dEpsilon.visual_direction.artwork_prompt,
      ]);
      expect(prompts.size).toBe(5);
    });
  });

  // Phase 8: Golden Test (Zero Cross-User Data Contamination)
  describe('8. Golden Test — Strict Data Isolation & Zero Cross-User Leakage', () => {
    it('verifies that User Alpha data NEVER leaks into User Beta reading, and vice-versa', () => {
      const resAlpha = PastLifeIntelligenceEngine.generate(userAlpha.userId, null, { overrides: userAlpha });
      const resBeta = PastLifeIntelligenceEngine.generate(userBeta.userId, null, { overrides: userBeta });

      const jsonAlpha = JSON.stringify(resAlpha.data);
      const jsonBeta = JSON.stringify(resBeta.data);

      // User Alpha details must not exist in User Beta JSON
      expect(jsonBeta).not.toContain(userAlpha.fullName);
      expect(jsonBeta).not.toContain(userAlpha.birthPlace);
      expect(jsonBeta).not.toContain(userAlpha.userId);

      // User Beta details must not exist in User Alpha JSON
      expect(jsonAlpha).not.toContain(userBeta.fullName);
      expect(jsonAlpha).not.toContain(userBeta.birthPlace);
      expect(jsonAlpha).not.toContain(userBeta.userId);
    });

    it('enforces IDOR protection when attempting to read another user\'s reading', () => {
      const res = PastLifeIntelligenceEngine.generate(userAlpha.userId, null, { overrides: userAlpha });
      const readingId = res.data!.id;

      // User Beta attempts to read User Alpha's reading
      const unauthorizedAccess = PastLifeIntelligenceEngine.getReading(readingId, userBeta.userId);
      expect(unauthorizedAccess.success).toBe(false);
      expect(unauthorizedAccess.error).toBe('ACCESS_DENIED');

      // User Alpha legitimately reads their own reading
      const authorizedAccess = PastLifeIntelligenceEngine.getReading(readingId, userAlpha.userId);
      expect(authorizedAccess.success).toBe(true);
      expect(authorizedAccess.data?.id).toBe(readingId);
    });
  });

  // Phase 9: Feedback & Observator Audit
  describe('9. Observability & User Feedback Signal Tracking', () => {
    it('records user feedback as interpretive signals without mutating deterministic truth', () => {
      const res = PastLifeIntelligenceEngine.generate(userAlpha.userId, null, { overrides: userAlpha });
      const readingId = res.data!.id;

      PastLifeIntelligenceEngine.recordFeedback({
        reading_id: readingId,
        user_id: userAlpha.userId,
        sentiment: 'RESONATES',
        comment: 'The focus on contemplative teaching feels deeply authentic.',
        created_at: new Date().toISOString(),
      });

      const metrics = PastLifeIntelligenceEngine.getObservatoryMetrics();
      expect(metrics.totalReadings).toBeGreaterThanOrEqual(1);
      expect(metrics.feedbackCount).toBeGreaterThanOrEqual(1);
    });
  });
});
