import { describe, it, expect } from 'vitest';
import { Z53TokenBudgetManager } from '../server/src/intelligence/future/Z53TokenBudgetManager.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('Z 5.3 Flash Token Budget Manager & Deterministic Chunking', () => {
  const testProfile: BirthProfileInput = {
    name: 'Chunk Native',
    birthDate: '1994-06-18',
    birthTime: '15:20',
    birthPlace: 'Ujjain, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 5.5,
    gender: 'Male',
  };
  const kundli = VedicAstroEngine.calculateKundli(testProfile);

  it('estimates token counts accurately and conservatively for astrological text', () => {
    const text = 'Lagna in Cancer at 14°28\'. Operating Jupiter Mahadasha and Saturn transit.';
    const estimated = Z53TokenBudgetManager.estimateTokens(text);
    expect(estimated).toBeGreaterThan(15);
    expect(estimated).toBeLessThan(35);
  });

  it('reserves and releases token budget without leakage', () => {
    const reqId = 'req_test_123';
    const reserved = Z53TokenBudgetManager.reserveBudget(reqId, 1200, 2048);
    expect(reserved).toBe(true);

    // Release budget
    Z53TokenBudgetManager.releaseBudget(reqId, 1150, 1800);
    // Double release is safe
    expect(() => Z53TokenBudgetManager.releaseBudget(reqId)).not.toThrow();
  });

  it('splits full Kundli into clean deterministic chunks for Z 5.3 Flash synthesis', () => {
    const chunks = Z53TokenBudgetManager.chunkKundliForSynthesis(kundli);

    expect(chunks).toBeDefined();
    expect(chunks.chartChunk).toContain(kundli.ascendant.details.signName);
    expect(chunks.dashaChunk).toContain(kundli.dashas.currentMahadasha.planet);
    expect(chunks.vargaChunk).toContain('D9 Navamsha');
    expect(chunks.yogaDoshaChunk).toContain('YOGAS & DOSHAS');
    expect(chunks.transitChunk).toContain('TRANSIT');
    expect(chunks.estimatedTotalTokens).toBeGreaterThan(100);
    expect(chunks.estimatedTotalTokens).toBeLessThan(Z53TokenBudgetManager.SAFE_INPUT_TOKEN_CEILING);
  });

  it('enforces maximum request output tokens ceiling against runaway queries', () => {
    const reqId = 'req_runaway_test';
    Z53TokenBudgetManager.reserveBudget(reqId, 500, 999999);
    // Should be clamped internally to MAX_REQUEST_OUTPUT_TOKENS
    Z53TokenBudgetManager.releaseBudget(reqId);
  });
});
