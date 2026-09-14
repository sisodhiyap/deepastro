/**
 * AstroBotTelemetry (Universal Insight Layer v4.2.1)
 * Captures request-level performance, routing accuracy, card generation metrics,
 * and data health without storing sensitive private user information.
 */

export interface AstroBotTelemetryRecord {
  requestId: string;
  userId?: string;
  timestamp: string;
  intent: string;
  enginesCalled: string[];
  cardType?: string;
  generationTimeMs: number;
  aiProvider?: string;
  dataSources: string[];
  dataFreshness: string;
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  errorDetails?: string;
  isFollowUp?: boolean;
}

export class AstroBotTelemetry {
  private static records: AstroBotTelemetryRecord[] = [];
  private static readonly MAX_RECORDS = 5000;

  public static record(entry: AstroBotTelemetryRecord) {
    this.records.push(entry);
    if (this.records.length > this.MAX_RECORDS) {
      this.records.shift();
    }
  }

  public static getMetricsSummary() {
    const total = this.records.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        averageLatencyMs: 0,
        cardGenerationRate: 0,
        intentDistribution: {},
        cardTypeDistribution: {},
        pastLifeRequests: 0,
        marketRequests: 0,
        newsRequests: 0,
        failedRequests: 0,
        errorRatePercent: 0,
        providerUsage: {},
      };
    }

    const intentCount: Record<string, number> = {};
    const cardCount: Record<string, number> = {};
    const providerCount: Record<string, number> = {};
    let totalLatency = 0;
    let cardTotal = 0;
    let failedTotal = 0;
    let pastLifeTotal = 0;
    let marketTotal = 0;
    let newsTotal = 0;

    for (const r of this.records) {
      intentCount[r.intent] = (intentCount[r.intent] || 0) + 1;
      if (r.cardType) {
        cardTotal++;
        cardCount[r.cardType] = (cardCount[r.cardType] || 0) + 1;
      }
      if (r.aiProvider) {
        providerCount[r.aiProvider] = (providerCount[r.aiProvider] || 0) + 1;
      }
      totalLatency += r.generationTimeMs;
      if (r.status === 'ERROR') failedTotal++;
      if (r.intent === 'PAST_LIFE' || r.intent === 'PAST_LIFE_DEEP' || r.intent === 'KARMA') pastLifeTotal++;
      if (r.intent === 'MARKET') marketTotal++;
      if (r.intent === 'NEWS') newsTotal++;
    }

    return {
      totalRequests: total,
      averageLatencyMs: Math.round(totalLatency / total),
      cardGenerationRate: parseFloat(((cardTotal / total) * 100).toFixed(1)),
      intentDistribution: intentCount,
      cardTypeDistribution: cardCount,
      pastLifeRequests: pastLifeTotal,
      marketRequests: marketTotal,
      newsRequests: newsTotal,
      failedRequests: failedTotal,
      errorRatePercent: parseFloat(((failedTotal / total) * 100).toFixed(2)),
      providerUsage: providerCount,
    };
  }

  public static clear() {
    this.records = [];
  }
}
