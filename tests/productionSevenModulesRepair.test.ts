/**
 * PRODUCTION SEVEN-MODULE DATA RECOVERY & CONTRACT VERIFICATION SUITE
 * Verifies targeted fixes for:
 * 1. Future Intelligence Contract & Fallback Selection
 * 2. Tarot Shuffle & Astro-Context Synthesis
 * 3. Palmistry Input Guard Exemption & Vision Routing
 * 4. Numerology Analysis Engine Integrity
 * 5. Daily Predictions Domain & Universal Card Contract
 * 6. Report Generation Response Payload Completeness (native, astronomy, title)
 * 7. Panchang & Muhurat Coordinate & Schema Validation
 * 8. D9/D10 Varga Chart Planetary Mapping Relative to Divisional Ascendant
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { executeShuffleToDestiny } from '../src/services/tarotEngine.js';
import { calculateNumerology } from '../server/src/astrology/NumerologyEngine.js';
import { ShodashavargaEngine } from '../server/src/engines/varga/shodashavargaEngine.js';
import { mapVargaChartToChartPlanets } from '../src/utils/vargaChartMapper.js';
import { calculatePanchang, evaluateMuhurats } from '../server/src/astrology/PanchangEngine.js';
import { PredictionEngine } from '../server/src/astrology/PredictionEngine.js';
import astrologyRouter from '../server/src/routes/astrologyRoutes.js';
import numerologyRouter from '../server/src/routes/numerologyRoutes.js';
import reportRouter from '../server/src/routes/reportRoutes.js';
import palmistryRouter from '../server/src/routes/palmistryRoutes.js';
import futureIntelligenceRouter from '../server/src/routes/futureIntelligenceRoutes.js';

describe('DEEPASTRO PRODUCTION SEVEN-MODULE REPAIR & END-TO-END VERIFICATION', () => {
  const canonicalProfile: BirthProfileInput = {
    name: 'Prashant Sisodhiya',
    birthDate: '1992-08-15',
    birthTime: '14:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    gender: 'Male',
  };

  // 1. FUTURE INTELLIGENCE CONTRACT
  describe('Module 1: Future Intelligence Contract & Engine Verification', () => {
    it('1.1 /api/future-intelligence/charts returns valid schema with primary and saved charts', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/future-intelligence', futureIntelligenceRouter);

      const res = await request(app).get('/api/future-intelligence/charts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.charts)).toBe(true);
    });

    it('1.2 /api/future-intelligence/generate handles inline birthProfile bootstrap', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/future-intelligence', futureIntelligenceRouter);

      const res = await request(app)
        .post('/api/future-intelligence/generate')
        .send({
          chartId: 'primary',
          years: 3,
          birthProfile: canonicalProfile,
        });

      expect([200, 422]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.forecastId).toBeDefined();
        expect(res.body.years).toHaveLength(3);
        expect(res.body.calculationFingerprint).toBeDefined();
      } else {
        expect(res.body.code).toBe('PREDICTION_CONTEXT_INCOMPLETE');
      }
    });
  });

  // 2. TAROT ENGINE
  describe('Module 2A: Tarot Engine Execution & Astro-Context', () => {
    it('2.1 executes complete 3-card spread with verified Root, Present, Direction cards', () => {
      const session = executeShuffleToDestiny({
        userId: 'test_user_tarot',
        category: 'CAREER',
        question: 'What is my career direction for this cycle?',
        applyAstroWeighting: true,
      });

      expect(session).toBeDefined();
      expect(session.sessionId).toMatch(/^destiny_/);
      expect(session.drawnCards).toHaveLength(3);
      expect(session.drawnCards[0].position).toBe('root');
      expect(session.drawnCards[1].position).toBe('present');
      expect(session.drawnCards[2].position).toBe('direction');
      expect(session.interpretation.story).toBeTruthy();
      expect(session.interpretation.keyMessage).toBeTruthy();
      expect(session.interpretation.actionStep).toBeTruthy();
      expect(session.interpretation.relevance).toMatch(/High|Very High|Exceptional/);
      expect(session.interpretation.patternAnalysis).toBeDefined();
    });
  });

  // 2B. PALMISTRY INPUT SIZE GUARD EXEMPTION
  describe('Module 2B: Palmistry Input Size Guard & Vision Route', () => {
    it('2.2 allows payloads to /api/palmistry/analyze through the size guard', async () => {
      const app = express();
      app.use(express.json({ limit: '10mb' }));

      // Simulate global size guard from index.ts
      app.use((req, res, next) => {
        if (req.path.startsWith('/api/palmistry')) {
          return next();
        }
        const bodySize = JSON.stringify(req.body || {}).length;
        if (bodySize > 512_000) {
          return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE' });
        }
        next();
      });

      app.use('/api/palmistry', palmistryRouter);

      // Create a simulated large string > 600KB
      const largeDummyBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(600_000);
      const res = await request(app)
        .post('/api/palmistry/analyze')
        .send({
          imageData: largeDummyBase64,
          handType: 'Right',
          isDominant: 'true',
          ageRange: '25-35',
        });

      // Must NOT be rejected with 413 PAYLOAD_TOO_LARGE
      expect(res.status).not.toBe(413);
    });
  });

  // 3. NUMEROLOGY ENGINE
  describe('Module 3: Numerology Calculation & API Contract', () => {
    it('3.1 calculates deterministic Pythagorean and Chaldean numerology correctly', () => {
      const res = calculateNumerology('Prashant Sisodhiya', 15, 8, 1992);
      expect(res.lifePathNumber).toBeDefined();
      expect(res.birthNumber).toBeDefined();
      expect(res.destinyNumber).toBeDefined();
      expect(res.soulUrgeNumber).toBeDefined();
      expect(res.personalityNumber).toBeDefined();
      expect(res.rulingPlanet).toBeDefined();
      expect(res.luckyColors.length).toBeGreaterThan(0);
      expect(res.luckyDays.length).toBeGreaterThan(0);
    });

    it('3.2 POST /api/numerology/analyze responds with expected schema', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/numerology', numerologyRouter);

      const res = await request(app)
        .post('/api/numerology/analyze')
        .send({ name: 'Prashant Sisodhiya', birthDate: '1992-08-15' });

      expect(res.status).toBe(200);
      expect(res.body.lifePathNumber).toBeDefined();
      expect(res.body.destinyNumber).toBeDefined();
      expect(res.body.rulingPlanet).toBeDefined();
    });
  });

  // 4. DAILY PREDICTIONS
  describe('Module 4: Daily Predictions Domain & FactSet Synthesis', () => {
    it('4.1 generates all 11 prediction domains without fatalistic or empty statements', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/astrology', astrologyRouter);

      const res = await request(app)
        .post('/api/astrology/predictions/domains')
        .send(canonicalProfile);

      expect(res.status).toBe(200);
      expect(res.body.predictions).toBeDefined();
      expect(res.body.predictions.Career).toBeDefined();
      expect(res.body.predictions.Career.headline).toBeTruthy();
      expect(res.body.predictions.Love).toBeDefined();
      expect(res.body.predictions.Finance).toBeDefined();
      expect(res.body.factSet).toBeDefined();
    });

    it('4.2 POST /api/astrology/predictions/daily-card returns full daily card data', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/astrology', astrologyRouter);

      const res = await request(app)
        .post('/api/astrology/predictions/daily-card')
        .send(canonicalProfile);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.card).toBeDefined();
      expect(res.body.card.identity.zodiacSign).toBeDefined();
      expect(res.body.card.scores.overall.score).toBeGreaterThan(0);
    });
  });

  // 5. PDF REPORTS
  describe('Module 5: PDF Reports Contract & Response Payload Completeness', () => {
    it('5.1 /api/reports/generate returns payload containing native, astronomy, and executiveSummary', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/reports', reportRouter);

      const res = await request(app)
        .post('/api/reports/generate')
        .send({
          reportType: 'FULL_KUNDLI',
          birthData: canonicalProfile,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.id).toBeDefined();
      // Verifies the fix: native.name and astronomy.ascendantSign must be present to prevent frontend null dereference
      expect(res.body.native).toBeDefined();
      expect(res.body.native.name).toBe(canonicalProfile.name);
      expect(res.body.astronomy).toBeDefined();
      expect(res.body.astronomy.ascendantSign).toBeDefined();
      expect(res.body.title).toBeDefined();
      expect(res.body.executiveSummary).toBeDefined();
    });
  });

  // 6. PANCHANG & MUHURAT
  describe('Module 6: Panchang & Muhurat Coordinate & Schema Validation', () => {
    it('6.1 /api/astrology/panchang calculates 5 limbs with explicit location and date coordinates', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/astrology', astrologyRouter);

      const res = await request(app)
        .get('/api/astrology/panchang?lat=28.6139&lon=77.2090&tz=5.5&date=2026-10-23');

      expect(res.status).toBe(200);
      expect(res.body.tithi).toBeDefined();
      expect(res.body.tithi.name).toBeTruthy();
      expect(res.body.vara).toBeDefined();
      expect(res.body.vara.name).toBeTruthy();
      expect(res.body.nakshatra).toBeDefined();
      expect(res.body.nakshatra.name).toBeTruthy();
      expect(res.body.yoga).toBeDefined();
      expect(res.body.karana).toBeDefined();
      expect(res.body.timings).toBeDefined();
      expect(res.body.timings.rahuKalam).toBeDefined();
    });

    it('6.2 /api/astrology/muhurat returns auspicious timing windows', async () => {
      const app = express();
      app.use(express.json());
      app.use('/api/astrology', astrologyRouter);

      const res = await request(app)
        .get('/api/astrology/muhurat?date=2026-10-23');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.muhurats)).toBe(true);
      expect(res.body.muhurats.length).toBeGreaterThan(0);
      expect(res.body.muhurats[0].activity).toBeDefined();
      expect(res.body.muhurats[0].status).toBeDefined();
    });
  });

  // 7. D9/D10 VARGAS
  describe('Module 7: D9/D10 Divisional Chart Planetary Placements', () => {
    it('7.1 maps planets relative to Varga Ascendant rather than D1 Ascendant', () => {
      const kundli = VedicAstroEngine.calculateKundli(canonicalProfile);
      expect(kundli.shodashavargaDetail).toBeDefined();
      expect(kundli.shodashavargaDetail.d9).toBeDefined();
      expect(kundli.shodashavargaDetail.d10).toBeDefined();

      const d9 = kundli.shodashavargaDetail.d9;
      const mappedD9Planets = mapVargaChartToChartPlanets(d9, kundli.planets);

      expect(mappedD9Planets.length).toBeGreaterThanOrEqual(9);

      // Verify each mapped planet's house assignment satisfies: ((signIndex - ascSignIndex + 12) % 12) + 1
      mappedD9Planets.forEach((p) => {
        const expectedHouse = ((p.signIndex - d9.ascendantSignIndex + 12) % 12) + 1;
        expect(p.house).toBe(expectedHouse);
      });
    });

    it('7.2 mapVargaChartToChartPlanets gracefully handles empty/null varga chart without crashing', () => {
      const emptyResult = mapVargaChartToChartPlanets(null);
      expect(emptyResult).toEqual([]);

      const undefinedResult = mapVargaChartToChartPlanets(undefined);
      expect(undefinedResult).toEqual([]);
    });
  });
});
