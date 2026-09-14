/**
 * DeepAstro Prediction Direction Accuracy Engine
 * Evaluates whether predicted favorable/challenging/neutral matches observed manifestation.
 */

import { PredictionDirection } from './ObservatoryTypes.js';

export class PredictionDirectionAccuracyEngine {
  public static evaluateDirection(predicted: PredictionDirection, observed?: PredictionDirection): {
    match: boolean;
    score: number;
    notes: string;
  } {
    if (!observed) {
      return { match: false, score: 0.5, notes: 'Observed direction unknown' };
    }

    if (predicted === observed) {
      return { match: true, score: 1.0, notes: 'Exact direction match' };
    }

    if (predicted === 'NEUTRAL' || observed === 'NEUTRAL') {
      return { match: false, score: 0.5, notes: 'Neutral deviation' };
    }

    return { match: false, score: 0.0, notes: 'Direction polarity inversion (Challenging vs Positive)' };
  }
}
