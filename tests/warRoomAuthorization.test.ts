import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';
import jwt from 'jsonwebtoken';

describe('War Room Authorization & Security Suite', () => {
  let qaToken: string;
  let clientToken: string;

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

    const secret = process.env.JWT_SECRET || 'deepastro_test_jwt_secret_key_12345';
    clientToken = jwt.sign(
      { userId: 'user_regular_001', email: 'user@example.com', role: 'CLIENT' },
      secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Rejects unauthenticated request to /api/admin/qa/war-room/overview with 401', async () => {
    const res = await request(app).get('/api/admin/qa/war-room/overview');
    expect(res.status).toBe(401);
  });

  it('2. Rejects regular CLIENT user access to War Room with 403', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/overview')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('QA or Admin role required');
  });

  it('3. Grants authorized DEEPASTRO_QA_ADMIN access to War Room overview', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/overview')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.epistemicInvariant).toBeDefined();
    expect(res.body.predictionHealth.status).toBe('HEALTHY');
  });

  it('4. Rejects x-dev-bypass and x-qa-bypass header attacks with 400', async () => {
    const devRes = await request(app)
      .get('/api/admin/qa/war-room/overview')
      .set('x-dev-bypass', 'true');
    expect([400, 403]).toContain(devRes.status);

    const qaRes = await request(app)
      .get('/api/admin/qa/war-room/overview')
      .set('x-qa-bypass', 'true');
    expect([400, 403]).toContain(qaRes.status);
  });

  it('5. Rejects query parameter admin override attempts with 400', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/overview?admin=true');
    expect([400, 403]).toContain(res.status);
  });

  it('6. Blocks War Room routes with 404 in strict production environment', async () => {
    process.env.DEEPASTRO_SIMULATE_PROD = 'true';
    const res = await request(app)
      .get('/api/admin/qa/war-room/overview')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(404);
    delete process.env.DEEPASTRO_SIMULATE_PROD;
  });
});

