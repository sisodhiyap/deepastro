# DEEPASTRO TIGHTENING BASELINE & RECONNAISSANCE AUDIT
**Version:** 8.0.0-PROD Baseline  
**Date:** September 11, 2026  
**Auditor:** DeepAstro Principal Systems & Reliability Architecture Swarm  
**Status:** Pre-Tightening Comprehensive Baseline (Read-Only Reconnaissance Complete)

---

## 1. Executive Summary & Verification State

A complete, non-destructive reconnaissance pass was executed across the entire DeepAstro repository (`client`, `server`, `astrology`, `brain`, `intelligence`, `learning`, `reports`, `database`, `systemVerification`, and test suites).

- **Current Vitest Test Suite**: **41 test suites, 757 tests passing (100% pass rate, 0 failures, 41.94s execution time)**.
- **Current Production Build (`npm run build`)**: Vite client build (1,095 kB chunk) and TypeScript server build (`tsc -p tsconfig.server.json`) complete successfully with zero errors.
- **Architectural Tenet Verification**: The hierarchy `CALCULATION SNAPSHOT → INDEPENDENT VERIFICATION → VERSIONED RULES → KNOWLEDGE/SOURCES → USER CONTEXT → WORLD RESEARCH → AI SYNTHESIS → AUDIT` is fundamentally present and structurally isolated.
- **Key Reconnaissance Finding**: While the computational astronomy core (astronomy-engine, VSOP87, ELP-2000, Lahiri ayanamsha) is deterministic and strictly protected, multiple peripheral consumer routes and features contained **silent fallback defaults** (e.g., defaulting to `Aries`, `Taurus`, `Rohini`, `Ashwini`, `Jupiter` dasha or mock synastry partners) when a user request lacks an active birth profile. These silent fallbacks violate the zero-demo/zero-fake-data invariant and must be hardened to return explicit empty states.

---

## 2. Architecture Map

