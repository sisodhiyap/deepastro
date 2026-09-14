/**
 * DeepAstro Observatory V2.0 - Selection Bias Guard
 * Prevents administrators or AI from selectively removing failed predictions.
 * Failed predictions remain in ledger permanently.
 * INVARIANT: Accuracy datasets must preserve audit integrity.
 */
export interface SelectionBiasGuardResult {
  allowed: boolean;
  reason: string;
  requiresPrivacyRequest: boolean;
}

export class SelectionBiasGuard {
  private static readonly ACCURACY_PROTECTED_STATUSES = [
    'USER_NOT_CONFIRMED', 'CONTRADICTED', 'TIMING_WRONG', 'DID_NOT_HAPPEN',
  ];

  /**
   * Validates whether a prediction removal request is legitimate.
   * Only privacy deletion requests can remove user data.
   * Accuracy-motivated deletions are ALWAYS blocked.
   */
  public static validateRemovalRequest(params: {
    predictionId: string;
    requestedBy: string;
    reason: string;
    predictionOutcomeStatus: string;
    isPrivacyRequest: boolean;
    hasUserConsentForDeletion: boolean;
  }): SelectionBiasGuardResult {
    const {
      reason, predictionOutcomeStatus, isPrivacyRequest, hasUserConsentForDeletion
    } = params;

    const accuracyMotivatedReasons = [
      'low accuracy', 'inaccurate', 'embarrassing', 'wrong', 'failed',
      'incorrect', 'bad prediction', 'poor performance', 'negative result',
    ];

    const isAccuracyMotivated = accuracyMotivatedReasons.some(r =>
      reason.toLowerCase().includes(r)
    );
    const isFailedPrediction = this.ACCURACY_PROTECTED_STATUSES.includes(predictionOutcomeStatus);

    if (isAccuracyMotivated) {
      return {
        allowed: false,
        reason: 'BLOCKED: Accuracy-motivated deletion is prohibited. Failed predictions must remain in the ledger to preserve audit integrity.',
        requiresPrivacyRequest: false,
      };
    }

    if (isFailedPrediction && !isPrivacyRequest) {
      return {
        allowed: false,
        reason: `BLOCKED: Prediction with status '${predictionOutcomeStatus}' cannot be removed outside of a legitimate privacy deletion request.`,
        requiresPrivacyRequest: true,
      };
    }

    if (isPrivacyRequest && !hasUserConsentForDeletion) {
      return {
        allowed: false,
        reason: 'BLOCKED: Privacy deletion requires explicit user consent.',
        requiresPrivacyRequest: true,
      };
    }

    if (isPrivacyRequest && hasUserConsentForDeletion) {
      return {
        allowed: true,
        reason: 'Legitimate privacy deletion request with user consent. NOTE: deletion will be logged in audit trail.',
        requiresPrivacyRequest: false,
      };
    }

    return {
      allowed: false,
      reason: 'BLOCKED: Request does not meet any legitimate deletion criteria.',
      requiresPrivacyRequest: false,
    };
  }
}
