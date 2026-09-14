import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { AdminQAAccessGuard } from '../server/src/security/AdminQAAccessGuard.js';

describe('War Room Prediction Forensics Suite', () => {
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

  it('1. Retrieves complete 15-stage immutable lifecycle forensics', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/forensics/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const f = res.body.forensics;
    expect(f.predictionId).toBe('GOLDEN_01_HIGH_EVIDENCE');
    expect(f.datasetType).toBe('SYNTHETIC_TEST');
    expect(f.lifecycle.user).toBeDefined();
    expect(f.lifecycle.birthProfile).toBeDefined();
    expect(f.lifecycle.calculationSnapshot).toBeDefined();
    expect(f.lifecycle.cfie).toBeDefined();
    expect(f.lifecycle.systemSignals.length).toBeGreaterThan(0);
    expect(f.lifecycle.evidence.length).toBeGreaterThan(0);
    expect(f.lifecycle.contradictions.length).toBeGreaterThan(0);
    expect(f.lifecycle.aiGeneration).toBeDefined();
    expect(f.lifecycle.aiCritique).toBeDefined();
    expect(f.lifecycle.qualityGate).toBeDefined();
    expect(f.lifecycle.finalPrediction).toBeDefined();
    expect(f.lifecycle.outcome).toBeDefined();
    expect(f.lifecycle.realityComparison).toBeDefined();
    expect(f.lifecycle.calibration).toBeDefined();
    expect(f.lifecycle.learningStatus).toBeDefined();
  });

  it('2. Verifies CalculationSnapshot contains planetary positions, Vargas, KP, Jaimini, and valid hash', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/forensics/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    const snap = res.body.forensics.lifecycle.calculationSnapshot;
    expect(snap.snapshotHash).toBeDefined();
    expect(snap.calculationVersion).toContain('SwissEph');
    expect(snap.planetaryPositions.length).toBeGreaterThanOrEqual(8);
    expect(snap.houses.length).toBeGreaterThanOrEqual(4);
    expect(snap.vargas.d10DashamshaLord).toBeDefined();
    expect(snap.kp.subLord10th).toBeDefined();
    expect(snap.jaimini.atmaKaraka).toBeDefined();
    expect(res.body.forensics.lifecycle.snapshotIntegrityVerified).toBe(true);
  });

  it('3. Evidence forensics includes supporting and contradicting classical citations without inventing data', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/forensics/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    const evidence = res.body.forensics.lifecycle.evidence;
    const supporting = evidence.filter((e: any) => e.relation === 'SUPPORTING');
    const contradicting = evidence.filter((e: any) => e.relation === 'CONTRADICTING');

    expect(supporting.length).toBeGreaterThan(0);
    expect(contradicting.length).toBeGreaterThan(0);
    supporting.forEach((e: any) => {
      expect(e.source).toBeDefined();
      expect(e.hash).toBeDefined();
      expect(e.verificationStatus).toBe('VERIFIED');
    });
  });

  it('4. AI Reasoning Forensics displays Z53, OpenAI, Gemini, Grok without exposing secrets', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/forensics/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    const ai = res.body.forensics.lifecycle.aiGeneration;
    expect(ai.Z53).toBeDefined();
    expect(ai.OpenAI).toBeDefined();
    expect(ai.Gemini).toBeDefined();
    expect(ai.Grok).toBeDefined();

    expect(ai.Z53.tokenUsage.total).toBeGreaterThan(0);
    expect(ai.OpenAI.latencyMs).toBeGreaterThan(0);

    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain('AI_KEY');
    expect(jsonStr).not.toContain('OPENAI_API_KEY');
    expect(jsonStr).not.toContain('GEMINI_API_KEY');
    expect(jsonStr).not.toContain('JWT_SECRET');
  });

  it('5. Outcome provenance enforces that user silence remains UNKNOWN and never converts to success', async () => {
    const res = await request(app)
      .get('/api/admin/qa/war-room/outcome-provenance/GOLDEN_01_HIGH_EVIDENCE')
      .set('Authorization', `Bearer ${qaToken}`);
    expect(res.status).toBe(200);
    expect(res.body.provenance.silencePolicy).toContain('NEVER converted into success');
    expect(res.body.provenance.confirmedBy).toBeDefined();
  });
});
