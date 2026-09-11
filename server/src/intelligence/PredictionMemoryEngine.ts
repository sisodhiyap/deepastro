/**
 * DeepAstro 3.1 — Prediction Memory & De-duplication Engine (PredictionMemoryEngine)
 * Tracks active and historical predictions generated for each user.
 * Evaluates past prediction performance to calibrate forward expectations and
 * detects duplicate predictions (same domain, overlapping time window, same primary drivers)
 * to avoid spamming the user with redundant forecast iterations.
 * Invariant: Never alters underlying astrological rules or mutates historical records.
 */

import { ConfidenceLevel } from './IntelligenceTypes.js';

export interface StoredPrediction {
  predictionId: string;
  userId: string;
  domain: string;
  timeWindow: string;
  direction: 'FAVORABLE' | 'UNFAVORABLE' | 'TRANSITIONAL' | 'NEUTRAL';
  primaryEvidence: string[];
  userGoalAssociation?: string;
  confidence: ConfidenceLevel;
  generatedAt: string;
  outcomeStatus?: 'SUCCESS' | 'PARTIAL' | 'NOT_OCCURRED' | 'PENDING';
  userFeedbackRating?: 'HELPFUL' | 'PARTIAL' | 'NOT_HELPFUL';
}

export class PredictionMemoryEngine {
  private static userPredictions: Map<string, StoredPrediction[]> = new Map();

  public static recordPrediction(prediction: StoredPrediction): void {
    const list = this.userPredictions.get(prediction.userId) || [];
    list.push(prediction);
    this.userPredictions.set(prediction.userId, list);
  }

  public static getPredictions(userId: string): StoredPrediction[] {
    return this.userPredictions.get(userId) || [];
  }

  /**
   * Evaluates if a newly formulated prediction is a duplicate of an existing active prediction.
   */
  public static checkDuplication(params: {
    userId: string;
    domain: string;
    timeWindow: string;
    evidenceTokens: string[];
    userGoal?: string;
  }): { isDuplicate: boolean; existingPrediction?: StoredPrediction; reason?: string } {
    const list = this.getPredictions(params.userId);
    const domainNorm = params.domain.toUpperCase();

    for (const p of list) {
      if (p.domain.toUpperCase() === domainNorm && p.timeWindow === params.timeWindow) {
        // Check evidence overlap
        const sharedEvidence = p.primaryEvidence.filter((ev) =>
          params.evidenceTokens.some((tok) => ev.toLowerCase().includes(tok.toLowerCase()))
        );

        if (sharedEvidence.length >= 1 || p.userGoalAssociation === params.userGoal) {
          return {
            isDuplicate: true,
            existingPrediction: p,
            reason: `Existing prediction [${p.predictionId}] already covers domain "${params.domain}" for window "${params.timeWindow}".`,
          };
        }
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Retrieves relevant historical predictions to inform current calibration.
   */
  public static retrieveHistoricalCalibration(userId: string, domain: string): {
    totalSimilar: number;
    confirmedSuccessful: number;
    calibrationInsight?: string;
  } {
    const list = this.getPredictions(userId).filter(
      (p) => p.domain.toUpperCase() === domain.toUpperCase() && p.outcomeStatus && p.outcomeStatus !== 'PENDING'
    );

    if (list.length === 0) {
      return {
        totalSimilar: 0,
        confirmedSuccessful: 0,
        calibrationInsight: 'No previous outcome data recorded for this domain yet.',
      };
    }

    const successes = list.filter((p) => p.outcomeStatus === 'SUCCESS' || p.outcomeStatus === 'PARTIAL').length;
    const ratio = Math.round((successes / list.length) * 100);

    return {
      totalSimilar: list.length,
      confirmedSuccessful: successes,
      calibrationInsight: `Historical calibration: ${ratio}% of ${list.length} prior verified predictions in this domain aligned with observed outcomes.`,
    };
  }
}
