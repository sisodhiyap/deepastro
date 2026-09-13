# Chatbot Fact-Checking & Provenance Engine

## 1. Absolute Principle: Never Fake Information
- No simulated data labeled as LIVE.
- No `Math.random()` price drift.
- No hallucinations of astronomical degrees or KP sub-lords.
- Explicit status labels: `LIVE`, `CALCULATED`, `CORROBORATED`, `ASTROLOGICAL_INTERPRETATION`, `UNAVAILABLE`.

## 2. Scientific & Meteorological Separation
- Physical weather is sourced directly from Open-Meteo meteorological telemetry.
- Astrological transits provide qualitative symbolic context with an explicit disclaimer:
  *"Physical meteorological conditions are produced entirely by thermodynamic and atmospheric processes... Astrological transits provide symbolic qualitative context for exploratory correlation only. No direct causal link is claimed or implied."*

## 3. Financial & Market Integrity
- Real market data ingested through `PublicExchangeProvider` and `KiteMarketProvider`.
- Clear statutory SEBI disclaimers included on all financial cards.
