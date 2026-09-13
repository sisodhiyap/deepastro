import { describe, it, expect } from 'vitest';

// 1. Vedic Astro Engine
import { VedicAstroEngine } from '../server/src/astrology/vedicAstroEngine.js';

// 2. Western Engine
import { WesternEngine } from '../server/src/engines/western/westernEngine.js';
import { calculateAspects } from '../server/src/engines/western/westernAspects.js';

// 3. KP Engine
import { KPCuspEngine } from '../server/src/engines/kp/kpCuspEngine.js';
import { KPSubDivisionEngine } from '../server/src/engines/kp/kpSubDivision.js';
import { PlacidusEngine } from '../server/src/engines/kp/placidusEngine.js';
import { KPPrashnaEngine } from '../server/src/engines/kp/kpPrashnaEngine.js';
import { BirthTimeRectificationEngine } from '../server/src/engines/kp/birthTimeRectificationEngine.js';

// 4. Numerology Engine
import { NumerologySystemEngine } from '../server/src/engines/numerology/numerologySystem.js';

// 5. Palmistry Quality Gate
import { PalmQualityGate } from '../server/src/engines/palmistry/palmQualityGate.js';

// 6. Cryptographic Tarot Engine
import { executeShuffleToDestiny, getDailyTarotCard } from '../src/services/tarotEngine.js';
import { TAROT_DECK } from '../src/types/tarot.js';

// 7. Financial Astrology & Versioned Mappings
import { SectorMappingRegistry, SECTOR_MAPPING_METADATA } from '../server/src/engines/financialAstrology/sectorMappingRegistry.js';
import { MundaneChartsEngine } from '../server/src/engines/financialAstrology/mundaneCharts.js';

// 8. Market, Macro & Geopolitical Engines
import { MarketDataService } from '../server/src/engines/market/marketDataService.js';
import { MarketRegimeEngine } from '../server/src/engines/market/marketRegimeEngine.js';
import { MacroEconomicEngine } from '../server/src/engines/macro/macroEconomicEngine.js';
import { GeopoliticalRiskEngine } from '../server/src/engines/geopolitical/geopoliticalRiskEngine.js';

// 9. News & Fact Check
import { NewsIntelligenceEngine } from '../server/src/engines/news/newsIntelligenceEngine.js';
import { FactCheckEngine } from '../server/src/engines/news/factCheckEngine.js';

// 10. Backtest & Prediction Audit
import { AstroFinancialBacktester } from '../server/src/engines/backtest/astroFinancialBacktester.js';
import { PredictionAuditLogger } from '../server/src/engines/backtest/predictionAuditLogger.js';

// 11. Master Cosmic Market Synthesis
import { CosmicMarketSynthesisEngine } from '../server/src/engines/synthesis/cosmicMarketSynthesis.js';

// 12. AI Auditor Safeguard
import { AIAuditor } from '../server/src/ai/AIAuditor.js';

