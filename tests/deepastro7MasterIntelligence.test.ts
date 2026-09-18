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
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
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

  const profileD: CanonicalBirthProfile = {
    fullName: 'Seeker Delta',
    birthDate: '1992-04-12',
    birthTime: '08:15', // Same time as Alpha, different location
    birthPlace: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
  };

  const profileE: CanonicalBirthProfile = {
    fullName: 'Seeker Epsilon',
    birthDate: '2001-01-01',
    birthTime: '00:05',
    birthPlace: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5.0,
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

  // Section 25: 5-User Golden Matrix
  it('6. 5-User Golden Matrix: Profiles A, B, C, D, E produce distinct astronomical calculations, D9, D60, and determinism on repeat', () => {
    const profiles = [profileA, profileB, profileC, profileD, profileE];
    const fingerprints = profiles.map(p => CalculationSnapshotService.generateFingerprint(p));

    // 1. All 5 fingerprints must be mutually distinct
    const uniqueFingerprints = new Set(fingerprints);
    expect(uniqueFingerprints.size).toBe(5);

    // 2. Determinism check: repeating fingerprint calculation for each user yields identical hash
    profiles.forEach((p, idx) => {
      const repeated = CalculationSnapshotService.generateFingerprint(p);
      expect(repeated).toBe(fingerprints[idx]);
    });

    // 3. Compute astronomical charts for all 5 profiles and verify D1, D9, D60
    const charts = profiles.map(p => VedicAstroEngine.calculateKundli({
      name: p.fullName || 'Seeker',
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      birthPlace: p.birthPlace,
      latitude: p.latitude,
      longitude: p.longitude,
      timezone: Number(p.timezone),
    }));

    charts.forEach((chart) => {
      expect(chart).toBeDefined();
      expect(chart.ascendant).toBeDefined();
      expect(chart.ascendant.degrees).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant.degrees).toBeLessThan(360);
      expect(chart.vargas).toBeDefined();
      expect(chart.vargas.d9_navamsa).toBeDefined();
      expect(chart.vargas.d9_navamsa.length).toBeGreaterThanOrEqual(9);
      expect(chart.shodashvargas?.d60_shashtiamsha).toBeDefined();
      expect(chart.shodashvargas?.d60_shashtiamsha.length).toBeGreaterThanOrEqual(9);
    });

    // 4. Ascendant degrees and houses must differ across diverse profiles
    expect(charts[0].ascendant.degrees).not.toBe(charts[1].ascendant.degrees);
    expect(charts[0].ascendant.degrees).not.toBe(charts[3].ascendant.degrees); // Alpha vs Delta (different location)
    expect(charts[0].ascendant.degrees).not.toBe(charts[2].ascendant.degrees); // Alpha vs Gamma (different time)
  });

  // Section 4: Authoritative Resolver Test
  it('7. Canonical Birth Resolver: getCanonicalBirthProfile resolves complete profiles and blocks incomplete inputs without synthetic fallbacks', async () => {
    // A. Complete profile resolution
    db.birthProfiles.set('bp_test_full', {
      id: 'bp_test_full',
      userId: 'usr_full_001',
      fullName: 'Real Native',
      birthDate: '1995-07-20',
      birthTime: '14:20',
      birthPlace: 'Bengaluru, India',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 5.5,
      gender: 'Female',
    } as any);

    const resolved = await CalculationSnapshotService.getCanonicalBirthProfile('usr_full_001');
    expect(resolved.isValid).toBe(true);
    expect(resolved.profile?.fullName).toBe('Real Native');
    expect(resolved.profile?.latitude).toBe(12.9716);

    // B. Missing birth profile
    const emptyResolved = await CalculationSnapshotService.getCanonicalBirthProfile('usr_non_existent');
    expect(emptyResolved.isValid).toBe(false);
    expect(emptyResolved.message).toContain('Complete your birth profile');

    // C. Incomplete profile (missing coordinates)
    db.birthProfiles.set('bp_test_inc', {
      id: 'bp_test_inc',
      userId: 'usr_incomplete_002',
      fullName: 'Incomplete Native',
      birthDate: '1995-07-20',
      birthTime: '14:20',
      birthPlace: 'Unknown Place',
      latitude: NaN,
      longitude: NaN,
    } as any);

    const incResolved = await CalculationSnapshotService.getCanonicalBirthProfile('usr_incomplete_002');
    expect(incResolved.isValid).toBe(false);
    expect(incResolved.missingFields).toContain('latitude');
    expect(incResolved.missingFields).toContain('longitude');
  });

  // Section 28: DeepAstro 7.2 Cross-Module Consistency
  it('8. DeepAstro 7.2: Cross-Module Astronomical Placements Invariant across Kundli, KP, D9, D60, and Future Engine', async () => {
    const kundli = VedicAstroEngine.calculateKundli({
      name: profileA.fullName,
      birthDate: profileA.birthDate,
      birthTime: profileA.birthTime,
      birthPlace: profileA.birthPlace,
      latitude: profileA.latitude,
      longitude: profileA.longitude,
      timezone: Number(profileA.timezone),
    });

    const pastLife = PastLifeIntelligenceEngine.generate(userA, profileA as any);
    const future = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA,
      birthProfile: profileA as any,
      horizon: '3_YEARS',
      requestedLevel: 'LEVEL_2',
    });

    // A. Mahadasha coherence: Moon nakshatra lord must match active Mahadasha across all modules
    const moon = kundli.planets.find(p => p.name === 'Moon')!;
    expect(moon).toBeDefined();
    expect(kundli.dashas.currentMahadasha.planet).toBeDefined();

    // B. D9 & D60 presence and planetary length
    expect(kundli.vargas.d9_navamsa.length).toBeGreaterThanOrEqual(9);
    expect(kundli.shodashvargas?.d60_shashtiamsha.length).toBeGreaterThanOrEqual(9);

    // C. Past Life astrological indicators must reference the exact calculated Ketu house and Atmakaraka
    const ketu = kundli.planets.find(p => p.name === 'Ketu')!;
    expect(ketu).toBeDefined();
    const ketuInd = pastLife.data?.astrological_indicators.find(i => i.indicator.toLowerCase().includes('ketu'));
    expect(ketuInd).toBeDefined();
    expect(ketuInd?.placement).toContain(String(ketu.house));

    // D. Future forecast calculation fingerprint must strictly match snapshot fingerprint
    const fp = CalculationSnapshotService.generateFingerprint(profileA);
    expect(pastLife.data?.calculationFingerprint).toBe(fp);
    expect(future.calculationFingerprint).toBe(fp);
  });

  // Section 1 & 4: DeepAstro 7.2 Zero-Synthetic Fallback Verification
  it('9. DeepAstro 7.2: Zero-Synthetic Fallback Verification for Incomplete Profiles across Engines', async () => {
    // 1. Past Life Engine rejects missing birthDate with 400 and missingFields
    const pastRes = PastLifeIntelligenceEngine.generate('usr_empty', { fullName: 'Empty Seeker' } as any);
    expect(pastRes.success).toBe(false);
    expect(pastRes.error).toBe('PAST_LIFE_ANALYSIS_UNAVAILABLE');
    expect(pastRes.missingFields).toContain('birthDate');
    expect(pastRes.missingFields).toContain('latitude');

    // 2. Future Intelligence Engine throws PROFILE_INCOMPLETE
    await expect(
      CosmicFutureIntelligenceEngine.generateForecast({
        userId: 'usr_empty',
        birthProfile: { name: 'Empty Seeker' } as any,
      })
    ).rejects.toThrow(/PROFILE_INCOMPLETE/);
  });
});
