/**
 * DeepAstro 4.1 — Outcome Quality Engine (OutcomeQualityEngine)
 * Evaluates outcome evidence and prevents silence, ambiguous feedback,
 * or general user satisfaction from being converted into confirmed prediction success.
 * 
 * Sources:
 * - USER_EXPLICIT_CONFIRMATION (Highest confidence)
 * - AUTHORIZED_SYSTEM_EVENT (High confidence, verified milestone)
 * - PARTIAL_USER_CONFIRMATION (Moderate confidence, partial match)
 * - AMBIGUOUS_FEEDBACK (Cannot count as confirmed success)
 * - NO_FEEDBACK (Must remain UNKNOWN)
 */

export type OutcomeEvidenceSource =
  | 'USER_EXPLICIT_CONFIRMATION'
  | 'AUTHORIZED_SYSTEM_EVENT'
  | 'PARTIAL_USER_CONFIRMATION'
  | 'AMBIGUOUS_FEEDBACK'
  | 'NO_FEEDBACK';

export type QualityVerifiedOutcomeStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'NOT_CONFIRMED'
  | 'UNKNOWN';

export interface OutcomeQualityAssessment {
  assessmentId: string;
  sourceType: OutcomeEvidenceSource;
  assignedOutcome: QualityVerifiedOutcomeStatus;
  qualityScore: number; // 0.0 to 1.0
  ambiguityPreserved: boolean;
  notes: string;
  timestamp: string;
}

export class OutcomeQualityEngine {
  public static evaluateOutcomeQuality(params: {
    rawInput?: string;
    explicitStatus?: 'CONFIRMED' | 'PARTIALLY_CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';
    source: OutcomeEvidenceSource;
    userNotes?: string;
  }): OutcomeQualityAssessment {
    const { source, explicitStatus, userNotes = '' } = params;
    const assessmentId = `oqa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    // 1. If NO_FEEDBACK -> Strictly UNKNOWN
    if (source === 'NO_FEEDBACK' || !explicitStatus) {
      return {
        assessmentId,
        sourceType: 'NO_FEEDBACK',
        assignedOutcome: 'UNKNOWN',
        qualityScore: 0.0,
        ambiguityPreserved: true,
        notes: 'Absence of user confirmation preserves UNKNOWN state. No outcome manufactured from silence.',
        timestamp: now,
      };
    }

    // 2. If AMBIGUOUS_FEEDBACK (e.g. "That sounds interesting", "Sounds cool") -> Cannot be confirmed
    const notesLower = userNotes.toLowerCase();
    const isAmbiguousNote =
      notesLower.includes('interesting') ||
      notesLower.includes('sounds right') ||
      notesLower.includes('maybe') ||
      notesLower.includes('cool') ||
      notesLower.includes('fascinating');

    if (source === 'AMBIGUOUS_FEEDBACK' || (isAmbiguousNote && explicitStatus === 'CONFIRMED' && !notesLower.includes('happened') && !notesLower.includes('promoted') && !notesLower.includes('changed'))) {
      return {
        assessmentId,
        sourceType: 'AMBIGUOUS_FEEDBACK',
        assignedOutcome: 'UNKNOWN',
        qualityScore: 0.25,
        ambiguityPreserved: true,
        notes: 'User sentiment or vague feedback cannot count as an empirically confirmed event. Ambiguity preserved.',
        timestamp: now,
      };
    }

    // 3. User Explicit Confirmation
    if (source === 'USER_EXPLICIT_CONFIRMATION') {
      const score = explicitStatus === 'CONFIRMED' ? 0.95 : explicitStatus === 'PARTIALLY_CONFIRMED' ? 0.7 : 0.9;
      return {
        assessmentId,
        sourceType: source,
        assignedOutcome: explicitStatus,
        qualityScore: score,
        ambiguityPreserved: false,
        notes: `Authenticated voluntary user explicit confirmation: ${explicitStatus}.`,
        timestamp: now,
      };
    }

    // 4. Authorized System Event
    if (source === 'AUTHORIZED_SYSTEM_EVENT') {
      return {
        assessmentId,
        sourceType: source,
        assignedOutcome: explicitStatus,
        qualityScore: 0.9,
        ambiguityPreserved: false,
        notes: `Observed via authorized authenticated system integration.`,
        timestamp: now,
      };
    }

    // 5. Partial Confirmation
    return {
      assessmentId,
      sourceType: 'PARTIAL_USER_CONFIRMATION',
      assignedOutcome: 'PARTIALLY_CONFIRMED',
      qualityScore: 0.65,
      ambiguityPreserved: false,
      notes: 'User reported partial alignment with divergent details.',
      timestamp: now,
    };
  }
}
