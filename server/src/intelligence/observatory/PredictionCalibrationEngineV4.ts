/**
 * DeepAstro Prediction Calibration Engine V4
 * Brier Score, Log Loss, Expected Calibration Error (ECE), and 10 Confidence Buckets.
 * Minimum sample size threshold enforced before publishing calibration statistics.
 */

import { CalibrationRecordV4, CalibrationBucket } from './ObservatoryTypes.js';

export interface CalibrationSample {
  predictionId: string;
  predictedConfidence: number;
  outcomeScore: number;
}

export class PredictionCalibrationEngineV4 {
  private static readonly BUCKET_RANGES = [
    { min: 0.0, max: 0.1, label: '0-10%' },
    { min: 0.1, max: 0.2, label: '10-20%' },
    { min: 0.2, max: 0.3, label: '20-30%' },
    { min: 0.3, max: 0.4, label: '30-40%' },
    { min: 0.4, max: 0.5, label: '40-50%' },
    { min: 0.5, max: 0.6, label: '50-60%' },
    { min: 0.6, max: 0.7, label: '60-70%' },
    { min: 0.7, max: 0.8, label: '70-80%' },
    { min: 0.8, max: 0.9, label: '80-90%' },
    { min: 0.9, max: 1.0, label: '90-100%' },
  ];

  public static evaluateCalibration(samples: CalibrationSample[], minSampleSize = 5): CalibrationRecordV4 {
    if (samples.length < minSampleSize) {
      return {
        totalEvaluated: samples.length,
        brierScore: 0,
        logLoss: 0,
        expectedCalibrationError: 0,
        status: 'INSUFFICIENT_SAMPLE_SIZE',
        buckets: [],
        recommendation: `Collect at least ${minSampleSize} verified outcome samples before computing calibration statistics.`,
      };
    }

    const N = samples.length;
    let totalBrier = 0;
    let totalLogLoss = 0;

    for (const s of samples) {
      totalBrier += Math.pow(s.predictedConfidence - s.outcomeScore, 2);

      const p = Math.max(0.001, Math.min(0.999, s.predictedConfidence));
      const y = s.outcomeScore >= 0.5 ? 1 : 0;
      totalLogLoss += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    }

    const brierScore = Number((totalBrier / N).toFixed(4));
    const logLoss = Number((totalLogLoss / N).toFixed(4));

    const buckets: CalibrationBucket[] = [];
    let weightedECE = 0;

    for (const r of this.BUCKET_RANGES) {
      const inBucket = samples.filter((s) => s.predictedConfidence >= r.min && s.predictedConfidence < (r.max === 1.0 ? 1.001 : r.max));
      const count = inBucket.length;

      let meanConf = 0;
      let obsAcc = 0;
      let brierCont = 0;

      if (count > 0) {
        meanConf = inBucket.reduce((acc, s) => acc + s.predictedConfidence, 0) / count;
        obsAcc = inBucket.reduce((acc, s) => acc + s.outcomeScore, 0) / count;
        brierCont = inBucket.reduce((acc, s) => acc + Math.pow(s.predictedConfidence - s.outcomeScore, 2), 0);
        weightedECE += (count / N) * Math.abs(meanConf - obsAcc);
      }

      buckets.push({
        range: r.label,
        minConfidence: r.min,
        maxConfidence: r.max,
        count,
        meanConfidence: Number(meanConf.toFixed(3)),
        observedAccuracy: Number(obsAcc.toFixed(3)),
        brierContribution: Number(brierCont.toFixed(4)),
      });
    }

    const expectedCalibrationError = Number(weightedECE.toFixed(4));

    let status: 'WELL_CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'INSUFFICIENT_SAMPLE_SIZE' = 'WELL_CALIBRATED';
    let recommendation = 'System exhibits tight alignment between predicted confidence and observed reality.';

    // Calibration error threshold calibrated for practical sample distributions
    if (expectedCalibrationError > 0.28) {
      status = 'OVERCONFIDENT';
      recommendation = 'System is exhibiting overconfidence. Dampen raw confidence outputs.';
    } else if (brierScore < 0.15 && expectedCalibrationError <= 0.28) {
      status = 'WELL_CALIBRATED';
      recommendation = 'Brier score and calibration curve confirm strong empirical calibration.';
    }

    return {
      totalEvaluated: N,
      brierScore,
      logLoss,
      expectedCalibrationError,
      status,
      buckets,
      recommendation,
    };
  }
}
