# DeepAstro Engine Registry & Cryptographic Data Lineage Architecture

## Overview

The DeepAstro prediction platform operates under strict **Data Lineage & Provenance Governance**. In accordance with the DeepAstro Constitution:
- **Astrological calculations are the sole authority.**
- **Artificial Intelligence serves only as a natural-language explanatory layer.**
- **Zero generic or hallucinated astrological claims are permitted.**

Every statement in a Future Intelligence forecast is mathematically traceable through an unbroken chain of cryptographic hashes back to the user's canonical Kundli calculation snapshot.

---

## 1. The 20 DeepAstro Authority Calculation Engines

The table below describes all engines registered in `DEEPASTRO_ENGINE_REGISTRY` (`server/src/intelligence/future-intelligence/EngineRegistry.ts`):

| # | Engine ID | Engine Name | Version | Calculation Type | Prediction Contribution |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `D1_RASHI` | Natal D1 Rashi Chart Engine | `1.0.0-canonical` | Astronomical Sidereal | Primary baseline: planetary sign longitudes and house positions |
| 2 | `LAGNA` | Topocentric Ascendant Engine | `1.0.0-canonical` | Topocentric Coordinate | Establishes the 12-house framework from geographic latitude/longitude |
| 3 | `TRUE_NODE` | Meeus Astronomical True Node Engine | `1.0.0-canonical` | Astronomical Vector | True apparent orbital nodes (Rahu/Ketu) with accurate retrograde rates |
| 4 | `NAKSHATRAS` | 27-Nakshatra & 108-Pada Engine | `1.0.0-canonical` | Sidereal Arc Division | Subconscious psychology, moon sign, and KP stellar rulers |
| 5 | `VIMSHOTTARI_DASHA` | 120-Year Vimshottari Cycle Engine | `1.0.0-canonical` | Classical Time-Division | Primary chronological clock: Mahadasha, Antardasha, Pratyantardasha |
| 6 | `VARGAS_D1_D60` | Divisional Shodashavarga Engine | `1.0.0-vargas` | Harmonic Division | Harmonic domain attribution: D2, D3, D4, D9, D10, D12, D20, D24, D30, D60 |
| 7 | `KP_STELLAR` | Krishnamurti Paddhati Cusp Engine | `1.0.0-kp` | Cuspal Sub-Lord | Evaluates primary and supporting cusp sub-lords for life event timing |
| 8 | `YOGAS` | Parashari & Jaimini Yoga Engine | `1.0.0-yoga` | Classical Combinatorial | Identifies 30+ Raja, Dhana, and specialty yogas |
| 9 | `DOSHAS` | Vedic Affliction Analysis Engine | `1.0.0-dosha` | Affliction Logic | Evaluates Sade Sati phases, Manglik status, and Kaal Sarp patterns |
| 10 | `PLANET_STRENGTH` | Planetary Dignity & Potency Engine | `1.0.0-strength` | Multi-Factor Scoring | Scales event magnitude based on exaltation, own sign, and friendship |
| 11 | `SHADBALA` | 6-Fold BPHS Strength Engine | `1.0.0-shadbala` | Classical Multi-Factor | Sthana, Dig, Kala, Cheshta, Naisargika, and Drik bala scoring |
| 12 | `ASHTAKAVARGA` | BAV & SAV 337-Bindu Matrix Engine | `1.0.0-ashtakavarga` | Bindu Tally Matrix | Evaluates transit house potency (>28 supportive, <25 requiring discipline) |
| 13 | `JAIMINI` | Chara Karaka & Arudha Lagna Engine | `1.0.0-jaimini` | Degree-Sorted Karaka | Evaluates Atmakaraka (soul), Amatyakaraka (career), Darakaraka (partnerships) |
| 14 | `HOUSES` | 12 Bhava Whole Sign Engine | `1.0.0-canonical` | Spatial Astrological | Governs life domains: 1st (self) to 12th (liberation/foreign) |
| 15 | `ASPECTS_DRISHTI` | Classical Vedic Aspect Engine | `1.0.0-canonical` | Angular Planetary Drishti | Special aspects: Saturn (3, 10), Mars (4, 8), Jupiter (5, 9) |
| 16 | `NUMEROLOGY` | Chaldean Personal Year/Month Engine | `1.0.0-numerology` | Pythagorean / Chaldean | Secondary confirmation: personal year cycles (1 through 9) |
| 17 | `REMEDIES` | Vedic Planetary Remediation Engine | `1.0.0-remedy` | Upaya Classical | Recommends constructive mantras, lifestyle adjustments, and mindfulness |
| 18 | `GOCHARA_TRANSIT` | Sidereal Ephemeris Transit Engine | `1.0.0-gochara` | VSOP87 / ELP-2000 | Computes planetary coordinates for any future calendar date |
| 19 | `CONTRADICTION` | Dual Signal Dialectic Engine | `1.0.0-contradiction` | Signal Analysis | Preserves simultaneous contradictory signals without naive averaging |
| 20 | `TAROT` | Archetypal Tarot Card Engine | `1.0.0-tarot` | Symbolic Archetype | OPTIONAL: Only consumed when explicit tarot spreads exist |
| 21 | `PALMISTRY` | Hand Morphology & Line Engine | `1.0.0-palmistry` | Physical Feature | OPTIONAL: Only consumed when palm image analyses exist |

