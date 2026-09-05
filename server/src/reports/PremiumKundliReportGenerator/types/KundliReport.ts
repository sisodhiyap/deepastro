/**
 * Premium Kundli Report — Typed Data Contract
 * Defines the canonical data structure for "MY LIFE BLUEPRINT: JANAM KUNDLI & NUMEROLOGY REPORT".
 * Strictly decouples calculation data from PDF layout rendering.
 */

import { BirthProfileInput } from '../../../astrology/VedicAstroEngine.js';
import { PlanetData } from '../../../astrology/PlanetEngine.js';
import { BhavaData } from '../../../astrology/HouseEngine.js';
import { YogaResult } from '../../../astrology/YogaEngine.js';
import { DoshaReport } from '../../../astrology/DoshaEngine.js';

export interface ReportMetadata {
  readonly reportId: string;
  readonly reportVersion: 'premium-kundli-v1' | 'premium-kundli-v2';
  readonly engineVersion: string;
  readonly createdAt: string;
  readonly checksum: string;
  readonly userId?: string;
  readonly totalPages: number;
}

export interface ReportBranding {
  readonly brandName: string;
  readonly logoSvg?: string;
  readonly reportTitle: string;
  readonly reportSubtitle: string;
  readonly tagline: string;
  readonly copyright: string;
  readonly creator: string;
  readonly website: string;
}

export interface KundliSnapshot {
  readonly ascendantSign: string;
  readonly ascendantSanskrit: string;
  readonly ascendantDegree: string;
  readonly moonSign: string;
  readonly moonSanskrit: string;
  readonly nakshatra: string;
  readonly nakshatraPada: number;
  readonly tithi: string;
  readonly varna: string;
  readonly gana: string;
  readonly dayVaar: string;
  readonly yogaPanchang: string;
  readonly vashya: string;
  readonly yoni: string;
  readonly nadi: string;
  readonly paya: string;
  readonly karana: string;
}

export interface FormattedPlanetRow {
  readonly name: string;
  readonly sanskritName: string;
  readonly symbol: string;
  readonly signName: string;
  readonly house: number;
  readonly degreeFormatted: string;
  readonly nakshatra: string;
  readonly pada: number;
  readonly dignity: string;
  readonly isRetrograde: boolean;
  readonly isCombust: boolean;
}

export interface HouseInterpretationCard {
  readonly houseNumber: number;
  readonly houseTitle: string;
  readonly signName: string;
  readonly lordName: string;
  readonly occupants: string[];
  readonly aspects: string[];
  readonly coreTheme: string;
  readonly insight: string;
  readonly practicalGuidance: string;
}

export interface YogaEvaluationItem {
  readonly name: string;
  readonly status: 'PRESENT' | 'CHECK' | 'ABSENT';
  readonly definition: string;
  readonly planetsInvolved: string[];
  readonly qualificationEvidence: string;
  readonly traditionalSignificance: string;
}

export interface DoshaEvaluationItem {
  readonly name: string;
  readonly status: 'PRESENT' | 'ABSENT' | 'INCONCLUSIVE';
  readonly intensity: string;
  readonly evidence: string;
  readonly nonFatalisticGuidance: string;
}

export interface DashaProgressionRow {
  readonly periodYears: string;
  readonly mahadashaLord: string;
  readonly antardashaLord: string;
  readonly coreTheme: string;
}

export interface MultiYearForecastRow {
  readonly year: string;
  readonly focus: string;
  readonly direction: string;
}

export interface NumerologySummary {
  readonly lifePath: { number: number; meaning: string };
  readonly destinyName: { number: number; meaning: string };
  readonly soulUrge: { number: number; meaning: string };
  readonly personality: { number: number; meaning: string };
  readonly birthNumber: { number: number; meaning: string };
}

export interface KundliReport {
  readonly metadata: ReportMetadata;
  readonly branding: ReportBranding;
  readonly profile: BirthProfileInput;
  readonly snapshot: KundliSnapshot;
  readonly chartStyle: 'north' | 'south' | 'east';
  readonly chartSvg: string;
  readonly planets: FormattedPlanetRow[];
  readonly houses: HouseInterpretationCard[];
  readonly yogas: YogaEvaluationItem[];
  readonly doshas: DoshaEvaluationItem[];
  readonly activeDasha: {
    readonly currentMahadasha: string;
    readonly currentAntardasha: string;
    readonly currentPratyantardasha?: string;
    readonly guidance: string;
  };
  readonly dashaTimeline: DashaProgressionRow[];
  readonly keyTransits: string[];
  readonly tenYearForecast: MultiYearForecastRow[];
  readonly careerBusinessFinance: {
    readonly careerInsight: string;
    readonly businessInsight: string;
    readonly financeInsight: string;
  };
  readonly numerology: NumerologySummary;
  readonly gemstonesAndRemedies: {
    readonly methodologyNote: string;
    readonly recommendations: Array<{
      gemstone: string;
      graha: string;
      reason: string;
      metal: string;
      finger: string;
      mantra: string;
      caution: string;
    }>;
    readonly traditionalRemedies: string[];
  };
  readonly whatToDoAndAvoid: {
    readonly whatToDo: string[];
    readonly whatToAvoid: string[];
  };
  readonly finalBlueprint: {
    readonly executiveSummary: string;
    readonly topActionsForYearAhead: [string, string, string];
  };
  readonly methodology: string;
  readonly disclaimer: string;
}
