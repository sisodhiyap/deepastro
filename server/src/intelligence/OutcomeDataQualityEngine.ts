/**
 * DeepAstro 4.2 — Outcome Data Quality Engine (OutcomeDataQualityEngine)
 * Evaluates the empirical rigor and clarity of incoming outcome reports.
 * 
 * Quality Tiers:
 * - HIGH_QUALITY: Authenticated user reporting specific milestone with exact dates/details.
 * - MEDIUM_QUALITY: Explicit user confirmation without granular date/context details.
 * - LOW_QUALITY: Sparse feedback or vague assertion.
 * - AMBIGUOUS: Conversational sentiment ("sounds cool", "interesting") lacking event verification.
 * - UNKNOWN: Silence, unconfirmed, or non-applicable.
 * 
 * Invariant: Only HIGH_QUALITY and MEDIUM_QUALITY outcomes are eligible for strategy benchmarking.
 */

export type OutcomeQualityTier =
  | 'HIGH_QUALITY'
  | 'MEDIUM_QUALITY'
  | 'LOW_QUALITY'
  | 'AMBIGUOUS'
  | 'UNKNOWN';

export interface OutcomeDataQualityAudit {
  auditId: string;
  predictionId: string;
  qualityTier: OutcomeQualityTier;
  eligibleForStrategyEvaluation: boolean;
  qualityScore: number; // 0.0 to 1.0
  reasons: string[];
  timestamp: string;
}

export class OutcomeDataQualityEngine {
  public static auditOutcomeQuality(params: {
    predictionId: string;
    explicitStatus?: string;
    userNotes?: string;
    hasSpecificDate?: boolean;
    sourceType?: string;
  }): OutcomeDataQualityAudit {
    const { predictionId, explicitStatus, userNotes = '', hasSpecificDate = false, sourceType } = params;
    const auditId = `odq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const reasons: string[] = [];

    // 1. If silence or missing status -> UNKNOWN
    if (!explicitStatus || explicitStatus === 'UNKNOWN' || explicitStatus === 'NOT_SURE') {
      return {
        auditId,
        predictionId,
        qualityTier: 'UNKNOWN',
        eligibleForStrategyEvaluation: false,
        qualityScore: 0.0,
        reasons: ['No verified outcome recorded. Preserved as UNKNOWN.'],
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Check for ambiguous conversational praise
    const notesLower = userNotes.toLowerCase();
    const isAmbiguous =
      notesLower.includes('sounds interesting') ||
      notesLower.includes('cool') ||
      notesLower.includes('maybe right') ||
      notesLower.includes('sounds nice');

    if (isAmbiguous && !notesLower.includes('happened') && !notesLower.includes('promoted')) {
      return {
        auditId,
        predictionId,
        qualityTier: 'AMBIGUOUS',
        eligibleForStrategyEvaluation: false,
        qualityScore: 0.2,
        reasons: ['Conversational sentiment or vague praise does not substantiate an empirical event.'],
        timestamp: new Date().toISOString(),
      };
    }

    // 3. High quality criteria: explicit confirmation + verified date + meaningful note
    if (hasSpecificDate && userNotes.trim().length > 10) {
      reasons.push('Verified specific date provided.');
      reasons.push('Detailed corroborating notes supplied by user.');
      return {
        auditId,
        predictionId,
        qualityTier: 'HIGH_QUALITY',
        eligibleForStrategyEvaluation: true,
        qualityScore: 0.95,
        reasons,
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Medium quality: explicit status confirmed without full temporal breakdown
    if (explicitStatus === 'CONFIRMED' || explicitStatus === 'PARTIALLY_CONFIRMED' || explicitStatus === 'NOT_CONFIRMED') {
      reasons.push('Explicit authenticated user status confirmed.');
      return {
        auditId,
        predictionId,
        qualityTier: 'MEDIUM_QUALITY',
        eligibleForStrategyEvaluation: true,
        qualityScore: 0.75,
        reasons,
        timestamp: new Date().toISOString(),
      };
    }

    // 5. Low quality fallback
    return {
      auditId,
      predictionId,
      qualityTier: 'LOW_QUALITY',
      eligibleForStrategyEvaluation: false,
      qualityScore: 0.4,
      reasons: ['Sparse or incomplete outcome data provided.'],
      timestamp: new Date().toISOString(),
    };
  }
}
