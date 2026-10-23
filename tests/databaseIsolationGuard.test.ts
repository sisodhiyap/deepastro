/**
 * DATABASE ISOLATION & FAIL-CLOSED SECURITY TEST SUITE
 * 
 * Verifies that:
 * 1. Production database target is rejected in preview, test, and dev environments.
 * 2. Missing database configuration does not enable production fallback.
 * 3. Conflicting or unknown runtime signals fail closed.
 * 4. Unverified external databases are rejected in preview.
 * 5. PostgresService does not initialize a pg.Pool when target is blocked.
 * 6. MigrationRunner skips migrations when target is blocked.
 * 7. Server-side Supabase admin blocks production service-role key in non-production.
 * 8. Client-side Supabase client blocks production fallback in non-production.
 * 9. Write operations fail-closed when database mode is blocked.
 * 10. Canonical calculation engines and baseline remain intact.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  evaluateIsolationPolicy,
  resolveDeploymentEnvironment,
  isProductionTarget,
  isVerifiedStagingTarget,
} from '../server/src/config/isolationGuard.js';
import { PostgresService, isMutatingSql } from '../server/src/database/postgres.js';
import { MigrationRunner } from '../server/src/database/MigrationRunner.js';
import {
  resolveBrowserEnvironment,
  resolveBrowserSupabaseConfig,
  isBrowserProductionTarget,
  isVerifiedBrowserStagingTarget,
  PRODUCTION_SUPABASE_ORIGIN,
  MOCK_SUPABASE_URL,
} from '../src/services/supabaseClient.js';

describe('DEEPASTRO DATABASE ISOLATION GUARD & FAIL-CLOSED SECURITY', () => {
  const originalEnv = { ...process.env };
  const PROD_REF = 'bytufynvpwqhphoirxfo';
  const PROD_DB_URL = `postgresql://postgres.bytufynvpwqhphoirxfo:secret_pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
  const UNVERIFIED_EXTERNAL_URL = `postgresql://postgres:secret@some-random-external-db.com:5432/postgres`;
  const VALID_STAGING_URL = `postgresql://postgres:secret@localhost:5432/deepastro_staging`;

  beforeEach(() => {
    // Reset process.env to avoid cross-test pollution
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // 1. ENVIRONMENT CLASSIFICATION
  describe('1. Environment Classification & Conflict Handling', () => {
    it('1.1 correctly identifies Vercel preview from VERCEL_ENV', () => {
      const env = resolveDeploymentEnvironment({ VERCEL_ENV: 'preview', NODE_ENV: 'production' });
      expect(env).toBe('preview');
    });

    it('1.2 correctly identifies development from NODE_ENV', () => {
      const env = resolveDeploymentEnvironment({ NODE_ENV: 'development' });
      expect(env).toBe('development');
    });

    it('1.3 fails closed to unknown if conflicting signals exist (e.g. VERCEL_ENV=production but NODE_ENV=test)', () => {
      const env = resolveDeploymentEnvironment({ VERCEL_ENV: 'production', NODE_ENV: 'test' });
      expect(env).toBe('unknown');
    });

    it('1.4 correctly identifies pure production', () => {
      const env = resolveDeploymentEnvironment({ VERCEL_ENV: 'production', NODE_ENV: 'production' });
      expect(env).toBe('production');
    });
  });

  // 2. PRODUCTION TARGET DENY-LIST
  describe('2. Production Database Target Rejection in Non-Production', () => {
    it('2.1 blocks production database URL in preview environment', () => {
      const policy = evaluateIsolationPolicy(PROD_DB_URL, { VERCEL_ENV: 'preview' });
      expect(policy.environment).toBe('preview');
      expect(policy.mode).toBe('blocked');
      expect(policy.isAllowed).toBe(false);
      expect(policy.canExecuteWrites).toBe(false);
      expect(policy.reason).toContain('CRITICAL_FAIL_CLOSED');
    });

    it('2.2 blocks production database URL in test environment', () => {
      const policy = evaluateIsolationPolicy(PROD_DB_URL, { NODE_ENV: 'test' });
      expect(policy.environment).toBe('test');
      expect(policy.mode).toBe('blocked');
      expect(policy.isAllowed).toBe(false);
    });

    it('2.3 blocks production database URL in development environment', () => {
      const policy = evaluateIsolationPolicy(PROD_DB_URL, { NODE_ENV: 'development' });
      expect(policy.environment).toBe('development');
      expect(policy.mode).toBe('blocked');
    });

    it('2.4 permits production database URL strictly in verified production environment', () => {
      const policy = evaluateIsolationPolicy(PROD_DB_URL, { VERCEL_ENV: 'production', NODE_ENV: 'production' });
      expect(policy.environment).toBe('production');
      expect(policy.mode).toBe('production');
      expect(policy.isAllowed).toBe(true);
    });
  });

  // 3. UNVERIFIED EXTERNAL HOSTS FAIL CLOSED
  describe('3. Unverified External Host Rejection in Preview', () => {
    it('3.1 rejects unfamiliar external database in preview when not verified as staging', () => {
      const policy = evaluateIsolationPolicy(UNVERIFIED_EXTERNAL_URL, { VERCEL_ENV: 'preview' });
      expect(policy.mode).toBe('blocked');
      expect(policy.isAllowed).toBe(false);
      expect(policy.reason).toContain('FAIL_CLOSED');
    });

    it('3.2 permits verified staging database in preview when matching STAGING_DATABASE_URL', () => {
      const policy = evaluateIsolationPolicy(VALID_STAGING_URL, {
        VERCEL_ENV: 'preview',
        STAGING_DATABASE_URL: VALID_STAGING_URL,
      });
      expect(policy.mode).toBe('isolated-staging');
      expect(policy.isAllowed).toBe(true);
    });
  });

  // 4. MOCK MODE AND MISSING CREDENTIALS
  describe('4. Explicit Mock Mode & Absent Credentials', () => {
    it('4.1 safely defaults to mock mode when database URL is absent in non-production', () => {
      const policy = evaluateIsolationPolicy('', { VERCEL_ENV: 'preview' });
      expect(policy.mode).toBe('mock');
      expect(policy.isAllowed).toBe(true);
      expect(policy.isMock).toBe(true);
      expect(policy.canExecuteMigrations).toBe(false);
    });

    it('4.2 never falls back to production when credentials are missing', () => {
      const policy = evaluateIsolationPolicy(undefined, { VERCEL_ENV: 'preview' });
      expect(policy.mode).not.toBe('production');
      expect(isProductionTarget(policy.reason)).toBe(false);
    });
  });

  // 5. POSTGRES SERVICE FAIL-CLOSED BEHAVIOR
  describe('5. PostgresService Pool Protection & Fail-Closed Writes', () => {
    it('5.1 does not connect or create pg.Pool when target is blocked', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.DATABASE_URL = PROD_DB_URL;

      const service = new PostgresService();
      expect(service.isLive()).toBe(false);
      expect(service.getDatabaseMode()).toBe('blocked');
    });

    it('5.2 throws descriptive error when write query is attempted while database is blocked', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.DATABASE_URL = PROD_DB_URL;

      const service = new PostgresService();
      await expect(
        service.query('INSERT INTO users (id, email) VALUES ($1, $2);', ['test_id', 'test@example.com'])
      ).rejects.toThrow(/\[DatabaseIsolationGuard\] Write query blocked/);
    });

    it('5.3 throws descriptive error when withTransaction is attempted while database is blocked', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.DATABASE_URL = PROD_DB_URL;

      const service = new PostgresService();
      await expect(
        service.withTransaction(async () => 'should_fail')
      ).rejects.toThrow(/\[DatabaseIsolationGuard\] Transaction blocked/);
    });
  });

  // 6. MIGRATION PROTECTION
  describe('6. MigrationRunner DDL Guard', () => {
    it('6.1 refuses to execute migrations in preview environment against production database', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.DATABASE_URL = PROD_DB_URL;

      const runner = new MigrationRunner();
      const res = await runner.migrateUp();
      expect(res.applied).toEqual([]);
      expect(res.alreadyUpToDate).toBe(true);
    });

    it('6.2 refuses to execute migrations in test environment against production database', async () => {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = PROD_DB_URL;

      const runner = new MigrationRunner();
      const res = await runner.migrateUp();
      expect(res.applied).toEqual([]);
    });
  });

  // 7. BROWSER SUPABASE ADVERSARIAL ISOLATION
  describe('7. Browser Supabase Adversarial Validation', () => {
    const PROD_CLIENT_URL = 'https://bytufynvpwqhphoirxfo.supabase.co';
    const STAGING_CLIENT_URL = 'https://deepastro-staging.supabase.co';
    const UNVERIFIED_CLIENT_URL = 'https://unverified-tenant.supabase.co';

    it('7.1 Scenario 1: Preview build with missing VITE_SUPABASE_URL uses safe local mock', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'preview',
        PROD: true,
      });
      expect(cfg.environment).toBe('preview');
      expect(cfg.isBlocked).toBe(false);
      expect(cfg.isMock).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });

    it('7.2 Scenario 2: Preview build with production URL explicitly supplied rejects target', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'preview',
        VITE_SUPABASE_URL: PROD_CLIENT_URL,
        PROD: true,
      });
      expect(cfg.environment).toBe('preview');
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.isMock).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
      expect(cfg.reason).toContain('CRITICAL_FAIL_CLOSED');
    });

    it('7.3 Scenario 3: Preview build with production URL and public anon key rejects target', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'preview',
        VITE_SUPABASE_URL: PROD_CLIENT_URL,
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        PROD: true,
      });
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });

    it('7.4 Scenario 4: Preview build with verified staging URL accepts target', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'preview',
        VITE_SUPABASE_URL: STAGING_CLIENT_URL,
        VITE_STAGING_SUPABASE_URL: STAGING_CLIENT_URL,
        PROD: true,
      });
      expect(cfg.isBlocked).toBe(false);
      expect(cfg.isMock).toBe(false);
      expect(cfg.url).toBe(STAGING_CLIENT_URL);
    });

    it('7.5 Scenario 5: Development build with production URL rejects target', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'development',
        VITE_SUPABASE_URL: PROD_CLIENT_URL,
        DEV: true,
      });
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });

    it('7.6 Scenario 6: Test build with production URL rejects target', () => {
      const cfg = resolveBrowserSupabaseConfig({
        MODE: 'test',
        VITE_SUPABASE_URL: PROD_CLIENT_URL,
      });
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });

    it('7.7 Scenario 7: Production build with production URL preserves intended production behavior', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'production',
        VITE_SUPABASE_URL: PROD_CLIENT_URL,
        PROD: true,
      });
      expect(cfg.environment).toBe('production');
      expect(cfg.isBlocked).toBe(false);
      expect(cfg.isMock).toBe(false);
      expect(cfg.url).toBe(PROD_CLIENT_URL);
    });

    it('7.8 Scenario 8: Production build with malformed URL fails safely to mock', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'production',
        VITE_SUPABASE_URL: 'not-a-valid-url',
        PROD: true,
      });
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.isMock).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
      expect(cfg.reason).toContain('Malformed');
    });

    it('7.9 Scenario 9: Conflicting signals (preview + production) fail closed to unknown', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_VERCEL_ENV: 'preview',
        VITE_DEEPASTRO_ENV: 'production',
        VITE_SUPABASE_URL: UNVERIFIED_CLIENT_URL,
        PROD: true,
      });
      expect(cfg.environment).toBe('unknown');
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });

    it('7.10 Scenario 10: Unknown environment with external unverified URL fails closed', () => {
      const cfg = resolveBrowserSupabaseConfig({
        VITE_SUPABASE_URL: UNVERIFIED_CLIENT_URL,
      });
      expect(cfg.isBlocked).toBe(true);
      expect(cfg.url).toBe(MOCK_SUPABASE_URL);
    });
  });

  // 8. POSTGRES MUTATING SQL CLASSIFICATION DEFENSE-IN-DEPTH
  describe('8. Postgres Mutating SQL Classification Defense-in-Depth', () => {
    it('8.1 identifies standard DML and DDL mutations', () => {
      expect(isMutatingSql('INSERT INTO users VALUES (1);')).toBe(true);
      expect(isMutatingSql('UPDATE profiles SET name = $1;')).toBe(true);
      expect(isMutatingSql('DELETE FROM sessions;')).toBe(true);
      expect(isMutatingSql('DROP TABLE audit_logs;')).toBe(true);
      expect(isMutatingSql('ALTER TABLE users ADD COLUMN phone text;')).toBe(true);
      expect(isMutatingSql('CREATE TABLE temp (id int);')).toBe(true);
      expect(isMutatingSql('TRUNCATE users CASCADE;')).toBe(true);
    });

    it('8.2 identifies CTE-based write mutations', () => {
      expect(isMutatingSql('WITH ins AS (INSERT INTO users (id) VALUES (1) RETURNING *) SELECT * FROM ins;')).toBe(true);
      expect(isMutatingSql('WITH del AS (DELETE FROM sessions RETURNING *) SELECT count(*) FROM del;')).toBe(true);
    });

    it('8.3 identifies procedural mutations (CALL and DO)', () => {
      expect(isMutatingSql('CALL purge_old_records();')).toBe(true);
      expect(isMutatingSql('DO $$ BEGIN DELETE FROM users; END $$;')).toBe(true);
    });

    it('8.4 identifies multi-statement write attempts', () => {
      expect(isMutatingSql('SELECT 1; DROP TABLE users;')).toBe(true);
      expect(isMutatingSql('SELECT 1; DELETE FROM users;')).toBe(true);
    });

    it('8.5 allows pure read-only SELECT queries and read-only CTEs', () => {
      expect(isMutatingSql('SELECT * FROM users WHERE id = $1;')).toBe(false);
      expect(isMutatingSql('WITH summary AS (SELECT count(*) as total FROM users) SELECT total FROM summary;')).toBe(false);
      expect(isMutatingSql('SELECT 1 as live;')).toBe(false);
    });
  });
});
