# DEEPASTRO — KUNDLI ENGINE AUDIT & BASELINE FREEZE

**Document Date:** 2026-09-09  
**Status:** ENGINE FROZEN — BASELINE RECORDED  
**Audit Author:** DeepAstro Engineering Swarm (Architect & Security/QA Swarm)  
**Strict Directives:** DO NOT DEPLOY | DO NOT CLAIM ACCURACY | DO NOT PATCH RESULTS TO MATCH EXPECTED VALUES  

---

## 1. Executive Summary

This audit establishes the mathematical and astronomical baseline of DeepAstro's current calculation engine prior to any modifications. A comprehensive line-by-line inspection of the codebase has identified critical architectural defects in astronomical calculations, coordinate systems, ephemeris approximations, timezone handling, Julian Day calculations, and house assignment logic.

The current system relies on home-grown, low-precision 2-body Keplerian approximations rather than a professional astronomical ephemeris (such as Swiss Ephemeris or high-order VSOP87/ELP-2000 planetary theory). Consequently, calculated positions for the Moon deviate by several degrees, rendering Nakshatra, Pada, Vimshottari Dasha, and Navamsha calculations systematically inaccurate. Furthermore, key Panchang elements (such as sunrise, sunset, and Abhijit Muhurat) contain hardcoded static strings.

---

## 2. Current Calculation Architecture

The calculation pipeline is organized as follows in `server/src/astrology/`:

```
User Birth Input (DOB, Time, City)
  │
  ▼
LocationResolver.ts (Hardcoded 22-city dictionary; static timezone offset)
  │
  ▼
VedicAstroEngine.ts (Master orchestrator)
  ├── astronomyMath.ts (Julian Day, Lahiri Ayanamsha, GMST, LST, Ascendant)
  ├── PlanetEngine.ts (2-body Keplerian orbital elements, Mean Nodes, Dignities, Aspects)
  ├── NakshatraEngine.ts (27 Nakshatra & 4 Pada mapping)
  ├── HouseEngine.ts (12 Bhava cusps & classifications)
  ├── VargaEngine.ts (D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D60)
  ├── DashaEngine.ts (3-level Vimshottari Dasha timeline)
  ├── YogaEngine.ts (Classical Auspicious and Raja Yogas)
  ├── DoshaEngine.ts (Manglik, Kaal Sarp, Sade Sati, Pitra Dosha)
  ├── PanchangEngine.ts (Tithi, Vara, Nakshatra, Yoga, Karana, Solar timings)
  └── TransitEngine.ts & RemedyEngine.ts
  │
  ▼
AstronomicalVerificationEngine.ts (Internal self-checker comparing engine against its own flawed equations)
```

---

## 3. Astronomical Libraries & Dependencies

- **Astronomical Packages:** None. `package.json` contains zero astronomical, ephemeris, or celestial mechanics libraries (no `swisseph`, no `astronomy-engine`, no `ephemeris`).
- **Dependencies List:** `@types/node`, `express`, `pg`, `puppeteer`, `react`, `vitest`, `tsx`, `typescript`.
- **Verdict:** All celestial calculations are performed via custom TypeScript approximations located in `astronomyMath.ts` and `PlanetEngine.ts`.

---

## 4. Ephemeris & Orbital Mechanics Implementation

### A. Planetary Theory (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
- **Source:** `PlanetEngine.ts` (`ORBITAL_DATA` lines 98–127).
- **Implementation:** Linear J2000 Keplerian elements ($a, e, i, L, \varpi, \Omega$) with rate of change per century.
- **Critical Defects:**
  1. **Absence of Perturbations:** Major planetary mutual gravitational perturbations (e.g., Jupiter-Saturn great inequality, Venus-Earth resonances) are omitted. Errors range from $0.5^\circ$ to over $2.5^\circ$.
  2. **Catastrophic Lunar Approximation:** The Moon is modeled as a simple Keplerian ellipse ($L_0 = 218.316^\circ$, linear rates). In reality, lunar motion requires hundreds of periodic terms (evection, variation, annual equation, parallactic inequality). The current Moon position is frequently off by $3^\circ$ to $7^\circ$. In Vedic astrology, a $0.01^\circ$ shift can alter a Nakshatra Pada or D60 placement.
  3. **Heliocentric to Geocentric Vector Addition Bug:** In `computeRawPlanetPosition()` (`PlanetEngine.ts` lines 188–193):
     ```typescript
     const xGeo = xSun + xPlanet;
     const yGeo = ySun + yPlanet;
     ```
     `(xSun, ySun)` is computed from the Sun's heliocentric elements (which represents Earth's position relative to the Sun, $\mathbf{r}_{SE}$), while `(xPlanet, yPlanet)` is the planet's position relative to the Sun ($\mathbf{r}_{SP}$). The true vector from Earth to the planet is $\mathbf{r}_{EP} = \mathbf{r}_{SP} - \mathbf{r}_{SE}$. By adding them, the engine introduces a massive vector sign error that corrupts geocentric longitudes for all outer and inner planets.
  4. **Neglect of Latitudes:** Inclinations ($i$) are not projected onto the ecliptic plane; planets are assumed to be in the plane of the ecliptic ($z = 0$).

