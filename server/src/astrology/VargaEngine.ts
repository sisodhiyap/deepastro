/**
 * Varga Engine — Classical Shodashvarga System
 * Brihat Parashara Hora Shastra (BPHS) verified mathematical calculations for:
 * - D1: Rashi (Physical existence)
 * - D2: Hora (Wealth & Prosperity)
 * - D3: Drekkana (Siblings, Courage, Energy)
 * - D4: Chaturthamsha (Fortune, Property, Home)
 * - D7: Saptamsha (Children, Progeny)
 * - D9: Navamsa (Dharma, Soul, Spouse, Destiny)
 * - D10: Dashamsha (Career, Profession, Karma)
 * - D12: Dwadashamsha (Parents, Ancestry)
 * - D16: Shodashamsha (Vehicles, Happiness, Conveyances)
 * - D20: Vimshamsha (Spiritual progress, Upasana)
 * - D24: Chaturvimshamsha (Higher learning, Knowledge, Intellect)
 * - D27: Saptavimshamsha (Strengths & Weaknesses)
 * - D30: Trimshamsha (Misfortunes, Evils, Health challenges)
 * - D60: Shashtiamsha (Past karma, Root destiny, Micro-differentiation)
 */

import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES, normalizeDegrees } from './astronomyMath.js';
import { PlanetData, PlanetName } from './PlanetEngine.js';

export interface VargaPosition {
  planet: PlanetName;
  signIndex: number;
  signName: string;
  vedicSignName: string;
  house?: number;
  isVargottama?: boolean;
}

export interface CompleteVargaSet {
  d1_rashi: VargaPosition[];
  d2_hora: VargaPosition[];
  d3_drekkana: VargaPosition[];
  d4_chaturthamsha: VargaPosition[];
  d7_saptamsha: VargaPosition[];
  d9_navamsa: VargaPosition[];
  d10_dashamsha: VargaPosition[];
  d12_dwadashamsha: VargaPosition[];
  d16_shodashamsha: VargaPosition[];
  d20_vimshamsha: VargaPosition[];
  d24_chaturvimshamsha: VargaPosition[];
  d27_saptavimshamsha: VargaPosition[];
  d30_trimshamsha: VargaPosition[];
  d60_shashtiamsha: VargaPosition[];
}

// Backward compatible interface
export interface VargaCharts {
  d1_rashi: VargaPosition[];
  d9_navamsa: VargaPosition[];
  d10_dashamsha: VargaPosition[];
}

// D2 Hora (15° halves)
export function getHoraSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const deg = norm % 30;
  const isOdd = rashi % 2 === 0; // Aries=0 (odd sign in 1-based indexing)

  if (isOdd) {
    return deg < 15 ? 4 : 3; // 0-15° Leo (Sun = 4), 15-30° Cancer (Moon = 3)
  } else {
    return deg < 15 ? 3 : 4; // 0-15° Cancer (Moon = 3), 15-30° Leo (Sun = 4)
  }
}

// D3 Drekkana (10° thirds)
export function getDrekkanaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 10); // 0, 1, 2
  return (rashi + part * 4) % 12; // 1st: same, 2nd: 5th sign, 3rd: 9th sign
}

// D4 Chaturthamsha (7.5° quarters)
export function getChaturthamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 7.5); // 0, 1, 2, 3
  return (rashi + part * 3) % 12; // Kendra progression (1st, 4th, 7th, 10th)
}

// D7 Saptamsha (30/7°)
export function getSaptamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / (30.0 / 7.0));
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? rashi : (rashi + 6) % 12; // Odd: from self, Even: from 7th
  return (start + part) % 12;
}

// D9 Navamsa (3° 20' = 30/9°)
export function getNavamsaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashiIndex = Math.floor(norm / 30);
  const degInRashi = norm % 30;
  const navamsaPart = Math.floor(degInRashi / (30.0 / 9.0));

  let startSign = 0;
  const elementGroup = rashiIndex % 4;
  if (elementGroup === 0) startSign = 0;       // Fire -> Aries
  else if (elementGroup === 1) startSign = 9;  // Earth -> Capricorn
  else if (elementGroup === 2) startSign = 6;  // Air -> Libra
  else startSign = 3;                         // Water -> Cancer

  return (startSign + navamsaPart) % 12;
}

// D10 Dashamsha (3° = 30/10°)
export function getDashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashiIndex = Math.floor(norm / 30);
  const degInRashi = norm % 30;
  const dashamshaPart = Math.floor(degInRashi / 3.0);

  const isOddSign = rashiIndex % 2 === 0;
  const startSign = isOddSign ? rashiIndex : (rashiIndex + 8) % 12; // Odd: self, Even: 9th
  return (startSign + dashamshaPart) % 12;
}

