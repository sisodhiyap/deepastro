/**
 * BirthProfileRepository
 * Relational persistence for user natal birth details.
 */

import { IDatabaseClient, dbClient } from '../postgres.js';
import { BirthProfileRecord } from '../db.js';

export class BirthProfileRepository {
  private client: IDatabaseClient;
  private memoryProfiles: Map<string, BirthProfileRecord> = new Map();

  constructor(client: IDatabaseClient = dbClient) {
    this.client = client;
  }

  public async createProfile(params: Partial<BirthProfileRecord> & { userId: string; fullName: string; birthDate: string; birthTime: string; birthPlace: string; latitude: number; longitude: number; timezone: number }): Promise<BirthProfileRecord> {
    const profile: BirthProfileRecord = {
      id: params.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      fullName: params.fullName,
      birthDate: params.birthDate,
      birthTime: params.birthTime,
      birthPlace: params.birthPlace,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      gender: params.gender || 'Other',
      isApproximateTime: Boolean(params.isApproximateTime),
      ascendantSign: params.ascendantSign || '',
      moonSign: params.moonSign || '',
      sunSign: params.sunSign || '',
      nakshatra: params.nakshatra || '',
      nakshatraPada: params.nakshatraPada || 0,
      currentMahadasha: params.currentMahadasha || '',
      currentAntardasha: params.currentAntardasha || '',
      createdAt: params.createdAt || new Date().toISOString(),
    };
    return this.saveProfile(profile);
  }

  public async saveProfile(profile: BirthProfileRecord): Promise<BirthProfileRecord> {
    if (this.client.isLive()) {
      const sql = `
        INSERT INTO birth_profiles (
          id, user_id, full_name, birth_date, birth_time, birth_place,
          latitude, longitude, timezone, gender, is_approximate_time,
          ascendant_sign, moon_sign, sun_sign, nakshatra, nakshatra_pada,
          current_mahadasha, current_antardasha, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          birth_date = EXCLUDED.birth_date,
          birth_time = EXCLUDED.birth_time,
          birth_place = EXCLUDED.birth_place,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          timezone = EXCLUDED.timezone,
          gender = EXCLUDED.gender,
          is_approximate_time = EXCLUDED.is_approximate_time,
          ascendant_sign = EXCLUDED.ascendant_sign,
          moon_sign = EXCLUDED.moon_sign,
          sun_sign = EXCLUDED.sun_sign,
          nakshatra = EXCLUDED.nakshatra,
          nakshatra_pada = EXCLUDED.nakshatra_pada,
          current_mahadasha = EXCLUDED.current_mahadasha,
          current_antardasha = EXCLUDED.current_antardasha;
      `;
      await this.client.query(sql, [
        profile.id,
        profile.userId,
        profile.fullName,
        profile.birthDate,
        profile.birthTime,
        profile.birthPlace,
        profile.latitude,
        profile.longitude,
        profile.timezone,
        profile.gender,
        profile.isApproximateTime,
        profile.ascendantSign,
        profile.moonSign,
        profile.sunSign,
        profile.nakshatra,
        profile.nakshatraPada,
        profile.currentMahadasha,
        profile.currentAntardasha,
        profile.createdAt,
      ]);
    }
    this.memoryProfiles.set(profile.userId, profile);
    return profile;
  }

  public async getProfileByUserId(userId: string): Promise<BirthProfileRecord | null> {
    if (this.client.isLive()) {
      const res = await this.client.query('SELECT * FROM birth_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;', [userId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        fullName: r.full_name,
        birthDate: r.birth_date,
        birthTime: r.birth_time,
        birthPlace: r.birth_place,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        timezone: parseFloat(r.timezone),
        gender: r.gender,
        isApproximateTime: Boolean(r.is_approximate_time),
        ascendantSign: r.ascendant_sign,
        moonSign: r.moon_sign,
        sunSign: r.sun_sign,
        nakshatra: r.nakshatra,
        nakshatraPada: r.nakshatra_pada,
        currentMahadasha: r.current_mahadasha,
        currentAntardasha: r.current_antardasha,
        createdAt: r.created_at,
      };
    }
    return this.memoryProfiles.get(userId) || null;
  }
}

export const birthProfileRepository = new BirthProfileRepository();
