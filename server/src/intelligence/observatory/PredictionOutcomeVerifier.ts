/**
 * DeepAstro Prediction Outcome Verifier
 * Validates cryptographic signatures, tenant isolation, and verification authenticity.
 */

import { PredictionOutcomeRecord } from './ObservatoryTypes.js';
import crypto from 'crypto';

export class PredictionOutcomeVerifier {
  public static verifyRecord(record: PredictionOutcomeRecord, requestingUserId: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (!record) {
      return { isValid: false, reason: 'RECORD_NOT_FOUND' };
    }

    // Tenant isolation verification
    if (record.userId !== requestingUserId) {
      return { isValid: false, reason: 'TENANT_ISOLATION_VIOLATION' };
    }

    // Cryptographic signature check
    const expectedSig = crypto
      .createHash('sha256')
      .update(`${record.userId}:${record.predictionId}:${record.status}:${record.confirmedAt}`)
      .digest('hex');

    if (record.provenance.verifiedSignature !== expectedSig) {
      return { isValid: false, reason: 'SIGNATURE_TAMPER_DETECTED' };
    }

    return { isValid: true };
  }
}
