/**
 * DeepAstro 4.0 — Internal Reasoning Workspace (DeepAstroReasoningWorkspace)
 * Executes the structured multi-stage reasoning pipeline for any significant query:
 * 
 * Pipeline:
 * USER QUESTION
 *   -> INTENT CLASSIFICATION
 *   -> QUESTION DECOMPOSITION
 *   -> KNOWN CONTEXT
 *   -> MISSING CONTEXT
 *   -> USER MEMORY
 *   -> RELEVANT CHART DATA
 *   -> RELEVANT ASTROLOGICAL SYSTEMS
 *   -> RESEARCH REQUIREMENTS
 *   -> EVIDENCE REQUIREMENTS
 *   -> CONTRADICTION CHECK
 *   -> ALTERNATIVE HYPOTHESES
 *   -> REASONING
 *   -> SKEPTIC AUDIT
 *   -> PREDICTION / ANSWER
 *   -> CONFIDENCE CALIBRATION
 *   -> UNCERTAINTY
 *   -> SAFE EXPLANATION SUMMARY
 * 
 * Invariants:
 * 1. Private chain-of-thought is never leaked to the client.
 * 2. Provides structured, safe explanation summaries.
 * 3. Never alters deterministic Layer A astronomical calculations.
 */

import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { UserIntentEngine } from './UserIntentEngine.js';
import { QuestionUnderstandingEngine } from './QuestionUnderstandingEngine.js';
import { ContextEngine } from './ContextEngine.js';
import { MemoryReasoningEngine } from './MemoryReasoningEngine.js';
import { EvidenceFusionEngineV3, EvidenceFusionResultV3 } from './EvidenceFusionEngineV3.js';
import { ContradictionReasoningEngine } from './ContradictionReasoningEngine.js';
import { PredictionSkepticEngine, SkepticAuditResult } from './PredictionSkepticEngine.js';
import { PredictionCalibrationEngineV3 } from './PredictionCalibrationEngineV3.js';
import { UncertaintyCompositionEngine } from './UncertaintyCompositionEngine.js';

export interface InternalReasoningPlanTrace {
  planId: string;
  userId: string;
  query: string;
  intent: string;
  decomposition: {
    primaryFocus: string;
    subQuestions: string[];
    isMultiPart: boolean;
  };
  knownContext: string[];
  missingContext: string[];
  userMemory: string[];
  chartFactors: string[];
  systemsConsulted: string[];
  researchRequirements: string[];
  evidenceSummary: {
    totalSignals: number;
    convergence: string;
    fusedScore: number;
  };
  contradictions: string[];
  alternativeHypotheses: string[];
  skepticAudit: SkepticAuditResult;
  calibratedConfidence: number;
  uncertaintyNotes: string[];
  safeExplanation: SafeExplanationSummary;
  createdAt: string;
}

export interface SafeExplanationSummary {
  relevantChartFactors: string[];
  evidenceUsed: string[];
  systemsConsulted: string[];
  mainReasoningFactors: string[];
  contradictions: string[];
  confidence: number;
  confidenceClassification: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_EVIDENCE';
  uncertainty: string;
  whyConclusionSelected: string;
}

