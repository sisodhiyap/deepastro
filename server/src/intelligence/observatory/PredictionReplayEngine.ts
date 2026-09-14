/**
 * DeepAstro Clean-Room Prediction Replay Engine
 * Enforces strict temporal cutoff at `forecastIssuedAt`.
 * Invariant: Any access to data created AFTER cutoff throws CRITICAL_TEST_FAILURE.
 */

export interface CleanRoomReplayContext {
  predictionId: string;
  forecastIssuedAt: string;
  snapshotCutoffTimestamp: string;
  maxPermissibleTimestamp: string;
}

export class PredictionReplayEngine {
  public static createReplayContext(predictionId: string, issuedAt: string): CleanRoomReplayContext {
    return {
      predictionId,
      forecastIssuedAt: issuedAt,
      snapshotCutoffTimestamp: issuedAt,
      maxPermissibleTimestamp: issuedAt,
    };
  }

  public static assertTemporalIntegrity(dataTimestamp: string, context: CleanRoomReplayContext): void {
    const dataTime = new Date(dataTimestamp).getTime();
    const cutoffTime = new Date(context.maxPermissibleTimestamp).getTime();

    if (dataTime > cutoffTime) {
      throw new Error(
        `CRITICAL_TEST_FAILURE: Temporal leakage detected in CleanRoomReplayEngine. Data timestamp [${dataTimestamp}] exceeds cutoff [${context.maxPermissibleTimestamp}].`
      );
    }
  }
}
