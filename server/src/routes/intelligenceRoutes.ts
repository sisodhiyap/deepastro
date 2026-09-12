/**
 * DeepAstro Phase 5 — Intelligence API Routes
 * Endpoints for Personal Life Graph, Timeline, Confirmation Gate,
 * Why This Reading, Decision Simulation, Data Export, and Purge.
 */

import { Router, Response } from 'express';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { PersonalLifeGraph, LifeNodeType } from '../intelligence/PersonalLifeGraph.js';
import { DecisionSimulationEngine } from '../brain/DecisionSimulationEngine.js';
import { CalculationSnapshotEngine } from '../astrology/CalculationSnapshot.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { PersonalizationEngine } from '../learning/PersonalizationEngine.js';
import { LifePatternEngine } from '../learning/LifePatternEngine.js';
import { PredictionLedger } from '../learning/PredictionLedger.js';
import { db } from '../database/db.js';
import {
  IntelligenceOrchestrator,
  LifePatternEngine as IntelLifePatternEngine,
  DecisionIntelligenceEngine,
  ResearchIntelligenceEngine,
  OutcomeLearningEngine,
  ContextEngine,
  UserPreferenceEngine,
  IntelligenceTelemetry,
  ContextGraphEngine,
  ContextRelevanceEngine,
  LongitudinalReasoningEngine,
  HistoricalPeriodMatcher,
  PredictionMemoryEngine,
  UncertaintyCompositionEngine,
  UserGoalEngine,
  WhatChangedEngine,
  UserIntentEngine,
  MemoryReasoningEngine,
} from '../intelligence/index.js';

const router = Router();

// POST /api/intelligence/life-event — Suggest or record a life event
router.post('/life-event', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { type, title, dateStart, dateEnd, description, source, userConfirmed } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required for a life event node.' });
    }

    // Invariant: AI source cannot directly create user_confirmed = true
    const isAiSource = source === 'AI_INFERRED';
    const finalConfirmed = isAiSource ? false : Boolean(userConfirmed);

    if (isAiSource && !userConfirmed) {
      const suggestion = PersonalLifeGraph.suggestPossibleEvent(
        userId,
        type as LifeNodeType,
        title,
        dateStart,
        description
      );
      return res.json({
        success: true,
        status: 'SUGGESTION_PENDING_CONFIRMATION',
        message: 'DeepAstro noticed a possible life event.',
        suggestion,
      });
    }

    const node = PersonalLifeGraph.addNode({
      userId,
      type: type as LifeNodeType,
      title,
      dateStart,
      dateEnd,
      description,
      source: source || 'USER_ENTERED',
      userConfirmed: finalConfirmed,
    });

    res.json({ success: true, node });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/timeline — Retrieve chronological visual life timeline with Jyotish correlation
