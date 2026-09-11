/**
 * DeepAstro 4.0 — Knowledge Learning Engine (KnowledgeLearningEngine)
 * Manages learned knowledge candidates with complete audit provenance:
 * OBSERVATION -> CLAIM -> EVIDENCE -> HYPOTHESIS -> TEST -> VALIDATION -> GOVERNANCE -> KNOWLEDGE CANDIDATE -> PROMOTION -> MONITORING
 * 
 * Invariants:
 * 1. Never create anonymous knowledge.
 * 2. Every learned item has complete origin, source IDs, evidence IDs, and test metrics.
 * 3. Separate GLOBAL KNOWLEDGE from USER-SPECIFIC OBSERVATIONS.
 */

export interface KnowledgeItem {
  knowledgeId: string;
  claim: string;
  domain: string;
  scope: 'GLOBAL' | 'USER_SPECIFIC';
  userId?: string;
  sourceIds: string[];
  evidenceIds: string[];
  supportingPredictions: string[];
  contradictingPredictions: string[];
  confidence: number;
  version: number;
  status: 'CANDIDATE' | 'PROMOTED' | 'MONITORING' | 'DEPRECATED';
  createdAt: string;
  promotedAt?: string;
}

export class KnowledgeLearningEngine {
  private static knowledgeStore: Map<string, KnowledgeItem> = new Map();

  public static resetStore(): void {
    this.knowledgeStore.clear();
  }

  public static registerCandidate(params: {
    claim: string;
    domain: string;
    scope: 'GLOBAL' | 'USER_SPECIFIC';
    userId?: string;
    sourceIds: string[];
    evidenceIds: string[];
    supportingPredictions: string[];
    contradictingPredictions?: string[];
    confidence: number;
  }): KnowledgeItem {
    const knowledgeId = `kn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const item: KnowledgeItem = {
      knowledgeId,
      claim: params.claim,
      domain: params.domain,
      scope: params.scope,
      userId: params.userId,
      sourceIds: params.sourceIds,
      evidenceIds: params.evidenceIds,
      supportingPredictions: params.supportingPredictions,
      contradictingPredictions: params.contradictingPredictions || [],
      confidence: params.confidence,
      version: 1,
      status: 'CANDIDATE',
      createdAt: new Date().toISOString(),
    };

    this.knowledgeStore.set(knowledgeId, item);
    return { ...item };
  }

  public static promoteCandidate(knowledgeId: string, adminKey: string): KnowledgeItem {
    const item = this.knowledgeStore.get(knowledgeId);
    if (!item) {
      throw new Error(`KNOWLEDGE_NOT_FOUND: Item ${knowledgeId} does not exist.`);
    }

    if (adminKey !== 'DEEPASTRO_ADMIN_SIGNATURE_KEY') {
      throw new Error('UNAUTHORIZED_PROMOTION: Requires valid human administrator key.');
    }

    if (item.supportingPredictions.length < 5) {
      throw new Error(`INSUFFICIENT_SAMPLE: Must have >= 5 supporting predictions before promotion.`);
    }

    item.status = 'PROMOTED';
    item.promotedAt = new Date().toISOString();
    this.knowledgeStore.set(knowledgeId, item);
    return { ...item };
  }

  public static getKnowledge(knowledgeId: string): KnowledgeItem | undefined {
    const item = this.knowledgeStore.get(knowledgeId);
    return item ? { ...item } : undefined;
  }

  public static queryKnowledge(filter: { domain?: string; scope?: 'GLOBAL' | 'USER_SPECIFIC'; userId?: string }): KnowledgeItem[] {
    return Array.from(this.knowledgeStore.values()).filter((item) => {
      if (filter.domain && item.domain !== filter.domain) return false;
      if (filter.scope && item.scope !== filter.scope) return false;
      if (filter.userId && item.userId !== filter.userId) return false;
      return true;
    });
  }
}
