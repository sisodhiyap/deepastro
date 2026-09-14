/**
 * DeepAstro Prediction Context Accuracy Engine
 * Validates domain and situational context alignment.
 */

import { PredictionDomain } from './ObservatoryTypes.js';

export class PredictionContextAccuracyEngine {
  public static evaluateContext(predictedDomain: PredictionDomain, observedContext?: string): {
    contextMatch: boolean;
    contextScore: number;
  } {
    if (!observedContext || observedContext.trim().length === 0) {
      return { contextMatch: true, contextScore: 0.8 };
    }

    const normObs = observedContext.toUpperCase();
    const contextMatch = normObs.includes(predictedDomain.toUpperCase());
    const contextScore = contextMatch ? 1.0 : 0.2;

    return { contextMatch, contextScore };
  }
}
