/**
 * LocationResolver
 * Deterministic geographic coordinates, canonical IANA timezone, and date-specific UTC offset resolution.
 * NEVER silently invents coordinates for unknown cities.
 * NEVER relies on server/browser timezone.
 */

export interface ResolvedLocation {
  city: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: number; // Decimal hours for the resolved date/time
  country: string;
  ianaTimeZone: string;
}

export class LocationResolver {
  private static readonly CITY_DATABASE: Record<string, {
    city: string;
    displayName: string;
    latitude: number;
    longitude: number;
    country: string;
    ianaTimeZone: string;
  }> = {
    // ── India ─────────────────────────────────────────────────────────────
    'mumbai': { city: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', latitude: 18.9220, longitude: 72.8347, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'delhi': { city: 'New Delhi', displayName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'new delhi': { city: 'New Delhi', displayName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'varanasi': { city: 'Varanasi', displayName: 'Varanasi, Uttar Pradesh, India', latitude: 25.3176, longitude: 82.9739, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'ahmedabad': { city: 'Ahmedabad', displayName: 'Ahmedabad, Gujarat, India', latitude: 23.0225, longitude: 72.5714, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'bengaluru': { city: 'Bengaluru', displayName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'bangalore': { city: 'Bengaluru', displayName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'chennai': { city: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'kolkata': { city: 'Kolkata', displayName: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'calcutta': { city: 'Kolkata', displayName: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'jaipur': { city: 'Jaipur', displayName: 'Jaipur, Rajasthan, India', latitude: 26.9124, longitude: 75.7873, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'goa': { city: 'Goa', displayName: 'Panaji, Goa, India', latitude: 15.2993, longitude: 74.1240, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'panaji': { city: 'Panaji', displayName: 'Panaji, Goa, India', latitude: 15.4909, longitude: 73.8278, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'hyderabad': { city: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'pune': { city: 'Pune', displayName: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'lucknow': { city: 'Lucknow', displayName: 'Lucknow, Uttar Pradesh, India', latitude: 26.8467, longitude: 80.9462, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'patna': { city: 'Patna', displayName: 'Patna, Bihar, India', latitude: 25.5941, longitude: 85.1376, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'chandigarh': { city: 'Chandigarh', displayName: 'Chandigarh, Punjab/Haryana, India', latitude: 30.7333, longitude: 76.7794, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'bhopal': { city: 'Bhopal', displayName: 'Bhopal, Madhya Pradesh, India', latitude: 23.2599, longitude: 77.4126, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'indore': { city: 'Indore', displayName: 'Indore, Madhya Pradesh, India', latitude: 22.7196, longitude: 75.8577, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'surat': { city: 'Surat', displayName: 'Surat, Gujarat, India', latitude: 21.1702, longitude: 72.8311, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'nagpur': { city: 'Nagpur', displayName: 'Nagpur, Maharashtra, India', latitude: 21.1458, longitude: 79.0882, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'haridwar': { city: 'Haridwar', displayName: 'Haridwar, Uttarakhand, India', latitude: 29.9457, longitude: 78.1642, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'rishikesh': { city: 'Rishikesh', displayName: 'Rishikesh, Uttarakhand, India', latitude: 30.0869, longitude: 78.2676, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'ujjain': { city: 'Ujjain', displayName: 'Ujjain, Madhya Pradesh, India', latitude: 23.1765, longitude: 75.7885, country: 'India', ianaTimeZone: 'Asia/Kolkata' },
    'agra': { city: 'Agra', displayName: 'Agra, Uttar Pradesh, India', latitude: 27.1767, longitude: 78.0081, country: 'India', ianaTimeZone: 'Asia/Kolkata' },

    // ── South Asia & Middle East ──────────────────────────────────────────
    'kathmandu': { city: 'Kathmandu', displayName: 'Kathmandu, Bagmati, Nepal', latitude: 27.7172, longitude: 85.3240, country: 'Nepal', ianaTimeZone: 'Asia/Kathmandu' },
    'colombo': { city: 'Colombo', displayName: 'Colombo, Western Province, Sri Lanka', latitude: 6.9271, longitude: 79.8612, country: 'Sri Lanka', ianaTimeZone: 'Asia/Colombo' },
    'dhaka': { city: 'Dhaka', displayName: 'Dhaka, Bangladesh', latitude: 23.8103, longitude: 90.4125, country: 'Bangladesh', ianaTimeZone: 'Asia/Dhaka' },
    'dubai': { city: 'Dubai', displayName: 'Dubai, United Arab Emirates', latitude: 25.2048, longitude: 55.2708, country: 'UAE', ianaTimeZone: 'Asia/Dubai' },

    // ── East & Southeast Asia ─────────────────────────────────────────────
    'tokyo': { city: 'Tokyo', displayName: 'Tokyo, Kanto, Japan', latitude: 35.6762, longitude: 139.6503, country: 'Japan', ianaTimeZone: 'Asia/Tokyo' },
    'singapore': { city: 'Singapore', displayName: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore', ianaTimeZone: 'Asia/Singapore' },
    'bangkok': { city: 'Bangkok', displayName: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018, country: 'Thailand', ianaTimeZone: 'Asia/Bangkok' },
    'hong kong': { city: 'Hong Kong', displayName: 'Hong Kong, China', latitude: 22.3193, longitude: 114.1694, country: 'Hong Kong', ianaTimeZone: 'Asia/Hong_Kong' },

    // ── Europe ────────────────────────────────────────────────────────────
    'london': { city: 'London', displayName: 'London, England, UK', latitude: 51.5074, longitude: -0.1278, country: 'UK', ianaTimeZone: 'Europe/London' },
    'paris': { city: 'Paris', displayName: 'Paris, Île-de-France, France', latitude: 48.8566, longitude: 2.3522, country: 'France', ianaTimeZone: 'Europe/Paris' },
    'berlin': { city: 'Berlin', displayName: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, country: 'Germany', ianaTimeZone: 'Europe/Berlin' },
    'rome': { city: 'Rome', displayName: 'Rome, Lazio, Italy', latitude: 41.9028, longitude: 12.4964, country: 'Italy', ianaTimeZone: 'Europe/Rome' },
    'madrid': { city: 'Madrid', displayName: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038, country: 'Spain', ianaTimeZone: 'Europe/Madrid' },
    'amsterdam': { city: 'Amsterdam', displayName: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041, country: 'Netherlands', ianaTimeZone: 'Europe/Amsterdam' },
    'zurich': { city: 'Zurich', displayName: 'Zurich, Switzerland', latitude: 47.3769, longitude: 8.5417, country: 'Switzerland', ianaTimeZone: 'Europe/Zurich' },

    // ── North America ─────────────────────────────────────────────────────
    'new york': { city: 'New York', displayName: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, country: 'USA', ianaTimeZone: 'America/New_York' },
    'san francisco': { city: 'San Francisco', displayName: 'San Francisco, CA, USA', latitude: 37.7749, longitude: -122.4194, country: 'USA', ianaTimeZone: 'America/Los_Angeles' },
    'los angeles': { city: 'Los Angeles', displayName: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, country: 'USA', ianaTimeZone: 'America/Los_Angeles' },
    'chicago': { city: 'Chicago', displayName: 'Chicago, IL, USA', latitude: 41.8781, longitude: -87.6298, country: 'USA', ianaTimeZone: 'America/Chicago' },
    'houston': { city: 'Houston', displayName: 'Houston, TX, USA', latitude: 29.7604, longitude: -95.3698, country: 'USA', ianaTimeZone: 'America/Chicago' },
    'portland': { city: 'Portland', displayName: 'Portland, OR, USA', latitude: 45.5152, longitude: -122.6784, country: 'USA', ianaTimeZone: 'America/Los_Angeles' },
    'seattle': { city: 'Seattle', displayName: 'Seattle, WA, USA', latitude: 47.6062, longitude: -122.3321, country: 'USA', ianaTimeZone: 'America/Los_Angeles' },
    'toronto': { city: 'Toronto', displayName: 'Toronto, ON, Canada', latitude: 43.6532, longitude: -79.3832, country: 'Canada', ianaTimeZone: 'America/Toronto' },
    'vancouver': { city: 'Vancouver', displayName: 'Vancouver, BC, Canada', latitude: 49.2827, longitude: -123.1207, country: 'Canada', ianaTimeZone: 'America/Vancouver' },

    // ── Australia & Pacific ───────────────────────────────────────────────
    'sydney': { city: 'Sydney', displayName: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093, country: 'Australia', ianaTimeZone: 'Australia/Sydney' },
    'melbourne': { city: 'Melbourne', displayName: 'Melbourne, VIC, Australia', latitude: -37.8136, longitude: 144.9631, country: 'Australia', ianaTimeZone: 'Australia/Melbourne' },
    'auckland': { city: 'Auckland', displayName: 'Auckland, New Zealand', latitude: -36.8485, longitude: 174.7633, country: 'New Zealand', ianaTimeZone: 'Pacific/Auckland' },

    // ── South America & Africa ────────────────────────────────────────────
    'sao paulo': { city: 'São Paulo', displayName: 'São Paulo, Brazil', latitude: -23.5505, longitude: -46.6333, country: 'Brazil', ianaTimeZone: 'America/Sao_Paulo' },
    'johannesburg': { city: 'Johannesburg', displayName: 'Johannesburg, South Africa', latitude: -26.2041, longitude: 28.0473, country: 'South Africa', ianaTimeZone: 'Africa/Johannesburg' },
    'cairo': { city: 'Cairo', displayName: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357, country: 'Egypt', ianaTimeZone: 'Africa/Cairo' },
  };

  /**
   * Deterministically calculate the exact UTC offset (in decimal hours) for an IANA timezone at a specific date and time.
   * Leverages Intl.DateTimeFormat with full historical DST & zone rules.
   */
  public static getUtcOffsetHours(ianaTimeZone: string, birthDate: string, birthTime: string): number {
    try {
      const [y, m, d] = birthDate.split('-').map(Number);
      const [h, min] = birthTime.split(':').map(Number);

      // Create an initial UTC candidate date
      const utcCandidate = new Date(Date.UTC(y, m - 1, d, h || 0, min || 0, 0));

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(utcCandidate);
      const getPart = (type: string): number => {
        const found = parts.find((p) => p.type === type);
        return found ? parseInt(found.value, 10) : 0;
      };

      const tzYear = getPart('year');
      const tzMonth = getPart('month');
      const tzDay = getPart('day');
      let tzHour = getPart('hour');
      if (tzHour === 24) tzHour = 0;
      const tzMin = getPart('minute');
      const tzSec = getPart('second');

      const localEquivalentUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec);
      const offsetMs = localEquivalentUtc - utcCandidate.getTime();
      return offsetMs / 3600000.0;
    } catch {
      // Fallback for non-standard environments
      return 5.5; // Default IST if IANA lookup fails
    }
  }

  /**
   * Resolve a query string to geographic coordinates, canonical IANA timezone, and date-specific UTC offset.
   */
  public static resolve(
    query: string,
    birthDate?: string,
    birthTime?: string
  ): ResolvedLocation | undefined {
    if (!query || typeof query !== 'string') return undefined;

    const clean = query.trim().toLowerCase();
    if (clean.includes(';') || clean.includes('--') || clean.includes('/*')) {
      return undefined;
    }

    let match = this.CITY_DATABASE[clean];

    if (!match) {
      for (const [key, loc] of Object.entries(this.CITY_DATABASE)) {
        if (clean.startsWith(key) || clean.includes(key)) {
          match = loc;
          break;
        }
      }
    }

    if (!match) return undefined;

    const bDate = birthDate || '2000-01-01';
    const bTime = birthTime || '12:00';
    const offset = this.getUtcOffsetHours(match.ianaTimeZone, bDate, bTime);

    return {
      city: match.city,
      displayName: match.displayName,
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: offset,
      country: match.country,
      ianaTimeZone: match.ianaTimeZone,
    };
  }
}
