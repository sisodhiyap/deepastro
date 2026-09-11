/**
 * DeepAstro Intelligence Upgrade 3.0 — Comprehensive Type Definitions
 * Unifies all data models, epistemic ranking hierarchies, and reasoning contracts.
 */

import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { CalculationPassport } from '../astrology/CalculationPassport.js';

export enum EpistemicLevel {
  LEVEL_1_CALCULATED_FACT = 'LEVEL_1_CALCULATED_FACT',
  LEVEL_2_INDEPENDENTLY_VERIFIED_FACT = 'LEVEL_2_INDEPENDENTLY_VERIFIED_FACT',
  LEVEL_3_VERSIONED_CLASSICAL_RULE = 'LEVEL_3_VERSIONED_CLASSICAL_RULE',
  LEVEL_4_TRUSTED_SOURCE = 'LEVEL_4_TRUSTED_SOURCE',
  LEVEL_5_USER_CONFIRMED_CONTEXT = 'LEVEL_5_USER_CONFIRMED_CONTEXT',
  LEVEL_6_APPROVED_WORLD_FACT = 'LEVEL_6_APPROVED_WORLD_FACT',
  LEVEL_7_AI_INTERPRETATION = 'LEVEL_7_AI_INTERPRETATION',
  LEVEL_8_SPECULATION = 'LEVEL_8_SPECULATION',
}

export type IntentCategory =
  | 'CAREER'
  | 'JOB'
  | 'BUSINESS'
  | 'MONEY'
  | 'RELATIONSHIP'
  | 'MARRIAGE'
  | 'FAMILY'
  | 'EDUCATION'
  | 'HEALTH'
  | 'SPIRITUALITY'
  | 'RELOCATION'
  | 'TRAVEL'
  | 'TIMING'
  | 'DECISION'
  | 'PERSONALITY'
  | 'LIFE_PATTERN'
  | 'PAST_EVENT'
  | 'FUTURE_PERIOD'
  | 'COMPATIBILITY'
  | 'DAILY_GUIDANCE'
  | 'MUHURTA'
  | 'PANCHANGA'
  | 'NUMEROLOGY'
  | 'PALMISTRY'
  | 'GENERAL_ASTROLOGY'
  | 'REPORT'
  | 'RESEARCH'
  | 'OTHER';

export type TimeHorizon =
  | 'IMMEDIATE_TODAY'
  | 'THIS_WEEK'
  | 'NEXT_MONTH'
  | 'NEXT_3_MONTHS'
  | 'NEXT_6_MONTHS'
  | 'NEXT_YEAR'
  | 'NEXT_5_YEARS'
  | 'HISTORICAL_PAST'
  | 'LIFETIME';

export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type EmotionalTone = 'OBJECTIVE' | 'ANXIOUS' | 'HOPEFUL' | 'CONFUSED' | 'DECISIVE' | 'SKEPTICAL';
export type ReadingDepth = 'BEGINNER' | 'STANDARD' | 'EXPERT';
export type ConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type ConvergenceStatus =
  | 'STRONG_CONVERGENCE'
  | 'MODERATE_CONVERGENCE'
  | 'MIXED'
  | 'CONTRADICTORY'
  | 'INSUFFICIENT';

export interface EvidenceSignal {
  id: string;
  system: 'PARASHARI' | 'JAIMINI' | 'KP' | 'NUMEROLOGY' | 'PALMISTRY' | 'PANCHANGA' | 'TRANSIT' | 'USER_CONFIRMED_CONTEXT';
  factor: string;
  evidence: string;
  direction: 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL' | 'TRANSITIONAL' | 'CHALLENGING';
  strength: number; // 0.0 - 1.0
  relevance: number; // 0.0 - 1.0
  confidence: ConfidenceLevel;
  source: string;
  epistemicLevel: EpistemicLevel;
}

export interface ContradictionDetail {
  topic: string;
  primarySystem: string;
  primarySignal: string;
  opposingSystem: string;
  opposingSignal: string;
  reasonForDivergence: string;
  reconciliationSummary: string;
}

export interface UserCareerContext {
  currentRole?: string;
  industry?: string;
  experienceYears?: number;
  activeGoals?: string[];
  knownConstraints?: string[];
  userConfirmed: boolean;
  source: string;
  updatedAt: string;
}

export interface UserRelationshipContext {
  status?: string;
  partnerName?: string;
  confirmedMilestones?: string[];
  userConfirmed: boolean;
  source: string;
  updatedAt: string;
}

export interface UserEducationContext {
  currentStage?: string;
  targetDegreeOrField?: string;
  userConfirmed: boolean;
  source: string;
  updatedAt: string;
}

