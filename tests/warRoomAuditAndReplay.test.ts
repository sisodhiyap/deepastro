import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('War Room Claim Audit, Challenger, Replay & Attacks Suite', () => {
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

  it('1. Claim audit breaks prediction into independent claims and evaluates testability', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/claims/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.claims.length).toBeGreaterThanOrEqual(2);
    res.body.claims.forEach((c: any) => {
      expect(c.claimId).toBeDefined();
      expect(c.testable).toBe(true);
      expect(['TESTABLE', 'SUPPORTED', 'CONTRADICTED', 'UNKNOWN', 'OVERCONFIDENT', 'VAGUE', 'NON_FALSIFIABLE']).toContain(c.status);
    });
  });

  it('2. Challenger view provides 15 questions with PASS, WARNING, or FAIL', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/challenger/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.challenger.questions).toHaveLength(15);
    res.body.challenger.questions.forEach((q: any) => {
      expect(['PASS', 'WARNING', 'FAIL']).toContain(q.status);
      expect(q.justification).toBeDefined();
    });
    expect(res.body.challenger.falsificationCondition).toBeDefined();
  });

  it('3. Disconfirmation view calculates Disconfirmation Score and notes healthy skepticism', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/disconfirmation/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.disconfirmation.disconfirmationScore).toBeGreaterThan(0);
    expect(res.body.disconfirmation.whatWouldMakeThisWrong.length).toBeGreaterThan(0);
    expect(res.body.disconfirmation.epistemicVerdict).toBe('HEALTHY_SKEPTICISM_ACTIVE');
  });

  it('4. Reality comparison decomposes Event, Timing, Direction, Magnitude, Context', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/reality-comparison/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reality.dimensions).toHaveLength(5);
    const dims = res.body.reality.dimensions.map((d: any) => d.dimension);
    expect(dims).toEqual(['EVENT', 'TIMING', 'DIRECTION', 'MAGNITUDE', 'CONTEXT']);
  });

  it('5. Prediction replay reproduces identical outcome using cutoff timestamp without rewriting original', async () => {
    const res = await request(app)
      .post('/api/admin/qa/war-room/replay/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.replay.difference.identical).toBe(true);
    expect(res.body.replay.immutableRule).toContain('NEVER rewritten');
  });

  it('6. Red-Team button executes 9 adversarial attacks and verifies deflection', async () => {
    const res = await request(app)
      .post('/api/admin/qa/war-room/attack/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.attackResult.attacksExecuted).toBe(9);
    expect(res.body.attackResult.overallStatus).toBe('ALL_ATTACKS_DEFLECTED');
  });

  it('7. One-Click Complete Prediction Audit executes 11 forensic checks', async () => {
    const res = await request(app)
      .post('/api/admin/qa/war-room/audit/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.audit.checks).toHaveLength(11);
    expect(['PASS', 'WARN']).toContain(res.body.audit.overallStatus);
    expect(res.body.audit.compositeScore).toBeGreaterThan(0.8);
  });
});
