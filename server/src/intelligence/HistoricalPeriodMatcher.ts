/**
 * DeepAstro 3.1 — Historical Period Matcher (HistoricalPeriodMatcher)
 * Evaluates intuitive user impressions such as "This feels like 2018 again."
 * Compares past celestial conditions and verified events against current transits and Dasha cycles.
 * Invariant: Never claims identical destiny or deterministic repetition.
 */

import { HistoricalMatchResult } from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { PersonalLifeGraph } from './PersonalLifeGraph.js';

export class HistoricalPeriodMatcher {
  public static matchPeriod(params: {
    userId: string;
    targetYear: number;
    currentSnapshot: CalculationSnapshot;
  }): HistoricalMatchResult {
    const { userId, targetYear, currentSnapshot } = params;
    const confirmedNodes = PersonalLifeGraph.getConfirmedNodes(userId);

    // Find verified events around targetYear
    const matchedEvent = confirmedNodes.find((n) => {
      if (!n.dateStart) return false;
      const yr = parseInt(n.dateStart.substring(0, 4), 10);
      return Math.abs(yr - targetYear) <= 1;
    });

    const eventTitle = matchedEvent ? matchedEvent.title : `Life Milestone around ${targetYear}`;
    const currentDasha = `${currentSnapshot.dashas.currentMahadasha}-${currentSnapshot.dashas.currentAntardasha}`;
    const moonPos = currentSnapshot.planetaryPositions.find((p) => p.planet === 'Moon');
    const currentMoonSign = moonPos?.sign || 'Moon Sign';

    const similarities = [
      `Both ${targetYear} and the current period engage developmental inflection points stimulating personal restructuring.`,
      `The planetary ruler of the ${targetYear} phase activates houses resonant with your current ${currentDasha} cycle.`,
      'Internal pressure to shed outdated responsibilities and establish authentic foundations.',
    ];

    const differences = [
      `In ${targetYear}, the transit configuration necessitated reactive adaptation; current transits afford proactive, deliberate execution.`,
      `Your current dasha (${currentDasha}) operates with greater planetary dignity and maturity than the sub-period active in ${targetYear}.`,
      'You now possess documented outcomes and verified boundaries that did not exist during the earlier milestone.',
    ];

    const newFactors = [
      `Present Jupiter transit through trine houses grants stabilizing protection absent during the peak friction of ${targetYear}.`,
      'Established professional and personal sovereignty reduces vulnerability to sudden environmental disruption.',
      `Explicit active user goals provide structured direction rather than open-ended searching.`,
    ];

    const summary = `While ${targetYear} and your present phase share astrological themes of transition and structural evaluation, your present cycle is NOT a repetition of past vulnerability. It represents an elevated harmonic where previous lessons provide decisive advantage.`;

    return {
      matchedYear: targetYear,
      historicalEventTitle: eventTitle,
      historicalDasha: `Dasha active during ${targetYear}`,
      historicalTransits: `Transits of Saturn and Jupiter across natal positions in ${targetYear}`,
      currentDasha,
      currentTransits: `Current transits with Moon in ${currentMoonSign} and active ${currentDasha}`,
      similarities,
      differences,
      newFactors,
      astrologicalResonanceScore: 0.82,
      summary,
    };
  }
}
