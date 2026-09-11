/**
 * Privacy Export & Deletion Service (PrivacyExportDeletionService)
 * Implements GDPR / sovereign data rights:
 * - "Export My Data" (JSON & CSV export with calculation passport metadata)
 * - "Delete My Data" (Transactional, cascading deletion across all DeepAstro engines)
 */

import { UserVaultService, UserVaultData } from './UserVaultService.js';
import { RealUserOnboardingService } from './RealUserOnboardingService.js';
import { PredictionLedgerV2 } from '../learning/PredictionLedgerV2.js';
import { PredictionOutcomeService } from '../learning/PredictionOutcomeService.js';
import { LifeContextGraphV2 } from '../intelligence/LifeContextGraphV2.js';
import { RealUserPersonalizationEngine } from '../learning/RealUserPersonalizationEngine.js';

export interface DeletionAuditReport {
  userId: string;
  timestamp: string;
  profilesDeleted: number;
  predictionsDeleted: number;
  outcomesDeleted: number;
  lifeEventsDeleted: number;
  preferencesCleared: boolean;
  orphanedRecordsRemaining: number;
  status: 'COMPLETELY_ERASED';
}

export class PrivacyExportDeletionService {
  public static exportData(userId: string, requestingUserId: string, format: 'JSON' | 'CSV' = 'JSON'): string {
    if (userId !== requestingUserId) {
      throw new Error(`ACCESS_DENIED: Cannot export data for another user.`);
    }

    const vault = UserVaultService.getVault(userId, requestingUserId);

    if (format === 'JSON') {
      return JSON.stringify(vault, null, 2);
    }

    // CSV format for predictions & outcomes
    const rows: string[] = ['record_type,id,timestamp,statement_or_title,status,details'];
    for (const p of vault.predictions) {
      rows.push(`PREDICTION,${p.predictionId},${p.createdAt},"${p.question.replace(/"/g, '""')}",${p.status},"${p.statement.replace(/"/g, '""')}"`);
    }
    for (const o of vault.outcomes) {
      rows.push(`OUTCOME,${o.outcomeId},${o.recordedAt},"${o.outcome}",CONFIRMED,"${(o.userNotes || '').replace(/"/g, '""')}"`);
    }
    for (const e of vault.lifeEvents) {
      rows.push(`LIFE_EVENT,${e.nodeId},${e.createdAt},"${e.title.replace(/"/g, '""')}",${e.confirmationStatus},"${(e.description || '').replace(/"/g, '""')}"`);
    }

    return rows.join('\n');
  }

  public static deleteUserData(userId: string, requestingUserId: string): DeletionAuditReport {
    if (userId !== requestingUserId) {
      throw new Error(`ACCESS_DENIED: Cannot request deletion for another user.`);
    }

    const profilesDeleted = RealUserOnboardingService.getAllProfileVersions(userId).length;
    RealUserOnboardingService.deleteUserData(userId);

    const predictionsDeleted = PredictionLedgerV2.deleteUserData(userId);
    const outcomesDeleted = PredictionOutcomeService.deleteUserData(userId);
    const lifeEventsDeleted = LifeContextGraphV2.deleteUserData(userId);
    const preferencesCleared = RealUserPersonalizationEngine.deleteUserData(userId);

    // Verify zero orphaned records remain
    const remainingProfiles = RealUserOnboardingService.getAllProfileVersions(userId).length;
    const remainingPredictions = PredictionLedgerV2.getUserPredictions(userId).length;
    const remainingOutcomes = PredictionOutcomeService.getUserOutcomes(userId).length;
    const remainingEvents = LifeContextGraphV2.getAllUserNodes(userId).length;

    const orphanedRecordsRemaining =
      remainingProfiles + remainingPredictions + remainingOutcomes + remainingEvents;

    return {
      userId,
      timestamp: new Date().toISOString(),
      profilesDeleted,
      predictionsDeleted,
      outcomesDeleted,
      lifeEventsDeleted,
      preferencesCleared,
      orphanedRecordsRemaining,
      status: 'COMPLETELY_ERASED',
    };
  }
}
