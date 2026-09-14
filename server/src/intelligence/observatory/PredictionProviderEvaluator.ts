/**
 * DeepAstro Prediction Provider Evaluator
 * Evaluates individual LLM provider adherence, context capacity, and failure behavior.
 */

export class PredictionProviderEvaluator {
  public static evaluateProvider(params: {
    providerName: string;
    successfulRequests: number;
    failedRequests: number;
    averageLatencyMs: number;
    tokensConsumed: number;
  }): {
    healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
    reliabilityRate: number;
  } {
    const total = params.successfulRequests + params.failedRequests;
    if (total === 0) {
      return { healthStatus: 'HEALTHY', reliabilityRate: 1.0 };
    }

    const reliabilityRate = Number((params.successfulRequests / total).toFixed(3));
    let healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' = 'HEALTHY';

    if (reliabilityRate < 0.5) healthStatus = 'UNAVAILABLE';
    else if (reliabilityRate < 0.85 || params.averageLatencyMs > 5000) healthStatus = 'DEGRADED';

    return { healthStatus, reliabilityRate };
  }
}
