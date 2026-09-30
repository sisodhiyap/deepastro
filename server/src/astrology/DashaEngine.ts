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

  // Subsequent Mahadashas up to full 120-year cycle (and extended if current timestamp exceeds 120 years)
  const nowMs = currentDate.getTime();
  let step = 1;
  // Always compute at least the full 9-mahadasha cycle
  while (step < 9 || (currentStart.getTime() < nowMs && step < 27)) {
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
    step++;
  }

  // Populate Antardashas and Pratyantardashas for each Mahadasha
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
      // For the 9th Antardasha, clamp to mEndMs to eliminate floating point rounding
      const aDurationMs = a === 8 ? (mEndMs - aStartMs) : mTotalMs * (aInfo.years / 120.0);
      const aEndMs = a === 8 ? mEndMs : aStartMs + aDurationMs;

      // Calculate Pratyantardashas (Level 3) for this Antardasha
      const pratyantardashas: PratyantardashaPeriod[] = [];
      let pStartMs = aStartMs;
      const subTotalMs = aEndMs - aStartMs;

      for (let p = 0; p < 9; p++) {
        const pIdx = (aIdx + p) % 9;
        const pInfo = DASHA_SEQUENCE[pIdx];
        const pDurationMs = p === 8 ? (aEndMs - pStartMs) : subTotalMs * (pInfo.years / 120.0);
        const pEndMs = p === 8 ? aEndMs : pStartMs + pDurationMs;

        pratyantardashas.push({
          planet: pInfo.lord,
          durationDays: Math.max(1, Math.round((pEndMs - pStartMs) / (24 * 60 * 60 * 1000))),
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

  // Find currently active Mahadasha (strictly containing nowMs, or boundary clamped)
  let currentM = mahadashas.find((m) => {
    const s = new Date(m.startDate).getTime();
    const e = new Date(m.endDate).getTime();
    return nowMs >= s && nowMs <= e;
  });

  if (!currentM) {
    if (nowMs < new Date(mahadashas[0].startDate).getTime()) {
      currentM = mahadashas[0];
    } else {
      currentM = mahadashas[mahadashas.length - 1];
    }
  }

  // Find currently active Antardasha
  let currentA: DashaPeriod = currentM.antardashas?.[0] || currentM;
  if (currentM.antardashas && currentM.antardashas.length > 0) {
    const matchA = currentM.antardashas.find((a) => {
      const s = new Date(a.startDate).getTime();
      const e = new Date(a.endDate).getTime();
      return nowMs >= s && nowMs <= e;
    });
    if (matchA) {
      currentA = matchA;
    } else if (nowMs < new Date(currentM.antardashas[0].startDate).getTime()) {
      currentA = currentM.antardashas[0];
    } else {
      currentA = currentM.antardashas[currentM.antardashas.length - 1];
    }
  }

  // Find currently active Pratyantardasha
  let currentP: PratyantardashaPeriod = currentA.pratyantardashas?.[0] || {
    planet: currentA.planet,
    durationDays: Math.max(1, Math.round((new Date(currentA.endDate).getTime() - new Date(currentA.startDate).getTime()) / 86400000)),
    startDate: currentA.startDate,
    endDate: currentA.endDate,
  };

  if (currentA.pratyantardashas && currentA.pratyantardashas.length > 0) {
    const matchP = currentA.pratyantardashas.find((p) => {
      const s = new Date(p.startDate).getTime();
      const e = new Date(p.endDate).getTime();
      return nowMs >= s && nowMs <= e;
    });
    if (matchP) {
      currentP = matchP;
    } else if (nowMs < new Date(currentA.pratyantardashas[0].startDate).getTime()) {
      currentP = currentA.pratyantardashas[0];
    } else {
      currentP = currentA.pratyantardashas[currentA.pratyantardashas.length - 1];
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

/**
 * Validates Vimshottari Dasha hierarchy integrity:
 * - startDate < endDate for all periods
 * - No NaN or invalid dates
 * - Mahadasha contains all its Antardashas
 * - Antardasha contains all its Pratyantardashas
 */
export function validateDashaHierarchy(analysis: VimshottariAnalysis): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const m of analysis.allMahadashas) {
    const mStart = new Date(m.startDate).getTime();
    const mEnd = new Date(m.endDate).getTime();
    if (isNaN(mStart) || isNaN(mEnd)) errors.push(`Mahadasha ${m.planet} has invalid date string`);
    if (mStart >= mEnd) errors.push(`Mahadasha ${m.planet} has startDate >= endDate`);
    if (m.durationYears <= 0) errors.push(`Mahadasha ${m.planet} has non-positive duration`);

    if (m.antardashas) {
      for (const a of m.antardashas) {
        const aStart = new Date(a.startDate).getTime();
        const aEnd = new Date(a.endDate).getTime();
        if (isNaN(aStart) || isNaN(aEnd)) errors.push(`Antardasha ${a.planet} has invalid date string`);
        if (aStart >= aEnd) errors.push(`Antardasha ${a.planet} has startDate >= endDate`);
        if (aStart < mStart || aEnd > mEnd) errors.push(`Antardasha ${a.planet} boundaries exceed Mahadasha ${m.planet}`);

        if (a.pratyantardashas) {
          for (const p of a.pratyantardashas) {
            const pStart = new Date(p.startDate).getTime();
            const pEnd = new Date(p.endDate).getTime();
            if (isNaN(pStart) || isNaN(pEnd)) errors.push(`Pratyantardasha ${p.planet} has invalid date string`);
            if (pStart >= pEnd) errors.push(`Pratyantardasha ${p.planet} has startDate >= endDate`);
            if (pStart < aStart || pEnd > aEnd) errors.push(`Pratyantardasha ${p.planet} boundaries exceed Antardasha ${a.planet}`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
