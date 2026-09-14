import crypto from 'crypto';

export type VerificationLevel =
  | 'USER_SELF_REPORT'
  | 'MULTI_CONFIRMATION'
  | 'EXTERNAL_VERIFICATION'
  | 'INDEPENDENT_VERIFICATION';

export type OutcomeState =
  | 'CONFIRMED'
  | 'CONTRADICTED'
  | 'PARTIAL'
  | 'UNKNOWN';

export interface OutcomeProvenance {
  prediction_id: string,
          outcome_id: string,
          authenticated_user_id: string,
          confirmed_at: string;
  confirmation_method: 'IN_APP_SURVEY' | 'EXTERNAL_API' | 'ADMIN_AUDIT' | 'USER_FEEDBACK',
          original_user_statement: string,
          structured_outcome: {
    state: OutcomeState;
    event_matched: boolean;
    timing_error_days: number;
    direction_matched: boolean;
    domain: string;
  };
  verification_level: VerificationLevel;
  outcome_hash: string;
}

export interface ProspectivePredictionRecord {
  prediction_id: string;
  user_id: string;
  issued_at: string;
  prediction_target_time: string;
  domain: string;
  horizon: 'IMMEDIATE' | '30D' | '90D' | '1Y' | '3Y' | '5Y' | '10Y';
  forecast_probability: number;
  calculation_snapshot_hash: string;
  evidence_hash: string;
  confidence_frozen: boolean;
  prediction_text: string;
  is_immutable: boolean;
  version: number;
  provider: string;
  anonymous_prediction_id: string;
  dataset_id: string;
  outcome?: OutcomeProvenance;
}

export interface EligibilityEvaluation {
  prediction_id: string;
  is_eligible: boolean;
  status: 'ELIGIBLE_FOR_REAL_WORLD_ACCURACY' | 'NOT_ELIGIBLE_FOR_REAL_WORLD_ACCURACY';
  gate_checks: {
    gate_1_issued_before_outcome: boolean;
    gate_2_immutable_at_issuance: boolean;
    gate_3_timestamp_is_valid: boolean;
    gate_4_calculation_snapshot_frozen: boolean;
    gate_5_evidence_frozen: boolean;
    gate_6_confidence_frozen: boolean;
    gate_7_prediction_not_edited: boolean;
    gate_8_outcome_occurred_after_issuance: boolean;
    gate_9_no_post_outcome_info_entered: boolean;
    gate_10_no_temporal_leakage: boolean;
    gate_11_passed_deduplication: boolean;
    gate_12_sufficiently_testable: boolean;
    gate_13_outcome_provenance_valid: boolean;
  };
  rejection_reasons: string[];
}

export class ProspectivePredictionRegistry {
  private static registry: Map<string, ProspectivePredictionRecord> = new Map();
  private static userEventWindows: Map<string, Array<{ id: string; targetTime: number; domain: string }>> = new Map();

  static clear() {
    this.registry.clear();
    this.userEventWindows.clear();
  }

  static registerProspectivePrediction(rec: Omit<ProspectivePredictionRecord, 'anonymous_prediction_id'>): ProspectivePredictionRecord {
    const anonId = 'ANON_' + crypto.createHash('sha256').update(rec.prediction_id + '_SALT_BLIND').digest('hex').slice(0, 12);
    const fullRec: ProspectivePredictionRecord = Object.assign({}, rec, { anonymous_prediction_id: anonId });
    this.registry.set(rec.prediction_id, fullRec);

    const userKey = rec.user_id + ':::' + rec.domain;
    const targetMs = new Date(rec.prediction_target_time).getTime();
    const existing = this.userEventWindows.get(userKey) || [];
    existing.push({ id: rec.prediction_id, targetTime: targetMs, domain: rec.domain });
    this.userEventWindows.set(userKey, existing);

    return fullRec;
  }

