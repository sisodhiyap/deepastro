import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';
import { DatasetRegistry } from '../server/src/intelligence/observatory/v2/DatasetRegistry.js';

describe('QA Dataset Isolation Suite', () => {
  it('17. golden fixtures are all marked SYNTHETIC_TEST and separated from production', async () => {
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

    const res = await request(app)
      .get('/api/admin/qa/golden-fixtures')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(13);
    expect(res.body.dataset_type).toBe('SYNTHETIC_TEST');
    for (const fixture of res.body.fixtures) {
      expect(fixture.dataset_type).toBe('SYNTHETIC_TEST');
      expect(fixture.label).toContain('QA TEST DATA');
    }
  });

  it('18. DatasetRegistry blocks synthetic data from contributing to real-world accuracy', () => {
    const ds = DatasetRegistry.createSyntheticDataset(['synth_qa_01', 'synth_qa_02']);
    expect(DatasetRegistry.canContributeToRealWorldAccuracy(ds.datasetId)).toBe(false);

    // Verify filterForRealWorldAccuracy strips synthetic IDs
    const filtered = DatasetRegistry.filterForRealWorldAccuracy(['synth_qa_01', 'real_user_01']);
    expect(filtered).not.toContain('synth_qa_01');
  });
});
