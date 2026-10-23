/**
 * DeepAstro Client Supabase Integration
 * Handles browser-side session lifecycle, Google OAuth redirects, and token management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type BrowserEnvironment = 'production' | 'preview' | 'development' | 'test' | 'unknown';

export interface BrowserEnvSignals {
  MODE?: string;
  PROD?: boolean;
  DEV?: boolean;
  VITE_VERCEL_ENV?: string;
  VITE_DEEPASTRO_ENV?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_STAGING_SUPABASE_URL?: string;
  [key: string]: any;
}

export const PRODUCTION_SUPABASE_REF = 'bytufynvpwqhphoirxfo';
export const PRODUCTION_SUPABASE_ORIGIN = `https://${PRODUCTION_SUPABASE_REF}.supabase.co`;
export const MOCK_SUPABASE_URL = 'http://127.0.0.1:54321';
export const MOCK_ANON_KEY = 'placeholder-anon-key-isolated-preview';

/**
 * Pure environment classifier for the browser runtime.
 * Evaluates multiple signals to prevent single-signal ambiguity or falsification.
 */
export function resolveBrowserEnvironment(signals: BrowserEnvSignals): BrowserEnvironment {
  const vercelEnv = signals.VITE_VERCEL_ENV?.trim().toLowerCase();
  const appEnv = signals.VITE_DEEPASTRO_ENV?.trim().toLowerCase();
  const mode = signals.MODE?.trim().toLowerCase();
  const isProd = Boolean(signals.PROD);

  // Conflicting signals check
  if ((mode === 'test' || appEnv === 'test') && (vercelEnv === 'production' || appEnv === 'production')) {
    return 'unknown';
  }
  if (vercelEnv === 'preview' && appEnv === 'production') {
    return 'unknown';
  }

  // Test mode
  if (mode === 'test' || appEnv === 'test') {
    return 'test';
  }

  // Preview mode: Vercel preview takes precedence over PROD boolean
  // because in Vite builds, import.meta.env.PROD is always true for both preview and production!
  if (vercelEnv === 'preview' || appEnv === 'preview') {
    return 'preview';
  }

  // Development
  if (vercelEnv === 'development' || appEnv === 'development' || mode === 'development' || signals.DEV) {
    return 'development';
  }

  // Production requires unequivocal production signal AND PROD flag
  if ((vercelEnv === 'production' || appEnv === 'production') && isProd && mode !== 'test') {
    return 'production';
  }

  // If Vite PROD is true but no Vercel/DeepAstro production signal is present,
  // it is an unclassified or ambiguous build -> fail closed to unknown!
  return 'unknown';
}

/**
 * Checks if a target URL references the production Supabase project.
 */
export function isBrowserProductionTarget(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.toLowerCase().includes(PRODUCTION_SUPABASE_REF);
}

/**
 * Positive verification check for staging/sandbox/local URLs in non-production.
 */
export function isVerifiedBrowserStagingTarget(url?: string, signals: BrowserEnvSignals = {}): boolean {
  if (!url || typeof url !== 'string') return false;
  if (isBrowserProductionTarget(url)) return false;

  const lower = url.trim().toLowerCase();

  // Explicit match with designated staging env
  if (signals.VITE_STAGING_SUPABASE_URL && signals.VITE_STAGING_SUPABASE_URL.trim() === url.trim()) {
    return true;
  }

  // Local loopback
  if (lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('::1')) {
    return true;
  }

  // Explicit staging/sandbox marker in host
  if (lower.includes('staging') || lower.includes('sandbox')) {
    return true;
  }

  return false;
}

export interface ResolvedBrowserConfig {
  url: string;
  anonKey: string;
  environment: BrowserEnvironment;
  isBlocked: boolean;
  isMock: boolean;
  reason: string;
}

/**
 * Resolves browser Supabase configuration fail-closed.
 */
