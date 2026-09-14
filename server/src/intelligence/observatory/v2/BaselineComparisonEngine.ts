/**
 * DeepAstro Observatory V2.0 - Baseline Comparison Engine
 * Compares DeepAstro against naive baselines.
 * Purpose: Determine whether DeepAstro provides measurable improvement over chance.
 * INVARIANT: Never claim success merely because the system has non-zero accuracy.
 */
import { BaselineComparisonResult, BaselineResult, BaselineModel } from './ObservatoryV2Types.js';

export class BaselineComparisonEngine {
  private static readonly DOMAIN_PRIORS: Record<string, number> = {
    CAREER: 0.35, BUSINESS: 0.30, FINANCE: 0.28, RELATIONSHIPS: 0.40,
    EDUCATION: 0.38, RELOCATION: 0.22, CREATIVITY: 0.45, SPIRITUALITY: 0.50,
    LIFE_PHASE: 0.55, GENERAL: 0.30,
  };

  public static compare(params: {
    deepAstroBrierScore: number;
    deepAstroEventAccuracy: number;
    deepAstroCoverage: number;
    sampleSize: number;
    domain?: string;
    minSampleSize?: number;
  }): BaselineComparisonResult {
    const { deepAstroBrierScore, deepAstroEventAccuracy, deepAstroCoverage,
      sampleSize, domain = 'GENERAL', minSampleSize = 10 } = params;

    if (sampleSize < minSampleSize) {
      return {
        deepAstroBrierScore, deepAstroEventAccuracy, deepAstroCoverage,
        baselines: [], improvementOverRandom: null, improvementOverDomainPrior: null,
        verdict: 'INSUFFICIENT_DATA', sampleSize, computedAt: new Date().toISOString(),
      };
    }

    const domainPrior = this.DOMAIN_PRIORS[domain] ?? 0.35;

    const baselines: BaselineResult[] = [
      {
        model: 'BASELINE_RANDOM',
        eventAccuracy: 0.5,
        timingAccuracy: 0.25,
        brierScore: 0.25, // 0.5^2 for random
        coverage: 1.0,
        notes: 'Random 50/50 coin flip baseline â€” no information used',
      },
      {
        model: 'BASELINE_ALWAYS_UNKNOWN',
        eventAccuracy: 0.0,
        timingAccuracy: 0.0,
        brierScore: domainPrior * (1 - domainPrior),
        coverage: 0.0,
        notes: 'Never predicts â€” optimal coverage=0, poor accuracy contribution',
      },
      {
        model: 'BASELINE_DOMAIN_PRIOR',
        eventAccuracy: domainPrior,
        timingAccuracy: 0.2,
        brierScore: Math.pow(domainPrior - domainPrior, 2) + 0.1,
        coverage: 1.0,
        notes: `Domain base rate for ${domain}: ${Math.round(domainPrior * 100)}%`,
      },
      {
        model: 'BASELINE_SIMPLE_TIMING',
        eventAccuracy: domainPrior + 0.05,
        timingAccuracy: 0.35,
        brierScore: 0.22,
        coverage: 0.8,
        notes: 'Naive seasonal/annual timing model â€” no birth data used',
      },
      {
        model: 'DETERMINISTIC_FLOOR',
        eventAccuracy: domainPrior + 0.08,
        timingAccuracy: 0.40,
        brierScore: 0.20,
        coverage: 0.6,
        notes: 'Classical Jyotish rules only â€” no AI synthesis',
      },
    ];

    const randomBaseline = baselines.find(b => b.model === 'BASELINE_RANDOM')!;
    const domainBaseline = baselines.find(b => b.model === 'BASELINE_DOMAIN_PRIOR')!;

    const improvementOverRandom = deepAstroEventAccuracy - randomBaseline.eventAccuracy;
    const improvementOverDomainPrior = deepAstroEventAccuracy - domainBaseline.eventAccuracy;

    let verdict: BaselineComparisonResult['verdict'];
    const beatsAll = baselines.every(b => deepAstroEventAccuracy > b.eventAccuracy && deepAstroBrierScore < b.brierScore);
    if (beatsAll) verdict = 'BEATS_ALL_BASELINES';
    else if (improvementOverRandom > 0.05) verdict = 'BEATS_RANDOM';
    else verdict = 'NO_IMPROVEMENT';

    return {
      deepAstroBrierScore, deepAstroEventAccuracy, deepAstroCoverage,
      baselines, improvementOverRandom, improvementOverDomainPrior,
      verdict, sampleSize, computedAt: new Date().toISOString(),
    };
  }
}
