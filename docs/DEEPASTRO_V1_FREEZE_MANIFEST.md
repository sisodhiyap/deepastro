# DeepAstro V1 Freeze Manifest

Certified commit:
960a5f2542825711b6d9ca205240f8c27dc81ba5

Certified tag:
deepastro-future-intelligence-v1-certified

Calculation version:
CALC_V6_CANONICAL

Future Intelligence version:
FUTURE_INTELLIGENCE_V1

Production:
https://deepastro.vercel.app

Production deployment:
dpl_Eg4QBj5bR1C5uDRq9gwFY83MbSVa

Restore branch:
restore/deepastro-future-intelligence-v1-certified

Purpose:
Permanent rollback point for the certified Future Intelligence V1 architecture.

---

## Architecture Freeze & Invariance Declaration

The following calculation and prediction engines are permanently certified and frozen:
- **D1 Kundli engine**
- **Lagna calculation**
- **True Node / Rahu-Ketu**
- **Nakshatra**
- **Vimshottari Dasha**
- **D9/Navamsa**
- **D10/Dashamsa**
- **Shodashavarga (D2–D60)**
- **KP astrology**
- **Yoga engine**
- **Dosha engine**
- **Planet strength**
- **House engine**
- **Aspect engine**
- **Numerology**
- **Shadbala**
- **Ashtakavarga**
- **Jaimini**
- **Remedies**
- **Transit engine**
- **Future Intelligence Engine (`FUTURE_INTELLIGENCE_V1`)**
- **Year-by-year forecasting**
- **Month-by-month forecasting**
- **Event windows**
- **Evidence graph**
- **Prediction confidence**
- **Contradiction handling**
- **Calculation fingerprint**
- **Engine lineage**
- **Prediction lineage**
- **AI evidence-only narrative layer**
- **PDF forecast generation**
- **Database persistence**
- **Forecast caching**
- **Authentication/authorization**
- **Cross-user isolation**

---

## Verification & Rollback Procedures

### Local Rollback:
```bash
git checkout restore/deepastro-future-intelligence-v1-certified
```

### Remote Restore from GitHub:
```bash
git fetch origin restore/deepastro-future-intelligence-v1-certified
git checkout restore/deepastro-future-intelligence-v1-certified
```

### Tag Verification:
```bash
git rev-parse deepastro-future-intelligence-v1-certified
# Output MUST be: 960a5f2542825711b6d9ca205240f8c27dc81ba5
```
