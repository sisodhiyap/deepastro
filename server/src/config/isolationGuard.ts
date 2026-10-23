/**
 * DeepAstro Centralized Database & Environment Isolation Guard
 * 
 * Strict fail-closed policy engine ensuring preview, development, and test
 * environments cannot connect to or mutate production databases, Supabase projects,
 * or persistent customer data.
 */

export type DeploymentEnvironment = 'production' | 'preview' | 'development' | 'test' | 'unknown';
export type DatabaseIsolationMode = 'production' | 'isolated-staging' | 'mock' | 'blocked';

export interface EnvironmentSignals {
  VERCEL_ENV?: string;
  NODE_ENV?: string;
  DEEPASTRO_ENV?: string;
  DATABASE_URL?: string;
  SUPABASE_DATABASE_URL?: string;
  SUPABASE_URL?: string;
  STAGING_DATABASE_URL?: string;
  STAGING_SUPABASE_URL?: string;
  FORCE_MOCK_DB?: string;
  ALLOW_LOCAL_MOCK_DB?: string;
  [key: string]: string | undefined;
}

export interface IsolationPolicyResult {
  environment: DeploymentEnvironment;
  mode: DatabaseIsolationMode;
  isAllowed: boolean;
  canExecuteWrites: boolean;
  canExecuteMigrations: boolean;
  isMock: boolean;
  reason: string;
}

// Known production project identifiers (secondary deny-list)
const PRODUCTION_SUPABASE_PROJECT_REF = 'bytufynvpwqhphoirxfo';
const PRODUCTION_HOST_KEYWORDS = ['bytufynvpwqhphoirxfo', 'deepastro.vercel.app'];

/**
 * Pure helper to classify deployment environment from explicit runtime signals.
 * Fails closed to 'unknown' if signals conflict.
 */
export function resolveDeploymentEnvironment(signals: EnvironmentSignals = process.env): DeploymentEnvironment {
  const vercelEnv = signals.VERCEL_ENV?.trim().toLowerCase();
  const deepastroEnv = signals.DEEPASTRO_ENV?.trim().toLowerCase();
  const nodeEnv = signals.NODE_ENV?.trim().toLowerCase();

  // Test environment takes priority when explicitly declared in test runners
  if (nodeEnv === 'test' || deepastroEnv === 'test') {
    // If someone attempts to claim test and production simultaneously, fail closed
    if (vercelEnv === 'production' || deepastroEnv === 'production') {
      return 'unknown';
    }
    return 'test';
  }

  // Vercel Preview
  if (vercelEnv === 'preview' || deepastroEnv === 'preview') {
    return 'preview';
  }

  // Development
  if (vercelEnv === 'development' || deepastroEnv === 'development' || nodeEnv === 'development') {
    if (vercelEnv === 'production' || deepastroEnv === 'production') {
      return 'unknown';
    }
    return 'development';
  }

  // Explicit Production
  if (vercelEnv === 'production' || deepastroEnv === 'production') {
    return 'production';
  }

  // In production builds where NODE_ENV is production but no Vercel/DeepAstro signal:
  if (nodeEnv === 'production' && !vercelEnv && !deepastroEnv) {
    // Treat as production only if not running local test
    return 'production';
  }

  return 'unknown';
}

/**
 * Checks if a connection string or URL targets the known production project.
 */
