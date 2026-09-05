/**
 * CalculationRepository
 * Deterministic caching of astronomical calculation results keyed by SHA-256 fingerprint.
 * Name strictly DOES NOT affect astronomical fingerprint.
 */

import crypto from 'crypto';
import { IDatabaseClient, dbClient } from '../postgres.js';
import { FullKundliResult, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';

export interface CalculationRecord {
  id: string;
  calculationFingerprint: string;
  julianDay: number;
  ayanamshaDegrees: number;
  ayanamshaName: string;
  houseSystem: string;
  ascendantLongitude: number;
  ascendantSign: string;
  ascendantDegreeInSign: number;
  ascendantNakshatra: string;
  ascendantNakshatraPada: number;
  moonLongitude: number;
  moonSign: string;
  moonNakshatra: string;
  sunLongitude: number;
  sunSign: string;
  engineVersion: string;
  ephemerisVersion: string;
  factSetJson: any;
  createdAt: string;
}

export class CalculationRepository {
  private client: IDatabaseClient;
  private memoryCache: Map<string, CalculationRecord> = new Map();

  constructor(client: IDatabaseClient = dbClient) {
    this.client = client;
  }

  /**
   * Generates a deterministic SHA-256 fingerprint from astronomical factors only.
   * Native's name is strictly excluded.
   */
  public static computeAstronomicalFingerprint(
    profile: Pick<BirthProfileInput, 'birthDate' | 'birthTime' | 'latitude' | 'longitude' | 'timezone'>,
    ayanamsha: string = 'Lahiri',
    houseSystem: string = 'Equal',
    ephemerisVersion: string = 'SwissEph-v2.10',
    engineVersion: string = '2.0.0-vedic'
  ): string {
    const raw = [
      profile.birthDate.trim(),
      profile.birthTime.trim(),
      Number(profile.latitude).toFixed(4),
      Number(profile.longitude).toFixed(4),
      Number(profile.timezone).toFixed(2),
      ayanamsha.trim().toLowerCase(),
      houseSystem.trim().toLowerCase(),
      ephemerisVersion.trim(),
      engineVersion.trim(),
    ].join('|');

    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public async findByFingerprint(fingerprint: string): Promise<CalculationRecord | null> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM kundli_calculations WHERE calculation_fingerprint = $1 LIMIT 1;';
      const res = await this.client.query(sql, [fingerprint]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        calculationFingerprint: r.calculation_fingerprint,
        julianDay: parseFloat(r.julian_day),
        ayanamshaDegrees: parseFloat(r.ayanamsha_degrees),
        ayanamshaName: r.ayanamsha_name,
        houseSystem: r.house_system,
        ascendantLongitude: parseFloat(r.ascendant_longitude),
        ascendantSign: r.ascendant_sign,
        ascendantDegreeInSign: parseFloat(r.ascendant_degree_in_sign),
        ascendantNakshatra: r.ascendant_nakshatra,
        ascendantNakshatraPada: r.ascendant_nakshatra_pada,
        moonLongitude: parseFloat(r.moon_longitude),
        moonSign: r.moon_sign,
        moonNakshatra: r.moon_nakshatra,
        sunLongitude: parseFloat(r.sun_longitude),
        sunSign: r.sun_sign,
        engineVersion: r.engine_version,
        ephemerisVersion: r.ephemeris_version,
        factSetJson: typeof r.fact_set_json === 'string' ? JSON.parse(r.fact_set_json) : r.fact_set_json,
        createdAt: r.created_at,
      };
    }
    return this.memoryCache.get(fingerprint) || null;
  }

  public async saveCalculation(
    fingerprint: string,
    kundli: FullKundliResult,
    engineVersion: string = '2.0.0-vedic',
    ephemerisVersion: string = 'SwissEph-v2.10'
  ): Promise<CalculationRecord> {
    const id = `calc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const record: CalculationRecord = {
      id,
      calculationFingerprint: fingerprint,
      julianDay: kundli.astronomy.julianDay,
      ayanamshaDegrees: kundli.astronomy.ayanamshaDegrees,
      ayanamshaName: 'Lahiri',
      houseSystem: 'Equal',
      ascendantLongitude: kundli.ascendant.details.degreeInSign,
      ascendantSign: kundli.ascendant.details.signName,
      ascendantDegreeInSign: kundli.ascendant.details.degreeInSign,
      ascendantNakshatra: kundli.ascendant.nakshatra.name,
      ascendantNakshatraPada: kundli.ascendant.nakshatra.pada,
      moonLongitude: kundli.planets.find((p: any) => p.name === 'Moon')?.siderealLongitude || 0,
      moonSign: kundli.moonSign.signName,
      moonNakshatra: kundli.moonNakshatra.name,
      sunLongitude: kundli.planets.find((p: any) => p.name === 'Sun')?.siderealLongitude || 0,
      sunSign: kundli.sunSign.signName,
      engineVersion,
      ephemerisVersion,
      factSetJson: kundli,
      createdAt: new Date().toISOString(),
    };

    if (this.client.isLive()) {
      const sql = `
        INSERT INTO kundli_calculations (
          id, calculation_fingerprint, julian_day, ayanamsha_degrees, ayanamsha_name,
          house_system, ascendant_longitude, ascendant_sign, ascendant_degree_in_sign,
          ascendant_nakshatra, ascendant_nakshatra_pada, moon_longitude, moon_sign,
          moon_nakshatra, sun_longitude, sun_sign, engine_version, ephemeris_version,
          fact_set_json, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (calculation_fingerprint) DO NOTHING;
      `;
      await this.client.query(sql, [
        record.id,
        record.calculationFingerprint,
        record.julianDay,
        record.ayanamshaDegrees,
        record.ayanamshaName,
        record.houseSystem,
        record.ascendantLongitude,
        record.ascendantSign,
        record.ascendantDegreeInSign,
        record.ascendantNakshatra,
        record.ascendantNakshatraPada,
        record.moonLongitude,
        record.moonSign,
        record.moonNakshatra,
        record.sunLongitude,
        record.sunSign,
        record.engineVersion,
        record.ephemerisVersion,
        JSON.stringify(record.factSetJson),
        record.createdAt,
      ]);
    }

    this.memoryCache.set(fingerprint, record);
    return record;
  }
}

export const calculationRepository = new CalculationRepository();
