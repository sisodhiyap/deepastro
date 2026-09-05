/**
 * Normalization Engine
 * Standardizes messy inputs from OCR, forms, and external text into canonical representations
 * while retaining original raw values for complete auditability.
 */

export interface NormalizedField<T> {
  rawValue: any;
  normalizedValue: T;
  isValid: boolean;
  transformationApplied: string;
}

export class NormalizationEngine {
  private static PLANET_MAP: Record<string, string> = {
    surya: 'Sun',
    ravi: 'Sun',
    sun: 'Sun',
    chandra: 'Moon',
    soma: 'Moon',
    moon: 'Moon',
    mangala: 'Mars',
    mangal: 'Mars',
    kuja: 'Mars',
    mars: 'Mars',
    budha: 'Mercury',
    budh: 'Mercury',
    mercury: 'Mercury',
    guru: 'Jupiter',
    brihaspati: 'Jupiter',
    jupiter: 'Jupiter',
    shukra: 'Venus',
    shukr: 'Venus',
    venus: 'Venus',
    shani: 'Saturn',
    saturn: 'Saturn',
    rahu: 'Rahu',
    ketu: 'Ketu',
  };

  private static SIGN_MAP: Record<string, { english: string; sanskrit: string; index: number }> = {
    aries: { english: 'Aries', sanskrit: 'Mesha', index: 0 },
    mesha: { english: 'Aries', sanskrit: 'Mesha', index: 0 },
    taurus: { english: 'Taurus', sanskrit: 'Vrishabha', index: 1 },
    vrishabha: { english: 'Taurus', sanskrit: 'Vrishabha', index: 1 },
    gemini: { english: 'Gemini', sanskrit: 'Mithuna', index: 2 },
    mithuna: { english: 'Gemini', sanskrit: 'Mithuna', index: 2 },
    cancer: { english: 'Cancer', sanskrit: 'Karka', index: 3 },
    karka: { english: 'Cancer', sanskrit: 'Karka', index: 3 },
    leo: { english: 'Leo', sanskrit: 'Simha', index: 4 },
    simha: { english: 'Leo', sanskrit: 'Simha', index: 4 },
    virgo: { english: 'Virgo', sanskrit: 'Kanya', index: 5 },
    kanya: { english: 'Virgo', sanskrit: 'Kanya', index: 5 },
    libra: { english: 'Libra', sanskrit: 'Tula', index: 6 },
    tula: { english: 'Libra', sanskrit: 'Tula', index: 6 },
    scorpio: { english: 'Scorpio', sanskrit: 'Vrischika', index: 7 },
    vrischika: { english: 'Scorpio', sanskrit: 'Vrischika', index: 7 },
    sagittarius: { english: 'Sagittarius', sanskrit: 'Dhanu', index: 8 },
    dhanu: { english: 'Sagittarius', sanskrit: 'Dhanu', index: 8 },
    capricorn: { english: 'Capricorn', sanskrit: 'Makara', index: 9 },
    makara: { english: 'Capricorn', sanskrit: 'Makara', index: 9 },
    aquarius: { english: 'Aquarius', sanskrit: 'Kumbha', index: 10 },
    kumbha: { english: 'Aquarius', sanskrit: 'Kumbha', index: 10 },
    pisces: { english: 'Pisces', sanskrit: 'Meena', index: 11 },
    meena: { english: 'Pisces', sanskrit: 'Meena', index: 11 },
  };

  /**
   * Normalizes birth date into standard ISO YYYY-MM-DD
   */
  public static normalizeBirthDate(raw: string): NormalizedField<string> {
    const rawTrim = (raw || '').trim();
    // 1. Check if already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawTrim)) {
      return { rawValue: raw, normalizedValue: rawTrim, isValid: true, transformationApplied: 'NONE' };
    }

