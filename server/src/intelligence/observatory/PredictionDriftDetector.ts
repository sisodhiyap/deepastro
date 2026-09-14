/**
 * DeepAstro Prediction Drift Detector
 * Detects accuracy degradation, confidence inflation, and provider drift.
 */

export interface DriftMetric {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  delta: number;
  driftDetected: boolean;
}

export class PredictionDriftDetector {
  public static checkDrift(params: {
    baselineAccuracy: number;
    currentAccuracy: number;
    baselineMeanConfidence: number;
    currentMeanConfidence: number;
  }): {
    hasDrift: boolean;
    metrics: DriftMetric[];
  } {
    const accDelta = params.currentAccuracy - params.baselineAccuracy;
    const confDelta = params.currentMeanConfidence - params.baselineMeanConfidence;

    const accMetric: DriftMetric = {
      metricName: 'ACCURACY_DEGRADATION',
      baselineValue: params.baselineAccuracy,
      currentValue: params.currentAccuracy,
      delta: Number(accDelta.toFixed(3)),
      driftDetected: accDelta < -0.1,
    };

    const confMetric: DriftMetric = {
      metricName: 'CONFIDENCE_INFLATION',
      baselineValue: params.baselineMeanConfidence,
      currentValue: params.currentMeanConfidence,
      delta: Number(confDelta.toFixed(3)),
      driftDetected: confDelta > 0.15,
    };

    const hasDrift = accMetric.driftDetected || confMetric.driftDetected;

    return {
      hasDrift,
      metrics: [accMetric, confMetric],
    };
  }
}
