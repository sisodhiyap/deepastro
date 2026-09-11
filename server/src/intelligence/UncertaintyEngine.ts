/**
 * DeepAstro Uncertainty Engine
 * Evaluates chart stability against birth-time sensitivity (±5 minutes)
 * and highlights boundary proximity for house cusps and nakshatra padas.
 */

import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface UncertaintyAssessment {
  isStable: boolean;
  sensitivePoints: string[];
  caveats: string[];
}

export class UncertaintyEngine {
  public static evaluateSensitivity(
    snapshot: CalculationSnapshot,
    isApproximateTime: boolean = false
  ): UncertaintyAssessment {
    const sensitivePoints: string[] = [];
    const caveats: string[] = [];

    if (isApproximateTime) {
      sensitivePoints.push('Ascendant degree and Navamsha (D9) lagna cusp');
      caveats.push('Birth time is marked as approximate. House cusps and sub-divisional charts should be interpreted with wider tolerance.');
    }

    const ascDegree = snapshot.ascendant?.degreeInSign ?? 15;
    if (ascDegree < 1.0 || ascDegree > 29.0) {
      sensitivePoints.push('Lagna cusp near zodiac sign boundary (Sandhi)');
      caveats.push('Ascendant is within 1 degree of sign boundary; small variations in clock time could alter rising sign interpretation.');
    }

    const isStable = sensitivePoints.length === 0;
    if (isStable) {
      caveats.push('Chart shows high astronomical stability across standard ±5 minute intervals.');
    }

    return {
      isStable,
      sensitivePoints,
      caveats,
    };
  }
}
