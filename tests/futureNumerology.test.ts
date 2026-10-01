import { describe, it, expect, beforeEach } from 'vitest';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { NumerologyForecastEngine } from '../server/src/intelligence/future-intelligence/NumerologyForecastEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — NUMEROLOGY ENGINE', () => {
  const testUserId = 'usr_test_num_001';

  beforeEach(() => {
    db.birthProfiles.set(testUserId, {
      id: 'prof_test_num_1',
      userId: testUserId,
      fullName: 'Priya Sharma',
      birthDate: '1992-04-18', // Day: 18 -> 1+8=9, Month: 4 -> 4
      birthTime: '11:15',
      birthPlace: 'Jaipur, India',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Calculates dynamic Personal Year cycles for consecutive future years', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const py2026 = NumerologyForecastEngine.calculatePersonalYear(context, 2026);
    const py2027 = NumerologyForecastEngine.calculatePersonalYear(context, 2027);
    const py2028 = NumerologyForecastEngine.calculatePersonalYear(context, 2028);

    expect(py2026.personalYear).toBeGreaterThanOrEqual(1);
    expect(py2026.personalYear).toBeLessThanOrEqual(9);

    // Personal Year increments cyclically each Gregorian year (mod 9)
    const expected2027 = (py2026.personalYear % 9) + 1;
    expect(py2027.personalYear).toBe(expected2027);

    const expected2028 = (py2027.personalYear % 9) + 1;
    expect(py2028.personalYear).toBe(expected2028);

    expect(py2026.theme).toBeDefined();
    expect(py2026.focus).toBeDefined();
    expect(py2026.evidence.source).toBe('NUMEROLOGY');
    expect(py2026.evidence.weight).toBe(0.10); // Strictly secondary weight
  });

  it('2. Calculates Personal Month cycles dynamically', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const m1 = NumerologyForecastEngine.calculatePersonalMonth(context, 2027, 1);
    const m2 = NumerologyForecastEngine.calculatePersonalMonth(context, 2027, 2);

    expect(m1.personalMonth).toBeGreaterThanOrEqual(1);
    expect(m1.personalMonth).toBeLessThanOrEqual(9);
    expect(m2.personalMonth).toBe((m1.personalMonth % 9) + 1);
  });

  it('3. Deterministic property: identical year returns identical numerology output', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const run1 = NumerologyForecastEngine.calculatePersonalYear(context, 2030);
    const run2 = NumerologyForecastEngine.calculatePersonalYear(context, 2030);

    expect(run1).toEqual(run2);
  });
});
