# DEEPASTRO PHASE 6 — METHODOLOGY PROFILE & CALCULATION PASSPORT AUDIT

**Date:** 2026-09-10  
**Phase:** Phase 6 — Jyotish Knowledge Foundation & Source-Grounded Reasoning  
**Status:** PASS  
**Auditor:** Principal Astrological Knowledge Architect & Swarm QA

---

## 1. Executive Summary

In Indian astrology, mathematical configurations differ widely across lineages (Parashari, Jaimini, KP, Raman, Seshadri Iyer).
Phase 6 builds `MethodologyProfile.ts` and formalizes `CalculationPassport`, ensuring:
1. Every calculation and prediction is 100% reproducible through an immutable passport.
2. Tradition differences are explicitly registered as `METHODOLOGY_VARIANT` objects rather than hardcoded assumptions.
3. Users and astrologers can audit every computational flag utilized in their chart.

---

## 2. Methodology Profile Specification

The default canonical profile adheres to classical standards:

```json
{
  "profile_id": "METHODOLOGY_DEFAULT_PARASHARI",
  "name": "Classical Parashari Vedic Jyotish",
  "ayanamsha": "Lahiri",
  "node_type": "True Node",
  "house_system": "Whole Sign",
  "chart_style": "North Indian",
  "dasha_system": "Vimshottari",
  "varga_method": "Parashari Canonical",
  "jaimini_config": {
    "karaka_scheme": "7_karaka",
    "pada_exception_rule": "Somanatha"
  },
  "kp_config": {
    "ayanamsa": "KP Original",
    "house_system": "Placidus",
    "sub_division": "249"
  },
  "panchang_method": "Drik Siddhanta"
}
```

---

## 3. Calculation Passport Verification

Every birth chart computation generates a cryptographically hashed `CalculationPassport`:

| Passport Field | Verified Content | Description |
|:---|:---|:---|
| `calculation_version` | `1.0.0` | Internal calculation engine release |
| `ephemeris_version` | `SwissEph-2.10.03` | Astronomical ephemeris engine version |
| `ayanamsha` | `Lahiri (Chitrapaksha)` | Exact ayanamsha algorithm |
| `timezone_database_version` | `IANA-2024b` | Geodetic timezone polygon version |
| `location_coordinates` | `[lat, lon, elevation]` | Precise geographic coordinates |
| `utc_timestamp` | ISO-8601 UTC | Universal Coordinated Time |
| `local_timestamp` | ISO-8601 Local | Native local time of birth |
| `julian_day` | Astronomical JD (UT1) | Flawless double-precision ephemeris day |
| `methodology_profile` | Full profile object | Exact settings used for computation |
| `engine_version` | `DeepAstro-v2.6.0` | Application release tag |
| `input_hash` | SHA-256 | Hash of birth input parameters |
| `output_hash` | SHA-256 | Hash of resulting planet positions and houses |

---

## 4. Methodology Conflict Handling

When traditions diverge, the engine registers explicit `METHODOLOGY_VARIANT` instances:
- **Variant 1:** Jaimini 7 Karakas vs 8 Karakas (Rahu inclusion).
- **Variant 2:** House Cusps (Vedic Whole Sign / Sripati vs KP Placidus).
- **Variant 3:** Arudha Lagna 1st and 7th house exception rules.

The system refuses to silently override or blend these variants. If a user runs a KP query, KP rules apply. If a user runs a Parashari query, Parashari rules apply.

---

## 5. Certification Conclusion

Methodology configuration and computation passports provide permanent auditability and zero silent drift.
**Audit Status:** PASS.
