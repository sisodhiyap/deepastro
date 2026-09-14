/**
 * DeepAstro 4.0 — Prediction Outcome Engine V3 (PredictionOutcomeEngineV3)
 * Manages verifiable user outcomes without AI hallucination or manufactured success.
 * 
 * Invariants:
 * 1. An outcome must be:
 *    - Explicitly user-confirmed
 *    - Explicitly observed through an authorized external system
 *    - Or marked UNKNOWN
 * 2. Allowed statuses: CONFIRMED | PARTIALLY_CONFIRMED | NOT_CONFIRMED | UNKNOWN
 * 3. Never convert UNKNOWN into success.
 * 4. Never manufacture outcomes.
 * 5. Strict tenant isolation.
 */

import { PredictionLedgerV3, PredictionStatusV3 } from './PredictionLedgerV3.js';
import { PredictionCalibrationEngineV3 } from './PredictionCalibrationEngineV3.js';

export type GroundedOutcomeStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'UNKNOWN';

export interface StoredOutcomeRecordV3 {
  outcomeId: string;
  predictionId: string;
  userId: string;
  outcome: GroundedOutcomeStatus;
  outcomeType: 'USER_CONFIRMED' | 'AUTHORIZED_SYSTEM_OBSERVED' | 'UNKNOWN';
  confirmationSource: string;
  confirmationTimestamp: string;
  confidence: number;
  userNotes?: string;
  provenance: {
    authenticatedUserId: string;
    clientIpMasked?: string;
    verifiedSignature?: string;
  };
}

export class PredictionOutcomeEngineV3 {
  private static outcomes: Map<string, StoredOutcomeRecordV3> = new Map();

  public static resetStore(): void {
    this.outcomes.clear();
  }

  public static recordOutcome(params: {
    predictionId: string;
    userId: string;
    outcome: GroundedOutcomeStatus;
    outcomeType?: 'USER_CONFIRMED' | 'AUTHORIZED_SYSTEM_OBSERVED' | 'UNKNOWN';
    confirmationSource?: string;
    confidence?: number;
    userNotes?: string;
  }): StoredOutcomeRecordV3 {
    const { predictionId, userId, outcome, userNotes } = params;

    // Verify prediction exists and user matches
    const prediction = PredictionLedgerV3.getPrediction(predictionId);
    if (!prediction) {
      throw new Error(`PREDICTION_NOT_FOUND: Prediction ${predictionId} does not exist.`);
    }

    // Phase 8 & Rule 004: Conversational reactions must NOT become confirmed outcomes
    if (userNotes && (outcome === 'CONFIRMED' || outcome === 'PARTIALLY_CONFIRMED')) {
      const casualReactions = ['interesting', 'nice', 'maybe', 'that sounds right', 'cool', 'ok', 'sounds good'];
      const normalizedNotes = userNotes.trim().toLowerCase();
      if (casualReactions.includes(normalizedNotes)) {
        throw new Error('CONSTITUTION_VIOLATION [Rule 004]: Casual conversational reactions ("nice", "interesting", "maybe", etc.) cannot confirm prediction outcomes. Explicit verification required.');
      }
    }

    if (prediction.userId !== userId) {
      throw new Error(`TENANT_ISOLATION_VIOLATION: User ${userId} is not authorized to confirm outcome for prediction ${predictionId}.`);
    }

    const outcomeId = `outc3_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const record: StoredOutcomeRecordV3 = {
      outcomeId,
      predictionId,
      userId,
      outcome,
      outcomeType: params.outcomeType || 'USER_CONFIRMED',
      confirmationSource: params.confirmationSource || 'DeepAstro User Direct Verification',
      confirmationTimestamp: now,
      confidence: params.confidence ?? (outcome === 'CONFIRMED' ? 1.0 : outcome === 'PARTIALLY_CONFIRMED' ? 0.5 : 0.0),
      userNotes,
      provenance: {
        authenticatedUserId: userId,
      },
    };

    this.outcomes.set(outcomeId, record);

    // Synchronize Ledger status
    let ledgerStatus: PredictionStatusV3 = 'OUTCOME_UNKNOWN';
    if (outcome === 'CONFIRMED') ledgerStatus = 'OUTCOME_CONFIRMED';
    else if (outcome === 'PARTIALLY_CONFIRMED') ledgerStatus = 'OUTCOME_PARTIAL';
    else if (outcome === 'NOT_CONFIRMED') ledgerStatus = 'OUTCOME_FAILED';

    PredictionLedgerV3.updateStatus(predictionId, ledgerStatus, userId);

    // Feed calibration engine if conclusive
    let calibrationOutcome: 'HAPPENED' | 'PARTIALLY_HAPPENED' | 'DID_NOT_HAPPEN' | 'UNKNOWN' = 'UNKNOWN';
    if (outcome === 'CONFIRMED') calibrationOutcome = 'HAPPENED';
    else if (outcome === 'PARTIALLY_CONFIRMED') calibrationOutcome = 'PARTIALLY_HAPPENED';
    else if (outcome === 'NOT_CONFIRMED') calibrationOutcome = 'DID_NOT_HAPPEN';

    PredictionCalibrationEngineV3.recordCalibrationPoint({
      predictionId,
      userId,
      predictedConfidence: prediction.confidence,
      confirmedOutcome: calibrationOutcome,
      domain: prediction.domain,
    });

    return { ...record };
  }

  public static getOutcome(outcomeId: string): StoredOutcomeRecordV3 | undefined {
    const outc = this.outcomes.get(outcomeId);
    return outc ? { ...outc } : undefined;
  }

  public static getOutcomesByPrediction(predictionId: string): StoredOutcomeRecordV3[] {
    return Array.from(this.outcomes.values())
      .filter((o) => o.predictionId === predictionId)
      .map((o) => ({ ...o }));
  }

  public static getUserOutcomes(userId: string): StoredOutcomeRecordV3[] {
    return Array.from(this.outcomes.values())
      .filter((o) => o.userId === userId)
      .map((o) => ({ ...o }));
  }
}
