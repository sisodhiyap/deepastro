/**
 * UniversalCardOrchestrator (Universal Insight Layer v4.2.1)
 * Converts structured domain engine outputs into typed, validated visual cards.
 * Enforces the universal contract, placeholder elimination, and action injection.
 */

import { PastLifeCardEngine } from '../intelligence/pastlife/PastLifeCardEngine.js';
import { PastLifeInsightSchema } from '../intelligence/pastlife/PastLifeTypes.js';
import { MarketHealthTelemetry, NewsHealthTelemetry } from '../intelligence/realtime/RealTimeDataHealthEngine.js';

export interface AstroBotCardPayload {
  type:
    | 'PAST_LIFE_INSIGHT'
    | 'SOUL_JOURNEY'
    | 'MARKET_INSIGHT'
    | 'NEWS_INSIGHT'
    | 'DEEPASTRO_ANSWER'
    | 'KUNDLI_INSIGHT'
    | 'NUMEROLOGY_INSIGHT'
    | 'PANCHANG_INSIGHT'
    | 'FUTURE_INSIGHT'
    | 'FUTURE_YEAR'
    | 'FUTURE_MONTH'
    | 'FUTURE_LONGEVITY';
  data: any;
}

export interface UniversalAstroBotResponse {
  answer: string;
  intent: string;
  confidence: number;
  data_sources: string[];
  evidence: any[];
  card: AstroBotCardPayload | null;
  card_type: string;
  actions: string[];
}

export class UniversalCardOrchestrator {
  private static readonly PLACEHOLDER_REGEX = /\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/;

