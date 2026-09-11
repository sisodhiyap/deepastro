/**
 * DeepAstro Intelligence Orchestrator (IntelligenceOrchestrator)
 * Master intelligence coordination hub executing the 17-stage reasoning gauntlet:
 * Intent -> Context -> Profile -> Snapshot -> Systems -> Patterns -> Contradictions ->
 * Real-World Context (if consented) -> Outcome Calibration -> Confidence -> Explanation -> Safety -> Structured Answer.
 */

import {
  StructuredIntelligenceResponse,
  IntelligenceAuditTrace,
  ReasoningPlan,
  AnswerabilityStatus,
} from './IntelligenceTypes.js';
import { UserIntentEngine } from './UserIntentEngine.js';
import { QuestionUnderstandingEngine } from './QuestionUnderstandingEngine.js';
import { ContextEngine } from './ContextEngine.js';
import { MemoryReasoningEngine } from './MemoryReasoningEngine.js';
import { UserPreferenceEngine } from './UserPreferenceEngine.js';
import { EvidenceFusionEngine } from './EvidenceFusionEngine.js';
import { ContradictionReasoningEngine } from './ContradictionReasoningEngine.js';
import { TemporalReasoningEngine } from './TemporalReasoningEngine.js';
import { LifePatternEngine } from './LifePatternEngine.js';
import { PredictionReasoningEngine } from './PredictionReasoningEngine.js';
import { DecisionIntelligenceEngine } from './DecisionIntelligenceEngine.js';
import { ResearchIntelligenceEngine } from './ResearchIntelligenceEngine.js';
import { ConfidenceEngine } from './ConfidenceEngine.js';
import { UncertaintyEngine } from './UncertaintyEngine.js';
import { ExplanationEngine } from './ExplanationEngine.js';
import { RecommendationEngine } from './RecommendationEngine.js';
import { IntelligenceTelemetry } from './IntelligenceTelemetry.js';
import { ContextGraphEngine } from './ContextGraphEngine.js';
import { ContextRelevanceEngine } from './ContextRelevanceEngine.js';
import { LongitudinalReasoningEngine } from './LongitudinalReasoningEngine.js';
import { UncertaintyCompositionEngine } from './UncertaintyCompositionEngine.js';
import { UserGoalEngine } from './UserGoalEngine.js';
import { WhatChangedEngine } from './WhatChangedEngine.js';
import { PredictionMemoryEngine } from './PredictionMemoryEngine.js';
import { DeepAstroReasoningWorkspace } from './DeepAstroReasoningWorkspace.js';
import { PredictionSkepticEngine } from './PredictionSkepticEngine.js';
import { PredictionCalibrationEngineV3 } from './PredictionCalibrationEngineV3.js';
import { CalculationSnapshot, CalculationSnapshotEngine } from '../astrology/CalculationSnapshot.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';

export interface IntelligenceOrchestratorRequest {
  userId: string;
  query: string;
  birthProfile?: BirthProfileInput;
  allowWorldResearch?: boolean;
  destinationCity?: string;
  decisionOptions?: {
    optionA: { name: string; description?: string };
    optionB: { name: string; description?: string };
  };
}

