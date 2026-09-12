/**
 * KP Cusp Calculation Engine
 * High-precision calculation of all 12 Placidus house cusps with exact
 * Sign Lord -> Star Lord -> Sub Lord -> Sub-Sub Lord chains and house spans.
 */

import { PlacidusEngine, PlacidusCuspResult } from './placidusEngine.js';
import { KPSubDivisionEngine, SubDivisionDetails } from './kpSubDivision.js';
import { KPAyanamsaType } from './kpConfig.js';

export interface KPCuspItem {
  cusp: number;
  longitude: number;
  sign: string;
  signIndex: number;
  signLord: string;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  starLord: string;
  subLord: string;
  subSubLord: string;
  subSubSubLord: string;
  subNumber249: number;
  houseSpan: number;
  startLongitude: number;
  endLongitude: number;
  details: SubDivisionDetails;
}

export class KPCuspEngine {
  /**
   * Calculates all 12 KP Placidus house cusps with full sub-lord chains
   */
  public static calculateKPCusps(params: {
    jd: number;
    latitude: number;
    longitude: number;
    ayanamsaType?: KPAyanamsaType;
  }): KPCuspItem[] {
    const placidusResults = PlacidusEngine.calculateCusps(params);

    return placidusResults.map((p, idx) => {
      const details = KPSubDivisionEngine.resolveDetails(p.siderealLongitude);
      const nextIdx = (idx + 1) % 12;
      const endLon = placidusResults[nextIdx].siderealLongitude;

      return {
        cusp: p.cuspNumber,
        longitude: p.siderealLongitude,
        sign: details.signName,
        signIndex: details.signIndex,
        signLord: details.signLord,
        nakshatra: details.nakshatraName,
        nakshatraNumber: details.nakshatraNumber,
        pada: details.pada,
        starLord: details.starLord,
        subLord: details.subLord,
        subSubLord: details.subSubLord,
        subSubSubLord: details.subSubSubLord,
        subNumber249: details.subNumber249,
        houseSpan: p.spanDegrees,
        startLongitude: p.siderealLongitude,
        endLongitude: endLon,
        details,
      };
    });
  }

  /**
   * Determines which Placidus house an ecliptic longitude falls into
   */
  public static findHouseForLongitude(longitude: number, cusps: KPCuspItem[]): number {
    const norm = KPSubDivisionEngine.normalize(longitude);

    for (let i = 0; i < 12; i++) {
      const current = cusps[i];
      const start = current.startLongitude;
      const end = current.endLongitude;

      if (start < end) {
        if (norm >= start && norm < end) return current.cusp;
      } else {
        // Wraps around 0° Aries
        if (norm >= start || norm < end) return current.cusp;
      }
    }
    return 1;
  }
}
