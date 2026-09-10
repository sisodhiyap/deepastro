/**
 * Self-Learning Lab Service
 * Admin service providing aggregated telemetry on prediction performance, user feedback distributions,
 * error classifications, improvement proposals, and active engine versions.
 * 
 * Strict Invariant:
 * Telemetry is labeled "User Feedback & Outcome Evidence", NEVER claimed as "scientific prediction accuracy".
 */

import { db } from '../database/db.js';

export interface SelfLearningLabStats {
  telemetryHeader: 'User Feedback & Outcome Evidence';
  predictionsGenerated: number;
  feedbackReceived: number;
  feedbackDistribution: Record<string, number>;
  errorClassificationSummary: {
    totalErrorsDiagnosed: number;
    byCategory: Record<string, number>;
    timingFailures: number;
    interpretationFailures: number;
    personalizationFailures: number;
    calculationErrors: number;
  };
  proposals: {
    pendingReview: number;
    approved: number;
    rejected: number;
    staged: number;
  };
  activeVersions: {
    calculationVersion: string;
    ruleVersion: string;
    interpretationVersion: string;
    personalizationVersion: string;
    ragVersion: string;
    aiModelVersion: string;
  };
}

export class SelfLearningLabService {
  /**
   * Aggregates platform-wide telemetry for the Self-Learning Lab
   */
  public static getDashboardStats(): SelfLearningLabStats {
    const predictions = Array.from(db.predictionRecords.values());
    const feedbackList = Array.from(db.predictionFeedback.values());
    const errorList = Array.from(db.predictionErrors.values());
    const proposals = Array.from(db.improvementProposals.values());

    // Feedback rating breakdown
    const feedbackDistribution: Record<string, number> = {
      accurate: 0,
      partially_accurate: 0,
      inaccurate: 0,
      too_generic: 0,
      wrong_timing: 0,
      wrong_life_area: 0,
      not_applicable: 0,
    };
    for (const fb of feedbackList) {
      if (feedbackDistribution[fb.feedbackRating] !== undefined) {
        feedbackDistribution[fb.feedbackRating]++;
      } else {
        feedbackDistribution[fb.feedbackRating] = 1;
      }
    }

    // Error classification breakdown
    const byCategory: Record<string, number> = {};
    let timingFailures = 0;
    let interpretationFailures = 0;
    let personalizationFailures = 0;
    let calculationErrors = 0;

    for (const err of errorList) {
      byCategory[err.errorClass] = (byCategory[err.errorClass] || 0) + 1;
      if (err.errorClass === 'TIMING_ERROR') timingFailures++;
      if (err.errorClass === 'INTERPRETATION_ERROR') interpretationFailures++;
      if (err.errorClass === 'PERSONALIZATION_ERROR') personalizationFailures++;
      if (err.errorClass === 'CALCULATION_ERROR') calculationErrors++;
    }

    // Proposals breakdown
    const proposalStats = {
      pendingReview: proposals.filter(p => p.status === 'PENDING_REVIEW').length,
      approved: proposals.filter(p => p.status === 'APPROVED').length,
      rejected: proposals.filter(p => p.status === 'REJECTED').length,
      staged: proposals.filter(p => p.status === 'STAGED').length,
    };

    return {
      telemetryHeader: 'User Feedback & Outcome Evidence',
      predictionsGenerated: predictions.length,
      feedbackReceived: feedbackList.length,
      feedbackDistribution,
      errorClassificationSummary: {
        totalErrorsDiagnosed: errorList.length,
        byCategory,
        timingFailures,
        interpretationFailures,
        personalizationFailures,
        calculationErrors,
      },
      proposals: proposalStats,
      activeVersions: {
        calculationVersion: '3.0.0-verified',
        ruleVersion: '2.4.0-parashari',
        interpretationVersion: '2.1.0-evidence',
        personalizationVersion: '1.0.0-memory',
        ragVersion: '2.0.0-classical',
        aiModelVersion: 'deterministic-rule-synthesis-v1',
      },
    };
  }
}
