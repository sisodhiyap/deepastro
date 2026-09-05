/**
 * Universal Astrology Fact Set (AstrologyFactSet)
 * The single canonical immutable astrological fact object for DeepAstro 2.0.
 * Produced exclusively by the deterministic VedicAstroEngine.
 * Downstream modules (AstroBot, Reports, Predictions, Matching) consume this object read-only.
 */

import { DegreeDetails } from './astronomyMath.js';
import { BirthProfileInput } from './VedicAstroEngine.js';
import { PlanetData } from './PlanetEngine.js';
import { BhavaData } from './HouseEngine.js';
import { NakshatraInfo } from './NakshatraEngine.js';
import { VimshottariAnalysis, DashaPeriod, PratyantardashaPeriod } from './DashaEngine.js';
import { YogaResult } from './YogaEngine.js';
import { DoshaReport } from './DoshaEngine.js';
import { PanchangDetails } from './PanchangEngine.js';

import { CompleteVargaSet } from './VargaEngine.js';

export type { PratyantardashaPeriod };
export type DetailedDashaPeriod = DashaPeriod;

export interface TransitInteraction {
  planet: string;
  transitSign: string;
  transitSignIndex: number;
  transitHouse: number; // House relative to natal Lagna
  transitHouseFromMoon: number; // House relative to natal Moon (Chandra Lagna)
  isRetrograde: boolean;
  aspectsNatalHouses: number[];
  activatesNatalPlanets: string[];
  description: string;
}

export interface SadeSatiAnalysis {
  isInSadeSati: boolean;
  currentPhase: 'None' | 'Rising (1st Phase - 12th from Moon)' | 'Peak (2nd Phase - Over Moon)' | 'Setting (3rd Phase - 2nd from Moon)';
  moonSign: string;
  saturnTransitSign: string;
  description: string;
  remedies: string[];
}

export type DivisionalChartSet = CompleteVargaSet;

export interface AstrologyFactSet {
  readonly id: string;
  readonly profile: BirthProfileInput;
  readonly timestamps: {
    readonly localBirthTime: string;
    readonly utcBirthTime: string;
    readonly evaluationTime: string;
    readonly julianDay: number;
  };
  readonly astronomy: {
    readonly ayanamshaName: 'Lahiri (Chitra Paksha)';
    readonly ayanamshaDegrees: number;
    readonly obliquityDegrees: number;
    readonly siderealTimeHours: number;
  };
  readonly ascendant: {
    readonly details: DegreeDetails;
    readonly nakshatra: NakshatraInfo;
  };
  readonly moonSign: DegreeDetails;
  readonly sunSign: DegreeDetails;
  readonly moonNakshatra: NakshatraInfo;
  readonly planets: readonly PlanetData[];
  readonly houses: readonly BhavaData[];
  readonly divisionalCharts: DivisionalChartSet;
  readonly dashas: {
    readonly birthDashaLord: string;
    readonly balanceYearsRemaining: number;
    readonly currentMahadasha: DetailedDashaPeriod;
    readonly currentAntardasha: DetailedDashaPeriod;
    readonly currentPratyantardasha: PratyantardashaPeriod;
    readonly allMahadashas: readonly DetailedDashaPeriod[];
  };
  readonly yogas: readonly YogaResult[];
  readonly doshas: DoshaReport;
  readonly sadeSati: SadeSatiAnalysis;
  readonly transits: {
    readonly transitDate: string;
    readonly planetaryTransits: readonly TransitInteraction[];
    readonly highlightedActivations: readonly string[];
  };
  readonly panchang: PanchangDetails;
  readonly metadata: {
    readonly engineVersion: string;
    readonly calculationTimestamp: string;
    readonly verificationHash: string;
    readonly isImmutable: true;
  };
}
