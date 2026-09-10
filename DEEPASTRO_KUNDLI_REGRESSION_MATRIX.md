# DEEPASTRO — KUNDLI REGRESSION MATRIX & VERIFICATION SUITE REPORT

**Document Identifier**: `DEEPASTRO-REG-MATRIX-2026-V3`  
**Execution Timestamp**: `2026-09-10T14:32:07+05:30`  
**Test Runner**: Vitest v3.2.7 (Node.js v24.16.0, win32-x64)  
**Total Test Files**: 6  
**Total Test Blocks**: 29  
**Individual Profile Invocations**: > 1,120  
**Overall Test Result**: **100% PASSING (29 passed, 0 failed)**  
**Total Execution Time**: **7.17 seconds**  

---

## 1. REGRESSION SUITE ARCHITECTURE SUMMARY

The DeepAstro Kundli Regression Suite enforces multi-dimensional verification across seven test layers:

```
+-------------------------------------------------------------------------+
|                  DEEPASTRO KUNDLI REGRESSION SUITE                      |
+=========================================================================+
| 1. Golden Dataset 2.0 (100 Global Diverse Profiles)                     |
|    - 10 Global Regions, Extreme Latitudes, DST, Historical TZ, Cusps    |
|                                                                         |
| 2. 1,000+ Randomized Property-Based Invariant Fuzzing                   |
|    - [0, 360) bounds, exact 180° Rahu-Ketu, 120-yr Dasha Conservation    |
|                                                                         |
| 3. Boundary & Cusp Stress Suite                                         |
|    - 13°20' Nakshatra, 3°20' Pada, 30° Sign Cusps, High-Latitude Lagna  |
|                                                                         |
| 4. Metamorphic Invariance Suite                                         |
|    - Identity Invariance vs Physical Sensitivity Assertions             |
|                                                                         |
| 5. Calculation Replay & State Determinism                               |
|    - Multi-Pass Fingerprint Consistency & Cross-Instance Parity          |
|                                                                         |
| 6. Calibration Benchmark #001 (Deepti)                                  |
|    - Regression Anchor for All Core Graha Longitudes, Lagna & Dashas    |
+-------------------------------------------------------------------------+
```

---

## 2. DETAILED TEST SUITE EXECUTION RESULTS

### Suite 1: Golden Dataset 2.0 (`tests/golden100Profiles.test.ts`)
- **Profiles Tested**: 100 geographically, temporally, and astronomically diverse profiles.
  - **Regions**: India (New Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Varanasi, Agra, Srinagar, Kanyakumari), USA (New York, Los Angeles, Chicago, Anchorage, Honolulu), UK (London, Edinburgh), Europe (Paris, Berlin, Rome, Madrid, Stockholm, Reykjavik, Athens), Australia (Sydney, Melbourne, Perth, Darwin), Japan (Tokyo, Kyoto, Sapporo), Singapore, Canada (Toronto, Vancouver, Yellowknife), Middle East (Dubai, Riyadh, Tehran, Cairo), South America (São Paulo, Buenos Aires, Bogota, Santiago), Africa (Nairobi, Johannesburg, Lagos).
  - **Temporal Edge Cases**: DST transitions, non-DST transitions, historical timezone offsets (e.g. UTC+5:21:10 pre-1906 India), leap day births (Feb 29), year boundary births (Dec 31 23:59:59 / Jan 1 00:00:00), midnight births, solar noon births, exact sunrise/sunset births.
  - **Astronomical Extremes**: High arctic latitudes (Yellowknife $62.45^\circ\text{ N}$, Reykjavik $64.14^\circ\text{ N}$, Anchorage $61.21^\circ\text{ N}$), equatorial latitudes (Singapore $1.35^\circ\text{ N}$, Nairobi $1.29^\circ\text{ S}$, Bogota $4.71^\circ\text{ N}$), southern hemisphere latitudes (Sydney $33.87^\circ\text{ S}$, Buenos Aires $34.60^\circ\text{ S}$).