```
                                  DEEPASTRO FULL-STACK TOPOLOGY
                                  =============================

  [Client Layer: React 19 / TypeScript / Vite / Tailwind CSS / Lucide Icons]
    ├── AppShell & NavTabs (17 Core Pages)
    │     ├── LandingPage (Cosmic Observatory Portal)
    │     ├── DashboardPage (Cosmic Command Center)
    │     ├── CosmicHubPage (Real-time Live Sky, Choghadiya/Hora, 6D Radar, Tarot, Prashna)
    │     ├── KundliPage (D1/D9/D10/Shodashvarga, North/South/East SVG Charts, BTR Sensitivity)
    │     ├── DailyPredictionsPage (Transit Gochara, 6 Life Facets, 11 Domains)
    │     ├── MatchingPage (36-Point Ashtakoota Milan, 4-Quadrant Synastry)
    │     ├── NumerologyPage (Chaldean & Pythagorean Harmonic Numbers)
    │     ├── PalmistryPage (Hastarekha Vision AI Analysis)
    │     ├── LalKitabPage (Rin Debts & Traditional Practical Remedies)
    │     ├── PanchangPage (5 Limbs, Solar Timings, Auspicious Muhurats)
    │     ├── AstrologersPage (Marketplace with Server-Side Contact Shield)
    │     ├── SubscriptionPage (Tier Management: FREE / PREMIUM / PRO)
    │     ├── ReportsPage (Print & PDF Dossier: "My Life Blueprint")
    │     ├── ProfilePage (Data Sovereignty, Family Charts, GDPR Export/Purge)
    │     ├── AdminPage (Real-time Token Telemetry, Latency Meters, Cost, Feature Flags)
    │     ├── SystemVerificationPage (14-Layer Independent Validation Harness UI)
    │     └── ContactPage (Support & Inquiries)
    ├── AstroBotWidget (Omnipresent Floating Assistant grounded in Natal Chart)
    └── Modals: AuthModal, CosmicSOSModal, CosmicStoryCardModal

                                          │ REST API over JSON (Bearer JWT / OptionalAuth)
                                          ▼

  [API Gateway & Server: Express 4 / TypeScript / Node.js 24]
    ├── Middleware
    │     ├── auth.ts (requireAuth, optionalAuth, JWT verification)
    │     ├── entitlement.ts (Server-side feature unmasking)
    │     ├── multer (15 MB / 25 MB bounded payload validation)
    │     └── CORS & JSON body parsers
    │
    ├── Route Controllers (23 Modules in server/src/routes)
    │     ├── authRoutes.ts, astrologyRoutes.ts, matchingRoutes.ts
    │     ├── astrologerRoutes.ts (Contact details scrubbed for unentitled users)
    │     ├── subscriptionRoutes.ts, aiRoutes.ts, numerologyRoutes.ts
    │     ├── palmistryRoutes.ts, reportRoutes.ts, adminRoutes.ts
    │     ├── contactRoutes.ts, privacyRoutes.ts, verificationRoutes.ts
    │     ├── personalizationRoutes.ts, learningRoutes.ts, adminLearningRoutes.ts
    │     ├── brainRoutes.ts, intelligenceRoutes.ts, predictionRoutes.ts
    │     ├── knowledgeRoutes.ts, realUserRoutes.ts, governanceRoutes.ts
    │     └── cosmicRoutes.ts

                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
  [Deterministic Calculation Engines]            [AI Orchestration & Cognitive Layer]
  ├── astronomyMath.ts (Julian Day, GMST, LST)   ├── AIOrchestrator.ts (Multi-model router)
  ├── VedicAstroEngine.ts (Master Engine)        ├── AIAuditor.ts (Post-generation verification guard)
  ├── PlanetEngine.ts (VSOP87 coordinates)       ├── KnowledgeRAG.ts (50KB+ classical shloka store)
  ├── HouseEngine.ts (Whole sign & Bhava Chalit) ├── OllamaProvider.ts (DeepSeek-R1 / Llama 3.1)
  ├── NakshatraEngine.ts (27 Nakshatras / Padas) ├── Cloud Providers: OpenAI, Gemini, Grok
  ├── DashaEngine.ts (120-year Vimshottari)      └── PalmistryVisionService.ts (OpenCV/Vision)
  ├── VargaEngine.ts (D1 to D60 Shodashvargas)
  ├── JyotishRuleEngine.ts (30+ classical rules) [Brain & Self-Learning Governance]
  ├── YogaEngine.ts & DoshaEngine.ts             ├── DeepAstroBrain.ts (Omni-source orchestrator)
  ├── ShadbalaEngine.ts & AshtakavargaEngine.ts  ├── PersonalLifeGraph.ts (21 domain nodes, edges)
  ├── JaiminiEngine.ts & KPEngine.ts             ├── DecisionSimulationEngine.ts (Option A vs B)
  ├── PanchangEngine.ts & MuhuratEngine.ts       ├── ContradictionEngine.ts (Multi-system harmony)
  ├── CosmicFeaturesEngine.ts (Cosmic Hub)       ├── PredictionLedger.ts (Immutable predictions)
  ├── BirthTimeSensitivityEngine.ts (BTR)        ├── PredictionCalibrationEngine.ts (Brier score)
  ├── CalculationPassport.ts & Snapshot.ts       ├── DeepAstroLearningGovernanceEngine.ts
  └── HistoricalTimezoneValidationEngine.ts      └── SelfImprovementLoop.ts (Proposal state machine)

                                          │
                                          ▼
  [Storage & Persistence Layer]
  ├── In-Memory Relational Maps (db.ts) with strict user isolation
  ├── PostgreSQL / Supabase Migration Layer (schema.sql, MigrationRunner.ts)
  ├── Repositories (UserRepository, BirthProfileRepository, CalculationRepository, ReportRepository)
  └── Persistent ReportStore (ReportStore.ts, file & DB storage)
```

---

## 3. Critical Services & Boundaries

