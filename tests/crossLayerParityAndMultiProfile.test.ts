import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotService } from '../server/src/services/CalculationSnapshotService.js';
import { normalizeDegrees } from '../server/src/astrology/astronomyMath.js';

describe('Phase 25 & 26 — Cross-Layer Parity and 5-Profile Universal Regression Suite', () => {
  const profiles: Array<{ id: string; label: string; input: BirthProfileInput }> = [
    {
      id: 'p1',
      label: 'Standard Modern (Deepti QA)',
      input: {
        name: 'Deepti QA',
        birthDate: '1990-10-15',
        birthTime: '08:30:00',
        birthPlace: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
      },
    },
    {
      id: 'p2',
      label: 'Leap Year Profile (Feb 29)',
      input: {
        name: 'Leap Native',
        birthDate: '2000-02-29',
        birthTime: '14:15:00',
        birthPlace: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 5.5,
      },
    },
    {
      id: 'p3',
      label: 'Near Midnight Boundary (23:59:30)',
      input: {
        name: 'Midnight Native',
        birthDate: '1985-06-21',
        birthTime: '23:59:30',
        birthPlace: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 1.0,
      },
    },
    {
      id: 'p4',
      label: 'Western Hemisphere (New York, -5.0 TZ)',
      input: {
        name: 'New York Native',
        birthDate: '1995-11-12',
        birthTime: '04:30:00',
        birthPlace: 'New York, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5.0,
      },
    },
    {
      id: 'p5',
      label: 'Southern Hemisphere (Sydney, Australia)',
      input: {
        name: 'Sydney Native',
        birthDate: '1992-08-18',
        birthTime: '18:45:00',
        birthPlace: 'Sydney, Australia',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 10.0,
      },
    },
  ];

  it('verifies mathematical invariance across all 5 diverse geographical profiles', () => {
    const fingerprints = new Set<string>();
    const lagnaSigns = new Set<string>();

    for (const { label, input } of profiles) {
      const chart = VedicAstroEngine.calculateKundli(input);

      // 1. Calculation Fingerprint uniqueness
      const fp = CalculationSnapshotService.generateFingerprint(input);
      expect(fp).toBeDefined();
      expect(fp.length).toBe(64);
      fingerprints.add(fp);

      // 2. Ascendant / Lagna
      expect(chart.ascendant.degrees).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant.degrees).toBeLessThan(360);
      lagnaSigns.add(chart.ascendant.details.signName);

      // 3. 9 Navagrahas Presence
      expect(chart.planets).toHaveLength(9);
      const names = chart.planets.map((p) => p.name);
      expect(names).toEqual(
        expect.arrayContaining(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'])
      );

      // 4. True Node 180° Invariance
      const rahu = chart.planets.find((p) => p.name === 'Rahu')!;
      const ketu = chart.planets.find((p) => p.name === 'Ketu')!;
      const expectedKetu = normalizeDegrees(rahu.siderealLongitude + 180.0);
      const diff = Math.abs(expectedKetu - ketu.siderealLongitude);
      expect(diff).toBeLessThan(1e-5);

      // 5. D9 Navamsa Independent Ascendant
      expect(chart.navamsaDeep).toBeDefined();
      expect(chart.navamsaDeep.d9AscendantSign).toBeDefined();
      expect(chart.navamsaDeep.d9Chart.planets).toHaveLength(9);

      // 6. D9 House Computation: ((planetSign - d9AscendantSign + 12) % 12) + 1
      const d9AscIndex = chart.navamsaDeep.d9Chart.ascendantSignIndex;
      for (const d9p of chart.navamsaDeep.d9Chart.planets) {
        const expectedHouse = ((d9p.signIndex - d9AscIndex + 12) % 12) + 1;
        expect(d9p.houseInVarga).toBe(expectedHouse);
      }

      // 7. Vimshottari Dasha Hierarchy
      expect(chart.dashas.allMahadashas.length).toBeGreaterThanOrEqual(9);
      expect(chart.dashas.currentMahadasha).toBeDefined();
      expect(chart.dashas.currentAntardasha).toBeDefined();
      expect(chart.dashas.currentPratyantardasha).toBeDefined();
      expect(new Date(chart.dashas.currentMahadasha.startDate).getTime()).toBeLessThan(
        new Date(chart.dashas.currentMahadasha.endDate).getTime()
      );
    }

    // Ensure profiles produce diverse distinct fingerprints and ascendants
    expect(fingerprints.size).toBe(5);
    expect(lagnaSigns.size).toBeGreaterThanOrEqual(4);
  });

  it('validates cross-layer parity between Calculation Engine, Snapshot Serialization, and D9 Model', async () => {
    const qaProfile = profiles[0].input;
    const engineChart = VedicAstroEngine.calculateKundli(qaProfile);

    // Save snapshot
    const fp = CalculationSnapshotService.generateFingerprint(qaProfile);
    const snap = await CalculationSnapshotService.saveSnapshot({
      authUserId: 'qa_user_parity',
      fingerprint: fp,
      payload: engineChart,
    });

    const retrieved = await CalculationSnapshotService.getSnapshot('qa_user_parity', fp);
    expect(retrieved).toBeDefined();

    // Verify Cross-Layer Field Parity Table:
    // FIELD | ENGINE | SNAPSHOT | MATCH
    const fields = [
      { field: 'Lagna Degrees', engine: engineChart.ascendant.degrees, snap: retrieved.ascendant.degrees },
      { field: 'Lagna Sign', engine: engineChart.ascendant.details.signName, snap: retrieved.ascendant.details.signName },
      { field: 'Sun Longitude', engine: engineChart.planets[0].siderealLongitude, snap: retrieved.planets[0].siderealLongitude },
      { field: 'Rahu Longitude', engine: engineChart.planets[7].siderealLongitude, snap: retrieved.planets[7].siderealLongitude },
      { field: 'Ketu Longitude', engine: engineChart.planets[8].siderealLongitude, snap: retrieved.planets[8].siderealLongitude },
      { field: 'D9 Ascendant', engine: engineChart.navamsaDeep.d9AscendantSign, snap: retrieved.navamsaDeep.d9AscendantSign },
      { field: 'Current Mahadasha', engine: engineChart.dashas.currentMahadasha.planet, snap: retrieved.dashas.currentMahadasha.planet },
    ];

    for (const item of fields) {
      expect(item.engine).toBe(item.snap);
    }
  });
});
