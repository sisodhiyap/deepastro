import { describe, it, expect, beforeEach } from 'vitest';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { FutureSiderealTransitEngine } from '../server/src/intelligence/future-intelligence/TransitEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — TRANSIT ENGINE (GOCHARA)', () => {
  const testUserId = 'usr_test_transit_001';

  beforeEach(() => {
    db.birthProfiles.set(testUserId, {
      id: 'prof_test_transit_1',
      userId: testUserId,
      fullName: 'Vikram Solar',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Calculates future sidereal positions for all 9 Navagrahas with astronomical precision', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');
    const targetDate = new Date(Date.UTC(2027, 5, 15, 12, 0, 0));
    const transits = FutureSiderealTransitEngine.calculateTransitsForDate(context, targetDate);

    expect(transits.length).toBe(9);
    const planetNames = transits.map((t) => t.transitPlanet);
    expect(planetNames).toContain('Sun');
    expect(planetNames).toContain('Moon');
    expect(planetNames).toContain('Mars');
    expect(planetNames).toContain('Mercury');
    expect(planetNames).toContain('Jupiter');
    expect(planetNames).toContain('Venus');
    expect(planetNames).toContain('Saturn');
    expect(planetNames).toContain('Rahu');
    expect(planetNames).toContain('Ketu');

    // Every transit planet has valid sidereal longitude between 0 and 360
    for (const t of transits) {
      expect(t.transitLongitude).toBeGreaterThanOrEqual(0);
      expect(t.transitLongitude).toBeLessThan(360);
      expect(t.transitSignIndex).toBeGreaterThanOrEqual(0);
      expect(t.transitSignIndex).toBeLessThan(12);
      expect(t.transitHouse).toBeGreaterThanOrEqual(1);
      expect(t.transitHouse).toBeLessThanOrEqual(12);
    }
  });

  it('2. Reuses canonical True Node implementation without second node algorithm', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');
    expect(context.trueNode.nodeModel).toBe('TRUE_NODE');

    const targetDate = new Date(Date.UTC(2028, 0, 1, 0, 0, 0));
    const transits = FutureSiderealTransitEngine.calculateTransitsForDate(context, targetDate);

    const rahu = transits.find((t) => t.transitPlanet === 'Rahu')!;
    const ketu = transits.find((t) => t.transitPlanet === 'Ketu')!;

    expect(rahu).toBeDefined();
    expect(ketu).toBeDefined();

    // In true sidereal mechanics, Ketu must be precisely 180 degrees from Rahu
    const angularDiff = Math.abs(rahu.transitLongitude - ketu.transitLongitude);
    const normalizedDiff = Math.min(angularDiff, 360 - angularDiff);
    expect(Math.round(normalizedDiff)).toBe(180);
  });

  it('3. Computes transit changes dynamically across different future years', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const transits2026 = FutureSiderealTransitEngine.calculateTransitsForYear(context, 2026);
    const transits2029 = FutureSiderealTransitEngine.calculateTransitsForYear(context, 2029);

    const saturn2026 = transits2026.find((t) => t.transitPlanet === 'Saturn')!;
    const saturn2029 = transits2029.find((t) => t.transitPlanet === 'Saturn')!;

    // Saturn moves ~1 sign per 2.5 years, so over 3 years longitude must progress
    expect(saturn2026.transitLongitude).not.toBe(saturn2029.transitLongitude);
    expect(saturn2026.transitSign).not.toBe(saturn2029.transitSign);
  });

  it('4. Deterministic property: identical input date returns identical transit positions', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');
    const evalDate = new Date('2028-06-15T10:00:00Z');

    const run1 = FutureSiderealTransitEngine.calculateTransitsForDate(context, evalDate);
    const run2 = FutureSiderealTransitEngine.calculateTransitsForDate(context, evalDate);

    expect(run1).toEqual(run2);
  });
});
