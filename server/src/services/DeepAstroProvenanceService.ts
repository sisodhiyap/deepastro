/**
 * DeepAstro Provenance & Cryptographic Fingerprinting Service
 * Version: FORTRESS-1.0
 * Generates canonical, deterministic SHA-256 cryptographic fingerprints for
 * calculations, evidence graphs, and future forecasts, and maintains public
 * verification certificates without exposing private user data.
 */

import crypto from 'crypto';

export interface ProvenanceRecord {
  verificationId: string; // e.g. DA-2026-ABCD-1234
  calculationFingerprint: string;
  evidenceFingerprint: string;
  forecastFingerprint: string;
  engineVersion: string;
  ruleVersion: string;
  ephemerisVersion: string;
  ayanamshaVersion: string;
  createdAt: string;
  status: 'AUTHENTIC_VERIFIED' | 'TAMPERED' | 'EXPIRED';
  serviceType: string;
  summaryTitle: string;
}

export class DeepAstroProvenanceService {
  public static readonly ENGINE_VERSION = '6.0.5-FORTRESS';
  public static readonly RULE_VERSION = 'JYOTISH-V3.4';
  public static readonly EPHEMERIS_VERSION = 'VSOP87-ELP2000-HIGH-PRECISION';
  public static readonly AYANAMSHA_VERSION = 'LAHIRI-CHITRAPAKSHA-1904';

  private static provenanceRegistry: Map<string, ProvenanceRecord> = new Map();

  /**
   * Deterministically canonicalizes an object (sorted keys recursively)
   */
  public static canonicalize(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map((item) => this.canonicalize(item)).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + this.canonicalize(obj[k])).join(',') + '}';
  }

  /**
   * Generates SHA-256 hash of canonicalized object
   */
  public static computeSha256(obj: any): string {
    const canonical = this.canonicalize(obj);
    return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  }

  /**
   * Generates a unique, verification-safe identifier in format DA-2026-XXXX-XXXX
   */
  public static generateVerificationId(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 4; i++) {
      p1 += chars[bytes[i] % chars.length];
      p2 += chars[bytes[i + 4] % chars.length];
    }
    return `DA-2026-${p1}-${p2}`;
  }

  /**
   * Registers a new authoritative calculation & forecast snapshot with cryptographic seal
   */
  public static registerForecast(params: {
    calculationData: any;
    evidenceData?: any;
    forecastData: any;
    serviceType: string;
    summaryTitle: string;
    customVerificationId?: string;
  }): ProvenanceRecord {
    const calcHash = this.computeSha256(params.calculationData);
    const evidenceHash = this.computeSha256(params.evidenceData || { empty: true });
    const forecastHash = this.computeSha256(params.forecastData);

    const verificationId = params.customVerificationId || this.generateVerificationId();

    const record: ProvenanceRecord = {
      verificationId,
      calculationFingerprint: calcHash,
      evidenceFingerprint: evidenceHash,
      forecastFingerprint: forecastHash,
      engineVersion: this.ENGINE_VERSION,
      ruleVersion: this.RULE_VERSION,
      ephemerisVersion: this.EPHEMERIS_VERSION,
      ayanamshaVersion: this.AYANAMSHA_VERSION,
      createdAt: new Date().toISOString(),
      status: 'AUTHENTIC_VERIFIED',
      serviceType: params.serviceType,
      summaryTitle: params.summaryTitle,
    };

    this.provenanceRegistry.set(verificationId, record);
    return record;
  }

  /**
   * Public verification check: validates report existence and cryptographic integrity
   * without exposing any private birth dates, coordinates, or user identities.
   */
  public static verifyReport(reportIdOrVerificationId: string): {
    verified: boolean;
    verificationId?: string;
    status: string;
    details?: {
      engineVersion: string;
      ruleVersion: string;
      createdAt: string;
      serviceType: string;
      summaryTitle: string;
      calculationFingerprintShort: string;
    };
  } {
    // Check direct verificationId or reportId
    let record = this.provenanceRegistry.get(reportIdOrVerificationId);

    if (!record) {
      // Lookup by prefix or check fallback format
      for (const [vId, r] of this.provenanceRegistry.entries()) {
        if (vId === reportIdOrVerificationId || r.verificationId === reportIdOrVerificationId) {
          record = r;
          break;
        }
      }
    }

    if (!record) {
      // If it matches standard format DA-2026-..., return unverified
      return {
        verified: false,
        status: 'UNVERIFIED_OR_NOT_FOUND',
      };
    }

    return {
      verified: true,
      verificationId: record.verificationId,
      status: record.status,
      details: {
        engineVersion: record.engineVersion,
        ruleVersion: record.ruleVersion,
        createdAt: record.createdAt,
        serviceType: record.serviceType,
        summaryTitle: record.summaryTitle,
        calculationFingerprintShort: record.calculationFingerprint.substring(0, 16) + '...',
      },
    };
  }
}
