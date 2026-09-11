/**
 * User Vault Service (UserVaultService)
 * Phase 7 Master Personal Astrology Vault.
 * Centralized, encrypted aggregate view of all user astrological assets.
 * Enforces strict ownership boundaries and zero cross-user leakage.
 */

import { RealUserOnboardingService, ActivatedUserProfile } from './RealUserOnboardingService.js';
import { PredictionLedgerV2, PredictionLedgerV2Entry } from '../learning/PredictionLedgerV2.js';
import { PredictionOutcomeService, StoredOutcomeRecord } from '../learning/PredictionOutcomeService.js';
import { LifeContextGraphV2, LifeContextNodeV2 } from '../intelligence/LifeContextGraphV2.js';
import { RealUserPersonalizationEngine, PersonalizationPreferences } from '../learning/RealUserPersonalizationEngine.js';

export interface UserVaultData {
  userId: string;
  vaultGeneratedAt: string;
  profileVersions: ActivatedUserProfile[];
  activeProfile: ActivatedUserProfile | null;
  predictions: PredictionLedgerV2Entry[];
  outcomes: StoredOutcomeRecord[];
  lifeEvents: LifeContextNodeV2[];
  preferences: PersonalizationPreferences;
  totalAssetsCount: number;
}

export class UserVaultService {
  public static getVault(userId: string, requestingUserId: string): UserVaultData {
    if (userId !== requestingUserId) {
      throw new Error(`ACCESS_DENIED: User ${requestingUserId} is not authorized to access vault of user ${userId}`);
    }

    const profileVersions = RealUserOnboardingService.getAllProfileVersions(userId);
    const activeProfile = RealUserOnboardingService.getLatestProfile(userId);
    const predictions = PredictionLedgerV2.getUserPredictions(userId);
    const outcomes = PredictionOutcomeService.getUserOutcomes(userId);
    const lifeEvents = LifeContextGraphV2.getAllUserNodes(userId);
    const preferences = RealUserPersonalizationEngine.getPreferences(userId);

    const totalAssetsCount =
      profileVersions.length + predictions.length + outcomes.length + lifeEvents.length;

    return {
      userId,
      vaultGeneratedAt: new Date().toISOString(),
      profileVersions,
      activeProfile,
      predictions,
      outcomes,
      lifeEvents,
      preferences,
      totalAssetsCount,
    };
  }
}
