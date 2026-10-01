/**
 * EngineRegistry.ts
 * DeepAstro Comprehensive Calculation Engine Inventory & Lineage Builder.
 * Maps every core Vedic astrology and intelligence engine into an immutable audit trail.
 */

import { createHash } from 'crypto';
import { DeepAstroEngineRegistry, EngineCoverageReport, PredictionDataLineage, EngineLineageItem } from './types.js';

export const DEEPASTRO_ENGINE_REGISTRY: DeepAstroEngineRegistry[] = [
  {
    engineId: 'D1_RASHI_ENGINE',
    engineName: 'Parashari D1 Rashi Kundli Planetary Coordinate Engine',
    version: '1.0.0-sidereal',
    inputSource: 'BirthProfile (Date, Time, Lat, Lon, Timezone)',
    outputSchema: 'PlanetData[] (Sun to Ketu with sidereal degrees, signs, nakshatras, dignities)',
    calculationType: 'ASTRONOMICAL_SIDEREAL_EPHEMERIS',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'ChartContextResolver -> D1 foundational anchor across all 8 life domains',
  },
  {
    engineId: 'TRUE_NODE_ENGINE',
    engineName: 'Meeus Astronomical True Lunar Node Engine',
    version: '1.0.0-meeus',
    inputSource: 'JulianDay ephemeris calculations',
    outputSchema: 'Rahu & Ketu 180° nodal axis, true retrograde motion, nodal speed',
    calculationType: 'ASTRONOMICAL_DETERMINISTIC',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'TransitEngine & DashaTransitIntersectionEngine -> Evolutionary nodal timing',
  },
  {
    engineId: 'NAKSHATRA_ENGINE',
    engineName: '27 Vedic Nakshatras & 108 Padas Calculation Engine',
    version: '1.0.0-nakshatra',
    inputSource: 'Planetary sidereal coordinates (13°20\' spans, 3°20\' navamsha padas)',
    outputSchema: 'Nakshatra name, Lord, Pada (1-4), deity, symbol, guna, tattva',
    calculationType: 'ASTRONOMICAL_STELLAR',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'Dasha initiation, Vimshottari progression, and KP stellar ruler resolution',
  },
  {
    engineId: 'BHAVA_HOUSE_ENGINE',
    engineName: '12 Classical Bhavas & Drishti Aspect Engine',
    version: '1.0.0-bhava',
    inputSource: 'Ascendant degrees & planetary houses',
    outputSchema: '12 House cusps, house lords, kendra/trikona/dusthana classifications, classical Vedic drishti',
    calculationType: 'ASTRONOMICAL_GEOCENTRIC',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'HouseActivationEngine -> 12 Bhavas and classical planetary drishti aspects',
  },
  {
    engineId: 'VARGA_SHODASHAVARGA_ENGINE',
    engineName: 'Complete Shodashavarga (D1 to D60) Divisional Engine',
    version: '1.0.0-bphs',
    inputSource: 'Planetary coordinates mapped to classical BPHS harmonic divisional algorithms',
    outputSchema: 'D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60 harmonic placements',
    calculationType: 'MATHEMATICAL_HARMONIC',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'VargaForecastEngine -> D9 relationships, D10 career, D2 wealth, D4 property, D24 education, D20 spirituality, D60 refinement',
  },
  {
    engineId: 'VIMSHOTTARI_DASHA_ENGINE',
    engineName: '120-Year Vimshottari Dasha Engine (Maha, Antar, Pratyantar)',
    version: '1.0.0-vimshottari',
    inputSource: 'Moon Nakshatra, elapsed degrees at birth, exact birth datetime',
    outputSchema: 'Chronological timeline of Mahadasha, Antardasha, and Pratyantardasha periods with exact start/end dates',
    calculationType: 'CHRONOLOGICAL_STELLAR',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'DashaForecastEngine & DashaTransitIntersectionEngine -> Primary temporal driver for future years and months',
  },
  {
    engineId: 'KP_STELLAR_ENGINE',
    engineName: 'Krishnamurti Paddhati (KP) 249 Sub-Division & Cuspal Significator Engine',
    version: '1.0.0-kp',
    inputSource: 'Sidereal longitudes, 12 Placidean/equal house cusps, Vimshottari proportional sub-divisions',
    outputSchema: 'Sign Lord, Star Lord, Sub-Lord for every planet & house cusp; stellar significators',
    calculationType: 'STELLAR_SUB_LORD',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'KPForecastEngine -> Cuspal sub-lord verification for 10th (career), 2nd/11th (wealth), 7th (marriage/alliances)',
  },
  {
    engineId: 'YOGA_ENGINE',
    engineName: 'Parashari Classical Raja & Auspicious Yoga Engine',
    version: '1.0.0-yoga',
    inputSource: 'Planetary house combinations, kendra/trikona rulerships, mutual reception, exaltation',
    outputSchema: 'Identified classical yogas (Gaja Kesari, Pancha Mahapurusha, Budhaditya, Dhana, Raja, Neechabhanga)',
    calculationType: 'RULE_BASED_CLASSICAL',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'YogaActivationEngine -> Evaluates whether natal yogas are dormant, transit-triggered, or Dasha-energized',
  },
  {
    engineId: 'DOSHA_ENGINE',
    engineName: 'Vedic Dosha & Affliction Analysis Engine',
    version: '1.0.0-dosha',
    inputSource: 'Mars positions (Manglik), Moon & Saturn positions (Sade Sati), Nodal positions (Kaal Sarp)',
    outputSchema: 'Manglik analysis, 3-phase Sade Sati status, Kaal Sarp formation, Pitra dosha indicators',
    calculationType: 'RULE_BASED_CLASSICAL',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'DoshaRemedyEngine -> Provides contextual mindfulness and non-fatalistic classical guidance',
  },
  {
    engineId: 'SHADBALA_ENGINE',
    engineName: '6-Fold BPHS Planetary Strength (Shadbala) Engine',
    version: '1.0.0-shadbala',
    inputSource: 'AstrologyFactSet (Sthana, Dig, Kala, Cheshta, Naisargika, Drik bala)',
    outputSchema: 'Virupas, Rupas, relative rank, isStrong status for Sun through Saturn',
    calculationType: 'MATHEMATICAL_MULTI_FACTOR',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'PlanetStrengthEngine -> Dynamically scales planetary signal weightings based on empirical strength',
  },
  {
    engineId: 'ASHTAKAVARGA_ENGINE',
    engineName: 'Parashari Ashtakavarga (BAV & SAV 337 Bindus) Engine',
    version: '1.0.0-ashtakavarga',
    inputSource: 'Planetary sign placements relative to 7 planets and Lagna',
    outputSchema: 'Bhinnashtakavarga (BAV) 12-sign arrays for 7 planets; Sarvashtakavarga (SAV) composite 337 bindus',
    calculationType: 'BINDU_MATRIX_TALLY',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'HouseActivationEngine -> Evaluates SAV transit house strength (>28 supportive, <25 requiring discipline)',
  },
  {
    engineId: 'JAIMINI_ENGINE',
    engineName: 'Jaimini Upadesha Sutras Chara Karaka & Arudha Lagna Engine',
    version: '1.0.0-jaimini',
    inputSource: 'Planetary degrees within signs (7-Karaka scheme: AK, AmK, BK, MK, PK, GK, DK)',
    outputSchema: 'Atmakaraka (soul purpose), Amatyakaraka (career authority), Darakaraka (partnerships), Arudha Lagna (AL), Upapada (UL)',
    calculationType: 'DEGREE_SORT_KARAKA',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'DashaTransitIntersectionEngine -> AmK confirms career milestones, DK confirms relational commitments',
  },
  {
    engineId: 'GOCHARA_TRANSIT_ENGINE',
    engineName: 'Sidereal Astronomical Gochara Transit Engine',
    version: '1.0.0-gochara',
    inputSource: 'VSOP87 planetary ephemeris, ELP-2000 lunar mechanics, Meeus True Node, Lahiri Ayanamsha',
    outputSchema: 'Future planetary coordinates, sign transits, house transits from Lagna and Moon, Vedic aspects',
    calculationType: 'ASTRONOMICAL_SIDEREAL_EPHEMERIS',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'TransitEngine -> Primary transit driver calculating Gochara placements for any future date',
  },
  {
    engineId: 'NUMEROLOGY_ENGINE',
    engineName: 'Chaldean & Pythagorean Vibrational Numerology Engine',
    version: '1.0.0-numerology',
    inputSource: 'Full name, birth date, target evaluation year and month',
    outputSchema: 'Life Path, Destiny, Soul Urge, Personal Year (1-9), Personal Month (1-9)',
    calculationType: 'MATHEMATICAL_HARMONIC_VIBRATION',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'NumerologyForecastEngine -> Secondary supportive cycle confirming or qualifying Vedic timing',
  },
  {
    engineId: 'REMEDY_ENGINE',
    engineName: 'Ethical Vedic Remedial & Upaya Recommendation Engine',
    version: '1.0.0-remedy',
    inputSource: 'Afflicted planets, weak house lords, active Dasha lords, active Sade Sati/Rahu-Ketu phases',
    outputSchema: 'Non-fatalistic behavioral remedies, mantras, seva/charity, gemstone guidelines',
    calculationType: 'VEDIC_TRADITIONAL_REMEDIAL',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'DoshaRemedyEngine -> Provides practical, constructive actions for supportive and challenging windows',
  },
  {
    engineId: 'AI_EVIDENCE_VALIDATOR',
    engineName: 'Strict Zero-Hallucination AI Evidence Validation Engine',
    version: '1.0.0-anti-hallucination',
    inputSource: 'Machine-readable PredictionEvidence[] graph and AI-generated narrative',
    outputSchema: 'Validation pass/fail, list of unsupported entities (planets, signs, dates, Dashas, Vargas)',
    calculationType: 'AUDIT_VERIFICATION',
    predictionRelevant: true,
    futureIntelligenceConsumer: 'PredictionNarrativeEngine -> Rejects any AI narrative referencing calculated facts not in evidence JSON',
  },
  {
    engineId: 'TAROT_ENGINE',
    engineName: 'DeepAstro Archetypal Reflection Tarot Engine',
    version: '1.0.0-tarot',
    inputSource: 'User-selected reflective spreads (Daily card, Celtic cross)',
    outputSchema: 'Archetypal card symbolism, psychological reflection, meditative questions',
    calculationType: 'ARCHETYPAL_REFLECTIVE',
    predictionRelevant: false, // Explicitly separate from deterministic Kundli calculations
    futureIntelligenceConsumer: 'Optional reflective layer only; NEVER overrides or influences deterministic Jyotish calculations',
  },
  {
    engineId: 'PALMISTRY_ENGINE',
    engineName: 'DeepAstro Computer Vision Palm Analysis Engine',
    version: '1.0.0-palm',
    inputSource: 'User-uploaded palm photograph',
    outputSchema: 'Major lines (Heart, Head, Life, Fate), mounts, texture analysis',
    calculationType: 'COMPUTER_VISION_HEURISTIC',
    predictionRelevant: false, // Optional supporting context when user explicitly uploads palm
    futureIntelligenceConsumer: 'Optional supporting context only; explicitly marked OPTIONAL_NOT_ANALYZED when no palm photo is uploaded',
  },
];

