/**
 * AstronomicalVerificationEngine Test Suite
 * Tests the independent re-calculation and cross-check layer.
 * Verifies Julian Day accuracy, sign boundaries, Nakshatra boundaries,
 * Dasha seed, retrograde sanity, and edge case detection.
 */

import { describe, it, expect } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import {
  AstronomicalVerificationEngine,
  DEFAULT_TOLERANCE,
} from '../server/src/astrology/AstronomicalVerificationEngine.js';

const PRASHANT_PROFILE = {
  name: 'Prashant Test',
  birthDate: '1990-06-15',
  birthTime: '10:30',
  birthPlace: 'Mumbai, Maharashtra, India',
  latitude: 19.076,
  longitude: 72.877,
  timezone: 5.5,
  gender: 'Male' as const,
};

const DELHI_PROFILE = {
  name: 'Delhi Test',
  birthDate: '2001-03-20',
  birthTime: '00:03',  // midnight edge case
  birthPlace: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 5.5,
  gender: 'Female' as const,
};

const LONDON_PROFILE = {
  name: 'London Test',
  birthDate: '1985-12-21',  // winter solstice
  birthTime: '23:58',       // near-midnight edge case
  birthPlace: 'London, UK',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 0,
  gender: 'Other' as const,
};

const LEAP_DAY_PROFILE = {
  name: 'Leap Day Test',
  birthDate: '2000-02-29',  // actual leap year
  birthPlace: 'Bangalore, India',
  birthTime: '12:00',
  latitude: 12.9716,
  longitude: 77.5946,
  timezone: 5.5,
  gender: 'Male' as const,
};

describe('AstronomicalVerificationEngine', () => {
  it('should pass all core checks for a standard birth profile', () => {
    const kundli = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const result = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli, DEFAULT_TOLERANCE);

    expect(result.overallStatus).toMatch(/^(VERIFIED|VERIFIED_WITH_WARNINGS)$/);
    expect(result.integrityScore).toBeGreaterThanOrEqual(70);
    expect(result.checks.length).toBeGreaterThanOrEqual(8);
    expect(result.verifiedAt).toBeTruthy();
    expect(result.engineVersion).toBe('1.0.0-lahiri-verify');
  });

  it('should verify Julian Day within acceptable tolerance', () => {
    const kundli = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const result = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli, DEFAULT_TOLERANCE);

    const jdCheck = result.checks.find((c) => c.name === 'Julian Day');
    expect(jdCheck).toBeDefined();
    expect(jdCheck!.status).toMatch(/^(PASS|WARNING)$/);
    // Ensure delta is reasonable (within 1 day tolerance for our independent formula)
    if (jdCheck!.delta !== undefined) {
      expect(jdCheck!.delta).toBeLessThan(1.0);
    }
  });

  it('should verify Sun and Moon are NOT retrograde', () => {
    const kundli = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const result = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli, DEFAULT_TOLERANCE);

    const retrogradeCheck = result.checks.find((c) => c.name === 'Sun/Moon Retrograde Sanity');
    expect(retrogradeCheck).toBeDefined();
    expect(retrogradeCheck!.status).toBe('PASS');
  });

  it('should verify exactly 9 planets and 12 houses', () => {
    const kundli = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const result = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli, DEFAULT_TOLERANCE);

    const planetCheck = result.checks.find((c) => c.name === 'Planet Count (9 Grahas)');
    const houseCheck = result.checks.find((c) => c.name === 'House Count');

    expect(planetCheck).toBeDefined();
    expect(planetCheck!.status).toBe('PASS');
    expect(houseCheck).toBeDefined();
    expect(houseCheck!.status).toBe('PASS');
  });

  it('should detect midnight edge case (Delhi near-midnight profile)', () => {
    const kundli = VedicAstroEngine.calculateKundli(DELHI_PROFILE);
    const result = AstronomicalVerificationEngine.verify(DELHI_PROFILE, kundli, DEFAULT_TOLERANCE);

    // Should detect midnight edge case as a warning
    const edgeCheck = result.checks.find((c) => c.name === 'Edge Case Detection');
    expect(edgeCheck).toBeDefined();
    expect(edgeCheck!.status).toBe('WARNING');
    expect(edgeCheck!.message).toContain('midnight');
  });

  it('should detect near-midnight edge case (London 23:58 profile)', () => {
    const kundli = VedicAstroEngine.calculateKundli(LONDON_PROFILE);
    const result = AstronomicalVerificationEngine.verify(LONDON_PROFILE, kundli, DEFAULT_TOLERANCE);

    const edgeCheck = result.checks.find((c) => c.name === 'Edge Case Detection');
    expect(edgeCheck).toBeDefined();
    expect(edgeCheck!.status).toBe('WARNING');
    expect(edgeCheck!.message).toContain('midnight');
  });

  it('should handle valid leap day (2000-02-29) without errors', () => {
    const kundli = VedicAstroEngine.calculateKundli(LEAP_DAY_PROFILE);
    const result = AstronomicalVerificationEngine.verify(LEAP_DAY_PROFILE, kundli, DEFAULT_TOLERANCE);

    // Should detect leap day as a warning (edge case), not a conflict
    expect(result.overallStatus).not.toBe('CALCULATION_CONFLICT');
    const edgeCheck = result.checks.find((c) => c.name === 'Edge Case Detection');
    if (edgeCheck && edgeCheck.message) {
      expect(edgeCheck.message).toContain('Leap day');
    }
  });

  it('should verify Moon sign boundary for multiple profiles', () => {
    for (const profile of [PRASHANT_PROFILE, DELHI_PROFILE, LONDON_PROFILE]) {
      const kundli = VedicAstroEngine.calculateKundli(profile);
      const result = AstronomicalVerificationEngine.verify(profile, kundli, DEFAULT_TOLERANCE);

      const moonCheck = result.checks.find((c) => c.name === 'Moon Sign Boundary');
      expect(moonCheck).toBeDefined();
      // Should not be a conflict (sign boundary should always be consistent within the same engine)
      expect(moonCheck!.status).not.toBe('CONFLICT');
    }
  });

  it('should verify Ascendant sign boundary for multiple profiles', () => {
    for (const profile of [PRASHANT_PROFILE, DELHI_PROFILE]) {
      const kundli = VedicAstroEngine.calculateKundli(profile);
      const result = AstronomicalVerificationEngine.verify(profile, kundli, DEFAULT_TOLERANCE);

      const lagnaCheck = result.checks.find((c) => c.name === 'Ascendant Sign Boundary');
      expect(lagnaCheck).toBeDefined();
      expect(lagnaCheck!.status).toBe('PASS');
    }
  });

  it('should return a calculation hash for each unique profile', () => {
    const kundli1 = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const kundli2 = VedicAstroEngine.calculateKundli(DELHI_PROFILE);

    const result1 = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli1, DEFAULT_TOLERANCE);
    const result2 = AstronomicalVerificationEngine.verify(DELHI_PROFILE, kundli2, DEFAULT_TOLERANCE);

    expect(result1.calculationHash).toBeTruthy();
    expect(result2.calculationHash).toBeTruthy();
    expect(result1.calculationHash).not.toBe(result2.calculationHash);
  });
});

