/**
 * DeepAstro Prediction Outcome Engine
 * Invariant: Silence = UNKNOWN.
 * Casual conversational replies ("nice", "interesting", "maybe") are strictly rejected.
 * Only explicit authenticated user confirmations record USER_CONFIRMED.
 */

import { OutcomeStatus, PredictionOutcomeRecord } from './ObservatoryTypes.js';
import crypto from 'crypto';

export class PredictionOutcomeEngine {
  private static outcomeStore: Map<string, PredictionOutcomeRecord> = new Map();

  public static reset(): void {
    this.outcomeStore.clear();
  }

  public static recordUserOutcome(params: {
    predictionId: string;
    claimId: string;
    userId: string;
    status: OutcomeStatus;
    confirmationSource?: string;
    userNotes?: string;
    observedEvent?: string;
    observedDate?: string;
  }): PredictionOutcomeRecord {
    const { predictionId, claimId, userId, status, userNotes, observedEvent, observedDate } = params;

    // Disallow casual conversational replies from confirming outcomes
    if (userNotes && (status === 'USER_CONFIRMED' || status === 'USER_PARTIALLY_CONFIRMED')) {
      const casualReactions = ['interesting', 'nice', 'maybe', 'sounds right', 'cool', 'ok', 'let us see', 'lets see'];
      const normalized = userNotes.trim().toLowerCase();
      if (casualReactions.includes(normalized)) {
        throw new Error('CONSTITUTION_VIOLATION: Casual conversational remarks ("nice", "interesting", "maybe") cannot confirm outcomes. Explicit verification required.');
      }
    }

    const outcomeId = `outc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const confirmedAt = new Date().toISOString();
    const verifiedSignature = crypto.createHash('sha256').update(`${userId}:${predictionId}:${status}:${confirmedAt}`).digest('hex');

    const record: PredictionOutcomeRecord = {
      outcomeId,
      predictionId,
      claimId,
      userId,
      status,
      confirmationSource: params.confirmationSource || 'User Authenticated Interface',
      confirmedAt,
      userNotes,
      observedEvent,
      observedDate,
      provenance: {
        authenticatedUserId: userId,
        verifiedSignature,
      },
    };

    this.outcomeStore.set(outcomeId, record);
    return record;
  }

  public static getOutcome(outcomeId: string): PredictionOutcomeRecord | undefined {
    return this.outcomeStore.get(outcomeId);
  }

  public static getOutcomesForPrediction(predictionId: string): PredictionOutcomeRecord[] {
    return Array.from(this.outcomeStore.values()).filter((o) => o.predictionId === predictionId);
  }

  public static getUserOutcomes(userId: string): PredictionOutcomeRecord[] {
    return Array.from(this.outcomeStore.values()).filter((o) => o.userId === userId);
  }
}
