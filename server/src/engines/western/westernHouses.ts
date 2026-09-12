/**
 * Western House Calculation Engine
 * Calculates tropical house cusps supporting:
 * - Placidus (Semi-arc division)
 * - Whole Sign (Each sign is a full house starting from Ascendant sign)
 * - Equal House (Cusp 1 = Ascendant, each cusp spaced strictly 30 degrees)
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { calculateMidheaven, normalizeDegrees, toRadians, toDegrees, GeoLocation } from '../../astrology/astronomyMath.js';
import { PlacidusEngine, PlacidusCuspResult } from '../kp/placidusEngine.js';

export type WesternHouseSystem = 'Placidus' | 'WholeSign' | 'Equal';

export interface WesternCusp {
  houseNumber: number; // 1 to 12
  longitude: number;   // 0 - 360 tropical degrees
  sign: string;
  signIndex: number;   // 0 - 11
  degreeInSign: number;
  minutes: number;
  seconds: number;
}

export const TROPICAL_ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export function getTropicalSignInfo(deg: number): { sign: string; signIndex: number; degreeInSign: number; minutes: number; seconds: number } {
  const norm = normalizeDegrees(deg);
  const signIndex = Math.floor(norm / 30);
  const degreeInSign = norm % 30;
  const degInt = Math.floor(degreeInSign);
  const totalSeconds = Math.round((degreeInSign - degInt) * 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    sign: TROPICAL_ZODIAC_SIGNS[signIndex],
    signIndex,
    degreeInSign,
    minutes,
    seconds
  };
}

export function calculateTropicalAscendant(jd: number, lat: number, lng: number): number {
  const ms = (jd - 2440587.5) * 86400000.0;
  const time = Astronomy.MakeTime(new Date(ms));
  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = normalizeDegrees(gastHours * 15.0 + lng);
  const ramcRad = toRadians(ramcDeg);
  const latRad = toRadians(lat);
  const tilt = Astronomy.e_tilt(time);
  const epsRad = toRadians(tilt.tobl);
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

export function calculateWesternHouses(
  jd: number,
  lat: number,
  lng: number,
  system: WesternHouseSystem = 'Placidus'
): {
  system: WesternHouseSystem;
  ascendant: number;
  midheaven: number;
  cusps: WesternCusp[];
} {
  const tropicalAsc = calculateTropicalAscendant(jd, lat, lng);
  const geo: GeoLocation = { latitude: lat, longitude: lng, timezone: 0 };
  const { tropicalMC } = calculateMidheaven(jd, geo);

  let cuspsLon: number[] = [];

  if (system === 'WholeSign') {
    const ascSignIndex = Math.floor(tropicalAsc / 30);
    cuspsLon = Array.from({ length: 12 }, (_, i) => {
      const sIdx = (ascSignIndex + i) % 12;
      return sIdx * 30;
    });
  } else if (system === 'Equal') {
    cuspsLon = Array.from({ length: 12 }, (_, i) => {
      return normalizeDegrees(tropicalAsc + i * 30);
    });
  } else {
    // Placidus
    try {
      const placidusCusps = PlacidusEngine.calculateCusps({ jd, latitude: lat, longitude: lng });
      cuspsLon = placidusCusps.map((c: PlacidusCuspResult) => c.tropicalLongitude);
    } catch {
      cuspsLon = Array.from({ length: 12 }, (_, i) => normalizeDegrees(tropicalAsc + i * 30));
    }
  }

  const cusps: WesternCusp[] = cuspsLon.map((lon, idx) => {
    const info = getTropicalSignInfo(lon);
    return {
      houseNumber: idx + 1,
      longitude: lon,
      sign: info.sign,
      signIndex: info.signIndex,
      degreeInSign: info.degreeInSign,
      minutes: info.minutes,
      seconds: info.seconds
    };
  });

  return {
    system,
    ascendant: tropicalAsc,
    midheaven: tropicalMC,
    cusps
  };
}
