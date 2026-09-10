/**
 * Varga Engine — Classical Shodashvarga System
 * Brihat Parashara Hora Shastra (BPHS) verified mathematical calculations for:
 * - D1: Rashi (Physical body & existence)
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
 * - D40: Khavedamsha (Auspicious / inauspicious effects)
 * - D45: Akshavedamsha (General well-being & character)
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
  d40_khavedamsha?: VargaPosition[];
  d45_akshavedamsha?: VargaPosition[];
  d60_shashtiamsha: VargaPosition[];
}

export interface VargaCharts {
  d1_rashi: VargaPosition[];
  d9_navamsa: VargaPosition[];
  d10_dashamsha: VargaPosition[];
}

// ── Classical BPHS Varga Allocation Functions ──────────────────────────────

// D2 Hora (15° halves)
export function getHoraSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const deg = norm % 30.0;
  const isOdd = rashi % 2 === 0; // Aries=0 (odd sign in 1-based indexing)

  if (isOdd) {
    return deg < 15.0 ? 4 : 3; // 0-15° Leo (Sun = 4), 15-30° Cancer (Moon = 3)
  } else {
    return deg < 15.0 ? 3 : 4; // 0-15° Cancer (Moon = 3), 15-30° Leo (Sun = 4)
  }
}

// D3 Drekkana (10° thirds)
export function getDrekkanaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(2, Math.floor((norm % 30.0) / 10.0)); // 0, 1, 2
  return (rashi + part * 4) % 12; // 1st: same, 2nd: 5th sign, 3rd: 9th sign
}

// D4 Chaturthamsha (7.5° quarters)
export function getChaturthamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(3, Math.floor((norm % 30.0) / 7.5)); // 0, 1, 2, 3
  return (rashi + part * 3) % 12; // Kendra progression (1st, 4th, 7th, 10th)
}

// D7 Saptamsha (30/7°)
export function getSaptamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(6, Math.floor((norm % 30.0) / (30.0 / 7.0)));
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? rashi : (rashi + 6) % 12; // Odd: from self, Even: from 7th
  return (start + part) % 12;
}

// D9 Navamsa (3° 20' = 30/9°)
export function getNavamsaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashiIndex = Math.floor(norm / 30.0);
  const degInRashi = norm % 30.0;
  const part = Math.min(8, Math.floor(degInRashi / (30.0 / 9.0))); // 0 to 8

  // Fire signs (Aries, Leo, Sag): start from Aries (0)
  // Earth signs (Taurus, Virgo, Cap): start from Capricorn (9)
  // Air signs (Gemini, Libra, Aqua): start from Libra (6)
  // Water signs (Cancer, Scorpio, Pisces): start from Cancer (3)
  const element = rashiIndex % 4;
  const startSign = [0, 9, 6, 3][element];
  return (startSign + part) % 12;
}

// D10 Dashamsha (3° tenths)
export function getDashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(9, Math.floor((norm % 30.0) / 3.0)); // 0 to 9
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? rashi : (rashi + 8) % 12; // Odd: from self, Even: from 9th
  return (start + part) % 12;
}

// D12 Dwadashamsha (2.5° twelfths)
export function getDwadashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(11, Math.floor((norm % 30.0) / 2.5)); // 0 to 11
  return (rashi + part) % 12; // Starts from self
}

// D16 Shodashamsha (1.875° sixteenths)
export function getShodashamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(15, Math.floor((norm % 30.0) / (30.0 / 16.0)));
  const signType = rashi % 3; // 0 = Movable, 1 = Fixed, 2 = Dual
  const start = signType === 0 ? 0 : signType === 1 ? 4 : 8; // Aries, Leo, Sagittarius
  return (start + part) % 12;
}

// D20 Vimshamsha (1.5° twentieths)
export function getVimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(19, Math.floor((norm % 30.0) / 1.5));
  const signType = rashi % 3; // 0 = Movable, 1 = Fixed, 2 = Dual
  const start = signType === 0 ? 0 : signType === 1 ? 8 : 4; // Aries, Sagittarius, Leo
  return (start + part) % 12;
}

// D24 Chaturvimshamsha (1.25° twenty-fourths)
export function getChaturvimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(23, Math.floor((norm % 30.0) / 1.25));
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? 4 : 3; // Odd: Leo (4), Even: Cancer (3)
  return (start + part) % 12;
}

// D27 Saptavimshamsha (10/9° twenty-sevenths)
export function getSaptavimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(26, Math.floor((norm % 30.0) / (30.0 / 27.0)));
  const element = rashi % 4; // 0 Fire, 1 Earth, 2 Air, 3 Water
  const start = [0, 3, 6, 9][element]; // Aries, Cancer, Libra, Capricorn
  return (start + part) % 12;
}

// D30 Trimshamsha (degrees allocated to 5 planets: Mars, Saturn, Jupiter, Mercury, Venus)
export function getTrimshamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const deg = norm % 30.0;
  const isOdd = rashi % 2 === 0;

  if (isOdd) {
    if (deg < 5.0) return 0;       // 0-5° Mars (Aries)
    if (deg < 10.0) return 10;     // 5-10° Saturn (Aquarius)
    if (deg < 18.0) return 8;      // 10-18° Jupiter (Sagittarius)
    if (deg < 25.0) return 2;      // 18-25° Mercury (Gemini)
    return 6;                      // 25-30° Venus (Libra)
  } else {
    if (deg < 5.0) return 1;       // 0-5° Venus (Taurus)
    if (deg < 12.0) return 5;      // 5-12° Mercury (Virgo)
    if (deg < 20.0) return 11;     // 12-20° Jupiter (Pisces)
    if (deg < 25.0) return 9;      // 20-25° Saturn (Capricorn)
    return 7;                      // 25-30° Mars (Scorpio)
  }
}

// D40 Khavedamsha (0.75° fortieths)
export function getKhavedamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(39, Math.floor((norm % 30.0) / 0.75));
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? 0 : 6; // Odd: Aries (0), Even: Libra (6)
  return (start + part) % 12;
}

// D45 Akshavedamsha (2/3° forty-fifths)
export function getAkshavedamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(44, Math.floor((norm % 30.0) / (30.0 / 45.0)));
  const signType = rashi % 3;
  const start = signType === 0 ? 0 : signType === 1 ? 4 : 8; // Aries, Leo, Sagittarius
  return (start + part) % 12;
}

// D60 Shashtiamsha (0.5° sixtieths)
export function getShashtiamshaSign(longitude: number): number {
  const norm = normalizeDegrees(longitude);
  const rashi = Math.floor(norm / 30.0);
  const part = Math.min(59, Math.floor((norm % 30.0) / 0.5)); // 0 to 59
  const isOdd = rashi % 2 === 0;
  const start = isOdd ? rashi : (rashi + 6) % 12; // Odd: from self, Even: from 7th
  return (start + part) % 12;
}

// Helper to construct a Varga position entry
function makeVargaPosition(planet: PlanetName, signIndex: number, d1Sign: number): VargaPosition {
  return {
    planet,
    signIndex,
    signName: ZODIAC_SIGNS[signIndex],
    vedicSignName: VEDIC_RASHI_NAMES[signIndex],
    isVargottama: signIndex === d1Sign,
  };
}

/**
 * Calculate standard core Vargas (D1, D9, D10)
 */
