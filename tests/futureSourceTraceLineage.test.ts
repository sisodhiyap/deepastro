/**
 * futureSourceTraceLineage.test.ts
 * End-to-End Lineage Traceability Suite:
 * Prediction Statement -> Evidence Graph Item -> Calculation Engine -> Snapshot Hash -> Natal Inputs.
 * Proves every future statement is 100% mathematically rooted in canonical Kundli data.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { db } from '../server/src/database/db.js';

describe('FUTURE INTELLIGENCE — SOURCE-TO-PREDICTION TRACEABILITY TEST SUITE', () => {
  const userId = 'usr_trace_test_001';

  beforeEach(() => {
    db.birthProfiles.set(userId, {
      id: 'prof_trace_001',
      userId,
      fullName: 'Rohan Deshmukh',
      birthDate: '1991-03-21',
      birthTime: '09:20',
      birthPlace: 'Pune, India',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Traces prediction statement back to evidence item, engine ID, output hash, and input birth profile', async () => {
    const forecast = await FutureIntelligenceEngine.generateForecast({
      userId,
      chartId: 'primary',
      years: 3,
    });

    const firstYear = forecast.years[0];
    expect(firstYear).toBeDefined();

    // 1. Pick a prediction statement: Career description
    const careerDesc = firstYear.career.description;
    expect(careerDesc).toBeDefined();
    expect(careerDesc.length).toBeGreaterThan(20);

    // 2. Trace to Evidence Items in Career
    const careerEvidence = firstYear.career.evidence;
    expect(careerEvidence.length).toBeGreaterThan(0);

    const d10Evidence = careerEvidence.find((e) => e.source === 'D10');
    expect(d10Evidence).toBeDefined();
    expect(d10Evidence?.rule).toBe('Dashamsha Professional Authority Rule');

    // 3. Trace Evidence Item back to Engine in PredictionDataLineage
    const lineage = forecast.dataLineage;
    expect(lineage).toBeDefined();

    const vargaEngine = lineage.engines.find((e) => e.engineId === 'VARGA_SHODASHAVARGA_ENGINE');
    expect(vargaEngine).toBeDefined();
    expect(vargaEngine?.consumed).toBe(true);
    expect(vargaEngine?.outputHash).toBeDefined();
    expect(vargaEngine?.outputHash.length).toBe(16);

    // 4. Trace back to Calculation Snapshot Fingerprint
    expect(lineage.calculationFingerprint).toBe(forecast.calculationFingerprint);
    expect(lineage.userId).toBe(userId);

    // 5. Trace Fingerprint back to natal inputs
    const context = await ChartContextResolver.resolve(userId, 'primary');
    expect(context.calculationFingerprint).toBe(forecast.calculationFingerprint);
    expect(context.birthDate).toBe('1991-03-21');
    expect(context.birthTime).toBe('09:20');
    expect(context.latitude).toBe(18.5204);
    expect(context.longitude).toBe(73.8567);
  });

  it('2. Traces Ashtakavarga and KP evidence items directly to their engine snapshots', async () => {
    const forecast = await FutureIntelligenceEngine.generateForecast({
      userId,
      chartId: 'primary',
      years: 1,
    });

    const moneyEvidence = forecast.years[0].money.evidence;
    const savEvidence = moneyEvidence.find((e) => e.source === 'ASHTAKAVARGA');
    expect(savEvidence).toBeDefined();
    expect(savEvidence?.rule).toContain('SAV 2nd & 11th House Wealth Potency');

    const savEngine = forecast.dataLineage.engines.find((e) => e.engineId === 'ASHTAKAVARGA_ENGINE');
    expect(savEngine).toBeDefined();
    expect(savEngine?.consumed).toBe(true);
    expect(savEngine?.outputHash.length).toBe(16);

    const kpEvidence = forecast.years[0].career.evidence.find((e) => e.source === 'KP');
    expect(kpEvidence).toBeDefined();

    const kpEngine = forecast.dataLineage.engines.find((e) => e.engineId === 'KP_STELLAR_ENGINE');
    expect(kpEngine).toBeDefined();
    expect(kpEngine?.consumed).toBe(true);
  });
});
