import { describe, it, expect } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationCoreProtection } from '../server/src/astrology/CalculationCoreProtection.js';

describe('DEEPASTRO FORTRESS â€” Immutable Calculation Core', () => {
  it('Asserts CalculationCoreProtection permanently immutable', () => {
    expect(CalculationCoreProtection.assertImmutable()).toBe(true);
    expect(CalculationCoreProtection.CALCULATION_CORE_MUTABLE).toBe(false);
  });

  it('Produces 100% deterministic planetary calculations for identical birth coordinates', () => {
    const profile = {
      birthDate: '1992-08-24',
      birthTime: '10:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
    };

    const run1 = VedicAstroEngine.calculateKundli(profile);
    const run2 = VedicAstroEngine.calculateKundli(profile);

    const sun1 = run1.planets.find((p) => p.name === 'Sun');
    const sun2 = run2.planets.find((p) => p.name === 'Sun');
    expect(sun1?.siderealLongitude).toBeCloseTo(sun2?.siderealLongitude ?? 0, 6);
    expect(run1.ascendant.degrees).toBeCloseTo(run2.ascendant.degrees, 6);
    expect(run1.dashas.currentMahadasha.lord).toBe(run2.dashas.currentMahadasha.lord);
  });
});
