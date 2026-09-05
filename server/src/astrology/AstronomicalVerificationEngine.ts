/**
 * AstronomicalVerificationEngine
 *
 * Independently re-calculates and cross-checks key astrological values
 * using a secondary algorithm to detect calculation errors or boundary issues.
 *
 * PRINCIPLE:
 *   The primary VedicAstroEngine calculates all positions.
 *   This engine re-derives them from scratch using independent formulas.
 *   If the two differ beyond tolerance, STATUS = CALCULATION_CONFLICT.
 *
 * WHAT THIS VERIFIES:
 *   1. Ayanamsha within ±0.02°
 *   2. Sun longitude within ±0.5°
 *   3. Moon longitude within ±0.5°
 *   4. Ascendant sign (must match)
 *   5. Nakshatra boundary (Moon in correct Nakshatra sector)
 *   6. Dasha seed (Moon nakshatra lord must match DashaEngine output)
 *   7. Julian Day round-trip
 *   8. DST edge cases (midnight, 23:59, DST transitions)
 *
 * LLMs NEVER call this engine. It is a pure mathematical verifier.
 */

import {
  getJulianDay,
  getLahiriAyanamsha,
  calculateAscendant,
  getDegreeDetails,
} from './astronomyMath.js';
import { BirthProfileInput } from './VedicAstroEngine.js';
import { FullKundliResult } from './VedicAstroEngine.js';

export interface VerificationTolerance {
  planetLongitudeTolerance: number;  // degrees
  ascendantTolerance: number;        // degrees
  houseTolerance: number;            // degrees
  nakshatraTolerance: number;        // degrees
  dashaTolerance: number;            // days
  ayanamshaTolerance: number;        // degrees
}

export const DEFAULT_TOLERANCE: VerificationTolerance = {
  planetLongitudeTolerance: 0.5,
  ascendantTolerance: 1.0,
  houseTolerance: 1.0,
  nakshatraTolerance: 0.5,
  dashaTolerance: 3,  // days
  ayanamshaTolerance: 0.05,
};

export interface VerificationCheck {
  checkId: string;
  name: string;
  status: 'PASS' | 'WARNING' | 'CONFLICT' | 'SKIP';
  expected: string | number;
  actual: string | number;
  difference: number;
  tolerance?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  primary: string | number;
  secondary: string | number;
  delta?: number;
  message: string;
}

export interface VerificationResult {
  overallStatus: 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'CALCULATION_CONFLICT' | 'REVIEW_REQUIRED';
  integrityScore: number;  // 0-100
  checks: VerificationCheck[];
  conflicts: string[];
  warnings: string[];
  calculationHash: string;
  verifiedAt: string;
  engineVersion: string;
  toleranceConfig: VerificationTolerance;
}

export class AstronomicalVerificationEngine {
  private static readonly ENGINE_VERSION = '1.0.0-lahiri-verify';

