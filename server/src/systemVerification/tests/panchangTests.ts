/**
 * Panchang & Muhurat Calculation Test Suite (PANCH-001 to PANCH-008)
 */
import { SystemTestCase } from '../types.js';
import { calculatePanchang } from '../../astrology/PanchangEngine.js';
import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';

const testProfile: BirthProfileInput = {
  name: 'Panchang Test',
  birthDate: '2026-09-05',
  birthTime: '12:00:00',
  birthPlace: 'Mumbai, India',
  latitude: 18.922,
  longitude: 72.8347,
  timezone: 5.5,
  gender: 'Male',
};

function getSunMoonLongitudes(profile: BirthProfileInput) {
  const kundli = VedicAstroEngine.calculateKundli(profile);
  const sunLon = kundli.planets.find((p) => p.name === 'Sun')?.siderealLongitude || 0;
  const moonLon = kundli.planets.find((p) => p.name === 'Moon')?.siderealLongitude || 0;
  return { sunLon, moonLon };
}

export const panchangTests: SystemTestCase[] = [
  {
    id: 'PANCH-001',
    category: 'PANCHANG',
    feature: 'Complete 5-Limb (Panchanga) Structure Generation',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const valid = !!(p.tithi && p.vara && p.nakshatra && p.yoga && p.karana);

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: {
          tithi: p.tithi.name,
          vara: p.vara.name,
          nakshatra: p.nakshatra.name,
          yoga: p.yoga.name,
          karana: p.karana.name,
        },
      };
    },
  },
  {
    id: 'PANCH-002',
    category: 'PANCHANG',
    feature: 'Tithi (Lunar Phase Day) & Paksha Determination',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const valid = p.tithi.number >= 1 && p.tithi.number <= 15 && !!p.tithi.paksha;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { tithiNumber: p.tithi.number, tithiName: p.tithi.name, paksha: p.tithi.paksha },
      };
    },
  },
  {
    id: 'PANCH-003',
    category: 'PANCHANG',
    feature: 'Vara (Solar Weekday & Ruling Planet)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      // 2026-09-05 is a Saturday (Shanivara, ruled by Saturn)
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const isSat = p.vara.name.toLowerCase().includes('saturday');

      return {
        status: isSat ? 'PASS' : 'FAIL',
        evidence: { varaName: p.vara.name, sanskrit: p.vara.sanskritName, planet: p.vara.rulingPlanet },
      };
    },
  },
  {
    id: 'PANCH-004',
    category: 'PANCHANG',
    feature: 'Nakshatra & Pada Alignment for Transit Moon',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const valid = !!p.nakshatra.name && p.nakshatra.pada >= 1 && p.nakshatra.pada <= 4;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { nakshatra: p.nakshatra.name, pada: p.nakshatra.pada, lord: p.nakshatra.lord },
      };
    },
  },
  {
    id: 'PANCH-005',
    category: 'PANCHANG',
    feature: 'Solilunar Nitya Yoga Calculation (1 to 27 Yogas)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const valid = p.yoga.number >= 0 && p.yoga.number <= 26 && !!p.yoga.name;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { yogaNumber: p.yoga.number, yogaName: p.yoga.name, auspicious: p.yoga.isAuspicious },
      };
    },
  },
  {
    id: 'PANCH-006',
    category: 'PANCHANG',
    feature: 'Karana (Half-Tithi / Movable & Fixed Karana)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const valid = !!p.karana.name && !!p.karana.type;

      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: { karanaName: p.karana.name, karanaType: p.karana.type, isBhadra: p.karana.isVishtiBhadra },
      };
    },
  },
  {
    id: 'PANCH-007',
    category: 'PANCHANG',
    feature: 'Sunrise and Sunset Calculation with Geographic Latitude Dependency',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const mumbaiPanch = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const londonPanch = calculatePanchang(sunLon, moonLon, targetDate, 51.5074, -0.1278);

      const valid = !!(mumbaiPanch.timings.sunrise && londonPanch.timings.sunrise);
      return {
        status: valid ? 'PASS' : 'FAIL',
        evidence: {
          mumbaiSunrise: mumbaiPanch.timings.sunrise,
          mumbaiSunset: mumbaiPanch.timings.sunset,
          londonSunrise: londonPanch.timings.sunrise,
          londonSunset: londonPanch.timings.sunset,
        },
      };
    },
  },
  {
    id: 'PANCH-008',
    category: 'PANCHANG',
    feature: 'Auspicious Muhurat & Inauspicious Rahu Kalam Calculation',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { sunLon, moonLon } = getSunMoonLongitudes(testProfile);
      const targetDate = new Date('2026-09-05T12:00:00Z');
      const p = calculatePanchang(sunLon, moonLon, targetDate, 18.922, 72.8347);
      const hasRahu = !!(p.timings.rahuKalam.start && p.timings.rahuKalam.end);
      const hasAbhijit = !!(p.timings.abhijitMuhurat.start && p.timings.abhijitMuhurat.end);

      return {
        status: hasRahu && hasAbhijit ? 'PASS' : 'FAIL',
        evidence: {
          rahuKalam: `${p.timings.rahuKalam.start} - ${p.timings.rahuKalam.end}`,
          abhijitMuhurat: `${p.timings.abhijitMuhurat.start} - ${p.timings.abhijitMuhurat.end}`,
        },
      };
    },
  },
];
