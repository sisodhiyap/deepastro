import { describe, it, expect } from 'vitest';
import { DeepAstroConstitution } from '../server/src/governance/DeepAstroConstitution.js';
import { PredictionOutcomeEngineV3 } from '../server/src/intelligence/PredictionOutcomeEngineV3.js';
import { PredictionLedgerV3 } from '../server/src/intelligence/PredictionLedgerV3.js';

describe('DEEPASTRO FORTRESS â€” Learning Firewall & Confirmation Gate', () => {
  it('Rejects casual conversational phrases as outcome confirmations', () => {
    PredictionLedgerV3.resetStore();
    PredictionOutcomeEngineV3.resetStore();

    const pred = PredictionLedgerV3.recordPrediction({
      userId: 'usr_test_firewall',
      questionId: 'q_firewall',
      predictionType: 'CAREER',
      domain: 'CAREER',
      predictionText: 'Leadership transition in Q3',
      structuredPrediction: {
        expectedEvent: 'Leadership transition',
        expectedDirection: 'FAVORABLE',
        expectedTimeWindow: {
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          scale: 'MONTH',
        },
      },
      chartSnapshotId: 'snap_f1',
      underlyingFacts: ['Jupiter transit 10th house'],
      rulesFired: ['R1'],
      priorConfidence: 0.8,
    });

    // Casual chat remarks must fail confirmation
    const casualRemarks = ['interesting', 'nice', 'maybe', 'that sounds right', 'cool', 'ok'];
    for (const remark of casualRemarks) {
      expect(() => {
        PredictionOutcomeEngineV3.recordOutcome({
          predictionId: pred.predictionId,
          userId: 'usr_test_firewall',
          outcome: 'CONFIRMED',
          userNotes: remark,
        });
      }).toThrow(/Rule 004/);
    }
  });

  it('Blocks machine learning from targeting astronomical calculations', () => {
    expect(() => {
      DeepAstroConstitution.assertLearningFirewall('vsop87');
    }).toThrow(/Rule 017/);

    expect(() => {
      DeepAstroConstitution.assertLearningFirewall('lahiri_ayanamsha');
    }).toThrow(/Rule 017/);
  });
});
