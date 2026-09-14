/**
 * PublicExchangeProvider — Live Market Data via Yahoo Finance (v8 API)
 *
 * TRUTH LOCK FIX: Removed all hardcoded BASE_QUOTES.
 * Every quote is fetched from Yahoo Finance with a real HTTP call.
 * Prices are never stored as compile-time constants.
 *
 * Data status labels:
 *   OPEN  → "15-MIN DELAYED"  (Yahoo delayed feed)
 *   CLOSED/WEEKEND → "EOD"   (last day closing price)
 *   Fetch failure → "UNAVAILABLE" (honest, never fabricated)
 */

import { MarketDataProvider, Quote, Candle, ProviderHealth } from '../marketTypes.js';

// Canonical symbol → Yahoo Finance ticker mapping
const YAHOO_SYMBOL_MAP: Record<string, { yahoo: string; name: string; exchange: string; currency: string }> = {
  'NIFTY 50':    { yahoo: '^NSEI',     name: 'NIFTY 50 Benchmark',        exchange: 'NSE',         currency: 'INR' },
  'SENSEX':      { yahoo: '^BSESN',    name: 'BSE SENSEX 30',             exchange: 'BSE',         currency: 'INR' },
  'BANK NIFTY':  { yahoo: '^NSEBANK',  name: 'NIFTY Bank Index',          exchange: 'NSE',         currency: 'INR' },
  'S&P 500':     { yahoo: '^GSPC',     name: 'Standard & Poor 500',       exchange: 'NYSE',        currency: 'USD' },
  'NASDAQ 100':  { yahoo: '^NDX',      name: 'Nasdaq 100 Index',          exchange: 'NASDAQ',      currency: 'USD' },
  'DOW JONES':   { yahoo: '^DJI',      name: 'Dow Jones Industrial',      exchange: 'NYSE',        currency: 'USD' },
  'BRENT CRUDE': { yahoo: 'BZ=F',      name: 'Brent Crude Oil',           exchange: 'MCX/ICE',     currency: 'USD' },
  'GOLD':        { yahoo: 'GC=F',      name: 'Spot Gold (XAU/USD)',       exchange: 'FOREX/COMEX', currency: 'USD' },
  'SILVER':      { yahoo: 'SI=F',      name: 'Spot Silver (XAG/USD)',     exchange: 'FOREX/COMEX', currency: 'USD' },
  'BITCOIN':     { yahoo: 'BTC-USD',   name: 'Bitcoin (BTC/USD)',         exchange: 'CRYPTO',      currency: 'USD' },
  'USD/INR':     { yahoo: 'USDINR=X',  name: 'US Dollar vs Rupee',       exchange: 'FOREX',       currency: 'INR' },
  'INDIA 10Y':   { yahoo: '^IN10Y',    name: 'India 10Y Sovereign Yield', exchange: 'CCIL',        currency: '%'   },
  'INDIA VIX':   { yahoo: '^INDIAVIX', name: 'National Volatility Index', exchange: 'NSE',         currency: 'Pts' },
};

export class PublicExchangeProvider implements MarketDataProvider {
  private readonly providerName = 'Yahoo Finance (Public Feed)';
  private readonly BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

  // In-memory TTL cache: 60s when OPEN, 600s when CLOSED
  private cache: Map<string, { quote: Quote; expiresAt: number }> = new Map();

  public getMarketStatus(exchange: string, now: Date = new Date()): 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'WEEKEND' {
    const day = now.getUTCDay();
    if (day === 0 || day === 6) return 'WEEKEND';
    if (exchange === 'CRYPTO') return 'OPEN';
    if (exchange === 'NSE' || exchange === 'BSE' || exchange === 'CCIL') {
      const ist = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
      if (ist >= 540 && ist < 555) return 'PRE_OPEN';
      if (ist >= 555 && ist < 930) return 'OPEN';
      return 'CLOSED';
    }
    if (exchange === 'NYSE' || exchange === 'NASDAQ') {
      const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
      if (utc >= 810 && utc < 1200) return 'OPEN';
      return 'CLOSED';
    }
    return 'CLOSED';
  }

