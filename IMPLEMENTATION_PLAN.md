# DeepAstro 6.0 Transformation Implementation Plan

Date: 2026-09-12  
Status: Approved Architectural Specification  
System: DeepAstro Cosmic Intelligence Platform (v6.0)

---

## 1. Architectural Principles & Non-Negotiables

1. **Deterministic Separation of Evidence**:
   - **Layer A**: Deterministic Astronomical & Financial Calculations (Ephemeris, KP Cusps, Placidus, Tropical, Market OHLCV, Macro stats) - **ZERO LLM GENERATION**.
   - **Layer B**: Traditional Interpretations (Parashari, Jaimini, Western archetypes, Samudrika, Tarot symbolism).
   - **Layer C**: Real-World Market Intelligence (Fundamental, technical, macroeconomic, geopolitical, news).
   - **Layer D**: AI Synthesis & Explanation (Strictly grounded in Layer A, B, and C evidence graphs; exposes inputs, methods, assumptions, and limitations).
   - **Layer E**: Experimental Astro-Financial Signals (Explicitly labeled as experimental/unproven, backtested against benchmarks).

2. **Prohibition of Fabrication & Hallucination**:
   - If data is unavailable: Return DATA UNAVAILABLE.
   - If a source is unverified: Return SOURCE UNVERIFIED.
   - If palm image quality is low: Return Palm image quality insufficient for analysis.
   - Never recommend specific stocks from astrology alone; strictly prohibit claims of guaranteed returns or 100% certainty.

3. **Mandatory Regulatory / Safety Notice**:
   - Display prominent disclaimer: DeepAstro is not a SEBI-registered investment adviser. Astrology is educational, cultural, and reflective, and is not a scientifically proven method for predicting market prices or returns.

---

## 2. Component Engineering Breakdown

### Component 1: Western Astrology Engine (server/src/engines/western/)
- westernEngine.ts: Calculates tropical positions for 10 celestial bodies (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) and Chiron, Lilith, North Node.
- westernHouses.ts: House calculation supporting Placidus, Whole Sign, and Equal House with Midheaven (MC) and Ascendant (ASC).
- westernAspects.ts: Calculates Conjunction (0°), Opposition (180°), Square (90°), Trine (120°), Sextile (60°), and Quincunx (150°) with configurable orbs and exact applying vs separating motion.
- westernSynastry.ts: Cross-chart aspect comparison and synastry grid.
- westernArchetypes.ts: Psychological / archetypal astrological profiles (explicitly labeled non-clinical).

### Component 2: Modernized Numerology Engine (server/src/engines/numerology/)
- 
umerologyCore.ts: Complete, mathematically isolated Pythagorean and Chaldean calculation engines.
- Calculates:
  - Life Path Number (Bhagyank with Master Numbers 11, 22, 33)
  - Expression / Destiny Number
  - Soul Urge Number (Vowels)
  - Personality Number (Consonants)
  - Birthday Number
  - Maturity Number
  - Personal Year, Personal Month, Personal Day
  - Full letter vibration breakdown table
- Step-by-step transparent calculation audit (Inputs, System Used, Reduction Steps, Final Vibration, Meaning).

### Component 3: Palmistry & Tarot Hardening
- server/src/engines/palmistry/palmQualityGate.ts: Strict computer vision quality evaluator (lighting, blur, resolution, occlusion). Returns Palm image quality insufficient for analysis. when below threshold.
- server/src/engines/palmistry/palmFeatureAnalyzer.ts: Detects Life Line, Head Line, Heart Line, Fate Line, Sun Line, Mercury Line, and Mounts; provides Left vs Right hand comparison.
- src/services/tarotEngine.ts: **Fixes the card draw to 100% cryptographically random uniform Fisher-Yates shuffle** without any astronomical bias. Astrology is incorporated strictly as contextual post-draw interpretation.
- Spreads added: Single Card, Three Card (Past/Present/Future), Decision Spread, Relationship Spread, Career Spread, Celtic Cross.

### Component 4: Financial Astrology & Planetary Cycles (server/src/engines/financialAstrology/)
- mundaneCharts.ts: Historical inception charts for India Republic, NSE, BSE, US Independence.
- planetaryCycles.ts: Synodic cycles (Jupiter-Saturn 20-year cycle, Rahu-Ketu 18.6-year nodal transit, solar/lunar eclipses, planetary ingresses).
- sectorMappingRegistry.ts: Versioned knowledge table mapping planets to industrial sectors with tradition, confidence, and notes.
- personalFinancialAstro.ts: Natal chart wealth house analysis (2nd, 5th, 8th, 9th, 10th, 11th) and Dasha periods (strictly educational/reflective).