---

## 2. Cryptographic Data Lineage Contract

When a forecast is generated, `ChartContextResolver` constructs a `PredictionDataLineage` object:

```typescript
export interface EngineLineageItem {
  engineId: string;
  engineVersion: string;
  inputHash: string;   // SHA-256 slice of input parameters
  outputHash: string;  // SHA-256 slice of engine output
  consumed: boolean;   // true if passed into prediction synthesis
  relevance: string;   // specific astrological role in forecast
}

export interface PredictionDataLineage {
  chartId: string;
  userId: string;
  calculationFingerprint: string; // Master chart calculation SHA-256
  calculationVersion: string;     // e.g. CALC_V6_CANONICAL
  predictionVersion: string;      // e.g. FUTURE_INTELLIGENCE_V1
  engines: EngineLineageItem[];   // array of all consumed engine hashes
  generatedAt: string;            // ISO timestamp
}
```

### Determinism Rule:
Given the same birth profile, identical calculation fingerprints are produced:
$$\text{SHA-256}(Date, Time, Lat, Lon, Timezone, Ayanamsha) \implies \text{Fingerprint}$$

If any parameter mutates (e.g. birth time altered by 1 minute), the fingerprint changes, invalidating any cached forecast and triggering a recalculation.

---

## 3. The Evidence Graph Architecture

Every life domain forecast (Career, Finance, Relationships, Health, Family, Education, Travel, Spirituality) is backed by an explicit array of `PredictionEvidence` items:

```typescript
export interface PredictionEvidence {
  source: EvidenceSource;         // 'D1' | 'D9' | 'D10' | 'VARGA' | 'DASHA' | 'TRANSIT' | 'KP' | 'JAIMINI' | 'SHADBALA' | 'ASHTAKAVARGA' | 'NUMEROLOGY' | ...
  engineVersion?: string;
  rule: string;                   // Classical or stellar rule identifier
  entity?: string;                 // Planet, House, Cusp, or Sign
  value: string;                  // Detailed finding text
  weight: number;                 // Relative significance (0.05 to 0.50)
  direction: EvidenceDirection;   // 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL'
  startDate?: string;
  endDate?: string;
  peakDate?: string;
}
```

### Hierarchy of Signal Authority:
1. **Natal Kundli & Lagna (D1):** The non-negotiable anchor. No prediction can contradict foundational D1 capacity.
2. **Vimshottari Dasha:** The primary temporal gatekeeper. If the Dasha does not authorize an event, transits cannot force it.
3. **Divisional Vargas (D2–D60):** Domain-specific harmonic filters. D9 refines relationships; D10 refines career; D24 refines learning.
4. **KP Stellar Sub-Lords:** Cusp-level precision. Sub-lords confirm or deny specific event promises.
5. **Gochara Transits:** The trigger mechanism. Transits indicate the seasonal timing of events authorized by Dasha and Varga.
6. **Ashtakavarga & Shadbala:** Quantitative strength verification. A planet weak in Shadbala or transiting a house with low SAV bindus (<25) produces struggle rather than effortless gain.
7. **Jaimini Chara Karakas:** Archetypal soul orientation. Atmakaraka confirms spiritual growth; Amatyakaraka confirms career milestones.
8. **Numerology (Personal Year/Month):** Secondary contextual confirmation. Never overrides primary Vedic signals.

---

## 4. Zero Generic Fallback Guarantee

The system strictly enforces:
- If a user requests a prediction without an authenticated session or valid birth profile, the system responds with HTTP `422 PREDICTION_CONTEXT_INCOMPLETE` and returns the missing engine list.
- Under no circumstances does the engine default to Sun Signs, Moon Sign daily horoscopes, or static pre-written paragraphs.
- Every prediction paragraph is generated strictly from the active year's `evidence` array.
