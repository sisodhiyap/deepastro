# DEEPASTRO 3.1 — CONTEXT MODEL SPECIFICATION

## 1. Personal Context Priority Hierarchy
To prevent cognitive overload and prompt context dumping, `ContextRelevanceEngine` ranks context items according to strict epistemic and sovereign boundaries:

```
RANK 1: USER-CONFIRMED CURRENT GOAL
RANK 2: USER-CONFIRMED RECENT EVENT
RANK 3: USER PREFERENCE
RANK 4: USER-CONFIRMED HISTORICAL EVENT
RANK 5: CALCULATED ASTRONOMICAL FACT
RANK 6: CLASSICAL INTERPRETATION / SUTRA
RANK 7: APPROVED WORLD FACT
RANK 8: AI SUGGESTION / UNCONFIRMED ASSUMPTION
```

### Invariant Rules:
1. **Zero Unconfirmed Facts**: An AI suggestion (Rank 8) can **never** outrank a user-confirmed fact (Rank 1–4) or a calculated astronomical coordinate (Rank 5).
2. **Relevance Gating**: Items outside the domain of the user's active inquiry are pruned before evidence compilation.
3. **Recency Weighting**: Recent milestones and active goals carry higher dynamic weighting than distant historical events.

## 2. "What Changed?" Longitudinal Tracking
Returning users receive transparent continuity via `WhatChangedEngine`:
- Compares previous reading snapshot against the current snapshot.
- Tracks:
  - Moon nakshatra and planetary transit progressions.
  - Dasha / Antardasha cycle transitions.
  - New goals established or evolved.
  - Newly confirmed life milestones.
  - Recorded outcome feedback.
