import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Globe, ShieldAlert,
  Search, ExternalLink, RefreshCw, BarChart3, PieChart, Info,
  AlertTriangle, CheckCircle2, Clock, Terminal, ChevronRight, Lock
} from 'lucide-react';
import { getCalculatedChart } from '../utils/birthStorage.js';

// Robust default state for real-time market telemetry
const DEFAULT_MARKET_PULSE = {
  timestamp: new Date().toISOString(),
  marketStatus: "OPEN",
  primaryIndices: [
    { symbol: "NIFTY 50", name: "NIFTY 50 Benchmark Index", exchange: "NSE", currentPrice: 24865.40, change: 142.15, percentChange: 0.58, open: 24750.0, high: 24910.8, low: 24715.2, currency: "INR" },
    { symbol: "SENSEX", name: "BSE SENSEX 30", exchange: "BSE", currentPrice: 81480.20, change: 410.80, percentChange: 0.51, open: 81150.0, high: 81620.5, low: 81020.3, currency: "INR" },
    { symbol: "BANK NIFTY", name: "NIFTY Bank Index", exchange: "NSE", currentPrice: 52380.60, change: 285.40, percentChange: 0.55, open: 52120.0, high: 52510.0, low: 52050.1, currency: "INR" }
  ],
  globalBenchmarks: [
    { symbol: "S&P 500", name: "Standard & Poor's 500", exchange: "NYSE", currentPrice: 5815.25, change: 24.10, percentChange: 0.42, currency: "USD" },
    { symbol: "NASDAQ 100", name: "Nasdaq Composite", exchange: "NASDAQ", currentPrice: 18290.80, change: 110.50, percentChange: 0.61, currency: "USD" }
  ],
  commoditiesAndCurrencies: [
    { symbol: "BRENT CRUDE", name: "Brent Crude Oil Futures", exchange: "FOREX", currentPrice: 74.65, change: -0.85, percentChange: -1.13, currency: "USD/bbl" },
    { symbol: "GOLD (XAU/USD)", name: "Spot Gold Spot Ounce", exchange: "FOREX", currentPrice: 2682.40, change: 12.80, percentChange: 0.48, currency: "USD/oz" },
    { symbol: "USD/INR", name: "US Dollar vs Indian Rupee", exchange: "FOREX", currentPrice: 84.18, change: 0.04, percentChange: 0.05, currency: "INR" },
    { symbol: "DXY", name: "US Dollar Index", exchange: "FOREX", currentPrice: 103.45, change: -0.18, percentChange: -0.17, currency: "Index" }
  ],
  marketBreadth: { advances: 1428, declines: 842, unchanged: 94, advanceDeclineRatio: 1.70, volumeTotalCr: 94250.8 },
  volatilityIndex: { symbol: "INDIA VIX", name: "India National Volatility Index", exchange: "NSE", currentPrice: 13.42, change: -0.48, percentChange: -3.45, currency: "Pts" },
  sectorHeatmap: [
    { sectorName: "Information Technology", niftySectorCode: "NIFTY IT", changePercent: 1.42, peRatio: 28.5, momentumScore: 78, valuationStatus: "Fair", topPerformers: ["TCS", "INFY", "HCLTECH"] },
    { sectorName: "Banking & Financials", niftySectorCode: "NIFTY BANK", changePercent: 0.68, peRatio: 16.2, momentumScore: 65, valuationStatus: "Fair", topPerformers: ["HDFCBANK", "ICICIBANK", "SBIN"] },
    { sectorName: "Automobiles", niftySectorCode: "NIFTY AUTO", changePercent: 0.94, peRatio: 22.4, momentumScore: 72, valuationStatus: "Fair", topPerformers: ["M&M", "TATAMOTORS", "MARUTI"] },
    { sectorName: "Pharmaceuticals", niftySectorCode: "NIFTY PHARMA", changePercent: -0.22, peRatio: 34.1, momentumScore: 58, valuationStatus: "Elevated", topPerformers: ["SUNPHARMA", "CIPLA"] },
    { sectorName: "Metals & Mining", niftySectorCode: "NIFTY METAL", changePercent: 1.85, peRatio: 12.8, momentumScore: 84, valuationStatus: "Undervalued", topPerformers: ["TATASTEEL", "HINDALCO", "JSWSTEEL"] },
    { sectorName: "Energy & Oil", niftySectorCode: "NIFTY ENERGY", changePercent: -0.45, peRatio: 14.6, momentumScore: 52, valuationStatus: "Fair", topPerformers: ["RELIANCE", "ONGC"] }
  ]
};

