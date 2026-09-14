# DeepAstro Observatory V2.0: Adversarial Prediction Validation & Calibration Architecture

## 1. Executive Summary & Epistemic Core Principle
DeepAstro Observatory V2.0 is an adversarial evaluation, calibration, and governance layer positioned strictly above DeepAstro's immutable astronomical core (Lahiri Ayanamsha, Swiss Ephemeris, D1-D60 divisionals, Vimshottari Dasha, KP System).

### Epistemic Foundations:
- **NO EVIDENCE = NO CLAIM**
- **NO CONFIRMATION = UNKNOWN**
- **CONTRADICTION = REDUCE CONFIDENCE / SUPPRESS**
- **INSUFFICIENT SIGNAL = DO NOT FORCE A PREDICTION**
- **AI CANNOT OVERRIDE DETERMINISTIC CALCULATIONS**
- **HONEST MEASUREMENT OVER MARKETING APPEARANCE**
- A prediction is never considered correct merely because an AI model generated it confidently.
- Real-world accuracy claims are prohibited without statistically sufficient, verified user outcomes. Synthetic data is strictly barred from real-world accuracy metrics.

---

## 2. Existing Architecture & Reused Components
Observatory V2.0 audits and orchestrates across existing DeepAstro foundations:
- **Calculation Core**: Swiss Ephemeris (`swisseph`), Lahiri Ayanamsha, KP sub-lords, D1-D60 planetary calculations. Immutable and untouched.
- **Cosmic Future Intelligence Engine (CFIE v2.0)**: Production timeline engine, life domain synthesis, year/month forecasts.
- **Observatory V1.0**: `PredictionLedger`, `PredictionOutcomeEngine`, `PredictionCalibrationEngine`, `PredictionRealityComparisonEngine`, `EvidenceGraph`, `LearningGovernance`.
- **AI Mesh & Fallbacks**: `Z53FlashProvider` (10M token capacity, fast critique), `OpenAIProvider`, `GeminiProvider`.
- **Security & RBAC**: `SecurityGate`, JWT authentication, session validation, rate limiting.

---

## 3. Observatory V2.0 Architectural Component Hierarchy

```
DeepAstro Client / AstroBot / Future Map
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Observatory V2.0 Facade                   │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    PRE-EMISSION ADVERSARIAL          POST-OUTCOME VALIDATION
    & GOVERNANCE PIPELINE             & CALIBRATION ENGINE
                │                             │
  ┌─────────────┴─────────────┐ ┌─────────────┴─────────────┐
  │ PredictionChallengerEngine│ │ PostHocDetectionEngine    │
  │ StatementClassifier       │ │ DisconfirmationEngine     │
  │ FalsifiabilityEngine      │ │ TemporalCalibrationEngine │
  │ QualityVectorEngine       │ │ DomainCalibrationEngine   │
  │ CriticMesh (Z53/GPT/Gem)  │ │ BaselineComparisonEngine  │
  │ ImmutabilityGuard         │ │ CoverageTrackingEngine    │
  │ DeduplicationEngine       │ │ SelectionBiasGuard        │
  │ DatasetRegistry           │ │ HallucinationAuditor      │
  └───────────────────────────┘ └───────────────────────────┘
                │                             │
                └──────────────┬──────────────┘
                               ▼
            Observatory Audit & Calibration Ledger
```

---

## 4. Observatory V2 Component Directory (`server/src/intelligence/observatory/v2/`)

| Component | Responsibility | Test File |
|---|---|---|
| `PredictionChallengerEngine` | 15-question adversarial interrogation; detects Barnum statements, overconfidence, contradiction | `challengerEngine.test.ts` |
| `StatementClassifier` | 6 statement types (SPECIFIC_TESTABLE, TIME_BOUND_DIRECTIONAL, BARNUM, POST_HOC, etc.) | `statementClassifier.test.ts` |
| `PredictionFalsifiabilityEngine` | Enforces non-tautological testability, timing bounds, falsification conditions | `falsifiabilityEngine.test.ts` |
| `PredictionQualityVectorEngine` | 8-dimensional scoring: Specificity, Testability, EmpiricalGrounding, etc. | `qualityVector.test.ts` |
| `BaselineComparisonEngine` | Compares against Random Baseline, Domain Base-rate, Astrologer Baseline; Brier scoring | `baselineComparison.test.ts` |
| `CoverageTrackingEngine` | Enforces simultaneous accuracy + coverage reporting; flags gaming via suppression | `coverageTracking.test.ts` |
| `PredictionHallucinationAuditor` | Flags invented planetary aspects, non-existent dasha periods, fabricated citations | `hallucinationAuditor.test.ts` |
| `TemporalLeakageRedTeam` | Verifies zero future data contamination, snapshot immutability, backtest sanitization | `temporalLeakageRedTeam.test.ts` |
| `PostHocDetectionEngine` | Detects retrospective reinterpretation and outcome rationalization | `postHocDetection.test.ts` |
| `PredictionDeduplicationEngine` | Eliminates overlapping/reworded predictions to prevent outcome double-counting | `deduplication.test.ts` |
| `SelectionBiasGuard` | Prevents deletion or concealment of failed predictions from accuracy ledgers | `selectionBias.test.ts` |
| `DatasetRegistry` | Strictly isolates Synthetic, Calibration, and Real User observation datasets | `datasetSeparation.test.ts` |
| `DomainCalibrationEngine` | Domain-specific Brier scores, reliability curves, overconfidence penalties | `domainCalibration.test.ts` |
| `TemporalCalibrationEngine` | Calibrates across lead times (Immediate, 30-day, 90-day, 1-year, 5-year) | `temporalCalibration.test.ts` |
| `ProviderDisagreementEngine` | Measures multi-model consensus and surfaces epistemic uncertainty | `providerDisagreement.test.ts` |
| `DisconfirmationEngine` | Actively tests contrary hypotheses and records disconfirming signals | `disconfirmation.test.ts` |
| `KnowledgeSourceVerifier` | Validates classical references against verified corpus; flags hallucinations | `knowledgeVerification.test.ts` |
| `PredictionImmutabilityGuard` | Cryptographic SHA-256 freezing of prediction claims, timestamps, and parameters | `immutabilityGuard.test.ts` |
| `PredictionCriticMesh` | Multi-provider adversarial cross-critique (Z53, OpenAI, Gemini) | `adversarialMatrix.test.ts` |
| `SelfCritiqueOrchestrator` | Automated red-teaming loop triggering suppression or softening | `adversarialMatrix.test.ts` |
| `ObservatoryV2Types` | Strict TypeScript types, schemas, and invariants | All test suites |
| `ObservatoryV2` | Master unified export facade | `adversarialMatrix.test.ts` |

---

## 5. Security & Invariant Enforcement
1. **Zero Client Manipulation**: Prediction hashes and accuracy metrics cannot be forged or mutated by client requests.
2. **Zero Synthetic Infiltration**: Synthetic test data is hard-blocked at the type and registry level from entering real-world accuracy statistics.
3. **Selection Bias Protection**: Admins cannot purge failed predictions to artificially inflate accuracy.
4. **Tenant Isolation**: Deduplication and outcome matching enforce strict user boundary checks.
