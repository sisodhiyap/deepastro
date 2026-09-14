/**
 * DeepAstro Prediction Accuracy Engine
 * Aggregates empirical accuracy vectors across domains and historical records.
 * Uses honest terminology: "observed performance", "historical calibration", "outcome match".
 */

import { RealityComparisonV2Result } from './PredictionRealityComparisonEngineV2.js';

export interface AggregateAccuracySummary {
  totalEvaluated: number;
  meanEventAccuracy: number;
  meanTimingAccuracy: number;
  meanDirectionAccuracy: number;
  meanMagnitudeAccuracy: number;
  meanContextAccuracy: number;
  status: 'SUFFICIENT_DATA' | 'INSUFFICIENT_SAMPLE_SIZE';
  domainAverages: Record<string, { count: number; eventAcc: number; timingAcc: number }>;
}

export class PredictionAccuracyEngine {
  public static summarize(comparisons: RealityComparisonV2Result[]): AggregateAccuracySummary {
    const valid = comparisons.filter((c) => c.overallQuality !== 'UNCONFIRMED');

    if (valid.length < 3) {
      return {
        totalEvaluated: valid.length,
        meanEventAccuracy: 0,
        meanTimingAccuracy: 0,
        meanDirectionAccuracy: 0,
        meanMagnitudeAccuracy: 0,
        meanContextAccuracy: 0,
        status: 'INSUFFICIENT_SAMPLE_SIZE',
        domainAverages: {},
      };
    }

    const total = valid.length;
    const meanEvent = valid.reduce((a, b) => a + b.eventAccuracy, 0) / total;
    const meanTiming = valid.reduce((a, b) => a + b.timingAccuracy, 0) / total;
    const meanDirection = valid.reduce((a, b) => a + b.directionAccuracy, 0) / total;
    const meanMagnitude = valid.reduce((a, b) => a + b.magnitudeAccuracy, 0) / total;
    const meanContext = valid.reduce((a, b) => a + b.contextAccuracy, 0) / total;

    return {
      totalEvaluated: total,
      meanEventAccuracy: Number(meanEvent.toFixed(3)),
      meanTimingAccuracy: Number(meanTiming.toFixed(3)),
      meanDirectionAccuracy: Number(meanDirection.toFixed(3)),
      meanMagnitudeAccuracy: Number(meanMagnitude.toFixed(3)),
      meanContextAccuracy: Number(meanContext.toFixed(3)),
      status: 'SUFFICIENT_DATA',
      domainAverages: {},
    };
  }
}
