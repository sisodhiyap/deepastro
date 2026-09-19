# DeepAstro 7.4 — Pre-Change Audit & Architecture Discovery

**Project:** DeepAstro — Cosmic Intelligence & Vedic Astrology Platform  
**Release:** DeepAstro 7.4 Production Hardening, UX, Session, Persistence & Intelligence Quality Upgrade  
**Date:** September 19, 2026  
**Auditor:** Senior Principal Engineer & Production Release Lead  

---

## 1. Current Architecture Overview

DeepAstro is structured as a full-stack, TypeScript-first application deployed to Vercel (frontend + serverless API) and backed by PostgreSQL (with Supabase Auth & RLS).

### A. Client Architecture
- **Framework:** React 18 + Vite, TailwindCSS, Lucide icons, Framer Motion, HTML5 Canvas.
- **State & Contexts:** `AuthContext` (JWT/Supabase session), `BirthDetailsContext` (birth coordinates and astrological state), `TarotContext`.
- **Layout:** `AppShell` with fixed desktop `Sidebar`, sticky `TopNav`, and `card-safe` scrollable content viewport.
- **Key Modules:**
  - **Kundli & Varga:** D1 through D60 harmonic divisional chart visualizers.
  - **KP System:** Placidus cusps, Sub-Lords, Significator tables.
  - **Dasha & Transits:** 120-year Vimshottari hierarchy with planetary Gochara transits.
  - **SoulTrace (Past Life Engine v2.0):** Archetypal karmic pattern synthesis from D9, D60, Ketu axis, and Atmakaraka.
  - **CFIE (Cosmic Future Intelligence Engine v2.0):** Multi-system 3/5/10-year timeline and 15-domain forecast.
  - **Tarot System:** 78-card cryptographic draw, 3-card spread (Root, Present, Direction) with celestial weighting.
  - **Cosmic Hub & Sky:** Real-time planetary transits and Sky map.

### B. Server & Database Architecture
- **Server:** Express on Node.js / Vercel Serverless Function runtime.
- **Database:** Supabase PostgreSQL with connection pooling (`pg.Pool`), Row Level Security (RLS), and in-memory dual-layer repositories (`UserRepository`, `BirthProfileRepository`, `CalculationSnapshotService`).
- **Calculation Core:** Swiss Ephemeris / Lahiri Ayanamsha astronomical algorithms with SHA-256 calculation passport fingerprinting.
- **Routing:** Express router with priority mounting for intelligence and future engines before generic catch-alls.

---

## 2. Files Involved in 7.4 Hardening

| Component | Target Files | Responsibilities |
| :--- | :--- | :--- |
| **Authentication & Session** | `src/context/AuthContext.tsx`<br>`server/src/routes/authRoutes.ts`<br>`server/src/middleware/auth.ts` | Session restoration, account deletion (`DELETE /api/auth/account`), logout cleanup, Google OAuth, user isolation. |
| **Profile Storage & Safety** | `src/utils/birthStorage.ts`<br>`server/src/services/AuthBootstrapService.ts` | Removal of silent default New Delhi coordinates (`28.6139`/`77.2090`), strict validation, user-scoped storage. |
| **Feedback System** | `server/src/routes/feedbackRoutes.ts` (NEW)<br>`server/src/index.ts`<br>`src/components/common/FeedbackModal.tsx` (NEW) | Dedicated feedback API (`POST /api/feedback`), persistence, telemetry logging without altering calculations. |
| **Past Life UI/Engine** | `src/pages/PastLifePage.tsx`<br>`server/src/routes/pastLifeRoutes.ts` | Explicit 7 UI states (`LOADING`, `PROFILE_REQUIRED`, `CALCULATING`, `READY`, `PARTIAL_DATA`, `ERROR`, `RETRY`), dynamic coordinates. |
| **Future Intelligence UI/Engine** | `src/pages/FutureIntelligencePage.tsx`<br>`server/src/routes/futureRoutes.ts` | Array-safe domain resolution (`CAREER`, `RELATIONSHIP`, `FINANCE`, etc.), elimination of static fallback text, 3Y/5Y/10Y timeline. |
| **Tarot Responsive & User Isolation** | `src/services/tarotEngine.ts`<br>`src/pages/TarotPage.tsx`<br>`src/components/tarot/TarotResponsiveLayout.tsx` | User-scoped journal keys (`deepastro_tarot_journal_${userId}`), deck integrity (78 cards, 0 duplicates), bounded animations. |
| **Styling & Accessibility** | `src/index.css`<br>`src/components/layout/AppShell.tsx` | `prefers-reduced-motion` global media query, independent panel scrolling, `min-width: 0` card overflow protection. |
| **Surgical Test Suites** | `tests/deepastro74SurgicalHardening.test.ts` (NEW)<br>`tests/deepastro73SurgicalPastLifeFuture.test.ts` | End-to-end multi-profile tests, mutation tests, auth lifecycle, feedback, and user isolation. |

---

