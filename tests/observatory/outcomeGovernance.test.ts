import { describe, it, expect, beforeEach } from 'vitest';
import {
  PredictionOutcomeEngine,
  PredictionOutcomeVerifier,
} from '../../server/src/intelligence/observatory/index.js';

describe('DEEPASTRO OBSERVATORY — Outcome Governance & Anti-Gaming Suite', () => {
  beforeEach(() => {
    PredictionOutcomeEngine.reset();
  });

  it('rejects casual conversational remarks from confirming outcomes', () => {
    expect(() => {
      PredictionOutcomeEngine.recordUserOutcome({
        predictionId: 'pred_1',
        claimId: 'claim_1',
        userId: 'user_1',
        status: 'USER_CONFIRMED',
        userNotes: 'interesting',
      });
    }).toThrow(/CONSTITUTION_VIOLATION/);

    expect(() => {
      PredictionOutcomeEngine.recordUserOutcome({
        predictionId: 'pred_1',
        claimId: 'claim_1',
        userId: 'user_1',
        status: 'USER_CONFIRMED',
        userNotes: 'maybe',
      });
    }).toThrow(/CONSTITUTION_VIOLATION/);
  });

  it('records explicit user confirmation with cryptographic provenance signature', () => {
    const outcome = PredictionOutcomeEngine.recordUserOutcome({
      predictionId: 'pred_1',
      claimId: 'claim_1',
      userId: 'user_real_99',
      status: 'USER_CONFIRMED',
      userNotes: 'I received the promotion to VP of Product on April 12.',
      observedEvent: 'Promotion to VP',
      observedDate: '2027-04-12T00:00:00Z',
    });

    expect(outcome.status).toBe('USER_CONFIRMED');
    expect(outcome.provenance.verifiedSignature).toBeDefined();

    const verification = PredictionOutcomeVerifier.verifyRecord(outcome, 'user_real_99');
    expect(verification.isValid).toBe(true);
  });

  it('enforces tenant isolation: user A cannot verify or access user B outcome', () => {
    const outcomeA = PredictionOutcomeEngine.recordUserOutcome({
      predictionId: 'pred_A',
      claimId: 'claim_A',
      userId: 'user_A',
      status: 'USER_CONFIRMED',
      userNotes: 'Event happened exactly as expected.',
    });

    const foreignVerification = PredictionOutcomeVerifier.verifyRecord(outcomeA, 'user_B');
    expect(foreignVerification.isValid).toBe(false);
    expect(foreignVerification.reason).toBe('TENANT_ISOLATION_VIOLATION');
  });
});
