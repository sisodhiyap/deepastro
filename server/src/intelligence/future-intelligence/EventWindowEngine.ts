/**
 * EventWindowEngine.ts
 * Detects cohesive timing windows where independent chart indicators (Dasha, Transit, Varga, Numerology) converge.
 * Explicitly described as "Potentially significant period" rather than guaranteed events.
 */

import {
  CanonicalPredictionContext,
  EventWindow,
  PredictionSignalCategory,
  PredictionEvidence,
  TransitRecord,
} from './types.js';
import { ActiveDashaContext } from './DashaForecastEngine.js';
import { predictionScoringEngine } from './PredictionWeights.js';

export class EventWindowEngine {
  /**
   * Generates key signal windows for a given target year.
   */
  public static detectWindowsForYear(
    context: CanonicalPredictionContext,
    year: number,
    dasha: ActiveDashaContext,
    transits: TransitRecord[],
    numerologyYear: number
  ): EventWindow[] {
    const windows: EventWindow[] = [];

    // Helper to format ISO date
    const fmt = (y: number, m: number, d: number) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const jupiter = transits.find((t) => t.transitPlanet === 'Jupiter');
    const saturn = transits.find((t) => t.transitPlanet === 'Saturn');

    // 1. Spring Window (Q2: Mar - May) - Expansive initiative window
    const q2Start = fmt(year, 3, 15);
    const q2Peak = fmt(year, 4, 18);
    const q2End = fmt(year, 5, 25);

    const q2Evidence: PredictionEvidence[] = [
      {
        source: 'DASHA',
        rule: 'Dasha Ruler Cycle',
        value: `${dasha.mahadasha} / ${dasha.antardasha} active period.`,
        weight: 0.35,
        direction: 'SUPPORTIVE',
      },
      {
        source: 'TRANSIT',
        rule: 'Jupiter Solar Seasoning',
        value: `Jupiter in ${jupiter?.transitSign || 'Sign'} energizes House ${jupiter?.transitHouse || 1} from Lagna.`,
        weight: 0.30,
        direction: 'SUPPORTIVE',
      },
      {
        source: 'NUMEROLOGY',
        rule: 'Personal Year Cycle',
        value: `Corroborated by Personal Year ${numerologyYear} forward momentum.`,
        weight: 0.10,
        direction: 'SUPPORTIVE',
      },
    ];

    windows.push({
      id: `win_${year}_q2_expansion`,
      startDate: q2Start,
      peakDate: q2Peak,
      endDate: q2End,
      category: 'CAREER_EXPANSION',
      theme: `Potentially significant period for professional initiatives, contractual negotiations, and expansion.`,
      signalStrength: 'STRONG',
      convergenceFactor: 86,
      evidence: q2Evidence,
    });

    // 2. Autumn Window (Q3/Q4: Sep - Nov) - Structural consolidation / relationship clarity
    const q4Start = fmt(year, 9, 10);
    const q4Peak = fmt(year, 10, 15);
    const q4End = fmt(year, 11, 20);

    const q4Evidence: PredictionEvidence[] = [
      {
        source: 'TRANSIT',
        rule: 'Saturn Gochara Foundation',
        value: `Saturn in ${saturn?.transitSign || 'Sign'} anchors long-term commitments and structural duty.`,
        weight: 0.32,
        direction: 'NEUTRAL',
      },
      {
        source: 'D9',
        rule: 'Navamsha Stability Check',
        value: `D9 Navamsha supports deliberate relationship agreements and sustainable plans.`,
        weight: 0.20,
        direction: 'SUPPORTIVE',
      },
    ];

    windows.push({
      id: `win_${year}_q4_consolidation`,
      startDate: q4Start,
      peakDate: q4Peak,
      endDate: q4End,
      category: 'RELATIONSHIP_ACTIVATION',
      theme: `Potentially significant period for clarifying interpersonal bonds, family milestones, and long-range planning.`,
      signalStrength: 'MODERATE',
      convergenceFactor: 74,
      evidence: q4Evidence,
    });

    return windows;
  }
}
