/**
 * DeepAstro Prediction Regression Engine
 * Prevents regression on established prediction performance benchmarks.
 */

export class PredictionRegressionEngine {
  public static verifyNoRegression(previousBenchmark: number, currentBenchmark: number): {
    passed: boolean;
    regressionScore: number;
  } {
    const diff = currentBenchmark - previousBenchmark;
    const passed = diff >= -0.02; // Max 2% acceptable variance margin

    return {
      passed,
      regressionScore: Number(diff.toFixed(3)),
    };
  }
}
