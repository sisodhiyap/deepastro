/**
 * DeepAstro Prediction Usefulness Engine
 * Quantifies whether a prediction is specific and decision-actionable versus trivial or unusable.
 */

export class PredictionUsefulnessEngine {
  public static evaluateUsefulness(params: {
    claimText: string;
    isBarnum: boolean;
    timingSpanDays: number;
  }): {
    actionabilityScore: number;
    specificityScore: number;
    usefulnessScore: number;
    classification: 'HIGH_UTILITY' | 'MODERATE_UTILITY' | 'LOW_UTILITY' | 'TRIVIAL';
  } {
    const { claimText, isBarnum, timingSpanDays } = params;

    let specificity = 0.7;
    let actionability = 0.6;

    if (isBarnum) {
      specificity = 0.1;
      actionability = 0.1;
    }

    if (timingSpanDays > 365) {
      specificity *= 0.6;
    } else if (timingSpanDays <= 60) {
      specificity = Math.min(1.0, specificity * 1.3);
    }

    const words = claimText.split(/\s+/).length;
    if (words > 12) actionability = Math.min(1.0, actionability + 0.2);

    const usefulnessScore = Number(((specificity * 0.5) + (actionability * 0.5)).toFixed(3));

    let classification: 'HIGH_UTILITY' | 'MODERATE_UTILITY' | 'LOW_UTILITY' | 'TRIVIAL' = 'MODERATE_UTILITY';
    if (usefulnessScore >= 0.75) classification = 'HIGH_UTILITY';
    else if (usefulnessScore < 0.3) classification = 'TRIVIAL';
    else if (usefulnessScore < 0.5) classification = 'LOW_UTILITY';

    return {
      actionabilityScore: Number(actionability.toFixed(3)),
      specificityScore: Number(specificity.toFixed(3)),
      usefulnessScore,
      classification,
    };
  }
}
