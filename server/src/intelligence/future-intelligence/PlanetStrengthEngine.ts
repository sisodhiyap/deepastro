/**
 * PlanetStrengthEngine.ts
 * Evaluates dignity, combustion, retrogradation, and functional house lordship.
 * Returns deterministic weighting multipliers for each planet in the calculation context.
 */

import { CanonicalPredictionContext, PredictionEvidence } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';
import { predictionScoringEngine } from './PredictionWeights.js';

export interface PlanetStrengthEvaluation {
  planet: PlanetName;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  house: number;
  multiplier: number;
  summary: string;
  evidence: PredictionEvidence;
}

export class PlanetStrengthEngine {
  public static evaluatePlanet(
    context: CanonicalPredictionContext,
    planet: PlanetName
  ): PlanetStrengthEvaluation {
    const raw = context.planetaryStrength[planet] || {
      dignity: 'Neutral',
      isRetrograde: false,
      isCombust: false,
      house: 1,
    };

    const natalPos = context.planetaryPositions?.find(p => p.name === planet);
    const house = natalPos?.house || (raw as any).house || 1;

    const multiplier = predictionScoringEngine.getDignityMultiplier(
      raw.dignity,
      raw.isCombust,
      raw.isRetrograde
    );

    let summary = `${planet} operates with ${raw.dignity} dignity (Score Multiplier: ${multiplier.toFixed(2)}x)`;
    if (raw.isCombust) summary += ', reduced outward focus due to solar combustion';
    if (raw.isRetrograde) summary += ', with intensified reflective retrogradation';

    const evidence: PredictionEvidence = {
      source: 'STRENGTH',
      rule: 'Classical Dignity & Combustion Rule',
      value: summary,
      weight: 0.15,
      direction: multiplier >= 1.0 ? 'SUPPORTIVE' : 'CHALLENGING',
    };

    return {
      planet,
      dignity: raw.dignity,
      isRetrograde: raw.isRetrograde,
      isCombust: raw.isCombust,
      house,
      multiplier,
      summary,
      evidence,
    };
  }

  public static evaluateAll(context: CanonicalPredictionContext): Record<string, PlanetStrengthEvaluation> {
    const planets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const map: Record<string, PlanetStrengthEvaluation> = {};
    for (const p of planets) {
      map[p] = this.evaluatePlanet(context, p);
    }
    return map;
  }
}
