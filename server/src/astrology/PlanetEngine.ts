/**
 * Planet Engine
 * High-precision celestial mechanics for the Navagrahas:
 * Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
 * Incorporates VSOP87 & ELP-2000 theory via astronomy-engine,
 * true apparent geocentric motions, Lahiri Ayanamsha (Chitra Paksha),
 * retrograde calculation, classical combustion, dignities, and Vedic aspects (Drishti).
 */

import Astronomy from './astronomyBridge.js';
import type * as AstronomyTypes from 'astronomy-engine';
import { getLahiriAyanamsha, normalizeDegrees, toRadians, toDegrees, ZODIAC_SIGNS } from './astronomyMath.js';
import { getNakshatraInfo, NakshatraInfo } from './NakshatraEngine.js';

export type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export type DignityType = 
  | 'Exalted' 
  | 'Moolatrikona' 
  | 'Own Sign' 
  | 'Friend' 
  | 'Neutral' 
  | 'Enemy' 
  | 'Debilitated';

export interface PlanetData {
  name: PlanetName;
  sanskritName: string;
  symbol: string;
  siderealLongitude: number;
  signIndex: number;
  signName: string;
  degreeInSign: number;
  minutes: number;
  seconds: number;
  house: number; // 1-12 relative to Ascendant (Whole Sign)
  speed: number; // deg / day
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: DignityType;
  nakshatra: NakshatraInfo;
  aspectsToHouses: number[]; // houses aspected by this planet
}

export const SANSKRIT_PLANET_NAMES: Record<PlanetName, string> = {
  Sun: 'Surya (सूर्य)',
  Moon: 'Chandra (चन्द्र)',
  Mars: 'Mangala (मंगल)',
  Mercury: 'Budha (बुध)',
  Jupiter: 'Guru (बृहस्पति)',
  Venus: 'Shukra (शुक्र)',
  Saturn: 'Shani (शनि)',
  Rahu: 'Rahu (राहु)',
  Ketu: 'Ketu (केतु)',
};

export const PLANET_SYMBOLS: Record<PlanetName, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

// Classical Combustion Limits (in angular separation degrees from the Sun)
const COMBUSTION_LIMITS: Partial<Record<PlanetName, { normal: number; retro: number }>> = {
  Moon: { normal: 12.0, retro: 12.0 },
  Mars: { normal: 17.0, retro: 17.0 },
  Mercury: { normal: 14.0, retro: 12.0 },
  Jupiter: { normal: 11.0, retro: 11.0 },
  Venus: { normal: 10.0, retro: 8.0 },
  Saturn: { normal: 15.0, retro: 15.0 },
};

// Exaltation (Uchcha) and Debilitation (Neecha) Signs and Degrees
const EXALTATION_SIGNS: Record<PlanetName, { exaltedSign: number; deepDegree: number; debilitatedSign: number }> = {
  Sun: { exaltedSign: 0, deepDegree: 10, debilitatedSign: 6 },     // Aries 10° / Libra 10°
  Moon: { exaltedSign: 1, deepDegree: 3, debilitatedSign: 7 },      // Taurus 3° / Scorpio 3°
  Mars: { exaltedSign: 9, deepDegree: 28, debilitatedSign: 3 },     // Capricorn 28° / Cancer 28°
  Mercury: { exaltedSign: 5, deepDegree: 15, debilitatedSign: 11 }, // Virgo 15° / Pisces 15°
  Jupiter: { exaltedSign: 3, deepDegree: 5, debilitatedSign: 9 },   // Cancer 5° / Capricorn 5°
  Venus: { exaltedSign: 11, deepDegree: 27, debilitatedSign: 5 },   // Pisces 27° / Virgo 27°
  Saturn: { exaltedSign: 6, deepDegree: 20, debilitatedSign: 0 },   // Libra 20° / Aries 20°
  Rahu: { exaltedSign: 1, deepDegree: 20, debilitatedSign: 7 },     // Taurus / Scorpio
  Ketu: { exaltedSign: 7, deepDegree: 20, debilitatedSign: 1 },     // Scorpio / Taurus
};

// Moolatrikona ranges per BPHS
const MOOLATRIKONA_RANGES: Partial<Record<PlanetName, { signIndex: number; startDeg: number; endDeg: number }>> = {
  Sun: { signIndex: 4, startDeg: 0, endDeg: 20 },      // Leo 0-20°
  Moon: { signIndex: 1, startDeg: 3, endDeg: 30 },     // Taurus 3-30°
  Mars: { signIndex: 0, startDeg: 0, endDeg: 12 },     // Aries 0-12°
  Mercury: { signIndex: 5, startDeg: 15, endDeg: 20 }, // Virgo 15-20°
  Jupiter: { signIndex: 8, startDeg: 0, endDeg: 10 },  // Sagittarius 0-10°
  Venus: { signIndex: 6, startDeg: 0, endDeg: 15 },    // Libra 0-15°
  Saturn: { signIndex: 10, startDeg: 0, endDeg: 20 },  // Aquarius 0-20°
};

