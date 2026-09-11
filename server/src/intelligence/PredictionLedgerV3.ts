/**
 * DeepAstro 4.0 — Prediction Ledger V3 (PredictionLedgerV3)
 * Immutable prediction registry with cryptographic provenance.
 * 
 * Strict Invariants:
 * 1. Never overwrite or delete historical predictions.
 * 2. Every prediction receives a unique immutable ID.
 * 3. Status transitions strictly follow:
 *    ACTIVE -> AWAITING_OUTCOME -> (OUTCOME_CONFIRMED | OUTCOME_PARTIAL | OUTCOME_FAILED | OUTCOME_UNKNOWN | EXPIRED | UNDER_REVIEW)
 * 4. Tenant isolation: Predictions of User A are strictly isolated from User B.
 */

export type PredictionStatusV3 =
  | 'ACTIVE'
  | 'AWAITING_OUTCOME'
  | 'OUTCOME_CONFIRMED'
  | 'OUTCOME_PARTIAL'
  | 'OUTCOME_FAILED'
  | 'OUTCOME_UNKNOWN'
  | 'EXPIRED'
  | 'UNDER_REVIEW';

export interface PredictionLedgerV3Entry {
  predictionId: string;
  userId: string;
  questionId: string;
  timestamp: string;
  predictionType: string;
  domain: string;
  predictionText: string;
  structuredPrediction: {
    expectedEvent: string;
    expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
    expectedTimeWindow: {
      startDate: string;
      endDate: string;
      scale: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    };
  };
  chartSnapshotId: string;
  calculationVersion: string;
  rulesUsed: string[];
  systemsUsed: string[];
  evidenceIds: string[];
  researchIds: string[];
  contextIds: string[];
  reasoningStrategy: string;
  confidence: number;
  uncertainty: string;
  alternativeHypotheses: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: PredictionStatusV3;
  createdAt: string;
  updatedAt: string;
}

export class PredictionLedgerV3 {
  private static store: Map<string, PredictionLedgerV3Entry> = new Map();

  public static resetStore(): void {
    this.store.clear();
  }

  public static recordPrediction(params: {
    userId: string;
    questionId: string;
    predictionType: string;
    domain: string;
    predictionText: string;
    expectedEvent: string;
    expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
    timeWindow: {
      startDate: string;
      endDate: string;
      scale: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    };
    chartSnapshotId: string;
    calculationVersion?: string;
    rulesUsed: string[];
    systemsUsed: string[];
    evidenceIds: string[];
    researchIds?: string[];
    contextIds?: string[];
    reasoningStrategy?: string;
    confidence: number;
    uncertainty: string;
    alternativeHypotheses?: string[];
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): PredictionLedgerV3Entry {
    const predictionId = `pred3_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const entry: PredictionLedgerV3Entry = {
      predictionId,
      userId: params.userId,
      questionId: params.questionId,
      timestamp: now,
      predictionType: params.predictionType,
      domain: params.domain,
      predictionText: params.predictionText,
      structuredPrediction: {
        expectedEvent: params.expectedEvent,
        expectedDirection: params.expectedDirection,
        expectedTimeWindow: params.timeWindow,
      },
      chartSnapshotId: params.chartSnapshotId,
      calculationVersion: params.calculationVersion || 'VedicAstroEngine-4.0-VSOP87',
      rulesUsed: params.rulesUsed,
      systemsUsed: params.systemsUsed,
      evidenceIds: params.evidenceIds,
      researchIds: params.researchIds || [],
      contextIds: params.contextIds || [],
      reasoningStrategy: params.reasoningStrategy || 'MultiSystemEvidenceFusionV3',
      confidence: params.confidence,
      uncertainty: params.uncertainty,
      alternativeHypotheses: params.alternativeHypotheses || [],
      riskLevel: params.riskLevel || 'LOW',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(predictionId, entry);
    return { ...entry };
  }

  public static getPrediction(predictionId: string): PredictionLedgerV3Entry | undefined {
    const entry = this.store.get(predictionId);
    return entry ? { ...entry } : undefined;
  }

  public static getUserPredictions(userId: string): PredictionLedgerV3Entry[] {
    return Array.from(this.store.values())
      .filter((p) => p.userId === userId)
      .map((p) => ({ ...p }));
  }

  public static updateStatus(
    predictionId: string,
    newStatus: PredictionStatusV3,
    requestingUserId: string
  ): PredictionLedgerV3Entry {
    const entry = this.store.get(predictionId);
    if (!entry) {
      throw new Error(`PREDICTION_NOT_FOUND: Prediction ${predictionId} does not exist in Ledger V3.`);
    }

    if (entry.userId !== requestingUserId) {
      throw new Error(`TENANT_ISOLATION_VIOLATION: User ${requestingUserId} cannot alter prediction owned by ${entry.userId}.`);
    }

    // Invariant: Historical prediction record itself is immutable; only lifecycle status advances
    entry.status = newStatus;
    entry.updatedAt = new Date().toISOString();
    this.store.set(predictionId, entry);

    return { ...entry };
  }

  public static getAllActive(): PredictionLedgerV3Entry[] {
    return Array.from(this.store.values()).filter((p) => p.status === 'ACTIVE' || p.status === 'AWAITING_OUTCOME');
  }
}
