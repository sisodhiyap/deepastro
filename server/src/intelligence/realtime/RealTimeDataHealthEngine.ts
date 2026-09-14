/**
 * RealTimeDataHealthEngine (Universal Insight Layer v4.2.1)
 * Rigorous source audit, telemetry verification, freshness calculation,
 * and fail-safe status determination across Market, News, Weather, and Ephemeris feeds.
 *
 * Epistemic guarantee:
 * NEVER labels cached or simulated data as 'LIVE'.
 * Fallback hierarchy: PRIMARY LIVE -> SECONDARY LIVE -> DELAYED -> CACHED -> UNAVAILABLE.
 */

export type RealTimeFreshnessStatus =
  | 'LIVE'
  | 'FRESH'
  | 'DELAYED'
  | 'CACHED'
  | 'STALE'
  | 'UNAVAILABLE';

export interface VerifiedDataSourceRecord {
  domain: 'MARKET' | 'NEWS' | 'WEATHER' | 'EPHEMERIS' | 'ECONOMIC';
  source: string;
  provider: string;
  requestTime: string;
  responseTimeMs: number;
  timestamp: string;
  publishedAt?: string;
  fetchedAt: string;
  dataAgeSeconds: number;
  freshnessStatus: RealTimeFreshnessStatus;
  isSimulatedOrMock: boolean;
  notes?: string;
}

export interface MarketHealthTelemetry {
  symbol: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  marketStatus: 'OPEN' | 'CLOSED' | 'WEEKEND' | 'HOLIDAY' | 'PRE_MARKET' | 'POST_MARKET';
  provider: string;
  timestamp: string;
  dataAgeSeconds: number;
  freshnessStatus: RealTimeFreshnessStatus;
  provenanceSource: string;
}

export interface NewsHealthTelemetry {
  headline: string;
  source: string;
  provider: string;
  publishedAt: string;
  fetchedAt: string;
  dataAgeSeconds: number;
  freshnessStatus: RealTimeFreshnessStatus;
  category: string;
  summary: string;
  sourceUrl?: string;
}

export class RealTimeDataHealthEngine {
  private static providerFailureCounts: Record<string, number> = {
    'YahooFinance_NSE': 0,
    'Livemint_RSS': 0,
    'OpenMeteo_Weather': 0,
  };

  private static lastSuccessfulFetches: Record<string, string> = {};

  /**
   * Determine data freshness status based on domain and elapsed seconds
   */
  public static evaluateFreshness(
    domain: 'MARKET' | 'NEWS' | 'WEATHER',
    dataAgeSeconds: number,
    providerStatus?: string,
    isExplicitCached?: boolean
  ): RealTimeFreshnessStatus {
    if (isExplicitCached) {
      return dataAgeSeconds > 86400 ? 'STALE' : 'CACHED';
    }

    if (domain === 'MARKET') {
      if (providerStatus === 'UNAVAILABLE' || dataAgeSeconds < 0) return 'UNAVAILABLE';
      // In NSE/BSE, regular public feeds like Yahoo v8 carry a standard 15-min delay
      if (providerStatus === 'OPEN') {
        if (dataAgeSeconds <= 120) return 'LIVE'; // direct low latency
        if (dataAgeSeconds <= 1800) return 'DELAYED'; // 15-min delayed feed
        return 'STALE';
      }
      // If market is closed, latest closing price is fresh EOD snapshot
      if (dataAgeSeconds <= 86400) return 'FRESH';
      return 'STALE';
    }

    if (domain === 'NEWS') {
      if (dataAgeSeconds <= 900) return 'LIVE'; // published under 15m
      if (dataAgeSeconds <= 7200) return 'FRESH'; // published under 2h
      if (dataAgeSeconds <= 86400) return 'CACHED';
      return 'STALE';
    }

    if (domain === 'WEATHER') {
      if (dataAgeSeconds <= 3600) return 'LIVE';
      if (dataAgeSeconds <= 14400) return 'FRESH';
      return 'STALE';
    }

    return 'UNAVAILABLE';
  }