### 3.1 Calculation Boundary (Strictly Protected)
- **Mathematical Invariant**: `VedicAstroEngine.ts`, `astronomyMath.ts`, `PlanetEngine.ts`, `HouseEngine.ts`, `DashaEngine.ts`, `VargaEngine.ts`, and `NakshatraEngine.ts` are pure deterministic mathematical functions.
- **Ayanamsha**: Lahiri (Chitra Paksha) at ~23°51' J2000 epoch.
- **Planetary Coordinate Model**: `astronomy-engine` implementing VSOP87 and ELP-2000 algorithms.
- **Boundary Guarantee**: No AI model, learning proposal, or user profile preference can mutate the astronomical calculation outputs. Every calculation produces an immutable SHA-256 fingerprint (`fingerprint`).

### 3.2 Security & Entitlement Boundary
- **Astrologer Contact Shielding**: Evaluated server-side in `astrologerRoutes.ts`. Unauthenticated or FREE tier users receive sanitized records with `phoneProtected`, `whatsappProtected`, and `emailProtected` removed before response dispatch.
- **IDOR Protection**: In `reportRoutes.ts`, `intelligenceRoutes.ts`, and `privacyRoutes.ts`, access to confidential Kundli blueprints, memory nodes, and predictions enforces `req.user.userId === target.userId || req.user.role === 'ADMIN'`.
- **Session Authenticity**: Handled via JWT in `auth.ts` with 7-day expiration and password hashing via `bcryptjs`.

### 3.3 AI Grounding & Epistemic Boundary
- **Evidence Packet**: The AI orchestrator constructs a read-only context packet consisting of `chartFacts`, `calculationPassport`, `verifiedRules`, and `retrievedRAGContext`.
- **AIAuditor Layer**: Performs factual audit (ensures stated Lagna, Moon sign, and Mahadasha match calculation), safety audit (blocks guaranteed medical/financial outcomes), and strips Chain-of-Thought (`<think>`) reasoning before client delivery.

### 3.4 Persistence & Isolation Boundary
- Multi-tenant data segregation across repositories (`BirthProfileRepository`, `CalculationRepository`, `ReportRepository`, `UserRepository`).
- Calculations are stored with snapshot hashes (`calculationSnapshotId`) and calculation passports.

---

## 4. Known Risks, Suspicious Hardcoding & Technical Debt

During this reconnaissance, several specific areas requiring hardening were identified:

### 4.1 Suspicious Fallbacks & Demo Placeholders
1. **`src/constants/demoProfile.ts`**:
   - Contains a deprecated `DEMO_BIRTH_PROFILE` ("Arjun Sharma", 1995-08-15, New Delhi). While not directly imported in active UI pages, this fixture must be purged to enforce zero demo data in production constants.
2. **`server/src/astrology/CosmicFeaturesEngine.ts`**:
   - `getDailyLifeDimensions` (lines 838-841): When `chart` is null, defaults silently to `moonSign = 'Aries'`, `moonNakshatra = 'Ashwini'`, and `dashaLord = 'Jupiter'`.
   - `calculateLifeCycles` (lines 1076-1079): When `chart` is null, defaults silently to `dasha = 'Jupiter'`, `antar = 'Venus'`, and `moonSign = 'Aries'`.
   - `calculateDeepSynastry` (lines 1162-1165): When charts are missing, defaults to `'Aries'`/`'Leo'` and `'Ashwini'`/`'Magha'`.
3. **`server/src/routes/cosmicRoutes.ts`**:
   - `GET /api/cosmic/sade-sati-matrix` (line 157): If `req.query.moonSign` is not provided and the user has no saved profile, defaults to `'Aries'`.
4. **`src/pages/MatchingPage.tsx`**:
   - Line 52: Calls `/api/cosmic/deep-synastry` with synthetic payload:
     `chart1: { moonSign: { signName: partnerA.name || 'Aries' }, moonNakshatra: { name: 'Ashwini' } }`
     instead of passing the real calculated charts resulting from `/api/matching/analyze`.
5. **`server/src/services/RealDashboardService.ts`**:
   - Lines 109-114: Contains defensive fallbacks `|| 'Aries'`, `|| 'Taurus'`, `|| 'Rohini'`, `|| 'Jupiter'`, and `|| 'Moon'` when reading `calcResult`.
