/**
 * DeepAstro Prediction Audit Engine
 * Cryptographic tamper-evident audit ledger for all observatory transactions.
 */

import crypto from 'crypto';

export interface AuditEntry {
  auditId: string;
  action: string;
  userId?: string;
  predictionId?: string;
  timestamp: string;
  hash: string;
}

export class PredictionAuditEngine {
  private static ledger: AuditEntry[] = [];

  public static recordAction(action: string, meta: { userId?: string; predictionId?: string }): AuditEntry {
    const auditId = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const hash = crypto.createHash('sha256').update(`${auditId}:${action}:${meta.userId || ''}:${timestamp}`).digest('hex');

    const entry: AuditEntry = {
      auditId,
      action,
      userId: meta.userId,
      predictionId: meta.predictionId,
      timestamp,
      hash,
    };

    this.ledger.push(entry);
    return entry;
  }

  public static getLedger(): AuditEntry[] {
    return [...this.ledger];
  }
}
