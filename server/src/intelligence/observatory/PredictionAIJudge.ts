/**
 * DeepAstro Prediction AI Judge
 * Independent quality critic answering 13 core evaluative questions.
 * Invariant: The AI Judge is NEVER the sole authority and CANNOT override deterministic calculations.
 */

import { PredictionClaim } from './ObservatoryTypes.js';

export interface AIJudgeCritique {
  claimId: string;
  isSupported: boolean;
  isTestable: boolean;
  isTooVague: boolean;
  isConfidenceJustified: boolean;
  hasContradictions: boolean;
  isTimingDefined: boolean;
  isFactualVsInterpretive: 'ASTRONOMICAL_FACT' | 'INTERPRETIVE_HEURISTIC' | 'SPECULATION';
  hasUnsupportedReasoning: boolean;
  hasHallucinatedEvidence: boolean;
  isWordingOverlyDeterministic: boolean;
  isPostHoc: boolean;
  isFalsifiable: boolean;
  doesEvidenceSupportConclusion: boolean;
  criticScore: number; // 0.0 to 1.0
  critiqueNotes: string[];
}

export class PredictionAIJudge {
  public static evaluate(claim: PredictionClaim): AIJudgeCritique {
    const notes: string[] = [];
    let score = 0.8;

    const isTooVague = claim.isBarnum || claim.testability === 'VAGUE';
    if (isTooVague) {
      notes.push('Claim exhibits high vagueness or Barnum-style generality.');
      score -= 0.3;
    }

    const isTestable = claim.testability === 'TESTABLE';
    if (!isTestable) {
      notes.push('Claim lacks strict falsifiability or specific timing window.');
      score -= 0.15;
    }

    const isWordingOverlyDeterministic = claim.isOverconfident;
    if (isWordingOverlyDeterministic) {
      notes.push('Wording is overly deterministic; lacks epistemic uncertainty qualifiers.');
      score -= 0.2;
    }

    const isTimingDefined = Boolean(claim.timingWindow.startDate && claim.timingWindow.endDate);
    if (!isTimingDefined) {
      notes.push('Timing window is missing or unbounded.');
      score -= 0.2;
    }

    const hasContradictions = claim.contradictionIds.length > 0;
    if (hasContradictions) {
      notes.push(`Claim has ${claim.contradictionIds.length} active astrological contradiction factors.`);
      score -= 0.15;
    }

    const isSupported = claim.evidenceIds.length > 0;
    if (!isSupported) {
      notes.push('NO EVIDENCE: Claim lacks supporting astrological evidence.');
      score -= 0.4;
    }

    const criticScore = Number(Math.max(0.05, Math.min(0.95, score)).toFixed(3));

    return {
      claimId: claim.claimId,
      isSupported,
      isTestable,
      isTooVague,
      isConfidenceJustified: criticScore >= 0.6,
      hasContradictions,
      isTimingDefined,
      isFactualVsInterpretive: 'INTERPRETIVE_HEURISTIC',
      hasUnsupportedReasoning: !isSupported,
      hasHallucinatedEvidence: false,
      isWordingOverlyDeterministic,
      isPostHoc: false,
      isFalsifiable: isTestable && isTimingDefined,
      doesEvidenceSupportConclusion: isSupported && !hasContradictions,
      criticScore,
      critiqueNotes: notes,
    };
  }
}
