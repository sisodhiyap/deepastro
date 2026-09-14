/**
 * DeepAstro Prediction Confidence Engine V2
 * Calculates dynamic, calibrated confidence while detecting and penalizing overconfident language.
 */

export class PredictionConfidenceEngineV2 {
  public static calculateCalibratedConfidence(params: {
    baseConfidence: number;
    evidenceScore: number;
    contradictionPenalty: number;
    isOverconfidentText: boolean;
    isBarnumText: boolean;
    systemsConverging: number;
    totalSystems: number;
  }): {
    calibratedConfidence: number;
    epistemicUncertainty: number;
    penaltiesApplied: string[];
  } {
    let conf = params.baseConfidence;
    const penalties: string[] = [];

    if (params.evidenceScore < 0.5) {
      conf *= 0.7;
      penalties.push('LOW_EVIDENCE_PENALTY');
    }

    if (params.contradictionPenalty > 0) {
      conf *= (1.0 - params.contradictionPenalty);
      penalties.push('CONTRADICTION_PENALTY_' + (params.contradictionPenalty * 100).toFixed(0) + '%');
    }

    if (params.isOverconfidentText) {
      conf *= 0.8;
      penalties.push('OVERCONFIDENCE_LANGUAGE_DAMPENING');
    }

    if (params.isBarnumText) {
      conf *= 0.5;
      penalties.push('BARNUM_VAGUENESS_PENALTY');
    }

    if (params.totalSystems > 0) {
      const ratio = params.systemsConverging / params.totalSystems;
      if (ratio < 0.4) {
        conf *= 0.75;
        penalties.push('LOW_SYSTEM_CONVERGENCE_PENALTY');
      }
    }

    const calibratedConfidence = Number(Math.max(0.05, Math.min(0.92, conf)).toFixed(3));
    const epistemicUncertainty = Number((1.0 - calibratedConfidence).toFixed(3));

    return {
      calibratedConfidence,
      epistemicUncertainty,
      penaltiesApplied: penalties,
    };
  }
}
