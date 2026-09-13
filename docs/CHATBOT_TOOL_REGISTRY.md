# Chatbot Tool Registry Specification

## 1. Overview
`DeepAstroToolRegistry` acts as the single gateway connecting conversational intelligence to canonical DeepAstro calculation engines without duplicate logic.

## 2. Registered Microservices
| Microservice | Engine / Source | Return Artifacts |
|---|---|---|
| Meteorological Weather | Open-Meteo REST API | Temperature, precipitation, humidity, UV index, wind speed |
| Market Telemetry | `MarketDataService` / `PublicExchangeProvider` | Indices, commodities, currencies, market status, breadth |
| News & Events | `NewsProvider` / Livemint RSS | Headlines, sentiment, source URLs, timestamps |
| KP Horary Prashna | `KPPrashnaEngine` | 1-249 Horary cusps, CSLs, significators, ruling planets |
| Vedic Kundli | `VedicAstroEngine` | Planetary coordinates, house cusps, dashas, yogas |
| Numerology | `NumerologyEngine` | Mulank, Bhagyank, Namank, vibration profiles |
