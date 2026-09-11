# DEEPASTRO RESEARCH ENGINE & PROVENANCE AUDIT REPORT
**Version:** 2.0.0-RC  
**Date:** September 10, 2026  
**Module:** `WorldResearchAgent` & Provenance Graph  

---

## 1. Engine Objective & Scope
The World Research Engine enables DeepAstro to ingest current, public, real-world context (industry trends, macro-economic climate, public regulatory shifts, technological transitions) to enrich personal Jyotish readings when external factors directly impact the native's career or business question.

---

## 2. Core Privacy & Consent Controls

### 2.1 Explicit User Consent Gate
External research is completely barred unless the user explicitly grants permission:
```typescript
if (!request.allowPublicResearch) {
  return {
    status: 'CONSENT_DENIED',
    claims: [],
    sources: [],
    privacyNotes: 'Public research was skipped because user consent was not granted.'
  };
}
```
If `allowPublicResearch === false`, zero external queries are executed, zero external network requests are dispatched, and the reading relies solely on verified calculation and user-provided memory.

### 2.2 Anti-Surveillance & Sensitive Information Defense
The engine includes a strict rejection filter against surveillance, personal background snooping, credit checks, and private intelligence gathering. Queries containing sensitive personal tokens (e.g., social security, credit history, criminal records, private medical records) are immediately flagged and returned with `status: 'SKIPPED'` and privacy notifications.

---

## 3. Strict Separation: `WORLD_FACT` vs `JYOTISH_FACT`

To prevent AI hallucination or contamination of classical doctrine, DeepAstro Brain enforces strict ontological boundaries:
- **`ASTRONOMICAL_FACT`**: Planetary positions, Ascendant degree, Ayanamsha, House cusps (from `CalculationSnapshot`).
- **`CLASSICAL_RULE`**: Classical Jyotish aphorisms from BPHS, Phaladeepika, Jaimini Upadesha Sutras.
- **`WORLD_FACT`**: Public market, industry, or macro context retrieved by `WorldResearchAgent`.
- **`USER_CONFIRMED_MEMORY`**: Explicitly shared user life events, preferences, and goals.
- **`AI_SYNTHESIS`**: Linguistic integration uniting the above with confidence scores.

A `WORLD_FACT` can **never** be cited as astrological evidence, and an astrological planetary transit can **never** be cited as an external world fact.

---

## 4. Provenance Metadata
Every piece of external evidence stored or displayed in the UI contains:
- **`source`**: Publishing organization or domain.
- **`retrievedAt`**: ISO timestamp of retrieval.
- **`claim`**: Concise, factual summary of the external development.
- **`relevance`**: Explanation of why this fact connects to the native's question.
- **`confidence`**: `HIGH` | `MODERATE` | `LOW`.

---

## 5. Verification & Test Evidence
Tested and verified in `tests/deepastroBrainV2.test.ts`:
1. `returns CONSENT_DENIED when allowPublicResearch is false` -> **PASS**
2. `executes public research with full provenance when allowPublicResearch is true` -> **PASS**
3. `refuses sensitive or surveillance search terms safely` -> **PASS**
