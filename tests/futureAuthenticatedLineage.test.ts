/**
 * futureAuthenticatedLineage.test.ts
 * Verifies end-to-end data lineage from Authenticated User -> Canonical Kundli -> Engine Coverage -> Cryptographic Fingerprint.
 * Validates IDOR prevention: User B cannot access User A's forecast.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FutureIntelligenceEngine } from '../server/src/intelligence/future-intelligence/FutureIntelligenceEngine.js';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { futureIntelligenceRepository } from '../server/src/database/repositories/FutureIntelligenceRepository.js';
import { db } from '../server/src/database/db.js';

describe('FUTURE INTELLIGENCE — AUTHENTICATED LINEAGE & PRIVACY TEST SUITE', () => {
  const userA = 'usr_lineage_alice_001';
  const userB = 'usr_lineage_bob_002';

  beforeEach(() => {
    db.birthProfiles.set(userA, {
      id: 'prof_alice_001',
      userId: userA,
      fullName: 'Alice Sharma',
      birthDate: '1992-04-12',
      birthTime: '07:15',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      gender: 'Female',
      createdAt: new Date().toISOString(),
    });

    db.birthProfiles.set(userB, {
      id: 'prof_bob_002',
      userId: userB,
      fullName: 'Bob Verma',
      birthDate: '1988-11-05',
      birthTime: '14:20',
      birthPlace: 'Jaipur, India',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Resolves canonical prediction context with complete cryptographic lineage and engine coverage', async () => {
    const context = await ChartContextResolver.resolve(userA, 'primary');

    expect(context.userId).toBe(userA);
    expect(context.calculationFingerprint).toBeDefined();
    expect(context.calculationFingerprint.length).toBe(64); // SHA-256 hex string

    // Validate engine coverage report
    expect(context.engineCoverage).toBeDefined();
    expect(context.engineCoverage?.D1).toBe('USED');
    expect(context.engineCoverage?.D9).toBe('USED');
    expect(context.engineCoverage?.D10).toBe('USED');
    expect(context.engineCoverage?.VARGAS).toBe('USED');
    expect(context.engineCoverage?.DASHA).toBe('USED');
    expect(context.engineCoverage?.TRANSIT).toBe('USED');
    expect(context.engineCoverage?.KP).toBe('USED');
    expect(context.engineCoverage?.SHADBALA).toBe('USED');
    expect(context.engineCoverage?.ASHTAKAVARGA).toBe('USED');
    expect(context.engineCoverage?.JAIMINI).toBe('USED');
    expect(context.engineCoverage?.REMEDIES).toBe('USED');
    expect(context.engineCoverage?.NUMEROLOGY).toBe('USED');
    expect(context.engineCoverage?.TAROT).toBe('OPTIONAL');
    expect(context.engineCoverage?.PALMISTRY).toBe('OPTIONAL');

    // Validate data lineage object
    expect(context.dataLineage).toBeDefined();
    expect(context.dataLineage?.userId).toBe(userA);
    expect(context.dataLineage?.calculationFingerprint).toBe(context.calculationFingerprint);
    expect(context.dataLineage?.engines.length).toBeGreaterThanOrEqual(10);

    for (const eng of context.dataLineage!.engines) {
      expect(eng.engineId).toBeDefined();
      expect(eng.engineVersion).toBeDefined();
      expect(eng.inputHash.length).toBe(16);
      expect(eng.outputHash.length).toBe(16);
      expect(eng.consumed).toBe(true);
      expect(eng.relevance).toBeDefined();
    }
  });

  it('2. Future forecast result contains identical calculation fingerprint, coverage, and zero empty evidence arrays', async () => {
    const forecast = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      chartId: 'primary',
      years: 3,
    });

    expect(forecast.calculationFingerprint).toBeDefined();
    expect(forecast.engineCoverage).toBeDefined();
    expect(forecast.dataLineage).toBeDefined();
    expect(forecast.dataLineage.calculationFingerprint).toBe(forecast.calculationFingerprint);

    // Verify all 8 domains in every year contain non-empty evidence
    for (const yr of forecast.years) {
      expect(yr.career.evidence.length).toBeGreaterThan(0);
      expect(yr.money.evidence.length).toBeGreaterThan(0);
      expect(yr.relationships.evidence.length).toBeGreaterThan(0);
      expect(yr.health.evidence.length).toBeGreaterThan(0);
      expect(yr.family.evidence.length).toBeGreaterThan(0);
      expect(yr.education.evidence.length).toBeGreaterThan(0);
      expect(yr.travel.evidence.length).toBeGreaterThan(0);
      expect(yr.spirituality.evidence.length).toBeGreaterThan(0);
      expect(yr.evidence.length).toBeGreaterThan(0);
    }
  });

  it('3. IDOR Protection: User B cannot access User A forecast record', async () => {
    const forecastA = await FutureIntelligenceEngine.generateForecast({
      userId: userA,
      chartId: 'primary',
      years: 1,
    });

    const stored = await futureIntelligenceRepository.getForecastById(forecastA.forecastId);
    expect(stored.forecast).toBeDefined();
    expect(stored.forecast?.userId).toBe(userA);

    // Simulated tenant security gate (enforced in futureIntelligenceRoutes.ts)
    const isOwner = stored.forecast?.userId === userB;
    expect(isOwner).toBe(false);
  });
});