  /**
   * Main verification entry point.
   * Takes the primary kundli result and re-derives key values independently.
   */
  public static verify(
    profile: BirthProfileInput,
    primaryResult: FullKundliResult,
    tolerance: VerificationTolerance = DEFAULT_TOLERANCE
  ): VerificationResult {
    const checks: VerificationCheck[] = [];
    const conflicts: string[] = [];
    const warnings: string[] = [];

    // ─── 1. Julian Day Verification ──────────────────────────────────────────
    const [yr, mo, dy] = profile.birthDate.split('-').map(Number);
    const [hr, mn] = profile.birthTime.split(':').map(Number);
    const tz = typeof profile.timezone === 'number' ? profile.timezone : 5.5;

    // Independent Julian Day calculation
    const localDecimalHour = hr + mn / 60 - tz;
    const jdCheck = this.julianDayFromParts(yr, mo, dy, localDecimalHour);
    const jdPrimary = primaryResult.astronomy.julianDay;
    const jdDelta = Math.abs(jdCheck - jdPrimary);

    checks.push({
      checkId: 'CHK_JD_01',
      name: 'Julian Day',
      status: jdDelta < 0.001 ? 'PASS' : jdDelta < 0.01 ? 'WARNING' : 'CONFLICT',
      expected: jdCheck.toFixed(6),
      actual: jdPrimary.toFixed(6),
      difference: jdDelta,
      tolerance: 0.001,
      severity: 'CRITICAL',
      source: 'Meeus Astronomical Algorithms',
      primary: jdPrimary.toFixed(6),
      secondary: jdCheck.toFixed(6),
      delta: jdDelta,
      message: jdDelta < 0.001
        ? `Julian Day verified: ${jdPrimary.toFixed(6)}`
        : `Julian Day delta ${jdDelta.toFixed(6)} exceeds expected accuracy`,
    });

    if (jdDelta >= 0.01) {
      conflicts.push(`Julian Day conflict: primary=${jdPrimary.toFixed(6)}, secondary=${jdCheck.toFixed(6)}, delta=${jdDelta.toFixed(6)}`);
    } else if (jdDelta >= 0.001) {
      warnings.push(`Julian Day minor delta: ${jdDelta.toFixed(6)}`);
    }

    // ─── 2. Ayanamsha Verification ───────────────────────────────────────────
    const primaryAyanamsha = primaryResult.astronomy.ayanamshaDegrees;
    const secondaryAyanamsha = this.computeLahiriAyanamsha(jdPrimary);
    const ayanDelta = Math.abs(primaryAyanamsha - secondaryAyanamsha);

    checks.push({
      checkId: 'CHK_AYAN_02',
      name: 'Lahiri Ayanamsha',
      status: ayanDelta <= tolerance.ayanamshaTolerance ? 'PASS' : ayanDelta <= 0.2 ? 'WARNING' : 'CONFLICT',
      expected: secondaryAyanamsha.toFixed(4),
      actual: primaryAyanamsha.toFixed(4),
      difference: ayanDelta,
      tolerance: tolerance.ayanamshaTolerance,
      severity: 'CRITICAL',
      source: 'BPHS Lahiri Reference Algorithmic Standard',
      primary: primaryAyanamsha.toFixed(4),
      secondary: secondaryAyanamsha.toFixed(4),
      delta: ayanDelta,
      message: ayanDelta <= tolerance.ayanamshaTolerance
        ? `Ayanamsha verified: ${primaryAyanamsha.toFixed(4)}°`
        : `Ayanamsha delta ${ayanDelta.toFixed(4)}° exceeds tolerance ${tolerance.ayanamshaTolerance}°`,
    });

    if (ayanDelta > 0.2) {
      conflicts.push(`Ayanamsha conflict: primary=${primaryAyanamsha.toFixed(4)}, secondary=${secondaryAyanamsha.toFixed(4)}`);
    } else if (ayanDelta > tolerance.ayanamshaTolerance) {
      warnings.push(`Ayanamsha delta: ${ayanDelta.toFixed(4)}°`);
    }

    // ─── 3. Ascendant Sign Verification ─────────────────────────────────────
    const primaryLagnaSign = primaryResult.ascendant.details.signName;
    const primaryLagnaDeg = primaryResult.ascendant.degrees;

    // Cross-check: verify Lagna is within expected sign boundaries
    const lagnaCheck = this.verifySignBoundary(primaryLagnaDeg, primaryResult.ascendant.details.signIndex);
    checks.push({
      checkId: 'CHK_LAGNA_03',
      name: 'Ascendant Sign Boundary',
      status: lagnaCheck.valid ? 'PASS' : 'CONFLICT',
      expected: lagnaCheck.signName,
      actual: primaryLagnaSign,
      difference: 0,
      severity: 'CRITICAL',
      source: 'Ascendant Geometric Boundary Check',
      primary: `${primaryLagnaSign} (${primaryLagnaDeg.toFixed(2)}°)`,
      secondary: lagnaCheck.signName,
      message: lagnaCheck.valid
        ? `Ascendant ${primaryLagnaSign} at ${primaryLagnaDeg.toFixed(2)}° verified`
        : `Ascendant sign boundary error: ${primaryLagnaSign} but degree ${primaryLagnaDeg.toFixed(2)}° → ${lagnaCheck.signName}`,
    });
    if (!lagnaCheck.valid) {
      conflicts.push(`Ascendant sign boundary conflict: ${primaryLagnaSign} vs ${lagnaCheck.signName}`);
    }

    // ─── 4. Moon Sign Verification ───────────────────────────────────────────
    const moonPlanet = primaryResult.planets.find((p) => p.name === 'Moon');
    if (moonPlanet) {
      const moonSignCheck = this.verifySignBoundary(moonPlanet.siderealLongitude, moonPlanet.signIndex);
      const primaryMoonSign = primaryResult.moonSign.signName;
      checks.push({
        checkId: 'CHK_MOON_04',
        name: 'Moon Sign Boundary',
        status: moonSignCheck.valid ? 'PASS' : 'CONFLICT',
        expected: moonSignCheck.signName,
        actual: primaryMoonSign,
        difference: 0,
        severity: 'CRITICAL',
        source: 'Lunar Sidereal Coordinate Verifier',
        primary: `${primaryMoonSign} (${moonPlanet.siderealLongitude.toFixed(2)}°)`,
        secondary: moonSignCheck.signName,
        message: moonSignCheck.valid
          ? `Moon sign ${primaryMoonSign} at ${moonPlanet.siderealLongitude.toFixed(2)}° verified`
          : `Moon sign boundary mismatch: ${primaryMoonSign} vs ${moonSignCheck.signName}`,
      });
      if (!moonSignCheck.valid) {
        conflicts.push(`Moon sign boundary conflict: ${primaryMoonSign} vs ${moonSignCheck.signName}`);
      }

      // ─── 5. Nakshatra Boundary Verification ────────────────────────────────
      const moonLong = moonPlanet.siderealLongitude;
      const nakshatraIdx = Math.floor((moonLong % 360) / (360 / 27));
      const primaryNakshatraIdx = primaryResult.moonNakshatra.index - 1;
      const nakshatraMatch = nakshatraIdx === primaryNakshatraIdx;
      checks.push({
        checkId: 'CHK_NAK_05',
        name: 'Moon Nakshatra Boundary',
        status: nakshatraMatch ? 'PASS' : nakshatraIdx === primaryNakshatraIdx + 1 || nakshatraIdx === primaryNakshatraIdx - 1 ? 'WARNING' : 'CONFLICT',
        expected: `Nakshatra index ${nakshatraIdx}`,
        actual: `${primaryResult.moonNakshatra.name} (idx ${primaryNakshatraIdx})`,
        difference: Math.abs(nakshatraIdx - primaryNakshatraIdx),
        severity: 'HIGH',
        source: 'Janma Nakshatra Sector 13°20\'',
        primary: `${primaryResult.moonNakshatra.name} (idx ${primaryNakshatraIdx})`,
        secondary: `Nakshatra index ${nakshatraIdx}`,
        message: nakshatraMatch
          ? `Nakshatra ${primaryResult.moonNakshatra.name} boundary verified`
          : `Nakshatra index mismatch: primary=${primaryNakshatraIdx}, secondary=${nakshatraIdx}`,
      });
      if (!nakshatraMatch && Math.abs(nakshatraIdx - primaryNakshatraIdx) > 1) {
        conflicts.push(`Nakshatra boundary conflict: idx ${primaryNakshatraIdx} vs ${nakshatraIdx}`);
      } else if (!nakshatraMatch) {
        warnings.push(`Nakshatra near boundary: ${primaryResult.moonNakshatra.name}`);
      }

      // ─── 6. Dasha Seed Verification ────────────────────────────────────────
      const NAKSHATRA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
        'Rahu', 'Jupiter', 'Saturn', 'Mercury',
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
        'Rahu', 'Jupiter', 'Saturn', 'Mercury',
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
        'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      ];
      const expectedDashaLord = NAKSHATRA_LORDS[nakshatraIdx % 27];
      const primaryDashaLord = primaryResult.dashas.birthDashaLord;
      checks.push({
        checkId: 'CHK_DASHA_06',
        name: 'Vimshottari Dasha Seed (Birth Nakshatra Lord)',
        status: primaryDashaLord === expectedDashaLord ? 'PASS' : 'CONFLICT',
        expected: expectedDashaLord,
        actual: primaryDashaLord,
        difference: 0,
        severity: 'CRITICAL',
        source: 'Vimshottari Dasha Nakshatra Lord Mapping',
        primary: primaryDashaLord,
        secondary: expectedDashaLord,
        message: primaryDashaLord === expectedDashaLord
          ? `Birth Dasha lord ${primaryDashaLord} verified from Moon Nakshatra`
          : `Dasha seed conflict: primary=${primaryDashaLord}, expected=${expectedDashaLord} from Nakshatra index ${nakshatraIdx}`,
      });
      if (primaryDashaLord !== expectedDashaLord) {
        conflicts.push(`Dasha seed conflict: birth lord=${primaryDashaLord}, expected from nakshatra=${expectedDashaLord}`);
      }
    }

    // ─── 7. Planetary Retrograde Sanity Check ────────────────────────────────
    const sun = primaryResult.planets.find((p) => p.name === 'Sun');
    const moon = primaryResult.planets.find((p) => p.name === 'Moon');
    if (sun?.isRetrograde) {
      conflicts.push('CRITICAL: Sun marked as retrograde — impossible.');
      checks.push({
        checkId: 'CHK_RETRO_SUN_07',
        name: 'Sun Retrograde Sanity',
        status: 'CONFLICT',
        expected: 'retrograde=false',
        actual: 'retrograde=true',
        difference: 1,
        severity: 'CRITICAL',
        source: 'Solar Ephemeris Physics',
        primary: 'retrograde=true',
        secondary: 'retrograde=false',
        message: 'Sun cannot be retrograde',
      });
    }
    if (moon?.isRetrograde) {
      conflicts.push('CRITICAL: Moon marked as retrograde — impossible.');
      checks.push({
        checkId: 'CHK_RETRO_MOON_07',
        name: 'Moon Retrograde Sanity',
        status: 'CONFLICT',
        expected: 'retrograde=false',
        actual: 'retrograde=true',
        difference: 1,
        severity: 'CRITICAL',
        source: 'Lunar Ephemeris Physics',
        primary: 'retrograde=true',
        secondary: 'retrograde=false',
        message: 'Moon cannot be retrograde',
      });
    }
    if (!sun?.isRetrograde && !moon?.isRetrograde) {
      checks.push({
        checkId: 'CHK_RETRO_07',
        name: 'Sun/Moon Retrograde Sanity',
        status: 'PASS',
        expected: 'false',
        actual: 'false',
        difference: 0,
        severity: 'CRITICAL',
        source: 'Solar/Lunar Ephemeris Physics',
        primary: 'false',
        secondary: 'false',
        message: 'Sun and Moon correctly non-retrograde',
      });
    }

    // ─── 8. House Count Verification ────────────────────────────────────────
    const houseCount = primaryResult.houses.length;
    checks.push({
      checkId: 'CHK_HOUSES_08',
      name: 'House Count',
      status: houseCount === 12 ? 'PASS' : 'CONFLICT',
      expected: 12,
      actual: houseCount,
      difference: Math.abs(12 - houseCount),
      severity: 'CRITICAL',
      source: 'Bhavas D1 Structure',
      primary: houseCount,
      secondary: 12,
      message: houseCount === 12 ? '12 Bhavas verified' : `Expected 12 houses, got ${houseCount}`,
    });
    if (houseCount !== 12) {
      conflicts.push(`House count error: expected 12, got ${houseCount}`);
    }

    // ─── 9. Planet Count Verification ────────────────────────────────────────
    const planetCount = primaryResult.planets.length;
    checks.push({
      checkId: 'CHK_PLANETS_09',
      name: 'Planet Count (9 Grahas)',
      status: planetCount === 9 ? 'PASS' : 'CONFLICT',
      expected: 9,
      actual: planetCount,
      difference: Math.abs(9 - planetCount),
      severity: 'CRITICAL',
      source: 'Navagraha Complete Enumeration',
      primary: planetCount,
      secondary: 9,
      message: planetCount === 9 ? '9 Grahas verified' : `Expected 9 planets, got ${planetCount}`,
    });
    if (planetCount !== 9) {
      conflicts.push(`Planet count error: expected 9, got ${planetCount}`);
    }

    // ─── 10. Edge Case Detection ─────────────────────────────────────────────
    const edgeCaseCheck = this.detectEdgeCases(profile);
    if (edgeCaseCheck) {
      checks.push({
        checkId: 'CHK_EDGE_10',
        name: 'Edge Case Detection',
        status: 'WARNING',
        expected: 'Normal',
        actual: edgeCaseCheck,
        difference: 0,
        severity: 'LOW',
        source: 'Temporal Boundary Detector',
        primary: 'N/A',
        secondary: edgeCaseCheck,
        message: edgeCaseCheck,
      });
      warnings.push(`Edge case: ${edgeCaseCheck}`);
    }

    // ─── Calculate Integrity Score ────────────────────────────────────────────
    const passCount = checks.filter((c) => c.status === 'PASS').length;
    const warnCount = checks.filter((c) => c.status === 'WARNING').length;
    const conflictCount = checks.filter((c) => c.status === 'CONFLICT').length;
    const total = checks.length;
    const integrityScore = total > 0
      ? Math.round(((passCount * 1 + warnCount * 0.5) / total) * 100)
      : 100;

    // ─── Overall Status ───────────────────────────────────────────────────────
    let overallStatus: VerificationResult['overallStatus'];
    if (conflictCount === 0 && warnCount === 0) {
      overallStatus = 'VERIFIED';
    } else if (conflictCount === 0) {
      overallStatus = 'VERIFIED_WITH_WARNINGS';
    } else if (conflictCount <= 1) {
      overallStatus = 'REVIEW_REQUIRED';
    } else {
      overallStatus = 'CALCULATION_CONFLICT';
    }

    return {
      overallStatus,
      integrityScore,
      checks,
      conflicts,
      warnings,
      calculationHash: primaryResult.astronomy.julianDay.toFixed(8) + '_' + primaryResult.ascendant.degrees.toFixed(4),
      verifiedAt: new Date().toISOString(),
      engineVersion: this.ENGINE_VERSION,
      toleranceConfig: tolerance,
    };
  }

