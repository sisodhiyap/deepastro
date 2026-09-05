/**
 * DeepAstro System Verification & Audit Types
 * Central type definitions for empirical test execution, scoring, and telemetry.
 */

export type TestStatus =
  | 'PASS'
  | 'FAIL'
  | 'BLOCKED'
  | 'WARNING'
  | 'NOT_TESTED'
  | 'SKIPPED'
  | 'INFRASTRUCTURE_ERROR'
  | 'TEST_ERROR'
  | 'CAPABILITY_FAILURE';
export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type TestCategory =
  | 'AUTH'
  | 'WORKSPACE'
  | 'BIRTH'
  | 'ASTROLOGY'
  | 'VERIFICATION'
  | 'JYOTISH_RULES'
  | 'PANCHANG'
  | 'NUMEROLOGY'
  | 'REPORTS'
  | 'PDF'
  | 'AI'
  | 'AI_HIERARCHY'
  | 'RAG'
  | 'FACT_CHECK'
  | 'SAFETY'
  | 'PALMISTRY'
  | 'DATABASE'
  | 'SECURITY'
  | 'FRONTEND'
  | 'ERROR_HANDLING'
  | 'PERFORMANCE';

export interface TestExecutionResult {
  status: TestStatus;
  evidence: Record<string, any> | string;
  error?: string;
  warningNote?: string;
  metrics?: Record<string, number>;
}

export interface SystemTestCase {
  id: string;
  category: TestCategory;
  feature: string;
  severity: Severity;
  weight: number; // 1 (minor) to 10 (critical)
  isOptional?: boolean;
  execute: () => Promise<TestExecutionResult>;
}

export interface SystemTestResult {
  id: string;
  category: TestCategory;
  feature: string;
  severity: Severity;
  status: TestStatus;
  weight: number;
  durationMs: number;
  evidence: Record<string, any> | string;
  error?: string;
  warningNote?: string;
  metrics?: Record<string, number>;
  timestamp: string;
}

export interface CategorySummary {
  category: TestCategory;
  displayName: string;
  totalTests: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockedCount: number;
  notTestedCount: number;
  skippedCount: number;
  infrastructureErrorCount: number;
  testErrorCount: number;
  totalWeight: number;
  passedWeight: number;
  completionPercentage: number;
  isProductionReady: boolean;
  criticalFailures: string[];
}

export interface PipelineStageVerification {
  id: string;
  name: string;
  stageNumber: number;
  status: 'VERIFIED' | 'FAILED' | 'WARNING' | 'NOT_RUN';
  durationMs: number;
  evidence: string;
}

export interface RegressionItem {
  testId: string;
  feature: string;
  category: TestCategory;
  previousStatus: TestStatus;
  currentStatus: TestStatus;
  runId: string;
  timestamp: string;
}

export interface VerificationRunReport {
  runId: string;
  timestamp: string;
  durationTotalMs: number;
  functionalCompletion: number; // 0 - 100%
  testCoverage: number; // 0 - 100%
  productionReadiness: 'PASS' | 'CONDITIONAL' | 'BLOCKED';
  readinessBlockers: string[];
  totalTests: number;
  counts: {
    pass: number;
    warning: number;
    fail: number;
    blocked: number;
    notTested: number;
    skipped: number;
    infrastructureError: number;
    testError: number;
  };
  categorySummaries: Record<TestCategory, CategorySummary>;
  pipelineStages: PipelineStageVerification[];
  results: SystemTestResult[];
  regressions: RegressionItem[];
  environment: {
    nodeEnv: string;
    supabaseHost: string;
    pgVersion: string;
    ayanamsha: string;
    ephemeris: string;
  };
}

export interface VerificationRunHistoryEntry {
  runId: string;
  timestamp: string;
  functionalCompletion: number;
  testCoverage: number;
  productionReadiness: string;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockedCount: number;
  deltaCompletion?: number;
}