  static recordOutcome(predictionId: string, outcomeInput: Omit<OutcomeProvenance, 'outcome_hash'>): OutcomeProvenance {
    const pred = this.registry.get(predictionId);
    if (!pred) {
      throw new Error('Prediction not found: ' + predictionId);
    }

    const outcomeHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          prediction_id: predictionId,
          outcome_id: outcomeInput.outcome_id,
          authenticated_user_id: outcomeInput.authenticated_user_id,
          confirmed_at: outcomeInput.confirmed_at,
          structured_outcome: outcomeInput.structured_outcome,
          original_user_statement: outcomeInput.original_user_statement,
        })
      )
      .digest('hex');

    const outcome: OutcomeProvenance = Object.assign({}, outcomeInput, { outcome_hash: outcomeHash });
    pred.outcome = outcome;
    this.registry.set(predictionId, pred);
    return outcome;
  }

  static evaluateEligibility(predictionId: string): EligibilityEvaluation {
    const pred = this.registry.get(predictionId);
    if (!pred) {
      return {
        prediction_id: predictionId,
        is_eligible: false,
        status: 'NOT_ELIGIBLE_FOR_REAL_WORLD_ACCURACY',
        gate_checks: {
          gate_1_issued_before_outcome: false,
          gate_2_immutable_at_issuance: false,
          gate_3_timestamp_is_valid: false,
          gate_4_calculation_snapshot_frozen: false,
          gate_5_evidence_frozen: false,
          gate_6_confidence_frozen: false,
          gate_7_prediction_not_edited: false,
          gate_8_outcome_occurred_after_issuance: false,
          gate_9_no_post_outcome_info_entered: false,
          gate_10_no_temporal_leakage: false,
          gate_11_passed_deduplication: false,
          gate_12_sufficiently_testable: false,
          gate_13_outcome_provenance_valid: false,
        },
        rejection_reasons: ['Prediction record not found in registry'],
      };
    }

    const reasons = [];
    const issuedMs = new Date(pred.issued_at).getTime();
    const targetMs = new Date(pred.prediction_target_time).getTime();
    const nowMs = Date.now();

    const gate1 = !isNaN(issuedMs) && !isNaN(targetMs) && issuedMs < targetMs;
    if (!gate1) reasons.push('Prediction was not issued prior to target event window');

    const gate2 = pred.is_immutable === true;
    if (!gate2) reasons.push('Prediction record is not marked cryptographically immutable');

    const gate3 = !isNaN(issuedMs) && issuedMs <= nowMs;
    if (!gate3) reasons.push('Issuance timestamp is invalid or from the future');

    const gate4 = Boolean(pred.calculation_snapshot_hash) && pred.calculation_snapshot_hash.length >= 16;
    if (!gate4) reasons.push('Calculation snapshot hash is missing or unverified');

    const gate5 = Boolean(pred.evidence_hash) && pred.evidence_hash.length >= 16;
    if (!gate5) reasons.push('Epistemic evidence snapshot was not frozen at issuance');

    const gate6 = pred.confidence_frozen === true && pred.forecast_probability >= 0 && pred.forecast_probability <= 1;
    if (!gate6) reasons.push('Confidence was not frozen or out of [0, 1] range');

    const gate7 = pred.version === 1;
    if (!gate7) reasons.push('Prediction was mutated after issuance (version=' + pred.version + ')');

    let gate8 = true;
    if (pred.outcome) {
      const outcomeMs = new Date(pred.outcome.confirmed_at).getTime();
      gate8 = outcomeMs > issuedMs;
      if (!gate8) reasons.push('Outcome confirmation timestamp precedes prediction issuance timestamp');
    }

    const gate9 = !pred.prediction_text.toLowerCase().includes('retrospective') && !pred.prediction_text.toLowerCase().includes('post-hoc');
    if (!gate9) reasons.push('Prediction text indicates post-outcome contamination or retrospective rationalization');

    const gate10 = issuedMs <= targetMs;
    if (!gate10) reasons.push('Temporal leakage: target window occurred before issuance');

    const userKey = pred.user_id + ':::' + pred.domain;
    const windows = this.userEventWindows.get(userKey) || [];
    const closeNeighbours = windows.filter(w => w.id !== pred.prediction_id && Math.abs(w.targetTime - targetMs) < 7 * 86400 * 1000);
    const gate11 = closeNeighbours.length === 0;
    if (!gate11) reasons.push('Duplicate/Overlapping forecast detected in same 7-day window');

    const gate12 = pred.prediction_text.trim().length >= 15 && Boolean(pred.domain) && Boolean(pred.horizon);
    if (!gate12) reasons.push('Prediction is too vague, unfalsifiable, or lacking concrete target domain/horizon');

    let gate13 = true;
    if (pred.outcome) {
      const provValid = Boolean(pred.outcome.authenticated_user_id) && Boolean(pred.outcome.outcome_hash) && Boolean(pred.outcome.verification_level);
      gate13 = provValid;
      if (!gate13) reasons.push('Outcome provenance record is missing authentication, hash, or verification level');
    }

    const allPassed = gate1 && gate2 && gate3 && gate4 && gate5 && gate6 && gate7 && gate8 && gate9 && gate10 && gate11 && gate12 && gate13;

    return {
      prediction_id: predictionId,
      is_eligible: allPassed,
      status: allPassed ? 'ELIGIBLE_FOR_REAL_WORLD_ACCURACY' : 'NOT_ELIGIBLE_FOR_REAL_WORLD_ACCURACY',
      gate_checks: {
        gate_1_issued_before_outcome: gate1,
        gate_2_immutable_at_issuance: gate2,
        gate_3_timestamp_is_valid: gate3,
        gate_4_calculation_snapshot_frozen: gate4,
        gate_5_evidence_frozen: gate5,
        gate_6_confidence_frozen: gate6,
        gate_7_prediction_not_edited: gate7,
        gate_8_outcome_occurred_after_issuance: gate8,
        gate_9_no_post_outcome_info_entered: gate9,
        gate_10_no_temporal_leakage: gate10,
        gate_11_passed_deduplication: gate11,
        gate_12_sufficiently_testable: gate12,
        gate_13_outcome_provenance_valid: gate13,
      },
      rejection_reasons: reasons,
    };
  }

  static getPrediction(id: string): ProspectivePredictionRecord | undefined {
    return this.registry.get(id);
  }

  static getAll(): ProspectivePredictionRecord[] {
    return Array.from(this.registry.values());
  }

  static getEligiblePredictions(): ProspectivePredictionRecord[] {
    return Array.from(this.registry.values()).filter(p => this.evaluateEligibility(p.prediction_id).is_eligible);
  }
}