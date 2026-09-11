/**
 * DeepAstro 3.1 — "What Changed?" Engine (WhatChangedEngine)
 * Compares the state of a user's previous reading session against their current session.
 * Detects:
 * - New planetary transits (e.g. Moon nakshatra change, major planet ingress)
 * - Dasha phase progressions (e.g. Mahadasha/Antardasha transition)
 * - Newly added or evolved user life goals
 * - Newly confirmed life events in PersonalLifeGraph
 * - Recorded prediction outcome feedback
 */

import { WhatChangedAnalysis } from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { UserGoalEngine } from './UserGoalEngine.js';
import { PersonalLifeGraph } from './PersonalLifeGraph.js';
import { OutcomeLearningEngine } from './OutcomeLearningEngine.js';

export interface ReadingStateSnapshot {
  timestamp: string;
  dashaPhase: string;
  transitMoonSign: string;
  transitSaturnSign: string;
  goalCount: number;
  confirmedEventCount: number;
  outcomeCount: number;
}

export class WhatChangedEngine {
  private static lastUserReadings: Map<string, ReadingStateSnapshot> = new Map();

  public static recordReadingState(userId: string, snapshot: CalculationSnapshot): void {
    const goals = UserGoalEngine.getAllGoals(userId);
    const events = PersonalLifeGraph.getConfirmedNodes(userId);
    const outcomes = OutcomeLearningEngine.getCalibration(userId);

    const moonPos = snapshot.planetaryPositions.find((p) => p.planet === 'Moon');
    const saturnPos = snapshot.planetaryPositions.find((p) => p.planet === 'Saturn');

    const state: ReadingStateSnapshot = {
      timestamp: new Date().toISOString(),
      dashaPhase: `${snapshot.dashas.currentMahadasha}-${snapshot.dashas.currentAntardasha}`,
      transitMoonSign: moonPos?.sign || 'Moon Rashi',
      transitSaturnSign: saturnPos?.house ? `House ${saturnPos.house}` : 'Saturn Transiting',
      goalCount: goals.length,
      confirmedEventCount: events.length,
      outcomeCount: outcomes.totalOutcomes,
    };

    this.lastUserReadings.set(userId, state);
  }

  public static analyzeChanges(userId: string, currentSnapshot: CalculationSnapshot): WhatChangedAnalysis {
    const previous = this.lastUserReadings.get(userId);
    const now = new Date().toISOString();

    const moonPos = currentSnapshot.planetaryPositions.find((p) => p.planet === 'Moon');
    const saturnPos = currentSnapshot.planetaryPositions.find((p) => p.planet === 'Saturn');

    const currentDasha = `${currentSnapshot.dashas.currentMahadasha}-${currentSnapshot.dashas.currentAntardasha}`;
    const currentMoon = moonPos?.sign || 'Current Moon';
    const currentSaturn = saturnPos?.house ? `House ${saturnPos.house}` : 'Saturn';

    const currentGoals = UserGoalEngine.getAllGoals(userId);
    const currentEvents = PersonalLifeGraph.getConfirmedNodes(userId);
    const currentOutcomes = OutcomeLearningEngine.getCalibration(userId);

    if (!previous) {
      // First session baseline
      this.recordReadingState(userId, currentSnapshot);
      return {
        lastReadingDate: 'Initial Session',
        currentReadingDate: now.split('T')[0],
        newTransits: [`Transiting Moon active in ${currentMoon}`, `Saturn positioning in ${currentSaturn}`],
        newDashaPhase: currentDasha,
        newGoals: currentGoals.map((g) => g.title),
        newConfirmedEvents: currentEvents.map((e) => e.title),
        newOutcomeFeedback: [],
        synthesis: 'Initial cosmic intelligence baseline established for your verified chart.',
      };
    }

    const newTransits: string[] = [];
    if (previous.transitMoonSign !== currentMoon) {
      newTransits.push(`Moon progressed from ${previous.transitMoonSign} into ${currentMoon}`);
    } else {
      newTransits.push(`Moon continues transit through ${currentMoon}`);
    }

    let newDashaPhase: string | undefined = undefined;
    if (previous.dashaPhase !== currentDasha) {
      newDashaPhase = `Progressed from ${previous.dashaPhase} to ${currentDasha}`;
    }

    const newGoals: string[] = [];
    if (currentGoals.length > previous.goalCount) {
      const added = currentGoals.slice(previous.goalCount);
      newGoals.push(...added.map((g) => g.title));
    }

    const newConfirmedEvents: string[] = [];
    if (currentEvents.length > previous.confirmedEventCount) {
      const added = currentEvents.slice(previous.confirmedEventCount);
      newConfirmedEvents.push(...added.map((e) => e.title));
    }

    const newOutcomeFeedback: string[] = [];
    if (currentOutcomes.totalOutcomes > previous.outcomeCount) {
      newOutcomeFeedback.push(`${currentOutcomes.totalOutcomes - previous.outcomeCount} new prediction outcome(s) recorded`);
    }

    const synthesisParts: string[] = [];
    if (newDashaPhase) synthesisParts.push(newDashaPhase);
    if (newTransits.length > 0) synthesisParts.push(newTransits[0]);
    if (newGoals.length > 0) synthesisParts.push(`${newGoals.length} new objective(s) active`);
    if (newConfirmedEvents.length > 0) synthesisParts.push(`${newConfirmedEvents.length} new confirmed milestone(s)`);

    const synthesis =
      synthesisParts.length > 0
        ? `Since your last reading on ${previous.timestamp.split('T')[0]}: ${synthesisParts.join('; ')}.`
        : `Your chart conditions remain in the established ${currentDasha} cycle with steady transit alignments.`;

    // Update the recorded state
    this.recordReadingState(userId, currentSnapshot);

    return {
      lastReadingDate: previous.timestamp.split('T')[0],
      currentReadingDate: now.split('T')[0],
      newTransits,
      newDashaPhase,
      newGoals,
      newConfirmedEvents,
      newOutcomeFeedback,
      synthesis,
    };
  }
}
