# DEEPASTRO — Calculation Passport Specification & Audit Protocol

## 1. Overview & Purpose

In traditional astrology software, calculation outputs are ephemeral, opaque, and unverifiable. When an application updates its ephemeris or bug fixes its planetary algorithms, historical reports quietly change or produce conflicting results without auditability.

The **DeepAstro Calculation Passport** solves this by generating an immutable, cryptographically sealed provenance record embedded inside every `CalculationSnapshot`, `AstrologyFactSet`, and generated PDF report.

$$\text{Calculation Passport} = \mathcal{H}_{\text{SHA-256}}\Big(\text{Core Canonical Astronomical State}\Big)$$

---

## 2. Complete 24-Field Calculation Passport Schema

```typescript
export interface CalculationPassport {
  // ── Identifiers ──────────────────────────────────────────────────────────
  chartId: string;                 // Globally unique chart UUID (e.g. "cht_1789029632422_43ed5b7d")
  calculationId: string;           // Unique run ID for this calculation execution
  
  // ── Engine & Ephemeris Specifications ─────────────────────────────────────
  engine: string;                  // Canonical engine name: "DeepAstro-Vedic-Core"
  engineVersion: string;           // Semantic version: "2.0.0"
  ephemeris: string;               // Ephemeris source: "NASA_JPL_DE405_EQUIVALENT"
  ephemerisVersion: string;        // Numerical model version: "Meeus-DE405-Hybrid-v2.0"
  calculationMethod: string;       // "DRIK_SIDDHANTA" | "SURYA_SIDDHANTA"
  zodiac: 'SIDEREAL' | 'TROPICAL'; // Always "SIDEREAL" for Vedic chart analysis
  
  // ── Astrological Models ──────────────────────────────────────────────────
  ayanamsha: string;               // e.g. "LAHIRI_CHITRAPAKSHA"
  ayanamshaVersion: string;        // Astronomical standard: "IAU2006_ChitraPaksha_v1"
  ayanamshaValueDegrees: number;   // Exact float degrees (e.g. 23.692542°)
  nodeModel: 'TRUE_NODE' | 'MEAN_NODE'; // True osculating vs mean uniform regression
  houseSystem: string;             // "WHOLE_SIGN_AND_SRIPATI_CHALIT"
  
  // ── Geographic & Spatiotemporal Grounding ────────────────────────────────
  latitude: number;                // WGS84 Geodetic decimal latitude (6 decimal places)
  longitude: number;               // WGS84 Geodetic decimal longitude (6 decimal places)
  locationSource: string;          // "DeepAstro WGS84 High-Precision Geodetic Resolver"
  timezone: number;                // UTC decimal offset in hours (e.g. +5.5 for IST)
  ianaTimeZone: string;            // Canonical IANA timezone string (e.g. "Asia/Kolkata")
  timezoneDatabase: string;        // Official IANA TZDB release (e.g. "IANA-TZDB-2026a")
  
  // ── Exact Time & Astronomical Constants ──────────────────────────────────
  localBirthTime: string;          // "YYYY-MM-DD HH:mm:ss"
  utcBirthTime: string;            // ISO 8601 UTC timestamp: "YYYY-MM-DDTHH:mm:ss.sssZ"
  julianDay: number;               // Ephemeris Julian Day UT (IEEE 754 float, ~7 decimal places)
  deltaTSeconds: number;           // Terrestrial Time minus Universal Time (TT - UT)
  calculationTimestamp: string;    // Exact ISO 8601 execution timestamp
  
  // ── Precision & Cryptographic Seal ───────────────────────────────────────
  coordinatePrecision: number;     // 6 (sub-meter terrestrial ground resolution)
  planetaryPrecision: number;      // 8 (sub-arcsecond celestial resolution)
  precisionDescription: string;    // "IEEE 754 64-bit Floating Point (Sub-arcsecond celestial resolution)"
  fingerprint: string;             // Deterministic SHA-256 hex digest (64 characters)
}
```

---

## 3. Cryptographic Fingerprint Generation Specification

To ensure cross-machine calculation replay, the SHA-256 fingerprint is constructed from a **deterministic canonical string** containing strictly the physical, geographical, and astrological inputs:

