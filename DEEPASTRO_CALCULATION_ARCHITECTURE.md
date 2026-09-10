# DEEPASTRO — Professional Jyotish Calculation Architecture

## 1. Primary Architectural Principle

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           PRIMARY PRINCIPLE                              │
│                                                                          │
│   ASTRONOMY                                                              │
│     └──> VERIFIED SIDEREAL POSITIONS                                     │
│           └──> JYOTISH RULES                                             │
│                 └──> CALCULATION SNAPSHOT (Immutable)                    │
│                       └──> CLASSICAL SOURCE / RAG                        │
│                             └──> DETERMINISTIC INTERPRETATION            │
│                                   └──> AI SYNTHESIS / NARRATIVE          │
│                                                                          │
│          ⚠️  AI MUST NEVER BECOME THE ASTRONOMICAL ENGINE  ⚠️            │
│      AI NEVER CALCULATES, INVENTs, OR OVERRIDES CELESTIAL POSITIONS.      │
└──────────────────────────────────────────────────────────────────────────┘
```

DeepAstro enforces an unbreachable barrier between **deterministic mathematical calculation** and **probabilistic language generation**. Planetary positions, house cusps, Vargas, Dashas, and Yogas are derived solely through mathematical formulas and ephemeris algorithms. The AI layer is strictly downstream, explaining and synthesizing verified facts.

---

## 2. Engine Configuration Profile

Every chart calculation is parameterized by an immutable `AstroCalculationProfile`. This configuration must be stored inside every `CalculationSnapshot` and serialized with historical reports.

```typescript
export interface AstroCalculationProfile {
  calculationMethod: 'DRIK_SIDDHANTA' | 'SURYA_SIDDHANTA';
  ephemeris: 'NASA_JPL_DE405' | 'NASA_JPL_DE440' | 'SWISS_EPHEMERIS' | 'ANALYTICAL_MEEUS';
  ephemerisVersion: string;
  zodiac: 'SIDEREAL' | 'TROPICAL';
  ayanamsha: 'LAHIRI_CHITRAPAKSHA' | 'RAMAN' | 'KRISHNAMURTI' | 'FAGAN_BRADLEY' | 'YUKTESHWAR';
  ayanamshaVersion: string;
  nodeType: 'MEAN_NODE' | 'TRUE_NODE';
  houseSystem: 'WHOLE_SIGN' | 'SRIPATI' | 'PLACIDUS' | 'EQUAL_HOUSE';
  latitude: number;
  longitude: number;
  timezone: number; // Decimal hours from UTC (e.g. +5.5 for IST)
  ianaTimeZone: string; // e.g. 'Asia/Kolkata'
  timezoneDatabaseVersion: string;
  coordinatePrecision: number; // e.g. 6 decimal places (~0.1 meter)
  planetaryPrecision: number;  // e.g. 8 decimal places (arc-millisecond)
  engineVersion: string;
}
```

**Rule**: Never hide or alter these settings implicitly. DeepAstro always displays the active profile alongside the chart.

---

## 3. Multi-Mode Calculation Architecture

DeepAstro supports two distinct classical astronomical modes:

### Mode A: Drik Siddhanta (Observational Modern Reference)
- Uses modern planetary ephemerides (JPL DE405 / DE440 / Swiss Ephemeris) corrected for nutation, precession, light-time delay, and atmospheric refraction.
- Corresponds to what is visible in the physical sky.
- **Default for modern Vedic astrology**.

### Mode B: Surya Siddhanta (Classical Geocentric Mean Spheres)
- Implemented from classical *Surya Siddhanta* astronomical algorithms (Mahayuga revolutions, mean motions, Manda/Shighra Kendra corrections).
- **Rule**: Never pretend Drik and Surya Siddhanta are equivalent. They represent distinct astronomical traditions with known angular divergence (often 1° to 3° on outer planets).
- The user interface must explicitly display:
  - `Calculation Method: Drik Siddhanta (Astronomically Verified)`
  - OR `Calculation Method: Surya Siddhanta (Classical Canonical)`

---

## 4. Ayanamsha Framework

The `AyanamshaEngine` provides pluggable sidereal reduction algorithms:

$$\lambda_{\text{sidereal}} = (\lambda_{\text{tropical}} - \Delta\psi_{\text{ayanamsha}}) \pmod{360^\circ}$$

1. **Lahiri / Chitra Paksha (Default)**:
   - Tied to Spica (*Chitra* Nakshatra) at exactly $180^\circ$ ecliptic longitude.
   - Reference epoch: J2000.0 $\text{Ayanamsha} \approx 23^\circ 51' 25.53''$, precessing at $\approx 50.29''/\text{year}$.
2. **K.S. Krishnamurti (KP)**:
   - Slightly offset from Lahiri ($\approx 6'$ difference), calibrated to KP astrological event timing.
3. **B.V. Raman**:
   - Classical South Indian traditional ayanamsha ($\approx 1^\circ 27'$ lower than Lahiri).
4. **Fagan-Bradley**:
   - Western sidereal standard based on the Aldebaran-Antares axis at $15^\circ$ Taurus/Scorpio.

**Rule**: Every chart records its exact ayanamsha value down to 6 decimal places. Calculations within the same chart snapshot never mix ayanamshas.

---

## 5. Node Model (Rahu & Ketu)

DeepAstro explicitly separates:
- **`MEAN_NODE` (*Madhyama Rahu*)**: The smooth, uniformly regressing intersection of the lunar orbital plane with the ecliptic ($\approx 19.34^\circ$ per year westward). Always retrograde.
- **`TRUE_NODE` (*Spashta Rahu*)**: The instantaneous osculating node accounting for solar gravitational perturbations. Can occasionally exhibit direct (*vakra*) motion for brief intervals.

**Mathematical Invariant**:
$$\text{Ketu Longitude} = (\text{Rahu Longitude} + 180^\circ) \pmod{360^\circ}$$
$$\|(\text{Rahu} + 180^\circ) - \text{Ketu}\| < 10^{-6\circ}$$
The system guarantees exact axial opposition. Mixed node conventions within a single chart are strictly forbidden.

---

## 6. House Engine (Bhava)

DeepAstro strictly separates sign placement (*Rashi*) from house placement (*Bhava*):

1. **Whole Sign (Parashari Rashi Bhava)**:
   - House 1 begins at $0^\circ$ of the rising sign (Lagna Rashi) and ends at $30^\circ$.
   - Each subsequent house corresponds exactly to the 30° span of the subsequent zodiac sign.
   - Used for all classical Parashari Yogas, Vargas, and standard planetary house rulerships.
2. **Bhava Chalit (Sripati Unequal Houses)**:
   - **Madhya (Cusp Center)**: House 1 mid-cusp is the exact Ascendant degree; House 10 mid-cusp is the exact Midheaven (MC).
   - Quadrants are trisected (Porphyry style) to establish intermediate cusps.
   - **Sandhi (House Junction)**: Calculated as the exact midpoint between adjacent cusps:
     $$\text{Sandhi}_i = \frac{\text{Cusp}_i + \text{Cusp}_{i+1}}{2}$$
   - Planets falling near house boundaries (*Bhava Sandhi*) or shifting into adjacent houses in Chalit are clearly highlighted with a `Chalit Shift` indicator.

**Presentation Rule**: The D1 Rashi Chart and the Bhava Chalit Chart must be rendered as distinct views.

---

## 7. Planet Engine: Pure Immutable Numbers

`PlanetEngine` outputs immutable numerical facts:
```typescript
export interface PlanetFact {
  name: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
  siderealLongitude: number; // e.g. 217.12345678 (degrees)
  eclipticLatitude: number;  // degrees
  distanceAU: number;        // astronomical units
  speedDegreesPerDay: number;// positive = direct, negative = retrograde
  isRetrograde: boolean;
  signIndex: number;         // 0 = Aries, 11 = Pisces
  signName: string;
  degreeInSign: number;      // 0.0 to 29.99999999
  nakshatraIndex: number;    // 0 to 26
  nakshatraName: string;
  pada: 1 | 2 | 3 | 4;
  dignity: 'Exalted' | 'Moolatrikona' | 'OwnSign' | 'GreatFriend' | 'Friend' | 'Neutral' | 'Enemy' | 'GreatEnemy' | 'Debilitated';
  isCombust: boolean;
}
```
**Rule**: Downstream formatters convert numbers to formatted strings (e.g. `217.12345678` $\rightarrow$ `Scorpio 7°07'24"`). Display strings are never used as inputs to mathematical engines.

