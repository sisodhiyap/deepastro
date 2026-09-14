/**
 * CosmicFutureTypes.ts
 * Type contracts for DeepAstro Cosmic Future Intelligence Engine (CFIE v1.0.0).
 */

export type FutureRevealLevel =
  | 'LEVEL_0' // Summary only
  | 'LEVEL_1' // General future themes
  | 'LEVEL_2' // Year-wise forecast
  | 'LEVEL_3' // Month-wise forecast
  | 'LEVEL_4' // Detailed life-domain forecast
  | 'LEVEL_5' // Sensitive timing analysis
  | 'LEVEL_6'; // Longevity / health-span interpretation

export type ForecastHorizon = '3_YEARS' | '5_YEARS' | '10_YEARS';

export type LifeDomain =
  | 'CAREER'
  | 'BUSINESS'
  | 'FINANCE'
  | 'RELATIONSHIP'
  | 'MARRIAGE'
  | 'FAMILY'
  | 'EDUCATION'
  | 'HEALTHSPAN'
  | 'SPIRITUALITY'
  | 'TRAVEL'
  | 'RELOCATION'
  | 'CREATIVITY'
  | 'SOCIAL_LIFE'
  | 'PERSONAL_GROWTH'
  | 'LIFE_PURPOSE';

export type ScenarioType = 'BASELINE' | 'OPPORTUNITY' | 'CHALLENGE';

export type ConfidenceRating = 'LOW' | 'MODERATE' | 'HIGH';

export interface EventWindow {
  id: string;
  category: string;
  title: string;
  windowStart: string; // e.g. "March 2027"
  windowEnd: string;   // e.g. "July 2027"
  strength: 'MILD' | 'MODERATE' | 'STRONG' | 'EXCEPTIONAL';
  confidence: ConfidenceRating;
  supportingSystems: string[];
  contradictions?: string[];
  guidance: string;
}

export interface YearForecast {
  year: number;
  overallTheme: string;
  strongestDomain: LifeDomain;
  careerOutlook: string;
  businessOutlook: string;
  financeOutlook: string;
  relationshipOutlook: string;
  healthSpanOutlook: string;
  spiritualityOutlook: string;
  personalGrowthOutlook: string;
  opportunities: string[];
  challenges: string[];
  strongWindows: string;
  cautionWindows: string;
  confidence: ConfidenceRating;
  activeDasha: string;
  keyTransits: string[];
  numerologyPersonalYear: number;
  convergenceScore: number; // 0 to 1
  evidenceSummary: string;
}

export interface MonthForecast {
  year: number;
  month: number; // 1-12
  monthName: string; // "January", "February", etc.
  theme: string;
  careerSignal: 'growth' | 'stable' | 'caution' | 'neutral';
  relationshipSignal: 'growth' | 'stable' | 'caution' | 'neutral';
  financeSignal: 'growth' | 'stable' | 'caution' | 'neutral';
  spiritualitySignal: 'growth' | 'stable' | 'caution' | 'neutral';
  keyWindow: string; // e.g. "12–28 March"
  whyBasis: string;
  confidence: ConfidenceRating;
}

export interface DomainForecast {
  domain: LifeDomain;
  currentState: string;
  upcomingWindows: string;
  opportunities: string[];
  challenges: string[];
  timing: string;
  confidence: ConfidenceRating;
  supportingSystems: string[];
  uncertaintyFactors: string[];
}

export interface LongevityHealthspanInterpretation {
  vitalityTheme: string;
  resilienceIndicators: string[];
  selfCareWindows: Array<{
    period: string;
    focusArea: string;
    reasoning: string;
  }>;
  lifestyleRecommendations: string[];
  epistemicDisclaimer: string;
}

export interface FutureRemedy {
  type: 'MEDITATION' | 'MANTRA' | 'SERVICE' | 'CHARITY' | 'DISCIPLINE' | 'GEMSTONE_CAUTION';
  title: string;
  description: string;
  frequency: string;
  traditionalSource: string;
  safetyNotice: string;
}

export interface CosmicFutureForecastSchema {
  id: string;
  userId: string;
  version: string;
  generatedAt: string;
  calculationSnapshotId: string;
  horizon: ForecastHorizon;
  revealLevel: FutureRevealLevel;
  currentLifePhase: string;
  overall10YearTheme: string;
  nextMajorWindow: {
    period: string;
    description: string;
    domain: LifeDomain;
  };
  yearForecasts: YearForecast[];
  monthForecasts: MonthForecast[];
  domainForecasts: Record<LifeDomain, DomainForecast>;
  scenarios: {
    baseline: string;
    opportunity: string;
    challenge: string;
  };
  eventWindows: EventWindow[];
  longevityHealthspan?: LongevityHealthspanInterpretation;
  remedies: FutureRemedy[];
  multiSystemConvergence: {
    overallConvergence: ConfidenceRating;
    astrologySupport: boolean;
    dashaSupport: boolean;
    transitSupport: boolean;
    kpSupport: boolean;
    jaiminiSupport: boolean;
    numerologySupport: boolean;
    karmaSupport: boolean;
    contradictions: string[];
  };
  evidenceGraph: {
    calculationSnapshotId: string;
    indicatorsCount: number;
    rulesApplied: string[];
    systemsFused: string[];
  };
  sources: string[];
  disclaimer: string;
}

export interface UserFutureConsent {
  userId: string;
  consentGranted: boolean;
  authorizedLevel: FutureRevealLevel;
  consentTimestamp: string;
  consentVersion: string;
}


export interface SystemConvergenceDetail {
  system: string;
  status: 'SUPPORTING' | 'NEUTRAL' | 'CONTRADICTING' | 'UNAVAILABLE';
  strength: number; // 0 to 100
  evidenceCount: number;
  ruleVersion: string;
}

export interface FutureWindowItem {
  id: string;
  title: string;
  timing: string;
  description: string;
  domain: string;
  confidence: ConfidenceRating;
  supportingSystems: string[];
}

export interface AwarenessPeriodItem {
  id: string;
  title: string;
  timing: string;
  description: string;
  theme: string;
  guidance: string;
}

export interface SoulJourneySummary {
  pastInfluence: string;
  presentLesson: string;
  futureEvolution: string;
  disclaimer: string;
}

export interface FutureMapData {
  calculationFingerprint: string;
  forecastFingerprint: string;
  verificationId: string;
  engineVersion: string;
  generatedAt: string;
  consentLevel: FutureRevealLevel;
  horizon: ForecastHorizon;
  currentLifePhase: string;
  nextMajorWindow: {
    title: string;
    timing: string;
    description: string;
    domain: string;
    confidence: ConfidenceRating;
  };
  confidence: number; // Dynamic percentage 0-100
  convergence: {
    systemsEvaluated: number;
    systemsConverging: number;
    overallConvergence: 'HIGH' | 'MODERATE' | 'LOW';
    systemDetails: SystemConvergenceDetail[];
  };
  timeline: YearForecast[];
  lifeAreas: Record<string, DomainForecast>;
  strongestWindows: FutureWindowItem[];
  awarenessPeriods: AwarenessPeriodItem[];
  soulJourney: SoulJourneySummary;
  evidence: string[];
  contradictions: string[];
  uncertainty: {
    factors: string[];
    alternativeScenarios: string[];
  };
  provenance: {
    verificationId: string;
    engineVersion: string;
    calculationFingerprint: string;
    forecastFingerprint: string;
    issuedAt: string;
  };
}
