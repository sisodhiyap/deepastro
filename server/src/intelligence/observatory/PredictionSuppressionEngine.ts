/**
 * DeepAstro Prediction Suppression Engine
 * Suppresses forecasts when evidence is absent, contradictions dominate, or claims are non-falsifiable.
 * Invariant: Suppression is an essential feature of honest intelligence, not a failure.
 */

import { PredictionClaim } from './ObservatoryTypes.js';

export class PredictionSuppressionEngine {
  public static shouldSuppress(claim: PredictionClaim): {
    suppress: boolean;
    reason?: string;
  } {
    if (claim.evidenceIds.length === 0) {
      return {
        suppress: true,
        reason: 'DeepAstro does not have enough evidence to make a reliable forecast for this period.',
      };
    }

    if (claim.contradictionIds.length >= 3) {
      return {
        suppress: true,
        reason: 'Significant divergence across major astrological systems indicates high turbulence; prediction suppressed.',
      };
    }

    if (claim.testability === 'NON_FALSIFIABLE') {
      return {
        suppress: true,
        reason: 'Claim lacks defined timing boundaries or testable conditions.',
      };
    }

    return { suppress: false };
  }
}
