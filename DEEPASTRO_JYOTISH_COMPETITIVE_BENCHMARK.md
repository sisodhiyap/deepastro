# DEEPASTRO — Public Jyotish Calculation Competitive Benchmark

## 1. Executive Summary & Ethics Disclaimer
This competitive benchmark documents the publicly available, mathematically verifiable calculation standards and architectural patterns employed by established Vedic astrology (Jyotish) software and research engines. 

> [!IMPORTANT]
> **Strict Engineering Ethics & IP Notice**:
> - No proprietary source code, private APIs, internal database schemas, proprietary prompt dictionaries, visual assets, or copyrighted materials have been extracted, decompiled, or duplicated.
> - All evaluations are grounded exclusively in publicly available documentation, published research papers, classical Sanskrit literature (e.g., *Brihat Parashara Hora Shastra*, *Surya Siddhanta*, *Siddhanta Shiromani*), astronomical standard ephemerides (NASA JPL DE405/DE440, Swiss Ephemeris / Moshier analytical models), and publicly accessible user manuals.
> - The objective is to identify mathematical and architectural best practices, recognize common software failure modes in consumer apps, and define a mathematically superior, transparent, and auditable architecture for DeepAstro.

---

## 2. Benchmark Target Set
The following publicly documented software platforms and libraries form the baseline for this analysis:

1. **Swiss Ephemeris (Sweph / AstroDienst)**: The global gold standard in computational astronomy for astrology, implementing high-order approximations of JPL planetary ephemerides (DE405/DE406/DE431/DE441).
2. **Jagannatha Hora (P.V.R. Narasimha Rao / SJC)**: Openly documented, widely respected free desktop Vedic software celebrated for its algorithmic depth, configurable ayanamshas, and multi-varga implementations.
3. **Maitreya (Martin Pettau)**: Open-source (GPL) desktop Jyotish and Western astrology calculation platform utilizing Swiss Ephemeris and classical algorithms.
4. **Parashara's Light / Geovision**: Long-standing commercial benchmark with extensive print report formatting, classical yoga lists, and standard Parashari workflows.
5. **Shri Jyoti Star (Andrew Foss)**: Research-oriented Vedic software notable for planetary speed graphing, custom research filters, and transit tracking.
6. **Consumer Mobile Platforms (AstroSage, JyotishApp, Jyotish Vedic, Kundli Chakra)**: Popular consumer mobile applications serving tens of millions of users, characterized by cloud-based calculation APIs, pre-rendered PDF reports, and AI chatbot wrappers.

---

## 3. Comprehensive 26-Dimension Competitive Matrix

