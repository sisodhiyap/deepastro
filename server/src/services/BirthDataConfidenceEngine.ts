/**
 * Birth Data Confidence Engine (BirthDataConfidenceEngine)
 * Evaluates the empirical reliability of user-supplied birth details.
 * Controls feature eligibility, interpretation certainty, and precision disclosures.
 * Does NOT alter underlying astronomical mathematics.
 */

export type BirthTimePrecision = 'EXACT' | 'APPROXIMATE' | 'UNKNOWN';
export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE';

export interface BirthDataConfidenceInput {
  birthTimePrecision: BirthTimePrecision;
  hasExactCoordinates: boolean;
  locationSource: 'GPS' | 'RESOLVED_CITY' | 'MANUAL_COORDINATES' | 'FALLBACK';
  timezoneSource: 'IANA_EXACT' | 'RESOLVED_HISTORICAL' | 'USER_SPECIFIED' | 'ESTIMATED';
  isHistoricalDstBorder?: boolean;
}

export interface BirthDataConfidenceResult {
  tier: ConfidenceTier;
  score: number; // 0 to 100
  factors: {
    birthTimeConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE';
    locationConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
    timezoneConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  allowedFeatures: {
    ascendantKundli: boolean;
    bhavaChalit: boolean;
    vargaD9D10: boolean;
    exactVimshottariTiming: boolean;
    planetaryRashis: boolean;
    lunarNakshatra: boolean;
    generalPanchanga: boolean;
  };
  disclosures: string[];
  recommendation: string;
}

export class BirthDataConfidenceEngine {
  public static evaluate(input: BirthDataConfidenceInput): BirthDataConfidenceResult {
    let score = 100;
    const disclosures: string[] = [];

    // 1. Birth Time Precision
    let timeConf: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE' = 'HIGH';
    if (input.birthTimePrecision === 'UNKNOWN') {
      timeConf = 'INCONCLUSIVE';
      score -= 50;
      disclosures.push('Birth time is unknown. Ascendant, house cusps, and divisional lagna charts are strictly inconclusive.');
    } else if (input.birthTimePrecision === 'APPROXIMATE') {
      timeConf = 'MEDIUM';
      score -= 20;
      disclosures.push('Birth time is approximate (±15-30m). House cusp boundaries and rapid Varga shifts should be interpreted with caution.');
    } else {
      disclosures.push('Exact recorded birth time provided.');
    }

    // 2. Location Source
    let locConf: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (input.locationSource === 'FALLBACK') {
      locConf = 'LOW';
      score -= 25;
      disclosures.push('Location could not be strictly resolved to canonical GPS coordinates; geodetic error margin may apply.');
    } else if (input.locationSource === 'MANUAL_COORDINATES' || input.locationSource === 'RESOLVED_CITY') {
      locConf = 'MEDIUM';
      score -= 5;
      disclosures.push('Geodetic coordinates resolved via city center datum.');
    }

    // 3. Timezone / DST
    let tzConf: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (input.timezoneSource === 'ESTIMATED') {
      tzConf = 'LOW';
      score -= 20;
      disclosures.push('Historical timezone offset is estimated.');
    } else if (input.isHistoricalDstBorder) {
      tzConf = 'MEDIUM';
      score -= 10;
      disclosures.push('Birth occurred near a historical Daylight Saving Time transition window; verify hospital clock recording.');
    }

    // Determine Final Tier
    let tier: ConfidenceTier = 'HIGH';
    if (timeConf === 'INCONCLUSIVE' || score < 40) {
      tier = 'INCONCLUSIVE';
    } else if (score < 65) {
      tier = 'LOW';
    } else if (score < 85) {
      tier = 'MEDIUM';
    } else {
      tier = 'HIGH';
    }

    const hasTime = input.birthTimePrecision !== 'UNKNOWN';

    return {
      tier,
      score: Math.max(0, Math.min(100, score)),
      factors: {
        birthTimeConfidence: timeConf,
        locationConfidence: locConf,
        timezoneConfidence: tzConf,
      },
      allowedFeatures: {
        ascendantKundli: hasTime,
        bhavaChalit: hasTime && input.birthTimePrecision === 'EXACT',
        vargaD9D10: hasTime,
        exactVimshottariTiming: hasTime,
        planetaryRashis: true,
        lunarNakshatra: true,
        generalPanchanga: true,
      },
      disclosures,
      recommendation:
        tier === 'HIGH'
          ? 'Full house and divisional chart analysis mathematically reliable.'
          : tier === 'MEDIUM'
          ? 'House-based analysis qualified; verify ascendant degree against life milestones.'
          : tier === 'LOW'
          ? 'Focus on Chandra Kundli (Moon chart) and planetary sign alignments.'
          : 'Ascendant unavailable. Use Moon-centric (Rashi-based) analysis only.',
    };
  }
}
