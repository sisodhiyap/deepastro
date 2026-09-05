/**
 * Planet Engine
 * Deterministic astronomical positions for the Navagrahas:
 * Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
 * Incorporates sidereal conversion (Lahiri), retrograde calculation,
 * combustion, dignity, and Vedic aspects (Drishti).
 */

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
  house: number; // 1-12 relative to Ascendant
  speed: number; // deg / day
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: DignityType;
  nakshatra: NakshatraInfo;
  aspectsToHouses: number[]; // houses aspected by this planet
}

// Classical Combustion Limits (in degrees from the Sun)
const COMBUSTION_LIMITS: Partial<Record<PlanetName, number>> = {
  Moon: 12.0,
  Mars: 17.0,
  Mercury: 14.0,
  Jupiter: 11.0,
  Venus: 10.0,
  Saturn: 15.0,
};

// Exaltation (Uchcha) and Debilitation (Neecha) Signs
const EXALTATION_SIGNS: Record<PlanetName, { exaltedSign: number; deepDegree: number; debilitatedSign: number }> = {
  Sun: { exaltedSign: 0, deepDegree: 10, debilitatedSign: 6 }, // Aries 10 / Libra 10
  Moon: { exaltedSign: 1, deepDegree: 3, debilitatedSign: 7 },  // Taurus 3 / Scorpio 3
  Mars: { exaltedSign: 9, deepDegree: 28, debilitatedSign: 3 }, // Cap 28 / Cancer 28
  Mercury: { exaltedSign: 5, deepDegree: 15, debilitatedSign: 11 }, // Virgo 15 / Pisces 15
  Jupiter: { exaltedSign: 3, deepDegree: 5, debilitatedSign: 9 },  // Cancer 5 / Cap 5
  Venus: { exaltedSign: 11, deepDegree: 27, debilitatedSign: 5 }, // Pisces 27 / Virgo 27
  Saturn: { exaltedSign: 6, deepDegree: 20, debilitatedSign: 0 }, // Libra 20 / Aries 20
  Rahu: { exaltedSign: 1, deepDegree: 20, debilitatedSign: 7 },  // Taurus / Scorpio
  Ketu: { exaltedSign: 7, deepDegree: 20, debilitatedSign: 1 },  // Scorpio / Taurus
};