- **Tests & Assertions**:
  1. *Complete Profile Calculation*: 100/100 profiles computed with zero runtime exceptions, zero `NaN`, and zero `undefined` values (**1,221 ms**).
  2. *True Node Mathematical Opposition*: $|\lambda_{\text{Ketu}} - (\lambda_{\text{Rahu}} + 180^\circ)| < 1 \times 10^{-5}$ degrees across all 100 profiles (**1,009 ms**).
  3. *Calculation Passport & SHA-256 Fingerprint*: Valid 24-field passport with 64-hex-character SHA-256 fingerprint emitted for all 100 profiles (**965 ms**).
  4. *Vimshottari Dasha Conservation*: Total cycle length ($\text{Balance at Birth} + \sum \text{Subsequent Mahadashas}$) mathematically conserved to 120.0 solar years across all 100 profiles (**991 ms**).
  5. *Nakshatra & Pada Boundedness*: For every graha in all 100 profiles, $\text{Nakshatra} \in [1..27]$ and $\text{Pada} \in [1..4]$ (**1,040 ms**).
  6. *House Indices*: All 12 houses indexed strictly $1..12$ with valid Rashi longitudes.

### Suite 2: Randomized Property Testing (`tests/randomizedPropertyTesting.test.ts`)
- **Profiles Tested**: 1,000 synthetically generated pseudo-random birth records.
  - Generates random dates from 1900 to 2050, random times 00:00:00 to 23:59:59, random latitudes $-65.0^\circ$ to $+65.0^\circ$, and random longitudes $-180.0^\circ$ to $+180.0^\circ$.
- **Invariants Enforced (1,000 profiles × 10 planetary bodies = 10,000 checks)**:
  - Longitude range: $0^\circ \le \lambda < 360.0^\circ$ (zero out-of-bound or negative degrees).
  - Rahu-Ketu distance: $\Delta(\lambda_{\text{Rahu}}, \lambda_{\text{Ketu}}) = 180.0^\circ \pm 0.00001^\circ$.
  - Nakshatra range: integer between 1 and 27 inclusive.
  - Pada range: integer between 1 and 4 inclusive.
  - House range: integer between 1 and 12 inclusive.
  - Vimshottari Mahadasha span: Total remaining cycle $+ \text{elapsed} = 120$ years.
  - Fingerprint format: 64-character lowercase hex string (`^[a-f0-9]{64}$`).
- **Execution Time**: **5,094 ms** (average 5.09 ms per comprehensive Kundli calculation).
- **Result**: **PASS** (Zero invariant violations across 1,000 randomized profiles).

### Suite 3: Boundary & Cusp Dataset (`tests/boundaryDataset.test.ts`)
- **Stress Scenarios**:
  1. *Nakshatra Cusp (Revati-Ashwini / Gandanta)*: Longitudes at $359^\circ59'59''$ and $0^\circ00'01''$. Verified correct wrapping from Nakshatra 27 Pada 4 to Nakshatra 1 Pada 1.
  2. *Pada Cusp (Within Rohini)*: Longitude transition at $43^\circ20'00''$ shifting strictly from Pada 1 to Pada 2 without floating-point hysteresis.
  3. *Rashi Sign Cusp (Taurus to Gemini)*: Longitude transition at $59^\circ59'59.9''$ (Taurus 29°59') to $60^\circ00'00.1''$ (Gemini 0°00').
  4. *Rashi Cusp Across All 12 Signs*: Boundary testing at $k \times 30^\circ$ ($k \in \{0, 1, ..., 11\}$).
  5. *Midnight Transition ($23:59:59 \to 00:00:01$)*: Julian Day continuity and smooth Lagna progression without day-jump glitches.
  6. *Extreme Northern Latitude ($64.14^\circ\text{ N}$, Reykjavik)*: Oblique ascendant calculation stability without trigonometric division by zero or NaN.
  7. *Equatorial Latitude ($0.00^\circ\text{ N}$, Pontianak)*: Right ascensional cusp stability.
- **Execution Time**: **68 ms**.
- **Result**: **7/7 PASS**.

