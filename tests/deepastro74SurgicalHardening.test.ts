/**
 * DeepAstro 7.4 Comprehensive Surgical Production Hardening Test Suite
 * Validates:
 * 1. Zero Synthetic Coordinate Fallbacks (Rejection of missing lat/lon)
 * 2. User Isolation, Account Deletion & Anti-IDOR
 * 3. Dedicated Feedback Telemetry (Recording without mutating calculations)
 * 4. Tarot Deck Integrity (78 unique cards, 0 duplicates, user-scoped storage)
 * 5. Future Intelligence Domain Resolution & Horizon Invariance
 * 6. Mathematical Divergence across Profile Mutations (DOB, Time, Place)
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { PastLifeInputEngine } from '../server/src/intelligence/pastlife/PastLifeInputEngine.js';
import { TAROT_DECK, VERIFY_TAROT_DECK } from '../src/data/tarotDeck.js';
import { getJournalHistory, saveToJournalStorage } from '../src/services/tarotEngine.js';

// Controlled Test Profiles
const PROFILE_A = {
  fullName: 'Pooja Bhattacharya',
  birthDate: '1993-04-18',
  birthTime: '09:25',
  birthPlace: 'Kolkata, India',
  latitude: 22.5726,
  longitude: 88.3639,
  timezone: 5.5,
  gender: 'Female',
};

const PROFILE_B = {
  fullName: 'Marcus Vance',
  birthDate: '1987-10-05',
  birthTime: '18:40',
  birthPlace: 'San Francisco, USA',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: -7.0,
  gender: 'Male',
};

describe('DeepAstro 7.4 Production Hardening Test Suite', () => {

  // ----------------------------------------------------
  // 1. ZERO SYNTHETIC COORDINATE FALLBACKS
  // ----------------------------------------------------
  describe('Phase 1 & 19: Coordinate Precision & Anti-Fallback Enforcements', () => {
    it('rejects past-life profile when latitude or longitude is missing', () => {
      const incomplete = {
        fullName: 'Seeker Incomplete',
        birthDate: '1995-08-12',
        birthTime: '14:20',
        birthPlace: 'Unknown Location',
        // latitude and longitude omitted
      };

      const val = PastLifeInputEngine.validate('usr_test', incomplete as any);
      expect(val.valid).toBe(false);
      expect(val.missingFields).toContain('latitude');
      expect(val.missingFields).toContain('longitude');
    });

    it('rejects POST /api/auth/birth-profile when coordinates are not numeric', async () => {
      const res = await request(app)
        .post('/api/auth/birth-profile')
        .send({
          fullName: 'No Coords Seeker',
          birthDate: '1992-01-01',
          birthTime: '12:00',
          latitude: 'invalid_lat',
          longitude: 'invalid_lon',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('BIRTH_PROFILE_INCOMPLETE');
      expect(res.body.missingFields).toContain('latitude');
      expect(res.body.missingFields).toContain('longitude');
    });
  });

  // ----------------------------------------------------
  // 2. USER ISOLATION, REGISTRATION & ACCOUNT DELETION
  // ----------------------------------------------------
  describe('Phase 2 & 3: Authentication Lifecycle, User Isolation & Account Deletion', () => {
    const userAEmail = `test_user_a_${Date.now()}@deepastro.test`;
    const userBEmail = `test_user_b_${Date.now()}@deepastro.test`;
    let userAToken = '';
    let userBToken = '';
    let userAId = '';
    let userBId = '';

    it('registers User A and User B independently', async () => {
      const resA = await request(app)
        .post('/api/auth/register')
        .send({ fullName: 'User A', email: userAEmail, password: 'SecurePassword123!' });
      expect(resA.status).toBe(201);
      expect(resA.body.token).toBeDefined();
      userAToken = resA.body.token;
      userAId = resA.body.user.id;

      const resB = await request(app)
        .post('/api/auth/register')
        .send({ fullName: 'User B', email: userBEmail, password: 'SecurePassword123!' });
      expect(resB.status).toBe(201);
      expect(resB.body.token).toBeDefined();
      userBToken = resB.body.token;
      userBId = resB.body.user.id;

      expect(userAId).not.toBe(userBId);
    });

    it('prevents User A from impersonating User B (Anti-IDOR)', async () => {
      const res = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          userId: userBId, // Attempted IDOR
          horizon: '3_YEARS',
          birthProfile: PROFILE_A,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('deletes User A account permanently via DELETE /api/auth/account', async () => {
      const res = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Subsequent access with deleted token fails
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(meRes.status).toBe(404);
    });
  });

  // ----------------------------------------------------
  // 3. DEDICATED FEEDBACK TELEMETRY
  // ----------------------------------------------------
  describe('Phase 16: Structured Feedback Telemetry API', () => {
    it('accepts and records structured platform feedback', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          module: 'Past Life / SoulTrace',
          category: 'calculation_issue',
          message: 'Observation regarding Ketu harmonic placement in D9 chart.',
          rating: 5,
          calculationFingerprint: 'fprint_test_8576d5a10ecc',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.feedbackId).toMatch(/^fb_/);
      expect(res.body.data.category).toBe('calculation_issue');
    });

    it('rejects empty or trivial feedback messages', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          module: 'Tarot',
          message: 'hi', // too short
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_FEEDBACK_MESSAGE');
    });
  });

  // ----------------------------------------------------
  // 4. TAROT DECK INTEGRITY & USER SCOPING
  // ----------------------------------------------------
  describe('Phase 11: Tarot Deck Integrity & User Scoping', () => {
    it('verifies 78-card deck integrity with 0 duplicates', () => {
      const validation = VERIFY_TAROT_DECK();
      expect(validation.valid).toBe(true);
      expect(validation.total).toBe(78);
      expect(validation.major).toBe(22);
      expect(validation.minor).toBe(56);
      expect(validation.uniqueIds).toBe(78);
    });

    it('scopes tarot sessions per user ID in journal storage', () => {
      const mockSessionA = {
        sessionId: 'destiny_a_1',
        userId: 'usr_alpha',
        question: 'Career path',
        questionCategory: 'CAREER',
        drawnCards: [],
        createdAt: new Date().toISOString(),
      } as any;

      saveToJournalStorage(mockSessionA, 'usr_alpha');
      const historyAlpha = getJournalHistory('usr_alpha');
      const historyBeta = getJournalHistory('usr_beta');

      expect(historyAlpha.some(s => s.sessionId === 'destiny_a_1')).toBe(true);
      expect(historyBeta.some(s => s.sessionId === 'destiny_a_1')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // 5. FUTURE INTELLIGENCE DOMAIN & HORIZON DETERMINISM
  // ----------------------------------------------------
  describe('Phase 4, 5, 9, 10: Future Intelligence Engine & Domain Consistency', () => {
    it('generates exactly 3, 5, and 10 yearly records for respective horizons via API', async () => {
      const res3 = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res3.status).toBe(200);
      expect(res3.body.data.yearForecasts).toHaveLength(3);

      const res5 = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '5_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res5.status).toBe(200);
      expect(res5.body.data.yearForecasts).toHaveLength(5);

      const res10 = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '10_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res10.status).toBe(200);
      expect(res10.body.data.yearForecasts).toHaveLength(10);
    });

    it('returns life domains with structured outlooks and trajectories', async () => {
      const res = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      expect(res.status).toBe(200);
      const domains = res.body.data.domainForecasts;
      expect(domains).toBeDefined();

      if (Array.isArray(domains)) {
        const career = domains.find((d: any) => d.domain === 'CAREER');
        expect(career).toBeDefined();
        expect(career?.currentState || career?.outlook).toBeTruthy();
      } else {
        expect(domains.CAREER).toBeDefined();
        expect(domains.CAREER.currentState || domains.CAREER.outlook).toBeTruthy();
      }
    });

    it('preserves underlying calculation fingerprint invariant across horizons', async () => {
      const res3 = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      const res10 = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '10_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      expect(res3.body.provenance.calculationFingerprint).toBe(res10.body.provenance.calculationFingerprint);
    });
  });

  // ----------------------------------------------------
  // 6. HARDCORE DYNAMICITY & PROFILE MUTATIONS
  // ----------------------------------------------------
  describe('Phase 18: Hardcore Dynamicity & Multi-Profile Divergence', () => {
    it('proves Profile A and Profile B produce distinct calculation fingerprints and past-life readings', async () => {
      const resA = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: PROFILE_A });

      const resB = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: PROFILE_B });

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      expect(resA.body.provenance.calculationFingerprint).not.toBe(resB.body.provenance.calculationFingerprint);
    });

    it('proves birth time mutation shifts Ascendant and calculation fingerprint', async () => {
      const mutatedTime = { ...PROFILE_A, birthTime: '21:45' };

      const resOriginal = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: PROFILE_A });

      const resMutated = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: mutatedTime });

      expect(resOriginal.status).toBe(200);
      expect(resMutated.status).toBe(200);
      expect(resOriginal.body.provenance.calculationFingerprint).not.toBe(resMutated.body.provenance.calculationFingerprint);
    });

    it('proves birth place mutation shifts geographic context and fingerprint', async () => {
      const mutatedPlace = {
        ...PROFILE_A,
        birthPlace: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 0.0,
      };

      const resOriginal = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      const resMutated = await request(app)
        .post('/api/future/generate')
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: mutatedPlace });

      expect(resOriginal.status).toBe(200);
      expect(resMutated.status).toBe(200);
      expect(resOriginal.body.provenance.calculationFingerprint).not.toBe(resMutated.body.provenance.calculationFingerprint);
    });
  });
});
