import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { db } from '../server/src/database/db.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import jwt from 'jsonwebtoken';

describe('Future Intelligence Fortress Security & Anti-Bypass Gates (CFIE v2.0)', () => {
  const secret = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

  const createAuthToken = (userId: string, role: any = 'USER') => {
    // Ensure user exists in db so requireAuth validates successfully
    db.users.set(userId, {
      id: userId,
      email: `${userId}@deepastro.test`,
      role,
      passwordHash: 'hashed_pw',
      fullName: 'Test User',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    return jwt.sign({ userId, email: `${userId}@deepastro.test`, role }, secret, { expiresIn: '1h' });
  };

  beforeEach(() => {
    // Clear any test states
  });

  it('rejects unauthenticated request with 401 status', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({ horizon: '10_YEARS' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Authentication required');
  });

  it('strictly rejects client-supplied body userId tampering (Anti-IDOR)', async () => {
    const legitimateToken = createAuthToken('legitimate-user-123');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${legitimateToken}`)
      .send({
        userId: 'victim-user-456', // Attempted IDOR tampering
        horizon: '10_YEARS',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
    expect(res.body.details).toContain('tampering');
  });

  it('strictly ignores and rejects x-dev-bypass header', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .set('x-dev-bypass', 'true')
      .set('x-admin-bypass', 'true')
      .send({ horizon: '10_YEARS' });

    expect(res.status).toBe(401);
  });

  it('returns 422 PROFILE_INCOMPLETE when authenticated user has no birth profile', async () => {
    const userWithoutProfileToken = createAuthToken('no-profile-user-789');

    // Grant premium entitlement so it passes subscription check and hits profile validation
    db.subscriptions.set('no-profile-user-789', {
      id: 'sub_test',
      userId: 'no-profile-user-789',
      planId: 'PRO',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    // Grant consent
    FutureConsentEngine.recordConsent('no-profile-user-789', true, 'LEVEL_3');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${userWithoutProfileToken}`)
      .send({ horizon: '10_YEARS' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('PROFILE_INCOMPLETE');
  });

  it('returns 403 PREMIUM_REQUIRED when free user requests future intelligence without entitlement', async () => {
    const freeUserToken = createAuthToken('free-user-321');

    // Seed profile
    db.birthProfiles.set('free-user-321', {
      userId: 'free-user-321',
      fullName: 'Free Seeker',
      birthDate: '1992-04-12',
      birthTime: '08:15',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
    } as any);

    // Free plan
    db.subscriptions.set('free-user-321', {
      id: 'sub_free',
      userId: 'free-user-321',
      planId: 'FREE',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({ horizon: '10_YEARS' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('PREMIUM_REQUIRED');
  });

  it('returns 403 FUTURE_CONSENT_REQUIRED when premium user has not granted explicit consent', async () => {
    const proUserToken = createAuthToken('pro-no-consent-user');

    db.birthProfiles.set('pro-no-consent-user', {
      userId: 'pro-no-consent-user',
      fullName: 'Pro Native',
      birthDate: '1988-11-20',
      birthTime: '16:45',
      birthPlace: 'Jaipur, India',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
    } as any);

    db.subscriptions.set('pro-no-consent-user', {
      id: 'sub_pro',
      userId: 'pro-no-consent-user',
      planId: 'PRO',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    // Explicitly unconsented
    FutureConsentEngine.recordConsent('pro-no-consent-user', false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${proUserToken}`)
      .send({ horizon: '10_YEARS', requestedLevel: 'LEVEL_3' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FUTURE_CONSENT_REQUIRED');
  });
});
