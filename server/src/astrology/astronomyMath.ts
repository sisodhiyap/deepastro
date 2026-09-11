/**
 * DeepAstro Astronomical Calculation Engine
 * High-precision sidereal planetary calculations using Lahiri Ayanamsha (Chitra Paksha).
 * Powered by VSOP87 planetary theory & ELP-2000/82 lunar theory via astronomy-engine.
 */

import Astronomy from './astronomyBridge.js';
import type * as AstronomyTypes from 'astronomy-engine';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  timezone: number; // UTC offset in hours e.g. +5.5 for IST
}

export interface BirthTimeInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;  // 0-23
  minute: number;// 0-59
  second?: number;
}

/**
 * Normalizes an angle in degrees to [0, 360)
 */
export function normalizeDegrees(deg: number): number {
  let d = deg % 360.0;
  if (d < 0) d += 360.0;
  return Math.abs(d) < 1e-12 ? 0 : d;
}

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

export function toDegrees(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

/**
 * Convert local birth date & time to a UTC Date object using the exact tzOffsetHours
 */
export function getUtcDateFromLocal(input: BirthTimeInput, tzOffsetHours: number): Date {
  const { year, month, day, hour, minute } = input;
  const second = input.second || 0;
  // Compute total UTC milliseconds
  const localUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMs = Math.round(tzOffsetHours * 3600 * 1000);
  return new Date(localUtcMs - offsetMs);
}

/**
 * Convert Gregorian Date to Julian Day Number (Universal Time, UT1 / UTC)
 * Mathematically rigorous: safe against month/year rollovers.
 */
export function getJulianDay(input: BirthTimeInput, tzOffsetHours: number): number {
  const utcDate = getUtcDateFromLocal(input, tzOffsetHours);
  return getJulianDayFromDate(utcDate);
}

/**
 * Compute Julian Day directly from a UTC Date object
 */
export function getJulianDayFromDate(utcDate: Date): number {
  // Epoch for JD: 2000-01-01 12:00:00 UTC = JD 2451545.0
  const ms = utcDate.getTime();
  const jd = 2440587.5 + ms / 86400000.0;
  return jd;
}

/**
 * Create an Astronomy.AstroTime from a UTC Date
 */
export function makeAstroTime(utcDate: Date): AstronomyTypes.AstroTime {
  return Astronomy.MakeTime(utcDate);
}

/**
 * High-Precision Lahiri Ayanamsha (Chitra Paksha).
 * Calibrated so Spica (Alpha Virginis / Chitra Nakshatra) is at exact sidereal 180°00'00".
 * Uses IAU 2006 precession model and IAU nutation in longitude.
 *
 * J2000.0 (2000-01-01 12:00:00 TT) Mean Lahiri = 23° 51' 25.533" = 23.8570925°
 */
export function getLahiriAyanamsha(jdOrTime: number | AstronomyTypes.AstroTime): number {
  let time: AstronomyTypes.AstroTime;
  if (typeof jdOrTime === 'number') {
    // Convert JD to Date
    const ms = (jdOrTime - 2440587.5) * 86400000.0;
    time = Astronomy.MakeTime(new Date(ms));
  } else {
    time = jdOrTime;
  }

  // T in Julian centuries from J2000.0 TT
  const T = time.tt / 36525.0;

  // IAU 2006 general precession in longitude (in degrees)
  const p = (5028.796195 * T + 1.1054348 * T * T + 0.0000769 * T * T * T) / 3600.0;

  // Mean Lahiri ayanamsha at J2000: 23° 51' 25.533"
  const meanAyanamsha = (23 + 51 / 60 + 25.533 / 3600) + p;

  // Nutation in longitude (dpsi is in arcseconds from astronomy-engine)
  const tilt = Astronomy.e_tilt(time);
  const dpsiDeg = tilt.dpsi / 3600.0;

  // True Lahiri Ayanamsha incorporates nutation:
  // Apparent Tropical Longitude - True Ayanamsha = Sidereal Longitude (Mean Equator of Date)
  const trueAyanamsha = meanAyanamsha + dpsiDeg * Math.cos(toRadians(tilt.tobl));

  return trueAyanamsha;
}

/**
 * Greenwich Mean Sidereal Time (GMST) in degrees
 */
export function getGMST(jd: number): number {
  const ms = (jd - 2440587.5) * 86400000.0;
  const time = Astronomy.MakeTime(new Date(ms));
  // Greenwich Apparent Sidereal Time in hours -> degrees
  const gastHours = Astronomy.SiderealTime(time);
  return normalizeDegrees(gastHours * 15.0);
}

/**
 * Local Apparent Sidereal Time (LST / RAMC) in degrees
 */
export function getLST(jd: number, longitude: number): number {
  const gmst = getGMST(jd);
  return normalizeDegrees(gmst + longitude);
}

/**
 * Topocentric Ascendant (Lagna) and Midheaven (MC) in Sidereal degrees (Lahiri).
 * Computes exact Local Apparent Sidereal Time (RAMC) and true obliquity.
 */
export function calculateAscendant(jd: number, geo: GeoLocation): number {
  const ms = (jd - 2440587.5) * 86400000.0;
  const time = Astronomy.MakeTime(new Date(ms));

  // GAST in hours -> degrees
  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = normalizeDegrees(gastHours * 15.0 + geo.longitude);
  const ramcRad = toRadians(ramcDeg);
  const latRad = toRadians(geo.latitude);

  // True obliquity of date
  const tilt = Astronomy.e_tilt(time);
  const epsRad = toRadians(tilt.tobl);

  // Exact Ascendant formula:
  // tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  let tropicalAsc = toDegrees(Math.atan2(y, x));
  tropicalAsc = normalizeDegrees(tropicalAsc);

  // Apply True Lahiri Ayanamsha
  const ayanamsha = getLahiriAyanamsha(time);
  const siderealAsc = normalizeDegrees(tropicalAsc - ayanamsha);

  return siderealAsc;
}

/**
 * Calculate Tropical and Sidereal Midheaven (MC)
 */
export function calculateMidheaven(jd: number, geo: GeoLocation): { tropicalMC: number; siderealMC: number } {
  const ms = (jd - 2440587.5) * 86400000.0;
  const time = Astronomy.MakeTime(new Date(ms));

  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = normalizeDegrees(gastHours * 15.0 + geo.longitude);
  const ramcRad = toRadians(ramcDeg);

  const tilt = Astronomy.e_tilt(time);
  const epsRad = toRadians(tilt.tobl);

  let tropicalMC = toDegrees(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)));
  tropicalMC = normalizeDegrees(tropicalMC);

  const ayanamsha = getLahiriAyanamsha(time);
  const siderealMC = normalizeDegrees(tropicalMC - ayanamsha);

  return { tropicalMC, siderealMC };
}

// Convert decimal degrees to Sign, Degree, Minute, Second
export interface DegreeDetails {
  signIndex: number; // 0 = Aries, 1 = Taurus, ... 11 = Pisces
  signName: string;
  degreeInSign: number;
  minutes: number;
  seconds: number;
  totalDegrees: number;
}

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const VEDIC_RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrishchika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

export function getDegreeDetails(totalDeg: number): DegreeDetails {
  const norm = normalizeDegrees(totalDeg);
  const signIndex = Math.floor(norm / 30.0);
  const signRemainder = norm % 30.0;
  const deg = Math.floor(signRemainder);
  const minRemainder = (signRemainder - deg) * 60.0;
  const minutes = Math.floor(minRemainder);
  const seconds = Math.floor((minRemainder - minutes) * 60.0);

  return {
    signIndex,
    signName: ZODIAC_SIGNS[signIndex],
    degreeInSign: deg,
    minutes,
    seconds,
    totalDegrees: norm,
  };
}
