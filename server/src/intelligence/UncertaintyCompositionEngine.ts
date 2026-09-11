/**
 * DeepAstro 3.1 — Uncertainty Composition Engine (UncertaintyCompositionEngine)
 * Synthesizes multi-factor epistemological uncertainties into transparent LOW / MODERATE / HIGH ratings.
 * Evaluates:
 * 1. Birth-time sensitivity
 * 2. Cusp/sign boundary proximity
 * 3. Systemic contradictions (e.g. Parashari vs KP divergence)
 * 4. User context sufficiency
 * 5. Historical calibration sample size
 * 6. External world-data freshness
 * Invariant: Never produces fake numerical percentages like 97.43%.
 */

import { ConfidenceLevel, UncertaintyBreakdown } from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface EvaluateUncertaintyParams {
  snapshot: CalculationSnapshot;
  contradictionCount: number;
  hasConfirmedContext: boolean;
  historicalSampleSize: number;
  worldDataFreshness?: 'FRESH' | 'STALE' | 'NOT_APPLICABLE';
}

export class UncertaintyCompositionEngine {
  public static composeUncertainty(params: EvaluateUncertaintyParams): UncertaintyBreakdown {
    const {
      snapshot,
      contradictionCount,
      hasConfirmedContext,
      historicalSampleSize,
      worldDataFreshness = 'NOT_APPLICABLE',
    } = params;

    const reasons: string[] = [];
    let uncertaintyScore = 0; // 0 (very low uncertainty) to 6 (very high uncertainty)

    // 1. Check Birth Time Sensitivity & Boundary Proximity
    const ascDeg = snapshot.ascendant.degreeInSign || 15.0;
    const isBoundary = ascDeg < 2.0 || ascDeg > 28.0;
    let birthTimeSensitivity: UncertaintyBreakdown['birthTimeSensitivity'] = 'STABLE';

    if (isBoundary) {
      birthTimeSensitivity = 'HIGH_SENSITIVITY';
      uncertaintyScore += 2;
      reasons.push(
        `Ascendant at ${ascDeg.toFixed(1)}° is near sign boundary; a ±4 minute birth time shift may alter the rising sign or D9 lagna.`
      );
    } else if (ascDeg < 5.0 || ascDeg > 25.0) {
      birthTimeSensitivity = 'MODERATE_SENSITIVITY';
      uncertaintyScore += 1;
      reasons.push('Ascendant degree is moderately close to sign threshold; divisional vargas are sensitive.');
    } else {
      reasons.push('Ascendant calculation is centrally placed and robust against minute birth-time variance.');
    }

    // 2. Contradiction Tension
    let contradictionTension: UncertaintyBreakdown['contradictionTension'] = 'NONE';
    if (contradictionCount >= 2) {
      contradictionTension = 'SIGNIFICANT';
      uncertaintyScore += 2;
      reasons.push('Multiple classical interpretive systems (e.g. Parashari vs KP) exhibit divergent timing indicators.');
    } else if (contradictionCount === 1) {
      contradictionTension = 'MODERATE';
      uncertaintyScore += 1;
      reasons.push('Single minor divergence between classical house lord strength and transit timing.');
    } else {
      reasons.push('Major interpretive systems converge without irreconcilable divergence.');
    }

    // 3. User Context Sufficiency
    let contextSufficiency: UncertaintyBreakdown['contextSufficiency'] = 'SUFFICIENT';
    if (!hasConfirmedContext) {
      contextSufficiency = 'DEFICIENT';
      uncertaintyScore += 1;
      reasons.push('No confirmed real-world life context available; reading relies purely on deterministic chart geometry.');
    }

    // 4. Historical Calibration Sample Size
    if (historicalSampleSize < 3) {
      uncertaintyScore += 1;
      reasons.push(
        `Historical outcome sample size (${historicalSampleSize}) is limited; personal calibration carries wider bounds.`
      );
    }

    // 5. External World Data Freshness
    if (worldDataFreshness === 'STALE') {
      uncertaintyScore += 1;
      reasons.push('External world research data is older than 6 months.');
    }

    // Composite Confidence Level mapping
    let compositeLevel: ConfidenceLevel = 'HIGH';
    if (uncertaintyScore >= 4) {
      compositeLevel = 'LOW';
    } else if (uncertaintyScore >= 2) {
      compositeLevel = 'MODERATE';
    } else {
      compositeLevel = 'HIGH';
    }

    return {
      compositeLevel,
      birthTimeSensitivity,
      boundaryProximityAlert: isBoundary,
      contradictionTension,
      contextSufficiency,
      historicalSampleSize,
      worldDataFreshness,
      reasons,
    };
  }
}
