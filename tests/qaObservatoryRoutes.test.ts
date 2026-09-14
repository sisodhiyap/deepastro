import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Observatory Routes Suite', () => {
  let qaToken: string;

  beforeAll(async () => {
    process.env.DEEPASTRO_QA_EMAIL = 'qa-admin@deepastro.internal';
    process.env.DEEPASTRO_QA_SECRET = 'SecureQASecret_2026!';
    process.env.DEEPASTRO_QA_MODE = 'true';
    delete process.env.DEEPASTRO_SIMULATE_PROD;
    AdminQAAccessGuard.resetStateForTesting();
    AdminQAAccessGuard.initCredentials();

    const loginRes = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: 'qa-admin@deepastro.internal', secret: 'SecureQASecret_2026!' });
    qaToken = loginRes.body.token;
  });

  it('20. QA role can access all 9 admin observatory routes', async () => {
    const routes = [
      '/api/admin/observatory/overview',
      '/api/admin/observatory/predictions',
      '/api/admin/observatory/calibration',
      '/api/admin/observatory/fact-check',
      '/api/admin/observatory/discriminator',
      '/api/admin/observatory/red-team',
      '/api/admin/observatory/models',
      '/api/admin/observatory/drift',
      '/api/admin/observatory/regression',
    ];

    for (const route of routes) {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${qaToken}`);
      expect(res.status).toBe(200);
    }
  });

  it('unauthenticated request to observatory routes is rejected', async () => {
    const res = await request(app).get('/api/admin/observatory/overview');
    expect(res.status).toBe(401);
  });
});