### Component 5: Real-Time Financial & Macroeconomic Intelligence (server/src/engines/market/ & /macro/)
- marketDataService.ts: Pluggable adapter for Nifty 50, Sensex, Bank Nifty, S&P 500, Nasdaq, USD/INR, Brent Crude, Gold, 10Y Indian G-Sec, US 10Y Treasury, VIX.
- marketRegimeEngine.ts: Determines market regime (RISK-ON, RISK-OFF, INFLATIONARY, DEFLATIONARY, LIQUIDITY-DRIVEN, RATE-SENSITIVE, COMMODITY-SHOCK, GEOPOLITICAL-RISK, TRANSITIONAL, UNCERTAIN).
- macroEconomicEngine.ts: Tracks Indian CPI, WPI, GDP, IIP, PMI, RBI Repo Rate; US CPI, Fed Funds, US 10Y, DXY, Caixin PMI.
- geopoliticalRiskEngine.ts: Documented conflict tracking (Hormuz, Red Sea, Taiwan, Ukraine, Middle East, tariffs) generating a quantitative Geopolitical Risk Score with full methodology.

### Component 6: News Intelligence & Multi-Tier Fact Checking (server/src/engines/news/)
- 
ewsIntelligenceEngine.ts: Ingestion and processing pipeline (News -> Event -> Impact -> Sector -> Asset).
- actCheckEngine.ts: 5-Tier source trust hierarchy and claim status classification (VERIFIED, LIKELY, CONTESTED, UNVERIFIED, FALSE, OUTDATED).

### Component 7: Cosmic Market Context & Astro-Financial Backtest Lab (server/src/engines/backtest/ & /synthesis/)
- cosmicMarketSynthesis.ts: Fuses Layer A (Real Financial Data) with Layer B (Traditional Astrological Cycles) and identifies points of agreement vs contradiction.
- stroFinancialBacktester.ts: Walk-forward backtesting framework testing planetary configurations against real index/sector returns. Compares against Buy & Hold and Momentum benchmarks, calculating CAGR, Sharpe, Sortino, Max Drawdown, and Hit Rate. Reports negative results honestly.
- predictionAuditLogger.ts: Logs all predictions with timestamps, inputs, methodology, confidence, forecast horizon, actual outcome, and error.

### Component 8: API Integration & Backend Endpoints (server/src/routes/)
- westernRoutes.ts: /api/astrology/western/chart, /api/astrology/western/aspects, /api/astrology/western/synastry
- inancialRoutes.ts:
  - /api/finance/market-pulse
  - /api/finance/macro-dashboard
  - /api/finance/geopolitical-risk
  - /api/finance/sector-radar
  - /api/finance/news-intelligence
  - /api/finance/fact-check
  - /api/finance/astro-market
  - /api/finance/personal-profile
  - /api/finance/backtest
  - /api/finance/prediction-audit
- Update 
umerologyRoutes.ts, palmistryRoutes.ts, iRoutes.ts.

### Component 9: Frontend Architecture & Investment Lab UI (src/)
- Main Navigation updates in Sidebar.tsx & App.tsx:
  - home
  - dashboard
  - kundli
  - kp-astrology (Dedicated top-level)
  - western (Dedicated new page)
  - 
umerology
  - palmistry
  - 	arot
  - i-astrologer
  - market-pulse
  - inancial-astrology
  - investment-lab (Comprehensive multi-tab command center)
  - 
ews-intelligence
  - global-risk
  - eports
  - history
  - settings
- New Pages:
  - WesternPage.tsx: Tropical chart, Placidus/Whole/Equal houses, interactive Aspect Grid, synastry comparison.
  - KPAstrologyPage.tsx: Dedicated KP command center with cuspal sub-lords, 4-level significators, Prashna 1-249, ruling planets, BTR.
  - InvestmentLabPage.tsx: High-end financial terminal (Market Overview, Sector Radar, Macro Dashboard, Global Risk, News Impact, Astro-Market, Personal Cosmic Profile, Backtest Lab, Prediction Audit).
  - AIAstrologerPage.tsx: Multi-system reasoning terminal with Ask My Kundli, Ask My Western, Ask My KP, Ask My Numerology, Ask My Tarot, Ask My Palm, Ask My Investment Profile, and Compare Systems, featuring the Show Evidence / WHY? modal.

### Component 10: Testing & Verification
- Unit and integration tests in 	ests/deepastro6CosmicSuite.test.ts.
- Golden tests for Western calculations, Numerology isolation, Tarot cryptographic randomness, Market regime classification, and Backtest calculations.
- Compilation & build verification: 
pm run typecheck, 
pm run server:build, 
pm run client:build, and itest run.