---

## 8. Nakshatra Engine & Boundary Rigor

The 360° sidereal zodiac is divided into 27 Nakshatras:
- Span per Nakshatra: $13^\circ 20' = \frac{40^\circ}{3} \approx 13.33333333^\circ$
- Span per Pada: $3^\circ 20' = \frac{10^\circ}{3} \approx 3.33333333^\circ$ (108 Padas total)

```typescript
export function getNakshatra(longitude: number) {
  const norm = ((longitude % 360) + 360) % 360;
  const nakIndex = Math.floor(norm / (40.0 / 3.0));
  const degInNak = norm - nakIndex * (40.0 / 3.0);
  const pada = Math.floor(degInNak / (10.0 / 3.0)) + 1;
  return { nakIndex, degInNak, pada: Math.min(4, pada) };
}
```
**Boundary Test**: An epsilon offset $\epsilon = 10^{-10}$ ensures that cusp transitions at exactly $13^\circ 20'$ or $26^\circ 40'$ resolve deterministically without floating-point rounding errors.

---

## 9. Varga Engine 2.0 (Shodashvarga Registry)

DeepAstro implements all 16 divisional charts specified in BPHS Chapter 6 using dedicated classical algorithms:

```typescript
export interface VargaDefinition {
  division: number;
  name: string;
  sanskritName: string;
  signification: string;
  status: 'VERIFIED' | 'SUPPORTED' | 'UNSUPPORTED';
  calculator: (longitude: number) => number; // returns 0-11 sign index
}
```

