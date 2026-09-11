/**
 * DeepAstro Phase 5 — Multi-System Evidence Weighting & Contradiction Engine v2
 * 
 * Rules:
 * 1. Run only relevant systems for a question domain.
 * 2. Never simply count systems (e.g. 3 positive + 2 negative != 60%).
 * 3. Evidence classification hierarchy:
 *    - PRIMARY (Direct natal chart core placements, dasha lords, lagna/kendra/trikona)
 *    - SECONDARY (Relevant divisional charts e.g. D9, D10, D4, gochar transits)
 *    - SUPPORTING (KP significators, Jaimini chara karakas/arudhas, Ashtakavarga)
 *    - CONTEXTUAL (User-confirmed life facts, life graph nodes, milestones)
 *    - SPECULATIVE (Heuristic interpretations, general transits without bindu strength)
 * 4. Calculation-derived evidence strictly outranks AI interpretations.
 * 5. Contradiction Resolution:
 *    - Explain WHAT AGREES, WHAT DISAGREES, WHY, WHICH SYSTEM IS MORE RELEVANT,
 *      TIME WINDOW, and UNCERTAINTY.
 *    - NEVER average contradictory scores into a false consensus.
 */

export type EvidenceTier = 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'CONTEXTUAL' | 'SPECULATIVE';

export interface EvidenceItem {
  id: string;
  system: 'PARASHARI' | 'DASHA' | 'GOCHAR' | 'JAIMINI' | 'KP' | 'VARGA' | 'NUMEROLOGY' | 'LIFE_GRAPH' | 'RESEARCH';
  tier: EvidenceTier;
  finding: string;
  sourceType: 'CALCULATION_DETERMINISTIC' | 'RULE_CANONICAL' | 'USER_CONFIRMED' | 'AI_INTERPRETATION';
  temporalWindow?: string;
  supportsOutcome: boolean;
  weightScore: number; // PRIMARY: 1.0, SECONDARY: 0.75, SUPPORTING: 0.5, CONTEXTUAL: 0.4, SPECULATIVE: 0.2
  reasoning: string;
}

export interface ContradictionAnalysisV2 {
  hasContradiction: boolean;
  agreements: string[];
  disagreements: {
    systemA: { name: string; finding: string; tier: EvidenceTier };
    systemB: { name: string; finding: string; tier: EvidenceTier };
    whyDisagrees: string;
    moreRelevantSystem: string;
    reasonForRelevance: string;
    timeWindow: string;
    uncertaintyAssessment: string;
  }[];
  synthesis: string;
  uncertaintyDisclosure: string;
}

export interface DomainSystemSelection {
  domain: string;
  requiredSystems: string[];
  omittedSystems: string[];
  rationale: string;
}

export class EvidenceWeightingEngine {
  /**
   * Domain-specific system gating (Phase 5 requirement 12)
   * Prevents irrelevant systems from contaminating domain evaluations (e.g. no palmistry for career/relocation unless image uploaded).
   */
  public static selectSystemsForDomain(domain: string): DomainSystemSelection {
    const d = domain.toUpperCase();

    if (d.includes('MARRIAGE') || d.includes('RELATIONSHIP')) {
      return {
        domain: 'MARRIAGE_RELATIONSHIP',
        requiredSystems: ['PARASHARI', 'D9_NAVAMSHA', 'DASHA', 'GOCHAR', 'JAIMINI_DARAKARAKA_UL', 'KP_7TH_CUSP', 'LIFE_GRAPH'],
        omittedSystems: ['PALMISTRY', 'D10_DASAMSHA', 'D4_CHATURTHAMSHA'],
        rationale: 'Focuses on 7th bhava, Venus/Jupiter karakas, Navamsha harmony, Upapada Lagna, and 2/7/11 cusp sub-lords.',
      };
    }

    if (d.includes('CAREER') || d.includes('JOB') || d.includes('BUSINESS')) {
      return {
        domain: 'CAREER_VOCATION',
        requiredSystems: ['PARASHARI', 'D10_DASAMSHA', 'DASHA', 'GOCHAR', 'JAIMINI_AMATYAKARAKA', 'KP_10TH_CUSP', 'LIFE_GRAPH'],
        omittedSystems: ['PALMISTRY', 'D9_NAVAMSHA_RELATIONAL', 'D7_SAPTAMSHA'],
        rationale: 'Focuses on 10th bhava, Amatyakaraka, D10 karmaphala varga, and active dasha lord strength.',
      };
    }

    if (d.includes('RELOCATION') || d.includes('TRAVEL') || d.includes('PROPERTY')) {
      return {
        domain: 'RELOCATION_PROPERTY',
        requiredSystems: ['PARASHARI_4TH_12TH', 'D4_CHATURTHAMSHA', 'DASHA', 'GOCHAR_SATURN_RAHU', 'LIFE_GRAPH'],
        omittedSystems: ['PALMISTRY', 'D10_DASAMSHA', 'D24_SIDDHAMSHA'],
        rationale: 'Focuses on 4th bhava (home/property), 12th bhava (foreign/distance), 9th bhava (long journeys), and D4 varga.',
      };
    }

    // Default multi-system
    return {
      domain: 'GENERAL_INQUIRY',
      requiredSystems: ['PARASHARI', 'DASHA', 'GOCHAR', 'LIFE_GRAPH'],
      omittedSystems: ['PALMISTRY'],
      rationale: 'Canonical baseline Jyotish analysis without extraneous speculative overlays.',
    };
  }

