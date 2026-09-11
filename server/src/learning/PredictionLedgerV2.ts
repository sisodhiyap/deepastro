/**
 * Prediction Ledger V2 (PredictionLedgerV2)
 * Phase 7 Master Immutable Prediction Ledger.
 * Enforces cryptographic immutability, prediction type classification,
 * probabilistic language compliance, and audit traceability.
 */

import crypto from 'crypto';

export type PredictionType =
  | 'DIRECTIONAL'
  | 'TIMING'
  | 'EVENT_WINDOW'
  | 'THEME'
  | 'DECISION_COMPARISON'
  | 'LIFE_PATTERN';

export type PredictionDirection = 'FAVORABLE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED';

export type PredictionStatus = 'ACTIVE' | 'OUTCOME_RECORDED' | 'EXPIRED' | 'REFINED';

export interface PredictionLedgerV2Entry {
  predictionId: string;
  userId: string;
  question: string;
  predictionType: PredictionType;
  createdAt: string;
  calculationPassportId: string;
  methodology: string;
  evidenceBundleId: string;
  statement: string;
  timeWindow: {
    startDate: string;
    endDate: string;
    description: string;
  };
  direction: PredictionDirection;
  confidence: number; // 0.0 to 1.0
  limitations: string[];
  systemsUsed: string[];
  status: PredictionStatus;
  immutableHash: string;
}

export class PredictionLedgerV2 {
  private static entries: Map<string, PredictionLedgerV2Entry> = new Map();

  public static resetStore(): void {
    this.entries.clear();
  }

  private static computeHash(entry: Omit<PredictionLedgerV2Entry, 'immutableHash'>): string {
    const serialized = JSON.stringify({
      id: entry.predictionId,
      user: entry.userId,
      q: entry.question,
      statement: entry.statement,
      time: entry.timeWindow,
      passport: entry.calculationPassportId,
      created: entry.createdAt,
    });
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public static recordPrediction(params: {
    userId: string;
    question: string;
    predictionType: PredictionType;
    calculationPassportId: string;
    methodology: string;
    evidenceBundleId: string;
    statement: string;
    timeWindow: { startDate: string; endDate: string; description: string };
    direction: PredictionDirection;
    confidence: number;
    limitations: string[];
    systemsUsed: string[];
  }): PredictionLedgerV2Entry {
    // 1. Language Compliance Check (Anti-Fatalism)
    const fatalisticPatterns = [
      /\bwill definitely\b/i,
      /\bguaranteed\b/i,
      /\bcertainly happen\b/i,
      /\binevitably\b/i,
      /\bdestined without doubt\b/i,
    ];
    for (const pattern of fatalisticPatterns) {
      if (pattern.test(params.statement)) {
        throw new Error(`FATALISTIC_LANGUAGE_PROHIBITED: Astrology represents supportive tendencies and timing windows, not deterministic certainty. Offending phrase matched: ${pattern}`);
      }
    }

    const predictionId = `pred_v2_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const partialEntry = {
      predictionId,
      userId: params.userId,
      question: params.question,
      predictionType: params.predictionType,
      createdAt,
      calculationPassportId: params.calculationPassportId,
      methodology: params.methodology,
      evidenceBundleId: params.evidenceBundleId,
      statement: params.statement,
      timeWindow: params.timeWindow,
      direction: params.direction,
      confidence: Math.max(0, Math.min(1, params.confidence)),
      limitations: params.limitations,
      systemsUsed: params.systemsUsed,
      status: 'ACTIVE' as PredictionStatus,
    };

    const immutableHash = this.computeHash(partialEntry);
    const entry: PredictionLedgerV2Entry = { ...partialEntry, immutableHash };

    this.entries.set(predictionId, Object.freeze({ ...entry }));
    return entry;
  }

  public static getPrediction(predictionId: string): PredictionLedgerV2Entry | null {
    const entry = this.entries.get(predictionId);
    return entry ? { ...entry } : null;
  }

  public static getUserPredictions(userId: string): PredictionLedgerV2Entry[] {
    return Array.from(this.entries.values()).filter((p) => p.userId === userId);
  }

  public static updateStatus(predictionId: string, newStatus: PredictionStatus): void {
    const existing = this.entries.get(predictionId);
    if (!existing) {
      throw new Error(`PREDICTION_NOT_FOUND: ${predictionId}`);
    }
    // Update status only without touching statement or calculation linkage
    const updated = { ...existing, status: newStatus };
    this.entries.set(predictionId, Object.freeze(updated));
  }

  public static attemptMutation(predictionId: string, mutatedStatement: string): never {
    throw new Error(`IMMUTABLE_PREDICTION_ERROR: Historical predictions in PredictionLedgerV2 cannot be mutated or rewritten (target: ${predictionId}).`);
  }

  public static deleteUserData(userId: string): number {
    let count = 0;
    for (const [id, entry] of this.entries.entries()) {
      if (entry.userId === userId) {
        this.entries.delete(id);
        count++;
      }
    }
    return count;
  }
}