| Varga | Division | Classical Calculation Rule | DeepAstro Status |
|---|---|---|---|
| **D1** | Rashi | Direct sign placement ($\lfloor\lambda / 30^\circ\rfloor$) | `VERIFIED` |
| **D2** | Hora | Odd signs: $0\text{-}15^\circ \rightarrow$ Sun (Leo), $15\text{-}30^\circ \rightarrow$ Moon (Cancer). Even signs reversed. | `VERIFIED` |
| **D3** | Drekkana | 1st decan: same sign; 2nd decan: 5th sign; 3rd decan: 9th sign. | `VERIFIED` |
| **D4** | Chaturthamsha | Segments of $7^\circ 30'$: 1st, 4th, 7th, 10th from natal sign. | `VERIFIED` |
| **D7** | Saptamsha | Odd signs: count from same sign. Even signs: count from 7th sign. | `VERIFIED` |
| **D9** | Navamsa | Movable signs: count from same; Fixed: count from 9th; Dual: count from 5th. | `VERIFIED` |
| **D10** | Dashamsha | Odd signs: count from same sign; Even signs: count from 9th sign. | `VERIFIED` |
| **D12** | Dwadashamsha | Count continuously starting from the natal sign ($2^\circ 30'$ segments). | `VERIFIED` |
| **D16** | Shodashamsha | Movable signs from Aries; Fixed signs from Leo; Dual signs from Sagittarius. | `VERIFIED` |
| **D20** | Vimshamsha | Movable from Aries; Fixed from Sagittarius; Dual from Leo ($1^\circ 30'$ segments). | `VERIFIED` |
| **D24** | Chaturvimshamsha | Odd signs from Leo; Even signs from Cancer ($1^\circ 15'$ segments). | `VERIFIED` |
| **D27** | Saptavimshamsha | Fire signs from Aries; Earth from Cancer; Air from Libra; Water from Capricorn. | `VERIFIED` |
| **D30** | Trimshamsha | Unequal Mars, Saturn, Jupiter, Mercury, Venus allocations per BPHS. | `VERIFIED` |
| **D40** | Khavedamsha | Odd signs from Aries; Even signs from Libra ($0^\circ 45'$ segments). | `VERIFIED` |
| **D45** | Akshavedamsha | Movable from Aries; Fixed from Leo; Dual from Sagittarius ($0^\circ 40'$ segments). | `VERIFIED` |
| **D60** | Shashtiamsha | Count continuously from natal sign ($0^\circ 30'$ segments) + deity attribution. | `VERIFIED` |

**Vargottama Invariant**: When a planet occupies the identical sign in D1 and D9, the engine automatically flags it as `isVargottama = true`.

---

## 10. Shadbala Engine (6-Fold Strength)

The Shadbala engine calculates planetary potency in **Virupas** (60 Virupas = 1 Rupa):

1. **Sthana Bala (Positional Strength)**:
   - *Uccha Bala* (Exaltation strength based on angular distance to deep debilitation point).
   - *Saptavargaja Bala* (Dignity across 7 primary divisional charts).
   - *Ojayugmarashiamsha Bala* (Odd/Even sign and Navamsa gender suitability).
   - *Kendra Bala* (1st/4th/7th/10th = 60, 2nd/5th/8th/11th = 30, 3rd/6th/9th/12th = 15).
   - *Drekkana Bala* (Decan rulership).
2. **Dig Bala (Directional Strength)**:
   - Jupiter/Mercury strongest at Ascendant (East, H1).
   - Sun/Mars strongest at Midheaven (South, H10).
   - Saturn strongest at Descendant (West, H7).
   - Moon/Venus strongest at Nadir (North, H4).
3. **Kala Bala (Temporal Strength)**:
   - *Nathonnatha Bala* (Day vs. Night birth).
   - *Paksha Bala* (Bright vs. Dark lunar fortnight).
   - *Tribhaga Bala* (Day/Night trisection).
   - *Varsha/Masa/Dina/Hora Bala* (Year, Month, Day, and Planetary Hour rulers).
   - *Ayana Bala* (Declination strength).
4. **Cheshta Bala (Motional Strength)**:
   - Derived from actual celestial velocity relative to average mean speed. Retrograde planets attain maximum Cheshta Bala (60 Virupas).
5. **Naisargika Bala (Natural Strength)**:
   - Inherent astronomical brightness: Sun (60) > Moon (51.4) > Venus (42.9) > Jupiter (34.3) > Mercury (25.7) > Mars (17.1) > Saturn (8.6).
6. **Drik Bala (Aspect Strength)**:
   - Vector summation of benefic and malefic planetary aspect angles (*Drishti*).

**Minimum Rupa Thresholds**: Sun (6.5), Moon (6.0), Mars (5.0), Mercury (7.0), Jupiter (6.5), Venus (5.5), Saturn (5.0).

---

## 11. Ashtakavarga Engine

Computes planetary bindus (auspicious points) based on classical Parashari rules:
1. **Bhinnashtakavarga (BAV)**: 8 separate matrices (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, and Lagna).
2. **Sarvashtakavarga (SAV)**: The sum of bindus across all 7 planetary BAVs for each of the 12 signs.
3. **Mathematical Invariant**:
   $$\sum_{rashi=1}^{12} \text{SAV}(rashi) = 337 \text{ bindus}$$
4. **Shodhana (Reductions)**:
   - *Trikona Shodhana* (Trinal reduction among Aries/Leo/Sag, Taurus/Virgo/Cap, etc.).
   - *Ekadhipatya Shodhana* (Dual-sign reduction for signs owned by the same planet).

---

## 12. Dasha Framework 2.0

### Vimshottari Dasha (120-Year Lunar Asterism Cycle)
- Seed Lord determined by the exact Janma Nakshatra of the Moon.
- **Starting Balance of First Dasha**:
  $$\text{Balance Fraction} = 1.0 - \frac{\text{Moon Longitude} \pmod{13^\circ 20'}}{13^\circ 20'}$$
  $$\text{Starting Balance (Years)} = \text{Balance Fraction} \times \text{Full Period of Seed Lord}$$
- **Calendar Accuracy**: Uses actual astronomical Julian Date elapsed time rather than assuming 360-day integer years.
- Supports 3 hierarchical tiers: **Mahadasha $\rightarrow$ Antardasha $\rightarrow$ Pratyantardasha**.

---

## 13. Dynamic Transit Engine (Gochara)

1. Evaluates live current sky coordinates against the natal `CalculationSnapshot`.
2. Computes:
   - Transit house from natal Moon (*Chandra Lagna*) and natal Ascendant.
   - SAV bindu score in the transiting sign (e.g. $\ge 28$ bindus = auspicious transit).
   - **Sade Sati Monitoring**:
     - Phase 1 (Rising): Saturn transits 12th from natal Moon.
     - Phase 2 (Peak): Saturn transits natal Moon sign.
     - Phase 3 (Setting): Saturn transits 2nd from natal Moon.
   - **Vedha (Obstruction)**: Classical aspect obstruction rules preventing transit results.

---

## 14 & 15. Yoga and Dosha Engine 2.0

All astrological combinations are managed in the `JyotishRuleRegistry`:

```typescript
export interface JyotishRule {
  ruleId: string;
  name: string;
  category: 'RAJA_YOGA' | 'DHANA_YOGA' | 'VIPREET_YOGA' | 'DOSHA' | 'SPECIAL_COMBINATION';
  classicalSource: 'BPHS' | 'Phaladeepika' | 'Saravali' | 'Jataka_Parijata';
  chapterReference?: string;
  evaluator: (snapshot: CalculationSnapshot) => {
    status: 'QUALIFIED' | 'NOT_QUALIFIED' | 'INCONCLUSIVE';
    involvedPlanets: string[];
    involvedHouses: number[];
    cancellations: string[];
    strengthPercentage: number;
    explanation: string;
  };
}
```

### Safety & Integrity Rules
1. **Never infer Yogas from keywords**: Evaluation requires explicit planetary placement, house ownership, and dignity checks.
2. **Cancellations are First-Class**:
   - Manglik Dosha evaluates all 14 classical cancellations (e.g., Mars in own/exaltation sign, Jupiter aspect, Moon-Mars conjunction).
   - Debilitation evaluates *Neecha Bhanga Raja Yoga* conditions before declaring a planet weak.
3. **No Fear-Mongering**: Doshas present objective astrological facts, classical remedies, and counteracting strengths.

---

## 16. Panchang Engine 2.0 (Dynamic 5 Limbs)

Calculates the exact Vedic calendar elements for any global coordinate and local solar day:
1. **Tithi**: $(\text{Moon} - \text{Sun}) / 12^\circ$ (30 total Tithis).
2. **Vara**: Solar weekday from true local sunrise to next sunrise.
3. **Nakshatra**: Sidereal lunar position ($13^\circ 20'$ segments).
4. **Yoga**: $(\text{Sun} + \text{Moon}) / (13^\circ 20')$ (27 classical Yogas).
5. **Karana**: Half-Tithi ($6^\circ$ segments; 11 Karana types).
6. **Solar Timings**:
   - High-precision sunrise/sunset computed with topocentric atmospheric refraction ($34'$) and solar disc semi-diameter ($16'$).
   - **Rahu Kalam**: Calculated as the specific eighth of daytime elapsed since actual sunrise, determined by weekday ruler.
   - **Abhijit Muhurat**: Exact mid-day eighth muhurta centered on local solar noon.

---

## 17. Muhurta Engine

Provides deterministic, rule-based auspiciousness screening for life events:
- **Categories**: Vivah (Marriage), Griha Pravesh (Housewarming), Namakarana (Naming), Business Launch, Travel.
- **Negative Conditions Filtered**:
  - Rahu Kalam, Yamaganda, Gulika Kalam.
  - *Vishti Karana* (Bhadra).
  - *Kshaya* (lost) and *Vriddhi* (extended) Tithis.
  - Inauspicious Yogas (Vaidhrithi, Vishkambha, Vyatipata, Atiganda).
  - Combustion of Jupiter (*Guru Tara*) or Venus (*Shukra Tara*).

---

## 18 & 19. KP and Jaimini Engine Isolation

To prevent interpretive and mathematical contamination:

```
┌────────────────────────────────────────────────────────┐
│               CALCULATION SNAPSHOT                     │
├──────────────────────────┬─────────────────────────────┤
│   PARASHARI TRADITION    │    KP / JAIMINI EXTENSIONS  │
│   • Whole Sign Houses    │    • Placidus Cusps         │
│   • BPHS Aspects         │    • Sub-Lord Hierarchy     │
│   • Vimshottari Dasha    │    • Chara Karakas (7 or 8) │
│   • Shodashvarga         │    • Arudha Pada Cusps      │
│   [SYSTEM = PARASHARI]   │    [SYSTEM = KP / JAIMINI]  │
└──────────────────────────┴─────────────────────────────┘
```
**Rule**: KP significators and Jaimini Chara Karakas are calculated in distinct modules and explicitly labeled to ensure Parashari rules are never evaluated against KP sub-lords.

---

## 20. Upagraha Engine

Computes the classical shadow planets (*Aprakasha Grahas*):
- **Gulika & Mandi**: Calculated based on the dividing point of daytime/nighttime into 8 parts (the part ruled by Saturn).
- **Secondary Upagrahas**:
  - *Dhuma* = $\text{Sun} + 133^\circ 20'$
  - *Vyatipata* = $360^\circ - \text{Dhuma}$
  - *Parivesha* = $\text{Vyatipata} + 180^\circ$
  - *Indrachapa* = $360^\circ - \text{Parivesha}$
  - *Upaketu* = $\text{Indrachapa} + 16^\circ 40'$

---

## 21. Cross-Consistency via Single Calculation Snapshot

Every downstream system consumes a **single immutable CalculationSnapshot**:

```
                  Input: Date, Time, Coordinates
                               │
                               ▼
                   [AstroCalculationProfile]
                               │
                               ▼
                 High-Precision Ephemeris Engine
                               │
                               ▼
                     CalculationSnapshot
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     D1 Rashi            Shodashvarga          Shadbala
          │                    │                    │
          ▼                    ▼                    ▼
     House Cusps        Ashtakavarga           Dashas
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                     Verified Facts Tuple
                               │
                               ▼
                 Downstream RAG & UI Consumers
```
**Consistency Guarantee**: No component independently queries planetary positions or recomputes the ascendant.

---

## 22. Provenance System & "Why Does My Chart Differ?"

Every DeepAstro chart embeds a complete Provenance Manifest:
```json
{
  "provenance": {
    "calculationMethod": "Drik Siddhanta",
    "ephemeris": "NASA JPL DE405 Equivalent",
    "ayanamsha": "Lahiri (Chitrapaksha)",
    "ayanamshaValueDegrees": 23.714421,
    "nodeModel": "True Node (Spashta)",
    "houseSystem": "Whole Sign (Parashari) & Sripati (Chalit)",
    "birthCoordinates": "27.1767° N, 78.0081° E",
    "timezone": "Asia/Kolkata (UTC +05:30)",
    "julianDay": 2447222.572917,
    "deltaTSeconds": 55.8,
    "engineVersion": "2.0.0"
  }
}
```

### Self-Service Differential Diagnostic:
DeepAstro includes an interactive diagnostic tool explaining differences with other applications:
1. **Ayanamsha Difference**: Explains 1°–2° shifts if another app used Raman or KP ayanamsha.
2. **Node Convention**: Explains why Rahu/Ketu may differ by up to 1.5° (Mean Node vs. True Node).
3. **House Boundary**: Explains why a planet is in the 1st house in Whole Sign but 12th in Bhava Chalit.
4. **Coordinate Accuracy**: Explains differences from apps that snap coordinates to rounded city centroids.

---

## 23. Differential Validation Lab (`/admin/calculation-lab`)

An internal engineering tool for precision testing:
- **Inputs**: Arbitrary birth date, time, latitude, longitude.
- **Engines Compared**: DeepAstro Primary vs. Independent Meeus Engine vs. Stored Golden JPL Ephemeris.
- **Tolerances**:
  - Planet Longitude: $\pm 0.05^\circ$ (3 arcminutes)
  - Ascendant: $\pm 0.10^\circ$ (6 arcminutes)
  - Ayanamsha: $\pm 0.005^\circ$
  - Rahu/Ketu Opposition: $< 0.00001^\circ$

---

## 26 & 27. AI Architecture & RAG 2.0

### AstroBot Rules of Engagement
1. **Zero Math**: The LLM prompt never asks the AI to compute dates, longitudes, or balances.
2. **Grounded Fact Injection**:
   ```
   [PROMPT CONTEXT]
   Subject: Deepti
   Ascendant: Aquarius (28°22') - Purva Bhadrapada Pada 3
   Sun: Aquarius (18°00') - Shatabhisha Pada 4 - House 1
   Moon: Leo (0°42') - Magha Pada 1 - House 7
   Active Dasha: Jupiter-Saturn-Mercury (ends 2026-11-14)
   Qualified Yogas: Sarala Vipreet Raja Yoga (Lord 8 in 12)
   Sources Retrieved: BPHS Chapter 34 Verse 21
   ```
3. **Classical RAG Hierarchy**:
   Retrieved texts are tagged with their authentic tradition:
   - `[TRADITION: Parashari] [SOURCE: BPHS] [TOPIC: Vipreet Raja Yoga]`
   - `[TRADITION: Classical] [SOURCE: Phaladeepika] [TOPIC: House 7 Moon]`
   - `[TRADITION: Lal Kitab] [SOURCE: Lal Kitab 1952] [TOPIC: Sun in House 1]`

---

## 28. "Why This Result?" Explainability Feature

Every key metric in DeepAstro has an interactive **"Why?"** button:
- *Why is my Nakshatra Magha?* $\rightarrow$ Displays Moon sidereal longitude ($120.7142^\circ$), Magha boundaries ($120^\circ 00' - 133^\circ 20'$), and elapsed degree ($0^\circ 42'51''$).
- *Why is Sarala Yoga active?* $\rightarrow$ Displays 8th lord Mercury located in the 12th house, fulfilling BPHS Chapter 34 conditions.
- *Why is my Dasha Jupiter-Saturn?* $\rightarrow$ Shows Moon birth degree in Magha (Ketu seed), elapsed timeline over 38 years, leading deterministically to Jupiter Mahadasha.

---

## 29. Accuracy Terminology Standard

DeepAstro never uses marketing pseudoscience like *"100% accurate predictions"* or *"scientifically proven future"*. The platform uses strict, auditable engineering terminology:

- `ASTRONOMICALLY VERIFIED`: Ephemeris planetary positions verified against JPL DE405 within 0.05°.
- `CALCULATION VERIFIED`: All house cusps, Vargas, and Dashas match verified mathematical specifications.
- `RULE VERIFIED`: Yogas and Doshas satisfied explicit combinatorial criteria in `JyotishRuleRegistry`.
- `SOURCE REFERENCED`: All interpretive texts are directly cited from classical Sanskrit texts.
- `AI GROUNDED`: Explanations are strictly bound to verified chart facts without extrapolation.
- `CALCULATION REVIEW REQUIRED`: Flags any edge case where coordinates or time ambiguity exceeds tolerance.

---

## 30 & 31. Performance & Local-First Architecture

DeepAstro separates execution into two asynchronous pipelines:

1. **Fast Calculation Pipeline (<15ms)**:
   - Runs locally in a Web Worker, Node runtime, or edge worker.
   - Calculates planetary positions, houses, Shodashvarga, and Dashas.
   - The user sees their complete, interactive Kundli chart **instantly**.
2. **Deep Interpretation Pipeline (Async Background / Streaming)**:
   - Fetches classical RAG text.
   - Invokes AI Orchestrator for personalized narrative synthesis.
   - Progressively enhances the client UI without blocking the chart display.

---

## 32 & 33. Versioned Contract & Regression Protection

Each calculation is stamped with:
`schemaVersion: "2.0.0"`, `engineVersion: "2.0.0"`, `ephemerisVersion: "DE405_EQUIV"`.

### Mandatory Release Gate Suite:
Every codebase modification must execute:
1. `astronomicalGoldenDataset.test.ts`: Ephemeris verification across 50 historic benchmark dates.
2. `differentialEphemerisValidation.test.ts`: Secondary Meeus algorithm cross-check.
3. `finalKundliReleaseGate.test.ts`: Complete end-to-end integration and boundary tests.
4. `DEEPTI_CALIBRATION_PROFILE.json` regression comparison: Zero deviation tolerance.

---

## 34. Product Differentiation Matrix

DeepAstro wins in the market through:
1. **Mathematical Transparency**: Open formulas, zero black-box calculations.
2. **Dual House System Display**: Whole Sign alongside Sripati Bhava Chalit.
3. **The "Why?" Engine**: Instant mathematical proof for every dasha, yoga, and nakshatra.
4. **App Differential Tool**: Instant diagnostic for differences with other software.
5. **Print-Perfect Reports**: High-precision vector graphics and clean typography.

---

## 35. Master System Architecture Diagram

```
                              DEEPASTRO PLATFORM
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
         CALCULATION CORE                           KNOWLEDGE CORE
                 │                                         │
        NASA JPL / Analytical                      Classical Shastras
        Ephemeris (DE405)                          (BPHS, Phaladeepika)
                 │                                         │
        Secondary Algorithm                        Jyotish Rule
        Cross-Verification                         Registry
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
                        IMMUTABLE CALCULATION SNAPSHOT
                                      │
          ┌──────────────┬────────────┼────────────┬──────────────┐
          ▼              ▼            ▼            ▼              ▼
       D1 Rashi      Shodashvarga   Dashas     Shadbala     Ashtakavarga
          │              │            │            │              │
          ▼              ▼            ▼            ▼              ▼
     House Cusps       Yogas        Doshas     Panchang        Muhurta
          │              │            │            │              │
          └──────────────┴────────────┼────────────┴──────────────┘
                                      ▼
                              VERIFIED FACT SET
                                      │
                                      ▼
                           CLASSICAL RAG INJECTION
                                      │
                                      ▼
                           AI EXPLANATION ENGINE
                         (Strict Narrative Synthesis)
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
          INTERACTIVE UI       VECTOR PDF EXPORT      ADMIN LAB
```
