import { describe, it, expect } from 'vitest';
import { DeepAstroIntelligenceGateway } from '../server/src/intelligence/gateway/DeepAstroIntelligenceGateway.js';

describe('DEEPASTRO FORTRESS â€” Phase 10 & 11 Authorization & Gating', () => {
  it('Returns AUTH_REQUIRED when anonymous user requests FUTURE_MAP', async () => {
    const res = await DeepAstroIntelligenceGateway.processIntelligence(
      {
        domain: 'FUTURE_MAP',
        userId: '',
        userTier: 'ANONYMOUS',
        hasConsent: true,
        payload: {},
      },
      async () => ({ result: { ok: true } })
    );

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('AUTH_REQUIRED');
  });

  it('Returns FUTURE_CONSENT_REQUIRED when consent has not been granted', async () => {
    const res = await DeepAstroIntelligenceGateway.processIntelligence(
      {
        domain: 'FUTURE_MAP',
        userId: 'usr_premium_123',
        userTier: 'PREMIUM',
        hasConsent: false,
        payload: {},
      },
      async () => ({ result: { ok: true } })
    );

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('FUTURE_CONSENT_REQUIRED');
  });

  it('Permits verified authenticated and consented requests through gateway', async () => {
    const res = await DeepAstroIntelligenceGateway.processIntelligence(
      {
        domain: 'FUTURE_MAP',
        userId: 'usr_premium_123',
        userTier: 'PREMIUM',
        hasConsent: true,
        consentLevel: 'YEARLY',
        payload: { valid: true },
      },
      async (req) => ({
        result: { forecastGenerated: true, userId: req.userId },
        calculationData: { planets: 'verified' },
      })
    );

    expect(res.success).toBe(true);
    expect(res.data.forecastGenerated).toBe(true);
    expect(res.provenance.verificationId).toMatch(/^DA-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});
