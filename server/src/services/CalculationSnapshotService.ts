/**
 * DeepAstro Calculation Snapshot Service
 * Generates deterministic cryptographic calculation fingerprints and
 * manages snapshot caching for Vedic Kundli calculations.
 */

import crypto from 'crypto';
import { dbClient } from '../database/postgres.js';
import { BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { AuthBootstrapService } from './AuthBootstrapService.js';

export interface CanonicalBirthProfile {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or HH:mm:ss
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number | string;
  timezoneSource?: string;
  locationSource?: string;
  ayanamsha?: string;
  calculationVersion?: string;
  rulesVersion?: string;
  birthTimeConfidence?: 'EXACT' | 'APPROXIMATE' | 'RECTIFIED';
  locationConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  historicalTimezoneData?: Record<string, any>;
  fullName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  isApproximateTime?: boolean;
}

export interface CalculationSnapshotRecord {
  id: string;
  auth_user_id: string;
  birth_profile_id?: string;
  calculation_fingerprint: string;
  engine_version: string;
  rules_version: string;
  calculated_at: string;
  payload: any;
  created_at: string;
}

export class CalculationSnapshotService {
  public static readonly ENGINE_VERSION = 'VedicEngine_v2.0_SwissLahiri';
  public static readonly RULES_VERSION = 'JyotishRules_v7.0_Parashara';
  private static memorySnapshots: Map<string, CalculationSnapshotRecord> = new Map();

  /**
   * Authoritative Canonical Birth Profile Resolver
   * Single Source of Truth: Reads user birth profile from persistent DB/memory
   * and verifies required fields: name, birthDate, birthTime, birthPlace, latitude, longitude, timezone.
   */
  public static async getCanonicalBirthProfile(userId: string): Promise<{
    isValid: boolean;
    profile: CanonicalBirthProfile | null;
    missingFields: string[];
    message?: string;
  }> {
    if (!userId) {
      return {
        isValid: false,
        profile: null,
        missingFields: ['userId'],
        message: 'Authentication required to resolve canonical birth profile.',
      };
    }

    const raw: any = await AuthBootstrapService.getBirthProfile(userId);
    if (!raw) {
      return {
        isValid: false,
        profile: null,
        missingFields: ['fullName', 'birthDate', 'birthTime', 'birthPlace', 'latitude', 'longitude'],
        message: 'Complete your birth profile to calculate this experience.',
      };
    }

    const missingFields: string[] = [];
    const name = (raw.fullName || raw.name || '').trim();
    if (!name) missingFields.push('fullName');
    if (!raw.birthDate) missingFields.push('birthDate');
    if (!raw.birthTime) missingFields.push('birthTime');
    if (!raw.birthPlace) missingFields.push('birthPlace');
    if (raw.latitude === undefined || raw.latitude === null || isNaN(Number(raw.latitude))) missingFields.push('latitude');
    if (raw.longitude === undefined || raw.longitude === null || isNaN(Number(raw.longitude))) missingFields.push('longitude');

    if (missingFields.length > 0) {
      return {
        isValid: false,
        profile: null,
        missingFields,
        message: `Complete your birth profile to calculate this experience. Missing: ${missingFields.join(', ')}`,
      };
    }

    const profile: CanonicalBirthProfile = {
      fullName: name,
      birthDate: String(raw.birthDate).trim(),
      birthTime: String(raw.birthTime).trim(),
      birthPlace: String(raw.birthPlace).trim(),
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      timezone: raw.timezone !== undefined && !isNaN(Number(raw.timezone)) ? Number(raw.timezone) : 5.5,
      gender: raw.gender || 'Other',
      isApproximateTime: Boolean(raw.isApproximateTime),
      birthTimeConfidence: raw.isApproximateTime ? 'APPROXIMATE' : (raw.birthTimeConfidence || 'EXACT'),
      locationConfidence: raw.locationConfidence || 'HIGH',
      ayanamsha: raw.ayanamsha || 'Lahiri',
      calculationVersion: this.ENGINE_VERSION,
      rulesVersion: this.RULES_VERSION,
    };

    return {
      isValid: true,
      profile,
      missingFields: [],
    };
  }

  /**
   * Normalizes arbitrary user birth input into a strictly validated CanonicalBirthProfile.
   */
  public static normalizeBirthProfile(raw: any): CanonicalBirthProfile {
    const birthDate = String(raw?.birthDate || raw?.dob || '').trim();
    const birthTime = String(raw?.birthTime || raw?.tob || '').trim();
    const birthPlace = String(raw?.birthPlace || raw?.pob || raw?.location || '').trim();
    const latitude = Number(raw?.latitude ?? raw?.lat ?? 0);
    const longitude = Number(raw?.longitude ?? raw?.lon ?? 0);
    const timezone = raw?.timezone !== undefined ? Number(raw.timezone) : 5.5;

    return {
      birthDate,
      birthTime,
      birthPlace,
      latitude: isNaN(latitude) ? 0 : latitude,
      longitude: isNaN(longitude) ? 0 : longitude,
      timezone: isNaN(timezone) ? 5.5 : timezone,
      timezoneSource: raw?.timezoneSource || 'IANA',
      locationSource: raw?.locationSource || 'OpenStreetMap_Nominatim',
      ayanamsha: raw?.ayanamsha || 'Lahiri',
      calculationVersion: this.ENGINE_VERSION,
      rulesVersion: this.RULES_VERSION,
      birthTimeConfidence: raw?.isApproximateTime ? 'APPROXIMATE' : (raw?.birthTimeConfidence || 'EXACT'),
      locationConfidence: raw?.locationConfidence || 'HIGH',
      fullName: raw?.fullName || raw?.name || 'Cosmic Native',
      gender: raw?.gender || 'Other',
    };
  }

  /**
   * Generates a deterministic SHA-256 fingerprint for astrological birth input.
   * Incorporates all astronomical calculation and rule parameters.
   */
  public static generateFingerprint(input: BirthProfileInput | CanonicalBirthProfile, ayanamsa: string = 'Lahiri'): string {
    const isApprox = Boolean(
      (input as any).isApproximateTime ||
      (input as any).birthTimeConfidence === 'APPROXIMATE'
    );
    const tzStr = typeof input.timezone === 'number'
      ? input.timezone.toFixed(2)
      : String(input.timezone || '5.5');

    const canonical = [
      String(input.birthDate || '').trim(),
      String(input.birthTime || '').trim(),
      isApprox ? 'APPROX' : 'EXACT',
      Number(input.latitude || 0).toFixed(4),
      Number(input.longitude || 0).toFixed(4),
      tzStr,
      ayanamsa || (input as any).ayanamsha || 'Lahiri',
      this.ENGINE_VERSION,
      this.RULES_VERSION,
    ].join(':::');

    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Invalidates stale calculation snapshots for a user across memory and database upon mutation.
   */
  public static async invalidateUserCalculations(authUserId: string): Promise<void> {
    for (const key of this.memorySnapshots.keys()) {
      if (key.startsWith(`${authUserId}:::`)) {
        this.memorySnapshots.delete(key);
      }
    }
    if (dbClient.isLive()) {
      try {
        await dbClient.query(
          `DELETE FROM calculation_snapshots WHERE auth_user_id = $1;`,
          [authUserId]
        );
      } catch (err) {
        console.warn('[SnapshotService] Error invalidating snapshots in DB:', err);
      }
    }
  }

  /**
   * Fetches an existing snapshot if the calculation fingerprint matches.
   */
  public static async getSnapshot(authUserId: string, fingerprint: string): Promise<any | null> {
    if (dbClient.isLive()) {
      try {
        const res = await dbClient.query(
          `SELECT payload FROM calculation_snapshots 
           WHERE auth_user_id = $1 AND calculation_fingerprint = $2 
           ORDER BY created_at DESC LIMIT 1;`,
          [authUserId, fingerprint]
        );
        if (res.rows.length > 0) {
          return res.rows[0].payload;
        }
      } catch (err) {
        console.warn('[SnapshotService] Error querying snapshot:', err);
      }
    }

    const memKey = `${authUserId}:::${fingerprint}`;
    const mem = this.memorySnapshots.get(memKey);
    return mem ? mem.payload : null;
  }

  /**
   * Stores a new calculation snapshot and invalidates older snapshots for this user.
   */
  public static async saveSnapshot(params: {
    authUserId: string;
    birthProfileId?: string;
    fingerprint: string;
    payload: any;
  }): Promise<CalculationSnapshotRecord> {
    const { authUserId, birthProfileId, fingerprint, payload } = params;
    const id = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: CalculationSnapshotRecord = {
      id,
      auth_user_id: authUserId,
      birth_profile_id: birthProfileId,
      calculation_fingerprint: fingerprint,
      engine_version: this.ENGINE_VERSION,
      rules_version: this.RULES_VERSION,
      calculated_at: now,
      payload,
      created_at: now,
    };

    if (dbClient.isLive()) {
      try {
        await dbClient.query(
          `INSERT INTO calculation_snapshots 
           (id, auth_user_id, birth_profile_id, calculation_fingerprint, engine_version, calculated_at, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            record.id,
            record.auth_user_id,
            record.birth_profile_id || null,
            record.calculation_fingerprint,
            record.engine_version,
            record.calculated_at,
            JSON.stringify(record.payload),
            record.created_at,
          ]
        );
      } catch (err) {
        console.warn('[SnapshotService] Error persisting snapshot to database:', err);
      }
    }

    const memKey = `${authUserId}:::${fingerprint}`;
    this.memorySnapshots.set(memKey, record);
    return record;
  }
}

export const getCanonicalBirthProfile = (userId: string) => CalculationSnapshotService.getCanonicalBirthProfile(userId);