export interface UserLocationContext {
  currentCity?: string;
  currentCountry?: string;
  targetRelocationCities?: string[];
  userConfirmed: boolean;
  source: string;
  updatedAt: string;
}

export interface UserDecisionContext {
  activeDecisionId?: string;
  question?: string;
  optionA?: { name: string; description: string };
  optionB?: { name: string; description: string };
  deadline?: string;
  priorities?: string[];
  userConfirmed: boolean;
  source: string;
  updatedAt: string;
}

export interface UserStructuredContext {
  userId: string;
  career: UserCareerContext;
  relationship: UserRelationshipContext;
  education: UserEducationContext;
  location: UserLocationContext;
  decisionContext: UserDecisionContext;
  lastUpdated: string;
}

export interface UserMemoryItem {
  memoryId: string;
  userId: string;
  type:
    | 'EXPLICIT_FACT'
    | 'USER_PREFERENCE'
    | 'USER_GOAL'
    | 'USER_EVENT'
    | 'USER_DECISION'
    | 'USER_OUTCOME'
    | 'READING_HISTORY'
    | 'PREDICTION_HISTORY';
  content: string;
  source: 'USER_EXPLICIT' | 'AI_PROPOSED' | 'READING_INTERACTION';
  createdAt: string;
  confirmed: boolean;
  confidence: number;
  expiry?: string;
}

export interface DiscoveredLifePattern {
  patternId: string;
  userId: string;
  theme: string;
  description: string;
  supportingEventsCount: number;
  eventDates: string[];
  astrologicalCorrelates: {
    dashaLords: string[];
    transitingGrahas: string[];
    vargasInvolved: string[];
    rulesReferenced: string[];
  };
  observationType: 'PATTERN_OBSERVED';
  confidence: ConfidenceLevel;
}

export interface WhyThisReadingPayload {
  primaryFactors: string[];
  supportingFactors: string[];
  relevantRules: string[];
  dashaFactors: string;
  transitFactors: string;
  relevantVarga: string;
  contradictions: ContradictionDetail[];
  evidenceSources: string[];
  timingBasis: string;
  confidence: ConfidenceLevel;
  limitations: string;
}

export interface StructuredIntelligenceResponse {
  answerId: string;
  userId: string;
  timestamp: string;
  intent: {
    primaryCategory: IntentCategory;
    secondaryCategories: IntentCategory[];
    timeHorizon: TimeHorizon;
    urgency: UrgencyLevel;
    emotionalTone: EmotionalTone;
    requestedDepth: ReadingDepth;
    userObjective: string;
  };
  directAnswer: string;
  whyThisReading: WhyThisReadingPayload;
  evidenceSignals: EvidenceSignal[];
  convergenceStatus: ConvergenceStatus;
  userContextApplied: string[];
  observedPatterns: string[];
  practicalNextSteps: string[];
  traditionalRemedies: string[];
  clarificationQuestions?: string[];
  confidence: ConfidenceLevel;
  uncertaintyNotes: string[];
  passportFingerprint?: string;
  // DeepAstro 3.1 Additions
  reasoningPlan?: ReasoningPlan;
  answerabilityStatus?: AnswerabilityStatus;
  contextGraph?: ContextGraphPayload;
  longitudinalAnalysis?: LongitudinalDomainAnalysis;
  uncertaintyBreakdown?: UncertaintyBreakdown;
  whatChanged?: WhatChangedAnalysis;
  // DeepAstro 4.0 Additions
  internalReasoningTrace?: any;
  skepticAuditSummary?: any;
  calibratedConfidenceScore?: number;
}

export interface IntelligenceAuditTrace {
  requestId: string;
  userId: string;
  profileVersion?: number;
  calculationFingerprint?: string;
  intent: IntentCategory;
  enginesUsed: string[];
  evidenceIds: string[];
  ruleIds: string[];
  ragSourceIds: string[];
  modelUsed: string;
  latencyMs: number;
  confidence: ConfidenceLevel;
  auditStatus: 'PASSED' | 'FLAGGED' | 'REJECTED';
  createdAt: string;
}

// ================================================================
// DEEPASTRO 3.1 EXTENDED CONTRACTS
// ================================================================

export type AnswerabilityStatus =
  | 'ANSWERABLE'
  | 'PARTIALLY_ANSWERABLE'
  | 'NEEDS_CLARIFICATION'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CONTRADICTORY'
  | 'UNAVAILABLE';

export type PatternObservationStrength =
  | 'WEAK_PATTERN'
  | 'EMERGING_PATTERN'
  | 'REPEATED_PATTERN'
  | 'STRONG_OBSERVED_PATTERN';

