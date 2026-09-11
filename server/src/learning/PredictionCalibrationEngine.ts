/**
 * DeepAstro Phase 3 — Prediction Calibration Engine
 * Measures directional consistency, timing-window consistency, outcome agreement,
 * false-positive/negative rates, and uncertainty calibration without claiming scientific validity.
 */

import { PredictionLedgerEntry, PredictionOutcome } from './PredictionLedger.js';

export interface CalibrationMetricsV2 {
  sampleSize: number;
  evaluatedCount: number;
  directionalConsistency: number; // proportion where outcome confirmed or partially confirmed
  timingConsistency: number; // proportion where timing window matched
  meanSpecificityScore: number; // 0.0 to 1.0
  outcomeAgreementRate: number; // 0.0 to 1.0
  falsePositives: number; // high confidence but did not happen
  falseNegatives: number; // low confidence but happened
  unknownRate: number; // proportion of outcomes marked UNKNOWN / NOT_ENOUGH_INFORMATION
  brierScore: number; // (predicted_prob - actual_binary)^2
  calibrationLabel: string; // e.g. "DeepAstro historical calibration"
  sampleSizeAndLimitations: string;
}

export type PredictionOutcomeStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'UNKNOWN'
  | 'USER_DID_NOT_REPORT';

export type UserReportedFeedback =
  | 'HAPPENED_AS_DESCRIBED'
  | 'PARTIALLY_HAPPENED'
  | 'DID_NOT_HAPPEN'
  | 'TOO_VAGUE_TO_EVALUATE'
  | 'TIMING_WAS_WRONG'
  | 'SITUATION_CHANGED'
  | 'NOT_ENOUGH_INFORMATION';

export interface PredictionLedgerRecord {
  predictionId: string;
  userId: string;
  question: string;
  createdAt: string;
  chartSnapshotId: string;
  dashaSnapshot: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha?: string;
  };
  transitSnapshot: {
    saturnSign: string;
    jupiterSign: string;
    rahuSign: string;
  };
  rulesUsed: string[];
  systemsUsed: string[];
  evidenceIds: string[];
  predictionWindow: {
    startDate: string;
    endDate: string;
  };
  predictionType: 'CAREER' | 'FINANCE' | 'RELATIONSHIP' | 'RELOCATION' | 'EDUCATION' | 'HEALTH_WELLNESS' | 'GENERAL';
  confidenceLevel: 'VERIFIED' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';
  userContext: string[];
  userFeedback?: UserReportedFeedback;
  outcome: PredictionOutcomeStatus;
  outcomeDate?: string;
  calibrationVersion: string;
}

export interface CalibrationMetrics {
  totalPredictions: number;
  evaluatedPredictions: number;
  directionalConsistency: number; // 0.0 to 1.0 (proportion of confirmed or partially confirmed)
  timingWindowConsistency: number; // 0.0 to 1.0 (proportion where timing matched)
  outcomeAgreementRate: number; // 0.0 to 1.0
  falsePositiveRate: number; // predictions confident but not confirmed
  falseNegativeRate: number; // predictions low confidence but materialized
  uncertaintyCalibrationScore: number; // alignment between confidence level and confirmed outcome
  brierScoreEquivalent: number;
  feedbackDistribution: Record<UserReportedFeedback, number>;
  outcomeDistribution: Record<PredictionOutcomeStatus, number>;
}

export class PredictionCalibrationEngine {
  public static readonly VERSION = '3.0.0-RC';

