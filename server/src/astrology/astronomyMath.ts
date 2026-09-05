/**
 * DeepAstro Astronomical Calculation Engine
 * High-precision sidereal planetary calculations using Lahiri Ayanamsha (Chitra Paksha).
 * Computes Julian Day, Local Sidereal Time, Ecliptic coordinates, and Ascendant (Lagna).
 */

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

// Convert Gregorian Date to Julian Day Number (UT)
export function getJulianDay(input: BirthTimeInput, tzOffsetHours: number): number {
  let { year, month, day, hour, minute } = input;
  const second = input.second || 0;

  // Convert local time to UTC decimal hours
  const localDecimalHours = hour + minute / 60.0 + second / 3600.0;
  let utcDecimalHours = localDecimalHours - tzOffsetHours;

  if (utcDecimalHours < 0) {
    utcDecimalHours += 24.0;
    day -= 1;
  } else if (utcDecimalHours >= 24.0) {
    utcDecimalHours -= 24.0;
    day += 1;
  }

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5 +
             (utcDecimalHours / 24.0);

  return JD;
}

// Lahiri Ayanamsha calculation (standard Vedic sidereal reference, ~23°51' at 2000)
export function getLahiriAyanamsha(jd: number): number {
  // Epoch J2000.0 is JD 2451545.0
  const T = (jd - 2451545.0) / 36525.0;
  // Precise Lahiri polynomial formula
  const ayanamsha = 23.85805 + 1.396042 * T + 0.000308 * (T * T);
  return ayanamsha;
}

// Greenwhich Mean Sidereal Time (GMST) in degrees
export function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = normalizeDegrees(gmst);
  return gmst;
}

// Local Sidereal Time (LST) in degrees
export function getLST(jd: number, longitude: number): number {
  const gmst = getGMST(jd);
  return normalizeDegrees(gmst + longitude);
}

// Calculate Ascendant (Lagna) in tropical degrees, then convert to sidereal
export function calculateAscendant(jd: number, geo: GeoLocation): number {
  const lstDeg = getLST(jd, geo.longitude);
  const lstRad = toRadians(lstDeg);
  const latRad = toRadians(geo.latitude);

  // Mean obliquity of ecliptic (eps)
  const T = (jd - 2451545.0) / 36525.0;
  const epsDeg = 23.439291 - 0.0130042 * T;
  const epsRad = toRadians(epsDeg);

  // Ascendant formula: tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(lat)*sin(eps))
  const sinLst = Math.sin(lstRad);
  const cosLst = Math.cos(lstRad);
  const sinEps = Math.sin(epsRad);
  const cosEps = Math.cos(epsRad);
  const tanLat = Math.tan(latRad);

  const y = -cosLst;
  const x = sinLst * cosEps + tanLat * sinEps;
  let tropicalAsc = toDegrees(Math.atan2(y, x));
  tropicalAsc = normalizeDegrees(tropicalAsc);

  // Apply Lahiri Ayanamsha to obtain Sidereal Lagna (Nirayana)
  const ayanamsha = getLahiriAyanamsha(jd);
  const siderealAsc = normalizeDegrees(tropicalAsc - ayanamsha);

  return siderealAsc;
}

// Utility angle transformations
export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

export function toDegrees(rad: number): number {
  return (rad * 180.0) / Math.PI;
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
  const signIndex = Math.floor(norm / 30);
  const signRemainder = norm % 30;
  const deg = Math.floor(signRemainder);
  const minRemainder = (signRemainder - deg) * 60;
  const minutes = Math.floor(minRemainder);
  const seconds = Math.floor((minRemainder - minutes) * 60);

  return {
    signIndex,
    signName: ZODIAC_SIGNS[signIndex],
    degreeInSign: deg,
    minutes,
    seconds,
    totalDegrees: norm,
  };
}