describe('AstronomicalVerificationEngine — Cross-User Contamination Prevention', () => {
  it('should produce different results for different users (A≠B)', () => {
    const kundliA = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const kundliB = VedicAstroEngine.calculateKundli(DELHI_PROFILE);

    const resultA = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundliA, DEFAULT_TOLERANCE);
    const resultB = AstronomicalVerificationEngine.verify(DELHI_PROFILE, kundliB, DEFAULT_TOLERANCE);

    // Different profiles → different calculation hashes
    expect(resultA.calculationHash).not.toBe(resultB.calculationHash);

    // Verify that the Lagna signs differ (as they must for completely different birth data)
    const lagnaA = kundliA.ascendant.details.signName;
    const lagnaB = kundliB.ascendant.details.signName;
    // They could be the same sign but should produce different hashes due to degree difference
    expect(kundliA.ascendant.degrees).not.toBeCloseTo(kundliB.ascendant.degrees, 1);
  });

  it('should produce IDENTICAL results when same birth data is re-submitted (determinism)', () => {
    // Recalculate same profile twice
    const kundli1 = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    const kundli2 = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);

    const result1 = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli1, DEFAULT_TOLERANCE);
    const result2 = AstronomicalVerificationEngine.verify(PRASHANT_PROFILE, kundli2, DEFAULT_TOLERANCE);

    // Deterministic: same hash, same scores
    expect(result1.calculationHash).toBe(result2.calculationHash);
    expect(result1.integrityScore).toBe(result2.integrityScore);
    expect(kundli1.ascendant.degrees).toBeCloseTo(kundli2.ascendant.degrees, 6);
    expect(kundli1.moonSign.signName).toBe(kundli2.moonSign.signName);
  });

  it('A→B→A sequence: User A data should never contaminate User B data', () => {
    // User A calculates their kundli
    const kundliA1 = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);
    // User B calculates their kundli
    const kundliB = VedicAstroEngine.calculateKundli(DELHI_PROFILE);
    // User A calculates again (should be identical to first)
    const kundliA2 = VedicAstroEngine.calculateKundli(PRASHANT_PROFILE);

    // A's second calculation must match A's first (no B contamination)
    expect(kundliA1.ascendant.degrees).toBeCloseTo(kundliA2.ascendant.degrees, 6);
    expect(kundliA1.moonSign.signName).toBe(kundliA2.moonSign.signName);
    expect(kundliA1.dashas.currentMahadasha.planet).toBe(kundliA2.dashas.currentMahadasha.planet);

    // A and B must differ on key indicators
    expect(kundliA1.profile.name).toBe(PRASHANT_PROFILE.name);
    expect(kundliB.profile.name).toBe(DELHI_PROFILE.name);
    expect(kundliA1.profile.birthDate).not.toBe(kundliB.profile.birthDate);
  });
});