  /**
   * Assigns tier and weight score to an evidence item.
   * Calculation-derived evidence strictly outranks AI interpretation.
   */
  public static classifyEvidence(
    system: EvidenceItem['system'],
    finding: string,
    sourceType: EvidenceItem['sourceType'],
    isCorePlacement: boolean
  ): { tier: EvidenceTier; weight: number } {
    if (sourceType === 'AI_INTERPRETATION') {
      return { tier: 'SPECULATIVE', weight: 0.2 };
    }

    if (sourceType === 'USER_CONFIRMED') {
      return { tier: 'CONTEXTUAL', weight: 0.5 };
    }

    if (system === 'PARASHARI' && isCorePlacement) {
      return { tier: 'PRIMARY', weight: 1.0 };
    }

    if (system === 'DASHA' || (system === 'PARASHARI' && !isCorePlacement)) {
      return { tier: 'PRIMARY', weight: 0.95 };
    }

    if (system === 'VARGA' || system === 'GOCHAR') {
      return { tier: 'SECONDARY', weight: 0.75 };
    }

    if (system === 'KP' || system === 'JAIMINI' || system === 'NUMEROLOGY') {
      return { tier: 'SUPPORTING', weight: 0.55 };
    }

    return { tier: 'SPECULATIVE', weight: 0.25 };
  }

  /**
   * Contradiction Engine v2
   * Analyzes evidence across systems without averaging.
   */
  public static resolveContradictionsV2(evidence: EvidenceItem[]): ContradictionAnalysisV2 {
    const agreements: string[] = [];
    const disagreements: ContradictionAnalysisV2['disagreements'] = [];

    const positiveEvidence = evidence.filter((e) => e.supportsOutcome);
    const negativeEvidence = evidence.filter((e) => !e.supportsOutcome);

    // Group alignments
    if (positiveEvidence.length > 1) {
      agreements.push(
        `Positive indications shared by: ${positiveEvidence.map((e) => `${e.system} (${e.tier})`).join(', ')}.`
      );
    }
    if (negativeEvidence.length > 1) {
      agreements.push(
        `Restraining factors noted mutually by: ${negativeEvidence.map((e) => `${e.system} (${e.tier})`).join(', ')}.`
      );
    }

    // Pairwise contradiction detection
    for (const pos of positiveEvidence) {
      for (const neg of negativeEvidence) {
        // Evaluate hierarchy
        let moreRelevantSystem = pos.system as string;
        let reasonForRelevance = '';

        if (pos.tier === 'PRIMARY' && neg.tier !== 'PRIMARY') {
          moreRelevantSystem = pos.system;
          reasonForRelevance = `${pos.system} is PRIMARY foundational chart evidence, outranking ${neg.tier.toLowerCase()} transit/supplementary friction.`;
        } else if (neg.tier === 'PRIMARY' && pos.tier !== 'PRIMARY') {
          moreRelevantSystem = neg.system;
          reasonForRelevance = `${neg.system} is PRIMARY structural limitation, taking precedence over ${pos.tier.toLowerCase()} secondary beneficence.`;
        } else if (pos.system === 'DASHA' && neg.system === 'GOCHAR') {
          moreRelevantSystem = 'Vimshottari Dasha';
          reasonForRelevance = 'Dasha sets internal psychological capacity and karmic fruitage; Gochar transit represents temporary environmental resistance.';
        } else {
          moreRelevantSystem = pos.weightScore >= neg.weightScore ? pos.system : neg.system;
          reasonForRelevance = `Weight hierarchy assigns higher priority to ${moreRelevantSystem} based on deterministic calculation authority.`;
        }

        disagreements.push({
          systemA: { name: pos.system, finding: pos.finding, tier: pos.tier },
          systemB: { name: neg.system, finding: neg.finding, tier: neg.tier },
          whyDisagrees: `System ${pos.system} indicates supportive progress, whereas ${neg.system} flags friction or delay.`,
          moreRelevantSystem,
          reasonForRelevance,
          timeWindow: pos.temporalWindow || neg.temporalWindow || 'Current active cycle',
          uncertaintyAssessment: 'Outcome is contingent on user conscious action; environmental hurdles require disciplined pacing.',
        });
      }
    }

    const hasContradiction = disagreements.length > 0;

    let synthesis = '';
    if (!hasContradiction) {
      synthesis = 'All evaluated analytical systems align coherently without direct systemic tension.';
    } else {
      const topDisagreement = disagreements[0];
      synthesis = `System divergence detected. ${topDisagreement.reasonForRelevance} Guidance: Overall favorable potential exists, but near-term execution must accommodate real-world friction.`;
    }

    const uncertaintyDisclosure = hasContradiction
      ? 'High/Moderate uncertainty: Contradictory planetary and temporal factors necessitate cautious, non-fatalistic planning.'
      : 'Low/Moderate uncertainty: Concordant astrological indicators present, subject to real-world free will and execution.';

    return {
      hasContradiction,
      agreements,
      disagreements,
      synthesis,
      uncertaintyDisclosure,
    };
  }
}
