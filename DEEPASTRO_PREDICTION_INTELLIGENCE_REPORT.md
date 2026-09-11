# DEEPASTRO PREDICTION INTELLIGENCE & EVIDENCE GRAPH REPORT
**Version:** 2.0.0-RC  
**Date:** September 10, 2026  
**Module:** `CuratedPredictionEngine`, `PredictionEvidenceGraph`, & `DecisionSimulationEngine`  

---

## 1. Core Philosophy of Prediction
DeepAstro rejects deterministic fatalism and fortune-telling claims. Predictions are framed strictly as **evidence-backed probabilistic Jyotish indications** grounded in planetary positions, dasha cycles, transits, and user context.

> **Absolute Rule**: DeepAstro never claims 100% accuracy, scientific proof, or guaranteed future events.

---

## 2. 10-Point Structured Response Architecture
Every substantial consultation synthesized by `DeepAstroBrain` conforms to a standardized 10-point format:
1. **Direct Answer**: Concise, respectful addressal of the core question.
2. **What Your Chart Indicates**: Primary classical indications based on relevant Bhavas, Grahas, and Rashis.
3. **Supporting Factors**: Specific astrological placements providing positive momentum.
4. **Timing Indications**: Active Vimshottari Mahadasha/Antardasha and transit windows.
5. **Other Relevant Systems**: Jaimini Karakas, KP sub-lords, or Numerology cycles if applicable.
6. **Personal Context Alignment**: How chart indicators intersect with user-confirmed goals and life milestones.
7. **Practical Interpretation**: Grounded, actionable perspective for daily life.
8. **Uncertainties & Caveats**: Explicit discussion of counter-indications, tensions, or missing birth data precision.
9. **Suggested Next Steps**: Practical suggestions, mindfulness practices, or non-coercive traditional remedies.
10. **Why This Reading (Evidence & Provenance)**: Transparent audit log detailing calculations, Grahas, rules, and sources used.

---

## 3. The Prediction Evidence Graph
Every reading produces a structured `PredictionEvidenceGraph` establishing an unbroken chain of custody:

```
[User Question]
       │
       ▼
[Identified Intent & Relevant Houses]
       │
       ▼
[CalculationSnapshot Hash] ───▶ [Planets & Dignities] ───▶ [Classical Rules]
       │                                                         │
       ▼                                                         ▼
[Active Dasha / Antardasha] ─────────────────────────────▶ [Transit Overlay]
       │                                                         │
       ▼                                                         ▼
[Multi-System Factors: Jaimini / KP / Numerology]                │
       │                                                         │
       ▼                                                         ▼
[Contradiction Engine: Tensions & Nuances] ◀─────────────────────┘
       │
       ▼
[Final Synthesized Reading with Confidence Metrics]
```

### Confidence Metric Dimensions (Non-Percentage)
To eliminate misleading percentages (e.g. "97% accurate"), DeepAstro uses 5 discrete qualitative dimensions:
- `astronomicalConfidence`: `VERIFIED` | `HIGH` | `MODERATE` | `LOW` | `INSUFFICIENT`.
- `ruleConfidence`: Degree of classical textual consensus.
- `timingConfidence`: Alignment between Dasha period and Gochar transits.
- `interpretationConfidence`: Overall synthesis coherence.
- `outcomeEvidenceConfidence`: Historical native correlation weight.

---

## 4. Counterfactual Decision Simulator (`DecisionSimulationEngine.ts`)
Users frequently face crossroads: *Should I stay in my job or launch a startup? Should I move to London or remain in Bengaluru?*

The Decision Simulator:
1. Evaluates Option A against relevant Bhavas, Dasha rulers, and current transits.
2. Evaluates Option B against alternative Bhavas, relocation horizon shifts, and timing factors.
3. Weighs supporting factors vs friction points for each option.
4. Emphasizes that astrology describes environmental currents and personal temperaments, but personal responsibility and real-world execution decide the outcome.
5. Delivers zero fatalistic directives.

---

## 5. Verification & Test Evidence
Validated across all scenarios in `tests/deepastroBrainV2.test.ts`:
- Master orchestration produces all 10 response sections.
- `whyThisReading` contains verifiable graha positions and rule citations.
- Counterfactual simulator accurately contrasts Option A and Option B without fatalism.
