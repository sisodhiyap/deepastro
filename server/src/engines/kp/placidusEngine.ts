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

    // Iterative trisection for cusps 11, 12, 2, 3
    const cuspsTropical: number[] = new Array(12);
    cuspsTropical[9] = tropicalMC;        // Cusp 10 (0-indexed: 9)
    cuspsTropical[0] = tropicalAsc;       // Cusp 1  (0-indexed: 0)
    cuspsTropical[3] = normalizeDegrees(tropicalMC + 180.0);  // Cusp 4
    cuspsTropical[6] = normalizeDegrees(tropicalAsc + 180.0); // Cusp 7

    // Placidus iteration helper
    const solveIntermediateCusp = (
      ramcOffsetDeg: number,
      semiArcFraction: number,
      isDiurnal: boolean
    ): number => {
      // If polar latitude exceeds Placidus limit
      if (Math.abs(latitude) >= 66.5) {
        // Porphyry quadrant trisection fallback for extreme polar latitudes
        const base = isDiurnal ? tropicalMC : normalizeDegrees(tropicalAsc + 180.0);
        return normalizeDegrees(base + (isDiurnal ? (tropicalAsc - tropicalMC) : (tropicalMC + 180.0 - (tropicalAsc + 180.0))) * semiArcFraction);
      }

      let ra = normalizeDegrees(ramcDeg + ramcOffsetDeg);
      for (let iter = 0; iter < 50; iter++) {
        const raRad = toRadians(ra);
        // Ecliptic longitude from RA
        const tanLon = Math.tan(raRad) / Math.cos(epsRad);
        let lon = toDegrees(Math.atan(tanLon));
        // Quadrant correction
        const cosRa = Math.cos(raRad);
        const sinRa = Math.sin(raRad);
        lon = toDegrees(Math.atan2(sinRa, cosRa * Math.cos(epsRad)));
        lon = normalizeDegrees(lon);

        const lonRad = toRadians(lon);
        // Declination
        const sinDec = Math.sin(epsRad) * Math.sin(lonRad);
        const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

        // Semi-arc equation
        const tanLatTanDec = Math.tan(latRad) * Math.tan(decRad);
        if (Math.abs(tanLatTanDec) >= 1.0) {
          // Circumpolar fallback for this specific degree
          break;
        }

        const ad = toDegrees(Math.asin(tanLatTanDec));
        const semiArc = isDiurnal ? (90.0 - ad) : (90.0 + ad);
        const targetHa = semiArc * semiArcFraction;

        const nextRa = normalizeDegrees(isDiurnal ? (ramcDeg + targetHa) : (ramcDeg + 180.0 - targetHa));
        const diff = Math.abs(nextRa - ra);
        ra = nextRa;
        if (diff < 1e-8) {
          break;
        }
      }

      // Final longitude from converged RA
      const raRad = toRadians(ra);
      const lon = normalizeDegrees(toDegrees(Math.atan2(Math.sin(raRad), Math.cos(raRad) * Math.cos(epsRad))));
      return lon;
    };

    // Calculate Houses 11 and 12 (Diurnal from MC to Asc)
    cuspsTropical[10] = solveIntermediateCusp(30.0, 1.0 / 3.0, true);  // Cusp 11
    cuspsTropical[11] = solveIntermediateCusp(60.0, 2.0 / 3.0, true);  // Cusp 12

    // Calculate Houses 2 and 3 (Nocturnal from Asc to IC)
    cuspsTropical[1] = solveIntermediateCusp(120.0, 2.0 / 3.0, false); // Cusp 2
    cuspsTropical[2] = solveIntermediateCusp(150.0, 1.0 / 3.0, false); // Cusp 3

    // Opposite houses (5, 6, 8, 9)
    cuspsTropical[4] = normalizeDegrees(cuspsTropical[10] + 180.0); // Cusp 5
    cuspsTropical[5] = normalizeDegrees(cuspsTropical[11] + 180.0); // Cusp 6
    cuspsTropical[7] = normalizeDegrees(cuspsTropical[1] + 180.0);  // Cusp 8
    cuspsTropical[8] = normalizeDegrees(cuspsTropical[2] + 180.0);  // Cusp 9

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
