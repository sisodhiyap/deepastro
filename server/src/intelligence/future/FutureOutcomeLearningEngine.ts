/**
 * DeepAstro 7.0 — Future Outcome Learning Engine (FutureOutcomeLearningEngine)
 * Wires future predictions into PredictionLedgerV3 and PredictionOutcomeEngineV3.
 * 
 * Strict Firewall:
 * Outcome learning cannot modify astronomical calculation mathematics.
 * It strictly refines interpretive ranking, timing heuristics, and confidence calibration.
 */

import { PredictionLedgerV3, PredictionLedgerV3Entry } from '../PredictionLedgerV3.js';
import { PredictionOutcomeEngineV3, GroundedOutcomeStatus } from '../PredictionOutcomeEngineV3.js';

export interface RecordFuturePredictionParams {
  userId: string;
  calculationFingerprint: string;
  domain: string;
  claimText: string;
  expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
  startDate: string;
  endDate: string;
  trigger: string;
  evidenceIds: string[];
  confidence: number;
  uncertainty: string;
}

export class FutureOutcomeLearningEngine {
  /**
   * Registers a generated future forecast window into the immutable PredictionLedger.
   */
  public static recordPrediction(params: RecordFuturePredictionParams): PredictionLedgerV3Entry {
    return PredictionLedgerV3.recordPrediction({
      userId: params.userId,
      questionId: `future_horizon_${Date.now()}`,
      predictionType: 'FUTURE_INTELLIGENCE_CFIE_V3',
      domain: params.domain,
      predictionText: params.claimText,
      expectedEvent: params.claimText,
      expectedDirection: params.expectedDirection,
      timeWindow: {
        startDate: params.startDate,
        endDate: params.endDate,
        scale: 'YEAR',
      },
      chartSnapshotId: `snap_${params.calculationFingerprint}`,
      calculationVersion: '7.0.0_CFIE',
      rulesUsed: ['PARASHARI_DASHA_ACTIVATION', 'GOCHARA_TRANSIT_HARMONY', 'D10_DASAMSHA_ALIGNMENT'],
      systemsUsed: ['Vedic Astrology', 'Vimshottari Dasha', 'Gochara Transits'],
      evidenceIds: params.evidenceIds,
      confidence: params.confidence,
      uncertainty: params.uncertainty,
      riskLevel: 'LOW',
    });
  }

  /**
   * Confirms or updates an outcome strictly through explicit user confirmation.
   */
  public static confirmOutcome(
    predictionId: string,
    userId: string,
    outcome: GroundedOutcomeStatus,
    userNotes?: string
  ) {
    return PredictionOutcomeEngineV3.recordOutcome({
      predictionId,
      userId,
      outcome,
      outcomeType: 'USER_CONFIRMED',
      userNotes,
    });
  }
}