6. **`server/src/learning/DailyPersonalizedIntelligence.ts`**:
   - Lines 128-132: In `panchangSummary`, uses `|| 'Rohini'`, `|| 'Shukla Navami'`, `|| 'Budhavara'`, `|| 'Shubha'`, `|| 'Balava'`.
7. **`server/src/brain/DecisionSimulationEngine.ts`**:
   - Line 78: Uses `const lagna = input.snapshot.ascendant?.sign || 'Aries';`.

### 4.2 Missing Validation & Observability Gaps
1. **Health Check Endpoint (`GET /api/health` in `server/src/index.ts`)**:
   - Currently returns a static 4-property JSON (`status: 'healthy'`). It does not independently probe or report the status of Database, Ephemeris, Timezone, RAG, AI Providers, Ollama, PDF, Storage, Self-Healing, and Learning Governance subsystems.
2. **AI Prompt Injection Defenses**:
   - `AIAuditor.ts` checks regex patterns for instructions such as "ignore previous instructions", but lacks comprehensive defense against adversarial injection queries attempting to override birth charts, forge calculation passports, or leak foreign user data.
3. **Uncertainty Communication**:
   - Several prediction endpoints return calculated scores without explicitly rendering the standardized epistemic badges (`CALCULATED`, `VERIFIED`, `CLASSICAL INTERPRETATION`, `USER-CONFIRMED`, `EXPERIMENTAL`, `INCONCLUSIVE`).

---

## 5. Verification Matrix & Baseline Measurements

| Subsystem / Gate | Current Reconnaissance Status | Benchmark / Metric |
|---|---|---|
| **Vitest Test Suite** | 41 test files, 757 tests passing | 41.94s total execution |
| **Vite Client Production Build** | SUCCESS | 7.41s, 1,095 kB JS / 58.8 kB CSS |
| **Server TypeScript Compilation** | SUCCESS (`tsc -p tsconfig.server.json`) | 0 TypeScript errors |
| **Pure Calculation Latency** | Benchmark verified in test suite | **4.91 ms** average Vedic calculation |
| **PDF Rendering Latency** | Benchmark verified in test suite | **1,683 ms** average full PDF dossier |
| **Ephemeral Memory Bleed** | Clean user test passes | Zero state collision across 50 concurrent runs |
| **Contact Masking** | Active in `astrologerRoutes.ts` | Passwords & protected contacts scrubbed |

---

## 6. Action Plan for Final Tightening & Hardening

1. **Phase A: Zero Demo / Zero Fake User Data Enforcement**:
   - Remove `DEMO_BIRTH_PROFILE` from `src/constants/demoProfile.ts`.
   - In `CosmicFeaturesEngine.ts`, remove silent fallbacks to `Aries`, `Ashwini`, and `Jupiter`. If `chart` is null, return empty states or structured uncalibrated indicators.
   - In `cosmicRoutes.ts`, require an active birth profile or explicit parameters for `sade-sati-matrix`, `life-cycles`, and `daily-dimensions`.
   - In `MatchingPage.tsx`, wire `deep-synastry` to use the real calculated output of `personA` and `personB`.
   - In `RealDashboardService.ts`, `DailyPersonalizedIntelligence.ts`, and `DecisionSimulationEngine.ts`, eliminate all default fallback strings (`Taurus`, `Rohini`, `Aries`, `Chitra`).
2. **Phase B: Epistemic Labels & Prompt Injection Hardening**:
   - Upgrade `AIAuditor.ts` and `aiRoutes.ts` with explicit prompt-injection defense rejecting attempts to alter charts, passports, or ledgers.
   - Introduce standardized epistemic badges across prediction summaries.
3. **Phase C: Subsystem Health Monitoring**:
   - Enhance `GET /api/health` to dynamically report live status for all 16 required subsystems.
4. **Phase D: Three-Run Validation & Artifact Generation**:
   - Execute 3 consecutive regression test runs (Run 1, Run 2, Run 3) to confirm 0 failures and 0 flaky tests.
   - Run production build and scan for embedded secrets.
   - Generate the final suite of 7 reports required by Section 52.

*Reconnaissance complete. Baseline established.*
