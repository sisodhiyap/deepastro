/**
 * Subscription Service
 * Manages user plan upgrades, feature entitlements, and payment provider abstractions (Stripe/Razorpay).
 */

import { db, SubscriptionRecord } from '../database/db.js';
import { SEED_PLANS } from '../database/seed.js';

export class SubscriptionService {
  public static getPlans() {
    return SEED_PLANS;
  }

  public static getUserSubscription(userId: string): SubscriptionRecord {
    return db.getSubscription(userId);
  }

  public static upgradePlan(
    userId: string,
    targetPlanId: 'FREE' | 'PREMIUM' | 'PRO'
  ): { subscription: SubscriptionRecord; activeEntitlements: string[] } {
    const sub: SubscriptionRecord = {
      id: `sub_${Date.now()}_${userId}`,
      userId,
      planId: targetPlanId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    db.subscriptions.set(userId, sub);

    // Grant corresponding entitlements
    if (targetPlanId === 'PREMIUM' || targetPlanId === 'PRO') {
      db.grantEntitlement(userId, 'view_protected_astrologer_contact');
      db.grantEntitlement(userId, 'full_kundli');
      db.grantEntitlement(userId, 'matching');
      db.grantEntitlement(userId, 'palmistry');
      db.grantEntitlement(userId, 'numerology');
      db.grantEntitlement(userId, 'reports');
      db.grantEntitlement(userId, 'astrobot');
    }

    if (targetPlanId === 'PRO') {
      db.grantEntitlement(userId, 'multi_model_ai');
      db.grantEntitlement(userId, 'priority_consultations');
      db.grantEntitlement(userId, 'family_vault');
    }

    const entitlements = Array.from(db.entitlements.get(userId) || []);

    return {
      subscription: sub,
      activeEntitlements: entitlements,
    };
  }
}
