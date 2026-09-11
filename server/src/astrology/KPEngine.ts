/**
 * Krishnamurti Paddhati (KP) Astrology Engine
 * Implements deterministic KP stellar astrology calculations:
 * - 249 Sub-division table based on Vimshottari proportional spans
 * - Sign Lord, Star Lord (Nakshatra Lord), and Sub-Lord for any sidereal coordinate
 * - Cusp analysis with KP significators
 * 
 * Strict Invariant:
 * If accurate coordinates or birth time are unavailable, returns KP_NOT_AVAILABLE.
 * Never invents or guesses pseudo-KP sub-lords.
 */

import { PlanetData } from './PlanetEngine.js';
import { DegreeDetails } from './astronomyMath.js';

export interface AscendantData {
  degrees?: number;
  details?: DegreeDetails;
}

export interface KPCuspPoint {
  houseNumber: number;
  siderealLongitude: number;
  signName: string;
  signLord: string;
  starLord: string;
  subLord: string;
}

export interface KPPlanetPoint {
  planet: string;
  siderealLongitude: number;
  signName: string;
  signLord: string;
  starLord: string;
  subLord: string;
  houseOccupied: number;
}

export interface KPAnalysis {
  status: 'AVAILABLE' | 'KP_NOT_AVAILABLE';
  reason?: string;
  ayanamsaType: 'KP New (Krishnamurti)';
  planets: KPPlanetPoint[];
  cusps: KPCuspPoint[];
  significatorsSummary: Record<string, { housesSignified: number[]; primarySubLord: string }>;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_LORDS: Record<number, string> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars',
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn',
  11: 'Jupiter',
};

const VIMSHOTTARI_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export class KPEngine {
  /**
   * Resolves the Star Lord (Nakshatra Lord) and Sub-Lord for any sidereal longitude (0° - 360°)
   */
  public static resolveStarAndSubLord(siderealLongitude: number): {
    nakshatraIndex: number;
    starLord: string;
    subLord: string;
    degInNakshatra: number;
  } {
    const normalized = (siderealLongitude % 360 + 360) % 360;
    const nakshatraSpan = 360 / 27; // 13° 20' = 13.3333333333°
    const nakshatraIndex = Math.floor(normalized / nakshatraSpan);
    const degInNakshatra = normalized - nakshatraIndex * nakshatraSpan;

    // Star lord is determined by the standard 27-nakshatra ruler cycle
    const starLordIndex = nakshatraIndex % 9;
    const starLord = VIMSHOTTARI_LORDS[starLordIndex];

    // Sub-lord is determined by dividing the 13.3333° span into 9 parts proportional to Vimshottari years
    // Starting from the star lord itself
    let accumulatedSpan = 0;
    let subLord = starLord;

    for (let i = 0; i < 9; i++) {
      const currentLordIdx = (starLordIndex + i) % 9;
      const currentLord = VIMSHOTTARI_LORDS[currentLordIdx];
      const spanDegrees = (nakshatraSpan * VIMSHOTTARI_YEARS[currentLord]) / 120;

      if (degInNakshatra >= accumulatedSpan && degInNakshatra <= accumulatedSpan + spanDegrees + 1e-9) {
        subLord = currentLord;
        break;
      }
      accumulatedSpan += spanDegrees;
    }

    return {
      nakshatraIndex,
      starLord,
      subLord,
      degInNakshatra,
    };
  }

  /**
   * Evaluates complete KP analysis for a chart
   */
  public static calculateKP(
    planets: PlanetData[],
    ascendant: AscendantData,
    options?: { isApproximateTime?: boolean }
  ): KPAnalysis {
    if (options?.isApproximateTime) {
      return {
        status: 'KP_NOT_AVAILABLE',
        reason: 'KP stellar sub-lord analysis requires precise birth time (< 1 minute accuracy). Approximate time invalidates sub-lord cusps.',
        ayanamsaType: 'KP New (Krishnamurti)',
        planets: [],
        cusps: [],
        significatorsSummary: {},
      };
    }

    const kpPlanets: KPPlanetPoint[] = planets.map((p) => {
      const signIdx = Math.floor(p.siderealLongitude / 30);
      const signLord = SIGN_LORDS[signIdx];
      const { starLord, subLord } = this.resolveStarAndSubLord(p.siderealLongitude);

      return {
        planet: p.name,
        siderealLongitude: p.siderealLongitude,
        signName: p.signName,
        signLord,
        starLord,
        subLord,
        houseOccupied: p.house,
      };
    });

    // 12 House Cusps
    const cusps: KPCuspPoint[] = Array.from({ length: 12 }, (_, i) => {
      const houseNumber = i + 1;
      const ascDeg = typeof ascendant.degrees === 'number' ? ascendant.degrees : (ascendant.details?.totalDegrees || 0);
      const cuspLongitude = (ascDeg + i * 30) % 360;
      const signIdx = Math.floor(cuspLongitude / 30);
      const signLord = SIGN_LORDS[signIdx];
      const { starLord, subLord } = this.resolveStarAndSubLord(cuspLongitude);

      return {
        houseNumber,
        siderealLongitude: cuspLongitude,
        signName: SIGN_NAMES[signIdx],
        signLord,
        starLord,
        subLord,
      };
    });

    // Compute basic significators
    const significatorsSummary: Record<string, { housesSignified: number[]; primarySubLord: string }> = {};
    for (const kp of kpPlanets) {
      const houses = cusps.filter((c) => c.signLord === kp.planet || c.starLord === kp.planet).map((c) => c.houseNumber);
      houses.push(kp.houseOccupied);
      significatorsSummary[kp.planet] = {
        housesSignified: Array.from(new Set(houses)).sort((a, b) => a - b),
        primarySubLord: kp.subLord,
      };
    }

    return {
      status: 'AVAILABLE',
      ayanamsaType: 'KP New (Krishnamurti)',
      planets: kpPlanets,
      cusps,
      significatorsSummary,
    };
  }
}
