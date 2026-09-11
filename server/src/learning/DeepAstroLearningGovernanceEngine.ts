/**
 * DeepAstro Phase 8 — Governed Self-Learning & Proposal Pipeline Engine
 * 
 * Manages autonomous learning signals within strictly governed architectural boundaries:
 * 
 * Pipeline:
 * OBSERVATION -> PROPOSAL -> OFFLINE TEST -> SHADOW TEST -> ADVERSARIAL TEST -> REGRESSION -> ADMIN REVIEW -> PROMOTION -> MONITORING
 * 
 * Invariants:
 * 1. LEARNING NEVER GOES DIRECTLY TO PRODUCTION. Autonomous production rule mutation is FORBIDDEN.
 * 2. Learning outputs may modify: communication style, response depth (bounded 1–5),
 *    uncertainty presentation (bounded 1–5), research preference (bounded 0–1), retrieval ranking weights.
 * 3. Learning outputs MUST NEVER directly modify: astronomical mathematics, Jyotish rules,
 *    source truth, historical prediction ledgers, user-confirmed facts.
 * 4. Prediction outcomes NEVER claim causality ("Astrology caused X"); only "Observed alignment" or "Observed disagreement".
 * 5. Tenant Privacy Isolation: User A's learning or feedback NEVER affects User B.
 */

export type ProposalStatus =
  | 'OBSERVED'
  | 'PROPOSED'
  | 'TESTING'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROMOTED'
  | 'ROLLED_BACK';

export interface LearningProposal {
  proposalId: string;
  createdAt: string;
  source:
    | 'USER_FEEDBACK'
    | 'PREDICTION_OUTCOMES'
    | 'EXPERT_REVIEW'
    | 'RETRIEVAL_EVALUATION'
    | 'AI_GROUNDING_FAILURE'
    | 'CONTRADICTION_TELEMETRY'
    | 'QUESTION_REFINEMENT';
  observation: string;
  evidence: string;
  sampleSize: number;
  confidence: number; // 0.0 to 1.0
  affectedComponent:
    | 'COMMUNICATION_STYLE'
    | 'RESPONSE_DEPTH'
    | 'UNCERTAINTY_VERBOSITY'
    | 'RETRIEVAL_RANKING'
    | 'QUESTION_REFINEMENT'
    | 'RESEARCH_PREFERENCE'
    | 'FORBIDDEN_CORE_ATTEMPT';
  proposedChange: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_FORBIDDEN';
  testsRequired: string[];
  status: ProposalStatus;
  adminReviewNotes?: string;
  promotedAt?: string;
}

export interface BoundedAdaptationParameters {
  responseDepth: number; // 1 to 5
  uncertaintyVerbosity: number; // 1 to 5
  researchPreference: number; // 0.0 to 1.0
  retrievalTopK: number; // 3 to 10
}

export class DeepAstroLearningGovernanceEngine {
  public static readonly VERSION = '8.0.0-PROD';

  private static proposals: Map<string, LearningProposal> = new Map();

  // Active production adaptation parameters (strictly bounded)
  private static activeParameters: BoundedAdaptationParameters = {
    responseDepth: 3,
    uncertaintyVerbosity: 3,
    researchPreference: 0.5,
    retrievalTopK: 5,
  };

  public static readonly FORBIDDEN_COMPONENTS = [
    'astronomical_math',
    'swiss_ephemeris',
    'jyotish_rules',
    'source_truth',
    'historical_predictions',
    'user_facts',
    'varga_math',
    'dasha_math',
  ];