// Planet Lordship of Signs (0 = Aries, 1 = Taurus, ... 11 = Pisces)
const SIGN_LORDS: PlanetName[] = [
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

// High-precision Keplerian orbital elements for the J2000 epoch
interface OrbitalElements {
  a0: number; // semi-major axis (AU)
  e0: number; // eccentricity
  i0: number; // inclination (deg)
  L0: number; // mean longitude (deg)
  w0: number; // longitude of perihelion (deg)
  N0: number; // longitude of ascending node (deg)
  // rates per century
  a_dot: number;
  e_dot: number;
  i_dot: number;
  L_dot: number;
  w_dot: number;
  N_dot: number;
}

const ORBITAL_DATA: Record<Exclude<PlanetName, 'Rahu' | 'Ketu'>, OrbitalElements> = {
  Sun: {
    a0: 1.00000261, e0: 0.01671123, i0: 0.00001531, L0: 100.46457166, w0: 102.93768193, N0: 0.0,
    a_dot: 0.00000562, e_dot: -0.00004392, i_dot: -0.01294668, L_dot: 35999.37244981, w_dot: 0.32327364, N_dot: 0.0
  },
  Moon: { // Lunar geocentric approximate orbit
    a0: 0.00257, e0: 0.05490, i0: 5.145, L0: 218.3164477, w0: 83.3532465, N0: 125.0445550,
    a_dot: 0.0, e_dot: 0.0, i_dot: 0.0, L_dot: 481267.88128, w_dot: 4069.0137287, N_dot: -1934.13626197
  },
  Mercury: {
    a0: 0.38709927, e0: 0.20563593, i0: 7.00497902, L0: 252.25032350, w0: 77.45779628, N0: 48.33076593,
    a_dot: 0.00000037, e_dot: 0.00001906, i_dot: -0.00594749, L_dot: 149472.67411175, w_dot: 0.16047687, N_dot: -0.12534081
  },
  Venus: {
    a0: 0.72333566, e0: 0.00677672, i0: 3.39467605, L0: 181.97909950, w0: 131.60246718, N0: 76.67984255,
    a_dot: 0.00000067, e_dot: -0.00004107, i_dot: -0.00078890, L_dot: 58517.81538729, w_dot: 0.00268329, N_dot: -0.27769418
  },
  Mars: {
    a0: 1.52371034, e0: 0.09339410, i0: 1.84969142, L0: -4.55343205, w0: -23.94362959, N0: 49.55953891,
    a_dot: 0.00001847, e_dot: 0.00007882, i_dot: -0.00813131, L_dot: 19140.30268499, w_dot: 0.44441088, N_dot: -0.29257343
  },
  Jupiter: {
    a0: 5.20288700, e0: 0.04838624, i0: 1.30439695, L0: 34.39644051, w0: 14.72847983, N0: 100.47390909,
    a_dot: -0.00011607, e_dot: -0.00013257, i_dot: -0.00183714, L_dot: 3034.74612775, w_dot: 0.21252668, N_dot: 0.20469106
  },
  Saturn: {
    a0: 9.53667594, e0: 0.05386179, i0: 2.48599187, L0: 49.95424423, w0: 92.59887831, N0: 113.66242448,
    a_dot: -0.00125060, e_dot: -0.00050991, i_dot: 0.00193609, L_dot: 1222.49362201, w_dot: -0.41897216, N_dot: -0.28867794
  }
};

// Solve Kepler's equation M = E - e * sin(E)
function solveKepler(M_deg: number, e: number): number {
  const M_rad = toRadians(normalizeDegrees(M_deg));
  let E = M_rad;
  for (let i = 0; i < 15; i++) {
    const dE = (M_rad - (E - e * Math.sin(E))) / (1.0 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return toDegrees(E);
}

// Compute heliocentric/geocentric tropical position and speed
function computeRawPlanetPosition(name: Exclude<PlanetName, 'Rahu' | 'Ketu'>, jd: number): { lon: number; speed: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const el = ORBITAL_DATA[name];

  const a = el.a0 + el.a_dot * T;
  const e = el.e0 + el.e_dot * T;
  const L = el.L0 + el.L_dot * T;
  const w = el.w0 + el.w_dot * T;

  const M = L - w;
  const E = solveKepler(M, e);
  const E_rad = toRadians(E);

  // Heliocentric coordinates in orbital plane
  const x = a * (Math.cos(E_rad) - e);
  const y = a * Math.sqrt(1.0 - e * e) * Math.sin(E_rad);

  const r = Math.sqrt(x * x + y * y);
  const v = toDegrees(Math.atan2(y, x)); // True anomaly
  const trueLon = normalizeDegrees(v + w);

  // Speed approximation (change over 0.5 day)
  const T_next = ((jd + 0.5) - 2451545.0) / 36525.0;
  const L_next = el.L0 + el.L_dot * T_next;
  const M_next = L_next - (el.w0 + el.w_dot * T_next);
  const E_next = solveKepler(M_next, e);
  const v_next = toDegrees(Math.atan2(Math.sin(toRadians(E_next)), Math.cos(toRadians(E_next)) - e));
  const trueLon_next = normalizeDegrees(v_next + (el.w0 + el.w_dot * T_next));
  
  let speed = (trueLon_next - trueLon) * 2;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;

  // Geocentric correction for planets other than Sun & Moon
  if (name !== 'Sun' && name !== 'Moon') {
    const sunEl = ORBITAL_DATA.Sun;
    const sunM = (sunEl.L0 + sunEl.L_dot * T) - (sunEl.w0 + sunEl.w_dot * T);
    const sunE = solveKepler(sunM, sunEl.e0);
    const sunV = toDegrees(Math.atan2(Math.sin(toRadians(sunE)), Math.cos(toRadians(sunE)) - sunEl.e0));
    const sunTrueLon = normalizeDegrees(sunV + sunEl.w0);
    const sunR = sunEl.a0;

    const xPlanet = r * Math.cos(toRadians(trueLon));
    const yPlanet = r * Math.sin(toRadians(trueLon));
    const xSun = sunR * Math.cos(toRadians(sunTrueLon));
    const ySun = sunR * Math.sin(toRadians(sunTrueLon));
    // Vector from Earth to Sun is (xSun, ySun)
    // Vector from Sun to Planet is (xPlanet, yPlanet)
    // By vector addition, Vector from Earth to Planet is (xSun + xPlanet, ySun + yPlanet)
    const xGeo = xSun + xPlanet;
    const yGeo = ySun + yPlanet;
    const geoLon = normalizeDegrees(toDegrees(Math.atan2(yGeo, xGeo)));

    return { lon: geoLon, speed: speed > 0 ? speed : -0.1 };
  }

  return { lon: trueLon, speed };
}

// Compute Rahu and Ketu (Mean Lunar Nodes)
function computeNodes(jd: number): { rahuLon: number; ketuLon: number } {
  const T = (jd - 2451545.0) / 36525.0;
  // Node mean longitude
  let node = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  node = normalizeDegrees(node);
  const ketu = normalizeDegrees(node + 180.0);
  return { rahuLon: node, ketuLon: ketu };
}

// Calculate Vedic planetary dignity
export function calculateDignity(planet: PlanetName, signIndex: number): DignityType {
  const exaltInfo = EXALTATION_SIGNS[planet];
  if (signIndex === exaltInfo.exaltedSign) return 'Exalted';
  if (signIndex === exaltInfo.debilitatedSign) return 'Debilitated';

  const lord = SIGN_LORDS[signIndex];
  if (lord === planet) return 'Own Sign';

  // Natural friendships according to Parasara
  const friends: Record<PlanetName, PlanetName[]> = {
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

  const enemies: Record<PlanetName, PlanetName[]> = {
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

  if (friends[planet]?.includes(lord)) return 'Friend';
  if (enemies[planet]?.includes(lord)) return 'Enemy';
  return 'Neutral';
}

// Compute Vedic aspects (Drishti)
export function getPlanetAspects(planet: PlanetName, currentHouse: number): number[] {
  const aspectHouses = new Set<number>();
  // 7th full aspect for all planets
  aspectHouses.add(((currentHouse + 6 - 1) % 12) + 1);

  // Special Vedic full aspects
  if (planet === 'Mars') {
    aspectHouses.add(((currentHouse + 3 - 1) % 12) + 1); // 4th
    aspectHouses.add(((currentHouse + 7 - 1) % 12) + 1); // 8th
  } else if (planet === 'Jupiter' || planet === 'Rahu' || planet === 'Ketu') {
    aspectHouses.add(((currentHouse + 4 - 1) % 12) + 1); // 5th
    aspectHouses.add(((currentHouse + 8 - 1) % 12) + 1); // 9th
  } else if (planet === 'Saturn') {
    aspectHouses.add(((currentHouse + 2 - 1) % 12) + 1); // 3rd
    aspectHouses.add(((currentHouse + 9 - 1) % 12) + 1); // 10th
  }

  return Array.from(aspectHouses).sort((a, b) => a - b);
}

const SANSKRIT_PLANET_NAMES: Record<PlanetName, string> = {
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

const PLANET_SYMBOLS: Record<PlanetName, string> = {
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

// Main execution function: calculate all 9 planets
export function calculateAllPlanets(jd: number, ascendantLongitude: number): PlanetData[] {
  const ayanamsha = getLahiriAyanamsha(jd);
  const ascSign = Math.floor(ascendantLongitude / 30);

  // First compute Sun for combustion baseline
  const sunRaw = computeRawPlanetPosition('Sun', jd);
  const sunSidereal = normalizeDegrees(sunRaw.lon - ayanamsha);

  const { rahuLon, ketuLon } = computeNodes(jd);

  const planetNames: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const results: PlanetData[] = [];

  for (const name of planetNames) {
    let siderealLon: number;
    let speed = 1.0;
    let isRetro = false;

    if (name === 'Rahu') {
      siderealLon = normalizeDegrees(rahuLon - ayanamsha);
      speed = -0.05; // Nodes always move retrograde in mean motion
      isRetro = true;
    } else if (name === 'Ketu') {
      siderealLon = normalizeDegrees(ketuLon - ayanamsha);
      speed = -0.05;
      isRetro = true;
    } else {
      const raw = computeRawPlanetPosition(name, jd);
      siderealLon = normalizeDegrees(raw.lon - ayanamsha);
      speed = raw.speed;
      isRetro = speed < 0;
    }

    const signIndex = Math.floor(siderealLon / 30);
    const signRemainder = siderealLon % 30;
    const degInSign = Math.floor(signRemainder);
    const minRemainder = (signRemainder - degInSign) * 60;
    const minutes = Math.floor(minRemainder);
    const seconds = Math.floor((minRemainder - minutes) * 60);

    // Calculate house (1-12) relative to Ascendant
    const house = (((signIndex - ascSign + 12) % 12)) + 1;

    // Combustion check against Sun
    let isCombust = false;
    const limit = COMBUSTION_LIMITS[name];
    if (limit && name !== 'Sun') {
      let diff = Math.abs(siderealLon - sunSidereal);
      if (diff > 180) diff = 360 - diff;
      if (diff <= limit) isCombust = true;
    }

    const dignity = calculateDignity(name, signIndex);
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
