/**
 * FutureConsentEngine.ts
 * Manages explicit psychological opt-in consent and reveal levels (LEVEL_0 to LEVEL_6).
 */

import { FutureRevealLevel, UserFutureConsent } from './CosmicFutureTypes.js';

export class FutureConsentEngine {
  private static consents = new Map<string, UserFutureConsent>();
  private static readonly CURRENT_CONSENT_VERSION = '1.0.0-cfie-safe';

  public static recordConsent(
    userId: string,
    granted: boolean,
    level: FutureRevealLevel = 'LEVEL_1'
  ): UserFutureConsent {
    const consent: UserFutureConsent = {
      userId,
      consentGranted: granted,
      authorizedLevel: granted ? level : 'LEVEL_0',
      consentTimestamp: new Date().toISOString(),
      consentVersion: this.CURRENT_CONSENT_VERSION,
    };
    this.consents.set(userId, consent);
    return consent;
  }

  public static getConsent(userId: string): UserFutureConsent {
    const existing = this.consents.get(userId);
    if (existing) return existing;
    return {
      userId,
      consentGranted: false,
      authorizedLevel: 'LEVEL_0',
      consentTimestamp: new Date().toISOString(),
      consentVersion: this.CURRENT_CONSENT_VERSION,
    };
  }

  public static isLevelAuthorized(userId: string, requestedLevel: FutureRevealLevel): boolean {
    const consent = this.getConsent(userId);
    if (!consent.consentGranted && requestedLevel !== 'LEVEL_0') {
      return false;
    }

    const order: Record<FutureRevealLevel, number> = {
      LEVEL_0: 0,
      LEVEL_1: 1,
      LEVEL_2: 2,
      LEVEL_3: 3,
      LEVEL_4: 4,
      LEVEL_5: 5,
      LEVEL_6: 6,
    };

    return order[requestedLevel] <= order[consent.authorizedLevel];
  }
}