| # | Dimension | Industry Standard / Swiss Ephemeris Baseline | Common Consumer App Shortcuts | DeepAstro Engineering Target |
|---|---|---|---|---|
| **1** | **Ephemeris Engine** | High-precision numerical integration (JPL DE431/440 or Swiss Ephemeris compression), sub-arcsecond accuracy. | Low-order trigonometric series or third-party black-box REST APIs; no offline fallback. | Dual-path: Local high-precision analytical engine (DE405 equivalent) + secondary independent Meeus verification engine. |
| **2** | **Ayanamsha** | Standard Lahiri / Chitra Paksha (~24° in 2026), Raman, Krishnamurti, Fagan-Bradley, Yukteshwar, Pushya-paksha. | Hardcoded Lahiri without version tracking or epoch documentation; zero user switchability. | Explicit `AyanamshaEngine` with pluggable providers; exact epoch polynomial, recorded in every calculation snapshot. |
| **3** | **Zodiac Model** | Strict Sidereal (Nirayana) with mathematically exact transformation from Tropical (Sayana). | Inconsistent mixing of Sayana coordinates with Nirayana houses during fast queries. | Strict Sayana-to-Nirayana sidereal reduction with immutable spherical coordinate transformations. |
| **4** | **House Systems** | Whole Sign (Rashi Bhava), Sripati (Porphyry/Alcabitius hybrid), Placidus, Equal House, Campanus, Koch. | Equates Whole Sign with Bhava Chalit or silent auto-selection without user disclosure. | Strict separation: Whole Sign (Parashari Rashi) and Sripati Bhava Chalit exposed as distinct, non-overlapping models. |
| **5** | **Lunar Nodes** | Option for Mean Node (*Madhyama Rahu*) vs. True Osculating Node (*Spashta Rahu*). Rahu & Ketu exact 180° opposite. | Often defaults to Mean Node without explanation; some web apps have 0.1° node drift between Rahu & Ketu. | Explicit `MEAN_NODE` vs `TRUE_NODE` configuration; mathematical guarantee of $\|(\text{Rahu} + 180^\circ) - \text{Ketu}\| < 10^{-6\circ}$. |
| **6** | **D1 Rashi Chart** | Pure 30° zodiacal division from Nirayana Lagna. Sign placement of 9 classical Grahas. | Displays rounded degrees; loses decimal precision in downstream chart consumers. | Immutable floating-point storage (8-decimal precision) with derived presentation formatting. |
| **7** | **Divisional Charts (Vargas)** | Complete Shodashvarga (D1 to D60) based on verified BPHS verses and specific cyclic/anti-cyclic rules. | Fabricates higher Vargas (D24-D60) using a single generic modulo division formula ($30^\circ / N$). | Formal `VargaRuleRegistry` with verified classical algorithms for all 16 Vargas; explicit status badges (`VERIFIED` vs `UNSUPPORTED`). |
| **8** | **Bhava Chalit** | Sripati Bhava cusps with Arambha (start), Madhya (cusp), and Sandhi (boundary) calculations. | Often omitted, or shown as simple 30° shifted boxes with erroneous planet-in-house allocations. | Full Sripati Bhava Chalit computation with exact Madhya degrees, Sandhi junctions, and Chalit planet shifts. |
| **9** | **Dashas** | 120-year Vimshottari with exact Moon degree elapsed balance at birth; 3-5 sub-levels (Maha, Antar, Pratyantar, Sukshma, Prana). | 365.25-day solar year vs. 360-day Savana year confusion; incorrect calendar leap year handling. | Exact Gregorian astronomical timeline; support for Vimshottari, Yogini, and Ashtottari via unified `DashaEngine 2.0`. |
| **10** | **Shadbala** | Full 6-fold strength calculation (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bala) in Rupas and Virupas. | Static or arbitrary percentage scores; AI hallucinated strength indicators; omission of complex Drik Bala. | Deterministic classical implementation of all 6 Bala categories with transparent sub-component breakdown. |
| **11** | **Ashtakavarga** | Bhinnashtakavarga (BAV) for 7 planets + Lagna (337 total bindus) and Sarvashtakavarga (SAV). | Pre-computed static matrices or missing Trikona/Ekadhipatya Shodhana reductions. | Pure computational Ashtakavarga engine with verified 337-bindu invariant and Shodhana reduction pipelines. |
| **12** | **Yogas** | Strict combinatorial evaluation based on BPHS, *Phaladeepika*, and *Saravali* (planets, houses, aspects, cancellations). | Keyword-matching text generators; triggering Raja Yogas even when key planets are combust or debilitated. | Rule-based `JyotishRuleRegistry` with distinct qualification states (`QUALIFIED`, `NOT_QUALIFIED`, `INCONCLUSIVE`) and source attribution. |
| **13** | **Doshas** | Manglik (with all 14 classical cancellations), Kaal Sarp (exact 180° hemispatial bounding), Sade Sati, Pitra Dosha. | Fear-mongering blanket assertions; failure to evaluate lagna vs. moon perspectives or classical cancellation rules. | Auditable rule engine; zero fear-based conclusions; full cancellation and mitigation tracing. |
| **14** | **Panchang** | Five classical limbs (Tithi, Vara, Nakshatra, Yoga, Karana) + solar events (Sunrise, Sunset, Rahu Kalam, Abhijit). | Fixed-string lookup tables based on standard noon or arbitrary midnight timezones; incorrect sunrise algorithms. | Dynamic topocentric astronomical calculations using actual solar and lunar disc horizons; accurate diurnal divisions. |
| **15** | **Muhurta** | Real-time auspiciousness evaluation filtering Durmuhurta, Rahu Kalam, Bhadra (Vishti), and Nakshatra suitability. | Generic "good day" or "bad day" ratings without event-specific classical qualification. | Deterministic rule-based evaluation for specific life milestones (Vivah, Griha Pravesh, etc.); AI only explains findings. |
| **16** | **KP Astrology** | Krishnamurti Paddhati: Placidus cusps, Krishnamurti ayanamsha, Star Lord, Sub Lord, Sub-Sub Lord. | Intermingles KP Sub-lords with Parashari whole-sign house significations, causing interpretive chaos. | Strict isolation: Parashari and KP engines kept strictly separate; explicit `SYSTEM = KP` indicator. |
| **17** | **Jaimini Jyotish** | Chara Karakas (7 vs 8 karaka scheme), Arudha Lagna, Upapada Lagna, Jaimini Rashi Drishti, Chara Dasha. | Ignored or mangled with Parashari aspects; Rahu/Ketu inclusion treated haphazardly. | Dedicated `JaiminiEngine` cleanly partitioned from Parashari systems; configurable 7 or 8 Karaka models. |
| **18** | **Upagrahas** | Mathematical calculation of non-luminous shadowy planets: Gulika, Mandi, Yamaghantaka, Dhuma, Vyatipata. | Omitted in 95% of consumer apps or calculated with inconsistent daytime/nighttime segment allocations. | Documented classical day/night division algorithms tied to local solar sunrise/sunset and weekday rulers. |
| **19** | **Transits (Gochara)** | Real-time planetary positions evaluated against natal Moon (Ashtakavarga transit scores, Sade Sati, Vedhas). | Static daily transit horoscopes generalized by Sun sign; zero individual natal cross-referencing. | Real-time dynamic transit evaluation comparing current astronomical sky coordinates to natal chart snapshot. |
| **20** | **Compatibility (Kundli Milan)** | Ashtakoota (36 Gunas: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) + Mahendra, Vedha. | Pure total score display (e.g. "24/36") without showing cancellation of Nadi or Bhakoot doshas. | Full 36-point breakdown with explicit Dosha cancellations (e.g., same lord, different padas) and classical references. |
| **21** | **Report Architecture** | Modular PDF generation with high-resolution vector charts (North Indian, South Indian, East Indian styles). | Cluttered raster images, poorly laid out tables, hardcoded marketing filler text. | Print-perfect, vector-rendered, modular multi-page PDF generator running deterministically without browser engines. |
| **22** | **AI Integration** | None, or unconstrained LLMs asked to "predict the chart" (leading to severe planetary hallucination). | Prompts LLM with "Sun in 5th house, what happens?" without providing calculated aspects, strength, or dasha context. | Strict Grounding: AI is an explanation layer only. It receives the `CalculationSnapshot` + verified rules + classical RAG. |
| **23** | **Calculation Provenance** | Full mathematical parameters embedded in output (Julian Day, Delta-T, Coordinate source, Ephemeris version). | Completely absent. Users cannot verify why two apps calculate different ascendants or nakshatras. | Explicit Provenance Block on every chart, with "Why does my chart differ from another app?" self-diagnostic tool. |
| **24** | **Validation & Test Suites** | Manual spot-checks against print ephemeris tables; rare automated regression suites. | Zero public or automated test suites; regression bugs regularly slip into production mobile apps. | Multi-tier automated regression: Astronomical golden datasets, boundary tests, differential test suite, release gates. |
| **25** | **Offline & Local Computation** | Desktop apps run locally; mobile apps fail without active server internet connections. | Cloud-dependent API calls causing latency, privacy concerns, and server downtime. | Local-first calculation engine capable of running in browser workers, Node.js, and offline client environments. |
| **26** | **Profile Management** | Local XML/DAT files or simple cloud databases with basic CRUD. | Unencrypted cloud databases; loss of historical calculation parameters when app updates. | Versioned snapshot storage: Every stored chart retains the exact engine and ephemeris versions used at creation time. |

---

## 4. Key Architectural Insights for DeepAstro

1. **The Fallacy of "AI-Calculated Astrology"**:
   - Consumer apps experimenting with LLMs often instruct the model to "calculate the ascendant for 07:15 AM in Agra". LLMs fail at spherical trigonometry and produce erratic, non-reproducible astrological charts.
   - DeepAstro rule: **The AI Orchestrator must NEVER compute positions.** It operates exclusively on deterministic, pre-verified JSON snapshots.

2. **The "Why Does My Chart Differ?" Advantage**:
   - The #1 support ticket and user confusion across all Jyotish applications is: *"Why does App X say I have a Taurus Ascendant at 29°58' while App Y says Gemini at 0°04'?"*
   - DeepAstro will capture leadership by providing an interactive **Provenance Diagnostic Tool** that analyzes ayanamsha selection, geographical coordinate precision, and atmospheric refraction differences between apps.

3. **Performance Decoupling**:
   - Fast mathematical calculation (<15ms) must be strictly decoupled from deep classical RAG and LLM interpretation (>1.5s). The user receives an instant, verified chart immediately, while AI narrative synthesis streams in progressively.
