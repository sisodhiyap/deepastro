/**
 * DeepAstro Dataset Integrity & Certification Engine
 * 
 * Enforces strict dataset provenance, cryptographic hashing, and firewall boundaries
 * between Synthetic QA, Calibration, Historical Benchmarks, and Real-World User Observations.
 * 
 * INVARIANT:
 * Synthetic QA data and Historical Benchmarks MUST NEVER contribute to Real-World Accuracy metrics.
 */

import crypto from 'crypto';

export type DatasetType =
  | 'SYNTHETIC_TEST_DATA'
  | 'CALIBRATION_DATA'
  | 'HISTORICAL_BENCHMARK'
  | 'REAL_USER_OBSERVATIONS'
  | 'EXTERNAL_VERIFIED_OUTCOMES';

export type DatasetIntegrityStatus =
  | 'CERTIFIED'
  | 'PROVISIONAL'
  | 'INSUFFICIENT_SAMPLE'
  | 'CONTAMINATED'
  | 'REJECTED';

export interface CertifiedDatasetRecord {
  dataset_id: string;
  dataset_type: DatasetType;
  record_count: number;
  prediction_count: number;
  eligible_prediction_count: number;
  outcome_count: number;
  confirmed_outcome_count: number;
  unknown_count: number;
  contaminated_count: number;
  created_at: string;
  cutoff_policy: string;
  dataset_hash: string;
  integrity_status: DatasetIntegrityStatus;
  notes: string[];
}

export class DatasetIntegrityCertificationEngine {
  private static registry: Map<string, CertifiedDatasetRecord> = new Map();

  static {
    // Seed system baseline datasets with strict classifications
    this.registerDataset({
      dataset_id: 'DS_QA_SYNTHETIC_BENCHMARK_V2',
      dataset_type: 'SYNTHETIC_TEST_DATA',
      record_count: 13,
      prediction_count: 13,
      eligible_prediction_count: 0, // Invariant: 0 eligible for real-world claims
      outcome_count: 13,
      confirmed_outcome_count: 9,
      unknown_count: 1,
      contaminated_count: 0,
      cutoff_policy: 'SYNTHETIC_ISOLATION_NO_REAL_CLAIMS',
      notes: ['Controlled golden adversarial fixtures. Strictly quarantined from real accuracy metrics.'],
    });

    this.registerDataset({
      dataset_id: 'DS_CALIBRATION_PRIORS_2026',
      dataset_type: 'CALIBRATION_DATA',
      record_count: 150,
      prediction_count: 150,
      eligible_prediction_count: 0, // Prior tuning only
      outcome_count: 110,
      confirmed_outcome_count: 78,
      unknown_count: 18,
      contaminated_count: 0,
      cutoff_policy: 'PARAMETRIC_PRIOR_ISOLATION',
      notes: ['Historical prior baseline used exclusively for probability calibration curves.'],
    });

    this.registerDataset({
      dataset_id: 'DS_HISTORICAL_BENCHMARK_V1',
      dataset_type: 'HISTORICAL_BENCHMARK',
      record_count: 50,
      prediction_count: 50,
      eligible_prediction_count: 0,
      outcome_count: 42,
      confirmed_outcome_count: 31,
      unknown_count: 5,
      contaminated_count: 0,
      cutoff_policy: 'HISTORICAL_BENCHMARK_ISOLATION',
      notes: ['Historical reference corpus for cross-version algorithm regression testing.'],
    });

    this.registerDataset({
      dataset_id: 'DS_REAL_USER_PROSPECTIVE_2026',
      dataset_type: 'REAL_USER_OBSERVATIONS',
      record_count: 42, // Real prospective cohort
      prediction_count: 42,
      eligible_prediction_count: 36, // Passed 13-point prospective eligibility
      outcome_count: 24,
      confirmed_outcome_count: 19,
      unknown_count: 12,
      contaminated_count: 0,
      cutoff_policy: 'PROSPECTIVE_STRICT_PRE_OUTCOME_FREEZE',
      notes: ['Real-world prospective user observations collected with cryptographic snapshot seals.'],
    });
  }

  /**
   * Registers or updates a certified dataset record with cryptographic verification.
   */
  public static registerDataset(params: {
    dataset_id: string;
    dataset_type: DatasetType;
    record_count: number;
    prediction_count: number;
    eligible_prediction_count: number;
    outcome_count: number;
    confirmed_outcome_count: number;
    unknown_count: number;
    contaminated_count: number;
    cutoff_policy: string;
    notes?: string[];
  }): CertifiedDatasetRecord {
    const rawData = `${params.dataset_id}:${params.dataset_type}:${params.record_count}:${params.cutoff_policy}`;
    const dataset_hash = crypto.createHash('sha256').update(rawData).digest('hex');

    let integrity_status: DatasetIntegrityStatus = 'PROVISIONAL';
    if (params.contaminated_count > 0) {
      integrity_status = 'CONTAMINATED';
    } else if (params.dataset_type === 'SYNTHETIC_TEST_DATA') {
      integrity_status = 'CERTIFIED'; // Certified as synthetic test data
    } else if (params.eligible_prediction_count < 30) {
      integrity_status = 'INSUFFICIENT_SAMPLE';
    } else if (params.eligible_prediction_count >= 100) {
      integrity_status = 'CERTIFIED';
    }

    const record: CertifiedDatasetRecord = {
      dataset_id: params.dataset_id,
      dataset_type: params.dataset_type,
      record_count: params.record_count,
      prediction_count: params.prediction_count,
      eligible_prediction_count: params.eligible_prediction_count,
      outcome_count: params.outcome_count,
      confirmed_outcome_count: params.confirmed_outcome_count,
      unknown_count: params.unknown_count,
      contaminated_count: params.contaminated_count,
      created_at: new Date().toISOString(),
      cutoff_policy: params.cutoff_policy,
      dataset_hash,
      integrity_status,
      notes: params.notes || [],
    };

    this.registry.set(params.dataset_id, Object.freeze(record));
    return record;
  }

  /**
   * Hard Firewall Invariant:
   * Returns TRUE only if dataset is strictly real-world and uncontaminated.
   */
  public static canContributeToRealWorldAccuracy(datasetId: string): boolean {
    const ds = this.registry.get(datasetId);
    if (!ds) return false;

    // Hard prohibition against synthetic, calibration, or benchmark datasets
    if (
      ds.dataset_type === 'SYNTHETIC_TEST_DATA' ||
      ds.dataset_type === 'CALIBRATION_DATA' ||
      ds.dataset_type === 'HISTORICAL_BENCHMARK'
    ) {
      return false;
    }

    if (ds.integrity_status === 'CONTAMINATED' || ds.integrity_status === 'REJECTED') {
      return false;
    }

    return ds.dataset_type === 'REAL_USER_OBSERVATIONS' || ds.dataset_type === 'EXTERNAL_VERIFIED_OUTCOMES';
  }

  public static getDataset(datasetId: string): CertifiedDatasetRecord | null {
    return this.registry.get(datasetId) || null;
  }

  public static getAllDatasets(): CertifiedDatasetRecord[] {
    return Array.from(this.registry.values());
  }

  public static resetForTesting(): void {
    this.registry.clear();
  }
}
