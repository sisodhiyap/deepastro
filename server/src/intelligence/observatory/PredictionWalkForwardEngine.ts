/**
 * DeepAstro Prediction Walk-Forward Engine
 * Chronological validation: Train -> Calibration -> Blind Test.
 * Invariant: Never random-shuffle temporal prediction datasets.
 */

export interface WalkForwardWindow<T> {
  windowId: string;
  trainSet: T[];
  calibrationSet: T[];
  testSet: T[];
}

export class PredictionWalkForwardEngine {
  public static splitChronologically<T extends { issuedAt: string }>(
    items: T[],
    trainRatio = 0.6,
    calibRatio = 0.2
  ): WalkForwardWindow<T> {
    const sorted = [...items].sort(
      (a, b) => new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
    );

    const N = sorted.length;
    const trainEnd = Math.floor(N * trainRatio);
    const calibEnd = Math.floor(N * (trainRatio + calibRatio));

    return {
      windowId: `wf_${Date.now()}`,
      trainSet: sorted.slice(0, trainEnd),
      calibrationSet: sorted.slice(trainEnd, calibEnd),
      testSet: sorted.slice(calibEnd),
    };
  }
}
