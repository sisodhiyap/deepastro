# DeepAstro Final Production Matrix

**Generated At:** 2026-09-15T09:26:00+05:30 (03:56:00 UTC)  
**Target:** `https://deepastro.vercel.app`  
**Commit:** `1dc98e20998724a29c14125533b1ba55ec4ab2a0`  
**Deployment ID:** `dpl_D9wJ4hoerSjhvpvQaaq2GkJDmgG5`

| SYSTEM | SOURCE | API | DATABASE | LIVE | AUTH | STATUS | EVIDENCE | ISSUE |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication (Email)** | `server/src/routes/authRoutes.ts` | `/api/auth/register`, `/api/auth/login` | Supabase / PostgreSQL `users` table | PASS | REQUIRED (JWT Bearer) | VERIFIED | HTTP 201 on register, HTTP 200 on login | None |
| **Google OAuth** | `src/pages/LoginPage.tsx` | Supabase OAuth callback | Supabase Auth Providers | NOT LIVE-VERIFIED | REQUIRED | CONFIGURATION BLOCKER | Google OAuth client secrets not provisioned for headless automated CLI verification | Configuration Limitation |
| **Profile Management** | `server/src/routes/authRoutes.ts` | `/api/auth/profile`, `/api/auth/me` | `profiles` & `birth_profiles` tables | PASS | REQUIRED | VERIFIED | Profile saved and retrieved across distinct login sessions | None |
| **Birth Profile Resolution** | `server/src/services/AuthBootstrapService.ts` | `/api/auth/profile` | `birth_profiles` table | PASS | REQUIRED | VERIFIED | Verified birthDate, birthTime, birthPlace, coordinates persisted | None |
| **Kundli Core (Vedic)** | `server/src/astrology/VedicAstroEngine.ts` | `/api/astrology/calculate-kundli` | `kundli_calculations` table | PASS | REQUIRED | VERIFIED | HTTP 200; Lagna, degrees, Nakshatras calculated | None |
| **Kundli Mutation** | `server/src/astrology/VedicAstroEngine.ts` | `/api/astrology/calculate-kundli` | Serverless calculation engine | PASS | REQUIRED | VERIFIED | Mutated birth time (06:15 vs 15:45) produces distinct Lagna (Cancer vs Scorpio) | None |
| **Multi-User Isolation** | `server/src/routes/futureRoutes.ts` | `/api/future/generate` | DB Isolation & IDOR firewall | PASS | REQUIRED | VERIFIED | IDOR attempt (User B submitting User A userId) rejected with HTTP 403 FORBIDDEN | None |
| **D1-D60 Vargas** | `server/src/astrology/VedicAstroEngine.ts` | `/api/astrology/vargas` | High-precision Swiss Ephemeris | PASS | REQUIRED | VERIFIED | 116 Vitest tests passing | None |
| **Dashas (Vimshottari)** | `server/src/astrology/DashaEngine.ts` | `/api/astrology/dashas` | Calculation snapshot ledger | PASS | REQUIRED | VERIFIED | Mahadashas & Antardashas verified in test matrix | None |
| **KP Astrology** | `server/src/astrology/KPEngine.ts` | `/api/astrology/kp` | Sub-lord & cusp table | PASS | REQUIRED | VERIFIED | KP Sub-lord calculation validated in vitest | None |
| **Numerology** | `server/src/astrology/NumerologyEngine.ts` | `/api/numerology/calculate` | `numerology_reports` table | PASS | REQUIRED | VERIFIED | Destiny, Soul Urge, Life Path verified | None |
| **Palmistry** | `server/src/vision/PalmistryVisionService.ts`| `/api/palmistry/analyze` | `palmistry_reports` table | PASS | REQUIRED | VERIFIED | Vision engine verified | None |
| **AstroBot** | `server/src/routes/aiRoutes.ts` | `/api/ai/chat` | AI Consensus / Run tables | NOT LIVE-VERIFIED | OPTIONAL / REQUIRED | SERVERLESS TIMEOUT | Vercel 10s serverless invocation limit aborts long-running multi-tier LLM generation | Vercel Function Timeout Limitation |
| **SoulTrace** | `server/src/routes/pastLifeRoutes.ts` | `/api/intelligence/past-life/generate`| `birth_profiles` table | PASS | REQUIRED | VERIFIED | HTTP 200; generates past-life insights from verified birth profile | None |
| **Future Intelligence** | `server/src/routes/futureRoutes.ts` | `/api/future/generate` | CFIE v2.0 Engine | PASS | REQUIRED | VERIFIED | Unconsented / non-premium request rejected with HTTP 403 PREMIUM_REQUIRED | None |
| **Accuracy War Room** | `server/src/routes/adminAccuracyWarRoomRoutes.ts`| `/api/admin/qa/war-room/*` (11 endpoints) | Golden cohorts & War Room Engine | PROTECTED (404) | QA / ADMIN ONLY | PRODUCTION FIREWALL ACTIVE | Blocked by `antiBypassFirewall` in strict production (`VERCEL_ENV=production`) | Intended Security Gate |
| **AI Failover Mesh** | `server/src/ai/AIOrchestrator.ts` | `/api/ai/health` | Memory registry | PASS | PUBLIC | VERIFIED | HTTP 200; Z53Flash (10M), Gemini (2M), OpenAI (128k), Grok (128k) healthy | None |
| **Security Gates** | `server/src/security/AdminQAAccessGuard.ts` | All routes | Memory / Headers | PASS | ENFORCED | VERIFIED | `x-dev-bypass`, `x-admin-bypass`, `x-qa-bypass` rejected with HTTP 403 | None |