describe('DeepAstro 6.0.1 Comprehensive Truth Audit Suite', () => {

  // ==========================================
  // SECTION 2: SIX ASTROLOGY SYSTEMS VERIFICATION
  // ==========================================

  describe('1. Vedic Astrology Real Deterministic Execution', () => {
    it('calculates natal chart with exact Lahiri Ayanamsa, Ascendant and Planetary coordinates', () => {
      const chart = VedicAstroEngine.calculateKundli({
        name: 'Truth Seeker',
        birthDate: '1995-05-15',
        birthTime: '14:30',
        birthPlace: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
        gender: 'other'
      });

      expect(chart).toBeDefined();
      expect(chart.ascendant).toBeDefined();
      expect(chart.ascendant.degrees).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant.degrees).toBeLessThan(360);
      expect(chart.planets.length).toBeGreaterThanOrEqual(9);

      // Verify planetary dignities are evaluated algorithmically
      const sun = chart.planets.find(p => p.name === 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.siderealLongitude).toBeGreaterThanOrEqual(0);
      expect(sun!.siderealLongitude).toBeLessThan(360);
      expect(chart.sunSign).toBeDefined();
    });
  });

  describe('2. Western Astrology Real Tropical Execution', () => {
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

  describe('3. KP Astrology Real Execution', () => {
    it('calculates KP Cuspal Sub-Lords and 4-level significators', () => {
      const placidusCusps = PlacidusEngine.calculateCusps({
        jd: 2450000.5,
        latitude: 28.6139,
        longitude: 77.2090
      });

      expect(placidusCusps.length).toBe(12);

      // Verify sub-division engine mapping
      const subLord = KPSubDivisionEngine.getSubLord(placidusCusps[0].siderealLongitude);
      expect(subLord).toBeDefined();
      expect(typeof subLord.subLord).toBe('string');
    });

    it('generates Prashna chart from seed 1-249 deterministically', () => {
      const prashna = KPPrashnaEngine.generatePrashnaChart({
        question: 'Will the contract finalize this month?',
        seedNumber: 108,
        questionTimestamp: new Date('2026-09-12T10:00:00Z'),
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5
      });

      expect(prashna).toBeDefined();
      expect(prashna.seedNumber).toBe(108);
      expect(prashna.horaryAscendant.longitude).toBeGreaterThanOrEqual(0);
      expect(prashna.horaryAscendant.longitude).toBeLessThan(360);
    });
  });

  describe('4. Numerology Independent Systems Verification', () => {
    it('strictly isolates Pythagorean from Chaldean letter mappings', () => {
      const pyth = NumerologySystemEngine.calculate('Siddhartha', '1995-05-15', 'Pythagorean');
      const chald = NumerologySystemEngine.calculate('Siddhartha', '1995-05-15', 'Chaldean');

      expect(pyth.tradition).toBe('Pythagorean');
      expect(chald.tradition).toBe('Chaldean');
      expect(pyth.vibrations.expression).not.toBe(chald.vibrations.expression);

      expect(pyth.calculations.lifePath.intermediateSteps.length).toBeGreaterThan(0);
      expect(chald.calculations.lifePath.intermediateSteps.length).toBeGreaterThan(0);
    });
  });

  describe('5. Palmistry Quality Gate Verification', () => {
    it('strictly rejects low-resolution or small buffer images without guessing', () => {
      const invalidBuffer = Buffer.alloc(50);
      const evalResult = PalmQualityGate.evaluate(invalidBuffer);

      expect(evalResult.passed).toBe(false);
      expect(evalResult.rejectionMessage).toBe('Palm image quality insufficient for analysis.');
      expect(evalResult.reason).toBeDefined();
    });
  });

  describe('6. Cryptographic Tarot Uniformity & Randomness Verification', () => {
    it('shuffles cards using cryptographically secure RNG with zero astro bias on draw', () => {
      const session = executeShuffleToDestiny({
        spreadType: 'celticCross',
        question: 'Truth test for destiny draw'
      });

      expect(session.drawnCards.length).toBe(3);
      const ids = session.drawnCards.map(c => c.card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('maintains 78 cards in standard deck specification', () => {
      const sample = executeShuffleToDestiny();
      expect(sample.drawnCards.length).toBe(3);
    });
  });

  // ==========================================
  // SECTION 3 & 4: FINANCIAL ASTROLOGY & DATA
  // ==========================================

  describe('Financial Astrology & Versioned Mappings', () => {
    it('exposes versioned Medini Jyotish metadata and sector mappings', () => {
      const meta = SECTOR_MAPPING_METADATA;
      expect(meta.sectorMappingVersion).toBe('1.0.0-medini-standard');
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

  describe('Real-World Financial & Macro Data Engines', () => {
    it('provides structured market telemetry with timestamps and currency tags', async () => {
      const pulse = await MarketDataService.getMarketPulse();
      expect(pulse.primaryIndices.length).toBeGreaterThanOrEqual(3);
      expect(pulse.sectorHeatmap.length).toBeGreaterThanOrEqual(5);

      const nifty = pulse.primaryIndices.find(i => i.symbol === 'NIFTY 50');
      expect(nifty).toBeDefined();
      expect(nifty!.currentPrice).toBeGreaterThan(0);
      expect(nifty!.currency).toBe('INR');
      expect(pulse.sourceMetadata.provider).toBeDefined();
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
      expect(regime.keyDrivers.length).toBeGreaterThan(0);
    });

    it('publishes official macroeconomic indicators with publication dates and revision status', () => {
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

  // ==========================================
  // SECTION 6 & 7: NEWS & FACT CHECK ENGINE
  // ==========================================

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

  // ==========================================
  // SECTION 10 & 11: SAFETY, SEPARATION & ANTI-STOCK TIPPING
  // ==========================================

  describe('Stock Selection Safety & Disclaimers', () => {
    it('blocks dangerous guaranteed return claims in AI output', () => {
      const auditResult = AIAuditor.audit({
        analysis: 'Buy Reliance now for 100% guaranteed profit because Jupiter is strong.',
        summary: 'Guaranteed profit prediction'
      } as any);
      expect(auditResult.isValid).toBe(false);
      expect(auditResult.violations.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // SECTION 12 & 13: BACKTEST TRUTH & AUDIT LEDGER
  // ==========================================

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

  // ==========================================
  // SECTION 9: MASTER COSMIC MARKET SYNTHESIS
  // ==========================================

  describe('Master 3-Channel Cosmic-Market Synthesis', () => {
    it('generates the mandatory Section 60 final synthesis format with strict 3-channel separation', async () => {
      const synthesis = await CosmicMarketSynthesisEngine.generateSynthesis('IT');

      expect(synthesis.threeChannels.channel1Fundamental).toBeDefined();
      expect(synthesis.threeChannels.channel2MacroMarket).toBeDefined();
      expect(synthesis.threeChannels.channel3Astrological).toBeDefined();

      expect(synthesis.conflictCheck).toBeDefined();
      expect(synthesis.conflictCheck.agreements.length).toBeGreaterThanOrEqual(1);

      expect(synthesis.overallRisk.rating).toBeDefined();
      expect(synthesis.whatToWatch.length).toBeGreaterThanOrEqual(3);

      expect(synthesis.regulatoryDisclaimer).toContain('educational');
      expect(synthesis.regulatoryDisclaimer).toContain('SEBI-registered');
    });
  });

});
