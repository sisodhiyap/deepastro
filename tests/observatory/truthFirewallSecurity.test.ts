import { describe, it, expect } from 'vitest';
import { ImmutableTruthFirewall } from '../../server/src/intelligence/observatory/index.js';

describe('DEEPASTRO OBSERVATORY — Immutable Truth Firewall Suite', () => {
  it('allows read access to sealed calculation snapshot', () => {
    const originalSnapshot = {
      snapshotId: 'snap_123',
      lagna: 'Leo',
      moonNakshatra: 'Magha',
      planetaryPositions: {
        Sun: { sign: 'Aries', degree: 14.5 },
      },
    };

    const sealed = ImmutableTruthFirewall.sealCalculationSnapshot(originalSnapshot);
    expect(sealed.lagna).toBe('Leo');
    expect(sealed.planetaryPositions.Sun.sign).toBe('Aries');
  });

  it('throws CRITICAL_SECURITY_ALERT when attempting to mutate sealed calculation truth', () => {
    const originalSnapshot = {
      lagna: 'Virgo',
      planets: { Jupiter: { sign: 'Cancer' } },
    };

    const sealed = ImmutableTruthFirewall.sealCalculationSnapshot(originalSnapshot);

    expect(() => {
      (sealed as any).lagna = 'Taurus';
    }).toThrow(/CRITICAL_SECURITY_ALERT/);

    const alerts = ImmutableTruthFirewall.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe('CRITICAL_SECURITY_ALERT');
    expect(alerts[0].actionAttempted).toBe('MUTATION_OF_CALCULATION_SNAPSHOT');
  });

  it('throws CRITICAL_SECURITY_ALERT when attempting to delete calculation properties', () => {
    const originalSnapshot = {
      ayanamsa: 'Lahiri',
      julianDay: 2451545.0,
    };

    const sealed = ImmutableTruthFirewall.sealCalculationSnapshot(originalSnapshot);

    expect(() => {
      delete (sealed as any).ayanamsa;
    }).toThrow(/CRITICAL_SECURITY_ALERT/);
  });
});
