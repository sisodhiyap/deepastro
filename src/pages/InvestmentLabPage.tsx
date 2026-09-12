import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Globe, ShieldAlert,
  FileText, CheckCircle2, AlertTriangle, RefreshCw, BarChart2, Cpu,
  Search, ExternalLink, Scale, Clock, Lock
} from 'lucide-react';
import { getBirthProfile, getCalculatedChart } from '../utils/birthStorage.js';

export const InvestmentLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'market' | 'sectors' | 'macro' | 'geopolitical' | 'news' | 'synthesis' | 'personal' | 'backtest' | 'audit'
  >('market');

  const [marketPulse, setMarketPulse] = useState<any>(null);
  const [marketRegime, setMarketRegime] = useState<any>(null);
  const [macroData, setMacroData] = useState<any>(null);
  const [geoRisk, setGeoRisk] = useState<any>(null);
  const [newsEvents, setNewsEvents] = useState<any[]>([]);
  const [synthesisReport, setSynthesisReport] = useState<any>(null);
  const [personalProfile, setPersonalProfile] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Backtest strategy select
  const [selectedStrategy, setSelectedStrategy] = useState<'MERCURY_RETROGRADE_MEAN_REVERSION' | 'JUPITER_INGRESS_MOMENTUM' | 'ECLIPSE_VOLATILITY_BREAKOUT'>('JUPITER_INGRESS_MOMENTUM');
  const [selectedBenchmark, setSelectedBenchmark] = useState<'NIFTY 50' | 'BANK NIFTY'>('NIFTY 50');

  // Fact check query
  const [factCheckQuery, setFactCheckQuery] = useState('');
  const [factCheckResult, setFactCheckResult] = useState<any>(null);

  const birthChart = getCalculatedChart();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Market Pulse
      const pRes = await fetch('/api/finance/market-pulse');
      const pData = await pRes.json();
      if (pData.pulse) setMarketPulse(pData.pulse);

      // 2. Market Regime
      const rRes = await fetch('/api/finance/market-regime');
      const rData = await rRes.json();
      if (rData.regime) setMarketRegime(rData.regime);

      // 3. Macro
      const mRes = await fetch('/api/finance/macro-dashboard');
      const mData = await mRes.json();
      if (mData.macro) setMacroData(mData.macro);

      // 4. Geopolitical Risk
      const gRes = await fetch('/api/finance/geopolitical-risk');
      const gData = await gRes.json();
      if (gData.geo) setGeoRisk(gData.geo);

      // 5. News
      const nRes = await fetch('/api/finance/news-intelligence');
      const nData = await nRes.json();
      if (nData.news) setNewsEvents(nData.news);

      // 6. Synthesis
      const sRes = await fetch('/api/finance/cosmic-market-synthesis');
      const sData = await sRes.json();
      if (sData.synthesis) setSynthesisReport(sData.synthesis);

      // 7. Prediction Audit
      const aRes = await fetch('/api/finance/prediction-audit');
      const aData = await aRes.json();
      if (aData.audit) setAuditData(aData.audit);

      // 8. Personal Profile (if chart exists)
      if (birthChart) {
        const persRes = await fetch('/api/finance/personal-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart: birthChart.chart || birthChart })
        });
        const persData = await persRes.json();
        if (persData.profile) setPersonalProfile(persData.profile);
      }
    } catch (err) {
      console.error('Failed to load investment lab data:', err);
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
      const data = await res.json();
      if (data.result) setBacktestResult(data.result);
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
      const data = await res.json();
      if (data.record) setFactCheckResult(data.record);
    } catch (err) {
      console.error('Fact check failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 p-4 md:p-8 space-y-6">
      {/* SEBI Compliance Banner */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-200">
            Mandatory Regulatory & Scientific Disclaimer
          </span>
          <p className="text-amber-300/80 leading-relaxed">
            DeepAstro is an educational intelligence and research platform. DeepAstro is NOT a SEBI-registered investment adviser or research analyst.
            Astrological indicators are traditional and experimental; they are NOT scientifically proven methods of predicting stock prices.
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
            <span className="text-xs text-slate-400">Institutional Telemetry • Real Market Data • Walk-Forward Backtesting</span>
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
          Refresh Telemetry
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

      {/* Tab 1: Market Pulse */}
      {activeTab === 'market' && marketPulse && (
        <div className="space-y-6">
          {/* Regime Banner */}
          {marketRegime && (
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Quantitative Active Regime:</span>
                  <span className="px-3 py-1 rounded text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                    {marketRegime.regime}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Confidence: {(marketRegime.confidenceScore * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  {marketRegime.tacticalImplications}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">A/D Ratio</span>
                  <span className="text-emerald-400 font-bold text-sm">{marketPulse.marketBreadth.advanceDeclineRatio.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">India VIX</span>
                  <span className="text-cyan-400 font-bold text-sm">{marketPulse.volatilityIndex.currentPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Indices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketPulse.primaryIndices.map((idx: any) => (
              <div key={idx.symbol} className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white tracking-wide">{idx.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{idx.exchange}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  ₹{idx.currentPrice.toLocaleString()}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...marketPulse.globalBenchmarks, ...marketPulse.commoditiesAndCurrencies].map((item: any) => (
              <div key={item.symbol} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3 space-y-1">
                <span className="text-[11px] text-slate-400 block truncate">{item.name}</span>
                <div className="text-base font-bold font-mono text-white">
                  {item.currency.includes('USD') ? '$' : ''}{item.currentPrice.toLocaleString()} {item.currency.includes('Yield') || item.currency.includes('bbl') || item.currency.includes('oz') ? item.currency : ''}
                </div>
                <span className={`text-[11px] font-semibold ${item.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.percentChange >= 0 ? '+' : ''}{item.percentChange}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Sector Radar */}
      {activeTab === 'sectors' && marketPulse && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2A3441] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Sector Performance & Valuation Radar</h3>
              <span className="text-xs text-slate-400">Real Market Momentum vs Traditional Astrological Graha Associations</span>
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
                  {marketPulse.sectorHeatmap.map((sec: any) => (
                    <tr key={sec.niftySectorCode} className="hover:bg-[#1A1F2B]/40 transition">
                      <td className="p-3 font-sans font-semibold text-white">{sec.sectorName}</td>
                      <td className="p-3 text-cyan-400">{sec.niftySectorCode}</td>
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
                      <td className="p-3 font-sans text-slate-400">{sec.topPerformers?.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Macro Dashboard */}
      {activeTab === 'macro' && macroData && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">Macroeconomic Regime Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{macroData.macroRegimeSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {macroData.indicators.map((ind: any) => (
              <div key={ind.code} className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-white">{ind.name}</span>
                    <div className="text-[11px] text-slate-400">{ind.source}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400">
                    {ind.geography}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-bold font-mono text-cyan-300">{ind.currentValue} {ind.unit}</span>
                  <span className="text-xs text-slate-400 font-mono">Previous: {ind.previousValue} {ind.unit}</span>
                </div>
                <div className="text-xs text-slate-300 pt-1 border-t border-[#2A3441]/60">
                  {ind.statusSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Geopolitical Risk */}
      {activeTab === 'geopolitical' && geoRisk && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Composite Geopolitical Risk Score:</span>
                <span className="text-2xl font-bold font-mono text-rose-400">
                  {geoRisk.compositeRiskScore} / 100
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                  {geoRisk.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {geoRisk.macroEconomicImpactSummary}
              </p>
            </div>
            <div className="bg-[#1A1F2B] p-3 rounded-lg text-xs text-slate-400 max-w-sm">
              <span className="font-bold text-white block mb-1">Scientific Methodology:</span>
              {geoRisk.methodologyDescription}
            </div>
          </div>

          <div className="space-y-3">
            {geoRisk.hotspots.map((hs: any) => (
              <div key={hs.id} className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{hs.name} ({hs.region})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hs.threatLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    hs.threatLevel === 'ELEVATED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {hs.threatLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold block mb-1">Documented Factual Events:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {hs.documentedEvents.map((evt: string, i: number) => (
                      <li key={i}>{evt}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-[#2A3441]/50 flex justify-between">
                  <span>Affected Sectors: {hs.affectedSectors.join(', ')}</span>
                  <span>Sources: {hs.primarySources.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: News & Fact Check */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Fact Check Box */}
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              5-Tier Institutional Fact-Check Console
            </h3>
            <p className="text-xs text-slate-400">
              Corroborate market claims across Tier 1 (SEBI/RBI/Governments) to Tier 5 sources.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={factCheckQuery}
                onChange={(e) => setFactCheckQuery(e.target.value)}
                placeholder="Enter claim (e.g. 'RBI maintains repo rate at 6.50%')"
                className="flex-1 bg-[#1A1F2B] border border-[#2A3441] text-xs rounded-lg px-3 py-2 text-white"
              />
              <button
                onClick={handleRunFactCheck}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
              >
                Verify Claim
              </button>
            </div>

            {factCheckResult && (
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3.5 space-y-2 mt-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                    factCheckResult.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    factCheckResult.status === 'FALSE' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {factCheckResult.status}
                  </span>
                </div>
                <p className="text-slate-300">{factCheckResult.evidenceSummary}</p>
              </div>
            )}
          </div>

          {/* Verified News Pipeline */}
          <div className="space-y-3">
            {newsEvents.map((item) => (
              <div key={item.id} className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 mr-2">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Tier {item.sourceTier} Source: {item.source}</span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.headline}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    item.impactDirection === 'POSITIVE' ? 'bg-emerald-950 text-emerald-400' :
                    item.impactDirection === 'NEGATIVE' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.impactDirection} IMPACT
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-[#2A3441]/50 flex justify-between">
                  <span>Affected Assets: {item.affectedAssets.join(', ')}</span>
                  <span className="text-emerald-400 font-semibold">Corroborated: {item.factCheck?.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: 3-Channel Synthesis (Section 60 Format) */}
      {activeTab === 'synthesis' && synthesisReport && (
        <div className="space-y-6">
          {/* Section 24: Visual 3-Channel Signal Separation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] border-t-4 border-t-emerald-500 border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                Channel 1: Fundamental / Financial
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{synthesisReport.threeChannels.channel1Fundamental.signalStance}</span>
                <span className="text-xs text-slate-400">Strength: {synthesisReport.threeChannels.channel1Fundamental.evidenceStrength}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {synthesisReport.threeChannels.channel1Fundamental.coreRationale}
              </p>
            </div>

            <div className="bg-[#111827] border-t-4 border-t-cyan-500 border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                Channel 2: Macro / Market Regime
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{synthesisReport.threeChannels.channel2MacroMarket.signalStance}</span>
                <span className="text-xs text-slate-400">Strength: {synthesisReport.threeChannels.channel2MacroMarket.evidenceStrength}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {synthesisReport.threeChannels.channel2MacroMarket.coreRationale}
              </p>
            </div>

            <div className="bg-[#111827] border-t-4 border-t-amber-500 border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                Channel 3: Astrological (Experimental)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{synthesisReport.threeChannels.channel3Astrological.signalStance}</span>
                <span className="text-xs text-amber-400/80">Strength: {synthesisReport.threeChannels.channel3Astrological.evidenceStrength}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {synthesisReport.threeChannels.channel3Astrological.coreRationale}
              </p>
            </div>
          </div>

          {/* Conflict Check */}
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Signal Convergence & Conflict Check</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-3 space-y-1">
                <span className="font-bold text-emerald-400 block">Where Signals Agree:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {synthesisReport.conflictCheck.agreements.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-lg p-3 space-y-1">
                <span className="font-bold text-rose-400 block">Where Signals Disagree:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {synthesisReport.conflictCheck.disagreements.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* What to Watch */}
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">Measurable Catalysts to Watch</h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {synthesisReport.whatToWatch.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 7: Personal Cosmic Wealth */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          {personalProfile ? (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
                <span className="text-xs text-amber-400 font-mono font-bold uppercase">Personal Wealth Temperament</span>
                <h3 className="text-lg font-bold text-white">{personalProfile.wealthTemperament.archetype}</h3>
                <p className="text-xs text-slate-300">{personalProfile.wealthTemperament.traditionalDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personalProfile.keyWealthHouses.map((h: any) => (
                  <div key={h.houseNumber} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{h.houseName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.strengthAssessment === 'Favorable' ? 'bg-emerald-950 text-emerald-400' :
                        h.strengthAssessment === 'Demanding' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {h.strengthAssessment}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Sign: {h.signName} (Lord: {h.signLord})</div>
                    <div className="text-[11px] text-cyan-400">Occupants: {h.occupants?.length ? h.occupants.join(', ') : 'None'}</div>
                    <p className="text-[11px] text-slate-300">{h.traditionalTheme}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-8 text-center text-xs text-slate-400">
              Calculate or save your birth profile in Kundli to view personal wealth house analysis.
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Astro-Financial Backtest Lab */}
      {activeTab === 'backtest' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Astro-Financial Walk-Forward Backtest Simulator</h3>
            <p className="text-xs text-slate-400">
              Rigorous empirical testing comparing astrological cycle timing vs passive Buy & Hold and 12-month Momentum benchmarks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">Benchmark Index</label>
                <select
                  value={selectedBenchmark}
                  onChange={(e) => setSelectedBenchmark(e.target.value as any)}
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs rounded px-3 py-2 text-cyan-400 mt-1"
                >
                  <option value="NIFTY 50">NIFTY 50</option>
                  <option value="BANK NIFTY">BANK NIFTY</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Astrological Strategy</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value as any)}
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs rounded px-3 py-2 text-cyan-400 mt-1"
                >
                  <option value="JUPITER_INGRESS_MOMENTUM">Jupiter Ingress Momentum Cycle</option>
                  <option value="MERCURY_RETROGRADE_MEAN_REVERSION">Mercury Retrograde Mean Reversion</option>
                  <option value="ECLIPSE_VOLATILITY_BREAKOUT">Eclipse Window Volatility Breakout</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRunBacktest}
                  className="w-full px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
                >
                  Run 10-Year Backtest
                </button>
              </div>
            </div>
          </div>

          {backtestResult && (
            <div className="space-y-4">
              {/* Honest Scientific Finding Banner */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs space-y-1">
                <span className="font-bold text-cyan-400 block uppercase tracking-wider">
                  Empirical Research Finding:
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">{backtestResult.honestScientificFinding}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Astro Strategy CAGR</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{backtestResult.astroStrategyMetrics.cagrPercent}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Buy & Hold CAGR</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{backtestResult.buyAndHoldMetrics.cagrPercent}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">12M Momentum CAGR</span>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">{backtestResult.momentumBenchmarkMetrics.cagrPercent}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Alpha vs Buy & Hold</span>
                  <div className={`text-xl font-bold font-mono mt-1 ${backtestResult.alphaVsBenchmarkPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {backtestResult.alphaVsBenchmarkPercent >= 0 ? '+' : ''}{backtestResult.alphaVsBenchmarkPercent}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Prediction Audit */}
      {activeTab === 'audit' && auditData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400">Financial Models</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{auditData.categories.financial.accuracyPercent}%</div>
              <span className="text-[10px] text-slate-500">({auditData.categories.financial.verified}/{auditData.categories.financial.total})</span>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400">News Impact Models</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{auditData.categories.newsImpact.accuracyPercent}%</div>
              <span className="text-[10px] text-slate-500">({auditData.categories.newsImpact.verified}/{auditData.categories.newsImpact.total})</span>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400">AI Synthesis</span>
              <div className="text-xl font-bold text-purple-400 mt-1">{auditData.categories.aiSynthesis.accuracyPercent}%</div>
              <span className="text-[10px] text-slate-500">({auditData.categories.aiSynthesis.verified}/{auditData.categories.aiSynthesis.total})</span>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400">Astrological Timing</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{auditData.categories.astrological.accuracyPercent}%</div>
              <span className="text-[10px] text-slate-500">({auditData.categories.astrological.verified}/{auditData.categories.astrological.total})</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2A3441]">
              <h3 className="text-sm font-semibold text-white">Immutable Prediction Audit Ledger</h3>
            </div>
            <div className="divide-y divide-[#2A3441]/50">
              {auditData.recentAuditLedger.map((item: any) => (
                <div key={item.predictionId} className="p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{item.statement}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.evaluationStatus === 'VERIFIED_CORRECT' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {item.evaluationStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Target: {item.targetAssetOrSector} • Forecast Date: {item.forecastDate} • Method: {item.methodology}
                  </div>
                  <div className="text-slate-300 bg-[#1A1F2B] p-2 rounded">
                    Outcome: {item.actualOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentLabPage;
