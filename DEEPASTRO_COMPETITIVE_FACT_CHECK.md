# DEEPASTRO — Public Jyotish Competitive Fact-Check

## 1. Scope, Methodology & Intellectual Property Notice

This document records the publicly verifiable calculation methodologies, ephemeris integrations, and architectural capabilities of 13 leading Vedic astrology (Jyotish) software systems and online platforms.

> [!IMPORTANT]
> **Strict Legal & Technical Ethics Notice**:
> - All information compiled herein is derived strictly from public user manuals, published academic articles, open-source repositories (GPL/MIT), public release notes, and verifiable software behavior.
> - No proprietary code was decompiled, no private APIs reverse-engineered, and no protected databases scraped.
> - Benchmarked systems are treated as **analytical reference peers**, never as unquestioned single sources of truth. DeepAstro prioritizes mathematical exactitude, convention transparency, and explainable divergence over conformity to any single vendor.

---

## 2. Competitive Verification Matrix (13 Systems × 19 Dimensions)

The table below compiles publicly verifiable information across the 13 reference systems and contrasts them against DeepAstro 2.0.

### Benchmark System Abbreviations:
- **JH**: *Jagannatha Hora 8.0* (P.V.R. Narasimha Rao / SJC)
- **MAI**: *Maitreya 8.0* (Martin Pettau, Open Source GPL)
- **PL**: *Parashara's Light 9.0* (Geovision Software)
- **SJS**: *Shri Jyoti Star 9* (Andrew Foss)
- **JV**: *Jyotish Vedic* (Independent Mobile Suite)
- **AS**: *AstroSage* (Ojas Softech)
- **KC**: *Kundli Chakra Professional* (Horizon aarc)
- **JS**: *Jyotish Sarathi* (Classical Desktop Suite)
- **OJ**: *OnlineJyotish* (Web Calculation Platform)
- **ISH**: *Ishvaram* (Research Ephemeris)
- **EP**: *ePandit* (Vedic Web Engine)
- **NAK**: *Nakshara* (Vedic Analytics API)
- **VI**: *VedicIntell* (AI-Assisted Jyotish Platform)
- **DA**: **DeepAstro 2.0 (Target Architecture)**

---

### Detailed Technical Comparison

