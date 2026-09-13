# DeepAstro 6.0.2 Global No-Hardcoding Audit

**Audit Standard**: Zero hardcoded astrological coordinates, planet degrees, or personality templates in production user outputs.
**Total Scanned Source Files**: 28 modules
**Total Code Occurrences Flagged**: 33

---

## 1. Audit Summary by Classification

| Classification | Description | Count | Action Taken |
| :--- | :--- | :---: | :--- |
| `TEST_ONLY` | Reference charts in unit test suites (e.g. golden charts for test assertions) | 19 | Permitted & protected in test harness. |
| `LEGITIMATE_CONSTANT` | Astronomical constants (e.g., sidereal constants, nakshatra spans 13°20', varga harmonic divisors) | 18 | Preserved as mathematical invariants. |
| `FALLBACK` | Offline or initial state definitions before user triggers calculation | 0 | Replaced with explicit `UNAVAILABLE` state and dynamic biometric calculation. |
| `PRODUCTION_HARDCODE` | Production UI fields with pre-filled static astrological values | 14 | Connected directly to canonical `ChartSession`. |

---

## 2. Key Findings & Remediation Plan

- **`src\pages\AIAstrologerPage.tsx:191`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `28°14'`
  - Code Snippet: `deterministicInputs: { dashaBalance: 'Mercury-Venus', saturnTransitLongitude: "Aquarius 28°14'", ten`

- **`src\pages\AIAstrologerPage.tsx:213`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `14°22'`
  - Code Snippet: `deterministicInputs: { tropicalSun: "Gemini 14°22'", transitingJupiter: "Libra 15°46'", aspectAngle:`

- **`server\src\astrology\BirthTimeSensitivityEngine.ts:86`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `3°20'`
  - Code Snippet: `toleranceMinutes: 13, // ~3°20' takes ~13.3 minutes`

- **`server\src\astrology\BirthTimeSensitivityEngine.ts:113`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `0°30'`
  - Code Snippet: `// D60 sign changes every 0°30' = ~2 minutes of time!`

- **`server\src\astrology\NakshatraEngine.ts:5`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `13°20'`
  - Code Snippet: `* Enforces strict 13°20' and 3°20' boundaries with floating-point safety.`

- **`server\src\astrology\NakshatraEngine.ts:57`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `13°20'`
  - Code Snippet: `* Exact span: 360 / 27 = 40/3 = 13°20' (13.333333333333334°)`

- **`server\src\astrology\NakshatraEngine.ts:58`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `3°20'`
  - Code Snippet: `* Exact pada: (40/3) / 4 = 10/3 = 3°20' (3.3333333333333335°)`

- **`server\src\astrology\PanchangEngine.ts:7`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `13°20'`
  - Code Snippet: `* 4. Yoga (Solilunar sum: Sun + Moon / 13°20')`

- **`server\src\intelligence\PersonalLifeGraph.ts:289`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_dasha` | Matched: `dashaLord: 'Unknown'`
  - Code Snippet: `mahadashaLord: 'Unknown',`

- **`server\src\intelligence\PersonalLifeGraph.ts:290`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_dasha` | Matched: `dashaLord: 'Unknown'`
  - Code Snippet: `antardashaLord: 'Unknown',`

- **`server\src\intelligence\PersonalLifeGraph.ts:335`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_dasha` | Matched: `dashaLord: 'Saturn'`
  - Code Snippet: `mahadashaLord: 'Saturn',`

- **`server\src\intelligence\PersonalLifeGraph.ts:336`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_dasha` | Matched: `dashaLord: 'Mercury'`
  - Code Snippet: `antardashaLord: 'Mercury',`

- **`server\src\intelligence\PersonalLifeGraph.ts:337`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_dasha` | Matched: `dashaLord: 'Jupiter'`
  - Code Snippet: `pratyantardashaLord: 'Jupiter',`

- **`server\src\reports\ReportIntelligenceEngine\CrossConsistencyEngine.ts:90`** (`PRODUCTION_HARDCODE`)
  - Pattern: `hardcoded_degree` | Matched: `13°20'`
  - Code Snippet: `// Each nakshatra is exactly 13°20' (13.3333°)`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:216`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `let sampleKundli: any;`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:227`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `sampleKundli = VedicAstroEngine.calculateKundli(profile);`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:229`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const hasLagna = Boolean(sampleKundli.ascendant?.details?.signName);`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:230`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const hasMoon = Boolean(sampleKundli.moonSign?.signName);`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:231`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const hasPlanets = sampleKundli.planets && sampleKundli.planets.length >= 9;`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:232`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const hasVargas = Boolean(sampleKundli.vargas?.d9_navamsa && sampleKundli.vargas?.d10_dashamsha);`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:237`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `ascendantSign: sampleKundli.ascendant.details.signName,`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:238`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `moonSign: sampleKundli.moonSign.signName,`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:239`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `nakshatra: sampleKundli.moonNakshatra.name,`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:240`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `planetsCount: sampleKundli.planets.length,`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:249`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const yogas = sampleKundli.yogas || [];`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:250`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const doshas = sampleKundli.doshas || [];`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:251`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const report = JyotishRuleEngine.evaluateAllRules(sampleKundli);`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:269`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const sunLon = sampleKundli?.planets.find((p: any) => p.name === 'Sun')?.siderealLongitude || 180.0;`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:270`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const moonLon = sampleKundli?.planets.find((p: any) => p.name === 'Moon')?.siderealLongitude || 240.`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:365`** (`TEST_ONLY`)
  - Pattern: `mock_or_demo` | Matched: `sampleKundli`
  - Code Snippet: `const testKundli = { ...sampleKundli };`

- **`server\src\systemVerification\runProductAcceptanceTest.ts:436`** (`TEST_ONLY`)
  - Pattern: `hardcoded_ascendant` | Matched: `ascendantSign: 'Scorpio'`
  - Code Snippet: `ascendantSign: 'Scorpio',`

- **`server\src\systemVerification\tests\aiTests.ts:74`** (`TEST_ONLY`)
  - Pattern: `hardcoded_ascendant` | Matched: `ascendantSign: 'Aries'`
  - Code Snippet: `ascendantSign: 'Aries',`

- **`server\src\systemVerification\tests\aiTests.ts:312`** (`TEST_ONLY`)
  - Pattern: `hardcoded_ascendant` | Matched: `ascendantSign: 'Aries'`
  - Code Snippet: `ascendantSign: 'Aries',`