```typescript
const canonicalPayload = [
  this.ENGINE_NAME,                    // "DeepAstro-Vedic-Core"
  this.ENGINE_VERSION,                 // "2.0.0"
  this.EPHEMERIS_NAME,                 // "NASA_JPL_DE405_EQUIVALENT"
  input.birthDate,                     // "1988-03-02"
  input.birthTime,                     // "07:15"
  input.latitude.toFixed(6),           // "27.176700"
  input.longitude.toFixed(6),          // "78.008100"
  input.timezone.toFixed(4),           // "5.5000"
  input.julianDay.toFixed(6),          // "2447222.572917"
  input.ayanamshaDegrees.toFixed(6),   // "23.692542"
  input.ascendantDegrees.toFixed(6),   // "328.372009"
  input.nodeModel || 'TRUE_NODE',      // "TRUE_NODE"
  input.calculationMethod || 'DRIK_SIDDHANTA', // "DRIK_SIDDHANTA"
].join('|');

const fingerprint = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
```

### Properties of the Fingerprint:
1. **Machine-Independent**: Two calculations on different servers, client browsers, or mobile devices for the same birth profile produce the identical 64-character hash.
2. **Tamper-Evident**: Altering any planetary position, birth minute, or coordinate degree by even $0.000001^\circ$ completely alters the SHA-256 digest.
3. **Replay Validation**: When loading a historical report from 5 years ago, DeepAstro re-executes the engine with the stored passport parameters. If the re-computed fingerprint matches, the report is mathematically certified as uncorrupted.

---

## 4. Concrete Example: Deepti Calibration Profile #001

Below is the verified Calculation Passport generated for Calibration Profile #001:

```json
{
  "chartId": "cht_1789029632422_43ed5b7d",
  "calculationId": "calc_7c992c68f121e780",
  "engine": "DeepAstro-Vedic-Core",
  "engineVersion": "2.0.0",
  "ephemeris": "NASA_JPL_DE405_EQUIVALENT",
  "ephemerisVersion": "Meeus-DE405-Hybrid-v2.0",
  "calculationMethod": "DRIK_SIDDHANTA",
  "zodiac": "SIDEREAL",
  "ayanamsha": "LAHIRI_CHITRAPAKSHA",
  "ayanamshaVersion": "IAU2006_ChitraPaksha_v1",
  "ayanamshaValueDegrees": 23.692541559278297,
  "nodeModel": "TRUE_NODE",
  "houseSystem": "WHOLE_SIGN_AND_SRIPATI_CHALIT",
  "latitude": 27.1767,
  "longitude": 78.0081,
  "locationSource": "DeepAstro WGS84 High-Precision Geodetic Resolver",
  "timezone": 5.5,
  "ianaTimeZone": "Asia/Kolkata",
  "timezoneDatabase": "IANA-TZDB-2026a",
  "localBirthTime": "1988-03-02 07:15:00",
  "utcBirthTime": "1988-03-02T01:45:00.000Z",
  "julianDay": 2447222.5729166665,
  "deltaTSeconds": 55.7725,
  "calculationTimestamp": "2026-09-10T08:56:59.120Z",
  "coordinatePrecision": 6,
  "planetaryPrecision": 8,
  "precisionDescription": "IEEE 754 64-bit Floating Point (Sub-arcsecond celestial resolution)",
  "fingerprint": "02e8adce29c45ab49d7856f8dee41793fb4893dbc0ca41dde1870696ccbe43c1"
}
```

---

## 5. User-Facing Passport Presentation

In the DeepAstro user interface, the Calculation Passport is displayed in a collapsible **"Astronomical Provenance"** card directly beneath the Kundli chart.

Clicking **"Verify Calculation"** renders:
1. The 64-character cryptographic SHA-256 seal.
2. The active Ephemeris and Ayanamsha version.
3. The exact UTC birth timestamp and Julian Day.
4. A button labeled **"Why does my chart differ from another app?"**, which compares the passport parameters against external presets (e.g., Mean Node vs. True Node, Raman vs. Lahiri Ayanamsha).
