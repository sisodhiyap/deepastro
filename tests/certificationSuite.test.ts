import { describe, it, expect, beforeEach } from 'vitest';
import {
  DatasetIntegrityCertificationEngine,
  ProspectivePredictionRegistry,
  PredictionIndependenceAnalyzer,
  BootstrapValidationEngine,
  StatisticalCleanRoom,
  AdversarialMetricDatasets,
  PredictionAccuracyCertificateEngine,
} from '../server/src/intelligence/observatory/certification/index.js';

describe('Statistical Integrity & Real-World Accuracy Certification Layer', () => {
  beforeEach(() => {
    ProspectivePredictionRegistry.clear();
  });

  describe('1. Dataset Integrity Certification & Firewall', () => {
    it('registers datasets and enforces the hard real-world accuracy firewall', () => {
      const synthetic = DatasetIntegrityCertificationEngine.getDataset('DS_QA_SYNTHETIC_BENCHMARK_V2');
      expect(synthetic).toBeDefined();
      expect(DatasetIntegrityCertificationEngine.canContributeToRealWorldAccuracy(synthetic!.dataset_type)).toBe(false);

      const benchmark = DatasetIntegrityCertificationEngine.getDataset('DS_HISTORICAL_SWISS_EPHEMERIS_BENCHMARK');
      expect(benchmark).toBeDefined();
      expect(DatasetIntegrityCertificationEngine.canContributeToRealWorldAccuracy(benchmark!.dataset_type)).toBe(false);

      const realUser = DatasetIntegrityCertificationEngine.getDataset('DS_PROSPECTIVE_REAL_WORLD_2026');
      expect(realUser).toBeDefined();
      expect(DatasetIntegrityCertificationEngine.canContributeToRealWorldAccuracy(realUser!.dataset_type)).toBe(true);
    });

    it('generates immutable SHA-256 dataset hashes', () => {
      const realUser = DatasetIntegrityCertificationEngine.getDataset('DS_PROSPECTIVE_REAL_WORLD_2026');
      expect(realUser?.dataset_hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('2. Prospective Prediction Registry & 13-Point Eligibility Gate', () => {
    it('approves clean prospective predictions meeting all 13 criteria', () => {
      const p = ProspectivePredictionRegistry.registerProspectivePrediction({
        prediction_id: 'PRED_PROSPECTIVE_CLEAN_01',
        user_id: 'USER_VAL_01',
        issued_at: '2026-01-01T10:00:00.000Z',
        prediction_target_time: '2026-03-01T10:00:00.000Z',
        domain: 'CAREER',
        horizon: '90D',
        forecast_probability: 0.82,
        calculation_snapshot_hash: 'a1b2c3d4e5f67890abcdef1234567890',
        evidence_hash: 'f0e1d2c3b4a5968712345678abcdef01',
        confidence_frozen: true,
        prediction_text: 'Senior leadership promotion with Saturn aspect confirmed for Q1.',
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        dataset_id: 'DS_PROSPECTIVE_REAL_WORLD_2026',
      });

      ProspectivePredictionRegistry.recordOutcome('PRED_PROSPECTIVE_CLEAN_01', {
        prediction_id: 'PRED_PROSPECTIVE_CLEAN_01',
        outcome_id: 'OUT_01',
        authenticated_user_id: 'USER_VAL_01',
        confirmed_at: '2026-03-05T12:00:00.000Z',
        confirmation_method: 'USER_FEEDBACK',
        original_user_statement: 'Received executive appointment.',
        structured_outcome: {
          state: 'CONFIRMED',
          event_matched: true,
          timing_error_days: 4,
          direction_matched: true,
          domain: 'CAREER',
        },
        verification_level: 'USER_SELF_REPORT',
      });

      const evalResult = ProspectivePredictionRegistry.evaluateEligibility('PRED_PROSPECTIVE_CLEAN_01');
      expect(evalResult.is_eligible).toBe(true);
      expect(evalResult.status).toBe('ELIGIBLE_FOR_REAL_WORLD_ACCURACY');
      expect(evalResult.rejection_reasons.length).toBe(0);
    });

    it('rejects predictions with temporal leakage (target before issuance)', () => {
      ProspectivePredictionRegistry.registerProspectivePrediction({
        prediction_id: 'PRED_LEAKAGE_01',
        user_id: 'USER_VAL_02',
        issued_at: '2026-05-01T10:00:00.000Z',
        prediction_target_time: '2026-02-01T10:00:00.000Z', // Past target!
        domain: 'FINANCE',
        horizon: '30D',
        forecast_probability: 0.75,
        calculation_snapshot_hash: 'a1b2c3d4e5f67890abcdef1234567890',
        evidence_hash: 'f0e1d2c3b4a5968712345678abcdef01',
        confidence_frozen: true,
        prediction_text: 'Retroactively observed financial windfall.',
        is_immutable: true,
        version: 1,
        provider: 'Z53',
        dataset_id: 'DS_PROSPECTIVE_REAL_WORLD_2026',
      });

      const evalResult = ProspectivePredictionRegistry.evaluateEligibility('PRED_LEAKAGE_01');
      expect(evalResult.is_eligible).toBe(false);
      expect(evalResult.status).toBe('NOT_ELIGIBLE_FOR_REAL_WORLD_ACCURACY');
      expect(evalResult.rejection_reasons.some(r => r.includes('target event window') || r.includes('Temporal leakage'))).toBe(true);
    });

    it('rejects mutated/edited predictions (version > 1)', () => {
      ProspectivePredictionRegistry.registerProspectivePrediction({
        prediction_id: 'PRED_MUTATED_01',
        user_id: 'USER_VAL_03',
        issued_at: '2026-01-01T10:00:00.000Z',
        prediction_target_time: '2026-03-01T10:00:00.000Z',
        domain: 'BUSINESS',
        horizon: '30D',
        forecast_probability: 0.75,
        calculation_snapshot_hash: 'a1b2c3d4e5f67890abcdef1234567890',
        evidence_hash: 'f0e1d2c3b4a5968712345678abcdef01',
        confidence_frozen: true,
        prediction_text: 'Commercial transaction closing with new partner.',
        is_immutable: true,
        version: 2, // Mutated!
        provider: 'OpenAI',
        dataset_id: 'DS_PROSPECTIVE_REAL_WORLD_2026',
      });

      const evalResult = ProspectivePredictionRegistry.evaluateEligibility('PRED_MUTATED_01');
      expect(evalResult.is_eligible).toBe(false);
      expect(evalResult.rejection_reasons.some(r => r.includes('mutated'))).toBe(true);
    });
  });

  describe('3. Prediction Independence Analyzer & Kish N_eff', () => {
    it('correctly calculates Kish N_eff for clustered predictions', () => {
      const clustered = [
        { prediction_id: 'P1', user_id: 'U1', domain: 'CAREER', prediction_target_time: '2026-02-01T00:00:00Z', prediction_text: 'Forecast 1' },
        { prediction_id: 'P2', user_id: 'U1', domain: 'CAREER', prediction_target_time: '2026-02-03T00:00:00Z', prediction_text: 'Forecast 2' },
        { prediction_id: 'P3', user_id: 'U1', domain: 'CAREER', prediction_target_time: '2026-02-05T00:00:00Z', prediction_text: 'Forecast 3' },
        { prediction_id: 'P4', user_id: 'U2', domain: 'FINANCE', prediction_target_time: '2026-05-01T00:00:00Z', prediction_text: 'Forecast 4' },
      ];

      const res = PredictionIndependenceAnalyzer.analyze(clustered);
      expect(res.total_predictions).toBe(4);
      expect(res.dependent_count).toBe(3);
      expect(res.effective_sample_size).toBeLessThan(4);
      expect(res.has_dependence_risk).toBe(true);
    });
  });

  describe('4. Bootstrap Validation & Wilson Intervals', () => {
    it('computes exact Wilson score confidence intervals for proportions', () => {
      const interval = BootstrapValidationEngine.calculateWilsonInterval(80, 100, 0.95);
      expect(interval.estimate).toBe(0.8);
      expect(interval.sample_size).toBe(100);
      expect(interval.lower_bound).toBeGreaterThan(0.70);
      expect(interval.upper_bound).toBeLessThan(0.88);
      expect(interval.formatted).toContain('80.0% (N=100, 95% CI:');
    });

    it('produces deterministic reproducible bootstrap distributions with seed', () => {
      const data = [0.04, 0.01, 0.09, 0.00, 0.04, 0.16];
      const boot1 = BootstrapValidationEngine.bootstrapMetric('SAMPLE_BS', data, s => s.reduce((a, b) => a + b, 0) / s.length, 500, 42);
      const boot2 = BootstrapValidationEngine.bootstrapMetric('SAMPLE_BS', data, s => s.reduce((a, b) => a + b, 0) / s.length, 500, 42);
      expect(boot1.bootstrap_mean).toBe(boot2.bootstrap_mean);
      expect(boot1.lower_ci).toBe(boot2.lower_ci);
      expect(boot1.upper_ci).toBe(boot2.upper_ci);
    });
  });

  describe('5. Statistical Clean Room Independent Recomputation', () => {
    it('independently computes Brier score and detects statistical discrepancy', () => {
      const advA = AdversarialMetricDatasets.getDatasetA();
      const cleanA = StatisticalCleanRoom.recompute(advA.records, 0.0025);
      expect(cleanA.independent_brier).toBeLessThan(0.01);
      expect(cleanA.brier_recomputation_status).toBe('MATCH');

      // False claimed Brier should trigger STATISTICAL_INTEGRITY_FAILURE
      const cleanFail = StatisticalCleanRoom.recompute(advA.records, 0.85);
      expect(cleanFail.brier_recomputation_status).toBe('STATISTICAL_INTEGRITY_FAILURE');
      expect(cleanFail.brier_difference).toBeGreaterThan(0.5);
    });

    it('strictly excludes PARTIAL and UNKNOWN outcomes from binary Brier', () => {
      const advK = AdversarialMetricDatasets.getDatasetK(); // 20 partial outcomes
      const cleanK = StatisticalCleanRoom.recompute(advK.records);
      expect(cleanK.sample_size_binary_brier).toBe(0);
      expect(cleanK.partial_outcomes_count).toBe(20);

      const advD = AdversarialMetricDatasets.getDatasetD(); // 20 unknown outcomes
      const cleanD = StatisticalCleanRoom.recompute(advD.records);
      expect(cleanD.sample_size_binary_brier).toBe(0);
      expect(cleanD.unknown_outcomes_count).toBe(20);
    });
  });

  describe('6. Adversarial Metric Datasets Suite', () => {
    it('accurately verifies all 12 adversarial stress datasets (A through L)', () => {
      const allDatasets = AdversarialMetricDatasets.getAll();
      expect(allDatasets.length).toBe(12);

      for (const ds of allDatasets) {
        const clean = StatisticalCleanRoom.recompute(ds.records);
        expect(clean.independent_brier).toBeGreaterThanOrEqual(ds.expected_brier_range[0]);
        expect(clean.independent_brier).toBeLessThanOrEqual(ds.expected_brier_range[1]);
      }
    });
  });

  describe('7. Prediction Accuracy Certificate Engine', () => {
    it('issues PROVISIONAL when sample size is below N=30', () => {
      const advA = AdversarialMetricDatasets.getDatasetA(); // N=20
      const cleanA = StatisticalCleanRoom.recompute(advA.records);
      const indepA = PredictionIndependenceAnalyzer.analyze(advA.records);

      const cert = PredictionAccuracyCertificateEngine.issueCertificate({
        datasetId: 'TEST_DATASET_A',
        datasetHash: cleanA.dataset_hash,
        cleanRoom: cleanA,
        independence: indepA,
        leakageDetected: false,
        postHocDetected: false,
      });

      expect(cert.status).toBe('PROVISIONAL');
      expect(cert.certificate_signature).toMatch(/^[a-f0-9]{64}$/);
      expect(cert.limitations.some(l => l.includes('Provisional certificate'))).toBe(true);
    });

    it('issues NOT_CERTIFIABLE when temporal leakage is detected', () => {
      const advA = AdversarialMetricDatasets.getDatasetA();
      const cleanA = StatisticalCleanRoom.recompute(advA.records);
      const indepA = PredictionIndependenceAnalyzer.analyze(advA.records);

      const cert = PredictionAccuracyCertificateEngine.issueCertificate({
        datasetId: 'TEST_DATASET_A',
        datasetHash: cleanA.dataset_hash,
        cleanRoom: cleanA,
        independence: indepA,
        leakageDetected: true,
        postHocDetected: false,
      });

      expect(cert.status).toBe('NOT_CERTIFIABLE');
      expect(cert.limitations.some(l => l.includes('Temporal leakage'))).toBe(true);
    });
  });
});
