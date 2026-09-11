/**
 * DeepAstro 4.1 — Prediction Evolution Record (PredictionEvolutionRecord)
 * The unified prediction evolution data structure connecting the full lifecycle:
 * 
 * PREDICT -> OBSERVE -> CONFIRM -> COMPARE -> DIAGNOSE -> HYPOTHESIZE ->
 * EXPERIMENT -> VALIDATE -> CALIBRATE -> GOVERN -> CANARY -> MONITOR
 * 
 * State Machine:
 * DRAFT -> ISSUED -> AWAITING_OUTCOME -> OUTCOME_PENDING -> (CONFIRMED | PARTIALLY_CONFIRMED | NOT_CONFIRMED | UNKNOWN) -> EXPIRED -> EVALUATED -> DIAGNOSED
 */

export type EvolutionPredictionState =
  | 'DRAFT'
  | 'ISSUED'
  | 'AWAITING_OUTCOME'
  | 'OUTCOME_PENDING'
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'UNKNOWN'
  | 'EXPIRED'
  | 'EVALUATED'
  | 'DIAGNOSED';

export interface PredictionEvolutionRecord {
  predictionId: string;
  userId: string;
  tenantId: string;
  predictionVersion: number;
  strategyVersion: string;
  calculationSnapshotId: string;

  predictionDomain: string;
  predictionType: string;
  predictionStatement: string;

  expectedEvent: string;
  expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
  expectedTimeWindow: {
    startDate: string;
    endDate: string;
    scale?: string;
  };

  predictionConfidence: number;
  predictionUncertainty: string;

  evidenceIds: string[];
  researchIds: string[];
  contextIds: string[];
  reasoningStrategy: string;

  state: EvolutionPredictionState;
  outcomeId?: string;
  comparisonId?: string;
  errorDiagnosisIds: string[];
  calibrationSnapshotId?: string;

  learningCandidateId?: string;
  experimentId?: string;

  createdAt: string;
  updatedAt: string;
}

export class PredictionEvolutionStore {
  private static store: Map<string, PredictionEvolutionRecord> = new Map();

  public static resetStore(): void {
    this.store.clear();
  }

  public static createRecord(params: {
    predictionId: string;
    userId: string;
    tenantId?: string;
    strategyVersion?: string;
    calculationSnapshotId: string;
    predictionDomain: string;
    predictionType: string;
    predictionStatement: string;
    expectedEvent: string;
    expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
    expectedTimeWindow: { startDate: string; endDate: string; scale?: string };
    predictionConfidence: number;
    predictionUncertainty: string;
    evidenceIds: string[];
    researchIds?: string[];
    contextIds?: string[];
    reasoningStrategy?: string;
  }): PredictionEvolutionRecord {
    const now = new Date().toISOString();
    const record: PredictionEvolutionRecord = {
      predictionId: params.predictionId,
      userId: params.userId,
      tenantId: params.tenantId || 'tenant_default',
      predictionVersion: 1,
      strategyVersion: params.strategyVersion || 'STRATEGY_D_v1.0',
      calculationSnapshotId: params.calculationSnapshotId,
      predictionDomain: params.predictionDomain,
      predictionType: params.predictionType,
      predictionStatement: params.predictionStatement,
      expectedEvent: params.expectedEvent,
      expectedDirection: params.expectedDirection,
      expectedTimeWindow: params.expectedTimeWindow,
      predictionConfidence: params.predictionConfidence,
      predictionUncertainty: params.predictionUncertainty,
      evidenceIds: params.evidenceIds,
      researchIds: params.researchIds || [],
      contextIds: params.contextIds || [],
      reasoningStrategy: params.reasoningStrategy || 'MultiSystemEvidenceFusionV3',
      state: 'ISSUED',
      errorDiagnosisIds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(params.predictionId, record);
    return { ...record };
  }

  public static transitionState(
    predictionId: string,
    nextState: EvolutionPredictionState,
    meta?: { outcomeId?: string; comparisonId?: string; diagnosisId?: string; candidateId?: string }
  ): PredictionEvolutionRecord {
    const record = this.store.get(predictionId);
    if (!record) {
      throw new Error(`EVOLUTION_RECORD_NOT_FOUND: Record for prediction ${predictionId} does not exist.`);
    }

    // Invariant: Never allow transition from UNKNOWN -> CONFIRMED without explicit confirmation
    if (record.state === 'UNKNOWN' && nextState === 'CONFIRMED' && !meta?.outcomeId) {
      throw new Error(`ILLEGAL_STATE_TRANSITION: Cannot transition from UNKNOWN to CONFIRMED without explicit verified outcome evidence.`);
    }

    record.state = nextState;
    if (meta?.outcomeId) record.outcomeId = meta.outcomeId;
    if (meta?.comparisonId) record.comparisonId = meta.comparisonId;
    if (meta?.diagnosisId) record.errorDiagnosisIds.push(meta.diagnosisId);
    if (meta?.candidateId) record.learningCandidateId = meta.candidateId;
    record.updatedAt = new Date().toISOString();

    this.store.set(predictionId, record);
    return { ...record };
  }

  public static getRecord(predictionId: string): PredictionEvolutionRecord | undefined {
    const r = this.store.get(predictionId);
    return r ? { ...r } : undefined;
  }

  public static getUserHistory(userId: string): PredictionEvolutionRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.userId === userId)
      .map((r) => ({ ...r }));
  }
}
