/**
 * KP Planetary Table Engine
 * Computes canonical KP attributes for the 9 traditional Grahas:
 * Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.
 */

import { PlanetData } from '../../astrology/PlanetEngine.js';
import { KPCuspItem, KPCuspEngine } from './kpCuspEngine.js';
import { KPSubDivisionEngine, SubDivisionDetails } from './kpSubDivision.js';
import { KPAyanamsaEngine } from './kpAyanamsa.js';
import { KPAyanamsaType } from './kpConfig.js';

export interface KPPlanetRow {
  planet: string;
  siderealLongitude: number;
  sign: string;
  signIndex: number;
  degreeInSign: number;
  minutes: number;
  seconds: number;
  formattedDegree: string;
  houseOccupied: number;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  starLord: string;
  subLord: string;
  subSubLord: string;
  subSubSubLord: string;
  subNumber249: number;
  isRetrograde: boolean;
  signLord: string;
  housesOwned: number[];
  details: SubDivisionDetails;
}

export class KPPlanetaryTableEngine {
  /**
   * Generates the comprehensive KP planetary table
   */
  public static calculateTable(params: {
    planets: PlanetData[];
    cusps: KPCuspItem[];
    jd: number;
    ayanamsaType?: KPAyanamsaType;
  }): KPPlanetRow[] {
    const { planets, cusps, jd, ayanamsaType = 'KP_NEW' } = params;

    return planets.map((p) => {
      // If planet is computed in Lahiri, convert to KP Sidereal
      // p.siderealLongitude is Lahiri; difference with KP New is ~0.09823333°
      const kpLon = ayanamsaType === 'KP_NEW'
        ? KPSubDivisionEngine.normalize(p.siderealLongitude + KPAyanamsaEngine.KP_NEW_OFFSET_DEG)
        : ayanamsaType === 'KP_ORIGINAL'
        ? KPSubDivisionEngine.normalize(p.siderealLongitude + KPAyanamsaEngine.KP_ORIGINAL_OFFSET_DEG)
        : p.siderealLongitude;

      const details = KPSubDivisionEngine.resolveDetails(kpLon);
      const houseOccupied = KPCuspEngine.findHouseForLongitude(kpLon, cusps);

      // Find houses owned: where this planet is the sign lord of the cusp
      const housesOwned = cusps
        .filter((c) => c.signLord.toLowerCase() === p.name.toLowerCase())
        .map((c) => c.cusp);

      const signRem = details.degInSign;
      const deg = Math.floor(signRem);
      const minRem = (signRem - deg) * 60.0;
      const mins = Math.floor(minRem);
      const secs = Math.floor((minRem - mins) * 60.0);
      const formatted = `${deg}° ${mins.toString().padStart(2, '0')}' ${secs.toString().padStart(2, '0')}"`;

      return {
        planet: p.name,
        siderealLongitude: kpLon,
        sign: details.signName,
        signIndex: details.signIndex,
        degreeInSign: deg,
        minutes: mins,
        seconds: secs,
        formattedDegree: formatted,
        houseOccupied,
        nakshatra: details.nakshatraName,
        nakshatraNumber: details.nakshatraNumber,
        pada: details.pada,
        starLord: details.starLord,
        subLord: details.subLord,
        subSubLord: details.subSubLord,
        subSubSubLord: details.subSubSubLord,
        subNumber249: details.subNumber249,
        isRetrograde: Boolean(p.isRetrograde),
        signLord: details.signLord,
        housesOwned,
        details,
      };
    });
  }
}
