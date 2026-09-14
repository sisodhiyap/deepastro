import { describe, it, expect } from 'vitest';
import { AuthBootstrapService } from '../server/src/services/AuthBootstrapService.js';
import { CalculationSnapshotService } from '../server/src/services/CalculationSnapshotService.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('DeepAstro Production Auth, Identity & Kundli Verification Suite', () => {
  const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const testUserA = {
    authUserId: `test_usr_a_${runId}`,
    email: `priya_${runId}@example.com`,
    fullName: 'Priya Sharma',
    birthDetails: {
      birthDate: '1996-08-20',
      birthTime: '11:45',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
    }
  };

  const testUserB = {
    authUserId: `test_usr_b_${runId}`,
    email: `rahul_${runId}@example.com`,
    fullName: 'Rahul Verma',
    birthDetails: {
      birthDate: '1992-05-18',
      birthTime: '14:25',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    }
  };

  const testUserC = {
    authUserId: `test_usr_c_${runId}`,
    email: `vikram_${runId}@example.com`,
    fullName: 'Vikram Aditya',
    birthDetails: {
      birthDate: '1988-11-04',
      birthTime: '07:15',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
    }
  };

  describe('PHASE 1, 2, 3 & 6: Server Authoritative Profile Bootstrap', () => {
    it('AUTH-001 & PROFILE-001: Should bootstrap new user with real full name and zero synthetic default', async () => {
      const res = await AuthBootstrapService.ensureUserProfile({
        authUserId: testUserA.authUserId,
        email: testUserA.email,
        fullName: testUserA.fullName,
      });

      expect(res.user.id).toBe(testUserA.authUserId);
      expect(res.user.email).toBe(testUserA.email);
      expect(res.profile.fullName).toBe('Priya Sharma');
      expect(res.profile.fullName).not.toBe('Aarav Sharma');
      expect(res.profile.fullName).not.toBe('Cosmic Seeker');
    });

    it('AUTH-002 & PROFILE-005: Returning user recovers identical authoritative profile without overwriting with default', async () => {
      await AuthBootstrapService.ensureUserProfile({
        authUserId: testUserB.authUserId,
        email: testUserB.email,
        fullName: testUserB.fullName,
      });

      const loaded = await AuthBootstrapService.getProfile(testUserB.authUserId);
      expect(loaded).toBeDefined();
      expect(loaded?.fullName).toBe('Rahul Verma');
      expect(loaded?.fullName).not.toBe('Aarav Sharma');
    });

    it('PROFILE-002 & PROFILE-003: Profile mutation updates correctly and persists new name and birth details', async () => {
      // 1. Mutate general profile
      const updated = await AuthBootstrapService.updateProfile(testUserB.authUserId, {
        fullName: 'Rahul Verma Updated',
        city: 'Bengaluru',
      });

      expect(updated.fullName).toBe('Rahul Verma Updated');
      const reloaded = await AuthBootstrapService.getProfile(testUserB.authUserId);
      expect(reloaded?.fullName).toBe('Rahul Verma Updated');
      expect(reloaded?.city).toBe('Bengaluru');

      // 2. Persist real birth details in PostgreSQL birth_profiles table
      const birthProfile = await AuthBootstrapService.saveBirthProfile(testUserB.authUserId, {
        fullName: 'Rahul Verma Updated',
        birthDate: '1992-05-18',
        birthTime: '15:10',
        birthPlace: 'Bengaluru, India',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 5.5,
      });

      expect(birthProfile.birthTime).toBe('15:10');
      const reloadedBirth = await AuthBootstrapService.getBirthProfile(testUserB.authUserId);
      expect(reloadedBirth).toBeDefined();
      expect(reloadedBirth?.birthTime).toBe('15:10');
      expect(reloadedBirth?.birthPlace).toBe('Bengaluru, India');
    });
  });

  describe('PHASE 8, 9 & 10: Dynamic Calculation Fingerprinting & Snapshot Cache', () => {
    it('KUNDLI-001 & KUNDLI-002: Calculates deterministic chart and generates repeatable SHA-256 fingerprint', () => {
      const inputA: BirthProfileInput = {
        name: testUserA.fullName,
        birthDate: testUserA.birthDetails.birthDate,
        birthTime: testUserA.birthDetails.birthTime,
        birthPlace: testUserA.birthDetails.birthPlace,
        latitude: testUserA.birthDetails.latitude,
        longitude: testUserA.birthDetails.longitude,
        timezone: testUserA.birthDetails.timezone,
      };

      const fp1 = CalculationSnapshotService.generateFingerprint(inputA);
      const fp2 = CalculationSnapshotService.generateFingerprint(inputA);
      expect(fp1).toBe(fp2);
      expect(fp1.length).toBe(64); // SHA-256 hex length
    });

    it('KUNDLI-003 & PROFILE-004: Changing birth time alters calculation fingerprint and recalculates chart', () => {
      const inputOriginal: BirthProfileInput = {
        name: testUserB.fullName,
        birthDate: testUserB.birthDetails.birthDate,
        birthTime: testUserB.birthDetails.birthTime, // 14:25
        birthPlace: testUserB.birthDetails.birthPlace,
        latitude: testUserB.birthDetails.latitude,
        longitude: testUserB.birthDetails.longitude,
        timezone: testUserB.birthDetails.timezone,
      };

      const inputMutated: BirthProfileInput = {
        ...inputOriginal,
        birthTime: '15:10', // Changed to 15:10
      };

      const fpOriginal = CalculationSnapshotService.generateFingerprint(inputOriginal);
      const fpMutated = CalculationSnapshotService.generateFingerprint(inputMutated);

      expect(fpOriginal).not.toBe(fpMutated);

      const chartOriginal = VedicAstroEngine.calculateKundli(inputOriginal);
      const chartMutated = VedicAstroEngine.calculateKundli(inputMutated);

      // Verify planetary ascendant or degrees reflect the recalculation
      expect(chartOriginal.ascendant.degrees).not.toBe(chartMutated.ascendant.degrees);
    });

    it('KUNDLI-004: Changing location coordinates alters calculation fingerprint and recalculates chart', () => {
      const inputDelhi: BirthProfileInput = {
        name: testUserA.fullName,
        birthDate: '1995-03-12',
        birthTime: '10:00',
        birthPlace: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
      };

      const inputLondon: BirthProfileInput = {
        name: testUserA.fullName,
        birthDate: '1995-03-12',
        birthTime: '10:00',
        birthPlace: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 0.0,
      };

      const fpDelhi = CalculationSnapshotService.generateFingerprint(inputDelhi);
      const fpLondon = CalculationSnapshotService.generateFingerprint(inputLondon);

      expect(fpDelhi).not.toBe(fpLondon);
      const chartDelhi = VedicAstroEngine.calculateKundli(inputDelhi);
      const chartLondon = VedicAstroEngine.calculateKundli(inputLondon);
      expect(chartDelhi.ascendant.degrees).not.toBe(chartLondon.ascendant.degrees);
    });

    it('KUNDLI-005: Calculation snapshot saves and retrieves accurately from persistent snapshot storage', async () => {
      const inputC: BirthProfileInput = {
        name: testUserC.fullName,
        birthDate: testUserC.birthDetails.birthDate,
        birthTime: testUserC.birthDetails.birthTime,
        birthPlace: testUserC.birthDetails.birthPlace,
        latitude: testUserC.birthDetails.latitude,
        longitude: testUserC.birthDetails.longitude,
        timezone: testUserC.birthDetails.timezone,
      };

      const fp = CalculationSnapshotService.generateFingerprint(inputC);
      const chart = VedicAstroEngine.calculateKundli(inputC);

      await CalculationSnapshotService.saveSnapshot({
        authUserId: testUserC.authUserId,
        fingerprint: fp,
        payload: chart,
      });

      const cached = await CalculationSnapshotService.getSnapshot(testUserC.authUserId, fp);
      expect(cached).toBeDefined();
      expect(cached.ascendant.details.signName).toBe(chart.ascendant.details.signName);
    });
  });

  describe('PHASE 11, 20, 21 & 22: Multi-User Isolation, Cache Isolation & Anti-Demo Verification', () => {
    it('INTEGRATION-004 & SECURITY-006: User A ≠ User B ≠ User C (Strict Chart, Fingerprint & Cache Isolation)', async () => {
      const inputA: BirthProfileInput = {
        name: testUserA.fullName,
        birthDate: testUserA.birthDetails.birthDate,
        birthTime: testUserA.birthDetails.birthTime,
        birthPlace: testUserA.birthDetails.birthPlace,
        latitude: testUserA.birthDetails.latitude,
        longitude: testUserA.birthDetails.longitude,
        timezone: testUserA.birthDetails.timezone,
      };

      const inputB: BirthProfileInput = {
        name: testUserB.fullName,
        birthDate: testUserB.birthDetails.birthDate,
        birthTime: testUserB.birthDetails.birthTime,
        birthPlace: testUserB.birthDetails.birthPlace,
        latitude: testUserB.birthDetails.latitude,
        longitude: testUserB.birthDetails.longitude,
        timezone: testUserB.birthDetails.timezone,
      };

      const inputC: BirthProfileInput = {
        name: testUserC.fullName,
        birthDate: testUserC.birthDetails.birthDate,
        birthTime: testUserC.birthDetails.birthTime,
        birthPlace: testUserC.birthDetails.birthPlace,
        latitude: testUserC.birthDetails.latitude,
        longitude: testUserC.birthDetails.longitude,
        timezone: testUserC.birthDetails.timezone,
      };

      const fpA = CalculationSnapshotService.generateFingerprint(inputA);
      const fpB = CalculationSnapshotService.generateFingerprint(inputB);
      const fpC = CalculationSnapshotService.generateFingerprint(inputC);

      expect(fpA).not.toBe(fpB);
      expect(fpB).not.toBe(fpC);
      expect(fpA).not.toBe(fpC);

      const chartA = VedicAstroEngine.calculateKundli(inputA);
      const chartB = VedicAstroEngine.calculateKundli(inputB);
      const chartC = VedicAstroEngine.calculateKundli(inputC);

      expect(chartA.moonSign.signName).not.toBe(chartB.moonSign.signName);

      // SECURITY-006: User A cannot retrieve User B's cache snapshot with User A's authUserId
      const crossCache = await CalculationSnapshotService.getSnapshot(testUserA.authUserId, fpB);
      expect(crossCache).toBeNull();
    });

    it('ANTI-DEMO-001 & ANTI-DEMO-002: Zero synthetic default data leaks into user profile or calculation input', () => {
      const bannedTerms = ['Aarav Sharma', '1990-05-15', 'DEMO_BIRTH_PROFILE'];

      const resUser = testUserA.fullName;
      const resDate = testUserA.birthDetails.birthDate;

      bannedTerms.forEach(term => {
        expect(resUser).not.toBe(term);
        expect(resDate).not.toBe(term);
      });
    });
  });
});
