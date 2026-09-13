/**
 * DeepAstro 6.0.2 - Canonical ChartSession Data Contract
 * Single Source of Truth for all personal astrology, personalization,
 * multi-system cross-checks, and AI interpretation.
 */

export interface ResolvedBirthLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
  timezoneName?: string;
  rawInput: string;
  isConfirmed: boolean;
}

export interface TimeNormalization {
  localTimeStr: string;
  utcIso: string;
  julianDay: number;
  siderealTimeHours: number;
  ayanamsaName: string;
  ayanamsaValue: number;
  calculationVersion: string;
}

export interface PlanetPosition {
  name: string;
  symbol?: string;
  longitude: number;
  latitude?: number;
  speed: number;
  sign: string;
  signNumber: number; // 1 to 12
  signLord: string;
  degreeInSign: number; // 0 to 30
  house: number; // 1 to 12
  nakshatra: string;
  nakshatraLord: string;
  pada: number; // 1 to 4
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Great Friend' | 'Friend' | 'Neutral' | 'Enemy' | 'Great Enemy' | 'Debilitated';
  aspectsOnHouses: number[];
  aspectsOnPlanets: string[];
}

export interface HouseCusp {
  houseNumber: number; // 1 to 12
  sign: string;
  signNumber: number;
  signLord: string;
  degree: number;
  occupants: string[];
  influencingPlanets: string[];
  nakshatra?: string;
  significators?: string[];
  coreSignificance: string;
  interpretation: string;
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  level: 'MAHA' | 'ANTAR' | 'PRATYANTAR';
  isCurrent: boolean;
  remainingDays?: number;
  subPeriods?: DashaPeriod[];
}

export interface VerifiedYoga {
  name: string;
  category: 'Raja' | 'Dhana' | 'Mahapurusha' | 'Chandra' | 'Surya' | 'Mishra' | 'Arishta';
  conditionMet: boolean;
  mathematicalProof: string;
  involvedPlanets: string[];
  involvedHouses: number[];
  strengthScore: number; // 0 to 100
  traditionalInterpretation: string;
  manifestationWindow?: string;
}

export interface EvidenceNode {
  id: string;
  category: 'PLANET' | 'HOUSE' | 'DASHA' | 'TRANSIT' | 'YOGA' | 'KP' | 'VARGA';
  label: string;
  detail: string;
  strength: number; // 0 to 1
  source: string;
}

export interface DistinctiveFeature {
  title: string;
  description: string;
  astrologicalBasis: string;
  uniquenessDescriptor: string; // e.g. "Distinctive within the classical interpretation framework"
  evidenceNodes: string[];
}

export interface StoryChapter {
  chapterNumber: number;
  title: string;
  subtitle: string;
  narrative: string;
  whyThisWasSaid: {
    planetaryOccupants?: string[];
    houseLords?: string[];
    vargaConfirmation?: string;
    currentDashaActivation?: string;
  };
  keyTakeaway: string;
  evidenceTags: string[];
}

export interface PersonalizedThemeSignal {
  rank: number;
  category: 'Career' | 'Wealth' | 'Relationships' | 'Intellect' | 'Spirituality' | 'Leadership' | 'Transformation' | 'Family';
  headline: string;
  summary: string;
  strength: 'DOMINANT' | 'STRONG' | 'EMERGING';
  supportingEvidence: string[];
}

export interface MultiSystemConsensus {
  system: 'Vedic' | 'KP' | 'Western' | 'Numerology' | 'Palmistry' | 'Tarot';
  signature: string;
  perspective: string;
  alignment: 'AGREE' | 'DIFFER' | 'UNIQUE_TO_SYSTEM';
}

export interface ChartValidationResult {
  passed: boolean;
  checks: {
    positionChecks: boolean;
    houseChecks: boolean;
    nakshatraChecks: boolean;
    dashaChecks: boolean;
    timezoneChecks: boolean;
  };
  diagnostics: string[];
}

export interface ChartSession {
  identity: {
    id: string;
    userName: string;
    gender?: string;
  };
  birthInput: {
    date: string;
    time: string;
    birthPlace: string;
  };
  resolvedLocation: ResolvedBirthLocation;
  timeNormalization: TimeNormalization;
  calculationMetadata: {
    ayanamsa: string;
    houseSystem: string;
    calculationVersion: string;
    engineVersion: string;
  };
  birthDataFingerprint: string;
  calculatedAt: string;
  validation: ChartValidationResult;

  vedic: {
    ascendantSign: string;
    ascendantDegree: number;
    ascendantLord: string;
    ascendantNakshatra: string;
    ascendantPada: number;
    moonSign: string;
    moonNakshatra: string;
    moonPada: number;
    moonDegree?: number;
    sunSign: string;
    planets: PlanetPosition[];
    houses: HouseCusp[];
  };

  dasha: {
    currentMahaDasha: string;
    currentAntarDasha: string;
    currentPratyantarDasha: string;
    currentCycleRemainingYears: number;
    timeline: DashaPeriod[];
  };

  yogas: VerifiedYoga[];

  vargas: {
    d1Summary: string;
    d9NavamshaSummary: string;
    d10DashamshaSummary: string;
    reinforcedPlanets: string[];
  };

  kp: {
    ascendantSubLord: string;
    moonSubLord: string;
    cuspalSubLords: Array<{ cusp: number; signLord: string; starLord: string; subLord: string }>;
    primarySignificators: Record<string, number[]>; // planet -> house numbers
  };

  western: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    majorAspects: Array<{ p1: string; p2: string; type: string; orbDeg: number }>;
  };

  evidenceGraph: EvidenceNode[];

  personalization: {
    chartAtAGlance: PersonalizedThemeSignal[];
    whatMakesYouUnique: DistinctiveFeature[];
    cosmicStory: StoryChapter[];
  };

  currentCosmicWeather: {
    transitMoonSign: string;
    transitMoonNakshatra: string;
    activeNatalTrigger: string;
    todayFocus: string;
    thisWeekTheme: string;
    thisMonthTrajectory: string;
  };

  multiSystemComparison: {
    syntheses: MultiSystemConsensus[];
    tensionOrConflictExplanation?: string;
  };
}
