# DEEPASTRO 2.0 — KUNDLI INGESTION & CALCULATION PIPELINE
**Product: DeepAstro — "Decode Your Life. Discover Your Cosmos."**
**Designed & Created by Prashant Sisodhiya | © 2026 DeepAstro. All Rights Reserved.**

---

## 1. End-to-End Pipeline Architecture

```text
[ USER INPUT ]
  ├── 1. Manual Form Entry (Name, Date, Time, Place, Coordinates)
  ├── 2. Image Upload (PNG, JPEG, WEBP)
  └── 3. PDF Ingestion (Digital or Scanned Kundli Dossier)
          │
          ▼
[ MULTI-TIER FILE VALIDATION ]
  ├── 15MB File Size Limit Check
  ├── Magic-Byte Header Verification (PDF: %PDF-, PNG: \x89PNG, JPG: \xFF\xD8\xFF)
  ├── Malformed / Encrypted Document Interception
  └── File Extension & MIME Type Consistency
          │
          ▼
[ EXTRACTION & OCR LAYER ]
  ├── Digital PDF: Direct PDF Text Extraction (Extracts full birth strings)
  └── Scanned/Image: Vision Model Extraction (OpenAI / DeepSeek / Ollama)
          │
          ▼
[ FIELD-LEVEL CONFIDENCE MATRIX ]
  ├── Name: Confidence Score %
  ├── Birth Date: Confidence Score %
  ├── Birth Time: Confidence Score %
  ├── Birth Place: Confidence Score %
  ├── Latitude / Longitude: Confidence Score %
  └── Timezone: Confidence Score %
          │
          ▼
[ REVIEW YOUR BIRTH DETAILS SCREEN ]
  ├── Display Extracted Data with Badges (HIGH >=95%, GOOD 80-94%, REVIEW <80%)
  ├── Location Disambiguation (Resolves Delhi, India vs Delhi, USA)
  ├── Editable Controls for Manual Correction
  └── Mandatory Gate: "CONFIRM & CALCULATE"
          │
          ▼
[ DETERMINISTIC VEDIC ASTROLOGY ENGINE ]
  ├── Lahiri Ayanamsha (Chitra Paksha)
  ├── Julian Day UT & Local Sidereal Time (LST)
  ├── Ascendant (Lagna) & 12 Bhavas
  ├── 9 Navagrahas (Degrees, Signs, Retrograde, Combustion)
  ├── Complete Shodashvargas (D1 .. D60 BPHS)
  ├── 3-Level Vimshottari Dasha (Mahadasha, Antardasha, Pratyantardasha)
  ├── Real-Time Gochara Transits & Sade Sati
  ├── Yogas, Doshas & Evidence-Based Remedies
  └── Panchang (5 Limbs) & Shubh Muhurats
          │
          ▼
[ IMMUTABLE CANONICAL FACT SET (AstrologyFactSet) ]
  └── Read-only distribution to AstroBot, Reports, and Predictions
```

---

## 2. Confidence Tier Rules

* **$\ge$ 95% — High Confidence**: Values extracted with absolute clarity from structured digital text.
* **80% – 94% — Good**: Reliable extraction with standard document variance.
* **60% – 79% — Review Required**: Highlighted with amber badges in the Review Modal; user confirmation requested.
* **$<$ 60% — Low Confidence**: Flagged in red; user must verify or edit prior to chart generation.
