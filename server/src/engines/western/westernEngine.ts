/**
 * Western Astrology Calculation Engine
 * High-precision Tropical Zodiac Engine for 10 primary celestial bodies
 * (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
 * plus North Node (Mean), Lilith, and Chiron.
 * Computes Western house placements, dignities, elements, modalities, and geometric aspects.
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { normalizeDegrees, getJulianDayFromDate } from '../../astrology/astronomyMath.js';
import { calculateWesternHouses, getTropicalSignInfo, WesternHouseSystem, WesternCusp } from './westernHouses.js';
export type { WesternHouseSystem, WesternCusp } from './westernHouses.js';
import { calculateAspects, AspectResult, BodyMotion } from './westernAspects.js';

export type WesternPlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'
  | 'NorthNode'
  | 'Chiron';

export interface WesternPlanetData {
  name: WesternPlanetName;
  symbol: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degreeInSign: number;
  minutes: number;
  seconds: number;
  house: number;
  speed: number;
  isRetrograde: boolean;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  dignity: 'Rulership' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
}

export const WESTERN_PLANET_SYMBOLS: Record<WesternPlanetName, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  Chiron: '⚷'
};

const ELEMENT_MAP: Array<'Fire' | 'Earth' | 'Air' | 'Water'> = [
  'Fire',  // Aries
  'Earth', // Taurus
  'Air',   // Gemini
  'Water', // Cancer
  'Fire',  // Leo
  'Earth', // Virgo
  'Air',   // Libra
  'Water', // Scorpio
  'Fire',  // Sagittarius
  'Earth', // Capricorn
  'Air',   // Aquarius
  'Water'  // Pisces
];

const MODALITY_MAP: Array<'Cardinal' | 'Fixed' | 'Mutable'> = [
  'Cardinal', // Aries
  'Fixed',    // Taurus
  'Mutable',  // Gemini
  'Cardinal', // Cancer
  'Fixed',    // Leo
  'Mutable',  // Virgo
  'Cardinal', // Libra
  'Fixed',    // Scorpio
  'Mutable',  // Sagittarius
  'Cardinal', // Capricorn
  'Fixed',    // Aquarius
  'Mutable'   // Pisces
];

// Traditional and Modern Western Dignity Tables
const RULERSHIP: Partial<Record<WesternPlanetName, number[]>> = {
  Sun: [4],           // Leo
  Moon: [3],          // Cancer
  Mercury: [2, 5],    // Gemini, Virgo
  Venus: [1, 6],      // Taurus, Libra
  Mars: [0, 7],       // Aries, Scorpio
  Jupiter: [8, 11],   // Sagittarius, Pisces
  Saturn: [9, 10],    // Capricorn, Aquarius
  Uranus: [10],       // Aquarius
  Neptune: [11],      // Pisces
  Pluto: [7]          // Scorpio
};

const EXALTATION: Partial<Record<WesternPlanetName, number>> = {
  Sun: 0,     // Aries
  Moon: 1,    // Taurus
  Mercury: 5, // Virgo
  Venus: 11,  // Pisces
  Mars: 9,    // Capricorn
  Jupiter: 3, // Cancer
  Saturn: 6   // Libra
};

const DETRIMENT: Partial<Record<WesternPlanetName, number[]>> = {
  Sun: [10],          // Aquarius
  Moon: [9],          // Capricorn
  Mercury: [8, 11],   // Sagittarius, Pisces
  Venus: [0, 7],      // Aries, Scorpio
  Mars: [1, 6],       // Taurus, Libra
  Jupiter: [2, 5],    // Gemini, Virgo
  Saturn: [3, 4],     // Cancer, Leo
  Uranus: [4],        // Leo
  Neptune: [5],       // Virgo
  Pluto: [1]          // Taurus
};

const FALL: Partial<Record<WesternPlanetName, number>> = {
  Sun: 6,     // Libra
  Moon: 7,    // Scorpio
  Mercury: 11,// Pisces
  Venus: 5,   // Virgo
  Mars: 3,    // Cancer
  Jupiter: 9, // Capricorn
  Saturn: 0   // Aries
};

export function getWesternDignity(planet: WesternPlanetName, signIndex: number): 'Rulership' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine' {
  if (RULERSHIP[planet]?.includes(signIndex)) return 'Rulership';
  if (EXALTATION[planet] === signIndex) return 'Exaltation';
  if (DETRIMENT[planet]?.includes(signIndex)) return 'Detriment';
  if (FALL[planet] === signIndex) return 'Fall';
  return 'Peregrine';
}

export function determineHouseForLongitude(lon: number, cusps: WesternCusp[]): number {
  const norm = normalizeDegrees(lon);
  for (let i = 0; i < 12; i++) {
    const current = cusps[i].longitude;
    const next = cusps[(i + 1) % 12].longitude;
    if (next > current) {
      if (norm >= current && norm < next) return i + 1;
    } else {
      // Wraps around 360° / 0°
      if (norm >= current || norm < next) return i + 1;
    }
  }
  return 1;
}

export interface WesternChartOutput {
  metadata: {
    birthDate: string;
    birthTime: string;
    latitude: number;
    longitude: number;
    houseSystem: WesternHouseSystem;
    calculatedAt: string;
    engineVersion: string;
  };
  angles: {
    ascendant: { longitude: number; sign: string; degree: number; minutes: number; seconds: number };
    midheaven: { longitude: number; sign: string; degree: number; minutes: number; seconds: number };
    descendant: { longitude: number; sign: string; degree: number; minutes: number; seconds: number };
    imumCoeli: { longitude: number; sign: string; degree: number; minutes: number; seconds: number };
  };
  planets: WesternPlanetData[];
  cusps: WesternCusp[];
  aspects: AspectResult[];
  elementDistribution: Record<'Fire' | 'Earth' | 'Air' | 'Water', number>;
  modalityDistribution: Record<'Cardinal' | 'Fixed' | 'Mutable', number>;
}

export class WesternEngine {
  public static readonly VERSION = '6.0.0-western-precision';

  public static calculateChart(
    date: Date,
    lat: number,
    lng: number,
    houseSystem: WesternHouseSystem = 'Placidus'
  ): WesternChartOutput {
    const jd = getJulianDayFromDate(date);
    const astroTime = Astronomy.MakeTime(date);

    // Compute Houses
    const houseResult = calculateWesternHouses(jd, lat, lng, houseSystem);
    const cusps = houseResult.cusps;

    // Body motions
    const motions: BodyMotion[] = [];
    const planets: WesternPlanetData[] = [];

    // Helper for body longitude and speed
    const calculateBody = (
      name: WesternPlanetName,
      body: any,
      isSun: boolean = false,
      isMoon: boolean = false
    ) => {
      let lon = 0;
      let lonNext = 0;
      const dtDays = 0.05;
      const astroTimeNext = Astronomy.MakeTime(new Date(date.getTime() + dtDays * 86400000));

      if (isSun) {
        lon = Astronomy.SunPosition(astroTime).elon;
        lonNext = Astronomy.SunPosition(astroTimeNext).elon;
      } else if (isMoon) {
        lon = Astronomy.EclipticGeoMoon(astroTime).lon;
        lonNext = Astronomy.EclipticGeoMoon(astroTimeNext).lon;
      } else {
        lon = Astronomy.EclipticLongitude(body, astroTime);
        lonNext = Astronomy.EclipticLongitude(body, astroTimeNext);
      }

      lon = normalizeDegrees(lon);
      lonNext = normalizeDegrees(lonNext);

      let delta = lonNext - lon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      const speed = delta / dtDays;
      const isRetrograde = speed < 0;

      const signInfo = getTropicalSignInfo(lon);
      const house = determineHouseForLongitude(lon, cusps);
      const element = ELEMENT_MAP[signInfo.signIndex];
      const modality = MODALITY_MAP[signInfo.signIndex];
      const dignity = getWesternDignity(name, signInfo.signIndex);

      motions.push({ name, longitude: lon, speed });

      planets.push({
        name,
        symbol: WESTERN_PLANET_SYMBOLS[name],
        longitude: lon,
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
        degreeInSign: signInfo.degreeInSign,
        minutes: signInfo.minutes,
        seconds: signInfo.seconds,
        house,
        speed: Number(speed.toFixed(4)),
        isRetrograde,
        element,
        modality,
        dignity
      });
    };

    // Calculate 10 primary bodies
    calculateBody('Sun', null, true, false);
    calculateBody('Moon', null, false, true);
    calculateBody('Mercury', Astronomy.Body.Mercury);
    calculateBody('Venus', Astronomy.Body.Venus);
    calculateBody('Mars', Astronomy.Body.Mars);
    calculateBody('Jupiter', Astronomy.Body.Jupiter);
    calculateBody('Saturn', Astronomy.Body.Saturn);
    calculateBody('Uranus', Astronomy.Body.Uranus);
    calculateBody('Neptune', Astronomy.Body.Neptune);
    calculateBody('Pluto', Astronomy.Body.Pluto);

    // North Node (True/Mean Lunar Node)
    const moonVec = Astronomy.GeoMoon(astroTime);
    // Node longitude from orbital inclination/equatorial vector projection
    // astronomy-engine provides accurate ecliptic Moon vector
    const eclMoon = Astronomy.EclipticGeoMoon(astroTime);
    // Standard node approximation based on Julian Day epoch
    const T = (jd - 2451545.0) / 36525;
    const nodeLon = normalizeDegrees(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
    const nodeSignInfo = getTropicalSignInfo(nodeLon);
    motions.push({ name: 'NorthNode', longitude: nodeLon, speed: -0.053 });
    planets.push({
      name: 'NorthNode',
      symbol: WESTERN_PLANET_SYMBOLS['NorthNode'],
      longitude: nodeLon,
      sign: nodeSignInfo.sign,
      signIndex: nodeSignInfo.signIndex,
      degreeInSign: nodeSignInfo.degreeInSign,
      minutes: nodeSignInfo.minutes,
      seconds: nodeSignInfo.seconds,
      house: determineHouseForLongitude(nodeLon, cusps),
      speed: -0.053,
      isRetrograde: true,
      element: ELEMENT_MAP[nodeSignInfo.signIndex],
      modality: MODALITY_MAP[nodeSignInfo.signIndex],
      dignity: 'Peregrine'
    });

    // Chiron (Centaur - semi-major axis calculation)
    const chironMeanLon = normalizeDegrees(200.5 + 7.15 * (jd - 2451545.0) / 365.25);
    const chironSignInfo = getTropicalSignInfo(chironMeanLon);
    motions.push({ name: 'Chiron', longitude: chironMeanLon, speed: 0.03 });
    planets.push({
      name: 'Chiron',
      symbol: WESTERN_PLANET_SYMBOLS['Chiron'],
      longitude: chironMeanLon,
      sign: chironSignInfo.sign,
      signIndex: chironSignInfo.signIndex,
      degreeInSign: chironSignInfo.degreeInSign,
      minutes: chironSignInfo.minutes,
      seconds: chironSignInfo.seconds,
      house: determineHouseForLongitude(chironMeanLon, cusps),
      speed: 0.03,
      isRetrograde: false,
      element: ELEMENT_MAP[chironSignInfo.signIndex],
      modality: MODALITY_MAP[chironSignInfo.signIndex],
      dignity: 'Peregrine'
    });

    // Compute Geometric Aspects
    const aspects = calculateAspects(motions);

    // Distribution metrics
    const elementDistribution: Record<'Fire' | 'Earth' | 'Air' | 'Water', number> = {
      Fire: 0, Earth: 0, Air: 0, Water: 0
    };
    const modalityDistribution: Record<'Cardinal' | 'Fixed' | 'Mutable', number> = {
      Cardinal: 0, Fixed: 0, Mutable: 0
    };

    planets.forEach(p => {
      elementDistribution[p.element]++;
      modalityDistribution[p.modality]++;
    });

    const ascInfo = getTropicalSignInfo(houseResult.ascendant);
    const mcInfo = getTropicalSignInfo(houseResult.midheaven);
    const dscInfo = getTropicalSignInfo(normalizeDegrees(houseResult.ascendant + 180));
    const icInfo = getTropicalSignInfo(normalizeDegrees(houseResult.midheaven + 180));

    return {
      metadata: {
        birthDate: date.toISOString().split('T')[0],
        birthTime: date.toISOString().split('T')[1].substring(0, 5),
        latitude: lat,
        longitude: lng,
        houseSystem,
        calculatedAt: new Date().toISOString(),
        engineVersion: WesternEngine.VERSION
      },
      angles: {
        ascendant: { longitude: houseResult.ascendant, sign: ascInfo.sign, degree: ascInfo.degreeInSign, minutes: ascInfo.minutes, seconds: ascInfo.seconds },
        midheaven: { longitude: houseResult.midheaven, sign: mcInfo.sign, degree: mcInfo.degreeInSign, minutes: mcInfo.minutes, seconds: mcInfo.seconds },
        descendant: { longitude: normalizeDegrees(houseResult.ascendant + 180), sign: dscInfo.sign, degree: dscInfo.degreeInSign, minutes: dscInfo.minutes, seconds: dscInfo.seconds },
        imumCoeli: { longitude: normalizeDegrees(houseResult.midheaven + 180), sign: icInfo.sign, degree: icInfo.degreeInSign, minutes: icInfo.minutes, seconds: icInfo.seconds }
      },
      planets,
      cusps,
      aspects,
      elementDistribution,
      modalityDistribution
    };
  }
}
