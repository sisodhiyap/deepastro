/**
 * DeepAstro Adversarial Metric Datasets (Datasets A through L)
 * 
 * 12 dedicated synthetic QA datasets engineered specifically to stress-test and break statistical integrity:
 * - Dataset A: 100% correct (Brier -> 0.0)
 * - Dataset B: 0% correct (Brier -> 1.0)
 * - Dataset C: 50/50 toss
 * - Dataset D: All Unknown (Epistemic Silence invariant: must not count as success)
 * - Dataset E: High confidence wrong (Extreme overconfidence penalty)
 * - Dataset F: Low confidence correct (Extreme underconfidence penalty)
 * - Dataset G: Duplicate outcomes (Tests deduplication and Kish N_eff)
 * - Dataset H: Future leakage (Tests temporal gate 10)
 * - Dataset I: Selection bias (Heavy user concentration)
 * - Dataset J: Dependent predictions (Clustered time windows)
 * - Dataset K: Partial outcomes (Must be excluded from binary Brier)
 * - Dataset L: Tiny sample (N=3, must return INSUFFICIENT_SAMPLE)
 */

import { ProspectivePredictionRecord } from './ProspectivePredictionRegistry.js';

export interface AdversarialDatasetSpec {
  id: string;
  name: string;
  purpose: string;
  expected_brier_range: [number, number];
  expected_ece_range: [number, number];
  expected_behavior: string;
  records: ProspectivePredictionRecord[];
}

export class AdversarialMetricDatasets {
  static getAll(): AdversarialDatasetSpec[] {
    return [
      this.getDatasetA(),
      this.getDatasetB(),
      this.getDatasetC(),
      this.getDatasetD(),
      this.getDatasetE(),
      this.getDatasetF(),
      this.getDatasetG(),
      this.getDatasetH(),
      this.getDatasetI(),
      this.getDatasetJ(),
      this.getDatasetK(),
      this.getDatasetL(),
    ];
  }

  static getDatasetA(): AdversarialDatasetSpec {
    // 100% Correct
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_A_${i}`,
        user_id: `USER_${i}`,
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'CAREER',
        horizon: '30D',
        forecast_probability: 0.95,
        calculation_snapshot_hash: `HASH_SNAPSHOT_A_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_A_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Promotion approved in Q1 for subject  with high Mars aspect.`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_A_${i}`,
        dataset_id: 'ADV_A_100_CORRECT',
        outcome: {
          prediction_id: `ADV_A_${i}`,
          outcome_id: `OUT_A_${i}`,
          authenticated_user_id: `USER_${i}`,
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Offer letter signed.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 4,
            direction_matched: true,
            domain: 'CAREER',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_A_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_A_100_CORRECT',
      name: 'Dataset A: 100% Correct',
      purpose: 'Verify that Brier score approaches 0.0025 (f=0.95, o=1.0) and event accuracy reaches 100%.',
      expected_brier_range: [0.0, 0.01],
      expected_ece_range: [0.0, 0.1],
      expected_behavior: 'Brier < 0.01, Event match 100% (95% CI: 83.9% - 100.0%).',
      records,
    };
  }

