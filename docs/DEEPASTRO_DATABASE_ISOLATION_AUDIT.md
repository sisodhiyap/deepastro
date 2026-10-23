# DEEPASTRO — DATABASE ISOLATION AUDIT REPORT
**Phase D: Read-Only Investigation, Safe Isolation Design & Local Verification**

- **Date & Timestamp:** 2026-10-23T23:18:00+05:30
- **Auditor Role:** Senior Full-Stack Engineer, Incident Investigator & Database Security Auditor
- **Repository:** `https://github.com/sisodhiyap/deepastro`
- **Certified Baseline Commit:** `960a5f2542825711b6d9ca205240f8c27dc81ba5`
- **Certified Tag:** `deepastro-future-intelligence-v1-certified`
- **Active Branch:** `fix/production-module-data-recovery`
- **Expected Repair Commit:** `13854e224fe0ce3278deb03654b768bee6f71ec2`
- **Target Production URL:** `https://deepastro.vercel.app`
- **Execution Mode:** Read-Only Static Investigation & Local-Only In-Memory Verification

---

## 1. Executive Summary

A comprehensive source-level investigation was conducted across the DeepAstro codebase, serverless routing layer, database client architectures, and deployment configurations to evaluate preview data isolation.

### Key Audit Findings:
1. **Critical Isolation Finding:** In Vercel Project Settings, `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are currently configured for `['production', 'preview', 'development']` pointing to the live production database.
2. **PostgreSQL Client Behavior:** In `server/src/database/postgres.ts`, `PostgresService` prioritizes `DATABASE_URL`. If a reachable connection string is provided, it connects live to PostgreSQL. It only falls back to `InMemoryFallbackClient` if the connection fails (e.g. `ENOTFOUND` / `ECONNREFUSED`). Therefore, any Vercel preview deployment will connect directly to the production database and execute live writes!
3. **Client-Side Hardcoded Fallback:** In `src/services/supabaseClient.ts`, if `VITE_SUPABASE_URL` is not provided, the browser client falls back to the hardcoded production Supabase project (`https://bytufynvpwqhphoirxfo.supabase.co`).
4. **Reachable Write Paths:** The application has five active server endpoints that execute live SQL `INSERT` and `UPDATE` statements when connected: user registration (`/api/auth/register`), birth profile saving (`/api/auth/birth-profile`), future forecast generation (`/api/future-intelligence/generate`), PDF report generation (`/api/reports/generate`), and calculation snapshots (`/api/astrology/calculate-canonical`).
5. **Gate Verdict:** **`BLOCKED_ISOLATION_NOT_PROVEN`**. Write-capable preview testing against the current Vercel preview configuration is unsafe and must remain blocked until an explicit fail-closed isolation guard or a dedicated staging database is configured.

---

## 2. Repository and Certified Baseline Verification

| Check | Expected | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| **Top-Level Directory** | DeepAstro clone | `C:/D drive/New projects/Deepastro` | **PASS** |
| **Active Branch** | `fix/production-module-data-recovery` | `fix/production-module-data-recovery` | **PASS** |
| **HEAD Commit SHA** | `13854e224fe0ce3278deb03654b768bee6f71ec2` | `13854e224fe0ce3278deb03654b768bee6f71ec2` | **PASS** |
| **Certified Tag** | `deepastro-future-intelligence-v1-certified` | Resolves to `960a5f2542825711b6d9ca205240f8c27dc81ba5` | **PASS** |
| **Ancestry Check** | Certified commit is ancestor of HEAD | `git merge-base --is-ancestor` exit code `0` | **PASS** |
| **Working Tree** | Clean tracked files | Only untracked audit documents from previous phase | **PASS** |

---

## 3. Database Connection Inventory

