/**
 * DeepAstro Observatory V2.0 - Temporal Calibration Engine
 * Measures prediction performance by time horizon.
 * INVARIANT: Long-horizon predictions must not be evaluated using same criteria as short-horizon.
 */
import { TemporalCalibrationReport, PredictionHorizon } from './ObservatoryV2Types.js';

const HORIZON_DAYS: Record<PredictionHorizon, number> = {
  '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, '5Y': 1825, '10Y': 3650,
};

// Timing tolerance (days) per horizon
const TIMING_TOLERANCE: Record<PredictionHorizon, number> = {
  '1M': 7, '3M': 14, '6M': 30, '1Y': 60, '3Y': 180, '5Y': 365, '10Y': 730,
};

interface HorizonSample {
  horizon: PredictionHorizon;
  predictedDate: string;
  observedDate?: string;
  confirmed: boolean;
}

export class TemporalCalibrationEngine {
  private static samples: HorizonSample[] = [];
  private static readonly MIN_SAMPLE = 3;

  public static addSample(sample: HorizonSample): void {
    this.samples.push(sample);
  }

  private static detectHorizon(predictedDate: string, issuedAt: string): PredictionHorizon {
    const issued = new Date(issuedAt).getTime();
    const predicted = new Date(predictedDate).getTime();
    const days = (predicted - issued) / (1000 * 60 * 60 * 24);
    if (days <= 45) return '1M';
    if (days <= 120) return '3M';
    if (days <= 240) return '6M';
    if (days <= 548) return '1Y';
    if (days <= 1460) return '3Y';
    if (days <= 2555) return '5Y';
    return '10Y';
  }

  public static getReport(horizon: PredictionHorizon): TemporalCalibrationReport {
    const horizonSamples = this.samples.filter(s => s.horizon === horizon);
    const now = new Date().toISOString();
    const tolerance = TIMING_TOLERANCE[horizon];

    if (horizonSamples.length < this.MIN_SAMPLE) {
      return {
        horizon, sampleSize: horizonSamples.length, timingPrecision: null,
        outcomeRate: null, coverageRate: null, uncertaintyBand: tolerance,
        status: 'INSUFFICIENT_SAMPLE', computedAt: now,
      };
    }

    const N = horizonSamples.length;
    const confirmed = horizonSamples.filter(s => s.confirmed);
    const outcomeRate = confirmed.length / N;

    let timingPrecisionSum = 0;
    let timingCount = 0;
    for (const s of confirmed) {
      if (!s.observedDate) continue;
      const predicted = new Date(s.predictedDate).getTime();
      const observed = new Date(s.observedDate).getTime();
      const deviationDays = Math.abs(predicted - observed) / (1000 * 60 * 60 * 24);
      const precision = Math.max(0, 1 - deviationDays / tolerance);
      timingPrecisionSum += precision;
      timingCount++;
    }

    const timingPrecision = timingCount > 0 ? timingPrecisionSum / timingCount : null;

    return {
      horizon, sampleSize: N,
      timingPrecision: timingPrecision !== null ? +timingPrecision.toFixed(4) : null,
      outcomeRate: +outcomeRate.toFixed(4),
      coverageRate: +(confirmed.length / N).toFixed(4),
      uncertaintyBand: tolerance, status: 'SUFFICIENT', computedAt: now,
    };
  }

  public static getAllReports(): TemporalCalibrationReport[] {
    const horizons: PredictionHorizon[] = ['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y'];
    return horizons.map(h => this.getReport(h));
  }

  public static reset(): void { this.samples = []; }
}