export function resolveBrowserSupabaseConfig(signals: BrowserEnvSignals): ResolvedBrowserConfig {
  const env = resolveBrowserEnvironment(signals);
  const configuredUrl = signals.VITE_SUPABASE_URL?.trim();
  const configuredKey = signals.VITE_SUPABASE_ANON_KEY?.trim();

  // 1. Production environment
  if (env === 'production') {
    if (!configuredUrl) {
      return {
        url: PRODUCTION_SUPABASE_ORIGIN,
        anonKey: configuredKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dHVmeW52cHdxaHBob2lyeGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1Nzc0MTMsImV4cCI6MjEwNDE1MzQxM30.7vn8Hln86t9_7npmFArUbSFDqNKYtBecp1Jv-gCl9fg',
        environment: env,
        isBlocked: false,
        isMock: false,
        reason: 'Explicit production environment active with canonical target.',
      };
    }

    try {
      new URL(configuredUrl);
    } catch {
      return {
        url: MOCK_SUPABASE_URL,
        anonKey: MOCK_ANON_KEY,
        environment: env,
        isBlocked: true,
        isMock: true,
        reason: 'Malformed VITE_SUPABASE_URL in production environment.',
      };
    }

    return {
      url: configuredUrl,
      anonKey: configuredKey || MOCK_ANON_KEY,
      environment: env,
      isBlocked: false,
      isMock: false,
      reason: 'Production environment with valid configured target.',
    };
  }

  // 2. Non-Production (preview, development, test, unknown)
  // Check A: Production URL explicitly supplied in non-production
  if (configuredUrl && isBrowserProductionTarget(configuredUrl)) {
    return {
      url: MOCK_SUPABASE_URL,
      anonKey: MOCK_ANON_KEY,
      environment: env,
      isBlocked: true,
      isMock: true,
      reason: `CRITICAL_FAIL_CLOSED: Non-production browser environment (${env}) rejected production Supabase target.`,
    };
  }

  // Check B: Missing URL in non-production
  if (!configuredUrl) {
    return {
      url: MOCK_SUPABASE_URL,
      anonKey: MOCK_ANON_KEY,
      environment: env,
      isBlocked: false,
      isMock: true,
      reason: `Non-production environment (${env}) without VITE_SUPABASE_URL; using local mock client.`,
    };
  }

  // Check C: Staging verification required for external URLs in non-production
  if (isVerifiedBrowserStagingTarget(configuredUrl, signals)) {
    return {
      url: configuredUrl,
      anonKey: configuredKey || MOCK_ANON_KEY,
      environment: env,
      isBlocked: false,
      isMock: false,
      reason: `Verified staging target allowed in ${env} environment.`,
    };
  }

  // Check D: Unverified external URL in non-production fails closed
  return {
    url: MOCK_SUPABASE_URL,
    anonKey: MOCK_ANON_KEY,
    environment: env,
    isBlocked: true,
    isMock: true,
    reason: `CRITICAL_FAIL_CLOSED: Non-production environment (${env}) rejected unverified external Supabase target.`,
  };
}

// Runtime resolution using Vite import.meta.env
const runtimeEnv: BrowserEnvSignals = {
  MODE: (import.meta as any).env?.MODE,
  PROD: (import.meta as any).env?.PROD,
  DEV: (import.meta as any).env?.DEV,
  VITE_VERCEL_ENV: (import.meta as any).env?.VITE_VERCEL_ENV,
  VITE_DEEPASTRO_ENV: (import.meta as any).env?.VITE_DEEPASTRO_ENV,
  VITE_SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
  VITE_STAGING_SUPABASE_URL: (import.meta as any).env?.VITE_STAGING_SUPABASE_URL,
};

const resolvedConfig = resolveBrowserSupabaseConfig(runtimeEnv);

if (resolvedConfig.isBlocked) {
  console.warn(JSON.stringify({
    event: 'BROWSER_SUPABASE_ISOLATION_ENFORCED',
    environment: resolvedConfig.environment,
    reason: resolvedConfig.reason,
    timestamp: new Date().toISOString(),
  }));
}

export const supabase: SupabaseClient = createClient(resolvedConfig.url, resolvedConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
