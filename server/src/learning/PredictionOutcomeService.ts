/**
 * Prediction Outcome Service (PredictionOutcomeService)
 * Manages user-confirmed outcome reporting for astrological predictions.
 * Only authenticated, voluntary user-reported outcomes enter the calibration pipeline.
 * Automated scraping, device surveillance, or private inference is strictly prohibited.
 */

import crypto from 'crypto';
import { PredictionLedgerV2, PredictionLedgerV2Entry } from './PredictionLedgerV2.js';

export type UserOutcomeState =
  | 'HAPPENED'
  | 'PARTIALLY_HAPPENED'
  | 'DID_NOT_HAPPEN'
  | 'NOT_SURE'
  | 'NOT_APPLICABLE';

export interface RecordOutcomeInput {
  userId: string;
  predictionId: string;
  outcome: UserOutcomeState;
  actualDate?: string;
  actualCategory?: string;
  userNotes?: string;
  userRating?: number; // 1 to 5
}

export interface StoredOutcomeRecord {
  outcomeId: string;
  predictionId: string;
  userId: string;
  outcome: UserOutcomeState;
  actualDate?: string;
  actualCategory?: string;
  userNotes?: string;
  userRating?: number;
  recordedAt: string;
  provenance: {
    sourceType: 'USER_CONFIRMED_VOLUNTARY';
    clientIpMasked?: string;
  };
}

export class PredictionOutcomeService {
  private static outcomes: Map<string, StoredOutcomeRecord> = new Map();

  public static resetStore(): void {
    this.outcomes.clear();
  }

  public static recordUserOutcome(input: RecordOutcomeInput): StoredOutcomeRecord {
    const prediction = PredictionLedgerV2.getPrediction(input.predictionId);
    if (!prediction) {
      throw new Error(`PREDICTION_NOT_FOUND: Prediction ID ${input.predictionId} does not exist.`);
    }

    if (prediction.userId !== input.userId) {
      throw new Error(`UNAUTHORIZED_OUTCOME_RECORDING: User ${input.userId} cannot record outcomes for prediction owned by another user.`);
    }

    const outcomeId = `outc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const record: StoredOutcomeRecord = {
      outcomeId,
      predictionId: input.predictionId,
      userId: input.userId,
      outcome: input.outcome,
      actualDate: input.actualDate,
      actualCategory: input.actualCategory,
      userNotes: input.userNotes,
      userRating: input.userRating,
      recordedAt: new Date().toISOString(),
      provenance: {
        sourceType: 'USER_CONFIRMED_VOLUNTARY',
      },
    };

    this.outcomes.set(outcomeId, Object.freeze(record));
    PredictionLedgerV2.updateStatus(input.predictionId, 'OUTCOME_RECORDED');

    return record;
  }

  public static getUserOutcomes(userId: string): StoredOutcomeRecord[] {
    return Array.from(this.outcomes.values()).filter((o) => o.userId === userId);
  }

  public static getAllOutcomes(): StoredOutcomeRecord[] {
    return Array.from(this.outcomes.values());
  }

  public static deleteUserData(userId: string): number {
    let count = 0;
    for (const [id, record] of this.outcomes.entries()) {
      if (record.userId === userId) {
        this.outcomes.delete(id);
        count++;
      }
    }
    return count;
  }
}
