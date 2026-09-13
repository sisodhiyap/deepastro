/**
 * Birth Data Fingerprint Engine
 * Produces deterministic cryptographic hash for calculation caching, audit trail,
 * and user session isolation.
 *
 * CRITICAL RULE: NEVER use this fingerprint as a pseudo-random seed for astrology.
 * It strictly identifies the unique astronomical inputs.
 */

import crypto from 'crypto';

export interface FingerprintInputs {
  normalizedDate: string; // YYYY-MM-DD
  normalizedTime: string; // HH:mm (24h)
  latitude: number;
  longitude: number;
  timezone: number;
  ayanamsa?: string;
  houseSystem?: string;
  engineVersion?: string;
}

export class BirthFingerprintEngine {
  public static readonly CURRENT_ENGINE_VERSION = '6.0.3';
  public static readonly DEFAULT_AYANAMSA = 'Lahiri (Chitra Paksha)';
  public static readonly DEFAULT_HOUSE_SYSTEM = 'Placidus / Sripati Hybrid';

  /**
   * Generates a 64-character hex SHA-256 fingerprint from birth coordinates and inputs.
   */
  public static generateFingerprint(inputs: FingerprintInputs): string {
    const d = inputs.normalizedDate.trim();
    const t = inputs.normalizedTime.trim();
    const lat = Number(inputs.latitude).toFixed(4);
    const lon = Number(inputs.longitude).toFixed(4);
    const tz = Number(inputs.timezone).toFixed(2);
    const ayan = (inputs.ayanamsa || this.DEFAULT_AYANAMSA).trim().toLowerCase();
    const houses = (inputs.houseSystem || this.DEFAULT_HOUSE_SYSTEM).trim().toLowerCase();
    const version = (inputs.engineVersion || this.CURRENT_ENGINE_VERSION).trim();

    const canonicalString = `${d}|${t}|${lat}|${lon}|${tz}|${ayan}|${houses}|${version}`;
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  }

  /**
   * Generates strict, isolated cache key for chart storage preventing cross-user contamination.
   */
  public static generateCacheKey(inputs: FingerprintInputs): string {
    const fp = this.generateFingerprint(inputs);
    return `deepastro:chart:${fp}:v${inputs.engineVersion || this.CURRENT_ENGINE_VERSION}`;
  }
}
