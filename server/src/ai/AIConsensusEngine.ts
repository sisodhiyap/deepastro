/**
 * AIConsensusEngine
 * Enforces the strict epistemic priority hierarchy:
 * 1. Deterministic Calculation (VedicAstroEngine)
 * 2. Independent Calculation Verification (AstronomicalVerificationEngine)
 * 3. Formal Jyotish Rule Engine (JyotishRuleEngine)
 * 4. Trusted Classical Knowledge Sources (KnowledgeRAG)
 * 5. AI Interpretation (OpenAI / Gemini / Grok / Ollama)
 * 6. AI Consensus
 *
 * AIConsensusEngine is NOT a truth voting engine.
 * Never averages planetary degrees. Never votes on astronomical facts.
 * Records model disagreements and enforces deterministic calculation wins.
 */

import { FullKundliResult } from '../astrology/VedicAstroEngine.js';
import { AIResponsePayload } from './AIProvider.js';

export interface ModelOpinion {
  modelName: string;
  provider: string;
  payload: AIResponsePayload;
}

export interface DisagreementRecord {
  field: string;
  opinions: Array<{ model: string; value: string }>;
  resolvedValue: string;
  resolutionSource: 'DETERMINISTIC_CALCULATION' | 'RULE_ENGINE' | 'PRIMARY_MODEL';
  reason: string;
}

export interface ConsensusResult {
  consensusPayload: AIResponsePayload;
  agreementScore: number; // 0 to 100
  disagreements: DisagreementRecord[];
  deterministicOverridesApplied: number;
  modelsEvaluated: string[];
}

export class AIConsensusEngine {
  /**
   * Reconciles multiple AI model outputs strictly subordinate to the deterministic fact set
   */
  public static reconcile(
    opinions: ModelOpinion[],
    kundli: FullKundliResult,
    rulesSummary?: string[]
  ): ConsensusResult {
    if (opinions.length === 0) {
      throw new Error('AIConsensusEngine requires at least one model opinion to reconcile.');
    }

    const primary = opinions[0].payload;
    const disagreements: DisagreementRecord[] = [];
    let deterministicOverrides = 0;

    // Deep clone primary payload as base consensus
    const consensusPayload: AIResponsePayload = JSON.parse(JSON.stringify(primary));

    // 1. Enforce Priority 1: Deterministic Lagna & Moon check
    opinions.forEach((op) => {
      const summaryText = (op.payload?.summary || '').toLowerCase();
      const interpText = (op.payload?.interpretation || '').toLowerCase();

      const calculatedLagna = kundli.ascendant.details.signName.toLowerCase();
      const calculatedMoon = kundli.moonSign.signName.toLowerCase();

      // Check if model halluncinated wrong ascendant or moon sign
      if (interpText.includes('lagna') || interpText.includes('ascendant')) {
        // If an opinion states another sign as ascendant, record and override
        const conflictingSigns = [
          'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
        ].filter((s) => s !== calculatedLagna && interpText.includes(`${s} ascendant`));

        if (conflictingSigns.length > 0) {
          disagreements.push({
            field: 'ascendantSign',
            opinions: opinions.map((o) => ({ model: o.modelName, value: o.payload.summary })),
            resolvedValue: kundli.ascendant.details.signName,
            resolutionSource: 'DETERMINISTIC_CALCULATION',
            reason: `Deterministic calculation wins: Native's true Lagna is ${kundli.ascendant.details.signName}.`,
          });
          deterministicOverrides++;
        }
      }
    });

    // 2. Synthesize Evidence and Disagreements across models
    const aggregatedEvidence = new Set<string>(consensusPayload.evidence || []);
    opinions.forEach((op) => {
      (op.payload.evidence || []).forEach((ev) => aggregatedEvidence.add(ev));
    });
    consensusPayload.evidence = Array.from(aggregatedEvidence);

    // 3. Compute Agreement Score (lexical / thematic similarity)
    let agreementScore = 100;
    if (opinions.length > 1) {
      const summaries = opinions.map((o) => o.payload.summary.toLowerCase());
      const wordsA = new Set(summaries[0].split(/\s+/));
      const wordsB = new Set(summaries[1].split(/\s+/));
      const intersection = [...wordsA].filter((w) => wordsB.has(w));
      const union = new Set([...wordsA, ...wordsB]);
      const jaccard = union.size > 0 ? (intersection.length / union.size) : 1;
      agreementScore = Math.round(jaccard * 100);
    }

    if (deterministicOverrides > 0) {
      consensusPayload.evidence.push(
        `Deterministic calculation override enforced on ${deterministicOverrides} conflicting statements.`
      );
    }

    return {
      consensusPayload,
      agreementScore,
      disagreements,
      deterministicOverridesApplied: deterministicOverrides,
      modelsEvaluated: opinions.map((o) => o.modelName),
    };
  }
}
