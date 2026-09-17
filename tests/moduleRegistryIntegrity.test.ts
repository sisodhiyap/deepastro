import { describe, it, expect } from 'vitest';
import {
  COSMIC_MODULE_REGISTRY,
  CosmicModuleId,
  getCosmicModule,
  VERIFIED_MODULE_COUNT
} from '../src/modules/cosmicModuleRegistry.js';

describe('DeepAstro 6.0.3 Module Registry Single Source of Truth Suite', () => {
  const EXPECTED_MODULES: CosmicModuleId[] = [
    'overview',
    'planets',
    'houses',
    'nakshatras',
    'yogas',
    'dasha',
    'transits',
    'vargas',
    'kp',
    'western',
    'career',
    'money',
    'relationships',
    'timeline',
    'daily-context',
    'ai-astrologer'
  ];

  it('verifies exact 16 verified cosmic modules are registered', () => {
    expect(COSMIC_MODULE_REGISTRY.length).toBe(16);
    expect(VERIFIED_MODULE_COUNT).toBe(16);
  });

  it('verifies every expected module ID exists in registry without duplicates', () => {
    const ids = COSMIC_MODULE_REGISTRY.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(16);

    EXPECTED_MODULES.forEach(expectedId => {
      expect(ids).toContain(expectedId);
    });
  });

  it('verifies every module has VERIFIED status and assigned icon', () => {
    COSMIC_MODULE_REGISTRY.forEach(mod => {
      expect(mod.verificationStatus).toBe('VERIFIED');
      expect(mod.icon).toBeDefined();
      expect(mod.label).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(['CALCULATED', 'EVIDENCE-GROUNDED', 'REAL-TIME', 'INTERPRETIVE', 'COMBINED']).toContain(mod.dataSource);
    });
  });

  it('verifies getCosmicModule returns the exact metadata for career and key modules', () => {
    const career = getCosmicModule('career');
    expect(career).toBeDefined();
    expect(career?.label).toBe('Career Deep Dive');
    expect(career?.dataSource).toBe('EVIDENCE-GROUNDED');

    const nakshatras = getCosmicModule('nakshatras');
    expect(nakshatras).toBeDefined();
    expect(nakshatras?.label).toBe('Nakshatras (Lunar)');

    const transits = getCosmicModule('transits');
    expect(transits).toBeDefined();
    expect(transits?.label).toBe('Transit Radar (Gochar)');
  });
});
