/**
 * DeepAstro Prediction Magnitude Engine
 * Measures proportional scale between expected and observed impact.
 */

import { PredictionMagnitude } from './ObservatoryTypes.js';

export class PredictionMagnitudeEngine {
  private static readonly SCALE: Record<PredictionMagnitude, number> = {
    SUBTLE: 1,
    MODERATE: 2,
    SIGNIFICANT: 3,
    TRANSFORMATIVE: 4,
  };

  public static evaluateMagnitude(predicted: PredictionMagnitude, observed?: PredictionMagnitude): {
    proportional: boolean;
    scaleDelta: number;
    score: number;
  } {
    if (!observed) {
      return { proportional: true, scaleDelta: 0, score: 0.7 };
    }

    const pVal = this.SCALE[predicted] ?? 2;
    const oVal = this.SCALE[observed] ?? 2;
    const scaleDelta = Math.abs(pVal - oVal);

    let score = 1.0;
    if (scaleDelta === 1) score = 0.75;
    else if (scaleDelta === 2) score = 0.4;
    else if (scaleDelta >= 3) score = 0.1;

    return {
      proportional: scaleDelta <= 1,
      scaleDelta,
      score,
    };
  }
}