// Planet Lordship of Signs (0 = Aries, 1 = Taurus, ... 11 = Pisces)
export const SIGN_LORDS: PlanetName[] = [
  'Mars',    // 0 Aries
  'Venus',   // 1 Taurus
  'Mercury', // 2 Gemini
  'Moon',    // 3 Cancer
  'Sun',     // 4 Leo
  'Mercury', // 5 Virgo
  'Venus',   // 6 Libra
  'Mars',    // 7 Scorpio
  'Jupiter', // 8 Sagittarius
  'Saturn',  // 9 Capricorn
  'Saturn',  // 10 Aquarius
  'Jupiter'  // 11 Pisces
];

// Natural friendships according to Parasara
const NATURAL_FRIENDS: Record<PlanetName, PlanetName[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Mercury', 'Venus', 'Saturn'],
  Ketu: ['Mars', 'Venus'],
};

const NATURAL_ENEMIES: Record<PlanetName, PlanetName[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon'],
  Ketu: ['Sun', 'Moon'],
};

/**
 * Calculate Vedic planetary dignity (Exalted, Moolatrikona, Own Sign, Friend, Neutral, Enemy, Debilitated)
 */
export function calculateDignity(planet: PlanetName, signIndex: number, degreeInSign: number): DignityType {
  const exaltInfo = EXALTATION_SIGNS[planet];
  if (signIndex === exaltInfo.exaltedSign) return 'Exalted';
  if (signIndex === exaltInfo.debilitatedSign) return 'Debilitated';

  const moola = MOOLATRIKONA_RANGES[planet];
  if (moola && signIndex === moola.signIndex && degreeInSign >= moola.startDeg && degreeInSign < moola.endDeg) {
    return 'Moolatrikona';
  }

  const lord = SIGN_LORDS[signIndex];
  if (lord === planet) return 'Own Sign';

  if (NATURAL_FRIENDS[planet]?.includes(lord)) return 'Friend';
  if (NATURAL_ENEMIES[planet]?.includes(lord)) return 'Enemy';
  return 'Neutral';
}

/**
 * Compute Vedic planetary aspects (Drishti)
 */
export function getPlanetAspects(planet: PlanetName, house: number): number[] {
  const aspects: number[] = [];
  const addHouse = (offset: number) => {
    aspects.push(((house - 1 + offset) % 12) + 1);
  };

  // All planets aspect 7th house from their location
  addHouse(7);

  // Special aspects per Parashara
  if (planet === 'Mars') {
    addHouse(4);
    addHouse(8);
  } else if (planet === 'Jupiter' || planet === 'Rahu' || planet === 'Ketu') {
    addHouse(5);
    addHouse(9);
  } else if (planet === 'Saturn') {
    addHouse(3);
    addHouse(10);
  }

  return [...new Set(aspects)].sort((a, b) => a - b);
}

/**
 * Compute Apparent Geocentric Tropical Longitude and Speed for Sun, Moon, and 5 True Planets
 */
function getApparentPlanetPosition(name: Exclude<PlanetName, 'Rahu' | 'Ketu'>, time: AstronomyTypes.AstroTime): { lon: number; speed: number } {
  const dt = 0.01; // 14.4 minutes step for speed derivative
  const timeNext = time.AddDays(dt);

  let lon1 = 0;
  let lon2 = 0;

  if (name === 'Sun') {
    const p1 = Astronomy.SunPosition(time);
    const p2 = Astronomy.SunPosition(timeNext);
    lon1 = p1.elon;
    lon2 = p2.elon;
  } else if (name === 'Moon') {
    const m1 = Astronomy.GeoMoon(time);
    const m2 = Astronomy.GeoMoon(timeNext);
    lon1 = Astronomy.Ecliptic(m1).elon;
    lon2 = Astronomy.Ecliptic(m2).elon;
  } else {
    // Mercury, Venus, Mars, Jupiter, Saturn
    const bodyMap: Record<string, AstronomyTypes.Body> = {
      Mercury: Astronomy.Body.Mercury,
      Venus: Astronomy.Body.Venus,
      Mars: Astronomy.Body.Mars,
      Jupiter: Astronomy.Body.Jupiter,
      Saturn: Astronomy.Body.Saturn,
    };
    const body = bodyMap[name];
    const v1 = Astronomy.GeoVector(body, time, true);
    const v2 = Astronomy.GeoVector(body, timeNext, true);
    lon1 = Astronomy.Ecliptic(v1).elon;
    lon2 = Astronomy.Ecliptic(v2).elon;
  }

  let diff = lon2 - lon1;
  if (diff > 180.0) diff -= 360.0;
  if (diff < -180.0) diff += 360.0;
  const speed = diff / dt;

  return { lon: normalizeDegrees(lon1), speed };
}

