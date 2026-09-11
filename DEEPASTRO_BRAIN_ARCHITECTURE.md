# DEEPASTRO BRAIN v2 — ARCHITECTURE SPECIFICATION
**Version:** 2.0.0-RC  
**Status:** VALIDATED & SEALED  
**Date:** September 10, 2026  
**Module:** `DeepAstroBrain` Orchestration Engine  

---

## 1. Executive Summary & Philosophy
DeepAstro Brain v2 elevates the platform from an astronomical calculation service into an omni-source personal Jyotish intelligence engine. Built upon the immovable foundation of verified astronomical ephemeris and versioned classical logic, it synthesizes Vedic, Jaimini, Krishnamurti Paddhati (KP), Numerology, Palmistry, and governed public world research without ever compromising astronomical determinism.

### Absolute Architectural Rule
> **AI IS NOT THE SOURCE OF ASTRONOMICAL TRUTH.**  
> The immutable hierarchy is:  
> 1. `CalculationSnapshot` (SHA-256 sealed, AstronomyEngine verified)  
> 2. Independent astronomical verification  
> 3. Versioned Jyotish Rule Engine (BPHS, Phaladeepika, Saravali, Jaimini Upadesha)  
> 4. Verified knowledge/source layer  
> 5. User-confirmed personal context (Cosmic Memory & Life Timeline)  
> 6. Current public research (Explicit consent only)  
> 7. AI interpretation & synthesis  
>  
> *AI interpretation can NEVER override, mutate, or hallucinate a higher layer.*

---

## 2. End-to-End Brain v2 Pipeline

```
USER QUESTION / QUERY
        ↓
INTENT CLASSIFIER (23 Domains, Multi-Intent, House/Graha Mapping)
        ↓
RESEARCH PLANNER (Determines required systems, rules, memory, search)
        ↓
DOMAIN ROUTER
        ↓
┌──────────────────────────────────────────────────────────────┐
│                  ANALYTICAL SUBSYSTEMS                       │
├──────────────────────────────┬───────────────────────────────┤
│ • Vedic Engine (D1-D60)      │ • Jaimini Upadesha Sutras     │
│ • KP Stellar Sub-Lords (249) │ • Numerology (Chaldean/Pyth)  │
│ • Vimshottari Multi-Dasha    │ • Palmistry Vision Engine     │
│ • Dynamic Panchang & Muhurta │ • Relocation Horizon Engine   │
│ • World Research Agent       │ • Sovereign Cosmic Memory     │
│ • Life Timeline Engine       │ • Counterfactual Simulator    │
└──────────────────────────────┴───────────────────────────────┘
        ↓
EVIDENCE GRAPH & PROVENANCE MAP
        ↓
CONTRADICTION ENGINE (Detects Dasha vs Transit, Multi-System Nuances)
        ↓
PREDICTION PLANNER (Curates supporting/challenging factors)
        ↓
MULTI-SYSTEM SYNTHESIS (Unites streams with source attribution)
        ↓
AI REASONER (Structured synthesis adhering strictly to facts)
        ↓
FACT CHECKER (Verifies Graha positions, Dasha lords, Numbers)
        ↓
SAFETY AUDITOR (Zero medical/financial advice, zero fatalism)
        ↓
PERSONALIZATION COMPOSER (Calibrated tone, depth & sovereignty)
        ↓
FINAL 10-POINT STRUCTURED READING & "WHY THIS PREDICTION" DOSSIER
```

---

## 3. Subsystem Architecture

### 3.1 IntentClassifier (`server/src/brain/IntentClassifier.ts`)
- Evaluates query strings against 23 distinct semantic intents: `CAREER`, `BUSINESS`, `FINANCE`, `RELATIONSHIP`, `MARRIAGE`, `EDUCATION`, `FAMILY`, `HEALTH_WELLNESS`, `SPIRITUALITY`, `TRAVEL`, `RELOCATION`, `TIMING`, `MUHURTA`, `COMPATIBILITY`, `PERSONALITY`, `LIFE_PATTERN`, `PAST_EVENT`, `FUTURE_PERIOD`, `NUMEROLOGY`, `PALMISTRY`, `GENERAL_ASTROLOGY`, `CURRENT_WORLD_CONTEXT`, and `DECISION_SUPPORT`.
- Dynamically derives primary intent, secondary intents, associated Bhava houses (1–12), karaka Grahas, and flags for decision or timing queries.