  /**
   * Validate that no template variables (e.g. {{name}}, {{market.price}}) exist in the payload
   */
  public static validatePayload(obj: any): void {
    if (!obj) return;
    if (typeof obj === 'string') {
      if (this.PLACEHOLDER_REGEX.test(obj)) {
        throw new Error(`PLACEHOLDER_DETECTED: Card payload contains unresolved template variable: ${obj}`);
      }
      return;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.validatePayload(item);
      }
      return;
    }
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        this.validatePayload(obj[key]);
      }
    }
  }

  /**
   * Format Past Life Insight Card (Format A)
   */
  public static createPastLifeInsightCard(
    schema: PastLifeInsightSchema
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData: any = PastLifeCardEngine.formatForInsightCard(schema);
    cardData.rawSchema = schema;
    this.validatePayload(cardData);

    return {
      card: {
        type: 'PAST_LIFE_INSIGHT',
        data: cardData,
      },
      actions: [
        'Why this reading?',
        'Deep Soul Journey',
        'View Sources',
        'Save Reading',
        'Export PDF',
      ],
    };
  }

  /**
   * Format Soul Journey Full Report (Format B)
   */
  public static createSoulJourneyCard(
    schema: PastLifeInsightSchema
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = PastLifeCardEngine.formatForSoulJourney(schema);
    this.validatePayload(cardData);

    return {
      card: {
        type: 'SOUL_JOURNEY',
        data: schema,
      },
      actions: ['View Provenance Ledger', 'Save Reading', 'Export High-Res PDF'],
    };
  }

  /**
   * Format Market Insight Card
   */
  public static createMarketInsightCard(
    market: MarketHealthTelemetry,
    astroContext?: any
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      symbol: market.symbol,
      exchange: market.exchange,
      currency: market.currency,
      price: market.price,
      change: market.change,
      percentChange: market.percentChange,
      marketStatus: market.marketStatus,
      timestamp: market.timestamp,
      dataAgeSeconds: market.dataAgeSeconds,
      freshnessStatus: market.freshnessStatus,
      provenanceSource: market.provenanceSource,
      whyItMatters: astroContext?.empiricalFactsSummary || `Tracking ${market.symbol} during the active ${market.exchange} session.`,
      astrologicalContext: astroContext?.astrologicalContextSummary || 'Traditional qualitative astrological context indicates focus on disciplined capital management.',
      epistemicDisclaimer: astroContext?.epistemicDisclaimer || 'Market quotes are verified external telemetry. Astrological correlation is traditional and qualitative only.',
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'MARKET_INSIGHT',
        data: cardData,
      },
      actions: ['Why this reading?', 'View Sources', 'Refresh Market Telemetry'],
    };
  }

  /**
   * Format News Insight Card
   */
  public static createNewsInsightCard(
    news: NewsHealthTelemetry,
    astroContext?: any
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      headline: news.headline,
      source: news.source,
      provider: news.provider,
      publishedAt: news.publishedAt,
      fetchedAt: news.fetchedAt,
      dataAgeSeconds: news.dataAgeSeconds,
      freshnessStatus: news.freshnessStatus,
      category: news.category,
      summary: news.summary,
      sourceUrl: news.sourceUrl,
      personalRelevance: astroContext?.combinedNarrative || 'Current macro developments provide context for strategic decision making without sensitive trait inference.',
      epistemicDisclaimer: astroContext?.epistemicDisclaimer || 'News facts are sourced from verified public wires. Astrological context is qualitative.',
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'NEWS_INSIGHT',
        data: cardData,
      },
      actions: ['View Full Story', 'View Sources', 'Save Insight'],
    };
  }

  /**
   * Format Kundli Insight Card
   */
  public static createKundliInsightCard(
    kundli: any,
    userProfile: any
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      userName: userProfile?.fullName || 'User',
      ascendant: kundli?.ascendant?.details?.signName || 'Aries',
      moonSign: kundli?.moonSign?.signName || 'Cancer',
      sunSign: kundli?.sunSign?.signName || 'Leo',
      nakshatra: kundli?.moonNakshatra?.name || 'Ashwini',
      nakshatraLord: kundli?.moonNakshatra?.lord || 'Ketu',
      currentMahadasha: kundli?.dashas?.currentMahadasha?.planet || 'Jupiter',
      keyPlanets: (kundli?.planets || []).slice(0, 7).map((p: any) => ({
        name: p.name,
        sign: p.signName,
        house: p.house,
        degree: p.formattedDegree || `${Math.floor(p.degree || 0)}°`,
      })),
      sources: ['Swiss Ephemeris Deterministic Engine', 'Brihat Parashara Hora Shastra'],
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'KUNDLI_INSIGHT',
        data: cardData,
      },
      actions: ['View Divisional Charts (D9)', 'Dasha Timeline', 'Save Chart'],
    };
  }

  /**
   * Format Numerology Insight Card
   */
  public static createNumerologyInsightCard(
    numerology: any,
    userName: string
  ): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      userName: userName || 'User',
      lifePath: numerology?.lifePathNumber || 1,
      destinyNumber: numerology?.destinyNumber || numerology?.expressionNumber || 1,
      soulUrge: numerology?.soulUrgeNumber || 1,
      personalityNumber: numerology?.personalityNumber || 1,
      interpretation: numerology?.interpretation || 'Strong vibration of purpose and individuality.',
      sources: ['Pythagorean & Chaldean Numerology Formulas'],
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'NUMEROLOGY_INSIGHT',
        data: cardData,
      },
      actions: ['View Detailed Numbers', 'Save Reading'],
    };
  }

  /**
   * Format Future Insight Hero Card
   */
  public static createFutureInsightCard(forecast: any): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      id: forecast.id,
      horizon: forecast.horizon,
      currentLifePhase: forecast.currentLifePhase,
      overall10YearTheme: forecast.overall10YearTheme,
      nextMajorWindow: forecast.nextMajorWindow,
      yearHighlights: (forecast.yearForecasts || []).slice(0, 5).map((y: any) => ({
        year: y.year,
        theme: y.overallTheme,
        domain: y.strongestDomain,
        confidence: y.confidence,
        strongWindows: y.strongWindows,
      })),
      keyDomains: {
        career: forecast.domainForecasts?.CAREER?.upcomingWindows || 'Consolidation phase',
        finance: forecast.domainForecasts?.FINANCE?.upcomingWindows || 'Accumulation phase',
        relationship: forecast.domainForecasts?.RELATIONSHIP?.upcomingWindows || 'Harmony phase',
        spirituality: forecast.domainForecasts?.SPIRITUALITY?.upcomingWindows || 'Reflective phase',
      },
      scenarios: forecast.scenarios,
      remedies: (forecast.remedies || []).slice(0, 2),
      disclaimer: forecast.disclaimer,
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'FUTURE_INSIGHT',
        data: cardData,
      },
      actions: [
        'Explore Next 10 Years',
        'Break Down Month by Month',
        'Why this forecast?',
        'Longevity & Wellbeing',
        'Save Forecast',
      ],
    };
  }

  /**
   * Format Future Year Card
   */
  public static createFutureYearCard(yearForecast: any): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      year: yearForecast.year,
      overallTheme: yearForecast.overallTheme,
      strongestDomain: yearForecast.strongestDomain,
      careerOutlook: yearForecast.careerOutlook,
      businessOutlook: yearForecast.businessOutlook,
      financeOutlook: yearForecast.financeOutlook,
      relationshipOutlook: yearForecast.relationshipOutlook,
      strongWindows: yearForecast.strongWindows,
      cautionWindows: yearForecast.cautionWindows,
      confidence: yearForecast.confidence,
      activeDasha: yearForecast.activeDasha,
      keyTransits: yearForecast.keyTransits,
      evidenceSummary: yearForecast.evidenceSummary,
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'FUTURE_YEAR',
        data: cardData,
      },
      actions: ['Break Down Month by Month', 'Why this forecast?', 'Compare with Next Year'],
    };
  }

  /**
   * Format Future Month Card
   */
  public static createFutureMonthCard(monthForecast: any): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      year: monthForecast.year,
      month: monthForecast.month,
      monthName: monthForecast.monthName,
      theme: monthForecast.theme,
      careerSignal: monthForecast.careerSignal,
      relationshipSignal: monthForecast.relationshipSignal,
      financeSignal: monthForecast.financeSignal,
      spiritualitySignal: monthForecast.spiritualitySignal,
      keyWindow: monthForecast.keyWindow,
      whyBasis: monthForecast.whyBasis,
      confidence: monthForecast.confidence,
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'FUTURE_MONTH',
        data: cardData,
      },
      actions: ['Next Month', 'View Full Year', 'Why this forecast?'],
    };
  }

  /**
   * Format Future Longevity Card
   */
  public static createFutureLongevityCard(longevity: any): { card: AstroBotCardPayload; actions: string[] } {
    const cardData = {
      vitalityTheme: longevity.vitalityTheme,
      resilienceIndicators: longevity.resilienceIndicators,
      selfCareWindows: longevity.selfCareWindows,
      lifestyleRecommendations: longevity.lifestyleRecommendations,
      epistemicDisclaimer: longevity.epistemicDisclaimer,
    };

    this.validatePayload(cardData);

    return {
      card: {
        type: 'FUTURE_LONGEVITY',
        data: cardData,
      },
      actions: ['View Preventive Practices', 'Return to Future Map'],
    };
  }

}