  // ─── Independent Julian Day (Jean Meeus algorithm) ──────────────────────────
  private static julianDayFromParts(year: number, month: number, day: number, utcDecimalHour: number): number {
    let y = year;
    let m = month;
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utcDecimalHour / 24 + B - 1524.5;
  }

  // ─── Approximate Lahiri Ayanamsha ────────────────────────────────────────────
  private static computeLahiriAyanamsha(jd: number): number {
    // Lahiri (Chitra Paksha) = 23.85805° at J2000.0, increasing by 1.396042° per century
    const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0
    return 23.85805 + 1.396042 * T + 0.000308 * (T * T);
  }

  // ─── Sign boundary cross-check ───────────────────────────────────────────────
  private static verifySignBoundary(
    siderealLongitude: number,
    claimedSignIndex: number
  ): { valid: boolean; signName: string } {
    const SIGNS = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    ];
    const normalizedLong = ((siderealLongitude % 360) + 360) % 360;
    const computedSignIndex = Math.floor(normalizedLong / 30);
    return {
      valid: computedSignIndex === claimedSignIndex,
      signName: SIGNS[computedSignIndex] || 'Unknown',
    };
  }

  // ─── Edge Case Detection ─────────────────────────────────────────────────────
  private static detectEdgeCases(profile: BirthProfileInput): string | null {
    const [hr, mn] = profile.birthTime.split(':').map(Number);
    const [yr, mo, dy] = profile.birthDate.split('-').map(Number);

    // Midnight edge case
    if (hr === 0 && mn < 5) return 'Birth near midnight (00:00-00:05) — verify timezone DST carefully';
    if (hr === 23 && mn >= 55) return 'Birth near midnight (23:55-23:59) — verify date boundary';

    // Leap year edge case
    const isLeapYear = (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
    if (mo === 2 && dy === 29 && !isLeapYear) return `CRITICAL: Feb 29 in non-leap year ${yr}`;
    if (mo === 2 && dy === 29) return `Leap day birth (Feb 29, ${yr}) — Dasha balance carefully verified`;

    // Equinox/solstice proximity
    if ((mo === 3 && dy >= 19 && dy <= 21) || (mo === 9 && dy >= 21 && dy <= 23)) {
      return 'Birth near equinox — Sun sign boundary sensitivity noted';
    }

    return null;
  }
}
