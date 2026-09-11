/**
 * DeepAstro Confidence Engine
 * Computes multi-factor epistemic confidence (LOW, MODERATE, HIGH)
 * based on evidence volume, contradiction presence, and birth-time stability.
 * Avoids deceptive pseudo-precision like "98.4%".
 */

import { ConfidenceLevel, EvidenceSignal, ContradictionDetail } from './IntelligenceTypes.js';

export class ConfidenceEngine {
  public static evaluateConfidence(params: {
    signals: EvidenceSignal[];
    contradictions: ContradictionDetail[];
    isTimeApproximate?: boolean;
  }): ConfidenceLevel {
    const { signals, contradictions, isTimeApproximate } = params;

    if (signals.length === 0) return 'LOW';

    // Approximate birth times degrade confidence
    if (isTimeApproximate) {
      return 'LOW';
    }

    // High contradiction counts temper confidence
    if (contradictions.length >= 2) {
      return 'LOW';
    }

    if (contradictions.length === 1) {
      return 'MODERATE';
    }

    // Multiple high-confidence signals with zero contradictions
    const highConfSignals = signals.filter((s) => s.confidence === 'HIGH');
    if (highConfSignals.length >= 2 && contradictions.length === 0) {
      return 'HIGH';
    }

    return 'MODERATE';
  }
}
