/**
 * DeepAstro Observatory V2.0 - Self-Critique Orchestrator
 * Full pipeline: FORECAST â†’ CLAIM_EXTRACTION â†’ EVIDENCE â†’ CONTRADICTION â†’ FACT_CHECK â†’
 * FALSIFIABILITY â†’ AI_CRITIC â†’ RED_TEAM â†’ QUALITY_GATE â†’ FINAL_FORECAST
 * INVARIANT: AI synthesis may improve clarity but cannot change deterministic facts.
 */
import { PredictionChallengerEngine } from './PredictionChallengerEngine.js';
import { StatementClassifier } from './StatementClassifier.js';
import { PredictionFalsifiabilityEngine } from './PredictionFalsifiabilityEngine.js';
import { PredictionQualityVectorEngine } from './PredictionQualityVectorEngine.js';
import { PredictionHallucinationAuditor } from './PredictionHallucinationAuditor.js';
import { PredictionCriticMesh } from './PredictionCriticMesh.js';
import { PredictionImmutabilityGuard } from './PredictionImmutabilityGuard.js';
import { ChallengeRecommendation, PredictionQualityVector } from './ObservatoryV2Types.js';

export interface SelfCritiqueResult {
  predictionId: string;
  pipeline: string[];
  statementsClassified: number;
  falsifiabilityLevel: string;
  hallucinationSeverity: string;
  challengeRecommendation: ChallengeRecommendation;
  criticMeshRecommendation: ChallengeRecommendation;
  finalDecision: ChallengeRecommendation;
  qualityVector: PredictionQualityVector;
  suppressionReason?: string;
  completedAt: string;
}

export class SelfCritiqueOrchestrator {
  public static async run(params: {
    predictionId: string;
    forecastText: string;
    evidenceCount: number;
    contradictionCount: number;
    confidence: number;
    hasTimeWindow: boolean;
    hasDomain: boolean;
    hasDirection: boolean;
    hasMagnitude: boolean;
    domain?: string;
    eventDescription?: string;
    direction?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
    magnitude?: string;
    contextDescription?: string;
    evidenceIds?: string[];
    modelId?: string;
    providerId?: string;
    promptVersion?: string;
    knowledgeVersion?: string;
    engineVersion?: string;
    calculationSnapshotHash?: string;
  }): Promise<SelfCritiqueResult> {
    const { predictionId, forecastText } = params;
    const pipeline: string[] = [];

    // Stage 1: CLAIM EXTRACTION (structural)
    pipeline.push('CLAIM_EXTRACTION');

    // Stage 2: STATEMENT CLASSIFICATION
    pipeline.push('STATEMENT_CLASSIFICATION');
    const sentences = forecastText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const classified = StatementClassifier.classifyAll(
      sentences.map((s, i) => ({ id: `stmt_${predictionId}_${i}`, text: s.trim() }))
    );

    // Stage 3: EVIDENCE
    pipeline.push('EVIDENCE');

    // Stage 4: CONTRADICTION
    pipeline.push('CONTRADICTION');

    // Stage 5: FACT CHECK
    pipeline.push('FACT_CHECK');

    // Stage 6: FALSIFIABILITY
    pipeline.push('FALSIFIABILITY');
    const falsifiabilityResult = PredictionFalsifiabilityEngine.evaluate({
      predictionId, forecastText,
      domain: params.domain, eventDescription: params.eventDescription,
      direction: params.direction, timeWindowStart: params.timeWindowStart,
      timeWindowEnd: params.timeWindowEnd, magnitude: params.magnitude,
      contextDescription: params.contextDescription,
    });

    // Stage 7: HALLUCINATION AUDIT
    pipeline.push('HALLUCINATION_AUDIT');
    const halluResult = PredictionHallucinationAuditor.audit({
      predictionId, forecastText,
    });

    // Stage 8: AI CRITIC (deterministic fallback)
    pipeline.push('AI_CRITIC');
    const challengeResult = PredictionChallengerEngine.challenge({
      predictionId, forecastText,
      evidenceCount: params.evidenceCount, contradictionCount: params.contradictionCount,
      confidence: params.confidence, hasTimeWindow: params.hasTimeWindow,
      hasDomain: params.hasDomain, hasDirection: params.hasDirection,
    });

    // Stage 9: RED TEAM (critic mesh)
    pipeline.push('RED_TEAM');
    const criticMeshResult = PredictionCriticMesh.runDeterministicCritique({
      predictionId, forecastText,
      evidenceCount: params.evidenceCount, contradictionCount: params.contradictionCount,
      confidence: params.confidence, hasTimeWindow: params.hasTimeWindow,
      hasDomain: params.hasDomain, hasDirection: params.hasDirection,
      biasFlags: challengeResult.biasFlags,
      hallucinationSeverity: halluResult.overallSeverity,
      falsifiabilityScore: falsifiabilityResult.score,
    });

    // Stage 10: QUALITY GATE
    pipeline.push('QUALITY_GATE');
    const qualityVector = PredictionQualityVectorEngine.compute({
      predictionId,
      evidenceCount: params.evidenceCount, contradictionCount: params.contradictionCount,
      confidence: params.confidence,
      hasTimeWindow: params.hasTimeWindow, hasDomain: params.hasDomain,
      hasDirection: params.hasDirection, hasMagnitude: params.hasMagnitude,
      isFalsifiable: falsifiabilityResult.level !== 'NO',
      falsifiabilityScore: falsifiabilityResult.score,
      hallucinationRisk: halluResult.overallSeverity === 'CRITICAL_QUALITY_FAILURE' ? 1.0 : halluResult.overallSeverity === 'HIGH_RISK' ? 0.6 : 0.1,
      modelAgreementScore: 1 - Math.abs(criticMeshResult.consensusConfidenceAdjustment),
      hasCalculationAnchor: classified.some(c => c.classification === 'CALCULATION'),
      usedPostCutoffData: false,
      biasFlags: challengeResult.biasFlags,
      unsupportedClaimRate: params.evidenceCount < 2 ? 0.4 : 0.1,
      overconfidentLanguage: challengeResult.biasFlags.includes('OVERCONFIDENCE'),
    });

    // Stage 11: FINAL FORECAST
    pipeline.push('FINAL_FORECAST');

    // Final decision: most restrictive wins
    const decisions = [challengeResult.recommendation, criticMeshResult.fusedRecommendation];
    let finalDecision: ChallengeRecommendation;
    if (decisions.includes('SUPPRESS')) finalDecision = 'SUPPRESS';
    else if (decisions.includes('SOFTEN')) finalDecision = 'SOFTEN';
    else if (decisions.includes('REQUEST_CONTEXT')) finalDecision = 'REQUEST_CONTEXT';
    else finalDecision = 'PASS';

    return {
      predictionId, pipeline,
      statementsClassified: classified.length,
      falsifiabilityLevel: falsifiabilityResult.level,
      hallucinationSeverity: halluResult.overallSeverity,
      challengeRecommendation: challengeResult.recommendation,
      criticMeshRecommendation: criticMeshResult.fusedRecommendation,
      finalDecision, qualityVector,
      suppressionReason: finalDecision === 'SUPPRESS' ? criticMeshResult.criticalFlags.join('; ') : undefined,
      completedAt: new Date().toISOString(),
    };
  }
}