// D12 Dwadashamsha (2.5° = 30/12°)
export function getDwadashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 2.5);
  return (rashi + part) % 12;
}

// D16 Shodashamsha (1.875° = 30/16°)
export function getShodashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 1.875);
  const modality = rashi % 3; // 0=Movable (Aries), 1=Fixed (Taurus), 2=Dual (Gemini)
  const start = modality === 0 ? 0 : modality === 1 ? 4 : 8; // Movable: Aries(0), Fixed: Leo(4), Dual: Sag(8)
  return (start + part) % 12;
}

// D20 Vimshamsha (1.5° = 30/20°)
export function getVimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 1.5);
  const modality = rashi % 3;
  const start = modality === 0 ? 0 : modality === 1 ? 8 : 4; // Movable: Aries(0), Fixed: Sag(8), Dual: Leo(4)
  return (start + part) % 12;
}

// D24 Chaturvimshamsha (1.25° = 30/24°)
export function getChaturvimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 1.25);
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? 4 : 3; // Odd: Leo(4), Even: Cancer(3)
  return (start + part) % 12;
}

// D27 Saptavimshamsha (30/27°)
export function getSaptavimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / (30.0 / 27.0));
  const element = rashi % 4;
  const start = element === 0 ? 0 : element === 1 ? 3 : element === 2 ? 6 : 9; // Fire:0, Earth:3, Air:6, Water:9
  return (start + part) % 12;
}

// D30 Trimshamsha (Evils/Health challenges)
export function getTrimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const deg = norm % 30;
  const isOdd = rashi % 2 === 0;

  if (isOdd) {
    if (deg < 5) return 0;   // 0-5° Mars (Aries = 0)
    if (deg < 10) return 10; // 5-10° Saturn (Aquarius = 10)
    if (deg < 18) return 8;  // 10-18° Jupiter (Sagittarius = 8)
    if (deg < 25) return 2;  // 18-25° Mercury (Gemini = 2)
    return 6;                // 25-30° Venus (Libra = 6)
  } else {
    if (deg < 5) return 1;   // 0-5° Venus (Taurus = 1)
    if (deg < 12) return 5;  // 5-12° Mercury (Virgo = 5)
    if (deg < 20) return 11; // 12-20° Jupiter (Pisces = 11)
    if (deg < 25) return 9;  // 20-25° Saturn (Capricorn = 9)
    return 7;                // 25-30° Mars (Scorpio = 7)
  }
}

// D60 Shashtiamsha (0.5° = 30/60°)
export function getShashtiamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30);
  const part = Math.floor((norm % 30) / 0.5); // 0 to 59
  return (rashi + part) % 12;
}

/**
 * Calculates complete Shodashvarga set for all planets
 */
export function calculateAllVargas(planets: PlanetData[], ascSignIndex = 0): CompleteVargaSet {
  const buildList = (getSignFn: (long: number) => number, isD9 = false) => {
    return planets.map((p) => {
      const sIndex = getSignFn(p.siderealLongitude);
      const isVargottama = isD9 && p.signIndex === sIndex;
      const house = ((sIndex - ascSignIndex + 12) % 12) + 1;
      return {
        planet: p.name,
        signIndex: sIndex,
        signName: ZODIAC_SIGNS[sIndex],
        vedicSignName: VEDIC_RASHI_NAMES[sIndex],
        house,
        isVargottama,
      };
    });
  };

  return {
    d1_rashi: planets.map(p => ({
      planet: p.name,
      signIndex: p.signIndex,
      signName: ZODIAC_SIGNS[p.signIndex],
      vedicSignName: VEDIC_RASHI_NAMES[p.signIndex],
      house: p.house,
    })),
    d2_hora: buildList(getHoraSign),
    d3_drekkana: buildList(getDrekkanaSign),
    d4_chaturthamsha: buildList(getChaturthamshaSign),
    d7_saptamsha: buildList(getSaptamshaSign),
    d9_navamsa: buildList(getNavamsaSign, true),
    d10_dashamsha: buildList(getDashamshaSign),
    d12_dwadashamsha: buildList(getDwadashamshaSign),
    d16_shodashamsha: buildList(getShodashamshaSign),
    d20_vimshamsha: buildList(getVimshamshaSign),
    d24_chaturvimshamsha: buildList(getChaturvimshamshaSign),
    d27_saptavimshamsha: buildList(getSaptavimshamshaSign),
    d30_trimshamsha: buildList(getTrimshamshaSign),
    d60_shashtiamsha: buildList(getShashtiamshaSign),
  };
}

// Backward-compatible calculateVargas wrapper
export function calculateVargas(planets: PlanetData[]): VargaCharts {
  const all = calculateAllVargas(planets);
  return {
    d1_rashi: all.d1_rashi,
    d9_navamsa: all.d9_navamsa,
    d10_dashamsha: all.d10_dashamsha,
  };
}
