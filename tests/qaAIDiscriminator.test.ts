import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('QA AI Critic & Test Lab Suite', () => {
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

  it('21. executes full 15-test QA Test Lab with 100% pass', async () => {
    const res = await request(app)
      .post('/api/admin/qa/run-test-lab')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(15);
    if (res.body.summary.passed !== 15) {
      console.log('FAILED LAB TESTS:', JSON.stringify(res.body.results.filter((r: any) => r.status !== 'PASSED'), null, 2));
    }
    expect(res.body.summary.passed).toBe(15);
    expect(res.body.summary.failed).toBe(0);
    expect(res.body.summary.status).toBe('ALL_TESTS_PASSED');
  });

  it('22. executes 9-exploit Security Demonstration with all exploits rejected', async () => {
    const res = await request(app)
      .post('/api/admin/qa/security-demo')
      .set('Authorization', `Bearer ${qaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(9);
    expect(res.body.summary.allPassed).toBe(true);
    for (const exploit of res.body.exploits) {
      expect(exploit.status).toBe('SECURITY TEST PASSED');
    }
  });

  it('23. tests AI Critic Mesh and returns multi-provider critiques and quality gate', async () => {
    const res = await request(app)
      .post('/api/admin/qa/ai-critic-test')
      .set('Authorization', `Bearer ${qaToken}`)
      .send({
        forecastText: 'Career promotion in technology leadership during Q3 2027.',
        evidenceCount: 4,
        contradictionCount: 0,
        confidence: 0.74,
      });

    expect(res.status).toBe(200);
    expect(res.body.meshCritiques).toHaveLength(3);
    expect(res.body.finalQualityGate.recommendation).toBe('PASS');
    expect(res.body.finalQualityGate.overallRisk).toBe('LOW');
  });
});
