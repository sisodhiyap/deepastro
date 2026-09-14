/**
 * DeepAstro Observatory V2.0 - Provider Disagreement Engine
 * When models disagree, DO NOT average blindly.
 * INVARIANT: Significant disagreement â†’ reduce confidence or suppress.
 */
import { ProviderDisagreementResult, ProviderPosition, ChallengeRecommendation } from './ObservatoryV2Types.js';

export class ProviderDisagreementEngine {
  public static analyze(params: {
    predictionId: string;
    providers: ProviderPosition[];
  }): ProviderDisagreementResult {
    const { predictionId, providers } = params;
    const now = new Date().toISOString();

    if (providers.length < 2) {
      return {
        predictionId, providers, disagreementLevel: 'NONE',
        confidenceAdjustment: 0, action: 'NO_CHANGE', recordedAt: now,
      };
    }

    const recommendations = providers.map(p => p.recommendation);
    const uniqueRecs = new Set(recommendations).size;

    const confidences = providers.map(p => p.confidence);
    const maxConf = Math.max(...confidences);
    const minConf = Math.min(...confidences);
    const confRange = maxConf - minConf;

    const suppressCount = recommendations.filter(r => r === 'SUPPRESS').length;
    const softenCount = recommendations.filter(r => r === 'SOFTEN').length;
    const passCount = recommendations.filter(r => r === 'PASS').length;

    let disagreementLevel: ProviderDisagreementResult['disagreementLevel'];
    let confidenceAdjustment = 0;
    let action: ProviderDisagreementResult['action'];

    if (suppressCount >= Math.ceil(providers.length / 2)) {
      disagreementLevel = 'FUNDAMENTAL';
      confidenceAdjustment = -0.40;
      action = 'SUPPRESS';
    } else if (uniqueRecs >= 3 || confRange > 0.4) {
      disagreementLevel = 'SIGNIFICANT';
      confidenceAdjustment = -0.20;
      action = 'SHOW_UNCERTAINTY';
    } else if (uniqueRecs === 2 || confRange > 0.2) {
      disagreementLevel = 'MINOR';
      confidenceAdjustment = -0.08;
      action = 'REDUCE_CONFIDENCE';
    } else {
      disagreementLevel = 'NONE';
      confidenceAdjustment = 0;
      action = 'NO_CHANGE';
    }

    return {
      predictionId, providers, disagreementLevel,
      confidenceAdjustment, action, recordedAt: now,
    };
  }
}