## 3. Existing Behavior & Detected Risks

### Detected Risk 1: Fallback Coordinates in Client Storage & Forms
- **Finding:** `src/utils/birthStorage.ts` (lines 34-35), `src/pages/PastLifePage.tsx` (lines 38, 70, 225), and `src/pages/FutureIntelligencePage.tsx` (lines 65, 96) contained default substitutions `latitude: 28.6139` and `longitude: 77.2090`.
- **Risk:** If a user submitted a birth profile without coordinates, the frontend silently assigned them to New Delhi instead of properly signaling `BIRTH_PROFILE_INCOMPLETE`.
- **Surgical Remedy:** Remove synthetic coordinate fallbacks. If coordinates are missing, preserve them as empty or prompt the user for their exact birth place.

### Detected Risk 2: Domain Forecast Data Binding Mismatch in Future Intelligence
- **Finding:** In `src/pages/FutureIntelligencePage.tsx`, `forecastData?.domainForecasts` returned an array of 15 domains, but lines 627-632 attempted property lookup `domainDict.CAREER?.outlook`. Because `domainDict` was an array, property lookup returned `undefined`, causing the UI to display static placeholder strings!
- **Risk:** Users saw generic canned sentences instead of their real calculated domain outlooks.
- **Surgical Remedy:** Implement array-aware helper `getDomainData(name)` to extract the dynamic domain forecast from the array.

### Detected Risk 3: Cross-User LocalStorage Bleed on Logout
- **Finding:** `AuthContext.signOut()` cleared `deepastro_token` and `deepastro_user`, but left `deepastro_birth_profile` and `deepastro_tarot_journal` intact.
- **Risk:** If User A logged out and User B logged in on the same browser, User B could see User A's birth profile and tarot journal.
- **Surgical Remedy:** Call `clearBirthStorage()` and scope tarot journal keys to `userId`.

### Detected Risk 4: Missing Dedicated Feedback Endpoint
- **Finding:** While Past Life had an inline feedback subroute, DeepAstro lacked a canonical `/api/feedback` endpoint for the entire application.
- **Risk:** User cannot report calculation, UI, or data issues across modules.
- **Surgical Remedy:** Create `feedbackRoutes.ts` mounted at `/api/feedback` with structured telemetry logging.

### Detected Risk 5: Account Deletion Requirement (Phase 2)
- **Finding:** `authRoutes.ts` had no `DELETE /api/auth/account` handler.
- **Risk:** Users could not exercise GDPR/data rights to permanently delete their account and associated profiles.
- **Surgical Remedy:** Implement `DELETE /api/auth/account` with `requireAuth` to delete all user records from DB and memory.

### Detected Risk 6: Missing `prefers-reduced-motion` CSS Directive
- **Finding:** `src/index.css` had multiple planet float and water wave animations without a reduced motion media query.
- **Risk:** Fails WCAG AA accessibility audit for vestibular motion disorders.
- **Surgical Remedy:** Add `@media (prefers-reduced-motion: reduce)` in `src/index.css`.

---

## 4. Exact Surgical Changes Planned

1. **Fix Coordinate Fallbacks**:
   - `src/utils/birthStorage.ts`: Only assign latitude/longitude if valid numeric strings; no silent Delhi defaults.
   - `src/pages/PastLifePage.tsx` & `src/pages/FutureIntelligencePage.tsx`: Ensure birth forms pass real geocoded or user-entered coordinates.
2. **Harden Future Intelligence Domain Extraction**:
   - Add array-aware `getDomainData` in `src/pages/FutureIntelligencePage.tsx` so all 15 domains render dynamic calculated outputs.
3. **Session & User Isolation**:
   - Update `AuthContext.tsx` to wipe all local profile and chart storage on logout.
   - Scope Tarot journal in `src/services/tarotEngine.ts` by `userId`.
   - Add `DELETE /api/auth/account` to `server/src/routes/authRoutes.ts` and `deleteAccount()` to `AuthContext.tsx`.
4. **Dedicated Feedback API & Modal**:
   - Implement `server/src/routes/feedbackRoutes.ts` mounted at `/api/feedback`.
   - Implement `src/components/common/FeedbackModal.tsx` accessible across the app.
5. **Accessibility & Reduced Motion**:
   - Add `@media (prefers-reduced-motion: reduce)` in `src/index.css`.
6. **Past Life UI States**:
   - Ensure explicit handling of `LOADING`, `PROFILE_REQUIRED`, `CALCULATING`, `READY`, `PARTIAL_DATA`, `ERROR`, `RETRY`.
7. **Comprehensive Test Suite**:
   - Create `tests/deepastro74SurgicalHardening.test.ts` covering authentication, account deletion, user isolation, feedback API, domain parsing, and zero coordinate fallbacks.
8. **Build & Production Verification**:
   - Pass typecheck, client build, server build, full test suite (3 consecutive passes), deploy to Vercel production, and verify live on `https://deepastro.vercel.app`.
