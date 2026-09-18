/**
 * DeepAstro 7.0 — Future Confidence Engine (FutureConfidenceEngine)
 * Rigorously calibrates predictive confidence without ever claiming 100% certainty.
 * 
 * Epistemic Rules:
 * 1. NEVER display 100%.
 * 2. NEVER imply a guaranteed future or unalterable fate.
 * 3. Categorize strictly as HIGH SUPPORT | MODERATE SUPPORT | LOW SUPPORT | INSUFFICIENT SIGNAL.
 */

export type ConfidenceSupportLevel = 'HIGH SUPPORT' | 'MODERATE SUPPORT' | 'LOW SUPPORT' | 'INSUFFICIENT SIGNAL';

export interface ConfidenceEvaluation {
  level: ConfidenceSupportLevel;
  normalizedPercentage: number; // Strictly capped at 88%
  explanation: string;
  supportingFactorsCount: number;
  contradictionsCount: number;
  epistemicDisclaimer: string;
}

export class FutureConfidenceEngine {
  public static evaluate(
    convergingCount: number,
    totalCount: number,
    contradictionCount: number,
    isApproximateBirthTime: boolean
  ): ConfidenceEvaluation {
    const rawRatio = totalCount > 0 ? convergingCount / totalCount : 0.5;

    let score = rawRatio * 85; // Baseline scale up to 85%
    if (contradictionCount > 0) score -= contradictionCount * 8;
    if (isApproximateBirthTime) score -= 12;

    // Strict boundary enforcement: NEVER 100%
    const cappedScore = Math.max(25, Math.min(88, Math.round(score)));

    let level: ConfidenceSupportLevel = 'MODERATE SUPPORT';
    let explanation = 'Multiple classical systems indicate congruent developmental patterns with minor contradictory timing factors.';

    if (totalCount < 3 || isApproximateBirthTime && contradictionCount > 1) {
      level = 'INSUFFICIENT SIGNAL';
      explanation = 'Astrological indicators lack sufficient alignment or birth time precision to warrant high-confidence projection.';
    } else if (cappedScore >= 75) {
      level = 'HIGH SUPPORT';
      explanation = 'High harmonic convergence across operating dasha lords, major transits, and vargas without critical contradictions.';
    } else if (cappedScore >= 50) {
      level = 'MODERATE SUPPORT';
      explanation = 'Supportive directional themes present with some timing friction between dasha potential and transit pressure.';
    } else {
      level = 'LOW SUPPORT';
      explanation = 'Diverging signals across predictive models recommend grounded personal discernment and prudent pacing.';
    }

    return {
      level,
      normalizedPercentage: cappedScore,
      explanation,
      supportingFactorsCount: convergingCount,
      contradictionsCount: contradictionCount,
      epistemicDisclaimer: 'No astrological reading can or should assert an unalterable future. Conscious human agency, Dharmic choices, and environmental realities remain paramount.',
    };
  }
}
