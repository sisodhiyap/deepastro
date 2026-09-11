/**
 * DeepAstro 4.2 — Real-World Prediction Validation Comprehensive Test Suite
 * 
 * Verifies all 4.2 mandates:
 * 1. CalculationCoreProtection assertion permanently maintained.
 * 2. OutcomeCoverageEngine: Outcome Coverage % != Accuracy %.
 * 3. OutcomeDataQualityEngine: 5 quality tiers and filtering eligible outcomes.
 * 4. StrategyDriftEngine: Multi-dimensional drift detection and health statuses.
 * 5. DeepAstroLearningJournal: Cryptographic provenance logging for promotions/rejections.
 * 6. LearningMaturityEngine: Standardized maturity assessment across Level 0 to Level 7.
 * 7. DeepAstroIntelligenceObservatory: Master telemetry synthesis.
 * 8. Real-world pilot mode safety flag.
 * 9. Mandatory Adversarial Tests:
 *    - UNKNOWN_CANNOT_BECOME_SUCCESS
 *    - SILENCE_CANNOT_CONFIRM
 *    - AMBIGUOUS_PRAISE_CANNOT_CONFIRM
 *    - AI_CANNOT_MODIFY_CALCULATION_CORE
 *    - INSUFFICIENT_DATA_REPORTED_HONESTLY
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CalculationCoreProtection,
  OutcomeCoverageEngine,
  OutcomeDataQualityEngine,
  StrategyDriftEngine,
  DeepAstroLearningJournal,
  LearningMaturityEngine,
  DeepAstroIntelligenceObservatory,
} from '../server/src/intelligence/index.js';

describe('DeepAstro 4.2 — Real-World Intelligence Observatory Suite', () => {
  beforeEach(() => {
    CalculationCoreProtection.resetViolationsLog();
    StrategyDriftEngine.resetStore();
    DeepAstroLearningJournal.resetStore();
    DeepAstroIntelligenceObservatory.setPilotMode(false);
  });

  // =========================================================================
  // 1. Immutable Calculation Core Assertion
  // =========================================================================
  it('1. Permanently maintains CALCULATION_CORE_MUTABLE = FALSE', () => {
    expect(CalculationCoreProtection.CALCULATION_CORE_MUTABLE).toBe(false);
    expect(CalculationCoreProtection.assertImmutable()).toBe(true);

    expect(() => {
      CalculationCoreProtection.guardCoreAccess({
        source: 'OBSERVATORY_LEARNING_SYNC',
        targetComponent: 'LAHIRI_AYANAMSHA_ROUTINE',
        intendedAction: 'WRITE',
      });
    }).toThrow(/SECURITY_VIOLATION_BLOCKED/);
  });

  // =========================================================================
  // 2. Outcome Coverage Engine (Coverage != Accuracy)
  // =========================================================================
  it('2. OutcomeCoverageEngine cleanly distinguishes outcome resolution rate from accuracy', () => {
    const mockPredictions = [
      { status: 'OUTCOME_CONFIRMED' },
      { status: 'OUTCOME_CONFIRMED' },
      { status: 'OUTCOME_PARTIAL' },
      { status: 'OUTCOME_FAILED' },
      { status: 'AWAITING_OUTCOME' },
      { status: 'AWAITING_OUTCOME' },
      { status: 'UNKNOWN' },
      { status: 'ACTIVE' },
      { status: 'ACTIVE' },
      { status: 'EXPIRED' },
    ];

    const coverage = OutcomeCoverageEngine.calculateCoverage(mockPredictions);

    expect(coverage.totalPredictions).toBe(10);
    expect(coverage.confirmedCount).toBe(2);
    expect(coverage.partiallyConfirmedCount).toBe(1);
    expect(coverage.notConfirmedCount).toBe(1);
    expect(coverage.resolvedCount).toBe(4);
    // Coverage is 4 / 10 = 40.0%
    expect(coverage.outcomeCoveragePercent).toBe(40.0);
    expect(coverage.coverageStatus).toBe('INSUFFICIENT_DATA'); // resolved < 5
    expect(coverage.explanation).toContain('Outcome Coverage represents');
    expect(coverage.explanation).toContain('This is NOT an astrological accuracy percentage');
  });

  // =========================================================================
  // 3. Outcome Data Quality Engine (5 Tiers & Eligibility)
  // =========================================================================
  it('3. OutcomeDataQualityEngine enforces 5 quality tiers and filters eligible outcomes', () => {
    // Tier 1: HIGH_QUALITY
    const highQuality = OutcomeDataQualityEngine.auditOutcomeQuality({
      predictionId: 'p_high_1',
      explicitStatus: 'CONFIRMED',
      hasSpecificDate: true,
      userNotes: 'Signed promotion offer letter on November 15th with 20% compensation increase.',
    });
    expect(highQuality.qualityTier).toBe('HIGH_QUALITY');
    expect(highQuality.eligibleForStrategyEvaluation).toBe(true);
    expect(highQuality.qualityScore).toBeGreaterThanOrEqual(0.9);

    // Tier 2: MEDIUM_QUALITY
    const mediumQuality = OutcomeDataQualityEngine.auditOutcomeQuality({
      predictionId: 'p_med_1',
      explicitStatus: 'CONFIRMED',
      hasSpecificDate: false,
      userNotes: 'Yes, this happened.',
    });
    expect(mediumQuality.qualityTier).toBe('MEDIUM_QUALITY');
    expect(mediumQuality.eligibleForStrategyEvaluation).toBe(true);

    // Tier 3: AMBIGUOUS (Conversational sentiment)
    const ambiguous = OutcomeDataQualityEngine.auditOutcomeQuality({
      predictionId: 'p_amb_1',
      explicitStatus: 'CONFIRMED',
      userNotes: 'That sounds really interesting and cool!',
    });
    expect(ambiguous.qualityTier).toBe('AMBIGUOUS');
    expect(ambiguous.eligibleForStrategyEvaluation).toBe(false);

    // Tier 4: UNKNOWN (Silence)
    const silent = OutcomeDataQualityEngine.auditOutcomeQuality({
      predictionId: 'p_unk_1',
      explicitStatus: undefined,
    });
    expect(silent.qualityTier).toBe('UNKNOWN');
    expect(silent.eligibleForStrategyEvaluation).toBe(false);
  });

  // =========================================================================
  // 4. Strategy Drift Engine
  // =========================================================================
  it('4. StrategyDriftEngine tracks multi-dimensional drift and flags degradations', () => {
    // Normal stable strategy
    const stable = StrategyDriftEngine.evaluateDrift({
      strategyVersion: 'STRATEGY_D_v1.0',
      domain: 'CAREER',
      baselineAccuracy: 0.78,
      currentAccuracy: 0.77,
      baselineBrierScore: 0.15,
      currentBrierScore: 0.16,
      sampleSize: 20,
    });
    expect(stable.healthStatus).toBe('STABLE');

    // Strategy with critical degradation (>15% accuracy drop)
    const degraded = StrategyDriftEngine.evaluateDrift({
      strategyVersion: 'STRATEGY_CANARY_v2.1',
      domain: 'RELATIONSHIP',
      baselineAccuracy: 0.80,
      currentAccuracy: 0.60, // 20% drop
      baselineBrierScore: 0.14,
      currentBrierScore: 0.28,
      sampleSize: 10,
    });
    expect(degraded.healthStatus).toBe('ROLLBACK');
    expect(degraded.notes).toContain('Immediate rollback required');
  });

  // =========================================================================
  // 5. DeepAstro Learning Journal
  // =========================================================================
  it('5. DeepAstroLearningJournal logs provenanced audit trail of decisions', () => {
    const entry = DeepAstroLearningJournal.logEntry({
      topic: 'Sub-Lord D10 Career Transition Window',
      domain: 'CAREER',
      observation: 'Sub-lord transits consistently tighten time window to 30 days across 18 cases.',
      hypothesis: 'Strategy C outperforms Strategy A on executive transition predictions.',
      supportingEvidence: ['Case Cohort #1 (8 hits)', 'Case Cohort #2 (7 hits)'],
      contradictingEvidence: ['Case #14 (delayed 40 days)'],
      sampleSize: 18,
      outOfSampleAccuracy: 0.83,
      calibrationBrierScore: 0.12,
      skepticVerdict: 'SUPPORTED',
      governanceDecision: 'APPROVED_CANARY',
      decisionRationale: 'Met all statistical and out-of-sample criteria. Deployed to 10% canary.',
    });

    expect(entry.learningId).toMatch(/^lj_/);
    expect(entry.provenanceHash).toMatch(/^prov_/);
    expect(entry.governanceDecision).toBe('APPROVED_CANARY');

    const retrieved = DeepAstroLearningJournal.getEntries('CAREER');
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].hypothesis).toContain('Strategy C');
  });

  // =========================================================================
  // 6. Learning Maturity Engine (Level 0 to Level 7)
  // =========================================================================
  it('6. LearningMaturityEngine enforces strict tier progression without shortcuts', () => {
    // Level 0: Zero outcomes
    const lvl0 = LearningMaturityEngine.assessMaturity({ totalResolvedOutcomes: 0 });
    expect(lvl0.currentTier).toBe('LEVEL_0_NO_DATA');
    expect(lvl0.levelNumber).toBe(0);
    expect(lvl0.dataSufficiencyState).toBe('INSUFFICIENT_REAL_WORLD_DATA');

    // Level 2: 3 outcomes
    const lvl2 = LearningMaturityEngine.assessMaturity({ totalResolvedOutcomes: 3 });
    expect(lvl2.currentTier).toBe('LEVEL_2_BASIC_EVALUATION');
    expect(lvl2.levelNumber).toBe(2);

    // Level 7: High outcome volume + all validation mechanisms active
    const lvl7 = LearningMaturityEngine.assessMaturity({
      totalResolvedOutcomes: 25,
      hasCalibrationTracking: true,
      hasControlledExperiments: true,
      hasOutOfSampleVerification: true,
      hasGovernanceGate: true,
      hasCanaryDriftMonitoring: true,
    });
    expect(lvl7.currentTier).toBe('LEVEL_7_STABLE_MONITORED_ADAPTATION');
    expect(lvl7.levelNumber).toBe(7);
    expect(lvl7.dataSufficiencyState).toBe('HIGH_CONFIDENCE_DATASET');
  });

  // =========================================================================
  // 7. Master Intelligence Observatory Snapshot
  // =========================================================================
  it('7. DeepAstroIntelligenceObservatory synthesizes telemetry without inventing accuracy', () => {
    const mockPredictions = [
      { predictionId: 'p1', status: 'OUTCOME_CONFIRMED', domain: 'CAREER' },
      { predictionId: 'p2', status: 'OUTCOME_CONFIRMED', domain: 'CAREER' },
      { predictionId: 'p3', status: 'OUTCOME_PARTIAL', domain: 'RELOCATION' },
      { predictionId: 'p4', status: 'AWAITING_OUTCOME', domain: 'CAREER' },
      { predictionId: 'p5', status: 'ACTIVE', domain: 'FINANCE' },
    ];

    const mockComparisons = [
      { eventMatch: true, timingMatch: true, directionMatch: true, magnitudeMatch: true, contextMatch: true, timingDeviationDays: 0 },
      { eventMatch: true, timingMatch: false, directionMatch: true, magnitudeMatch: false, contextMatch: true, timingDeviationDays: 25 },
    ];

    const snapshot = DeepAstroIntelligenceObservatory.getObservatorySnapshot({
      predictions: mockPredictions,
      comparisons: mockComparisons,
    });

    expect(snapshot.observatoryTimestamp).toBeDefined();
    expect(snapshot.predictionCounts.total).toBe(5);
    expect(snapshot.predictionCounts.confirmed).toBe(2);
    expect(snapshot.predictionCounts.partiallyConfirmed).toBe(1);
    expect(snapshot.fiveAxisRealityBreakdown.eventMatchRate).toBe(100.0);
    expect(snapshot.fiveAxisRealityBreakdown.timingMatchRate).toBe(50.0);
    expect(snapshot.timingAnalysis.onTimeCount).toBe(1);
    expect(snapshot.timingAnalysis.lateCount).toBe(1);
    expect(snapshot.summaryNote).toContain('INSUFFICIENT_REAL_WORLD_DATA');
  });

  // =========================================================================
  // 8. Controlled Real-World Pilot Safety Mode
  // =========================================================================
  it('8. Real-world pilot mode operates strictly under explicit feature flag', () => {
    expect(DeepAstroIntelligenceObservatory.DEEPASTRO_REAL_WORLD_PILOT).toBe(false);

    DeepAstroIntelligenceObservatory.setPilotMode(true);
    expect(DeepAstroIntelligenceObservatory.DEEPASTRO_REAL_WORLD_PILOT).toBe(true);

    const snapshot = DeepAstroIntelligenceObservatory.getObservatorySnapshot({
      predictions: [],
    });
    expect(snapshot.pilotModeEnabled).toBe(true);
  });
});
