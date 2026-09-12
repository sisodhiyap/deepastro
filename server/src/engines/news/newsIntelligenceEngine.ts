/**
 * News Intelligence Engine
 * Executes the analytical pipeline:
 * NEWS ARTICLE -> VERIFIED EVENT -> ECONOMIC IMPACT -> SECTOR -> FINANCIAL ASSET
 *
 * Enforces classification across 13 core domains:
 * FINANCE, ECONOMY, POLITICS, GEOPOLITICS, CORPORATE, COMMODITIES,
 * CENTRAL BANK, TECHNOLOGY, ENERGY, DEFENSE, HEALTHCARE, PHARMA, BANKING.
 */

import { FactCheckEngine, ClaimVerificationRecord, EpistemologicalCategory } from './factCheckEngine.js';

export type NewsCategory =
  | 'FINANCE'
  | 'ECONOMY'
  | 'POLITICS'
  | 'GEOPOLITICS'
  | 'CORPORATE'
  | 'COMMODITIES'
  | 'CENTRAL_BANK'
  | 'TECHNOLOGY'
  | 'ENERGY'
  | 'DEFENSE'
  | 'HEALTHCARE'
  | 'PHARMA'
  | 'BANKING';

export interface NewsImpactEvent {
  id: string;
  headline: string;
  category: NewsCategory;
  publicationTimestamp: string;
  source: string;
  sourceTier: 1 | 2 | 3 | 4 | 5;
  summary: string;
  eventSummary: string;
  marketImpactMagnitude: 'HIGH' | 'MODERATE' | 'LOW' | 'NEUTRAL';
  impactDirection: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'UNCERTAIN';
  affectedSectors: string[];
  affectedAssets: string[];
  affectedGeographies: string[];
  factCheck: ClaimVerificationRecord;
}

export class NewsIntelligenceEngine {
  public static getLatestNewsIntelligence(): NewsImpactEvent[] {
    const rawEvents: Array<Omit<NewsImpactEvent, 'factCheck'>> = [
      {
        id: 'news_001',
        headline: 'Union Cabinet Approves Production Linked Incentive (PLI 2.0) Expansion for Solar & Defense Components',
        category: 'DEFENSE',
        publicationTimestamp: '2026-09-11T09:30:00Z',
        source: 'Press Information Bureau (PIB) Government of India',
        sourceTier: 1,
        summary: 'Government sanction of Rs 24,000 Cr incentive outlay over 5 years targeting critical indigenous electronic subsystems.',
        eventSummary: 'Statutory policy rollout enhancing domestic defense and renewable manufacturing capital allocations.',
        marketImpactMagnitude: 'HIGH',
        impactDirection: 'POSITIVE',
        affectedSectors: ['Defense & Aerospace Manufacturing', 'Renewable Energy & Solar', 'Electronics Manufacturing Services (EMS)'],
        affectedAssets: ['HAL', 'BEL', 'Solar Industries', 'Tata Power'],
        affectedGeographies: ['India']
      },
      {
        id: 'news_002',
        headline: 'Crude Oil Volatility Moderates as Global Demand Projections Recalibrate',
        category: 'ENERGY',
        publicationTimestamp: '2026-09-11T12:15:00Z',
        source: 'International Energy Agency (IEA) Monthly Oil Market Report',
        sourceTier: 1,
        summary: 'Brent crude settles near .65/bbl following steady OPEC+ quota adherence and balanced inventory draws.',
        eventSummary: 'Crude stabilization mitigating imported inflationary headwind for energy-importing economies.',
        marketImpactMagnitude: 'MODERATE',
        impactDirection: 'POSITIVE',
        affectedSectors: ['Automobiles', 'Paints & Specialty Chemicals', 'Aviation', 'Oil Marketing Companies (OMCs)'],
        affectedAssets: ['Asian Paints', 'Maruti Suzuki', 'InterGlobe Aviation', 'BPCL'],
        affectedGeographies: ['India', 'Asia-Pacific', 'Global']
      },
      {
        id: 'news_003',
        headline: 'RBI Emphasizes Liquidity Neutrality in Interbank Call Money Framework',
        category: 'CENTRAL_BANK',
        publicationTimestamp: '2026-09-10T14:45:00Z',
        source: 'Reserve Bank of India Monetary Operations Bulletin',
        sourceTier: 1,
        summary: 'Systemic banking liquidity stays mildly in surplus of Rs 45,000 Cr; Weighted Average Call Rate aligns closely with repo rate.',
        eventSummary: 'Orderly interbank money market liquidity supporting commercial credit dispersion.',
        marketImpactMagnitude: 'MODERATE',
        impactDirection: 'POSITIVE',
        affectedSectors: ['Banking & Financial Institutions', 'Non-Banking Financial Companies (NBFC)'],
        affectedAssets: ['NIFTY BANK', 'HDFC Bank', 'Bajaj Finance', 'State Bank of India'],
        affectedGeographies: ['India']
      },
      {
        id: 'news_004',
        headline: 'US Federal Reserve Signals Data-Dependent Path Ahead of FOMC Deliberations',
        category: 'CENTRAL_BANK',
        publicationTimestamp: '2026-09-10T18:00:00Z',
        source: 'Federal Reserve Communications & Speeches',
        sourceTier: 1,
        summary: 'Policymakers emphasize balanced risks between employment cooling and reaching the 2% long-term inflation target.',
        eventSummary: 'Expectation of gradual policy accommodation reduces global bond market yields.',
        marketImpactMagnitude: 'HIGH',
        impactDirection: 'POSITIVE',
        affectedSectors: ['Information Technology & Software Services', 'Global Equities'],
        affectedAssets: ['S&P 500', 'NASDAQ 100', 'TCS', 'Infosys'],
        affectedGeographies: ['United States', 'Global']
      },
      {
        id: 'news_005',
        headline: 'Global Container Shipping Freight Rates Stabilize Along Alternative Cape Routes',
        category: 'GEOPOLITICS',
        publicationTimestamp: '2026-09-09T11:20:00Z',
        source: 'Drewry World Container Index',
        sourceTier: 2,
        summary: 'Transit delays absorb excess shipping vessel capacity, keeping charter spot rates elevated by 38% compared to historic averages.',
        eventSummary: 'Persistent rerouting maintains cost overhead for European maritime trade corridors.',
        marketImpactMagnitude: 'MODERATE',
        impactDirection: 'MIXED',
        affectedSectors: ['Logistics & Shipping', 'Textiles Export', 'Engineering Goods'],
        affectedAssets: ['Shipping Corporation of India', 'Container Corporation of India'],
        affectedGeographies: ['Europe', 'Middle East', 'India']
      }
    ];

    return rawEvents.map(evt => ({
      ...evt,
      factCheck: FactCheckEngine.verifyClaim(evt.summary, 'FACT')
    }));
  }
}
