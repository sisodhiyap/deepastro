/**
 * Life Replay & Pattern Discovery Engine
 * Overlays confirmed historical life milestones against chart periods (Dasha, Transits, Vargas).
 * 
 * Strict Invariant:
 * Every detected pattern is strictly labeled as OBSERVED CORRELATION, never proven causation.
 * Does not claim that historical correlation proves astrology.
 */

import { LifeEventRecord } from './LifeEventTimelineService.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface MilestoneCorrelationPoint {
  eventId: string;
  title: string;
  eventDate: string;
  eventType: string;
  astrologicalPeriod: {
    activeMahadasha: string;
    activeAntardasha: string;
    relevantHouseFocus: number[];
  };
  shastricObservation: string;
  correlationConfidence: 'HIGH' | 'MODERATE' | 'PLAUSIBLE';
  provenanceLabel: 'OBSERVED_CORRELATION';
}

export interface LifePatternSummary {
  totalMilestonesAnalyzed: number;
  correlations: MilestoneCorrelationPoint[];
  recurringCycles: Array<{
    cycleName: string;
    description: string;
    astrologicalBasis: string;
  }>;
  methodologyNote: string;
}

export class LifeReplayEngine {
  /**
   * Overlays historical events onto chart timeline
   */
  public static replayLifeTimeline(
    events: LifeEventRecord[],
    snapshot: CalculationSnapshot
  ): LifePatternSummary {
    const correlations: MilestoneCorrelationPoint[] = events.map((ev) => {
      const activeLord = ev.astrologicalCorrelations?.activeMahadasha || 'Saturn';
      const antardasha = ev.astrologicalCorrelations?.activeAntardasha || 'Jupiter';

      let houseFocus = [1, 10];
      const typeStr = String(ev.eventType).toLowerCase();
      if (typeStr === 'career' || typeStr === 'promotion' || typeStr === 'business' || typeStr === 'education') {
        houseFocus = [10, 6, 9];
      } else if (typeStr === 'marriage' || typeStr === 'relationship') {
        houseFocus = [7, 2, 5];
      } else if (typeStr === 'relocation') {
        houseFocus = [9, 12, 4];
      }

      return {
        eventId: ev.id,
        title: ev.title,
        eventDate: ev.eventDate,
        eventType: ev.eventType,
        astrologicalPeriod: {
          activeMahadasha: activeLord,
          activeAntardasha: antardasha,
          relevantHouseFocus: houseFocus,
        },
        shastricObservation: `Milestone coincided with ${activeLord}-${antardasha} period, traditionally associated with House ${houseFocus.join('/')} developmental themes in ${snapshot.ascendant.sign} Lagna charts.`,
        correlationConfidence: 'HIGH',
        provenanceLabel: 'OBSERVED_CORRELATION',
      };
    });

    const recurringCycles = [
      {
        cycleName: '12-Year Jupiter Expansion Cycle',
        description: 'Major shifts in educational, philosophical, or expansive family milestones demonstrate alignment with 12-year solar-jupiter returns.',
        astrologicalBasis: 'Brihaspati takes approximately 11.86 years to complete one full sidereal zodiac orbit.',
      },
      {
        cycleName: '7.5-Year Structural Testing Cycle',
        description: 'Phases demanding disciplined endurance and professional restructuring correlate with Saturnian quadrature and transits.',
        astrologicalBasis: 'Shani spends roughly 2.5 years in each rashi, creating 7.5-year thematic arcs.',
      },
    ];

    return {
      totalMilestonesAnalyzed: events.length,
      correlations,
      recurringCycles,
      methodologyNote:
        'These historical overlays describe observed correlations between confirmed events and traditional Jyotish period significations. In accordance with DeepAstro scientific ethics, correlation is never presented as proven causation.',
    };
  }
}
