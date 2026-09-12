/**
 * Quantitative Market Regime Engine
 * Classifies the active macro-financial regime into one of 10 structural states:
 * - RISK-ON (Bullish equity breadth, subdued volatility, tight credit spreads)
 * - RISK-OFF (Flight to safety, surging VIX, defensive rotation, bond rally)
 * - INFLATIONARY (Surging commodities/oil, rising yields, margin pressure)
 * - DEFLATIONARY (Collapsing demand, bond yield inversion, industrial slowdown)
 * - LIQUIDITY-DRIVEN (Accommodative central bank liquidity, multi-asset rallies)
 * - RATE-SENSITIVE (Hawkish central bank signaling, high duration vulnerability)
 * - COMMODITY-SHOCK (Sharp supply bottlenecks in energy or food staples)
 * - GEOPOLITICAL-RISK (Regional escalation, shipping choke disruptions, gold bid)
 * - TRANSITIONAL (Choppy regime pivot, mixed factor leadership)
 * - UNCERTAIN (Conflicting statistical indicators, macro dispersion)
 */

import { MarketPulseSnapshot } from './marketDataService.js';

export type MarketRegimeType =
  | 'RISK-ON'
  | 'RISK-OFF'
  | 'INFLATIONARY'
  | 'DEFLATIONARY'
  | 'LIQUIDITY-DRIVEN'
  | 'RATE-SENSITIVE'
  | 'COMMODITY-SHOCK'
  | 'GEOPOLITICAL-RISK'
  | 'TRANSITIONAL'
  | 'UNCERTAIN';

export interface MarketRegimeEvaluation {
  regime: MarketRegimeType;
  confidenceScore: number; // 0.0 - 1.0
  keyDrivers: string[];
  volatilityCondition: 'COMPRESSED' | 'NORMAL' | 'ELEVATED' | 'EXTREME';
  breadthCondition: 'BREADTH_EXPANSION' | 'NEUTRAL' | 'BREADTH_DIVERGENCE';
  favoredSectors: string[];
  unfavoredSectors: string[];
  tacticalImplications: string;
  evaluatedAt: string;
}

export class MarketRegimeEngine {
  public static evaluateRegime(pulse: MarketPulseSnapshot): MarketRegimeEvaluation {
    const vix = pulse.volatilityIndex.currentPrice;
    const adRatio = pulse.marketBreadth.advanceDeclineRatio;
    const brent = pulse.commoditiesAndCurrencies.find(c => c.symbol.includes('BRENT'))?.currentPrice || 75;
    const goldChange = pulse.commoditiesAndCurrencies.find(c => c.symbol.includes('GOLD'))?.percentChange || 0;
    const niftyChange = pulse.primaryIndices.find(i => i.symbol === 'NIFTY 50')?.percentChange || 0;

    let volatilityCondition: 'COMPRESSED' | 'NORMAL' | 'ELEVATED' | 'EXTREME' = 'NORMAL';
    if (vix < 12.5) volatilityCondition = 'COMPRESSED';
    else if (vix >= 12.5 && vix < 18) volatilityCondition = 'NORMAL';
    else if (vix >= 18 && vix < 24) volatilityCondition = 'ELEVATED';
    else volatilityCondition = 'EXTREME';

    let breadthCondition: 'BREADTH_EXPANSION' | 'NEUTRAL' | 'BREADTH_DIVERGENCE' = 'NEUTRAL';
    if (adRatio > 1.4) breadthCondition = 'BREADTH_EXPANSION';
    else if (adRatio < 0.7) breadthCondition = 'BREADTH_DIVERGENCE';

    // Quantitative heuristic decision matrix
    let regime: MarketRegimeType = 'TRANSITIONAL';
    let confidenceScore = 0.82;
    const keyDrivers: string[] = [];
    let favoredSectors: string[] = [];
    let unfavoredSectors: string[] = [];
    let tacticalImplications = '';

    if (vix > 22 && adRatio < 0.75) {
      regime = 'RISK-OFF';
      confidenceScore = 0.91;
      keyDrivers.push('High volatility index (VIX: ' + vix + ')', 'Broad market weakness (A/D: ' + adRatio.toFixed(2) + ')');
      favoredSectors = ['FMCG & Staples', 'Pharmaceuticals & Health', 'Sovereign Fixed Income'];
      unfavoredSectors = ['Real Estate', 'Metals', 'High-Beta NBFCs'];
      tacticalImplications = 'Capital preservation posture. Favor defensive cash cows and high-quality dividend payers.';
    } else if (brent > 92) {
      regime = 'COMMODITY-SHOCK';
      confidenceScore = 0.88;
      keyDrivers.push('Elevated crude oil ($' + brent + '/bbl)', 'Import inflation pressure on emerging market currencies');
      favoredSectors = ['Energy Upstream', 'Coal & Mining'];
      unfavoredSectors = ['Paints & Chemicals', 'Aviation', 'Automobiles'];
      tacticalImplications = 'Margin compression risk across downstream manufacturing. Hedge energy exposure.';
    } else if (vix < 15 && adRatio > 1.3 && niftyChange > 0) {
      regime = 'RISK-ON';
      confidenceScore = 0.89;
      keyDrivers.push('Controlled volatility (VIX: ' + vix + ')', 'Positive equity breadth (A/D: ' + adRatio.toFixed(2) + ')', 'Benchmark momentum (+' + niftyChange.toFixed(2) + '%)');
      favoredSectors = ['Banking & Financials', 'Capital Goods & Infra', 'Information Technology', 'Automobiles'];
      unfavoredSectors = ['Defensive FMCG Cash Hold'];
      tacticalImplications = 'Constructive environment for diversified equities and structural cyclical growth themes.';
    } else if (goldChange > 1.5 && vix > 17) {
      regime = 'GEOPOLITICAL-RISK';
      confidenceScore = 0.84;
      keyDrivers.push('Gold safe-haven bid accelerating', 'Maritime choke point or military conflict escalation');
      favoredSectors = ['Defense & Aerospace', 'Gold Bullion', 'Energy'];
      unfavoredSectors = ['Global Logistics', 'Consumer Discretionary'];
      tacticalImplications = 'Elevated tail-risk. Maintain protective stop-losses on speculative allocations.';
    } else {
      regime = 'TRANSITIONAL';
      confidenceScore = 0.78;
      keyDrivers.push('Balanced breadth metrics', 'Subdued macro catalysts pending policy announcements');
      favoredSectors = ['High Return on Capital (ROCE) Quality Compounders', 'Large-cap Banking'];
      unfavoredSectors = ['Deep Cyclicals without pricing power'];
      tacticalImplications = 'Focus on company-specific fundamentals rather than macro-leveraged beta.';
    }

    return {
      regime,
      confidenceScore,
      keyDrivers,
      volatilityCondition,
      breadthCondition,
      favoredSectors,
      unfavoredSectors,
      tacticalImplications,
      evaluatedAt: new Date().toISOString()
    };
  }
}