| Client / Module | Source File & Symbol | Runtime | Configuration Variables (Names Only) | Access Capability | Data Categories | Isolation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Pool Client** | `server/src/database/postgres.ts`<br>`PostgresService` / `dbClient` | Node.js Server / Serverless Lambda | `DATABASE_URL`<br>`SUPABASE_DATABASE_URL` | Read/Write (Direct SQL pool via `pg.Pool`) | Users, birth profiles, calculations, forecasts, reports, migrations | **UNSAFE IN PREVIEW** *(Shared production connection string)* |
| **In-Memory Fallback Client** | `server/src/database/postgres.ts`<br>`InMemoryFallbackClient` | Node.js Server / Serverless Lambda | None (In-memory `Map` data structures) | Local Memory Read/Write | Temporary session records (cleared on restart) | **SAFE** *(Isolated to memory)* |
| **Server Supabase Admin** | `server/src/database/supabaseServer.ts`<br>`supabaseAdmin` | Node.js Server / Serverless Lambda | `SUPABASE_URL`<br>`SUPABASE_SERVICE_ROLE_KEY` | Admin / Elevated Service Role (`auth.admin`) | User authentication, identity deletion | **UNSAFE IN PREVIEW** *(Full admin access to production auth)* |
| **Browser Supabase Client** | `src/services/supabaseClient.ts`<br>`supabase` | Browser Client (SPA) | `VITE_SUPABASE_URL`<br>`VITE_SUPABASE_ANON_KEY`<br>*(Hardcoded fallback in code)* | Public Anonymous / RLS | User sessions, OAuth redirects, tokens | **UNSAFE IN PREVIEW** *(Points to production Supabase project)* |
| **In-Memory State Store** | `server/src/database/db.ts`<br>`db` | Node.js Server / Serverless Lambda | None | In-Memory Read/Write | Subscriptions, entitlements, user memories, consultations | **SAFE** *(Process-isolated)* |

---

## 4. Route-to-Write and External Side-Effect Map

| API Route | Method | Source File | Storage Dependency | Possible Side Effects | Safe Preview Testing Strategy |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | `server/src/routes/authRoutes.ts` | `UserRepository` -> `dbClient` | Inserts row into production `users` table | Force mock mode or test accounts in staging |
| `/api/auth/birth-profile` | `POST` | `server/src/routes/authRoutes.ts` | `BirthProfileRepository` -> `dbClient` | Inserts/updates row in production `birth_profiles` table | Use temporary guest sessions or isolated staging DB |
| `/api/auth/account` | `DELETE` | `server/src/routes/authRoutes.ts` | `supabaseAdmin.auth.admin.deleteUser` | Permanently deletes user from production Supabase Auth | Prohibit in preview unless staging auth is isolated |
| `/api/future-intelligence/generate` | `POST` | `server/src/routes/futureIntelligenceRoutes.ts` | `FutureIntelligenceRepository` -> `dbClient` | Inserts into `saved_charts`, `future_forecasts`, `future_forecast_years`, `future_forecast_windows` | Mock mode fallback or dedicated staging DB |
| `/api/reports/generate` | `POST` | `server/src/routes/reportRoutes.ts` | `ReportRepository` -> `dbClient` + `ArtifactStorage` | Inserts into `reports`, `report_versions`, `report_pipeline_stages`; writes PDF to temp/artifact storage | Use `/tmp/` local storage; block production DB writes |
| `/api/astrology/calculate-canonical` | `POST` | `server/src/routes/astrologyRoutes.ts` | `CalculationSnapshotService` -> `dbClient` | Inserts snapshot row into `calculation_snapshots` table | Mock mode fallback |
| `/api/subscription/upgrade` | `POST` | `server/src/routes/subscriptionRoutes.ts` | In-memory `db` (`db.subscriptions`) | In-memory only (zero database or Stripe side effects) | Fully safe to test in preview |
| `/api/astrology/predictions/domains` | `POST` | `server/src/routes/astrologyRoutes.ts` | Pure computational engine | Read-only calculation (zero database writes) | Fully safe to test in preview |
| `/api/astrology/panchang` | `GET` | `server/src/routes/astrologyRoutes.ts` | Pure computational engine | Read-only calculation (zero database writes) | Fully safe to test in preview |
| `/api/astrology/muhurat` | `GET` | `server/src/routes/astrologyRoutes.ts` | Pure computational engine | Read-only calculation (zero database writes) | Fully safe to test in preview |
| `/api/numerology/analyze` | `POST` | `server/src/routes/numerologyRoutes.ts` | Pure computational engine | Read-only calculation (zero database writes) | Fully safe to test in preview |
| `/api/palmistry/analyze` | `POST` | `server/src/routes/palmistryRoutes.ts` | Local vision analyzer / temp upload | Temp file written to `/tmp/`, unlinked after analysis | Safe (zero database writes) |

---

## 5. Existing Mock and Test Isolation Assessment

1. **Can the test runner initialize a database client using production environment variables?**  
   `VERIFIED_UNSAFE`. `PostgresService.initPool()` inspects `process.env.DATABASE_URL`. If a reachable connection string is provided, it connects.
2. **Can browser code connect directly to a real Supabase project?**  
   `VERIFIED_UNSAFE`. `src/services/supabaseClient.ts` contains hardcoded production project fallback URLs (`bytufynvpwqhphoirxfo.supabase.co`).
3. **Does the server fall back to a real database if mock initialization fails?**  
   `VERIFIED_UNSAFE`. The server attempts real database connection first, only falling back to in-memory mock if the connection times out or fails with network errors.
