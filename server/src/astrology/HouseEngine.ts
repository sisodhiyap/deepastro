/**
 * House Engine (Bhava)
 * Classical Parashari Rashi Bhava (Whole Sign) system + Bhava Chalit (Sripati Cusp) analysis.
 * Explicitly defines house system conventions without silently mixing boundaries.
 */

import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES, normalizeDegrees } from './astronomyMath.js';
import { PlanetData, PlanetName, SIGN_LORDS } from './PlanetEngine.js';

export interface BhavaData {
  houseNumber: number; // 1-12
  sanskritName: string;
  signIndex: number; // 0-11
  signName: string;
  vedicSignName: string;
  lord: PlanetName;
  startDegree: number;
  midCuspDegree: number;
  endDegree: number;
  planetsInHouse: PlanetName[];
  signification: string;
  category: 'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana' | 'Maraka';
  houseSystem: string;
}

export interface BhavaChalitCusp {
  houseNumber: number;
  startDegree: number;   // Arambha (Beginning of Bhava)
  midCuspDegree: number; // Madhya (Cusp center / peak)
  endDegree: number;     // Sandhi (Boundary / junction)
  signIndex: number;
  planetsInChalit: PlanetName[];
}

const BHAVA_NAMES = [
  'Tanu Bhava (Self / Physical Body)',
  'Dhana Bhava (Wealth / Speech / Family)',
  'Sahaja Bhava (Siblings / Courage / Effort)',
  'Sukha Bhava (Mother / Happiness / Land)',
  'Putra Bhava (Children / Intellect / Past Merits)',
  'Ari Bhava (Enemies / Health / Obstacles / Service)',
  'Yuvati Bhava (Spouse / Partnerships / Public)',
  'Randhra Bhava (Longevity / Transformation / Occult)',
  'Dharma Bhava (Fortune / Higher Wisdom / Father)',
  'Karma Bhava (Career / Status / Public Reputation)',
  'Labha Bhava (Gains / Ambition / Social Circle)',
  'Vyaya Bhava (Expenditure / Liberation / Solitude)',
];

/**
 * Calculate the 12 Bhavas using standard Parashari Whole Sign (Rashi Bhava) system.
 * In Whole Sign, each house spans precisely 30° corresponding to its zodiac sign.
 */
export function calculateHouses(ascendantDegrees: number, planets: PlanetData[]): BhavaData[] {
  const normAsc = normalizeDegrees(ascendantDegrees);
  const ascSign = Math.floor(normAsc / 30.0);

  const houses: BhavaData[] = [];

  for (let i = 1; i <= 12; i++) {
    const houseSign = (ascSign + (i - 1)) % 12;
    const lord = SIGN_LORDS[houseSign];

    // In Whole Sign, the house corresponds exactly to the sign's 30° span
    const startDeg = houseSign * 30.0;
    const midCusp = normalizeDegrees(startDeg + 15.0);
    const endDeg = (houseSign + 1) * 30.0;

    // Planets residing in this Whole Sign house
    const planetsInHouse = planets
      .filter((p) => p.house === i)
      .map((p) => p.name);

    // Vedic house classifications
    let category: 'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana' | 'Maraka' = 'Upachaya';
    if ([1, 4, 7, 10].includes(i)) category = 'Kendra';
    else if ([5, 9].includes(i)) category = 'Trikona';
    else if ([6, 8, 12].includes(i)) category = 'Dusthana';
    else if ([2, 7].includes(i)) category = 'Maraka';
    else if ([3, 6, 10, 11].includes(i)) category = 'Upachaya';

    houses.push({
      houseNumber: i,
      sanskritName: BHAVA_NAMES[i - 1],
      signIndex: houseSign,
      signName: ZODIAC_SIGNS[houseSign],
      vedicSignName: VEDIC_RASHI_NAMES[houseSign],
      lord,
      startDegree: startDeg,
      midCuspDegree: midCusp,
      endDegree: endDeg,
      planetsInHouse,
      signification: BHAVA_NAMES[i - 1].split('(')[1]?.replace(')', '') || '',
      category,
      houseSystem: 'Whole Sign (Parashari Rashi Bhava)',
    });
  }

  return houses;
}

/**
 * Calculate Sripati Bhava Chalit cusps and boundaries.
 * Midcusp of House 1 = Ascendant, Midcusp of House 10 = Midheaven (MC).
 */
export function calculateBhavaChalit(
  ascendantDegrees: number,
  midheavenDegrees: number,
  planets: PlanetData[]
): BhavaChalitCusp[] {
  const asc = normalizeDegrees(ascendantDegrees);
  const mc = normalizeDegrees(midheavenDegrees);

  // Quadrant spans:
  // Quadrant 4 (from MC to Asc): House 10 mid to House 1 mid
  let arc4 = normalizeDegrees(asc - mc);
  const d4 = arc4 / 3.0; // trisection span

  // Cusps (Madhya)
  const cusps: number[] = new Array(12);
  cusps[9] = mc;                                // House 10
  cusps[10] = normalizeDegrees(mc + d4);        // House 11
  cusps[11] = normalizeDegrees(mc + 2 * d4);    // House 12
  cusps[0] = asc;                               // House 1

  // Quadrant 1 (from Asc to IC = MC + 180): House 1 mid to House 4 mid
  const ic = normalizeDegrees(mc + 180.0);
  let arc1 = normalizeDegrees(ic - asc);
  const d1 = arc1 / 3.0;

  cusps[1] = normalizeDegrees(asc + d1);        // House 2
  cusps[2] = normalizeDegrees(asc + 2 * d1);    // House 3
  cusps[3] = ic;                                // House 4

  // Opposite houses (180° opposite)
  for (let i = 0; i < 6; i++) {
    cusps[i + 6] = normalizeDegrees(cusps[i] + 180.0);
  }

  // Calculate Sandhi (boundaries halfway between adjacent cusps)
  const chalitList: BhavaChalitCusp[] = [];

  for (let i = 0; i < 12; i++) {
    const prevIdx = (i + 11) % 12;
    const nextIdx = (i + 1) % 12;

    const mid = cusps[i];
    let prevMid = cusps[prevIdx];
    let nextMid = cusps[nextIdx];

    let spanBefore = normalizeDegrees(mid - prevMid);
    let spanAfter = normalizeDegrees(nextMid - mid);

    const startDeg = normalizeDegrees(mid - spanBefore / 2.0);
    const endDeg = normalizeDegrees(mid + spanAfter / 2.0);

    // Determine which planets fall between startDeg and endDeg
    const planetsInChalit = planets.filter((p) => {
      const lon = p.siderealLongitude;
      if (startDeg <= endDeg) {
        return lon >= startDeg && lon < endDeg;
      } else {
        // Wraps over 0°
        return lon >= startDeg || lon < endDeg;
      }
    }).map((p) => p.name);

    chalitList.push({
      houseNumber: i + 1,
      startDegree: startDeg,
      midCuspDegree: mid,
      endDegree: endDeg,
      signIndex: Math.floor(mid / 30.0),
      planetsInChalit,
    });
  }

  return chalitList;
}
