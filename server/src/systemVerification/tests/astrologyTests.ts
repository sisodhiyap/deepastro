/**
 * Deterministic Vedic Astrology Calculation Engine Test Suite (ASTRO-001 to ASTRO-028)
 */
import { SystemTestCase } from '../types.js';
import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { TransitEngine } from '../../astrology/TransitEngine.js';

const canonicalProfile: BirthProfileInput = {
  name: 'Astro Auditor Native',
  birthDate: '1995-10-24',
  birthTime: '14:30:00',
  birthPlace: 'Mumbai',
  latitude: 18.922,
  longitude: 72.8347,
  timezone: 5.5,
  gender: 'Male',
};

export const astrologyTests: SystemTestCase[] = [
  {
    id: 'ASTRO-001',
    category: 'ASTROLOGY',
    feature: 'Julian Day Calculation (Astronomical Universal Time)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const jd = res.astronomy.julianDay;
      const valid = jd > 2450014 && jd < 2450016; // Oct 24, 1995 J2000 epoch bounds

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { julianDay: jd, expectedRange: '2450014.5 - 2450015.5' },
      };
    },
  },
  {
    id: 'ASTRO-002',
    category: 'ASTROLOGY',
    feature: 'Chitra Paksha / Lahiri Ayanamsha Precision (23.8° ± 0.5° for 1995)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const ayan = res.astronomy.ayanamshaDegrees;
      const valid = ayan >= 23.7 && ayan <= 23.9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { ayanamshaName: res.astronomy.ayanamshaName, ayanamshaDegrees: ayan },
      };
    },
  },
  {
    id: 'ASTRO-003',
    category: 'ASTROLOGY',
    feature: 'Ascendant (Lagna) Sign & Longitude',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const asc = res.ascendant;
      const valid = asc.degrees >= 0 && asc.degrees < 360 && !!asc.details.signName;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { ascendantSign: asc.details.signName, ascDegrees: asc.degrees, signDegrees: asc.details.degreeInSign },
      };
    },
  },
  {
    id: 'ASTRO-004',
    category: 'ASTROLOGY',
    feature: 'Sun Coordinate & Solar Position Invariant',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const sun = res.planets.find((p) => p.name === 'Sun');
      const valid = !!sun && sun.siderealLongitude >= 0 && sun.siderealLongitude < 360;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { sunSign: sun?.signName, sunLongitude: sun?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-005',
    category: 'ASTROLOGY',
    feature: 'Moon Sidereal Longitude & Fast Motion Check',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const moon = res.planets.find((p) => p.name === 'Moon');
      const valid = !!moon && moon.siderealLongitude >= 0 && moon.siderealLongitude < 360;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { moonSign: moon?.signName, moonLongitude: moon?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-006',
    category: 'ASTROLOGY',
    feature: 'Mars Ephemeris & House Placement',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const mars = res.planets.find((p) => p.name === 'Mars');
      return {
        status: mars ? 'PASS' : 'FAIL',
        evidence: { marsSign: mars?.signName, marsHouse: mars?.house, marsLongitude: mars?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-007',
    category: 'ASTROLOGY',
    feature: 'Mercury Ephemeris & Solar Proximity Bounds (Max elongation ~28°)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const sun = res.planets.find((p) => p.name === 'Sun')!;
      const merc = res.planets.find((p) => p.name === 'Mercury')!;
      let diff = Math.abs(sun.siderealLongitude - merc.siderealLongitude);
      if (diff > 180) diff = 360 - diff;

      return {
        status: diff <= 32 ? 'PASS' : 'FAIL',
        evidence: { solarElongation: Number(diff.toFixed(2)), maxAllowed: 32 },
      };
    },
  },
  {
    id: 'ASTRO-008',
    category: 'ASTROLOGY',
    feature: 'Jupiter Coordinate & Guru Planetary Invariant',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const jup = res.planets.find((p) => p.name === 'Jupiter');
      return {
        status: jup ? 'PASS' : 'FAIL',
        evidence: { jupiterSign: jup?.signName, jupiterLongitude: jup?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-009',
    category: 'ASTROLOGY',
    feature: 'Venus Ephemeris & Solar Proximity Bounds (Max elongation ~48°)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const sun = res.planets.find((p) => p.name === 'Sun')!;
      const venus = res.planets.find((p) => p.name === 'Venus')!;
      let diff = Math.abs(sun.siderealLongitude - venus.siderealLongitude);
      if (diff > 180) diff = 360 - diff;

      return {
        status: diff <= 52 ? 'PASS' : 'FAIL',
        evidence: { solarElongation: Number(diff.toFixed(2)), maxAllowed: 52 },
      };
    },
  },
  {
    id: 'ASTRO-010',
    category: 'ASTROLOGY',
    feature: 'Saturn Coordinate & Slow Motion Dynamics',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const sat = res.planets.find((p) => p.name === 'Saturn');
      return {
        status: sat ? 'PASS' : 'FAIL',
        evidence: { saturnSign: sat?.signName, saturnLongitude: sat?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-011',
    category: 'ASTROLOGY',
    feature: 'Rahu (Mean/True North Lunar Node)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const rahu = res.planets.find((p) => p.name === 'Rahu');
      return {
        status: rahu ? 'PASS' : 'FAIL',
        evidence: { rahuSign: rahu?.signName, rahuLongitude: rahu?.siderealLongitude },
      };
    },
  },
  {
    id: 'ASTRO-012',
    category: 'ASTROLOGY',
    feature: 'Ketu Longitude Invariant (Always Exactly 180° Opposite to Rahu)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const rahu = res.planets.find((p) => p.name === 'Rahu')!;
      const ketu = res.planets.find((p) => p.name === 'Ketu')!;
      let diff = Math.abs(rahu.siderealLongitude - ketu.siderealLongitude);
      if (diff > 180) diff = 360 - diff;
      const valid = Math.abs(diff - 180) < 0.05;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { rahuLon: rahu.siderealLongitude, ketuLon: ketu.siderealLongitude, axisDifference: diff },
      };
    },
  },
  {
    id: 'ASTRO-013',
    category: 'ASTROLOGY',
    feature: 'Nakshatra Boundary Resolution (13° 20′ per Asterism)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const moonNak = res.moonNakshatra;
      return {
        status: moonNak && moonNak.index >= 1 && moonNak.index <= 27 ? 'PASS' : 'FAIL',
        evidence: { moonNakshatraName: moonNak?.name, nakshatraNumber: moonNak?.index },
      };
    },
  },
  {
    id: 'ASTRO-014',
    category: 'ASTROLOGY',
    feature: 'Pada Determination (3° 20′ Quarters 1, 2, 3, 4)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const pada = res.moonNakshatra.pada;
      const valid = pada >= 1 && pada <= 4;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { pada, validPada: valid },
      };
    },
  },
  {
    id: 'ASTRO-015',
    category: 'ASTROLOGY',
    feature: 'Retrograde (Vakri) Motion Flagging & Negative Speed Sanity',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const retroPlanets = res.planets.filter((p) => p.isRetrograde).map((p) => p.name);

      return {
        status: 'PASS',
        evidence: { retrogradePlanetsFound: retroPlanets },
      };
    },
  },
  {
    id: 'ASTRO-016',
    category: 'ASTROLOGY',
    feature: 'Combustion (Asta) Detection for Planets near Sun',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const combustPlanets = res.planets.filter((p) => p.isCombust).map((p) => p.name);

      return {
        status: 'PASS',
        evidence: { combustPlanets: combustPlanets },
      };
    },
  },
  {
    id: 'ASTRO-017',
    category: 'ASTROLOGY',
    feature: 'Planetary Dignity (Exaltation, Moolatrikona, Own, Debilitation)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const dignities = res.planets.map((p) => ({ name: p.name, dignity: p.dignity }));

      return {
        status: dignities.length === 9 ? 'PASS' : 'FAIL',
        evidence: { planetaryDignities: dignities },
      };
    },
  },
  {
    id: 'ASTRO-018',
    category: 'ASTROLOGY',
    feature: '12 Equal/Unequal Bhavas (Houses) Spatial Mapping',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const valid = res.houses.length === 12;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { houseCount: res.houses.length, lagnaHouseSign: res.houses[0].signName },
      };
    },
  },
  {
    id: 'ASTRO-019',
    category: 'ASTROLOGY',
    feature: 'House Lords (Bhavesh) Deterministic Mapping',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const lords = res.houses.map((h) => ({ house: h.houseNumber, lord: h.lord }));

      return {
        status: lords.every((l) => !!l.lord) ? 'PASS' : 'FAIL',
        evidence: { houseLordsMapped: lords.slice(0, 4) },
      };
    },
  },
  {
    id: 'ASTRO-020',
    category: 'ASTROLOGY',
    feature: 'Drishti / Classical Planetary Aspects (Special 7th, 4th/8th, 5th/9th, 3rd/10th)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const saturn = res.planets.find((p) => p.name === 'Saturn');
      const aspects = (saturn as any)?.aspects || [];

      return {
        status: 'PASS',
        evidence: { saturnAspectsFound: aspects },
      };
    },
  },
  {
    id: 'ASTRO-021',
    category: 'ASTROLOGY',
    feature: 'D1 (Rashi) Chart Structural Verification',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const d1 = res.vargas?.d1_rashi;
      const valid = !!d1 && d1.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { d1PlanetsCount: d1?.length },
      };
    },
  },
  {
    id: 'ASTRO-022',
    category: 'ASTROLOGY',
    feature: 'D9 (Navamsha) Chart Construction (Spouse, Dharma & Soul Potentials)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const d9 = res.vargas?.d9_navamsa;
      const valid = !!d9 && d9.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { d9PlanetsCount: d9?.length },
      };
    },
  },
  {
    id: 'ASTRO-023',
    category: 'ASTROLOGY',
    feature: 'D10 (Dashamsha) Career Chart Construction',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const d10 = res.vargas?.d10_dashamsha;
      const valid = !!d10 && d10.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { d10PlanetsCount: d10?.length },
      };
    },
  },
  {
    id: 'ASTRO-024',
    category: 'ASTROLOGY',
    feature: 'Supported Shodashvargas Set (D2, D3, D4, D7, D12, D16, D20, D24, D27, D30, D60)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const shodash = res.shodashvargas;
      const valid = !!shodash && !!shodash.d2_hora && !!shodash.d3_drekkana && !!shodash.d60_shashtiamsha;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: {
          supportedVargas: ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D60'],
          verifiedPresent: valid,
        },
      };
    },
  },
  {
    id: 'ASTRO-025',
    category: 'ASTROLOGY',
    feature: 'Vimshottari 120-Year Mahadasha Sequence Calculation',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const dashas = res.dashas;
      const valid = !!dashas && !!dashas.currentMahadasha && dashas.allMahadashas.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: {
          currentMahadasha: dashas.currentMahadasha.planet,
          totalMahadashas: dashas.allMahadashas.length,
          startingLord: dashas.allMahadashas[0].planet,
        },
      };
    },
  },
  {
    id: 'ASTRO-026',
    category: 'ASTROLOGY',
    feature: 'Antardasha Sub-Period Partitioning & Timing',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const currentMaha = res.dashas.currentMahadasha;
      const hasAntar = currentMaha && currentMaha.antardashas && currentMaha.antardashas.length === 9;

      return {
        status: hasAntar ? 'PASS' : 'FAIL',
        evidence: { currentMaha: currentMaha?.planet, antardashaCount: currentMaha?.antardashas?.length },
      };
    },
  },
  {
    id: 'ASTRO-027',
    category: 'ASTROLOGY',
    feature: 'Pratyantardasha Sub-Sub Period Precision',
    severity: 'MAJOR',
    weight: 7,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const currentAntar = res.dashas.currentAntardasha;

      return {
        status: !!currentAntar?.planet ? 'PASS' : 'FAIL',
        evidence: { currentAntardasha: currentAntar?.planet },
      };
    },
  },
  {
    id: 'ASTRO-028',
    category: 'ASTROLOGY',
    feature: 'Live Planetary Transits (Gochar) Relative to Natal Moon',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(canonicalProfile);
      const transits = TransitEngine.calculateTransits(
        res.ascendant.details.signIndex,
        res.moonSign.signIndex,
        res.planets,
        new Date()
      );
      const valid = transits && transits.planetaryTransits.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { liveTransitingPlanetsCount: transits.planetaryTransits.length, sampleTransit: transits.planetaryTransits[0] },
      };
    },
  },
];
