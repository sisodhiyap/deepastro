/**
 * DeepAstro Observatory V2.0 - Post-Hoc Detection Engine
 * Detects whether the system changed interpretation after seeing the outcome.
 * If post-outcome explanation introduces new evidence â†’ POST_HOC_REASONING_DETECTED.
 */
import { PostHocAnalysis, PostHocStatus } from './ObservatoryV2Types.js';
import { createHash } from 'crypto';

export class PostHocDetectionEngine {
  public static hashForecast(forecastText: string): string {
    return createHash('sha256').update(forecastText.trim()).digest('hex');
  }

  public static analyze(params: {
    predictionId: string;
    originalForecastText: string;
    originalEvidenceIds: string[];
    postOutcomeExplanation?: string;
    postOutcomeEvidenceIds?: string[];
  }): PostHocAnalysis {
    const {
      predictionId, originalForecastText, originalEvidenceIds,
      postOutcomeExplanation, postOutcomeEvidenceIds = [],
    } = params;

    const originalForecastHash = this.hashForecast(originalForecastText);

    if (!postOutcomeExplanation && postOutcomeEvidenceIds.length === 0) {
      return {
        predictionId, originalForecastHash, postOutcomeExplanation: undefined,
        newEvidenceIntroduced: [], status: 'INSUFFICIENT_DATA',
        excludedFromAccuracy: false, analyzedAt: new Date().toISOString(),
      };
    }

    const newEvidence = postOutcomeEvidenceIds.filter(id => !originalEvidenceIds.includes(id));

    // Check for new evidence introduced in explanation
    const newEvidenceIntroduced: string[] = [...newEvidence];
    if (postOutcomeExplanation) {
      const newEvidenceKeywords = [
        'as we can now see', 'looking back', 'in retrospect', 'we now know',
        'the outcome shows', 'this confirms', 'as proven by', 'given what happened',
      ];
      for (const keyword of newEvidenceKeywords) {
        if (postOutcomeExplanation.toLowerCase().includes(keyword)) {
          newEvidenceIntroduced.push(`retrospective_language: "${keyword}"`);
        }
      }
    }

    let status: PostHocStatus;
    if (newEvidenceIntroduced.length > 0) status = 'POST_HOC_REASONING_DETECTED';
    else status = 'CLEAN';

    return {
      predictionId, originalForecastHash,
      postOutcomeExplanation, newEvidenceIntroduced,
      status, excludedFromAccuracy: status === 'POST_HOC_REASONING_DETECTED',
      analyzedAt: new Date().toISOString(),
    };
  }
}
