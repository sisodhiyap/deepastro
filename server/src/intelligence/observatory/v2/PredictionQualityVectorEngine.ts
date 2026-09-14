/**
 * DeepAstro Observatory V2.0 - Quality Vector Engine
 * Produces 14-dimension PredictionQualityVector.
 * INVARIANT: Never collapses into a single score â€” all dimensions shown independently.
 */
import { PredictionQualityVector } from './ObservatoryV2Types.js';

export class PredictionQualityVectorEngine {
  public static compute(params: {
    predictionId: string;
    evidenceCount: number;
    contradictionCount: number;
    confidence: number;
    hasTimeWindow: boolean;
    hasDomain: boolean;
    hasDirection: boolean;
    hasMagnitude: boolean;
    isFalsifiable: boolean;
    falsifiabilityScore: number;
    hallucinationRisk: number;
    modelAgreementScore: number;
    hasCalculationAnchor: boolean;
    usedPostCutoffData: boolean;
    biasFlags: string[];
    unsupportedClaimRate: number;
    overconfidentLanguage: boolean;
  }): PredictionQualityVector {
    const notes: string[] = [];

    // evidence_quality: 0-1
    const evidence_quality = Math.min(1, params.evidenceCount / 5);
    if (params.evidenceCount < 2) notes.push('Low evidence count reduces quality');

    // testability: 0-1
    let testability = params.falsifiabilityScore;
    if (!params.hasDomain) testability -= 0.2;
    if (!params.hasTimeWindow) testability -= 0.2;
    testability = Math.max(0, Math.min(1, testability));

    // timing_precision: 0-1
    const timing_precision = params.hasTimeWindow ? (params.hasDomain ? 0.85 : 0.6) : 0.1;
    if (!params.hasTimeWindow) notes.push('No time window â€” timing precision very low');

    // event_specificity: 0-1
    let event_specificity = 0.5;
    if (params.hasDomain) event_specificity += 0.25;
    if (params.hasDirection) event_specificity += 0.15;
    if (params.hasMagnitude) event_specificity += 0.1;
    event_specificity = Math.min(1, event_specificity);

    // context_specificity: 0-1
    const context_specificity = params.hasDomain ? (params.hasDirection ? 0.8 : 0.6) : 0.3;

    // confidence_calibration: 0-1 (higher = better calibrated)
    let confidence_calibration = 0.7;
    if (params.overconfidentLanguage) { confidence_calibration -= 0.3; notes.push('Overconfident language detected'); }
    if (params.confidence > 0.85 && params.evidenceCount < 3) { confidence_calibration -= 0.2; }
    if (params.confidence < 0.3 && params.evidenceCount >= 4) { confidence_calibration -= 0.1; }
    confidence_calibration = Math.max(0, Math.min(1, confidence_calibration));

    // contradiction_level: 0-1 (higher = more contradicted = worse)
    const contradiction_level = Math.min(1, params.contradictionCount / 3);
    if (params.contradictionCount > 1) notes.push('Significant contradictions present');

    // unsupported_claim_risk: 0-1
    const unsupported_claim_risk = Math.min(1, params.unsupportedClaimRate);

    // hallucination_risk: 0-1
    const hallucination_risk = Math.min(1, params.hallucinationRisk);
    if (params.hallucinationRisk > 0.5) notes.push('Elevated hallucination risk detected');

    // bias_risk: 0-1
    const bias_risk = Math.min(1, params.biasFlags.length / 4);
    if (params.biasFlags.length > 0) notes.push(`Bias flags: ${params.biasFlags.join(', ')}`);

    // falsifiability: 0-1
    const falsifiability = params.isFalsifiable ? params.falsifiabilityScore : 0.1;

    // model_agreement: 0-1
    const model_agreement = Math.max(0, Math.min(1, params.modelAgreementScore));

    // calculation_integrity: 0-1
    const calculation_integrity = params.hasCalculationAnchor ? 0.95 : 0.4;
    if (!params.hasCalculationAnchor) notes.push('No deterministic calculation anchor detected');

    // temporal_integrity: 0-1
    const temporal_integrity = params.usedPostCutoffData ? 0.0 : 0.95;
    if (params.usedPostCutoffData) notes.push('CRITICAL: Post-cutoff data detected â€” temporal integrity violated');

    return {
      predictionId: params.predictionId,
      evidence_quality, testability, timing_precision, event_specificity,
      context_specificity, confidence_calibration, contradiction_level,
      unsupported_claim_risk, hallucination_risk, bias_risk, falsifiability,
      model_agreement, calculation_integrity, temporal_integrity,
      computedAt: new Date().toISOString(), notes,
    };
  }
}
