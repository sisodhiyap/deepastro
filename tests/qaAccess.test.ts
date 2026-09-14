import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Access & Authentication Test Suite', () => {
  const qaEmail = 'qa-admin@deepastro.internal';
  const qaSecret = 'CosmicQASecret_2026_Secure!';

  beforeEach(() => {
    process.env.DEEPASTRO_QA_EMAIL = qaEmail;
    process.env.DEEPASTRO_QA_SECRET = qaSecret;
    process.env.DEEPASTRO_QA_MODE = 'true';
    delete process.env.DEEPASTRO_SIMULATE_PROD;
    AdminQAAccessGuard.resetStateForTesting();
    AdminQAAccessGuard.initCredentials();
  });

  it('1. valid QA login returns 200, JWT token, and DEEPASTRO_QA_ADMIN role', async () => {
    const res = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail, secret: qaSecret });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('DEEPASTRO_QA_ADMIN');
    expect(res.body.user.permissions).toContain('OBSERVATORY_READ');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('2. invalid QA login returns 401 INVALID_QA_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail, secret: 'WrongSecret123!' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_QA_CREDENTIALS');
  });

  it('3. missing credentials returns 400 MISSING_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MISSING_CREDENTIALS');
  });

  it('4. rate limiting locks out after 5 consecutive failures', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/admin/qa/login')
        .send({ email: qaEmail, secret: 'BadGuess' });
    }

    const lockedRes = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail, secret: qaSecret });

    expect(lockedRes.status).toBe(429);
    expect(lockedRes.body.code).toBe('RATE_LIMITED');
  });

  it('5. secret leakage scan: response NEVER reveals QA secret or password hash', async () => {
    const res = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: qaEmail, secret: qaSecret });

    const bodyString = JSON.stringify(res.body);
    expect(bodyString).not.toContain(qaSecret);
    expect(bodyString).not.toContain('generatedDevSecret');
    expect(bodyString).not.toContain('passwordHash');
  });
});
