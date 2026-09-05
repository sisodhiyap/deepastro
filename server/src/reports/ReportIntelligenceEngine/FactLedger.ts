/**
 * Fact Ledger — Core Provenance and Verification System
 * Tracks every single fact, its origin, verification state, and confidence.
 * Guarantees that downstream interpretation and presentation layers never invent facts.
 */

export type FactSource =
  | 'USER_INPUT'
  | 'OCR'
  | 'ASTROLOGY_ENGINE'
  | 'RULE_ENGINE'
  | 'CALENDAR_ENGINE'
  | 'NUMEROLOGY_ENGINE'
  | 'AI_INTERPRETATION';

export type VerificationStatus =
  | 'VERIFIED'
  | 'CONFLICT'
  | 'UNVERIFIED'
  | 'INCONCLUSIVE';

export type ConfidenceLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'CONFLICT'
  | 'INCONCLUSIVE';

export interface VerifiedFact<T = any> {
  key: string;
  value: T;
  source: FactSource;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0.0 to 1.0
  verified: boolean;
  verificationStatus: VerificationStatus;
  calculationVersion?: string;
  evidence: string[];
  warnings?: string[];
  timestamp: string;
}

export class FactLedger {
  private facts: Map<string, VerifiedFact> = new Map();
  private auditLog: Array<{ action: string; key: string; details: string; timestamp: string }> = [];

  constructor(public readonly ledgerId: string = `ledger_${Date.now()}`) {}

  /**
   * Records a new fact into the ledger with strict provenance tracking.
   */
  public recordFact<T>(fact: Omit<VerifiedFact<T>, 'timestamp'>): VerifiedFact<T> {
    const verifiedFact: VerifiedFact<T> = {
      ...fact,
      timestamp: new Date().toISOString(),
    };

    const existing = this.facts.get(fact.key);
    if (existing && existing.verified && existing.source === 'ASTROLOGY_ENGINE' && fact.source !== 'ASTROLOGY_ENGINE') {
      // Deterministic Astrology Engine outranks all other sources
      this.auditLog.push({
        action: 'OVERRIDE_PREVENTED',
        key: fact.key,
        details: `Attempted overwrite of deterministic fact by lower-priority source ${fact.source}`,
        timestamp: new Date().toISOString(),
      });
      return existing as VerifiedFact<T>;
    }

    this.facts.set(fact.key, verifiedFact);
    this.auditLog.push({
      action: 'FACT_RECORDED',
      key: fact.key,
      details: `Source: ${fact.source}, Status: ${fact.verificationStatus}, Confidence: ${fact.confidence}`,
      timestamp: verifiedFact.timestamp,
    });

    return verifiedFact;
  }

  public getFact<T>(key: string): VerifiedFact<T> | undefined {
    return this.facts.get(key) as VerifiedFact<T> | undefined;
  }

  public getFactValue<T>(key: string, defaultValue?: T): T | undefined {
    const fact = this.facts.get(key);
    return fact ? (fact.value as T) : defaultValue;
  }

  public hasFact(key: string): boolean {
    return this.facts.has(key);
  }

  public getAllFacts(): VerifiedFact[] {
    return Array.from(this.facts.values());
  }

  public getVerifiedFacts(): VerifiedFact[] {
    return this.getAllFacts().filter((f) => f.verified && f.verificationStatus === 'VERIFIED');
  }

  public getConflicts(): VerifiedFact[] {
    return this.getAllFacts().filter((f) => f.verificationStatus === 'CONFLICT');
  }

  public getAuditTrail() {
    return [...this.auditLog];
  }

  /**
   * Serializes the entire ledger into an immutable snapshot
   */
  public toSnapshot() {
    return {
      ledgerId: this.ledgerId,
      totalFacts: this.facts.size,
      verifiedCount: this.getVerifiedFacts().length,
      conflictsCount: this.getConflicts().length,
      facts: Object.fromEntries(this.facts),
      auditTrail: this.auditLog,
    };
  }
}
