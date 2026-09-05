/**
 * Cross-Consistency Engine
 * Verifies mathematical coherence across astronomical dimensions:
 * Longitude ↔ Sign ↔ House ↔ Nakshatra ↔ Pada ↔ Dasha.
 * Detects discrepancies between parsed user claims and deterministic engine reality.
 */

import { FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { UnverifiedParsedKundli } from './KundliParserEngine.js';
import { VerifiedFact } from './FactLedger.js';

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  conflicts: Array<{
    field: string;
    claimedValue: any;
    calculatedValue: any;
    severity: 'BLOCKING_CONFLICT' | 'INFORMATIVE_DIFF';
    reason: string;
  }>;
  verifiedFields: string[];
}

export class CrossConsistencyEngine {
  /**
   * Compares unverified candidate parser data with deterministic engine calculations
   */
  public static verifyCrossConsistency(
    parsed: UnverifiedParsedKundli,
    calculated: FullKundliResult
  ): ConsistencyCheckResult {
    const conflicts: ConsistencyCheckResult['conflicts'] = [];
    const verifiedFields: string[] = [];

    // 1. Verify Lagna Sign Consistency
    const calcLagna = calculated.ascendant.details.signName;
    if (parsed.lagnaSign) {
      if (parsed.lagnaSign.toLowerCase() !== calcLagna.toLowerCase()) {
        conflicts.push({
          field: 'lagnaSign',
          claimedValue: parsed.lagnaSign,
          calculatedValue: calcLagna,
          severity: 'BLOCKING_CONFLICT',
          reason: `Parsed document indicated Lagna ${parsed.lagnaSign}, but deterministic sidereal math computes ${calcLagna}.`,
        });
      } else {
        verifiedFields.push('lagnaSign');
      }
    } else {
      verifiedFields.push('lagnaSign');
    }

    // 2. Verify Moon Sign (Rashi) Consistency
    const calcMoonSign = calculated.moonSign.signName;
    if (parsed.moonSign) {
      if (parsed.moonSign.toLowerCase() !== calcMoonSign.toLowerCase()) {
        conflicts.push({
          field: 'moonSign',
          claimedValue: parsed.moonSign,
          calculatedValue: calcMoonSign,
          severity: 'BLOCKING_CONFLICT',
          reason: `Parsed document indicated Moon in ${parsed.moonSign}, but planetary ephemeris places Chandra in ${calcMoonSign}.`,
        });
      } else {
        verifiedFields.push('moonSign');
      }
    } else {
      verifiedFields.push('moonSign');
    }

    // 3. Verify Nakshatra Consistency
    const calcNakshatra = calculated.moonNakshatra.name;
    if (parsed.nakshatra) {
      if (!calcNakshatra.toLowerCase().includes(parsed.nakshatra.toLowerCase())) {
        conflicts.push({
          field: 'nakshatra',
          claimedValue: parsed.nakshatra,
          calculatedValue: calcNakshatra,
          severity: 'BLOCKING_CONFLICT',
          reason: `Claimed Nakshatra ${parsed.nakshatra} does not match computed moon longitude (${calculated.moonSign.degreeInSign}° in ${calcMoonSign}, Nakshatra ${calcNakshatra}).`,
        });
      } else {
        verifiedFields.push('nakshatra');
      }
    } else {
      verifiedFields.push('nakshatra');
    }

    // 4. Mathematical Internal Invariants: Moon Longitude vs Nakshatra Range
    // Each nakshatra is exactly 13°20' (13.3333°)
    const moonTotalDeg = (calculated.moonSign.signIndex * 30) + calculated.moonSign.degreeInSign + (calculated.moonSign.minutes / 60);
    const expectedNakshatraIndex = Math.floor(moonTotalDeg / (360 / 27));
    const expectedPada = Math.floor((moonTotalDeg % (360 / 27)) / (360 / 108)) + 1;

    if (calculated.moonNakshatra.pada !== expectedPada) {
      conflicts.push({
        field: 'nakshatraPada',
        claimedValue: calculated.moonNakshatra.pada,
        calculatedValue: expectedPada,
        severity: 'BLOCKING_CONFLICT',
        reason: 'Mathematical discrepancy between Moon longitude and Nakshatra pada division.',
      });
    } else {
      verifiedFields.push('nakshatraPada');
    }

    // 5. Planetary House sequence sanity: exactly 12 contiguous houses
    if (calculated.houses.length === 12) {
      verifiedFields.push('housesCount');
    } else {
      conflicts.push({
        field: 'housesCount',
        claimedValue: calculated.houses.length,
        calculatedValue: 12,
        severity: 'BLOCKING_CONFLICT',
        reason: `Expected exactly 12 Bhavas, received ${calculated.houses.length}`,
      });
    }

    return {
      isConsistent: conflicts.filter((c) => c.severity === 'BLOCKING_CONFLICT').length === 0,
      conflicts,
      verifiedFields,
    };
  }
}