  private async fetchYahoo(yahooSymbol: string): Promise<{
    price: number; previousClose: number; open: number; high: number; low: number;
    retrievedAt: string; publishedAt: string;
  } | null> {
    try {
      const url = `${this.BASE_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (DeepAstro/6.0.4; +https://deepastro.vercel.app)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!resp.ok) return null;
      const json = await resp.json() as any;
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta) return null;
      const retrievedAt = new Date().toISOString();
      const publishedAt = meta.regularMarketTime
        ? new Date(meta.regularMarketTime * 1000).toISOString()
        : retrievedAt;
      return {
        price:         meta.regularMarketPrice    ?? 0,
        previousClose: meta.chartPreviousClose    ?? meta.previousClose ?? 0,
        open:          meta.regularMarketDayOpen  ?? meta.regularMarketPrice ?? 0,
        high:          meta.regularMarketDayHigh  ?? meta.regularMarketPrice ?? 0,
        low:           meta.regularMarketDayLow   ?? meta.regularMarketPrice ?? 0,
        retrievedAt,
        publishedAt,
      };
    } catch { return null; }
  }

  public async getQuote(symbol: string): Promise<Quote> {
    const now = new Date();
    const key = Object.keys(YAHOO_SYMBOL_MAP).find(
      (k) => k.toLowerCase() === symbol.toLowerCase() || symbol.toLowerCase().includes(k.toLowerCase())
    ) ?? 'NIFTY 50';

    const meta = YAHOO_SYMBOL_MAP[key];
    const marketStatus = this.getMarketStatus(meta.exchange, now);

    // Serve from TTL cache if fresh
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) return cached.quote;

    const live = await this.fetchYahoo(meta.yahoo);

    if (!live || live.price === 0) {
      // Honest UNAVAILABLE — never fabricate a fallback price
      return {
        symbol: key, name: meta.name, exchange: meta.exchange,
        price: 0, change: 0, changePercent: 0,
        open: 0, high: 0, low: 0, previousClose: 0,
        currency: meta.currency, timestamp: now.toISOString(), marketStatus,
        provenance: {
          source: this.providerName, provider: this.providerName,
          retrievedAt: now.toISOString(), publishedAt: now.toISOString(),
          status: 'UNAVAILABLE', freshnessSeconds: 0, confidence: 0,
        },
      } as unknown as Quote;
    }

    const change = live.price - live.previousClose;
    const pct = live.previousClose > 0 ? (change / live.previousClose) * 100 : 0;
    const ttl = marketStatus === 'OPEN' ? 60_000 : 600_000;

    const quote: Quote = {
      symbol: key, name: meta.name, exchange: meta.exchange,
      price: live.price,
      change: Number(change.toFixed(2)),
      changePercent: Number(pct.toFixed(2)),
      open: live.open, high: live.high, low: live.low,
      previousClose: live.previousClose,
      currency: meta.currency, timestamp: live.retrievedAt, marketStatus,
      provenance: {
        source: 'Yahoo Finance Public API',
        provider: this.providerName,
        retrievedAt: live.retrievedAt,
        publishedAt: live.publishedAt,
        status: marketStatus === 'OPEN' ? '15-MIN DELAYED' : 'EOD',
        freshnessSeconds: Math.floor((Date.now() - new Date(live.publishedAt).getTime()) / 1000),
        confidence: 0.95,
      },
    } as unknown as Quote;

    this.cache.set(key, { quote, expiresAt: Date.now() + ttl });
    return quote;
  }

  public async getQuotes(symbols: string[]): Promise<Quote[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }

  public async getHistorical(symbol: string, start: Date, end: Date, _interval: string): Promise<Candle[]> {
    const meta = YAHOO_SYMBOL_MAP[symbol] ?? YAHOO_SYMBOL_MAP['NIFTY 50'];
    try {
      const p1 = Math.floor(start.getTime() / 1000);
      const p2 = Math.floor(end.getTime() / 1000);
      const url = `${this.BASE_URL}/${encodeURIComponent(meta.yahoo)}?interval=1d&period1=${p1}&period2=${p2}`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (DeepAstro/6.0.4)' },
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) return [];
      const json = await resp.json() as any;
      const result = json?.chart?.result?.[0];
      if (!result) return [];
      const ts: number[] = result.timestamp ?? [];
      const q = result.indicators?.quote?.[0] ?? {};
      return ts.map((t, i) => ({
        timestamp: new Date(t * 1000).toISOString(),
        open:   Number((q.open?.[i]   ?? 0).toFixed(2)),
        high:   Number((q.high?.[i]   ?? 0).toFixed(2)),
        low:    Number((q.low?.[i]    ?? 0).toFixed(2)),
        close:  Number((q.close?.[i]  ?? 0).toFixed(2)),
        volume: q.volume?.[i] ?? 0,
      })).filter(c => c.close > 0);
    } catch { return []; }
  }

  public async health(): Promise<ProviderHealth> {
    const t0 = Date.now();
    const live = await this.fetchYahoo('^NSEI');
    return {
      provider: this.providerName,
      isHealthy: live !== null && live.price > 0,
      latencyMs: Date.now() - t0,
      lastSuccessfulFetch: live ? new Date().toISOString() : 'UNAVAILABLE',
    };
  }
}