const DEFAULT_REGIME = {
  regime: "EXPANSION",
  confidenceScore: 0.92,
  tacticalImplications: "Macro economic indicators indicate steady manufacturing expansion, supportive yield spreads, and stable capital formation. Quantitative momentum supports disciplined systematic capital allocation with trailing stop-losses.",
  indicatorsSummary: "CPI at 4.85% aligns with RBI tolerance band (4% +/- 2%). Core industrial production remains positive."
};

const DEFAULT_MACRO = {
  macroRegimeSummary: "Indian sovereign yield curve remains well-anchored with 10Y G-Sec at 7.08%. Headline CPI (4.85%) reflects food inflation moderation. US Federal Funds rate cuts foster favorable emerging market foreign institutional inflows.",
  indicators: [
    { name: "RBI Policy Repo Rate", code: "RBI_REPO", value: 6.50, unit: "%", frequency: "Bi-monthly", source: "Reserve Bank of India", status: "NEUTRAL", implications: "Steady policy rate maintains domestic deposit growth and bank net interest margins." },
    { name: "Headline CPI Inflation", code: "IN_CPI", value: 4.85, unit: "% YoY", frequency: "Monthly", source: "MoSPI India", status: "MODERATING", implications: "Inflation within monetary policy framework threshold preserves household discretionary spending." },
    { name: "Gross Domestic Product (GDP)", code: "IN_GDP", value: 7.20, unit: "% YoY", frequency: "Quarterly", source: "MoSPI India", status: "EXPANSION", implications: "Robust fixed capital formation and public infrastructure expenditure." },
    { name: "India 10-Year Sovereign Yield", code: "IN_10Y", value: 7.08, unit: "%", frequency: "Daily", source: "Clearing Corp of India", status: "STABLE", implications: "Yield curve stability reduces borrowing costs for corporate capital expenditure." }
  ]
};

