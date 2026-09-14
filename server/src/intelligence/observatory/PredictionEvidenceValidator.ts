/**
 * DeepAstro Prediction Evidence Validator
 * Weighted hierarchy:
 * 1. Deterministic calculation (1.0)
 * 2. Verified structured knowledge (0.85)
 * 3. User-confirmed real-world outcome (0.80)
 * 4. Authoritative external source (0.75)
 * 5. Multi-system convergence (0.70)
 * 6. Historical empirical observation (0.60)
 * 7. AI synthesis (0.30)
 * 8. Weak / Unverified inference (0.10)
 * Invariant: AI-generated text alone must never become independent evidence.
 */

import { EvidenceItem, EvidenceCategory } from './ObservatoryTypes.js';
import crypto from 'crypto';

export class PredictionEvidenceValidator {
  private static readonly WEIGHTS: Record<EvidenceCategory, number> = {
    CALCULATION: 1.0,
    PRIMARY_SOURCE: 0.9,
    VERIFIED_KNOWLEDGE: 0.85,
    USER_CONFIRMED: 0.8,
    MULTI_SYSTEM_CONVERGENCE: 0.7,
    SECONDARY_SOURCE: 0.65,
    HISTORICAL_OBSERVATION: 0.6,
    AI_INFERENCE: 0.3,
    WEAK_INFERENCE: 0.1,
    UNVERIFIED: 0.0,
  };

  public static createEvidenceItem(params: {
    category: EvidenceCategory;
    source: string;
    details: string;
  }): EvidenceItem {
    const evidenceId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const weight = this.WEIGHTS[params.category] ?? 0.1;
    const evidenceHash = crypto.createHash('sha256').update(params.category + ':' + params.source + ':' + params.details).digest('hex');

    return {
      evidenceId,
      category: params.category,
      source: params.source,
      weight,
      verifiedAt: new Date().toISOString(),
      details: params.details,
      evidenceHash,
    };
  }

  public static evaluateEvidenceSet(items: EvidenceItem[]): {
    compositeScore: number;
    hasDeterministicCalculation: boolean;
    hasVerifiedKnowledge: boolean;
    aiOnlyRatio: number;
  } {
    if (!items || items.length === 0) {
      return { compositeScore: 0, hasDeterministicCalculation: false, hasVerifiedKnowledge: false, aiOnlyRatio: 1.0 };
    }

    const totalWeight = items.reduce((acc, it) => acc + it.weight, 0);
    const compositeScore = Number((totalWeight / items.length).toFixed(3));
    const hasDeterministicCalculation = items.some((it) => it.category === 'CALCULATION');
    const hasVerifiedKnowledge = items.some((it) => it.category === 'VERIFIED_KNOWLEDGE');

    const aiItems = items.filter((it) => it.category === 'AI_INFERENCE' || it.category === 'WEAK_INFERENCE');
    const aiOnlyRatio = Number((aiItems.length / items.length).toFixed(2));

    return {
      compositeScore,
      hasDeterministicCalculation,
      hasVerifiedKnowledge,
      aiOnlyRatio,
    };
  }
}
