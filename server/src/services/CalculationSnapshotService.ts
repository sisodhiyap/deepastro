/**
 * DeepAstro Calculation Snapshot Service
 * Generates deterministic cryptographic calculation fingerprints and
 * manages snapshot caching for Vedic Kundli calculations.
 */

import crypto from 'crypto';
import { dbClient } from '../database/postgres.js';
import { BirthProfileInput } from '../astrology/VedicAstroEngine.js';

export interface CalculationSnapshotRecord {
  id: string;
  auth_user_id: string;
  birth_profile_id?: string;
  calculation_fingerprint: string;
  engine_version: string;
  calculated_at: string;
  payload: any;
  created_at: string;
}

export class CalculationSnapshotService {
  private static ENGINE_VERSION = 'VedicEngine_v2.0_SwissLahiri';
  private static memorySnapshots: Map<string, CalculationSnapshotRecord> = new Map();

  /**
   * Generates a deterministic SHA-256 fingerprint for astrological birth input.
   * Does NOT incorporate user full name so name changes don't cause false re-fingerprinting,
   * but DO incorporate all astronomical parameters.
   */
  public static generateFingerprint(input: BirthProfileInput, ayanamsa: string = 'Lahiri'): string {
    const canonical = [
      input.birthDate,
      input.birthTime,
      Boolean(input.isApproximateTime) ? 'APPROX' : 'EXACT',
      Number(input.latitude).toFixed(4),
      Number(input.longitude).toFixed(4),
      Number(input.timezone).toFixed(2),
      ayanamsa,
      this.ENGINE_VERSION,
    ].join(':::');

    return crypto.createHash('sha256').update(canonical).digest('hex');
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
