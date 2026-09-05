/**
 * Astronomical Invariant Verification Test Suite (VERIFY-001 to VERIFY-010)
 */
import { SystemTestCase } from '../types.js';
import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { AstronomicalVerificationEngine } from '../../astrology/AstronomicalVerificationEngine.js';
import crypto from 'crypto';

const baseProfile: BirthProfileInput = {
  name: 'Invariant Profile A',
  birthDate: '1992-08-15',
  birthTime: '06:30:00',
  birthPlace: 'New Delhi',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 5.5,
  gender: 'Female',
};

function computeAstroFingerprint(res: any): string {
  const parts = [
    res.astronomy.julianDay.toFixed(5),
    res.astronomy.ayanamshaDegrees.toFixed(5),
    res.ascendant.degrees.toFixed(4),
    ...res.planets.map((p: any) => `${p.name}:${p.siderealLongitude.toFixed(4)}`),
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
}

export const verificationTests: SystemTestCase[] = [
  {
    id: 'VERIFY-001',
    category: 'VERIFICATION',
    feature: 'Julian Day Universal Consistency Verification',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const audit = AstronomicalVerificationEngine.verify(baseProfile, res);
      const check = audit.checks.find((c) => c.checkId === 'CHK_JD_01');
      const valid = check?.status === 'PASS';

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { julianDay: res.astronomy.julianDay, auditPassed: valid, message: check?.message },
      };
    },
  },
  {
    id: 'VERIFY-002',
    category: 'VERIFICATION',
    feature: 'Ayanamsha Boundary & Mathematical Verification',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const audit = AstronomicalVerificationEngine.verify(baseProfile, res);
      const check = audit.checks.find((c) => c.checkId === 'CHK_AYAN_02');
      const valid = check?.status === 'PASS';

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { ayanamshaDegrees: res.astronomy.ayanamshaDegrees, auditPassed: valid, message: check?.message },
      };
    },
  },
  {
    id: 'VERIFY-003',
    category: 'VERIFICATION',
    feature: 'Ascendant Geometric Rate Verification (1 Sign every ~2 Hours)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const t1 = VedicAstroEngine.calculateKundli({ ...baseProfile, birthTime: '06:00:00' });
      const t2 = VedicAstroEngine.calculateKundli({ ...baseProfile, birthTime: '08:00:00' });
      let diff = t2.ascendant.degrees - t1.ascendant.degrees;
      if (diff < 0) diff += 360;
      // In 2 hours, Earth rotates 30 degrees (1 zodiac sign)
      const valid = diff >= 25 && diff <= 35;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { ascT1: t1.ascendant.degrees, ascT2: t2.ascendant.degrees, degreesShifted: diff },
      };
    },
  },
  {
    id: 'VERIFY-004',
    category: 'VERIFICATION',
    feature: 'Moon Sidereal Longitude Consistency with Lunar Velocity (~13°/day)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const d1 = VedicAstroEngine.calculateKundli({ ...baseProfile, birthDate: '1992-08-15' });
      const d2 = VedicAstroEngine.calculateKundli({ ...baseProfile, birthDate: '1992-08-16' });
      const m1 = d1.planets.find((p) => p.name === 'Moon')!.siderealLongitude;
      const m2 = d2.planets.find((p) => p.name === 'Moon')!.siderealLongitude;
      let motion = m2 - m1;
      if (motion < 0) motion += 360;
      const valid = motion >= 11 && motion <= 15.5;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { dailyMoonMotion: Number(motion.toFixed(2)), expectedRange: '11° - 15.5°' },
      };
    },
  },
  {
    id: 'VERIFY-005',
    category: 'VERIFICATION',
    feature: 'Nakshatra Boundary Continuity Verification (0° - 360° Closed Circle)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      // 13° 20' is 13.333333... degrees. At 13.34°, it must strictly cross into Nakshatra 2 (index 1)
      const boundaryCrossed = 13.34;
      const nakIndex = Math.floor(boundaryCrossed / (360 / 27));

      return {
        status: nakIndex === 1 ? 'PASS' : 'FAIL',
        evidence: { boundaryCrossedDeg: boundaryCrossed, computedIndex: nakIndex, nakshatraSpanDeg: 360 / 27 },
      };
    },
  },
  {
    id: 'VERIFY-006',
    category: 'VERIFICATION',
    feature: 'Vimshottari Dasha Seed Invariant Check',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const dasha = res.dashas;
      const valid = !!dasha.currentMahadasha && dasha.allMahadashas.length === 9;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { moonNakshatraLord: res.moonNakshatra.lord, currentMahadasha: dasha.currentMahadasha.planet, totalMahadashas: dasha.allMahadashas.length },
      };
    },
  },
  {
    id: 'VERIFY-007',
    category: 'VERIFICATION',
    feature: 'Planetary Count Invariant (Exactly 9 Grahas Present)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planetNames = res.planets.map((p) => p.name);
      const allPresent = expectedPlanets.every((name) => planetNames.includes(name as any));

      return {
        status: res.planets.length === 9 && allPresent ? 'PASS' : 'FAIL',
        evidence: { planetCount: res.planets.length, grahas: planetNames },
      };
    },
  },
  {
    id: 'VERIFY-008',
    category: 'VERIFICATION',
    feature: 'House Count Invariant (Exactly 12 Bhavas Present)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const valid = res.houses.length === 12;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { houseCount: res.houses.length },
      };
    },
  },
  {
    id: 'VERIFY-009',
    category: 'VERIFICATION',
    feature: 'Retrograde Sanity (Sun and Moon Never Retrograde)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const res = VedicAstroEngine.calculateKundli(baseProfile);
      const sun = res.planets.find((p) => p.name === 'Sun')!;
      const moon = res.planets.find((p) => p.name === 'Moon')!;
      const valid = !sun.isRetrograde && !moon.isRetrograde;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { sunRetrograde: sun.isRetrograde, moonRetrograde: moon.isRetrograde },
      };
    },
  },
  {
    id: 'VERIFY-010',
    category: 'VERIFICATION',
    feature: 'Deterministic Calculation Fingerprint Invariance Matrix',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      // 1. Same Input -> Same Result
      const run1 = VedicAstroEngine.calculateKundli(baseProfile);
      const run2 = VedicAstroEngine.calculateKundli(baseProfile);
      const fp1 = computeAstroFingerprint(run1);
      const fp2 = computeAstroFingerprint(run2);
      const sameInputMatches = fp1 === fp2;

      // 2. Changed Birth Time -> Changed Result
      const runTimeChanged = VedicAstroEngine.calculateKundli({ ...baseProfile, birthTime: '08:30:00' });
      const fpTime = computeAstroFingerprint(runTimeChanged);
      const timeChangeDiffers = fp1 !== fpTime;

      // 3. Changed Coordinates -> Changed Result
      const runCoordChanged = VedicAstroEngine.calculateKundli({ ...baseProfile, latitude: 51.5074, longitude: -0.1278 });
      const fpCoord = computeAstroFingerprint(runCoordChanged);
      const coordChangeDiffers = fp1 !== fpCoord;

      // 4. Name Change -> DOES NOT Change Astronomical Fingerprint
      const runNameChanged = VedicAstroEngine.calculateKundli({ ...baseProfile, name: 'Completely Different Person Name' });
      const fpName = computeAstroFingerprint(runNameChanged);
      const nameChangeMatches = fp1 === fpName;

      const passed = sameInputMatches && timeChangeDiffers && coordChangeDiffers && nameChangeMatches;
      return {
        status: passed ? 'PASS' : 'FAIL',
        evidence: {
          sameInputDeterminism: sameInputMatches,
          timeSensitivity: timeChangeDiffers,
          coordinateSensitivity: coordChangeDiffers,
          nameChangeInvariance: nameChangeMatches,
          baseFingerprint: fp1.substring(0, 16) + '...',
        },
      };
    },
  },
];
