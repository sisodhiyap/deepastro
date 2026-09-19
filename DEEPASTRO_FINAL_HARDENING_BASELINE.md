# DEEPASTRO — FINAL HARDENING ARCHITECTURAL BASELINE AUDIT
**Document:** `DEEPASTRO_FINAL_HARDENING_BASELINE.md`  
**Auditor:** Senior Principal Engineer & System Architect  
**Audit Timestamp:** 2026-09-19T07:35:00Z  
**Target Application:** DeepAstro Production (`https://deepastro.vercel.app`)  
**Status:** **PHASE 0 AUDIT COMPLETE — CODEBASE GROUNDED**

---

## 1. Current Architecture Overview

DeepAstro is an enterprise-grade full-stack Vedic astrology, celestial forecasting, and spiritual intelligence operating system.
- **Frontend Stack**: React 19, TypeScript, Vite 6, Tailwind CSS (v3.4) with custom cosmic tokens (`#06070A`, `#111827`, `#1A1F2B`, `#00E5FF`, `#3B82F6`), Lucide Icons, and custom SVG renderers for North Indian diamond charts, South Indian box grids, and East Indian mandala charts.
- **Backend API Stack**: Node.js (v24 runtime), Express 4.21, TypeScript 5.8, REST endpoints, JWT authentication (`jsonwebtoken`), bcrypt password hashing, and parameterized SQL queries via `pg` connection pools.
- **Astronomical & Calculation Engines**:
  - `astronomy-engine` (v2.1.19) + Swiss Ephemeris algorithms for planetary ephemeris, Julian Day calculation, and Lahiri Ayanamsha (Chitra Paksha).
  - High-precision calculation of D1 Rashi, D9 Navamsha, D10 Dashamsha, D60 Shashtiamsha, Ashtakoota Milan (36-point compatibility), KP Cusps & Sub-Lords, Vimshottari Dasha, and Gochara Transits.
  - SoulTrace (Past Life Intelligence Engine) and CFIE (Cosmic Future Intelligence Engine) computing multi-horizon life domain trajectories.
- **Dual-Layer Persistence**:
  - Authoritative PostgreSQL database (Supabase managed or standalone) with Row Level Security (RLS) policies.
  - In-memory synchronous memory tables (`server/src/database/db.ts`) for zero-latency local fallback and test suite isolation.
  - Client-side user-scoped `localStorage` (via `src/utils/birthStorage.ts` and `src/services/tarotEngine.ts`) with user ID prefixes to prevent cross-user state bleed.

---

## 2. Current Authentication Flow

1. **Client Registration & Login**:
   - `POST /api/auth/register`: Takes `{ email, password, fullName }`, generates a unique user ID (`usr_<timestamp>_<random>`), hashes password with `bcryptjs` (salt rounds 10), creates database records in `users` and `profiles` tables, and issues a 30-day signed JWT.
   - `POST /api/auth/login`: Validates credentials, verifies hash via `bcrypt.compare`, audits login action, and returns signed JWT with user profile metadata.
2. **Session Verification & Token Management**:
   - Middleware `getAuthenticatedUser(req)` in `server/src/middleware/auth.ts`:
     1. Checks QA session guard for test pipelines.
     2. Verifies Supabase Auth token via `supabaseAdmin.auth.getUser(token)` and automatically bootstraps user profile via `AuthBootstrapService.ensureUserProfile`.
     3. Falls back to cryptographically verifying custom internal JWT via `jwt.verify(token, JWT_SECRET)`.
3. **OAuth Integration**:
   - `src/services/supabaseClient.ts`: Manages browser-side OAuth redirects.
   - `POST /api/auth/sync-session`: Synchronizes Supabase Google OAuth claims into PostgreSQL `users` and `profiles` tables.
4. **Session Termination & Account Purge**:
   - `POST /api/auth/logout`: Clears client session tokens.
   - `DELETE /api/auth/account`: Permanently deletes user records across `birth_profiles`, `astrology_charts`, `calculation_snapshots`, `profiles`, `users`, and Supabase auth, ensuring subsequent `/api/auth/me` calls fail with 404.

---

## 3. Current Database Flow & Schema

1. **Connection Management**:
   - `server/src/database/postgres.ts`: Manages `pg.Pool` with parameterized queries (`$1, $2, ...`) preventing SQL injection. Falls back to `InMemoryFallbackClient` when running unit tests offline.
