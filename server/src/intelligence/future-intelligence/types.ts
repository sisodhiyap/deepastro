/**
 * types.ts
 * Type definitions for DeepAstro Future Intelligence Engine (FUTURE_INTELLIGENCE_V1).
 * Strictly mirrors CanonicalPredictionContext and machine-readable Evidence Graph contracts.
 */

import { PlanetName, PlanetData } from '../../astrology/PlanetEngine.js';
import { BhavaData } from '../../astrology/HouseEngine.js';
import { NakshatraInfo } from '../../astrology/NakshatraEngine.js';
import { CompleteVargaSet, VargaPosition } from '../../astrology/VargaEngine.js';
import { DashaPeriod, PratyantardashaPeriod } from '../../astrology/DashaEngine.js';
import { YogaResult } from '../../astrology/YogaEngine.js';
import { DoshaReport } from '../../astrology/DoshaEngine.js';
import { NumerologyReport } from '../../astrology/NumerologyEngine.js';
import { KPAnalysis } from '../../astrology/KPEngine.js';
import { PlanetShadbala } from '../../astrology/ShadbalaEngine.js';
import { AshtakavargaResult } from '../../astrology/AshtakavargaEngine.js';
import { JaiminiAnalysis } from '../../astrology/JaiminiEngine.js';

export type SignalStrengthLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
export type ConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type EvidenceDirection = 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL';

export type PredictionSignalCategory =
  | 'CAREER_EXPANSION'
  | 'FINANCIAL_FOCUS'
  | 'RELATIONSHIP_ACTIVATION'
  | 'EDUCATION_PERIOD'
  | 'HEALTH_ROUTINE_FOCUS'
  | 'TRAVEL_FOREIGN_CONNECTION'
  | 'SPIRITUAL_DEVELOPMENT'
  | 'PROPERTY_HOME_FOCUS'
  | 'CREATIVE_PERIOD'
  | 'NETWORK_EXPANSION'
  | 'RESPONSIBILITY_PERIOD'
  | 'TRANSFORMATION_PERIOD';

export type EvidenceSource =
  | 'D1'
  | 'D9'
  | 'D10'
  | 'VARGA'
  | 'DASHA'
  | 'TRANSIT'
  | 'KP'
  | 'YOGA'
  | 'DOSHA'
  | 'NUMEROLOGY'
  | 'PLANET_STRENGTH'
  | 'HOUSE'
  | 'ASPECT'
  | 'NAKSHATRA'
  | 'SHADBALA'
  | 'ASHTAKAVARGA'
  | 'JAIMINI'
  | 'REMEDIES'
  | 'NATAL'
  | 'STRENGTH';

export interface PredictionEvidence {
  source: EvidenceSource;
  engineVersion?: string;
  rule: string;
  entity?: string;
  value: string;
  weight: number;
  direction: EvidenceDirection;
  startDate?: string;
  endDate?: string;
  peakDate?: string;
}

export interface EngineLineageItem {
  engineId: string;
  engineVersion: string;
  inputHash: string;
  outputHash: string;
  consumed: boolean;
  relevance: string;
}

export interface PredictionDataLineage {
  chartId: string;
  userId: string;
  calculationFingerprint: string;
  calculationVersion: string;
  predictionVersion: string;
  engines: EngineLineageItem[];
  generatedAt: string;
}

export type EngineCoverageStatus = 'USED' | 'NOT_AVAILABLE' | 'CALCULATED_BUT_NOT_PREDICTION_ENABLED' | 'OPTIONAL';

export interface EngineCoverageReport {
  D1: EngineCoverageStatus;
  D9: EngineCoverageStatus;
  D10: EngineCoverageStatus;
  DASHA: EngineCoverageStatus;
  TRANSIT: EngineCoverageStatus;
  TRUE_NODE: EngineCoverageStatus;
  NAKSHATRA: EngineCoverageStatus;
  YOGA: EngineCoverageStatus;
  DOSHA: EngineCoverageStatus;
  PLANET_STRENGTH: EngineCoverageStatus;
  HOUSE: EngineCoverageStatus;
  ASPECT: EngineCoverageStatus;
  NUMEROLOGY: EngineCoverageStatus;
  KP: EngineCoverageStatus;
  VARGAS: EngineCoverageStatus;
  SHADBALA: EngineCoverageStatus;
  ASHTAKAVARGA: EngineCoverageStatus;
  JAIMINI: EngineCoverageStatus;
  REMEDIES: EngineCoverageStatus;
  TAROT: EngineCoverageStatus;
  PALMISTRY: EngineCoverageStatus;
}

export interface DeepAstroEngineRegistry {
  engineId: string;
  engineName: string;
  version: string;
  inputSource: string;
  outputSchema: string;
  calculationType: string;
  predictionRelevant: boolean;
  futureIntelligenceConsumer?: string;
}

export interface CanonicalPredictionContext {
  userId: string;
  chartId: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  utcOffset?: number;
  ayanamsha: string;
  calculationVersion: string;
  calculationFingerprint: string;

  // Vargas D1 - D60
  d1: PlanetData[];
  d9: VargaPosition[];
  d10: VargaPosition[];
  d12: VargaPosition[];
  d16: VargaPosition[];
  d20: VargaPosition[];
  d24: VargaPosition[];
  d27: VargaPosition[];
  d30: VargaPosition[];
  d40?: VargaPosition[];
  d45?: VargaPosition[];
  d60: VargaPosition[];
  allVargas?: CompleteVargaSet;

