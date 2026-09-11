/**
 * DeepAstro Phase 5 — Prediction Ledger & Specificity Engine
 * 
 * Strict Invariants:
 * 1. Every prediction is an immutable ledger entry.
 * 2. Never rewrites historical predictions.
 * 3. Specificity engine evaluates domain, timing window, direction, strength, and evidence.
 * 4. Supports 7 user outcome categories:
 *    - HAPPENED
 *    - PARTIALLY_HAPPENED
 *    - DID_NOT_HAPPEN
 *    - TIMING_WRONG
 *    - TOO_VAGUE
 *    - NOT_ENOUGH_INFORMATION
 *    - UNKNOWN
 * 5. AI is strictly forbidden from automatically fabricating or finalizing outcomes.
 */

export type PredictionOutcome =
  | 'HAPPENED'
  | 'PARTIALLY_HAPPENED'
  | 'DID_NOT_HAPPEN'
  | 'TIMING_WRONG'
  | 'TOO_VAGUE'
  | 'NOT_ENOUGH_INFORMATION'
  | 'UNKNOWN';

export type UserReportedOutcome = PredictionOutcome;

export type PredictionConfidenceClass = 'VERIFIED' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';

export type PredictionWindowScale = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'TIMING_INSUFFICIENT';

export interface PredictionWindow {
  startDate: string;
  endDate: string;
  windowScale?: PredictionWindowScale;
  astrologicalBasis: string;
}

export interface SpecificityScore {
  domainPresent: boolean;
  timeWindowPresent: boolean;
  directionPresent: boolean;
  evidenceAnchorPresent: boolean;
  strengthPresent: boolean;
  isVague: boolean;
  overallScore: number; // 0.0 to 1.0
  assessment: string;
}

export interface PredictionLedgerEntry {
  predictionId: string;
  userId: string;
  question: string;
  timestamp: string;
  chartSnapshot: any;
  dashaSnapshot: any;
  transitSnapshot: any;
  systemsUsed: string[];
  rulesUsed: string[];
  evidenceIds: string[];
  predictionWindow: PredictionWindow;
  predictionStatement: string;
  specificity: SpecificityScore;
  uncertainty: string;
  confidenceClass: PredictionConfidenceClass;
  outcome: PredictionOutcome | null;
  outcomeRecordedAt?: string;
  userFeedbackNotes?: string;
  createdAt: string;

  // Section 5 Snake_case aliases for spec fidelity
  prediction_id?: string;
  user_id?: string;
  chart_snapshot?: any;
  dasha_snapshot?: any;
  transit_snapshot?: any;
  systems_used?: string[];
  rules_used?: string[];
  evidence_ids?: string[];
  prediction_window?: PredictionWindow;
  prediction_statement?: string;
  confidence_class?: PredictionConfidenceClass;
  created_at?: string;

  // Phase 3 compatibility aliases
  chartSnapshotHash?: string;
  userOutcome?: {
    outcome: UserReportedOutcome;
    reportedAt: string;
    nativeNotes?: string;
  };
}

export type ImmutablePredictionRecord = PredictionLedgerEntry;

export class PredictionLedger {
  private static userRecords: Map<string, Map<string, PredictionLedgerEntry>> = new Map();

