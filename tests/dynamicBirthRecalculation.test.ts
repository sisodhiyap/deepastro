import { describe, it, expect } from 'vitest';
import { CalculationSnapshotService } from '../server/src/services/CalculationSnapshotService.js';
import { BirthProfileInput, VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';

describe('DEEPASTRO 6.4: Dynamic Birth Data & Cryptographic Fingerprint Integrity', () => {
  const profileOriginal: BirthProfileInput = {
    name: 'Dynamic Seeker',
    birthDate: '1990-01-01',
    birthTime: '10:00',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  };

  it('1. Generates consistent, deterministic SHA-256 fingerprint for identical birth data', () => {
    const fp1 = CalculationSnapshotService.generateFingerprint(profileOriginal);
    const fp2 = CalculationSnapshotService.generateFingerprint(profileOriginal);

    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('2. Time mutation: Changing birth time by 30 minutes mutates fingerprint and chart houses', () => {
    const profileMutatedTime: BirthProfileInput = {
      ...profileOriginal,
      birthTime: '10:30',
    };

    const fpOriginal = CalculationSnapshotService.generateFingerprint(profileOriginal);
    const fpMutatedTime = CalculationSnapshotService.generateFingerprint(profileMutatedTime);

    expect(fpMutatedTime).not.toBe(fpOriginal);

    // Calculate charts and verify ascendant / houses change
    const kundliOriginal = VedicAstroEngine.calculateKundli(profileOriginal);
    const kundliMutated = VedicAstroEngine.calculateKundli(profileMutatedTime);

    expect(kundliMutated.ascendant.degrees).not.toBe(kundliOriginal.ascendant.degrees);
  });

  it('3. Location mutation: Changing birth place mutates fingerprint and geographic coordinates', () => {
    const profileMutatedPlace: BirthProfileInput = {
      ...profileOriginal,
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
    };

    const fpOriginal = CalculationSnapshotService.generateFingerprint(profileOriginal);
    const fpMutatedPlace = CalculationSnapshotService.generateFingerprint(profileMutatedPlace);

    expect(fpMutatedPlace).not.toBe(fpOriginal);

    const kundliOriginal = VedicAstroEngine.calculateKundli(profileOriginal);
    const kundliMutated = VedicAstroEngine.calculateKundli(profileMutatedPlace);

    expect(kundliMutated.ascendant.degrees).not.toBe(kundliOriginal.ascendant.degrees);
  });

  it('4. Date mutation: Changing DOB mutates fingerprint and planetary positions', () => {
    const profileMutatedDate: BirthProfileInput = {
      ...profileOriginal,
      birthDate: '1995-05-15',
    };

    const fpOriginal = CalculationSnapshotService.generateFingerprint(profileOriginal);
    const fpMutatedDate = CalculationSnapshotService.generateFingerprint(profileMutatedDate);

    expect(fpMutatedDate).not.toBe(fpOriginal);

    const kundliOriginal = VedicAstroEngine.calculateKundli(profileOriginal);
    const kundliMutated = VedicAstroEngine.calculateKundli(profileMutatedDate);

    // Moon longitude must change across years
    const moonOrig = kundliOriginal.planets.find((p) => p.name === 'Moon');
    const moonMut = kundliMutated.planets.find((p) => p.name === 'Moon');
    expect(moonMut?.siderealLongitude).not.toBe(moonOrig?.siderealLongitude);
  });

  it('5. Reversibility: Switching back to original profile reproduces exact original fingerprint', () => {
    const fpOriginal = CalculationSnapshotService.generateFingerprint(profileOriginal);

    const profileTemp: BirthProfileInput = {
      ...profileOriginal,
      birthTime: '15:45',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
    };
    const fpTemp = CalculationSnapshotService.generateFingerprint(profileTemp);
    expect(fpTemp).not.toBe(fpOriginal);

    // Revert back
    const fpRestored = CalculationSnapshotService.generateFingerprint(profileOriginal);
    expect(fpRestored).toBe(fpOriginal);
  });
});
