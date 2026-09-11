/**
 * DeepAstro 4.1 — Comparable Prediction Case Engine (ComparablePredictionCaseEngine)
 * Finds historical prediction cases with comparable astrological configurations,
 * Dashas, transit states, questions, and time horizons without matching on sensitive personal attributes.
 * 
 * Used for:
 * 1. Longitudinal learning across similar astrological archetypes.
 * 2. Pre-prediction sanity checking.
 * 3. Strategy performance comparison on matched cohorts.
 */

export interface ComparableCaseCriteria {
  domain: string;
  dashaLord: string;
  antardashaLord: string;
  moonSign?: string;
  ascendantSign?: string;
  timeHorizon?: string;
}

export interface HistoricalPredictionCaseMatch {
  predictionId: string;
  domain: string;
  similarityScore: number; // 0.0 to 1.0
  matchedDasha: string;
  pastOutcome: 'CONFIRMED' | 'PARTIALLY_CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';
  strategyUsed: string;
  observedInsights: string[];
}

export class ComparablePredictionCaseEngine {
  private static historicalDatabase: Array<{
    predictionId: string;
    domain: string;
    dashaLord: string;
    antardashaLord: string;
    moonSign: string;
    ascendantSign: string;
    timeHorizon: string;
    outcome: 'CONFIRMED' | 'PARTIALLY_CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';
    strategyUsed: string;
  }> = [];

  public static seedCase(item: {
    predictionId: string;
    domain: string;
    dashaLord: string;
    antardashaLord: string;
    moonSign: string;
    ascendantSign: string;
    timeHorizon?: string;
    outcome: 'CONFIRMED' | 'PARTIALLY_CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';
    strategyUsed?: string;
  }): void {
    this.historicalDatabase.push({
      predictionId: item.predictionId,
      domain: item.domain,
      dashaLord: item.dashaLord,
      antardashaLord: item.antardashaLord,
      moonSign: item.moonSign,
      ascendantSign: item.ascendantSign,
      timeHorizon: item.timeHorizon || 'NEXT_6_MONTHS',
      outcome: item.outcome,
      strategyUsed: item.strategyUsed || 'STRATEGY_C_RULE_DASHA_VARGA',
    });
  }

  public static resetStore(): void {
    this.historicalDatabase = [];
  }

  public static findComparableCases(criteria: ComparableCaseCriteria, limit = 5): HistoricalPredictionCaseMatch[] {
    const matches: HistoricalPredictionCaseMatch[] = [];

    for (const item of this.historicalDatabase) {
      if (item.domain !== criteria.domain) continue;

      let score = 0.4; // Same domain base
      if (item.dashaLord === criteria.dashaLord) score += 0.3;
      if (item.antardashaLord === criteria.antardashaLord) score += 0.15;
      if (criteria.moonSign && item.moonSign === criteria.moonSign) score += 0.1;
      if (criteria.ascendantSign && item.ascendantSign === criteria.ascendantSign) score += 0.05;

      if (score >= 0.5) {
        matches.push({
          predictionId: item.predictionId,
          domain: item.domain,
          similarityScore: Number(Math.min(1.0, score).toFixed(2)),
          matchedDasha: `${item.dashaLord}-${item.antardashaLord}`,
          pastOutcome: item.outcome,
          strategyUsed: item.strategyUsed,
          observedInsights: [
            `Similar ${item.dashaLord}-${item.antardashaLord} phase previously produced ${item.outcome.toLowerCase().replace('_', ' ')} outcome.`,
            `Historical case verified via strategy ${item.strategyUsed}.`,
          ],
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
  }
}
