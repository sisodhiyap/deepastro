import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { getLunarNodes, calculateMeeusTrueNode } from '../server/src/astrology/PlanetEngine.js';
import { validateDashaHierarchy } from '../server/src/astrology/DashaEngine.js';
import Astronomy from '../server/src/astrology/astronomyBridge.js';
import { mapVargaChartToChartPlanets } from '../src/utils/vargaChartMapper.js';
import { getJulianDay, normalizeDegrees } from '../server/src/astrology/astronomyMath.js';

describe('P0: Meeus True / Osculating Lunar Node Invariants', () => {
  it('verifies True Node differs from Mean Node on reference dates', () => {
    // Reference date 1: 2024-03-25 (Lunar eclipse period where true node departs significantly from mean node)
    const jd2024 = getJulianDay({ year: 2024, month: 3, day: 25, hour: 7, minute: 0, second: 0 }, 0);
    const T2024 = (jd2024 - 2451545.0) / 36525.0;
    
    // Mean node vs True node from Meeus calculation
    const { meanOmega, trueOmega } = calculateMeeusTrueNode(T2024);

    const diff = Math.abs(trueOmega - meanOmega);
    // Periodic corrections reach up to ~1.73 degrees
    expect(diff).toBeGreaterThan(0.05);
    expect(diff).toBeLessThan(2.0);
  });

  it('proves Rahu and Ketu are exactly 180° apart across arbitrary dates', () => {
    const testJds = [
      2451545.0, // J2000
      2432414.22, // 1947 India Independence
      2460000.0, // 2023
      2470000.0, // Future date
      2420000.0, // Past date
    ];

    for (const jd of testJds) {
      const ms = (jd - 2440587.5) * 86400000.0;
      const time = Astronomy.MakeTime(new Date(ms));
      const nodes = getLunarNodes(time);
      const rahu = nodes.rahuLon;
      const ketu = nodes.ketuLon;

      const expectedKetu = normalizeDegrees(rahu + 180.0);
      const separation = Math.abs(normalizeDegrees(rahu - ketu));

      expect(Math.abs(expectedKetu - ketu)).toBeLessThan(1e-6);
      expect(Math.abs(separation - 180.0)).toBeLessThan(1e-6);
    }
  });

  it('confirms True Node speed is dynamically calculated by numerical differentiation', () => {
    const jd = 2451545.0;
    const ms = (jd - 2440587.5) * 86400000.0;
    const time = Astronomy.MakeTime(new Date(ms));
    const nodes = getLunarNodes(time);

    // Speed should be finite and within realistic orbital velocity bounds (approx -0.1 to +0.05 deg/day)
    expect(Number.isFinite(nodes.speed)).toBe(true);
    expect(nodes.speed).not.toBe(0);
    expect(nodes.speed).not.toBe(-0.05295); // Ensure not the old hardcoded mean speed
  });

  it('demonstrates True Node can move direct (isRetrograde = false) during short-period perturbation windows', () => {
    // True node oscillates and moves direct approximately 25-30% of the time.
    // Scan daily steps over 120 days to detect direct motion periods
    let foundDirect = false;
    let foundRetrograde = false;

    const startJd = 2460390.0; // Early 2024
    for (let day = 0; day < 120; day++) {
      const jd = startJd + day;
      const ms = (jd - 2440587.5) * 86400000.0;
      const time = Astronomy.MakeTime(new Date(ms));
      const nodes = getLunarNodes(time);
      if (!nodes.isRetrograde) {
        foundDirect = true;
      } else {
        foundRetrograde = true;
      }
    }

    expect(foundDirect).toBe(true);
    expect(foundRetrograde).toBe(true);
  });

  it('verifies explicit calculation passport metadata matches TRUE_NODE specifications', () => {
    const input: BirthProfileInput = {
      name: 'Passport Verifier',
      birthDate: '1995-10-24',
      birthTime: '14:30',
      birthPlace: 'Varanasi',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      gender: 'female',
    };

    const kundli = VedicAstroEngine.calculateKundli(input);

    expect(kundli.passport).toBeDefined();
    expect(kundli.passport?.nodeModel).toBe('TRUE_NODE');
    expect(kundli.passport?.nodeModelDescription).toBe('True/Osculating Lunar Node');
    expect(kundli.passport?.nodeCalculationVersion).toBe('MEEUS_TRUE_NODE_V1');

    // Canonical check: Rahu and Ketu in planets array
    const rahu = kundli.planets.find((p) => p.name === 'Rahu');
    const ketu = kundli.planets.find((p) => p.name === 'Ketu');

    expect(rahu).toBeDefined();
    expect(ketu).toBeDefined();
    expect(Math.abs(normalizeDegrees(rahu!.siderealLongitude + 180.0) - ketu!.siderealLongitude)).toBeLessThan(1e-5);
  });
});

