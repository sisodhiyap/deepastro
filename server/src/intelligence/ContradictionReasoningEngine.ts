/**
 * DeepAstro Contradiction Reasoning Engine
 * Discovers and explains nuanced divergence across classical Jyotish traditions
 * (Parashari, Jaimini, KP, Gochara transits) without manufacturing false consensus.
 */

import { EvidenceSignal, ContradictionDetail } from './IntelligenceTypes.js';

export class ContradictionReasoningEngine {
  public static analyzeContradictions(signals: EvidenceSignal[], domain: string): ContradictionDetail[] {
    const contradictions: ContradictionDetail[] = [];

    // Find conflicting directions between systems
    const favorableSignals = signals.filter((s) => s.direction === 'FAVORABLE');
    const transitionalOrUnfavorable = signals.filter((s) => s.direction === 'UNFAVORABLE' || s.direction === 'TRANSITIONAL');

    if (favorableSignals.length > 0 && transitionalOrUnfavorable.length > 0) {
      const primary = favorableSignals[0];
      const opposing = transitionalOrUnfavorable[0];

      contradictions.push({
        topic: `${domain} Timing & Ease of Execution`,
        primarySystem: primary.system,
        primarySignal: `${primary.factor}: ${primary.evidence}`,
        opposingSystem: opposing.system,
        opposingSignal: `${opposing.factor}: ${opposing.evidence}`,
        reasonForDivergence: `Classical systems view planetary activation from distinct vantage points: ${primary.system} prioritizes natal potential and lordships, whereas ${opposing.system} evaluates precise sub-divisional sub-lords and transit friction.`,
        reconciliationSummary: `The fundamental potential is supportive, but practical execution requires deliberate patience due to short-term timing friction.`,
      });
    }

    return contradictions;
  }
}
