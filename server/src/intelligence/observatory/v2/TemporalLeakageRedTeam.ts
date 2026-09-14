/**
 * DeepAstro Observatory V2.0 - Temporal Leakage Red Team
 * Adversarially attempts to inject future information into historical replay.
 * Any detected leakage â†’ CRITICAL_TEST_FAILURE
 */
export interface LeakageTestResult {
  testId: string;
  attackVector: string;
  leakageDetected: boolean;
  severity: 'CLEAN' | 'WARNING' | 'CRITICAL_TEST_FAILURE';
  description: string;
  testedAt: string;
}

export interface TemporalLeakageRedTeamReport {
  replayId: string;
  cutoffTimestamp: string;
  tests: LeakageTestResult[];
  overallStatus: 'CLEAN' | 'CRITICAL_TEST_FAILURE';
  leakageCount: number;
}

export class TemporalLeakageRedTeam {
  public static runAllAttacks(params: {
    replayId: string;
    cutoffTimestamp: string;
    dataItems: Array<{ id: string; createdAt: string; type: string; content: string }>;
    knowledgeItems: Array<{ id: string; retrievedAt: string; content: string }>;
    predictionItems?: Array<{ id: string; issuedAt: string; outcome?: { confirmedAt?: string } }>;
  }): TemporalLeakageRedTeamReport {
    const { replayId, cutoffTimestamp, dataItems, knowledgeItems, predictionItems = [] } = params;
    const cutoff = new Date(cutoffTimestamp).getTime();
    const tests: LeakageTestResult[] = [];

    // Attack 1: Future data record injection
    for (const item of dataItems) {
      const itemTime = new Date(item.createdAt).getTime();
      if (itemTime > cutoff) {
        tests.push({
          testId: `leak_data_${item.id}`,
          attackVector: 'FUTURE_DATA_RECORD',
          leakageDetected: true,
          severity: 'CRITICAL_TEST_FAILURE',
          description: `Data record '${item.id}' created at ${item.createdAt} is AFTER cutoff ${cutoffTimestamp}`,
          testedAt: new Date().toISOString(),
        });
      }
    }

    // Attack 2: Future knowledge injection
    for (const k of knowledgeItems) {
      const kTime = new Date(k.retrievedAt).getTime();
      if (kTime > cutoff) {
        tests.push({
          testId: `leak_knowledge_${k.id}`,
          attackVector: 'FUTURE_KNOWLEDGE',
          leakageDetected: true,
          severity: 'CRITICAL_TEST_FAILURE',
          description: `Knowledge item '${k.id}' retrieved at ${k.retrievedAt} is AFTER cutoff`,
          testedAt: new Date().toISOString(),
        });
      }
    }

    // Attack 3: Future outcome injection
    for (const pred of predictionItems) {
      if (pred.outcome?.confirmedAt) {
        const outcomeTime = new Date(pred.outcome.confirmedAt).getTime();
        if (outcomeTime > cutoff) {
          tests.push({
            testId: `leak_outcome_${pred.id}`,
            attackVector: 'FUTURE_OUTCOME_INJECTION',
            leakageDetected: true,
            severity: 'CRITICAL_TEST_FAILURE',
            description: `Outcome for prediction '${pred.id}' confirmed at ${pred.outcome.confirmedAt} is AFTER cutoff`,
            testedAt: new Date().toISOString(),
          });
        }
      }
    }

    // Attack 4: Retrospective interpretation (post-cutoff prediction)
    for (const pred of predictionItems) {
      const predTime = new Date(pred.issuedAt).getTime();
      if (predTime > cutoff) {
        tests.push({
          testId: `leak_retro_${pred.id}`,
          attackVector: 'RETROSPECTIVE_INTERPRETATION',
          leakageDetected: true,
          severity: 'CRITICAL_TEST_FAILURE',
          description: `Prediction '${pred.id}' issued at ${pred.issuedAt} is AFTER cutoff â€” not available at replay time`,
          testedAt: new Date().toISOString(),
        });
      }
    }

    // Mark clean items
    if (tests.length === 0) {
      tests.push({
        testId: 'leak_all_clean',
        attackVector: 'COMPREHENSIVE_SCAN',
        leakageDetected: false,
        severity: 'CLEAN',
        description: 'All items verified to be before cutoff timestamp. No leakage detected.',
        testedAt: new Date().toISOString(),
      });
    }

    const leakageCount = tests.filter(t => t.leakageDetected).length;
    const overallStatus = leakageCount > 0 ? 'CRITICAL_TEST_FAILURE' : 'CLEAN';

    return { replayId, cutoffTimestamp, tests, overallStatus, leakageCount };
  }
}
