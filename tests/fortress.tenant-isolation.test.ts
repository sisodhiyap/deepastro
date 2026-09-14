import { describe, it, expect } from 'vitest';
import { DeepAstroConstitution } from '../server/src/governance/DeepAstroConstitution.js';
import { PredictionLedgerV3 } from '../server/src/intelligence/PredictionLedgerV3.js';
import { PredictionOutcomeEngineV3 } from '../server/src/intelligence/PredictionOutcomeEngineV3.js';

describe('DEEPASTRO FORTRESS â€” Multi-Tenant Isolation', () => {
  it('Blocks cross-user tenant context access', () => {
    expect(() => {
      DeepAstroConstitution.assertMultiTenantIsolation('user_A_100', 'user_B_200');
    }).toThrow(/Rule 005/);

    expect(() => {
      DeepAstroConstitution.assertMultiTenantIsolation('user_A_100', 'user_A_100');
    }).not.toThrow();
  });

  it('Isolates predictions and prevents User B from confirming User A predictions', () => {
    PredictionLedgerV3.resetStore();
    PredictionOutcomeEngineV3.resetStore();

    const predA = PredictionLedgerV3.recordPrediction({
      userId: 'user_A_100',
      questionId: 'q_1',
      predictionType: 'CAREER',
      domain: 'CAREER',
      predictionText: 'Promotion window between Q2 and Q3',
      structuredPrediction: {
        expectedEvent: 'Promotion',
        expectedDirection: 'FAVORABLE',
        expectedTimeWindow: {
          startDate: '2026-04-01',
          endDate: '2026-09-30',
          scale: 'MONTH',
        },
      },
      chartSnapshotId: 'snap_A',
      underlyingFacts: ['Jupiter transit 10th house'],
      rulesFired: ['R_JUP_10'],
      priorConfidence: 0.85,
    });

    // User B attempts to confirm User A's prediction -> must fail
    expect(() => {
      PredictionOutcomeEngineV3.recordOutcome({
        predictionId: predA.predictionId,
        userId: 'user_B_200',
        outcome: 'CONFIRMED',
      });
    }).toThrow(/TENANT_ISOLATION_VIOLATION/);

    // User A confirming own prediction succeeds
    const confirmed = PredictionOutcomeEngineV3.recordOutcome({
      predictionId: predA.predictionId,
      userId: 'user_A_100',
      outcome: 'CONFIRMED',
      userNotes: 'Received official promotion notification on May 12th.',
    });

    expect(confirmed.outcome).toBe('CONFIRMED');
  });
});
