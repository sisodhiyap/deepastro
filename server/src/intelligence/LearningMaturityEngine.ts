/**
 * DeepAstro 4.2 — Learning Maturity Engine (LearningMaturityEngine)
 * Evaluates the empirical maturity of DeepAstro's self-evolving prediction architecture:
 * 
 * LEVEL 0: No usable outcome data
 * LEVEL 1: Outcome collection active
 * LEVEL 2: Basic evaluation & reality comparison active
 * LEVEL 3: Calibration & Brier score tracking active
 * LEVEL 4: Controlled experiments active
 * LEVEL 5: Out-of-sample & walk-forward validation active
 * LEVEL 6: Governed strategy promotion active
 * LEVEL 7: Stable monitored adaptation with canary & automated drift rollback
 */

export type LearningMaturityTier =
  | 'LEVEL_0_NO_DATA'
  | 'LEVEL_1_OUTCOME_COLLECTION'
  | 'LEVEL_2_BASIC_EVALUATION'
  | 'LEVEL_3_CALIBRATION'
  | 'LEVEL_4_CONTROLLED_EXPERIMENTS'
  | 'LEVEL_5_OUT_OF_SAMPLE_VALIDATION'
  | 'LEVEL_6_GOVERNED_STRATEGY_PROMOTION'
  | 'LEVEL_7_STABLE_MONITORED_ADAPTATION';

export interface LearningMaturityAssessment {
  currentTier: LearningMaturityTier;
  levelNumber: number; // 0 to 7
  totalResolvedOutcomes: number;
  hasCalibrationTracking: boolean;
  hasControlledExperiments: boolean;
  hasOutOfSampleVerification: boolean;
  hasGovernanceGate: boolean;
  hasCanaryDriftMonitoring: boolean;
  dataSufficiencyState: 'INSUFFICIENT_REAL_WORLD_DATA' | 'LOW_SAMPLE' | 'ADEQUATE' | 'HIGH_CONFIDENCE_DATASET';
  nextMilestoneRequirement: string;
}

export class LearningMaturityEngine {
  public static assessMaturity(params: {
    totalResolvedOutcomes: number;
    hasCalibrationTracking?: boolean;
    hasControlledExperiments?: boolean;
    hasOutOfSampleVerification?: boolean;
    hasGovernanceGate?: boolean;
    hasCanaryDriftMonitoring?: boolean;
  }): LearningMaturityAssessment {
    const {
      totalResolvedOutcomes,
      hasCalibrationTracking = true,
      hasControlledExperiments = true,
      hasOutOfSampleVerification = true,
      hasGovernanceGate = true,
      hasCanaryDriftMonitoring = true,
    } = params;

    let currentTier: LearningMaturityTier = 'LEVEL_0_NO_DATA';
    let levelNumber = 0;
    let dataSufficiency: 'INSUFFICIENT_REAL_WORLD_DATA' | 'LOW_SAMPLE' | 'ADEQUATE' | 'HIGH_CONFIDENCE_DATASET' = 'INSUFFICIENT_REAL_WORLD_DATA';
    let nextMilestone = 'Collect initial explicit user-confirmed prediction outcomes.';

    if (totalResolvedOutcomes === 0) {
      currentTier = 'LEVEL_0_NO_DATA';
      levelNumber = 0;
      dataSufficiency = 'INSUFFICIENT_REAL_WORLD_DATA';
      nextMilestone = 'Accumulate at least 1 verified user outcome.';
    } else if (totalResolvedOutcomes < 3) {
      currentTier = 'LEVEL_1_OUTCOME_COLLECTION';
      levelNumber = 1;
      dataSufficiency = 'INSUFFICIENT_REAL_WORLD_DATA';
      nextMilestone = 'Reach 3 verified outcomes to enable multi-axis reality comparison.';
    } else if (totalResolvedOutcomes < 5) {
      currentTier = 'LEVEL_2_BASIC_EVALUATION';
      levelNumber = 2;
      dataSufficiency = 'LOW_SAMPLE';
      nextMilestone = 'Reach 5 verified outcomes to enable calibration curves and Brier scores.';
    } else if (!hasCalibrationTracking) {
      currentTier = 'LEVEL_3_CALIBRATION';
      levelNumber = 3;
      dataSufficiency = 'LOW_SAMPLE';
      nextMilestone = 'Enable calibration tracking engine.';
    } else if (!hasControlledExperiments) {
      currentTier = 'LEVEL_4_CONTROLLED_EXPERIMENTS';
      levelNumber = 4;
      dataSufficiency = 'ADEQUATE';
      nextMilestone = 'Enable controlled strategy experiments.';
    } else if (!hasOutOfSampleVerification) {
      currentTier = 'LEVEL_5_OUT_OF_SAMPLE_VALIDATION';
      levelNumber = 5;
      dataSufficiency = 'ADEQUATE';
      nextMilestone = 'Enable out-of-sample and walk-forward validation.';
    } else if (!hasGovernanceGate) {
      currentTier = 'LEVEL_6_GOVERNED_STRATEGY_PROMOTION';
      levelNumber = 6;
      dataSufficiency = 'HIGH_CONFIDENCE_DATASET';
      nextMilestone = 'Configure human administrator governance sign-off.';
    } else {
      currentTier = 'LEVEL_7_STABLE_MONITORED_ADAPTATION';
      levelNumber = 7;
      dataSufficiency = totalResolvedOutcomes >= 15 ? 'HIGH_CONFIDENCE_DATASET' : 'ADEQUATE';
      nextMilestone = 'Continuous canary drift monitoring and longitudinal strategy stability active.';
    }

    return {
      currentTier,
      levelNumber,
      totalResolvedOutcomes,
      hasCalibrationTracking,
      hasControlledExperiments,
      hasOutOfSampleVerification,
      hasGovernanceGate,
      hasCanaryDriftMonitoring,
      dataSufficiencyState: dataSufficiency,
      nextMilestoneRequirement: nextMilestone,
    };
  }
}
