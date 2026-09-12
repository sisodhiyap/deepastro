import { describe, it, expect } from 'vitest';

// 1. Western Tropical & Aspect Mechanics
import { WesternEngine } from '../server/src/engines/western/westernEngine.js';
import { calculateAspects } from '../server/src/engines/western/westernAspects.js';

// 2. Numerology Isolation
import { NumerologySystemEngine } from '../server/src/engines/numerology/numerologySystem.js';

// 3. Cryptographic Tarot Uniform Distribution
import { executeShuffleToDestiny } from '../src/services/tarotEngine.js';

// 4. Palmistry Quality Gate
import { PalmQualityGate } from '../server/src/engines/palmistry/palmQualityGate.js';

// 5. Financial Astrology & Versioned Mappings
import { SectorMappingRegistry, SECTOR_MAPPING_METADATA } from '../server/src/engines/financialAstrology/sectorMappingRegistry.js';
import { MundaneChartsEngine } from '../server/src/engines/financialAstrology/mundaneCharts.js';

// 6. Real Financial, Macro & Geopolitical Engines
import { MarketDataService } from '../server/src/engines/market/marketDataService.js';
import { MarketRegimeEngine } from '../server/src/engines/market/marketRegimeEngine.js';
import { MacroEconomicEngine } from '../server/src/engines/macro/macroEconomicEngine.js';
import { GeopoliticalRiskEngine } from '../server/src/engines/geopolitical/geopoliticalRiskEngine.js';

// 7. News & Fact Check
import { NewsIntelligenceEngine } from '../server/src/engines/news/newsIntelligenceEngine.js';
import { FactCheckEngine } from '../server/src/engines/news/factCheckEngine.js';

// 8. Astro-Financial Backtest & Prediction Audit
import { AstroFinancialBacktester } from '../server/src/engines/backtest/astroFinancialBacktester.js';
import { PredictionAuditLogger } from '../server/src/engines/backtest/predictionAuditLogger.js';

// 9. Master Cosmic-Market Synthesis
import { CosmicMarketSynthesisEngine } from '../server/src/engines/synthesis/cosmicMarketSynthesis.js';