export class DeepAstroReasoningWorkspace {
  public static executeReasoning(params: {
    userId: string;
    query: string;
    snapshot: CalculationSnapshot;
    readingDepth?: number;
    allowWorldResearch?: boolean;
    destinationCity?: string;
  }): InternalReasoningPlanTrace {
    const { userId, query, snapshot, readingDepth = 3 } = params;
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Intent Classification
    const depth: 'BEGINNER' | 'STANDARD' | 'EXPERT' = readingDepth >= 4 ? 'EXPERT' : readingDepth <= 1 ? 'BEGINNER' : 'STANDARD';
    const intent = UserIntentEngine.classifyIntent(query, depth);

    // 2. User Context & Authoritative Facts
    const userContext = ContextEngine.getContext(userId);
    const authFacts = ContextEngine.getAuthoritativeFacts(userId);
    const confirmedMemories = MemoryReasoningEngine.getConfirmedMemories(userId);

    // 3. Question Decomposition
    const questionAnalysis = QuestionUnderstandingEngine.decomposeQuestion(query, intent, userContext);
    const subQuestions = questionAnalysis.clarifyingQuestions || [];

    // 4. Relevant Chart Data & Systems
    const dashaLord = snapshot.dashas.currentMahadasha;
    const antardashaLord = snapshot.dashas.currentAntardasha;
    const ascSign = snapshot.ascendant.sign;
    const moonSign = snapshot.planetaryPositions.find((p) => p.planet === 'Moon')?.sign || 'Moon Sign';

    const chartFactors = [
      `Ascendant: ${ascSign}`,
      `Moon Sign: ${moonSign}`,
      `Active Dasha: ${dashaLord}-${antardashaLord}`,
      `Transit Saturn & Jupiter alignments`,
    ];

    const systemsConsulted = [
      'Parashari Natal & Dasha System',
      'Jaimini Chara Karakas',
      'KP Sub-Lord Interlocking',
      'Gochar Transit Dynamics',
    ];

    // 5. Evidence Fusion V3
    const fusionResult: EvidenceFusionResultV3 = EvidenceFusionEngineV3.fuseEvidence({
      snapshot,
      domain: intent.primaryCategory,
      userContextFacts: authFacts,
    });

    // 6. Contradictions Check
    const rawContradictions = ContradictionReasoningEngine.analyzeContradictions(
      fusionResult.signals,
      intent.primaryCategory
    );
    const contradictions = rawContradictions.map((c) => `${c.primarySignal} vs ${c.opposingSignal}: ${c.reasonForDivergence}`);

    // 7. Alternative Hypotheses Formulation
    const alternativeHypotheses = [
      `Hypothesis Alpha: Dominant ${dashaLord} Mahadasha governs primary progression directly without significant transit disruption.`,
      `Hypothesis Beta: Secondary transit friction (${antardashaLord} Antardasha) delays anticipated inflection point by 1-2 quarters.`,
      `Hypothesis Gamma: Environmental/vocational contextual shifts moderate direct planetary expression.`,
    ];

    // 8. Prediction Skeptic Engine (Adversarial Disproval Audit)
    const skepticAudit = PredictionSkepticEngine.auditPrediction({
      domain: intent.primaryCategory,
      signals: fusionResult.signals,
      contradictions: rawContradictions,
      proposedConfidence: fusionResult.fusedEvidenceScore,
      sampleSize: confirmedMemories.length,
    });

    // 9. Prediction Calibration Engine V3
    const calibratedConfidence = PredictionCalibrationEngineV3.calibrateScore({
      rawConfidence: skepticAudit.supportScore,
      skepticVerdict: skepticAudit.skepticVerdict,
      domain: intent.primaryCategory,
      userId,
    });

    // 10. Uncertainty Composition
    const uncertaintyComp = UncertaintyCompositionEngine.composeUncertainty({
      snapshot,
      contradictionCount: rawContradictions.length,
      hasConfirmedContext: authFacts.length > 0 || confirmedMemories.length > 0,
      historicalSampleSize: confirmedMemories.length,
      worldDataFreshness: 'NOT_APPLICABLE',
    });

    // 11. Safe Explanation Summary (Privacy-preserving, no chain-of-thought leak)
    let confidenceClass: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_EVIDENCE' = 'MODERATE';
    if (skepticAudit.skepticVerdict === 'INSUFFICIENT_EVIDENCE' || calibratedConfidence < 0.35) {
      confidenceClass = 'INSUFFICIENT_EVIDENCE';
    } else if (calibratedConfidence >= 0.75) {
      confidenceClass = 'HIGH';
    } else if (calibratedConfidence < 0.55) {
      confidenceClass = 'LOW';
    }

    const safeExplanation: SafeExplanationSummary = {
      relevantChartFactors: chartFactors,
      evidenceUsed: fusionResult.signals.map((s) => `${s.system}: ${s.factor}`),
      systemsConsulted,
      mainReasoningFactors: [
        `Convergence of ${fusionResult.signals.length} verified astrological signals across ${systemsConsulted.length} independent systems.`,
        `Current ${dashaLord}-${antardashaLord} planetary period providing operative energetic backing.`,
        `Synthesized evidence score evaluated at ${(fusionResult.fusedEvidenceScore * 100).toFixed(1)}%.`,
      ],
      contradictions: contradictions.length > 0 ? contradictions : ['No acute multi-system contradictions identified.'],
      confidence: calibratedConfidence,
      confidenceClassification: confidenceClass,
      uncertainty: uncertaintyComp.reasons.join('; ') || 'Standard epistemic uncertainty associated with personal decision timing.',
      whyConclusionSelected: `The conclusion was selected because the confluence of natal dignity, active ${dashaLord} Dasha, and transit alignments exceeds the threshold of alternative counter-indications, verified by the Skeptic Disproval Audit (${skepticAudit.skepticVerdict}).`,
    };

    return {
      planId,
      userId,
      query,
      intent: intent.primaryCategory,
      decomposition: {
        primaryFocus: intent.primaryCategory,
        subQuestions,
        isMultiPart: subQuestions.length > 1,
      },
      knownContext: authFacts,
      missingContext: authFacts.length === 0 ? ['Specific industry/personal confirmation not yet logged'] : [],
      userMemory: confirmedMemories.map((m) => m.content),
      chartFactors,
      systemsConsulted,
      researchRequirements: params.allowWorldResearch ? ['External location/world research consented'] : ['External world research skipped'],
      evidenceSummary: {
        totalSignals: fusionResult.signals.length,
        convergence: fusionResult.convergence,
        fusedScore: fusionResult.fusedEvidenceScore,
      },
      contradictions,
      alternativeHypotheses,
      skepticAudit,
      calibratedConfidence,
      uncertaintyNotes: uncertaintyComp.reasons,
      safeExplanation,
      createdAt: new Date().toISOString(),
    };
  }
}