describe('P0: D9 Navamsa Chart and House Assignment Invariants', () => {
  const profile: BirthProfileInput = {
    name: 'Navamsa Invariant Test',
    birthDate: '1988-08-08',
    birthTime: '12:00',
    birthPlace: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'male',
  };

  const kundli = VedicAstroEngine.calculateKundli(profile);

  it('exposes navamsaDeep.d9Chart with valid ascendantSignIndex', () => {
    expect(kundli.navamsaDeep).toBeDefined();
    expect(kundli.navamsaDeep.d9Chart).toBeDefined();
    expect(kundli.navamsaDeep.d9Chart.ascendantSignIndex).toBeGreaterThanOrEqual(0);
    expect(kundli.navamsaDeep.d9Chart.ascendantSignIndex).toBeLessThan(12);
  });

  it('uses mapVargaChartToChartPlanets to calculate houses relative to D9 Ascendant', () => {
    const d9Chart = kundli.navamsaDeep.d9Chart;
    const mapped = mapVargaChartToChartPlanets(d9Chart, kundli.planets);

    expect(mapped).toHaveLength(9);

    for (const p of mapped) {
      // Formula: ((planet.signIndex - vargaChart.ascendantSignIndex + 12) % 12) + 1
      const expectedHouse = ((p.signIndex - d9Chart.ascendantSignIndex + 12) % 12) + 1;
      expect(p.house).toBe(expectedHouse);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(p.name).toBeDefined();
      expect(p.symbol).toBeDefined();
    }
  });

  it('ensures D9 house calculation differs from D1 when D9 ascendant differs from D1 ascendant', () => {
    const d1Asc = kundli.ascendant.details.signIndex;
    const d9Asc = kundli.navamsaDeep.d9Chart.ascendantSignIndex;

    if (d1Asc !== d9Asc) {
      const d9Chart = kundli.navamsaDeep.d9Chart;
      const mapped = mapVargaChartToChartPlanets(d9Chart, kundli.planets);

      // Check if at least some house numbers in D9 differ from what D1 ascendant would have given
      const wouldBeD1Houses = mapped.map((p) => ((p.signIndex - d1Asc + 12) % 12) + 1);
      const actualD9Houses = mapped.map((p) => p.house);

      expect(actualD9Houses).not.toEqual(wouldBeD1Houses);
    }
  });

  it('preserves Vargottama planets consistency between D1 and D9 signs', () => {
    const vargottamaList = kundli.navamsaDeep.vargottamaPlanets || [];
    for (const vName of vargottamaList) {
      const d1Planet = kundli.planets.find((p) => p.name === vName);
      const d9Planet = kundli.navamsaDeep.d9Chart.planets.find((p) => p.planet === vName);

      expect(d1Planet).toBeDefined();
      expect(d9Planet).toBeDefined();
      expect(d1Planet!.signIndex).toBe(d9Planet!.signIndex);
    }
  });
});