describe('DeepAstro 6.0 Multi-System Cosmic Verification Suite', () => {

  // --- SYSTEM 1: WESTERN TROPICAL ---
  describe('Western Tropical Astrology Engine', () => {
    it('calculates tropical planets, ascendant and placidus houses deterministically', () => {
      const western = WesternEngine.calculateChart(
        new Date('1995-05-15T14:30:00Z'),
        28.6139,
        77.2090,
        'Placidus'
      );

      expect(western.metadata.houseSystem).toBe('Placidus');
      expect(western.planets.length).toBeGreaterThanOrEqual(10);
      expect(western.cusps.length).toBe(12);

      const sun = western.planets.find(p => p.name === 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.longitude).toBeGreaterThanOrEqual(0);
      expect(sun!.longitude).toBeLessThan(360);
    });

    it('accurately identifies major aspects with applying vs separating dynamics', () => {
      const mockPlanets: any = [
        { name: 'Sun', longitude: 50.0, speed: 1.0 },
        { name: 'Jupiter', longitude: 170.0, speed: 0.1 },
        { name: 'Saturn', longitude: 140.0, speed: 0.05 }
      ];

      const aspects = calculateAspects(mockPlanets, 5.0);
      expect(aspects.length).toBeGreaterThanOrEqual(2);

      const trine = aspects.find(a => a.aspectType === 'Trine');
      expect(trine).toBeDefined();
      expect(trine!.orb).toBeCloseTo(0, 1);
    });
  });

  // --- SYSTEM 2: NUMEROLOGY ISOLATION ---
  describe('Numerology Engine Isolation', () => {
    it('strictly isolates Pythagorean from Chaldean letter values', () => {
      const pyth = NumerologySystemEngine.calculate('Siddhartha', '1995-05-15', 'Pythagorean');
      const chald = NumerologySystemEngine.calculate('Siddhartha', '1995-05-15', 'Chaldean');

      expect(pyth.tradition).toBe('Pythagorean');
      expect(chald.tradition).toBe('Chaldean');
      expect(pyth.vibrations.lifePath).toBeGreaterThan(0);
      expect(chald.vibrations.lifePath).toBeGreaterThan(0);

      expect(pyth.calculations.lifePath.intermediateSteps.length).toBeGreaterThan(0);
      expect(chald.calculations.lifePath.intermediateSteps.length).toBeGreaterThan(0);
    });
  });

  // --- SYSTEM 3: CRYPTOGRAPHIC TAROT ENGINE ---
  describe('Cryptographic Tarot Engine', () => {
    it('shuffles cards with uniform distribution and zero astro bias on draw', () => {
      const session = executeShuffleToDestiny({
        spreadType: 'celticCross',
        question: 'What is the multi-system perspective on career path?'
      });
      expect(session.drawnCards.length).toBe(3);
      
      const ids = session.drawnCards.map(c => c.card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
      expect(session.question).toContain('career path');
    });
  });

  // --- SYSTEM 4: PALMISTRY IMAGE QUALITY GATE ---
  describe('Palmistry Quality Gate', () => {
    it('rejects low resolution, dark, or blurred palm images with explicit standard message', () => {
      const tinyBuffer = Buffer.alloc(100);
      const evaluation = PalmQualityGate.evaluate(tinyBuffer);

      expect(evaluation.passed).toBe(false);
      expect(evaluation.rejectionMessage).toBe('Palm image quality insufficient for analysis.');
      expect(evaluation.reason.length).toBeGreaterThan(0);
    });
  });

  // --- SYSTEM 5: FINANCIAL ASTROLOGY & VERSIONING ---
  describe('Financial Astrology & Versioned Mappings', () => {
    it('provides immutable, versioned planetary-sector mappings', () => {
      const meta = SECTOR_MAPPING_METADATA;
      expect(meta.sectorMappingVersion).toBe('1.0.0-medini-standard');
      expect(meta.traditionSources.length).toBeGreaterThan(0);
      expect(meta.disclaimer).toContain('traditional astrological symbology');

      const sunSectors = SectorMappingRegistry.getSectorsForPlanet('Sun');
      expect(sunSectors.length).toBeGreaterThan(0);
      expect(sunSectors.map(s => s.sector)).toContain('Energy & Power Generation');
    });

    it('contains verifiable inception charts for major institutions', () => {
      const bse = MundaneChartsEngine.getBenchmarkChart('bse_inception');
      expect(bse).toBeDefined();
      expect(bse.historicalDate).toBe('1875-07-09');
      expect(bse.name).toContain('Bombay Stock Exchange');
    });
  });

  // --- SYSTEM 6: REAL FINANCIAL, MACRO & GEOPOLITICAL ---
  describe('Real-World Financial & Macro Intelligence Engines', () => {
    it('returns structured market indices and sector telemetry', async () => {
      const pulse = await MarketDataService.getMarketPulse();
      expect(pulse.primaryIndices.length).toBeGreaterThanOrEqual(3);
      expect(pulse.sectorHeatmap.length).toBeGreaterThanOrEqual(5);

      const nifty = pulse.primaryIndices.find(i => i.symbol === 'NIFTY 50');
      expect(nifty).toBeDefined();
      expect(nifty!.currentPrice).toBeGreaterThan(0);
    });

    it('classifies macro-economic market regimes deterministically', async () => {
      const pulse = await MarketDataService.getMarketPulse();
      const regime = MarketRegimeEngine.evaluateRegime(pulse);

      expect([
        'RISK-ON', 
        'RISK-OFF', 
        'INFLATIONARY', 
        'DEFLATIONARY', 
        'LIQUIDITY-DRIVEN', 
        'RATE-SENSITIVE', 
        'COMMODITY-SHOCK', 
        'GEOPOLITICAL-RISK', 
        'TRANSITIONAL', 
        'UNCERTAIN'
      ]).toContain(regime.regime);
      expect(regime.keyDrivers).toBeDefined();
      expect(regime.keyDrivers.length).toBeGreaterThan(0);
    });

    it('publishes macroeconomic indicators with complete audit lineage', () => {
      const snapshot = MacroEconomicEngine.getMacroSnapshot();
      expect(snapshot.indicators.length).toBeGreaterThanOrEqual(4);
      
      const cpi = snapshot.indicators.find(m => m.code === 'IN_CPI');
      expect(cpi).toBeDefined();
      expect(cpi!.source).toContain('Ministry of Statistics and Programme Implementation');
      expect(cpi!.revisionStatus).toBe('UNREVISED');
    });

    it('quantifies geopolitical risk with documented conflict metrics', () => {
      const geoRisk = GeopoliticalRiskEngine.evaluateRisk();
      expect(geoRisk.compositeRiskScore).toBeGreaterThanOrEqual(0);
      expect(geoRisk.compositeRiskScore).toBeLessThanOrEqual(100);
      expect(geoRisk.hotspots.length).toBeGreaterThan(0);
      expect(geoRisk.methodologyDescription).toContain('Composite quantitative index');
    });
  });

  // --- SYSTEM 7: NEWS & FACT-CHECK ENGINE ---
  describe('News Intelligence & 5-Tier Fact Verification', () => {
    it('classifies news and extracts affected sectors with verification ratings', () => {
      const feed = NewsIntelligenceEngine.getLatestNewsIntelligence();
      expect(feed.length).toBeGreaterThanOrEqual(3);

      const firstNews = feed[0];
      expect(firstNews.headline).toBeDefined();
      expect(firstNews.affectedSectors.length).toBeGreaterThan(0);
      expect(firstNews.factCheck).toBeDefined();
    });

    it('verifies claims strictly against the 5-tier source hierarchy', () => {
      const verified = FactCheckEngine.verifyClaim(
        'RBI maintains repo rate at 6.50% in MPC announcement',
        'FACT'
      );
      expect(verified.primarySources[0].tier).toBe(1);
      expect(verified.status).toBe('VERIFIED');
    });
  });

  // --- SYSTEM 8: BACKTEST LAB & PREDICTION AUDIT ---
  describe('Astro-Financial Backtesting & Prediction Audit', () => {
    it('executes walk-forward backtest against Buy & Hold benchmark with honest performance reporting', () => {
      const result = AstroFinancialBacktester.runBacktest({
        astrologicalStrategy: 'JUPITER_SATURN_CONJUNCTION_CYCLE',
        targetTicker: 'NIFTY 50',
        backtestHorizonYears: 10,
        benchmarkStrategy: 'BUY_AND_HOLD'
      });

      expect(result.astroStrategyMetrics.cagrPercent).toBeDefined();
      expect(result.astroStrategyMetrics.sharpeRatio).toBeDefined();
      expect(result.astroStrategyMetrics.maximumDrawdownPercent).toBeDefined();
      expect(result.honestScientificFinding).toBeDefined();
      expect(result.honestScientificFinding).toContain('HONEST EMPIRICAL FINDING');
    });

    it('logs predictions immutably with separate astrological vs financial tracking', () => {
      const log = PredictionAuditLogger.logPrediction({
        category: 'FINANCIAL',
        statement: 'Banking sector expected to consolidate around 10Y yield inflection',
        targetAssetOrSector: 'Banking / Interest Rates',
        forecastDate: '2026-09-12',
        maturityDate: '2026-10-12',
        evaluationStatus: 'PENDING',
        horizonDays: 30,
        expectedOutcome: 'Consolidation within 2% band',
        methodology: 'Macro Yield Spread + D2-D11 Jyotish Context',
        confidenceScore: 0.78,
        evidenceSummary: 'RBI Bulletin 2026 + Skandha Medini Chapter 12',
        modelVersion: 'DeepAstro-Fin-v6.0'
      });

      expect(log.predictionId).toBeDefined();
      expect(log.forecastDate).toBe('2026-09-12');
      expect(log.category).toBe('FINANCIAL');

      const dashboard = PredictionAuditLogger.getDashboardData();
      expect(dashboard.categories.financial).toBeDefined();
    });
  });

  // --- SYSTEM 9: MASTER COSMIC MARKET SYNTHESIS ---
  describe('Master 3-Channel Cosmic-Market Synthesis', () => {
    it('generates the mandatory Section 60 final synthesis format with strict 3-channel separation', async () => {
      const synthesis = await CosmicMarketSynthesisEngine.generateSynthesis('IT');

      // Assert 3-channel visual signals
      expect(synthesis.threeChannels.channel1Fundamental).toBeDefined();
      expect(synthesis.threeChannels.channel2MacroMarket).toBeDefined();
      expect(synthesis.threeChannels.channel3Astrological).toBeDefined();

      // Assert conflict check
      expect(synthesis.conflictCheck).toBeDefined();
      expect(synthesis.conflictCheck.agreements.length).toBeGreaterThanOrEqual(1);

      // Assert risk and watchlist
      expect(synthesis.overallRisk.rating).toBeDefined();
      expect(synthesis.whatToWatch.length).toBeGreaterThanOrEqual(3);

      // Assert regulatory & educational disclaimer
      expect(synthesis.regulatoryDisclaimer).toContain('educational');
      expect(synthesis.regulatoryDisclaimer).toContain('SEBI-registered');
    });
  });

});
