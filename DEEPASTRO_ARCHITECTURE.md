# DEEPASTRO 2.0 — MASTER ARCHITECTURE SPECIFICATION
**Product: DeepAstro — "Decode Your Life. Discover Your Cosmos."**
**Designed & Created by Prashant Sisodhiya | © 2026 DeepAstro. All Rights Reserved.**

---

## 1. System Overview & Philosophy

DeepAstro 2.0 is a dual-core spiritual intelligence and deterministic Vedic astrology platform built on high-precision astronomical computation, multi-model AI mesh orchestration, and bank-grade privacy controls.

```text
                                  +---------------------------------------+
                                  |           DEEPASTRO 2.0 UI            |
                                  | React 19 + Vite 6 + Tailwind 3.4.17   |
                                  +-------------------+-------------------+
                                                      |
                                              REST / JSON (JWT)
                                                      |
                                  +-------------------v-------------------+
                                  |       EXPRESS 4.21 API GATEWAY        |
                                  |  RBAC, IDOR Shield, Rate Limiting     |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
   +-----------------v------------------+                            +-----------------v------------------+
   |    DETERMINISTIC VEDIC ENGINE      |                            |    AI MULTI-MODEL ORCHESTRATOR    |
   |                                    |                            |                                    |
   | • Lahiri Ayanamsha (Chitra Paksha) |                            | • OpenAI GPT-4o                    |
   | • Ascendant, Bhavas & Navagrahas   |                            | • DeepSeek-R1 (CoT-Sanitized)      |
   | • Shodashvarga (D1 .. D60 BPHS)   |      Canonical Immutable    | • OpenRouter Mesh Router           |
   | • 3-Level Vimshottari Dashas       | ---- AstrologyFactSet ---> | • Local Ollama Engine ($0 API)     |
   | • Dynamic Transit (Gochara) Engine |                            | • 4-Layer AIAuditor                |
   | • 11-Domain Prediction Engine      |                            | • Scriptural Knowledge RAG         |
   | • Ashtakoota 36-Pt Matching        |                            +-----------------+------------------+
   | • Panchang (5 Limbs) & Muhurats    |                                              |
   +------------------------------------+                                              |
                     |                                                                 |
                     +-----------------------------------------------------------------+
                                                      |
                                                      v
                                      +-------------------------------+
                                      |     DATABASE & VAULT LAYER    |
                                      |  In-Memory / SQLite Persistent|
                                      |  EntitlementService & GDPR    |
                                      +-------------------------------+
```

---

## 2. Universal Astrology Fact Set (AstrologyFactSet)

Downstream modules (AstroBot, PDF Dossier Reports, Domain Predictions, Kundli Matching) **NEVER** compute astrology independently or query ungrounded LLMs. All features consume the canonical, immutable `AstrologyFactSet`:

* **Identity & Verification**: SHA-256 calculation hash, UTC/Local timestamps, engine version tag.
* **Astronomy Grounding**: Julian Day, Lahiri Ayanamsha degrees, obliquity, sidereal time.
* **Lagna & Navagraha Coordinates**: Exact degrees, signs, nakshatras, padas, dignities, combustion, and retrograde state.
* **12 Bhavas**: Sripati/Equal house boundaries with planetary occupants.
* **Shodashvarga Divisional Charts**: Complete D1, D2 (Hora), D3 (Drekkana), D4 (Chaturthamsha), D7 (Saptamsha), D9 (Navamsa), D10 (Dashamsha), D12, D16, D20, D24, D27, D30, and D60 (Shashtiamsha) calculated mathematically according to Maharishi Parashara's BPHS.
* **3-Level Vimshottari Timeline**: Mahadasha, Antardasha, and dynamic Pratyantardashas with exact start/end dates.
* **Dynamic Gochara Transits**: Live transit positions cross-referenced with natal Lagna and Moon, including 3-phase Sade Sati analysis and classical planetary Drishti (aspects).
* **Panchang Coordinates**: Tithi, Vara, Nakshatra, Yoga, Karana, Rahu Kalam, Yamaganda, Gulika, and Abhijit Muhurat.

---

## 3. High-Security Environment Loading (`key.env`)

* **Zero-Leakage Guarantee**: Loaded strictly on the backend by `EnvLoader.load()`.
* **Exclusion from Client Bundles**: Neither Vite nor React code references API keys.
* **Redacted Diagnostics**: The `/api/ai/connections` endpoint returns masked keys (`••••••••` with leading/trailing characters) and connection status codes without exposing raw secrets.

---

## 4. Astrologer Marketplace & Contact Shield

* **Free & Unauthenticated Users**: View certified astrologer profiles with phone numbers, WhatsApp, and emails fully masked.
* **Entitled / Pro Users**: Unmasking is verified by server-side `EntitlementService` and consultation booking authorization.
* **Direct IDOR Protection**: Attempting to query raw astrologer contact endpoints returns sanitized records unless authenticated with appropriate entitlements.

---

## 5. Performance, Caching & Bundle Structure

* **Frontend Build**: Single-page application bundled with Vite 6, using code splitting for heavy modules (`jspdf`, `lucide-react`, `chart visualizers`).
* **Deterministic Calculations**: Sub-millisecond execution for astronomical positions and divisional charts.
* **AI Fallback Chain**: Primary Provider (OpenAI/DeepSeek) $\rightarrow$ Secondary (Gemini/Grok) $\rightarrow$ OpenRouter $\rightarrow$ Local Ollama Engine.
