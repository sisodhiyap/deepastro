/**
 * DeepAstro Differential Ephemeris Validation Suite
 * Compares DeepAstro's planetary longitudes, Ascendants, and Ayanamsha
 * against authoritative Swiss Ephemeris / NASA JPL Horizons reference vectors.
 *
 * Enforces rigorous tolerances:
 * - Planetary longitude difference <= 0.20° (12 arcminutes)
 * - Moon longitude difference <= 0.20° (12 arcminutes)
 * - Ascendant difference <= 0.50°
 * - Ayanamsha difference <= 0.02°
 *
 * NO TEST-SPECIFIC PATCHING. STRICT CELESTIAL MECHANICS COMPARISON.
 */

import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

interface ReferencePlanet {
  name: string;
  expectedSiderealLon: number; // in degrees
}

interface EphemerisBenchmark {
  name: string;
  profile: BirthProfileInput;
  referenceJD: number;
  referenceAyanamsha: number;
  referenceAscendant: number;
  planets: ReferencePlanet[];
}

/**
 * Authoritative Swiss Ephemeris (Lahiri Chitra Paksha) Reference Vectors
 */
export const SWISS_EPHEMERIS_BENCHMARKS: EphemerisBenchmark[] = [
  {
    name: 'Indian Independence Chart (Midnight Aug 15 1947 New Delhi)',
    profile: {
      name: 'Indian Independence',
      birthDate: '1947-08-15',
      birthTime: '00:00',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'Other',
    },
    referenceJD: 2432412.270833,
    referenceAyanamsha: 23.1221,
    referenceAscendant: 37.73, // Taurus 7°44' (Rohini Nakshatra)
    planets: [
      { name: 'Sun', expectedSiderealLon: 117.99 },     // Cancer 27°59'
      { name: 'Moon', expectedSiderealLon: 93.98 },     // Cancer 3°59' (Pushya)
      { name: 'Mars', expectedSiderealLon: 67.46 },     // Gemini 7°27'
      { name: 'Mercury', expectedSiderealLon: 103.67 }, // Cancer 13°40'
      { name: 'Jupiter', expectedSiderealLon: 205.88 }, // Libra 25°52'
      { name: 'Venus', expectedSiderealLon: 112.56 },   // Cancer 22°33'
      { name: 'Saturn', expectedSiderealLon: 110.47 },  // Cancer 20°28'
      { name: 'Rahu', expectedSiderealLon: 35.07 },     // Taurus 5°04'
      { name: 'Ketu', expectedSiderealLon: 215.07 },    // Scorpio 5°04'
    ],
  },
  {
    name: 'Millennium Epoch J2000 (Jan 1 2000 12:00 UTC London)',
    profile: {
      name: 'J2000 Millennium Epoch',
      birthDate: '2000-01-01',
      birthTime: '12:00',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
      gender: 'Male',
    },
    referenceJD: 2451545.0,
    referenceAyanamsha: 23.8535,
    referenceAscendant: 0.16, // Aries 0°10' (Revati/Ashwini junction)
    planets: [
      { name: 'Sun', expectedSiderealLon: 256.52 },     // Sagittarius 16°31'
      { name: 'Moon', expectedSiderealLon: 199.47 },    // Libra 19°28'
      { name: 'Mars', expectedSiderealLon: 304.11 },    // Aquarius 4°06'
      { name: 'Mercury', expectedSiderealLon: 248.04 }, // Sagittarius 8°02'
      { name: 'Jupiter', expectedSiderealLon: 1.40 },   // Aries 1°24'
      { name: 'Venus', expectedSiderealLon: 217.71 },   // Scorpio 7°42'
      { name: 'Saturn', expectedSiderealLon: 16.54 },   // Aries 16°32'
      { name: 'Rahu', expectedSiderealLon: 101.19 },    // Cancer 11°11'
      { name: 'Ketu', expectedSiderealLon: 281.19 },    // Capricorn 11°11'
    ],
  },
];

describe('DeepAstro vs Swiss Ephemeris Differential Validation', () => {
  for (const bm of SWISS_EPHEMERIS_BENCHMARKS) {
    describe(`Benchmark: ${bm.name}`, () => {
      const kundli = VedicAstroEngine.calculateKundli(bm.profile);

      it('matches authoritative Julian Day within 0.0001 days (~8 seconds)', () => {
        const jdDiff = Math.abs(kundli.astronomy.julianDay - bm.referenceJD);
        expect(jdDiff).toBeLessThan(0.0001);
      });

      it('matches authoritative Lahiri Ayanamsha within 1 arcminute (0.016°)', () => {
        const ayanDiff = Math.abs(kundli.astronomy.ayanamshaDegrees - bm.referenceAyanamsha);
        expect(ayanDiff).toBeLessThan(0.02);
      });

      it('matches authoritative Ascendant (Lagna) within 6 arcminutes (0.10°)', () => {
        let ascDiff = Math.abs(kundli.ascendant.degrees - bm.referenceAscendant);
        if (ascDiff > 180) ascDiff = 360 - ascDiff;
        expect(ascDiff).toBeLessThan(0.10);
      });

      for (const refPlanet of bm.planets) {
        it(`matches ${refPlanet.name} sidereal longitude within 6 arcminutes (0.10°)`, () => {
          const actualPlanet = kundli.planets.find((p) => p.name === refPlanet.name);
          expect(actualPlanet).toBeDefined();

          let diff = Math.abs(actualPlanet!.siderealLongitude - refPlanet.expectedSiderealLon);
          if (diff > 180) diff = 360 - diff;

          expect(diff).toBeLessThan(0.10);
        });
      }
    });
  }
});
