import { describe, it, expect } from 'vitest';
import {
  PredictionReplayEngine,
  PredictionWalkForwardEngine,
  PredictionBacktestEngine,
} from '../../server/src/intelligence/observatory/index.js';

describe('DEEPASTRO OBSERVATORY — Temporal Replay & Leakage Protection Suite', () => {
  it('clean room replay allows access to data strictly before cutoff', () => {
    const context = PredictionReplayEngine.createReplayContext(
      'pred_historical_2024',
      '2024-06-01T00:00:00.000Z'
    );

    // Valid access: historical data from 2024-05-15
    expect(() => {
      PredictionReplayEngine.assertTemporalIntegrity('2024-05-15T12:00:00.000Z', context);
    }).not.toThrow();
  });

  it('clean room replay rejects data created after cutoff with CRITICAL_TEST_FAILURE', () => {
    const context = PredictionReplayEngine.createReplayContext(
      'pred_historical_2024',
      '2024-06-01T00:00:00.000Z'
    );

    // Forbidden access: future event from 2024-07-01
    expect(() => {
      PredictionReplayEngine.assertTemporalIntegrity('2024-07-01T00:00:00.000Z', context);
    }).toThrow(/CRITICAL_TEST_FAILURE: Temporal leakage detected/);
  });

  it('walk forward engine splits data chronologically without shuffling', () => {
    const items = [
      { id: '1', issuedAt: '2023-01-01T00:00:00Z' },
      { id: '2', issuedAt: '2023-04-01T00:00:00Z' },
      { id: '3', issuedAt: '2023-08-01T00:00:00Z' },
      { id: '4', issuedAt: '2024-01-01T00:00:00Z' },
      { id: '5', issuedAt: '2024-06-01T00:00:00Z' },
    ];

    const split = PredictionWalkForwardEngine.splitChronologically(items, 0.6, 0.2);
    expect(split.trainSet.length).toBe(3);
    expect(split.calibrationSet.length).toBe(1);
    expect(split.testSet.length).toBe(1);

    // Verify chronological order
    expect(split.trainSet[0].id).toBe('1');
    expect(split.testSet[0].id).toBe('5');
  });

  it('backtest engine wraps datasets explicitly as CALIBRATION_DATA', () => {
    const dataset = PredictionBacktestEngine.wrapAsCalibrationData(
      [{ id: 'chart_1' }],
      'Historical Research Archive'
    );
    expect(dataset.label).toBe('CALIBRATION_DATA');
  });
});