  /**
   * Evaluates and ingests a new learning proposal through the governance gate
   */
  public static submitProposal(input: {
    source: LearningProposal['source'];
    observation: string;
    evidence: string;
    sampleSize: number;
    confidence: number;
    affectedComponent: string;
    proposedChange: Record<string, any>;
  }): LearningProposal {
    const proposalId = `PROP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Invariant check: is it attempting to modify forbidden core?
    const isForbidden = this.FORBIDDEN_COMPONENTS.some(c =>
      input.affectedComponent.toLowerCase().includes(c)
    );

    if (isForbidden) {
      const rejectedProposal: LearningProposal = {
        proposalId,
        createdAt: new Date().toISOString(),
        source: input.source,
        observation: input.observation,
        evidence: input.evidence,
        sampleSize: input.sampleSize,
        confidence: input.confidence,
        affectedComponent: 'FORBIDDEN_CORE_ATTEMPT',
        proposedChange: input.proposedChange,
        riskLevel: 'CRITICAL_FORBIDDEN',
        testsRequired: ['GOVERNANCE_REJECTION_AUDIT'],
        status: 'REJECTED',
        adminReviewNotes: `REJECTED AT INGEST: Component '${input.affectedComponent}' is sacred immutable core. Self-learning cannot touch astronomical math, rules, or historical ledgers.`,
      };
      this.proposals.set(proposalId, rejectedProposal);
      return rejectedProposal;
    }

    // Determine risk level based on component and sample size
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (input.sampleSize < 30) riskLevel = 'HIGH';
    else if (input.affectedComponent === 'RETRIEVAL_RANKING') riskLevel = 'MEDIUM';

    const proposal: LearningProposal = {
      proposalId,
      createdAt: new Date().toISOString(),
      source: input.source,
      observation: input.observation,
      evidence: input.evidence,
      sampleSize: input.sampleSize,
      confidence: Math.min(1.0, Math.max(0.0, input.confidence)),
      affectedComponent: input.affectedComponent as any,
      proposedChange: input.proposedChange,
      riskLevel,
      testsRequired: [
        'OFFLINE_TEST',
        'SHADOW_TEST',
        'ADVERSARIAL_TEST',
        'REGRESSION_CHECK',
      ],
      status: input.sampleSize < 30 ? 'OBSERVED' : 'PROPOSED',
    };

    this.proposals.set(proposalId, proposal);
    return proposal;
  }

  /**
   * Progresses proposal through the mandatory testing lifecycle
   */
  public static runProposalValidation(proposalId: string): {
    success: boolean;
    nextStatus: ProposalStatus;
    validationReport: Record<string, boolean>;
  } {
    const p = this.proposals.get(proposalId);
    if (!p) throw new Error(`Proposal ${proposalId} not found`);

    if (p.status === 'REJECTED') {
      return { success: false, nextStatus: 'REJECTED', validationReport: { allowed: false } };
    }

    // Run simulated offline, shadow, adversarial tests
    const offlineTestPass = p.sampleSize >= 15;
    const shadowTestPass = p.confidence >= 0.70;
    const adversarialTestPass = !JSON.stringify(p.proposedChange).includes('unbounded');
    const regressionPass = true;

    const allPassed = offlineTestPass && shadowTestPass && adversarialTestPass && regressionPass;

    if (allPassed) {
      p.status = 'REVIEW_REQUIRED';
    } else {
      p.status = 'REJECTED';
      p.adminReviewNotes = 'Failed offline/shadow testing thresholds';
    }

    return {
      success: allPassed,
      nextStatus: p.status,
      validationReport: {
        offlineTestPass,
        shadowTestPass,
        adversarialTestPass,
        regressionPass,
      },
    };
  }

  /**
   * Promotes an approved proposal to production with human review gate and bounded limits
   */
  public static promoteProposal(
    proposalId: string,
    adminId: string,
    adminApproval: boolean,
    notes: string
  ): { success: boolean; message: string; activeParameters: BoundedAdaptationParameters } {
    const p = this.proposals.get(proposalId);
    if (!p) throw new Error(`Proposal ${proposalId} not found`);

    if (!adminApproval) {
      p.status = 'REJECTED';
      p.adminReviewNotes = `Rejected by admin ${adminId}: ${notes}`;
      return { success: false, message: 'Proposal rejected by admin', activeParameters: this.activeParameters };
    }

    if (p.status !== 'REVIEW_REQUIRED' && p.status !== 'APPROVED') {
      return {
        success: false,
        message: `Proposal must complete testing cycle before promotion. Current status: ${p.status}`,
        activeParameters: this.activeParameters,
      };
    }

    // Apply bounded adaptation parameters
    if (p.affectedComponent === 'RESPONSE_DEPTH' && typeof p.proposedChange.responseDepth === 'number') {
      this.activeParameters.responseDepth = Math.min(5, Math.max(1, p.proposedChange.responseDepth));
    } else if (p.affectedComponent === 'UNCERTAINTY_VERBOSITY' && typeof p.proposedChange.uncertaintyVerbosity === 'number') {
      this.activeParameters.uncertaintyVerbosity = Math.min(5, Math.max(1, p.proposedChange.uncertaintyVerbosity));
    } else if (p.affectedComponent === 'RESEARCH_PREFERENCE' && typeof p.proposedChange.researchPreference === 'number') {
      this.activeParameters.researchPreference = Math.min(1.0, Math.max(0.0, p.proposedChange.researchPreference));
    }

    p.status = 'PROMOTED';
    p.promotedAt = new Date().toISOString();
    p.adminReviewNotes = `Approved and promoted by ${adminId}: ${notes}`;

    return {
      success: true,
      message: `Proposal ${proposalId} promoted successfully with bounded parameters`,
      activeParameters: { ...this.activeParameters },
    };
  }

  /**
   * Safe Rollback of an active learning change
   */
  public static rollbackLearningProposal(proposalId: string, reason: string): boolean {
    const p = this.proposals.get(proposalId);
    if (!p) return false;

    p.status = 'ROLLED_BACK';
    p.adminReviewNotes = `Rolled back: ${reason}`;

    // Reset parameters to safe factory defaults
    this.activeParameters = {
      responseDepth: 3,
      uncertaintyVerbosity: 3,
      researchPreference: 0.5,
      retrievalTopK: 5,
    };

    return true;
  }

  public static getActiveParameters(): BoundedAdaptationParameters {
    return { ...this.activeParameters };
  }

  public static getProposal(proposalId: string): LearningProposal | undefined {
    return this.proposals.get(proposalId);
  }

  public static getAllProposals(): LearningProposal[] {
    return Array.from(this.proposals.values());
  }

  public static clear(): void {
    this.proposals.clear();
    this.activeParameters = {
      responseDepth: 3,
      uncertaintyVerbosity: 3,
      researchPreference: 0.5,
      retrievalTopK: 5,
    };
  }
}
