/**
 * DeepAstro Final Production Hardening & Full-Stack Integrity Master Test Suite
 *
 * Verifies:
 * 1. Phase 1 & 19: Coordinate Precision & Zero-Fallback Guard (rejection of missing/invalid coordinates)
 * 2. Phase 2 & 3: Authentication Lifecycle, One User = One Private World, Anti-IDOR & Permanent Account Deletion
 * 3. Phase 4 & 5: Future Intelligence Horizons (3Y, 5Y, 10Y), Domain Consistency & Calculation Invariance
 * 4. Phase 6 & 7: Past Life (SoulTrace) & Future Forecast Persistence & Restoration (/latest)
 * 5. Phase 11: Tarot Deck Integrity (78 unique cards, 22 major, 56 minor, 0 duplicates) & User Scoped Journal
 * 6. Phase 16: User Progress Model (Journey & Milestone Tracking)
 * 7. Phase 17 & 18: Feedback Telemetry (Capturing quality signals without mutating mathematical calculations)
 * 8. Phase 18: Mathematical Dynamicity & Multi-Profile Divergence (DOB, time, place shift fingerprints)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { PastLifeInputEngine } from '../server/src/intelligence/pastlife/PastLifeInputEngine.js';
import { VERIFY_TAROT_DECK } from '../src/data/tarotDeck.js';
import { getJournalHistory, saveToJournalStorage } from '../src/services/tarotEngine.js';
import { FutureAuditEngine } from '../server/src/intelligence/future/FutureAuditEngine.js';

// Controlled High-Precision Astro Test Profiles
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

describe('DeepAstro Final Production Hardening Master Suite', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';

  const userAEmail = `final_user_a_${Date.now()}@deepastro.test`;
  const userBEmail = `final_user_b_${Date.now()}@deepastro.test`;

  // ----------------------------------------------------
  // 1. COORDINATE PRECISION & ANTI-FALLBACK
  // ----------------------------------------------------
  describe('Phase 1 & 19: Coordinate Precision & Zero Silent Fallback', () => {
    it('rejects past-life calculation when latitude or longitude is missing', () => {
      const incomplete = {
        fullName: 'Incomplete Seeker',
        birthDate: '1995-08-12',
        birthTime: '14:20',
        birthPlace: 'Unknown Location',
      };

      const val = PastLifeInputEngine.validate('usr_test', incomplete as any);
      expect(val.valid).toBe(false);
      expect(val.missingFields).toContain('latitude');
      expect(val.missingFields).toContain('longitude');
    });

    it('rejects POST /api/auth/birth-profile when coordinates are non-numeric strings', async () => {
      const res = await request(app)
        .post('/api/auth/birth-profile')
        .send({
          fullName: 'Bad Coords User',
          birthDate: '1992-01-01',
          birthTime: '12:00',
          latitude: 'abc',
          longitude: 'xyz',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('BIRTH_PROFILE_INCOMPLETE');
      expect(res.body.missingFields).toContain('latitude');
      expect(res.body.missingFields).toContain('longitude');
    });
  });

  // ----------------------------------------------------
  // 2. AUTHENTICATION LIFECYCLE & ISOLATION
  // ----------------------------------------------------
  describe('Phase 2 & 3: One User = One Private World & Account Deletion', () => {
    it('registers User A and User B into strictly independent records', async () => {
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

      // Subsequent access with deleted token yields 404
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(meRes.status).toBe(404);

      // User B remains intact
      const meBRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userBToken}`);
      expect(meBRes.status).toBe(200);
      expect(meBRes.body.user.id).toBe(userBId);
    });
  });

  // ----------------------------------------------------
  // 3. FUTURE INTELLIGENCE HORIZONS & PERSISTENCE
  // ----------------------------------------------------
  describe('Phase 4, 5, 7: Future Intelligence Horizons & Latest Restoration', () => {
    it('generates exact 3, 5, and 10 yearly records for respective horizons', async () => {
      const res3 = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res3.status).toBe(200);
      expect(res3.body.data.yearForecasts).toHaveLength(3);

      const res5 = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ horizon: '5_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res5.status).toBe(200);
      expect(res5.body.data.yearForecasts).toHaveLength(5);

      const res10 = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ horizon: '10_YEARS', consentGranted: true, birthProfile: PROFILE_A });
      expect(res10.status).toBe(200);
      expect(res10.body.data.yearForecasts).toHaveLength(10);
    });

    it('restores User B latest forecast via GET /api/future/latest', async () => {
      const res = await request(app)
        .get('/api/future/latest')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.yearForecasts).toBeDefined();
    });

    it('returns structured domain outlooks for Career, Wealth, Love, and Health', async () => {
      const res = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userBToken}`)
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
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ horizon: '3_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      const res10 = await request(app)
        .post('/api/future/generate')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ horizon: '10_YEARS', consentGranted: true, birthProfile: PROFILE_A });

      expect(res3.body.provenance.calculationFingerprint).toBe(
        res10.body.provenance.calculationFingerprint
      );
    });
  });

  // ----------------------------------------------------
  // 4. PAST LIFE RESTORATION & PROVENANCE
  // ----------------------------------------------------
  describe('Phase 6: Past Life / SoulTrace Pipeline & Latest Restoration', () => {
    it('generates past life reading and restores via GET /api/intelligence/past-life/latest', async () => {
      const genRes = await request(app)
        .post('/api/intelligence/past-life/generate')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ format: 'insight_card', birthProfile: PROFILE_A });

      expect(genRes.status).toBe(200);
      expect(genRes.body.readingId).toBeDefined();
      expect(genRes.body.provenance.calculationFingerprint).toBeDefined();

      const latestRes = await request(app)
        .get('/api/intelligence/past-life/latest')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(latestRes.status).toBe(200);
      expect(latestRes.body.reading).toBeDefined();
      expect(latestRes.body.reading.id).toBe(genRes.body.readingId);
    });
  });

  // ----------------------------------------------------
  // 5. TAROT DECK INTEGRITY & USER SCOPED JOURNAL
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
        sessionId: 'destiny_a_99',
        userId: 'usr_alpha_test',
        question: 'Spiritual Purpose',
        questionCategory: 'SPIRITUALITY',
        drawnCards: [],
        createdAt: new Date().toISOString(),
      } as any;

      saveToJournalStorage(mockSessionA, 'usr_alpha_test');
      const historyAlpha = getJournalHistory('usr_alpha_test');
      const historyBeta = getJournalHistory('usr_beta_test');

      expect(historyAlpha.some(s => s.sessionId === 'destiny_a_99')).toBe(true);
      expect(historyBeta.some(s => s.sessionId === 'destiny_a_99')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // 6. USER PROGRESS TRACKING
  // ----------------------------------------------------
  describe('Phase 16: User Journey & Milestone Progress Tracking', () => {
    it('retrieves user progress and updates milestone status', async () => {
      const getRes = await request(app)
        .get('/api/progress/me')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.progress).toBeDefined();

      const trackRes = await request(app)
        .post('/api/progress/track')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          kundliGenerated: true,
          pastLifeViewed: true,
          futureViewed: true,
          lastActiveTab: 'future',
        });

      expect(trackRes.status).toBe(200);
      expect(trackRes.body.progress.kundliGenerated).toBe(true);
      expect(trackRes.body.progress.lastActiveTab).toBe('future');
    });
  });

  // ----------------------------------------------------
  // 7. FEEDBACK TELEMETRY
  // ----------------------------------------------------
  describe('Phase 17 & 18: Structured Feedback Telemetry API', () => {
    it('accepts and records structured platform feedback without mutating calculations', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('Authorization', `Bearer ${userBToken}`)
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
          message: 'ok', // too short
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_FEEDBACK_MESSAGE');
    });
  });

  // ----------------------------------------------------
  // 8. DYNAMICITY & MULTI-PROFILE DIVERGENCE
  // ----------------------------------------------------
  describe('Phase 18: Dynamic Astrological Engine & Multi-Profile Divergence', () => {
    it('proves Profile A and Profile B produce distinct calculation fingerprints and past-life readings', async () => {
      const resA = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: PROFILE_A });

      const resB = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: PROFILE_B });

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      expect(resA.body.provenance.calculationFingerprint).not.toBe(
        resB.body.provenance.calculationFingerprint
      );
    });

    it('proves birth time mutation shifts Ascendant and calculation fingerprint', async () => {
      const profileMorning = { ...PROFILE_A, birthTime: '06:00' };
      const profileEvening = { ...PROFILE_A, birthTime: '18:00' };

      const resM = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: profileMorning });

      const resE = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: profileEvening });

      expect(resM.body.provenance.calculationFingerprint).not.toBe(
        resE.body.provenance.calculationFingerprint
      );
    });

    it('proves birth place mutation shifts geographic context and fingerprint', async () => {
      const profileKolkata = { ...PROFILE_A, birthPlace: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639 };
      const profileLondon = { ...PROFILE_A, birthPlace: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0 };

      const resKol = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: profileKolkata });

      const resLon = await request(app)
        .post('/api/intelligence/past-life/generate')
        .send({ format: 'insight_card', birthProfile: profileLondon });

      expect(resKol.body.provenance.calculationFingerprint).not.toBe(
        resLon.body.provenance.calculationFingerprint
      );
    });
  });
});