4. **Can tests silently fall back from mocked storage to a real connection?**  
   `VERIFIED_UNSAFE`. If a test process has a valid live connection string, it runs live queries without warning.
5. **Are test fixtures or test profiles stored in a shared database?**  
   `VERIFIED_UNSAFE` in live mode; `VERIFIED_SAFE` in local in-memory mode.
6. **Are write operations guarded by an explicit environment or adapter boundary?**  
   `VERIFIED_UNSAFE`. Repositories execute SQL queries unconditionally whenever `client.isLive()` is true.
7. **Do payment, webhook, upload, and background-job handlers have independent safeguards?**  
   `VERIFIED_SAFE` for subscriptions (in-memory only); `VERIFIED_UNSAFE` for server startup migrations (`MigrationRunner.migrateUp()` runs automatically on `app.listen()` when not in `test` or `VERCEL`).
8. **Are failed or missing environment variables handled safely?**  
   `VERIFIED_SAFE`. When `DATABASE_URL` is omitted, the application falls back gracefully to `InMemoryFallbackClient`.
9. **Can a preview use production credentials indirectly through shared server configuration?**  
   `VERIFIED_UNSAFE`. Vercel environment variable settings share `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` across `production` and `preview`.
10. **Are there any unguarded code paths that can write to shared persistent storage?**  
    `VERIFIED_UNSAFE`. 5 core routes write to PostgreSQL when connected.

---

## 6. Production-Data Exposure Risks

1. **Test Data Pollution:** A tester in preview registering an account or creating a birth profile will insert test records into the production PostgreSQL database.
2. **Data Overwrite via ON CONFLICT:** In `BirthProfileRepository.ts` and `FutureIntelligenceRepository.ts`, `saveProfile` and `saveSavedChart` use `ON CONFLICT (id) DO UPDATE SET`. If a test collides with or uses an existing ID, it will overwrite production data.
3. **Account Deletion:** `DELETE /api/auth/account` invokes `supabaseAdmin.auth.admin.deleteUser(userId)`. If an authenticated user ID from production is submitted in preview, it deletes the user from production auth.
4. **Automatic Migration Execution:** Starting a local or non-Vercel server with production `DATABASE_URL` executes `MigrationRunner.migrateUp()` on startup, altering live schema tables.

---

## 7. Recommended Isolation Architecture

The safest architectural strategy is a **Two-Tiered Defense-in-Depth Isolation Model**:

### Tier 1: Fail-Closed Preview Isolation Guard (Code-Level Protection)
The server inspects `process.env.VERCEL_ENV` and `process.env.NODE_ENV`. If running in `preview` or `test`:
- It explicitly rejects connections to known production database hosts (e.g. `bytufynvpwqhphoirxfo`).
- If `STAGING_DATABASE_URL` is not provided, it forces `InMemoryFallbackClient` so all preview writes exist only in ephemeral serverless memory.
- `supabaseAdmin` disables service-role mutation operations in non-production environments.

### Tier 2: Dedicated Staging Supabase / PostgreSQL Project (Infra-Level Protection)
- Create a dedicated staging project on Supabase (`deepastro-staging`).
- In Vercel Project Settings, re-scope `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` so that `preview` points exclusively to `deepastro-staging`.
- Ensure production environment variables target strictly `['production']`.

---

## 8. Proposed Fail-Closed Guard Design

### Guard Logic Specification:
```ts
// Centralized Isolation Guard: server/src/config/isolationGuard.ts
export function verifyDatabaseIsolation(connectionString: string | undefined): {
  isSafe: boolean;
  mode: 'postgres' | 'in-memory' | 'blocked';
  reason: string;
} {
  const isVercelPreview = process.env.VERCEL_ENV === 'preview';
  const isTest = process.env.NODE_ENV === 'test';
  const isProductionRef = connectionString?.includes('bytufynvpwqhphoirxfo');

  if ((isVercelPreview || isTest) && isProductionRef) {
    console.error('[CRITICAL_ISOLATION_GUARD] Production database connection blocked in preview/test environment.');
    return {
      isSafe: false,
      mode: 'blocked',
      reason: 'Attempted to connect to production database from non-production environment.',
    };
  }

  return {
    isSafe: true,
    mode: connectionString ? 'postgres' : 'in-memory',
    reason: 'Verified safe isolation environment.',
  };
}
```

If `mode === 'blocked'`, `PostgresService` refuses to initialize `pg.Pool` and forces `InMemoryFallbackClient`.

---

## 9. Required Code Changes (Plan Only — Zero Code Modified in This Phase)