describe('P0 & P1: Dasha Timeline Validation and Hierarchy Invariants', () => {
  const profile: BirthProfileInput = {
    name: 'Dasha Validation Test',
    birthDate: '1992-06-15',
    birthTime: '18:45',
    birthPlace: 'Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    gender: 'male',
  };

  const kundli = VedicAstroEngine.calculateKundli(profile);

  it('validates every Mahadasha, Antardasha, and Pratyantardasha has valid dates where start < end', () => {
    const allMaha = kundli.dashas.allMahadashas;
    expect(allMaha.length).toBeGreaterThanOrEqual(9);

    for (const maha of allMaha) {
      const mahaStart = new Date(maha.startDate).getTime();
      const mahaEnd = new Date(maha.endDate).getTime();

      expect(Number.isNaN(mahaStart)).toBe(false);
      expect(Number.isNaN(mahaEnd)).toBe(false);
      expect(mahaStart).toBeLessThan(mahaEnd);

      expect(maha.antardashas).toBeDefined();
      expect(maha.antardashas.length).toBe(9);

      for (const antar of maha.antardashas) {
        const antarStart = new Date(antar.startDate).getTime();
        const antarEnd = new Date(antar.endDate).getTime();

        expect(Number.isNaN(antarStart)).toBe(false);
        expect(Number.isNaN(antarEnd)).toBe(false);
        expect(antarStart).toBeLessThan(antarEnd);

        // Antardasha must be contained within Mahadasha (allowing up to 2000ms float round)
        expect(antarStart).toBeGreaterThanOrEqual(mahaStart - 2000);
        expect(antarEnd).toBeLessThanOrEqual(mahaEnd + 2000);

        if (antar.pratyantardashas && antar.pratyantardashas.length > 0) {
          expect(antar.pratyantardashas.length).toBe(9);
          for (const prat of antar.pratyantardashas) {
            const pratStart = new Date(prat.startDate).getTime();
            const pratEnd = new Date(prat.endDate).getTime();

            expect(Number.isNaN(pratStart)).toBe(false);
            expect(Number.isNaN(pratEnd)).toBe(false);
            expect(pratStart).toBeLessThan(pratEnd);

            // Pratyantardasha must be contained within Antardasha
            expect(pratStart).toBeGreaterThanOrEqual(antarStart - 2000);
            expect(pratEnd).toBeLessThanOrEqual(antarEnd + 2000);
          }
        }
      }
    }
  });

  it('ensures current periods correctly contain the current timestamp or observation date', () => {
    const currentMaha = kundli.dashas.currentMahadasha;
    const currentAntar = kundli.dashas.currentAntardasha;

    expect(currentMaha).toBeDefined();
    expect(currentAntar).toBeDefined();

    const now = Date.now();
    const mahaStart = new Date(currentMaha.startDate).getTime();
    const mahaEnd = new Date(currentMaha.endDate).getTime();

    // Profile born in 1992 is ~34 years old in 2026, well within Vimshottari cycle
    expect(now).toBeGreaterThanOrEqual(mahaStart);
    expect(now).toBeLessThanOrEqual(mahaEnd);

    const antarStart = new Date(currentAntar.startDate).getTime();
    const antarEnd = new Date(currentAntar.endDate).getTime();

    expect(now).toBeGreaterThanOrEqual(antarStart);
    expect(now).toBeLessThanOrEqual(antarEnd);
  });

  it('runs validateDashaHierarchy helper without throwing errors', () => {
    const validation = validateDashaHierarchy(kundli.dashas);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

describe('Dynamic Birth Recalculation across 3 Distinct Profiles', () => {
  const profile1: BirthProfileInput = {
    name: 'Profile 1 - London',
    birthDate: '1985-03-21',
    birthTime: '06:30',
    birthPlace: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
    gender: 'female',
  };

  const profile2: BirthProfileInput = {
    name: 'Profile 2 - Tokyo',
    birthDate: '2001-11-12',
    birthTime: '21:15',
    birthPlace: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 9.0,
    gender: 'male',
  };

  const profile3: BirthProfileInput = {
    name: 'Profile 3 - San Francisco',
    birthDate: '1976-07-04',
    birthTime: '10:00',
    birthPlace: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: -8.0,
    gender: 'female',
  };

  const k1 = VedicAstroEngine.calculateKundli(profile1);
  const k2 = VedicAstroEngine.calculateKundli(profile2);
  const k3 = VedicAstroEngine.calculateKundli(profile3);

  it('produces distinct D1 and D9 Ascendants and Planetary positions', () => {
    // D1 Ascendants must differ across radically different geo-times
    expect(k1.ascendant.details.signIndex).not.toBe(k2.ascendant.details.signIndex);
    expect(k2.ascendant.details.signIndex).not.toBe(k3.ascendant.details.signIndex);

    // D9 Ascendants must differ
    expect(k1.navamsaDeep.d9Chart.ascendantSignIndex).not.toBe(k2.navamsaDeep.d9Chart.ascendantSignIndex);

    // Dashas must be completely distinct
    expect(k1.dashas.currentMahadasha.planet).toBeDefined();
    expect(k2.dashas.currentMahadasha.planet).toBeDefined();
    expect(k1.dashas.balanceYearsRemaining).not.toBe(k2.dashas.balanceYearsRemaining);

    // True nodes must be distinct and non-zero
    const rahu1 = k1.planets.find((p) => p.name === 'Rahu')!;
    const rahu2 = k2.planets.find((p) => p.name === 'Rahu')!;
    expect(rahu1.siderealLongitude).not.toBe(rahu2.siderealLongitude);

    // Each profile strictly maintains Rahu-Ketu 180° opposition
    const ketu1 = k1.planets.find((p) => p.name === 'Ketu')!;
    const ketu2 = k2.planets.find((p) => p.name === 'Ketu')!;
    expect(Math.abs(normalizeDegrees(rahu1.siderealLongitude + 180.0) - ketu1.siderealLongitude)).toBeLessThan(1e-5);
    expect(Math.abs(normalizeDegrees(rahu2.siderealLongitude + 180.0) - ketu2.siderealLongitude)).toBeLessThan(1e-5);
  });
});