2. **Core Relational Tables**:
   - `users`: `id` (PK), `email` (UNIQUE), `password_hash`, `role`, `is_verified`, `created_at`, `updated_at`.
   - `profiles`: `user_id` (PK, FK users.id ON DELETE CASCADE), `full_name`, `avatar_url`, `city`, `country`, `theme_preference`, `chart_style_preference`, `notification_preferences`.
   - `birth_profiles`: `id` (PK), `user_id` (FK users.id ON DELETE CASCADE), `full_name`, `birth_date`, `birth_time`, `birth_place`, `latitude`, `longitude`, `timezone`, `gender`, `ascendant_sign`, `moon_sign`, `nakshatra`, `current_mahadasha`.
   - `calculation_snapshots`: `id` (PK), `user_id` (FK users.id), `birth_profile_id` (FK birth_profiles.id), `fingerprint` (SHA-256), `julian_day`, `ayanamsha_degrees`, `snapshot_payload`.
   - `feedbacks`: Managed via `server/src/routes/feedbackRoutes.ts` with user linkage, category, fingerprint, rating, and feedback message.
3. **Row Level Security (RLS)**:
   - Enabled and forced on `users`, `profiles`, `birth_profiles`, `reports`, `pdf_artifacts`, and `audit_logs` in `002_rls_and_pgvector.sql`.

---

## 4. Current Birth-Data Flow

1. **Client Storage & Form Entry**:
   - Canonical birth data is stored in `src/utils/birthStorage.ts` under keys `deepastro_birth_profile` and `deepastro_calculated_chart`.
   - `saveBirthProfile(profile)` removes silent defaults: latitude and longitude are strictly numeric without New Delhi fallbacks.
2. **Server Synchronization**:
   - `POST /api/auth/birth-profile` validates that `latitude` and `longitude` are strictly numeric. Non-numeric or missing coordinates yield 400 `BIRTH_PROFILE_INCOMPLETE`.
   - `AuthBootstrapService.saveBirthProfile(userId, profile)` performs an upsert into PostgreSQL `birth_profiles` table, keyed by `user_id`.

---

## 5. Current Calculation Pipeline

```
User Birth Input (DOB, Time, Lat, Lon, TZ)
   │
   ▼
[VedicAstroEngine.calculateKundli]
   ├── Julian Day & Greenwich Mean Sidereal Time (GMST)
   ├── Local Sidereal Time (LST) & Ascendant (Lagna) Cusp
   ├── Lahiri Ayanamsha (~23°51' J2000 epoch correction)
   ├── True Sidereal Planetary Longitudes (Sun..Ketu)
   ├── Nakshatras & Padas (Chandra Janma Nakshatra)
   ├── Vimshottari Dasha 120-year balance & sub-periods
   └── Varga Harmonization:
         ├── D1 Rashi
         ├── D9 Navamsha (Spouse, Dharma, Inner Core)
         └── D60 Shashtiamsha (Past Karma, Micro-destiny)
   │
   ▼
[CalculationSnapshotService]
   ├── Compute SHA-256 calculationFingerprint
   └── Persist snapshot in calculation_snapshots table
```

---

## 6. Current Past Life / SoulTrace Pipeline

1. **Route Gateway**: `server/src/routes/pastLifeRoutes.ts` (`POST /api/intelligence/past-life/generate`).
2. **Profile Resolution**: Resolves authenticated user canonical profile via `AuthBootstrapService.getBirthProfile(userId)` or request payload.
3. **Validation**: Validates numeric `latitude`, `longitude`, `birthDate`, and `birthTime`. If invalid, returns 400 `BIRTH_PROFILE_INCOMPLETE`.
4. **Computation Engine**: `PastLifeIntelligenceEngine.generate(userId, profile, options)`.
   - Calculates D1, D9, and D60 chart positions.
   - Evaluates Ketu, Rahu, and Atmakaraka placements.
   - Computes karmic indicators, soul purpose, and past-life archetypes without static mock substitutions.
   - Attaches unique SHA-256 calculation fingerprint and provenance citations (BPHS, Jaimini, Vishnu Purana).

---

## 7. Current Future Intelligence / CFIE Pipeline

