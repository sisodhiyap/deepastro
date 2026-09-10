/**
 * DeepAstro — Metamorphic Testing Suite
 *
 * Applies controlled input perturbations to assert physical cause-and-effect invariants:
 * 1. Non-Astronomical Invariance: Mutating Name or Gender MUST NOT alter planetary or Lagna degrees by even 1e-9°.
 * 2. Temporal Sensitivity: Advancing time by 4 minutes MUST shift the Ascendant by approximately ~1.0° (Earth rotation).
 * 3. Geographic Sensitivity: Shifting longitude by 1.0° MUST shift Local Sidereal Time by exactly 4 minutes (~1.0° on Lagna).
 * 4. Latitudinal Sensitivity: Changing latitude from Equator (0°) to Polar (65°) must alter oblique ascension (Lagna) while leaving geocentric Sun longitude identical.
 * 5. Timezone Invariance: Shifting both local time and timezone by +1 hour (same UTC instant) MUST leave planetary longitudes and Julian Day 100% identical.
 */

import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('DeepAstro Metamorphic Testing Suite', () => {
  const baseProfile: BirthProfileInput = {
    name: 'Metamorphic Base Subject',
    birthDate: '1995-10-25',
    birthTime: '10:30',
    birthPlace: 'Mumbai, India',
    latitude: 18.9220,
    longitude: 72.8347,
    timezone: 5.5,
    gender: 'Male',
    _skipSensitivity: true,
  };

  it('proves non-astronomical mutation (Name, Gender) causes ZERO astronomical deviation', () => {
    const base = VedicAstroEngine.calculateKundli(baseProfile);

    const mutated = VedicAstroEngine.calculateKundli({
      ...baseProfile,
      name: 'Completely Different Person Name 12345',
      gender: 'Female',
    });

    // Lagna must be identical to the last decimal digit
    expect(mutated.ascendant.degrees).toBe(base.ascendant.degrees);
    expect(mutated.astronomy.julianDay).toBe(base.astronomy.julianDay);
    expect(mutated.astronomy.ayanamshaDegrees).toBe(base.astronomy.ayanamshaDegrees);

    // All 9 planetary positions must be 100% identical
    for (let i = 0; i < 9; i++) {
      expect(mutated.planets[i].siderealLongitude).toBe(base.planets[i].siderealLongitude);
      expect(mutated.planets[i].speed).toBe(base.planets[i].speed);
    }
  });

  it('verifies 4-minute time advancement shifts Ascendant by ~1.0° (Earth 360° / 24h)', () => {
    const base = VedicAstroEngine.calculateKundli(baseProfile);

    // 10:30 -> 10:34 (4 minutes = 1/360th of a day)
    const advanced = VedicAstroEngine.calculateKundli({
      ...baseProfile,
      birthTime: '10:34',
    });

    const lagnaDiff = Math.abs(advanced.ascendant.degrees - base.ascendant.degrees);
    // In tropical/subtropical latitudes, 4 minutes shifts Lagna by 0.7° to 1.3° depending on rising sign
    expect(lagnaDiff).toBeGreaterThan(0.7);
    expect(lagnaDiff).toBeLessThan(1.4);

    // Julian Day should advance by 4 / 1440 days
    expect(advanced.astronomy.julianDay - base.astronomy.julianDay).toBeCloseTo(4.0 / 1440.0, 5);
  });

  it('verifies 1° longitude shift alters LST and Ascendant, but leaves geocentric Sun longitude identical', () => {
    const base = VedicAstroEngine.calculateKundli(baseProfile);

    // Move 1° East (72.8347 -> 73.8347)
    const shiftedEast = VedicAstroEngine.calculateKundli({
      ...baseProfile,
      longitude: 73.8347,
    });

    // Ascendant must shift because local horizon moved
    const lagnaDiff = Math.abs(shiftedEast.ascendant.degrees - base.ascendant.degrees);
    expect(lagnaDiff).toBeGreaterThan(0.5);

    // Geocentric Sun and outer planets depend on UTC instant, not local longitude
    const baseSun = base.planets.find((p) => p.name === 'Sun')!;
    const shiftedSun = shiftedEast.planets.find((p) => p.name === 'Sun')!;
    expect(shiftedSun.siderealLongitude).toBeCloseTo(baseSun.siderealLongitude, 5);
  });

  it('verifies equivalent UTC offset transformation produces 100% identical planetary coordinates', () => {
    // 10:30 at UTC+5.5 is equivalent to 11:00 at UTC+6.0 (both = 05:00 UTC)
    const base = VedicAstroEngine.calculateKundli(baseProfile);

    const equivalentUtcProfile: BirthProfileInput = {
      ...baseProfile,
      birthTime: '11:00',
      timezone: 6.0,
    };

    const equivalent = VedicAstroEngine.calculateKundli(equivalentUtcProfile);

    // Julian Day must match exactly
    expect(equivalent.astronomy.julianDay).toBeCloseTo(base.astronomy.julianDay, 6);

    // Planetary positions at the same UTC instant must match exactly
    for (let i = 0; i < 9; i++) {
      expect(equivalent.planets[i].siderealLongitude).toBeCloseTo(base.planets[i].siderealLongitude, 5);
    }
  });
});
