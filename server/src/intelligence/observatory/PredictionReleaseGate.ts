/**
 * DeepAstro Prediction Release Gate
 * Determines release status: RELEASE, RELEASE_WITH_UNCERTAINTY, SOFTEN, REQUEST_MORE_CONTEXT, SUPPRESS, UNKNOWN.
 * Invariant: If evidence is insufficient, DeepAstro never invents a forecast.
 */

import { PredictionClaim, ReleaseDecision } from './ObservatoryTypes.js';
import { PredictionQualityGate } from './PredictionQualityGate.js';
import { PredictionSuppressionEngine } from './PredictionSuppressionEngine.js';

export interface ReleaseEvaluationResult {
  decision: ReleaseDecision;
  userFacingExplanation?: string;
  qualityScore: number;
}

export class PredictionReleaseGate {
  public static evaluateRelease(claim: PredictionClaim): ReleaseEvaluationResult {
    // 1. Check suppression engine first
    const suppression = PredictionSuppressionEngine.shouldSuppress(claim);
    if (suppression.suppress) {
      return {
        decision: 'SUPPRESS',
        userFacingExplanation: suppression.reason,
        qualityScore: 0.1,
      };
    }

    const quality = PredictionQualityGate.evaluateQuality(claim);

    if (quality.compositeScore >= 0.75) {
      return { decision: 'RELEASE', qualityScore: quality.compositeScore };
    }

    if (quality.compositeScore >= 0.55) {
      return {
        decision: 'RELEASE_WITH_UNCERTAINTY',
        userFacingExplanation: 'Favorable alignment exists with moderate epistemic uncertainty.',
        qualityScore: quality.compositeScore,
      };
    }

    if (claim.isOverconfident) {
      return {
        decision: 'SOFTEN',
        userFacingExplanation: 'Language moderated to reflect probabilistic nature of transits.',
        qualityScore: quality.compositeScore,
      };
    }

    return {
      decision: 'REQUEST_MORE_CONTEXT',
      userFacingExplanation: 'Additional context or precise birth details required for a reliable projection.',
      qualityScore: quality.compositeScore,
    };
  }
}
