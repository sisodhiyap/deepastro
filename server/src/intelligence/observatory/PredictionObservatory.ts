/**
 * DeepAstro Prediction Observatory — Master Facade
 * Central intelligence-quality coordinator connecting all 37 observatory engines.
 */

import { PredictionClaim, ReleaseDecision, OutcomeStatus, PredictionOutcomeRecord } from './ObservatoryTypes.js';
import { PredictionClaimExtractor } from './PredictionClaimExtractor.js';
import { PredictionReleaseGate } from './PredictionReleaseGate.js';
import { PredictionOutcomeEngine } from './PredictionOutcomeEngine.js';
import { PredictionOutcomeVerifier } from './PredictionOutcomeVerifier.js';
import { PredictionRealityComparisonEngineV2, RealityComparisonV2Result } from './PredictionRealityComparisonEngineV2.js';
import { PredictionAccuracyEngine } from './PredictionAccuracyEngine.js';
import { PredictionCalibrationEngineV4 } from './PredictionCalibrationEngineV4.js';
import { PredictionAIJudge } from './PredictionAIJudge.js';
import { PredictionCriticEngine } from './PredictionCriticEngine.js';
import { PredictionRedTeamEngine } from './PredictionRedTeamEngine.js';
import { PredictionAuditEngine } from './PredictionAuditEngine.js';

export class PredictionObservatory {
  /**
   * Evaluates a generated forecast, extracts claims, passes through quality & release gates.
   */
  public static observeForecast(params: {
    predictionId: string;
    userId: string;
    forecastText: string;
    domain?: any;
    confidence?: number;
    evidenceIds?: string[];
    contradictionIds?: string[];
  }): {
    claim: PredictionClaim;
    releaseDecision: ReleaseDecision;
    userFacingExplanation?: string;
    qualityScore: number;
  } {
    PredictionAuditEngine.recordAction('OBSERVE_FORECAST', { userId: params.userId, predictionId: params.predictionId });

    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: params.predictionId,
      userId: params.userId,
      forecastText: params.forecastText,
      domain: params.domain,
      confidence: params.confidence,
      evidenceIds: params.evidenceIds,
      contradictionIds: params.contradictionIds,
    });

    const release = PredictionReleaseGate.evaluateRelease(claim);

    return {
      claim,
      releaseDecision: release.decision,
      userFacingExplanation: release.userFacingExplanation,
      qualityScore: release.qualityScore,
    };
  }

  /**
   * Confirms real-world outcome with strict tenant isolation and verification.
   */
  public static confirmOutcome(params: {
    predictionId: string;
    claimId: string;
    userId: string;
    status: OutcomeStatus;
    userNotes?: string;
    observedEvent?: string;
    observedDate?: string;
  }): PredictionOutcomeRecord {
    const outcome = PredictionOutcomeEngine.recordUserOutcome(params);
    const verification = PredictionOutcomeVerifier.verifyRecord(outcome, params.userId);

    if (!verification.isValid) {
      throw new Error(`OUTCOME_VERIFICATION_FAILED: ${verification.reason}`);
    }

    PredictionAuditEngine.recordAction('CONFIRM_OUTCOME', { userId: params.userId, predictionId: params.predictionId });
    return outcome;
  }

  /**
   * Evaluates reality comparison for a prediction claim against observed outcome.
   */
  public static compareReality(claim: PredictionClaim, outcome?: PredictionOutcomeRecord): RealityComparisonV2Result {
    return PredictionRealityComparisonEngineV2.compare(claim, outcome);
  }
}
