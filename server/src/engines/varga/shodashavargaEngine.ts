/**
 * Shodashavarga Calculation Engine
 * Derives all 16 classical Parashari divisional charts strictly from canonical planetary longitudes
 * and Ascendant longitude:
 * D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60.
 */

import { PlanetData, PlanetName, SIGN_LORDS } from '../../astrology/PlanetEngine.js';
import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES, normalizeDegrees } from '../../astrology/astronomyMath.js';
import {
  getHoraSign,
  getDrekkanaSign,
  getChaturthamshaSign,
  getSaptamshaSign,
  getNavamsaSign,
  getDashamshaSign,
  getDwadashamshaSign,
  getShodashamshaSign,
  getVimshamshaSign,
  getChaturvimshamshaSign,
  getSaptavimshamshaSign,
  getTrimshamshaSign,
  getKhavedamshaSign,
  getAkshavedamshaSign,
  getShashtiamshaSign,
} from '../../astrology/VargaEngine.js';
import { VargaRegistry, VargaDefinition } from './vargaRegistry.js';

export interface VargaPlanetEntry {
  planet: string;
  signIndex: number;
  signName: string;
  vedicSignName: string;
  signLord: string;
  houseInVarga: number;
  isVargottama?: boolean;
}

export interface SingleVargaChart {
  division: number;
  code: string;
  sanskritName: string;
  englishName: string;
  formulaVersion: string;
  domainSignification: string;
  ascendantSignIndex: number;
  ascendantSignName: string;
  planets: VargaPlanetEntry[];
}

export class ShodashavargaEngine {
  /**
   * Calculates the sign index for any degree in any of the 16 Shodashavargas
   */
  public static getVargaSignForDivision(division: number, longitude: number): number {
    switch (division) {
      case 1:
        return Math.floor(normalizeDegrees(longitude) / 30.0);
      case 2:
        return getHoraSign(longitude);
      case 3:
        return getDrekkanaSign(longitude);
      case 4:
        return getChaturthamshaSign(longitude);
      case 7:
        return getSaptamshaSign(longitude);
      case 9:
        return getNavamsaSign(longitude);
      case 10:
        return getDashamshaSign(longitude);
      case 12:
        return getDwadashamshaSign(longitude);
      case 16:
        return getShodashamshaSign(longitude);
      case 20:
        return getVimshamshaSign(longitude);
      case 24:
        return getChaturvimshamshaSign(longitude);
      case 27:
        return getSaptavimshamshaSign(longitude);
      case 30:
        return getTrimshamshaSign(longitude);
      case 40:
        return getKhavedamshaSign(longitude);
      case 45:
        return getAkshavedamshaSign(longitude);
      case 60:
        return getShashtiamshaSign(longitude);
      default:
        // Default harmonics proportional rotation
        const partSpan = 30.0 / division;
        const norm = normalizeDegrees(longitude);
        const rashi = Math.floor(norm / 30.0);
        const part = Math.floor((norm % 30.0) / partSpan);
        return (rashi + part) % 12;
    }
  }

  /**
   * Builds a single complete Varga Chart with Ascendant and House placements
   */
  public static calculateSingleVarga(params: {
    division: number;
    planets: PlanetData[];
    ascendantLongitude: number;
  }): SingleVargaChart {
    const { division, planets, ascendantLongitude } = params;
    const def = VargaRegistry.getDefinition(division);

    const ascSign = this.getVargaSignForDivision(division, ascendantLongitude);
    const d1Signs: Record<string, number> = {};

    for (const p of planets) {
      d1Signs[p.name] = Math.floor(normalizeDegrees(p.siderealLongitude) / 30.0);
    }

    const planetEntries: VargaPlanetEntry[] = planets.map((p) => {
      const vargaSign = this.getVargaSignForDivision(division, p.siderealLongitude);
      const houseInVarga = ((vargaSign - ascSign + 12) % 12) + 1;
      const isVargottama = division === 9 && vargaSign === d1Signs[p.name];

      return {
        planet: p.name,
        signIndex: vargaSign,
        signName: ZODIAC_SIGNS[vargaSign],
        vedicSignName: VEDIC_RASHI_NAMES[vargaSign],
        signLord: SIGN_LORDS[vargaSign],
        houseInVarga,
        isVargottama,
      };
    });

    return {
      division,
      code: def.code,
      sanskritName: def.sanskritName,
      englishName: def.englishName,
      formulaVersion: def.formulaVersion,
      domainSignification: def.domainSignification,
      ascendantSignIndex: ascSign,
      ascendantSignName: ZODIAC_SIGNS[ascSign],
      planets: planetEntries,
    };
  }

  /**
   * Calculates all 16 Shodashavargas
   */
  public static calculateAllShodashavargas(params: {
    planets: PlanetData[];
    ascendantLongitude: number;
  }): Record<string, SingleVargaChart> {
    const shodashDivisions = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];
    const results: Record<string, SingleVargaChart> = {};

    for (const div of shodashDivisions) {
      const chart = this.calculateSingleVarga({
        division: div,
        planets: params.planets,
        ascendantLongitude: params.ascendantLongitude,
      });
      results[chart.code.toLowerCase()] = chart;
    }

    return results;
  }
}
