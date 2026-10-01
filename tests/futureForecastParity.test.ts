import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import futureIntelligenceRoutes from '../server/src/routes/futureIntelligenceRoutes.js';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { futureIntelligenceRepository } from '../server/src/database/repositories/FutureIntelligenceRepository.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — CROSS-LAYER PARITY', () => {
  const testUserId = 'usr_test_parity_001';
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Attach test user context
    app.use((req, _res, next) => {
      (req as any).user = { userId: testUserId, role: 'USER', email: 'parity@deepastro.com' };
      next();
    });
    app.use('/api/future-intelligence', futureIntelligenceRoutes);

    db.birthProfiles.set(testUserId, {
      id: 'prof_test_parity_1',
      userId: testUserId,
      fullName: 'Kavita Verma',
      birthDate: '1991-07-20',
      birthTime: '05:40',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Verifies exact parity between Engine -> API -> Repository records', async () => {
    // 1. Direct Engine invocation
    const engineResult = await FutureIntelligenceEngine.generateForecast({
      userId: testUserId,
      chartId: 'primary',
      years: 3,
      forceRecalculate: true,
    });

    // 2. Repository inspection
    const repoResult = await futureIntelligenceRepository.getForecastById(engineResult.forecastId);
    expect(repoResult.forecast).not.toBeNull();
    expect(repoResult.forecast?.calculationFingerprint).toBe(engineResult.calculationFingerprint);
    expect(repoResult.forecast?.predictionVersion).toBe(engineResult.predictionVersion);
    expect(repoResult.years.length).toBe(3);

    // 3. API retrieval
    const apiRes = await request(app)
      .get(`/api/future-intelligence/${engineResult.forecastId}`)
      .expect(200);

    expect(apiRes.body.success).toBe(true);
    const apiForecast = apiRes.body.data;

    // Check strict cross-layer parity
    expect(apiForecast.forecastId).toBe(engineResult.forecastId);
    expect(apiForecast.calculationFingerprint).toBe(engineResult.calculationFingerprint);
    expect(apiForecast.predictionVersion).toBe(engineResult.predictionVersion);
    expect(apiForecast.currentPeriod.mahadasha).toBe(engineResult.currentPeriod.mahadasha);
    expect(apiForecast.currentPeriod.antardasha).toBe(engineResult.currentPeriod.antardasha);

    for (let i = 0; i < 3; i++) {
      expect(apiForecast.years[i].year).toBe(engineResult.years[i].year);
      expect(apiForecast.years[i].overallTheme).toBe(engineResult.years[i].overallTheme);
      expect(apiForecast.years[i].signalStrength).toBe(engineResult.years[i].signalStrength);
    }
  });

  it('2. Year-level endpoint returns matching month-by-month analysis', async () => {
    const postRes = await request(app)
      .post('/api/future-intelligence/generate')
      .send({ years: 3 })
      .expect(200);

    const forecastId = postRes.body.forecastId;
    const targetYear = postRes.body.years[0].year;

    const yearRes = await request(app)
      .get(`/api/future-intelligence/${forecastId}/year/${targetYear}`)
      .expect(200);

    expect(yearRes.body.success).toBe(true);
    expect(yearRes.body.year).toBe(targetYear);
    expect(yearRes.body.months.length).toBe(12);
    expect(yearRes.body.months[0].monthName).toBe('January');
    expect(yearRes.body.months[11].monthName).toBe('December');
  });
});
