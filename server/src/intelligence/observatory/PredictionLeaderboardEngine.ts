/**
 * DeepAstro Prediction Leaderboard Engine
 * Multi-factor ranking of providers without favoring overconfidence.
 */

import { ModelComparisonMetrics } from './ObservatoryTypes.js';

export class PredictionLeaderboardEngine {
  public static rank(models: ModelComparisonMetrics[]): (ModelComparisonMetrics & { rank: number; balancedScore: number })[] {
    return models
      .map((m) => {
        // Balanced score rewards adherence, penalizes hallucination and overconfidence
        const balancedScore = Number(
          (m.evidenceAdherence * 0.4 +
            (1.0 - m.hallucinationRate) * 0.3 +
            (1.0 - m.overconfidenceRate) * 0.2 +
            m.accuracyProxy * 0.1).toFixed(3)
        );
        return { ...m, balancedScore, rank: 1 };
      })
      .sort((a, b) => b.balancedScore - a.balancedScore)
      .map((m, idx) => ({ ...m, rank: idx + 1 }));
  }
}
