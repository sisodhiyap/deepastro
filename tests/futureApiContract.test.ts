import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import jwt from 'jsonwebtoken';
import { db } from '../server/src/database/db.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';

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

describe('DEEPASTRO 6.4: Future Intelligence API Contract & Universal Access', () => {
  const userId = 'future-api-user-001';
  let token: string;

  const validBirthProfile = {
    fullName: 'Ananya Roy',
    birthDate: '1993-07-22',
    birthTime: '08:45',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    gender: 'Female',
  };

  beforeAll(() => {
    token = createAuthToken(userId);
  });

  it('1. Rejects unauthenticated request with 401 and structured error', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({ horizon: '10_YEARS' });

    expect([401, 403]).toContain(res.status);
    expect(res.body.error).toMatch(/AUTH_REQUIRED|Authentication required/i);
  });

  it('2. Anti-IDOR: Rejects tampering with userId parameter', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: 'some-other-target-user',
        horizon: '10_YEARS',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
    expect(res.body.details).toMatch(/tampering/i);
  });

  it('3. Enforces ethical psychological consent gate before revealing forecast', async () => {
    FutureConsentEngine.recordConsent(userId, false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        horizon: '10_YEARS',
        birthProfile: validBirthProfile,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FUTURE_CONSENT_REQUIRED');
  });

  it('4. Allows authenticated user with explicit consent without Premium paywall', async () => {
    FutureConsentEngine.recordConsent(userId, true, 'LEVEL_2');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        horizon: '10_YEARS',
        birthProfile: validBirthProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.provenance).toBeDefined();
    expect(res.body.data.timeline?.length).toBeGreaterThan(0);
    expect(res.body.disclaimer).toBeDefined();

    // Verify timeline starts at or after current year (dynamic, not hardcoded historical year)
    const firstYear = res.body.data.timeline[0].year;
    expect(firstYear).toBeGreaterThanOrEqual(new Date().getFullYear());
  });
});
