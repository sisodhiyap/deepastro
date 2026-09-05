import { describe, it, expect } from 'vitest';
import { getJulianDay, getLahiriAyanamsha, calculateAscendant, getDegreeDetails } from '../server/src/astrology/astronomyMath.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('Vedic Astronomy & Calculation Engine', () => {
  it('calculates deterministic Julian Day accurately', () => {
    const jd = getJulianDay(
      { year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
      0 // UTC
    );
    // J2000.0 epoch is exactly 2451545.0
    expect(jd).toBeCloseTo(2451545.0, 1);
  });

  it('calculates Lahiri Ayanamsha within standard ~23.85° at J2000', () => {
    const jd2000 = 2451545.0;
    const ayanamsha = getLahiriAyanamsha(jd2000);
    expect(ayanamsha).toBeGreaterThanOrEqual(23.8);
    expect(ayanamsha).toBeLessThanOrEqual(24.0);
  });

  it('generates complete 12 houses and 9 planets without missing entries', () => {
    const input: BirthProfileInput = {
      name: 'Test Native',
      birthDate: '1990-05-21',
      birthTime: '08:15',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'Male',
    };

    const kundli = VedicAstroEngine.calculateKundli(input);

    expect(kundli.planets).toHaveLength(9);
    expect(kundli.houses).toHaveLength(12);

    const planetNames = kundli.planets.map((p) => p.name);
    expect(planetNames).toContain('Sun');
    expect(planetNames).toContain('Moon');
    expect(planetNames).toContain('Mars');
    expect(planetNames).toContain('Mercury');
    expect(planetNames).toContain('Jupiter');
    expect(planetNames).toContain('Venus');
    expect(planetNames).toContain('Saturn');
    expect(planetNames).toContain('Rahu');
    expect(planetNames).toContain('Ketu');

    // Ascendant should have sign and degrees
    expect(kundli.ascendant.details.degreeInSign).toBeGreaterThanOrEqual(0);
    expect(kundli.ascendant.details.degreeInSign).toBeLessThan(30);

    // Vimshottari dasha balance exists
    expect(kundli.dashas.balanceYearsRemaining).toBeGreaterThan(0);
    expect(kundli.dashas.allMahadashas).toHaveLength(9);
  });
});