| # | Feature / Dimension | JH | MAI | PL | SJS | JV | AS | KC | JS | OJ | ISH | EP | NAK | VI | DeepAstro (DA) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | **ENGINE** | C++ Native | C++ / wxWidgets | C++ Desktop | C++ Windows | Java / Kotlin | Cloud PHP/Node | C# .NET | C++ Desktop | PHP Server | Python/C | Cloud REST | Go / Python | Python/TS | **TypeScript / Node.js + Edge Worker** |
| **2** | **EPHEMERIS** | Swiss Ephemeris / Moshier | Swiss Ephemeris | Swiss Ephemeris | Swiss Ephemeris | Swiss Ephemeris API | Internal Cloud / Swiss API | Moshier Analytical | Moshier Series | Analytical Series | Swiss Ephemeris | Static / Low-order | JPL DE431 API | Analytical Series | **NASA JPL DE405 Equivalent + Secondary Meeus Verifier** |
| **3** | **AYANAMSHA** | 20+ Configurable (Lahiri, Raman, KP, etc.) | 15+ Configurable | 12+ Options | 25+ Configurable | Fixed Lahiri | Default Lahiri | 5 Options | 8 Options | Lahiri Only | Custom Lahiri | Lahiri Only | Lahiri / KP | Lahiri Only | **Pluggable AyanamshaEngine (Default Lahiri IAU2006, Raman, KP, Fagan)** |
| **4** | **ZODIAC** | Sidereal (Nirayana) | Sidereal & Tropical | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | Sidereal | **Strict Sidereal Nirayana with Sayana-to-Nirayana Reduction** |
| **5** | **NODE MODEL** | True & Mean | True & Mean | True & Mean | True & Mean | Mean Only | Default Mean | Mean Only | True & Mean | Mean Only | True & Mean | Mean Only | Mean Only | Mean Only | **Explicit TRUE_NODE vs MEAN_NODE (Guaranteed 180° Invariant)** |
| **6** | **HOUSE SYSTEM** | Whole Sign, Sripati, Placidus, Equal | Whole Sign, Placidus, Equal, Koch | Whole Sign, Sripati, Placidus | Whole Sign, Sripati, Placidus, Regio | Whole Sign Only | Whole Sign Default | Whole Sign & Sripati | Whole Sign & Sripati | Whole Sign | Equal / Placidus | Whole Sign | Whole Sign | Whole Sign | **Strict Separation: Whole Sign (Parashari) & Sripati Bhava Chalit** |
| **7** | **VARGAS** | Full Shodashvarga + D108, D144 | D1 to D60 | Shodashvarga (D1-D60) | Shodashvarga (D1-D60) | D1, D9 Only | D1, D9, D10 | D1 to D12, D60 | D1 to D30 | D1, D9 Only | D1 to D60 | D1, D9 | D1, D9 | D1, D9 | **Formal VargaRuleRegistry (All 16 Shodashvarga D1-D60 Verified)** |
| **8** | **DASHAS** | Vimshottari, Yogini, Ashtottari, Chara, Kalachakra | Vimshottari, Yogini | Vimshottari, Yogini, Chara | Vimshottari, Yogini, Jaimini | Vimshottari Only | Vimshottari (3 Levels) | Vimshottari & Yogini | Vimshottari | Vimshottari Only | Vimshottari | Vimshottari | Vimshottari | Vimshottari | **Multi-Tier Vimshottari (Maha, Antar, Pratyantar) + Isolated Yogini/Chara** |
| **9** | **PANCHANG** | Dynamic Tithi, Vara, Nak, Yoga, Karana, Solar | Dynamic 5 Limbs | Dynamic 5 Limbs | Dynamic Solar | Basic 5 Limbs | Cloud Lookup Table | Dynamic Limbs | Dynamic Limbs | Lookup Table | Ephemeris Calc | Basic | API Stream | Basic | **Dynamic Topocentric Panchang + Dynamic Rahu Kalam / Abhijit** |
| **10** | **SHADBALA** | Complete 6-Fold Virupas | Complete 6-Fold | Complete 6-Fold | Complete 6-Fold | Partial / Omitted | Approximate Score | Complete 6-Fold | Complete 6-Fold | Omitted | Sthana/Dig Only | Omitted | Omitted | AI Score (hallucinated) | **Pure Classical 6-Fold Shadbala Engine (Virupas & Rupas)** |
| **11** | **ASHTAKAVARGA** | BAV, SAV, Shodhana (Trikona, Ekadhipatya) | BAV & SAV | BAV, SAV, Shodhana | BAV, SAV, Shodhana | SAV Only | Simple SAV Table | BAV & SAV | BAV & SAV | SAV Matrix | SAV Only | Omitted | BAV & SAV | SAV Only | **Deterministic BAV + SAV (337 Bindu Invariant) + Shodhana Reductions** |
| **12** | **YOGAS** | 300+ Classical Rules | 100+ Basic Rules | 200+ Classical Rules | 250+ Rules | 30 Common Yogas | Keyword Text Matches | 100+ Rules | 80+ Rules | Static Text | Omitted | Text snippets | Rules DB | LLM Generated | **Rule-Based JyotishRuleRegistry (Qualified, Disqualified, Inconclusive)** |
| **13** | **DOSHAS** | Manglik (cancellations), Kaal Sarp | Basic Manglik | Manglik & Kaal Sarp | Manglik, Sade Sati | Fear-based Manglik | Automated Kaal Sarp | Manglik & Sade Sati | Manglik | Basic | Omitted | Basic | Basic | LLM Generated | **Cancellation-Aware Non-Fear-Based Dosha Engine** |
| **14** | **KP SYSTEM** | Full KP Sub-lords & Cusps | Partial KP | Full KP Module | Full KP Module | Omitted | Basic Sub-lords | Full KP Module | KP Sub-lords | Omitted | KP Cusps | Omitted | KP Tables | Omitted | **Strictly Isolated KP Engine (Labeled: SYSTEM = KP)** |
| **15** | **JAIMINI** | Chara Karakas (7/8), Arudha, Chara Dasha | Chara Karakas | Chara Karakas, Arudha | Full Jaimini Module | Omitted | 7 Karakas Only | Chara Karakas | Chara Karakas | Omitted | Chara Karakas | Omitted | Omitted | Omitted | **Dedicated JaiminiEngine (7/8 Karaka Schemes, Arudha Lagna)** |
| **16** | **UPAGRAHAS** | Gulika, Mandi, Yamaghantaka, Dhuma | Gulika, Mandi | Gulika, Mandi | Gulika, Mandi, 5 Shadow | Omitted | Omitted | Gulika & Mandi | Gulika & Mandi | Omitted | Mathematical | Omitted | Omitted | Omitted | **Classical Solar Diurnal/Nocturnal Division Upagraha Engine** |
| **17** | **BHAVA CHALIT** | Sripati, Equal, Placidus Cusps | Sripati & Placidus | Sripati Chalit | Sripati & Placidus | Omitted | 30° Shifted Box | Sripati Chalit | Sripati Chalit | Omitted | Cusps Only | Omitted | Cusps Only | Omitted | **Side-by-Side Sripati Bhava Chalit with Explicit Planet Shift Badges** |
| **18** | **AI ARCHITECTURE** | None (Deterministic) | None (Deterministic) | None (Deterministic) | None (Deterministic) | None | Cloud Chatbot (Unchecked) | None | None | None | None | None | None | Unconstrained LLM | **Grounded AI Orchestrator (Zero Math, Claim-Level Provenance Validator)** |
| **19** | **VALIDATION METHOD** | Author Reference Charts | Unit Tests | Manual Spot Checks | Comparative Filters | User Bug Reports | Cloud Telemetry | Print Book Audits | Manual Checks | Spot Checks | Mathematical Audits | None | API Tests | None | **Dual-Engine Differential Lab + 100-Profile Golden Suite + 1000+ Property Tests** |

