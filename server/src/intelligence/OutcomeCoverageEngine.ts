/**
 * DeepAstro 4.2 — Outcome Coverage Engine (OutcomeCoverageEngine)
 * Calculates outcome coverage across historical predictions:
 * 
 * Coverage = (Confirmed + Partially Confirmed + Not Confirmed) / Total Predictions
 * 
 * Invariant: Outcome Coverage is strictly NOT Accuracy.
 * Clearly separates resolved cases from unresolved/unknown cases.
 */

export interface OutcomeCoverageStats {
  totalPredictions: number;
  confirmedCount: number;
  partiallyConfirmedCount: number;
  notConfirmedCount: number;
  unknownCount: number;
  expiredCount: number;
  resolvedCount: number;
  outcomeCoveragePercent: number; // 0.0 to 100.0%
  coverageStatus: 'HIGH_COVERAGE' | 'MODERATE_COVERAGE' | 'LOW_COVERAGE' | 'INSUFFICIENT_DATA';
  explanation: string;
}

export class OutcomeCoverageEngine {
  public static calculateCoverage(predictions: Array<{
    status: string;
  }>): OutcomeCoverageStats {
    const total = predictions.length;

    if (total === 0) {
      return {
        totalPredictions: 0,
        confirmedCount: 0,
        partiallyConfirmedCount: 0,
        notConfirmedCount: 0,
        unknownCount: 0,
        expiredCount: 0,
        resolvedCount: 0,
        outcomeCoveragePercent: 0,
        coverageStatus: 'INSUFFICIENT_DATA',
        explanation: 'No predictions recorded in system.',
      };
    }

    let confirmed = 0;
    let partial = 0;
    let notConfirmed = 0;
    let unknown = 0;
    let expired = 0;

    for (const p of predictions) {
      const s = p.status.toUpperCase();
      if (s === 'OUTCOME_CONFIRMED' || s === 'CONFIRMED') confirmed++;
      else if (s === 'OUTCOME_PARTIAL' || s === 'PARTIALLY_CONFIRMED') partial++;
      else if (s === 'OUTCOME_FAILED' || s === 'NOT_CONFIRMED') notConfirmed++;
      else if (s === 'EXPIRED') expired++;
      else unknown++;
    }

    const resolved = confirmed + partial + notConfirmed;
    const coveragePercent = Number(((resolved / total) * 100).toFixed(1));

    let coverageStatus: 'HIGH_COVERAGE' | 'MODERATE_COVERAGE' | 'LOW_COVERAGE' | 'INSUFFICIENT_DATA' = 'LOW_COVERAGE';
    if (resolved < 5) {
      coverageStatus = 'INSUFFICIENT_DATA';
    } else if (coveragePercent >= 65) {
      coverageStatus = 'HIGH_COVERAGE';
    } else if (coveragePercent >= 40) {
      coverageStatus = 'MODERATE_COVERAGE';
    }

    const explanation = `Outcome Coverage represents ${coveragePercent}% of predictions resolved (${resolved}/${total}). This is NOT an astrological accuracy percentage; it represents empirical outcome resolution rate.`;

    return {
      totalPredictions: total,
      confirmedCount: confirmed,
      partiallyConfirmedCount: partial,
      notConfirmedCount: notConfirmed,
      unknownCount: unknown,
      expiredCount: expired,
      resolvedCount: resolved,
      outcomeCoveragePercent: coveragePercent,
      coverageStatus,
      explanation,
    };
  }
}
