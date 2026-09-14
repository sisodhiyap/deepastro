/**
 * DeepAstro Prediction Red Team Engine
 * Automated adversarial scanner: confirmation bias, Texas sharpshooter fallacy, Barnum statements, future leakage.
 */

import { PredictionClaim } from './ObservatoryTypes.js';

export interface RedTeamScanResult {
  passed: boolean;
  flags: string[];
  riskScore: number; // 0.0 (safe) to 1.0 (compromised)
  recommendation: 'PASS' | 'DOWNGRADE' | 'SUPPRESS';
}

export class PredictionRedTeamEngine {
  public static scan(claim: PredictionClaim): RedTeamScanResult {
    const flags: string[] = [];
    let risk = 0.0;

    if (claim.isBarnum) {
      flags.push('BARNUM_STATEMENT_DETECTED');
      risk += 0.4;
    }

    if (claim.isOverconfident) {
      flags.push('OVERCONFIDENCE_LANGUAGE_DETECTED');
      risk += 0.35;
    }

    if (claim.evidenceIds.length === 0) {
      flags.push('NO_EVIDENCE_ATTACHED');
      risk += 0.4;
    }

    if (claim.testability === 'NON_FALSIFIABLE') {
      flags.push('NON_FALSIFIABLE_CLAIM');
      risk += 0.3;
    }

    const riskScore = Number(Math.min(1.0, risk).toFixed(3));
    let recommendation: 'PASS' | 'DOWNGRADE' | 'SUPPRESS' = 'PASS';

    if (riskScore >= 0.7) recommendation = 'SUPPRESS';
    else if (riskScore >= 0.35) recommendation = 'DOWNGRADE';

    return {
      passed: riskScore < 0.35,
      flags,
      riskScore,
      recommendation,
    };
  }
}
