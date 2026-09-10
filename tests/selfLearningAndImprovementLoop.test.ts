/**
 * DeepAstro Self-Learning & Improvement Loop Test Suite
 * Validates:
 * 1. User feedback logging as USER_OUTCOME_EVIDENCE without doctrine conflation.
 * 2. 6-step error classification for negative feedback.
 * 3. Improvement Proposal creation and automated Regression Gate execution.
 * 4. Mandatory administrative approval gate (zero silent mutation).
 * 5. Versioned release registry update.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { CuratedPredictionEngine } from '../server/src/learning/CuratedPredictionEngine.js';
import { OutcomeLearningEngine } from '../server/src/learning/OutcomeLearningEngine.js';
import { PredictionErrorClassifier } from '../server/src/learning/PredictionErrorClassifier.js';
import { SelfImprovementLoop } from '../server/src/learning/SelfImprovementLoop.js';
import { KnowledgeTaxonomyEngine } from '../server/src/learning/KnowledgeTaxonomy.js';
import { db } from '../server/src/database/db.js';

describe('DeepAstro Self-Learning & Improvement Loop Suite', () => {
  const userId = 'user_researcher_99';
  const adminId = 'admin_chief_auditor_01';

  const factSet = VedicAstroEngine.createAstrologyFactSet({
    name: 'Deepti',
    birthDate: '1988-03-02',
    birthTime: '07:15',
    birthPlace: 'Agra, UP, India',
    latitude: 27.1767,
    longitude: 78.0081,
    timezone: 5.5,
  });
  const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, userId);

  beforeEach(() => {
    db.predictionRecords.clear();
    db.predictionFeedback.clear();
    db.predictionErrors.clear();
    db.improvementProposals.clear();
  });

  it('records feedback as USER_OUTCOME_EVIDENCE and prevents doctrinal conflation', () => {
    const prediction = CuratedPredictionEngine.generatePrediction(userId, snapshot, 'Career');

    const { feedbackRecord, outcomeEvidence } = OutcomeLearningEngine.recordFeedback(userId, {
      predictionId: prediction.id,
      rating: 'accurate',
      notes: 'Job promotion occurred within the highlighted timeframe.',
    });

    expect(feedbackRecord.id).toBeDefined();
    expect(feedbackRecord.feedbackRating).toBe('accurate');

    // Assert strictly categorized as USER_OUTCOME_EVIDENCE
    expect(outcomeEvidence.category).toBe('USER_OUTCOME_EVIDENCE');
    expect(outcomeEvidence.isCanonicalDoctrine).toBe(false);

    // Assert knowledge taxonomy validation rejects marking outcome as canonical doctrine
    expect(() => {
      KnowledgeTaxonomyEngine.validateCitation({
        ...outcomeEvidence,
        isCanonicalDoctrine: true, // Forbidden violation
      });
    }).toThrow(/Epistemological Violation/i);
  });

  it('runs 6-step error diagnosis when user reports wrong timing or inaccuracy', () => {
    const prediction = CuratedPredictionEngine.generatePrediction(userId, snapshot, 'Finance');

    const storedPred = db.predictionRecords.get(prediction.id)!;
    const diagnosis = PredictionErrorClassifier.diagnose(
      storedPred,
      'wrong_timing',
      snapshot,
      'Financial gains happened 3 months later than predicted.'
    );

    expect(diagnosis.errorClass).toBe('TIMING_ERROR');
    expect(diagnosis.pipelineSteps).toHaveLength(5);
    expect(diagnosis.rootCauseAnalysis).toContain('Dasha');
    expect(diagnosis.suggestedMitigation).toContain('Pratyantardasha');

    // Assert saved in prediction errors table
    expect(db.predictionErrors.size).toBe(1);
  });

  it('enforces automated regression gating and administrative approval before version promotion', () => {
    // 1. Create an Improvement Proposal
    const proposal = SelfImprovementLoop.createProposal({
      title: 'Refine Pratyantardasha Sub-Periods in Finance Engine',
      description: 'Integrate Sukshma Dasha windows to resolve timing discrepancies.',
      targetEngine: 'TIMING',
      proposedChanges: { subPeriodGranularity: 'DAYS' },
      createdBy: 'SELF_LEARNING_PIPELINE',
    });

    expect(proposal.status).toBe('PENDING_REVIEW');

    // 2. Attempting to approve without passing regression gate MUST fail
    expect(() => {
      SelfImprovementLoop.approveProposal(proposal.id, adminId);
    }).toThrow(/Regression Gate Violation/i);

    // 3. Run automated regression gate
    const regressionSummary = SelfImprovementLoop.runRegressionGate(proposal.id);
    expect(regressionSummary.passed).toBe(true);
    expect(regressionSummary.deeptiCalibrationPassed).toBe(true);
    expect(regressionSummary.astronomicalInvariancePreserved).toBe(true);

    // 4. Now approve with admin authority
    const { proposal: approved, newEngineVersion } = SelfImprovementLoop.approveProposal(
      proposal.id,
      adminId
    );

    expect(approved.status).toBe('APPROVED');
    expect(approved.reviewedBy).toBe(adminId);
    expect(newEngineVersion).toBeDefined();
    expect(newEngineVersion?.isActive).toBe(true);
  });

  it('blocks proposals that attempt to modify astronomical ephemeris core', () => {
    const maliciousProposal = SelfImprovementLoop.createProposal({
      title: 'Attempt Ephemeris Mutation',
      description: 'Attempting to override VSOP87 planetary longitude calculation directly.',
      targetEngine: 'ASTRONOMY' as any,
      proposedChanges: { modify_ephemeris: true },
    });

    const regression = SelfImprovementLoop.runRegressionGate(maliciousProposal.id);
    expect(regression.passed).toBe(false);
    expect(regression.astronomicalInvariancePreserved).toBe(false);

    // Must be impossible to approve
    expect(() => {
      SelfImprovementLoop.approveProposal(maliciousProposal.id, adminId);
    }).toThrow(/Regression Gate Violation/i);
  });
});
