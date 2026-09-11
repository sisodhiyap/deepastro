# DEEPASTRO INTELLIGENCE UPGRADE 3.0: SYSTEM ARCHITECTURE SPECIFICATION

## 1. Executive Architecture Summary
DeepAstro Intelligence 3.0 introduces an advanced cognitive reasoning fabric atop the deterministic Vedic astronomical core without modifying or mutating astronomical truth. The system enforces an absolute boundary between calculated celestial mechanics (VSOP87, ELP-2000, Lahiri Ayanamsha, Varga divisions, Dasha hierarchies) and the cognitive reasoning engines.

```
                    DEEPASTRO TRUTH CORE (IMMUTABLE)
                                   │
                ┌──────────────────┼──────────────────┐
                ↓                  ↓                  ↓
           ASTRONOMY          CALCULATION           RULES
          (Ephemeris,         (D1, Vargas,       (Classical
           Positions)          Shadbala)          Sutras)
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ↓
                         VERIFIED FACT PACKET
                       (Read-Only Snapshot &
                        Calculation Passport)
                                   ↓
                    ═══════════════════════════════
                      ABSOLUTE ARCHITECTURAL GATE
                    ═══════════════════════════════
                                   ↓
                        INTELLIGENCE FABRIC
                   (Context, Memory, Fusion,
                    Patterns, Explanations)
```

## 2. Intelligence Layer Modules (`server/src/intelligence/`)
1. **`IntelligenceOrchestrator.ts`**: The 17-stage master coordinator executing only relevant sub-engines for a given request.
2. **`UserIntentEngine.ts`**: 28-category intent classifier with time-horizon, urgency, and user-objective detection.
3. **`QuestionUnderstandingEngine.ts`**: Disambiguation of underspecified queries, generating $\le 3$ high-value clarifying questions.
4. **`ContextEngine.ts`**: Structured user life context (career, relationships, education, locations, decisions) with strict verification status.
5. **`MemoryReasoningEngine.ts`**: Consent-gated memory categories (Explicit Facts, Preferences, Goals, Confirmed Events, Outcomes).
6. **`UserPreferenceEngine.ts`**: Adaptive presentation modes (`BEGINNER`, `STANDARD`, `EXPERT`) with zero alteration to underlying truth.
7. **`EvidenceFusionEngine.ts`**: Multi-system convergence evaluation (Parashari, Jaimini, KP, Transits, Numerology, Palmistry).
8. **`ContradictionReasoningEngine.ts`**: Isolates system divergence without manufacturing false consensus; explains interpretive tensions.
9. **`TemporalReasoningEngine.ts`**: Multi-scale time window evaluation (Today, 3M, 6M, 1Y, 5Y) preventing false precision.
10. **`LifePatternEngine.ts`**: Pattern discovery across historical user-confirmed events and Dasha/Varga cycles; Life Replay 2.0.
11. **`PredictionReasoningEngine.ts`**: Calibrated prediction scoring with explicit limitations and non-fatalistic formulation.
12. **`DecisionIntelligenceEngine.ts`**: Counterfactual decision simulator (Option A vs Option B) preserving complete user agency.
13. **`ResearchIntelligenceEngine.ts`**: Consented relocation and real-world synthesis, strictly delineating World Facts from Astrological Interpretations.
14. **`OutcomeLearningEngine.ts`**: Brier score calculation and calibration tracking requiring statistical sufficiency ($N \ge 5$).
15. **`ConfidenceEngine.ts`**: Discrete confidence classification (`LOW`, `MODERATE`, `HIGH`) derived from multi-factor evidence matrices.
16. **`UncertaintyEngine.ts`**: Sensitivity analysis for birth-time variability and planetary border transitions.
17. **`ExplanationEngine.ts`**: Structured "Why This Reading" decomposition (Primary factors, Supporting factors, Limitations).
18. **`RecommendationEngine.ts`**: Separation of traditional contemplative practices from pragmatic real-world action steps.
19. **`InsightRankingEngine.ts`**: Cognitive overload prevention by selecting top 3–5 high-relevance insights.
20. **`IntelligenceTelemetry.ts`**: Observable trace auditing for all cognitive executions without logging sensitive data.
21. **`PersonalizationEngine.ts`**: Prohibited trait filtering (preventing any inference regarding politics, religion, diagnosis, or wealth).

## 3. The 17-Stage Intelligence Pipeline
For every user inquiry submitted to `/api/intelligence/analyze`, the pipeline executes the following deterministic sequence:
1. **User Question Ingestion & Validation**
2. **Intent Classification & Parameter Extraction**
3. **Question Disambiguation & Clarification Formulation**
4. **Tenant Context & User Profile Binding**
5. **Deterministic Calculation Snapshot Loading**
6. **Astrological Systems Selection**
7. **Consented Life Context & Active Goals Alignment**
8. **Life Pattern Correlation (Pattern Observed)**
9. **Current Transit & Dasha Alignment**
10. **Classical Rules & Vector RAG Retrieval**
11. **Multi-System Evidence Fusion**
12. **Contradiction & Divergence Analysis**
13. **Consented Real-World Context Synthesis**
14. **Prediction Scoring & Temporal Window Formulation**
15. **Confidence Rating & Uncertainty Evaluation**
16. **Explanation Decomposition & Insight Ranking**
17. **Safety, Privacy & Provenance Telemetry Audit**

## 4. Architectural Boundaries and Non-Negotiable Invariants
- **Read-Only Invariant**: Under no circumstances does any intelligence module write to or modify calculation passports, ephemeris data, or astronomical algorithms.
- **Tenant Isolation**: All caches, memory records, traces, and life graphs are keyed strictly by authenticated `userId`.
- **Zero Hallucination Invariant**: When context or birth data is missing, the system prompts for clarification or marks results inconclusive; it never invents astrological factors.
