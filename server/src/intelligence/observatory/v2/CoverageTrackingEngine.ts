/**
 * DeepAstro Observatory V2.0 - Coverage Tracking Engine
 * Tracks prediction coverage to prevent gaming through suppression.
 * CRITICAL: A system cannot improve its score by making fewer predictions.
 * INVARIANT: Report ACCURACY and COVERAGE together always.
 */
import { CoverageMetrics } from './ObservatoryV2Types.js';

export class CoverageTrackingEngine {
  public static compute(params: {
    totalPredictions: number;
    testablePredictions: number;
    confirmedOutcomes: number;
    partialOutcomes: number;
    unknownOutcomes: number;
    suppressedPredictions: number;
    correctPredictions?: number;
    missedEvents?: number;
  }): CoverageMetrics {
    const {
      totalPredictions, testablePredictions, confirmedOutcomes,
      partialOutcomes, unknownOutcomes, suppressedPredictions,
      correctPredictions, missedEvents,
    } = params;

    const total = Math.max(1, totalPredictions);
    const testable = Math.max(1, testablePredictions);
    const coverage = confirmedOutcomes / total;
    const testableCoverage = testablePredictions > 0 ? confirmedOutcomes / testablePredictions : 0;
    const suppressionRate = suppressedPredictions / total;
    const unknownRate = unknownOutcomes / total;

    // Precision: of confirmed outcomes, how many were correct
    const precision = correctPredictions !== undefined && confirmedOutcomes > 0
      ? correctPredictions / confirmedOutcomes : null;
    // Recall: of all actual events, how many did we predict
    const recall = correctPredictions !== undefined && missedEvents !== undefined && missedEvents >= 0
      ? correctPredictions / Math.max(1, correctPredictions + missedEvents) : null;

    return {
      totalPredictions, testablePredictions, confirmedOutcomes, partialOutcomes,
      unknownOutcomes, suppressedPredictions, coverage, testableCoverage,
      precision, recall, suppressionRate, unknownRate, computedAt: new Date().toISOString(),
    };
  }

  public static validateSuppression(
    beforeSuppression: CoverageMetrics,
    afterSuppression: CoverageMetrics
  ): { isGaming: boolean; reason: string } {
    const suppressionIncrease = afterSuppression.suppressionRate - beforeSuppression.suppressionRate;
    if (
      suppressionIncrease >= 0.15 ||
      (suppressionIncrease > 0.1 && afterSuppression.confirmedOutcomes <= beforeSuppression.confirmedOutcomes) ||
      (afterSuppression.precision !== null && beforeSuppression.precision !== null &&
       afterSuppression.precision > beforeSuppression.precision + 0.05 &&
       afterSuppression.confirmedOutcomes <= beforeSuppression.confirmedOutcomes)
    ) {
      return {
        isGaming: true,
        reason: 'Suppression rate increased significantly without improving confirmed outcomes — GAMING DETECTED',
      };
    }
    return { isGaming: false, reason: 'Suppression pattern appears legitimate' };
  }
}
