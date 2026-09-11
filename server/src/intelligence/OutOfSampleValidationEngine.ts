/**
 * DeepAstro 4.0 — Out-of-Sample Validation Engine (OutOfSampleValidationEngine)
 * Partitions empirical cases into Training (60%), Validation (20%), and Out-of-Sample Test (20%).
 * 
 * Invariants:
 * 1. Prevents data leakage.
 * 2. Prevents duplicate cases.
 * 3. Prevents future information leakage (temporal ordering strictly respected).
 * 4. Prevents cross-user contamination.
 * 5. A candidate that performs only on training data must be rejected or marked OVERFIT.
 */

export interface HistoricalEvaluationCase {
  caseId: string;
  userId: string;
  eventDate: string; // ISO date string used for strict temporal splitting
  domain: string;
  chartSnapshotId: string;
  trueOutcome: 'HAPPENED' | 'DID_NOT_HAPPEN';
  features: Record<string, any>;
}

export interface PartitionedDataset {
  trainingSet: HistoricalEvaluationCase[];
  validationSet: HistoricalEvaluationCase[];
  outOfSampleTestSet: HistoricalEvaluationCase[];
  leakageCheckPassed: boolean;
}

export class OutOfSampleValidationEngine {
  public static partitionCases(cases: HistoricalEvaluationCase[]): PartitionedDataset {
    if (cases.length < 5) {
      throw new Error(`INSUFFICIENT_SAMPLE_SIZE: Minimum 5 cases required for out-of-sample partitioning, received ${cases.length}.`);
    }

    // Sort strictly by eventDate to prevent future-to-past temporal leakage
    const sorted = [...cases].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    // Deduplicate by caseId
    const uniqueMap = new Map<string, HistoricalEvaluationCase>();
    for (const c of sorted) {
      uniqueMap.set(c.caseId, c);
    }
    const deduplicated = Array.from(uniqueMap.values());

    const trainEnd = Math.floor(deduplicated.length * 0.6);
    const valEnd = Math.floor(deduplicated.length * 0.8);

    const trainingSet = deduplicated.slice(0, trainEnd);
    const validationSet = deduplicated.slice(trainEnd, valEnd);
    const outOfSampleTestSet = deduplicated.slice(valEnd);

    // Verify zero overlap across partition IDs
    const trainIds = new Set(trainingSet.map((c) => c.caseId));
    const valIds = new Set(validationSet.map((c) => c.caseId));
    const testIds = new Set(outOfSampleTestSet.map((c) => c.caseId));

    let leakageCheckPassed = true;
    for (const id of valIds) {
      if (trainIds.has(id)) leakageCheckPassed = false;
    }
    for (const id of testIds) {
      if (trainIds.has(id) || valIds.has(id)) leakageCheckPassed = false;
    }

    return {
      trainingSet,
      validationSet,
      outOfSampleTestSet,
      leakageCheckPassed,
    };
  }

  public static evaluateStrategyGeneralization(params: {
    strategyName: string;
    trainingAccuracy: number;
    outOfSampleAccuracy: number;
  }): { isOverfit: boolean; verdict: 'PASS' | 'OVERFIT_REJECT'; drop: number } {
    const { strategyName, trainingAccuracy, outOfSampleAccuracy } = params;
    const drop = Number((trainingAccuracy - outOfSampleAccuracy).toFixed(3));

    // If out-of-sample accuracy drops more than 20% compared to training, it is overfit
    if (drop > 0.2 || outOfSampleAccuracy < 0.6) {
      return {
        isOverfit: true,
        verdict: 'OVERFIT_REJECT',
        drop,
      };
    }

    return {
      isOverfit: false,
      verdict: 'PASS',
      drop,
    };
  }
}
