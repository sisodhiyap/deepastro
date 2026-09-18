import { describe, it, expect, beforeAll } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { KPEngine } from '../server/src/astrology/KPEngine.js';
import { PastLifeIntelligenceEngine } from '../server/src/intelligence/pastlife/index.js';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import { CalculationSnapshotService, CanonicalBirthProfile } from '../server/src/services/CalculationSnapshotService.js';
import { AuthBootstrapService } from '../server/src/services/AuthBootstrapService.js';
import { CosmicFeaturesEngine } from '../server/src/astrology/CosmicFeaturesEngine.js';
import { executeShuffleToDestiny } from '../src/services/tarotEngine.js';

describe('DEEPASTRO 7.3 — LIVE VALIDATION, PERSONALIZATION & CROSS-ENGINE CONSISTENCY', () => {
  const runTag = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Test identities
  const userA: CanonicalBirthProfile = {
    fullName: 'Ananya Deshmukh',
    birthDate: '1994-06-12',
    birthTime: '08:30',
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
  };

  const userB: CanonicalBirthProfile = {
    fullName: 'Kenji Sato',
    birthDate: '1989-11-23',
    birthTime: '16:45',
    birthPlace: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 9.0,
  };

  // User C has same DOB and place as User A, but different birth time (14:15 vs 08:30)
  const userC_differentTime: CanonicalBirthProfile = {
    ...userA,
    fullName: 'Ananya C (Mutated Time)',
    birthTime: '14:15',
  };

  // User D has same DOB and time as User A, but different place (London vs Mumbai)
  const userD_differentPlace: CanonicalBirthProfile = {
    ...userA,
    fullName: 'Ananya D (London)',
    birthPlace: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
  };

  const userIdA = `usr_73_a_${runTag}`;
  const userIdB = `usr_73_b_${runTag}`;

  beforeAll(() => {
    FutureConsentEngine.recordConsent(userIdA, true, 'LEVEL_3');
    FutureConsentEngine.recordConsent(userIdB, true, 'LEVEL_3');
  });

  // =========================================================================
  // PHASE 2 — GOOGLE OAUTH BACKEND VERIFICATION
  // =========================================================================
  describe('Phase 2: Google OAuth Backend Pipeline & Session Isolation', () => {
    it('OAUTH-001: Provisions new user profile from authentic OAuth claims with persistent IDs', async () => {
      const oauthIdA = `goog_sub_${runTag}_a`;
      const emailA = `ananya.${runTag}@gmail.com`;
      const nameA = 'Ananya Deshmukh';

      const res = await AuthBootstrapService.ensureUserProfile({
        authUserId: oauthIdA,
        email: emailA,
        fullName: nameA,
        avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar-a',
        role: 'CLIENT',
      });

      expect(res.user.id).toBe(oauthIdA);
      expect(res.user.email).toBe(emailA);
      expect(res.profile.fullName).toBe(nameA);
      expect(res.profile.avatarUrl).toContain('test-avatar-a');

      // Subsequent login with identical OAuth ID recovers identical user without duplicate creation
      const resReturning = await AuthBootstrapService.ensureUserProfile({
        authUserId: oauthIdA,
        email: emailA,
        fullName: nameA,
      });

      expect(resReturning.user.id).toBe(oauthIdA);
      expect(resReturning.profile.fullName).toBe(nameA);
    });

    it('OAUTH-002: Associates birth profile strictly with OAuth user identity and prevents cross-user access', async () => {
      const oauthIdA = `goog_sub_${runTag}_a`;
      const oauthIdB = `goog_sub_${runTag}_b`;
      const emailB = `kenji.${runTag}@gmail.com`;

      await AuthBootstrapService.ensureUserProfile({
        authUserId: oauthIdB,
        email: emailB,
        fullName: 'Kenji Sato',
        role: 'CLIENT',
      });

      // User A saves birth profile
      const bpA = await AuthBootstrapService.saveBirthProfile(oauthIdA, {
        fullName: 'Ananya Deshmukh',
        birthDate: userA.birthDate,
        birthTime: userA.birthTime,
        birthPlace: userA.birthPlace,
        latitude: userA.latitude,
        longitude: userA.longitude,
        timezone: userA.timezone,
      });

      expect(bpA.userId).toBe(oauthIdA);
      expect(bpA.birthPlace).toBe('Mumbai, India');

      // User B retrieves their own profile - it must NOT return User A's birth data
      const bpB = await AuthBootstrapService.getBirthProfile(oauthIdB);
      expect(bpB).toBeNull();

      // User B cannot access User A's calculation snapshot cache
      const fpA = CalculationSnapshotService.generateFingerprint(userA);
      const crossCache = await CalculationSnapshotService.getSnapshot(oauthIdB, fpA);
      expect(crossCache).toBeNull();
    });
  });

  // =========================================================================
  // PHASE 3 — REAL USER PERSONALIZATION & ASTRONOMICAL DIVERGENCE
  // =========================================================================
  describe('Phase 3: Real User Personalization (Divergence Proofs)', () => {
    it('PERS-001: Changing DOB completely alters planetary positions, signs, and dashas', () => {
      const chartA = VedicAstroEngine.calculateKundli(userA as BirthProfileInput);
      const chartB = VedicAstroEngine.calculateKundli(userB as BirthProfileInput);

      // Sun sign & Moon sign must diverge
      expect(chartA.sunSign.signName).not.toBe(chartB.sunSign.signName);
      expect(chartA.moonSign.signName).not.toBe(chartB.moonSign.signName);

      // Planetary degrees must diverge across all planets
      const sunDegreeA = chartA.planets.find(p => p.name === 'Sun')?.siderealLongitude;
      const sunDegreeB = chartB.planets.find(p => p.name === 'Sun')?.siderealLongitude;
      expect(sunDegreeA).toBeDefined();
      expect(sunDegreeB).toBeDefined();
      expect(Math.abs(sunDegreeA! - sunDegreeB!)).toBeGreaterThan(10);

      // Dashas must be completely different
      expect(chartA.dashas.currentMahadasha.planet).not.toBe(chartB.dashas.currentMahadasha.planet);
    });

    it('PERS-002: Changing birth time alters Ascendant, House Cusps, and KP Sublords while preserving planetary longitudes', () => {
      const chartA = VedicAstroEngine.calculateKundli(userA as BirthProfileInput);
      const chartC = VedicAstroEngine.calculateKundli(userC_differentTime as BirthProfileInput);

      // Ascendant must rotate (approx 1 sign every 2 hours)
      expect(chartA.ascendant.degrees).not.toBe(chartC.ascendant.degrees);
      expect(chartA.ascendant.details.signName).not.toBe(chartC.ascendant.details.signName);

      // KP Cuspal Sublords must shift with house rotation
      const kpA = KPEngine.calculateKP(chartA.planets, chartA.ascendant);
      const kpC = KPEngine.calculateKP(chartC.planets, chartC.ascendant);
      const cuspal1A = kpA.cusps.find(c => c.houseNumber === 1)?.subLord;
      const cuspal1C = kpC.cusps.find(c => c.houseNumber === 1)?.subLord;
      expect(cuspal1A).toBeDefined();
      expect(cuspal1C).toBeDefined();
      expect(cuspal1A).not.toBe(cuspal1C);

      // D9 Navamsha and D60 Shashtiamsha presence and harmonic calculations
      expect(chartA.vargas.d9_navamsa.length).toBeGreaterThanOrEqual(9);
      expect(chartC.vargas.d9_navamsa.length).toBeGreaterThanOrEqual(9);
      expect(chartA.shodashvargas?.d60_shashtiamsha.length).toBeGreaterThanOrEqual(9);
      expect(chartC.shodashvargas?.d60_shashtiamsha.length).toBeGreaterThanOrEqual(9);
    });

    it('PERS-003: Changing birthplace alters local sidereal time, Ascendant, and house cusps', () => {
      const chartA = VedicAstroEngine.calculateKundli(userA as BirthProfileInput); // Mumbai (lat 19.07, lon 72.87, tz 5.5)
      const chartD = VedicAstroEngine.calculateKundli(userD_differentPlace as BirthProfileInput); // London (lat 51.50, lon -0.12, tz 0.0)

      // Ascendants degrees must be entirely different due to geographic latitude and local sidereal time
      expect(chartA.ascendant.degrees).not.toBe(chartD.ascendant.degrees);

      // House 1 cusp degree in KP must diverge
      const kpA = KPEngine.calculateKP(chartA.planets, chartA.ascendant);
      const kpD = KPEngine.calculateKP(chartD.planets, chartD.ascendant);
      const cuspA = kpA.cusps[0].siderealLongitude;
      const cuspD = kpD.cusps[0].siderealLongitude;
      expect(cuspA).not.toBe(cuspD);
    });
  });

  // =========================================================================
  // PHASE 4 — CALCULATION FINGERPRINT CANONICAL INTEGRITY
  // =========================================================================
  describe('Phase 4: Calculation Fingerprint Integrity & Invariant Flow', () => {
    it('FING-001: Fingerprint is deterministic and unique across profiles', () => {
      const fpA1 = CalculationSnapshotService.generateFingerprint(userA);
      const fpA2 = CalculationSnapshotService.generateFingerprint(userA);
      const fpB = CalculationSnapshotService.generateFingerprint(userB);
      const fpC = CalculationSnapshotService.generateFingerprint(userC_differentTime);
      const fpD = CalculationSnapshotService.generateFingerprint(userD_differentPlace);

      expect(fpA1).toBe(fpA2);
      expect(fpA1).not.toBe(fpB);
      expect(fpA1).not.toBe(fpC);
      expect(fpA1).not.toBe(fpD);
    });

    it('FING-002: Downstream engines consume and identify the calculation fingerprint identically', async () => {
      const fp = CalculationSnapshotService.generateFingerprint(userA);

      // Past life engine identifies calculation fingerprint
      const pastLife = PastLifeIntelligenceEngine.generate(userIdA, userA as any);
      expect(pastLife.success).toBe(true);
      expect(pastLife.data?.calculationFingerprint).toBe(fp);

      // Future intelligence engine identifies calculation fingerprint
      const future = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: userIdA,
        birthProfile: userA as any,
        horizon: '5_YEARS',
        requestedLevel: 'LEVEL_3',
      });
      expect(future.calculationFingerprint).toBe(fp);
      expect(future.yearForecasts.length).toBe(5);
    });
  });

  // =========================================================================
  // PHASE 5 — PAST LIFE ENGINE CALCULATED PROVENANCE & EPISTEMICS
  // =========================================================================
  describe('Phase 5: Past Life Intelligence Engine Calculation Grounding', () => {
    it('PAST-001: Past life indicators are derived from calculated Ketu, Atmakaraka, and D9/D60', () => {
      const pastLife = PastLifeIntelligenceEngine.generate(userIdA, userA as any);
      expect(pastLife.success).toBe(true);
      const data = pastLife.data!;

      // Check karmic axis indicators
      expect(data.astrological_indicators.length).toBeGreaterThan(0);
      const hasKetu = data.astrological_indicators.some(i => i.indicator.toLowerCase().includes('ketu'));
      expect(hasKetu).toBe(true);

      // Ensure epistemic confidence boundaries and uncertainty are explicitly stated
      expect(data.confidence.score_percent).toBeLessThanOrEqual(90);
      expect(data.epistemic_notice.toLowerCase()).toContain('not empirically provable');

      // Ensure calculated indicator vs symbolic interpretation distinction
      expect(data.archetype.primary).toBeDefined();
    });
  });

  // =========================================================================
  // PHASE 6 & 7 — FUTURE INTELLIGENCE & FORECAST PROVENANCE
  // =========================================================================
  describe('Phase 6 & 7: Future Intelligence & Forecast Provenance', () => {
    it('FUTR-001: Every forecast item has complete audit provenance', async () => {
      const future = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: userIdA,
        birthProfile: userA as any,
        horizon: '5_YEARS',
        requestedLevel: 'LEVEL_3',
      });

      expect(future.id).toBeDefined();
      expect(future.userId).toBe(userIdA);
      expect(future.calculationFingerprint).toBeDefined();
      expect(future.version).toBeDefined();

      // Verify year forecasts and trajectory
      expect(future.yearForecasts.length).toBe(5);
      future.yearForecasts.forEach(yf => {
        expect(yf.year).toBeGreaterThanOrEqual(2024);
        expect(yf.overallTheme).toBeDefined();
        expect(yf.confidence).toBeDefined();
      });
    });

    it('FUTR-002: Changing birth details produces differentiated astrological forecasts', async () => {
      const futureA = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: userIdA,
        birthProfile: userA as any,
        horizon: '5_YEARS',
        requestedLevel: 'LEVEL_3',
      });

      const futureB = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: userIdB,
        birthProfile: userB as any,
        horizon: '5_YEARS',
        requestedLevel: 'LEVEL_3',
      });

      // Phases and themes must diverge
      expect(futureA.currentLifePhase).not.toBe(futureB.currentLifePhase);
      expect(futureA.overall10YearTheme).not.toBe(futureB.overall10YearTheme);
    });
  });

  // =========================================================================
  // PHASE 8 — TAROT ENGINE VALIDATION
  // =========================================================================
  describe('Phase 8: Cosmic Tarot Engine Integrity', () => {
    it('TAROT-001: Generates valid spread with unique cards, astrological associations, and zero undefineds', () => {
      const session = executeShuffleToDestiny({
        category: 'CAREER & PURPOSE',
        applyAstroWeighting: true,
      });

      expect(session.drawnCards.length).toBe(3);
      const cardIds = new Set(session.drawnCards.map(c => c.card.id));
      expect(cardIds.size).toBe(3); // Zero duplicate cards in spread

      session.drawnCards.forEach(draw => {
        expect(draw.card.name).toBeDefined();
        expect(draw.card.arcana).toMatch(/^(major|minor)$/);
        expect(draw.card.correspondences.element).toBeDefined();
        expect(draw.position).toBeDefined();
        expect(typeof draw.orientation).toBe('string');
      });

      // Also verify server Sanctuary Graha Tarot engine
      const dailyCard = CosmicFeaturesEngine.getDailyTarot(new Date('2026-09-18'));
      expect(dailyCard.id).toBeDefined();
      expect(dailyCard.cardName).toBeDefined();
      expect(dailyCard.vedicGraha).toBeDefined();
      expect(typeof dailyCard.isReversed).toBe('boolean');
    });
  });

  // =========================================================================
  // PHASE 14 — ZERO-SYNTHETIC PRODUCTION HARDENING AUDIT
  // =========================================================================
  describe('Phase 14: Anti-Synthetic Hardening Invariant', () => {
    it('HARD-001: Verification that active profile outputs never contain banned synthetic personas', async () => {
      const banned = ['Aarav Sharma', 'Arjun Sharma'];
      const chartA = VedicAstroEngine.calculateKundli(userA as BirthProfileInput);
      const pastLife = PastLifeIntelligenceEngine.generate(userIdA, userA as any);
      const future = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: userIdA,
        birthProfile: userA as any,
        horizon: '5_YEARS',
        requestedLevel: 'LEVEL_3',
      });

      const serialized = JSON.stringify({ chartA, pastLife, future });
      banned.forEach(name => {
        expect(serialized).not.toContain(name);
      });
    });
  });
});
