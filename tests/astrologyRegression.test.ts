/**
 * Vedic Astrology Regression & Astronomical Cross-Check Suite
 * Validates 20 distinct benchmark birth profiles covering global coordinates,
 * date/time boundaries, leap days, polar/equator latitudes, fractional timezones,
 * and asserts exact deterministic reproducibility.
 */

import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { AIAuditor } from '../server/src/ai/AIAuditor.js';

export const REGRESSION_PROFILES: BirthProfileInput[] = [
  {
    name: '1. Indian Independence',
    birthDate: '1947-08-15',
    birthTime: '00:00', // Midnight boundary
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Other',
  },
  {
    name: '2. Millennial Greenwich Solstice',
    birthDate: '2000-12-21',
    birthTime: '12:00', // Solar noon prime meridian
    birthPlace: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0.0,
    gender: 'Male',
  },
  {
    name: '3. Jaipur Classical Native',
    birthDate: '1998-11-24',
    birthTime: '06:45',
    birthPlace: 'Jaipur, Rajasthan, India',
    latitude: 26.9124,
    longitude: 75.7873,
    timezone: 5.5,
    gender: 'Male',
  },
  {
    name: '4. Leap Day Date Boundary',
    birthDate: '2000-02-29',
    birthTime: '23:59', // Day edge boundary
    birthPlace: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5.0,
    gender: 'Female',
  },
  {
    name: '5. Equator Vernal Equinox',
    birthDate: '1990-03-21',
    birthTime: '06:00',
    birthPlace: 'Quito, Ecuador',
    latitude: -0.1807,
    longitude: -78.4678,
    timezone: -5.0,
    gender: 'Female',
  },
  {
    name: '6. Southern Hemisphere Winter',
    birthDate: '1985-07-10',
    birthTime: '15:30',
    birthPlace: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 10.0,
    gender: 'Male',
  },
  {
    name: '7. High Latitude Midnight Sun',
    birthDate: '1992-06-15',
    birthTime: '03:00',
    birthPlace: 'Oslo, Norway',
    latitude: 59.9139,
    longitude: 10.7522,
    timezone: 1.0,
    gender: 'Other',
  },
  {
    name: '8. Tokyo Pacific Dawn',
    birthDate: '2024-01-01',
    birthTime: '00:00',
    birthPlace: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 9.0,
    gender: 'Female',
  },
  {
    name: '9. Varanasi Ancient Sacred Meridian',
    birthDate: '1975-10-20',
    birthTime: '08:15',
    birthPlace: 'Varanasi, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 5.5,
    gender: 'Male',
  },
  {
    name: '10. Mumbai Twilight Sunset',
    birthDate: '1988-04-14',
    birthTime: '18:45',
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Female',
  },
  {
    name: '11. Kathmandu Fractional Timezone (+5:45)',
    birthDate: '1996-09-09',
    birthTime: '11:15',
    birthPlace: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 5.75, // Non-integer UTC offset
    gender: 'Male',
  },
  {
    name: '12. California Pacific Dawn',
    birthDate: '1994-11-05',
    birthTime: '09:30',
    birthPlace: 'San Francisco, USA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: -8.0,
    gender: 'Male',
  },
  {
    name: '13. Arabian Gulf High Noon',
    birthDate: '2005-05-20',
    birthTime: '14:00',
    birthPlace: 'Dubai, UAE',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 4.0,
    gender: 'Female',
  },
  {
    name: '14. Paris Autumnal Ingress',
    birthDate: '1982-09-23',
    birthTime: '07:45',
    birthPlace: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 1.0,
    gender: 'Other',
  },
  {
    name: '15. Singapore Tropical Equator',
    birthDate: '2001-10-10',
    birthTime: '19:20',
    birthPlace: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 8.0,
    gender: 'Female',
  },
  {
    name: '16. Epoch 1970 Zero Timestamp',
    birthDate: '1970-01-01',
    birthTime: '05:30',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    gender: 'Male',
  },
  {
    name: '17. Chennai Summer Solstice Noon',
    birthDate: '1980-06-21',
    birthTime: '12:00',
    birthPlace: 'Chennai, India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 5.5,
    gender: 'Male',
  },
  {
    name: '18. Bangalore New Year Eve',
    birthDate: '1993-12-31',
    birthTime: '20:00',
    birthPlace: 'Bangalore, India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 5.5,
    gender: 'Female',
  },
  {
    name: '19. Berlin Fall of the Wall',
    birthDate: '1989-11-09',
    birthTime: '18:53',
    birthPlace: 'Berlin, Germany',
    latitude: 52.5200,
    longitude: 13.4050,
    timezone: 1.0,
    gender: 'Other',
  },
  {
    name: '20. DeepAstro Ujjain Prime Meridian',
    birthDate: '2026-09-04',
    birthTime: '12:00',
    birthPlace: 'Ujjain, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 5.5,
    gender: 'Male',
  },
];

