export type PastLifeConfidenceLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type PastLifeArchetype =
  | 'SCHOLAR'
  | 'TEACHER'
  | 'SPIRITUAL_SEEKER'
  | 'MONASTIC'
  | 'HEALER'
  | 'ARTISAN'
  | 'TRADER'
  | 'ADMINISTRATOR'
  | 'LEADER'
  | 'WARRIOR_ARCHETYPE'
  | 'TRAVELER'
  | 'CARETAKER'
  | 'COMMUNITY_SERVANT'
  | 'PHILOSOPHER'
  | 'TEMPLE_SERVICE'
  | 'ARTIST'
  | 'CRAFTSPERSON'
  | 'DIPLOMAT'
  | 'EXPLORER'
  | 'HOUSEHOLDER'
  | 'GUIDE'
  | 'MIXED_ARCHETYPE';

export type PastLifeVisualTheme =
  | 'TEMPLE'
  | 'SCHOLAR'
  | 'MYSTIC'
  | 'TRAVELER'
  | 'WARRIOR'
  | 'HEALER'
  | 'ROYAL'
  | 'ARTISAN'
  | 'MONASTIC'
  | 'COSMIC'
  | 'NATURE'
  | 'WATER'
  | 'MOUNTAIN'
  | 'LIBRARY'
  | 'ANCIENT_CITY';

export interface PastLifeEvidenceScore {
  indicator: string;
  system: 'VEDIC_ASTROLOGY' | 'JAIMINI' | 'NUMEROLOGY' | 'KARMIC_SYMBOLISM' | 'VEDIC_CANON';
  weight: number;
  direction: string;
  supportingFactors: string[];
  contradictingFactors: string[];
  confidence: PastLifeConfidenceLevel;
}

export interface PastLifeSourceReference {
  sourceId: string;
  title: string;
  authorOrTradition: string;
  sectionOrChapter?: string;
  philosophicalTheme: string;
  translationMetadata?: string;
  provenance: string;
}

export interface PastLifeKarmicPattern {
  pattern: string;
  debt_or_blessing: 'DEBT' | 'BLESSING' | 'NEUTRAL_CYCLE';
  current_life_expression: string;
  resolution_path: string;
}

export interface PastLifeCurrentLifeConnection {
  area: 'career' | 'relationships' | 'learning' | 'spirituality' | 'life_purpose';
  symbolic_connection: string;
  actionable_guidance: string;
}

export interface PastLifeSpiritualGuidance {
  category: 'meditation' | 'charity' | 'reflection' | 'service' | 'ethical_action' | 'traditional_practice';
  guidance: string;
  traditional_context: string;
}

export interface PastLifeAstrologicalIndicator {
  indicator: string;
  placement: string;
  significance: string;
  dignityOrStrength?: string;
}

export interface PastLifeNumerologyIndicator {
  type: string;
  value: number;
  vibration_theme: string;
  karmic_lesson?: string;
}

export interface PastLifeContradiction {
  conflict: string;
  resolution: string;
  archetype_adjustment: string;
}

export interface PastLifeInsightSchema {
  id: string;
  user_id: string;
  generated_at: string;
  calculation_snapshot_id: string;
  interpretation_status: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  classification: 'PAST LIFE INSIGHT — TRADITIONAL / SPIRITUAL INTERPRETATION';
  epistemic_notice: string;

  confidence: {
    overall: PastLifeConfidenceLevel;
    astrology: PastLifeConfidenceLevel;
    numerology: PastLifeConfidenceLevel;
    textual_context: PastLifeConfidenceLevel;
    birth_time_reliability: 'HIGH' | 'MODERATE' | 'LOW' | 'UNRELIABLE';
    score_percent: number;
  };

  archetype: {
    primary: PastLifeArchetype;
    secondary?: PastLifeArchetype;
    supporting?: PastLifeArchetype;
    confidence: PastLifeConfidenceLevel;
    description: string;
  };

