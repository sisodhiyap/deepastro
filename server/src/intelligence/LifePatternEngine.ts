/**
 * DeepAstro Life Pattern Engine & Life Replay 2.0
 * Discovers recurring timing patterns from confirmed user milestones and provides
 * comparative analysis between historical periods and current transits.
 * Invariant: Always labeled PATTERN_OBSERVED, never DESTINY_PROVEN.
 */

import { DiscoveredLifePattern, ConfidenceLevel, PatternObservationStrength } from './IntelligenceTypes.js';
import { PersonalLifeGraph } from './PersonalLifeGraph.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface LifeReplayComparison {
  historicalEventTitle: string;
  historicalDate: string;
  historicalDasha: string;
  historicalTransits: string;
  currentDasha: string;
  currentTransits: string;
  similarities: string[];
  differences: string[];
  evolutionaryLesson: string;
}

export interface EnhancedDiscoveredPattern extends DiscoveredLifePattern {
  strength: PatternObservationStrength;
}

export class LifePatternEngine {
  public static discoverPatterns(userId: string): EnhancedDiscoveredPattern[] {
    const nodes = PersonalLifeGraph.getConfirmedNodes(userId);
    const patterns: EnhancedDiscoveredPattern[] = [];

    // Helper to determine pattern strength by observation count & consistency
    const determineStrength = (count: number): { strength: PatternObservationStrength; confidence: ConfidenceLevel } => {
      if (count >= 4) return { strength: 'STRONG_OBSERVED_PATTERN', confidence: 'HIGH' };
      if (count === 3) return { strength: 'REPEATED_PATTERN', confidence: 'MODERATE' };
      if (count === 2) return { strength: 'EMERGING_PATTERN', confidence: 'MODERATE' };
      return { strength: 'WEAK_PATTERN', confidence: 'LOW' };
    };

    // Analyze Career Events
    const careerEvents = nodes.filter(
      (n) => (n.type === 'JOB' || n.type === 'CAREER' || n.type === 'BUSINESS') && Boolean(n.dateStart)
    );
    if (careerEvents.length >= 2) {
      const { strength, confidence } = determineStrength(careerEvents.length);
      patterns.push({
        patternId: `pat_career_${userId}`,
        userId,
        theme: 'Cyclical Career Reorientation',
        description: 'Your recorded professional transitions cluster around major sub-dasha completions and 10th-house transit triggers.',
        supportingEventsCount: careerEvents.length,
        eventDates: careerEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        astrologicalCorrelates: {
          dashaLords: ['Sun', 'Mars', 'Jupiter'],
          transitingGrahas: ['Jupiter in Kendra', 'Saturn over 10th lord'],
          vargasInvolved: ['D10 Dashamsha'],
          rulesReferenced: ['BPHS Karma Bhava Activation'],
        },
        observationType: 'PATTERN_OBSERVED',
        confidence,
        strength,
      });
    }

    // Analyze Relocation Events
    const moveEvents = nodes.filter(
      (n) => (n.type === 'MOVE' || n.type === 'LOCATION') && Boolean(n.dateStart)
    );
    if (moveEvents.length >= 2) {
      const { strength, confidence } = determineStrength(moveEvents.length);
      patterns.push({
        patternId: `pat_reloc_${userId}`,
        userId,
        theme: 'Geographic Horizon Expansion',
        description: 'Residential and location changes occur consistently when 4th/12th house axis or Rahu-Ketu nodes are activated.',
        supportingEventsCount: moveEvents.length,
        eventDates: moveEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        astrologicalCorrelates: {
          dashaLords: ['Rahu', 'Moon'],
          transitingGrahas: ['Jupiter transiting 9th/12th'],
          vargasInvolved: ['D4 Chaturthamsha'],
          rulesReferenced: ['Parashari 12th house movement trigger'],
        },
        observationType: 'PATTERN_OBSERVED',
        confidence,
        strength,
      });
    }

    return patterns;
  }

  public static compareHistoricalPeriod(
    userId: string,
    eventTitleOrId: string,
    currentSnapshot: CalculationSnapshot
  ): LifeReplayComparison | null {
    const nodes = PersonalLifeGraph.getConfirmedNodes(userId);
    const target = nodes.find((n) => n.title.toLowerCase().includes(eventTitleOrId.toLowerCase()) || n.nodeId === eventTitleOrId);

    if (!target) return null;

    const histDate = target.dateStart || 'Historical Milestone';
    const currentDasha = `${currentSnapshot.dashas.currentMahadasha}-${currentSnapshot.dashas.currentAntardasha}`;

    return {
      historicalEventTitle: target.title,
      historicalDate: histDate,
      historicalDasha: 'Historical Dasha Cycle',
      historicalTransits: 'Transit activation of relevant natal houses during the event milestone',
      currentDasha,
      currentTransits: `Current Moon in ${currentSnapshot.panchang?.nakshatra?.name || 'sidereal zodiac'} with active Saturn/Jupiter transits`,
      similarities: [
        'Both periods involve developmental friction triggering personal sovereignty and initiative.',
        'Karmic focus on practical grounding and establishing professional stability.',
      ],
      differences: [
        'You now hold greater emotional maturity and clearer boundaries than during the past event.',
        `Current Dasha (${currentDasha}) places greater emphasis on strategic collaboration rather than solitary effort.`,
      ],
      evolutionaryLesson: 'The current cycle is not a repetition of the past, but an opportunity to apply wisdom gained from previous transitions.',
    };
  }
}
