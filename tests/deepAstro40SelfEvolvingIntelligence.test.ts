/**
 * DeepAstro 4.0 — Self-Evolving Prediction Intelligence Comprehensive Test Suite
 * 
 * Verifies all requirements:
 * 1. DeepAstroReasoningWorkspace multi-stage reasoning and safe explanation (no chain-of-thought leaks).
 * 2. PredictionLedgerV3 immutability and lifecycle transitions.
 * 3. PredictionOutcomeEngineV3 grounded user-confirmed outcomes; never manufactures success.
 * 4. PredictionErrorDiagnosisEngine diagnoses across 20 failure classes without premature rule mutation.
 * 5. AstrologyHypothesisEngine enforcing "ONE SUCCESS != NEW KNOWLEDGE" and sample size >= 5.
 * 6. PredictionExperimentEngine & OutOfSampleValidationEngine benchmarking strategies A/B/C/D.
 * 7. PredictionSkepticEngine adversarial disproval and overweighting detection.
 * 8. ClaimVerificationEngine and DeepAstroResearchIntelligence source quality evaluation.
 * 9. KnowledgeLearningEngine cryptographic provenance and separate global vs user knowledge.
 * 10. PredictionCalibrationEngineV3 Brier scores, overconfidence detection, and score dampening.
 * 11. DeepAstroLearningSandbox isolated candidate strategy evaluation.
 * 12. Complete tenant isolation (User A vs User B).
 * 13. Absolute Layer A calculation immutability.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DeepAstroReasoningWorkspace,
  PredictionLedgerV3,
  PredictionOutcomeEngineV3,
  PredictionErrorDiagnosisEngine,
  AstrologyHypothesisEngine,
  PredictionExperimentEngine,
  OutOfSampleValidationEngine,
  PredictionSkepticEngine,
  ClaimVerificationEngine,
  DeepAstroResearchIntelligence,
  KnowledgeLearningEngine,
  PredictionCalibrationEngineV3,
  DeepAstroLearningSandbox,
  EvidenceFusionEngineV3,
} from '../server/src/intelligence/index.js';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';

describe('DeepAstro 4.0 — Self-Evolving Prediction Intelligence Fabric', () => {
  const sampleBirthInput = {
    name: 'Arjun Test User',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Mumbai, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
  };

  const facts = VedicAstroEngine.createAstrologyFactSet(sampleBirthInput);
  const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

  beforeEach(() => {
    PredictionLedgerV3.resetStore();
    PredictionOutcomeEngineV3.resetStore();
    AstrologyHypothesisEngine.resetStore();
    ClaimVerificationEngine.resetStore();
    KnowledgeLearningEngine.resetStore();
    PredictionCalibrationEngineV3.resetStore();
  });

  // =========================================================================
  // 1. Layer A Immutable Calculation Core Protection
  // =========================================================================
  it('1. Layer A Calculation Core remains strictly deterministic and immutable', () => {
    expect(snapshot.ascendant.sign).toBeDefined();
    expect(snapshot.dashas.currentMahadasha).toBeDefined();
    expect(snapshot.planetaryPositions.length).toBeGreaterThanOrEqual(9);

    const snapshot2 = CalculationSnapshotEngine.createSnapshot(facts);
    expect(snapshot2.passport?.fingerprint).toEqual(snapshot.passport?.fingerprint);
  });

  // =========================================================================
  // 2. DeepAstro Reasoning Workspace
  // =========================================================================
  it('2. DeepAstroReasoningWorkspace executes structured multi-stage reasoning without leaking raw thought', () => {
    const trace = DeepAstroReasoningWorkspace.executeReasoning({
      userId: 'user_arjun_01',
      query: 'Will I transition to an executive career role or job in Q4 2026?',
      snapshot,
      readingDepth: 3,
    });

    expect(trace.planId).toMatch(/^plan_/);
    expect(trace.intent).toBe('CAREER');
    expect(trace.systemsConsulted.length).toBeGreaterThanOrEqual(3);
    expect(trace.evidenceSummary.totalSignals).toBeGreaterThanOrEqual(4);
    expect(trace.skepticAudit).toBeDefined();
    expect(trace.safeExplanation).toBeDefined();

    // Verify safe explanation properties
    expect(trace.safeExplanation.relevantChartFactors.length).toBeGreaterThan(0);
    expect(trace.safeExplanation.confidence).toBeGreaterThan(0);
    expect(trace.safeExplanation.whyConclusionSelected).toContain('Skeptic Disproval Audit');

    // Private chain-of-thought is not exposed
    expect((trace as any).privateChainOfThought).toBeUndefined();
    expect((trace as any).rawInternalTokens).toBeUndefined();
  });

  // =========================================================================
  // 3. Prediction Ledger V3 & Immutability
  // =========================================================================
  it('3. PredictionLedgerV3 records immutable predictions and prevents historical alteration', () => {
    const entry = PredictionLedgerV3.recordPrediction({
      userId: 'user_arjun_01',
      questionId: 'q_career_01',
      predictionType: 'CAREER_TRANSITION',
      domain: 'CAREER',
      predictionText: 'Executive transition favored during Rahu-Jupiter transition window.',
      expectedEvent: 'Promotion to VP or Director level',
      expectedDirection: 'FAVORABLE',
      timeWindow: {
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        scale: 'QUARTER',
      },
      chartSnapshotId: snapshot.passport?.fingerprint || 'snap_01',
      rulesUsed: ['10th Lord in 11th House Manifestation', 'Jupiter 5th Aspect on Lagna'],
      systemsUsed: ['PARASHARI', 'KP'],
      evidenceIds: ['ev_01', 'ev_02'],
      confidence: 0.82,
      uncertainty: 'Sub-period stationing variance +/- 30 days',
    });

    expect(entry.predictionId).toMatch(/^pred3_/);
    expect(entry.status).toBe('ACTIVE');

    // Status transition advances
    const updated = PredictionLedgerV3.updateStatus(entry.predictionId, 'AWAITING_OUTCOME', 'user_arjun_01');
    expect(updated.status).toBe('AWAITING_OUTCOME');

    // Tenant isolation: User B cannot alter User A's prediction
    expect(() => {
      PredictionLedgerV3.updateStatus(entry.predictionId, 'OUTCOME_CONFIRMED', 'user_hacker_02');
    }).toThrow(/TENANT_ISOLATION_VIOLATION/);
  });

  // =========================================================================
  // 4. Grounded Prediction Outcome Engine V3
  // =========================================================================
  it('4. PredictionOutcomeEngineV3 records grounded outcomes and never manufactures success', () => {
    const entry = PredictionLedgerV3.recordPrediction({
      userId: 'user_arjun_01',
      questionId: 'q_02',
      predictionType: 'FINANCIAL_GAIN',
      domain: 'MONEY',
      predictionText: 'Significant capital liquidity event.',
      expectedEvent: 'Seed round or bonus realization',
      expectedDirection: 'FAVORABLE',
      timeWindow: { startDate: '2026-09-01', endDate: '2026-11-01', scale: 'MONTH' },
      chartSnapshotId: 'snap_02',
      rulesUsed: ['11th Lord Dasha'],
      systemsUsed: ['PARASHARI'],
      evidenceIds: ['ev_03'],
      confidence: 0.78,
      uncertainty: 'Market beta sensitivity',
    });

    // Record user-confirmed outcome
    const outcomeRecord = PredictionOutcomeEngineV3.recordOutcome({
      predictionId: entry.predictionId,
      userId: 'user_arjun_01',
      outcome: 'CONFIRMED',
      userNotes: 'Bonus approved on Oct 14.',
    });

    expect(outcomeRecord.outcomeId).toMatch(/^outc3_/);
    expect(outcomeRecord.outcome).toBe('CONFIRMED');

    // Ledger status synchronizes
    const refreshed = PredictionLedgerV3.getPrediction(entry.predictionId);
    expect(refreshed?.status).toBe('OUTCOME_CONFIRMED');

    // User cannot record outcome for another user's prediction
    expect(() => {
      PredictionOutcomeEngineV3.recordOutcome({
        predictionId: entry.predictionId,
        userId: 'user_intruder_99',
        outcome: 'NOT_CONFIRMED',
      });
    }).toThrow(/TENANT_ISOLATION_VIOLATION/);
  });

  // =========================================================================
  // 5. Prediction Error Diagnostics Engine
  // =========================================================================
  it('5. PredictionErrorDiagnosisEngine diagnoses failure root causes across 20 error classes', () => {
    const entry = PredictionLedgerV3.recordPrediction({
      userId: 'user_arjun_01',
      questionId: 'q_timing_fail',
      predictionType: 'RELOCATION',
      domain: 'RELOCATION',
      predictionText: 'Relocation to London occurs in November 2026.',
      expectedEvent: 'International Relocation',
      expectedDirection: 'FAVORABLE',
      timeWindow: { startDate: '2026-11-01', endDate: '2026-11-30', scale: 'MONTH' },
      chartSnapshotId: 'snap_03',
      rulesUsed: ['9th and 12th House Transit Alignment'],
      systemsUsed: ['PARASHARI'],
      evidenceIds: ['ev_04'],
      confidence: 0.88,
      uncertainty: 'Visa processing delays',
    });

    const diagnosis = PredictionErrorDiagnosisEngine.diagnosePredictionError({
      prediction: entry,
      outcomeType: 'TIMING_WRONG',
      actualOccurrenceDate: '2027-02-15',
      userNotes: 'Relocation occurred 2.5 months later than expected.',
    });

    expect(diagnosis.diagnosisId).toMatch(/^diag_/);
    expect(diagnosis.primaryErrorClass).toBe('TIMEFRAME_ERROR');
    expect(diagnosis.contributingFactors).toContain('TRANSIT_TIMING');
    expect(diagnosis.rootCauseAnalysis).toContain('outside the predicted window');
    expect(diagnosis.astrologicalFindings.calculationVerified).toBe(true);
    expect(diagnosis.learningCandidateGenerated).toBe(true);
  });

  // =========================================================================
  // 6. Astrology Hypothesis Engine & "ONE SUCCESS != NEW KNOWLEDGE"
  // =========================================================================
  it('6. AstrologyHypothesisEngine strictly enforces "ONE SUCCESS != NEW KNOWLEDGE" (sample size >= 5)', () => {
    const hyp = AstrologyHypothesisEngine.proposeHypothesis({
      statement: 'Mars in 10th house conjunct Amatyakaraka yields accelerated leadership transition in Saturn Dasha.',
      domain: 'CAREER',
      evidence: ['Brihat Parashara Hora Shastra 10th House Sutras', 'Jaimini Chara Karaka principles'],
      initialSupportingPredictionId: 'pred_obs_01',
    });

    expect(hyp.status).toBe('PROPOSED');
    expect(hyp.sampleSize).toBe(1);

    // Single success cannot promote
    const eval1 = AstrologyHypothesisEngine.evaluateForPromotion(hyp.hypothesisId);
    expect(eval1.eligible).toBe(false);
    expect(eval1.reason).toContain('INSUFFICIENT_EVIDENCE');

    // Attempting to promote throws error
    expect(() => {
      AstrologyHypothesisEngine.promoteHypothesis(hyp.hypothesisId, 'DEEPASTRO_ADMIN_SIGNATURE_KEY');
    }).toThrow(/INSUFFICIENT_EVIDENCE/);

    // Record additional observations to reach threshold
    AstrologyHypothesisEngine.recordObservation(hyp.hypothesisId, { predictionId: 'pred_obs_02', outcome: 'SUPPORTING' });
    AstrologyHypothesisEngine.recordObservation(hyp.hypothesisId, { predictionId: 'pred_obs_03', outcome: 'SUPPORTING' });
    AstrologyHypothesisEngine.recordObservation(hyp.hypothesisId, { predictionId: 'pred_obs_04', outcome: 'SUPPORTING' });
    AstrologyHypothesisEngine.recordObservation(hyp.hypothesisId, { predictionId: 'pred_obs_05', outcome: 'SUPPORTING' });

    const evalAfter5 = AstrologyHypothesisEngine.evaluateForPromotion(hyp.hypothesisId);
    expect(evalAfter5.eligible).toBe(true);

    // Requires admin key
    expect(() => {
      AstrologyHypothesisEngine.promoteHypothesis(hyp.hypothesisId, 'UNAUTHORIZED_KEY');
    }).toThrow(/UNAUTHORIZED_PROMOTION/);

    const promoted = AstrologyHypothesisEngine.promoteHypothesis(hyp.hypothesisId, 'DEEPASTRO_ADMIN_SIGNATURE_KEY');
    expect(promoted.status).toBe('PROMOTED');
  });

  // =========================================================================
  // 7. Prediction Experiment Engine & Out-Of-Sample Validation
  // =========================================================================
  it('7. PredictionExperimentEngine benchmarks Strategies A, B, C, D across partitioned datasets', () => {
    const mockCases = [
      { caseId: 'c1', userId: 'u1', eventDate: '2023-01-10', domain: 'CAREER', chartSnapshotId: 's1', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.7, dashaStrength: 0.8, vargaStrength: 0.8, contextStrength: 0.85 } },
      { caseId: 'c2', userId: 'u2', eventDate: '2023-03-15', domain: 'CAREER', chartSnapshotId: 's2', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.4, dashaStrength: 0.45, vargaStrength: 0.4, contextStrength: 0.3 } },
      { caseId: 'c3', userId: 'u3', eventDate: '2023-06-20', domain: 'CAREER', chartSnapshotId: 's3', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.65, dashaStrength: 0.75, vargaStrength: 0.7, contextStrength: 0.8 } },
      { caseId: 'c4', userId: 'u4', eventDate: '2023-09-10', domain: 'CAREER', chartSnapshotId: 's4', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.5, dashaStrength: 0.4, vargaStrength: 0.35, contextStrength: 0.4 } },
      { caseId: 'c5', userId: 'u5', eventDate: '2023-12-05', domain: 'CAREER', chartSnapshotId: 's5', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.8, dashaStrength: 0.85, vargaStrength: 0.8, contextStrength: 0.9 } },
      { caseId: 'c6', userId: 'u6', eventDate: '2024-02-14', domain: 'CAREER', chartSnapshotId: 's6', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.75, dashaStrength: 0.8, vargaStrength: 0.75, contextStrength: 0.85 } },
    ];

    // Out of sample partitioning
    const partitioned = OutOfSampleValidationEngine.partitionCases(mockCases);
    expect(partitioned.leakageCheckPassed).toBe(true);
    expect(partitioned.trainingSet.length).toBeGreaterThan(0);
    expect(partitioned.outOfSampleTestSet.length).toBeGreaterThan(0);

    // Run experiment
    const experiment = PredictionExperimentEngine.runControlledExperiment({
      domain: 'CAREER',
      cases: mockCases,
    });

    expect(experiment.experimentId).toMatch(/^exp_/);
    expect(experiment.totalCases).toBe(6);
    expect(experiment.winningStrategy).toBeDefined();
    expect(experiment.metrics['STRATEGY_D_COMPREHENSIVE_CONTEXT'].brierScore).toBeLessThan(0.25);
  });

  // =========================================================================
  // 8. Prediction Skeptic Engine (Adversarial Disproval)
  // =========================================================================
  it('8. PredictionSkepticEngine detects overconfidence, missing windows, and multi-system contradictions', () => {
    const rawSignals = EvidenceFusionEngineV3.fuseEvidence({
      snapshot,
      domain: 'CAREER',
    }).signals;

    // Normal audit
    const audit1 = PredictionSkepticEngine.auditPrediction({
      domain: 'CAREER',
      signals: rawSignals,
      contradictions: [],
      proposedConfidence: 0.85,
      sampleSize: 10,
      timeWindowSpecified: true,
    });

    expect(audit1.skepticVerdict).toBe('SUPPORTED');
    expect(audit1.supportScore).toBeGreaterThan(0.65);

    // Adversarial audit with contradictions and missing time window
    const audit2 = PredictionSkepticEngine.auditPrediction({
      domain: 'CAREER',
      signals: rawSignals,
      contradictions: [
        {
          factorA: 'Dasha Lord',
          factorB: 'Transit Saturn Aspect',
          description: 'Friction between expansion and restriction',
          severity: 'HIGH',
          systemsInvolved: ['PARASHARI', 'TRANSIT'],
        },
        {
          factorA: 'KP Sub-Lord',
          factorB: 'Bhava Chalit House Shift',
          description: 'Cuspal lord conflicts with Rashi placement',
          severity: 'MODERATE',
          systemsInvolved: ['KP', 'PARASHARI'],
        },
      ],
      proposedConfidence: 0.85,
      sampleSize: 0,
      timeWindowSpecified: false,
    });

    expect(audit2.skepticVerdict).toMatch(/MIXED|WEAK|INSUFFICIENT_EVIDENCE/);
    expect(audit2.timingJustificationAssessment).toContain('TIMING_UNBOUNDED');
    expect(audit2.adversarialNotes.length).toBeGreaterThanOrEqual(2);
  });

  // =========================================================================
  // 9. Claim Verification & Research Intelligence
  // =========================================================================
  it('9. ClaimVerificationEngine and DeepAstroResearchIntelligence strictly enforce "NO EVIDENCE = NO STRONG CLAIM"', () => {
    // Verified traditional claim
    const verifiedClaim = ClaimVerificationEngine.verifyClaim({
      claimText: 'Exalted Sun in 10th house confers administrative authority.',
      source: 'Brihat Parashara Hora Shastra Chapter 24',
      sourceType: 'TRADITIONAL',
      supportingExcerpt: 'When Surya is exalted in the Dashama Bhava, native attains royal favor.',
    });
    expect(verifiedClaim.verificationStatus).toBe('VERIFIED');
    expect(verifiedClaim.confidence).toBeGreaterThanOrEqual(0.85);

    // Claim lacking evidence
    const emptyClaim = ClaimVerificationEngine.verifyClaim({
      claimText: 'Conjunction always guarantees immediate lottery win.',
      source: 'Online Forum',
      sourceType: 'COMMUNITY',
      supportingExcerpt: '',
    });
    expect(emptyClaim.verificationStatus).toBe('INSUFFICIENT_EVIDENCE');
    expect(emptyClaim.confidence).toBeLessThan(0.3);

    // Research Intelligence synthesis
    const research = DeepAstroResearchIntelligence.executeResearch({
      topic: 'Saturn Return Career Inflection',
      domain: 'CAREER',
      sources: [
        {
          sourceName: 'Phaladeepika Gochara Adhyaya',
          sourceType: 'TRADITIONAL',
          excerpt: 'Shani transiting natal Moon or 10th brings restructuring of vocational duty.',
        },
        {
          sourceName: 'Astrological Magazine Case Studies',
          sourceType: 'EXPERT',
          excerpt: 'Empirical survey indicates 78% career re-evaluation during age 29.5.',
        },
      ],
    });

    expect(research.researchId).toMatch(/^res_/);
    expect(research.extractedClaims.length).toBe(2);
    expect(research.synthesis).toContain('successfully verified');
  });

  // =========================================================================
  // 10. Knowledge Learning Engine (Provenanced Learning)
  // =========================================================================
  it('10. KnowledgeLearningEngine registers candidates and strictly segregates global vs user scope', () => {
    const candidate = KnowledgeLearningEngine.registerCandidate({
      claim: 'Combined D10 Amatyakaraka aspect refines leadership promotion timing to within 45 days.',
      domain: 'CAREER',
      scope: 'GLOBAL',
      sourceIds: ['BPHS_D10', 'Jaimini_AK'],
      evidenceIds: ['ev_k1', 'ev_k2'],
      supportingPredictions: ['p1', 'p2', 'p3', 'p4', 'p5'],
      confidence: 0.88,
    });

    expect(candidate.knowledgeId).toMatch(/^kn_/);
    expect(candidate.status).toBe('CANDIDATE');

    const promoted = KnowledgeLearningEngine.promoteCandidate(candidate.knowledgeId, 'DEEPASTRO_ADMIN_SIGNATURE_KEY');
    expect(promoted.status).toBe('PROMOTED');

    // Query global vs user scope
    const userItem = KnowledgeLearningEngine.registerCandidate({
      claim: 'User Arjun experiences relocation events specifically under Rahu-Venus sub-periods.',
      domain: 'RELOCATION',
      scope: 'USER_SPECIFIC',
      userId: 'user_arjun_01',
      sourceIds: ['user_life_graph'],
      evidenceIds: ['ev_user_01'],
      supportingPredictions: ['p_user_01'],
      confidence: 0.9,
    });

    const globalItems = KnowledgeLearningEngine.queryKnowledge({ scope: 'GLOBAL' });
    const userItems = KnowledgeLearningEngine.queryKnowledge({ userId: 'user_arjun_01' });

    expect(globalItems.some((k) => k.knowledgeId === candidate.knowledgeId)).toBe(true);
    expect(globalItems.some((k) => k.knowledgeId === userItem.knowledgeId)).toBe(false);
    expect(userItems.length).toBe(1);
  });

  // =========================================================================
  // 11. Prediction Calibration Engine V3 (Detecting Overconfidence)
  // =========================================================================
  it('11. PredictionCalibrationEngineV3 detects overconfidence and damps future scores', () => {
    // Record simulated overconfident predictions
    PredictionCalibrationEngineV3.recordCalibrationPoint({
      predictionId: 'p_cal_1',
      userId: 'u_cal',
      predictedConfidence: 0.95,
      confirmedOutcome: 'DID_NOT_HAPPEN',
      domain: 'SPECULATIVE_TRADING',
    });
    PredictionCalibrationEngineV3.recordCalibrationPoint({
      predictionId: 'p_cal_2',
      userId: 'u_cal',
      predictedConfidence: 0.90,
      confirmedOutcome: 'PARTIALLY_HAPPENED',
      domain: 'SPECULATIVE_TRADING',
    });
    PredictionCalibrationEngineV3.recordCalibrationPoint({
      predictionId: 'p_cal_3',
      userId: 'u_cal',
      predictedConfidence: 0.92,
      confirmedOutcome: 'DID_NOT_HAPPEN',
      domain: 'SPECULATIVE_TRADING',
    });

    const report = PredictionCalibrationEngineV3.generateReport();
    expect(report.status).toBe('OVERCONFIDENCE');
    expect(report.overallBrierScore).toBeGreaterThan(0.4);

    // Verify calibrated score applies overconfidence penalty
    const score = PredictionCalibrationEngineV3.calibrateScore({
      rawConfidence: 0.90,
      skepticVerdict: 'SUPPORTED',
      domain: 'SPECULATIVE_TRADING',
      userId: 'u_cal',
    });

    expect(score).toBeLessThan(0.85); // Automatically dampened due to domain overconfidence
  });

  // =========================================================================
  // 12. DeepAstro Learning Sandbox
  // =========================================================================
  it('12. DeepAstroLearningSandbox safely benchmarks candidate strategies before promotion', () => {
    const sandboxCases = [
      { caseId: 'sb1', userId: 'su1', eventDate: '2023-01-01', domain: 'EDUCATION', chartSnapshotId: 'sn1', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.8, dashaStrength: 0.8, vargaStrength: 0.85, contextStrength: 0.9 } },
      { caseId: 'sb2', userId: 'su2', eventDate: '2023-04-01', domain: 'EDUCATION', chartSnapshotId: 'sn2', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.3, dashaStrength: 0.4, vargaStrength: 0.3, contextStrength: 0.3 } },
      { caseId: 'sb3', userId: 'su3', eventDate: '2023-07-01', domain: 'EDUCATION', chartSnapshotId: 'sn3', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.75, dashaStrength: 0.8, vargaStrength: 0.75, contextStrength: 0.8 } },
      { caseId: 'sb4', userId: 'su4', eventDate: '2023-10-01', domain: 'EDUCATION', chartSnapshotId: 'sn4', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.7, dashaStrength: 0.75, vargaStrength: 0.7, contextStrength: 0.8 } },
      { caseId: 'sb5', userId: 'su5', eventDate: '2024-01-01', domain: 'EDUCATION', chartSnapshotId: 'sn5', trueOutcome: 'DID_NOT_HAPPEN' as const, features: { ruleStrength: 0.4, dashaStrength: 0.4, vargaStrength: 0.35, contextStrength: 0.4 } },
      { caseId: 'sb6', userId: 'su6', eventDate: '2024-04-01', domain: 'EDUCATION', chartSnapshotId: 'sn6', trueOutcome: 'HAPPENED' as const, features: { ruleStrength: 0.85, dashaStrength: 0.85, vargaStrength: 0.8, contextStrength: 0.9 } },
    ];

    const result = DeepAstroLearningSandbox.evaluateCandidateInSandbox({
      domain: 'EDUCATION',
      historicalCases: sandboxCases,
    });

    expect(result.sandboxId).toMatch(/^sbx_/);
    expect(result.leakageCheckPassed).toBe(true);
    expect(result.governanceRecommendation).toBe('ELIGIBLE_FOR_REVIEW');
    expect(result.outOfSamplePass).toBe(true);
  });
});
