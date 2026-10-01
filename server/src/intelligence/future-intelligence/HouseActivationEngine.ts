/**
 * HouseActivationEngine.ts & AspectForecastEngine.ts
 * Determines which of the 12 Bhavas are energized by Dasha lords, planetary transits, and classical Vedic aspects (Drishti).
 */

import { CanonicalPredictionContext, PredictionEvidence, TransitRecord } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export interface HouseActivationSummary {
  houseNumber: number;
  houseSign: string;
  significance: string;
  activatedByDasha: PlanetName[];
  activatedByTransit: PlanetName[];
  aspectedBy: PlanetName[];
  intensity: 'HIGH' | 'MODERATE' | 'LOW';
  theme: string;
}

const HOUSE_THEMES: Record<number, string> = {
  1: 'Vitality, Self-Expression, Personal Direction & Initiative',
  2: 'Wealth Accumulation, Family Resources, Speech & Values',
  3: 'Courage, Initiative, Siblings, Skill Acquisition & Communication',
  4: 'Home, Mother, Domestic Peace, Vehicles & Inner Foundation',
  5: 'Intellect, Creativity, Speculative Insight, Children & Past Merits',
  6: 'Daily Work, Problem Resolution, Health Habits & Overcoming Obstacles',
  7: 'Significant Partnerships, Marriage, Contracts & Business Alliances',
  8: 'Transformation, Research, Longevity, Deep Psychological Renewal',
  9: 'Higher Wisdom, Dharma, Mentors, Long-Distance Travel & Fortune',
  10: 'Career Elevation, Professional Authority, Public Status & Duty',
  11: 'Aspirations, Social Networks, Community Impact & Inflow of Gains',
  12: 'Spiritual Solitude, Subconscious Integration, Foreign Horizons & Rest',
};

export class HouseActivationEngine {
  public static evaluateHouses(
    context: CanonicalPredictionContext,
    activeLords: { mahadasha: PlanetName; antardasha: PlanetName },
    transits: TransitRecord[]
  ): HouseActivationSummary[] {
    const ascSign = context.ascendant.signIndex;
    const summaries: HouseActivationSummary[] = [];

    for (let h = 1; h <= 12; h++) {
      const houseSignIdx = (ascSign + h - 1) % 12;
      const houseSign = context.houses[h - 1]?.signName || `Sign ${houseSignIdx + 1}`;

      // Check Dasha lords in this house or owning this house
      const dashaActive: PlanetName[] = [];
      const mD1 = context.d1.find((p) => p.name === activeLords.mahadasha);
      const aD1 = context.d1.find((p) => p.name === activeLords.antardasha);

      if (mD1?.house === h) dashaActive.push(activeLords.mahadasha);
      if (aD1?.house === h && !dashaActive.includes(activeLords.antardasha)) dashaActive.push(activeLords.antardasha);

      // Check transits in this house
      const transitActive = transits
        .filter((t) => t.transitHouse === h)
        .map((t) => t.transitPlanet);

      // Check aspects (Drishti) on this house
      const aspecting = AspectForecastEngine.getAspectingPlanetsToHouse(transits, h);

      const totalSignals = dashaActive.length * 2 + transitActive.length + aspecting.length;
      let intensity: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
      if (totalSignals >= 4) intensity = 'HIGH';
      else if (totalSignals >= 2) intensity = 'MODERATE';

      summaries.push({
        houseNumber: h,
        houseSign,
        significance: HOUSE_THEMES[h] || 'Life Area Focus',
        activatedByDasha: dashaActive,
        activatedByTransit: transitActive,
        aspectedBy: aspecting,
        intensity,
        theme: `House ${h} (${HOUSE_THEMES[h]}): ${
          dashaActive.length > 0 ? `Ruled/occupied by active Dasha lord ${dashaActive.join(', ')}. ` : ''
        }${transitActive.length > 0 ? `Energized by transiting ${transitActive.join(', ')}. ` : ''}${
          aspecting.length > 0 ? `Receiving drishti from ${aspecting.join(', ')}.` : ''
        }`,
      });
    }

    return summaries;
  }
}

export class AspectForecastEngine {
  /**
   * Computes which transiting planets cast drishti upon a given natal house.
   */
  public static getAspectingPlanetsToHouse(transits: TransitRecord[], targetHouse: number): PlanetName[] {
    const aspecting: PlanetName[] = [];

    for (const t of transits) {
      const th = t.transitHouse;
      // All planets cast 7th aspect (opposite house)
      const seventh = (th + 6) % 12 || 12;
      if (seventh === targetHouse) aspecting.push(t.transitPlanet);

      // Special Vedic Aspects:
      if (t.transitPlanet === 'Saturn') {
        const third = (th + 2) % 12 || 12;
        const tenth = (th + 9) % 12 || 12;
        if ((third === targetHouse || tenth === targetHouse) && !aspecting.includes('Saturn')) {
          aspecting.push('Saturn');
        }
      } else if (t.transitPlanet === 'Jupiter') {
        const fifth = (th + 4) % 12 || 12;
        const ninth = (th + 8) % 12 || 12;
        if ((fifth === targetHouse || ninth === targetHouse) && !aspecting.includes('Jupiter')) {
          aspecting.push('Jupiter');
        }
      } else if (t.transitPlanet === 'Mars') {
        const fourth = (th + 3) % 12 || 12;
        const eighth = (th + 7) % 12 || 12;
        if ((fourth === targetHouse || eighth === targetHouse) && !aspecting.includes('Mars')) {
          aspecting.push('Mars');
        }
      }
    }

    return aspecting;
  }
}
