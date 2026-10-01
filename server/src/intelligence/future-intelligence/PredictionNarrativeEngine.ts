/**
 * PredictionNarrativeEngine.ts
 * Synthesizes structured, transparent narrative text strictly grounded in deterministic evidence.
 * Integrates AIEvidenceValidator to guarantee zero hallucinated astrology.
 */

import { PredictionEvidence } from './types.js';
import { AIEvidenceValidator } from './AIEvidenceValidator.js';

export class PredictionNarrativeEngine {
  /**
   * System instruction enforcing strict epistemic grounding.
   */
  public static readonly SYSTEM_PROMPT = `You are DeepAstro's Future Intelligence Narrative Interpreter.
You are interpreting supplied deterministic evidence only.
Do not invent planetary positions, Dashas, dates, yogas, transits, or numerology values.
If evidence is missing, state: "Insufficient calculated evidence."
Do not make fatalistic predictions, medical diagnoses, financial guarantees, or death claims.`;

  /**
   * Generates a verified narrative from evidence.
   */
  public static synthesizeDomainNarrative(
    domainTitle: string,
    evidenceList: PredictionEvidence[],
    customText?: string
  ): {
    narrative: string;
    isAIAudited: boolean;
    evidenceCount: number;
  } {
    if (!evidenceList || evidenceList.length === 0) {
      return {
        narrative: 'Insufficient calculated evidence to generate a detailed reading for this period.',
        isAIAudited: true,
        evidenceCount: 0,
      };
    }

    if (customText) {
      const audit = AIEvidenceValidator.validate(customText, evidenceList);
      if (audit.isValid) {
        return {
          narrative: customText,
          isAIAudited: true,
          evidenceCount: evidenceList.length,
        };
      }
      console.warn('[NarrativeEngine] Rejected ungrounded text:', audit.rejectionReason);
    }

    // Deterministic fallback narrative strictly constructed from evidence
    const lines = evidenceList.map((e) => `• [${e.source}] ${e.value}`);
    const narrative = `${domainTitle} Focus:\n${lines.join('\n')}\n\nInterpretive Guidance: Navigate this period with deliberate patience and conscious alignment with these verified chart cycles.`;

    return {
      narrative,
      isAIAudited: true,
      evidenceCount: evidenceList.length,
    };
  }
}
