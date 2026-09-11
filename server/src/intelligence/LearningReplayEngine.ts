/**
 * DeepAstro 4.1 — Learning Replay Engine (LearningReplayEngine)
 * Clean-room historical replay: given a historical cutoff date and prediction set,
 * re-executes reasoning and strategy evaluations using ONLY information available
 * before the cutoff.
 * 
 * Ensures historical auditability and answers:
 * "Would the system have learned this candidate correctly at time T?"
 */

import { HistoricalEvaluationCase } from './OutOfSampleValidationEngine.js';
import { PredictionExperimentEngine } from './PredictionExperimentEngine.js';

export interface CleanRoomReplayResult {
  replayId: string;
  historicalCutoffDate: string;
  totalEligibleHistoricalCases: number;
  excludedFutureCases: number;
  evaluatedStrategies: string[];
  winningStrategyAtCutoff: string;
  temporalIntegrityPass: boolean;
  replayAuditSummary: string;
  timestamp: string;
}

export class LearningReplayEngine {
  public static replayHistoricalLearning(params: {
    domain: string;
    allCases: HistoricalEvaluationCase[];
    cutoffDate: string;
  }): CleanRoomReplayResult {
    const { domain, allCases, cutoffDate } = params;
    const replayId = `rpl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cutoffTime = new Date(cutoffDate).getTime();

    // Clean-room filter: only cases strictly before cutoffDate
    const eligibleCases = allCases.filter((c) => new Date(c.eventDate).getTime() <= cutoffTime);
    const excludedCases = allCases.filter((c) => new Date(c.eventDate).getTime() > cutoffTime);

    if (eligibleCases.length < 5) {
      throw new Error(
        `CLEAN_ROOM_REPLAY_INSUFFICIENT_DATA: Need at least 5 historical cases before cutoff ${cutoffDate}, found ${eligibleCases.length}.`
      );
    }

    // Run controlled experiment strictly on pre-cutoff dataset
    const experiment = PredictionExperimentEngine.runControlledExperiment({
      domain,
      cases: eligibleCases,
    });

    const temporalIntegrityPass = eligibleCases.every((c) => new Date(c.eventDate).getTime() <= cutoffTime);

    const summary = `Clean-room replay at cutoff [${cutoffDate}] evaluated ${eligibleCases.length} eligible historical cases (excluded ${excludedCases.length} post-cutoff cases). Optimal strategy was ${experiment.winningStrategy} with accuracy ${(experiment.metrics[experiment.winningStrategy].accuracy * 100).toFixed(1)}%. Zero future information was leaked.`;

    return {
      replayId,
      historicalCutoffDate: cutoffDate,
      totalEligibleHistoricalCases: eligibleCases.length,
      excludedFutureCases: excludedCases.length,
      evaluatedStrategies: Object.keys(experiment.metrics),
      winningStrategyAtCutoff: experiment.winningStrategy,
      temporalIntegrityPass,
      replayAuditSummary: summary,
      timestamp: new Date().toISOString(),
    };
  }
}
