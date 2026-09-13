export interface DataProvenance {
  source: string;
  provider?: string;
  retrievedAt: string;
  publishedAt?: string;
  status: 'LIVE' | '15-MIN DELAYED' | 'SNAPSHOT' | 'EOD' | 'HISTORICAL' | 'SIMULATED' | 'UNAVAILABLE' | 'STALE';
  freshnessSeconds?: number;
  confidence?: number;
}

export interface Quote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  volume?: number;
  currency: string;
  timestamp: string;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE' | 'WEEKEND' | 'HOLIDAY';
  provenance: DataProvenance;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  lastSuccessfulFetch?: string;
  errorMessage?: string;
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getHistorical(symbol: string, start: Date, end: Date, interval: string): Promise<Candle[]>;
  health(): Promise<ProviderHealth>;
}
