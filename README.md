# DEEPASTRO — Vedic Astrology & Spiritual Intelligence Operating System

> *"Decode Your Life. Discover Your Cosmos."*  
> **Designed & Created by Prashant Sisodhiya**  
> **© 2026 DeepAstro. All Rights Reserved.**

---

## 🌟 Executive Overview

**DeepAstro** is an enterprise-grade full-stack Vedic astrology and spiritual intelligence platform designed like a futuristic luxury observatory. It combines **high-precision deterministic astronomical calculations** (Lahiri Ayanamsha) with **multi-model AI orchestration** (OpenAI, Google Gemini, xAI Grok), zero-leak server-side entitlement security, and an Apple-tier cosmic UI/UX.

---

## 🏛️ Core Product Principles

### 1. Deterministic Calculation as Single Source of Truth
AI models are **strictly prohibited** from inventing planetary positions, houses, nakshatras, dashas, or astronomical timings.
- **Planetary Coordinates**: High-precision Keplerian and sidereal ephemeris (Lahiri Ayanamsha, ~23°51' at J2000 epoch).
- **Ascendant (Lagna)**: Computed from Julian Day, Greenwhich Mean Sidereal Time (GMST), Local Sidereal Time (LST), and geographical latitude/longitude.
- **Divisional Charts**: D1 Rashi, D9 Navamsa (inner potential & spouse), D10 Dashamsha (career).
- **Vimshottari Dasha**: 120-year balance calculated from the Moon's Janma Nakshatra.
- **Ashtakoota Milan**: Traditional 36-point mathematical compatibility (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) + Manglik polarity.
- **Panchang & Muhurat**: Tithi, Vara, Nakshatra, Yoga, Karana, Rahu Kalam, and Shubh Muhurat.

### 2. Multi-Model AI Orchestration & AI Auditor
AI is used exclusively for:
- Empathetic natural-language interpretation.
- Personalized summaries and reports.
- Grounding in classical Vedic treatises (Brihat Parashara Hora Shastra, Phaladeepika, Saravali, Lal Kitab) via RAG.
- **AIAuditor**: A real-time verification guard that inspects AI outputs to ensure they never contradict the deterministic chart, never make dangerous medical/financial guarantees, and append responsible ethical disclaimers.

### 3. Strict Server-Side Astrologer Contact Shield
- **Free Users**: Can discover verified astrologers, read bios, review ratings, specialties, and fees. **Phone, WhatsApp, and Email are scrubbed server-side at the API query/serializer layer**.
- **Premium / Pro Users**: Once upgraded or when a consultation is booked, the API server unmasks the contact details for one-click Call, WhatsApp, and Email access.

---

## 💻 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS with customized cosmic tokens, Lucide Icons.
- **Vedic Renderers**: SVG North Indian diamond chart, South Indian fixed-rashi 12-box grid, and East Indian mandala chart.
- **Backend API**: Express, TypeScript, REST API, JWT authentication, server-side entitlement middleware.
- **AI Mesh**: Local Ollama on-device reasoning (`deepseek-r1:7b`, `llama3.1:latest`, `qwen2.5-coder`), OpenAI (`gpt-4o`), Google Gemini (`gemini-1.5-pro`), and xAI Grok (`grok-beta`) with zero-cost local inference, automatic failover, and resilient fallback synthesis.
- **Database Architecture**: PostgreSQL / Supabase compatible schema with relational integrity across 36 entities and in-memory persistence.
- **Testing**: Vitest automated unit and integration test suites.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=deepastro_cosmic_super_secret_jwt_key_2026

# AI Providers (Optional - resilient scriptural fallback activates automatically if empty)
OPENAI_API_KEY=
GEMINI_API_KEY=
GROK_API_KEY=

# Payments & Storage
PAYMENT_SECRET=sk_test_deepastro_mock_secret
STORAGE_BUCKET=deepastro-assets
```

### 3. Run Automated Tests
```bash
npm test
```
Runs 14 comprehensive tests verifying:
1. Astronomical calculation precision (Julian Day, Lahiri Ayanamsha, Ascendant, 9 planets).
2. Ashtakoota 36-point compatibility scoring.
3. Server-side astrologer contact masking (free user locked vs premium user unlocked).
4. AIAuditor anti-hallucination and safety checks.
5. Ollama local reasoning with DeepSeek-R1, reasoning tag extraction, offline fallback, and zero-cost telemetry.

### 4. Run Development Servers
```bash
npm run dev
```
Starts:
- **Express Backend API**: `http://localhost:5000`
- **Vite React Frontend**: `http://localhost:5173`

---

## 📡 REST API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register new cosmic user |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/auth/me` | `GET` | Required | Current session, profile, and active plan |
| `/api/astrology/kundli` | `POST` | Optional | Deterministic full Kundli calculation |
| `/api/astrology/chart` | `GET` | Optional | User's saved or default chart |
| `/api/astrology/panchang` | `GET` | Public | Live 5 limbs of the day & Rahu Kalam |
| `/api/astrology/muhurat` | `GET` | Public | Auspicious windows for life events |
| `/api/matching/analyze` | `POST` | Public | 36-Point Ashtakoota Milan |
| `/api/numerology/analyze` | `POST` | Public | Life Path, Destiny, and vibrational numbers |
| `/api/palmistry/analyze` | `POST` | Optional | Palm photo upload & vision analysis |
| `/api/astrologers` | `GET` | Optional | Astrologer directory (masked for free users) |
| `/api/astrologers/consultation`| `POST` | Required | Book consultation & unlock direct contact |
| `/api/subscription/plans` | `GET` | Public | Available plans (FREE, PREMIUM, PRO) |
| `/api/subscription/upgrade` | `POST` | Required | Instant subscription upgrade |
| `/api/ai/models` | `GET` | Public | List local Ollama models and cloud engines |
| `/api/ai/chat` | `POST` | Optional | AstroBot chat grounded in Vedic chart data |
| `/api/reports/generate` | `POST` | Optional | Generate PDF-ready archival dossier |
| `/api/admin/metrics` | `GET` | Admin | Real-time telemetry, AI tokens, and cost |
| `/api/admin/feature-flags`| `POST` | Admin | Dynamic feature flag toggles |
| `/api/contact` | `POST` | Public | Inquiries and partnership tickets |

---

## ⚖️ Responsible Astrological Disclaimer

DeepAstro is an astrology and spiritual guidance platform. Astrological interpretations provide symbolic cosmic perspective for personal discernment. DeepAstro makes no claims of guaranteed diagnostic, medical, financial, or legal certainty, and services must never replace professional healthcare or fiduciary counsel.

---

**Designed & Created with celestial passion by Prashant Sisodhiya.**  
*© 2026 DeepAstro. All Rights Reserved.*
