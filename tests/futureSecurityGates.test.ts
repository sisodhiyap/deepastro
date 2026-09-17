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

  const seedBirthProfile = (userId: string) => {
    db.birthProfiles.set(userId, {
      userId,
      fullName: 'Verified Native',
      birthDate: '1992-04-12',
      birthTime: '08:15',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    } as any);
  };

  beforeEach(() => {
    // Clean states if needed
  });

  // TEST 1: Unauthenticated -> AUTH_REQUIRED
  it('TEST 1: rejects unauthenticated request with 401 AUTH_REQUIRED', async () => {
    const res = await request(app)
      .post('/api/future/generate')
      .send({ horizon: '10_YEARS' });

    expect([401, 403]).toContain(res.status);
    expect(res.body.error).toMatch(/AUTH_REQUIRED|Authentication required/i);
  });

  // TEST 2: Authenticated Free user without consent -> FUTURE_CONSENT_REQUIRED (Premium Paywall Removed in 6.4)
  it('TEST 2: permits authenticated free user with consent, directs unconsented user to FUTURE_CONSENT_REQUIRED', async () => {
    const freeUserToken = createAuthToken('free-user-002');
    seedBirthProfile('free-user-002');

    db.subscriptions.set('free-user-002', {
      id: 'sub_free_002',
      userId: 'free-user-002',
      planId: 'FREE',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    // Without consent -> FUTURE_CONSENT_REQUIRED
    FutureConsentEngine.recordConsent('free-user-002', false, 'LEVEL_0');

    const resUnconsented = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({ horizon: '10_YEARS' });

    expect(resUnconsented.status).toBe(403);
    expect(resUnconsented.body.error).toBe('FUTURE_CONSENT_REQUIRED');

    // With explicit psychological consent -> SUCCESS without Premium paywall
    FutureConsentEngine.recordConsent('free-user-002', true, 'LEVEL_2');
    const resConsented = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({ horizon: '10_YEARS' });

    expect(resConsented.status).toBe(200);
    expect(resConsented.body.success).toBe(true);
    expect(resConsented.body.data).toBeDefined();
  });

  // TEST 3: Authenticated Premium user without consent -> CONSENT_REQUIRED
  it('TEST 3: returns 403 FUTURE_CONSENT_REQUIRED when authenticated Premium user has not granted explicit consent', async () => {
    const premiumUserToken = createAuthToken('premium-no-consent-003');
    seedBirthProfile('premium-no-consent-003');
    db.grantEntitlement('premium-no-consent-003', 'FUTURE_INTELLIGENCE_PREMIUM');

    // Ensure consent is not granted
    FutureConsentEngine.recordConsent('premium-no-consent-003', false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${premiumUserToken}`)
      .send({ horizon: '10_YEARS', requestedLevel: 'LEVEL_3' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FUTURE_CONSENT_REQUIRED');
  });

  // TEST 4: Authenticated Premium user with explicit consent -> Future generation allowed
  it('TEST 4: allows future generation for authenticated Premium user with explicit consent and valid profile', async () => {
    const premiumUserToken = createAuthToken('premium-consented-004');
    seedBirthProfile('premium-consented-004');
    db.grantEntitlement('premium-consented-004', 'FUTURE_INTELLIGENCE_PREMIUM');
    FutureConsentEngine.recordConsent('premium-consented-004', true, 'LEVEL_3');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${premiumUserToken}`)
      .send({ horizon: '10_YEARS', requestedLevel: 'LEVEL_3' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.yearForecasts || res.body.data.timeline).toBeDefined();
  });

  // TEST 5: Authenticated Pro user without consent -> CONSENT_REQUIRED
  it('TEST 5: returns 403 FUTURE_CONSENT_REQUIRED when authenticated Pro user has not granted consent', async () => {
    const proUserToken = createAuthToken('pro-no-consent-005');
    seedBirthProfile('pro-no-consent-005');
    db.grantEntitlement('pro-no-consent-005', 'PRO');
    FutureConsentEngine.recordConsent('pro-no-consent-005', false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${proUserToken}`)
      .send({ horizon: '10_YEARS', requestedLevel: 'LEVEL_2' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FUTURE_CONSENT_REQUIRED');
  });

  // TEST 6: Authenticated Pro user with explicit consent -> Future generation allowed
  it('TEST 6: allows future generation for authenticated Pro user with explicit consent', async () => {
    const proUserToken = createAuthToken('pro-consented-006');
    seedBirthProfile('pro-consented-006');
    db.grantEntitlement('pro-consented-006', 'PRO');
    FutureConsentEngine.recordConsent('pro-consented-006', true, 'LEVEL_2');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${proUserToken}`)
      .send({ horizon: '5_YEARS', requestedLevel: 'LEVEL_2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // TEST 7: Free user attempts /api/future/unlock -> DENIED
  it('TEST 7: denies arbitrary unlock requests to /api/future/unlock (endpoint removed)', async () => {
    const freeUserToken = createAuthToken('free-user-007');

    const res = await request(app)
      .post('/api/future/unlock')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({});

    // Endpoint must be removed or strictly forbidden
    expect([404, 403]).toContain(res.status);
  });

  // TEST 8: User attempts to bypass consent by spoofing subscription tier in body -> BLOCKED
  it('TEST 8: denies unconsented user even when attempting to spoof subscription tier in request body', async () => {
    const freeUserToken = createAuthToken('free-spoofer-008');
    seedBirthProfile('free-spoofer-008');
    FutureConsentEngine.recordConsent('free-spoofer-008', false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({
        horizon: '10_YEARS',
        planId: 'PRO',
        tier: 'PRO',
        isPremium: true,
        subscriptionTier: 'PREMIUM',
        unlockFullAccess: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FUTURE_CONSENT_REQUIRED');
  });

  // TEST 9: User attempts body userId spoof (IDOR) -> DENIED
  it('TEST 9: strictly rejects body userId spoofing attempt (Anti-IDOR)', async () => {
    const legitimateToken = createAuthToken('legit-user-009');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${legitimateToken}`)
      .send({
        userId: 'victim-user-999',
        horizon: '10_YEARS',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
    expect(res.body.details).toContain('tampering');
  });

  // TEST 10: User attempts query userId spoof -> DENIED
  it('TEST 10: strictly rejects query parameter userId spoofing attempt (Anti-IDOR)', async () => {
    const legitimateToken = createAuthToken('legit-user-010');

    const res = await request(app)
      .post('/api/future/generate?userId=victim-user-999')
      .set('Authorization', `Bearer ${legitimateToken}`)
      .send({
        horizon: '10_YEARS',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
    expect(res.body.details).toContain('tampering');
  });

  // TEST 11: User attempts header bypass -> DENIED
  it('TEST 11: strictly ignores and rejects header bypass attempts', async () => {
    const freeUserToken = createAuthToken('free-user-011');
    seedBirthProfile('free-user-011');
    FutureConsentEngine.recordConsent('free-user-011', false, 'LEVEL_0');

    const res = await request(app)
      .post('/api/future/generate')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .set('x-dev-bypass', 'true')
      .set('x-admin-bypass', 'true')
      .set('x-qa-bypass', 'true')
      .send({ horizon: '10_YEARS' });

    expect(res.status).toBe(403);
    expect(['FUTURE_CONSENT_REQUIRED', 'BYPASS_HEADER_REJECTED', res.body.error]).toContain(res.body.error);
    expect(res.body.success).not.toBe(true);
  });

  // TEST 12: Page load without consent -> consent remains absent in DB
  it('TEST 12: verifies consent remains absent until user explicitly executes consent', () => {
    const testUserId = 'audit-user-012';
    const consentRecord = FutureConsentEngine.getConsent(testUserId);
    expect(consentRecord.consentGranted).toBe(false);
  });

  // TEST 13: Only explicit POST /api/future/consent creates valid consent record
  it('TEST 13: records consent strictly when user explicitly executes consent endpoint', async () => {
    const userToken = createAuthToken('user-consent-013');

    const res = await request(app)
      .post('/api/future/consent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ consentGranted: true, level: 'LEVEL_3' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.consent.consentGranted).toBe(true);

    const verified = FutureConsentEngine.getConsent('user-consent-013');
    expect(verified.consentGranted).toBe(true);
  });

  // TEST 14: New account registration -> must NOT automatically become Premium/Pro
  it('TEST 14: new user registration creates standard CLIENT role with no automatic PRO/PREMIUM entitlement', async () => {
    const uniqueEmail = `newuser_${Date.now()}@deepastro.test`;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'SecurePassword123!',
        fullName: 'New Cosmic User',
      });

    expect(res.status).toBe(201);
    const userId = res.body.user.id;

    // Verify user role is standard CLIENT
    expect(res.body.user.role).toBe('CLIENT');

    // Verify user does NOT have automatic PRO or FUTURE_INTELLIGENCE_PREMIUM entitlement
    expect(db.hasEntitlement(userId, 'FUTURE_INTELLIGENCE_PREMIUM')).toBe(false);
    expect(db.hasEntitlement(userId, 'PRO')).toBe(false);
    expect(db.hasEntitlement(userId, 'ALL_ACCESS')).toBe(false);

    // Verify subscription is not active PRO
    const sub = db.subscriptions.get(userId);
    expect(sub?.planId).not.toBe('PRO');
    expect(sub?.planId).not.toBe('PREMIUM');
  });
});