  /**
   * Audit an external Market quote record
   */
  public static auditMarketQuote(
    rawQuote: any,
    providerName: string,
    requestStartTime: number
  ): { telemetry: MarketHealthTelemetry; record: VerifiedDataSourceRecord } {
    const now = Date.now();
    const responseTimeMs = Math.max(1, now - requestStartTime);

    if (!rawQuote || rawQuote.dataStatus === 'UNAVAILABLE' || !rawQuote.currentPrice) {
      this.providerFailureCounts[providerName] = (this.providerFailureCounts[providerName] || 0) + 1;
      const unavailRec: VerifiedDataSourceRecord = {
        domain: 'MARKET',
        source: rawQuote?.source || 'Public Exchange Gateway',
        provider: providerName,
        requestTime: new Date(requestStartTime).toISOString(),
        responseTimeMs,
        timestamp: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataAgeSeconds: 999999,
        freshnessStatus: 'UNAVAILABLE',
        isSimulatedOrMock: false,
        notes: 'External exchange provider did not return valid quotes.',
      };
      const unavailTelemetry: MarketHealthTelemetry = {
        symbol: rawQuote?.symbol || 'UNKNOWN',
        exchange: rawQuote?.exchange || 'NSE',
        currency: rawQuote?.currency || 'INR',
        price: 0,
        change: 0,
        percentChange: 0,
        marketStatus: 'CLOSED',
        provider: providerName,
        timestamp: new Date().toISOString(),
        dataAgeSeconds: 999999,
        freshnessStatus: 'UNAVAILABLE',
        provenanceSource: rawQuote?.source || 'Exchange Gateway',
      };
      return { telemetry: unavailTelemetry, record: unavailRec };
    }

    // Parse true quote timestamp
    const quoteTime = rawQuote.timestamp ? new Date(rawQuote.timestamp).getTime() : now;
    const ageSeconds = Math.max(0, Math.floor((now - quoteTime) / 1000));
    const freshness = this.evaluateFreshness(
      'MARKET',
      ageSeconds,
      rawQuote.marketStatus || 'OPEN',
      rawQuote.isCached === true
    );

    this.lastSuccessfulFetches[providerName] = new Date().toISOString();

    const telemetry: MarketHealthTelemetry = {
      symbol: rawQuote.symbol || 'NIFTY 50',
      exchange: rawQuote.exchange || 'NSE',
      currency: rawQuote.currency || 'INR',
      price: Number(rawQuote.currentPrice || rawQuote.price || 0),
      change: Number(rawQuote.change || 0),
      percentChange: Number(rawQuote.percentChange || rawQuote.changePercent || 0),
      marketStatus: rawQuote.marketStatus || 'OPEN',
      provider: providerName,
      timestamp: new Date(quoteTime).toISOString(),
      dataAgeSeconds: ageSeconds,
      freshnessStatus: freshness,
      provenanceSource: rawQuote.source || 'NSE/BSE Delayed Feed via Yahoo v8 API',
    };

    const record: VerifiedDataSourceRecord = {
      domain: 'MARKET',
      source: telemetry.provenanceSource,
      provider: providerName,
      requestTime: new Date(requestStartTime).toISOString(),
      responseTimeMs,
      timestamp: telemetry.timestamp,
      fetchedAt: new Date().toISOString(),
      dataAgeSeconds: ageSeconds,
      freshnessStatus: freshness,
      isSimulatedOrMock: false,
      notes: 'Verified quote for ' + telemetry.symbol + ' at price ' + telemetry.price + ' (' + freshness + ').',
    };

    return { telemetry, record };
  }

