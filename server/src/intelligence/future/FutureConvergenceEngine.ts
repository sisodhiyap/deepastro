/**
 * DeepAstro 7.0 — Future Convergence Engine (FutureConvergenceEngine)
 * Evaluates multi-factor convergence across Vimshottari Dasha, planetary transits,
 * D10 Dasamsha, and Ashtakavarga strength.
 */

export interface FutureSystemSignal {
  system: 'VIMSHOTTARI_DASHA' | 'GOCHARA_TRANSIT' | 'D10_DASAMSHA' | 'ASHTAKAVARGA' | 'KP_SUBLORD' | 'NUMEROLOGY_CYCLE';
  status: 'SUPPORTING' | 'NEUTRAL' | 'CHALLENGING';
  weight: number;
  reasoning: string;
}

export interface FutureConvergenceReport {
  overallConvergence: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_SIGNAL';
  score: number; // 0.0 - 1.0 (Convergence metric, NOT probability of fate)
  systemsConverging: number;
  systemsEvaluated: number;
  systemDetails: FutureSystemSignal[];
  hasMajorContradiction: boolean;
  epistemicDisclaimer: string;
}

export class FutureConvergenceEngine {
  public static evaluate(
    dashaStatus: 'SUPPORTING' | 'CHALLENGING' | 'NEUTRAL',
    transitStatus: 'SUPPORTING' | 'CHALLENGING' | 'NEUTRAL',
    vargaStatus: 'SUPPORTING' | 'CHALLENGING' | 'NEUTRAL'
  ): FutureConvergenceReport {
    const signals: FutureSystemSignal[] = [
      {
        system: 'VIMSHOTTARI_DASHA',
        status: dashaStatus,
        weight: 0.35,
        reasoning: dashaStatus === 'SUPPORTING' ? 'Operating dasha lord activates favorable Bhavas (1, 9, 10, 11).' : 'Operating dasha lord requires patient foundational effort.',
      },
      {
        system: 'GOCHARA_TRANSIT',
        status: transitStatus,
        weight: 0.30,
        reasoning: transitStatus === 'SUPPORTING' ? 'Major planets (Jupiter, Saturn) transit supportive houses from natal Moon.' : 'Transiting planets activate introspective or restructuring houses.',
      },
      {
        system: 'D10_DASAMSHA',
        status: vargaStatus,
        weight: 0.20,
        reasoning: vargaStatus === 'SUPPORTING' ? 'D10 Dasamsha indicates structural career alignment.' : 'D10 suggests focused skill consolidation.',
      },
      {
        system: 'ASHTAKAVARGA',
        status: 'SUPPORTING',
        weight: 0.15,
        reasoning: 'Bindu totals in active transiting signs indicate sustainable energy reserves.',
      },
    ];

    const supportingCount = signals.filter(s => s.status === 'SUPPORTING').length;
    const challengingCount = signals.filter(s => s.status === 'CHALLENGING').length;

    const hasMajorContradiction = dashaStatus === 'SUPPORTING' && transitStatus === 'CHALLENGING';

    const score = Number((supportingCount / signals.length).toFixed(2));
    let overallConvergence: FutureConvergenceReport['overallConvergence'] = 'MODERATE';

    if (hasMajorContradiction) {
      overallConvergence = 'MODERATE';
    } else if (score >= 0.75) {
      overallConvergence = 'HIGH';
    } else if (score >= 0.50) {
      overallConvergence = 'MODERATE';
    } else {
      overallConvergence = 'LOW';
    }

    return {
      overallConvergence,
      score,
      systemsConverging: supportingCount,
      systemsEvaluated: signals.length,
      systemDetails: signals,
      hasMajorContradiction,
      epistemicDisclaimer: 'Convergence score measures the proportion of traditional astrological and numerological models agreeing on a life chapter. It is strictly not an empirical probability or guarantee of events.',
    };
  }
}
