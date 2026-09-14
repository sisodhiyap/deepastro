/**
 * DeepAstro Prediction Contradiction Engine V2
 * Identifies supporting vs contradictory signals and reduces confidence when strong contradictions exist.
 * Invariant: Contradictions are never averaged away blindly.
 */

import { ContradictionDetail } from './ObservatoryTypes.js';

export interface ContradictionAnalysisResult {
  supportingCount: number;
  contradictingCount: number;
  unresolvedCount: number;
  contradictions: ContradictionDetail[];
  severityPenalty: number;
  adjustedConfidence: number;
  explanation: string;
}

export class PredictionContradictionEngineV2 {
  public static analyzeContradictions(params: {
    rawConfidence: number;
    supportingSignals: string[];
    contradictingSignals: string[];
    unresolvedSignals?: string[];
  }): ContradictionAnalysisResult {
    const { rawConfidence, supportingSignals, contradictingSignals, unresolvedSignals = [] } = params;

    const contradictions: ContradictionDetail[] = [];
    let severityPenalty = 0.0;

    for (let i = 0; i < contradictingSignals.length; i++) {
      const sig = contradictingSignals[i];
      const severity = i === 0 && contradictingSignals.length > 2 ? 'SEVERE' : 'MODERATE';
      const penalty = severity === 'SEVERE' ? 0.25 : 0.12;
      severityPenalty += penalty;

      contradictions.push({
        contradictionId: 'contra_' + Date.now() + '_' + i,
        systemA: 'Primary Indicating System',
        systemB: 'Conflicting System',
        description: sig,
        severity,
        penalty,
      });
    }

    severityPenalty += unresolvedSignals.length * 0.04;
    severityPenalty = Math.min(0.65, severityPenalty);

    const adjustedConfidence = Number(Math.max(0.1, rawConfidence * (1.0 - severityPenalty)).toFixed(3));

    let explanation = 'High alignment across evaluated astrological systems.';
    if (contradictions.length > 0) {
      explanation = 'Identified ' + contradictions.length + ' contradicting astrological factors. Confidence penalized by ' + (severityPenalty * 100).toFixed(0) + '%.';
    }

    return {
      supportingCount: supportingSignals.length,
      contradictingCount: contradictingSignals.length,
      unresolvedCount: unresolvedSignals.length,
      contradictions,
      severityPenalty: Number(severityPenalty.toFixed(3)),
      adjustedConfidence,
      explanation,
    };
  }
}
