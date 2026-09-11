# DEEPASTRO PHASE 6 — RULE GROUNDING AUDIT

**Date:** 2026-09-10  
**Phase:** Phase 6 — Jyotish Knowledge Foundation & Source-Grounded Reasoning  
**Status:** PASS  
**Auditor:** Principal Astrological Knowledge Architect & Swarm QA

---

## 1. Executive Summary

Phase 6 implements strict deterministic rule grounding via `JyotishReasoningEngine.ts`. In accordance with Section 8 and Section 19 ("NO EVIDENCE = NO CLAIM"):
- Every rule evaluation must return a typed `RuleEvaluationResult` containing:
  - `rule_id`
  - `rule_version`
  - `conditions` (required checklist)
  - `conditions_met`
  - `conditions_failed`
  - `exceptions`
  - `result`: `QUALIFIED` | `NOT_QUALIFIED` | `INCONCLUSIVE`
  - `evidence_ids`
  - `source_ids`
- When a user asks "Why do I have this yoga?", the engine provides an exhaustive factual breakdown:
  1. What the rule is
  2. Which conditions are required
  3. Which conditions are present
  4. Which planets are involved
  5. Which houses are involved
  6. Which calculation snapshot was used
  7. Which classical source supports the rule
  8. What limitations apply
- Free-form generative AI claims ("AI thinks you have this yoga") are structurally prohibited.

---

## 2. Evaluation Results & State Machine

| Test Scenario | Evaluated Rule | Conditions Required | Conditions Met | Conditions Failed | Final Result |
|:---|:---|:---:|:---:|:---:|:---:|
| Jupiter in 4th, Moon in 1st | `RULE_GAJA_KESARI` | 3 | 3 | 0 | `QUALIFIED` |
| Jupiter in 6th, Moon in 1st | `RULE_GAJA_KESARI` | 3 | 2 | 1 (Not in Kendra) | `NOT_QUALIFIED` |
| Mars in 7th from Lagna | `RULE_KUJA_DOSHA` | 2 | 2 | 0 | `QUALIFIED` |
| Mars in 3rd from Lagna | `RULE_KUJA_DOSHA` | 2 | 1 | 1 (3rd is Upachaya, non-dosha) | `NOT_QUALIFIED` |
| Sun + Mercury conjoined | `RULE_BUDHADITYA` | 2 | 2 | 0 | `QUALIFIED` |
| Missing Moon in Snapshot | `RULE_GAJA_KESARI` | 3 | 0 | 3 | `INCONCLUSIVE` |

---

## 3. Explanation Engine Audit

Query: *"Why do I have Gaja Kesari Yoga?"*

Generated Audit Breakdown:
- **Rule Name:** Gaja Kesari Yoga (`RULE_GAJA_KESARI`)
- **Required Conditions:**
  1. Moon must be placed in a defined house.
  2. Jupiter must be placed in a Kendra (1, 4, 7, 10) from the Moon.
  3. Jupiter must not be deeply combust.
- **Observed Conditions:**
  - Moon in House 1 (Aries).
  - Jupiter in House 4 (Cancer - exalted).
  - Distance: 4th Kendra from Moon.
- **Planets Involved:** Jupiter, Moon.
- **Houses Involved:** House 1, House 4.
- **Snapshot ID:** `snap_test_gaja_kesari`
- **Supported Sources:** `SRC_BPHS` (Brihat Parashara Hora Shastra, Ch. 36)
- **Applicable Limitations:** If Jupiter is afflicted by Rahu/Ketu, yoga effects are delayed or manifest primarily in spiritual intellect rather than material wealth.

---

## 4. Anti-Fabrication ("No Evidence = No Claim") Enforcement

The reasoning engine was stress-tested against ungrounded astrological assertions:
- Unchecked claim: *"Mars causes disaster in career"* without 10th house connection.
  - Gate: `validateClaimIntegrity()`
  - Verdict: **REJECTED (INSUFFICIENT_EVIDENCE)**
- Claim with zero source citations:
  - Gate: `validateClaimIntegrity()`
  - Verdict: **REJECTED (NO_SOURCE_CITATION)**
- Claim referencing a non-existent calculation snapshot:
  - Gate: `validateClaimIntegrity()`
  - Verdict: **REJECTED (INVALID_CALCULATION_SNAPSHOT)**

---

## 5. Certification Conclusion

The Rule Grounding Engine strictly replaces speculative AI hallucinations with deterministic mathematical proofs grounded in canonical Sanskrit treatises.
**Audit Status:** PASS.
