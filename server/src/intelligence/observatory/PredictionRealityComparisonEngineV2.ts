/**
 * DeepAstro Prediction Reality Comparison Engine V2
 * Independent dimensional evaluation:
 * EVENT_MATCH, TIMING_MATCH, DIRECTION_MATCH, MAGNITUDE_MATCH, CONTEXT_MATCH.
 * Invariant: Never collapses independent dimensions into a single misleading percentage.
 */

import { PredictionClaim, PredictionOutcomeRecord } from './ObservatoryTypes.js';
import { PredictionTimingAccuracyEngine } from './PredictionTimingAccuracyEngine.js';
import { PredictionDirectionAccuracyEngine } from './PredictionDirectionAccuracyEngine.js';
import { PredictionMagnitudeEngine } from './PredictionMagnitudeEngine.js';
import { PredictionContextAccuracyEngine } from './PredictionContextAccuracyEngine.js';

export interface RealityComparisonV2Result {
  comparisonId: string;
  predictionId: string;
  claimId: string;
  eventAccuracy: number;
  timingAccuracy: number;
  directionAccuracy: number;
  magnitudeAccuracy: number;
  contextAccuracy: number;
  overallQuality: 'EXEMPLARY' | 'SUBSTANTIAL' | 'PARTIAL' | 'UNCONFIRMED' | 'CONTRADICTED';
  dimensionalBreakdown: {
    eventMatch: boolean;
    insideTimingWindow: boolean;
    directionMatch: boolean;
    magnitudeProportional: boolean;
    contextMatch: boolean;
  };
  analysisSummary: string;
  comparedAt: string;
}

export class PredictionRealityComparisonEngineV2 {
  public static compare(claim: PredictionClaim, outcome?: PredictionOutcomeRecord): RealityComparisonV2Result {
    const comparisonId = `rcmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (!outcome || outcome.status === 'UNKNOWN' || outcome.status === 'AWAITING_OUTCOME') {
      return {
        comparisonId,
        predictionId: claim.predictionId,
        claimId: claim.claimId,
        eventAccuracy: 0,
        timingAccuracy: 0,
        directionAccuracy: 0,
        magnitudeAccuracy: 0,
        contextAccuracy: 0,
        overallQuality: 'UNCONFIRMED',
        dimensionalBreakdown: {
          eventMatch: false,
          insideTimingWindow: false,
          directionMatch: false,
          magnitudeProportional: false,
          contextMatch: false,
        },
        analysisSummary: 'Outcome remains unconfirmed. Evaluation deferred.',
        comparedAt: now,
      };
    }

    let eventAccuracy = 0.0;
    if (outcome.status === 'USER_CONFIRMED' || outcome.status === 'EXTERNALLY_VERIFIED') {
      eventAccuracy = 1.0;
    } else if (outcome.status === 'USER_PARTIALLY_CONFIRMED') {
      eventAccuracy = 0.5;
    }

    const timingRes = PredictionTimingAccuracyEngine.evaluateTiming({
      windowStart: claim.timingWindow.startDate,
      windowEnd: claim.timingWindow.endDate,
      observedDate: outcome.observedDate,
    });

    const dirRes = PredictionDirectionAccuracyEngine.evaluateDirection(claim.direction, outcome.observedDirection);
    const magRes = PredictionMagnitudeEngine.evaluateMagnitude(claim.magnitude, outcome.observedMagnitude);
    const ctxRes = PredictionContextAccuracyEngine.evaluateContext(claim.domain, outcome.observedContext);

    let overallQuality: 'EXEMPLARY' | 'SUBSTANTIAL' | 'PARTIAL' | 'UNCONFIRMED' | 'CONTRADICTED' = 'PARTIAL';
    if (outcome.status === 'USER_NOT_CONFIRMED' || outcome.status === 'CONTRADICTED') {
      overallQuality = 'CONTRADICTED';
    } else if (eventAccuracy === 1.0 && timingRes.insideWindow && dirRes.match) {
      overallQuality = 'EXEMPLARY';
    } else if (eventAccuracy >= 0.5 && (timingRes.insideWindow || dirRes.match)) {
      overallQuality = 'SUBSTANTIAL';
    }

    const analysisSummary = `Observed: Event Match [${eventAccuracy > 0}], Timing deviation [${timingRes.deviationDays}d], Direction [${dirRes.notes}], Context [${ctxRes.contextMatch}]. Quality: ${overallQuality}.`;

    return {
      comparisonId,
      predictionId: claim.predictionId,
      claimId: claim.claimId,
      eventAccuracy,
      timingAccuracy: timingRes.timingPrecisionScore,
      directionAccuracy: dirRes.score,
      magnitudeAccuracy: magRes.score,
      contextAccuracy: ctxRes.contextScore,
      overallQuality,
      dimensionalBreakdown: {
        eventMatch: eventAccuracy > 0,
        insideTimingWindow: timingRes.insideWindow,
        directionMatch: dirRes.match,
        magnitudeProportional: magRes.proportional,
        contextMatch: ctxRes.contextMatch,
      },
      analysisSummary,
      comparedAt: now,
    };
  }
}
