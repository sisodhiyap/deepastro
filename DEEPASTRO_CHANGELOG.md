# DEEPASTRO 2.0 — CHANGELOG & MIGRATION RECORD
**Product: DeepAstro — "Decode Your Life. Discover Your Cosmos."**
**Designed & Created by Prashant Sisodhiya | © 2026 DeepAstro. All Rights Reserved.**

---

## [2.0.0] — 2026-09-04

### Added
* **Universal Canonical Fact Set (`AstrologyFactSet`)**:
  * Established canonical, read-only immutable data object containing complete astronomical facts, divisional charts, dasha timelines, and transits.
  * Added `createAstrologyFactSet()` to `VedicAstroEngine`.
* **Divisional Charts (Shodashvarga)**:
  * Implemented BPHS-verified mathematical calculations for D1, D2 (Hora), D3 (Drekkana), D4 (Chaturthamsha), D7 (Saptamsha), D9 (Navamsa), D10 (Dashamsha), D12 (Dwadashamsha), D16 (Shodashamsha), D20 (Vimshamsha), D24 (Chaturvimshamsha), D27 (Saptavimshamsha), D30 (Trimshamsha), and D60 (Shashtiamsha).
* **3-Level Vimshottari Dasha Engine**:
  * Added nested Pratyantardasha timeline calculation with exact date ranges.
* **Dynamic Gochara Transit Engine (`TransitEngine`)**:
  * Live transit calculation evaluated dynamically at runtime against natal Lagna and Moon sign.
  * 3-phase Sade Sati tracker (Rising, Peak, Setting) and classical planetary drishti (aspects).
* **11-Domain Prediction Engine (`PredictionEngine`)**:
  * Generates grounded forecasts across Career, Love, Marriage, Finance, Education, Health, Family, Spirituality, Business, Travel, and Personal Growth with explicit astrological citations.
* **4-Layer AI Auditor 2.0 (`AIAuditor`)**:
  * Layer 1: Astronomy Auditor (verifies Lagna, Moon, Sun, and Dasha lord against calculation engine).
  * Layer 2: Temporal Auditor (verifies calendar dates and transit windows).
  * Layer 3: Safety & Ethics Auditor (eliminates fatalistic claims, medical diagnosis, and prompt injection).
  * Layer 4: Citation & Evidence Auditor (ensures factual planetary backing).
  * Raw Chain-of-Thought (`<think>`) tag sanitization to prevent internal reasoning leakage.
* **Privacy Center & Cosmic Data Vault (`privacyRoutes.ts`, `ProfilePage.tsx`)**:
  * Endpoints for downloading sovereign user data (`GET /api/privacy/export`) and irreversible data purging (`DELETE /api/privacy/delete-all`).
* **Admin Command Center Upgrades**:
  * Provider health monitoring for OpenAI, DeepSeek, OpenRouter, Gemini, Grok, and Ollama.
  * Compute telemetry clearly distinguishing Cloud API Cost from On-Device Compute ($0 API Cost).

### Preserved & Upgraded
* Backward compatibility for all existing routes and calculation calls.
* All 20 regression and unit tests in `tests/` passing green.
* Brand identity, cosmic design system, and astrologer contact shield.