  /**
   * Evaluates text for prediction specificity vs horoscopic vagueness
   */
  public static evaluateSpecificity(statement: string, window?: PredictionWindow): SpecificityScore {
    const lower = statement.toLowerCase();
    const vaguePatterns = [
      'you may experience changes',
      'things will happen',
      'good things coming',
      'be careful today',
      'energy is shifting',
      'an unexpected event',
      'someone will enter your life',
    ];

    let isVague = false;
    for (const pattern of vaguePatterns) {
      if (lower.includes(pattern)) {
        isVague = true;
        break;
      }
    }

    const domainPresent =
      lower.includes('career') ||
      lower.includes('job') ||
      lower.includes('work') ||
      lower.includes('business') ||
      lower.includes('professional') ||
      lower.includes('responsibility') ||
      lower.includes('vocation') ||
      lower.includes('relationship') ||
      lower.includes('marriage') ||
      lower.includes('relocation') ||
      lower.includes('move') ||
      lower.includes('finance') ||
      lower.includes('exam') ||
      lower.includes('health');

    const timeWindowPresent =
      lower.includes('between') ||
      lower.includes('from') ||
      lower.includes('during') ||
      lower.includes('month') ||
      lower.includes('quarter') ||
      lower.includes('q1') ||
      lower.includes('q2') ||
      lower.includes('q3') ||
      lower.includes('q4') ||
      lower.includes('january') ||
      lower.includes('february') ||
      lower.includes('march') ||
      lower.includes('april') ||
      lower.includes('may') ||
      lower.includes('june') ||
      lower.includes('july') ||
      lower.includes('august') ||
      lower.includes('september') ||
      lower.includes('october') ||
      lower.includes('november') ||
      lower.includes('december') ||
      Boolean(window?.startDate && window?.endDate);

    const directionPresent =
      lower.includes('expand') ||
      lower.includes('increase') ||
      lower.includes('transition') ||
      lower.includes('delay') ||
      lower.includes('resolve') ||
      lower.includes('consolidate') ||
      lower.includes('accelerate');

    const evidenceAnchorPresent =
      lower.includes('house') ||
      lower.includes('dasha') ||
      lower.includes('transit') ||
      lower.includes('lord') ||
      lower.includes('varga') ||
      lower.includes('jupiter') ||
      lower.includes('saturn') ||
      lower.includes('mercury') ||
      lower.includes('chart-supported');

    const strengthPresent =
      lower.includes('strong') ||
      lower.includes('moderate') ||
      lower.includes('supported') ||
      lower.includes('subtle') ||
      lower.includes('intensive');

    let score = 0.2;
    if (domainPresent) score += 0.2;
    if (timeWindowPresent) score += 0.2;
    if (directionPresent) score += 0.15;
    if (evidenceAnchorPresent) score += 0.15;
    if (strengthPresent) score += 0.1;

    if (isVague) {
      score = Math.min(score, 0.45);
    }

    score = Number(Math.min(1.0, score).toFixed(2));

    const assessment = isVague
      ? 'Vague prediction detected: lacks specific planetary or domain groundings.'
      : score >= 0.8
      ? 'High specificity: clearly anchored in domain, timing window, direction, and evidence.'
      : 'Moderate specificity: understandable domain, but could benefit from sharper timing window.';

    return {
      domainPresent,
      timeWindowPresent,
      directionPresent,
      evidenceAnchorPresent,
      strengthPresent,
      isVague,
      overallScore: score,
      assessment,
    };
  }

  /**
   * Creates and registers an immutable prediction record
   */
  public static createPrediction(input: {
    userId: string;
    question: string;
    chartSnapshot: any;
    dashaSnapshot: any;
    transitSnapshot: any;
    systemsUsed: string[];
    rulesUsed: string[];
    evidenceIds: string[];
    predictionWindow: PredictionWindow;
    predictionStatement: string;
    uncertainty?: string | string[];
    confidenceClass: PredictionConfidenceClass;
  }): PredictionLedgerEntry {
    const now = new Date().toISOString();
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const specificity = this.evaluateSpecificity(input.predictionStatement, input.predictionWindow);
    const uncertaintyStr = Array.isArray(input.uncertainty)
      ? input.uncertainty.join('; ')
      : input.uncertainty || 'Standard astrological uncertainty applies.';

    const entry: PredictionLedgerEntry = {
      predictionId,
      userId: input.userId,
      question: input.question,
      timestamp: now,
      chartSnapshot: input.chartSnapshot,
      dashaSnapshot: input.dashaSnapshot,
      transitSnapshot: input.transitSnapshot,
      systemsUsed: input.systemsUsed,
      rulesUsed: input.rulesUsed,
      evidenceIds: input.evidenceIds,
      predictionWindow: input.predictionWindow,
      predictionStatement: input.predictionStatement,
      specificity,
      uncertainty: uncertaintyStr,
      confidenceClass: input.confidenceClass,
      outcome: null,
      createdAt: now,
      // Snake_case aliases
      prediction_id: predictionId,
      user_id: input.userId,
      chart_snapshot: input.chartSnapshot,
      dasha_snapshot: input.dashaSnapshot,
      transit_snapshot: input.transitSnapshot,
      systems_used: input.systemsUsed,
      rules_used: input.rulesUsed,
      evidence_ids: input.evidenceIds,
      prediction_window: input.predictionWindow,
      prediction_statement: input.predictionStatement,
      confidence_class: input.confidenceClass,
      created_at: now,
    };

    if (!this.userRecords.has(input.userId)) {
      this.userRecords.set(input.userId, new Map());
    }
    this.userRecords.get(input.userId)!.set(predictionId, Object.freeze(entry));

    return entry;
  }