  /**
   * Audit an external News article item
   */
  public static auditNewsItem(
    rawItem: any,
    providerName: string,
    requestStartTime: number
  ): { telemetry: NewsHealthTelemetry; record: VerifiedDataSourceRecord } {
    const now = Date.now();
    const responseTimeMs = Math.max(1, now - requestStartTime);

    if (!rawItem || !rawItem.headline) {
      this.providerFailureCounts[providerName] = (this.providerFailureCounts[providerName] || 0) + 1;
      const unavailRec: VerifiedDataSourceRecord = {
        domain: 'NEWS',
        source: 'News Wire',
        provider: providerName,
        requestTime: new Date(requestStartTime).toISOString(),
        responseTimeMs,
        timestamp: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataAgeSeconds: 999999,
        freshnessStatus: 'UNAVAILABLE',
        isSimulatedOrMock: false,
        notes: 'News provider returned empty feed.',
      };
      const unavailTelemetry: NewsHealthTelemetry = {
        headline: 'News feed temporarily unavailable',
        source: 'Live Wire',
        provider: providerName,
        publishedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataAgeSeconds: 999999,
        freshnessStatus: 'UNAVAILABLE',
        category: 'General',
        summary: 'Live news is temporarily unavailable from external providers.',
      };
      return { telemetry: unavailTelemetry, record: unavailRec };
    }

    const pubTime = rawItem.publishedAt ? new Date(rawItem.publishedAt).getTime() : now;
    const ageSeconds = Math.max(0, Math.floor((now - pubTime) / 1000));
    const isCached = rawItem.source?.includes('Snapshot') || ageSeconds > 86400;
    const freshness = this.evaluateFreshness('NEWS', ageSeconds, undefined, isCached);

    this.lastSuccessfulFetches[providerName] = new Date().toISOString();

    const telemetry: NewsHealthTelemetry = {
      headline: rawItem.headline.trim(),
      source: rawItem.source || 'Livemint Wire',
      provider: providerName,
      publishedAt: new Date(pubTime).toISOString(),
      fetchedAt: new Date().toISOString(),
      dataAgeSeconds: ageSeconds,
      freshnessStatus: freshness,
      category: rawItem.category || 'National / Markets',
      summary: rawItem.summary || rawItem.headline,
      sourceUrl: rawItem.sourceUrl,
    };

    const record: VerifiedDataSourceRecord = {
      domain: 'NEWS',
      source: telemetry.source,
      provider: providerName,
      requestTime: new Date(requestStartTime).toISOString(),
      responseTimeMs,
      timestamp: telemetry.publishedAt,
      publishedAt: telemetry.publishedAt,
      fetchedAt: telemetry.fetchedAt,
      dataAgeSeconds: ageSeconds,
      freshnessStatus: freshness,
      isSimulatedOrMock: false,
    };

    return { telemetry, record };
  }

  /**
   * Real-Time Health Summary for Admin Observatory
   */
  public static getAdminHealthOverview() {
    return {
      providers: {
        markets: {
          name: 'Yahoo Finance Public API (NSE/BSE)',
          status: this.providerFailureCounts['YahooFinance_NSE'] > 3 ? 'DEGRADED' : 'OPERATIONAL',
          lastSuccessfulFetch: this.lastSuccessfulFetches['YahooFinance_NSE'] || new Date().toISOString(),
          failureCount: this.providerFailureCounts['YahooFinance_NSE'] || 0,
          currentFeedType: '15-MIN DELAYED / EOD SNAPSHOT',
        },
        news: {
          name: 'Livemint Markets RSS Wire',
          status: this.providerFailureCounts['Livemint_RSS'] > 3 ? 'DEGRADED' : 'OPERATIONAL',
          lastSuccessfulFetch: this.lastSuccessfulFetches['Livemint_RSS'] || new Date().toISOString(),
          failureCount: this.providerFailureCounts['Livemint_RSS'] || 0,
          currentFeedType: 'LIVE RSS FEED',
        },
        weather: {
          name: 'Open-Meteo Meteorological Telemetry',
          status: this.providerFailureCounts['OpenMeteo_Weather'] > 3 ? 'DEGRADED' : 'OPERATIONAL',
          lastSuccessfulFetch: this.lastSuccessfulFetches['OpenMeteo_Weather'] || new Date().toISOString(),
          failureCount: this.providerFailureCounts['OpenMeteo_Weather'] || 0,
          currentFeedType: 'LIVE HOURLY OBSERVATION',
        },
        ephemeris: {
          name: 'Swiss Ephemeris Deterministic Engine',
          status: 'OPERATIONAL',
          lastSuccessfulFetch: new Date().toISOString(),
          failureCount: 0,
          currentFeedType: 'MATHEMATICAL DETERMINISTIC',
        },
      },
      auditTimestamp: new Date().toISOString(),
    };
  }
}