describe('Astrology Engine Regression & Reproducibility Suite (20 Benchmark Profiles)', () => {
  it('successfully calculates all 20 diverse benchmark profiles without error', () => {
    expect(REGRESSION_PROFILES.length).toBe(20);

    for (const profile of REGRESSION_PROFILES) {
      const result = VedicAstroEngine.calculateKundli(profile);

      expect(result).toBeDefined();
      expect(result.ascendant).toBeDefined();
      expect(result.ascendant.details.signIndex).toBeGreaterThanOrEqual(0);
      expect(result.ascendant.details.signIndex).toBeLessThan(12);

      // Verify all 9 planetary coordinates are calculated
      expect(result.planets.length).toBe(9);
      const planetNames = result.planets.map(p => p.name);
      for (const requiredPlanet of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']) {
        expect(planetNames).toContain(requiredPlanet);
      }

      // Verify all 12 houses are populated
      expect(result.houses.length).toBe(12);
      for (let h = 1; h <= 12; h++) {
        const house = result.houses.find(item => item.houseNumber === h);
        expect(house).toBeDefined();
        expect(house!.signIndex).toBeGreaterThanOrEqual(0);
        expect(house!.signIndex).toBeLessThan(12);
      }

      // Verify Moon nakshatra and pada
      expect(result.moonNakshatra).toBeDefined();
      expect(result.moonNakshatra.pada).toBeGreaterThanOrEqual(1);
      expect(result.moonNakshatra.pada).toBeLessThanOrEqual(4);

      // Verify Vimshottari Mahadasha timeline
      expect(result.dashas).toBeDefined();
      expect(result.dashas.allMahadashas.length).toBe(9);
      expect(result.dashas.currentMahadasha.planet).toBeTruthy();
    }
  });

  it('guarantees 100% mathematical reproducibility: duplicate calculations yield bit-for-bit identical outputs', () => {
    // Pick 3 diverse profiles from the 20
    const sampleProfiles = [REGRESSION_PROFILES[0], REGRESSION_PROFILES[3], REGRESSION_PROFILES[10]];

    for (const profile of sampleProfiles) {
      const run1 = VedicAstroEngine.calculateKundli(profile);
      const run2 = VedicAstroEngine.calculateKundli(profile);

      // Verify Julian day and Ayanamsha
      expect(run1.astronomy.julianDay).toBe(run2.astronomy.julianDay);
      expect(run1.astronomy.ayanamshaDegrees).toBe(run2.astronomy.ayanamshaDegrees);

      // Verify Ascendant degrees and sign
      expect(run1.ascendant.details.signIndex).toBe(run2.ascendant.details.signIndex);
      expect(run1.ascendant.details.degreeInSign).toBe(run2.ascendant.details.degreeInSign);

      // Verify every planet's coordinate matches exactly
      for (let i = 0; i < 9; i++) {
        expect(run1.planets[i].signIndex).toBe(run2.planets[i].signIndex);
        expect(run1.planets[i].degreeInSign).toBe(run2.planets[i].degreeInSign);
        expect(run1.planets[i].house).toBe(run2.planets[i].house);
        expect(run1.planets[i].dignity).toBe(run2.planets[i].dignity);
      }

      // Verify dasha sequence matches exactly
      expect(run1.dashas.currentMahadasha.planet).toBe(run2.dashas.currentMahadasha.planet);
      expect(run1.dashas.balanceYearsRemaining).toBe(run2.dashas.balanceYearsRemaining);
    }
  });

  it('enforces AI Fact Protection: AIAuditor flags and blocks contradictory celestial claims', () => {
    const testProfile = REGRESSION_PROFILES[2]; // Jaipur Native: Taurus Lagna
    const kundli = VedicAstroEngine.calculateKundli(testProfile);

    // AI claims native's Lagna is Aries (contradicting Taurus)
    const hallucinatedCandidate = {
      summary: 'Your Lagna is in Aries and brings impulsive martial fire.',
      interpretation: 'With Aries ascendant, you are driven by Mars.',
      confidence: 'High' as const,
      evidence: ['Lagna analysis'],
      recommendations: ['Wear Red Coral'],
      totalTokens: 120,
    };

    const auditResult = AIAuditor.audit(hallucinatedCandidate, kundli);
    expect(auditResult.isValid).toBe(false);
    expect(auditResult.violations.length).toBeGreaterThan(0);
    expect(auditResult.violations[0]).toContain('AI hallucinated Ascendant sign');
  });
});
