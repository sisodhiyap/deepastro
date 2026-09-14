/**
 * DeepAstro Prediction Uncertainty Engine
 * Calculates composite uncertainty across data gaps, birth time precision, and contradictory astrological yogas.
 */

export class PredictionUncertaintyEngine {
  public static computeUncertainty(params: {
    birthTimePrecisionMinutes?: number;
    contradictionSeverity: number;
    dataCompletenessRatio: number;
    systemsDisagreementRatio: number;
  }): {
    compositeUncertainty: number;
    bounds: { lower: number; upper: number };
    primarySource: string;
  } {
    const {
      birthTimePrecisionMinutes = 0,
      contradictionSeverity,
      dataCompletenessRatio,
      systemsDisagreementRatio,
    } = params;

    let uncertainty = 0.2;

    if (birthTimePrecisionMinutes > 15) uncertainty += 0.25;
    else if (birthTimePrecisionMinutes > 5) uncertainty += 0.1;

    uncertainty += contradictionSeverity * 0.3;
    uncertainty += (1.0 - dataCompletenessRatio) * 0.25;
    uncertainty += systemsDisagreementRatio * 0.2;

    const compositeUncertainty = Number(Math.min(0.95, Math.max(0.05, uncertainty)).toFixed(3));
    const lower = Number(Math.max(0.0, compositeUncertainty - 0.1).toFixed(3));
    const upper = Number(Math.min(1.0, compositeUncertainty + 0.1).toFixed(3));

    let primarySource = 'Astronomical Baseline';
    if (contradictionSeverity > 0.3) primarySource = 'Contradictory Astrological Yogas';
    else if (birthTimePrecisionMinutes > 10) primarySource = 'Birth Time Imprecision';
    else if (systemsDisagreementRatio > 0.4) primarySource = 'Multi-System Divergence';

    return {
      compositeUncertainty,
      bounds: { lower, upper },
      primarySource,
    };
  }
}
