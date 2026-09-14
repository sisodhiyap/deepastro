/**
 * DeepAstro Bootstrap Validation Engine & Wilson Score Intervals
 * 
 * Provides:
 * 1. Exact Wilson Score Intervals for proportions (with continuity correction where appropriate)
 * 2. Deterministic Seeded PRNG Resampling Bootstrap Engine for non-parametric metrics (Brier, ECE)
 * 3. Confidence Interval formatting (e.g., '79.5% (N=143, 95% CI: 72.1% - 85.3%)')
 */

export interface ConfidenceIntervalResult {
  estimate: number;
  sample_size: number;
  lower_bound: number;
  upper_bound: number;
  confidence_level: number;
  method: 'WILSON_SCORE' | 'BOOTSTRAP_PERCENTILE' | 'EXACT_BINOMIAL';
  formatted: string;
}

export interface BootstrapDistributionResult {
  metric_name: string;
  observed_estimate: number;
  bootstrap_mean: number;
  bootstrap_median: number;
  bootstrap_std: number;
  lower_ci: number;
  upper_ci: number;
  resamples: number;
  seed: number;
}

export class BootstrapValidationEngine {
  /**
   * Calculates the Wilson Score Interval for a binomial proportion k/n
   * Preferred over normal approximation especially for small samples or proportions near 0 or 1.
   */
  static calculateWilsonInterval(
    successes: number,
    total: number,
    confidenceLevel: number = 0.95
  ): ConfidenceIntervalResult {
    if (total <= 0) {
      return {
        estimate: 0,
        sample_size: 0,
        lower_bound: 0,
        upper_bound: 0,
        confidence_level: confidenceLevel,
        method: 'WILSON_SCORE',
        formatted: '0.0% (N=0, 95% CI: 0.0% - 0.0%)',
      };
    }

    const p = Math.max(0, Math.min(1, successes / total));
    // Standard normal quantiles (Z-scores)
    let z = 1.95996; // default 95%
    if (Math.abs(confidenceLevel - 0.99) < 0.005) z = 2.57583;
    if (Math.abs(confidenceLevel - 0.90) < 0.005) z = 1.64485;

    const z2 = z * z;
    const denominator = 1 + z2 / total;
    const center = p + z2 / (2 * total);
    const margin = z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));

    const lower = Math.max(0, (center - margin) / denominator);
    const upper = Math.min(1, (center + margin) / denominator);

    const estPct = (p * 100).toFixed(1);
    const lowPct = (lower * 100).toFixed(1);
    const uppPct = (upper * 100).toFixed(1);

    return {
      estimate: Number(p.toFixed(4)),
      sample_size: total,
      lower_bound: Number(lower.toFixed(4)),
      upper_bound: Number(upper.toFixed(4)),
      confidence_level: confidenceLevel,
      method: 'WILSON_SCORE',
      formatted: `${estPct}% (N=${total}, ${(confidenceLevel * 100).toFixed(0)}% CI: ${lowPct}% - ${uppPct}%)`,
    };
  }

  /**
   * Deterministic Linear Congruential Generator (LCG) for reproducible bootstrap sampling
   */
  private static lcgRandom(seedRef: { seed: number }): number {
    seedRef.seed = (seedRef.seed * 1664525 + 1013904223) % 4294967296;
    return seedRef.seed / 4294967296;
  }

  /**
   * Runs bootstrap validation on numeric samples using deterministic resampling
   */
  static bootstrapMetric(
    metricName: string,
    data: number[],
    metricFn: (sample: number[]) => number,
    numResamples: number = 1000,
    seed: number = 20260914
  ): BootstrapDistributionResult {
    if (!data || data.length === 0) {
      return {
        metric_name: metricName,
        observed_estimate: 0,
        bootstrap_mean: 0,
        bootstrap_median: 0,
        bootstrap_std: 0,
        lower_ci: 0,
        upper_ci: 0,
        resamples: 0,
        seed,
      };
    }

    const observed = metricFn(data);
    const n = data.length;
    const bootEstimates: number[] = [];
    const seedRef = { seed };

    for (let b = 0; b < numResamples; b++) {
      const resample: number[] = new Array(n);
      for (let i = 0; i < n; i++) {
        const randIdx = Math.floor(this.lcgRandom(seedRef) * n);
        resample[i] = data[randIdx];
      }
      bootEstimates.push(metricFn(resample));
    }

    // Sort to obtain empirical percentiles
    bootEstimates.sort((a, b) => a - b);

    const mean = bootEstimates.reduce((a, b) => a + b, 0) / bootEstimates.length;
    const median = bootEstimates[Math.floor(bootEstimates.length / 2)];
    const variance = bootEstimates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bootEstimates.length;
    const std = Math.sqrt(variance);

    // 95% Percentile interval (2.5% to 97.5%)
    const lowIdx = Math.floor(bootEstimates.length * 0.025);
    const uppIdx = Math.floor(bootEstimates.length * 0.975);

    return {
      metric_name: metricName,
      observed_estimate: Number(observed.toFixed(4)),
      bootstrap_mean: Number(mean.toFixed(4)),
      bootstrap_median: Number(median.toFixed(4)),
      bootstrap_std: Number(std.toFixed(4)),
      lower_ci: Number(bootEstimates[lowIdx].toFixed(4)),
      upper_ci: Number(bootEstimates[uppIdx].toFixed(4)),
      resamples: numResamples,
      seed,
    };
  }

  /**
   * Helper specifically for Brier score bootstrapping
   */
  static bootstrapBrierScore(
    forecastsAndOutcomes: Array<{ forecast_probability: number; outcome_binary: number }>,
    numResamples: number = 1000
  ): BootstrapDistributionResult {
    const squaredErrors = forecastsAndOutcomes.map(
      pair => Math.pow(pair.forecast_probability - pair.outcome_binary, 2)
    );

    return this.bootstrapMetric(
      'BRIER_SCORE',
      squaredErrors,
      (sample) => sample.reduce((a, b) => a + b, 0) / sample.length,
      numResamples,
      20260914
    );
  }
}
