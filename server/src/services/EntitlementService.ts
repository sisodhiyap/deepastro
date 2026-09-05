/**
 * Entitlement Service
 * Resolves feature access for user sessions.
 */

import { db } from '../database/db.js';

export class EntitlementService {
  public static canAccess(userId: string, featureKey: string): boolean {
    return db.hasEntitlement(userId, featureKey);
  }

  public static getUserEntitlements(userId: string): {
    planId: string;
    canViewAstrologerContact: boolean;
    canUseFullKundli: boolean;
    canUseMatching: boolean;
    canUsePalmistry: boolean;
    canUseNumerology: boolean;
    canGenerateReports: boolean;
    canUseUnlimitedAstroBot: boolean;
  } {
    const sub = db.getSubscription(userId);
    return {
      planId: sub.planId,
      canViewAstrologerContact: db.hasEntitlement(userId, 'view_protected_astrologer_contact'),
      canUseFullKundli: db.hasEntitlement(userId, 'full_kundli'),
      canUseMatching: db.hasEntitlement(userId, 'matching'),
      canUsePalmistry: db.hasEntitlement(userId, 'palmistry'),
      canUseNumerology: db.hasEntitlement(userId, 'numerology'),
      canGenerateReports: db.hasEntitlement(userId, 'reports'),
      canUseUnlimitedAstroBot: db.hasEntitlement(userId, 'astrobot'),
    };
  }
}
