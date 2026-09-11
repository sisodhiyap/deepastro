/**
 * DeepAstro Outcome Learning Engine
 * Calibrates prediction confidence based strictly on user-confirmed outcomes.
 * Enforces statistical validity: displays INSUFFICIENT DATA when sample size < 5.
 */

export type OutcomeVerdict = 'SUCCESS' | 'PARTIAL' | 'NOT_OCCURRED' | 'UNCLEAR' | 'USER_DECLINED';

export interface OutcomeRecord {
  predictionId: string;
  userId: string;
  predictedDirection: string;
  forecastDate: string;
  confirmedDate: string;
  verdict: OutcomeVerdict;
  notes?: string;
}

export interface CalibrationReport {
  userId: string;
  totalOutcomes: number;
  verdictCounts: Record<OutcomeVerdict, number>;
  brierScore: number | null; // null if insufficient data
  status: 'INSUFFICIENT_DATA' | 'CALIBRATED';
  calibrationSummary: string;
}

export class OutcomeLearningEngine {
  private static outcomes: Map<string, OutcomeRecord[]> = new Map();

  public static recordOutcome(outcome: OutcomeRecord): void {
    const list = this.outcomes.get(outcome.userId) || [];
    list.push(outcome);
    this.outcomes.set(outcome.userId, list);
  }

  public static getCalibration(userId: string): CalibrationReport {
    const list = this.outcomes.get(userId) || [];
    const counts: Record<OutcomeVerdict, number> = {
      SUCCESS: 0,
      PARTIAL: 0,
      NOT_OCCURRED: 0,
      UNCLEAR: 0,
      USER_DECLINED: 0,
    };

    for (const item of list) {
      counts[item.verdict] = (counts[item.verdict] || 0) + 1;
    }

    const total = list.length;
    if (total < 5) {
      return {
        userId,
        totalOutcomes: total,
        verdictCounts: counts,
        brierScore: null,
        status: 'INSUFFICIENT_DATA',
        calibrationSummary: `Your recorded outcomes (${total}) provide preliminary feedback. Statistical calibration requires at least 5 confirmed outcomes.`,
      };
    }

    // Compute empirical accuracy score
    const successWeight = counts.SUCCESS * 1.0 + counts.PARTIAL * 0.5;
    const empiricalAccuracy = successWeight / total;
    // Brier score approximation: (forecastProbability - outcome)^2
    const brier = Math.round(Math.pow(0.7 - empiricalAccuracy, 2) * 100) / 100;

    return {
      userId,
      totalOutcomes: total,
      verdictCounts: counts,
      brierScore: brier,
      status: 'CALIBRATED',
      calibrationSummary: `Calibration based on ${total} user-confirmed outcomes shows an empirical alignment score of ${(empiricalAccuracy * 100).toFixed(1)}%.`,
    };
  }

  public static purgeUser(userId: string): void {
    this.outcomes.delete(userId);
  }
}