  /**
   * Evaluates a set of prediction ledger records to calculate calibration metrics
   */
  public static computeMetrics(records: PredictionLedgerRecord[]): CalibrationMetrics {
    const totalPredictions = records.length;
    const evaluated = records.filter(
      (r) => r.outcome !== 'UNKNOWN' && r.outcome !== 'USER_DID_NOT_REPORT'
    );

    const feedbackDistribution: Record<UserReportedFeedback, number> = {
      HAPPENED_AS_DESCRIBED: 0,
      PARTIALLY_HAPPENED: 0,
      DID_NOT_HAPPEN: 0,
      TOO_VAGUE_TO_EVALUATE: 0,
      TIMING_WAS_WRONG: 0,
      SITUATION_CHANGED: 0,
      NOT_ENOUGH_INFORMATION: 0,
    };

    const outcomeDistribution: Record<PredictionOutcomeStatus, number> = {
      CONFIRMED: 0,
      PARTIALLY_CONFIRMED: 0,
      NOT_CONFIRMED: 0,
      UNKNOWN: 0,
      USER_DID_NOT_REPORT: 0,
    };

    for (const r of records) {
      outcomeDistribution[r.outcome] = (outcomeDistribution[r.outcome] || 0) + 1;
      if (r.userFeedback) {
        feedbackDistribution[r.userFeedback] = (feedbackDistribution[r.userFeedback] || 0) + 1;
      }
    }

    if (evaluated.length === 0) {
      return {
        totalPredictions,
        evaluatedPredictions: 0,
        directionalConsistency: 1.0,
        timingWindowConsistency: 1.0,
        outcomeAgreementRate: 1.0,
        falsePositiveRate: 0.0,
        falseNegativeRate: 0.0,
        uncertaintyCalibrationScore: 1.0,
        brierScoreEquivalent: 0.0,
        feedbackDistribution,
        outcomeDistribution,
      };
    }

    let confirmedCount = 0;
    let timingCorrectCount = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let squaredErrorSum = 0;

    for (const r of evaluated) {
      const isConfirmed = r.outcome === 'CONFIRMED';
      const isPartial = r.outcome === 'PARTIALLY_CONFIRMED';
      const isNot = r.outcome === 'NOT_CONFIRMED';

      if (isConfirmed || isPartial) {
        confirmedCount++;
      }

      if (r.userFeedback === 'HAPPENED_AS_DESCRIBED' || r.userFeedback === 'PARTIALLY_HAPPENED') {
        timingCorrectCount++;
      }

      // Confidence to numeric probability proxy for calibration scoring
      const probEstimate =
        r.confidenceLevel === 'VERIFIED'
          ? 0.9
          : r.confidenceLevel === 'HIGH'
          ? 0.75
          : r.confidenceLevel === 'MODERATE'
          ? 0.55
          : 0.35;

      const actualBinary = isConfirmed ? 1.0 : isPartial ? 0.6 : 0.0;
      squaredErrorSum += Math.pow(probEstimate - actualBinary, 2);

      // False positive: high confidence (>0.7) but NOT_CONFIRMED
      if (probEstimate >= 0.7 && isNot) {
        falsePositives++;
      }

      // False negative: low confidence (<=0.4) but CONFIRMED
      if (probEstimate <= 0.4 && isConfirmed) {
        falseNegatives++;
      }
    }

    const directionalConsistency = Number((confirmedCount / evaluated.length).toFixed(4));
    const timingWindowConsistency = Number((timingCorrectCount / evaluated.length).toFixed(4));
    const outcomeAgreementRate = directionalConsistency;
    const falsePositiveRate = Number((falsePositives / evaluated.length).toFixed(4));
    const falseNegativeRate = Number((falseNegatives / evaluated.length).toFixed(4));
    const brierScoreEquivalent = Number((squaredErrorSum / evaluated.length).toFixed(4));
    const uncertaintyCalibrationScore = Number(Math.max(0, 1 - brierScoreEquivalent).toFixed(4));

    return {
      totalPredictions,
      evaluatedPredictions: evaluated.length,
      directionalConsistency,
      timingWindowConsistency,
      outcomeAgreementRate,
      falsePositiveRate,
      falseNegativeRate,
      uncertaintyCalibrationScore,
      brierScoreEquivalent,
      feedbackDistribution,
      outcomeDistribution,
    };
  }

  /**
   * Translates user feedback option into internal outcome categorization
   */
  public static mapFeedbackToOutcome(feedback: UserReportedFeedback): PredictionOutcomeStatus {
    switch (feedback) {
      case 'HAPPENED_AS_DESCRIBED':
        return 'CONFIRMED';
      case 'PARTIALLY_HAPPENED':
        return 'PARTIALLY_CONFIRMED';
      case 'DID_NOT_HAPPEN':
      case 'TIMING_WAS_WRONG':
        return 'NOT_CONFIRMED';
      case 'TOO_VAGUE_TO_EVALUATE':
      case 'SITUATION_CHANGED':
      case 'NOT_ENOUGH_INFORMATION':
        return 'UNKNOWN';
      default:
        return 'USER_DID_NOT_REPORT';
    }
  }

