# DEEPASTRO 3.1 — REASONING ENGINE SPECIFICATION

## 1. Question $\to$ Reasoning Plan
Every complex question submitted to `IntelligenceOrchestrator` begins by generating a structured `ReasoningPlan`:
- **`intent`**: Classified primary and secondary domain.
- **`timeHorizon`**: Immediate, this week, 3M, 6M, 1Y, 5Y, or historical.
- **`lifeDomain`**: Career, Relationship, Relocation, Health, Spiritual, etc.
- **`requiredFacts`**: Essential planetary and chart markers.
- **`requiredEngines`**: Dynamically selected sub-engines (e.g. `DecisionIntelligenceEngine` triggered only when choices exist).
- **`requiredSources`**: Brihat Parashara Hora Shastra, Jaimini Upadesha Sutras, Phaladeepika.
- **`requiredHistory`**: Flag indicating if longitudinal life events are necessary.
- **`requiredWorldResearch`**: Flag indicating if consented relocation/macro facts are required.
- **`possibleContradictions`**: Anticipated system divergences (e.g. Dasha vs Transit friction).
- **`confidenceRequirements`**: Baseline threshold for answering.

## 2. Ephemeral Context Graph
`ContextGraphEngine` models the reasoning space as an in-memory graph:
- **Node Types**: `USER`, `PROFILE`, `CALCULATION`, `DASHA`, `TRANSIT`, `VARGA`, `RULE`, `EVIDENCE`, `LIFE_EVENT`, `GOAL`, `DECISION`, `PREDICTION`, `OUTCOME`, `WORLD_FACT`, `QUESTION`, `PREFERENCE`.
- **Edge Types**: `RELEVANT_TO`, `OCCURRED_DURING`, `SUPPORTS`, `CONTRADICTS`, `CORRELATES_WITH`, `PRECEDES`, `FOLLOWS`, `ACTIVATES`, `CONFIRMS`, `WEAKENS`, `RELATED_TO`.
- **Primary Invariant**: *Correlation is explicitly distinguished from causation.* Astrological alignments reflect synchronistic, contextual indications, not fatalistic mechanics.

## 3. Answerability States
The engine avoids hallucinating answers for incomplete or ungrounded queries by assigning an explicit `AnswerabilityStatus`:
- `ANSWERABLE`: Sufficient evidence and unambiguous query.
- `PARTIALLY_ANSWERABLE`: General direction clear, but specific worldly details unknown.
- `NEEDS_CLARIFICATION`: Query is underspecified (e.g., "Will I get this exact job?"). The engine prompts at most 1–3 high-value questions, prioritizing the single most informative question first.
- `INSUFFICIENT_EVIDENCE`: Less than 2 grounded signals available.
- `CONTRADICTORY`: Significant divergence across major classical systems requiring comparative presentation rather than manufactured consensus.
- `UNAVAILABLE`: Service or contextual dependency offline.
