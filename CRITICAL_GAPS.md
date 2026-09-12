# DeepAstro 6.0 Critical Architectural Gaps

Date: 2026-09-12  
Status: Active Blueprint for Engineering Upgrades

---

## 1. Western Astrology Engine (Missing)
- **Current State**: Only tropical Ascendant and MC exist in stronomyMath.ts.
- **Gaps**:
  1. No Tropical planetary positions calculation for all 10 major planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto).
  2. No house calculation systems (Placidus, Whole Sign, Equal House) using Tropical coordinates.
  3. No geometric aspect calculation engine (Conjunction 0°, Opposition 180°, Square 90°, Trine 120°, Sextile 60°, Quincunx 150°) with configurable orbs, applying/separating detection, and exact degrees.
  4. No Synastry / Composite chart comparison between two individuals.
  5. No Western Natal Report & Psychological Archetype interpretation (strictly labeled as traditional psychological astrology, not clinical psychology).
  6. No UI view for Western Astrology or Aspect Grid.

## 2. Numerology Engine (Partial & Mixed Methodology)
- **Current State**: NumerologyEngine.ts mixes Chaldean character values with Pythagorean reductions without an explicit system toggle.
- **Gaps**:
  1. Strict mathematical separation of Pythagorean vs Chaldean systems.
  2. Missing calculation fields: Birthday number, Maturity number, Personal Day number, and full name vibration table.
  3. Missing transparent step-by-step calculation breakdown (Inputs, Method, Intermediate steps, Result, Meaning).
  4. Missing comparison view between Pythagorean and Chaldean systems.

## 3. Palmistry / Hast Rekha (Partial & Missing Rigor)
- **Current State**: Basic magic bytes and 4 lines (Heart, Head, Life, Fate) in RealPalmistryImagePipeline.ts.
- **Gaps**:
  1. Missing Sun Line (Surya Rekha / Apollo) and Mercury Line (Budha Rekha / Health).
  2. Missing Left vs Right hand dual-palm comparative analysis.
  3. Strict Image Quality Gate: If blur, resolution, lighting, or occlusion are insufficient, do NOT guess—must explicitly return: Palm image quality insufficient for analysis.
  4. Missing explicit uncertainty reporting and classical Samudrika Shastra grounding.

## 4. Tarot Engine (Improper Bias Violation)
- **Current State**: 	arotEngine.ts includes pplyAstroWeighting, which artificially skews card draw probabilities based on astrological sign.
- **Gaps**:
  1. VIOLATION OF PRODUCT PRINCIPLE: Astrology must NEVER secretly bias or determine the cards drawn.
  2. Card selection must be 100% cryptographically random uniform Fisher-Yates shuffle using crypto.getRandomValues() or Node crypto.randomBytes().
  3. Astrology may only provide contextual narrative interpretation *after* cards are drawn (Astro-Tarot context).
  4. Missing full spreads: Decision Spread, Past/Present/Future, Celtic Cross, Relationship, Career.
  5. Missing server-side cryptographic draw verification API and seed audit.

## 5. Financial Astrology Engine (Missing)
- **Current State**: None.
- **Gaps**:
  1. Inception and mundane charts for key benchmarks (India Republic Chart, NSE Inception 1992-11-27, BSE Inception 1875-07-09, US Inception 1776-07-04).
  2. Macro planetary cycles: Jupiter-Saturn synodic cycle, Rahu-Ketu nodal axis shifts, major planetary ingresses, solar/lunar eclipses.
  3. Versioned Planet -> Sector mapping table (sectorMappingVersion, source, tradition, confidence, notes):
     - SUN: Power, Government, Energy, Defense, Sovereign Debt
     - MARS: Defense, Engineering, Metals, Infrastructure, High Volatility
     - JUPITER: Banking, Financial Services, Asset Management, Wealth
     - MERCURY: IT, Telecom, Communications, FinTech, Analytics
     - MOON: FMCG, Dairy/Liquids, Consumer Sentiment, Retail
     - VENUS: Luxury, Media, Entertainment, Textiles, Hospitality
     - SATURN: Heavy Industry, Mining, Real Estate, Cement, Logistics
     - RAHU: Speculative Tech, Crypto, Disruptive Innovation
     - KETU: Pharmaceuticals, Deep Tech R&D, Alternative Energy
  4. Personal Financial Astrology Engine: Analysis of Natal D1, D2 (Hora), D9, D10, D11 wealth houses (2nd, 5th, 8th, 9th, 10th, 11th) and Dasha periods (strictly educational, no guaranteed outcomes).

