/**
 * DeepAstro Prediction Quality Gate
 * Evaluates the full quality vector before a forecast reaches user-facing presentation.
 */

import { PredictionClaim, PredictionQualityVector } from './ObservatoryTypes.js';

export class PredictionQualityGate {
  public static evaluateQuality(claim: PredictionClaim): PredictionQualityVector {
    let evidenceQuality = claim.evidenceIds.length > 0 ? 0.8 : 0.1;
    let testability = claim.testability === 'TESTABLE' ? 0.9 : claim.testability === 'PARTIALLY_TESTABLE' ? 0.6 : 0.2;
    let calibration = claim.confidence <= 0.85 ? 0.85 : 0.4;
    let outcomeMatch = 0.7;
    let timingPrecision = claim.timingWindow.startDate ? 0.8 : 0.3;

    let contradictionPenalty = claim.contradictionIds.length * 0.15;
    contradictionPenalty = Math.min(0.6, contradictionPenalty);

    let unsupportedClaimPenalty = claim.evidenceIds.length === 0 ? 0.5 : 0.0;
    let overconfidencePenalty = claim.isOverconfident ? 0.3 : 0.0;
    let hallucinationPenalty = 0.0;
    let temporalIntegrity = 1.0;

    const positiveSum = evidenceQuality * 0.3 + testability * 0.3 + calibration * 0.2 + timingPrecision * 0.2;
    const penaltySum = contradictionPenalty + unsupportedClaimPenalty + overconfidencePenalty;
    const compositeScore = Number(Math.max(0.05, Math.min(0.98, positiveSum - penaltySum)).toFixed(3));

    return {
      evidenceQuality,
      testability,
      calibration,
      outcomeMatch,
      timingPrecision,
      contradictionPenalty,
      unsupportedClaimPenalty,
      overconfidencePenalty,
      hallucinationPenalty,
      temporalIntegrity,
      compositeScore,
    };
  }
}