  planetaryPositions: PlanetData[];
  houses: BhavaData[];
  houseLords?: Record<number, string>;
  planetaryDegrees?: Record<string, number>;
  planetarySigns?: Record<string, string>;
  planetaryRetrograde?: Record<string, boolean>;
  planetaryCombustion?: Record<string, boolean>;
  planetaryDignity?: Record<string, string>;
  nakshatras: Record<string, NakshatraInfo>;
  padas: Record<string, number>;
  ascendant: {
    degrees: number;
    signIndex: number;
    signName: string;
    nakshatra: NakshatraInfo;
  };
  trueNode: {
    rahuLon: number;
    ketuLon: number;
    isRetrograde: boolean;
    speed: number;
    nodeModel: 'TRUE_NODE';
  };

  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha: PratyantardashaPeriod;

  numerologyProfile: NumerologyReport;
  yogas: YogaResult[];
  doshas: DoshaReport;
  planetaryStrength: Record<string, { dignity: string; isRetrograde: boolean; isCombust: boolean; shadbalaScore?: number }>;
  aspects: Record<string, number[]>;
  drishti?: Record<string, number[]>;

  // DeepAstro Multi-Engine Lineage Inputs
  kpAnalysis?: KPAnalysis;
  shadbala?: Record<string, PlanetShadbala>;
  ashtakavarga?: AshtakavargaResult;
  jaimini?: JaiminiAnalysis;
  dataLineage?: PredictionDataLineage;
  engineCoverage?: EngineCoverageReport;
}

export interface TransitRecord {
  transitPlanet: PlanetName;
  transitLongitude: number;
  transitSign: string;
  transitSignIndex: number;
  transitHouse: number; // House relative to natal Ascendant
  transitHouseFromMoon: number;
  natalTarget?: string;
  aspect: string;
  isRetrograde: boolean;
  startDate: string;
  peakDate: string;
  endDate: string;
  strength: SignalStrengthLevel;
}

export interface DashaTransitIntersectionSignal {
  category: PredictionSignalCategory;
  mahadashaLord: PlanetName;
  antardashaLord: PlanetName;
  pratyantardashaLord?: PlanetName;
  majorTransitPlanet: PlanetName;
  natalHouse: number;
  natalPlanet?: string;
  score: number;
  strength: SignalStrengthLevel;
  direction: EvidenceDirection;
  rationale: string;
  evidence: PredictionEvidence[];
}

export interface EventWindow {
  id: string;
  startDate: string; // ISO date YYYY-MM-DD
  peakDate: string;
  endDate: string;
  category: PredictionSignalCategory;
  theme: string;
  signalStrength: SignalStrengthLevel;
  convergenceFactor: number; // e.g. 0-100
  evidence: PredictionEvidence[];
}

export interface MonthForecast {
  month: number; // 1-12
  monthName: string; // 'January' ... 'December'
  year: number;
  dasha: {
    mahadasha: PlanetName;
    antardasha: PlanetName;
    pratyantardasha?: PlanetName;
  };
  majorTransits: Array<{
    planet: PlanetName;
    sign: string;
    houseFromLagna: number;
    isRetrograde: boolean;
  }>;
  activeHouses: number[];
  importantPlanets: PlanetName[];
  keyThemes: string[];
  supportiveWindow: string;
  cautionWindow: string;
  evidence: PredictionEvidence[];
}

export interface YearForecast {
  year: number;
  overallTheme: string;
  signalStrength: SignalStrengthLevel;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  activeDasha: {
    mahadasha: PlanetName;
    antardasha: PlanetName;
    pratyantardasha?: PlanetName;
  };
  majorTransits: Array<{
    planet: PlanetName;
    sign: string;
    houseFromLagna: number;
    isRetrograde: boolean;
  }>;
  keyPlanets: PlanetName[];
  career: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  money: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  relationships: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  health: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  family: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  education: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  travel: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  spirituality: {
    headline: string;
    description: string;
    signalStrength: SignalStrengthLevel;
    evidence: PredictionEvidence[];
  };
  importantWindows: EventWindow[];
  cautionWindows: string[];
  supportivePeriods: string[];
  d9Signals: string[];
  d10Signals: string[];
  numerologySignals: {
    personalYear: number;
    theme: string;
    harmonyWithVedic: boolean;
  };
  evidence: PredictionEvidence[];
  contradictorySignals: string[];
  months?: MonthForecast[];
}

export interface FutureIntelligenceResult {
  forecastId: string;
  chartId: string;
  calculationFingerprint: string;
  predictionVersion: string; // 'FUTURE_INTELLIGENCE_V1'
  forecastRange: string;     // '1_YEAR' | '3_YEARS' | '5_YEARS' | '10_YEARS' | '20_YEARS'
  startDate: string;
  endDate: string;
  chartSummary: {
    name: string;
    birthDate: string;
    birthPlace: string;
    ascendantSign: string;
    moonSign: string;
    sunSign: string;
    calculationDate: string;
  };
  currentPeriod: {
    mahadasha: PlanetName;
    antardasha: PlanetName;
    pratyantardasha: PlanetName;
    startDate: string;
    endDate: string;
  };
  nextMajorTransition: {
    transitionDate: string;
    fromDasha: string;
    toDasha: string;
    significance: string;
  };
  nextSignificantWindow: EventWindow;
  years: YearForecast[];
  importantWindows: EventWindow[];
  evidence: PredictionEvidence[];
  engineCoverage: EngineCoverageReport;
  dataLineage: PredictionDataLineage;
  methodologyDisclosure: string;
  ethicalNotice: string;
}