## 6. Real-Time Financial Intelligence Engine (Missing)
- **Current State**: None.
- **Gaps**:
  1. Pluggable provider adapter architecture (NSE/BSE, Nifty 50, Sensex, Bank Nifty, US S&P 500, Nasdaq, Gold, Brent Crude, USD/INR, 10Y Indian G-Sec, 10Y US Treasury).
  2. Market regime classification: RISK-ON, RISK-OFF, INFLATIONARY, DEFLATIONARY, LIQUIDITY-DRIVEN, RATE-SENSITIVE, COMMODITY-SHOCK, GEOPOLITICAL-RISK, TRANSITIONAL, UNCERTAIN.
  3. Sector rotation analyzer: 20 sectors with valuation, momentum, breadth, and macro sensitivity.
  4. Fundamental ratios & corporate actions tracker.

## 7. Macro-Economic & Geopolitical Intelligence (Missing)
- **Current State**: None.
- **Gaps**:
  1. Indian Macro: CPI, WPI, GDP growth, IIP, Manufacturing/Services PMI, RBI Repo Rate, Fiscal Deficit, FX Reserves.
  2. Global Macro: US CPI, Fed Funds Rate, US Non-Farm Payrolls, US 10Y Treasury, ECB, BOJ, China Caixin PMI, Dollar Index (DXY).
  3. Geopolitical Risk Engine: Documented conflict tracking (shipping choke points: Strait of Hormuz, Red Sea; Taiwan, Russia/Ukraine, Middle East, tariffs, sanctions) yielding an explainable Geopolitical Risk Score with full methodology transparency.

## 8. News Intelligence & Fact-Checking Engine (Missing)
- **Current State**: None.
- **Gaps**:
  1. News processing pipeline: News -> Event -> Impact -> Sector -> Asset.
  2. 5-Tier Source Hierarchy (Tier 1: Regulators/Gov/Central Banks, Tier 2: Major Wires, Tier 3: Academic/Brokerage, Tier 4: Traditional Astrology, Tier 5: Social/Blogs).
  3. Multi-source claim corroboration with status: VERIFIED, LIKELY, CONTESTED, UNVERIFIED, FALSE, OUTDATED.

## 9. Astro-Financial Backtesting Lab & Prediction Audit (Missing)
- **Current State**: None.
- **Gaps**:
  1. Walk-forward backtesting framework testing planetary configurations vs real index and sector returns.
  2. Comparison against benchmarks: Buy & Hold, Momentum, Random baseline.
  3. Metrics: CAGR, Sharpe Ratio, Sortino Ratio, Maximum Drawdown, Hit Rate, Profit Factor.
  4. Honest reporting: If astrology does not outperform the benchmark, report it transparently without curve-fitting.
  5. Immutable Prediction Audit Ledger: logs timestamp, inputs, methodology, confidence, forecast horizon, actual outcome, and error.

## 10. Multi-System Navigation & Investment Lab UI (Missing)
- **Current State**: Sidebar has standard astrology pages.
- **Gaps**:
  1. Dedicated Navigation items for:
     - KP ASTROLOGY
     - WESTERN
     - AI ASTROLOGER
     - MARKET PULSE
     - FINANCIAL ASTROLOGY
     - INVESTMENT LAB
     - NEWS INTELLIGENCE
     - GLOBAL RISK
     - PREDICTION AUDIT
  2. 3-Signal Visual Channel Separation on all investment screens:
     - Channel 1: Fundamental / Financial Signal
     - Channel 2: Market / Macro Signal
     - Channel 3: Astrological Signal (Experimental / Cultural)
  3. Show Evidence / WHY? modal exposing underlying calculations, inputs, and sources.
  4. Mandatory SEBI / Regulatory Disclaimer: Astrology is educational/cultural/reflective and not a scientifically validated financial tool; no guaranteed returns.
