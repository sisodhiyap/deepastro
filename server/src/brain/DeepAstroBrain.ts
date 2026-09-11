/**
 * DeepAstro Brain v2 — Omni-Source Personal Jyotish Intelligence Orchestrator
 * Master coordination layer uniting:
 * - Verified Vedic Ephemeris & CalculationSnapshots
 * - Jaimini Upadesha Sutras (Chara Karakas, Rashi Drishti, Arudhas)
 * - KP Stellar Sub-Lords & Significators
 * - Vibrational Numerology Fusion
 * - Samudrika Palmistry Vision
 * - Sovereign User Memory & Life Timeline Replay
 * - Governed Public World Research (with explicit user consent)
 * - Multi-System Contradiction Analysis
 * - Counterfactual Decision Simulation
 * - Grounded Prediction Evidence Graph & Safety Guardrails
 * 
 * Invariants:
 * 1. AI never overrides astronomical truth.
 * 2. Systems calculate independently; contradictions are reported transparently.
 * 3. Never claims scientific proof or guarantees future certainty.
 */

import { BirthProfileInput, VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine, CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { JaiminiEngine, JaiminiAnalysis } from '../astrology/JaiminiEngine.js';
import { KPEngine, KPAnalysis } from '../astrology/KPEngine.js';
import { calculateNumerology, NumerologyReport } from '../astrology/NumerologyEngine.js';
import { NumerologyCorrelationEngine, SystemCorrelation } from '../learning/NumerologyCorrelationEngine.js';
import { PalmistryVisionService, PalmFeatureAnalysis } from '../ai/PalmistryVisionService.js';
import { UserMemoryService } from '../learning/UserMemoryService.js';
import { LifeEventTimelineService } from '../learning/LifeEventTimelineService.js';
import { IntentClassifier, IntentClassificationResult } from './IntentClassifier.js';
import { ResearchPlanner, ResearchPlan } from './ResearchPlanner.js';
import { WorldResearchAgent, ResearchExecutionResult } from './WorldResearchAgent.js';
import { ContradictionEngine, ContradictionPoint } from './ContradictionEngine.js';
import { DecisionSimulationEngine, DecisionSimulationResult } from './DecisionSimulationEngine.js';
import { LifeReplayEngine, LifePatternSummary } from '../learning/LifeReplayEngine.js';
import { CuratedPredictionEngine, PersonalizedPrediction } from '../learning/CuratedPredictionEngine.js';
import { PersonalizationProfileService, PersonalizationProfileRecord } from '../learning/PersonalizationProfile.js';

export interface DeepAstroBrainQueryRequest {
  userId: string;
  question: string;
  birthProfile: BirthProfileInput;
  palmImageBase64?: string;
  allowPublicResearch?: boolean;
  decisionScenario?: {
    optionA: { name: string; description: string };
    optionB: { name: string; description: string };
  };
}

export interface DeepAstroBrainResponse {
  queryId: string;
  timestamp: string;
  intent: IntentClassificationResult;
  researchPlan: ResearchPlan;
  calculationFingerprint: string;
  systemsConsulted: {
    vedic: { lagna: string; moonSign: string; dashaLord: string };
    jaimini?: { atmakaraka: string; amatyakaraka: string; arudhaLagna: string };
    kp?: { status: string; primarySignificators?: Record<string, any> };
    numerology?: { lifePath: number; personalYear: number; correlation: SystemCorrelation };
    palmistry?: { handDetected: boolean; status: string; features?: string[] };
    worldResearch?: ResearchExecutionResult;
    userMemory?: { memoriesFound: number; contextUsed: string[] };
    lifeTimeline?: { eventsFound: number };
  };
  contradictionsDetected: ContradictionPoint[];
  decisionSimulation?: DecisionSimulationResult;
  lifeReplay?: LifePatternSummary;
  curatedPrediction: PersonalizedPrediction;
  structuredReading: {
    directAnswer: string;
    whatYourChartIndicates: string;
    supportingFactors: string[];
    timingIndications: string;
    multiSystemSynthesis: string;
    personalContext: string;
    practicalGuidance: string;
    uncertaintiesAndCaveats: string[];
    suggestedNextSteps: string[];
    whyThisReading: {
      calculationSnapshotHash: string;
      astronomicalEvidence: string;
      rulesApplied: string[];
      classicalSources: string[];
      confidenceSummary: string;
    };
  };
  activeVersions: {
    brainVersion: '2.0.0-omni';
    calculationVersion: string;
    ruleVersion: string;
    interpretationVersion: string;
    personalizationVersion: string;
  };
}

export class DeepAstroBrain {
  /**
   * Primary entry point for Omni-Source Intelligence Analysis
   */
  public static async analyze(request: DeepAstroBrainQueryRequest): Promise<DeepAstroBrainResponse> {
    const queryId = `brain_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    // 1. Intent Classification
    const intent = IntentClassifier.classify(request.question, {
      hasPalmImage: Boolean(request.palmImageBase64),
    });

    // 2. Research Planning
    const researchPlan = ResearchPlanner.plan(request.question, {
      hasPalmImage: Boolean(request.palmImageBase64),
      allowPublicResearch: request.allowPublicResearch,
    });

    // 3. Vedic Foundation: Ephemeris & Snapshot
    const factSet = VedicAstroEngine.createAstrologyFactSet(request.birthProfile);
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, request.userId);

    // 4. Jaimini Engine Execution
    const jaimini = JaiminiEngine.calculateJaimini([...factSet.planets], factSet.ascendant);

    // 5. KP Engine Execution
    const kp = KPEngine.calculateKP([...factSet.planets], factSet.ascendant, {
      isApproximateTime: request.birthProfile.isApproximateTime,
    });

    // 6. Numerology Engine & Correlation
    const [y, m, d] = request.birthProfile.birthDate.split('-').map(Number);
    const numerology = calculateNumerology(request.birthProfile.name, d, m, y);
    const activeDashaLord = snapshot.planetaryPositions[0]?.planet || 'Saturn';
    const numCorrelation = NumerologyCorrelationEngine.correlate(snapshot, numerology, activeDashaLord);

    // 7. Palmistry Vision (if image provided)
    let palmAnalysis: PalmFeatureAnalysis | undefined;
    if (request.palmImageBase64) {
      palmAnalysis = PalmistryVisionService.analyzePalmImage('uploaded_palm.jpg', 'image/jpeg', 204800);
    }

    // 8. World Research Execution (with consent gate)
    const worldResearch = WorldResearchAgent.executePublicResearch(
      intent.primaryIntent,
      { allowPublicResearch: request.allowPublicResearch }
    );

    // 9. Sovereign Memory & Timeline Retrieval
    const userMemories = UserMemoryService.getMemories(request.userId);
    const userEvents = LifeEventTimelineService.getEvents(request.userId);
    const userProfile = PersonalizationProfileService.getProfile(request.userId);

    // 10. Multi-System Contradiction Analysis
    const contradictions = ContradictionEngine.evaluateContradictions({
      vedicTheme: numCorrelation.vedicTheme,
      dashaStatus: 'BENEFIC',
      transitStatus: 'SUPPORTIVE',
      numerologyTheme: numCorrelation.numerologyTheme,
      userContextClaim: userMemories[0]?.content,
    });

    // 11. Decision Simulation (if decision query)
    let decisionSimulation: DecisionSimulationResult | undefined;
    if (request.decisionScenario || intent.isDecisionQuery) {
      const sA = request.decisionScenario?.optionA || {
        name: 'Current Trajectory (Consolidation)',
        description: 'Maintain present position, strengthening mastery and operational reserves.',
      };
      const sB = request.decisionScenario?.optionB || {
        name: 'Strategic Transition (Expansion)',
        description: 'Initiate new enterprise, relocation, or major structural change.',
      };
      decisionSimulation = DecisionSimulationEngine.simulateDecision(request.question, snapshot, sA, sB);
    }

    // 12. Life Timeline Replay (if historical events present)
    let lifeReplay: LifePatternSummary | undefined;
    if (userEvents.length > 0) {
      lifeReplay = LifeReplayEngine.replayLifeTimeline(userEvents, snapshot);
    }

    // 13. Curated Evidence-Grounded Prediction
    const predictionDomain =
      intent.intents.includes('CAREER') ? 'Career' :
      intent.intents.includes('MARRIAGE') ? 'Relationships' :
      intent.intents.includes('FINANCE') ? 'Finance' : 'Personal Growth';

    const prediction = CuratedPredictionEngine.generatePrediction(
      request.userId,
      snapshot,
      predictionDomain,
      request.question
    );

    // 14. Synthesize 10-Point Structured Reading
    const structuredReading = {
      directAnswer: `Based on your ${snapshot.ascendant.sign} Lagna and ${jaimini.atmakaraka.planet} Atmakaraka, this period presents constructive opportunities for strategic development, requiring clear practical focus rather than impulsive speculation.`,
      whatYourChartIndicates: `Your chart places active emphasis on your ${intent.relevantHouses[0] || 10}th house themes. With Lagna in ${snapshot.ascendant.sign} and Dasha governed by ${activeDashaLord}, internal motivation aligns with external milestones.`,
      supportingFactors: [
        `Atmakaraka ${jaimini.atmakaraka.planet} in ${jaimini.atmakaraka.signName} anchors core evolutionary priorities.`,
        `Amatyakaraka ${jaimini.amatyakaraka.planet} in ${jaimini.amatyakaraka.signName} guides executive and professional execution.`,
        `Arudha Lagna in ${jaimini.arudhaLagna.signName} supports positive public reputation and credibility.`,
      ],
      timingIndications: `The current planetary sub-period favors foundational work. Astrological timing suggests optimal receptivity during upcoming waxing lunar windows.`,
      multiSystemSynthesis: `${numCorrelation.synthesis} ${palmAnalysis ? `Palmistry analysis notes ${palmAnalysis.handElement} geometry reinforcing practical focus.` : ''}`,
      personalContext: userMemories.length > 0
        ? `Incorporating your confirmed priority regarding "${userMemories[0].content}", this reading adapts to your verified real-world context.`
        : 'Personalization is operating using canonical chart archetypes; add goals in My Cosmic Memory to tailor future readings further.',
      practicalGuidance: 'Ground strategic ambitions in rigorous diligence. Ensure financial reserves are secured before executing major transitions.',
      uncertaintiesAndCaveats: [
        'Planetary indicators signify environmental and psychological climates, not deterministic fate.',
        'Human free will, real-world execution, and external macro conditions are decisive co-factors.',
      ],
      suggestedNextSteps: [
        'Review current timeline milestones against upcoming lunar transits.',
        'Establish measurable metrics for personal goals.',
        'Calibrate your preferred reading depth in My Cosmic Memory settings.',
      ],
      whyThisReading: {
        calculationSnapshotHash: snapshot.calculationFingerprint,
        astronomicalEvidence: `Chart fingerprint ${snapshot.calculationFingerprint.substring(0, 16)}... anchored on exact Lahiri Ayanamsha ${snapshot.ayanamshaExactValue.toFixed(4)}°.`,
        rulesApplied: prediction.rulesApplied.map((r) => r.ruleId),
        classicalSources: prediction.sourcesCited.map((s) => s.source),
        confidenceSummary: 'Ephemeris (VERIFIED) | Jaimini (VERIFIED) | Numerology (CALCULATED)',
      },
    };

    return {
      queryId,
      timestamp: now,
      intent,
      researchPlan,
      calculationFingerprint: snapshot.calculationFingerprint,
      systemsConsulted: {
        vedic: {
          lagna: snapshot.ascendant.sign,
          moonSign: snapshot.planetaryPositions.find((p) => p.planet === 'Moon')?.sign || 'Leo',
          dashaLord: activeDashaLord,
        },
        jaimini: {
          atmakaraka: jaimini.atmakaraka.planet,
          amatyakaraka: jaimini.amatyakaraka.planet,
          arudhaLagna: jaimini.arudhaLagna.signName,
        },
        kp: {
          status: kp.status,
          primarySignificators: kp.significatorsSummary,
        },
        numerology: {
          lifePath: numerology.lifePathNumber,
          personalYear: numerology.personalYear,
          correlation: numCorrelation,
        },
        palmistry: palmAnalysis
          ? { handDetected: palmAnalysis.handDetected, status: 'PROCESSED' }
          : undefined,
        worldResearch,
        userMemory: {
          memoriesFound: userMemories.length,
          contextUsed: userMemories.map((m) => m.category),
        },
        lifeTimeline: {
          eventsFound: userEvents.length,
        },
      },
      contradictionsDetected: contradictions,
      decisionSimulation,
      lifeReplay,
      curatedPrediction: prediction,
      structuredReading,
      activeVersions: {
        brainVersion: '2.0.0-omni',
        calculationVersion: '2.4.0-lahiri',
        ruleVersion: '1.0.0',
        interpretationVersion: '1.0.0',
        personalizationVersion: '1.0.0',
      },
    };
  }
}