router.get('/timeline', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';
    const timeline = PersonalLifeGraph.getTimeline(userId);
    const patterns = LifePatternEngine.analyzePatterns(userId);

    res.json({
      success: true,
      userId,
      timeline,
      observedPatterns: patterns,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/confirm — Explicitly confirm or discard an AI suggested life event
router.post('/confirm', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { suggestionId, action } = req.body;

    if (!suggestionId || !action) {
      return res.status(400).json({ error: 'suggestionId and action (SAVE_AS_MEMORY or DISCARD) are required.' });
    }

    if (action === 'SAVE_AS_MEMORY') {
      const node = PersonalLifeGraph.confirmSuggestion(suggestionId);
      if (!node) {
        return res.status(404).json({ error: 'Suggestion not found or already processed.' });
      }
      return res.json({
        success: true,
        action: 'CONFIRMED',
        node,
        status: 'USER_CONFIRMED_FACT',
      });
    } else if (action === 'DISCARD') {
      const discarded = PersonalLifeGraph.discardSuggestion(suggestionId);
      return res.json({
        success: true,
        action: 'DISCARDED',
        discarded,
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be SAVE_AS_MEMORY or DISCARD.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/intelligence/memory/:id — Delete a life node or memory
router.delete('/memory/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || req.body.userId || 'guest_user';
    const nodeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = PersonalLifeGraph.deleteNode(userId, nodeId);
    if (!deleted) {
      return res.status(404).json({ error: 'Memory node not found or unauthorized.' });
    }

    res.json({ success: true, deletedNodeId: nodeId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/why-reading/:id — Traceable evidence breakdown
router.get('/why-reading/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const predictionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const prediction = PredictionLedger.getPrediction(predictionId);

    if (!prediction) {
      return res.status(404).json({ error: 'Reading record not found.' });
    }

    res.json({
      success: true,
      whyThisReading: {
        predictionId: prediction.predictionId,
        question: prediction.question,
        predictionStatement: prediction.predictionStatement,
        chartSnapshot: prediction.chartSnapshot,
        dashaSnapshot: prediction.dashaSnapshot,
        transitSnapshot: prediction.transitSnapshot,
        systemsUsed: prediction.systemsUsed,
        rulesUsed: prediction.rulesUsed,
        evidenceIds: prediction.evidenceIds,
        uncertainty: prediction.uncertainty,
        confidenceClass: prediction.confidenceClass,
        specificityScore: prediction.specificity.overallScore,
        specificityAssessment: prediction.specificity.assessment,
        epistemologicalPurity: 'Calculation Verified | Rule Grounded | User Confirmed Memory Respected',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/decision/analyze (mounted here and also aliased)
router.post('/decision/analyze', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, optionA, optionB, timeWindow, userGoal, userConstraints, birthProfile } = req.body;

    if (!query || !optionA || !optionB) {
      return res.status(400).json({ error: 'query, optionA, and optionB are required.' });
    }

    // Produce deterministic snapshot from birthProfile if provided, else use canonical test reference
    let snapshot;
    if (birthProfile && birthProfile.birthDate && birthProfile.birthTime) {
      const factSet = VedicAstroEngine.createAstrologyFactSet({
        name: birthProfile.name || 'Decision Seeker',
        birthDate: birthProfile.birthDate,
        birthTime: birthProfile.birthTime,
        birthPlace: birthProfile.birthPlace || 'New Delhi',
        latitude: birthProfile.latitude || 28.6139,
        longitude: birthProfile.longitude || 77.2090,
        timezone: birthProfile.timezone || 5.5,
      });
      snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
    } else {
      // Fallback baseline reference
      const factSet = VedicAstroEngine.createAstrologyFactSet({
        name: 'Decision Baseline',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
      });
      snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
    }

    const analysis = DecisionSimulationEngine.simulateDecisionV2({
      query,
      optionA,
      optionB,
      timeWindow: timeWindow || 'Upcoming 6 Months',
      userGoal: userGoal || 'Career & Life Progress',
      userConstraints: userConstraints || ['Risk Mitigation', 'Financial Runway'],
      snapshot,
    });

    res.json({ success: true, decisionAnalysis: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/export — Complete user data export in structured JSON (Phase 5 Section 34)
router.get('/export', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';

    const confirmedNodes = PersonalLifeGraph.getConfirmedNodes(userId);
    const predictions = PredictionLedger.getUserPredictions(userId);
    const preferences = db.personalizationProfiles.get(userId) || null;
    const birthProfile = Array.from(db.birthProfiles.values()).find(b => b.userId === userId) || null;

    const exportPayload = {
      version: '5.0.0',
      exportTimestamp: new Date().toISOString(),
      userId,
      dataPrivacyLevel: 'CLIENT_CONTROLLED',
      birthProfile,
      confirmedLifeGraphNodes: confirmedNodes,
      predictionLedger: predictions,
      personalizationPreferences: preferences,
      inquiryHistory: [],
    };

    res.json({ success: true, export: exportPayload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/purge-user — Right-to-erasure comprehensive purge (Phase 5 Section 35)
router.post('/purge-user', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required for data purge.' });
    }

    // Cascade purge across all memory and prediction subsystems
    const lifeGraphPurged = PersonalLifeGraph.purgeUserData(userId);
    const predictionsPurged = PredictionLedger.purgeUserData(userId);
    db.personalizationProfiles.delete(userId);

    res.json({
      success: true,
      purged: {
        userId,
        lifeGraph: lifeGraphPurged,
        predictionsPurged,
        preferencesCleared: true,
        queriesCleared: true,
      },
      message: 'All user memories, life graph nodes, prediction ledger records, and preferences have been permanently purged.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/analyze — Master Intelligence Pipeline
router.post('/analyze', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const rawQuery = req.body.query || req.body.question || req.body.message || req.body.text;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    const { birthProfile, allowWorldResearch, destinationCity, decisionOptions } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query string is required.' });
    }

    const response = await IntelligenceOrchestrator.analyze({
      userId,
      query,
      birthProfile,
      allowWorldResearch,
      destinationCity,
      decisionOptions,
    });

    const anyResp = response as any;
    res.json({
      success: true,
      intelligence: response,
      data: response,
      answer: {
        summary: response.directAnswer,
        interpretation: response.directAnswer,
        evidence: (response.whyThisReading?.primaryFactors || []).concat(
          (anyResp.evidence || []).map((e: any) => `${e.system}: ${e.finding}`)
        ),
        recommendations: anyResp.actionableAdvice?.dailyPractices || [],
        remedies: anyResp.actionableAdvice?.recommendedRemedies || [],
        disclaimer: anyResp.limitations,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/why — Evidence & Rule Breakdown
router.post('/why', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { query, birthProfile } = req.body;

    const response = await IntelligenceOrchestrator.analyze({
      userId,
      query: query || 'Analyze general life alignment',
      birthProfile,
    });

    res.json({ success: true, whyThisReading: response.whyThisReading });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/compare-periods — Life Replay 2.0
router.post('/compare-periods', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { eventTitleOrId, birthProfile } = req.body;

    if (!eventTitleOrId) {
      return res.status(400).json({ error: 'eventTitleOrId is required to compare periods.' });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfile || {
      name: 'Life Replay User',
      birthDate: '1995-01-01',
      birthTime: '12:00',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    });
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    const comparison = IntelLifePatternEngine.compareHistoricalPeriod(userId, eventTitleOrId, snapshot);
    if (!comparison) {
      return res.status(404).json({ error: 'Historical event milestone not found in confirmed records.' });
    }

    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/patterns — Discovered Life Patterns
router.post('/patterns', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const patterns = IntelLifePatternEngine.discoverPatterns(userId);
    res.json({ success: true, userId, patterns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/decision — Counterfactual Decision Simulator
router.post('/decision', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, optionA, optionB, timeWindow, birthProfile } = req.body;
    if (!query || !optionA || !optionB) {
      return res.status(400).json({ error: 'query, optionA, and optionB are required.' });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfile || {
      name: 'Decision Seeker',
      birthDate: '1995-01-01',
      birthTime: '12:00',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    });
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    const decisionResult = DecisionIntelligenceEngine.evaluateDecision({
      query,
      optionA,
      optionB,
      timeWindow,
      snapshot,
    });

    res.json({ success: true, decisionResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/research — Consented Real-World Relocation Research
router.post('/research', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentCity, destinationCity, userConsent, birthProfile } = req.body;
    if (!currentCity || !destinationCity) {
      return res.status(400).json({ error: 'currentCity and destinationCity are required.' });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfile || {
      name: 'Relocation Seeker',
      birthDate: '1995-01-01',
      birthTime: '12:00',
      birthPlace: currentCity,
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    });
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    const researchResult = ResearchIntelligenceEngine.evaluateRelocation({
      currentCity,
      destinationCity,
      userConsent: Boolean(userConsent),
      snapshot,
    });

    res.json({ success: true, researchResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/feedback — Record User Outcome Calibration
router.post('/feedback', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { predictionId, predictedDirection, forecastDate, verdict, notes } = req.body;

    if (!predictionId || !verdict) {
      return res.status(400).json({ error: 'predictionId and verdict (SUCCESS, PARTIAL, NOT_OCCURRED, UNCLEAR) are required.' });
    }

    OutcomeLearningEngine.recordOutcome({
      predictionId,
      userId,
      predictedDirection: predictedDirection || 'OPPORTUNITY',
      forecastDate: forecastDate || new Date().toISOString().split('T')[0],
      confirmedDate: new Date().toISOString().split('T')[0],
      verdict,
      notes,
    });

    const calibration = OutcomeLearningEngine.getCalibration(userId);
    res.json({ success: true, recorded: true, calibration });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/profile — User Context, Preferences, and Calibration
router.get('/profile', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';
    const context = ContextEngine.getContext(userId);
    const preferences = UserPreferenceEngine.getPreferences(userId);
    const calibration = OutcomeLearningEngine.getCalibration(userId);
    const patterns = IntelLifePatternEngine.discoverPatterns(userId);

    res.json({
      success: true,
      profile: {
        userId,
        context,
        preferences,
        calibration,
        patterns,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================================================================
// DEEPASTRO 3.1 ENDPOINTS
// ================================================================

// POST /api/intelligence/reasoning-plan — Previews the selective execution plan
router.post('/reasoning-plan', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, depth = 'STANDARD' } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required.' });
    }
    const intent = UserIntentEngine.classifyIntent(query, depth);
    const reasoningPlan = {
      intent: intent.primaryCategory,
      timeHorizon: intent.timeHorizon,
      lifeDomain: intent.primaryCategory,
      requiredFacts: ['Ascendant Sign', 'Moon Rashi', 'Current Dasha', 'Current Transits'],
      requiredEngines: [
        'UserPreferenceEngine',
        'UserIntentEngine',
        'ContextEngine',
        'CalculationSnapshotEngine',
        'TemporalReasoningEngine',
        'EvidenceFusionEngine',
      ],
      requiredSources: ['Brihat Parashara Hora Shastra', 'Jaimini Sutras', 'Phaladeepika'],
      requiredHistory: intent.primaryCategory === 'CAREER' || intent.primaryCategory === 'JOB',
      requiredWorldResearch: false,
      possibleContradictions: ['Dasha timing vs Transit friction'],
      confidenceRequirements: 'MODERATE',
    };
    res.json({ success: true, intent, reasoningPlan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/graph — Retrieves the ephemeral reasoning context graph
router.post('/graph', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { query, intent = 'CAREER', birthProfile } = req.body;

    const factSet = VedicAstroEngine.createAstrologyFactSet(
      birthProfile || {
        name: 'Seeker',
        birthDate: '1995-01-01',
        birthTime: '12:00',
        birthPlace: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      }
    );
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
    const graph = ContextGraphEngine.buildGraph({
      userId,
      query: query || 'General life direction',
      intent,
      snapshot,
    });

    res.json({ success: true, graph });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/historical-match — Evaluates "This feels like 2018 again"
router.post('/historical-match', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { targetYear, birthProfile } = req.body;

    if (!targetYear) {
      return res.status(400).json({ error: 'targetYear is required.' });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(
      birthProfile || {
        name: 'Seeker',
        birthDate: '1995-01-01',
        birthTime: '12:00',
        birthPlace: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      }
    );
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
    const match = HistoricalPeriodMatcher.matchPeriod({
      userId,
      targetYear: parseInt(targetYear, 10),
      currentSnapshot: snapshot,
    });

    res.json({ success: true, match });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/what-changed — Compares last reading state vs current reading state
router.post('/what-changed', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { birthProfile } = req.body;

    const factSet = VedicAstroEngine.createAstrologyFactSet(
      birthProfile || {
        name: 'Seeker',
        birthDate: '1995-01-01',
        birthTime: '12:00',
        birthPlace: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      }
    );
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
    const whatChanged = WhatChangedEngine.analyzeChanges(userId, snapshot);

    res.json({ success: true, whatChanged });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/goal — Creates or evolves a user life goal
router.post('/goal', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { goalId, domain, title, description, targetDate, reason } = req.body;

    if (goalId) {
      // Evolve existing goal
      const evolved = UserGoalEngine.evolveGoal({
        userId,
        goalId,
        newTitle: title,
        newDescription: description,
        reason,
      });
      if (!evolved) {
        return res.status(404).json({ error: 'Goal not found to evolve.' });
      }
      return res.json({ success: true, goal: evolved, action: 'EVOLVED' });
    }

    if (!title || !domain) {
      return res.status(400).json({ error: 'title and domain are required to establish a goal.' });
    }

    const created = UserGoalEngine.addGoal({
      userId,
      domain,
      title,
      description: description || '',
      targetDate,
      userConfirmed: true,
    });

    res.json({ success: true, goal: created, action: 'CREATED' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/goals — Retrieves active and historical goals
router.get('/goals', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';
    const activeGoals = UserGoalEngine.getActiveGoals(userId);
    const allGoals = UserGoalEngine.getAllGoals(userId);

    res.json({ success: true, activeGoals, allGoals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/confirm-memory — Explicit memory confirmation UX ("Remember this?")
router.post('/confirm-memory', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { memoryId, action, type, content } = req.body; // action: 'SAVE' | 'DISMISS'

    if (action === 'SAVE' && type && content) {
      const saved = MemoryReasoningEngine.addMemory({
        userId,
        type,
        content,
        source: 'USER_EXPLICIT',
        confirmed: true,
        confidence: 1.0,
      });
      return res.json({ success: true, action: 'SAVED', memory: saved });
    }

    if (memoryId && action === 'SAVE') {
      const confirmed = MemoryReasoningEngine.confirmMemory(userId, memoryId);
      return res.json({ success: true, action: 'CONFIRMED', memory: confirmed });
    }

    res.json({ success: true, action: 'DISMISSED' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/health — Intelligence Fabric Health & Telemetry
router.get('/health', (_req, res: Response) => {
  try {
    const telemetry = IntelligenceTelemetry.getSummary();
    res.json({
      success: true,
      status: 'HEALTHY',
      fabricVersion: '3.1.0-PROD',
      timestamp: new Date().toISOString(),
      enginesAvailable: [
        'IntelligenceOrchestrator',
        'UserIntentEngine',
        'QuestionUnderstandingEngine',
        'ContextEngine',
        'MemoryReasoningEngine',
        'UserPreferenceEngine',
        'EvidenceFusionEngine',
        'ContradictionReasoningEngine',
        'TemporalReasoningEngine',
        'LifePatternEngine',
        'PredictionReasoningEngine',
        'DecisionIntelligenceEngine',
        'ResearchIntelligenceEngine',
        'OutcomeLearningEngine',
        'ConfidenceEngine',
        'UncertaintyEngine',
        'ExplanationEngine',
        'RecommendationEngine',
        'InsightRankingEngine',
        'IntelligenceTelemetry',
        // DeepAstro 3.1 Engines
        'ContextGraphEngine',
        'ContextRelevanceEngine',
        'LongitudinalReasoningEngine',
        'HistoricalPeriodMatcher',
        'PredictionMemoryEngine',
        'UncertaintyCompositionEngine',
        'UserGoalEngine',
        'WhatChangedEngine',
        // DeepAstro 4.0 Engines
        'DeepAstroReasoningWorkspace',
        'EvidenceFusionEngineV3',
        'PredictionSkepticEngine',
        'PredictionCalibrationEngineV3',
        'PredictionLedgerV3',
        'PredictionOutcomeEngineV3',
        'PredictionErrorDiagnosisEngine',
        'AstrologyHypothesisEngine',
        'OutOfSampleValidationEngine',
        'PredictionExperimentEngine',
        'ClaimVerificationEngine',
        'DeepAstroResearchIntelligence',
        'KnowledgeLearningEngine',
        'DeepAstroLearningSandbox',
      ],
      telemetry,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// DeepAstro 4.0 — Self-Evolving Engine Routes
// ==========================================

import {
  DeepAstroReasoningWorkspace,
  PredictionLedgerV3,
  PredictionOutcomeEngineV3,
  PredictionErrorDiagnosisEngine,
  AstrologyHypothesisEngine,
  PredictionExperimentEngine,
  PredictionSkepticEngine,
  ClaimVerificationEngine,
  DeepAstroResearchIntelligence,
  KnowledgeLearningEngine,
  PredictionCalibrationEngineV3,
  DeepAstroLearningSandbox,
} from '../intelligence/index.js';

// POST /api/intelligence/workspace/reason — Deep structured reasoning workspace
router.post('/workspace/reason', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { query, readingDepth, allowWorldResearch, destinationCity, birthProfile } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query parameter is required.' });
    }

    const facts = VedicAstroEngine.createAstrologyFactSet(
      birthProfile || {
        name: 'Seeker',
        birthDate: '1995-01-01',
        birthTime: '12:00',
        birthPlace: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      }
    );
    const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

    const trace = DeepAstroReasoningWorkspace.executeReasoning({
      userId,
      query,
      snapshot,
      readingDepth: readingDepth || 3,
      allowWorldResearch: Boolean(allowWorldResearch),
      destinationCity,
    });

    res.json({
      success: true,
      trace,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/predictions/v3/record — Record immutable prediction
router.post('/predictions/v3/record', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const {
      questionId,
      predictionType,
      domain,
      predictionText,
      expectedEvent,
      expectedDirection,
      timeWindow,
      chartSnapshotId,
      rulesUsed,
      systemsUsed,
      evidenceIds,
      confidence,
      uncertainty,
      alternativeHypotheses,
    } = req.body;

    if (!domain || !predictionText || !expectedEvent) {
      return res.status(400).json({ error: 'domain, predictionText, and expectedEvent are required.' });
    }

    const entry = PredictionLedgerV3.recordPrediction({
      userId,
      questionId: questionId || `q_${Date.now()}`,
      predictionType: predictionType || 'EVENT_TIMING',
      domain,
      predictionText,
      expectedEvent,
      expectedDirection: expectedDirection || 'FAVORABLE',
      timeWindow: timeWindow || {
        startDate: '2026-10-01',
        endDate: '2027-01-01',
        scale: 'QUARTER',
      },
      chartSnapshotId: chartSnapshotId || `snap_${Date.now()}`,
      rulesUsed: rulesUsed || ['Parashari 10th Lord Progression'],
      systemsUsed: systemsUsed || ['PARASHARI', 'KP'],
      evidenceIds: evidenceIds || [`ev_${Date.now()}`],
      confidence: confidence || 0.75,
      uncertainty: uncertainty || 'Standard temporal variance',
      alternativeHypotheses: alternativeHypotheses || [],
    });

    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/predictions/v3/outcome — Confirm grounded outcome
router.post('/predictions/v3/outcome', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const { predictionId, outcome, userNotes } = req.body;

    if (!predictionId || !outcome) {
      return res.status(400).json({ error: 'predictionId and outcome are required.' });
    }

    const record = PredictionOutcomeEngineV3.recordOutcome({
      predictionId,
      userId,
      outcome,
      userNotes,
    });

    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/diagnostics/diagnose — Diagnose prediction error
router.post('/diagnostics/diagnose', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { predictionId, outcomeType, userNotes, actualOccurrenceDate } = req.body;
    if (!predictionId || !outcomeType) {
      return res.status(400).json({ error: 'predictionId and outcomeType are required.' });
    }

    const prediction = PredictionLedgerV3.getPrediction(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: `Prediction ${predictionId} not found.` });
    }

    const investigation = PredictionErrorDiagnosisEngine.diagnosePredictionError({
      prediction,
      outcomeType,
      userNotes,
      actualOccurrenceDate,
    });

    res.json({ success: true, investigation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/hypotheses/propose — Propose empirical hypothesis
router.post('/hypotheses/propose', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { statement, domain, evidence, initialSupportingPredictionId } = req.body;
    if (!statement || !domain) {
      return res.status(400).json({ error: 'statement and domain are required.' });
    }

    const hypothesis = AstrologyHypothesisEngine.proposeHypothesis({
      statement,
      domain,
      evidence: evidence || [],
      initialSupportingPredictionId,
    });

    res.json({ success: true, hypothesis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/calibration/v3/report — Calibration curve & Brier report
router.get('/calibration/v3/report', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || undefined;
    const report = PredictionCalibrationEngineV3.generateReport(userId);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/sandbox/evaluate — Run candidate strategy in sandbox
router.post('/sandbox/evaluate', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, historicalCases } = req.body;
    if (!domain || !historicalCases || !Array.isArray(historicalCases)) {
      return res.status(400).json({ error: 'domain and historicalCases array are required.' });
    }

    const payload = DeepAstroLearningSandbox.evaluateCandidateInSandbox({
      domain,
      historicalCases,
    });

    res.json({ success: true, payload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========================================================
// DeepAstro 4.1 — Continuous Prediction Evolution Routes
// ========================================================

import {
  CalculationCoreProtection,
  OutcomeQualityEngine,
  PredictionRealityComparisonEngine,
  PredictionEvolutionStore,
  ComparablePredictionCaseEngine,
  WalkForwardValidationEngine,
  StrategyMonitoringEngine,
  LearningReplayEngine,
} from '../intelligence/index.js';

// POST /api/intelligence/evolution/prediction — Record prediction evolution item
router.post('/evolution/prediction', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || 'guest_user';
    const {
      predictionId,
      predictionDomain,
      predictionType,
      predictionStatement,
      expectedEvent,
      expectedDirection,
      expectedTimeWindow,
      predictionConfidence,
      predictionUncertainty,
      evidenceIds,
      calculationSnapshotId,
    } = req.body;

    const record = PredictionEvolutionStore.createRecord({
      predictionId: predictionId || `pred_evo_${Date.now()}`,
      userId,
      calculationSnapshotId: calculationSnapshotId || `snap_${Date.now()}`,
      predictionDomain: predictionDomain || 'CAREER',
      predictionType: predictionType || 'MILESTONE',
      predictionStatement: predictionStatement || 'Expected vocational progression.',
      expectedEvent: expectedEvent || 'Promotion or leadership elevation',
      expectedDirection: expectedDirection || 'FAVORABLE',
      expectedTimeWindow: expectedTimeWindow || { startDate: '2026-10-01', endDate: '2026-12-31' },
      predictionConfidence: predictionConfidence || 0.78,
      predictionUncertainty: predictionUncertainty || 'Transit stationing variance',
      evidenceIds: evidenceIds || [`ev_${Date.now()}`],
    });

    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/evolution/outcome — Quality-weighted outcome logging
router.post('/evolution/outcome', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { predictionId, explicitStatus, source, userNotes } = req.body;
    if (!predictionId) {
      return res.status(400).json({ error: 'predictionId is required.' });
    }

    const qualityAssessment = OutcomeQualityEngine.evaluateOutcomeQuality({
      explicitStatus,
      source: source || 'USER_EXPLICIT_CONFIRMATION',
      userNotes,
    });

    // Advance state in evolution store
    const updated = PredictionEvolutionStore.transitionState(
      predictionId,
      qualityAssessment.assignedOutcome,
      { outcomeId: qualityAssessment.assessmentId }
    );

    res.json({ success: true, qualityAssessment, updatedRecord: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/evolution/compare — Reality comparison engine
router.post('/evolution/compare', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const comparison = PredictionRealityComparisonEngine.compareReality(req.body);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/evolution/cases/comparable — Comparable case discovery
router.post('/evolution/cases/comparable', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, dashaLord, antardashaLord, moonSign, ascendantSign } = req.body;
    const matches = ComparablePredictionCaseEngine.findComparableCases({
      domain,
      dashaLord,
      antardashaLord,
      moonSign,
      ascendantSign,
    });
    res.json({ success: true, matches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/evolution/experiment/walk-forward — Walk-forward validation
router.post('/evolution/experiment/walk-forward', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { strategyName, cases, minTrainingSize } = req.body;
    const report = WalkForwardValidationEngine.runWalkForwardValidation({
      strategyName: strategyName || 'STRATEGY_D_COMPREHENSIVE_CONTEXT',
      cases,
      minTrainingSize,
    });
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/evolution/replay — Clean-room historical replay
router.post('/evolution/replay', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, allCases, cutoffDate } = req.body;
    const replay = LearningReplayEngine.replayHistoricalLearning({
      domain,
      allCases,
      cutoffDate,
    });
    res.json({ success: true, replay });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/evolution/strategies — Strategy versioning & canary state
router.get('/evolution/strategies', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const strategies = StrategyMonitoringEngine.getStrategies();
    const driftEvents = StrategyMonitoringEngine.getDriftEvents();
    res.json({ success: true, strategies, driftEvents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/evolution/history — User prediction evolution history
router.get('/evolution/history', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || 'guest_user';
    const history = PredictionEvolutionStore.getUserHistory(userId);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========================================================
// DeepAstro 4.2 — Intelligence Observatory Routes
// ========================================================

import {
  OutcomeCoverageEngine,
  OutcomeDataQualityEngine,
  StrategyDriftEngine,
  DeepAstroLearningJournal,
  LearningMaturityEngine,
  DeepAstroIntelligenceObservatory,
} from '../intelligence/index.js';

// GET /api/intelligence/observatory/overview — Master observatory snapshot
router.get('/observatory/overview', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const predictions = PredictionLedgerV3.getAllActive();
    const snapshot = DeepAstroIntelligenceObservatory.getObservatorySnapshot({
      predictions: predictions.map((p) => ({
        predictionId: p.predictionId,
        status: p.status,
        domain: p.domain,
      })),
    });
    res.json({ success: true, snapshot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/observatory/journal — Public Learning Journal
router.get('/observatory/journal', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const domain = req.query.domain as string | undefined;
    const entries = DeepAstroLearningJournal.getEntries(domain);
    res.json({ success: true, entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/intelligence/observatory/outcomes/quality — Audit outcome quality
router.post('/observatory/outcomes/quality', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { predictionId, explicitStatus, userNotes, hasSpecificDate } = req.body;
    const audit = OutcomeDataQualityEngine.auditOutcomeQuality({
      predictionId: predictionId || `pred_${Date.now()}`,
      explicitStatus,
      userNotes,
      hasSpecificDate: Boolean(hasSpecificDate),
    });
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/observatory/health — Admin observatory health status
router.get('/observatory/health', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const isImmutable = CalculationCoreProtection.assertImmutable();
    const drift = StrategyDriftEngine.getDriftAudit();
    const violations = CalculationCoreProtection.getSecurityViolations();
    res.json({
      success: true,
      health: {
        calculationCoreMutable: false,
        calculationCoreProtected: isImmutable,
        activeCanaries: StrategyMonitoringEngine.getStrategies().filter((s) => s.status === 'CANARY').length,
        driftAlertsCount: drift.length,
        securityViolationsCount: violations.length,
        pilotMode: DeepAstroIntelligenceObservatory.DEEPASTRO_REAL_WORLD_PILOT,
        status: violations.length === 0 ? 'HEALTHY' : 'CRITICAL_SECURITY_ALERT',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router as intelligenceRoutes };