  /**
   * Phase 5 Prediction Calibration Engine v2
   * Evaluates historical prediction records strictly as internal system calibration metrics.
   * NEVER displays metrics as "Astrology is X% accurate".
   */
  public static computeMetricsV2(entries: PredictionLedgerEntry[]): CalibrationMetricsV2 {
    const sampleSize = entries.length;
    const evaluated = entries.filter((e) => e.outcome !== null);

    if (evaluated.length === 0) {
      return {
        sampleSize,
        evaluatedCount: 0,
        directionalConsistency: 1.0,
        timingConsistency: 1.0,
        meanSpecificityScore: entries.length > 0 ? Number((entries.reduce((acc, e) => acc + (e.specificity?.overallScore || 0.7), 0) / entries.length).toFixed(4)) : 0.8,
        outcomeAgreementRate: 1.0,
        falsePositives: 0,
        falseNegatives: 0,
        unknownRate: 0.0,
        brierScore: 0.0,
        calibrationLabel: 'DeepAstro historical calibration',
        sampleSizeAndLimitations: `Sample size: ${sampleSize} (Evaluated: 0). Internal calibration metrics describe system consistency and evidence alignment, not empirical scientific proof.`,
      };
    }

    let directionalMatches = 0;
    let timingMatches = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let unknownCount = 0;
    let squaredErrorSum = 0;
    let totalSpecificity = 0;

    for (const e of evaluated) {
      const outcome = e.outcome!;
      const specScore = e.specificity?.overallScore ?? 0.7;
      totalSpecificity += specScore;

      const isHappened = outcome === 'HAPPENED';
      const isPartial = outcome === 'PARTIALLY_HAPPENED';
      const isNot = outcome === 'DID_NOT_HAPPEN';
      const isTimingWrong = outcome === 'TIMING_WRONG';
      const isUnknown = outcome === 'UNKNOWN' || outcome === 'NOT_ENOUGH_INFORMATION' || outcome === 'TOO_VAGUE';

      if (isUnknown) {
        unknownCount++;
      }

      if (isHappened || isPartial) {
        directionalMatches++;
      }

      if (isHappened && !isTimingWrong) {
        timingMatches++;
      }

      // Confidence to numeric probability proxy
      const probEstimate =
        e.confidenceClass === 'VERIFIED'
          ? 0.90
          : e.confidenceClass === 'HIGH'
          ? 0.75
          : e.confidenceClass === 'MODERATE'
          ? 0.55
          : 0.35;

      const actualBinary = isHappened ? 1.0 : isPartial ? 0.6 : 0.0;
      squaredErrorSum += Math.pow(probEstimate - actualBinary, 2);

      // False positive: high confidence (>0.7) but DID_NOT_HAPPEN
      if (probEstimate >= 0.7 && isNot) {
        falsePositives++;
      }

      // False negative: low confidence (<=0.4) but HAPPENED
      if (probEstimate <= 0.4 && isHappened) {
        falseNegatives++;
      }
    }

    const directionalConsistency = Number((directionalMatches / evaluated.length).toFixed(4));
    const timingConsistency = Number((timingMatches / evaluated.length).toFixed(4));
    const meanSpecificityScore = Number((totalSpecificity / evaluated.length).toFixed(4));
    const outcomeAgreementRate = directionalConsistency;
    const unknownRate = Number((unknownCount / evaluated.length).toFixed(4));
    const brierScore = Number((squaredErrorSum / evaluated.length).toFixed(4));

    return {
      sampleSize,
      evaluatedCount: evaluated.length,
      directionalConsistency,
      timingConsistency,
      meanSpecificityScore,
      outcomeAgreementRate,
      falsePositives,
      falseNegatives,
      unknownRate,
      brierScore,
      calibrationLabel: 'DeepAstro historical calibration',
      sampleSizeAndLimitations: `Sample size: ${sampleSize} (Evaluated: ${evaluated.length}). Internal calibration metrics describe system consistency and evidence alignment, not empirical scientific proof.`,
    };
  }
}
