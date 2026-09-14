import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Role & Permissions Guard Suite', () => {
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

  it('12. QA role grants OBSERVATORY_READ, OBSERVATORY_TEST, PREDICTION_AUDIT_READ', async () => {
    const res = await request(app)
      .get('/api/admin/qa/status')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.authenticatedUser.role).toBe('DEEPASTRO_QA_ADMIN');
    expect(res.body.authenticatedUser.permissions).toContain('OBSERVATORY_READ');
    expect(res.body.authenticatedUser.permissions).toContain('DISCRIMINATOR_TEST');
  });

  it('13. QA role is FORBIDDEN from production admin user provisioning', async () => {
    const res = await request(app)
      .post('/api/admin/provision-admin')
      .set('Authorization', `Bearer ${qaToken}`)
      .send({ email: 'newadmin@deepastro.com', password: 'password123', fullName: 'New Admin' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('14. non-QA and unauthenticated requests cannot access QA status', async () => {
    const res = await request(app).get('/api/admin/qa/status');
    expect(res.status).toBe(401);
  });
});
