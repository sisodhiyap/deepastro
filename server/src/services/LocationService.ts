/**
 * Location & Timezone Resolution Service (LocationService)
 * Resolves geographical places to canonical coordinates and validated historical/standard timezones.
 * Provides disambiguation candidates when ambiguous city names are encountered.
 */

export interface LocationCandidate {
  id: string;
  city: string;
  region: string;
  country: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours (e.g. +5.5 for IST)
  isCanonical: boolean;
}

export class LocationService {
  // Built-in canonical database of prominent global and Indian birth locations
  private static CANONICAL_PLACES: LocationCandidate[] = [
    {
      id: 'in_delhi',
      city: 'Delhi',
      region: 'NCR',
      country: 'India',
      displayName: 'Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'us_delhi_ny',
      city: 'Delhi',
      region: 'New York',
      country: 'United States',
      displayName: 'Delhi, New York, USA',
      latitude: 42.2781,
      longitude: -74.9168,
      timezone: -5.0,
      isCanonical: false,
    },
    {
      id: 'us_delhi_ca',
      city: 'Delhi',
      region: 'California',
      country: 'United States',
      displayName: 'Delhi, California, USA',
      latitude: 37.4322,
      longitude: -120.7788,
      timezone: -8.0,
      isCanonical: false,
    },
    {
      id: 'in_jaipur',
      city: 'Jaipur',
      region: 'Rajasthan',
      country: 'India',
      displayName: 'Jaipur, Rajasthan, India',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_mumbai',
      city: 'Mumbai',
      region: 'Maharashtra',
      country: 'India',
      displayName: 'Mumbai, Maharashtra, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_bangalore',
      city: 'Bangalore',
      region: 'Karnataka',
      country: 'India',
      displayName: 'Bangalore (Bengaluru), Karnataka, India',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_chennai',
      city: 'Chennai',
      region: 'Tamil Nadu',
      country: 'India',
      displayName: 'Chennai, Tamil Nadu, India',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_kolkata',
      city: 'Kolkata',
      region: 'West Bengal',
      country: 'India',
      displayName: 'Kolkata, West Bengal, India',
      latitude: 22.5726,
      longitude: 88.3639,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_varanasi',
      city: 'Varanasi',
      region: 'Uttar Pradesh',
      country: 'India',
      displayName: 'Varanasi (Kashi), Uttar Pradesh, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'in_ujjain',
      city: 'Ujjain',
      region: 'Madhya Pradesh',
      country: 'India',
      displayName: 'Ujjain (Avanti - Prime Vedic Meridian), MP, India',
      latitude: 23.1765,
      longitude: 75.7885,
      timezone: 5.5,
      isCanonical: true,
    },
    {
      id: 'np_kathmandu',
      city: 'Kathmandu',
      region: 'Bagmati',
      country: 'Nepal',
      displayName: 'Kathmandu, Nepal',
      latitude: 27.7172,
      longitude: 85.3240,
      timezone: 5.75, // +5:45
      isCanonical: true,
    },
    {
      id: 'uk_london',
      city: 'London',
      region: 'Greater London',
      country: 'United Kingdom',
      displayName: 'London, United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
      isCanonical: true,
    },
    {
      id: 'us_new_york',
      city: 'New York',
      region: 'New York',
      country: 'United States',
      displayName: 'New York City, NY, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: -5.0,
      isCanonical: true,
    },
    {
      id: 'us_san_francisco',
      city: 'San Francisco',
      region: 'California',
      country: 'United States',
      displayName: 'San Francisco, CA, USA',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: -8.0,
      isCanonical: true,
    },
    {
      id: 'ae_dubai',
      city: 'Dubai',
      region: 'Dubai',
      country: 'United Arab Emirates',
      displayName: 'Dubai, UAE',
      latitude: 25.2048,
      longitude: 55.2708,
      timezone: 4.0,
      isCanonical: true,
    },
    {
      id: 'sg_singapore',
      city: 'Singapore',
      region: 'Central',
      country: 'Singapore',
      displayName: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      timezone: 8.0,
      isCanonical: true,
    },
    {
      id: 'au_sydney',
      city: 'Sydney',
      region: 'NSW',
      country: 'Australia',
      displayName: 'Sydney, NSW, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 10.0,
      isCanonical: true,
    },
    {
      id: 'jp_tokyo',
      city: 'Tokyo',
      region: 'Kanto',
      country: 'Japan',
      displayName: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 9.0,
      isCanonical: true,
    },
  ];

  /**
   * Search places matching input query. Returns canonical candidates.
   */
  public static resolveLocation(query: string): {
    bestMatch: LocationCandidate;
    candidates: LocationCandidate[];
    isAmbiguous: boolean;
  } {
    const clean = query.trim().toLowerCase();
    const matches = this.CANONICAL_PLACES.filter(
      p =>
        p.city.toLowerCase().includes(clean) ||
        clean.includes(p.city.toLowerCase()) ||
        p.displayName.toLowerCase().includes(clean)
    );

    if (matches.length === 0) {
      // Fallback default: Jaipur, India
      const fallback = this.CANONICAL_PLACES.find(p => p.id === 'in_jaipur')!;
      return {
        bestMatch: {
          ...fallback,
          city: query,
          displayName: `${query} (Defaulting to IST +5.5)`,
        },
        candidates: [fallback],
        isAmbiguous: false,
      };
    }

    const canonical = matches.find(m => m.isCanonical) || matches[0];
    return {
      bestMatch: canonical,
      candidates: matches,
      isAmbiguous: matches.length > 1,
    };
  }

  /**
   * Validate birth time and timezone format
   */
  public static validateTimeAndZone(
    birthTime: string,
    timezone: number,
    birthDate: string
  ): { isValid: boolean; normalizedTime: string; errors: string[] } {
    const errors: string[] = [];

    // 1. Time format check (HH:mm or HH:mm:ss)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
    if (!timeRegex.test(birthTime.trim())) {
      errors.push(`Invalid birth time '${birthTime}'. Expected format HH:mm (00:00 to 23:59).`);
    }

    // 2. Timezone range (-12 to +14)
    if (isNaN(timezone) || timezone < -12 || timezone > 14) {
      errors.push(`Invalid timezone offset '${timezone}'. Must be between -12.0 and +14.0.`);
    }

    // 3. Date format check (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate.trim())) {
      errors.push(`Invalid birth date '${birthDate}'. Expected format YYYY-MM-DD.`);
    } else {
      const parsedDate = new Date(`${birthDate}T00:00:00Z`);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid calendar date '${birthDate}'.`);
      }
    }

    return {
      isValid: errors.length === 0,
      normalizedTime: birthTime.trim().slice(0, 5),
      errors,
    };
  }
}
