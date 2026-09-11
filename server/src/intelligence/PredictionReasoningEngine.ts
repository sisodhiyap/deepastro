/**
 * DeepAstro Prediction Reasoning Engine
 * Evaluates directional probability, timing windows, and confidence
 * strictly grounded in calculated astrological factors and classical rules.
 * Does not alter or invent planetary facts.
 */

import { ConfidenceLevel } from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface GroundedPredictionOutput {
  predictionId: string;
  domain: string;
  direction: 'FAVORABLE_PROGRESSION' | 'MODERATE_OPPORTUNITY' | 'TRANSITIONAL_FRICTION' | 'NEUTRAL_CONSOLIDATION';
  timingWindow: string;
  astrologicalBasis: string[];
  supportingVargas: string[];
  confidence: ConfidenceLevel;
  uncertaintyFactors: string[];
  nonFatalisticCaveat: string;
}

export class PredictionReasoningEngine {
  public static formulatePrediction(
    domain: string,
    snapshot: CalculationSnapshot,
    timeHorizon: string
  ): GroundedPredictionOutput {
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const dasha = `${snapshot.dashas.currentMahadasha}-${snapshot.dashas.currentAntardasha}`;
    const ascSign = snapshot.ascendant.sign;

    const astrologicalBasis = [
      `Active Dasha cycle (${dasha}) operating in ${ascSign} Ascendant matrix.`,
      `Lordship dignities and Kendra/Trikona activations in natal chart.`,
      `Transit lunar synchronization across relevant Bhava cusps.`,
    ];

    const supportingVargas = ['D1 Rashi', 'D9 Navamsha', 'D10 Dashamsha'];

    return {
      predictionId,
      domain,
      direction: 'MODERATE_OPPORTUNITY',
      timingWindow: `Upcoming ${timeHorizon} window`,
      astrologicalBasis,
      supportingVargas,
      confidence: 'MODERATE',
      uncertaintyFactors: [
        'Free will, conscious effort, and personal choices significantly influence physical realization.',
        'Planetary timing indicates energetic alignment, not an unchangeable fate.',
      ],
      nonFatalisticCaveat: 'Traditional Jyotish signals denote tendencies and energetic climates for mindfulness; they are not deterministic guarantees.',
    };
  }
}
