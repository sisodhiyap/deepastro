# DEEPASTRO PHASE 5 — AI EVALUATION & GROUNDING AUDIT

**Audit Reference**: AIE-V5-2026-09  
**Components**: `server/src/brain/EvidenceWeightingEngine.ts`, `server/src/brain/DeepAstroBrain.ts`  
**Test Suite**: `tests/phase5PersonalIntelligence.test.ts` (Category 7: Tests 7.1–7.5)  
**Status**: 100% AUDIT PASS  

---

## 1. Epistemological Role of AI in DeepAstro

AI in DeepAstro is strictly an interpretation, communication synthesis, and natural language understanding layer.
Under no condition does AI serve as an authoritative source of truth.

| Analytical Dimension | Source of Authority | Can AI Modify? |
| :--- | :--- | :--- |
| **Planetary Coordinates** | Swiss Ephemeris / VSOP87 / ELP-2000 | **NEVER (Hard Blocked)** |
| **Ayanamsha (Lahiri)** | Deterministic Astronomical Math | **NEVER (Hard Blocked)** |
| **House Cusps & Chalit** | Whole Sign / Sripati Math | **NEVER (Hard Blocked)** |
| **Vimshottari Dasha** | Moon Longitude Math | **NEVER (Hard Blocked)** |
| **Divisional Charts (D1–D60)** | Varga Computation Algorithms | **NEVER (Hard Blocked)** |
| **Yoga & Dosha Detection** | Rule Engine Canonical Evaluator | **NEVER (Hard Blocked)** |
| **User Life Facts** | Personal Life Graph (User Confirmed) | **NEVER (Requires Human Click)** |
| **Natural Language Summary** | LLM Synthesis (Gemini/Groq/Ollama) | **READ-ONLY Interpretation** |

---

## 2. Multi-System Evidence Fusion & Weighting

DeepAstro Phase 5 rejects superficial voting models (e.g. *"3 systems positive, 2 negative = 60% agreement"*).
Instead, evidence is structured in a strict five-tier hierarchy:

1. **PRIMARY (Weight 1.0 / 0.95)**: Direct natal placements, lagna lord, kendra/trikona rulers, active Mahadasha lord.
2. **SECONDARY (Weight 0.75)**: Divisional charts (D9 Navamsha, D10 Dashamsha, D4), slow Gochar transits (Jupiter, Saturn).
3. **SUPPORTING (Weight 0.55)**: KP cusp sub-lords, Jaimini chara karakas, Ashtakavarga bindu scores.
4. **CONTEXTUAL (Weight 0.50)**: Confirmed user life graph events and milestones.
5. **SPECULATIVE (Weight 0.20)**: Heuristic impressions, generic transit weather, ungrounded LLM synthesis.

> **Calculation-derived evidence strictly outranks AI interpretation.**

---

## 3. Contradiction Engine v2 (No Forced Averages)

When analytical systems yield divergent indications:
- DeepAstro **NEVER averages** contradictory indications into a misleading middle ground.
- `ContradictionEngine.resolveContradictionsV2(evidence)` explicitly outputs:
  - **WHAT AGREES**: Mutually concordant factors.
  - **WHAT DISAGREES**: Tension points between systems (e.g., Dasha benefic vs Transit obstacle).
  - **WHY**: Epistemological rationale (e.g., Dasha represents internal psychological harvest; Transit represents external temporal friction).
  - **MORE RELEVANT SYSTEM**: Foundational ranking (Primary dasha takes precedence over secondary transit delays).
  - **TIME WINDOW**: Precise timing breakdown of immediate resistance vs long-term fruition.
  - **UNCERTAINTY DISCLOSURE**: Clear non-fatalistic statement of risks and user agency.

---

## 4. Cross-Provider AI Robustness Evaluation

Identical prompts and calculation snapshots evaluated across:
- **Ollama Provider**: Local, zero-data-leakage model execution.
- **Gemini Provider**: High-reasoning structured JSON extraction.
- **Groq Provider**: Ultra-low latency synthesis with strict JSON schema validation.
- **Deterministic Internal Synthesizer**: Complete offline fallback in air-gapped environments.

**Result**: Irrespective of LLM provider response quality, calculation snapshots, planetary degrees, and canonical rule sets remain 100% invariant and tamper-proof.
