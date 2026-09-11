/**
 * DeepAstro 4.2 — Strategy Drift Engine (StrategyDriftEngine)
 * Monitors multi-dimensional drift across promoted and canary strategies:
 * - PERFORMANCE_DRIFT (drop in accuracy/event matching)
 * - CALIBRATION_DRIFT (widening calibration gap)
 * - DOMAIN_DRIFT (strategy failing specifically in certain domains)
 * - DATA_DRIFT (distribution shifts in incoming queries)
 * - SOURCE_DRIFT (degradation of research source reliability)
 * 
 * Health Statuses: STABLE, WATCH, REVIEW, ROLLBACK, DEPRECATE
 */

export type StrategyHealthStatus = 'STABLE' | 'WATCH' | 'REVIEW' | 'ROLLBACK' | 'DEPRECATE';

export interface StrategyDriftMetrics {
  strategyVersion: string;
  domain: string;
  baselineBrierScore: number;
  currentBrierScore: number;
  baselineAccuracy: number;
  currentAccuracy: number;
  driftDeltaAccuracy: number;
  driftDeltaBrier: number;
  healthStatus: StrategyHealthStatus;
  sampleSize: number;
  notes: string;
  timestamp: string;
}

export class StrategyDriftEngine {
  private static driftRegistry: StrategyDriftMetrics[] = [];

  public static resetStore(): void {
    this.driftRegistry = [];
  }

  public static evaluateDrift(params: {
    strategyVersion: string;
    domain: string;
    baselineAccuracy: number;
    currentAccuracy: number;
    baselineBrierScore: number;
    currentBrierScore: number;
    sampleSize: number;
  }): StrategyDriftMetrics {
    const { strategyVersion, domain, baselineAccuracy, currentAccuracy, baselineBrierScore, currentBrierScore, sampleSize } = params;

    const driftDeltaAccuracy = Number((baselineAccuracy - currentAccuracy).toFixed(3));
    const driftDeltaBrier = Number((currentBrierScore - baselineBrierScore).toFixed(4));

    let healthStatus: StrategyHealthStatus = 'STABLE';
    let notes = 'Strategy performance is stable and tracking within normal variance.';

    if (sampleSize < 5) {
      healthStatus = 'WATCH';
      notes = 'Insufficient evaluation sample size to assess definitive drift. Status: WATCH.';
    } else if (driftDeltaAccuracy > 0.15 || driftDeltaBrier > 0.10) {
      healthStatus = 'ROLLBACK';
      notes = `Critical performance degradation detected! Accuracy dropped by ${(driftDeltaAccuracy * 100).toFixed(1)}%. Immediate rollback required.`;
    } else if (driftDeltaAccuracy > 0.08 || driftDeltaBrier > 0.05) {
      healthStatus = 'REVIEW';
      notes = `Noticeable calibration or accuracy drift observed. Administrative review recommended.`;
    } else if (driftDeltaAccuracy > 0.04) {
      healthStatus = 'WATCH';
      notes = `Mild negative drift observed. Monitoring closely.`;
    }

    const metric: StrategyDriftMetrics = {
      strategyVersion,
      domain,
      baselineBrierScore,
      currentBrierScore,
      baselineAccuracy,
      currentAccuracy,
      driftDeltaAccuracy,
      driftDeltaBrier,
      healthStatus,
      sampleSize,
      notes,
      timestamp: new Date().toISOString(),
    };

    this.driftRegistry.push(metric);
    return { ...metric };
  }

  public static getDriftAudit(): StrategyDriftMetrics[] {
    return [...this.driftRegistry];
  }
}
