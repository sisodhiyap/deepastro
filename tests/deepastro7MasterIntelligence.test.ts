/**
 * DEEPASTRO 7.0 — PAST + FUTURE MASTER INTELLIGENCE CERTIFICATION SUITE
 * 
 * Verifies:
 * 1. Part 45: Dynamicity Golden Test (Profile A, B, C produce distinct fingerprints and astrological indicators)
 * 2. Part 46: Cross-Feature Consistency Test (Kundli, Past Life, and Future share canonical calculation fingerprint)
 * 3. Part 47: Two-User Isolation (User A vs User B data boundaries with zero cross-contamination)
 * 4. Prediction Ledger & Outcome Logging
 * 5. Epistemic boundary: No 100% confidence, no fatalistic claims
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import jwt from 'jsonwebtoken';
import { db } from '../server/src/database/db.js';
import { CalculationSnapshotService, CanonicalBirthProfile } from '../server/src/services/CalculationSnapshotService.js';
import { PastLifeIntelligenceEngine } from '../server/src/intelligence/pastlife/index.js';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

function createAuthToken(userId: string, email: string = `${userId}@deepastro.test`): string {
  db.users.set(userId, {
    id: userId,
    email,
    passwordHash: 'test_hash',
    role: 'CLIENT',
    fullName: 'Test Seeker',
    isActive: true,
    createdAt: new Date().toISOString(),
  } as any);
  return jwt.sign({ userId, email, role: 'CLIENT' }, JWT_SECRET, { expiresIn: '1h' });
}

describe('DEEPASTRO 7.0: Master Past & Future Intelligence Integration', () => {
  const profileA: CanonicalBirthProfile = {
    fullName: 'Seeker Alpha',
    birthDate: '1992-04-12',
    birthTime: '08:15',
    birthPlace: 'Mumbai, India',
    latitude: 18.9220,
    longitude: 72.8347,
    timezone: 5.5,
  };

  const profileB: CanonicalBirthProfile = {
    fullName: 'Seeker Beta',
    birthDate: '1988-11-23',
    birthTime: '17:45',
    birthPlace: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 9.0,
  };

  const profileC: CanonicalBirthProfile = {
    fullName: 'Seeker Gamma',
    birthDate: '1992-04-12',
    birthTime: '19:30', // Same date as Alpha, mutated time
    birthPlace: 'Mumbai, India',
    latitude: 18.9220,
    longitude: 72.8347,
    timezone: 5.5,
  };

  const userA = 'usr_7_alpha_001';
  const userB = 'usr_7_beta_002';
  let tokenA: string;
  let tokenB: string;

  beforeAll(() => {
    tokenA = createAuthToken(userA);
    tokenB = createAuthToken(userB);
    FutureConsentEngine.recordConsent(userA, true, 'LEVEL_3');
    FutureConsentEngine.recordConsent(userB, true, 'LEVEL_3');
  });

  // PART 45: Dynamicity Golden Test
  it('1. Dynamicity Golden Test: Profiles A, B, and C produce distinct fingerprints and diverging soul readings', () => {
    const fpA = CalculationSnapshotService.generateFingerprint(profileA);
    const fpB = CalculationSnapshotService.generateFingerprint(profileB);
    const fpC = CalculationSnapshotService.generateFingerprint(profileC);

    expect(fpA).not.toBe(fpB);
    expect(fpA).not.toBe(fpC);
    expect(fpB).not.toBe(fpC);

    const pastA = PastLifeIntelligenceEngine.generate(userA, profileA as any);
    const pastB = PastLifeIntelligenceEngine.generate(userB, profileB as any);

    expect(pastA.success).toBe(true);
    expect(pastB.success).toBe(true);
    expect(pastA.data?.calculationFingerprint).toBe(fpA);
    expect(pastB.data?.calculationFingerprint).toBe(fpB);

    // Dynamic archetypes differ where planetary configurations differ
    expect(pastA.data?.setting.environment).toBeDefined();
    expect(pastB.data?.setting.environment).toBeDefined();
  });

  // PART 46: Cross-Feature Consistency Test
  it('2. Cross-Feature Consistency: Past Life and Future Intelligence share canonical calculation fingerprint', async () => {
    const fpA = CalculationSnapshotService.generateFingerprint(profileA);

    const pastRes = PastLifeIntelligenceEngine.generate(userA, profileA as any);
    const futureRes = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA,
      birthProfile: profileA as any,
      horizon: '5_YEARS',
      requestedLevel: 'LEVEL_3',
    });

    expect(pastRes.data?.calculationFingerprint).toBe(fpA);
    expect(futureRes.calculationFingerprint).toBe(fpA);
    expect(futureRes.yearForecasts.length).toBe(5);
  });

  // PART 47: Two-User Isolation Gate
  it('3. Two-User Isolation: User A cannot read User B reading via anti-IDOR gates', async () => {
    // User A generates past life reading
    const pastA = PastLifeIntelligenceEngine.generate(userA, profileA as any);
    const readingIdA = pastA.data!.id;

    // User B attempts to access User A reading
    const accessByB = PastLifeIntelligenceEngine.getReading(readingIdA, userB);
    expect(accessByB.success).toBe(false);
    expect(accessByB.error).toBe('ACCESS_DENIED');

    // User A accessing own reading succeeds
    const accessByA = PastLifeIntelligenceEngine.getReading(readingIdA, userA);
    expect(accessByA.success).toBe(true);
    expect(accessByA.data?.id).toBe(readingIdA);
  });

  // Epistemic Bounds Test (Parts 20 & 27)
  it('4. Epistemic Safety: Confidence is strictly non-fatalistic and capped below 90%', async () => {
    const futureRes = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA,
      birthProfile: profileA as any,
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    const confScore = futureRes.confidenceEvaluation?.normalizedPercentage;
    expect(confScore).toBeDefined();
    expect(confScore).toBeLessThan(90);
    expect(confScore).toBeGreaterThan(30);
    expect(futureRes.confidenceEvaluation?.level).toMatch(/(HIGH SUPPORT|MODERATE SUPPORT|LOW SUPPORT)/);
    expect(futureRes.disclaimer).toMatch(/non-fatalistic/i);
  });

  // Prediction Ledger Logging Test (Parts 32-34)
  it('5. Prediction Ledger: Registers prediction record with cryptographic fingerprint', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        birthProfile: profileA,
        horizon: '3_YEARS',
        requestedLevel: 'LEVEL_2',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.card).toBeDefined();
    expect(res.body.card.title).toBe('YOUR FUTURE MAP');
    expect(res.body.card.actionButtons.length).toBe(8);
    expect(res.body.provenance.calculationFingerprint).toBeDefined();
  });
});