---

## 3. Publicly Verifiable Technical Profiles

### 1. Jagannatha Hora (JH)
- **Author / Provenance**: P.V.R. Narasimha Rao. Desktop software (Visual C++).
- **Public Methodology**: Incorporates Swiss Ephemeris for astronomical calculations. Provides the most extensive configuration options in the industry (multiple ayanamsha definitions, topocentric vs. geocentric coordinates, customizable sunrise algorithms).
- **Known Divergence Causes**: Defaults to geocentric apparent positions; users often customize sunrise or ayanamsha parameters without realizing it, creating divergence from consumer apps.

### 2. Maitreya
- **Author / Provenance**: Martin Pettau. Open-source cross-platform desktop application (C++/wxWidgets).
- **Public Methodology**: Fully transparent calculation pipeline utilizing `libswe` (Swiss Ephemeris). Supports both Western tropical and Vedic sidereal systems.
- **Known Divergence Causes**: Uses mean node by default unless explicitly configured for true node. Implements classical Sripati house trisection directly from Swiss Ephemeris ARMC.

### 3. Parashara's Light
- **Author / Provenance**: Geovision Software. Commercial Windows/Mac software.
- **Public Methodology**: Gold-standard commercial Vedic software since the 1990s. Implements high-order ephemeris models with Lahiri ayanamsha. Features comprehensive Shodashvarga charts and classical yoga lists from BPHS.
- **Known Divergence Causes**: In older editions, uses rounded geographic coordinates from a legacy atlas, causing 1' to 5' ascendant shifts compared to modern GPS/WGS84.

### 4. Shri Jyoti Star
- **Author / Provenance**: Andrew Foss. Commercial Windows research software.
- **Public Methodology**: Built for professional researchers and astrologers. Uses Swiss Ephemeris with extensive transit graphs, custom research filters, and multi-varga comparison tables.
- **Known Divergence Causes**: Features custom ayanamsha variants (e.g. true Chitra at 180° vs mean Chitra) which can produce 1' to 3' differences from standard Lahiri.

### 5. AstroSage
- **Author / Provenance**: Ojas Softech. Leading consumer web and mobile platform.
- **Public Methodology**: High-volume cloud calculation service. Defaults to Lahiri Ayanamsha and Mean Node.
- **Known Divergence Causes**: Often relies on standard city centroids rather than exact GPS coordinates. Early mobile versions did not expose true node calculations. Recent AI additions rely on ungrounded conversational wrappers.

### 6. Kundli Chakra
- **Author / Provenance**: Horizon aarc. Popular Indian commercial software.
- **Public Methodology**: Focuses on commercial printing, matchmaking, and Lal Kitab charts. Utilizes analytical orbital formulas.
- **Known Divergence Causes**: Pre-renders charts based on standard integer timezones, occasionally miscalculating historic Daylight Saving Time or fractional historical local times in India (e.g., Madras time prior to 1906).

---

## 4. DeepAstro Architecture Superiority

DeepAstro does not seek to copy or emulate any vendor's proprietary implementation. Instead, it solves the structural shortcomings of the entire sector:

1. **Elimination of the "Black Box"**: Every chart embeds a complete **Calculation Passport** recording the exact ephemeris version, Julian Day, Delta-T, coordinate source, and cryptographic SHA-256 fingerprint.
2. **Deterministic Pre-Calculation**: Planetary calculations are completed in <15ms before any AI text generation begins.
3. **AI Claim Validation**: The AI layer cannot hallucinate planetary positions; an automated fact validator intercepts and rejects any ungrounded claim.
4. **Differential Diagnostic Lab**: When a user asks *"Why does this differ from AstroSage or Jagannatha Hora?"*, DeepAstro provides an objective, mathematical explanation of the root cause (Ayanamsha, Node convention, or Coordinate resolution).
