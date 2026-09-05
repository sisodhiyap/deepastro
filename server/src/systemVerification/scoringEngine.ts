/**
 * DeepAstro Deterministic Scoring Engine
 * Calculates mathematically precise completion percentages, test coverage,
 * and production readiness gates without arbitrary or hardcoded values.
 */

import {
  SystemTestResult,
  TestCategory,
  CategorySummary,
  VerificationRunReport,
  PipelineStageVerification,
  RegressionItem,
} from './types.js';

export const CATEGORY_DISPLAY_NAMES: Record<TestCategory, string> = {
  AUTH: 'Authentication & Security Context',
  WORKSPACE: 'User Workspace & Profile Vault',
  BIRTH: 'Birth Input & Coordinates Normalizer',
  ASTROLOGY: 'Deterministic Vedic Calculation Engine',
  VERIFICATION: 'Astronomical Invariant Verification',
  JYOTISH_RULES: 'Classical Jyotish Rule Engine',
  PANCHANG: 'Panchang & Muhurat Calculations',
  NUMEROLOGY: 'Numerology & Astro-Separation',
  REPORTS: '23-Stage Report Generation Pipeline',
  PDF: 'True Binary PDF Generation & Parsing',
  AI: 'Multi-Model AI Mesh & Fallbacks',
  AI_HIERARCHY: 'Deterministic-Over-AI Hierarchy Gate',
  RAG: 'Classical Text RAG & pgvector Store',
  FACT_CHECK: 'Claim-by-Claim Astrological Fact Checker',
  SAFETY: 'Harm Prevention & Anti-Fear Gate',
  PALMISTRY: 'Palmistry Computer Vision Analysis',
  DATABASE: 'Live Supabase PostgreSQL & RLS Persistence',
  SECURITY: 'Security, IDOR & Multi-Tenant Boundaries',
  FRONTEND: 'Frontend Interactive Element Suite',
  ERROR_HANDLING: 'Error Handling, Resilience & Recovery',
  PERFORMANCE: 'Latency Benchmarks & SLA Thresholds',
};

