/**
 * DeepAstro Brain v2 — Omni-Source Personal Jyotish Intelligence Test Suite
 * Validates:
 * 1. IntentClassifier (23 intents, multi-intent classification)
 * 2. ResearchPlanner (ResearchPlan synthesis & domain routing)
 * 3. JaiminiEngine (7 Chara Karakas, Rashi Drishti, Arudha Lagna, Upapada Lagna, Chara Dasha)
 * 4. KPEngine (Sub-lords, Cusps, Significators, and safe KP_NOT_AVAILABLE fallback)
 * 5. NumerologyEngine & NumerologyCorrelationEngine (Personal Month/Day, Vedic-Numerology Fusion)
 * 6. WorldResearchAgent (Consent gating, privacy safeguards, WORLD_FACT separation)
 * 7. ContradictionEngine (Cross-system tensions, Dasha vs Transit, Chart vs Context)
 * 8. DecisionSimulationEngine (Counterfactual scenario comparison without fatalism)
 * 9. LifeReplayEngine (Milestone overlay with OBSERVED_CORRELATION provenance)
 * 10. RelocationAnalysisEngine (Natal root preservation with relocated horizon)
 * 11. DeepAstroBrain master orchestration & /api/brain/* live endpoints
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { IntentClassifier } from '../server/src/brain/IntentClassifier.js';
import { ResearchPlanner } from '../server/src/brain/ResearchPlanner.js';
import { JaiminiEngine } from '../server/src/astrology/JaiminiEngine.js';
import { KPEngine } from '../server/src/astrology/KPEngine.js';
import { calculateNumerology } from '../server/src/astrology/NumerologyEngine.js';
import { NumerologyCorrelationEngine } from '../server/src/learning/NumerologyCorrelationEngine.js';
import { WorldResearchAgent } from '../server/src/brain/WorldResearchAgent.js';
import { ContradictionEngine } from '../server/src/brain/ContradictionEngine.js';
import { DecisionSimulationEngine } from '../server/src/brain/DecisionSimulationEngine.js';
import { LifeReplayEngine } from '../server/src/learning/LifeReplayEngine.js';
import { RelocationAnalysisEngine } from '../server/src/astrology/RelocationAnalysisEngine.js';
import { DeepAstroBrain } from '../server/src/brain/DeepAstroBrain.js';

describe('DEEPASTRO BRAIN v2 — OMNI-SOURCE INTELLIGENCE ENGINE SUITE', () => {
  const testNative: BirthProfileInput = {
    name: 'Siddharth Rao',
    birthDate: '1991-09-21',
    birthTime: '08:45',
    birthPlace: 'Bengaluru, Karnataka, India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 5.5,
    gender: 'Male',
  };

  // ── PART 1: INTENT CLASSIFICATION ──────────────────────────────────────────
  describe('IntentClassifier — Multi-Intent & Domain Routing', () => {
    it('classifies complex multi-intent query: career + business + timing + decision support', () => {
      const q = 'Should I leave my corporate tech job and start an AI business in 2027?';
      const result = IntentClassifier.classify(q);

      expect(result.intents).toContain('CAREER');
      expect(result.intents).toContain('BUSINESS');
      expect(result.intents).toContain('DECISION_SUPPORT');
      expect(result.relevantHouses).toContain(10);
      expect(result.relevantHouses).toContain(7);
      expect(result.isDecisionQuery).toBe(true);
    });

    it('identifies relationship and marriage intents accurately', () => {
      const q = 'When will I get married to my partner?';
      const result = IntentClassifier.classify(q);

      expect(result.intents).toContain('MARRIAGE');
      expect(result.relevantHouses).toContain(7);
      expect(result.relevantGrahas).toContain('Venus');
      expect(result.isTimingQuery).toBe(true);
    });

    it('identifies palmistry and numerology queries', () => {
      const q = 'Examine my life line and fate line in palmistry with my life path number';
      const result = IntentClassifier.classify(q);

      expect(result.intents).toContain('PALMISTRY');
      expect(result.intents).toContain('NUMEROLOGY');
      expect(result.requiresPalmistry).toBe(true);
      expect(result.requiresNumerology).toBe(true);
    });
  });

  // ── PART 2: RESEARCH PLANNER ──────────────────────────────────────────────
  describe('ResearchPlanner — Multi-System Synthesis Plan', () => {
    it('creates structured research plan identifying required systems and chart factors', () => {
      const q = 'Should I relocate to London for my career next year?';
      const plan = ResearchPlanner.plan(q, { allowPublicResearch: true });

      expect(plan.requiredSystems).toContain('VEDIC');
      expect(plan.requiredSystems).toContain('JAIMINI');
      expect(plan.intent.intents).toContain('RELOCATION');
      expect(plan.intent.intents).toContain('CAREER');
      expect(plan.requiresWebResearch).toBe(true);
      expect(plan.requiredChartFactors.length).toBeGreaterThan(0);
    });
  });

  // ── PART 3: JAIMINI ENGINE ────────────────────────────────────────────────
  describe('JaiminiEngine — 7 Chara Karakas, Rashi Drishti & Arudha Lagna', () => {
    it('computes 7 Chara Karakas strictly ordered by degree in sign', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const jaimini = JaiminiEngine.calculateJaimini(factSet.planets, factSet.ascendant);

      expect(jaimini.methodology).toContain('Jaimini');
      expect(jaimini.charaKarakas.length).toBe(7);

      // Verify descending degree order
      for (let i = 0; i < jaimini.charaKarakas.length - 1; i++) {
        expect(jaimini.charaKarakas[i].degreeInSign).toBeGreaterThanOrEqual(jaimini.charaKarakas[i + 1].degreeInSign);
      }

      expect(jaimini.atmakaraka.role).toBe('Atmakaraka');
      expect(jaimini.atmakaraka.code).toBe('AK');
      expect(jaimini.amatyakaraka.role).toBe('Amatyakaraka');
      expect(jaimini.darakaraka.role).toBe('Darakaraka');
      expect(jaimini.darakaraka.code).toBe('DK');

      // Arudha Lagna and Upapada Lagna
      expect(jaimini.arudhaLagna.signName).toBeDefined();
      expect(jaimini.upapadaLagna.signName).toBeDefined();

      // Rashi Drishti
      expect(jaimini.rashiDrishti.length).toBe(12);
      const ariesAspects = jaimini.rashiDrishti.find((r) => r.signName === 'Aries')!;
      expect(ariesAspects.signType).toBe('Moveable');
      // Aries (Moveable) aspects Leo, Scorpio, Aquarius (Fixed, excluding Taurus adjacent)
      expect(ariesAspects.aspectsSigns).toContain('Leo');
      expect(ariesAspects.aspectsSigns).toContain('Scorpio');
      expect(ariesAspects.aspectsSigns).toContain('Aquarius');
      expect(ariesAspects.aspectsSigns).not.toContain('Taurus');
    });
  });

  // ── PART 4: KP ENGINE ─────────────────────────────────────────────────────
  describe('KPEngine — Stellar Sub-Lords & Safe Availability Gate', () => {
    it('deterministically resolves Star Lord and Sub-Lord for any sidereal coordinate', () => {
      // 0° Aries: Ashwini nakshatra (Ketu star lord), Ketu sub-lord
      const res0 = KPEngine.resolveStarAndSubLord(0.1);
      expect(res0.starLord).toBe('Ketu');
      expect(res0.subLord).toBe('Ketu');

      // 120° Leo: Magha nakshatra (Ketu star lord)
      const resLeo = KPEngine.resolveStarAndSubLord(120.5);
      expect(resLeo.starLord).toBe('Ketu');
      expect(resLeo.subLord).toBeDefined();
    });

    it('calculates full KP analysis when birth time is exact', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const kp = KPEngine.calculateKP(factSet.planets, factSet.ascendant);

      expect(kp.status).toBe('AVAILABLE');
      expect(kp.planets.length).toBe(9);
      expect(kp.cusps.length).toBe(12);
      for (const p of kp.planets) {
        expect(p.starLord).toBeDefined();
        expect(p.subLord).toBeDefined();
      }
    });

    it('safely returns KP_NOT_AVAILABLE when birth time is approximate', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const kp = KPEngine.calculateKP(factSet.planets, factSet.ascendant, { isApproximateTime: true });

      expect(kp.status).toBe('KP_NOT_AVAILABLE');
      expect(kp.reason).toContain('requires precise birth time');
      expect(kp.planets.length).toBe(0);
    });
  });

  // ── PART 5: NUMEROLOGY ENHANCEMENT & FUSION ───────────────────────────────
  describe('NumerologyEngine & Correlation — Personal Cycles & Fusion', () => {
    it('computes personalMonth and personalDay alongside core vibrational numbers', () => {
      const num = calculateNumerology('Siddharth Rao', 21, 9, 1991);

      expect(num.birthNumber).toBe(3); // 2+1 = 3
      expect(num.lifePathNumber).toBeDefined();
      expect(num.personalYear).toBeGreaterThanOrEqual(1);
      expect(num.personalYear).toBeLessThanOrEqual(9);
      expect(num.personalMonth).toBeGreaterThanOrEqual(1);
      expect(num.personalMonth).toBeLessThanOrEqual(9);
      expect(num.personalDay).toBeGreaterThanOrEqual(1);
      expect(num.personalDay).toBeLessThanOrEqual(9);
    });

    it('fuses Vedic themes with Numerology without claiming causation', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, 'test_user');
      const num = calculateNumerology('Siddharth Rao', 21, 9, 1991);

      const correlation = NumerologyCorrelationEngine.correlate(snapshot, num, 'Jupiter');

      expect(correlation.vedicTheme).toContain('Lagna');
      expect(correlation.numerologyTheme).toContain('Personal Year');
      expect(['STRONGLY_ALIGNED', 'COMPLEMENTARY', 'NUANCED_TENSION']).toContain(correlation.correlationType);
      expect(correlation.synthesis).toBeDefined();
    });
  });

  // ── PART 6: WORLD RESEARCH AGENT (CONSENT GATED) ───────────────────────────
  describe('WorldResearchAgent — Explicit User Consent & Safety Safeguards', () => {
    it('returns CONSENT_DENIED when allowPublicResearch is false', () => {
      const res = WorldResearchAgent.executePublicResearch('AI Industry Trends', { allowPublicResearch: false });
      expect(res.allowed).toBe(false);
      expect(res.status).toBe('CONSENT_DENIED');
      expect(res.claims.length).toBe(0);
    });

    it('executes public research with full provenance when allowPublicResearch is true', () => {
      const res = WorldResearchAgent.executePublicResearch('AI Industry Trends', { allowPublicResearch: true });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe('RESEARCH_COMPLETED');
      expect(res.claims.length).toBeGreaterThan(0);
      expect(res.claims[0].category).toBe('WORLD_FACT');
      expect(res.claims[0].publisher).toBeDefined();
    });

    it('refuses sensitive or surveillance search terms safely', () => {
      const res = WorldResearchAgent.executePublicResearch('investigate private ssn and background', {
        allowPublicResearch: true,
      });
      expect(res.allowed).toBe(false);
      expect(res.status).toBe('FAILED_SAFELY');
    });
  });

  // ── PART 7: CONTRADICTION ENGINE ──────────────────────────────────────────
  describe('ContradictionEngine — Multi-System Nuance Detection', () => {
    it('detects and articulates tension when Dasha is Benefic but Transit is Obstacle', () => {
      const contradictions = ContradictionEngine.evaluateContradictions({
        vedicTheme: 'Dynamic leadership initiative',
        dashaStatus: 'BENEFIC',
        transitStatus: 'OBSTACLE',
        numerologyTheme: 'Personal Year 1 new beginnings',
      });

      const dashaTransit = contradictions.find((c) => c.dimension === 'DASHA_VS_TRANSIT')!;
      expect(dashaTransit.status).toBe('CONFLICT');
      expect(dashaTransit.explanation).toContain('internal psychological capacity');
      expect(dashaTransit.synthesizedGuidance).toBeDefined();
    });
  });

  // ── PART 8: DECISION SIMULATION ENGINE ────────────────────────────────────
  describe('DecisionSimulationEngine — Counterfactual Scenario Comparison', () => {
    it('simulates Option A vs Option B with balanced factors and zero fatalism', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, 'sim_user');

      const sim = DecisionSimulationEngine.simulateDecision(
        'Should I stay at corporate tech job or launch AI startup?',
        snapshot,
        { name: 'Stay at Tech Job', description: 'Maintain current role with promotion trajectory.' },
        { name: 'Launch AI Startup', description: 'Bootstrap enterprise AI advisory firm.' }
      );

      expect(sim.optionA.supportingAstrologicalFactors.length).toBeGreaterThan(0);
      expect(sim.optionB.supportingAstrologicalFactors.length).toBeGreaterThan(0);
      expect(sim.comparativeSynthesis).not.toContain('guaranteed');
      expect(sim.uncertainties.length).toBeGreaterThan(0);
      expect(sim.disclaimer).toContain('does not constitute financial');
    });
  });

  // ── PART 9: LIFE REPLAY & PATTERN DISCOVERY ────────────────────────────────
  describe('LifeReplayEngine — Historical Timeline Correlation', () => {
    it('overlays historical milestones with Dasha periods and labels them OBSERVED_CORRELATION', () => {
      const factSet = VedicAstroEngine.createAstrologyFactSet(testNative);
      const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, 'replay_user');

      const dummyEvents = [
        {
          id: 'ev_1',
          userId: 'replay_user',
          eventDate: '2018-05-10',
          eventType: 'CAREER_CHANGE',
          title: 'Promoted to Senior Engineer',
          userConfirmation: 'CONFIRMED' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          astrologicalCorrelations: {
            activeMahadasha: 'Jupiter',
            activeAntardasha: 'Mars',
          },
        },
      ];

      const replay = LifeReplayEngine.replayLifeTimeline(dummyEvents, snapshot);

      expect(replay.totalMilestonesAnalyzed).toBe(1);
      expect(replay.correlations[0].provenanceLabel).toBe('OBSERVED_CORRELATION');
      expect(replay.recurringCycles.length).toBeGreaterThanOrEqual(2);
      expect(replay.methodologyNote).toContain('never presented as proven causation');
    });
  });

  // ── PART 10: RELOCATION ANALYSIS ENGINE ───────────────────────────────────
  describe('RelocationAnalysisEngine — Natal Root Preservation & Local Horizon', () => {
    it('compares natal chart with relocated destination without altering natal coordinates', () => {
      const relocation = RelocationAnalysisEngine.compareRelocation(
        testNative,
        'London, UK',
        51.5074,
        -0.1278,
        0
      );

      expect(relocation.birthLocation.city).toBe(testNative.birthPlace);
      expect(relocation.relocatedLocation.city).toBe('London, UK');
      expect(relocation.houseShifts.length).toBe(9);
      expect(relocation.astrologicalGuidance).toContain('natal chart as your fundamental karmic blueprint');
    });
  });

  // ── PART 11: DEEPASTRO BRAIN MASTER ORCHESTRATION & API ENDPOINTS ─────────
  describe('DeepAstroBrain Master Orchestration & Live API Routes', () => {
    it('returns status and supported systems via GET /api/brain/status', async () => {
      const res = await request(app).get('/api/brain/status');
      expect(res.status).toBe(200);
      expect(res.body.brainVersion).toBe('2.0.0-omni');
      expect(res.body.systemsSupported).toContain('JAIMINI');
      expect(res.body.systemsSupported).toContain('KP');
    });

    it('orchestrates complete omni-source intelligence analysis via POST /api/brain/analyze', async () => {
      const res = await request(app)
        .post('/api/brain/analyze')
        .send({
          question: 'What are the major career and business developments indicated for me over the next 2 years?',
          birthProfile: testNative,
          allowPublicResearch: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const brain = res.body.brainResponse;
      expect(brain.calculationFingerprint).toBeDefined();
      expect(brain.systemsConsulted.vedic.lagna).toBeDefined();
      expect(brain.systemsConsulted.jaimini?.atmakaraka).toBeDefined();
      expect(brain.systemsConsulted.numerology?.lifePath).toBe(5);
      expect(brain.structuredReading.directAnswer).toBeDefined();
      expect(brain.structuredReading.supportingFactors.length).toBeGreaterThan(0);
      expect(brain.structuredReading.whyThisReading.rulesApplied).toBeDefined();
    });

    it('simulates counterfactual decision via POST /api/brain/decision', async () => {
      const res = await request(app)
        .post('/api/brain/decision')
        .send({
          question: 'Should I relocate to London or stay in Bengaluru?',
          birthProfile: testNative,
          scenarioA: { name: 'Stay in Bengaluru', description: 'Continue tech lead role locally.' },
          scenarioB: { name: 'Relocate to London', description: 'Accept international transfer.' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.simulation.optionA.name).toBe('Stay in Bengaluru');
      expect(res.body.simulation.optionB.name).toBe('Relocate to London');
      expect(res.body.simulation.comparativeSynthesis).toBeDefined();
    });

    it('analyzes standalone numerology via POST /api/brain/numerology/analyze', async () => {
      const res = await request(app)
        .post('/api/brain/numerology/analyze')
        .send({
          name: 'Siddharth Rao',
          birthDate: '1991-09-21',
        });

      expect(res.status).toBe(200);
      expect(res.body.numerology.birthNumber).toBe(3);
      expect(res.body.numerology.personalMonth).toBeDefined();
      expect(res.body.numerology.personalDay).toBeDefined();
    });
  });
});
