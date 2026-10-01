/**
 * ConfidenceEngine.ts
 * Rigorously calculates signal convergence and confidence.
 * Translates multi-system alignment into:
 * - Signal Confidence: HIGH, MODERATE, LOW
 * - Astrological Signal Strength: VERY_LOW, LOW, MODERATE, STRONG, VERY_STRONG
 * Strictly non-probabilistic: Explicitly represents convergence of chart signals, not certainty of an event.
 */

import { ConfidenceLevel, SignalStrengthLevel, PredictionEvidence } from './types.js';
import { predictionScoringEngine } from './PredictionWeights.js';

export interface ConfidenceEvaluation {
  level: ConfidenceLevel;
  score: number; // 0-100
  signalStrength: SignalStrengthLevel;
  independentSignalCount: number;
  contradictionCount: number;
  explanation: string;
}

export class PredictionConfidenceEngine {
  /**
   * Computes deterministic signal confidence based on independent evidence sources and contradiction count.
   */
  public static evaluate(
    evidenceList: PredictionEvidence[],
    baseScore: number = 75
  ): ConfidenceEvaluation {
    const uniqueSources = new Set(evidenceList.map((e) => e.source));
    const supporting = evidenceList.filter((e) => e.direction === 'SUPPORTIVE');
    const challenging = evidenceList.filter((e) => e.direction === 'CHALLENGING');

    const res = predictionScoringEngine.evaluateConfidence(
      supporting.length,
      challenging.length,
      baseScore
    );

    const signalStrength = predictionScoringEngine.normalizeStrength(res.confidenceScore);

    const explanation =
      res.confidence === 'HIGH'
        ? 'High Signal Convergence: Multiple independent chart layers (Dasha, Gochara transits, and Vargas) converge upon this theme.'
        : res.confidence === 'MODERATE'
        ? 'Moderate Signal Convergence: Supportive indications present with minor counter-balancing factors.'
        : 'Emerging Signal: Primary indications require further long-term consolidation.';

    return {
      level: res.confidence,
      score: res.confidenceScore,
      signalStrength,
      independentSignalCount: uniqueSources.size,
      contradictionCount: challenging.length,
      explanation,
    };
  }
}
