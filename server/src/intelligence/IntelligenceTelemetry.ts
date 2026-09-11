/**
 * DeepAstro Intelligence Telemetry
 * Records production-grade observability metrics across intent, engines used,
 * evidence density, model latencies, and audit statuses without logging sensitive personal data.
 */

import { IntelligenceAuditTrace } from './IntelligenceTypes.js';

export interface TelemetrySummary {
  totalTraces: number;
  averageLatencyMs: number;
  intentDistribution: Record<string, number>;
  enginesExecutedCounts: Record<string, number>;
  flaggedCount: number;
}

export class IntelligenceTelemetry {
  private static traces: IntelligenceAuditTrace[] = [];

  public static recordTrace(trace: IntelligenceAuditTrace): void {
    this.traces.push(trace);
    // Retain sliding window of latest 1000 traces in memory
    if (this.traces.length > 1000) {
      this.traces.shift();
    }
  }

  public static getTraces(limit: number = 50): IntelligenceAuditTrace[] {
    return this.traces.slice(-limit);
  }

  public static getSummary(): TelemetrySummary {
    const total = this.traces.length;
    if (total === 0) {
      return {
        totalTraces: 0,
        averageLatencyMs: 0,
        intentDistribution: {},
        enginesExecutedCounts: {},
        flaggedCount: 0,
      };
    }

    let sumLatency = 0;
    const intents: Record<string, number> = {};
    const engines: Record<string, number> = {};
    let flagged = 0;

    for (const t of this.traces) {
      sumLatency += t.latencyMs;
      intents[t.intent] = (intents[t.intent] || 0) + 1;
      if (t.auditStatus === 'FLAGGED') flagged++;

      for (const e of t.enginesUsed) {
        engines[e] = (engines[e] || 0) + 1;
      }
    }

    return {
      totalTraces: total,
      averageLatencyMs: Math.round(sumLatency / total),
      intentDistribution: intents,
      enginesExecutedCounts: engines,
      flaggedCount: flagged,
    };
  }

  public static clear(): void {
    this.traces = [];
  }
}
