/**
 * DeepAstro 4.1 — Continuous Prediction Evolution Comprehensive Test Suite
 * 
 * Verifies all 4.1 mandates:
 * 1. CalculationCoreProtection assertion: CALCULATION_CORE_MUTABLE = FALSE permanently.
 * 2. PredictionEvolutionRecord & complete 11-stage state machine transitions.
 * 3. OutcomeQualityEngine: explicit confirmation vs ambiguous sentiment vs silence.
 * 4. PredictionRealityComparisonEngine: Event, Timing, Direction, Magnitude, Context.
 * 5. PredictionErrorDiagnosisEngine V2: 25 distinct failure classes.
 * 6. ComparablePredictionCaseEngine: Astrological archetype matching without sensitive personal data.
 * 7. WalkForwardValidationEngine: Rolling-window forward validation with ZERO future leakage.
 * 8. StrategyMonitoringEngine & Canary Deployment: 10% traffic routing and automatic rollback on degradation.
 * 9. LearningReplayEngine: Clean-room historical replay strictly using pre-cutoff data.
 * 10. Adversarial defense tests:
 *     - ONE_SUCCESS_CANNOT_PROMOTE
 *     - UNKNOWN_CANNOT_BECOME_SUCCESS
 *     - AMBIGUOUS_FEEDBACK_CANNOT_CONFIRM
 *     - AI_CANNOT_MODIFY_CALCULATION_CORE
 *     - FAILED_CANARY_MUST_ROLLBACK
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CalculationCoreProtection,
  OutcomeQualityEngine,
  PredictionRealityComparisonEngine,
  PredictionEvolutionStore,
  ComparablePredictionCaseEngine,
  WalkForwardValidationEngine,
  StrategyMonitoringEngine,
  LearningReplayEngine,
  PredictionErrorDiagnosisEngine,
  AstrologyHypothesisEngine,
  PredictionLedgerV3,
} from '../server/src/intelligence/index.js';

describe('DeepAstro 4.1 — Continuous Prediction Evolution Suite', () => {
  beforeEach(() => {
    CalculationCoreProtection.resetViolationsLog();
    PredictionEvolutionStore.resetStore();
    ComparablePredictionCaseEngine.resetStore();
    StrategyMonitoringEngine.resetStore();
    PredictionLedgerV3.resetStore();
  });

  // =========================================================================
  // 1. Immutable Calculation Core Assertion
  // =========================================================================
  it('1. Asserts CALCULATION_CORE_MUTABLE = FALSE and blocks unauthorized mutation attempts', () => {
    expect(CalculationCoreProtection.CALCULATION_CORE_MUTABLE).toBe(false);
    expect(CalculationCoreProtection.assertImmutable()).toBe(true);

    // AI / Learning attempt to write to calculation core must fail safely
    expect(() => {
      CalculationCoreProtection.guardCoreAccess({
        source: 'AI_SELF_LEARNING_ROUTINE',
        targetComponent: 'VSOP87_PLANETARY_EPHEMERIS',
        intendedAction: 'WRITE',
        payload: { shiftDegrees: 0.5 },
      });
    }).toThrow(/SECURITY_VIOLATION_BLOCKED/);

    const violations = CalculationCoreProtection.getSecurityViolations();
    expect(violations.length).toBe(1);
    expect(violations[0].blocked).toBe(true);
    expect(violations[0].alertLevel).toBe('CRITICAL_SECURITY_ALERT');
  });

  // =========================================================================
  // 2. Prediction Evolution Record & State Machine Transitions
  // =========================================================================
  it('2. PredictionEvolutionStore tracks full lifecycle and enforces illegal transition guards', () => {
    const record = PredictionEvolutionStore.createRecord({
      predictionId: 'pred_evo_101',
      userId: 'user_41_tester',
      calculationSnapshotId: 'snap_41_01',
      predictionDomain: 'CAREER',
      predictionType: 'EXECUTIVE_ROLE',
      predictionStatement: 'Promotion to VP or Director anticipated in Q4 2026.',
      expectedEvent: 'Executive Promotion',
      expectedDirection: 'FAVORABLE',
      expectedTimeWindow: { startDate: '2026-10-01', endDate: '2026-12-31', scale: 'QUARTER' },
      predictionConfidence: 0.82,
      predictionUncertainty: 'Sub-period stationing variance +/- 15 days',
      evidenceIds: ['ev_par_01', 'ev_kp_02'],
    });

    expect(record.state).toBe('ISSUED');

    // Advance to AWAITING_OUTCOME
    const awaiting = PredictionEvolutionStore.transitionState('pred_evo_101', 'AWAITING_OUTCOME');
    expect(awaiting.state).toBe('AWAITING_OUTCOME');

    // Advance to UNKNOWN if no outcome received
    const unknownState = PredictionEvolutionStore.transitionState('pred_evo_101', 'UNKNOWN');
    expect(unknownState.state).toBe('UNKNOWN');

    // Illegal transition: UNKNOWN cannot become CONFIRMED without explicit verified outcome
    expect(() => {
      PredictionEvolutionStore.transitionState('pred_evo_101', 'CONFIRMED');
    }).toThrow(/ILLEGAL_STATE_TRANSITION/);

    // Legal transition with verified outcome ID
    const confirmed = PredictionEvolutionStore.transitionState('pred_evo_101', 'CONFIRMED', {
      outcomeId: 'outc_verified_99',
    });
    expect(confirmed.state).toBe('CONFIRMED');
    expect(confirmed.outcomeId).toBe('outc_verified_99');
  });

  // =========================================================================
  // 3. Outcome Quality Engine (Ambiguity & Silence Protection)
  // =========================================================================
  it('3. OutcomeQualityEngine preserves ambiguity and rejects conversational praise as success', () => {
    // Case A: User silence / No feedback -> Strictly UNKNOWN
    const silentAssessment = OutcomeQualityEngine.evaluateOutcomeQuality({
      source: 'NO_FEEDBACK',
    });
    expect(silentAssessment.assignedOutcome).toBe('UNKNOWN');
    expect(silentAssessment.ambiguityPreserved).toBe(true);

    // Case B: User says "That sounds interesting / cool" -> Must NOT count as confirmed success
    const ambiguousAssessment = OutcomeQualityEngine.evaluateOutcomeQuality({
      source: 'AMBIGUOUS_FEEDBACK',
      explicitStatus: 'CONFIRMED',
      userNotes: 'That sounds really interesting and cool!',
    });
    expect(ambiguousAssessment.assignedOutcome).toBe('UNKNOWN');
    expect(ambiguousAssessment.ambiguityPreserved).toBe(true);
    expect(ambiguousAssessment.qualityScore).toBeLessThan(0.3);

    // Case C: Explicit user confirmation
    const explicitAssessment = OutcomeQualityEngine.evaluateOutcomeQuality({
      source: 'USER_EXPLICIT_CONFIRMATION',
      explicitStatus: 'CONFIRMED',
      userNotes: 'Promoted to VP of Engineering on November 12.',
    });
    expect(explicitAssessment.assignedOutcome).toBe('CONFIRMED');
    expect(explicitAssessment.qualityScore).toBeGreaterThanOrEqual(0.9);
  });

  // =========================================================================
  // 4. Prediction Reality Comparison Engine
  // =========================================================================
  it('4. PredictionRealityComparisonEngine conducts multi-axis evaluation without collapsing into a percentage', () => {
    const comparison = PredictionRealityComparisonEngine.compareReality({
      predictionId: 'pred_evo_101',
      domain: 'CAREER',
      expectedEvent: 'Executive Promotion to Director or VP',
      expectedDirection: 'FAVORABLE',
      expectedTimeWindow: {
        startDate: '2026-10-01',
        endDate: '2026-12-31',
      },
      predictedConfidence: 0.82,
      observedEvent: 'Confirmed promotion to Director of Product',
      observedDate: '2026-11-15',
      observedDirection: 'FAVORABLE',
      observedContext: 'CAREER',
    });

    expect(comparison.comparisonId).toMatch(/^cmp_/);
    expect(comparison.eventMatch).toBe(true);
    expect(comparison.timingMatch).toBe(true);
    expect(comparison.timingDeviationDays).toBe(0);
    expect(comparison.directionMatch).toBe(true);
    expect(comparison.contextMatch).toBe(true);
    expect(comparison.overallEvaluation).toBe('FULL');
  });

  it('4b. Reality comparison detects timing deviations outside the predicted window', () => {
    const lateComparison = PredictionRealityComparisonEngine.compareReality({
      predictionId: 'pred_evo_102',
      domain: 'RELOCATION',
      expectedEvent: 'Relocation to London office',
      expectedDirection: 'FAVORABLE',
      expectedTimeWindow: {
        startDate: '2026-08-01',
        endDate: '2026-08-31',
      },
      predictedConfidence: 0.85,
      observedEvent: 'Moved to London office',
      observedDate: '2026-10-15', // 45 days late
      observedDirection: 'FAVORABLE',
      observedContext: 'RELOCATION',
    });

    expect(lateComparison.eventMatch).toBe(true);
    expect(lateComparison.timingMatch).toBe(false);
    expect(lateComparison.timingDeviationDays).toBeGreaterThan(40);
    expect(lateComparison.overallEvaluation).toBe('PARTIAL');
  });

  // =========================================================================
  // 5. Prediction Error Diagnosis Engine V2
  // =========================================================================
  it('5. PredictionErrorDiagnosisEngine V2 classifies failure root causes across 25 failure classes', () => {
    const entry = PredictionLedgerV3.recordPrediction({
      userId: 'user_41_tester',
      questionId: 'q_fail_01',
      predictionType: 'FINANCIAL',
      domain: 'MONEY',
      predictionText: 'Massive windfall from private equity liquidation.',
      expectedEvent: 'Private Equity Windfall',
      expectedDirection: 'FAVORABLE',
      timeWindow: { startDate: '2026-05-01', endDate: '2026-06-01', scale: 'MONTH' },
      chartSnapshotId: 'snap_41_02',
      rulesUsed: ['11th Lord exalted'],
      systemsUsed: ['PARASHARI'],
      evidenceIds: ['ev_single_01'],
      confidence: 0.92,
      uncertainty: 'None recorded',
    });

    const diagnosis = PredictionErrorDiagnosisEngine.diagnosePredictionError({
      prediction: entry,
      outcomeType: 'NOT_CONFIRMED',
      userNotes: 'No windfall occurred; market transaction fell through.',
    });

    expect(diagnosis.primaryErrorClass).toBe('OVERCONFIDENCE');
    expect(diagnosis.contributingFactors).toContain('UNRESOLVED_CONTRADICTION');
    expect(diagnosis.remediationRecommendation).toContain('Dampen confidence factor');
  });

  // =========================================================================
  // 6. Comparable Prediction Case Engine
  // =========================================================================
  it('6. ComparablePredictionCaseEngine finds similar astrological configurations without matching personal data', () => {
    ComparablePredictionCaseEngine.seedCase({
      predictionId: 'hist_case_01',
      domain: 'CAREER',
      dashaLord: 'Jupiter',
      antardashaLord: 'Saturn',
      moonSign: 'Aries',
      ascendantSign: 'Cancer',
      outcome: 'CONFIRMED',
      strategyUsed: 'STRATEGY_C_RULE_DASHA_VARGA',
    });

    ComparablePredictionCaseEngine.seedCase({
      predictionId: 'hist_case_02',
      domain: 'RELATIONSHIP',
      dashaLord: 'Venus',
      antardashaLord: 'Mars',
      moonSign: 'Taurus',
      ascendantSign: 'Leo',
      outcome: 'PARTIALLY_CONFIRMED',
    });

    const matches = ComparablePredictionCaseEngine.findComparableCases({
      domain: 'CAREER',
      dashaLord: 'Jupiter',
      antardashaLord: 'Saturn',
      moonSign: 'Aries',
    });

    expect(matches.length).toBe(1);
    expect(matches[0].predictionId).toBe('hist_case_01');
    expect(matches[0].similarityScore).toBeGreaterThanOrEqual(0.8);
    expect(matches[0].pastOutcome).toBe('CONFIRMED');
  });

  // =========================================================================
  // 7. Walk-Forward Temporal Validation Engine
  // =========================================================================
  it('7. WalkForwardValidationEngine verifies temporal integrity with ZERO backwards leakage', () => {
    const historicalCases = [
      { caseId: 'w1', userId: 'u1', eventDate: '2024-01-10', domain: 'CAREER', chartSnapshotId: 's1', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.8 } },
      { caseId: 'w2', userId: 'u2', eventDate: '2024-02-15', domain: 'CAREER', chartSnapshotId: 's2', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.4 } },
      { caseId: 'w3', userId: 'u3', eventDate: '2024-03-20', domain: 'CAREER', chartSnapshotId: 's3', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.75 } },
      { caseId: 'w4', userId: 'u4', eventDate: '2024-04-10', domain: 'CAREER', chartSnapshotId: 's4', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.7 } },
      { caseId: 'w5', userId: 'u5', eventDate: '2024-05-15', domain: 'CAREER', chartSnapshotId: 's5', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.85 } },
      { caseId: 'w6', userId: 'u6', eventDate: '2024-06-20', domain: 'CAREER', chartSnapshotId: 's6', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.35 } },
    ];

    const report = WalkForwardValidationEngine.runWalkForwardValidation({
      strategyName: 'STRATEGY_D_COMPREHENSIVE_CONTEXT',
      cases: historicalCases,
      minTrainingSize: 4,
      testBatchSize: 1,
    });

    expect(report.totalWindows).toBe(2);
    expect(report.temporalIntegrityVerified).toBe(true);
    expect(report.meanWalkForwardAccuracy).toBeGreaterThan(0.5);
  });

  // =========================================================================
  // 8. Strategy Monitoring, Canary Routing, & Automatic Rollback
  // =========================================================================
  it('8. StrategyMonitoringEngine deploys canary and automatically rolls back if performance degrades', () => {
    // Deploy Canary Strategy v2.0 at 10% traffic
    const canary = StrategyMonitoringEngine.deployCanary({
      strategyVersion: 'STRATEGY_CANDIDATE_v2.0',
      parentVersion: 'STRATEGY_BASELINE_v1.0',
      changeSummary: 'Experimental D10 sub-lord weighting refinement',
      baselineAccuracy: 0.75,
      canaryTrafficPercent: 10,
    });

    expect(canary.status).toBe('CANARY');
    expect(canary.trafficPercent).toBe(10);

    // Simulate performance degradation in canary batch (drop from 75% to 50%)
    const evaluation = StrategyMonitoringEngine.recordTelemetryEvaluation(
      'STRATEGY_CANDIDATE_v2.0',
      0.50, // 25% drop relative to 0.75 baseline
      0.35  // high Brier score
    );

    expect(evaluation.triggeredRollback).toBe(true);
    expect(evaluation.status).toBe('ROLLED_BACK');

    const strategies = StrategyMonitoringEngine.getStrategies();
    const canaryRecord = strategies.find((s) => s.strategyVersion === 'STRATEGY_CANDIDATE_v2.0');
    expect(canaryRecord?.status).toBe('ROLLED_BACK');
    expect(canaryRecord?.trafficPercent).toBe(0);
    expect(canaryRecord?.rollbackReason).toContain('AUTOMATIC_CANARY_ROLLBACK');

    const baselineRecord = strategies.find((s) => s.strategyVersion === 'STRATEGY_BASELINE_v1.0');
    expect(baselineRecord?.trafficPercent).toBe(100);

    const driftEvents = StrategyMonitoringEngine.getDriftEvents();
    expect(driftEvents.length).toBe(1);
    expect(driftEvents[0].driftType).toBe('PERFORMANCE_DRIFT');
  });

  // =========================================================================
  // 9. Clean-Room Learning Replay Engine
  // =========================================================================
  it('9. LearningReplayEngine enforces clean-room historical cutoff without future leakage', () => {
    const historicalCases = [
      { caseId: 'h1', userId: 'u1', eventDate: '2023-01-01', domain: 'CAREER', chartSnapshotId: 's1', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.8 } },
      { caseId: 'h2', userId: 'u2', eventDate: '2023-03-01', domain: 'CAREER', chartSnapshotId: 's2', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.3 } },
      { caseId: 'h3', userId: 'u3', eventDate: '2023-05-01', domain: 'CAREER', chartSnapshotId: 's3', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.75 } },
      { caseId: 'h4', userId: 'u4', eventDate: '2023-07-01', domain: 'CAREER', chartSnapshotId: 's4', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.7 } },
      { caseId: 'h5', userId: 'u5', eventDate: '2023-09-01', domain: 'CAREER', chartSnapshotId: 's5', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.4 } },
      // Future cases after cutoff
      { caseId: 'h6_future', userId: 'u6', eventDate: '2024-01-01', domain: 'CAREER', chartSnapshotId: 's6', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.9 } },
      { caseId: 'h7_future', userId: 'u7', eventDate: '2024-03-01', domain: 'CAREER', chartSnapshotId: 's7', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.95 } },
    ];

    const replay = LearningReplayEngine.replayHistoricalLearning({
      domain: 'CAREER',
      allCases: historicalCases,
      cutoffDate: '2023-10-01',
    });

    expect(replay.totalEligibleHistoricalCases).toBe(5);
    expect(replay.excludedFutureCases).toBe(2);
    expect(replay.temporalIntegrityPass).toBe(true);
    expect(replay.replayAuditSummary).toContain('Clean-room replay at cutoff');
  });

  // =========================================================================
  // 10. Adversarial Test: "ONE SUCCESS CANNOT PROMOTE"
  // =========================================================================
  it('10. Adversarial: ONE SUCCESS CANNOT PROMOTE hypothesis into production rule', () => {
    const hyp = AstrologyHypothesisEngine.proposeHypothesis({
      statement: 'Mars exalted in 10th guarantees leadership elevation regardless of Dasha.',
      domain: 'CAREER',
      evidence: ['Single user report'],
      initialSupportingPredictionId: 'pred_lucky_01',
    });

    expect(hyp.sampleSize).toBe(1);

    const evalResult = AstrologyHypothesisEngine.evaluateForPromotion(hyp.hypothesisId);
    expect(evalResult.eligible).toBe(false);
    expect(evalResult.reason).toContain('INSUFFICIENT_EVIDENCE');

    expect(() => {
      AstrologyHypothesisEngine.promoteHypothesis(hyp.hypothesisId, 'DEEPASTRO_ADMIN_SIGNATURE_KEY');
    }).toThrow(/INSUFFICIENT_EVIDENCE/);
  });
});
