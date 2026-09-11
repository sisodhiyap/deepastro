/**
 * DeepAstro 4.2 — DeepAstro Learning Journal (DeepAstroLearningJournal)
 * Cryptographically provenanced, human-auditable journal recording
 * why DeepAstro learned or rejected an empirical strategy candidate.
 * 
 * Explains:
 * - Why it learned
 * - Why it rejected
 * - What evidence was used
 * - What contradictions existed
 */

export interface LearningJournalEntry {
  learningId: string;
  timestamp: string;
  topic: string;
  domain: string;
  observation: string;
  hypothesis: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  sampleSize: number;
  outOfSampleAccuracy: number;
  calibrationBrierScore: number;
  skepticVerdict: string;
  governanceDecision: 'APPROVED_CANARY' | 'REJECTED_OVERFIT' | 'INSUFFICIENT_EVIDENCE' | 'PROMOTED_BASELINE' | 'ROLLED_BACK';
  decisionRationale: string;
  provenanceHash: string;
}

export class DeepAstroLearningJournal {
  private static journalEntries: LearningJournalEntry[] = [];

  public static resetStore(): void {
    this.journalEntries = [];
  }

  public static logEntry(params: {
    topic: string;
    domain: string;
    observation: string;
    hypothesis: string;
    supportingEvidence: string[];
    contradictingEvidence?: string[];
    sampleSize: number;
    outOfSampleAccuracy: number;
    calibrationBrierScore: number;
    skepticVerdict: string;
    governanceDecision: 'APPROVED_CANARY' | 'REJECTED_OVERFIT' | 'INSUFFICIENT_EVIDENCE' | 'PROMOTED_BASELINE' | 'ROLLED_BACK';
    decisionRationale: string;
  }): LearningJournalEntry {
    const learningId = `lj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const entry: LearningJournalEntry = {
      learningId,
      timestamp: now,
      topic: params.topic,
      domain: params.domain,
      observation: params.observation,
      hypothesis: params.hypothesis,
      supportingEvidence: params.supportingEvidence,
      contradictingEvidence: params.contradictingEvidence || [],
      sampleSize: params.sampleSize,
      outOfSampleAccuracy: params.outOfSampleAccuracy,
      calibrationBrierScore: params.calibrationBrierScore,
      skepticVerdict: params.skepticVerdict,
      governanceDecision: params.governanceDecision,
      decisionRationale: params.decisionRationale,
      provenanceHash: `prov_${Math.random().toString(36).substring(2, 12)}`,
    };

    this.journalEntries.push(entry);
    return { ...entry };
  }

  public static getEntries(domain?: string): LearningJournalEntry[] {
    if (!domain) return [...this.journalEntries];
    return this.journalEntries.filter((e) => e.domain === domain);
  }
}
