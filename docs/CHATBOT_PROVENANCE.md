# Chatbot Data Provenance & Evidence Graph

## 1. Evidence Tracking
Every response returned by `UniversalChatService` contains a complete `evidenceDrawer` object detailing:
- `ruleApplied`: Theoretical or computational framework used.
- `deterministicCalculations`: Raw calculator outputs.
- `externalSources`: Sourced entities (e.g. Open-Meteo, NSE, Livemint, Classical KP Tables).
- `factCheckStatus`: Verification tier.
- `confidenceScore`: Grounded empirical score.

## 2. Card Metadata
Every generated card carries:
- `id`: Snapshot trace ID.
- `version`: Version stamp.
- `updatedAt`: Formatted timestamp with timezone.
- `provenanceStatus`: Integrity classification tag.
