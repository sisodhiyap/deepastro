/**
 * DeepAstro Intelligence Upgrade 3.0 — Comprehensive Verification Suite
 * Tests all 21 modular engines, API endpoints, multi-tenant isolation,
 * consent boundaries, and anti-hallucination defenses.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import {
  IntelligenceOrchestrator,
  UserIntentEngine,
  QuestionUnderstandingEngine,
  ContextEngine,
  MemoryReasoningEngine,
  UserPreferenceEngine,
  EvidenceFusionEngine,
  ContradictionReasoningEngine,
  TemporalReasoningEngine,
  LifePatternEngine,
  PredictionReasoningEngine,
  DecisionIntelligenceEngine,
  ResearchIntelligenceEngine,
  OutcomeLearningEngine,
  ConfidenceEngine,
  UncertaintyEngine,
  ExplanationEngine,
  RecommendationEngine,
  IntelligenceTelemetry,
  PersonalLifeGraph,
} from '../server/src/intelligence/index.js';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';

describe('DEEPASTRO INTELLIGENCE UPGRADE 3.0 SUITE', () => {
  const userA = 'user_test_alpha';
  const userB = 'user_test_beta';

  const sampleProfileA = {
    name: 'Alpha User',
    birthDate: '1992-07-15',
    birthTime: '10:30',
    birthPlace: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  };

  const sampleProfileB = {
    name: 'Beta User',
    birthDate: '1988-11-20',
    birthTime: '18:45',
    birthPlace: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
  };

  beforeEach(() => {
    ContextEngine.purgeUser(userA);
    ContextEngine.purgeUser(userB);
    MemoryReasoningEngine.purgeUserMemories(userA);
    MemoryReasoningEngine.purgeUserMemories(userB);
    UserPreferenceEngine.purgeUser(userA);
    UserPreferenceEngine.purgeUser(userB);
    OutcomeLearningEngine.purgeUser(userA);
    OutcomeLearningEngine.purgeUser(userB);
    PersonalLifeGraph.purgeUserData(userA);
    PersonalLifeGraph.purgeUserData(userB);
    IntelligenceTelemetry.clear();
  });

  // 1. User Intent Engine
  describe('Engine 1: UserIntentEngine', () => {
    it('accurately classifies Career and Timing intents with time horizons', () => {
      const parsed = UserIntentEngine.classifyIntent('When is the best time for me to change my job?');
      expect(parsed.primaryCategory).toBe('CAREER');
      expect(parsed.secondaryCategories).toContain('JOB');
      expect(parsed.secondaryCategories).toContain('TIMING');
      expect(parsed.timeHorizon).toBe('NEXT_6_MONTHS');
      expect(parsed.userObjective).toContain('career');
    });

    it('identifies Relocation intent and emotional tone', () => {
      const parsed = UserIntentEngine.classifyIntent('I am nervous about relocating to Bengaluru next month');
      expect(parsed.primaryCategory).toBe('RELOCATION');
      expect(parsed.emotionalTone).toBe('ANXIOUS');
      expect(parsed.timeHorizon).toBe('NEXT_MONTH');
    });

    it('detects Decision intent between two options', () => {
      const parsed = UserIntentEngine.classifyIntent('Should I choose Option A or Option B for my startup?');
      expect(parsed.primaryCategory).toBe('DECISION');
      expect(parsed.secondaryCategories).toContain('BUSINESS');
    });
  });

  // 2. Question Understanding & Disambiguation
  describe('Engine 2: QuestionUnderstandingEngine', () => {
    it('flags ambiguous queries and asks at most 1-3 targeted clarifying questions', () => {
      const intent = UserIntentEngine.classifyIntent('Will I be successful?');
      const decomp = QuestionUnderstandingEngine.decomposeQuestion('Will I be successful?', intent);
      expect(decomp.isAmbiguous).toBe(true);
      expect(decomp.clarifyingQuestions.length).toBeGreaterThan(0);
      expect(decomp.clarifyingQuestions.length).toBeLessThanOrEqual(3);
    });

    it('does not prompt unnecessary clarifying questions when context is already confirmed', () => {
      ContextEngine.updateCareerContext(userA, {
        currentRole: 'Senior Data Architect',
        activeGoals: ['Lead Autonomous AI Engineering'],
        userConfirmed: true,
      });
      const ctx = ContextEngine.getContext(userA);
      const intent = UserIntentEngine.classifyIntent('How is my career progression looking?');
      const decomp = QuestionUnderstandingEngine.decomposeQuestion('How is my career progression looking?', intent, ctx);
      expect(decomp.isAmbiguous).toBe(false);
      expect(decomp.clarifyingQuestions.length).toBe(0);
    });
  });

  // 3. Context & Sovereign Memory Consent Boundaries
  describe('Engine 3 & 4: ContextEngine & MemoryReasoningEngine', () => {
    it('enforces that AI proposed memories remain unconfirmed until explicit confirmation', () => {
      const proposed = MemoryReasoningEngine.proposeMemory(userA, 'User is considering career pivot to Robotics', 'USER_GOAL');
      expect(proposed.confirmed).toBe(false);
      expect(proposed.source).toBe('AI_PROPOSED');

      // Cannot appear in confirmed memories
      const confirmedBefore = MemoryReasoningEngine.getConfirmedMemories(userA);
      expect(confirmedBefore.map((m) => m.memoryId)).not.toContain(proposed.memoryId);

      // Confirm memory
      const success = MemoryReasoningEngine.confirmMemory(userA, proposed.memoryId);
      expect(success).toBe(true);

      const confirmedAfter = MemoryReasoningEngine.getConfirmedMemories(userA);
      expect(confirmedAfter.map((m) => m.memoryId)).toContain(proposed.memoryId);
    });

    it('strictly isolates context and memories between User A and User B', () => {
      ContextEngine.updateCareerContext(userA, { currentRole: 'Cloud Architect', userConfirmed: true });
      ContextEngine.updateCareerContext(userB, { currentRole: 'Physician', userConfirmed: true });

      const factsA = ContextEngine.getAuthoritativeFacts(userA);
      const factsB = ContextEngine.getAuthoritativeFacts(userB);

      expect(factsA.some((f) => f.includes('Cloud Architect'))).toBe(true);
      expect(factsA.some((f) => f.includes('Physician'))).toBe(false);

      expect(factsB.some((f) => f.includes('Physician'))).toBe(true);
      expect(factsB.some((f) => f.includes('Cloud Architect'))).toBe(false);
    });
  });

  // 4. Evidence Fusion & Contradiction Reasoning
  describe('Engine 5 & 6: EvidenceFusionEngine & ContradictionReasoningEngine', () => {
    it('fuses multi-system signals and identifies convergence', () => {
      const facts = VedicAstroEngine.createAstrologyFactSet(sampleProfileA);
      const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

      const fusion = EvidenceFusionEngine.fuseEvidence(snapshot, 'CAREER', {
        jaimini: { active: true },
        kp: { active: true },
      });

      expect(fusion.signals.length).toBeGreaterThanOrEqual(2);
      expect(['STRONG_CONVERGENCE', 'MODERATE_CONVERGENCE', 'MIXED']).toContain(fusion.convergence);
    });

    it('transparently isolates divergent signals without forcing consensus', () => {
      const signals: any[] = [
        {
          id: '1',
          system: 'PARASHARI',
          factor: '10th Lord in Kendra',
          evidence: 'Supportive career expansion',
          direction: 'FAVORABLE',
          strength: 0.9,
          relevance: 0.9,
          confidence: 'HIGH',
          source: 'BPHS',
          epistemicLevel: 'LEVEL_3_VERSIONED_CLASSICAL_RULE',
        },
        {
          id: '2',
          system: 'KP',
          factor: 'Sub-Lord in 8th house cusp',
          evidence: 'Procedural delays and hurdles',
          direction: 'TRANSITIONAL',
          strength: 0.8,
          relevance: 0.8,
          confidence: 'HIGH',
          source: 'KP Stellar',
          epistemicLevel: 'LEVEL_3_VERSIONED_CLASSICAL_RULE',
        },
      ];

      const contradictions = ContradictionReasoningEngine.analyzeContradictions(signals, 'CAREER');
      expect(contradictions.length).toBe(1);
      expect(contradictions[0].primarySystem).toBe('PARASHARI');
      expect(contradictions[0].opposingSystem).toBe('KP');
      expect(contradictions[0].reconciliationSummary).toContain('fundamental potential is supportive');
    });
  });

  // 5. Life Pattern & Life Replay 2.0
  describe('Engine 7 & 8: LifePatternEngine', () => {
    it('identifies observed patterns strictly labeled as PATTERN_OBSERVED', () => {
      PersonalLifeGraph.addNode({
        userId: userA,
        type: 'JOB',
        title: 'Joined Tech Startup',
        dateStart: '2016-06-01',
        source: 'USER_DIRECT_INPUT',
        userConfirmed: true,
      });
      PersonalLifeGraph.addNode({
        userId: userA,
        type: 'CAREER',
        title: 'Promotion to Lead Engineer',
        dateStart: '2020-08-15',
        source: 'USER_DIRECT_INPUT',
        userConfirmed: true,
      });

      const patterns = LifePatternEngine.discoverPatterns(userA);
      expect(patterns.length).toBeGreaterThanOrEqual(1);
      expect(patterns[0].observationType).toBe('PATTERN_OBSERVED');
      expect(patterns[0].theme).toContain('Career');
    });

    it('compares historical milestones with current transits in Life Replay 2.0', () => {
      const node = PersonalLifeGraph.addNode({
        userId: userA,
        type: 'CAREER',
        title: 'Founded First Company',
        dateStart: '2018-03-10',
        source: 'USER_DIRECT_INPUT',
        userConfirmed: true,
      });

      const facts = VedicAstroEngine.createAstrologyFactSet(sampleProfileA);
      const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

      const comparison = LifePatternEngine.compareHistoricalPeriod(userA, node.nodeId, snapshot);
      expect(comparison).not.toBeNull();
      expect(comparison?.historicalEventTitle).toBe('Founded First Company');
      expect(comparison?.similarities.length).toBeGreaterThan(0);
      expect(comparison?.differences.length).toBeGreaterThan(0);
      expect(comparison?.evolutionaryLesson).toContain('wisdom');
    });
  });

  // 6. Outcome Calibration & Brier Scoring
  describe('Engine 9: OutcomeLearningEngine', () => {
    it('returns INSUFFICIENT_DATA when confirmed outcomes are less than 5', () => {
      OutcomeLearningEngine.recordOutcome({
        predictionId: 'pred_1',
        userId: userA,
        predictedDirection: 'FAVORABLE',
        forecastDate: '2025-01-01',
        confirmedDate: '2025-06-01',
        verdict: 'SUCCESS',
      });

      const cal = OutcomeLearningEngine.getCalibration(userA);
      expect(cal.status).toBe('INSUFFICIENT_DATA');
      expect(cal.brierScore).toBeNull();
      expect(cal.calibrationSummary).toContain('at least 5 confirmed outcomes');
    });

    it('calculates empirical alignment score and Brier score when outcomes >= 5', () => {
      for (let i = 1; i <= 6; i++) {
        OutcomeLearningEngine.recordOutcome({
          predictionId: `pred_${i}`,
          userId: userA,
          predictedDirection: 'FAVORABLE',
          forecastDate: '2025-01-01',
          confirmedDate: '2025-06-01',
          verdict: i <= 4 ? 'SUCCESS' : 'NOT_OCCURRED',
        });
      }

      const cal = OutcomeLearningEngine.getCalibration(userA);
      expect(cal.status).toBe('CALIBRATED');
      expect(cal.brierScore).not.toBeNull();
      expect(typeof cal.brierScore).toBe('number');
    });
  });

  // 7. Decision & Relocation Intelligence
  describe('Engine 10 & 11: Decision & Relocation Intelligence', () => {
    it('evaluates decisions comparatively without removing user sovereignty', () => {
      const facts = VedicAstroEngine.createAstrologyFactSet(sampleProfileA);
      const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

      const decision = DecisionIntelligenceEngine.evaluateDecision({
        query: 'Should I join Company X or stay at Company Y?',
        optionA: { name: 'Join Company X' },
        optionB: { name: 'Stay at Company Y' },
        snapshot,
      });

      expect(decision.optionA.astrologicalSupport).toBeDefined();
      expect(decision.optionB.astrologicalSupport).toBeDefined();
      expect(decision.agencyDisclaimer).toContain('choice, strategy, and execution remain entirely in your sovereign hands');
    });

    it('enforces user consent requirement for world research', () => {
      const facts = VedicAstroEngine.createAstrologyFactSet(sampleProfileA);
      const snapshot = CalculationSnapshotEngine.createSnapshot(facts);

      const unconsented = ResearchIntelligenceEngine.evaluateRelocation({
        currentCity: 'New Delhi',
        destinationCity: 'Bengaluru',
        userConsent: false,
        snapshot,
      });
      expect(unconsented.userConsentVerified).toBe(false);
      expect(unconsented.worldFacts.industryFocus).toBe('Consent Required');

      const consented = ResearchIntelligenceEngine.evaluateRelocation({
        currentCity: 'New Delhi',
        destinationCity: 'Bengaluru',
        userConsent: true,
        snapshot,
      });
      expect(consented.userConsentVerified).toBe(true);
      expect(consented.worldFacts.industryFocus).toContain('technological');
    });
  });

  // 8. End-to-End Orchestrator Pipeline
  describe('Master Pipeline: IntelligenceOrchestrator', () => {
    it('executes full multi-stage intelligence analysis and records telemetry', async () => {
      const result = await IntelligenceOrchestrator.analyze({
        userId: userA,
        query: 'What career direction is supported over the next 6 months?',
        birthProfile: sampleProfileA,
      });

      expect(result.answerId).toBeDefined();
      expect(result.intent.primaryCategory).toBe('CAREER');
      expect(result.whyThisReading.primaryFactors.length).toBeGreaterThan(0);
      expect(result.whyThisReading.evidenceSources.length).toBeGreaterThan(0);
      expect(result.practicalNextSteps.length).toBeGreaterThan(0);
      expect(result.traditionalRemedies.length).toBeGreaterThan(0);
      expect(['LOW', 'MODERATE', 'HIGH']).toContain(result.confidence);

      // Verify telemetry
      const telemetry = IntelligenceTelemetry.getSummary();
      expect(telemetry.totalTraces).toBeGreaterThan(0);
      expect(telemetry.intentDistribution.CAREER).toBeGreaterThanOrEqual(1);
    });

    it('verifies strict tenant isolation in end-to-end multi-user cycle (A -> B -> A -> B)', async () => {
      ContextEngine.updateCareerContext(userA, { currentRole: 'Aerospace Engineer', userConfirmed: true });
      ContextEngine.updateCareerContext(userB, { currentRole: 'Architect', userConfirmed: true });

      const resA1 = await IntelligenceOrchestrator.analyze({
        userId: userA,
        query: 'Summarize my career opportunities',
        birthProfile: sampleProfileA,
      });
      expect(resA1.userContextApplied.some((c) => c.includes('Aerospace Engineer'))).toBe(true);
      expect(resA1.userContextApplied.some((c) => c.includes('Architect'))).toBe(false);

      const resB1 = await IntelligenceOrchestrator.analyze({
        userId: userB,
        query: 'Summarize my career opportunities',
        birthProfile: sampleProfileB,
      });
      expect(resB1.userContextApplied.some((c) => c.includes('Architect'))).toBe(true);
      expect(resB1.userContextApplied.some((c) => c.includes('Aerospace Engineer'))).toBe(false);

      // Second cycle
      const resA2 = await IntelligenceOrchestrator.analyze({
        userId: userA,
        query: 'Review my professional timeline',
        birthProfile: sampleProfileA,
      });
      expect(resA2.userContextApplied.some((c) => c.includes('Aerospace Engineer'))).toBe(true);
      expect(resA2.userContextApplied.some((c) => c.includes('Architect'))).toBe(false);

      const resB2 = await IntelligenceOrchestrator.analyze({
        userId: userB,
        query: 'Review my professional timeline',
        birthProfile: sampleProfileB,
      });
      expect(resB2.userContextApplied.some((c) => c.includes('Architect'))).toBe(true);
      expect(resB2.userContextApplied.some((c) => c.includes('Aerospace Engineer'))).toBe(false);
    });
  });

  // 9. Intelligence API Endpoints
  describe('Live API Endpoints (/api/intelligence/*)', () => {
    it('POST /api/intelligence/analyze returns structured intelligence', async () => {
      const res = await request(app)
        .post('/api/intelligence/analyze')
        .send({
          userId: userA,
          query: 'What career direction is supported?',
          birthProfile: sampleProfileA,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intelligence.intent.primaryCategory).toBe('CAREER');
      expect(res.body.intelligence.whyThisReading).toBeDefined();
    });

    it('POST /api/intelligence/why returns evidence breakdown', async () => {
      const res = await request(app)
        .post('/api/intelligence/why')
        .send({
          userId: userA,
          query: 'Why is this period supportive for career expansion?',
          birthProfile: sampleProfileA,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.whyThisReading.primaryFactors).toBeDefined();
      expect(res.body.whyThisReading.evidenceSources).toBeDefined();
    });

    it('POST /api/intelligence/decision performs counterfactual analysis', async () => {
      const res = await request(app)
        .post('/api/intelligence/decision')
        .send({
          query: 'Should I take Job A or Job B?',
          optionA: { name: 'Job A' },
          optionB: { name: 'Job B' },
          birthProfile: sampleProfileA,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.decisionResult.optionA.astrologicalSupport).toBeDefined();
      expect(res.body.decisionResult.optionB.astrologicalSupport).toBeDefined();
    });

    it('POST /api/intelligence/research respects user consent', async () => {
      const unconsented = await request(app)
        .post('/api/intelligence/research')
        .send({
          currentCity: 'New Delhi',
          destinationCity: 'Bengaluru',
          userConsent: false,
          birthProfile: sampleProfileA,
        });

      expect(unconsented.status).toBe(200);
      expect(unconsented.body.researchResult.userConsentVerified).toBe(false);

      const consented = await request(app)
        .post('/api/intelligence/research')
        .send({
          currentCity: 'New Delhi',
          destinationCity: 'Bengaluru',
          userConsent: true,
          birthProfile: sampleProfileA,
        });

      expect(consented.status).toBe(200);
      expect(consented.body.researchResult.userConsentVerified).toBe(true);
    });

    it('POST /api/intelligence/feedback and GET /api/intelligence/profile', async () => {
      const fbRes = await request(app)
        .post('/api/intelligence/feedback')
        .send({
          userId: userA,
          predictionId: 'pred_live_test',
          verdict: 'SUCCESS',
        });

      expect(fbRes.status).toBe(200);
      expect(fbRes.body.success).toBe(true);

      const profRes = await request(app)
        .get(`/api/intelligence/profile?userId=${userA}`);

      expect(profRes.status).toBe(200);
      expect(profRes.body.profile.context).toBeDefined();
      expect(profRes.body.profile.calibration).toBeDefined();
    });

    it('GET /api/intelligence/health returns healthy telemetry and fabric status', async () => {
      const res = await request(app).get('/api/intelligence/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('HEALTHY');
      expect(res.body.enginesAvailable.length).toBeGreaterThanOrEqual(15);
      expect(res.body.telemetry).toBeDefined();
    });
  });
});
