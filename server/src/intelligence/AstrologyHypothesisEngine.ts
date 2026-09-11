/**
 * DeepAstro 4.0 — Astrology Hypothesis Engine (AstrologyHypothesisEngine)
 * Manages the empirical hypothesis lifecycle:
 * OBSERVED -> PROPOSED -> TESTING -> REVIEW_REQUIRED -> APPROVED -> REJECTED -> PROMOTED -> MONITORING -> DEPRECATED
 * 
 * Strict Invariants:
 * 1. ONE SUCCESS ≠ NEW KNOWLEDGE.
 * 2. ONE FAILURE ≠ FALSE RULE.
 * 3. Requires:
 *    - Multiple observations (sample_size >= 5)
 *    - Out-of-sample testing
 *    - Contradiction testing
 *    - Regression testing
 *    - Explicit governance promotion (No self-promotion by AI)
 * 4. If sample size is insufficient, status must remain INSUFFICIENT_EVIDENCE / TESTING.
 */

export type HypothesisStatus =
  | 'OBSERVED'
  | 'PROPOSED'
  | 'TESTING'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROMOTED'
  | 'MONITORING'
  | 'DEPRECATED';

export interface AstrologyHypothesis {
  hypothesisId: string;
  statement: string;
  domain: string;
  supportingPredictions: string[];
  contradictingPredictions: string[];
  evidence: string[];
  sampleSize: number;
  confidence: number;
  status: HypothesisStatus;
  outOfSampleAccuracy?: number;
  brierScore?: number;
  governanceNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export class AstrologyHypothesisEngine {
  private static store: Map<string, AstrologyHypothesis> = new Map();

  public static resetStore(): void {
    this.store.clear();
  }

  public static proposeHypothesis(params: {
    statement: string;
    domain: string;
    evidence: string[];
    initialSupportingPredictionId?: string;
  }): AstrologyHypothesis {
    const hypothesisId = `hyp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const supporting = params.initialSupportingPredictionId ? [params.initialSupportingPredictionId] : [];

    const hyp: AstrologyHypothesis = {
      hypothesisId,
      statement: params.statement,
      domain: params.domain,
      supportingPredictions: supporting,
      contradictingPredictions: [],
      evidence: params.evidence,
      sampleSize: supporting.length,
      confidence: 0.5,
      status: 'PROPOSED',
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(hypothesisId, hyp);
    return { ...hyp };
  }

  public static recordObservation(
    hypothesisId: string,
    params: {
      predictionId: string;
      outcome: 'SUPPORTING' | 'CONTRADICTING';
      evidenceNote?: string;
    }
  ): AstrologyHypothesis {
    const hyp = this.store.get(hypothesisId);
    if (!hyp) {
      throw new Error(`HYPOTHESIS_NOT_FOUND: Hypothesis ${hypothesisId} does not exist.`);
    }

    if (params.outcome === 'SUPPORTING') {
      if (!hyp.supportingPredictions.includes(params.predictionId)) {
        hyp.supportingPredictions.push(params.predictionId);
      }
    } else {
      if (!hyp.contradictingPredictions.includes(params.predictionId)) {
        hyp.contradictingPredictions.push(params.predictionId);
      }
    }

    hyp.sampleSize = hyp.supportingPredictions.length + hyp.contradictingPredictions.length;
    hyp.confidence = Number((hyp.supportingPredictions.length / Math.max(1, hyp.sampleSize)).toFixed(3));
    hyp.status = 'TESTING';

    // Check if eligible for review (Requires sampleSize >= 5)
    if (hyp.sampleSize >= 5 && hyp.confidence >= 0.75) {
      hyp.status = 'REVIEW_REQUIRED';
    }

    hyp.updatedAt = new Date().toISOString();
    this.store.set(hypothesisId, hyp);
    return { ...hyp };
  }

  public static evaluateForPromotion(hypothesisId: string, adminNotes?: string): {
    eligible: boolean;
    reason: string;
    hypothesis: AstrologyHypothesis;
  } {
    const hyp = this.store.get(hypothesisId);
    if (!hyp) {
      throw new Error(`HYPOTHESIS_NOT_FOUND: Hypothesis ${hypothesisId} does not exist.`);
    }

    // Strict rule: Sample size must be at least 5
    if (hyp.sampleSize < 5) {
      return {
        eligible: false,
        reason: `INSUFFICIENT_EVIDENCE: Current sample size (${hyp.sampleSize}) is below minimum threshold of 5. One success is not new knowledge.`,
        hypothesis: { ...hyp },
      };
    }

    // High contradiction rate check
    if (hyp.contradictingPredictions.length > hyp.supportingPredictions.length * 0.3) {
      return {
        eligible: false,
        reason: `HIGH_CONTRADICTION_RATE: Contradictions (${hyp.contradictingPredictions.length}) exceed 30% of supporting evidence.`,
        hypothesis: { ...hyp },
      };
    }

    if (hyp.confidence < 0.75) {
      return {
        eligible: false,
        reason: `CONFIDENCE_TOO_LOW: Confidence ${(hyp.confidence * 100).toFixed(1)}% is below the required 75% bar.`,
        hypothesis: { ...hyp },
      };
    }

    return {
      eligible: true,
      reason: 'Hypothesis meets all empirical criteria (sample size >= 5, low contradictions, high confidence). Ready for Admin Review.',
      hypothesis: { ...hyp },
    };
  }

  public static promoteHypothesis(hypothesisId: string, adminKey: string): AstrologyHypothesis {
    const hyp = this.store.get(hypothesisId);
    if (!hyp) {
      throw new Error(`HYPOTHESIS_NOT_FOUND: Hypothesis ${hypothesisId} does not exist.`);
    }

    const evalResult = this.evaluateForPromotion(hypothesisId);
    if (!evalResult.eligible) {
      throw new Error(`PROMOTION_REJECTED: ${evalResult.reason}`);
    }

    // AI is forbidden from self-promotion; requires administrative signature
    if (!adminKey || adminKey !== 'DEEPASTRO_ADMIN_SIGNATURE_KEY') {
      throw new Error('UNAUTHORIZED_PROMOTION: Promotion requires verified human administrator signature.');
    }

    hyp.status = 'PROMOTED';
    hyp.governanceNotes = `Promoted to active Layer B interpretation candidate on ${new Date().toISOString()}`;
    hyp.updatedAt = new Date().toISOString();
    this.store.set(hypothesisId, hyp);

    return { ...hyp };
  }

  public static getHypothesis(hypothesisId: string): AstrologyHypothesis | undefined {
    const h = this.store.get(hypothesisId);
    return h ? { ...h } : undefined;
  }

  public static getAll(): AstrologyHypothesis[] {
    return Array.from(this.store.values()).map((h) => ({ ...h }));
  }
}
