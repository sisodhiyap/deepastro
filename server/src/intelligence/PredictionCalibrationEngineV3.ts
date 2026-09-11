/**
 * DeepAstro 4.0 — Prediction Calibration Engine V3 (PredictionCalibrationEngineV3)
 * Tracks predicted confidence against actual confirmed user outcomes over time.
 * Calculates Brier scores and calibration error curves.
 * Detects: OVERCONFIDENCE, UNDERCONFIDENCE, GOOD_CALIBRATION, INSUFFICIENT_DATA.
 * Invariant: Teaches the system WHEN TO BE LESS CONFIDENT.
 */

import { SkepticVerdict } from './PredictionSkepticEngine.js';

export type CalibrationStatus =
  | 'GOOD_CALIBRATION'
  | 'OVERCONFIDENCE'
  | 'UNDERCONFIDENCE'
  | 'INSUFFICIENT_DATA';

export interface CalibrationRecord {
  predictionId: string;
  userId: string;
  predictedConfidence: number; // 0.0 to 1.0
  confirmedOutcomeScore: number; // 1.0 for HAPPENED, 0.5 for PARTIAL, 0.0 for DID_NOT_HAPPEN
  brierScore: number;
  domain: string;
  timestamp: string;
}

export interface CalibrationReportV3 {
  totalEvaluated: number;
  overallBrierScore: number; // 0.0 (perfect) to 1.0 (poor)
  meanPredictedConfidence: number;
  meanActualOutcome: number;
  calibrationError: number;
  status: CalibrationStatus;
  domainMetrics: Record<string, {
    count: number;
    brierScore: number;
    status: CalibrationStatus;
  }>;
  recommendation: string;
}

export class PredictionCalibrationEngineV3 {
  private static history: CalibrationRecord[] = [];

  public static resetStore(): void {
    this.history = [];
  }

  public static recordCalibrationPoint(record: {
    predictionId: string;
    userId: string;
    predictedConfidence: number;
    confirmedOutcome: 'HAPPENED' | 'PARTIALLY_HAPPENED' | 'DID_NOT_HAPPEN' | 'UNKNOWN';
    domain: string;
  }): void {
    if (record.confirmedOutcome === 'UNKNOWN') {
      // Invariant: Never convert UNKNOWN into a numerical outcome
      return;
    }

    let outcomeScore = 0.0;
    if (record.confirmedOutcome === 'HAPPENED') outcomeScore = 1.0;
    if (record.confirmedOutcome === 'PARTIALLY_HAPPENED') outcomeScore = 0.5;

    const brierScore = Number(Math.pow(record.predictedConfidence - outcomeScore, 2).toFixed(4));

    this.history.push({
      predictionId: record.predictionId,
      userId: record.userId,
      predictedConfidence: record.predictedConfidence,
      confirmedOutcomeScore: outcomeScore,
      brierScore,
      domain: record.domain,
      timestamp: new Date().toISOString(),
    });
  }

  public static calibrateScore(params: {
    rawConfidence: number;
    skepticVerdict: SkepticVerdict;
    domain: string;
    userId: string;
  }): number {
    const { rawConfidence, skepticVerdict, domain, userId } = params;

    let calibrated = rawConfidence;

    // 1. Skeptic dampening
    if (skepticVerdict === 'INSUFFICIENT_EVIDENCE') {
      calibrated = Math.min(calibrated, 0.35);
    } else if (skepticVerdict === 'WEAK') {
      calibrated = Math.min(calibrated, 0.48);
    } else if (skepticVerdict === 'MIXED') {
      calibrated = Math.min(calibrated, 0.65);
    }

    // 2. Historical overconfidence penalty check
    const domainRecords = this.history.filter((h) => h.domain === domain);
    if (domainRecords.length >= 3) {
      const avgPred = domainRecords.reduce((acc, r) => acc + r.predictedConfidence, 0) / domainRecords.length;
      const avgActual = domainRecords.reduce((acc, r) => acc + r.confirmedOutcomeScore, 0) / domainRecords.length;
      if (avgPred - avgActual > 0.15) {
        // Historical overconfidence detected in this domain -> dampen confidence
        calibrated *= 0.85;
      }
    }

    return Number(Math.max(0.1, Math.min(0.95, calibrated)).toFixed(3));
  }

  public static generateReport(userId?: string): CalibrationReportV3 {
    const records = userId ? this.history.filter((h) => h.userId === userId) : this.history;

    if (records.length < 3) {
      return {
        totalEvaluated: records.length,
        overallBrierScore: 0,
        meanPredictedConfidence: 0,
        meanActualOutcome: 0,
        calibrationError: 0,
        status: 'INSUFFICIENT_DATA',
        domainMetrics: {},
        recommendation: 'Collect at least 3 user-confirmed outcomes before computing reliable calibration statistics.',
      };
    }

    const total = records.length;
    const meanPredicted = records.reduce((a, b) => a + b.predictedConfidence, 0) / total;
    const meanActual = records.reduce((a, b) => a + b.confirmedOutcomeScore, 0) / total;
    const overallBrier = records.reduce((a, b) => a + b.brierScore, 0) / total;
    const calibrationError = Number((meanPredicted - meanActual).toFixed(4));

    let status: CalibrationStatus = 'GOOD_CALIBRATION';
    let recommendation = 'Predictions exhibit well-calibrated confidence matching empirical outcomes.';

    if (calibrationError > 0.12) {
      status = 'OVERCONFIDENCE';
      recommendation = 'System exhibits overconfidence bias. Dampen future predictions in highlighted domains.';
    } else if (calibrationError < -0.12) {
      status = 'UNDERCONFIDENCE';
      recommendation = 'System exhibits excessive timidity. Increase confidence when multi-system convergence holds.';
    }

    // Domain metrics
    const domainMetrics: Record<string, { count: number; brierScore: number; status: CalibrationStatus }> = {};
    const domains = Array.from(new Set(records.map((r) => r.domain)));
    for (const dom of domains) {
      const domRecords = records.filter((r) => r.domain === dom);
      const domBrier = domRecords.reduce((a, b) => a + b.brierScore, 0) / domRecords.length;
      const domPred = domRecords.reduce((a, b) => a + b.predictedConfidence, 0) / domRecords.length;
      const domAct = domRecords.reduce((a, b) => a + b.confirmedOutcomeScore, 0) / domRecords.length;
      let domStatus: CalibrationStatus = 'GOOD_CALIBRATION';
      if (domPred - domAct > 0.12) domStatus = 'OVERCONFIDENCE';
      else if (domPred - domAct < -0.12) domStatus = 'UNDERCONFIDENCE';

      domainMetrics[dom] = {
        count: domRecords.length,
        brierScore: Number(domBrier.toFixed(4)),
        status: domStatus,
      };
    }

    return {
      totalEvaluated: total,
      overallBrierScore: Number(overallBrier.toFixed(4)),
      meanPredictedConfidence: Number(meanPredicted.toFixed(3)),
      meanActualOutcome: Number(meanActual.toFixed(3)),
      calibrationError,
      status,
      domainMetrics,
      recommendation,
    };
  }
}