    // 2. Parse DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = rawTrim.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return {
        rawValue: raw,
        normalizedValue: `${year}-${month}-${day}`,
        isValid: true,
        transformationApplied: 'DMY_TO_ISO',
      };
    }

    // 3. Natural date parse (e.g., "14 August 1996")
    const parsed = new Date(rawTrim);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return {
        rawValue: raw,
        normalizedValue: `${year}-${month}-${day}`,
        isValid: true,
        transformationApplied: 'NATURAL_DATE_PARSED',
      };
    }

    return { rawValue: raw, normalizedValue: rawTrim, isValid: false, transformationApplied: 'FAILED' };
  }

  /**
   * Normalizes birth time into standard 24-hour HH:mm
   */
  public static normalizeBirthTime(raw: string): NormalizedField<string> {
    const rawTrim = (raw || '').trim().toUpperCase();

    // 1. 24-hr format HH:mm
    const military = rawTrim.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
    if (military) {
      const hours = military[1].padStart(2, '0');
      const mins = military[2].padStart(2, '0');
      return { rawValue: raw, normalizedValue: `${hours}:${mins}`, isValid: true, transformationApplied: 'MILITARY_TIME' };
    }

    // 2. 12-hr format with AM/PM (e.g. "07:42 AM")
    const ampmMatch = rawTrim.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const mins = ampmMatch[2];
      const meridiem = ampmMatch[3];
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return {
        rawValue: raw,
        normalizedValue: `${String(hours).padStart(2, '0')}:${mins}`,
        isValid: true,
        transformationApplied: 'AMPM_TO_24HR',
      };
    }

    return { rawValue: raw, normalizedValue: '12:00', isValid: false, transformationApplied: 'DEFAULT_NOON_FALLBACK' };
  }

  /**
   * Normalizes planet name from Hindi, Sanskrit, or English into canonical English Navagraha
   */
  public static normalizePlanetName(raw: string): NormalizedField<string> {
    const key = (raw || '').toLowerCase().trim();
    const normalized = this.PLANET_MAP[key] || raw;
    return {
      rawValue: raw,
      normalizedValue: normalized,
      isValid: Boolean(this.PLANET_MAP[key]),
      transformationApplied: 'PLANET_MAP_LOOKUP',
    };
  }

  /**
   * Normalizes zodiac sign from Sanskrit, Hindi, or English into canonical sign object
   */
  public static normalizeSign(raw: string): NormalizedField<{ english: string; sanskrit: string; index: number }> {
    const key = (raw || '').toLowerCase().trim();
    const entry = this.SIGN_MAP[key];
    if (entry) {
      return { rawValue: raw, normalizedValue: entry, isValid: true, transformationApplied: 'SIGN_MAP_LOOKUP' };
    }
    return {
      rawValue: raw,
      normalizedValue: { english: 'Aries', sanskrit: 'Mesha', index: 0 },
      isValid: false,
      transformationApplied: 'FALLBACK_ARIES',
    };
  }

  /**
   * Normalizes city or coordinate string into resolved location data
   */
  public static normalizeLocation(placeName: string, lat?: number, lng?: number, tz?: number) {
    const lower = (placeName || '').toLowerCase().trim();

    // Comprehensive worldwide and Indian canonical city coordinate database
    const CITY_DB: Record<string, { lat: number; lng: number; tz: number; name: string }> = {
      delhi: { lat: 28.6139, lng: 77.209, tz: 5.5, name: 'New Delhi, India' },
      'new delhi': { lat: 28.6139, lng: 77.209, tz: 5.5, name: 'New Delhi, India' },
      mumbai: { lat: 19.076, lng: 72.8777, tz: 5.5, name: 'Mumbai, India' },
      bombay: { lat: 19.076, lng: 72.8777, tz: 5.5, name: 'Mumbai, India' },
      bangalore: { lat: 12.9716, lng: 77.5946, tz: 5.5, name: 'Bengaluru, India' },
      bengaluru: { lat: 12.9716, lng: 77.5946, tz: 5.5, name: 'Bengaluru, India' },
      kolkata: { lat: 22.5726, lng: 88.3639, tz: 5.5, name: 'Kolkata, India' },
      calcutta: { lat: 22.5726, lng: 88.3639, tz: 5.5, name: 'Kolkata, India' },
      chennai: { lat: 13.0827, lng: 80.2707, tz: 5.5, name: 'Chennai, India' },
      madras: { lat: 13.0827, lng: 80.2707, tz: 5.5, name: 'Chennai, India' },
      hyderabad: { lat: 17.385, lng: 78.4867, tz: 5.5, name: 'Hyderabad, India' },
      ahmedabad: { lat: 23.0225, lng: 72.5714, tz: 5.5, name: 'Ahmedabad, India' },
      pune: { lat: 18.5204, lng: 73.8567, tz: 5.5, name: 'Pune, India' },
      jaipur: { lat: 26.9124, lng: 75.7873, tz: 5.5, name: 'Jaipur, India' },
      lucknow: { lat: 26.8467, lng: 80.9462, tz: 5.5, name: 'Lucknow, India' },
      kanpur: { lat: 26.4499, lng: 80.3319, tz: 5.5, name: 'Kanpur, India' },
      varanasi: { lat: 25.3176, lng: 82.9739, tz: 5.5, name: 'Varanasi, India' },
      patna: { lat: 25.5941, lng: 85.1376, tz: 5.5, name: 'Patna, India' },
      chandigarh: { lat: 30.7333, lng: 76.7794, tz: 5.5, name: 'Chandigarh, India' },
      bhopal: { lat: 23.2599, lng: 77.4126, tz: 5.5, name: 'Bhopal, India' },
      indore: { lat: 22.7196, lng: 75.8577, tz: 5.5, name: 'Indore, India' },
      nagpur: { lat: 21.1458, lng: 79.0882, tz: 5.5, name: 'Nagpur, India' },
      london: { lat: 51.5074, lng: -0.1278, tz: 0.0, name: 'London, United Kingdom' },
      'new york': { lat: 40.7128, lng: -74.006, tz: -5.0, name: 'New York, USA' },
      nyc: { lat: 40.7128, lng: -74.006, tz: -5.0, name: 'New York, USA' },
      'san francisco': { lat: 37.7749, lng: -122.4194, tz: -8.0, name: 'San Francisco, USA' },
      chicago: { lat: 41.8781, lng: -87.6298, tz: -6.0, name: 'Chicago, USA' },
      toronto: { lat: 43.6532, lng: -79.3832, tz: -5.0, name: 'Toronto, Canada' },
      vancouver: { lat: 49.2827, lng: -123.1207, tz: -8.0, name: 'Vancouver, Canada' },
      dubai: { lat: 25.2048, lng: 55.2708, tz: 4.0, name: 'Dubai, UAE' },
      singapore: { lat: 1.3521, lng: 103.8198, tz: 8.0, name: 'Singapore' },
      tokyo: { lat: 35.6762, lng: 139.6503, tz: 9.0, name: 'Tokyo, Japan' },
      sydney: { lat: -33.8688, lng: 151.2093, tz: 10.0, name: 'Sydney, Australia' },
      melbourne: { lat: -37.8136, lng: 144.9631, tz: 10.0, name: 'Melbourne, Australia' },
      paris: { lat: 48.8566, lng: 2.3522, tz: 1.0, name: 'Paris, France' },
      berlin: { lat: 52.52, lng: 13.405, tz: 1.0, name: 'Berlin, Germany' },
    };

    // Check if placeName matches any city in database
    for (const [key, match] of Object.entries(CITY_DB)) {
      if (lower.includes(key)) {
        return {
          placeName: placeName || match.name,
          latitude: typeof lat === 'number' && !isNaN(lat) && lat !== 0 && lat !== 28.6139 ? lat : match.lat,
          longitude: typeof lng === 'number' && !isNaN(lng) && lng !== 0 && lng !== 77.209 ? lng : match.lng,
          timezone: typeof tz === 'number' && !isNaN(tz) ? tz : match.tz,
        };
      }
    }

    // Default fallback if unknown and coordinates not specified
    const resolvedLat = typeof lat === 'number' && !isNaN(lat) ? lat : 28.6139;
    const resolvedLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.209;
    const resolvedTz = typeof tz === 'number' && !isNaN(tz) ? tz : 5.5;

    return {
      placeName: placeName || 'New Delhi, India',
      latitude: resolvedLat,
      longitude: resolvedLng,
      timezone: resolvedTz,
    };
  }
}