1. **`server/src/config/isolationGuard.ts`** *(New file)*: Implement `verifyDatabaseIsolation()` helper with production fingerprint detection and fail-closed logic.
2. **`server/src/database/postgres.ts`**: Update `initPool()` to run `verifyDatabaseIsolation()` before instantiating `new Pool()`. If non-isolated, deactivate live pool and log structured warning.
3. **`server/src/database/supabaseServer.ts`**: Block `supabaseAdmin` from instantiating production service-role client when `process.env.VERCEL_ENV === 'preview'`.
4. **`src/services/supabaseClient.ts`**: Replace hardcoded production fallback keys with neutral mock values during preview builds.
5. **`tests/databaseIsolationGuard.test.ts`** *(New file)*: Add unit tests verifying that production connection strings are rejected in preview mode and fail-closed to in-memory mock.

---

## 10. Safe Local Checks Executed

1. `git rev-parse --show-toplevel` -> `C:/D drive/New projects/Deepastro` (Exit code `0`).
2. `git branch --show-current` -> `fix/production-module-data-recovery` (Exit code `0`).
3. `git rev-parse HEAD` -> `13854e224fe0ce3278deb03654b768bee6f71ec2` (Exit code `0`).
4. `git rev-parse 'deepastro-future-intelligence-v1-certified^{commit}'` -> `960a5f2542825711b6d9ca205240f8c27dc81ba5` (Exit code `0`).
5. `git merge-base --is-ancestor 960a5f2... 13854e2...` -> Exit code `0` (Ancestry confirmed).
6. `git status --short` -> Clean tracked files (Exit code `0`).
7. `npx vitest run tests/productionSevenModulesRepair.test.ts` -> 13/13 tests passed in local in-memory fallback mode (Exit code `0`).
8. Static AST and grep searches across all database client modules, repositories, and server routes.

---

## 11. Checks Deliberately Not Executed

1. **No Live Database Mutations:** No SQL queries (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`) were run against any external database.
2. **No Remote Push or Vercel Deployments:** No git pushes or Vercel preview/production deployments were triggered.
3. **No Database Migration Execution:** `MigrationRunner.migrateUp()` was not executed against live PostgreSQL.
4. **No Environment Variable Edits:** No changes were made to Vercel project environment variables.
5. **No Code Modification:** Application source files were left 100% unaltered.

---

## 12. Proposed Isolation Test Matrix (For Future Implementation)

| Test Case | Condition | Expected Behavior |
| :--- | :--- | :--- |
| **TC-ISO-1** | `VERCEL_ENV=preview` + Production `DATABASE_URL` | Live connection refused; forces `InMemoryFallbackClient` |
| **TC-ISO-2** | `VERCEL_ENV=preview` + `STRICT_ISOLATION=true` | Throws `FAIL_CLOSED_ISOLATION` exception on server startup |
| **TC-ISO-3** | `VERCEL_ENV=preview` + Staging `DATABASE_URL` | Allows staging PostgreSQL connection pool |
| **TC-ISO-4** | `VERCEL_ENV=preview` + Empty `DATABASE_URL` | Activates `InMemoryFallbackClient` safely |
| **TC-ISO-5** | Direct `POST /api/auth/register` in preview mock mode | Writes to in-memory map; zero records inserted into remote DB |
| **TC-ISO-6** | Direct `POST /api/future-intelligence/generate` in preview mock mode | Generates valid forecast; saved to memory; remote DB untouched |
| **TC-ISO-7** | `DELETE /api/auth/account` in preview mock mode | Blocked; production `supabaseAdmin.auth.admin.deleteUser` not called |

---

## 13. Unresolved Risks and Prerequisites

1. **Vercel Project Environment Variable Re-scoping:** Production credentials (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are currently scoped to `preview` in Vercel settings. Human authorization is required to update Vercel environment targets or provide staging credentials.
2. **Staging Database Provisioning:** A dedicated, isolated Supabase/PostgreSQL instance does not yet exist for preview deployments.
3. **Fail-Closed Guard Implementation:** Code-level guards in `postgres.ts` and `supabaseServer.ts` must be implemented and verified in a separate approved phase before preview deployments are triggered.

---

## 14. Final Gate Decision

```
================================================================================
DATABASE ISOLATION GATE VERDICT: BLOCKED_ISOLATION_NOT_PROVEN
================================================================================
Rationale:
1. Static analysis proves that the application connects to DATABASE_URL if reachable.
2. Vercel environment settings currently share the production DATABASE_URL with preview.
3. Server write paths are not yet guarded by an explicit fail-closed preview check.
4. Deploying a write-capable preview under current configuration exposes production data.
================================================================================
```