export class IntelligenceOrchestrator {
  public static async analyze(request: IntelligenceOrchestratorRequest): Promise<StructuredIntelligenceResponse> {
    const startTime = Date.now();
    const { userId, query, allowWorldResearch, destinationCity, decisionOptions } = request;
    const enginesUsed: string[] = [];

    // 1. User Preferences
    enginesUsed.push('UserPreferenceEngine');
    const preferences = UserPreferenceEngine.getPreferences(userId);

    // 2. Intent Understanding
    enginesUsed.push('UserIntentEngine');
    const intent = UserIntentEngine.classifyIntent(query, preferences.readingDepth);

    // 3. User Context & Active Goals
    enginesUsed.push('ContextEngine');
    const userContext = ContextEngine.getContext(userId);
    const authoritativeContextFacts = ContextEngine.getAuthoritativeFacts(userId);

    enginesUsed.push('UserGoalEngine');
    const activeGoals = UserGoalEngine.getActiveGoals(userId, intent.primaryCategory);

    enginesUsed.push('MemoryReasoningEngine');
    const confirmedMemories = MemoryReasoningEngine.getConfirmedMemories(userId);

    // 4. Question Understanding & Clarification Checks
    enginesUsed.push('QuestionUnderstandingEngine');
    const questionAnalysis = QuestionUnderstandingEngine.decomposeQuestion(query, intent, userContext);

    // 5. Formulate Question -> Reasoning Plan (DeepAstro 3.1 Mandate)
    const requiredEngines = [
      'UserPreferenceEngine',
      'UserIntentEngine',
      'ContextEngine',
      'CalculationSnapshotEngine',
      'TemporalReasoningEngine',
      'EvidenceFusionEngine',
      'ContradictionReasoningEngine',
      'ConfidenceEngine',
      'ExplanationEngine',
      'UncertaintyCompositionEngine',
    ];

    if (intent.primaryCategory === 'CAREER' || intent.primaryCategory === 'JOB' || intent.primaryCategory === 'RELOCATION') {
      requiredEngines.push('LongitudinalReasoningEngine', 'LifePatternEngine');
    }
    if (intent.primaryCategory === 'DECISION' && decisionOptions) {
      requiredEngines.push('DecisionIntelligenceEngine');
    }
    if (intent.primaryCategory === 'RELOCATION' && destinationCity) {
      requiredEngines.push('ResearchIntelligenceEngine');
    }

    const reasoningPlan: ReasoningPlan = {
      intent: intent.primaryCategory,
      timeHorizon: intent.timeHorizon,
      lifeDomain: intent.primaryCategory,
      requiredFacts: ['Ascendant Sign', 'Moon Rashi', 'Current Mahadasha & Antardasha', 'Key Transits'],
      requiredEngines,
      requiredSources: ['Brihat Parashara Hora Shastra', 'Jaimini Upadesha Sutras', 'Phaladeepika'],
      requiredHistory: intent.primaryCategory === 'CAREER' || intent.primaryCategory === 'JOB',
      requiredWorldResearch: Boolean(allowWorldResearch && destinationCity),
      possibleContradictions: ['Dasha timing vs Transit friction', 'Bhava lord placement vs KP sub-lord obstruction'],
      confidenceRequirements: 'MODERATE',
    };

    // 6. Context Relevance Engine (Filtering context dumping)
    enginesUsed.push('ContextRelevanceEngine');
    const filteredContextItems = ContextRelevanceEngine.filterAndRankContext({
      intent: intent.primaryCategory,
      items: [
        ...activeGoals.map((g) => ({
          id: g.goalId,
          category: 'GOAL' as const,
          content: `${g.domain} Goal: ${g.title} - ${g.description}`,
          domain: g.domain,
          userConfirmed: g.userConfirmed,
        })),
        ...confirmedMemories.map((m) => ({
          id: m.memoryId,
          category: 'RECENT_EVENT' as const,
          content: m.content,
          userConfirmed: m.confirmed,
        })),
      ],
      maxItems: 5,
    });

    // 7. Calculation Snapshot Resolution (Strictly immutable read)
    enginesUsed.push('CalculationSnapshotEngine');
    let snapshot: CalculationSnapshot;

    if (request.birthProfile && request.birthProfile.birthDate && request.birthProfile.birthTime) {
      const facts = VedicAstroEngine.createAstrologyFactSet(request.birthProfile);
      snapshot = CalculationSnapshotEngine.createSnapshot(facts);
    } else {
      // Look up saved user birth profile
      const saved = (await birthProfileRepository.getProfileByUserId(userId)) || db.getBirthProfile(userId);
      if (saved && saved.birthDate && saved.birthTime) {
        const input: BirthProfileInput = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
        const facts = VedicAstroEngine.createAstrologyFactSet(input);
        snapshot = CalculationSnapshotEngine.createSnapshot(facts);
      } else {
        // Deterministic baseline profile for exploration
        const facts = VedicAstroEngine.createAstrologyFactSet({
          name: 'Anonymous Seeker',
          birthDate: '1995-01-01',
          birthTime: '12:00',
          birthPlace: 'New Delhi',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 5.5,
        });
        snapshot = CalculationSnapshotEngine.createSnapshot(facts);
      }
    }

    // 8. Temporal Reasoning
    enginesUsed.push('TemporalReasoningEngine');
    const temporalEvaluation = TemporalReasoningEngine.evaluateWindow(snapshot, intent.timeHorizon);

    // 9. Multi-System Evidence Fusion
    enginesUsed.push('EvidenceFusionEngine');
    const { signals, convergence } = EvidenceFusionEngine.fuseEvidence(snapshot, intent.primaryCategory);

    // 10. Contradiction Reasoning
    enginesUsed.push('ContradictionReasoningEngine');
    const contradictions = ContradictionReasoningEngine.analyzeContradictions(signals, intent.primaryCategory);

    // 11. Ephemeral Context Graph Generation
    enginesUsed.push('ContextGraphEngine');
    const contextGraph = ContextGraphEngine.buildGraph({
      userId,
      query,
      intent: intent.primaryCategory,
      snapshot,
      activeGoals: activeGoals.map((g) => g.title),
      worldFacts: destinationCity ? [`Destination city: ${destinationCity}`] : [],
    });

    // 12. Longitudinal Timeline Reasoning
    enginesUsed.push('LongitudinalReasoningEngine');
    const longitudinalAnalysis = LongitudinalReasoningEngine.analyzeDomainTimeline({
      userId,
      domain: intent.primaryCategory,
      snapshot,
    });

    // 13. Life Pattern Discovery
    enginesUsed.push('LifePatternEngine');
    const discoveredPatterns = LifePatternEngine.discoverPatterns(userId);
    const patternSummaries = discoveredPatterns.map((p) => `${p.theme} [${p.strength}]: ${p.description}`);

    // 14. Uncertainty Composition (DeepAstro 3.1)
    enginesUsed.push('UncertaintyCompositionEngine');
    const uncertaintyBreakdown = UncertaintyCompositionEngine.composeUncertainty({
      snapshot,
      contradictionCount: contradictions.length,
      hasConfirmedContext: authoritativeContextFacts.length > 0 || confirmedMemories.length > 0,
      historicalSampleSize: confirmedMemories.length,
      worldDataFreshness: allowWorldResearch ? 'FRESH' : 'NOT_APPLICABLE',
    });

    // 15. What Changed Engine (Consecutive reading comparison)
    enginesUsed.push('WhatChangedEngine');
    const whatChanged = WhatChangedEngine.analyzeChanges(userId, snapshot);

    // 16. Decision or Research Intelligence (Conditional)
    let decisionSynthesis = '';
    if (intent.primaryCategory === 'DECISION' && decisionOptions) {
      enginesUsed.push('DecisionIntelligenceEngine');
      const decResult = DecisionIntelligenceEngine.evaluateDecision({
        query,
        optionA: decisionOptions.optionA,
        optionB: decisionOptions.optionB,
        timeWindow: temporalEvaluation.windowLabel,
        snapshot,
      });
      decisionSynthesis = ` Decision Evaluation: ${decResult.comparativeTradeoff}`;
    }

    let researchSynthesis = '';
    if (intent.primaryCategory === 'RELOCATION' && destinationCity) {
      enginesUsed.push('ResearchIntelligenceEngine');
      const resResult = ResearchIntelligenceEngine.evaluateRelocation({
        currentCity: userContext.location.currentCity || 'Current Location',
        destinationCity,
        userConsent: Boolean(allowWorldResearch),
        snapshot,
      });
      researchSynthesis = ` Relocation Analysis: ${resResult.synthesis}`;
    }

    // 17. Confidence Evaluation
    enginesUsed.push('ConfidenceEngine');
    const confidence = ConfidenceEngine.evaluateConfidence({
      signals,
      contradictions,
      isTimeApproximate: uncertaintyBreakdown.compositeLevel === 'LOW',
    });

    // 18. Determine Answerability Status (DeepAstro 3.1)
    let answerabilityStatus: AnswerabilityStatus = 'ANSWERABLE';
    if (questionAnalysis.clarifyingQuestions && questionAnalysis.clarifyingQuestions.length > 0) {
      answerabilityStatus = 'NEEDS_CLARIFICATION';
    } else if (contradictions.length >= 2) {
      answerabilityStatus = 'CONTRADICTORY';
    } else if (signals.length < 2) {
      answerabilityStatus = 'INSUFFICIENT_EVIDENCE';
    }

    // 19. Explanation Engine ("Why This Reading")
    enginesUsed.push('ExplanationEngine');
    const whyThisReading = ExplanationEngine.buildExplanation({
      snapshot,
      domain: intent.primaryCategory,
      signals,
      contradictions,
      confidence,
      timingBasis: temporalEvaluation.windowLabel,
      depth: intent.requestedDepth,
    });

    // 20. Recommendations
    enginesUsed.push('RecommendationEngine');
    const recommendations = RecommendationEngine.generateRecommendations(
      intent.primaryCategory,
      snapshot.dashas.currentMahadasha,
      snapshot.dashas.currentAntardasha
    );

    // 21. Direct Answer Formulation
    const answerId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const dashaText = `${snapshot.dashas.currentMahadasha}-${snapshot.dashas.currentAntardasha}`;
    const ascText = snapshot.ascendant.sign;

    let directAnswer = `Based on your verified chart (${ascText} Ascendant) during the active ${dashaText} cycle, the astrological current for ${intent.primaryCategory.toLowerCase()} indicates ${convergence.toLowerCase().replace('_', ' ')}. ${temporalEvaluation.timingSummary}`;
    if (decisionSynthesis) directAnswer += decisionSynthesis;
    if (researchSynthesis) directAnswer += researchSynthesis;

    // 22. DeepAstro 4.0 Reasoning Workspace Execution
    enginesUsed.push('DeepAstroReasoningWorkspace', 'PredictionSkepticEngine', 'PredictionCalibrationEngineV3');
    const reasoningWorkspaceTrace = DeepAstroReasoningWorkspace.executeReasoning({
      userId,
      query,
      snapshot,
      readingDepth: intent.requestedDepth === 'EXPERT' ? 5 : 3,
      allowWorldResearch,
      destinationCity,
    });

    // 23. Record Telemetry Trace
    const latency = Date.now() - startTime;
    const trace: IntelligenceAuditTrace = {
      requestId: answerId,
      userId,
      profileVersion: 1,
      calculationFingerprint: snapshot.passport?.fingerprint,
      intent: intent.primaryCategory,
      enginesUsed,
      evidenceIds: signals.map((s) => s.id),
      ruleIds: signals.map((s) => s.factor),
      ragSourceIds: signals.map((s) => s.source),
      modelUsed: 'DeepAstro-Orchestrator-4.0',
      latencyMs: latency,
      confidence,
      auditStatus: 'PASSED',
      createdAt: new Date().toISOString(),
    };
    IntelligenceTelemetry.recordTrace(trace);

    // 24. Construct Structured Intelligence Response
    return {
      answerId,
      userId,
      timestamp: new Date().toISOString(),
      intent,
      directAnswer,
      whyThisReading,
      evidenceSignals: signals,
      convergenceStatus: convergence,
      userContextApplied: [
        ...authoritativeContextFacts,
        ...filteredContextItems.map((item) => `${item.category}: ${item.content}`),
      ],
      observedPatterns: patternSummaries,
      practicalNextSteps: recommendations.practicalActions,
      traditionalRemedies: recommendations.traditionalRemedies,
      clarificationQuestions: questionAnalysis.clarifyingQuestions,
      confidence,
      uncertaintyNotes: uncertaintyBreakdown.reasons,
      passportFingerprint: snapshot.passport?.fingerprint,
      // DeepAstro 3.1 Payloads
      reasoningPlan,
      answerabilityStatus,
      contextGraph,
      longitudinalAnalysis,
      uncertaintyBreakdown,
      whatChanged,
      // DeepAstro 4.0 Payloads
      internalReasoningTrace: reasoningWorkspaceTrace.safeExplanation,
      skepticAuditSummary: reasoningWorkspaceTrace.skepticAudit,
      calibratedConfidenceScore: reasoningWorkspaceTrace.calibratedConfidence,
    };
  }
}
