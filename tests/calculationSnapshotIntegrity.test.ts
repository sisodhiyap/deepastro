/**
 * DeepAstro Calculation Snapshot Integrity Test Suite
 * Validates:
 * 1. Complete persistence of all 24 required calculation parameters in CalculationSnapshot.
 * 2. Deep immutability: Snapshot is frozen and cannot be mutated by AI or runtime callers.
 * 3. Accurate snapshot difference detection (old vs new comparison for version auditing).
 */

import { describe, it, expect } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine, CalculationSnapshot } from '../server/src/astrology/CalculationSnapshot.js';

describe('DeepAstro Calculation Snapshot Integrity Suite', () => {
  const factSet = VedicAstroEngine.createAstrologyFactSet({
    name: 'Deepti',
    birthDate: '1988-03-02',
    birthTime: '07:15',
    birthPlace: 'Agra, UP, India',
    latitude: 27.1767,
    longitude: 78.0081,
    timezone: 5.5,
  });

  it('persists all 24 required parameters in the CalculationSnapshot', () => {
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, 'user_snapshot_test');

    // 1. Birth Date & Time
    expect(snapshot.birthDate).toBe('1988-03-02');
    expect(snapshot.birthTime).toBe('07:15');

    // 2. Timezone & IANA Timezone
    expect(snapshot.timezone).toBe(5.5);
    expect(snapshot.ianaTimezone).toBeDefined();

    // 3. Coordinates
    expect(snapshot.latitude).toBeCloseTo(27.1767, 4);
    expect(snapshot.longitude).toBeCloseTo(78.0081, 4);

    // 4. Julian Day
    expect(snapshot.julianDay).toBeGreaterThan(2447000);

    // 5. Ayanamsha Method & Exact Value
    expect(snapshot.ayanamshaMethod).toBe('Lahiri (Chitra Paksha)');
    expect(snapshot.ayanamshaExactValue).toBeCloseTo(23.6936, 2);

    // 6. Node Mode & House System
    expect(snapshot.nodeMode).toBe('True');
    expect(snapshot.houseSystem).toBe('Sripati');

    // 7. Ephemeris Version
    expect(snapshot.ephemerisVersion).toBeDefined();

    // 8. Divisional Charts D1-D60
    expect(snapshot.divisionalCharts.D1).toBeDefined();
    expect(snapshot.divisionalCharts.D9).toBeDefined();
    expect(snapshot.divisionalCharts.D60).toBeDefined();

    // 9. Planetary Positions with Nakshatra and Pada
    expect(snapshot.planetaryPositions.length).toBeGreaterThanOrEqual(9);
    for (const p of snapshot.planetaryPositions) {
      expect(p.planet).toBeDefined();
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
      expect(p.nakshatra).toBeDefined();
      expect(p.nakshatraNumber).toBeGreaterThanOrEqual(1);
      expect(p.nakshatraNumber).toBeLessThanOrEqual(27);
      expect(p.pada).toBeGreaterThanOrEqual(1);
      expect(p.pada).toBeLessThanOrEqual(4);
    }

    // 10. Dashas
    expect(snapshot.dashas.birthDashaLord).toBeDefined();
    expect(snapshot.dashas.currentMahadasha).toBeDefined();
    expect(snapshot.dashas.allMahadashas.length).toBe(9);

    // 11. Shadbala
    expect(snapshot.shadbala).toBeDefined();
    expect(snapshot.shadbala.Sun).toBeDefined();

    // 12. Ashtakavarga
    expect(snapshot.ashtakavarga).toBeDefined();
    expect(snapshot.ashtakavarga.totalBindus).toBe(337);

    // 13. Yogas & Doshas
    expect(snapshot.yogas).toBeDefined();
    expect(snapshot.doshas).toBeDefined();

    // 14. Panchang
    expect(snapshot.panchang).toBeDefined();

    // 15. Transits
    expect(snapshot.transits).toBeDefined();

    // 16. Calculation Version & Fingerprint
    expect(snapshot.calculationVersion).toBeDefined();
    expect(snapshot.calculationFingerprint).toBeDefined();
    expect(snapshot.calculationFingerprint.length).toBeGreaterThanOrEqual(16);

    // 17. Immutability flag
    expect(snapshot.isImmutable).toBe(true);
  });

  it('enforces object freezing: mutating snapshot properties fails', () => {
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(() => {
      // @ts-ignore
      snapshot.birthDate = '2000-01-01';
    }).toThrow();
  });

  it('accurately compares two snapshots and isolates coordinate differences', () => {
    const snap1 = CalculationSnapshotEngine.createSnapshot(factSet);

    // Compare identical snapshots
    const comp1 = CalculationSnapshotEngine.compareSnapshots(snap1, snap1);
    expect(comp1.isIdentical).toBe(true);
    expect(comp1.differences).toHaveLength(0);
    expect(comp1.maxPlanetaryDeviationDegrees).toBe(0);

    // Construct a slightly mutated snapshot (0.05 degree shift in Jupiter)
    const modifiedPositions = snap1.planetaryPositions.map(p => {
      if (p.planet === 'Jupiter') {
        return { ...p, longitude: p.longitude + 0.05 };
      }
      return p;
    });
    const snap2: CalculationSnapshot = {
      ...snap1,
      planetaryPositions: modifiedPositions,
    };

    const comp2 = CalculationSnapshotEngine.compareSnapshots(snap1, snap2);
    expect(comp2.isIdentical).toBe(false);
    expect(comp2.differences).toHaveLength(1);
    expect(comp2.differences[0].field).toBe('planet.Jupiter.longitude');
    expect(comp2.differences[0].differenceDegrees).toBeCloseTo(0.05, 3);
    expect(comp2.differences[0].significance).toBe('ASTRONOMICAL');
    expect(comp2.maxPlanetaryDeviationDegrees).toBeCloseTo(0.05, 3);
  });
});
