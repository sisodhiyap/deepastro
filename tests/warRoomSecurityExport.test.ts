import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('War Room Matrices, Failure Explorer & Export Security Suite', () => {
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

  it('1. Accuracy Matrix enforces 10 Domains x 7 Horizons and flags INSUFFICIENT SAMPLE for small N', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/accuracy-matrix')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.domains).toHaveLength(10);
    expect(res.body.horizons).toHaveLength(7);

    // Check an insufficient sample cell
    const cell = res.body.matrix['Education']['10y'];
    expect(cell.status).toBe('INSUFFICIENT_SAMPLE');
    expect(cell.calibration).toContain('INSUFFICIENT SAMPLE');
  });

  it('2. Model War Room compares architectures across 10 dimensions and rejects simplistic single winner', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/model-war-room')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.models.length).toBeGreaterThanOrEqual(4);
    expect(res.body.refusalToCrownSimplisticWinner).toBeDefined();
  });

  it('3. Baseline War Room validates DeepAstro statistically outperforms 5 naive baselines', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/baseline-war-room')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.baselines).toHaveLength(5);
    expect(res.body.verdict).toContain('DeepAstro demonstrates statistically significant improvement');
  });

  it('4. Failure Explorer supports 15 categories and category/domain filtering', async () => {
    const resAll = await request(app)
      .get('/api/admin/qa/war-room/failure-explorer')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(resAll.status).toBe(200);
    expect(resAll.body.categoriesCount).toBe(15);
    expect(resAll.body.totalFailuresRecorded).toBe(15);

    const resFiltered = await request(app)
      .get('/api/admin/qa/war-room/failure-explorer?category=WRONG_TIMING')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(resFiltered.status).toBe(200);
    expect(resFiltered.body.failures.every((f: any) => f.category === 'WRONG_TIMING')).toBe(true);
  });

  it('5. Pattern Discovery distinguishes observed patterns from statistically supported patterns', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/pattern-discovery')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    const types = res.body.patterns.map((p: any) => p.type);
    expect(types).toContain('STATISTICALLY_SUPPORTED_PATTERN');
    expect(types).toContain('OBSERVED_PATTERN');
  });

  it('6. Drift Monitor tracks performance across rolling windows and flags stability', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/drift-monitor')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('STABLE');
    expect(res.body.rollingWindows.length).toBe(3);
  });

  it('7. Forensic JSON export redacts all secrets, passwords, tokens, and API keys', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/export/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.exportMetadata).toBeDefined();
    expect(res.body.predictionForensics).toBeDefined();
    expect(res.body.oneClickAudit).toBeDefined();

    const rawExport = JSON.stringify(res.body);
    expect(rawExport).not.toContain('ADMIN_SECRET');
    expect(rawExport).not.toContain('QA_SECRET');
    expect(rawExport).not.toContain('JWT_SECRET');
    expect(rawExport).not.toContain('password');
    expect(rawExport).not.toContain('OPENAI_API_KEY');
    expect(rawExport).not.toContain('Bearer');
  });
});
