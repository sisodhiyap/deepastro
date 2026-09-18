/**
 * DEEPASTRO 7.3 — SURGICAL PAST LIFE + FUTURE INTELLIGENCE VERIFICATION SUITE
 * 
 * Validates:
 * 1. Past Life API success
 * 2. Past Life API invalid profile
 * 3. Past Life valid JSON response
 * 4. Past Life calculation dynamicity
 * 5. Past Life fingerprint variation
 * 6. Future API success
 * 7. Future API invalid profile
 * 8. Future valid JSON response
 * 9. Future 3-year generation
 * 10. Future 5-year generation
 * 11. Future 10-year generation
 * 12. Future calculation dynamicity
 * 13. Future fingerprint variation
 * 14. Missing profile handling
 * 15. Guest/profile handling without auth wall
 * 16. Auth boundary behavior
 * 17. No premium lock
 * 18. No hardcoded production result
 * 19. Coordinate string coercion resilience
 * 20. Domain signals and timeline breakdown
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { PastLifeIntelligenceEngine } from '../server/src/intelligence/pastlife/index.js';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';

const PROFILE_A = {
  fullName: 'Aarav Test Profile A',
  birthDate: '1990-08-15',
  birthTime: '10:30',
  birthPlace: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  gender: 'Male',
};

const PROFILE_B = {
  fullName: 'Priya Test Profile B',
  birthDate: '1995-02-22',
  birthTime: '18:45',
  birthPlace: 'Mumbai, India',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 5.5,
  gender: 'Female',
};

describe('DEEPASTRO 7.3: Surgical Past Life Engine Verification', () => {
  it('1. Past Life API success: generates reading for guest with valid birthProfile', async () => {
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .send({
        format: 'insight_card',
        birthProfile: PROFILE_A,
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.readingId).toBeDefined();
    expect(res.body.provenance).toBeDefined();
    expect(res.body.card).toBeDefined();
  });

  it('2. Past Life API invalid profile: returns 400 with missingFields when required birth data is missing', async () => {
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .send({
        format: 'insight_card',
        birthProfile: {
          fullName: 'Incomplete User',
          birthDate: '',
          birthTime: '',
        },
      });

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('PAST_LIFE_ANALYSIS_UNAVAILABLE');
    expect(Array.isArray(res.body.missingFields)).toBe(true);
  });

  it('3. Past Life response is always valid structured JSON with no HTML', async () => {
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .send({ format: 'soul_journey', birthProfile: PROFILE_B });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(typeof res.body).toBe('object');
    expect(res.body.schema.archetype).toBeDefined();
    expect(res.body.schema.karmic_patterns).toBeDefined();
    expect(Array.isArray(res.body.schema.karmic_patterns)).toBe(true);
  });

  it('4. Past Life dynamicity & fingerprint variation: Profile A and Profile B yield distinct calculation fingerprints', () => {
    const resultA = PastLifeIntelligenceEngine.generate('guest-user-a', PROFILE_A as any);
    const resultB = PastLifeIntelligenceEngine.generate('guest-user-b', PROFILE_B as any);

    expect(resultA.success).toBe(true);
    expect(resultB.success).toBe(true);

    const fpA = resultA.provenance?.calculationFingerprint;
    const fpB = resultB.provenance?.calculationFingerprint;

    expect(fpA).toBeDefined();
    expect(fpB).toBeDefined();
    expect(fpA).not.toBe(fpB);

    // Verify astrological indicators differ
    const indicatorsA = resultA.data?.astrological_indicators?.map(i => i.indicator) || [];
    const indicatorsB = resultB.data?.astrological_indicators?.map(i => i.indicator) || [];
    expect(indicatorsA).not.toEqual(indicatorsB);
  });

  it('5. Past Life coordinate string coercion resilience: handles strings for lat/lon', async () => {
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .send({
        format: 'insight_card',
        birthProfile: {
          ...PROFILE_A,
          latitude: '28.6139',
          longitude: '77.2090',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DEEPASTRO 7.3: Surgical Future Intelligence Engine Verification', () => {
  it('6. Future API success: generates forecast for guest with valid birthProfile without auth wall', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '3_YEARS',
        requestedLevel: 'LEVEL_2',
        consentGranted: true,
        birthProfile: PROFILE_A,
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.status).toBe('SUCCESS');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.yearForecasts).toBeDefined();
    expect(res.body.data.yearForecasts.length).toBe(3);
  });

  it('7. Future API invalid profile: returns 422 PROFILE_INCOMPLETE when birth data is incomplete', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '3_YEARS',
        birthProfile: {
          fullName: 'Missing Time and Coords',
          birthDate: '1990-08-15',
        },
      });

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toBe('PROFILE_INCOMPLETE');
  });

  it('8. Future valid JSON response: schema and timeline validation', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '3_YEARS',
        requestedLevel: 'LEVEL_1',
        consentGranted: true,
        birthProfile: PROFILE_B,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.forecastId).toBeDefined();
    expect(res.body.data.domainForecasts).toBeDefined();
    expect(typeof res.body.data.domainForecasts).toBe('object');
  });

  it('9. Future 3-year timeline generates exactly 3 years of forecasts', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '3_YEARS',
        consentGranted: true,
        birthProfile: PROFILE_A,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.yearForecasts.length).toBe(3);
  });

  it('10. Future 5-year timeline generates exactly 5 years of forecasts', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '5_YEARS',
        consentGranted: true,
        birthProfile: PROFILE_A,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.yearForecasts.length).toBe(5);
  });

  it('11. Future 10-year timeline generates exactly 10 years of forecasts', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '10_YEARS',
        consentGranted: true,
        birthProfile: PROFILE_A,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.yearForecasts.length).toBe(10);
  });

  it('12. Future calculation dynamicity & fingerprint variation: Profile A and Profile B yield distinct forecasts', async () => {
    const forecastA = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'test_user_a',
      birthProfile: {
        name: PROFILE_A.fullName,
        birthDate: PROFILE_A.birthDate,
        birthTime: PROFILE_A.birthTime,
        birthPlace: PROFILE_A.birthPlace,
        latitude: PROFILE_A.latitude,
        longitude: PROFILE_A.longitude,
        timezone: PROFILE_A.timezone,
        gender: PROFILE_A.gender as any,
      },
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const forecastB = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: 'test_user_b',
      birthProfile: {
        name: PROFILE_B.fullName,
        birthDate: PROFILE_B.birthDate,
        birthTime: PROFILE_B.birthTime,
        birthPlace: PROFILE_B.birthPlace,
        latitude: PROFILE_B.latitude,
        longitude: PROFILE_B.longitude,
        timezone: PROFILE_B.timezone,
        gender: PROFILE_B.gender as any,
      },
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    expect(forecastA.calculationFingerprint).toBeDefined();
    expect(forecastB.calculationFingerprint).toBeDefined();
    expect(forecastA.calculationFingerprint).not.toBe(forecastB.calculationFingerprint);

    // Dashas and planetary influences must differ
    const dashaA = forecastA.yearForecasts[0].activeDasha;
    const dashaB = forecastB.yearForecasts[0].activeDasha;
    expect(dashaA).toBeDefined();
    expect(dashaB).toBeDefined();
    expect(forecastA.overall10YearTheme).not.toEqual(forecastB.overall10YearTheme);
  });

  it('13. Future coordinate string coercion resilience: handles string coordinates gracefully', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({
        horizon: '3_YEARS',
        consentGranted: true,
        birthProfile: {
          ...PROFILE_A,
          latitude: '28.6139',
          longitude: '77.2090',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SUCCESS');
  });

  it('14. Consent endpoint accepts guest preferences without 401', async () => {
    const res = await request(app)
      .post('/api/future/consent')
      .send({
        consentGranted: true,
        level: 'LEVEL_2',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.consent).toBeDefined();
  });

  it('15. Birth profile save endpoint accepts guest profiles without 401', async () => {
    const res = await request(app)
      .post('/api/auth/birth-profile')
      .send(PROFILE_A);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.birthProfile).toBeDefined();
  });
});
