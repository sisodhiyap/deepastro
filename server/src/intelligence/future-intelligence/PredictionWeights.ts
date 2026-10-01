/**
 * PredictionWeights.ts
 * Transparent, deterministic weighting configuration for the Future Intelligence Scoring Engine.
 * Implements:
 *   signalScore = baseRuleWeight * planetaryStrengthMultiplier * dashaWeight * transitWeight * natalRelevance * vargaRelevance * convergenceFactor
 * Normalized deterministically to: VERY_LOW, LOW, MODERATE, STRONG, VERY_STRONG.
 */

import { SignalStrengthLevel, ConfidenceLevel } from './types.js';

export interface PredictionWeightConfig {
  dashaWeights: {
    mahadasha: number;
    antardasha: number;
    pratyantardasha: number;
  };
  transitWeights: {
    saturn: number;
    jupiter: number;
    rahuKetu: number;
    mars: number;
    sun: number;
    mercuryVenus: number;
    moon: number;
  };
  planetaryDignityMultipliers: {
    Exalted: number;
    Moolatrikona: number;
    'Own Sign': number;
    Friend: number;
    Neutral: number;
    Enemy: number;
    Debilitated: number;
    combustionDiscount: number; // Applied if combust by Sun
    retrogradeModifier: number;  // Multiplier for retrograde (amplifies inward/retrospective intensity)
  };
  vargaRelevanceWeights: {
    d1Primary: number;
    d9Navamsha: number;
    d10Dashamsha: number;
    otherVargas: number;
  };
  numerologyRelevanceWeight: number;
  convergenceThresholds: {
    veryStrong: number;
    strong: number;
    moderate: number;
    low: number;
  };
  confidenceThresholds: {
    high: number;
    moderate: number;
  };
}

export const DEFAULT_PREDICTION_WEIGHTS: PredictionWeightConfig = {
  // 1. Dasha Weights: Mahadasha sets master environment (50%), Antardasha sets actionable cycle (35%), Pratyantardasha timing focus (15%)
  dashaWeights: {
    mahadasha: 0.50,
    antardasha: 0.35,
    pratyantardasha: 0.15,
  },

  // 2. Transit Weights: Slow-moving outer planets hold maximum karmic gravity
  transitWeights: {
    saturn: 0.32,      // Major karmic anchor (~2.5 years per rashi)
    jupiter: 0.30,     // Expansive benefic catalyst (~1 year per rashi)
    rahuKetu: 0.18,    // Nodal nodal-axis transformation (~1.5 years per rashi)
    mars: 0.08,        // Action & initiative catalyst (~45 days)
    sun: 0.05,         // Vital solar transit (monthly ingress)
    mercuryVenus: 0.04,// Communication, resources & alliances
    moon: 0.03,        // Micro-timing & emotional resonance
  },

  // 3. Planetary Dignity Multipliers
  planetaryDignityMultipliers: {
    Exalted: 1.40,
    Moolatrikona: 1.25,
    'Own Sign': 1.15,
    Friend: 1.00,
    Neutral: 0.85,
    Enemy: 0.70,
    Debilitated: 0.55,
    combustionDiscount: 0.75, // Decreases outward efficacy by 25%
    retrogradeModifier: 1.10, // Heightens internal reflective pressure
  },

  // 4. Varga Relevance: D1 is primary life reality, D9 deep dharma/inner alignment, D10 career confirmation
  vargaRelevanceWeights: {
    d1Primary: 0.50,
    d9Navamsha: 0.25,
    d10Dashamsha: 0.20,
    otherVargas: 0.05,
  },

  // 5. Numerology is strictly a secondary corroborative signal
  numerologyRelevanceWeight: 0.10,

  // 6. Normalized Signal Strength Score Thresholds (0 to 100)
  convergenceThresholds: {
    veryStrong: 85,
    strong: 70,
    moderate: 50,
    low: 30,
  },

  // 7. Confidence Rating Thresholds
  confidenceThresholds: {
    high: 75,
    moderate: 50,
  },
};

export class PredictionScoringEngine {
  private config: PredictionWeightConfig;

  constructor(config: PredictionWeightConfig = DEFAULT_PREDICTION_WEIGHTS) {
    this.config = config;
  }

  /**
   * Computes dignity multiplier given planetary state
   */
  public getDignityMultiplier(dignity: string, isCombust: boolean = false, isRetrograde: boolean = false): number {
    let mult = (this.config.planetaryDignityMultipliers as any)[dignity] || 1.0;
    if (isCombust) mult *= this.config.planetaryDignityMultipliers.combustionDiscount;
    if (isRetrograde) mult *= this.config.planetaryDignityMultipliers.retrogradeModifier;
    return mult;
  }

  /**
   * Normalizes raw numeric score (0 - 100) into structured SignalStrengthLevel
   */
  public normalizeStrength(score: number): SignalStrengthLevel {
    if (score >= this.config.convergenceThresholds.veryStrong) return 'VERY_STRONG';
    if (score >= this.config.convergenceThresholds.strong) return 'STRONG';
    if (score >= this.config.convergenceThresholds.moderate) return 'MODERATE';
    if (score >= this.config.convergenceThresholds.low) return 'LOW';
    return 'VERY_LOW';
  }

  /**
   * Evaluates Confidence Level given signal alignment count and absence of severe contradictions
   */
  public evaluateConfidence(supportingCount: number, contradictionCount: number, rawScore: number): {
    confidence: ConfidenceLevel;
    confidenceScore: number;
  } {
    // Confidence is an agreement metric: High independent evidence count + minimal contradictions
    const baseScore = Math.min(100, Math.max(20, rawScore));
    const agreementBoost = supportingCount * 4;
    const contradictionPenalty = contradictionCount * 12;
    const finalScore = Math.min(98, Math.max(25, baseScore + agreementBoost - contradictionPenalty));

    let confidence: ConfidenceLevel = 'LOW';
    if (finalScore >= this.config.confidenceThresholds.high) confidence = 'HIGH';
    else if (finalScore >= this.config.confidenceThresholds.moderate) confidence = 'MODERATE';

    return { confidence, confidenceScore: Math.round(finalScore) };
  }
}

export const predictionScoringEngine = new PredictionScoringEngine();
