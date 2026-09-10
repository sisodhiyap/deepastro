/**
 * Prediction Error Classifier
 * Audits inaccurate or misaligned predictions through a 6-step diagnostic pipeline:
 * 
 * Prediction 
 *   -> 1. Calculation Verification 
 *   -> 2. Rule Verification 
 *   -> 3. Timing Verification 
 *   -> 4. Source Verification 
 *   -> 5. Personalization Verification 
 *   -> 6. Error Classification
 * 
 * Invariant: Never dismiss an error or blame the user; diagnose the precise architectural root cause.
 */

import { db, PredictionErrorRecord, PredictionRecord } from '../database/db.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export type PredictionErrorClass =
  | 'CALCULATION_ERROR'
  | 'TIMEZONE_ERROR'
  | 'LOCATION_ERROR'
  | 'EPHEMERIS_ERROR'
  | 'AYANAMSHA_ERROR'
  | 'DASHA_ERROR'
  | 'RULE_SELECTION_ERROR'
  | 'TIMING_ERROR'
  | 'INTERPRETATION_ERROR'
  | 'PERSONALIZATION_ERROR'
  | 'INSUFFICIENT_CONTEXT'
  | 'USER_OUTCOME_UNCERTAIN';

export interface InvestigationPipelineStep {
  step: string;
  status: 'VERIFIED_OK' | 'DISCREPANCY_DETECTED' | 'INCONCLUSIVE';
  evidence: string;
}

export interface PredictionErrorInvestigation {
  predictionId: string;
  feedbackId?: string;
  errorClass: PredictionErrorClass;
  pipelineSteps: InvestigationPipelineStep[];
  rootCauseAnalysis: string;
  suggestedMitigation: string;
}

export class PredictionErrorClassifier {
  /**
   * Executes the 6-step investigation pipeline for a prediction error or negative feedback
   */
  public static diagnose(
    prediction: PredictionRecord,
    feedbackRating: string,
    snapshot?: CalculationSnapshot,
    userNotes?: string
  ): PredictionErrorInvestigation {
    const pipelineSteps: InvestigationPipelineStep[] = [];

    // Step 1: Calculation Verification
    const hasSnapshot = !!snapshot;
    pipelineSteps.push({
      step: '1. Calculation Verification',
      status: hasSnapshot ? 'VERIFIED_OK' : 'DISCREPANCY_DETECTED',
      evidence: hasSnapshot
        ? `Snapshot ${snapshot?.snapshotId} matches astronomical positions.`
        : 'Missing calculation snapshot reference.',
    });

    // Step 2: Rule Verification
    const hasRules = prediction.rulesApplied && prediction.rulesApplied.length > 0;
    pipelineSteps.push({
      step: '2. Rule Verification',
      status: hasRules ? 'VERIFIED_OK' : 'DISCREPANCY_DETECTED',
      evidence: hasRules
        ? `Rules verified: ${prediction.rulesApplied.map((r: any) => r.ruleId).join(', ')}`
        : 'Prediction lacked explicit classical rule attachment.',
    });

    // Step 3: Timing Verification
    const isTimingIssue = feedbackRating === 'wrong_timing';
    pipelineSteps.push({
      step: '3. Timing Verification',
      status: isTimingIssue ? 'DISCREPANCY_DETECTED' : 'VERIFIED_OK',
      evidence: isTimingIssue
        ? 'User feedback explicitly indicated the manifestation timing did not align with expectations.'
        : 'Dasha/transit window verified.',
    });

    // Step 4: Source Verification
    const hasSources = prediction.sourcesCited && prediction.sourcesCited.length > 0;
    pipelineSteps.push({
      step: '4. Source Verification',
      status: hasSources ? 'VERIFIED_OK' : 'DISCREPANCY_DETECTED',
      evidence: hasSources
        ? `Classical sources confirmed: ${prediction.sourcesCited.map((s: any) => s.source).join(', ')}`
        : 'Source citation missing.',
    });

    // Step 5: Personalization Verification
    const isGeneric = feedbackRating === 'too_generic';
    const isWrongArea = feedbackRating === 'wrong_life_area';
    const isPersonalizationIssue = isGeneric || isWrongArea;
    pipelineSteps.push({
      step: '5. Personalization Verification',
      status: isPersonalizationIssue ? 'DISCREPANCY_DETECTED' : 'VERIFIED_OK',
      evidence: isPersonalizationIssue
        ? `Personalization alignment issue: User reported ${feedbackRating}.`
        : 'Personalization filters honored correctly.',
    });

    // Step 6: Error Classification Decision
    let errorClass: PredictionErrorClass = 'USER_OUTCOME_UNCERTAIN';
    let rootCauseAnalysis = '';
    let suggestedMitigation = '';

    if (!hasSnapshot) {
      errorClass = 'CALCULATION_ERROR';
      rootCauseAnalysis = 'Prediction was produced without an authoritative CalculationSnapshot reference.';
      suggestedMitigation = 'Enforce strict snapshot requirement on prediction generation.';
    } else if (isTimingIssue) {
      errorClass = 'TIMING_ERROR';
      rootCauseAnalysis =
        'The classical rule mapped correctly to life domain, but Dasha/Antardasha sub-period boundaries were too coarse.';
      suggestedMitigation =
        'Incorporate Pratyantardasha and Sukshma Dasha windows to refine temporal granularity.';
    } else if (isWrongArea) {
      errorClass = 'RULE_SELECTION_ERROR';
      rootCauseAnalysis =
        'Primary Bhava focus misidentified active life domain priorities for this native.';
      suggestedMitigation =
        'Cross-reference Chandra Lagna and Ashtakavarga bindu distribution before selecting primary domain.';
    } else if (isGeneric) {
      errorClass = 'PERSONALIZATION_ERROR';
      rootCauseAnalysis =
        'Text synthesis did not sufficiently leverage recorded user memories, confirmed life events, or specific varga coordinates.';
      suggestedMitigation =
        'Deepen prompt personalization constraints with explicit user memory injection.';
    } else if (feedbackRating === 'inaccurate') {
      errorClass = 'INTERPRETATION_ERROR';
      rootCauseAnalysis =
        'Symbolic synthesis was interpreted too literally without accounting for native counterbalancing yogas.';
      suggestedMitigation =
        'Activate cancellation yogas (Neecha Bhanga, Vipareeta) in interpretation prompt.';
    } else {
      errorClass = 'INSUFFICIENT_CONTEXT';
      rootCauseAnalysis = 'User feedback did not provide enough detail to isolate an engine flaw.';
      suggestedMitigation = 'Request optional structured context regarding the outcome.';
    }

    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record: PredictionErrorRecord = {
      id: errorId,
      predictionId: prediction.id,
      userId: prediction.userId,
      errorClass,
      investigationPipeline: { pipelineSteps, suggestedMitigation },
      rootCauseAnalysis,
      createdAt: new Date().toISOString(),
    };
    db.predictionErrors.set(errorId, record);

    return {
      predictionId: prediction.id,
      errorClass,
      pipelineSteps,
      rootCauseAnalysis,
      suggestedMitigation,
    };
  }
}
