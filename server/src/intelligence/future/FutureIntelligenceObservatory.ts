/**
 * FutureIntelligenceObservatory.ts
 * Observability telemetry and aggregated metrics for the Cosmic Future Intelligence Engine.
 */

export interface FutureObservatoryRecord {
  forecastId: string;
  userId: string;
  timestamp: string;
  horizon: string;
  revealLevel: string;
  generationTimeMs: number;
  convergence: string;
  contradictionCount: number;
  status: 'SUCCESS' | 'DENIED_FREE' | 'ERROR';
}

export class FutureIntelligenceObservatory {
  private static records: FutureObservatoryRecord[] = [];
  private static readonly MAX_RECORDS = 3000;

  public static record(entry: FutureObservatoryRecord) {
    this.records.push(entry);
    if (this.records.length > this.MAX_RECORDS) {
      this.records.shift();
    }
  }

  public static getDashboardMetrics() {
    const total = this.records.length;
    if (total === 0) {
      return {
        totalForecastsGenerated: 0,
        averageLatencyMs: 0,
        revealLevelBreakdown: {},
        convergenceDistribution: { HIGH: 0, MODERATE: 0, LOW: 0 },
        contradictionsDetected: 0,
        freeDenialCount: 0,
        successRatePercent: 100,
        systemHealth: 'OPERATIONAL',
        auditTimestamp: new Date().toISOString(),
      };
    }

    const levels: Record<string, number> = {};
    const conv: Record<string, number> = { HIGH: 0, MODERATE: 0, LOW: 0 };
    let totalLatency = 0;
    let contradictions = 0;
    let denials = 0;
    let successes = 0;

    for (const r of this.records) {
      levels[r.revealLevel] = (levels[r.revealLevel] || 0) + 1;
      if (r.convergence in conv) {
        conv[r.convergence]++;
      }
      totalLatency += r.generationTimeMs;
      contradictions += r.contradictionCount;
      if (r.status === 'DENIED_FREE') denials++;
      if (r.status === 'SUCCESS') successes++;
    }

    return {
      totalForecastsGenerated: successes,
      averageLatencyMs: Math.round(totalLatency / total),
      revealLevelBreakdown: levels,
      convergenceDistribution: conv,
      contradictionsDetected: contradictions,
      freeDenialCount: denials,
      successRatePercent: parseFloat(((successes / total) * 100).toFixed(1)),
      systemHealth: 'OPERATIONAL',
      auditTimestamp: new Date().toISOString(),
    };
  }

  public static clear() {
    this.records = [];
  }
}
