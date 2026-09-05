/**
 * LocationResolver
 * Deterministic geographic coordinates and timezone resolution service.
 * NEVER silently invents coordinates for unknown cities.
 */

export interface ResolvedLocation {
  city: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: number; // Decimal hours, e.g. +5.5 for IST, -5 for EST
  country: string;
}

const CITY_DATABASE: Record<string, ResolvedLocation> = {
  mumbai: { city: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', latitude: 18.922, longitude: 72.8347, timezone: 5.5, country: 'India' },
  delhi: { city: 'New Delhi', displayName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.209, timezone: 5.5, country: 'India' },
  'new delhi': { city: 'New Delhi', displayName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.209, timezone: 5.5, country: 'India' },
  varanasi: { city: 'Varanasi', displayName: 'Varanasi, Uttar Pradesh, India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, country: 'India' },
  ahmedabad: { city: 'Ahmedabad', displayName: 'Ahmedabad, Gujarat, India', latitude: 23.0225, longitude: 72.5714, timezone: 5.5, country: 'India' },
  bengaluru: { city: 'Bengaluru', displayName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, country: 'India' },
  bangalore: { city: 'Bengaluru', displayName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, country: 'India' },
  chennai: { city: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, country: 'India' },
  kolkata: { city: 'Kolkata', displayName: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, country: 'India' },
  jaipur: { city: 'Jaipur', displayName: 'Jaipur, Rajasthan, India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5, country: 'India' },
  goa: { city: 'Goa', displayName: 'Panaji, Goa, India', latitude: 15.2993, longitude: 74.124, timezone: 5.5, country: 'India' },
  kathmandu: { city: 'Kathmandu', displayName: 'Kathmandu, Bagmati, Nepal', latitude: 27.7172, longitude: 85.324, timezone: 5.75, country: 'Nepal' },
  'kathmandu, nepal': { city: 'Kathmandu', displayName: 'Kathmandu, Bagmati, Nepal', latitude: 27.7172, longitude: 85.324, timezone: 5.75, country: 'Nepal' },
  'new york': { city: 'New York', displayName: 'New York, NY, USA', latitude: 40.7128, longitude: -74.006, timezone: -5.0, country: 'USA' },
  'new york, usa': { city: 'New York', displayName: 'New York, NY, USA', latitude: 40.7128, longitude: -74.006, timezone: -5.0, country: 'USA' },
  london: { city: 'London', displayName: 'London, England, UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, country: 'UK' },
  'london, uk': { city: 'London', displayName: 'London, England, UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, country: 'UK' },
  tokyo: { city: 'Tokyo', displayName: 'Tokyo, Kanto, Japan', latitude: 35.6762, longitude: 139.6503, timezone: 9.0, country: 'Japan' },
  'tokyo, japan': { city: 'Tokyo', displayName: 'Tokyo, Kanto, Japan', latitude: 35.6762, longitude: 139.6503, timezone: 9.0, country: 'Japan' },
  sydney: { city: 'Sydney', displayName: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, country: 'Australia' },
  'sydney, australia': { city: 'Sydney', displayName: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, country: 'Australia' },
  portland: { city: 'Portland', displayName: 'Portland, OR, USA', latitude: 45.5152, longitude: -122.6784, timezone: -8.0, country: 'USA' },
};

export class LocationResolver {
  public static resolve(query: string): ResolvedLocation | undefined {
    if (!query || typeof query !== 'string') return undefined;

    // Sanitize input
    const clean = query.trim().toLowerCase();
    if (clean.includes(';') || clean.includes('--') || clean.includes('/*')) {
      return undefined; // Rejects potential SQL injection strings
    }

    if (CITY_DATABASE[clean]) {
      return CITY_DATABASE[clean];
    }

    // Try finding city prefix
    for (const [key, loc] of Object.entries(CITY_DATABASE)) {
      if (clean.startsWith(key) || clean.includes(key)) {
        return loc;
      }
    }

    return undefined; // Never invent random or (0,0) coordinates!
  }
}
