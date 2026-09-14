import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Session Security & Revocation Suite', () => {
  const qaEmail = 'qa-admin@deepastro.internal';
  const qaSecret = 'SecureQASecret_2026!';

  beforeEach(() => {
    process.env.DEEPASTRO_QA_EMAIL = qaEmail;
    process.env.DEEPASTRO_QA_SECRET = qaSecret;
    process.env.DEEPASTRO_QA_MODE = 'true';
    delete process.env.DEEPASTRO_SIMULATE_PROD;
    AdminQAAccessGuard.resetStateForTesting();
    AdminQAAccessGuard.initCredentials();
  });

  it('15. QA logout revokes session immediately', async () => {
    const loginRes = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail, secret: qaSecret });
    const token = loginRes.body.token;

    // Verify session active
    const check1 = await request(app)
      .get('/api/admin/qa/session')
      .set('Authorization', `Bearer ${token}`);
    expect(check1.body.authenticated).toBe(true);

    // Logout
    const logoutRes = await request(app)
      .post('/api/admin/qa/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.body.success).toBe(true);

    // Verify session revoked
    const check2 = await request(app)
      .get('/api/admin/qa/session')
      .set('Authorization', `Bearer ${token}`);
    expect(check2.body.authenticated).toBe(false);
  });

  it('16. revoke-all terminates all active developer QA sessions', async () => {
    const l1 = await request(app).post('/api/admin/qa/login').send({ email: qaEmail, secret: qaSecret });
    const l2 = await request(app).post('/api/admin/qa/login').send({ email: qaEmail, secret: qaSecret });

    const revokeRes = await request(app)
      .post('/api/admin/qa/revoke-all')
      .set('Authorization', `Bearer ${l1.body.token}`);
    expect(revokeRes.status).toBe(200);

    const check = await request(app)
      .get('/api/admin/qa/session')
      .set('Authorization', `Bearer ${l2.body.token}`);
    expect(check.body.authenticated).toBe(false);
  });
});
