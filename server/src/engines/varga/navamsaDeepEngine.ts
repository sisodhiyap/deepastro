/**
 * Navamsa (D9) Deep Intelligence Engine
 * Comprehensive analysis of D9 (Dharma, Spouse, Soul Potential, Second Half of Life):
 * - D9 Lagna and House placements
 * - Vargottama Planets (identical sign in D1 and D9)
 * - Pushkara Navamsa identification
 * - 7th House, 7th Lord, Venus & Jupiter dignity in D9
 * - Holistic D1 + D9 synthesis
 */

import { PlanetData, SIGN_LORDS } from '../../astrology/PlanetEngine.js';
import { SingleVargaChart, ShodashavargaEngine } from './shodashavargaEngine.js';

export interface PushkaraNavamsaDetail {
  planet: string;
  isPushkara: boolean;
  navamsaSign: string;
  quarterDescription: string;
}

export interface NavamsaDeepAnalysis {
  d9Chart: SingleVargaChart;
  d9AscendantSign: string;
  vargottamaPlanets: string[];
  pushkaraPlanets: PushkaraNavamsaDetail[];
  seventhHouseAnalysis: {
    seventhHouseSign: string;
    seventhLordD9: string;
    occupants: string[];
    venusPlacement: { sign: string; house: number };
    jupiterPlacement: { sign: string; house: number };
  };
  soulDestinyThemes: string[];
  marriageDharmaThemes: string[];
  integratedD1D9Synthesis: string[];
}

export class NavamsaDeepEngine {
  /**
   * Pushkara Navamsa degrees in fire/earth/air/water signs
   * Classical reference:
   * - Fire signs (Aries, Leo, Sag): 7th navamsa (Libra) & 9th navamsa (Sagittarius)
   * - Earth signs (Taurus, Virgo, Cap): 3rd navamsa (Pisces) & 5th navamsa (Taurus)
   * - Air signs (Gemini, Libra, Aqua): 6th navamsa (Pisces) & 8th navamsa (Taurus)
   * - Water signs (Cancer, Scorpio, Pisces): 1st navamsa (Cancer) & 3rd navamsa (Virgo)
   */
  public static checkPushkaraNavamsa(siderealLon: number): boolean {
    const norm = (siderealLon % 360 + 360) % 360;
    const rashiIdx = Math.floor(norm / 30.0);
    const degInRashi = norm % 30.0;
    const navamsaPart = Math.floor(degInRashi / (30.0 / 9.0)); // 0-8

    const element = rashiIdx % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

    if (element === 0) {
      return navamsaPart === 6 || navamsaPart === 8; // 7th and 9th
    } else if (element === 1) {
      return navamsaPart === 2 || navamsaPart === 4; // 3rd and 5th
    } else if (element === 2) {
      return navamsaPart === 5 || navamsaPart === 7; // 6th and 8th
    } else {
      return navamsaPart === 0 || navamsaPart === 2; // 1st and 3rd
    }
  }

  /**
   * Analyzes D9 Navamsa in deep synergy with D1
   */
  public static analyze(params: {
    planets: PlanetData[];
    ascendantLongitude: number;
  }): NavamsaDeepAnalysis {
    const { planets, ascendantLongitude } = params;
    const d9Chart = ShodashavargaEngine.calculateSingleVarga({
      division: 9,
      planets,
      ascendantLongitude,
    });

    const vargottamaPlanets: string[] = [];
    const pushkaraPlanets: PushkaraNavamsaDetail[] = [];

    for (const p of d9Chart.planets) {
      if (p.isVargottama) {
        vargottamaPlanets.push(p.planet);
      }
      const orig = planets.find((op) => op.name === p.planet);
      const isPush = orig ? this.checkPushkaraNavamsa(orig.siderealLongitude) : false;
      pushkaraPlanets.push({
        planet: p.planet,
        isPushkara: isPush,
        navamsaSign: p.signName,
        quarterDescription: isPush ? 'Posited in auspicious Pushkara Navamsa zone' : 'Standard Navamsa',
      });
    }

    // 7th House in D9 (Marriage & Partnership axis)
    const seventhSignIdx = (d9Chart.ascendantSignIndex + 6) % 12;
    const seventhLord = SIGN_LORDS[seventhSignIdx];
    const occupantsSeventh = d9Chart.planets
      .filter((p) => p.houseInVarga === 7)
      .map((p) => p.planet);

    const venus = d9Chart.planets.find((p) => p.planet === 'Venus');
    const jupiter = d9Chart.planets.find((p) => p.planet === 'Jupiter');

    const soulDestinyThemes: string[] = [];
    const marriageDharmaThemes: string[] = [];
    const integratedD1D9Synthesis: string[] = [];

    if (vargottamaPlanets.length > 0) {
      soulDestinyThemes.push(
        `Vargottama Grahas [${vargottamaPlanets.join(', ')}] maintain steady core identity across both physical and subtle planes.`
      );
    }

    const pushkaraGrahas = pushkaraPlanets.filter((p) => p.isPushkara).map((p) => p.planet);
    if (pushkaraGrahas.length > 0) {
      soulDestinyThemes.push(
        `Pushkara Navamsa activation for [${pushkaraGrahas.join(', ')}] grants healing and resilience during difficult periods.`
      );
    }

    marriageDharmaThemes.push(
      `D9 7th house is in ${d9Chart.ascendantSignName}'s opposite sign ruled by ${seventhLord}.`,
      occupantsSeventh.length > 0
        ? `Direct planetary influences in D9 7th house: ${occupantsSeventh.join(', ')}.`
        : `7th house in D9 is unoccupied, guided directly by lord ${seventhLord}.`
    );

    integratedD1D9Synthesis.push(
      `D1 establishes the physical field of experience (Lagna: ${planets[0]?.signName || 'Aries'}), while D9 (${d9Chart.ascendantSignName}) establishes inner satisfaction and marital maturity.`,
      `Venus in D9 H${venus?.houseInVarga || 'N/A'} and Jupiter in D9 H${jupiter?.houseInVarga || 'N/A'} provide key baseline indicators for relationship equilibrium.`
    );

    return {
      d9Chart,
      d9AscendantSign: d9Chart.ascendantSignName,
      vargottamaPlanets,
      pushkaraPlanets,
      seventhHouseAnalysis: {
        seventhHouseSign: d9Chart.planets.find((p) => p.houseInVarga === 7)?.signName || 'Unknown',
        seventhLordD9: seventhLord,
        occupants: occupantsSeventh,
        venusPlacement: { sign: venus?.signName || 'Unknown', house: venus?.houseInVarga || 1 },
        jupiterPlacement: { sign: jupiter?.signName || 'Unknown', house: jupiter?.houseInVarga || 1 },
      },
      soulDestinyThemes,
      marriageDharmaThemes,
      integratedD1D9Synthesis,
    };
  }
}
