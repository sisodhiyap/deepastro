/**
 * DeepAstro Prediction Model Comparison Engine
 * Tracks accuracy proxy, evidence adherence, hallucination rate, latency, and cost across providers.
 */

import { ModelComparisonMetrics } from './ObservatoryTypes.js';

export class PredictionModelComparisonEngine {
  private static metricsStore: Map<string, ModelComparisonMetrics> = new Map();

  public static recordMetrics(metrics: ModelComparisonMetrics): void {
    this.metricsStore.set(metrics.providerName, metrics);
  }

  public static getMetrics(): ModelComparisonMetrics[] {
    return Array.from(this.metricsStore.values());
  }

  public static compareProviders(): {
    bestAdherence: string;
    lowestHallucination: string;
    fastestLatency: string;
  } {
    const list = this.getMetrics();
    if (list.length === 0) {
      return { bestAdherence: 'None', lowestHallucination: 'None', fastestLatency: 'None' };
    }

    const sortedAdh = [...list].sort((a, b) => b.evidenceAdherence - a.evidenceAdherence);
    const sortedHal = [...list].sort((a, b) => a.hallucinationRate - b.hallucinationRate);
    const sortedLat = [...list].sort((a, b) => a.averageLatencyMs - b.averageLatencyMs);

    return {
      bestAdherence: sortedAdh[0].providerName,
      lowestHallucination: sortedHal[0].providerName,
      fastestLatency: sortedLat[0].providerName,
    };
  }
}
