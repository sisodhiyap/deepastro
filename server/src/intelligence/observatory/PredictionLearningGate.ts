/**
 * DeepAstro Prediction Learning Gate
 * 9-stage lifecycle:
 * OBSERVED -> PROPOSED -> TESTING -> OUT_OF_SAMPLE_VALIDATION -> REVIEW_REQUIRED -> ADMIN_APPROVAL -> CANARY -> MONITORING -> PROMOTED.
 * Invariant: Observed outcomes never immediately alter production calculation behavior.
 */

export type LearningStage =
  | 'OBSERVED'
  | 'PROPOSED'
  | 'TESTING'
  | 'OUT_OF_SAMPLE_VALIDATION'
  | 'REVIEW_REQUIRED'
  | 'ADMIN_APPROVAL'
  | 'CANARY'
  | 'MONITORING'
  | 'PROMOTED';

export interface LearningCandidate {
  candidateId: string;
  ruleName: string;
  stage: LearningStage;
  proposedChange: string;
  validationScore: number;
  adminApproved: boolean;
}

export class PredictionLearningGate {
  private static candidates: Map<string, LearningCandidate> = new Map();

  public static proposeCandidate(ruleName: string, proposedChange: string): LearningCandidate {
    const candidateId = `lrn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const candidate: LearningCandidate = {
      candidateId,
      ruleName,
      stage: 'OBSERVED',
      proposedChange,
      validationScore: 0,
      adminApproved: false,
    };
    this.candidates.set(candidateId, candidate);
    return candidate;
  }

  public static advanceStage(candidateId: string, nextStage: LearningStage, adminApproval = false): LearningCandidate {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) throw new Error(`Candidate ${candidateId} not found.`);

    if (nextStage === 'PROMOTED' && !adminApproval) {
      throw new Error('ADMIN_APPROVAL_REQUIRED: Promotion to production requires explicit administrator approval.');
    }

    candidate.stage = nextStage;
    if (adminApproval) candidate.adminApproved = true;
    this.candidates.set(candidateId, candidate);
    return { ...candidate };
  }
}
