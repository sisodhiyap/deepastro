/**
 * YogaActivationEngine.ts
 * Evaluates activation and modulation of natal Yogas during future Dasha & Transit periods.
 * Checks whether natal yogas are: Natal, Activated, Strengthened, Weakened, Transit-triggered, or Dasha-triggered.
 */

import { CanonicalPredictionContext, PredictionEvidence, TransitRecord } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export interface ActivatedYogaResult {
  yogaName: string;
  status: 'NATAL_DORMANT' | 'DASHA_ACTIVATED' | 'TRANSIT_TRIGGERED' | 'STRENGTHENED' | 'WEAKENED';
  keyPlanets: string[];
  houses: number[];
  description: string;
  activationPeriod: string;
  evidence: PredictionEvidence;
}

export class YogaActivationEngine {
  /**
   * Cross-references natal yogas against active Dasha and Transits for a target period.
   */
  public static evaluateYogas(
    context: CanonicalPredictionContext,
    activeLords: { mahadasha: PlanetName; antardasha: PlanetName },
    transits: TransitRecord[],
    periodLabel: string
  ): ActivatedYogaResult[] {
    const results: ActivatedYogaResult[] = [];
    const natalYogas = context.yogas || [];

    for (const yoga of natalYogas) {
      const yogaPlanets = (yoga as any).planets || (yoga as any).planetsInvolved || [];
      const houses = (yoga as any).houses || [1];

      // Check if Dasha lord is part of the yoga
      const isDashaTriggered =
        yogaPlanets.includes(activeLords.mahadasha) ||
        yogaPlanets.includes(activeLords.antardasha);

      // Check if Jupiter or Saturn transit energizes key yoga planets
      const isTransitTriggered = transits.some(
        (t) =>
          ['Jupiter', 'Saturn'].includes(t.transitPlanet) &&
          t.natalTarget &&
          yogaPlanets.some((yp: string) => t.natalTarget?.includes(yp))
      );

      let status: ActivatedYogaResult['status'] = 'NATAL_DORMANT';
      if (isDashaTriggered && isTransitTriggered) {
        status = 'STRENGTHENED';
      } else if (isDashaTriggered) {
        status = 'DASHA_ACTIVATED';
      } else if (isTransitTriggered) {
        status = 'TRANSIT_TRIGGERED';
      }

      // Check debilitation/combustion in context
      const hasDebilitation = yogaPlanets.some((yp: string) => {
        const str = context.planetaryStrength[yp];
        return str && (str.dignity === 'Debilitated' || str.isCombust);
      });
      if (hasDebilitation && status !== 'STRENGTHENED') {
        status = 'WEAKENED';
      }

      if (status !== 'NATAL_DORMANT') {
        const desc = (yoga as any).effects || (yoga as any).description || `Benefic planetary configuration ${yoga.name}.`;
        const evidence: PredictionEvidence = {
          source: 'YOGA',
          rule: `Vedic Yoga Activation: ${yoga.name}`,
          value: `${yoga.name} energized via ${isDashaTriggered ? activeLords.mahadasha + ' Dasha' : 'Major Gochara transit'}. ${desc}`,
          weight: status === 'STRENGTHENED' ? 0.25 : 0.15,
          direction: status === 'WEAKENED' ? 'CHALLENGING' : 'SUPPORTIVE',
        };

        results.push({
          yogaName: yoga.name,
          status,
          keyPlanets: yogaPlanets,
          houses,
          description: desc,
          activationPeriod: periodLabel,
          evidence,
        });
      }
    }

    return results;
  }
}
