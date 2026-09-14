import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Prediction Lifecycle & Immutability Isolation Suite', () => {
  it('19. prediction ledger test cycle proves freeze, SHA-256 hash, and tamper rejection', async () => {
    process.env.DEEPASTRO_QA_EMAIL = 'qa-admin@deepastro.internal';
    process.env.DEEPASTRO_QA_SECRET = 'SecureQASecret_2026!';
    process.env.DEEPASTRO_QA_MODE = 'true';
    delete process.env.DEEPASTRO_SIMULATE_PROD;
    AdminQAAccessGuard.resetStateForTesting();
    AdminQAAccessGuard.initCredentials();

    const loginRes = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: 'qa-admin@deepastro.internal', secret: 'SecureQASecret_2026!' });
    const token = loginRes.body.token;

    const cycleRes = await request(app)
      .post('/api/admin/qa/prediction-ledger/test-cycle')
      .set('Authorization', `Bearer ${token}`);

    expect(cycleRes.status).toBe(200);
    expect(cycleRes.body.frozenHash).toBeDefined();
    expect(cycleRes.body.initialValidation.valid).toBe(true);
    expect(cycleRes.body.tamperAttemptRejected).toBe(true);
    expect(cycleRes.body.tamperReason.toLowerCase()).toContain('hash mismatch');
    expect(cycleRes.body.productionContaminationRisk).toContain('ZERO');
  });
});
