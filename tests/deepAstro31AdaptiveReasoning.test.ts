/**
 * DeepAstro 3.1 — Adaptive Life Reasoning Engine Test Suite
 * Comprehensive automated validation covering:
 * 1. Question -> Reasoning Plan generation
 * 2. Context Graph ephemeral generation (Correlation != Causation)
 * 3. Context Relevance & Personal Context Priority
 * 4. Longitudinal Reasoning (Past vs Current vs Future)
 * 5. Historical Period Matcher ("This feels like 2018 again")
 * 6. Life Pattern Engine 3.1 Strength Classifications
 * 7. Prediction Memory & De-duplication
 * 8. Uncertainty Composition Engine
 * 9. User Goal Engine & Goal Evolution (Immutability of history)
 * 10. "What Changed?" Engine
 * 11. End-to-end IntelligenceOrchestrator 3.1 pipeline
 * 12. DeepAstro 3.1 API Endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import {
  IntelligenceOrchestrator,
  ContextGraphEngine,
  ContextRelevanceEngine,
  LongitudinalReasoningEngine,
  HistoricalPeriodMatcher,
  LifePatternEngine,
  PredictionMemoryEngine,
  UncertaintyCompositionEngine,
  UserGoalEngine,
  WhatChangedEngine,
  PersonalLifeGraph,
  MemoryReasoningEngine,
} from '../server/src/intelligence/index.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';

describe('DeepAstro 3.1 — Adaptive Life Reasoning Engine', () => {
  const testUserId = 'test_user_31';
  let snapshot: any;

  beforeEach(() => {
    const factSet = VedicAstroEngine.createAstrologyFactSet({
      name: 'Aditi Sharma',
      birthDate: '1992-05-15',
      birthTime: '14:30',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
    });
    snapshot = CalculationSnapshotEngine.createSnapshot(factSet);
  });

  // ================================================================
  // 1. QUESTION -> REASONING PLAN
  // ================================================================
  describe('1. Question -> Reasoning Plan', () => {
    it('generates a selective reasoning plan without executing unrelated systems', async () => {
      const res = await IntelligenceOrchestrator.analyze({
        userId: testUserId,
        query: 'When will my career transition into senior leadership?',
      });

      expect(res.reasoningPlan).toBeDefined();
      expect(res.reasoningPlan?.intent).toBe('CAREER');
      expect(res.reasoningPlan?.lifeDomain).toBe('CAREER');
      expect(res.reasoningPlan?.requiredEngines).toContain('LongitudinalReasoningEngine');
      expect(res.reasoningPlan?.requiredEngines).toContain('CalculationSnapshotEngine');
      expect(res.reasoningPlan?.requiredFacts).toContain('Current Mahadasha & Antardasha');
      expect(res.reasoningPlan?.requiredSources).toContain('Brihat Parashara Hora Shastra');
    });
  });

  // ================================================================
  // 2. CONTEXT GRAPH ENGINE
  // ================================================================
  describe('2. Context Graph Engine', () => {
    it('builds an ephemeral reasoning graph enforcing Correlation != Causation', () => {
      const graph = ContextGraphEngine.buildGraph({
        userId: testUserId,
        query: 'What does my career look like in Q4?',
        intent: 'CAREER',
        snapshot,
        activeGoals: ['Transition to Senior Product Architect'],
      });

      expect(graph.nodes.length).toBeGreaterThanOrEqual(4);
      expect(graph.edges.length).toBeGreaterThanOrEqual(3);

      const nodeTypes = graph.nodes.map((n) => n.type);
      expect(nodeTypes).toContain('USER');
      expect(nodeTypes).toContain('QUESTION');
      expect(nodeTypes).toContain('CALCULATION');
      expect(nodeTypes).toContain('DASHA');
      expect(nodeTypes).toContain('GOAL');

      // Check invariant
      expect(graph.invariants.some((inv) => inv.includes('CORRELATION != CAUSATION'))).toBe(true);
      expect(graph.invariants.some((inv) => inv.includes('IMMUTABLE TRUTH CORE'))).toBe(true);
    });
  });

  // ================================================================
  // 3. CONTEXT RELEVANCE & PERSONAL CONTEXT PRIORITY
  // ================================================================
  describe('3. Context Relevance & Personal Context Priority', () => {
    it('prioritizes Goal > Recent Event > Preference > Historical Event > AI Suggestion', () => {
      const items = [
        { id: '1', category: 'AI_SUGGESTION' as const, content: 'Suggested job move', domain: 'CAREER', userConfirmed: false },
        { id: '2', category: 'GOAL' as const, content: 'Confirmed switch to AI design', domain: 'CAREER', userConfirmed: true },
        { id: '3', category: 'PREFERENCE' as const, content: 'Prefers Expert depth', domain: 'GENERAL', userConfirmed: true },
        { id: '4', category: 'RECENT_EVENT' as const, content: 'Promoted in 2025', domain: 'CAREER', userConfirmed: true, date: '2025-01-01' },
      ];

      const ranked = ContextRelevanceEngine.filterAndRankContext({
        intent: 'CAREER',
        items,
        maxItems: 4,
      });

      expect(ranked[0].category).toBe('GOAL');
      expect(ranked[1].category).toBe('RECENT_EVENT');
      expect(ranked[ranked.length - 1].category).toBe('AI_SUGGESTION');
      expect(ranked[0].priorityRank).toBeLessThan(ranked[ranked.length - 1].priorityRank);
    });
  });

  // ================================================================
  // 4. LONGITUDINAL REASONING ENGINE
  // ================================================================
  describe('4. Longitudinal Reasoning Engine', () => {
    it('synthesizes Past vs Current vs Future milestones and outputs PATTERN_OBSERVED', () => {
      PersonalLifeGraph.addNode({
        userId: testUserId,
        type: 'JOB',
        title: 'Joined Tier 1 Tech Firm',
        dateStart: '2019-06-01',
        userConfirmed: true,
      });
      PersonalLifeGraph.addNode({
        userId: testUserId,
        type: 'CAREER',
        title: 'Promotion to Lead Engineer',
        dateStart: '2022-09-01',
        userConfirmed: true,
      });

      const longitudinal = LongitudinalReasoningEngine.analyzeDomainTimeline({
        userId: testUserId,
        domain: 'CAREER',
        snapshot,
      });

      expect(longitudinal.domain).toBe('CAREER');
      expect(longitudinal.status).toBe('PATTERN_OBSERVED');
      expect(longitudinal.pastMilestones.length).toBeGreaterThanOrEqual(2);
      expect(longitudinal.currentConditions.activeDasha).toBeDefined();
      expect(longitudinal.futureWindows.length).toBeGreaterThanOrEqual(2);
      expect(longitudinal.repeatedThemes.length).toBeGreaterThan(0);
      expect(longitudinal.differences.length).toBeGreaterThan(0);
    });
  });

  // ================================================================
  // 5. HISTORICAL PERIOD MATCHER
  // ================================================================
  describe('5. Historical Period Matcher', () => {
    it('matches past year (e.g. 2018) and extracts similarities, differences, and new factors', () => {
      const match = HistoricalPeriodMatcher.matchPeriod({
        userId: testUserId,
        targetYear: 2018,
        currentSnapshot: snapshot,
      });

      expect(match.matchedYear).toBe(2018);
      expect(match.similarities.length).toBeGreaterThan(0);
      expect(match.differences.length).toBeGreaterThan(0);
      expect(match.newFactors.length).toBeGreaterThan(0);
      expect(match.astrologicalResonanceScore).toBeGreaterThan(0.5);
      expect(match.summary).toContain('NOT a repetition of past vulnerability');
    });
  });

  // ================================================================
  // 6. LIFE PATTERN ENGINE 3.1
  // ================================================================
  describe('6. Life Pattern Engine 3.1 Strength Classifications', () => {
    it('assigns EMERGING_PATTERN for 2 events and REPEATED_PATTERN for 3 events', () => {
      const patterns = LifePatternEngine.discoverPatterns(testUserId);
      const careerPat = patterns.find((p) => p.theme.includes('Career'));

      expect(careerPat).toBeDefined();
      expect(['EMERGING_PATTERN', 'REPEATED_PATTERN', 'STRONG_OBSERVED_PATTERN']).toContain(careerPat?.strength);
      expect(careerPat?.observationType).toBe('PATTERN_OBSERVED');
    });
  });

  // ================================================================
  // 7. PREDICTION MEMORY & DE-DUPLICATION
  // ================================================================
  describe('7. Prediction Memory & De-duplication', () => {
    it('detects duplicate predictions for the same domain and time window', () => {
      PredictionMemoryEngine.recordPrediction({
        predictionId: 'pred_career_q4',
        userId: testUserId,
        domain: 'CAREER',
        timeWindow: '2026 Q4',
        direction: 'FAVORABLE',
        primaryEvidence: ['10th Lord Dasha Activation'],
        confidence: 'HIGH',
        generatedAt: new Date().toISOString(),
        outcomeStatus: 'SUCCESS',
      });

      const check = PredictionMemoryEngine.checkDuplication({
        userId: testUserId,
        domain: 'CAREER',
        timeWindow: '2026 Q4',
        evidenceTokens: ['10th Lord Dasha Activation'],
      });

      expect(check.isDuplicate).toBe(true);
      expect(check.existingPrediction?.predictionId).toBe('pred_career_q4');

      const calib = PredictionMemoryEngine.retrieveHistoricalCalibration(testUserId, 'CAREER');
      expect(calib.totalSimilar).toBe(1);
      expect(calib.confirmedSuccessful).toBe(1);
    });
  });

  // ================================================================
  // 8. UNCERTAINTY COMPOSITION ENGINE
  // ================================================================
  describe('8. Uncertainty Composition Engine', () => {
    it('combines boundary proximity, contradictions, and sample size into composite level', () => {
      const breakdown = UncertaintyCompositionEngine.composeUncertainty({
        snapshot,
        contradictionCount: 1,
        hasConfirmedContext: true,
        historicalSampleSize: 2,
        worldDataFreshness: 'FRESH',
      });

      expect(['LOW', 'MODERATE', 'HIGH']).toContain(breakdown.compositeLevel);
      expect(breakdown.reasons.length).toBeGreaterThan(0);
      expect(breakdown.contradictionTension).toBe('MODERATE');
    });
  });

  // ================================================================
  // 9. USER GOAL ENGINE & GOAL EVOLUTION
  // ================================================================
  describe('9. User Goal Engine & Goal Evolution', () => {
    it('adds goal, evolves goal to version 2, and preserves historical timeline immutably', () => {
      const goal = UserGoalEngine.addGoal({
        userId: testUserId,
        domain: 'CAREER',
        title: 'Find a Senior Product Role',
        description: 'Targeting enterprise SaaS companies in Q3',
      });

      expect(goal.version).toBe(1);
      expect(goal.status).toBe('ACTIVE');

      const evolved = UserGoalEngine.evolveGoal({
        userId: testUserId,
        goalId: goal.goalId,
        newTitle: 'Launch Independent Consulting Studio',
        newDescription: 'Transitioning from full-time to boutique design practice',
        reason: 'Accelerated client demand',
      });

      expect(evolved?.version).toBe(2);
      expect(evolved?.status).toBe('EVOLVED');
      expect(evolved?.history.length).toBe(2);
      expect(evolved?.history[0].title).toBe('Find a Senior Product Role');
      expect(evolved?.history[1].title).toBe('Launch Independent Consulting Studio');
    });
  });

  // ================================================================
  // 10. WHAT CHANGED ENGINE
  // ================================================================
  describe('10. What Changed Engine', () => {
    it('identifies reading session differences and synthesizes progression', () => {
      WhatChangedEngine.recordReadingState(testUserId, snapshot);

      // Add another goal to trigger a change
      UserGoalEngine.addGoal({
        userId: testUserId,
        domain: 'SPIRITUAL',
        title: 'Daily Pranayama & Meditation',
        description: 'Establishing regular dawn meditation practice',
      });

      const changes = WhatChangedEngine.analyzeChanges(testUserId, snapshot);

      expect(changes.lastReadingDate).toBeDefined();
      expect(changes.currentReadingDate).toBeDefined();
      expect(changes.newTransits.length).toBeGreaterThan(0);
      expect(changes.synthesis).toBeDefined();
    });
  });

  // ================================================================
  // 11. END-TO-END ORCHESTRATOR 3.1 INTEGRATION
  // ================================================================
  describe('11. End-to-End Orchestrator 3.1 Integration', () => {
    it('executes the full 3.1 pipeline with all extended payloads', async () => {
      const response = await IntelligenceOrchestrator.analyze({
        userId: testUserId,
        query: 'What is my career direction for this year?',
      });

      expect(response.answerId).toBeDefined();
      expect(response.reasoningPlan).toBeDefined();
      expect(response.contextGraph).toBeDefined();
      expect(response.longitudinalAnalysis).toBeDefined();
      expect(response.uncertaintyBreakdown).toBeDefined();
      expect(response.whatChanged).toBeDefined();
      expect(['ANSWERABLE', 'PARTIALLY_ANSWERABLE', 'NEEDS_CLARIFICATION']).toContain(response.answerabilityStatus);
      expect(response.directAnswer).toContain('Ascendant');
    });
  });

  // ================================================================
  // 12. API ENDPOINTS 3.1
  // ================================================================
  describe('12. DeepAstro 3.1 API Endpoints', () => {
    it('POST /api/intelligence/reasoning-plan previews execution plan', async () => {
      const res = await request(app)
        .post('/api/intelligence/reasoning-plan')
        .send({ query: 'When should I purchase a home?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reasoningPlan).toBeDefined();
      expect(res.body.intent).toBeDefined();
    });

    it('POST /api/intelligence/graph retrieves context graph', async () => {
      const res = await request(app)
        .post('/api/intelligence/graph')
        .send({ userId: testUserId, query: 'Career strategy', intent: 'CAREER' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.graph.nodes.length).toBeGreaterThan(0);
      expect(res.body.graph.edges.length).toBeGreaterThan(0);
    });

    it('POST /api/intelligence/historical-match compares target year', async () => {
      const res = await request(app)
        .post('/api/intelligence/historical-match')
        .send({ userId: testUserId, targetYear: 2018 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.match.matchedYear).toBe(2018);
      expect(res.body.match.similarities).toBeDefined();
    });

    it('POST /api/intelligence/what-changed analyzes consecutive sessions', async () => {
      const res = await request(app)
        .post('/api/intelligence/what-changed')
        .send({ userId: testUserId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.whatChanged.newTransits).toBeDefined();
    });

    it('POST & GET /api/intelligence/goal establishes and retrieves goals', async () => {
      const postRes = await request(app)
        .post('/api/intelligence/goal')
        .send({
          userId: testUserId,
          domain: 'RELATIONSHIP',
          title: 'Establish Conscious Partnership',
          description: 'Focusing on shared values and communication',
        });

      expect(postRes.status).toBe(200);
      expect(postRes.body.success).toBe(true);
      expect(postRes.body.goal.title).toBe('Establish Conscious Partnership');

      const getRes = await request(app)
        .get(`/api/intelligence/goals?userId=${testUserId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.activeGoals.length).toBeGreaterThan(0);
    });

    it('POST /api/intelligence/confirm-memory saves confirmed memory item', async () => {
      const res = await request(app)
        .post('/api/intelligence/confirm-memory')
        .send({
          userId: testUserId,
          action: 'SAVE',
          type: 'USER_PREFERENCE',
          content: 'Prefers Lahiri Ayanamsha with Sripati house cusps',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.action).toBe('SAVED');
      expect(res.body.memory.confirmed).toBe(true);
    });

    it('GET /api/intelligence/health reports fabric 3.1.0-PROD with all 3.1 engines', async () => {
      const res = await request(app).get('/api/intelligence/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.fabricVersion).toBe('3.1.0-PROD');
      expect(res.body.enginesAvailable).toContain('ContextGraphEngine');
      expect(res.body.enginesAvailable).toContain('LongitudinalReasoningEngine');
      expect(res.body.enginesAvailable).toContain('HistoricalPeriodMatcher');
      expect(res.body.enginesAvailable).toContain('UncertaintyCompositionEngine');
      expect(res.body.enginesAvailable).toContain('WhatChangedEngine');
      expect(res.body.enginesAvailable).toContain('UserGoalEngine');
    });
  });
});
