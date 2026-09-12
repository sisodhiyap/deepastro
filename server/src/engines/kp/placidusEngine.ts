/**
 * Placidus House Cusp Calculation Engine
 * High-precision iterative semi-arc trisection based on Placidus de Titis spherical trigonometry.
 * Deterministically computes all 12 unequal house cusps for any geographic coordinate and RAMC.
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { normalizeDegrees, toRadians, toDegrees } from '../../astrology/astronomyMath.js';
import { KPAyanamsaEngine } from './kpAyanamsa.js';
import { KPAyanamsaType } from './kpConfig.js';
import type * as AstronomyTypes from 'astronomy-engine';

export interface PlacidusCuspResult {
  cuspNumber: number;
  tropicalLongitude: number;
  siderealLongitude: number;
  spanDegrees: number;
  signIndex: number;
}

export class PlacidusEngine {
  /**
   * Calculates 12 Placidus cusps for a given Julian Day, latitude, longitude, and ayanamsa.
   */
  public static calculateCusps(params: {
    jd: number;
    latitude: number;
    longitude: number;
    ayanamsaType?: KPAyanamsaType;
  }): PlacidusCuspResult[] {
    const { jd, latitude, longitude, ayanamsaType = 'KP_NEW' } = params;

    const ms = (jd - 2440587.5) * 86400000.0;
    const time = Astronomy.MakeTime(new Date(ms));

    // Local Sidereal Time / RAMC
    const gastHours = Astronomy.SiderealTime(time);
    const ramcDeg = normalizeDegrees(gastHours * 15.0 + longitude);
    const ramcRad = toRadians(ramcDeg);
    const latRad = toRadians(latitude);

    // True obliquity of date
    const tilt = Astronomy.e_tilt(time);
    const epsRad = toRadians(tilt.tobl);

    const ayanamsa = KPAyanamsaEngine.calculateAyanamsa(time, ayanamsaType);

    // 1. Cusp 10 (Midheaven / MC)
    let tropicalMC = toDegrees(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)));
    tropicalMC = normalizeDegrees(tropicalMC);

    // 2. Cusp 1 (Ascendant)
    const ascY = Math.cos(ramcRad);
    const ascX = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    let tropicalAsc = toDegrees(Math.atan2(ascY, ascX));
    tropicalAsc = normalizeDegrees(tropicalAsc);

    const cuspsTropical: number[] = new Array(12);
    cuspsTropical[9] = tropicalMC;                            // Cusp 10 (0-indexed: 9)
    cuspsTropical[0] = tropicalAsc;                           // Cusp 1  (0-indexed: 0)
    cuspsTropical[3] = normalizeDegrees(tropicalMC + 180.0);  // Cusp 4
    cuspsTropical[6] = normalizeDegrees(tropicalAsc + 180.0); // Cusp 7

    // Placidus diurnal semi-arc solver for diurnal cusps (11, 12, 9, 8)
    // direction: +1 for Eastern quadrant (towards Ascendant: 11, 12)
    //           -1 for Western quadrant (towards Descendant: 9, 8)
    const solveDiurnalCusp = (
      semiArcFraction: number,
      direction: 1 | -1
    ): number => {
      // Polar latitude fallback
      if (Math.abs(latitude) >= 66.5) {
        const quadrantSpan = direction === 1 
          ? normalizeDegrees(tropicalAsc - tropicalMC)
          : normalizeDegrees(tropicalMC - normalizeDegrees(tropicalAsc + 180.0));
        return normalizeDegrees(tropicalMC + direction * quadrantSpan * semiArcFraction);
      }

      let ra = normalizeDegrees(ramcDeg + direction * 30.0 * (semiArcFraction < 0.5 ? 1 : 2));
      for (let iter = 0; iter < 60; iter++) {
        const raRad = toRadians(ra);
        const cosRa = Math.cos(raRad);
        const sinRa = Math.sin(raRad);
        const lon = normalizeDegrees(toDegrees(Math.atan2(sinRa, cosRa * Math.cos(epsRad))));
        const lonRad = toRadians(lon);

        // Declination
        const sinDec = Math.sin(epsRad) * Math.sin(lonRad);
        const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

        // Semi-arc equation (Diurnal semi-arc = 90 + ascensional difference)
        const tanLatTanDec = Math.tan(latRad) * Math.tan(decRad);
        if (Math.abs(tanLatTanDec) >= 1.0) {
          // Circumpolar limit
          break;
        }

        const ad = toDegrees(Math.asin(tanLatTanDec));
        const dsa = 90.0 + ad;
        const targetHa = dsa * semiArcFraction;

        const nextRa = normalizeDegrees(ramcDeg + direction * targetHa);
        const diff = Math.abs(nextRa - ra);
        ra = nextRa;
        if (diff < 1e-8) {
          break;
        }
      }

      const raRad = toRadians(ra);
      return normalizeDegrees(toDegrees(Math.atan2(Math.sin(raRad), Math.cos(raRad) * Math.cos(epsRad))));
    };

    // Calculate Houses 11 and 12 (Diurnal Eastern: MC to Asc)
    cuspsTropical[10] = solveDiurnalCusp(1.0 / 3.0, +1); // Cusp 11
    cuspsTropical[11] = solveDiurnalCusp(2.0 / 3.0, +1); // Cusp 12

    // Calculate Houses 9 and 8 (Diurnal Western: MC to Desc)
    cuspsTropical[8] = solveDiurnalCusp(1.0 / 3.0, -1);  // Cusp 9
    cuspsTropical[7] = solveDiurnalCusp(2.0 / 3.0, -1);  // Cusp 8

    // Symmetrical opposite cusps:
    // Cusp 5 = Cusp 11 + 180°
    // Cusp 6 = Cusp 12 + 180°
    // Cusp 3 = Cusp 9  + 180°
    // Cusp 2 = Cusp 8  + 180°
    cuspsTropical[4] = normalizeDegrees(cuspsTropical[10] + 180.0); // Cusp 5
    cuspsTropical[5] = normalizeDegrees(cuspsTropical[11] + 180.0); // Cusp 6
    cuspsTropical[2] = normalizeDegrees(cuspsTropical[8]  + 180.0); // Cusp 3
    cuspsTropical[1] = normalizeDegrees(cuspsTropical[7]  + 180.0); // Cusp 2

    // Convert to Sidereal degrees using KP ayanamsa and build Cusp results
    const results: PlacidusCuspResult[] = [];
    for (let i = 0; i < 12; i++) {
      const trop = cuspsTropical[i];
      const sid = normalizeDegrees(trop - ayanamsa);
      const nextIdx = (i + 1) % 12;
      const nextSid = normalizeDegrees(cuspsTropical[nextIdx] - ayanamsa);
      const span = normalizeDegrees(nextSid - sid);

      results.push({
        cuspNumber: i + 1,
        tropicalLongitude: trop,
        siderealLongitude: sid,
        spanDegrees: span,
        signIndex: Math.floor(sid / 30.0),
      });
    }

    return results;
  }
}
