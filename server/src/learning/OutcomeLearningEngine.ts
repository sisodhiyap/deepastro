/**
 * Outcome Learning Engine
 * Records user feedback and confirmed real-world life outcomes against generated predictions.
 * 
 * Strict Invariant:
 * User feedback is stored as USER_OUTCOME_EVIDENCE. It is never treated as mathematical or
 * astrological proof of a classical rule, nor can it silently mutate production calculations.
 */

import { db, PredictionFeedbackRecord } from '../database/db.js';
import { KnowledgeItem } from './KnowledgeTaxonomy.js';
import { PersonalizationProfileService } from './PersonalizationProfile.js';

export type UserFeedbackRating =
  | 'accurate'
  | 'partially_accurate'
  | 'inaccurate'
  | 'too_generic'
  | 'wrong_timing'
  | 'wrong_life_area'
  | 'not_applicable';

export interface SubmitFeedbackInput {
  predictionId: string;
  rating: UserFeedbackRating;
  notes?: string;
  actualOutcomeDescription?: string;
  outcomeDate?: string;
}

export class OutcomeLearningEngine {
  /**
   * Records user outcome evidence against a prediction
   */
  public static recordFeedback(
    userId: string,
    input: SubmitFeedbackInput
  ): { feedbackRecord: PredictionFeedbackRecord; outcomeEvidence: KnowledgeItem } {
    const profile = PersonalizationProfileService.getProfile(userId);
    if (!profile.outcomeLearningEnabled) {
      throw new Error('Outcome learning is disabled by user preference in My Cosmic Memory');
    }

    const prediction = db.predictionRecords.get(input.predictionId);
    if (!prediction || prediction.userId !== userId) {
      throw new Error('Prediction record not found or unauthorized');
    }

    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const feedbackRecord: PredictionFeedbackRecord = {
      id: feedbackId,
      predictionId: input.predictionId,
      userId,
      feedbackRating: input.rating,
      userNotes: input.notes?.trim(),
      createdAt: now,
    };
    db.predictionFeedback.set(feedbackId, feedbackRecord);

    // Package as strictly separated USER_OUTCOME_EVIDENCE knowledge item
    const outcomeEvidence: KnowledgeItem = {
      id: `ev_${feedbackId}`,
      category: 'USER_OUTCOME_EVIDENCE',
      title: `User Outcome for Prediction ${input.predictionId} (${input.rating})`,
      content: `Rating: ${input.rating}. Notes: ${input.notes || 'None'}. Outcome: ${input.actualOutcomeDescription || 'None'}`,
      sourceAuthority: 'USER_FEEDBACK_TELEMETRY',
      tradition: 'MODERN_EMPIRICAL',
      isCanonicalDoctrine: false, // Invariant: Never doctrine
      version: '1.0.0',
      createdAt: now,
    };

    return {
      feedbackRecord,
      outcomeEvidence,
    };
  }

  /**
   * Retrieves all feedback submitted for a prediction
   */
  public static getFeedbackForPrediction(predictionId: string): PredictionFeedbackRecord[] {
    return Array.from(db.predictionFeedback.values()).filter(f => f.predictionId === predictionId);
  }
}
