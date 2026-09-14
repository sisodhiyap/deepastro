/**
 * RealTimeAstroContextEngine (Universal Insight Layer v4.2.1)
 * Bridges verified real-time events (market movements, headlines) with
 * traditional astrological planetary transits and natal chart context.
 *
 * Strict Epistemic Calibration:
 * Clear boundary between empirical facts (prices, headlines) and traditional
 * astrological correlations. NEVER asserts planetary causality over markets.
 */

import { MarketHealthTelemetry, NewsHealthTelemetry } from './RealTimeDataHealthEngine.js';

export interface AstroContextSynthesisResult {
  empiricalFactsSummary: string;
  astrologicalContextSummary: string;
  combinedNarrative: string;
  fusedSignals: Array<{
    title: string;
    description: string;
    type: 'growth' | 'caution' | 'milestone' | 'neutral';
    category: 'EMPIRICAL_FACT' | 'ASTROLOGICAL_THEME';
  }>;
  epistemicDisclaimer: string;
}

export class RealTimeAstroContextEngine {
  public static synthesizeMarketAstro(
    market: MarketHealthTelemetry,
    kundli?: any
  ): AstroContextSynthesisResult {
    const isBullish = market.change >= 0;
    const sign = isBullish ? '+' : '';

    const empiricalFactsSummary = `${market.symbol} is currently trading at ₹${market.price.toLocaleString()} (${sign}${market.percentChange.toFixed(2)}%), Session: ${market.marketStatus}. Sourced from ${market.provenanceSource} (${market.freshnessStatus}).`;

    const dashaPlanet = kundli?.dashas?.currentMahadasha?.planet || 'Jupiter';
    const moonSign = kundli?.moonSign?.signName || 'Aries';
    const lagna = kundli?.ascendant?.details?.signName || 'Taurus';

    const astrologicalContextSummary = `From a traditional Vedic astrological perspective, your current chart period (${dashaPlanet} Mahadasha with ${moonSign} Moon and ${lagna} Ascendant) highlights themes of disciplined resource allocation and strategic timing. Practitioners traditionally associate this transit phase with evaluating structural value rather than chasing speculative volatility.`;

    const combinedNarrative = `${empiricalFactsSummary} While financial markets move strictly by real-world liquidity, institutional flows, and macro fundamentals, your chart's symbolic rhythm encourages a disciplined and grounded approach to your financial decisions.`;

    const fusedSignals: AstroContextSynthesisResult['fusedSignals'] = [
      {
        title: `${market.symbol} Index Movement`,
        description: `₹${market.price.toLocaleString()} (${sign}${market.percentChange.toFixed(2)}%) - ${market.freshnessStatus}`,
        type: isBullish ? 'growth' : 'caution',
        category: 'EMPIRICAL_FACT',
      },
      {
        title: 'Empirical Risk Boundary',
        description: 'Asset allocations should always be governed by stop-losses, capital management, and verified data.',
        type: 'neutral',
        category: 'EMPIRICAL_FACT',
      },
      {
        title: `Transit & Dasha Correlation (${dashaPlanet})`,
        description: `Traditional Jyotish associates the active ${dashaPlanet} cycle with long-term prudence and risk mitigation.`,
        type: 'milestone',
        category: 'ASTROLOGICAL_THEME',
      },
    ];

    const epistemicDisclaimer =
      'Traditional Astrological Interpretation Notice: Planetary transits and chart cycles provide symbolic qualitative context only. Astrological themes must never be construed as financial advice or price causality. All investment decisions require independent professional research.';

    return {
      empiricalFactsSummary,
      astrologicalContextSummary,
      combinedNarrative,
      fusedSignals,
      epistemicDisclaimer,
    };
  }

  public static synthesizeNewsAstro(
    news: NewsHealthTelemetry,
    kundli?: any
  ): AstroContextSynthesisResult {
    const empiricalFactsSummary = `Reported by ${news.source} (${news.freshnessStatus}): "${news.headline}" - ${news.summary}`;

    const lagna = kundli?.ascendant?.details?.signName || 'General';
    const dashaPlanet = kundli?.dashas?.currentMahadasha?.planet || 'Mercury';

    const astrologicalContextSummary = `In traditional mundane astrology, current planetary configurations emphasize periods of systemic reassessment. For your chart's active ${dashaPlanet} period, external news of this category is symbolically resonant with maintaining adaptable focus on core responsibilities.`;

    const combinedNarrative = `${empiricalFactsSummary} This news matters to you because your active astrological phase prioritizes staying informed on macro shifts while safeguarding personal focus.`;

    const fusedSignals: AstroContextSynthesisResult['fusedSignals'] = [
      {
        title: 'Verified Global Headline',
        description: `${news.headline} (${news.source})`,
        type: 'neutral',
        category: 'EMPIRICAL_FACT',
      },
      {
        title: 'Personal Relevance Alignment',
        description: 'Focus on actionable responsibilities within your direct locus of control.',
        type: 'growth',
        category: 'ASTROLOGICAL_THEME',
      },
    ];

    const epistemicDisclaimer =
      'News events are strictly driven by real-world geopolitical and economic actors. Astrological themes offer qualitative philosophical reflection only.';

    return {
      empiricalFactsSummary,
      astrologicalContextSummary,
      combinedNarrative,
      fusedSignals,
      epistemicDisclaimer,
    };
  }
}
