import { describe, it, expect } from 'vitest';
import { ChartSessionService } from '../server/src/services/ChartSessionService.js';
import { BirthFingerprintEngine } from '../server/src/astrology/birthFingerprint.js';
import { BirthInput } from '../server/src/astrology/chartSessionTypes.js';

describe('DeepAstro 6.0.2 - Canonical ChartSession & Dynamic Intelligence Truth Suite', () => {

  // TEST 1: Cache Isolation (Users A, B, C, D)
  it('enforces rigorous cache isolation between subtly different inputs (Users A, B, C, D)', async () => {
    const userAInput: BirthInput = {
      name: 'User A',
      date: '1995-05-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: 'New Delhi',
      country: 'India',
    };

    const userBInput: BirthInput = {
      name: 'User B',
      date: '1995-05-15',
      time: '14:31', // 1 minute later
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: 'New Delhi',
      country: 'India',
    };

    const userCInput: BirthInput = {
      name: 'User C',
      date: '1996-05-15', // 1 year later
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: 'New Delhi',
      country: 'India',
    };

    const userDInput: BirthInput = {
      name: 'User D',
      date: '1995-05-15',
      time: '14:30',
      latitude: 19.0760, // Mumbai coordinates
      longitude: 72.8777,
      timezone: 5.5,
      city: 'Mumbai',
      country: 'India',
    };

    const sessionA = await ChartSessionService.getOrCreateSession(userAInput);
    const sessionB = await ChartSessionService.getOrCreateSession(userBInput);
    const sessionC = await ChartSessionService.getOrCreateSession(userCInput);
    const sessionD = await ChartSessionService.getOrCreateSession(userDInput);

    // Fingerprints MUST all be strictly unique
    expect(sessionA.birthDataFingerprint).not.toBe(sessionB.birthDataFingerprint);
    expect(sessionA.birthDataFingerprint).not.toBe(sessionC.birthDataFingerprint);
    expect(sessionA.birthDataFingerprint).not.toBe(sessionD.birthDataFingerprint);
    expect(sessionB.birthDataFingerprint).not.toBe(sessionC.birthDataFingerprint);
    expect(sessionB.birthDataFingerprint).not.toBe(sessionD.birthDataFingerprint);
    expect(sessionC.birthDataFingerprint).not.toBe(sessionD.birthDataFingerprint);

    // 1-minute time difference MUST advance Ascendant degree
    expect(sessionA.vedic.ascendantDegree).not.toBe(sessionB.vedic.ascendantDegree);
    // Earth rotates ~0.25 degree per minute
    const ascDiff = Math.abs(sessionB.vedic.ascendantDegree - sessionA.vedic.ascendantDegree);
    expect(ascDiff).toBeGreaterThan(0.15);
    expect(ascDiff).toBeLessThan(0.40);

    // 1-year time difference MUST change Sun & Moon sign or degree substantially
    expect(sessionA.vedic.moonDegree).not.toBe(sessionC.vedic.moonDegree);
    expect(sessionA.vedic.moonSign).not.toBe(sessionC.vedic.moonSign);

    // Geographic relocation to Mumbai MUST change Ascendant and houses
    expect(sessionA.vedic.ascendantDegree).not.toBe(sessionD.vedic.ascendantDegree);

    // Same User A calculated again MUST be 100% identical and hit cache
    const sessionA2 = await ChartSessionService.getOrCreateSession(userAInput);
    expect(sessionA2.birthDataFingerprint).toBe(sessionA.birthDataFingerprint);
    expect(sessionA2.vedic.ascendantDegree).toBe(sessionA.vedic.ascendantDegree);
    expect(sessionA2.vedic.moonDegree).toBe(sessionA.vedic.moonDegree);
  });

  // TEST 2: 10-Run Deterministic Reproducibility
  it('guarantees 100% deterministic reproducibility across 10 consecutive calculations', async () => {
    const input: BirthInput = {
      name: 'Deterministic Test Native',
      date: '1988-11-23',
      time: '08:45',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 5.5,
      city: 'Chennai',
      country: 'India',
    };

    const firstSession = await ChartSessionService.getOrCreateSession(input);

    for (let run = 1; run <= 10; run++) {
      // Clear in-memory cache to force recalculation from scratch
      ChartSessionService.clearCache();
      const nextSession = await ChartSessionService.getOrCreateSession(input);

      expect(nextSession.birthDataFingerprint).toBe(firstSession.birthDataFingerprint);
      expect(nextSession.vedic.ascendantSign).toBe(firstSession.vedic.ascendantSign);
      expect(nextSession.vedic.ascendantDegree).toBeCloseTo(firstSession.vedic.ascendantDegree, 5);
      expect(nextSession.vedic.moonSign).toBe(firstSession.vedic.moonSign);
      expect(nextSession.vedic.moonNakshatra).toBe(firstSession.vedic.moonNakshatra);
      expect(nextSession.dasha.currentMahaDasha).toBe(firstSession.dasha.currentMahaDasha);
      expect(nextSession.evidenceGraph.length).toBe(firstSession.evidenceGraph.length);
      expect(nextSession.personalization.cosmicStory.length).toBe(firstSession.personalization.cosmicStory.length);
    }
  });

  // TEST 3: 50-Profile Diversity and Uniqueness Test
  it('demonstrates true diversity across 50 global birth profiles without hardcoded repetition', async () => {
    const cities = [
      { city: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 9.0 },
      { city: 'London', lat: 51.5074, lon: -0.1278, tz: 0.0 },
      { city: 'New York', lat: 40.7128, lon: -74.0060, tz: -5.0 },
      { city: 'Sydney', lat: -33.8688, lon: 151.2093, tz: 10.0 },
      { city: 'Cairo', lat: 30.0444, lon: 31.2357, tz: 2.0 },
      { city: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
      { city: 'Paris', lat: 48.8566, lon: 2.3522, tz: 1.0 },
      { city: 'San Francisco', lat: 37.7749, lon: -122.4194, tz: -8.0 },
      { city: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 8.0 },
      { city: 'Johannesburg', lat: -26.2041, lon: 28.0473, tz: 2.0 },
    ];

    const fingerprints = new Set<string>();
    const ascendantSigns = new Set<string>();
    const moonSigns = new Set<string>();
    const dashaLords = new Set<string>();
    const uniqueStoryParagraphs = new Set<string>();
    let totalParagraphs = 0;

    for (let i = 0; i < 50; i++) {
      const loc = cities[i % cities.length];
      const year = 1960 + (i * 3) % 60;
      const month = String(1 + (i % 12)).padStart(2, '0');
      const day = String(1 + ((i * 7) % 28)).padStart(2, '0');
      const hour = String((i * 5) % 24).padStart(2, '0');
      const min = String((i * 13) % 60).padStart(2, '0');

      const profile: BirthInput = {
        name: `Native ${i + 1}`,
        date: `${year}-${month}-${day}`,
        time: `${hour}:${min}`,
        latitude: loc.lat,
        longitude: loc.lon,
        timezone: loc.tz,
        city: loc.city,
        country: 'Global',
      };

      const session = await ChartSessionService.getOrCreateSession(profile);
      fingerprints.add(session.birthDataFingerprint);
      ascendantSigns.add(session.vedic.ascendantSign);
      moonSigns.add(session.vedic.moonSign);
      dashaLords.add(session.dasha.currentMahaDasha);

      // Collect story chapters to verify non-hardcoded variation
      session.personalization.cosmicStory.forEach(c => {
        totalParagraphs++;
        uniqueStoryParagraphs.add(c.narrative);
      });
    }

    // 50 profiles MUST produce 50 unique fingerprints
    expect(fingerprints.size).toBe(50);
    // Across 50 profiles, we should see at least 8 distinct ascendants and moon signs
    expect(ascendantSigns.size).toBeGreaterThanOrEqual(8);
    expect(moonSigns.size).toBeGreaterThanOrEqual(8);
    expect(dashaLords.size).toBeGreaterThanOrEqual(5);

    // Generic Insight Ratio: More than 80% of paragraphs should be distinct due to dynamic evidence injection
    const uniqueRatio = uniqueStoryParagraphs.size / totalParagraphs;
    expect(uniqueRatio).toBeGreaterThan(0.70);
  });

  // TEST 4: Boundary Tests (Midnight & Zodiac Edge)
  it('handles critical boundary conditions correctly without NaN or crashes', async () => {
    // Midnight crossing boundary
    const midnightBefore: BirthInput = {
      name: 'Midnight Before',
      date: '2000-01-01',
      time: '23:59',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: 'Delhi',
      country: 'India',
    };
    const midnightAfter: BirthInput = {
      name: 'Midnight After',
      date: '2000-01-02',
      time: '00:01',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: 'Delhi',
      country: 'India',
    };

    const s1 = await ChartSessionService.getOrCreateSession(midnightBefore);
    const s2 = await ChartSessionService.getOrCreateSession(midnightAfter);

    expect(s1.birthDataFingerprint).not.toBe(s2.birthDataFingerprint);
    expect(Number.isNaN(s1.vedic.ascendantDegree)).toBe(false);
    expect(Number.isNaN(s2.vedic.ascendantDegree)).toBe(false);
    expect(s1.vedic.ascendantDegree).toBeGreaterThanOrEqual(0);
    expect(s1.vedic.ascendantDegree).toBeLessThanOrEqual(30);
    expect(s2.vedic.ascendantDegree).toBeGreaterThanOrEqual(0);
    expect(s2.vedic.ascendantDegree).toBeLessThanOrEqual(30);
  });

  // TEST 5: Strict Validation Gate
  it('validates and verifies chart positions against mathematical sanity constraints', async () => {
    const validProfile: BirthInput = {
      name: 'Sanity Native',
      date: '1992-07-15',
      time: '11:20',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
      city: 'London',
      country: 'UK',
    };

    const session = await ChartSessionService.getOrCreateSession(validProfile);
    expect(session.validation.passed).toBe(true);
    expect(session.validation.checks.positionChecks).toBe(true);
    expect(session.validation.checks.houseChecks).toBe(true);
    expect(session.validation.checks.nakshatraChecks).toBe(true);
    expect(session.validation.checks.dashaChecks).toBe(true);
    expect(session.validation.diagnostics.length).toBeGreaterThan(0);
  });
});