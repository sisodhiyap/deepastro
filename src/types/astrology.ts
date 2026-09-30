/**
 * DeepAstro Canonical Astrology Data Contracts
 * Hardened interfaces for Varga Charts, Dashas, and Planetary Calculations.
 */

export interface NodeCalculationMetadata {
  nodeModel: 'TRUE_NODE' | 'MEAN_NODE';
  nodeModelDescription: string;
  nodeCalculationVersion: string;
}

export interface VargaPlanet {
  planet: string;
  signIndex: number;
  signName: string;
  vedicSignName: string;
  signLord: string;
  houseInVarga: number;
  isVargottama?: boolean;
  degreeInVarga?: number;
  isRetrograde?: boolean;
  isCombust?: boolean;
}

export interface VargaChart {
  division: number;
  code: string;
  sanskritName: string;
  englishName: string;
  formulaVersion: string;
  domainSignification: string;
  ascendantSignIndex: number;
  ascendantSignName: string;
  planets: VargaPlanet[];
}

export interface PratyantardashaPeriod {
  planet: string;
  durationDays: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export interface DashaPeriod {
  planet: string;
  durationYears: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  antardashas?: DashaPeriod[];
  pratyantardashas?: PratyantardashaPeriod[];
}

export interface VimshottariTimeline {
  birthDashaLord: string;
  balanceYearsRemaining: number;
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha?: PratyantardashaPeriod;
  allMahadashas: DashaPeriod[];
}

export interface ChartPlanet {
  name: string;
  symbol: string;
  house: number; // 1-12
  signIndex: number; // 0-11
  isRetrograde?: boolean;
  isCombust?: boolean;
  degreeInSign?: number;
}
