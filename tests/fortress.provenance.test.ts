import { describe, it, expect } from 'vitest';
import { DeepAstroProvenanceService } from '../server/src/services/DeepAstroProvenanceService.js';

describe('DEEPASTRO FORTRESS â€” Cryptographic Provenance', () => {
  it('Generates deterministic SHA-256 fingerprint for canonicalized objects', () => {
    const objA = { b: 2, a: 1, nested: { y: 20, x: 10 } };
    const objB = { a: 1, b: 2, nested: { x: 10, y: 20 } };

    const hashA = DeepAstroProvenanceService.computeSha256(objA);
    const hashB = DeepAstroProvenanceService.computeSha256(objB);

    expect(hashA).toBe(hashB);
    expect(hashA.length).toBe(64);
  });

  it('Produces different fingerprint when calculation data is modified', () => {
    const orig = { ascendant: 45.2, sun: 120.4 };
    const modified = { ascendant: 45.2, sun: 120.5 };

    const hash1 = DeepAstroProvenanceService.computeSha256(orig);
    const hash2 = DeepAstroProvenanceService.computeSha256(modified);

    expect(hash1).not.toBe(hash2);
  });

  it('Registers and publicly verifies authentic report certificates', () => {
    const cert = DeepAstroProvenanceService.registerForecast({
      calculationData: { planetLongitudes: [12, 45, 88] },
      forecastData: { timeline: '10-Year Future Projection' },
      serviceType: 'FUTURE_MAP',
      summaryTitle: 'Certified Future Map',
    });

    expect(cert.verificationId).toMatch(/^DA-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    // Verify valid certificate
    const checkValid = DeepAstroProvenanceService.verifyReport(cert.verificationId);
    expect(checkValid.verified).toBe(true);
    expect(checkValid.details?.serviceType).toBe('FUTURE_MAP');

    // Verify non-existent certificate
    const checkInvalid = DeepAstroProvenanceService.verifyReport('DA-2026-FAKE-0000');
    expect(checkInvalid.verified).toBe(false);
  });
});
