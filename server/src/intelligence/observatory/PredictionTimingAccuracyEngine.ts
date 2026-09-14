/**
 * DeepAstro Prediction Timing Accuracy Engine
 * Evaluates exact days, weeks, and months deviation without punishing broad vs narrow windows uniformly.
 */

export interface TimingAccuracyResult {
  insideWindow: boolean;
  deviationDays: number;
  deviationWeeks: number;
  deviationMonths: number;
  timingPrecisionScore: number;
  windowSpanDays: number;
}

export class PredictionTimingAccuracyEngine {
  public static evaluateTiming(params: {
    windowStart: string;
    windowEnd: string;
    observedDate?: string;
  }): TimingAccuracyResult {
    const { windowStart, windowEnd, observedDate } = params;

    if (!observedDate) {
      return {
        insideWindow: false,
        deviationDays: 0,
        deviationWeeks: 0,
        deviationMonths: 0,
        timingPrecisionScore: 0.5,
        windowSpanDays: 0,
      };
    }

    const start = new Date(windowStart).getTime();
    const end = new Date(windowEnd).getTime();
    const obs = new Date(observedDate).getTime();

    const windowSpanDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    let insideWindow = false;
    let deviationDays = 0;

    if (obs >= start && obs <= end) {
      insideWindow = true;
      deviationDays = 0;
    } else if (obs < start) {
      insideWindow = false;
      deviationDays = -Math.round((start - obs) / (1000 * 60 * 60 * 24));
    } else {
      insideWindow = false;
      deviationDays = Math.round((obs - end) / (1000 * 60 * 60 * 24));
    }

    const absDev = Math.abs(deviationDays);
    const deviationWeeks = Number((absDev / 7).toFixed(1));
    const deviationMonths = Number((absDev / 30.4).toFixed(1));

    let timingPrecisionScore = 1.0;
    if (!insideWindow) {
      timingPrecisionScore = Math.max(0.0, 1.0 - absDev / (windowSpanDays * 1.5));
    } else {
      if (windowSpanDays <= 30) timingPrecisionScore = 1.0;
      else if (windowSpanDays <= 90) timingPrecisionScore = 0.9;
      else timingPrecisionScore = 0.8;
    }

    return {
      insideWindow,
      deviationDays,
      deviationWeeks,
      deviationMonths,
      timingPrecisionScore: Number(timingPrecisionScore.toFixed(3)),
      windowSpanDays,
    };
  }
}
