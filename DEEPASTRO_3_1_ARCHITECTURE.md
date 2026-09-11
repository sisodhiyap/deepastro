# DEEPASTRO 3.1 — ADAPTIVE LIFE REASONING ENGINE ARCHITECTURE

## 1. System Overview
DeepAstro 3.1 upgrades the existing DeepAstro 3.0 intelligence fabric from a chart interpreter into an **evidence-grounded personal intelligence system**. It evaluates the user's specific inquiry, verified immutable chart, confirmed life context, longitudinal history, current timing, contradictory signals, and historical outcomes before generating a response.

```
                  ┌────────────────────────────────────────┐
                  │    IMMUTABLE ASTRONOMICAL TRUTH CORE   │
                  │   VSOP87 • ELP-2000 • Lahiri • Vargas  │
                  └───────────────────┬────────────────────┘
                                      │ (Read-Only Fact Packet)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       DEEPASTRO 3.1 REASONING PLAN     │
                  │   Intent • Horizon • Selective Engines │
                  └───────────────────┬────────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│ Context Graph │              │ Longitudinal  │              │  Uncertainty  │
│    Engine     │              │   Reasoning   │              │  Composition  │
│ (Correlation  │              │(Past•Now•Next)│              │  (No Fake %)  │
│  != Causal)   │              │               │              │               │
└───────┬───────┘              └───────┬───────┘              └───────┬───────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │    ORCHESTRATED 3.1 PAYLOAD   │
                       │ Answerability • What Changed? │
                       │    Evidence • Agency Preserved│
                       └───────────────────────────────┘
```

## 2. DeepAstro 3.1 Module Additions (`server/src/intelligence/`)
1. **`ContextGraphEngine.ts`**: Ephemeral reasoning graph mapping interactions between planetary factors, classical rules, life events, and goals while explicitly enforcing *Correlation $\ne$ Causation*.
2. **`ContextRelevanceEngine.ts`**: Evaluates relevance, recency, and certainty to prevent prompt context dumping; enforces the Personal Context Priority hierarchy.
3. **`LongitudinalReasoningEngine.ts`**: Compares past milestones, current transits, and future windows across domains, reporting observed patterns under `PATTERN_OBSERVED`.
4. **`HistoricalPeriodMatcher.ts`**: Compares intuitive user inquiries ("This feels like 2018 again") against current transits and Dashas, surfacing similarities, differences, and new protective factors.
5. **`PredictionMemoryEngine.ts`**: Tracks user predictions, prevents duplicate forecast generation for overlapping windows, and calibrates expectations against past outcomes.
6. **`UncertaintyCompositionEngine.ts`**: Synthesizes birth-time sensitivity, boundary proximity, contradictory systems, and sample size into discrete `LOW`, `MODERATE`, or `HIGH` confidence with itemized rationale.
7. **`UserGoalEngine.ts`**: Manages user life goals with immutable historical versioning (supporting Goal Evolution without erasing past states).
8. **`WhatChangedEngine.ts`**: Compares consecutive reading sessions, detecting new transits, Dasha progressions, new goals, and outcome milestones.

## 3. Immutable Truth Core Guarantees
- The astronomical core remains 100% frozen.
- The intelligence layer possesses strictly **read-only** access to calculation passports and ephemerides.
- Under no circumstances does AI reasoning alter planetary positions, house cusps, or classical rule definitions.
