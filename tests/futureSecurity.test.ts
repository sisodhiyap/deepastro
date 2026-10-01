import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import futureIntelligenceRoutes from '../server/src/routes/futureIntelligenceRoutes.js';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — SECURITY, PRIVACY & ACCESS CONTROL', () => {
  const userA = 'usr_sec_alice_101';
  const userB = 'usr_sec_bob_202';
  let app: express.Express;
  let activeUserId: string;

  beforeEach(() => {
    activeUserId = userA;
    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      (req as any).user = { userId: activeUserId, role: 'USER', email: `${activeUserId}@deepastro.com` };
      next();
    });
    app.use('/api/future-intelligence', futureIntelligenceRoutes);

    db.birthProfiles.set(userA, {
      id: 'prof_alice',
      userId: userA,
      fullName: 'Alice Walker',
      birthDate: '1990-03-21',
      birthTime: '10:00',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });

    db.birthProfiles.set(userB, {
      id: 'prof_bob',
      userId: userB,
      fullName: 'Bob Martinez',
      birthDate: '1987-11-12',
      birthTime: '15:20',
      birthPlace: 'Madrid, Spain',
      latitude: 40.4168,
      longitude: -3.7038,
      timezone: 1,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Privacy isolation: User B cannot access User A forecast (Anti-IDOR)', async () => {
    // 1. Generate forecast as User A
    const genRes = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
    });
    const forecastId = genRes.forecastId;

    // 2. Switch authenticated user context to User B
    activeUserId = userB;

    // 3. User B attempts to fetch User A's forecast
    const res = await request(app)
      .get(`/api/future-intelligence/${forecastId}`)
      .expect(403);

    expect(res.body.error).toBe('FORBIDDEN');
    expect(res.body.details).toContain('permission');
  });

  it('2. Missing chart returns 404 CHART_NOT_FOUND', async () => {
    activeUserId = 'usr_unknown_ghost';

    const res = await request(app)
      .post('/api/future-intelligence/generate')
      .send({ chartId: 'non_existent_chart_id' })
      .expect(404);

    expect(res.body.error).toBe('CHART_NOT_FOUND');
  });

  it('3. Invalidation test: Mutating chart details invalidates cached forecast', async () => {
    const res1 = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
    });

    // Mutate Alice's birth time (changes ascendant and calculation fingerprint)
    db.birthProfiles.set(userA, {
      id: 'prof_alice',
      userId: userA,
      fullName: 'Alice Walker',
      birthDate: '1990-03-21',
      birthTime: '18:30', // Altered birth time
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });

    const res2 = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      years: 3,
    });

    // Fingerprint must have changed; old cache is invalidated
    expect(res2.calculationFingerprint).not.toBe(res1.calculationFingerprint);
  });
});