  static getDatasetB(): AdversarialDatasetSpec {
    // 0% Correct
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_B_${i}`,
        user_id: `USER_${i}`,
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'FINANCE',
        horizon: '30D',
        forecast_probability: 0.90,
        calculation_snapshot_hash: `HASH_SNAPSHOT_B_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_B_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Major stock windfall expected under Jupiter transit for subject .`,
        is_immutable: true,
        version: 1,
        provider: 'OpenAI',
        anonymous_prediction_id: `ANON_B_${i}`,
        dataset_id: 'ADV_B_0_CORRECT',
        outcome: {
          prediction_id: `ADV_B_${i}`,
          outcome_id: `OUT_B_${i}`,
          authenticated_user_id: `USER_${i}`,
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Incurred major loss instead.',
          structured_outcome: {
            state: 'CONTRADICTED',
            event_matched: false,
            timing_error_days: 4,
            direction_matched: false,
            domain: 'FINANCE',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_B_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_B_0_CORRECT',
      name: 'Dataset B: 0% Correct',
      purpose: 'Verify that Brier score heavily penalizes false confidence (Brier = 0.81).',
      expected_brier_range: [0.75, 0.85],
      expected_ece_range: [0.8, 1.0],
      expected_behavior: 'Brier > 0.80, Event match 0.0%, ECE ~ 0.90.',
      records,
    };
  }

  static getDatasetC(): AdversarialDatasetSpec {
    // 50/50 Toss
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      const isConfirmed = i % 2 === 0;
      records.push({
        prediction_id: `ADV_C_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'RELATIONSHIP',
        horizon: '30D',
        forecast_probability: 0.50,
        calculation_snapshot_hash: `HASH_SNAPSHOT_C_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_C_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Neutral relational realignment indicated for subject .`,
        is_immutable: true,
        version: 1,
        provider: 'Gemini',
        anonymous_prediction_id: `ANON_C_${i}`,
        dataset_id: 'ADV_C_50_50',
        outcome: {
          prediction_id: `ADV_C_${i}`,
          outcome_id: `OUT_C_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: isConfirmed ? 'Matched' : 'Unmatched',
          structured_outcome: {
            state: isConfirmed ? 'CONFIRMED' : 'CONTRADICTED',
            event_matched: isConfirmed,
            timing_error_days: 2,
            direction_matched: isConfirmed,
            domain: 'RELATIONSHIP',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_C_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_C_50_50',
      name: 'Dataset C: 50/50 Toss',
      purpose: 'Verify that Brier score equals exactly 0.25 (fair coin flip baseline).',
      expected_brier_range: [0.24, 0.26],
      expected_ece_range: [0.0, 0.05],
      expected_behavior: 'Brier = 0.25, Event match 50%, ECE near 0 (perfect calibration at 0.50).',
      records,
    };
  }

  static getDatasetD(): AdversarialDatasetSpec {
    // All Unknown (Silence invariant)
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_D_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'BUSINESS',
        horizon: '30D',
        forecast_probability: 0.75,
        calculation_snapshot_hash: `HASH_SNAPSHOT_D_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_D_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Commercial contract signing predicted for subject .`,
        is_immutable: true,
        version: 1,
        provider: 'Grok',
        anonymous_prediction_id: `ANON_D_${i}`,
        dataset_id: 'ADV_D_ALL_UNKNOWN',
        outcome: {
          prediction_id: `ADV_D_${i}`,
          outcome_id: `OUT_D_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'IN_APP_SURVEY',
          original_user_statement: '',
          structured_outcome: {
            state: 'UNKNOWN',
            event_matched: false,
            timing_error_days: 0,
            direction_matched: false,
            domain: 'BUSINESS',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_D_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_D_ALL_UNKNOWN',
      name: 'Dataset D: All Unknown (Epistemic Silence)',
      purpose: 'Enforce that zero user responses NEVER count as success; binary Brier sample size must be 0.',
      expected_brier_range: [0.25, 0.25],
      expected_ece_range: [0.0, 0.0],
      expected_behavior: 'N_binary = 0, coverage = 0.0, 100% preserved as distinct UNKNOWN state.',
      records,
    };
  }

  static getDatasetE(): AdversarialDatasetSpec {
    // High confidence wrong
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_E_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'EDUCATION',
        horizon: '30D',
        forecast_probability: 0.99,
        calculation_snapshot_hash: `HASH_SNAPSHOT_E_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_E_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Exam qualification guaranteed with 99% astronomical certainty for subject .`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_E_${i}`,
        dataset_id: 'ADV_E_HIGH_CONF_WRONG',
        outcome: {
          prediction_id: `ADV_E_${i}`,
          outcome_id: `OUT_E_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Failed exam.',
          structured_outcome: {
            state: 'CONTRADICTED',
            event_matched: false,
            timing_error_days: 0,
            direction_matched: false,
            domain: 'EDUCATION',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_E_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_E_HIGH_CONF_WRONG',
      name: 'Dataset E: High Confidence Wrong',
      purpose: 'Test extreme Brier penalty for overconfidence (Brier = 0.9801).',
      expected_brier_range: [0.95, 1.0],
      expected_ece_range: [0.9, 1.0],
      expected_behavior: 'Catastrophic Brier > 0.95; severe overconfidence alarm flagged.',
      records,
    };
  }

  static getDatasetF(): AdversarialDatasetSpec {
    // Low confidence correct
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_F_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'CREATIVITY',
        horizon: '30D',
        forecast_probability: 0.10,
        calculation_snapshot_hash: `HASH_SNAPSHOT_F_${i}`.toString().padStart(4, '0'),
        evidence_hash: `HASH_EVIDENCE_F_${i}`.toString().padStart(4, '0'),
        confidence_frozen: true,
        prediction_text: `Unlikely publication breakthrough forecasted at only 10% for subject .`,
        is_immutable: true,
        version: 1,
        provider: 'Deterministic Floor',
        anonymous_prediction_id: `ANON_F_${i}`,
        dataset_id: 'ADV_F_LOW_CONF_CORRECT',
        outcome: {
          prediction_id: `ADV_F_${i}`,
          outcome_id: `OUT_F_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Manuscript accepted unexpectedly.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 3,
            direction_matched: true,
            domain: 'CREATIVITY',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_F_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_F_LOW_CONF_CORRECT',
      name: 'Dataset F: Low Confidence Correct',
      purpose: 'Test severe penalty when real events occur despite low forecast probabilities (Brier = 0.81).',
      expected_brier_range: [0.80, 0.85],
      expected_ece_range: [0.8, 1.0],
      expected_behavior: 'Brier > 0.80, reflects heavy underconfidence.',
      records,
    };
  }

  static getDatasetG(): AdversarialDatasetSpec {
    // Duplicate outcomes
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 10; i++) {
      // Create duplicate pair
      for (const suffix of ['A', 'B']) {
        records.push({
          prediction_id: `ADV_G__${i}`,
          user_id: 'USER_DUPLICATE_VICTIM',
          issued_at: '2026-01-01T00:00:00.000Z',
          prediction_target_time: '2026-02-01T00:00:00.000Z',
          domain: 'CAREER',
          horizon: '30D',
          forecast_probability: 0.80,
          calculation_snapshot_hash: `HASH_SNAPSHOT_G_${i}`,
          evidence_hash: `HASH_EVIDENCE_G_${i}`,
          confidence_frozen: true,
          prediction_text: `Career advancement milestone  in corporate leadership.`,
          is_immutable: true,
          version: 1,
          provider: 'Z53',
          anonymous_prediction_id: `ANON_G__${i}`,
          dataset_id: 'ADV_G_DUPLICATE_OUTCOMES',
          outcome: {
            prediction_id: `ADV_G__${i}`,
            outcome_id: `OUT_G_${i}`,
            authenticated_user_id: 'USER_DUPLICATE_VICTIM',
            confirmed_at: '2026-02-05T00:00:00.000Z',
            confirmation_method: 'USER_FEEDBACK',
            original_user_statement: 'Promoted to Director.',
            structured_outcome: {
              state: 'CONFIRMED',
              event_matched: true,
              timing_error_days: 4,
              direction_matched: true,
              domain: 'CAREER',
            },
            verification_level: 'USER_SELF_REPORT',
            outcome_hash: `HASH_OUT_G_${i}`,
          },
        });
      }
    }

    return {
      id: 'DATASET_G_DUPLICATE_OUTCOMES',
      name: 'Dataset G: Duplicate Outcomes',
      purpose: 'Verify deduplication gate and Kish sample size penalty against multi-counting identical events.',
      expected_brier_range: [0.03, 0.05],
      expected_ece_range: [0.15, 0.25],
      expected_behavior: 'Kish effective sample size drops by ~50%; duplicate warning triggered.',
      records,
    };
  }

  static getDatasetH(): AdversarialDatasetSpec {
    // Future leakage (Target before issuance)
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 10; i++) {
      records.push({
        prediction_id: `ADV_H_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-03-01T00:00:00.000Z',
        prediction_target_time: '2026-01-01T00:00:00.000Z', // In the past!
        domain: 'RELOCATION',
        horizon: '30D',
        forecast_probability: 0.85,
        calculation_snapshot_hash: `HASH_SNAPSHOT_H_${i}`,
        evidence_hash: `HASH_EVIDENCE_H_${i}`,
        confidence_frozen: true,
        prediction_text: `International relocation to London successfully completed.`,
        is_immutable: true,
        version: 1,
        provider: 'OpenAI',
        anonymous_prediction_id: `ANON_H_${i}`,
        dataset_id: 'ADV_H_FUTURE_LEAKAGE',
        outcome: {
          prediction_id: `ADV_H_${i}`,
          outcome_id: `OUT_H_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-03-02T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Already moved.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 0,
            direction_matched: true,
            domain: 'RELOCATION',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_H_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_H_FUTURE_LEAKAGE',
      name: 'Dataset H: Future Temporal Leakage',
      purpose: 'Verify Gate 1 & 10 disqualify retroactively logged forecasts.',
      expected_brier_range: [0.0, 0.05],
      expected_ece_range: [0.0, 0.2],
      expected_behavior: '100% disqualified by Prospective Prediction Registry; 0 eligible for real-world stats.',
      records,
    };
  }

  static getDatasetI(): AdversarialDatasetSpec {
    // Selection bias (1 user submits 85% of outcomes)
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      const isSuperUser = i <= 17;
      records.push({
        prediction_id: `ADV_I_${i}`,
        user_id: isSuperUser ? 'SUPER_USER_FAN_01' : (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'SPIRITUALITY',
        horizon: '30D',
        forecast_probability: 0.80,
        calculation_snapshot_hash: `HASH_SNAPSHOT_I_${i}`,
        evidence_hash: `HASH_EVIDENCE_I_${i}`,
        confidence_frozen: true,
        prediction_text: `Spiritual insight breakthrough under Ketu dasha ${i}.`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_I_${i}`,
        dataset_id: 'ADV_I_SELECTION_BIAS',
        outcome: {
          prediction_id: `ADV_I_${i}`,
          outcome_id: `OUT_I_${i}`,
          authenticated_user_id: isSuperUser ? 'SUPER_USER_FAN_01' : (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Deeply true.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 2,
            direction_matched: true,
            domain: 'SPIRITUALITY',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_I_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_I_SELECTION_BIAS',
      name: 'Dataset I: Selection / Attrition Bias',
      purpose: 'Flag high concentration of outcomes coming from single zealous user.',
      expected_brier_range: [0.03, 0.05],
      expected_ece_range: [0.15, 0.25],
      expected_behavior: 'Audit flags SELECTION_BIAS_RISK due to user concentration > 80%.',
      records,
    };
  }

  static getDatasetJ(): AdversarialDatasetSpec {
    // Dependent predictions (10 forecasts on same event window)
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 10; i++) {
      records.push({
        prediction_id: `ADV_J_${i}`,
        user_id: 'USER_CLUSTERED_ENTANGLED',
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: `2026-02-0${Math.min(i, 9)}T00:00:00.000Z`, // All within 3 days
        domain: 'BUSINESS',
        horizon: '30D',
        forecast_probability: 0.75,
        calculation_snapshot_hash: `HASH_SNAPSHOT_J_${i}`,
        evidence_hash: `HASH_EVIDENCE_J_${i}`,
        confidence_frozen: true,
        prediction_text: `Commercial deal closing variant #${i} for the exact same transaction.`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_J_${i}`,
        dataset_id: 'ADV_J_DEPENDENT',
        outcome: {
          prediction_id: `ADV_J_${i}`,
          outcome_id: `OUT_J_${i}`,
          authenticated_user_id: 'USER_CLUSTERED_ENTANGLED',
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Deal executed.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 1,
            direction_matched: true,
            domain: 'BUSINESS',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_J_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_J_DEPENDENT',
      name: 'Dataset J: Clustered Dependent Predictions',
      purpose: 'Verify Kish N_eff severely deflates nominal N=10 down to ~3 effective samples.',
      expected_brier_range: [0.05, 0.08],
      expected_ece_range: [0.2, 0.3],
      expected_behavior: 'N_eff <= 4, warns of pseudo-replication.',
      records,
    };
  }

  static getDatasetK(): AdversarialDatasetSpec {
    // Partial outcomes
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        prediction_id: `ADV_K_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'LIFE_PHASE',
        horizon: '30D',
        forecast_probability: 0.70,
        calculation_snapshot_hash: `HASH_SNAPSHOT_K_${i}`,
        evidence_hash: `HASH_EVIDENCE_K_${i}`,
        confidence_frozen: true,
        prediction_text: `Comprehensive life transformation and residential move for subject ${i}.`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_K_${i}`,
        dataset_id: 'ADV_K_PARTIAL_OUTCOMES',
        outcome: {
          prediction_id: `ADV_K_${i}`,
          outcome_id: `OUT_K_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Partially happened: moved house, but career did not change.',
          structured_outcome: {
            state: 'PARTIAL',
            event_matched: true,
            timing_error_days: 4,
            direction_matched: true,
            domain: 'LIFE_PHASE',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_K_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_K_PARTIAL_OUTCOMES',
      name: 'Dataset K: Partial Outcomes',
      purpose: 'Enforce Section 10: PARTIAL must be excluded from binary Brier and tracked separately.',
      expected_brier_range: [0.25, 0.25],
      expected_ece_range: [0.0, 0.0],
      expected_behavior: 'N_binary_brier = 0; partial_outcomes_count = 20. Does not contaminate binary Brier.',
      records,
    };
  }

  static getDatasetL(): AdversarialDatasetSpec {
    // Tiny sample (N=3)
    const records: ProspectivePredictionRecord[] = [];
    for (let i = 1; i <= 3; i++) {
      records.push({
        prediction_id: `ADV_L_${i}`,
        user_id: (`USER_${i}`),
        issued_at: '2026-01-01T00:00:00.000Z',
        prediction_target_time: '2026-02-01T00:00:00.000Z',
        domain: 'GENERAL',
        horizon: '30D',
        forecast_probability: 0.80,
        calculation_snapshot_hash: `HASH_SNAPSHOT_L_${i}`,
        evidence_hash: `HASH_EVIDENCE_L_${i}`,
        confidence_frozen: true,
        prediction_text: `General favorable milestone for subject ${i}.`,
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        anonymous_prediction_id: `ANON_L_${i}`,
        dataset_id: 'ADV_L_TINY_SAMPLE',
        outcome: {
          prediction_id: `ADV_L_${i}`,
          outcome_id: `OUT_L_${i}`,
          authenticated_user_id: (`USER_${i}`),
          confirmed_at: '2026-02-05T00:00:00.000Z',
          confirmation_method: 'USER_FEEDBACK',
          original_user_statement: 'Accurate.',
          structured_outcome: {
            state: 'CONFIRMED',
            event_matched: true,
            timing_error_days: 1,
            direction_matched: true,
            domain: 'GENERAL',
          },
          verification_level: 'USER_SELF_REPORT',
          outcome_hash: `HASH_OUT_L_${i}`,
        },
      });
    }

    return {
      id: 'DATASET_L_TINY_SAMPLE',
      name: 'Dataset L: Tiny Sample (N=3)',
      purpose: 'Enforce Section 6 & 40: Sample size N=3 must be strictly labeled INSUFFICIENT_SAMPLE.',
      expected_brier_range: [0.03, 0.05],
      expected_ece_range: [0.15, 0.25],
      expected_behavior: 'Certification Status = INSUFFICIENT_SAMPLE, prevents unreliable claims.',
      records,
    };
  }
}
