/**
 * DeepAstro 4.0 — Claim Verification Engine (ClaimVerificationEngine)
 * Verifies external and astrological factual claims against source taxonomies.
 * 
 * Sources classified as:
 * PRIMARY, SECONDARY, REFERENCE, ACADEMIC, TECHNICAL, TRADITIONAL, EXPERT, COMMUNITY, UNVERIFIED
 * 
 * Verification Statuses:
 * VERIFIED, SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, UNVERIFIED, INSUFFICIENT_EVIDENCE
 * 
 * Invariants:
 * 1. NO EVIDENCE = NO STRONG CLAIM.
 * 2. If sources disagree, do not silently pick one; document the divergence.
 */

export type SourceType =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'REFERENCE'
  | 'ACADEMIC'
  | 'TECHNICAL'
  | 'TRADITIONAL'
  | 'EXPERT'
  | 'COMMUNITY'
  | 'UNVERIFIED';

export type ClaimVerificationStatus =
  | 'VERIFIED'
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTRADICTED'
  | 'UNVERIFIED'
  | 'INSUFFICIENT_EVIDENCE';

export interface VerifiedClaimRecord {
  claimId: string;
  claimText: string;
  source: string;
  sourceType: SourceType;
  retrievalTime: string;
  supportingExcerptReference: string;
  confidence: number;
  verificationStatus: ClaimVerificationStatus;
  contradictingSources: {
    sourceName: string;
    sourceType: SourceType;
    opposingAssertion: string;
  }[];
}

export class ClaimVerificationEngine {
  private static verifiedClaims: Map<string, VerifiedClaimRecord> = new Map();

  public static resetStore(): void {
    this.verifiedClaims.clear();
  }

  public static verifyClaim(params: {
    claimText: string;
    source: string;
    sourceType: SourceType;
    supportingExcerpt: string;
    knownContradictions?: {
      sourceName: string;
      sourceType: SourceType;
      opposingAssertion: string;
    }[];
  }): VerifiedClaimRecord {
    const { claimText, source, sourceType, supportingExcerpt, knownContradictions = [] } = params;
    const claimId = `clm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Calculate confidence based on source quality
    let confidence = 0.5;
    if (sourceType === 'PRIMARY' || sourceType === 'TRADITIONAL') confidence = 0.9;
    else if (sourceType === 'ACADEMIC' || sourceType === 'REFERENCE') confidence = 0.85;
    else if (sourceType === 'EXPERT' || sourceType === 'TECHNICAL') confidence = 0.75;
    else if (sourceType === 'SECONDARY') confidence = 0.65;
    else if (sourceType === 'COMMUNITY' || sourceType === 'UNVERIFIED') confidence = 0.35;

    // Evaluate verification status
    let verificationStatus: ClaimVerificationStatus = 'SUPPORTED';
    if (!supportingExcerpt || supportingExcerpt.trim().length === 0) {
      verificationStatus = 'INSUFFICIENT_EVIDENCE';
      confidence = 0.2;
    } else if (knownContradictions.length > 0 && knownContradictions.some((c) => c.sourceType === 'PRIMARY' || c.sourceType === 'TRADITIONAL')) {
      verificationStatus = 'CONTRADICTED';
      confidence *= 0.6;
    } else if (sourceType === 'PRIMARY' || sourceType === 'TRADITIONAL') {
      verificationStatus = 'VERIFIED';
    } else if (sourceType === 'UNVERIFIED') {
      verificationStatus = 'UNVERIFIED';
    }

    const record: VerifiedClaimRecord = {
      claimId,
      claimText,
      source,
      sourceType,
      retrievalTime: new Date().toISOString(),
      supportingExcerptReference: supportingExcerpt,
      confidence: Number(confidence.toFixed(3)),
      verificationStatus,
      contradictingSources: knownContradictions,
    };

    this.verifiedClaims.set(claimId, record);
    return { ...record };
  }

  public static getClaim(claimId: string): VerifiedClaimRecord | undefined {
    const c = this.verifiedClaims.get(claimId);
    return c ? { ...c } : undefined;
  }
}