  /**
   * Alias for backward compatibility
   */
  public static recordPrediction(data: any): PredictionLedgerEntry {
    return this.createPrediction({
      userId: data.userId,
      question: data.question,
      chartSnapshot: data.chartSnapshotHash ? { hash: data.chartSnapshotHash } : {},
      dashaSnapshot: data.dashaSnapshot,
      transitSnapshot: data.transitSnapshot,
      systemsUsed: data.systemsUsed,
      rulesUsed: data.rulesUsed,
      evidenceIds: data.evidenceIds,
      predictionWindow: data.predictionWindow,
      predictionStatement: data.predictionStatement,
      uncertainty: data.uncertainty,
      confidenceClass: data.confidenceClass,
    });
  }

  /**
   * Prohibited: Attempting to rewrite an immutable prediction must throw
   */
  public static attemptRewritePrediction(predictionId: string, _newStatement: string): never {
    throw new Error(
      `IMMUTABLE_PREDICTION_VIOLATION: Prediction record ${predictionId} is permanently frozen. Rewriting prediction statements is prohibited.`
    );
  }

  /**
   * Retrieves prediction record by ID
   */
  public static getPrediction(arg1: string, arg2?: string): PredictionLedgerEntry | null {
    if (arg2) {
      // getPrediction(userId, predictionId)
      return this.userRecords.get(arg1)?.get(arg2) || null;
    } else {
      // getPrediction(predictionId)
      for (const map of this.userRecords.values()) {
        if (map.has(arg1)) {
          return map.get(arg1)!;
        }
      }
      return null;
    }
  }

  /**
   * Retrieves all predictions for a user
   */
  public static getUserPredictions(userId: string): PredictionLedgerEntry[] {
    const userMap = this.userRecords.get(userId);
    return Array.from(userMap?.values() || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * Retrieves all predictions across system
   */
  public static getAllPredictions(): PredictionLedgerEntry[] {
    const all: PredictionLedgerEntry[] = [];
    for (const map of this.userRecords.values()) {
      all.push(...map.values());
    }
    return all;
  }

  /**
   * Records user-reported outcome on an immutable prediction record
   */
  public static recordOutcome(
    predictionId: string,
    outcome: PredictionOutcome,
    userNotes?: string
  ): PredictionLedgerEntry | null {
    for (const userMap of this.userRecords.values()) {
      if (userMap.has(predictionId)) {
        const existing = userMap.get(predictionId)!;
        const now = new Date().toISOString();

        const updated: PredictionLedgerEntry = {
          ...existing,
          outcome,
          outcomeRecordedAt: now,
          userFeedbackNotes: userNotes,
          userOutcome: {
            outcome,
            reportedAt: now,
            nativeNotes: userNotes,
          },
        };

        userMap.set(predictionId, Object.freeze(updated));
        return updated;
      }
    }
    return null;
  }

  /**
   * Alias for backward compatibility
   */
  public static recordUserOutcome(
    userId: string,
    predictionId: string,
    outcome: UserReportedOutcome,
    nativeNotes?: string
  ): PredictionLedgerEntry {
    const res = this.recordOutcome(predictionId, outcome, nativeNotes);
    if (!res) {
      throw new Error('Prediction record not found or unauthorized.');
    }
    return res;
  }

  /**
   * Cascade purge user predictions (Right to Erasure)
   */
  public static purgeUserData(userId: string): { deletedPredictions: number } {
    const map = this.userRecords.get(userId);
    const count = map ? map.size : 0;
    this.userRecords.delete(userId);
    return { deletedPredictions: count };
  }

  public static purgeUserPredictions(userId: string): void {
    this.purgeUserData(userId);
  }
}