export class EngineRegistry {
  public static getAllEngines(): DeepAstroEngineRegistry[] {
    return DEEPASTRO_ENGINE_REGISTRY;
  }

  public static getEngine(engineId: string): DeepAstroEngineRegistry | undefined {
    return DEEPASTRO_ENGINE_REGISTRY.find((e) => e.engineId === engineId);
  }

  /**
   * Builds an immutable, cryptographically verifiable PredictionDataLineage object
   */
  public static buildLineage(params: {
    chartId: string;
    userId: string;
    calculationFingerprint: string;
    calculationVersion: string;
    predictionVersion: string;
    consumedEngines: Array<{
      engineId: string;
      engineVersion: string;
      inputData: any;
      outputData: any;
      relevance: string;
    }>;
  }): PredictionDataLineage {
    const engines: EngineLineageItem[] = params.consumedEngines.map((ce) => {
      const inputStr = typeof ce.inputData === 'string' ? ce.inputData : JSON.stringify(ce.inputData || {});
      const outputStr = typeof ce.outputData === 'string' ? ce.outputData : JSON.stringify(ce.outputData || {});
      
      const inputHash = createHash('sha256').update(inputStr).digest('hex').substring(0, 16);
      const outputHash = createHash('sha256').update(outputStr).digest('hex').substring(0, 16);

      return {
        engineId: ce.engineId,
        engineVersion: ce.engineVersion,
        inputHash,
        outputHash,
        consumed: true,
        relevance: ce.relevance,
      };
    });

    return {
      chartId: params.chartId,
      userId: params.userId,
      calculationFingerprint: params.calculationFingerprint,
      calculationVersion: params.calculationVersion,
      predictionVersion: params.predictionVersion,
      engines,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates the canonical EngineCoverageReport for every forecast
   */
  public static buildCoverageReport(context: {
    kpStatus?: 'AVAILABLE' | 'KP_NOT_AVAILABLE';
    hasVargas?: boolean;
    hasShadbala?: boolean;
    hasAshtakavarga?: boolean;
    hasJaimini?: boolean;
    hasTarot?: boolean;
    hasPalmistry?: boolean;
  }): EngineCoverageReport {
    return {
      D1: 'USED',
      D9: 'USED',
      D10: 'USED',
      DASHA: 'USED',
      TRANSIT: 'USED',
      TRUE_NODE: 'USED',
      NAKSHATRA: 'USED',
      YOGA: 'USED',
      DOSHA: 'USED',
      PLANET_STRENGTH: 'USED',
      HOUSE: 'USED',
      ASPECT: 'USED',
      NUMEROLOGY: 'USED',
      KP: context.kpStatus === 'AVAILABLE' ? 'USED' : 'CALCULATED_BUT_NOT_PREDICTION_ENABLED',
      VARGAS: context.hasVargas !== false ? 'USED' : 'NOT_AVAILABLE',
      SHADBALA: context.hasShadbala !== false ? 'USED' : 'NOT_AVAILABLE',
      ASHTAKAVARGA: context.hasAshtakavarga !== false ? 'USED' : 'NOT_AVAILABLE',
      JAIMINI: context.hasJaimini !== false ? 'USED' : 'NOT_AVAILABLE',
      REMEDIES: 'USED',
      TAROT: 'OPTIONAL',
      PALMISTRY: 'OPTIONAL',
    };
  }
}
