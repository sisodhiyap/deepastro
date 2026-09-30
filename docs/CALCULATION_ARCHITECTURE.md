# DeepAstro Calculation Architecture & Mathematical Contracts

## 1. Overview & Core Mathematical Principles
DeepAstro executes high-precision sidereal astrology based on **Drik Siddhanta** (computational astronomy) verified against Meeus algorithms and Swiss Ephemeris principles.

- **Ephemeris Base:** Astronomy Engine (VSOP87 planetary theory, ELP-2000/82 lunar theory).
- **Ayanamsha:** True Lahiri (Chitra Paksha) computed dynamically as a function of Terrestrial Time ($T$).
- **Single Source of Truth:** `VedicAstroEngine.calculateKundli` acts as the single authoritative pipeline.
- **Divisional Charts (Shodashavargas):** All 16 divisional charts (D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60) are derived using classical Parashari sign-offset algorithms.

---

## 2. Canonical Chart Context Pipeline
```
Raw Birth Input (Date, Time, Location)
            │
            ▼
   NormalizationEngine (Location, Timezone, Geodetic Coordinates)
            │
            ▼
    Astronomical Time (Julian Day, RAMC, Local Sidereal Time)
            │
            ▼
    Lagna / Ascendant Calculation (Spherical Trigonometry)
            │
            ▼
    Planet Positions (Apparent Ecliptic Longitude - Lahiri Ayanamsha)
            │
            ▼
    True Lunar Nodes (Meeus Osculating Ascending & Descending Node)
            │
            ▼
   CanonicalChartContext (D1, D9, D10, Shodashavargas, Vimshottari Dasha)
            │
            ▼
Downstream Consumers (API, Snapshot Store, Frontend, PDF, AI Evidence Graph)
```

---

## 3. Immutability & Anti-Drift Contract
- **No Client-Side Recalculation:** The React frontend consumes `navamsaDeep`, `shodashavargaDetail`, and `dashas` directly from the backend payload.
- **Zero Mock Policy:** Calculation endpoints never substitute hardcoded or sample astrology coordinates.
- **Fingerprinting:** Every calculation receives an immutable SHA-256 fingerprint encompassing coordinates, timestamp, ayanamsha, and engine/rule versioning.