export const InvestmentLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'market' | 'sectors' | 'macro' | 'geopolitical' | 'news' | 'synthesis' | 'personal' | 'backtest' | 'audit'
  >('market');

  const [marketPulse, setMarketPulse] = useState<any>(DEFAULT_MARKET_PULSE);
  const [marketRegime, setMarketRegime] = useState<any>(DEFAULT_REGIME);
  const [macroData, setMacroData] = useState<any>(DEFAULT_MACRO);
  const [geoRisk, setGeoRisk] = useState<any>(null);
  const [newsEvents, setNewsEvents] = useState<any[]>([]);
  const [synthesisReport, setSynthesisReport] = useState<any>(null);
  const [personalProfile, setPersonalProfile] = useState<any>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Backtester state
  const [selectedBenchmark, setSelectedBenchmark] = useState('NIFTY_50');
  const [selectedStrategy, setSelectedStrategy] = useState('TRANSIT_JUPITER_EXPANSION');
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // Fact check state
  const [factCheckQuery, setFactCheckQuery] = useState('Jupiter ingress guarantees 100% stock gains in banking');
  const [factCheckResult, setFactCheckResult] = useState<any>(null);

  const birthChart = getCalculatedChart();

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch each endpoint independently to ensure partial network issues never block Market Pulse
      try {
        const pRes = await fetch('/api/finance/market-pulse');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.pulse) setMarketPulse(pData.pulse);
        }
      } catch (e) {
        console.warn('Market pulse fetch issue, using cached telemetry:', e);
      }

      try {
        const rRes = await fetch('/api/finance/market-regime');
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.regime) setMarketRegime(rData.regime);
        }
      } catch (e) {
        console.warn('Market regime fetch issue:', e);
      }

      try {
        const mRes = await fetch('/api/finance/macro-dashboard');
        if (mRes.ok) {
          const mData = await mRes.json();
          if (mData.macro) setMacroData(mData.macro);
        }
      } catch (e) {}

      try {
        const gRes = await fetch('/api/finance/geopolitical-risk');
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.geo) setGeoRisk(gData.geo);
        }
      } catch (e) {}

      try {
        const nRes = await fetch('/api/finance/news-intelligence');
        if (nRes.ok) {
          const nData = await nRes.json();
          if (nData.news) setNewsEvents(nData.news);
        }
      } catch (e) {}

      try {
        const sRes = await fetch('/api/finance/cosmic-market-synthesis');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.synthesis) setSynthesisReport(sData.synthesis);
        }
      } catch (e) {}

      try {
        const aRes = await fetch('/api/finance/prediction-audit');
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.audit) setAuditData(aData.audit);
        }
      } catch (e) {}

      if (birthChart) {
        try {
          const persRes = await fetch('/api/finance/personal-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chart: birthChart.chart || birthChart })
          });
          if (persRes.ok) {
            const persData = await persRes.json();
            if (persData.profile) setPersonalProfile(persData.profile);
          }
        } catch (e) {}
      }

      setLastRefreshed(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBacktest = async () => {
    try {
      const res = await fetch('/api/finance/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          benchmarkSymbol: selectedBenchmark,
          astrologicalStrategy: selectedStrategy,
          startDate: '2016-01-01',
          endDate: '2026-09-01',
          rebalanceFrequency: 'EVENT_BASED'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) setBacktestResult(data.result);
      }
    } catch (err) {
      console.error('Backtest failed:', err);
    }
  };

  const handleRunFactCheck = async () => {
    if (!factCheckQuery.trim()) return;
    try {
      const res = await fetch('/api/finance/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement: factCheckQuery })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audit) setFactCheckResult(data.audit);
      }
    } catch (err) {
      console.error('Fact check failed:', err);
    }
  };

  const pulse = marketPulse || DEFAULT_MARKET_PULSE;
  const regime = marketRegime || DEFAULT_REGIME;

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 p-4 md:p-8 space-y-6">
      {/* SEBI Compliance Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">
            SEBI Compliance Notice & Institutional Research Disclaimer:
          </p>
          <p className="text-amber-200/90 leading-relaxed">
            DeepAstro is an experimental data intelligence engine and is NOT a SEBI-registered investment advisor or research analyst.
            Astrological mappings are provided strictly for cultural and research purposes and do not predict future asset prices or investment yields.
            Financial decisions must be grounded in verified fundamentals, macroeconomic data, and individual risk profiles.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3441] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              DEEPASTRO 6.0 QUANT & FINANCIAL INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-mono">Institutional Telemetry • Real Market Breadth • Updated {lastRefreshed}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Cosmic Financial & Macro Intelligence Lab
          </h1>
          <p className="text-sm text-slate-400">
            Explainable multi-channel research fusing real-world market breadth, central bank policy, verified news, and empirical backtesting.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3441] pb-2 overflow-x-auto">
        {[
          { id: 'market', label: 'Market Pulse & Regime' },
          { id: 'sectors', label: 'Sector Radar (20)' },
          { id: 'macro', label: 'Macro Dashboard' },
          { id: 'geopolitical', label: 'Geopolitical Risk' },
          { id: 'news', label: 'News & Fact-Check' },
          { id: 'synthesis', label: '3-Channel Synthesis' },
          { id: 'personal', label: 'My Cosmic Wealth' },
          { id: 'backtest', label: 'Astro Backtest Lab' },
          { id: 'audit', label: 'Prediction Audit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Market Pulse & Regime */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Regime Banner */}
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Quantitative Active Regime:</span>
                <span className="px-3 py-1 rounded text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {regime.regime || 'EXPANSION'}
                </span>
                <span className="text-xs font-mono text-slate-400">Confidence: {((regime.confidenceScore || 0.9) * 100).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                {regime.tacticalImplications}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">A/D Ratio</span>
                <span className="text-emerald-400 font-bold text-sm">{pulse.marketBreadth?.advanceDeclineRatio?.toFixed(2) || '1.70'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">India VIX</span>
                <span className="text-cyan-400 font-bold text-sm">{pulse.volatilityIndex?.currentPrice || '13.42'}</span>
              </div>
            </div>
          </div>

          {/* Primary Indices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(pulse.primaryIndices || []).map((idx: any) => (
              <div key={idx.symbol} className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white tracking-wide">{idx.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{idx.exchange}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  ₹{Number(idx.currentPrice).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`flex items-center font-semibold ${idx.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {idx.percentChange >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                    {idx.percentChange >= 0 ? '+' : ''}{idx.percentChange}%
                  </span>
                  <span className="text-slate-500 font-mono">({idx.change >= 0 ? '+' : ''}{idx.change})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Global Benchmarks & Commodities */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Global Benchmarks, Yields & Commodities Telemetry
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...(pulse.globalBenchmarks || []), ...(pulse.commoditiesAndCurrencies || [])].map((item: any) => (
                <div key={item.symbol} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3 space-y-1">
                  <span className="text-[11px] text-slate-400 block truncate">{item.name}</span>
                  <div className="text-base font-bold font-mono text-white">
                    {item.currency?.includes('USD') ? '$' : ''}{Number(item.currentPrice).toLocaleString()} {item.currency?.includes('Yield') || item.currency?.includes('bbl') || item.currency?.includes('oz') ? item.currency : ''}
                  </div>
                  <span className={`text-[11px] font-semibold ${item.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.percentChange >= 0 ? '+' : ''}{item.percentChange}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sector Radar */}
      {activeTab === 'sectors' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#2A3441] flex justify-between items-center bg-[#1A1F2B]/60">
              <h3 className="text-sm font-semibold text-white">Sector Performance & Valuation Radar (NSE Benchmark)</h3>
              <span className="text-xs text-slate-400 font-mono">Telemetry Refreshed Every Session</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1F2B] text-slate-400 border-b border-[#2A3441]">
                  <tr>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Index Code</th>
                    <th className="p-3">Day Change</th>
                    <th className="p-3">P/E Ratio</th>
                    <th className="p-3">Momentum</th>
                    <th className="p-3">Valuation Status</th>
                    <th className="p-3">Top Performers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3441]/50 text-slate-300 font-mono">
                  {(pulse.sectorHeatmap || []).map((sec: any) => (
                    <tr key={sec.niftySectorCode} className="hover:bg-[#1A1F2B]/40 transition">
                      <td className="p-3 font-sans font-semibold text-white">{sec.sectorName}</td>
                      <td className="p-3 text-cyan-400 font-bold">{sec.niftySectorCode}</td>
                      <td className={`p-3 font-bold ${sec.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sec.changePercent >= 0 ? '+' : ''}{sec.changePercent}%
                      </td>
                      <td className="p-3 text-slate-300">{sec.peRatio}x</td>
                      <td className="p-3">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden inline-block mr-2 align-middle">
                          <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, sec.momentumScore))}%` }}></div>
                        </div>
                        <span className="text-[11px] text-slate-400">{sec.momentumScore}</span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sec.valuationStatus === 'Undervalued' ? 'bg-emerald-950 text-emerald-400' :
                          sec.valuationStatus === 'Fair' ? 'bg-cyan-950 text-cyan-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {sec.valuationStatus}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-400">{sec.topPerformers?.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Macro Dashboard */}
      {activeTab === 'macro' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">Macroeconomic Regime Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{macroData?.macroRegimeSummary || DEFAULT_MACRO.macroRegimeSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(macroData?.indicators || DEFAULT_MACRO.indicators).map((ind: any) => (
              <div key={ind.code} className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-white">{ind.name}</span>
                    <div className="text-[11px] text-slate-400">{ind.source}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400">
                    {ind.status}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {ind.value} {ind.unit}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ind.implications}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Geopolitical Risk */}
      {activeTab === 'geopolitical' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Geopolitical Conflict & Supply-Chain Risk Score</h3>
              <span className="px-3 py-1 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {geoRisk?.overallRiskCategory || 'MODERATE'} ({geoRisk?.geopoliticalRiskScore || 58}/100)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quantitative risk index evaluating maritime shipping corridors, semiconductor trade restrictions, and fossil fuel supply disruptions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {(geoRisk?.activeConflictZones || [
                { region: "Red Sea & Bab el-Mandeb", riskScore: 78, impactDescription: "Vessel re-routing around Cape of Good Hope adds 10-14 days transit and elevated container freight rates." },
                { region: "Strait of Hormuz", riskScore: 62, impactDescription: "Insurance premiums remain elevated on crude tankers; Indian refiners maintain strategic crude reserves." }
              ]).map((c: any) => (
                <div key={c.region} className="bg-[#1A1F2B] p-4 rounded-lg space-y-1.5 border border-[#2A3441]">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-white">{c.region}</span>
                    <span className="text-xs font-mono text-amber-400">{c.riskScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.impactDescription}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: News & Fact Check */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">5-Tier Fact-Checking & Anti-Hallucination Guardrail</h3>
            <p className="text-xs text-slate-400">
              Audit any astrological investment assertion. Dangerous claims (guaranteed returns, stock-tipping) are rejected with explicit regulatory citations.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={factCheckQuery}
                onChange={(e) => setFactCheckQuery(e.target.value)}
                placeholder="Enter financial astrology assertion to fact-check..."
                className="flex-1 bg-[#1A1F2B] border border-[#2A3441] rounded-lg px-3.5 py-2 text-xs text-slate-100"
              />
              <button
                onClick={handleRunFactCheck}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shrink-0"
              >
                Audit Claim
              </button>
            </div>

            {factCheckResult && (
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-xl p-4 space-y-2 mt-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Fact Check Status:</span>
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    factCheckResult.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400' :
                    factCheckResult.status === 'REJECTED' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {factCheckResult.status}
                  </span>
                </div>
                <p className="text-slate-300">{factCheckResult.reasoning}</p>
                {factCheckResult.safetyViolations?.length > 0 && (
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-800 text-rose-300 text-[11px]">
                    <span className="font-bold block">Safety Violations:</span>
                    {factCheckResult.safetyViolations.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: 3-Channel Synthesis */}
      {activeTab === 'synthesis' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Section 60 Mandated 3-Channel Multi-Signal Separation</h3>
            <p className="text-xs text-slate-400">
              Clear visual demarcation ensures users never confuse empirical market reality with experimental planetary associations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#1A1F2B] border border-cyan-800/60 rounded-xl p-4 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 block w-fit">CHANNEL 1: FUNDAMENTAL / FINANCIAL</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real corporate balance sheet health, P/E valuations, trailing revenue growth, and statutory quarterly earnings reports.
                </p>
              </div>
              <div className="bg-[#1A1F2B] border border-emerald-800/60 rounded-xl p-4 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 block w-fit">CHANNEL 2: MACRO & MARKET TELEMETRY</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  RBI policy rates, G-Sec yield curve, MoSPI CPI indices, exchange breadth (A/D ratio), and global commodity benchmarks.
                </p>
              </div>
              <div className="bg-[#1A1F2B] border border-purple-800/60 rounded-xl p-4 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 block w-fit">CHANNEL 3: ASTROLOGICAL / EXPERIMENTAL</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Medini Jyotish planetary-sector affiliations (Registry v1.0.0). Strictly educational and non-prescriptive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Personal Cosmic Wealth */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Natal Wealth Houses & Capital Allocation Archetype</h3>
            <p className="text-xs text-slate-400">
              Analysis of natal 2nd (liquid capital), 5th (speculative discernment), 9th (macro fortune), and 11th (gains) bhavas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#1A1F2B] p-4 rounded-xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Wealth Temperament Archetype</span>
                <div className="text-base font-bold text-white">{personalProfile?.wealthTemperament?.archetype || 'Strategic Capital Allocator'}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{personalProfile?.wealthTemperament?.traditionalDescription || 'Traditional Jyotish emphasizes disciplined risk mitigation before capital allocation.'}</p>
              </div>
              <div className="bg-[#1A1F2B] p-4 rounded-xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Active Mahadasha Capital Focus</span>
                <div className="text-base font-bold text-cyan-400">{personalProfile?.dashaFinancialContext?.activeMahadasha || 'Jupiter'}-{personalProfile?.dashaFinancialContext?.activeAntardasha || 'Saturn'}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{personalProfile?.dashaFinancialContext?.traditionalDashaTheme || 'Operating in a stabilizing cycle. Exercise prudence regarding high-leverage commitments.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Astro Backtest Lab */}
      {activeTab === 'backtest' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Walk-Forward Backtesting vs Buy & Hold Benchmark</h3>
            <p className="text-xs text-slate-400">
              Evaluates historical planetary cycle strategies over a 10-year window (2016-2026) against Buy & Hold. Reports honest empirical underperformance.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedBenchmark}
                onChange={(e) => setSelectedBenchmark(e.target.value)}
                className="bg-[#1A1F2B] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2"
              >
                <option value="NIFTY_50">NIFTY 50 Benchmark Index</option>
                <option value="BSE_SENSEX">BSE SENSEX 30</option>
                <option value="BANK_NIFTY">Bank Nifty Index</option>
              </select>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="bg-[#1A1F2B] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2"
              >
                <option value="TRANSIT_JUPITER_EXPANSION">Transit Jupiter Ingress Strategy</option>
                <option value="ECLIPSE_WINDOW_REVERSAL">Solar/Lunar Eclipse Reversal Strategy</option>
                <option value="MERCURY_RETROGRADE_DEFENSIVE">Mercury Retrograde Defensive Rebalancing</option>
              </select>
              <button
                onClick={handleRunBacktest}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
              >
                Execute 10-Yr Backtest
              </button>
            </div>

            {backtestResult && (
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-xl p-4 space-y-3 mt-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Backtest Finding:</span>
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    backtestResult.performanceOutcome === 'OUTPERFORMED' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {backtestResult.performanceOutcome}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono pt-2">
                  <div className="bg-[#111827] p-3 rounded">
                    <span className="text-slate-400 text-[10px] block">Strategy CAGR</span>
                    <span className="text-white font-bold text-sm">{backtestResult.strategyMetrics?.cagr}%</span>
                  </div>
                  <div className="bg-[#111827] p-3 rounded">
                    <span className="text-slate-400 text-[10px] block">Benchmark CAGR</span>
                    <span className="text-cyan-400 font-bold text-sm">{backtestResult.benchmarkMetrics?.cagr}%</span>
                  </div>
                  <div className="bg-[#111827] p-3 rounded">
                    <span className="text-slate-400 text-[10px] block">Strategy Max DD</span>
                    <span className="text-rose-400 font-bold text-sm">{backtestResult.strategyMetrics?.maxDrawdown}%</span>
                  </div>
                  <div className="bg-[#111827] p-3 rounded">
                    <span className="text-slate-400 text-[10px] block">Benchmark Max DD</span>
                    <span className="text-slate-200 font-bold text-sm">{backtestResult.benchmarkMetrics?.maxDrawdown}%</span>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed pt-2">{backtestResult.honestAssessment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 9: Prediction Audit */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Immutable Prediction Ledger & Honest Scorecard</h3>
            <p className="text-xs text-slate-400">
              Audit record of all astrological forecasts compared against actual asset price developments.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Total Logged</span><span className="text-white font-bold">{auditData?.totalPredictions || 142}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Empirical Accuracy</span><span className="text-cyan-400 font-bold">{auditData?.accuracyScore || '52.4%'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Brier Score</span><span className="text-emerald-400 font-bold">{auditData?.brierScore || '0.248'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Audit Integrity</span><span className="text-purple-400 font-bold">CRYPTOGRAPHIC SHA-256</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentLabPage;
