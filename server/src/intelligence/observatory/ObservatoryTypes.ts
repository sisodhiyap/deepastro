/**
 * DeepAstro Intelligence Observatory — Core Types
 * Immutable schemas for Prediction Claims, Multidimensional Accuracy, Fact Checking & Replay.
 */

export type PredictionDomain =
  | 'CAREER'
  | 'BUSINESS'
  | 'FINANCE'
  | 'RELATIONSHIPS'
  | 'EDUCATION'
  | 'WELLBEING'
  | 'SPIRITUALITY'
  | 'RELOCATION'
  | 'FAMILY'
  | 'CREATIVITY'
  | 'TRAVEL'
  | 'PERSONAL_GROWTH'
  | 'LIFE_PHASE'
  | 'GENERAL'
  | 'OTHER';

export type PredictionDirection = 'POSITIVE' | 'NEUTRAL' | 'CHALLENGING';

export type PredictionMagnitude = 'SUBTLE' | 'MODERATE' | 'SIGNIFICANT' | 'TRANSFORMATIVE';

export type ClaimTestability =
  | 'TESTABLE'
  | 'PARTIALLY_TESTABLE'
  | 'VAGUE'
  | 'NON_FALSIFIABLE'
  | 'UNSUPPORTED'
  | 'CONTRADICTORY'
  | 'DUPLICATIVE'
  | 'TRIVIAL'
  | 'POST_HOC'
  | 'UNKNOWN';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'CONTRADICTED'
  | 'NOT_APPLICABLE';

export type EvidenceCategory =
  | 'CALCULATION'
  | 'PRIMARY_SOURCE'
  | 'VERIFIED_KNOWLEDGE'
  | 'USER_CONFIRMED'
  | 'MULTI_SYSTEM_CONVERGENCE'
  | 'SECONDARY_SOURCE'
  | 'HISTORICAL_OBSERVATION'
  | 'AI_INFERENCE'
  | 'WEAK_INFERENCE'
  | 'UNVERIFIED';

export type OutcomeStatus =
  | 'UNKNOWN'
  | 'AWAITING_OUTCOME'
  | 'USER_CONFIRMED'
  | 'USER_PARTIALLY_CONFIRMED'
  | 'USER_NOT_CONFIRMED'
  | 'EXTERNALLY_VERIFIED'
  | 'CONTRADICTED'
  | 'INCONCLUSIVE';

export type ReleaseDecision =
  | 'RELEASE'
  | 'RELEASE_WITH_UNCERTAINTY'
  | 'SOFTEN'
  | 'REQUEST_MORE_CONTEXT'
  | 'SUPPRESS'
  | 'UNKNOWN';

export interface PredictionTimeWindow {
  startDate: string;
  endDate: string;
  precision: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

export interface PredictionClaim {
  claimId: string;
  predictionId: string;
  userId: string;
  forecastVersion: string;
  issuedAt: string;
  domain: PredictionDomain;
  eventType: string;
  direction: PredictionDirection;
  magnitude: PredictionMagnitude;
  timingWindow: PredictionTimeWindow;
  context: string;
  rawClaimText: string;
  confidence: number;
  uncertainty: number;
  evidenceIds: string[];
  contradictionIds: string[];
  systemsUsed: string[];
  modelUsed: string;
  provider: string;
  calculationSnapshotHash: string;
  knowledgeSnapshotHash: string;
  promptHash: string;
  outputHash: string;
  testability: ClaimTestability;
  isBarnum: boolean;
  isOverconfident: boolean;
}

export interface EvidenceItem {
  evidenceId: string;
  category: EvidenceCategory;
  source: string;
  weight: number;
  verifiedAt: string;
  details: string;
  evidenceHash: string;
}

export interface ContradictionDetail {
  contradictionId: string;
  systemA: string;
  systemB: string;
  description: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  penalty: number;
}

export interface FactCheckRecord {
  factId: string;
  claimId: string;
  statement: string;
  type: 'ASTRONOMICAL_CALCULATION' | 'EXTERNAL_EVENT' | 'INTERPRETIVE_SPECULATION';
  source?: string;
  sourceType?: string;
  retrievedAt: string;
  evidenceHash: string;
  status: VerificationStatus;
  notes: string;
}

export interface PredictionOutcomeRecord {
  outcomeId: string;
  predictionId: string;
  claimId: string;
  userId: string;
  status: OutcomeStatus;
  confirmationSource: string;
  confirmedAt: string;
  userNotes?: string;
  observedEvent?: string;
  observedDate?: string;
  observedDirection?: PredictionDirection;
  observedMagnitude?: PredictionMagnitude;
  observedContext?: string;
  provenance: {
    authenticatedUserId: string;
    verifiedSignature: string;
  };
}

export interface PredictionQualityVector {
  evidenceQuality: number;
  testability: number;
  calibration: number;
  outcomeMatch: number;
  timingPrecision: number;
  contradictionPenalty: number;
  unsupportedClaimPenalty: number;
  overconfidencePenalty: number;
  hallucinationPenalty: number;
  temporalIntegrity: number;
  compositeScore: number;
}

export interface CalibrationBucket {
  range: string;
  minConfidence: number;
  maxConfidence: number;
  count: number;
  meanConfidence: number;
  observedAccuracy: number;
  brierContribution: number;
}

export interface CalibrationRecordV4 {
  totalEvaluated: number;
  brierScore: number;
  logLoss: number;
  expectedCalibrationError: number;
  status: 'WELL_CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'INSUFFICIENT_SAMPLE_SIZE';
  buckets: CalibrationBucket[];
  recommendation: string;
}

export interface ModelComparisonMetrics {
  providerName: string;
  modelName: string;
  accuracyProxy: number;
  evidenceAdherence: number;
  hallucinationRate: number;
  unsupportedClaimRate: number;
  contradictionRate: number;
  overconfidenceRate: number;
  averageLatencyMs: number;
  tokenUsage: number;
  failureRate: number;
  jsonValidityRate: number;
  calibrationQuality: number;
}
