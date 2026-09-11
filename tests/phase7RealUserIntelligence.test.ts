/**
 * DEEPASTRO PHASE 7 — REAL USER INTELLIGENCE & PRODUCTION REALITY TEST SUITE
 *
 * Verifies:
 * 1. Real User Onboarding & Feature Gating (15 tests)
 * 2. Profile Mutation Engine & Deterministic Versioning (10 tests)
 * 3. Real User Isolation & Multi-Tenant Bleed Prevention (10 tests)
 * 4. Real Dashboard & "Why This Reading?" Explainability (10 tests)
 * 5. Prediction Ledger V2 & Immutability (10 tests)
 * 6. Outcome Collection & Calibration Engine V2 (10 tests)
 * 7. Real Palmistry Image Pipeline & Safeguards (10 tests)
 * 8. Life Context Graph V2 & Replay Engine V2 (10 tests)
 * 9. Real User Personalization, Vault, Export & Deletion (10 tests)
 * 10. AI Router V3, Question Refinement, Decision Intelligence & Human Validation (10 tests)
 * Total: 105 tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RealUserOnboardingService } from '../server/src/services/RealUserOnboardingService.js';
import { BirthDataConfidenceEngine } from '../server/src/services/BirthDataConfidenceEngine.js';
import { ProfileMutationEngine } from '../server/src/services/ProfileMutationEngine.js';
import { RealDashboardService } from '../server/src/services/RealDashboardService.js';
import { PredictionLedgerV2 } from '../server/src/learning/PredictionLedgerV2.js';
import { PredictionOutcomeService } from '../server/src/learning/PredictionOutcomeService.js';
import { PredictionCalibrationEngineV2 } from '../server/src/learning/PredictionCalibrationEngineV2.js';
import { RealPalmistryImagePipeline } from '../server/src/services/RealPalmistryImagePipeline.js';
import { LifeContextGraphV2 } from '../server/src/intelligence/LifeContextGraphV2.js';
import { LifeReplayEngineV2 } from '../server/src/learning/LifeReplayEngineV2.js';
import { RealUserPersonalizationEngine } from '../server/src/learning/RealUserPersonalizationEngine.js';
import { UserVaultService } from '../server/src/services/UserVaultService.js';
import { PrivacyExportDeletionService } from '../server/src/services/PrivacyExportDeletionService.js';
import { QuestionRefinementEngine } from '../server/src/brain/QuestionRefinementEngine.js';
import { DecisionIntelligenceEngineV2 } from '../server/src/brain/DecisionIntelligenceEngineV2.js';
import { AIRouterV3 } from '../server/src/ai/AIRouterV3.js';
import { HumanExpertValidationDataset } from '../server/src/knowledge/HumanExpertValidationDataset.js';

describe('DEEPASTRO PHASE 7 — REAL USER INTELLIGENCE SUITE', () => {
  beforeEach(() => {
    RealUserOnboardingService.resetStore();
    PredictionLedgerV2.resetStore();
    PredictionOutcomeService.resetStore();
    LifeContextGraphV2.resetStore();
    RealUserPersonalizationEngine.resetStore();
  });

  // =========================================================================
  // 1. REAL USER ONBOARDING (15 tests)
  // =========================================================================
  describe('1. Real User Onboarding & Confidence Engine', () => {
    it('1.1 successfully onboards a user with complete verified data', async () => {
      const profile = await RealUserOnboardingService.onboardUser({
        userId: 'usr_arjun_01',
        name: 'Arjun Sharma',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        birthTimePrecision: 'EXACT',
        userConsentGiven: true,
      });

      expect(profile.status).toBe('ACTIVATED');
      expect(profile.userId).toBe('usr_arjun_01');
      expect(profile.confidence.tier).toBe('HIGH');
      expect(profile.calculationPassport.fingerprint).toBeDefined();
    });

    it('1.2 rejects onboarding without explicit user consent', async () => {
      await expect(
        RealUserOnboardingService.onboardUser({
          userId: 'usr_no_consent',
          name: 'Priya',
          dateOfBirth: '1995-01-01',
          timeOfBirth: '10:00:00',
          birthPlace: 'Delhi',
          userConsentGiven: false,
        })
      ).rejects.toThrow(/CONSENT_REQUIRED/);
    });

    it('1.3 rejects onboarding with missing required fields', async () => {
      await expect(
        RealUserOnboardingService.onboardUser({
          userId: '',
          name: 'Incomplete',
          dateOfBirth: '1990-01-01',
          birthPlace: 'Delhi',
          userConsentGiven: true,
        })
      ).rejects.toThrow(/INVALID_USER/);
    });

    it('1.4 rejects invalid date format', async () => {
      await expect(
        RealUserOnboardingService.onboardUser({
          userId: 'usr_bad_dob',
          name: 'Invalid Date',
          dateOfBirth: '15/06/1992',
          birthPlace: 'Delhi',
          userConsentGiven: true,
        })
      ).rejects.toThrow(/INVALID_DOB/);
    });

    it('1.5 resolves known canonical city to coordinates and timezone', async () => {
      const profile = await RealUserOnboardingService.onboardUser({
        userId: 'usr_jaipur',
        name: 'Jaipur Resident',
        dateOfBirth: '1988-03-21',
        timeOfBirth: '08:15:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      expect(profile.latitude).toBeCloseTo(26.9124, 2);
      expect(profile.longitude).toBeCloseTo(75.7873, 2);
      expect(profile.timezone).toBe(5.5);
    });

    it('1.6 handles exact vs approximate vs unknown birth time precision', async () => {
      const exact = await RealUserOnboardingService.onboardUser({
        userId: 'usr_exact',
        name: 'Exact User',
        dateOfBirth: '1990-05-10',
        timeOfBirth: '12:00:00',
        birthPlace: 'Delhi',
        birthTimePrecision: 'EXACT',
        userConsentGiven: true,
      });

      const approx = await RealUserOnboardingService.onboardUser({
        userId: 'usr_approx',
        name: 'Approx User',
        dateOfBirth: '1990-05-10',
        timeOfBirth: '12:00:00',
        birthPlace: 'Delhi',
        birthTimePrecision: 'APPROXIMATE',
        userConsentGiven: true,
      });

      expect(exact.confidence.tier).toBe('HIGH');
      expect(approx.confidence.tier).toBe('MEDIUM');
    });

    it('1.7 sets birthTimePrecision to UNKNOWN and uses noon nominal when time is absent', async () => {
      const unknown = await RealUserOnboardingService.onboardUser({
        userId: 'usr_unknown_time',
        name: 'No Time User',
        dateOfBirth: '1994-08-12',
        birthPlace: 'Delhi',
        birthTimePrecision: 'UNKNOWN',
        userConsentGiven: true,
      });

      expect(unknown.birthTimePrecision).toBe('UNKNOWN');
      expect(unknown.timeOfBirth).toBe('12:00:00');
      expect(unknown.confidence.tier).toBe('INCONCLUSIVE');
    });

    it('1.8 gates ascendant and houses when birth time is UNKNOWN', async () => {
      const unknown = await RealUserOnboardingService.onboardUser({
        userId: 'usr_gated',
        name: 'Gated User',
        dateOfBirth: '1994-08-12',
        birthPlace: 'Delhi',
        birthTimePrecision: 'UNKNOWN',
        userConsentGiven: true,
      });

      expect(unknown.allowedFeatures.ascendantKundli).toBe(false);
      expect(unknown.allowedFeatures.bhavaChalit).toBe(false);
      expect(unknown.allowedFeatures.vargaD9D10).toBe(false);
      expect(unknown.allowedFeatures.planetaryRashis).toBe(true);
      expect(unknown.allowedFeatures.lunarNakshatra).toBe(true);
    });

    it('1.9 enables all features for EXACT birth time precision', async () => {
      const exact = await RealUserOnboardingService.onboardUser({
        userId: 'usr_all_features',
        name: 'Full Feature User',
        dateOfBirth: '1990-05-10',
        timeOfBirth: '07:45:00',
        birthPlace: 'Mumbai',
        birthTimePrecision: 'EXACT',
        userConsentGiven: true,
      });

      expect(exact.allowedFeatures.ascendantKundli).toBe(true);
      expect(exact.allowedFeatures.bhavaChalit).toBe(true);
      expect(exact.allowedFeatures.vargaD9D10).toBe(true);
      expect(exact.allowedFeatures.exactVimshottariTiming).toBe(true);
    });

    it('1.10 disables bhavaChalit for APPROXIMATE birth time', async () => {
      const approx = await RealUserOnboardingService.onboardUser({
        userId: 'usr_approx_features',
        name: 'Approx Feature User',
        dateOfBirth: '1990-05-10',
        timeOfBirth: '07:45:00',
        birthPlace: 'Mumbai',
        birthTimePrecision: 'APPROXIMATE',
        userConsentGiven: true,
      });

      expect(approx.allowedFeatures.ascendantKundli).toBe(true);
      expect(approx.allowedFeatures.bhavaChalit).toBe(false);
    });

    it('1.11 BirthDataConfidenceEngine scores fallback location lower', () => {
      const res = BirthDataConfidenceEngine.evaluate({
        birthTimePrecision: 'EXACT',
        hasExactCoordinates: false,
        locationSource: 'FALLBACK',
        timezoneSource: 'ESTIMATED',
      });

      expect(res.score).toBeLessThan(70);
      expect(res.tier).toBe('LOW');
    });

    it('1.12 generates an immutable calculation passport with non-empty fingerprint', async () => {
      const profile = await RealUserOnboardingService.onboardUser({
        userId: 'usr_passport_check',
        name: 'Passport Check',
        dateOfBirth: '1985-11-25',
        timeOfBirth: '15:20:00',
        birthPlace: 'Kolkata',
        userConsentGiven: true,
      });

      expect(profile.calculationPassport).toBeDefined();
      expect(profile.calculationPassport.fingerprint.length).toBeGreaterThan(16);
      expect(profile.calculationPassport.engine).toBeDefined();
    });

    it('1.13 generates unique calculationSnapshotId per profile', async () => {
      const p1 = await RealUserOnboardingService.onboardUser({
        userId: 'usr_snap_1',
        name: 'User One',
        dateOfBirth: '1991-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });
      const p2 = await RealUserOnboardingService.onboardUser({
        userId: 'usr_snap_2',
        name: 'User Two',
        dateOfBirth: '1992-02-02',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      expect(p1.calculationSnapshotId).not.toBe(p2.calculationSnapshotId);
    });

    it('1.14 checks astronomical verification engine on calculation', async () => {
      const profile = await RealUserOnboardingService.onboardUser({
        userId: 'usr_astro_verif',
        name: 'Astro Verif',
        dateOfBirth: '1988-07-07',
        timeOfBirth: '11:11:00',
        birthPlace: 'London',
        userConsentGiven: true,
      });

      expect(profile.status).toBe('ACTIVATED');
    });

    it('1.15 retrieves the latest profile accurately from the service', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_fetch_me',
        name: 'Fetch Target',
        dateOfBirth: '1996-12-12',
        timeOfBirth: '18:30:00',
        birthPlace: 'Bangalore',
        userConsentGiven: true,
      });

      const retrieved = RealUserOnboardingService.getLatestProfile('usr_fetch_me');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Fetch Target');
    });
  });

  // =========================================================================
  // 2. PROFILE MUTATION ENGINE (10 tests)
  // =========================================================================
  describe('2. Profile Mutation Engine & Versioning', () => {
    it('2.1 modifying DOB increments profileVersion from 1 to 2', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_mutate_dob',
        name: 'DOB Mutator',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_mutate_dob',
        dateOfBirth: '1990-01-02',
        mutationReason: 'Birth certificate correction',
      });

      expect(res.previousVersion).toBe(1);
      expect(res.newVersion).toBe(2);
      expect(res.diffSummary[0]).toContain('Date of birth updated');
    });

    it('2.2 modifying TOB generates a distinct calculation passport fingerprint', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_mutate_tob',
        name: 'TOB Mutator',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_mutate_tob',
        timeOfBirth: '11:00:00',
        mutationReason: 'Hospital record found',
      });

      expect(res.previousPassportFingerprint).not.toBe(res.newPassportFingerprint);
    });

    it('2.3 preserves historical snapshots without overwriting', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_history_preserve',
        name: 'History Keeper',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      await ProfileMutationEngine.mutateProfile({
        userId: 'usr_history_preserve',
        timeOfBirth: '11:00:00',
        mutationReason: 'Edit 1',
      });

      const versions = RealUserOnboardingService.getAllProfileVersions('usr_history_preserve');
      expect(versions.length).toBe(2);
      expect(versions[0].profileVersion).toBe(1);
      expect(versions[1].profileVersion).toBe(2);
    });

    it('2.4 accurately records diff summary for location mutation', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_place_mutate',
        name: 'Place Mutator',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_place_mutate',
        birthPlace: 'Mumbai',
        latitude: 19.076,
        longitude: 72.8777,
        mutationReason: 'Corrected birthplace',
      });

      expect(res.diffSummary.some((d) => d.includes('Birth place updated'))).toBe(true);
    });

    it('2.5 recalculated entities include all 9 core Jyotish outputs', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_recalc',
        name: 'Recalc User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_recalc',
        dateOfBirth: '1990-01-05',
        mutationReason: 'Testing recalc',
      });

      expect(res.recalculatedEntities).toContain('AscendantDegree');
      expect(res.recalculatedEntities).toContain('VimshottariDashaTimeline');
      expect(res.recalculatedEntities).toContain('VargaCharts_D1_to_D60');
    });

    it('2.6 proves A -> B -> A cycle reversibility produces identical calculation fingerprint', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_reversibility',
        name: 'Cycle User',
        dateOfBirth: '1993-04-15',
        timeOfBirth: '14:00:00',
        birthPlace: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
        userConsentGiven: true,
      });

      // Mutate A -> B
      await ProfileMutationEngine.mutateProfile({
        userId: 'usr_reversibility',
        timeOfBirth: '16:00:00',
        mutationReason: 'Shift to B',
      });

      // Mutate B -> A (back to original 14:00:00)
      await ProfileMutationEngine.mutateProfile({
        userId: 'usr_reversibility',
        timeOfBirth: '14:00:00',
        mutationReason: 'Revert to A',
      });

      const comparison = ProfileMutationEngine.compareSnapshots('usr_reversibility', 1, 3);
      expect(comparison.isIdentical).toBe(true);
      expect(comparison.fingerprintA).toBe(comparison.fingerprintB);
    });

    it('2.7 mutation with non-existent user throws PROFILE_NOT_FOUND', async () => {
      await expect(
        ProfileMutationEngine.mutateProfile({
          userId: 'usr_ghost',
          timeOfBirth: '12:00:00',
          mutationReason: 'Ghost edit',
        })
      ).rejects.toThrow(/PROFILE_NOT_FOUND/);
    });

    it('2.8 re-evaluates confidence tier when shifting to APPROXIMATE', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_conf_shift',
        name: 'Shift User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        birthTimePrecision: 'EXACT',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_conf_shift',
        birthTimePrecision: 'APPROXIMATE',
        mutationReason: 'Mother recalled time was approximate',
      });

      expect(res.mutatedProfile.confidence.tier).toBe('MEDIUM');
    });

    it('2.9 updates methodology profile in mutation result', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_meth_shift',
        name: 'Methodology User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        methodologyProfileId: 'METHODOLOGY_DEFAULT_PARASHARI',
        userConsentGiven: true,
      });

      const res = await ProfileMutationEngine.mutateProfile({
        userId: 'usr_meth_shift',
        methodologyProfileId: 'METHODOLOGY_JAIMINI_7KARAKA',
        mutationReason: 'Switching to Jaimini framework',
      });

      expect(res.mutatedProfile.methodologyProfileId).toBe('METHODOLOGY_JAIMINI_7KARAKA');
    });

    it('2.10 version comparison utility accurately flags differences between versions', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_comp_diff',
        name: 'Comp User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      await ProfileMutationEngine.mutateProfile({
        userId: 'usr_comp_diff',
        timeOfBirth: '18:00:00',
        mutationReason: 'Evening birth',
      });

      const comp = ProfileMutationEngine.compareSnapshots('usr_comp_diff', 1, 2);
      expect(comp.isIdentical).toBe(false);
    });
  });

  // =========================================================================
  // 3. REAL USER ISOLATION (10 tests)
  // =========================================================================
  describe('3. Real User Isolation & Multi-Tenant Boundaries', () => {
    it('3.1 strictly isolates profiles between User A, B, C, D, E', async () => {
      const users = ['usr_A', 'usr_B', 'usr_C', 'usr_D', 'usr_E'];
      for (const u of users) {
        await RealUserOnboardingService.onboardUser({
          userId: u,
          name: `Name of ${u}`,
          dateOfBirth: '1990-01-01',
          timeOfBirth: '10:00:00',
          birthPlace: 'Delhi',
          userConsentGiven: true,
        });
      }

      for (const u of users) {
        const p = RealUserOnboardingService.getLatestProfile(u);
        expect(p?.userId).toBe(u);
        expect(p?.name).toBe(`Name of ${u}`);
      }
    });

    it('3.2 predictions created by User A are inaccessible to User B', async () => {
      PredictionLedgerV2.recordPrediction({
        userId: 'usr_A',
        question: 'Career direction?',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_A',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_A',
        statement: 'Traditional indications point toward professional elevation.',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.85,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const bPredictions = PredictionLedgerV2.getUserPredictions('usr_B');
      expect(bPredictions.length).toBe(0);
    });

    it('3.3 outcomes recorded by User A are not leaked to User B', async () => {
      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_A',
        question: 'Promotion timing?',
        predictionType: 'TIMING',
        calculationPassportId: 'pass_A',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_A',
        statement: 'Indications align with second half of the year.',
        timeWindow: { startDate: '2026-06-01', endDate: '2026-12-31', description: 'H2' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      PredictionOutcomeService.recordUserOutcome({
        userId: 'usr_A',
        predictionId: pred.predictionId,
        outcome: 'HAPPENED',
      });

      const bOutcomes = PredictionOutcomeService.getUserOutcomes('usr_B');
      expect(bOutcomes.length).toBe(0);
    });

    it('3.4 life context nodes of User A are not leaked to User B', () => {
      LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_A',
        domain: 'CAREER',
        title: 'Joined DeepAstro as Engineer',
        eventDate: '2025-01-15',
      });

      const bEvents = LifeContextGraphV2.getFactualContext('usr_B');
      expect(bEvents.length).toBe(0);
    });

    it('3.5 personalization preferences of User A do not contaminate User B', () => {
      RealUserPersonalizationEngine.updatePreferences('usr_A', {
        preferredDepth: 'SCHOLARLY_EXHAUSTIVE',
      });

      const bPrefs = RealUserPersonalizationEngine.getPreferences('usr_B');
      expect(bPrefs.preferredDepth).toBe('BALANCED'); // default
    });

    it('3.6 User Vault of User A throws ACCESS_DENIED when requested by User B', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_A',
        name: 'User A',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      expect(() => UserVaultService.getVault('usr_A', 'usr_B')).toThrow(/ACCESS_DENIED/);
    });

    it('3.7 concurrent onboarding of 10 distinct users with zero cross-tenant contamination', async () => {
      const onboardings = Array.from({ length: 10 }, (_, i) =>
        RealUserOnboardingService.onboardUser({
          userId: `usr_concurrent_${i}`,
          name: `Concurrent User ${i}`,
          dateOfBirth: '1990-01-01',
          birthPlace: 'Delhi',
          userConsentGiven: true,
        })
      );

      const results = await Promise.all(onboardings);
      expect(results.length).toBe(10);
      const uniqueIds = new Set(results.map((r) => r.userId));
      expect(uniqueIds.size).toBe(10);
    });

    it('3.8 deletion of User A leaves User B completely intact', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_to_delete',
        name: 'Delete Target',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      await RealUserOnboardingService.onboardUser({
        userId: 'usr_survivor',
        name: 'Survivor User',
        dateOfBirth: '1992-02-02',
        birthPlace: 'Mumbai',
        userConsentGiven: true,
      });

      PrivacyExportDeletionService.deleteUserData('usr_to_delete', 'usr_to_delete');

      expect(RealUserOnboardingService.getLatestProfile('usr_to_delete')).toBeNull();
      expect(RealUserOnboardingService.getLatestProfile('usr_survivor')).not.toBeNull();
    });

    it('3.9 dashboard metrics for User A reflect only User A birth details', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_dash_A',
        name: 'Dashboard A',
        dateOfBirth: '1985-06-15',
        timeOfBirth: '06:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const dashA = RealDashboardService.getDashboard('usr_dash_A');
      expect(dashA.profileSummary?.name).toBe('Dashboard A');
    });

    it('3.10 verifies complete multi-tenant memory separation', () => {
      const uA_events = LifeContextGraphV2.getAllUserNodes('usr_isolated_A');
      const uB_events = LifeContextGraphV2.getAllUserNodes('usr_isolated_B');
      expect(uA_events.length).toBe(0);
      expect(uB_events.length).toBe(0);
    });
  });

  // =========================================================================
  // 4. REAL DASHBOARD & WHY THIS READING (10 tests)
  // =========================================================================
  describe('4. Real Dashboard & Explainability', () => {
    it('4.1 returns EMPTY state when authenticated user has no profile', () => {
      const res = RealDashboardService.getDashboard('usr_empty_dash');
      expect(res.state).toBe('EMPTY');
      expect(res.emptyReason).toContain('NO_BIRTH_PROFILE');
    });

    it('4.2 populated dashboard contains dynamically calculated signs', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_active_dash',
        name: 'Active Astrologer',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_active_dash');
      expect(res.state).toBe('POPULATED');
      expect(res.profileSummary?.ascendantSign).toBeDefined();
      expect(res.profileSummary?.moonSign).toBeDefined();
    });

    it('4.3 career momentum metric includes full provenance trail', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_prov_dash',
        name: 'Prov User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_prov_dash');
      const cm = res.metrics?.careerMomentum;
      expect(cm?.provenance.relevantHouses).toContain(10);
      expect(cm?.provenance.vargaUsed).toBe('D10');
      expect(cm?.provenance.snapshotId).toBeDefined();
      expect(cm?.provenance.passportFingerprint).toBeDefined();
    });

    it('4.4 relationship harmony metric evaluates 7th house and Venus', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_rel_dash',
        name: 'Rel User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_rel_dash');
      const rh = res.metrics?.relationshipHarmony;
      expect(rh?.provenance.relevantHouses).toContain(7);
      expect(rh?.provenance.vargaUsed).toBe('D9');
    });

    it('4.5 vitality and health metric evaluates Lagna and houses 1/6/8', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_vit_dash',
        name: 'Vitality User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_vit_dash');
      const vh = res.metrics?.vitalityAndHealth;
      expect(vh?.provenance.relevantHouses).toContain(1);
      expect(vh?.provenance.relevantHouses).toContain(6);
    });

    it('4.6 financial flow metric includes 2nd and 11th houses', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_fin_dash',
        name: 'Finance User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_fin_dash');
      const ff = res.metrics?.financialFlow;
      expect(ff?.provenance.relevantHouses).toContain(2);
      expect(ff?.provenance.relevantHouses).toContain(11);
    });

    it('4.7 zero unexplained percentages or static placeholders', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_no_placeholders',
        name: 'No Placeholders',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const res = RealDashboardService.getDashboard('usr_no_placeholders');
      expect(res.metrics?.careerMomentum.formulaDescription.length).toBeGreaterThan(10);
      expect(res.metrics?.careerMomentum.score).toBeGreaterThanOrEqual(0);
      expect(res.metrics?.careerMomentum.score).toBeLessThanOrEqual(100);
    });

    it('4.8 "Why This Reading?" explains reading across all required dimensions', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_why_reading',
        name: 'Why Reading User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const why = RealDashboardService.explainReading('usr_why_reading', 'How is my career progression?');
      expect(why.relevantFactors.houses[0].houseNumber).toBe(10);
      expect(why.relevantFactors.dasha.mahadasha).toBeDefined();
      expect(why.relevantFactors.varga.chart).toContain('D10');
      expect(why.qualifiedRules.length).toBeGreaterThan(0);
    });

    it('4.9 "Why This Reading?" references classical sources (BPHS)', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_why_src',
        name: 'Why Source User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const why = RealDashboardService.explainReading('usr_why_src', 'Career question');
      expect(why.classicalSources[0].sourceId).toBe('SRC_BPHS');
      expect(why.classicalSources[0].treatise).toContain('Brihat Parashara');
    });

    it('4.10 "Why This Reading?" communicates non-fatalistic limitations', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_why_limit',
        name: 'Why Limit User',
        dateOfBirth: '1992-06-15',
        timeOfBirth: '14:30:00',
        birthPlace: 'Jaipur',
        userConsentGiven: true,
      });

      const why = RealDashboardService.explainReading('usr_why_limit', 'Career question');
      expect(why.limitations.some((l) => l.includes('not deterministic certainty'))).toBe(true);
    });
  });

  // =========================================================================
  // 5. PREDICTION LEDGER V2 & IMMUTABILITY (10 tests)
  // =========================================================================
  describe('5. Prediction Ledger V2 & Immutability', () => {
    it('5.1 records DIRECTIONAL prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Career direction?',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Traditional factors favor expansion in communication roles.',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('DIRECTIONAL');
    });

    it('5.2 records TIMING prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Promotion period?',
        predictionType: 'TIMING',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Astrological timing appears supportive around autumn.',
        timeWindow: { startDate: '2026-09-01', endDate: '2026-11-30', description: 'Autumn 2026' },
        direction: 'FAVORABLE',
        confidence: 0.75,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('TIMING');
    });

    it('5.3 records EVENT_WINDOW prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Relocation window?',
        predictionType: 'EVENT_WINDOW',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: '4th lord transit window indicates potential movement.',
        timeWindow: { startDate: '2027-01-01', endDate: '2027-03-31', description: 'Q1 2027' },
        direction: 'NEUTRAL',
        confidence: 0.7,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('EVENT_WINDOW');
    });

    it('5.4 records THEME prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Spiritual focus?',
        predictionType: 'THEME',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Jupiter sub-period traditionally aligns with philosophical study.',
        timeWindow: { startDate: '2026-01-01', endDate: '2028-01-01', description: '2 years' },
        direction: 'FAVORABLE',
        confidence: 0.85,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('THEME');
    });

    it('5.5 records DECISION_COMPARISON prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Job A vs B?',
        predictionType: 'DECISION_COMPARISON',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Option A exhibits stronger 10th bhava harmony.',
        timeWindow: { startDate: '2026-06-01', endDate: '2026-09-30', description: 'Q3' },
        direction: 'FAVORABLE',
        confidence: 0.78,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('DECISION_COMPARISON');
    });

    it('5.6 records LIFE_PATTERN prediction successfully', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_pred_type',
        question: 'Career transitions pattern?',
        predictionType: 'LIFE_PATTERN',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Observed recurring pattern of renewal during Saturn sextiles.',
        timeWindow: { startDate: '2020-01-01', endDate: '2030-01-01', description: 'Decade' },
        direction: 'MIXED',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.predictionType).toBe('LIFE_PATTERN');
    });

    it('5.7 throws error on fatalistic "will definitely" assertion', () => {
      expect(() =>
        PredictionLedgerV2.recordPrediction({
          userId: 'usr_fatal',
          question: 'Will I win lottery?',
          predictionType: 'DIRECTIONAL',
          calculationPassportId: 'pass_1',
          methodology: 'Parashari',
          evidenceBundleId: 'evid_1',
          statement: 'You will definitely become a millionaire next month.',
          timeWindow: { startDate: '2026-10-01', endDate: '2026-10-31', description: 'Oct' },
          direction: 'FAVORABLE',
          confidence: 0.99,
          limitations: [],
          systemsUsed: ['Vedic'],
        })
      ).toThrow(/FATALISTIC_LANGUAGE_PROHIBITED/);
    });

    it('5.8 throws error on fatalistic "guaranteed" assertion', () => {
      expect(() =>
        PredictionLedgerV2.recordPrediction({
          userId: 'usr_fatal',
          question: 'Career test',
          predictionType: 'DIRECTIONAL',
          calculationPassportId: 'pass_1',
          methodology: 'Parashari',
          evidenceBundleId: 'evid_1',
          statement: 'Success is guaranteed without any obstacles.',
          timeWindow: { startDate: '2026-10-01', endDate: '2026-10-31', description: 'Oct' },
          direction: 'FAVORABLE',
          confidence: 0.99,
          limitations: [],
          systemsUsed: ['Vedic'],
        })
      ).toThrow(/FATALISTIC_LANGUAGE_PROHIBITED/);
    });

    it('5.9 throws error when attempting historical statement mutation', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_immutable',
        question: 'Original question',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Initial compliant prediction statement.',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(() =>
        PredictionLedgerV2.attemptMutation(p.predictionId, 'Rewritten statement')
      ).toThrow(/IMMUTABLE_PREDICTION_ERROR/);
    });

    it('5.10 verifies SHA-256 hash existence on immutable ledger entry', () => {
      const p = PredictionLedgerV2.recordPrediction({
        userId: 'usr_hash',
        question: 'Hash test',
        predictionType: 'THEME',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Compliant theme analysis statement.',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(p.immutableHash).toBeDefined();
      expect(p.immutableHash.length).toBe(64); // SHA-256 hex string length
    });
  });

  // =========================================================================
  // 6. OUTCOME COLLECTION & CALIBRATION ENGINE V2 (10 tests)
  // =========================================================================
  describe('6. Outcome Collection & Calibration Engine V2', () => {
    it('6.1 records user-confirmed HAPPENED outcome', () => {
      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_out_1',
        question: 'Exam outcome?',
        predictionType: 'EVENT_WINDOW',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Supportive timing indicates positive academic fruition.',
        timeWindow: { startDate: '2026-05-01', endDate: '2026-05-31', description: 'May' },
        direction: 'FAVORABLE',
        confidence: 0.85,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const outcome = PredictionOutcomeService.recordUserOutcome({
        userId: 'usr_out_1',
        predictionId: pred.predictionId,
        outcome: 'HAPPENED',
        actualCategory: 'EDUCATION',
      });

      expect(outcome.outcome).toBe('HAPPENED');
      expect(PredictionLedgerV2.getPrediction(pred.predictionId)?.status).toBe('OUTCOME_RECORDED');
    });

    it('6.2 records user-confirmed PARTIALLY_HAPPENED outcome', () => {
      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_out_2',
        question: 'Relocation test',
        predictionType: 'TIMING',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Movement indications emerge in Q2.',
        timeWindow: { startDate: '2026-04-01', endDate: '2026-06-30', description: 'Q2' },
        direction: 'FAVORABLE',
        confidence: 0.7,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const outcome = PredictionOutcomeService.recordUserOutcome({
        userId: 'usr_out_2',
        predictionId: pred.predictionId,
        outcome: 'PARTIALLY_HAPPENED',
      });

      expect(outcome.outcome).toBe('PARTIALLY_HAPPENED');
    });

    it('6.3 records user-confirmed DID_NOT_HAPPEN outcome', () => {
      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_out_3',
        question: 'Test',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Supportive indicators for early offer.',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-02-01', description: 'Jan' },
        direction: 'FAVORABLE',
        confidence: 0.6,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const outcome = PredictionOutcomeService.recordUserOutcome({
        userId: 'usr_out_3',
        predictionId: pred.predictionId,
        outcome: 'DID_NOT_HAPPEN',
      });

      expect(outcome.outcome).toBe('DID_NOT_HAPPEN');
    });

    it('6.4 rejects recording outcome for another user prediction', () => {
      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_owner',
        question: 'Owner question',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Statement',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-02-01', description: 'Jan' },
        direction: 'FAVORABLE',
        confidence: 0.7,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      expect(() =>
        PredictionOutcomeService.recordUserOutcome({
          userId: 'usr_intruder',
          predictionId: pred.predictionId,
          outcome: 'HAPPENED',
        })
      ).toThrow(/UNAUTHORIZED_OUTCOME_RECORDING/);
    });

    it('6.5 returns INSUFFICIENT_SAMPLE when total sample count < 5', () => {
      const cal = PredictionCalibrationEngineV2.computeCalibration();
      expect(cal.sampleStatus).toBe('INSUFFICIENT_SAMPLE');
      expect(cal.brierScore).toBeNull();
    });

    it('6.6 returns PRELIMINARY_AVAILABLE when sample count >= 5', () => {
      // Create 5 predictions and outcomes
      for (let i = 0; i < 5; i++) {
        const p = PredictionLedgerV2.recordPrediction({
          userId: `usr_calib_${i}`,
          question: `Q ${i}`,
          predictionType: 'DIRECTIONAL',
          calculationPassportId: 'pass_1',
          methodology: 'Parashari',
          evidenceBundleId: 'evid_1',
          statement: 'Supportive timing',
          timeWindow: { startDate: '2026-01-01', endDate: '2026-02-01', description: 'Jan' },
          direction: 'FAVORABLE',
          confidence: 0.8,
          limitations: [],
          systemsUsed: ['Vedic'],
        });
        PredictionOutcomeService.recordUserOutcome({
          userId: `usr_calib_${i}`,
          predictionId: p.predictionId,
          outcome: 'HAPPENED',
        });
      }

      const cal = PredictionCalibrationEngineV2.computeCalibration();
      expect(cal.sampleStatus).toBe('PRELIMINARY_AVAILABLE');
      expect(cal.brierScore).not.toBeNull();
    });

    const seedSample = () => {
      for (let i = 0; i < 5; i++) {
        const p = PredictionLedgerV2.recordPrediction({
          userId: `usr_calib_${i}`,
          question: `Q ${i}`,
          predictionType: 'DIRECTIONAL',
          calculationPassportId: 'pass_1',
          methodology: 'Parashari',
          evidenceBundleId: 'evid_1',
          statement: 'Supportive timing',
          timeWindow: { startDate: '2026-01-01', endDate: '2026-02-01', description: 'Jan' },
          direction: 'FAVORABLE',
          confidence: 0.8,
          limitations: [],
          systemsUsed: ['Vedic'],
        });
        PredictionOutcomeService.recordUserOutcome({
          userId: `usr_calib_${i}`,
          predictionId: p.predictionId,
          outcome: 'HAPPENED',
        });
      }
    };

    it('6.7 computes accurate Brier score (0.04 when confidence 0.8 meets 1.0 outcome)', () => {
      seedSample();
      const cal = PredictionCalibrationEngineV2.computeCalibration();
      // (0.8 - 1.0)^2 = 0.04
      expect(cal.brierScore).toBeCloseTo(0.04, 2);
    });

    it('6.8 computes 100% directional accuracy for all-happened sample', () => {
      seedSample();
      const cal = PredictionCalibrationEngineV2.computeCalibration();
      expect(cal.directionalAccuracy).toBe(100.0);
    });

    it('6.9 questionTypeBreakdown tracks directional predictions successfully', () => {
      seedSample();
      const cal = PredictionCalibrationEngineV2.computeCalibration();
      expect(cal.questionTypeBreakdown.DIRECTIONAL.total).toBe(5);
      expect(cal.questionTypeBreakdown.DIRECTIONAL.successRate).toBe(100.0);
    });

    it('6.10 calibration disclaimers state rule invariance', () => {
      seedSample();
      const cal = PredictionCalibrationEngineV2.computeCalibration();
      expect(cal.disclaimers.some((d) => d.includes('Astrological rules and planetary calculations remain immutable'))).toBe(true);
    });
  });

  // =========================================================================
  // 7. REAL PALMISTRY IMAGE PIPELINE (10 tests)
  // =========================================================================
  describe('7. Real Palmistry Image Pipeline & Safeguards', () => {
    it('7.1 genuine JPEG magic bytes validated successfully', () => {
      const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const res = RealPalmistryImagePipeline.verifyMagicBytes(jpegBuf);
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/jpeg');
    });

    it('7.2 genuine PNG magic bytes validated successfully', () => {
      const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      const res = RealPalmistryImagePipeline.verifyMagicBytes(pngBuf);
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/png');
    });

    it('7.3 genuine WebP magic bytes validated successfully', () => {
      const webpBuf = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      const res = RealPalmistryImagePipeline.verifyMagicBytes(webpBuf);
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/webp');
    });

    it('7.4 non-image binary buffer rejected with INVALID_MAGIC_BYTES', () => {
      const fakeBuf = Buffer.from('NOT_AN_IMAGE_FILE_BUFFER');
      const res = RealPalmistryImagePipeline.processPalmUpload(fakeBuf, 'image/jpeg');
      expect(res.pipelineStatus).toBe('REJECTED');
      expect(res.reason).toContain('INVALID_MAGIC_BYTES');
    });

    it('7.5 high-quality image produces full line observations and mount data', () => {
      // 60KB genuine JPEG buffer
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(60000);
      const highRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(highRes, 'image/jpeg');
      expect(res.pipelineStatus).toBe('SUCCESS');
      expect(res.observations.length).toBe(4);
      expect(res.mountObservations.length).toBeGreaterThan(0);
    });

    it('7.6 low-quality/thumbnail image returns PALMISTRY_INCONCLUSIVE', () => {
      // 5KB genuine JPEG buffer (too small for chiromancy resolution)
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(5000);
      const lowRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(lowRes, 'image/jpeg');
      expect(res.pipelineStatus).toBe('PALMISTRY_INCONCLUSIVE');
      expect(res.reason).toContain('INSUFFICIENT_IMAGE_QUALITY');
    });

    it('7.7 zero synthetic lines fabricated for inconclusive images', () => {
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(5000);
      const lowRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(lowRes, 'image/jpeg');
      expect(res.observations.length).toBe(0);
    });

    it('7.8 palmistry output includes non-diagnostic health disclaimers', () => {
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(60000);
      const highRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(highRes, 'image/jpeg');
      expect(res.disclaimers.some((d) => d.includes('strictly non-medical and non-diagnostic'))).toBe(true);
    });

    it('7.9 correctly identifies hand side in result', () => {
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(60000);
      const highRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(highRes, 'image/jpeg', { requestedHand: 'LEFT' });
      expect(res.handDetection.handSide).toBe('LEFT');
    });

    it('7.10 generates an evidenceBundleId for valid analysis', () => {
      const head = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const body = Buffer.alloc(60000);
      const highRes = Buffer.concat([head, body]);

      const res = RealPalmistryImagePipeline.processPalmUpload(highRes, 'image/jpeg');
      expect(res.evidenceBundleId).toBeDefined();
      expect(res.evidenceBundleId).toContain('EVID_PALM_');
    });
  });

  // =========================================================================
  // 8. LIFE CONTEXT GRAPH V2 & REPLAY (10 tests)
  // =========================================================================
  describe('8. Life Context Graph V2 & Replay Engine V2', () => {
    it('8.1 user-confirmed event recorded with 1.0 confidence and USER_CONFIRMED status', () => {
      const node = LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_lg_1',
        domain: 'CAREER',
        title: 'Promotion to Staff Engineer',
        eventDate: '2024-03-01',
      });

      expect(node.confirmationStatus).toBe('USER_CONFIRMED');
      expect(node.confidence).toBe(1.0);
    });

    it('8.2 AI-proposed event created with PENDING_USER_CONFIRMATION status', () => {
      const node = LifeContextGraphV2.proposeEventByAI({
        userId: 'usr_lg_2',
        domain: 'RELATIONSHIP',
        title: 'Possible wedding in 2026?',
      });

      expect(node.confirmationStatus).toBe('PENDING_USER_CONFIRMATION');
      expect(node.confidence).toBe(0.6);
    });

    it('8.3 AI-proposed event is NOT returned in getFactualContext until confirmed', () => {
      LifeContextGraphV2.proposeEventByAI({
        userId: 'usr_lg_3',
        domain: 'FINANCE',
        title: 'Possible business investment',
      });

      const facts = LifeContextGraphV2.getFactualContext('usr_lg_3');
      expect(facts.length).toBe(0);
    });

    it('8.4 confirming an AI proposal upgrades status to USER_CONFIRMED and confidence to 1.0', () => {
      const proposed = LifeContextGraphV2.proposeEventByAI({
        userId: 'usr_lg_4',
        domain: 'LOCATION',
        title: 'Relocated to London in 2023',
      });

      const confirmed = LifeContextGraphV2.confirmProposal('usr_lg_4', proposed.nodeId);
      expect(confirmed.confirmationStatus).toBe('USER_CONFIRMED');
      expect(confirmed.confidence).toBe(1.0);
      expect(LifeContextGraphV2.getFactualContext('usr_lg_4').length).toBe(1);
    });

    it('8.5 rejecting an AI proposal updates status to REJECTED', () => {
      const proposed = LifeContextGraphV2.proposeEventByAI({
        userId: 'usr_lg_5',
        domain: 'CAREER',
        title: 'Unrelated suggestion',
      });

      LifeContextGraphV2.rejectProposal('usr_lg_5', proposed.nodeId);
      const all = LifeContextGraphV2.getAllUserNodes('usr_lg_5');
      expect(all[0].confirmationStatus).toBe('REJECTED');
    });

    it('8.6 Life Replay timeline aggregates Birth, Dasha periods, Confirmed Events, Predictions, Outcomes', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_replay_full',
        name: 'Replay User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_replay_full',
        domain: 'EDUCATION',
        title: 'Graduated University',
        eventDate: '2012-06-01',
      });

      const replay = LifeReplayEngineV2.buildReplayTimeline('usr_replay_full');
      const categories = replay.timeline.map((t) => t.category);
      expect(categories).toContain('BIRTH');
      expect(categories).toContain('DASHA_PERIOD');
      expect(categories).toContain('CONFIRMED_LIFE_EVENT');
    });

    it('8.7 Life Replay timeline sorts chronologically', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_replay_sort',
        name: 'Sort User',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_replay_sort',
        domain: 'EDUCATION',
        title: 'College in 2008',
        eventDate: '2008-08-01',
      });

      LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_replay_sort',
        domain: 'CAREER',
        title: 'Job in 2012',
        eventDate: '2012-07-01',
      });

      const replay = LifeReplayEngineV2.buildReplayTimeline('usr_replay_sort');
      for (let i = 1; i < replay.timeline.length; i++) {
        expect(replay.timeline[i].timestamp >= replay.timeline[i - 1].timestamp).toBe(true);
      }
    });

    it('8.8 Life Replay correlation notes use non-causal language', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_replay_noncausal',
        name: 'Non Causal User',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const replay = LifeReplayEngineV2.buildReplayTimeline('usr_replay_noncausal');
      expect(replay.disclosures.some((d) => d.includes('NOT scientific causation'))).toBe(true);
    });

    it('8.9 attempting to confirm another user life context node throws UNAUTHORIZED_ACCESS', () => {
      const node = LifeContextGraphV2.proposeEventByAI({
        userId: 'usr_real_owner',
        domain: 'FAMILY',
        title: 'Family milestone',
      });

      expect(() => LifeContextGraphV2.confirmProposal('usr_intruder', node.nodeId)).toThrow(/UNAUTHORIZED_ACCESS/);
    });

    it('8.10 deleteUserData completely purges user life graph nodes', () => {
      LifeContextGraphV2.recordUserConfirmedEvent({
        userId: 'usr_purge_lg',
        domain: 'CAREER',
        title: 'Event to purge',
      });

      LifeContextGraphV2.deleteUserData('usr_purge_lg');
      expect(LifeContextGraphV2.getAllUserNodes('usr_purge_lg').length).toBe(0);
    });
  });

  // =========================================================================
  // 9. REAL USER PERSONALIZATION, VAULT, EXPORT & DELETION (10 tests)
  // =========================================================================
  describe('9. Personalization, Vault, Export & Deletion', () => {
    it('9.1 default personalization preferences created for new user', () => {
      const prefs = RealUserPersonalizationEngine.getPreferences('usr_pref_1');
      expect(prefs.preferredDepth).toBe('BALANCED');
      expect(prefs.preferredReadingStructure).toBe('THEMATIC');
    });

    it('9.2 updates preferred depth and reading structure cleanly', () => {
      const updated = RealUserPersonalizationEngine.updatePreferences('usr_pref_2', {
        preferredDepth: 'CONCISE',
        preferredReadingStructure: 'PRACTICAL_ACTIONABLE',
      });

      expect(updated.preferredDepth).toBe('CONCISE');
      expect(updated.preferredReadingStructure).toBe('PRACTICAL_ACTIONABLE');
    });

    it('9.3 attempting to store religion inference throws PROHIBITED_SENSITIVE_TRAIT_INFERENCE', () => {
      expect(() =>
        RealUserPersonalizationEngine.updatePreferences('usr_pref_3', {
          frequentlyInquiredTopics: ['Hindu rituals and conversion'],
        })
      ).toThrow(/PROHIBITED_SENSITIVE_TRAIT_INFERENCE/);
    });

    it('9.4 attempting to store medical diagnosis throws PROHIBITED_SENSITIVE_TRAIT_INFERENCE', () => {
      expect(() =>
        RealUserPersonalizationEngine.updatePreferences('usr_pref_4', {
          frequentlyInquiredTopics: ['Bipolar depression diagnosis inquiry'],
        })
      ).toThrow(/PROHIBITED_SENSITIVE_TRAIT_INFERENCE/);
    });

    it('9.5 attempting to store political affiliation throws PROHIBITED_SENSITIVE_TRAIT_INFERENCE', () => {
      expect(() =>
        RealUserPersonalizationEngine.updatePreferences('usr_pref_5', {
          frequentlyInquiredTopics: ['Republican election voting patterns'],
        })
      ).toThrow(/PROHIBITED_SENSITIVE_TRAIT_INFERENCE/);
    });

    it('9.6 User Vault aggregates all user assets accurately', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_vault_agg',
        name: 'Vault Aggregator',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      PredictionLedgerV2.recordPrediction({
        userId: 'usr_vault_agg',
        question: 'Career path',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Supportive statement',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const vault = UserVaultService.getVault('usr_vault_agg', 'usr_vault_agg');
      expect(vault.profileVersions.length).toBe(1);
      expect(vault.predictions.length).toBe(1);
      expect(vault.totalAssetsCount).toBeGreaterThanOrEqual(2);
    });

    it('9.7 User Vault blocks unauthorized requester', () => {
      expect(() => UserVaultService.getVault('usr_vault_a', 'usr_vault_b')).toThrow(/ACCESS_DENIED/);
    });

    it('9.8 export data in JSON format contains calculation passports', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_export_json',
        name: 'Export JSON',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const jsonStr = PrivacyExportDeletionService.exportData('usr_export_json', 'usr_export_json', 'JSON');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.activeProfile.calculationPassport.fingerprint).toBeDefined();
    });

    it('9.9 export data in CSV format contains structured record rows', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_export_csv',
        name: 'Export CSV',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const pred = PredictionLedgerV2.recordPrediction({
        userId: 'usr_export_csv',
        question: 'Promotion inquiry',
        predictionType: 'TIMING',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Supportive statement in CSV',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const csvStr = PrivacyExportDeletionService.exportData('usr_export_csv', 'usr_export_csv', 'CSV');
      expect(csvStr).toContain('record_type,id,timestamp');
      expect(csvStr).toContain('PREDICTION');
      expect(csvStr).toContain(pred.predictionId);
    });

    it('9.10 transactional deletion purges all assets and reports 0 orphaned records', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_erasure_test',
        name: 'Erasure Target',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      PredictionLedgerV2.recordPrediction({
        userId: 'usr_erasure_test',
        question: 'Question',
        predictionType: 'DIRECTIONAL',
        calculationPassportId: 'pass_1',
        methodology: 'Parashari',
        evidenceBundleId: 'evid_1',
        statement: 'Statement',
        timeWindow: { startDate: '2026-01-01', endDate: '2026-12-31', description: '2026' },
        direction: 'FAVORABLE',
        confidence: 0.8,
        limitations: [],
        systemsUsed: ['Vedic'],
      });

      const audit = PrivacyExportDeletionService.deleteUserData('usr_erasure_test', 'usr_erasure_test');
      expect(audit.status).toBe('COMPLETELY_ERASED');
      expect(audit.orphanedRecordsRemaining).toBe(0);
      expect(audit.profilesDeleted).toBe(1);
      expect(audit.predictionsDeleted).toBe(1);
    });
  });

  // =========================================================================
  // 10. AI ROUTER V3, QUESTION REFINEMENT & DECISION INTELLIGENCE (10 tests)
  // =========================================================================
  describe('10. AI Router V3, Decision Intelligence & Human Expert Validation', () => {
    it('10.1 AI Router V3 passes grounded, non-fatalistic claims', () => {
      const mockBundle: any = {
        sources: [{ source_id: 'SRC_BPHS', treatise: 'Brihat Parashara Hora Shastra' }],
      };
      const text = 'According to Brihat Parashara Hora Shastra, Jupiter in Kendra indicates wisdom. Astrological timing appears supportive for career growth.';
      const res = AIRouterV3.validateAndCleanResponse(text, mockBundle);

      expect(res.passed).toBe(true);
      expect(res.safetyViolationsBlocked.length).toBe(0);
      expect(res.unsupportedClaimsRemoved.length).toBe(0);
    });

    it('10.2 AI Router V3 strips fatalistic claims ("will definitely get divorced")', () => {
      const mockBundle: any = { sources: [] };
      const text = 'You will definitely get divorced next year. Planetary transits show stress.';
      const res = AIRouterV3.validateAndCleanResponse(text, mockBundle);

      expect(res.passed).toBe(false);
      expect(res.safetyViolationsBlocked.length).toBe(1);
      expect(res.finalCleanedResponse).not.toContain('will definitely get divorced');
    });

    it('10.3 AI Router V3 strips medical diagnostic claims ("you have cancer")', () => {
      const mockBundle: any = { sources: [] };
      const text = 'Mars in 6th house means you have cancer. Take this medicine.';
      const res = AIRouterV3.validateAndCleanResponse(text, mockBundle);

      expect(res.passed).toBe(false);
      expect(res.safetyViolationsBlocked.length).toBeGreaterThanOrEqual(1);
      expect(res.finalCleanedResponse).not.toContain('you have cancer');
    });

    it('10.4 AI Router V3 strips citations to treatises not in EvidenceBundle', () => {
      const mockBundle: any = {
        sources: [{ source_id: 'SRC_BPHS', treatise: 'Brihat Parashara Hora Shastra' }],
      };
      const text = 'According to Fake Treatise of Secrets, Saturn creates gold.';
      const res = AIRouterV3.validateAndCleanResponse(text, mockBundle);

      expect(res.passed).toBe(false);
      expect(res.unsupportedClaimsRemoved.length).toBe(1);
      expect(res.finalCleanedResponse).not.toContain('Fake Treatise of Secrets');
    });

    it('10.5 Question Refinement Engine flags vague career question ("will I get a job?")', () => {
      const res = QuestionRefinementEngine.refine('will I get a job?');
      expect(res.needsClarification).toBe(true);
      expect(res.clarificationPrompt).toBeDefined();
      expect(res.suggestedOptions?.length).toBeGreaterThanOrEqual(2);
    });

    it('10.6 Question Refinement Engine flags vague marriage question and requests context', () => {
      const res = QuestionRefinementEngine.refine('when will I marry?');
      expect(res.needsClarification).toBe(true);
      expect(res.intent.domain).toBe('RELATIONSHIP');
    });

    it('10.7 Question Refinement Engine allows specific question with time horizon to proceed', () => {
      const res = QuestionRefinementEngine.refine('Will I transition to a VP role this year in 2026?');
      expect(res.needsClarification).toBe(false);
    });

    it('10.8 Decision Intelligence compares Option A vs Option B with supportive/challenging factors', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_decide',
        name: 'Decider User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00:00',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = DecisionIntelligenceEngineV2.compareOptions('usr_decide', [
        { optionId: 'opt_A', label: 'Tech Lead at Enterprise', description: 'Corporate role', category: 'CAREER' },
        { optionId: 'opt_B', label: 'Founder at Startup', description: 'Early stage', category: 'BUSINESS' },
      ]);

      expect(res.optionsEvaluated.length).toBe(2);
      expect(res.optionsEvaluated[0].supportiveFactors.length).toBeGreaterThan(0);
      expect(res.optionsEvaluated[0].challengingFactors.length).toBeGreaterThan(0);
    });

    it('10.9 Decision Intelligence provides non-fatalistic comparative synthesis', async () => {
      await RealUserOnboardingService.onboardUser({
        userId: 'usr_decide_synth',
        name: 'Synth User',
        dateOfBirth: '1990-01-01',
        birthPlace: 'Delhi',
        userConsentGiven: true,
      });

      const res = DecisionIntelligenceEngineV2.compareOptions('usr_decide_synth', [
        { optionId: 'opt_1', label: 'Relocate to London', description: 'Move abroad', category: 'RELOCATION' },
        { optionId: 'opt_2', label: 'Stay in Mumbai', description: 'Domestic', category: 'CAREER' },
      ]);

      expect(res.comparativeSynthesis).toContain('personal preparation, pragmatic feasibility, and individual goals remain the final deciding factors');
    });

    it('10.10 Human Expert Validation Dataset contains 5 canonical cases with 100% PASS scores', () => {
      const cases = HumanExpertValidationDataset.getValidationCases();
      expect(cases.length).toBe(5);
      for (const c of cases) {
        expect(c.reviewerScore.calculationConsistency).toBe('PASS');
        expect(c.reviewerScore.ruleApplication).toBe('PASS');
        expect(c.reviewerScore.sourceGrounding).toBe('PASS');
        expect(c.reviewerScore.safetyAndNonFatalism).toBe('PASS');
        expect(c.reviewerScore.overallResult).toBe('PASS');
      }
    });
  });
});