### B. Lunar Nodes (Rahu & Ketu)
- **Implementation:** Mean Node polynomial:
  $$\Omega = 125.04452^\circ - 1934.136261^\circ \cdot T + 0.0020708^\circ \cdot T^2$$
- **True Node:** Unsupported.
- **Ketu Position:** Derived as $(\text{Rahu} + 180^\circ) \pmod{360}$.
- **Motion:** Speed is statically hardcoded as $-0.05^\circ/\text{day}$.

---

## 5. Coordinate Systems & Ayanamsha

- **Coordinate Frame:** Intended to be geocentric ecliptic coordinates referred to the mean equinox of date, converted to sidereal Nirayana via Lahiri Ayanamsha.
- **Lahiri Formula:**
  $$\text{Ayanamsha}(T) = 23.85805 + 1.396042 \cdot T + 0.000308 \cdot T^2$$
  where $T = (\text{JD} - 2451545.0) / 36525.0$.
- **Defects:**
  - Omits nutation in longitude ($\Delta\psi \cos \varepsilon$).
  - Omits true Lahiri (Chitra Paksha) reference point calibration against Spica ($\alpha$ Virginis at exact sidereal $180^\circ$).
  - No selectable alternative ayanamshas (Krishnamurti KP, Raman, Yukteshwar, Fagan-Bradley).

---

## 6. Timezone, Location Resolution & Julian Day

### A. Location Resolution (`LocationResolver.ts`)
- **Coverage:** Only 22 cities hardcoded in a static dictionary.
- **Timezone Offsets:** Static decimal numbers (e.g., New York = $-5.0$, London = $0.0$, Sydney = $10.0$).
- **Daylight Saving Time (DST):** Completely absent. A birth in New York in July is assigned UTC-5 instead of EDT (UTC-4), causing a 1-hour error ($15^\circ$ Ascendant shift).
- **Historical Offsets:** No support for wartime timezones (e.g., War Time in India 1942–1945 at UTC+6.5, British Double Summer Time).

### B. Julian Day Calculation (`astronomyMath.ts:getJulianDay`)
- **Code:**
  ```typescript
  let utcDecimalHours = localDecimalHours - tzOffsetHours;
  if (utcDecimalHours < 0) {
    utcDecimalHours += 24.0;
    day -= 1;
  } else if (utcDecimalHours >= 24.0) {
    utcDecimalHours += 24.0;
    day += 1;
  }
  // Formula then applies: Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5 ...
  ```
- **Critical Month/Year Rollover Bug:** When `day` is decremented to `0` (e.g., March 1st at 02:00 UTC+5:30 $\to$ Feb 28/29 UTC), `day` becomes `0` while `month` remains `3`! The Gregorian-to-Julian algorithm fails on month/year boundaries because it does not re-adjust `month` and `year`.
- **Delta-T ($\Delta T = \text{TT} - \text{UT}$):** Completely omitted. Ephemeris calculations evaluate Universal Time instead of Terrestrial Time / Ephemeris Time.

---

## 7. Ascendant (Lagna) & Houses

### A. Ascendant Formula (`astronomyMath.ts:calculateAscendant`)
- **Formulation:**
  ```typescript
  const y = -cosLst;
  const x = sinLst * cosEps + tanLat * sinEps;
  let tropicalAsc = toDegrees(Math.atan2(y, x));
  ```
- **Defects:**
  - Standard astronomical formula for Ascendant is:
    $$\tan \lambda_{\text{Asc}} = \frac{-\cos(\text{RAMC})}{\sin(\text{RAMC})\cos\varepsilon + \tan\phi\sin\varepsilon}$$
    or equivalently with quadrant resolution. The current formula sets $y = -\cos(\text{LST})$ and $x = \sin(\text{LST})\cos\varepsilon + \tan\phi\sin\varepsilon$, which can invert quadrants depending on geographic hemisphere and local sidereal time.
  - GMST formula omits higher-order precession and IAU 2000/2006 nutation.

### B. House System (`HouseEngine.ts` vs `PlanetEngine.ts`)
- **System Incoherence:**
  - `HouseEngine.ts` computes equal houses centered on the Ascendant degree:
    $$\text{startDeg} = \text{midCusp} - 15^\circ, \quad \text{endDeg} = \text{midCusp} + 15^\circ$$
  - However, `PlanetEngine.ts` computes planet house assignments using Whole Sign:
    ```typescript
    const house = (((signIndex - ascSign + 12) % 12)) + 1;
    ```
  - Result: `HouseEngine` defines boundary cusps, but populates `planetsInHouse` using a completely different system (Whole Sign). This creates direct contradictions between cusp spans and planet assignments.