1. **Route Gateway**: `server/src/routes/futureRoutes.ts` (`POST /api/future/generate`).
2. **Security & Anti-IDOR Gate**: Rejects unauthenticated or IDOR client-supplied `userId` overrides with 403 `FORBIDDEN`.
3. **Horizon Handling**: Supports `3_YEARS`, `5_YEARS`, and `10_YEARS`, producing exactly 3, 5, and 10 yearly records.
4. **Engine Computation**: `CosmicFutureIntelligenceEngine.generateForecast()`:
   - Calculates planetary periods, Gochara transits, and Ashtakavarga scores.
   - Generates forecasts across all life domains: Career, Wealth, Relationship, Health, Spiritual, Travel, Family.
   - Evaluates supporting and challenging planetary factors with uncertainty boundaries (no deterministic fatalism).
   - Generates timeline event windows and formats for `FutureInsightCard` UI binding.
   - Inherits invariant calculation fingerprint matching Past Life for identical birth profiles.

---

## 8. Current Persistence Architecture

- **User & Profile Persistence**: PostgreSQL `users` and `profiles` tables + `db.users` / `db.profiles` in-memory dual-layer.
- **Birth Profile Persistence**: PostgreSQL `birth_profiles` table + `db.birthProfiles`.
- **Snapshots & Calculations**: PostgreSQL `calculation_snapshots` table + `db.calculationSnapshots`.
- **Tarot Sessions**: User-scoped browser `localStorage` (`deepastro_tarot_journal_${userId}`) + in-memory fallback storage in Node/tests.
- **Feedback Telemetry**: `feedbacks` in-memory map + PostgreSQL schema migration compatibility.

---

## 9. Current Responsive Architecture

- **Root Shell Container**: `src/components/layout/AppShell.tsx`:
  - Fixed full-screen outer container: `h-screen w-screen flex relative overflow-hidden`.
  - Left desktop sidebar: `hidden lg:flex h-screen shrink-0 z-30`.
  - Right column: `flex-1 h-screen flex flex-col min-w-0 relative z-10 overflow-hidden`.
  - Sticky header: `TopNav.tsx`.
  - Main scroll container: `flex-1 overflow-y-auto overflow-x-hidden ... card-safe`.
- **Mobile Navigation**:
  - Mobile bottom navigation bar (`lg:hidden fixed bottom-0 left-0 right-0 h-16`).
  - Slide-out mobile drawer backdrop (`bg-black/70 backdrop-blur-sm`).
- **Media Queries & Reduced Motion**:
  - Custom rules in `src/index.css` for `@media (prefers-reduced-motion: reduce)`.
  - Breakpoints tested: 320px, 375px, 768px, 1024px, 1440px, 1920px.

---

## 10. Current Known Risks & Vulnerabilities to Address

1. **Sidebar Internal Scroll Isolation**: In `Sidebar.tsx`, `<aside>` has `overflow-y-auto`, meaning the header and footer scroll with navigation rather than remaining pinned. The navigation links should scroll independently while header and footer stay pinned (`shrink-0`).
2. **PostgreSQL Connection Resiliency**: On Vercel serverless cold starts, PostgreSQL connection pools may experience brief connection drops; endpoints must handle reconnection gracefully with dual-layer fallback.
3. **Tarot Animation Containment**: The card flip animation in `TarotCardComponent.tsx` and `TarotResponsiveLayout.tsx` must strictly use `overflow: hidden` on parent containers to ensure 3D card rotations never cause horizontal overflow on mobile viewports (320px–375px).
4. **Future Forecast Persistence**: Future Intelligence generated forecasts should have an explicit server-side PostgreSQL persistence table (`future_forecasts`) and a `GET /api/future/latest` endpoint so a user returning after 30 days can instantly restore their forecast.
5. **User Progress & Journey Tracking**: Create a persistent user progress tracking model (`user_progress` / `progressRoutes.ts`) allowing users to pick up where they left off.

---

## 11. Current Deployment Configuration

- **Platform**: Vercel Serverless Production (`iad1` - Washington, D.C.).
- **Domain**: `https://deepastro.vercel.app` (Aliased from `deepastro-qhq8ii8b5-sisodhiyaprashant35-6364s-projects.vercel.app`).
- **Node Engine**: `>=24.0.0` specified in `package.json`.
- **Build Command**: `npm run build` (`npm run client:build && npm run server:build`).
- **Output Directory**: `dist` (Vite) + `server/dist` (TypeScript server).

---

**Baseline Audit Conclusion**: The foundation is robust, modular, and non-destructive. Phase 0 is complete. Proceeding to systematic hardening phases.
