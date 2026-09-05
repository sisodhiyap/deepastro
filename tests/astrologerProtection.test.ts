import { describe, it, expect } from 'vitest';
import { db } from '../server/src/database/db.js';
import { SubscriptionService } from '../server/src/services/SubscriptionService.js';

describe('Astrologer Contact Server-Side Authorization Shield', () => {
  const freeUserId = 'user_free_test_1';
  const premiumUserId = 'user_prem_test_1';

  it('SCRUBS phone, whatsapp, and email for unauthenticated visitors', () => {
    const list = db.getAstrologers(undefined);
    expect(list.length).toBeGreaterThan(0);

    for (const astro of list) {
      expect(astro.phone).toBeUndefined();
      expect(astro.whatsapp).toBeUndefined();
      expect(astro.email).toBeUndefined();
      expect(astro.hasDirectContactAccess).toBe(false);
    }
  });

  it('SCRUBS phone, whatsapp, and email for FREE plan subscribers', () => {
    db.users.set(freeUserId, {
      id: freeUserId,
      email: 'free@deepastro.com',
      passwordHash: 'hash',
      role: 'USER',
      isVerified: true,
      createdAt: new Date().toISOString(),
    });

    const sub = db.getSubscription(freeUserId);
    expect(sub.planId).toBe('FREE');

    const list = db.getAstrologers(freeUserId);
    expect(list.length).toBeGreaterThan(0);

    for (const astro of list) {
      expect(astro.phone).toBeUndefined();
      expect(astro.whatsapp).toBeUndefined();
      expect(astro.email).toBeUndefined();
      expect(astro.hasDirectContactAccess).toBe(false);
    }

    const single = db.getAstrologerById('astro_1', freeUserId);
    expect(single?.phone).toBeUndefined();
    expect(single?.whatsapp).toBeUndefined();
    expect(single?.email).toBeUndefined();
  });

  it('UNMASKS phone, whatsapp, and email ONLY when upgraded to PREMIUM or PRO', () => {
    db.users.set(premiumUserId, {
      id: premiumUserId,
      email: 'vip@deepastro.com',
      passwordHash: 'hash',
      role: 'USER',
      isVerified: true,
      createdAt: new Date().toISOString(),
    });

    // Upgrade to PREMIUM
    SubscriptionService.upgradePlan(premiumUserId, 'PREMIUM');

    const list = db.getAstrologers(premiumUserId);
    expect(list.length).toBeGreaterThan(0);

    for (const astro of list) {
      expect(astro.phone).toBeDefined();
      expect(astro.phone?.length).toBeGreaterThan(5);
      expect(astro.whatsapp).toBeDefined();
      expect(astro.email).toContain('@');
      expect(astro.hasDirectContactAccess).toBe(true);
    }

    const single = db.getAstrologerById('astro_1', premiumUserId);
    expect(single?.phone).toBeDefined();
    expect(single?.whatsapp).toBeDefined();
    expect(single?.email).toBeDefined();
  });
});