export function isProductionTarget(target?: string): boolean {
  if (!target || typeof target !== 'string') return false;
  const lower = target.toLowerCase();
  return PRODUCTION_HOST_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Checks if a connection string has positive verification as an isolated staging or local database.
 */
export function isVerifiedStagingTarget(target?: string, signals: EnvironmentSignals = process.env): boolean {
  if (!target || typeof target !== 'string') return false;
  
  // Must never be production
  if (isProductionTarget(target)) return false;

  const lower = target.toLowerCase();

  // Explicit match with STAGING_DATABASE_URL or STAGING_SUPABASE_URL
  if (signals.STAGING_DATABASE_URL && signals.STAGING_DATABASE_URL.trim() === target.trim()) {
    return true;
  }
  if (signals.STAGING_SUPABASE_URL && signals.STAGING_SUPABASE_URL.trim() === target.trim()) {
    return true;
  }

  // Local loopback database (Docker/local Postgres)
  if (lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('::1')) {
    return true;
  }

  // Explicit hostname marker for staging/sandbox
  if (lower.includes('staging') || lower.includes('sandbox')) {
    return true;
  }

  return false;
}

/**
 * Pure policy evaluation engine.
 * Given explicit signals and connection target, outputs the authoritative isolation policy.
 */
export function evaluateIsolationPolicy(
  target?: string,
  signals: EnvironmentSignals = process.env
): IsolationPolicyResult {
  const env = resolveDeploymentEnvironment(signals);
  const connStr = target || signals.DATABASE_URL || signals.SUPABASE_DATABASE_URL;
  const forceMock = signals.FORCE_MOCK_DB === 'true' || signals.ALLOW_LOCAL_MOCK_DB === 'true';

  // 1. Explicit Mock Mode
  if (forceMock || (!connStr && (env === 'test' || env === 'development' || env === 'preview'))) {
    return {
      environment: env,
      mode: 'mock',
      isAllowed: true,
      canExecuteWrites: true, // writes stay in-memory only
      canExecuteMigrations: false, // mock cannot run DDL migrations
      isMock: true,
      reason: 'In-memory mock adapter explicitly active. All writes isolated to ephemeral process memory.',
    };
  }

  // 2. Production Environment
  if (env === 'production') {
    // In production, we permit live connection
    return {
      environment: env,
      mode: 'production',
      isAllowed: true,
      canExecuteWrites: true,
      canExecuteMigrations: false, // automated migrations disabled in serverless; must be controlled
      isMock: false,
      reason: 'Verified production environment. Standard production connection permitted.',
    };
  }

  // 3. Non-Production Environments: Preview, Test, Development, Unknown
  // Rule A: Immediate deny if connection string targets production database
  if (connStr && isProductionTarget(connStr)) {
    return {
      environment: env,
      mode: 'blocked',
      isAllowed: false,
      canExecuteWrites: false,
      canExecuteMigrations: false,
      isMock: false,
      reason: `CRITICAL_FAIL_CLOSED: Non-production environment (${env}) attempted connection to production database (${PRODUCTION_SUPABASE_PROJECT_REF}).`,
    };
  }

  // Rule B: In preview or unknown, require positive evidence of staging target
  if (connStr && (env === 'preview' || env === 'unknown')) {
    if (isVerifiedStagingTarget(connStr, signals)) {
      return {
        environment: env,
        mode: 'isolated-staging',
        isAllowed: true,
        canExecuteWrites: true,
        canExecuteMigrations: false,
        isMock: false,
        reason: 'Verified isolated staging database target in preview environment.',
      };
    }

    // Unverified external host in preview fails closed
    return {
      environment: env,
      mode: 'blocked',
      isAllowed: false,
      canExecuteWrites: false,
      canExecuteMigrations: false,
      isMock: false,
      reason: `FAIL_CLOSED: Unverified external database target in ${env} environment. Staging identity not proven.`,
    };
  }

  // Rule C: In development or test with a non-production, verified local/staging target
  if (connStr && (env === 'development' || env === 'test')) {
    if (isVerifiedStagingTarget(connStr, signals)) {
      return {
        environment: env,
        mode: 'isolated-staging',
        isAllowed: true,
        canExecuteWrites: true,
        canExecuteMigrations: env === 'development',
        isMock: false,
        reason: `Safe local or staging target permitted in ${env} mode.`,
      };
    }

    // If an unknown external target is given in development, block writes
    return {
      environment: env,
      mode: 'blocked',
      isAllowed: false,
      canExecuteWrites: false,
      canExecuteMigrations: false,
      isMock: false,
      reason: `FAIL_CLOSED: Target database in ${env} is neither verified staging nor local loopback.`,
    };
  }

  // Rule D: Fallback for missing target in unknown environment
  return {
    environment: env,
    mode: 'mock',
    isAllowed: true,
    canExecuteWrites: true,
    canExecuteMigrations: false,
    isMock: true,
    reason: 'Defaulting to in-memory mock adapter due to absent database connection string.',
  };
}
