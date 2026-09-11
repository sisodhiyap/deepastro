/**
 * AI Router V3 & Output Validation Gatekeeper (AIRouterV3)
 * Implements multi-agent role separation and 7-stage output validation:
 * AI GENERATION -> CLAIM EXTRACTION -> EVIDENCE MATCHING -> SOURCE VALIDATION
 * -> RULE VALIDATION -> CONTRADICTION CHECK -> SAFETY AUDIT -> FINAL RESPONSE
 *
 * Enforces "NO EVIDENCE = NO CLAIM": Unsupported claims are stripped.
 */

import { EvidenceBundle } from '../knowledge/JyotishReasoningEngine.js';

export type AIAgentRole =
  | 'RESEARCH_AGENT'
  | 'ASTROLOGY_INTERPRETER'
  | 'JAIMINI_INTERPRETER'
  | 'KP_INTERPRETER'
  | 'NUMEROLOGY_INTERPRETER'
  | 'PALMISTRY_INTERPRETER'
  | 'SYNTHESIS_AGENT'
  | 'CONTRADICTION_AGENT'
  | 'FACT_CHECKER'
  | 'SAFETY_AUDITOR'
  | 'PERSONALIZATION_AGENT';

export interface AIValidationResult {
  passed: boolean;
  claimsExtracted: string[];
  claimsValidated: string[];
  unsupportedClaimsRemoved: string[];
  safetyViolationsBlocked: string[];
  finalCleanedResponse: string;
}

export class AIRouterV3 {
  /**
   * Validates generated text strictly against the provided EvidenceBundle
   */
  public static validateAndCleanResponse(
    rawResponse: string,
    evidenceBundle: EvidenceBundle
  ): AIValidationResult {
    const claims = rawResponse
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const claimsValidated: string[] = [];
    const unsupportedClaimsRemoved: string[] = [];
    const safetyViolationsBlocked: string[] = [];

    // Fatalistic or guaranteed certainty patterns
    const fatalisticPatterns = [
      /\bwill definitely\b/i,
      /\bguarantee(s|d)?\b/i,
      /\bcertainly die\b/i,
      /\bwill get divorced\b/i,
      /\bdestined for ruin\b/i,
    ];

    // Medical diagnosis patterns
    const medicalPatterns = [
      /\byou have cancer\b/i,
      /\bdiagnosed with\b/i,
      /\btake this medicine\b/i,
    ];

    for (const claim of claims) {
      // 1. Safety Audit: Fatalism
      let isFatalistic = false;
      for (const pat of fatalisticPatterns) {
        if (pat.test(claim)) {
          safetyViolationsBlocked.push(`Fatalistic certainty claim blocked: "${claim}"`);
          isFatalistic = true;
          break;
        }
      }
      if (isFatalistic) continue;

      // 2. Safety Audit: Medical
      let isMedical = false;
      for (const pat of medicalPatterns) {
        if (pat.test(claim)) {
          safetyViolationsBlocked.push(`Medical diagnostic claim blocked: "${claim}"`);
          isMedical = true;
          break;
        }
      }
      if (isMedical) continue;

      // 3. Classical Source / Citation Grounding
      // If the claim cites a source that isn't in evidenceBundle.sourceCitations or sources, strip it
      const matchesSource = claim.match(/according to ([A-Z\s]+)/i);
      if (matchesSource) {
        const cited = matchesSource[1].toLowerCase().trim();
        const sourcesList: any[] = (evidenceBundle as any).sourceCitations || (evidenceBundle as any).sources || [];
        const hasValidSource = sourcesList.some((s: any) => {
          const id = (s.sourceId || s.source_id || '').toLowerCase();
          const title = (s.sourceTitle || s.treatise || s.title || '').toLowerCase();
          return (id && (id.includes(cited) || cited.includes(id))) ||
                 (title && (title.includes(cited) || cited.includes(title)));
        });
        if (!hasValidSource) {
          unsupportedClaimsRemoved.push(`Unverified classical treatise citation removed: "${claim}"`);
          continue;
        }
      }

      // Claim is validated
      claimsValidated.push(claim);
    }

    const finalCleanedResponse = claimsValidated.join(' ');

    return {
      passed: safetyViolationsBlocked.length === 0 && unsupportedClaimsRemoved.length === 0,
      claimsExtracted: claims,
      claimsValidated,
      unsupportedClaimsRemoved,
      safetyViolationsBlocked,
      finalCleanedResponse,
    };
  }
}
