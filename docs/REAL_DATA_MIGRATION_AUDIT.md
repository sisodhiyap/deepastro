# DeepAstro Real Data Migration Audit

Generated as part of the DeepAstro 6.0.4 Production Engineering Upgrade.

## 1. Executive Summary

This audit catalogs every data source currently utilized across the DeepAstro application, identifying simulated, static, or placeholder data and defining the concrete migration path to real external providers with strict provenance labeling.

---

## 2. System-by-System Audit Matrix

| System | Current Source | Real / Mock | Target Source / Adapter | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Market Data (Equities/Indices)** | Hardcoded snapshot in `marketDataService.ts` & simulated tick drift in `RealtimeStockTicker.tsx` | MOCK / SIMULATED | `MarketDataProvider` interface with `KiteMarketProvider` (Zerodha Kite Connect) + `PublicExchangeProvider` (real public indices snapshot with market hours logic) | IN PROGRESS |
| **Commodities & Forex** | Static values (Brent $74.65, Gold $2682, USD/INR 84.18) | MOCK / STATIC | Live public commodity & currency feed with timestamped EOD/delayed snapshots and honest provenance tags | IN PROGRESS |
| **News Wire** | Static 10-item news array in `NewsWire.tsx` & `newsIntelligenceEngine.ts` | MOCK / STATIC | Livemint RSS parser + Reuters/RBI official feeds with canonical event deduplication and computed sentiment | IN PROGRESS |
| **Weather (Meteorological)** | Not present (only transit "cosmic weather" metaphor in `VedicAstroEngine.ts`) | MISSING | Open-Meteo free API (`WeatherProvider`) with short cache, clearly separated from astrological context | IN PROGRESS |
| **KP Prashna (1–249)** | Partially implemented in `kpPrashnaEngine.ts`; basic input in `KPAstrologyPage.tsx` | REAL ENGINE / PARTIAL UI | Full 1–249 horary degree mapping, Placidus cuspal sub-lords, 14 life-domain question rules, and interactive "WHY?" drawer | IN PROGRESS |
| **Astro-Finance Backtesting** | Empirical formula model in `astroFinancialBacktester.ts` | SIMULATED / SYNTHETIC | Real historical candle ingest, strict walk-forward (zero look-ahead), standard metrics (CAGR, Max DD, Sharpe, Sortino), with "DATASET UNAVAILABLE" fallback | IN PROGRESS |
| **Self-Learning Loop** | Typed schema in `db.ts`, but feedback and outcome resolution were not fully wired to UI | SCHEMA ONLY / UNWIRED | Persistent feedback store, user outcome confirmation, Brier scoring, and Learning & Model Audit dashboard | IN PROGRESS |
| **Astronomical Calculation Core** | Swiss Ephemeris / `astronomyBridge.ts` / `PlanetEngine.ts` | REAL DETERMINISTIC | Retain 100% immutable core; verify against astronomical golden tests | PASSED / IMMUTABLE |

---

## 3. Data Provenance Standards

Every data object in DeepAstro 6.0.4 implements:

```typescript
export interface DataProvenance {
  source: string;
  provider?: string;
  retrievedAt: string;
  publishedAt?: string;
  status: 'LIVE' | '15-MIN DELAYED' | 'SNAPSHOT' | 'EOD' | 'HISTORICAL' | 'SIMULATED' | 'UNAVAILABLE' | 'STALE';
  freshnessSeconds?: number;
  confidence?: number;
}
```

No synthetic or simulated numbers will ever be displayed under a `LIVE` label.