### 3.2 ResearchPlanner (`server/src/brain/ResearchPlanner.ts`)
- Prevents premature answer generation by constructing a structured `ResearchPlan`.
- Analyzes missing evidence, determines whether external public context is required, checks for palmistry image availability, and isolates required classical rules.

### 3.3 JaiminiEngine (`server/src/astrology/JaiminiEngine.ts`)
- Computes 7 Chara Karakas: Atmakaraka (AK), Amatyakaraka (AmK), Bhratrikaraka (BK), Matrikaraka (MK), Putrakaraka (PK), Gnatikaraka (GK), and Darakaraka (DK) strictly sorted by descending sidereal degrees within sign.
- Implements Jaimini Rashi Drishti (Moveable signs aspect Fixed except adjacent; Fixed aspect Moveable except adjacent; Dual aspect other Duals).
- Calculates Arudha Lagna (AL) and Upapada Lagna (UL) with classical 1st/7th house exception rules.

### 3.4 KPEngine (`server/src/astrology/KPEngine.ts`)
- Deterministically maps 360° zodiacal longitudes into 249 sub-lord segments proportional to Vimshottari Dasha spans: `(800' * Years) / 120`.
- Resolves Star Lord and Sub-Lord for all 9 Grahas and 12 Bhavas.
- **Safety Gate**: If birth time precision is approximate or confidence is low, KPEngine gracefully returns `status: 'KP_NOT_AVAILABLE'` rather than fabricating sub-lord boundaries.

### 3.5 Numerology & Correlation (`server/src/astrology/NumerologyEngine.ts`, `server/src/learning/NumerologyCorrelationEngine.ts`)
- Deterministic calculation of Life Path, Birth Number, Destiny/Expression, Soul Urge, Personality, Personal Year, Personal Month, and Personal Day.
- Multi-system correlation maps vibrational themes to Jyotish Dasha/Gochar themes without conflating the distinct philosophical origins.

### 3.6 WorldResearchAgent (`server/src/brain/WorldResearchAgent.ts`)
- Enforces strict user consent (`allowPublicResearch: true`).
- Strictly rejects surveillance, private background checks, and sensitive data mining.
- Attaches cryptographic provenance (`source`, `retrievedAt`, `claim`, `confidence`, `relevance`) to external context.

### 3.7 ContradictionEngine (`server/src/brain/ContradictionEngine.ts`)
- Explicitly flags tensions (e.g. Benefic Dasha with Malefic Gochar transit or Vedic expansion with Numerological consolidation).
- Classifies interactions as `AGREE`, `PARTIAL_AGREEMENT`, `CONFLICT`, or `INSUFFICIENT_EVIDENCE`.
- Explains classical Jyotish synthesis: Dashas indicate internal psychological capacity and ripening karmas, while transits govern external environmental triggers.

### 3.8 DecisionSimulationEngine (`server/src/brain/DecisionSimulationEngine.ts`)
- Evaluates counterfactual choices (Option A vs Option B) across career, relocation, and timing.
- Yields balanced comparative factors, supporting influences, friction points, and practical action steps with zero fatalistic guarantees.

### 3.9 LifeReplayEngine (`server/src/learning/LifeReplayEngine.ts`)
- Correlates user-confirmed historical life events with planetary dasha periods and transits active at the event date.
- Explicitly labels every milestone correlation as `OBSERVED_CORRELATION` to avoid pseudo-scientific causal claims.

---

## 4. API Endpoints
All endpoints mounted at `/api/brain` and secured via auth middleware:
- `GET  /api/brain/status` — Health & supported intelligence subsystems.
- `POST /api/brain/analyze` — Master omni-source intelligence reading.
- `POST /api/brain/decision` — Counterfactual scenario simulation.
- `POST /api/brain/life-replay` — Historical timeline Jyotish correlation.
- `POST /api/brain/research` — Governed public world research.
- `POST /api/brain/contradictions` — Multi-system tension evaluation.
- `POST /api/brain/numerology/analyze` — Dedicated numerological cycle engine.
- `POST /api/brain/palmistry/analyze` — Palmistry observation & interpretation.

---

## 5. Architectural Verification & Zero-Regression Proof
- **Suite Execution:** `tests/deepastroBrainV2.test.ts` (21/21 PASS).
- **Full Regression:** 34 test suites, 287 tests (287/287 PASS, 100% success rate).
- **Calculation Latency:** 4.799ms average calculation time.
