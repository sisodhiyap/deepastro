import { describe, it, expect } from 'vitest';
import { calculateAshtakoota } from '../server/src/astrology/CompatibilityEngine.js';

describe('Kundli Matching (Ashtakoota 36 Points)', () => {
  it('calculates all 8 kootas summing up to <= 36 points', () => {
    // Two sample moon sidereal longitudes
    const moonA = 45.5; // Rohini (Taurus)
    const moonB = 125.0; // Magha (Leo)

    const result = calculateAshtakoota(moonA, moonB, 'Partner A', 'Partner B');

    expect(result.kootas).toHaveLength(8);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(36);

    const maxPointsTotal = result.kootas.reduce((acc, curr) => acc + curr.maxPoints, 0);
    expect(maxPointsTotal).toBe(36);

    expect(result.percentageScore).toBeGreaterThanOrEqual(0);
    expect(result.percentageScore).toBeLessThanOrEqual(100);
    expect(['Exceptional', 'Very Good', 'Good', 'Average', 'Challenging']).toContain(result.verdict);
  });

  it('correctly handles Manglik balance without fatalistic phrasing', () => {
    const result = calculateAshtakoota(50, 180, 'Alice', 'Bob', true, false);
    expect(result.manglikBalance.isBalanced).toBe(false);
    expect(result.dimensions.marriageStability).not.toMatch(/will definitely fail/i);
    expect(result.dimensions.remedies.length).toBeGreaterThan(0);
  });
});
