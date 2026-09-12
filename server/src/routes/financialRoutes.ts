/**
 * Financial & Market Intelligence Routes
 * API endpoints for DeepAstro 6.0 Cosmic Market Intelligence:
 * - Market Pulse & Live Benchmarks
 * - Quantitative Market Regime
 * - Macroeconomic Indicators Dashboard
 * - Geopolitical Risk Scoring
 * - News Intelligence & Claim Fact-Checking
 * - Mundane Inception Benchmarks
 * - Planetary Cycles & Sector Mappings
 * - Personal Cosmic Wealth Profile
 * - Quantitative Backtesting Lab
 * - Prediction Audit Dashboard
 * - Master Cosmic Market Synthesis (Section 60)
 */

import { Router, Request, Response } from 'express';
import { MarketDataService } from '../engines/market/marketDataService.js';
import { MarketRegimeEngine } from '../engines/market/marketRegimeEngine.js';
import { MacroEconomicEngine } from '../engines/macro/macroEconomicEngine.js';
import { GeopoliticalRiskEngine } from '../engines/geopolitical/geopoliticalRiskEngine.js';
import { NewsIntelligenceEngine } from '../engines/news/newsIntelligenceEngine.js';
import { FactCheckEngine } from '../engines/news/factCheckEngine.js';
import { MundaneChartsEngine, MUNDANE_BENCHMARKS } from '../engines/financialAstrology/mundaneCharts.js';
import { PlanetaryCyclesEngine } from '../engines/financialAstrology/planetaryCycles.js';
import { SectorMappingRegistry } from '../engines/financialAstrology/sectorMappingRegistry.js';
import { PersonalFinancialAstroEngine } from '../engines/financialAstrology/personalFinancialAstro.js';
import { AstroFinancialBacktester, BacktestRequest } from '../engines/backtest/astroFinancialBacktester.js';
import { PredictionAuditLogger } from '../engines/backtest/predictionAuditLogger.js';
import { CosmicMarketSynthesisEngine } from '../engines/synthesis/cosmicMarketSynthesis.js';

const router = Router();

// GET /api/finance/market-pulse
router.get('/market-pulse', async (_req: Request, res: Response) => {
  try {
    const pulse = await MarketDataService.getMarketPulse();
    return res.json({ success: true, pulse });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch market pulse.', details: err.message });
  }
});

// GET /api/finance/market-regime
router.get('/market-regime', async (_req: Request, res: Response) => {
  try {
    const pulse = await MarketDataService.getMarketPulse();
    const regime = MarketRegimeEngine.evaluateRegime(pulse);
    return res.json({ success: true, regime });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate market regime.', details: err.message });
  }
});

// GET /api/finance/macro-dashboard
router.get('/macro-dashboard', (_req: Request, res: Response) => {
  try {
    const macro = MacroEconomicEngine.getMacroSnapshot();
    return res.json({ success: true, macro });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch macro snapshot.', details: err.message });
  }
});

// GET /api/finance/geopolitical-risk
router.get('/geopolitical-risk', (_req: Request, res: Response) => {
  try {
    const geo = GeopoliticalRiskEngine.evaluateRisk();
    return res.json({ success: true, geo });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate geopolitical risk.', details: err.message });
  }
});

// GET /api/finance/news-intelligence
router.get('/news-intelligence', (_req: Request, res: Response) => {
  try {
    const news = NewsIntelligenceEngine.getLatestNewsIntelligence();
    return res.json({ success: true, news });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch news intelligence.', details: err.message });
  }
});

// POST /api/finance/fact-check
router.post('/fact-check', (req: Request, res: Response) => {
  try {
    const { statement, category } = req.body;
    if (!statement) {
      return res.status(400).json({ error: 'Statement is required for fact-checking.' });
    }
    const record = FactCheckEngine.verifyClaim(statement, category || 'FACT');
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify claim.', details: err.message });
  }
});

// GET /api/finance/mundane-benchmarks
router.get('/mundane-benchmarks', (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    if (id && MUNDANE_BENCHMARKS[id]) {
      const benchmark = MundaneChartsEngine.getBenchmarkChart(id as any);
      return res.json({ success: true, benchmark });
    }
    const list = MundaneChartsEngine.listAllBenchmarks();
    return res.json({ success: true, benchmarks: list });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch mundane benchmarks.', details: err.message });
  }
});

// GET /api/finance/planetary-cycles
router.get('/planetary-cycles', (_req: Request, res: Response) => {
  try {
    const cycles = PlanetaryCyclesEngine.getCurrentCycles();
    return res.json({ success: true, cycles });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch planetary cycles.', details: err.message });
  }
});

// GET /api/finance/sector-mappings
router.get('/sector-mappings', (req: Request, res: Response) => {
  try {
    const sectorQuery = req.query.q as string;
    if (sectorQuery) {
      const results = SectorMappingRegistry.getPlanetsForSector(sectorQuery);
      return res.json({ success: true, results });
    }
    const all = SectorMappingRegistry.getAllSectorMappings();
    return res.json({ success: true, ...all });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch sector mappings.', details: err.message });
  }
});

// POST /api/finance/personal-profile
router.post('/personal-profile', (req: Request, res: Response) => {
  try {
    const { chart } = req.body;
    if (!chart) {
      return res.status(400).json({ error: 'Natal chart data is required.' });
    }
    const profile = PersonalFinancialAstroEngine.analyzeChart(chart);
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to analyze personal cosmic wealth profile.', details: err.message });
  }
});

// POST /api/finance/backtest
router.post('/backtest', (req: Request, res: Response) => {
  try {
    const body: BacktestRequest = req.body;
    const result = AstroFinancialBacktester.runBacktest(body);
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to execute backtest.', details: err.message });
  }
});

// GET /api/finance/prediction-audit
router.get('/prediction-audit', (_req: Request, res: Response) => {
  try {
    const auditData = PredictionAuditLogger.getDashboardData();
    return res.json({ success: true, audit: auditData });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch prediction audit ledger.', details: err.message });
  }
});

// GET /api/finance/cosmic-market-synthesis
router.get('/cosmic-market-synthesis', async (req: Request, res: Response) => {
  try {
    const sectorQuery = req.query.sector as string;
    const synthesis = await CosmicMarketSynthesisEngine.generateSynthesis(sectorQuery);
    return res.json({ success: true, synthesis });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate cosmic market synthesis.', details: err.message });
  }
});

export default router;
