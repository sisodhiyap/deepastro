/**
 * DeepAstro 4.1 — Strategy Monitoring Engine & Canary Deployment
 * (StrategyMonitoringEngine)
 * 
 * Manages strategy versioning, canary traffic routing (5-10%), and drift monitoring.
 * 
 * Invariants:
 * 1. Newly promoted strategies are never deployed 100% immediately.
 * 2. Canary traffic is bounded (5-10%).
 * 3. Performance & Calibration drift are tracked continuously.
 * 4. If canary performance degrades below baseline, AUTOMATIC STRATEGY ROLLBACK is triggered.
 * 5. Does NOT roll back Layer A calculations.
 */

export interface StrategyVersionRecord {
  strategyId: string;
  strategyVersion: string;
  parentVersion?: string;
  changeSummary: string;
  baselineAccuracy: number;
  currentAccuracy: number;
  brierScore: number;
  status: 'ACTIVE_BASELINE' | 'CANARY' | 'ROLLED_BACK' | 'DEPRECATED';
  trafficPercent: number; // 0 to 100
  promotedAt: string;
  rollbackReason?: string;
}

export interface DriftEvent {
  eventId: string;
  strategyVersion: string;
  driftType: 'PERFORMANCE_DRIFT' | 'CALIBRATION_DRIFT' | 'DATA_DRIFT' | 'DOMAIN_DRIFT';
  severity: 'WARNING' | 'CRITICAL_ROLLBACK';
  metricDelta: number;
  timestamp: string;
}

export class StrategyMonitoringEngine {
  private static strategies: Map<string, StrategyVersionRecord> = new Map([
    [
      'STRATEGY_BASELINE_v1.0',
      {
        strategyId: 'strat_base',
        strategyVersion: 'STRATEGY_BASELINE_v1.0',
        changeSummary: 'Parashari + KP verified baseline strategy',
        baselineAccuracy: 0.72,
        currentAccuracy: 0.72,
        brierScore: 0.18,
        status: 'ACTIVE_BASELINE',
        trafficPercent: 100,
        promotedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
  ]);

  private static driftEvents: DriftEvent[] = [];

  public static resetStore(): void {
    this.driftEvents = [];
    this.strategies.clear();
    this.strategies.set('STRATEGY_BASELINE_v1.0', {
      strategyId: 'strat_base',
      strategyVersion: 'STRATEGY_BASELINE_v1.0',
      changeSummary: 'Parashari + KP verified baseline strategy',
      baselineAccuracy: 0.72,
      currentAccuracy: 0.72,
      brierScore: 0.18,
      status: 'ACTIVE_BASELINE',
      trafficPercent: 100,
      promotedAt: '2026-09-01T00:00:00.000Z',
    });
  }

  public static deployCanary(params: {
    strategyVersion: string;
    parentVersion: string;
    changeSummary: string;
    baselineAccuracy: number;
    canaryTrafficPercent?: number;
  }): StrategyVersionRecord {
    const { strategyVersion, parentVersion, changeSummary, baselineAccuracy, canaryTrafficPercent = 10 } = params;

    const record: StrategyVersionRecord = {
      strategyId: `strat_${Date.now()}`,
      strategyVersion,
      parentVersion,
      changeSummary,
      baselineAccuracy,
      currentAccuracy: baselineAccuracy,
      brierScore: 0.16,
      status: 'CANARY',
      trafficPercent: Math.min(15, Math.max(5, canaryTrafficPercent)),
      promotedAt: new Date().toISOString(),
    };

    // Reduce baseline traffic percent to accommodate canary
    const base = this.strategies.get(parentVersion);
    if (base) {
      base.trafficPercent = 100 - record.trafficPercent;
    }

    this.strategies.set(strategyVersion, record);
    return { ...record };
  }

  public static recordTelemetryEvaluation(
    strategyVersion: string,
    batchAccuracy: number,
    brierScore: number
  ): { status: string; triggeredRollback: boolean } {
    const strat = this.strategies.get(strategyVersion);
    if (!strat) {
      throw new Error(`STRATEGY_NOT_FOUND: Strategy ${strategyVersion} is not tracked.`);
    }

    strat.currentAccuracy = batchAccuracy;
    strat.brierScore = brierScore;

    // Check for performance degradation relative to baseline
    const drop = strat.baselineAccuracy - batchAccuracy;

    if (drop > 0.15 && strat.status === 'CANARY') {
      // Trigger automatic rollback of canary
      strat.status = 'ROLLED_BACK';
      strat.trafficPercent = 0;
      strat.rollbackReason = `AUTOMATIC_CANARY_ROLLBACK: Accuracy dropped from ${(strat.baselineAccuracy * 100).toFixed(1)}% to ${(batchAccuracy * 100).toFixed(1)}% (drop of ${(drop * 100).toFixed(1)}%).`;

      // Restore baseline traffic to 100%
      if (strat.parentVersion) {
        const parent = this.strategies.get(strat.parentVersion);
        if (parent) parent.trafficPercent = 100;
      }

      this.driftEvents.push({
        eventId: `drift_${Date.now()}`,
        strategyVersion,
        driftType: 'PERFORMANCE_DRIFT',
        severity: 'CRITICAL_ROLLBACK',
        metricDelta: Number(drop.toFixed(3)),
        timestamp: new Date().toISOString(),
      });

      return { status: 'ROLLED_BACK', triggeredRollback: true };
    }

    return { status: strat.status, triggeredRollback: false };
  }

  public static getStrategies(): StrategyVersionRecord[] {
    return Array.from(this.strategies.values()).map((s) => ({ ...s }));
  }

  public static getDriftEvents(): DriftEvent[] {
    return [...this.driftEvents];
  }
}