/**
 * Compute Mean Lunar Nodes (Rahu and Ketu) using IAU theory
 */
function getLunarNodes(time: AstronomyTypes.AstroTime): { rahuLon: number; ketuLon: number; speed: number } {
  const T = time.tt / 36525.0;
  // IAU / Simon & Chapront Mean Ascending Node of the Moon (Rahu)
  let omega = 125.0445550 - 1934.1361849 * T + 0.0020762 * T * T + (T * T * T) / 467410.0 - (T * T * T * T) / 60616000.0;
  omega = normalizeDegrees(omega);
  const ketu = normalizeDegrees(omega + 180.0);
  const speed = -1934.1361849 / 36525.0; // ~ -0.05295 deg/day

  return { rahuLon: omega, ketuLon: ketu, speed };
}

/**
 * Main execution function: calculate all 9 Navagrahas with sub-arcminute celestial precision
 */
export function calculateAllPlanets(jd: number, ascendantLongitude: number): PlanetData[] {
  const ms = (jd - 2440587.5) * 86400000.0;
  const time = Astronomy.MakeTime(new Date(ms));
  const ayanamsha = getLahiriAyanamsha(time);
  const ascSign = Math.floor(ascendantLongitude / 30.0);

  // First compute Sun for combustion baseline
  const sunPos = getApparentPlanetPosition('Sun', time);
  const sunSidereal = normalizeDegrees(sunPos.lon - ayanamsha);

  const { rahuLon, ketuLon, speed: nodeSpeed } = getLunarNodes(time);

  const planetNames: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const results: PlanetData[] = [];

  for (const name of planetNames) {
    let siderealLon: number;
    let speed: number;
    let isRetro: boolean;

    if (name === 'Rahu') {
      siderealLon = normalizeDegrees(rahuLon - ayanamsha);
      speed = nodeSpeed;
      isRetro = true; // Nodes are always retrograde in mean motion
    } else if (name === 'Ketu') {
      siderealLon = normalizeDegrees(ketuLon - ayanamsha);
      speed = nodeSpeed;
      isRetro = true;
    } else {
      const raw = getApparentPlanetPosition(name, time);
      siderealLon = normalizeDegrees(raw.lon - ayanamsha);
      speed = raw.speed;
      isRetro = speed < 0;
    }

    const signIndex = Math.floor(siderealLon / 30.0);
    const signRemainder = siderealLon % 30.0;
    const degInSign = Math.floor(signRemainder);
    const minRemainder = (signRemainder - degInSign) * 60.0;
    const minutes = Math.floor(minRemainder);
    const seconds = Math.floor((minRemainder - minutes) * 60.0);

    // Calculate house (1-12) relative to Ascendant (Whole Sign standard)
    const house = (((signIndex - ascSign + 12) % 12)) + 1;

    // Combustion check against Sun
    let isCombust = false;
    const limitObj = COMBUSTION_LIMITS[name];
    if (limitObj && name !== 'Sun') {
      const limit = isRetro ? limitObj.retro : limitObj.normal;
      let diff = Math.abs(siderealLon - sunSidereal);
      if (diff > 180.0) diff = 360.0 - diff;
      if (diff <= limit) isCombust = true;
    }

    const dignity = calculateDignity(name, signIndex, signRemainder);
    const nakshatra = getNakshatraInfo(siderealLon);
    const aspectsToHouses = getPlanetAspects(name, house);

    results.push({
      name,
      sanskritName: SANSKRIT_PLANET_NAMES[name],
      symbol: PLANET_SYMBOLS[name],
      siderealLongitude: siderealLon,
      signIndex,
      signName: ZODIAC_SIGNS[signIndex],
      degreeInSign: degInSign,
      minutes,
      seconds,
      house,
      speed,
      isRetrograde: isRetro,
      isCombust,
      dignity,
      nakshatra,
      aspectsToHouses,
    });
  }

  return results;
}
