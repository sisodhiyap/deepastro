import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import jwt from 'jsonwebtoken';
import { db } from '../server/src/database/db.js';
import { PastLifeIntelligenceEngine } from '../server/src/intelligence/pastlife/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

function createAuthToken(userId: string, email: string = `${userId}@deepastro.test`): string {
  db.users.set(userId, {
    id: userId,
    email,
    passwordHash: 'test_hash',
    role: 'CLIENT',
    fullName: 'Test User',
    isActive: true,
    createdAt: new Date().toISOString(),
  } as any);
  return jwt.sign({ userId, email, role: 'CLIENT' }, JWT_SECRET, { expiresIn: '1h' });
}

describe('DEEPASTRO 6.4: Past Life API Contract & Dynamic Engine', () => {
  it('1. Rejects unauthenticated request with 401 and structured JSON error', async () => {
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .send({ format: 'insight_card' });

    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toBeDefined();
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

  it('2. Returns 400 and structured JSON when birth profile is incomplete', async () => {
    const incompleteUserId = `past-life-incomplete-${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const incompleteToken = createAuthToken(incompleteUserId);
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .set('Authorization', `Bearer ${incompleteToken}`)
      .send({ format: 'insight_card' });

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('PAST_LIFE_ANALYSIS_UNAVAILABLE');
    expect(Array.isArray(res.body.missingFields)).toBe(true);
  });

  it('3. Successfully generates past-life reading with valid birth profile in payload', async () => {
    const validUserId = `past-life-valid-${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const validToken = createAuthToken(validUserId);
    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        format: 'insight_card',
        birthProfile: {
          fullName: 'Siddhartha Gautama',
          birthDate: '1988-04-14',
          birthTime: '06:30',
          birthPlace: 'Lumbini, Nepal',
          latitude: 27.4833,
          longitude: 83.2767,
          timezone: 5.75,
          gender: 'Male',
        },
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(true);
    expect(res.body.readingId).toBeDefined();
    expect(res.body.schema).toBeDefined();
    expect(res.body.card).toBeDefined();
    expect(res.body.provenance).toBeDefined();
    expect(res.body.provenance.engineVersion).toBe(PastLifeIntelligenceEngine.VERSION);

    // Epistemic safety checks
    expect(res.body.schema.epistemic_notice).toBeDefined();
    expect(res.body.schema.archetype?.primary).toBeDefined();
    expect(res.body.schema.astrological_indicators?.length).toBeGreaterThan(0);
  });

  it('4. Generates distinct, dynamic past-life archetypes for different birth profiles', () => {
    const readingA = PastLifeIntelligenceEngine.generate('user-a', {
      fullName: 'Priya Sharma',
      birthDate: '1995-11-20',
      birthTime: '14:15',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      gender: 'Female',
    } as any);

    const readingB = PastLifeIntelligenceEngine.generate('user-b', {
      fullName: 'Marcus Aurelius',
      birthDate: '1982-01-05',
      birthTime: '02:45',
      birthPlace: 'Rome, Italy',
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: 1.0,
      gender: 'Male',
    } as any);

    expect(readingA.success).toBe(true);
    expect(readingB.success).toBe(true);

    // Different birth charts must produce different astrological indicators and life paths
    expect(readingA.data?.astrological_indicators).not.toEqual(readingB.data?.astrological_indicators);
    expect(readingA.data?.numerology_indicators).not.toEqual(readingB.data?.numerology_indicators);
    expect(readingA.data?.calculation_snapshot_id).not.toBe(readingB.data?.calculation_snapshot_id);
  });
});