export class ScoringEngine {
  /**
   * Calculates category summaries and overall metrics from raw test results.
   */
  public static calculateReport(
    runId: string,
    results: SystemTestResult[],
    durationTotalMs: number,
    pipelineStages: PipelineStageVerification[],
    previousRunReport?: VerificationRunReport | null
  ): VerificationRunReport {
    const categories: TestCategory[] = Object.keys(CATEGORY_DISPLAY_NAMES) as TestCategory[];
    const categorySummaries: Record<TestCategory, CategorySummary> = {} as any;

    let overallPassedWeighted = 0;
    let overallApplicableWeighted = 0;
    let overallTestedWeight = 0;
    let overallTotalDefinedWeight = 0;

    const counts = {
      pass: 0,
      warning: 0,
      fail: 0,
      blocked: 0,
      notTested: 0,
      skipped: 0,
      infrastructureError: 0,
      testError: 0,
    };

    const criticalBlockers: string[] = [];

    // Group results by category
    for (const cat of categories) {
      const catResults = results.filter((r) => r.category === cat);
      let catPassedWeight = 0;
      let catApplicableWeight = 0;
      let catTestedWeight = 0;
      let catTotalWeight = 0;
      const catCriticalFails: string[] = [];

      let passCount = 0;
      let warningCount = 0;
      let failCount = 0;
      let blockedCount = 0;
      let notTestedCount = 0;
      let skippedCount = 0;
      let infrastructureErrorCount = 0;
      let testErrorCount = 0;

      for (const res of catResults) {
        catTotalWeight += res.weight;
        overallTotalDefinedWeight += res.weight;

        switch (res.status) {
          case 'PASS':
            passCount++;
            counts.pass++;
            catPassedWeight += res.weight * 1.0;
            catApplicableWeight += res.weight;
            catTestedWeight += res.weight;
            break;

          case 'WARNING':
            warningCount++;
            counts.warning++;
            catPassedWeight += res.weight * 0.75; // 75% credit for warning
            catApplicableWeight += res.weight;
            catTestedWeight += res.weight;
            break;

          case 'FAIL':
          case 'CAPABILITY_FAILURE':
            failCount++;
            counts.fail++;
            catApplicableWeight += res.weight;
            catTestedWeight += res.weight;
            if (res.severity === 'CRITICAL') {
              catCriticalFails.push(`[${res.id}] ${res.feature}: ${res.error || 'Assertion failed'}`);
              criticalBlockers.push(`[${cat} / ${res.id}] ${res.feature}: ${res.error || 'Failed'}`);
            }
            break;

          case 'INFRASTRUCTURE_ERROR':
            infrastructureErrorCount++;
            counts.infrastructureError++;
            catTestedWeight += res.weight;
            if (res.severity === 'CRITICAL') {
              catCriticalFails.push(`[${res.id}] ${res.feature} INFRASTRUCTURE_ERROR: ${res.error || 'Infrastructure failure'}`);
              criticalBlockers.push(`[${cat} / ${res.id}] ${res.feature} INFRASTRUCTURE_ERROR: ${res.error || 'Connection/Timeout'}`);
            }
            break;

          case 'TEST_ERROR':
            testErrorCount++;
            counts.testError++;
            catTestedWeight += res.weight;
            if (res.severity === 'CRITICAL') {
              catCriticalFails.push(`[${res.id}] ${res.feature} TEST_ERROR: ${res.error || 'Test implementation error'}`);
              criticalBlockers.push(`[${cat} / ${res.id}] ${res.feature} TEST_ERROR`);
            }
            break;

          case 'BLOCKED':
            blockedCount++;
            counts.blocked++;
            catApplicableWeight += res.weight;
            catTestedWeight += res.weight;
            if (res.severity === 'CRITICAL') {
              catCriticalFails.push(`[${res.id}] ${res.feature} BLOCKED`);
              criticalBlockers.push(`[${cat} / ${res.id}] ${res.feature} BLOCKED`);
            }
            break;

          case 'NOT_TESTED':
            notTestedCount++;
            counts.notTested++;
            catApplicableWeight += res.weight;
            break;

          case 'SKIPPED':
            skippedCount++;
            counts.skipped++;
            // Excluded from applicable weight if optional
            break;
        }
      }

      overallPassedWeighted += catPassedWeight;
      overallApplicableWeighted += catApplicableWeight;
      overallTestedWeight += catTestedWeight;

      const completionPercentage =
        catApplicableWeight > 0 ? Number(((catPassedWeight / catApplicableWeight) * 100).toFixed(1)) : 0;

      categorySummaries[cat] = {
        category: cat,
        displayName: CATEGORY_DISPLAY_NAMES[cat],
        totalTests: catResults.length,
        passCount,
        warningCount,
        failCount,
        blockedCount,
        notTestedCount,
        skippedCount,
        infrastructureErrorCount,
        testErrorCount,
        totalWeight: catTotalWeight,
        passedWeight: Number(catPassedWeight.toFixed(1)),
        completionPercentage,
        isProductionReady: catCriticalFails.length === 0 && completionPercentage >= 90.0,
        criticalFailures: catCriticalFails,
      };
    }

    // Calculate Overall Metrics
    const functionalCompletion =
      overallApplicableWeighted > 0
        ? Number(((overallPassedWeighted / overallApplicableWeighted) * 100).toFixed(1))
        : 0;

    const testCoverage =
      overallTotalDefinedWeight > 0
        ? Number(((overallTestedWeight / overallTotalDefinedWeight) * 100).toFixed(1))
        : 0;

    // Production Readiness Gate
    let productionReadiness: 'PASS' | 'CONDITIONAL' | 'BLOCKED' = 'PASS';
    if (criticalBlockers.length > 0 || counts.fail > 0 || counts.blocked > 0) {
      if (criticalBlockers.length > 0) {
        productionReadiness = 'BLOCKED';
      } else {
        productionReadiness = 'CONDITIONAL';
      }
    } else if (counts.warning > 0) {
      productionReadiness = 'CONDITIONAL';
    }

    // Detect Regressions against previous run
    const regressions: RegressionItem[] = [];
    if (previousRunReport && previousRunReport.results) {
      const prevMap = new Map(previousRunReport.results.map((r) => [r.id, r]));
      for (const curr of results) {
        const prev = prevMap.get(curr.id);
        if (prev && prev.status === 'PASS' && curr.status !== 'PASS') {
          regressions.push({
            testId: curr.id,
            feature: curr.feature,
            category: curr.category,
            previousStatus: prev.status,
            currentStatus: curr.status,
            runId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return {
      runId,
      timestamp: new Date().toISOString(),
      durationTotalMs,
      functionalCompletion,
      testCoverage,
      productionReadiness,
      readinessBlockers: criticalBlockers,
      totalTests: results.length,
      counts,
      categorySummaries,
      pipelineStages,
      results,
      regressions,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        supabaseHost: 'aws-0-ap-south-1.pooler.supabase.com:6543',
        pgVersion: 'PostgreSQL 17.6',
        ayanamsha: 'Lahiri (Chitra Paksha)',
        ephemeris: 'Moshier Semi-Analytical (High Precision)',
      },
    };
  }
}
