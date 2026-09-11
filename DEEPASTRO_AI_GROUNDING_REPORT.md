# DEEPASTRO AI GROUNDING & SAFETY REPORT
================================================================================
**Release Stage:** AI Synthesis, Epistemic Grounding & Citation Audit  
**Status:** FULL PASS  

---

## 1. Core Principle: Immutable Epistemic Hierarchy
DeepAstro operates strictly according to the hierarchical flow:
```
CALCULATION SNAPSHOT (Ground Truth)
        ↓
INDEPENDENT VERIFICATION
        ↓
VERSIONED ASTROLOGICAL RULES
        ↓
KNOWLEDGE / SOURCES (BPHS, Jaimini, Phaladeepika)
        ↓
USER-CONFIRMED CONTEXT
        ↓
APPROVED WORLD RESEARCH
        ↓
AI SYNTHESIS
        ↓
SAFETY / FACT / EVIDENCE AUDIT
        ↓
USER RESPONSE
```

Under NO circumstance is an AI model allowed to modify, override, or invent astronomical data. If an AI interpretation conflicts with deterministic calculation, **CALCULATION WINS**.

---

## 2. Evidence-Bound Read-Only Context Packet
When AI synthesis is invoked (via Anthropic, OpenAI, or local Ollama), it is supplied with an immutable, read-only evidence packet:
```json
{
  "chartFacts": {
    "ascendant": "Pisces (324.12°)",
    "moon": "Cancer (98.45°)",
    "sun": "Scorpio (217.30°)",
    "planets": [...]
  },
  "calculationPassport": {
    "fingerprint": "7f9a2b8e...",
    "ayanamsha": "Lahiri (Chitra Paksha)",
    "ephemeris": "VSOP87 / ELP-2000"
  },
  "verifiedRules": [
    { "ruleId": "GAJA_KESARI_YOGA", "source": "BPHS Ch. 35", "status": "QUALIFIED" }
  ],
  "userConfirmedContext": [...],
  "contradictions": [...]
}
```

The AI model cannot write to:
- Calculation tables
- Rule definitions
- Prediction ledger
- Life Graph nodes (unless user explicitly clicks "Save Event")

---

## 3. Post-Generation Multi-Stage Audit (`AIAuditor`)
Every AI-generated response passes through an automated validation gauntlet:
1. **Fact Audit**: Validates that all referenced planets, signs, and houses match the calculation snapshot. If the AI hallucinated an incorrect sign for Jupiter, the claim is rejected.
2. **Source Audit**: Classical citations must correspond to indexed knowledge objects. Fabricated scripture chapters or pseudo-Sanskrit verses trigger rejection.
3. **Calculation Consistency Audit**: Planetary longitudes, combustion statuses, and retrogrades mentioned in the text are matched against the passport.
4. **Safety & Medical/Financial Audit**: Checks for fatalistic claims, medical diagnoses, legal guarantees, or definitive death predictions. Phrases like "will definitely" or "guaranteed wealth" are rewritten or rejected.
5. **Prompt Injection Audit**: Detects attempts to alter birth data or reveal system prompt constraints.

---

## 4. Epistemic Status Labeling
All insights rendered in the UI or report are tagged with their authentic epistemic tier:
- `CALCULATED`: Direct mathematical output from VSOP87/ELP-2000 algorithms.
- `VERIFIED`: Confirmed by cross-engine differential validation.
- `CLASSICAL INTERPRETATION`: Grounded in BPHS, Jaimini Sutras, or Saravali.
- `USER-CONFIRMED`: Events or context explicitly acknowledged by the user.
- `AI SYNTHESIS`: Natural-language contextual explanation of qualified factors.
- `INCONCLUSIVE`: When contradictory evidence exists across Parashari/Jaimini/KP systems.

Zero claims are presented as "scientific proof" of astrological fate. The platform communicates probabilistic tendencies and evolutionary mindfulness.