### Suite 4: Metamorphic Testing (`tests/metamorphicTesting.test.ts`)
- **Principles Tested**:
  - *Metamorphic Relation 1 (Identity Invariance)*: Mutating non-physical profile attributes (e.g. changing `name: "Deepti"` to `name: "CalibrationSubject-X"`, or toggling `gender`) produces **exact numerical identity** across all planetary longitudes, Lagna, ayanamsha, and dasha dates ($\Delta = 0.000000^\circ$).
  - *Metamorphic Relation 2 (Time Sensitivity)*: Shifting birth time by $+4$ minutes shifts the Ascendant by $\approx 1.0^\circ$ (corresponding to Earth's sidereal rotation rate $360^\circ / 1440\text{ min} = 0.25^\circ/\text{min}$), while slow-moving planets (Saturn, Jupiter) change by $< 0.005^\circ$.
  - *Metamorphic Relation 3 (Longitude Sensitivity)*: Shifting birth geographic longitude by $+1.0^\circ$ eastward shifts Local Mean Time by $+4$ minutes, predictably shifting the Ascendant by $\approx 1.0^\circ$ while geocentric planetary positions remain invariant within ephemeris precision.
  - *Metamorphic Relation 4 (Latitude Sensitivity)*: Shifting birth latitude while keeping longitude fixed alters Ascendant oblique ascension while geocentric planetary longitudes remain strictly unchanged.
- **Execution Time**: **89 ms**.
- **Result**: **4/4 PASS**.

### Suite 5: Calculation Replay & Determinism (`tests/calculationReplay.test.ts`)
- **Scenarios Tested**:
  - *Identical Replay*: Calculating the same birth chart 5 consecutive times produces the identical SHA-256 fingerprint:
    `Passport.fingerprint(run 1) === Passport.fingerprint(run 2) === ... === Passport.fingerprint(run 5)`.
  - *Snapshot Replay*: Reconstructing chart facts from a persisted `CalculationSnapshot` produces zero deviation from a freshly computed chart.
- **Execution Time**: **99 ms**.
- **Result**: **2/2 PASS**.

### Suite 6: Calibration Benchmark #001 — Deepti (`tests/deeptiCalibrationRegression.test.ts`)
- **Profile Parameters**:
  - Date: `02 March 1988`
  - Time: `07:15:00 AM IST` (`01:45:00 UTC`)
  - Coordinates: Agra, India ($27.1767^\circ\text{ N}, 78.0081^\circ\text{ E}$)
  - Timezone: `Asia/Kolkata` (UTC+05:30)
- **Locked Numerical Baselines**:
  - Ascendant (Lagna): Pisces ($348.67^\circ \pm 0.05^\circ$, Revati Nakshatra)
  - Sun: Aquarius ($317.97^\circ \pm 0.02^\circ$, Shatabhisha Nakshatra)
  - Moon: Cancer ($106.87^\circ \pm 0.03^\circ$, Ashlesha Nakshatra)
  - Mars: Sagittarius ($243.68^\circ \pm 0.03^\circ$, Mula Nakshatra)
  - Mercury: Aquarius ($304.75^\circ \pm 0.03^\circ$, Dhanishta Nakshatra)
  - Jupiter: Aries ($5.28^\circ \pm 0.03^\circ$, Ashwini Nakshatra)
  - Venus: Pisces ($358.91^\circ \pm 0.03^\circ$, Revati Nakshatra)
  - Saturn: Sagittarius ($246.60^\circ \pm 0.03^\circ$, Mula Nakshatra)
  - Rahu (True): Aquarius ($327.97^\circ \pm 0.03^\circ$, Purva Bhadrapada)
  - Ketu (True): Leo ($147.97^\circ \pm 0.03^\circ$, Purva Phalguni)
  - True Lahiri Ayanamsha: $23^\circ41'37'' \pm 2''$
  - Birth Dasha at Epoch: Mercury-Saturn (Mercury Mahadasha balance $\approx 10.36$ years)
- **Execution Time**: **214 ms**.
- **Result**: **9/9 PASS**.

---

## 3. SUMMARY MATRIX TABLE

| Test Suite File | Domain / Objective | Tests | Profiles Evaluated | Duration | Status |
|-----------------|-------------------|:-----:|:------------------:|:--------:|:------:|
| `tests/golden100Profiles.test.ts` | Global diversity, DST, timezones, high latitudes | 6 | 100 | 5.23s | **PASS** |
| `tests/randomizedPropertyTesting.test.ts` | Invariant fuzzing, bounds, mathematical conservation | 1 | 1,000 | 5.10s | **PASS** |
| `tests/boundaryDataset.test.ts` | Gandanta, Nakshatra, Pada, Sign & midnight cusps | 7 | 7 | 68ms | **PASS** |
| `tests/metamorphicTesting.test.ts` | Name invariance, time/lat/lon differential sensitivity | 4 | 8 | 89ms | **PASS** |
| `tests/calculationReplay.test.ts` | Multi-pass fingerprint replay, determinism | 2 | 5 | 99ms | **PASS** |
| `tests/deeptiCalibrationRegression.test.ts` | Calibration profile #001 anchor verification | 9 | 1 | 214ms | **PASS** |
| **TOTAL VERIFICATION RUN** | **All Core Verification Dimensions** | **29** | **> 1,120** | **7.17s** | **100% PASS** |

---

## 4. REGRESSION GATE VERDICT

All automated regression gates have completed with zero errors and zero warnings. The astronomical, rule, and calculation reproducibility engines are certified for deployment.
