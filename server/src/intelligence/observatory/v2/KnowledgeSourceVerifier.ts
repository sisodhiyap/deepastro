/**
 * DeepAstro Observatory V2.0 - Knowledge Source Verifier
 * Every knowledge claim must carry source metadata + evidence hash.
 * INVARIANT: UNVERIFIED cannot silently become VERIFIED.
 */
import { KnowledgeSourceRecord, KnowledgeVerificationStatus } from './ObservatoryV2Types.js';
import { createHash } from 'crypto';

export class KnowledgeSourceVerifier {
  private static sources: Map<string, KnowledgeSourceRecord> = new Map();

  public static hashClaim(claimText: string): string {
    return createHash('sha256').update(claimText.trim()).digest('hex');
  }

  public static register(record: Omit<KnowledgeSourceRecord, 'evidenceHash'>): KnowledgeSourceRecord {
    const evidenceHash = this.hashClaim(record.claimText);
    const full: KnowledgeSourceRecord = { ...record, evidenceHash };
    this.sources.set(record.sourceId, full);
    return full;
  }

  public static verify(sourceId: string, currentClaimText: string): {
    valid: boolean;
    hashMatch: boolean;
    status: KnowledgeVerificationStatus;
    warning?: string;
  } {
    const record = this.sources.get(sourceId);
    if (!record) return { valid: false, hashMatch: false, status: 'UNVERIFIED', warning: 'Source not registered' };

    const currentHash = this.hashClaim(currentClaimText);
    const hashMatch = currentHash === record.evidenceHash;

    if (!hashMatch) {
      return {
        valid: false, hashMatch: false,
        status: 'CONTRADICTED',
        warning: 'Evidence hash mismatch â€” claim text was modified after registration',
      };
    }

    if (record.verificationStatus === 'DEPRECATED') {
      return { valid: false, hashMatch: true, status: 'DEPRECATED', warning: 'Source is deprecated' };
    }

    return { valid: true, hashMatch: true, status: record.verificationStatus };
  }

  public static attemptPromotion(sourceId: string, newStatus: KnowledgeVerificationStatus): {
    allowed: boolean; reason: string;
  } {
    const record = this.sources.get(sourceId);
    if (!record) return { allowed: false, reason: 'Source not found' };

    // UNVERIFIED â†’ VERIFIED requires explicit evidence
    if (record.verificationStatus === 'UNVERIFIED' && newStatus === 'VERIFIED') {
      return { allowed: false, reason: 'UNVERIFIED sources require explicit verification evidence before promotion to VERIFIED' };
    }
    if (record.verificationStatus === 'CONTRADICTED' && newStatus === 'VERIFIED') {
      return { allowed: false, reason: 'CONTRADICTED sources cannot be promoted to VERIFIED without contradiction resolution' };
    }

    record.verificationStatus = newStatus;
    return { allowed: true, reason: `Status updated to ${newStatus}` };
  }

  public static getSource(sourceId: string): KnowledgeSourceRecord | undefined {
    return this.sources.get(sourceId);
  }

  public static reset(): void { this.sources.clear(); }
}