export type EvidenceQualityLevel =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SUPPORTING'
  | 'CONTEXTUAL'
  | 'SPECULATIVE';

export interface ReasoningPlan {
  intent: IntentCategory;
  timeHorizon: TimeHorizon;
  lifeDomain: string;
  requiredFacts: string[];
  requiredEngines: string[];
  requiredSources: string[];
  requiredHistory: boolean;
  requiredWorldResearch: boolean;
  possibleContradictions: string[];
  confidenceRequirements: ConfidenceLevel;
}

export type ContextNodeType =
  | 'USER'
  | 'PROFILE'
  | 'CALCULATION'
  | 'DASHA'
  | 'TRANSIT'
  | 'VARGA'
  | 'RULE'
  | 'EVIDENCE'
  | 'LIFE_EVENT'
  | 'GOAL'
  | 'DECISION'
  | 'PREDICTION'
  | 'OUTCOME'
  | 'WORLD_FACT'
  | 'QUESTION'
  | 'PREFERENCE';

export type ContextEdgeType =
  | 'RELEVANT_TO'
  | 'OCCURRED_DURING'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'CORRELATES_WITH'
  | 'PRECEDES'
  | 'FOLLOWS'
  | 'ACTIVATES'
  | 'CONFIRMS'
  | 'WEAKENS'
  | 'RELATED_TO';

export interface ContextGraphNode {
  id: string;
  type: ContextNodeType;
  label: string;
  data: Record<string, any>;
  timestamp?: string;
  userConfirmed?: boolean;
}

export interface ContextGraphEdge {
  id: string;
  source: string;
  target: string;
  type: ContextEdgeType;
  weight: number; // 0.0 - 1.0
  notes?: string;
}

export interface ContextGraphPayload {
  nodes: ContextGraphNode[];
  edges: ContextGraphEdge[];
  invariants: string[];
}

export interface LongitudinalMilestone {
  year: number;
  date?: string;
  eventTitle: string;
  dashaCycle: string;
  transitSummary: string;
  vargaActivation?: string;
  userOutcome?: string;
}

export interface LongitudinalDomainAnalysis {
  domain: string;
  pastMilestones: LongitudinalMilestone[];
  currentConditions: {
    activeDasha: string;
    keyTransits: string[];
    dominantVarga: string;
  };
  futureWindows: Array<{
    window: string;
    planetaryDrivers: string[];
    supportLevel: 'HIGH_SUPPORT' | 'MIXED_SUPPORT' | 'CAUTION_WINDOW' | 'NEUTRAL';
  }>;
  repeatedThemes: string[];
  timingSimilarities: string[];
  differences: string[];
  uncertainties: string[];
  status: 'PATTERN_OBSERVED';
}

export interface HistoricalMatchResult {
  matchedYear: number;
  historicalEventTitle: string;
  historicalDasha: string;
  historicalTransits: string;
  currentDasha: string;
  currentTransits: string;
  similarities: string[];
  differences: string[];
  newFactors: string[];
  astrologicalResonanceScore: number; // 0.0 - 1.0
  summary: string;
}

export interface UncertaintyBreakdown {
  compositeLevel: ConfidenceLevel;
  birthTimeSensitivity: 'STABLE' | 'MODERATE_SENSITIVITY' | 'HIGH_SENSITIVITY';
  boundaryProximityAlert: boolean;
  contradictionTension: 'NONE' | 'MODERATE' | 'SIGNIFICANT';
  contextSufficiency: 'SUFFICIENT' | 'PARTIAL' | 'DEFICIENT';
  historicalSampleSize: number;
  worldDataFreshness?: 'FRESH' | 'STALE' | 'NOT_APPLICABLE';
  reasons: string[];
}

export interface UserGoalItem {
  goalId: string;
  userId: string;
  version: number;
  domain: 'CAREER' | 'RELATIONSHIP' | 'EDUCATION' | 'BUSINESS' | 'RELOCATION' | 'SPIRITUAL' | 'PERSONAL';
  title: string;
  description: string;
  targetDate?: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'EVOLVED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  userConfirmed: boolean;
  history: Array<{
    version: number;
    title: string;
    description: string;
    status: string;
    changedAt: string;
    reason?: string;
  }>;
}

export interface WhatChangedAnalysis {
  lastReadingDate: string;
  currentReadingDate: string;
  newTransits: string[];
  newDashaPhase?: string;
  newGoals: string[];
  newConfirmedEvents: string[];
  newOutcomeFeedback: string[];
  synthesis: string;
}
