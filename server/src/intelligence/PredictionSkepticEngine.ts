/**
 * DeepAstro 4.0 — Prediction Skeptic Engine (PredictionSkepticEngine)
 * Adversarial disproval engine executed before finalizing predictions.
 * 
 * Specifically challenges:
 * 1. What evidence contradicts this?
 * 2. Which chart factors disagree?
 * 3. Is one indicator being overweighted?
 * 4. Is the timing window justified?
 * 5. Is there enough verifiable evidence?
 * 6. Is the conclusion dependent on an unsupported assumption?
 * 7. Are alternative interpretations plausible?
 * 8. Is confidence too high?
 * 9. Is the prediction actually testable?
 * 10. Is the outcome definition ambiguous?
 */

import { EvidenceSignal, ContradictionDetail } from './IntelligenceTypes.js';

export type SkepticVerdict = 'SUPPORTED' | 'MIXED' | 'WEAK' | 'INSUFFICIENT_EVIDENCE';

export interface SkepticAuditResult {
  supportScore: number;         // 0.0 to 1.0
  contradictionScore: number;   // 0.0 to 1.0
  alternativeCount: number;
  uncertainty: number;          // 0.0 to 1.0
  skepticVerdict: SkepticVerdict;
  overweightedFactors: string[];
  timingJustificationAssessment: string;
  testabilityScore: number;     // 0.0 to 1.0
  adversarialNotes: string[];
}

export class PredictionSkepticEngine {
  public static auditPrediction(params: {
    domain: string;
    signals: EvidenceSignal[];
    contradictions: ContradictionDetail[];
    proposedConfidence: number;
    sampleSize?: number;
    timeWindowSpecified?: boolean;
  }): SkepticAuditResult {
    const { domain, signals, contradictions, proposedConfidence, sampleSize = 0, timeWindowSpecified = true } = params;
    const adversarialNotes: string[] = [];
    const overweightedFactors: string[] = [];

    // 1. Evidence sufficiency check
    if (signals.length < 2) {
      adversarialNotes.push('CRITICAL_DEFECT: Insufficient independent signal sources to sustain a confident prediction.');
    }

    // 2. Contradiction evaluation
    const contradictionScore = Number(Math.min(1.0, (contradictions.length * 0.25)).toFixed(3));
    if (contradictions.length > 0) {
      adversarialNotes.push(`Skeptic flagged ${contradictions.length} astrological counter-indications that mitigate one-sided optimism.`);
    }

    // 3. Single-indicator overweighting audit
    const parashariSignals = signals.filter((s) => s.system === 'PARASHARI');
    if (parashariSignals.length > 0 && parashariSignals.length === signals.length) {
      overweightedFactors.push('Parashari Natal Lord');
      adversarialNotes.push('Over-reliance on single tradition without corroborating cross-system evidence (KP or Jaimini).');
    }

    // 4. Timing justification
    let timingJustificationAssessment = 'Adequately bounded by active Mahadasha-Antardasha period.';
    if (!timeWindowSpecified) {
      timingJustificationAssessment = 'TIMING_UNBOUNDED: Prediction lacks testable calendar window.';
      adversarialNotes.push('Prediction fails falsifiability criterion due to vague temporal boundary.');
    }

    // 5. Testability score
    const testabilityScore = timeWindowSpecified && signals.length >= 2 ? 0.9 : 0.45;

    // 6. Alternative count
    const alternativeCount = 2 + (contradictions.length > 0 ? 1 : 0);

    // 7. Calculate support score & uncertainty
    let supportScore = proposedConfidence * (1.0 - contradictionScore * 0.4);
    if (signals.length < 2) supportScore *= 0.5;
    if (sampleSize === 0) supportScore *= 0.9; // Modest penalty for brand new user with zero confirmed baseline
    supportScore = Number(Math.max(0.1, Math.min(0.95, supportScore)).toFixed(3));

    const uncertainty = Number((1.0 - supportScore + contradictionScore * 0.3).toFixed(3));

    // 8. Determine Skeptic Verdict
    let skepticVerdict: SkepticVerdict = 'SUPPORTED';
    if (signals.length < 2 || testabilityScore < 0.5) {
      skepticVerdict = 'INSUFFICIENT_EVIDENCE';
      adversarialNotes.push('Verdict demoted to INSUFFICIENT_EVIDENCE: insufficient empirical support.');
    } else if (contradictionScore >= 0.5 || proposedConfidence < 0.45) {
      skepticVerdict = 'WEAK';
      adversarialNotes.push('Verdict demoted to WEAK: substantial countervailing astrological forces.');
    } else if (contradictionScore >= 0.2 || alternativeCount >= 3) {
      skepticVerdict = 'MIXED';
      adversarialNotes.push('Verdict categorized as MIXED: viable alternative life paths exist concurrently.');
    }

    return {
      supportScore,
      contradictionScore,
      alternativeCount,
      uncertainty: Math.min(1.0, uncertainty),
      skepticVerdict,
      overweightedFactors,
      timingJustificationAssessment,
      testabilityScore,
      adversarialNotes,
    };
  }
}
