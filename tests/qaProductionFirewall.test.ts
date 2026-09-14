import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA Production Firewall & Anti-Bypass Suite', () => {
  beforeEach(() => {
    AdminQAAccessGuard.resetStateForTesting();
  });

  afterEach(() => {
    delete process.env.DEEPASTRO_SIMULATE_PROD;
    delete process.env.DEEPASTRO_QA_MODE;
  });

  it('6. production mode strictly rejects QA routes with 404', async () => {
    process.env.DEEPASTRO_SIMULATE_PROD = 'true';
    process.env.DEEPASTRO_QA_MODE = 'false';

    const res = await request(app)
      .post('/api/admin/qa/login')
      .send({ email: 'qa-admin@deepastro.internal', secret: 'any' });

    expect(res.status).toBe(404);
  });

  it('7. strictly rejects x-dev-bypass header', async () => {
    const res = await request(app)
      .get('/api/admin/qa/status')
      .set('x-dev-bypass', 'true');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('BYPASS_PROHIBITED');
  });

  it('8. strictly rejects x-qa-bypass header', async () => {
    const res = await request(app)
      .get('/api/admin/qa/status')
      .set('x-qa-bypass', 'true');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('BYPASS_PROHIBITED');
  });

  it('9. strictly rejects x-admin-bypass header', async () => {
    const res = await request(app)
      .get('/api/admin/qa/status')
      .set('x-admin-bypass', 'true');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('BYPASS_PROHIBITED');
  });

  it('10. strictly rejects query parameter privilege escalation (?admin=true)', async () => {
    const res = await request(app)
      .get('/api/admin/observatory/overview?admin=true');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PARAM_ESCALATION_PROHIBITED');
  });

  it('11. strictly rejects client-supplied role injection in body', async () => {
    const res = await request(app)
      .post('/api/predictions')
      .send({ role: 'ADMIN', text: 'forecast' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ROLE_MANIPULATION_PROHIBITED');
  });
});
