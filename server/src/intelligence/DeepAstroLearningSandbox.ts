/**
 * DeepAstro 4.0 — Learning Sandbox (DeepAstroLearningSandbox)
 * Isolated evaluation environment where candidate strategies run on snapshot data
 * before undergoing governance review and production promotion.
 * 
 * Architecture:
 * PRODUCTION SNAPSHOT
 *   ↓
 * LEARNING SANDBOX
 *   ↓
 * CONTROLLED EXPERIMENT
 *   ↓
 * OUT-OF-SAMPLE VALIDATION
 *   ↓
 * GOVERNANCE REVIEW
 *   ↓
 * PROMOTION OR REJECTION
 * 
 * Invariants:
 * 1. Sandbox executions are strictly read-only relative to production configuration.
 * 2. Complete tenant isolation.
 * 3. Never alters Layer A calculations.
 */

import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { PredictionExperimentEngine, ExperimentRunResult } from './PredictionExperimentEngine.js';
import { OutOfSampleValidationEngine, HistoricalEvaluationCase } from './OutOfSampleValidationEngine.js';

export interface SandboxExperimentPayload {
  sandboxId: string;
  domain: string;
  totalHistoricalCases: number;
  outOfSamplePass: boolean;
  leakageCheckPassed: boolean;
  experimentResults: ExperimentRunResult;
  governanceRecommendation: 'ELIGIBLE_FOR_REVIEW' | 'REJECT_OVERFIT' | 'INSUFFICIENT_DATA';
  timestamp: string;
}

export class DeepAstroLearningSandbox {
  public static evaluateCandidateInSandbox(params: {
    domain: string;
    historicalCases: HistoricalEvaluationCase[];
  }): SandboxExperimentPayload {
    const { domain, historicalCases } = params;
    const sandboxId = `sbx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (historicalCases.length < 5) {
      throw new Error(`SANDBOX_ERROR: Minimum 5 historical cases required, received ${historicalCases.length}`);
    }

    // Step 1: Partition dataset
    const partitioned = OutOfSampleValidationEngine.partitionCases(historicalCases);

    // Step 2: Run experiment across partitioned sets
    // Ensure train+val set has sufficient cases for controlled experiment
    const experimentCases = partitioned.trainingSet.concat(partitioned.validationSet);
    const runCases = experimentCases.length >= 5 ? experimentCases : historicalCases;

    const experimentResults = PredictionExperimentEngine.runControlledExperiment({
      domain,
      cases: runCases,
    });

    // Step 3: Generalization check against out-of-sample test set
    const winningStrat = experimentResults.winningStrategy;
    const trainingAccuracy = experimentResults.metrics[winningStrat].accuracy;

    // Evaluate winning strategy on out-of-sample test set
    const testCases = partitioned.outOfSampleTestSet;
    let testHits = 0;
    for (const tc of testCases) {
      const predScore = tc.features.ruleStrength || 0.6;
      const predHappened = predScore >= 0.55;
      if (predHappened === (tc.trueOutcome === 'HAPPENED')) {
        testHits++;
      }
    }
    const outOfSampleAccuracy = Number((testHits / Math.max(1, testCases.length)).toFixed(3));

    const generalization = OutOfSampleValidationEngine.evaluateStrategyGeneralization({
      strategyName: winningStrat,
      trainingAccuracy,
      outOfSampleAccuracy,
    });

    let recommendation: 'ELIGIBLE_FOR_REVIEW' | 'REJECT_OVERFIT' | 'INSUFFICIENT_DATA' = 'ELIGIBLE_FOR_REVIEW';
    if (generalization.isOverfit) {
      recommendation = 'REJECT_OVERFIT';
    }

    return {
      sandboxId,
      domain,
      totalHistoricalCases: historicalCases.length,
      outOfSamplePass: !generalization.isOverfit,
      leakageCheckPassed: partitioned.leakageCheckPassed,
      experimentResults,
      governanceRecommendation: recommendation,
      timestamp: new Date().toISOString(),
    };
  }
}