  setting: {
    description: string;
    environment: string;
    period: string;
    region: string;
    confidence: PastLifeConfidenceLevel;
  };

  role: {
    title: string;
    description: string;
    confidence: PastLifeConfidenceLevel;
  };

  user_profile_summary: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };

  themes: string[];
  experiences: string[];
  relationships: string[];
  unfinished_lessons: string[];
  karmic_patterns: PastLifeKarmicPattern[];
  current_life_connections: PastLifeCurrentLifeConnection[];
  spiritual_guidance: PastLifeSpiritualGuidance[];
  astrological_indicators: PastLifeAstrologicalIndicator[];
  numerology_indicators: PastLifeNumerologyIndicator[];
  vedic_references: PastLifeSourceReference[];
  purana_references: PastLifeSourceReference[];
  contradictions: PastLifeContradiction[];
  uncertainty_notes: string[];

  narrative: {
    title: string;
    summary: string;
    story: string;
    soul_message: string;
  };

  visual_direction: {
    theme: PastLifeVisualTheme;
    primary_motif: string;
    palette_accents: string[];
    artwork_prompt: string;
    atmosphere: string;
  };

  provenance: {
    engine_version: string;
    calculation_version: string;
    knowledge_version: string;
    rag_version: string;
    hash: string;
  };

  soulJourneyModules?: {
    karmicPatterns: {
      narrative: string;
      dominantTheme: { planet: string; sanskritName: string; keywords: string; explanation: string };
      karmicAxis: { axis: string; nodes: string; themes: string; balance: string };
      keyPatterns: Array<{
        id: string;
        theme: string;
        evidence: string;
        strength: 'Strong' | 'Moderate' | 'Mild';
        icon: string;
      }>;
      relatedPlanets: Array<{
        name: string;
        signification: string;
        house: number;
        sign: string;
        degree?: number;
      }>;
      influencedHouses: Array<{
        house: number;
        title: string;
        significance: string;
      }>;
      insightQuote: {
        quote: string;
        author: string;
      };
    };
    pastLifeInfluences: {
      archetype: string;
      setting: { environment: string; period: string; region: string; description: string };
      narrative: { title: string; summary: string; story: string; soul_message: string };
      currentLifeConnections: PastLifeCurrentLifeConnection[];
      astrologicalIndicators: PastLifeAstrologicalIndicator[];
      vedicReferences: PastLifeSourceReference[];
      puranaReferences: PastLifeSourceReference[];
    };
    soulLessons: {
      primaryLesson: { title: string; reason: string; indicators: string[] };
      secondaryLessons: Array<{ title: string; reason: string; indicators: string[] }>;
      supportingPlanets: Array<{ planet: string; role: string; placement: string }>;
      supportingHouses: number[];
      dashaContext: string;
      practicalReflection: string;
    };
    lifePurpose: {
      coreDirection: { title: string; explanation: string; indicators: string[] };
      careerAndContribution: { title: string; explanation: string; indicators: string[] };
      growthDirection: { title: string; explanation: string; indicators: string[] };
      currentDashaContext: string;
      transitContext: string;
      practicalReflection: string;
    };
  };

  version: string;
}

export interface PastLifeGenerationRequest {
  format?: 'insight_card' | 'soul_journey';
  language?: 'en' | 'hi' | 'hinglish';
  include_numerology?: boolean;
  include_vedic_sources?: boolean;
  include_purana_context?: boolean;
  overrides?: {
    fullName?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    latitude?: number;
    longitude?: number;
    timezone?: number;
    gender?: string;
    isApproximateTime?: boolean;
  };
}

export interface PastLifeUserFeedback {
  reading_id: string;
  user_id: string;
  sentiment: 'RESONATES' | 'PARTIALLY_RESONATES' | 'DOES_NOT_RESONATE' | 'NOT_SURE';
  comment?: string;
  created_at: string;
}
