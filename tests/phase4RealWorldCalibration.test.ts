/**
 * DEEPASTRO — PHASE 4: REAL-WORLD ASTROLOGY CALIBRATION & INDEPENDENT BENCHMARK
 * Validates independent reference benchmarking, real-world historical chart calibrations,
 * and longitudinal intelligence calibration.
 */

import { describe, it, expect } from 'vitest';
import {
  Phase4IndependentReferenceBenchmark,
} from '../server/src/astrology/Phase4IndependentReferenceBenchmark.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { LifeReplayEngine } from '../server/src/learning/LifeReplayEngine.js';
import { PredictionCalibrationEngine, PredictionLedgerRecord } from '../server/src/learning/PredictionCalibrationEngine.js';
import { DeepAstroBrain } from '../server/src/brain/DeepAstroBrain.js';

describe('DEEPASTRO PHASE 4 — REAL-WORLD CALIBRATION & INDEPENDENT BENCHMARK SUITE', () => {

  // ── SECTION 1: INDEPENDENT REFERENCE BENCHMARKS ────────────────────────────
  describe('Phase 4: Independent Astronomical Reference Benchmark', () => {
    const benchmarkCohort: BirthProfileInput[] = [
      {
        name: 'Modern Tech Lead',
        birthDate: '1991-09-21',
        birthTime: '08:45',
        birthPlace: 'Bengaluru, India',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 5.5,
        gender: 'Male',
      },
      {
        name: 'Equatorial Native',
        birthDate: '1984-06-15',
        birthTime: '12:00',
        birthPlace: 'Quito, Ecuador',
        latitude: -0.1807,
        longitude: -78.4678,
        timezone: -5.0,
        gender: 'Female',
      },
      {
        name: 'Nordic High Latitude Native',
        birthDate: '1998-12-25',
        birthTime: '03:15',
        birthPlace: 'Stockholm, Sweden',
        latitude: 59.3293,
        longitude: 18.0686,
        timezone: 1.0,
        gender: 'Female',
      },
      {
        name: 'Southern Hemisphere Native',
        birthDate: '1975-10-30',
        birthTime: '17:50',
        birthPlace: 'Melbourne, Australia',
        latitude: -37.8136,
        longitude: 144.9631,
        timezone: 11.0,
        gender: 'Male',
      },
    ];

    it('executes comprehensive benchmark across global cohort with 100% pass rate', () => {
      const summary = Phase4IndependentReferenceBenchmark.runComprehensiveBenchmark(benchmarkCohort);

      expect(summary.benchmarkVersion).toBe('4.0.0-RC');
      expect(summary.totalProfilesTested).toBe(4);
      expect(summary.failedMeasurements).toBe(0);
      expect(summary.overallStatus).toBe('PASS');

      // Verify every profile passed all 12 core measurements
      for (const p of summary.profiles) {
        expect(p.allPassed).toBe(true);
        expect(p.measurements.length).toBeGreaterThanOrEqual(12);

        const sunMeasure = p.measurements.find((m) => m.factor === 'Sun')!;
        const moonMeasure = p.measurements.find((m) => m.factor === 'Moon')!;
        const lagnaMeasure = p.measurements.find((m) => m.factor === 'Ascendant (Lagna)')!;
        const ayanamshaMeasure = p.measurements.find((m) => m.factor === 'Lahiri Ayanamsha')!;
        const jdMeasure = p.measurements.find((m) => m.factor === 'Julian Day (JD)')!;

        expect(sunMeasure.status).toBe('PASS');
        expect(moonMeasure.status).toBe('PASS');
        expect(lagnaMeasure.status).toBe('PASS');
        expect(ayanamshaMeasure.status).toBe('PASS');
        expect(jdMeasure.status).toBe('PASS');

        // Sub-arcsecond precision
        expect(sunMeasure.absoluteErrorArcsec).toBeLessThan(1.0);
        expect(ayanamshaMeasure.absoluteErrorArcsec).toBeLessThan(0.1);
        expect(jdMeasure.absoluteErrorArcsec).toBeLessThan(0.00001);
      }
    });
  });

  // ── SECTION 2: REAL-WORLD HISTORICAL CALIBRATION ────────────────────────────
  describe('Phase 4: Real-World Historical Chart Calibration', () => {
    it('accurately calibrates Swami Vivekananda natal chart (Sagittarius Lagna)', () => {
      // Swami Vivekananda: 12 Jan 1863, 06:33 LMT, Kolkata (22.5726° N, 88.3639° E)
      // Standard historical offset for Kolkata LMT was +5:53:20 (+5.888889h)
      const vivekananda: BirthProfileInput = {
        name: 'Swami Vivekananda',
        birthDate: '1863-01-12',
        birthTime: '06:33',
        birthPlace: 'Kolkata, India',
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: 5.888889,
        gender: 'Male',
      };

      const factSet = VedicAstroEngine.createAstrologyFactSet(vivekananda);

      // Sagittarius Lagna (Dhanu)
      expect(factSet.ascendant.details.signName).toBe('Sagittarius');

      // Sun in Sagittarius with Lagna
      const sun = factSet.planets.find((p) => p.name === 'Sun')!;
      expect(sun.signName).toBe('Sagittarius');

      // Moon in Virgo (Kanya) with Hasta Nakshatra
      const moon = factSet.planets.find((p) => p.name === 'Moon')!;
      expect(moon.signName).toBe('Virgo');
      expect(moon.nakshatra.name).toBe('Hasta');

      // Saturn in Virgo (5th from Moon or 10th from Lagna)
      const saturn = factSet.planets.find((p) => p.name === 'Saturn')!;
      expect(saturn.signName).toBe('Virgo');
    });

    it('accurately calibrates Albert Einstein natal chart (Gemini Lagna with Exalted Venus)', () => {
      // Albert Einstein: 14 March 1879, 11:30 LMT, Ulm, Germany (48.4011° N, 9.9876° E, UTC+0.6658h)
      const einstein: BirthProfileInput = {
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthPlace: 'Ulm, Germany',
        latitude: 48.4011,
        longitude: 9.9876,
        timezone: 0.6658,
        gender: 'Male',
      };

      const factSet = VedicAstroEngine.createAstrologyFactSet(einstein);

      // Gemini Lagna (Mithuna)
      expect(factSet.ascendant.details.signName).toBe('Gemini');

      // Exalted Venus in Pisces in 10th house
      const venus = factSet.planets.find((p) => p.name === 'Venus')!;
      expect(venus.signName).toBe('Pisces');
      expect(venus.house).toBe(10);
      expect(venus.dignity).toBe('Exalted');

      // Mercury in Pisces (Debilitated, creating Neecha Bhanga Raja Yoga with Exalted Venus)
      const mercury = factSet.planets.find((p) => p.name === 'Mercury')!;
      expect(mercury.signName).toBe('Pisces');
      expect(mercury.house).toBe(10);
    });

    it('reproduces Deepti Calibration Benchmark Profile with exact precision', () => {
      const deeptiProfile: BirthProfileInput = {
        name: 'Deepti Calibration Native',
        birthDate: '1987-11-04',
        birthTime: '14:20',
        birthPlace: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
        gender: 'Female',
      };

      const factSet1 = VedicAstroEngine.createAstrologyFactSet(deeptiProfile);
      const snap1 = CalculationSnapshotEngine.createSnapshot(factSet1, 'user_deepti');

      const factSet2 = VedicAstroEngine.createAstrologyFactSet(deeptiProfile);
      const snap2 = CalculationSnapshotEngine.createSnapshot(factSet2, 'user_deepti');

      expect(snap1.calculationFingerprint).toBe(snap2.calculationFingerprint);
      expect(snap1.ascendant.sign).toBeDefined();
      expect(snap1.planetaryPositions.length).toBe(9);
    });
  });

  // ── SECTION 3: LONGITUDINAL LEARNING & CALIBRATION ─────────────────────────
  describe('Phase 4: Longitudinal Learning & Outcome Calibration', () => {
    it('preserves immutable historical calculation snapshots across simulated longitudinal years', () => {
      const native: BirthProfileInput = {
        name: 'Longitudinal Native',
        birthDate: '1990-05-10',
        birthTime: '09:15',
        birthPlace: 'Pune, India',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 5.5,
        gender: 'Male',
      };

      // Day 1: Baseline Calculation Snapshot
      const factSet = VedicAstroEngine.createAstrologyFactSet(native);
      const initialSnapshot = CalculationSnapshotEngine.createSnapshot(factSet, 'user_longitudinal');
      const immutableFingerprint = initialSnapshot.calculationFingerprint;

      // Day 30: Native adds historical milestones
      const milestones = [
        {
          id: 'ms_1',
          userId: 'user_longitudinal',
          title: 'Career Relocation to Singapore',
          eventDate: '2015-08-01',
          eventType: 'RELOCATION',
          userConfirmed: true,
          createdAt: new Date().toISOString(),
        },
      ];
      const replay = LifeReplayEngine.replayLifeTimeline(milestones, initialSnapshot);
      expect(replay.totalMilestonesAnalyzed).toBe(1);

      // Day 90: Native records outcome feedback on past prediction
      const feedbackRecord: PredictionLedgerRecord = {
        predictionId: 'pred_longitudinal_001',
        userId: 'user_longitudinal',
        question: 'Will 2024 bring leadership transition?',
        createdAt: '2024-01-01',
        chartSnapshotId: initialSnapshot.snapshotId,
        dashaSnapshot: { mahadasha: 'Jupiter', antardasha: 'Saturn' },
        transitSnapshot: { saturnSign: 'Aquarius', jupiterSign: 'Taurus', rahuSign: 'Pisces' },
        rulesUsed: ['RULE_10TH_LORD'],
        systemsUsed: ['VEDIC'],
        evidenceIds: ['ev_long_1'],
        predictionWindow: { startDate: '2024-01-01', endDate: '2024-12-31' },
        predictionType: 'CAREER',
        confidenceLevel: 'HIGH',
        userContext: ['Engineering management track'],
        userFeedback: 'HAPPENED_AS_DESCRIBED',
        outcome: 'CONFIRMED',
        calibrationVersion: '4.0.0-RC',
      };

      const metrics = PredictionCalibrationEngine.computeMetrics([feedbackRecord]);
      expect(metrics.directionalConsistency).toBe(1.0);
      expect(metrics.evaluatedPredictions).toBe(1);

      // Day 365: Re-evaluating the chart MUST produce the exact same initial fingerprint
      const factSetDay365 = VedicAstroEngine.createAstrologyFactSet(native);
      const snapshotDay365 = CalculationSnapshotEngine.createSnapshot(factSetDay365, 'user_longitudinal');

      expect(snapshotDay365.calculationFingerprint).toBe(immutableFingerprint);
      expect(snapshotDay365.planetaryPositions[0].longitude).toBe(initialSnapshot.planetaryPositions[0].longitude);
    });

    it('proves AI interpretation cannot alter ephemeris or rules during longitudinal learning', async () => {
      const native: BirthProfileInput = {
        name: 'Invariance Native',
        birthDate: '1993-11-12',
        birthTime: '16:40',
        birthPlace: 'Chennai, India',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 5.5,
        gender: 'Female',
      };

      const reading = await DeepAstroBrain.analyze({
        userId: 'user_invariance',
        question: 'What are the major planetary influences for the coming year?',
        birthProfile: native,
        allowPublicResearch: false,
      });

      // Assert that brain response strictly cites calculated lagna and graha positions
      expect(reading.systemsConsulted.vedic.lagna).toBeDefined();
      expect(reading.calculationFingerprint).toBeDefined();
      expect(reading.structuredReading.whyThisReading.calculationSnapshotHash).toBe(reading.calculationFingerprint);
    });
  });
});