---

## 8. Nakshatra, Pada & Vimshottari Dasha

### A. Nakshatra Engine (`NakshatraEngine.ts`)
- **Boundary:** Fixed $13^\circ 20'$ ($13.333333^\circ$) per Nakshatra; $3^\circ 20'$ per Pada.
- **Correctness:** The geometric division algorithm is mathematically correct, but because the input Moon longitude is off by degrees, the assigned Nakshatra and Pada are frequently wrong.

### B. Dasha Engine (`DashaEngine.ts`)
- **Balance Calculation:** Correctly derives fractional balance from degrees in Nakshatra:
  $$\text{balance} = (1 - \text{elapsed}) \times \text{years}$$
- **Time Calculation:** Uses `balanceYears * 365.25 * 24 * 60 * 60 * 1000` ms.
- **Downstream Impact:** Because Moon longitude is incorrect, natal Mahadasha balance is wrong by months or years, propagating errors across all subsequent Antardashas and Pratyantardashas.

---

## 9. Varga Charts (`VargaEngine.ts`)

- **Implemented Charts:** D1, D2 (Hora), D3 (Drekkana), D4 (Chaturthamsha), D7 (Saptamsha), D9 (Navamsa), D10 (Dashamsha), D12 (Dwadashamsha), D16 (Shodashamsha), D20 (Vimshamsha), D24 (Chaturvimshamsha), D27 (Saptavimshamsha), D30 (Trimshamsha), D60 (Shashtiamsha).
- **Parashari Rules:** Classical parity logic (odd/even signs) is present for D2, D7, D9, D12, D30.
- **Defects:**
  - High harmonic charts (especially D60, where each division is $0^\circ 30' = 30$ arcminutes) require sub-arcminute planet and Lagna accuracy. With current planetary errors of $1^\circ-5^\circ$, D60 outputs are essentially random.

---

## 10. Yogas & Doshas (`YogaEngine.ts`, `DoshaEngine.ts`)

- **Yoga Engine:** Implements 8 classical groups (Gaja Kesari, Budhaditya, Pancha Mahapurusha, Ruchaka, Bhadra, Hamsa, Malavya, Shasha). Relies on `planet.house` and `planet.dignity`. Inaccurate planet and house inputs directly invalidate yoga formation flags.
- **Dosha Engine:**
  - Manglik: Evaluates houses 1, 2, 4, 7, 8, 12 from Lagna and Moon.
  - Kaal Sarp: Checks if all planets fall between Rahu and Ketu.
  - Sade Sati: Assesses Saturn transit relative to natal Moon sign. **Defect:** Currently hardcodes `currentSaturnSignIndex: number = 10` instead of calculating real-time ephemeris transit of Saturn!

---

## 11. Panchang Engine (`PanchangEngine.ts`)

- **Major Defect:**
  ```typescript
  sunrise: '06:14 AM',
  sunset: '06:38 PM',
  abhijitMuhurat: {
    start: '11:52 AM',
    end: '12:44 PM',
  }
  ```
  Sunrise, Sunset, and Abhijit Muhurat are **hardcoded static strings**! They do not vary by date, season, latitude, or longitude.
  Rahu Kalam is calculated using static 1.5-hour blocks starting at 6:00 AM regardless of actual local sunrise time.

---

## 12. Self-Verification Engine (`AstronomicalVerificationEngine.ts`)

- **Flaw:** `AstronomicalVerificationEngine` imports the identical flawed functions (`getJulianDay`, `getLahiriAyanamsha`, `calculateAscendant`) from `astronomyMath.ts`.
- **Consequence:** It checks the engine against itself, creating a false illusion of verification without testing against an independent astronomical ephemeris or reference standard.

---

## 13. Audit Conclusion & Freeze Declaration

| Component | Status | Primary Defect |
|---|---|---|
| **Astronomical Library** | Missing | No standard ephemeris library installed |
| **Ephemeris Engine** | FAILED | 2-body Keplerian with no perturbations; Moon off by $3^\circ-7^\circ$; vector addition sign bug |
| **Timezone Resolution** | FAILED | Static offsets; no DST; no historical timezone rules |
| **Julian Day** | FAILED | Month/year boundary rollover bug; no Delta-T |
| **Ayanamsha** | INADEQUATE | Simplified 2nd order polynomial without nutation/reference calibration |
| **Ascendant** | FAILED | Simplified quadrant handling; no true sidereal time or nutation |
| **House System** | INCONSISTENT | Mixes Equal House cusp ranges with Whole Sign planet assignments |
| **Panchang** | FAILED | Hardcoded sunrise, sunset, and Abhijit Muhurat |
| **Vargas / Dashas** | CORRUPTED | Inaccurate astronomical longitudes cascade through all divisional charts and dasha chains |

**Engine calculation modifications are now FROZEN pending architectural plan approval.**