export function calculateVargas(planets: PlanetData[]): VargaCharts {
  const d1: VargaPosition[] = [];
  const d9: VargaPosition[] = [];
  const d10: VargaPosition[] = [];

  for (const p of planets) {
    const lon = p.siderealLongitude;
    const d1Sign = p.signIndex;
    const d9Sign = getNavamsaSign(lon);
    const d10Sign = getDashamshaSign(lon);

    d1.push(makeVargaPosition(p.name, d1Sign, d1Sign));
    d9.push(makeVargaPosition(p.name, d9Sign, d1Sign));
    d10.push(makeVargaPosition(p.name, d10Sign, d1Sign));
  }

  return { d1_rashi: d1, d9_navamsa: d9, d10_dashamsha: d10 };
}

/**
 * Calculate the complete Shodashvarga (all 16 classical divisional charts)
 */
export function calculateAllVargas(planets: PlanetData[], ascSign?: number): CompleteVargaSet {
  const res: CompleteVargaSet = {
    d1_rashi: [],
    d2_hora: [],
    d3_drekkana: [],
    d4_chaturthamsha: [],
    d7_saptamsha: [],
    d9_navamsa: [],
    d10_dashamsha: [],
    d12_dwadashamsha: [],
    d16_shodashamsha: [],
    d20_vimshamsha: [],
    d24_chaturvimshamsha: [],
    d27_saptavimshamsha: [],
    d30_trimshamsha: [],
    d40_khavedamsha: [],
    d45_akshavedamsha: [],
    d60_shashtiamsha: [],
  };

  for (const p of planets) {
    const lon = p.siderealLongitude;
    const d1Sign = p.signIndex;

    res.d1_rashi.push(makeVargaPosition(p.name, d1Sign, d1Sign));
    res.d2_hora.push(makeVargaPosition(p.name, getHoraSign(lon), d1Sign));
    res.d3_drekkana.push(makeVargaPosition(p.name, getDrekkanaSign(lon), d1Sign));
    res.d4_chaturthamsha.push(makeVargaPosition(p.name, getChaturthamshaSign(lon), d1Sign));
    res.d7_saptamsha.push(makeVargaPosition(p.name, getSaptamshaSign(lon), d1Sign));
    res.d9_navamsa.push(makeVargaPosition(p.name, getNavamsaSign(lon), d1Sign));
    res.d10_dashamsha.push(makeVargaPosition(p.name, getDashamshaSign(lon), d1Sign));
    res.d12_dwadashamsha.push(makeVargaPosition(p.name, getDwadashamshaSign(lon), d1Sign));
    res.d16_shodashamsha.push(makeVargaPosition(p.name, getShodashamshaSign(lon), d1Sign));
    res.d20_vimshamsha.push(makeVargaPosition(p.name, getVimshamshaSign(lon), d1Sign));
    res.d24_chaturvimshamsha.push(makeVargaPosition(p.name, getChaturvimshamshaSign(lon), d1Sign));
    res.d27_saptavimshamsha.push(makeVargaPosition(p.name, getSaptavimshamshaSign(lon), d1Sign));
    res.d30_trimshamsha.push(makeVargaPosition(p.name, getTrimshamshaSign(lon), d1Sign));
    res.d40_khavedamsha?.push(makeVargaPosition(p.name, getKhavedamshaSign(lon), d1Sign));
    res.d45_akshavedamsha?.push(makeVargaPosition(p.name, getAkshavedamshaSign(lon), d1Sign));
    res.d60_shashtiamsha.push(makeVargaPosition(p.name, getShashtiamshaSign(lon), d1Sign));
  }

  return res;
}
