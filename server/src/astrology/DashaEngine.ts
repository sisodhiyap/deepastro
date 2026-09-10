/**
 * Dasha Engine — Comprehensive 3-Level Vimshottari System
 * Computes Vimshottari Dasha (120-year cycle) derived from Moon's Janma Nakshatra:
 * - Level 1: Mahadashas (Major periods)
 * - Level 2: Antardashas (Sub periods)
 * - Level 3: Pratyantardashas (Sub-sub periods)
 * Accurately tracks natal balance, start/end dates, active planetary rulers, and remaining duration.
 */

import { PlanetName } from './PlanetEngine.js';

export interface PratyantardashaPeriod {
  planet: PlanetName;
  durationDays: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export interface DashaPeriod {
  planet: PlanetName;
  durationYears: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  antardashas?: DashaPeriod[];
  pratyantardashas?: PratyantardashaPeriod[];
}

export interface VimshottariAnalysis {
  birthDashaLord: PlanetName;
  balanceYearsRemaining: number;
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha: PratyantardashaPeriod;
  allMahadashas: DashaPeriod[];
}

// 9 Vimshottari lords in standard cosmic sequence
export const DASHA_SEQUENCE: Array<{ lord: PlanetName; years: number }> = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDate: Date,
  currentDate: Date = new Date()
): VimshottariAnalysis {
  const SPAN = 40.0 / 3.0; // 13° 20' = 13.333333333333334°
  const EPS = 1e-10;
  let norm = ((moonLongitude % 360.0) + 360.0) % 360.0;
  if (norm >= 360.0) norm = 0;

  const nakIndex = Math.min(26, Math.floor((norm + EPS) / SPAN)); // 0 to 26
  const degInNak = Math.max(0, norm - nakIndex * SPAN);

  // Each set of 9 nakshatras corresponds to the 9 dasha lords in order
  const lordIndex = nakIndex % 9;
  const birthLordInfo = DASHA_SEQUENCE[lordIndex];
  const birthLord = birthLordInfo.lord;
  const totalYears = birthLordInfo.years;

  // Fraction remaining in the nakshatra
  const fractionElapsed = degInNak / SPAN;
  const fractionRemaining = Math.max(0, Math.min(1.0, 1.0 - fractionElapsed));
  const balanceYears = fractionRemaining * totalYears;

  const mahadashas: DashaPeriod[] = [];
  let currentStart = new Date(birthDate);

  // Solar year in ms (365.2425 days average Gregorian year)
  const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

  // First Mahadasha with remaining balance
  const firstEndMs = currentStart.getTime() + balanceYears * MS_PER_YEAR;
  const firstEnd = new Date(firstEndMs);

  mahadashas.push({
    planet: birthLord,
    durationYears: balanceYears,
    startDate: currentStart.toISOString(),
    endDate: firstEnd.toISOString(),
  });

  currentStart = firstEnd;

  // Subsequent Mahadashas up to full cycle
  for (let step = 1; step < 9; step++) {
    const nextIdx = (lordIndex + step) % 9;
    const info = DASHA_SEQUENCE[nextIdx];
    const endMs = currentStart.getTime() + info.years * MS_PER_YEAR;
    const end = new Date(endMs);

    mahadashas.push({
      planet: info.lord,
      durationYears: info.years,
      startDate: currentStart.toISOString(),
      endDate: end.toISOString(),
    });

    currentStart = end;
  }

  // Populate Antardashas for each Mahadasha
  for (let m = 0; m < mahadashas.length; m++) {
    const mDasha = mahadashas[m];
    const mStartMs = new Date(mDasha.startDate).getTime();
    const mEndMs = new Date(mDasha.endDate).getTime();
    const mTotalMs = mEndMs - mStartMs;

    const mLordIdx = DASHA_SEQUENCE.findIndex((item) => item.lord === mDasha.planet);
    const antardashas: DashaPeriod[] = [];
    let aStartMs = mStartMs;

    for (let a = 0; a < 9; a++) {
      const aIdx = (mLordIdx + a) % 9;
      const aInfo = DASHA_SEQUENCE[aIdx];
      // Antardasha proportion = (M_duration * A_years) / 120
      const aDurationMs = mTotalMs * (aInfo.years / 120.0);
      const aEndMs = aStartMs + aDurationMs;

      // Calculate Pratyantardashas (Level 3) for this Antardasha
      const pratyantardashas: PratyantardashaPeriod[] = [];
      let pStartMs = aStartMs;
      for (let p = 0; p < 9; p++) {
        const pIdx = (aIdx + p) % 9;
        const pInfo = DASHA_SEQUENCE[pIdx];
        const pDurationMs = aDurationMs * (pInfo.years / 120.0);
        const pEndMs = pStartMs + pDurationMs;

        pratyantardashas.push({
          planet: pInfo.lord,
          durationDays: Math.round(pDurationMs / (24 * 60 * 60 * 1000)),
          startDate: new Date(pStartMs).toISOString(),
          endDate: new Date(pEndMs).toISOString(),
        });
        pStartMs = pEndMs;
      }

      antardashas.push({
        planet: aInfo.lord,
        durationYears: (aInfo.years * mDasha.durationYears) / 120.0,
        startDate: new Date(aStartMs).toISOString(),
        endDate: new Date(aEndMs).toISOString(),
        pratyantardashas,
      });

      aStartMs = aEndMs;
    }

    mDasha.antardashas = antardashas;
  }

  // Find currently active Mahadasha, Antardasha, and Pratyantardasha
  const nowMs = currentDate.getTime();
  let currentM = mahadashas[0];
  for (const m of mahadashas) {
    if (nowMs >= new Date(m.startDate).getTime() && nowMs <= new Date(m.endDate).getTime()) {
      currentM = m;
      break;
    }
  }

  let currentA = currentM.antardashas ? currentM.antardashas[0] : currentM;
  if (currentM.antardashas) {
    for (const a of currentM.antardashas) {
      if (nowMs >= new Date(a.startDate).getTime() && nowMs <= new Date(a.endDate).getTime()) {
        currentA = a;
        break;
      }
    }
  }

  let currentP: PratyantardashaPeriod = currentA.pratyantardashas
    ? currentA.pratyantardashas[0]
    : {
        planet: currentA.planet,
        durationDays: 30,
        startDate: currentA.startDate,
        endDate: currentA.endDate,
      };

  if (currentA.pratyantardashas) {
    for (const p of currentA.pratyantardashas) {
      if (nowMs >= new Date(p.startDate).getTime() && nowMs <= new Date(p.endDate).getTime()) {
        currentP = p;
        break;
      }
    }
  }

  return {
    birthDashaLord: birthLord,
    balanceYearsRemaining: balanceYears,
    currentMahadasha: currentM,
    currentAntardasha: currentA,
    currentPratyantardasha: currentP,
    allMahadashas: mahadashas,
  };
}
