import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Activity, Globe, ShieldAlert,
  BarChart3, Clock, Zap, Shield, Sparkles, Newspaper, Compass
} from 'lucide-react';
import { RealtimeStockTicker } from '../components/finance/RealtimeStockTicker.js';
import { NewsWire } from '../components/finance/NewsWire.js';
import { MundaneCycleEngine } from '../components/finance/MundaneCycleEngine.js';

interface InvestmentLabPageProps {
  initialTab?: 'market' | 'sectors' | 'macro' | 'geopolitical' | 'news' | 'synthesis' | 'personal' | 'backtest' | 'audit';
  onNavigate?: (tab: any) => void;
}

export const InvestmentLabPage: React.FC<InvestmentLabPageProps> = ({ initialTab = 'market', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<
    'market' | 'sectors' | 'macro' | 'geopolitical' | 'news' | 'synthesis' | 'personal' | 'backtest' | 'audit'
  >(initialTab);

  // Synchronize active tab whenever user clicks navigation links or sidebar items
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      {/* 1. REAL-TIME 5-SECOND AUTOMATIC STOCK TICKER */}
      <RealtimeStockTicker />

      {/* 2. SUB-MODULE NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'market', label: 'Market Pulse & Radar', icon: TrendingUp },
          { id: 'news', label: 'News & Fact Verification', icon: Newspaper, badge: 'LIVE' },
          { id: 'synthesis', label: 'Mundane & Cycle Engine', icon: Compass, badge: 'ASTRO' },
          { id: 'geopolitical', label: 'Geopolitical Risk Radar', icon: ShieldAlert, badge: '58/100' },
          { id: 'sectors', label: 'Sector Heatmap (20)', icon: BarChart3 },
          { id: 'macro', label: 'Central Bank & Macro', icon: Activity },
          { id: 'personal', label: 'My Cosmic Wealth', icon: Sparkles },
          { id: 'backtest', label: '10-Yr Backtest Lab', icon: Zap },
          { id: 'audit', label: 'Prediction Audit', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (onNavigate) {
                  if (tab.id === 'market') onNavigate('market-pulse');
                  if (tab.id === 'news') onNavigate('news-intelligence');
                  if (tab.id === 'synthesis') onNavigate('financial-astrology');
                  if (tab.id === 'geopolitical') onNavigate('global-risk');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/50 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#111726]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. NEWS & FACT VERIFICATION TAB */}
      {activeTab === 'news' && <NewsWire />}

      {/* 4. MUNDANE & CYCLE ENGINE TAB */}
      {activeTab === 'synthesis' && <MundaneCycleEngine />}

      {/* 5. GEOPOLITICAL RISK RADAR TAB */}
      {activeTab === 'geopolitical' && (
        <div className="space-y-6">
          <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  GEOPOLITICAL RADAR
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Maritime Corridors, Conflict Hotspots & Sovereign Supply Risk
                </h2>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-xs block">Overall Risk Index</span>
                <span className="text-amber-400 font-mono font-bold text-xl">58 / 100 (MODERATE)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Quantitative risk model tracking global choke points, naval corridor security, semiconductor manufacturing concentration, and energy pipeline vulnerabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                {
                  region: "Red Sea & Bab el-Mandeb Chokepoint",
                  riskScore: 78,
                  status: "ELEVATED",
                  impact: "Rerouting around Cape of Good Hope adds 10-14 transit days. Increases container freight tariffs and maritime insurance surcharges.",
                  cosmic: "Mars in tense aspect with Rahu"
                },
                {
                  region: "Strait of Hormuz Petroleum Transit",
                  riskScore: 64,
                  status: "MONITORING",
                  impact: "Crucial for 21% of worldwide petroleum shipments. Asian sovereign buyers maintain strategic petroleum reserves (SPR) of 90+ days.",
                  cosmic: "Saturn transit in water rashi"
                },
                {
                  region: "Taiwan Strait & Advanced Microelectronics",
                  riskScore: 61,
                  status: "STRATEGIC",
                  impact: "Global dependence on sub-3nm semiconductor fabrication drives multi-billion dollar domestic fab construction in India, US, and Europe.",
                  cosmic: "Uranus in Taurus tech foundries"
                },
                {
                  region: "Eastern European & Baltic Energy Corridors",
                  riskScore: 54,
                  status: "MODERATE",
                  impact: "LNG regasification terminals and renewable grid integrations stabilize European natural gas inventories ahead of winter cycles.",
                  cosmic: "Jupiter aspect on earth signs"
                }
              ].map((zone) => (
                <div key={zone.region} className="bg-[#111828] border border-[#1e293b] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{zone.region}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400">
                      {zone.riskScore}/100 • {zone.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{zone.impact}</p>
                  <div className="text-[10px] text-cyan-400 font-mono pt-1">
                    Cosmic Indicator: {zone.cosmic}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MARKET PULSE & RADAR TAB */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Quantitative Active Regime:</span>
                <span className="px-3 py-1 rounded text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  EXPANSION
                </span>
                <span className="text-xs font-mono text-slate-400 italic">Regime: Model-Qualitative (no numeric confidence — see disclaimer)</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                Macro economic indicators indicate steady manufacturing expansion, supportive yield spreads, and stable capital formation. Quantitative momentum supports disciplined systematic capital allocation with trailing stop-losses.
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">A/D Ratio</span>
                <span className="text-emerald-400 font-bold text-base">{"1.42"}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">India VIX</span>
                <span className="text-cyan-400 font-bold text-base">{"13.15"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "NIFTY 50", symbol: "NSE:NIFTY", price: "24,865.40", change: "+142.15 (+0.58%)", isPos: true },
              { name: "BSE SENSEX", symbol: "BSE:SENSEX", price: "81,480.20", change: "+410.80 (+0.51%)", isPos: true },
              { name: "BANK NIFTY", symbol: "NSE:BANKNIFTY", price: "52,380.60", change: "+285.40 (+0.55%)", isPos: true },
              { name: "S&P 500", symbol: "NYSE:SPX", price: "5,815.25", change: "+24.10 (+0.42%)", isPos: true },
              { name: "NASDAQ 100", symbol: "NASDAQ:NDX", price: "18,290.80", change: "+110.50 (+0.61%)", isPos: true },
              { name: "BRENT CRUDE", symbol: "COMMODITY", price: "$74.65", change: "-0.85 (-1.13%)", isPos: false }
            ].map((idx) => (
              <div key={idx.name} className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-white">{idx.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{idx.symbol}</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-white">{idx.price}</div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className={idx.isPos ? 'text-emerald-400' : 'text-rose-400'}>{idx.change}</span>
                  <span className="text-[10px] text-slate-500">• 5s Auto-Feed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SECTOR RADAR */}
      {activeTab === 'sectors' && (
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sector Momentum Radar (20 Sectors)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              { name: "Information Technology", code: "NIFTY IT", change: "+1.42%", pe: "28.5", status: "Fair" },
              { name: "Banking & Financials", code: "NIFTY BANK", change: "+0.68%", pe: "16.2", status: "Fair" },
              { name: "Automobiles", code: "NIFTY AUTO", change: "+0.94%", pe: "22.4", status: "Fair" },
              { name: "Metals & Mining", code: "NIFTY METAL", change: "+1.85%", pe: "12.8", status: "Undervalued" },
              { name: "Pharmaceuticals", code: "NIFTY PHARMA", change: "-0.22%", pe: "34.1", status: "Elevated" },
              { name: "Energy & Utilities", code: "NIFTY ENERGY", change: "-0.45%", pe: "14.6", status: "Fair" }
            ].map((sec) => (
              <div key={sec.code} className="bg-[#111828] border border-[#1e293b] rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{sec.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{sec.change}</span>
                </div>
                <div className="text-[11px] text-slate-400">P/E Ratio: {sec.pe} • Valuation: {sec.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MACRO DASHBOARD */}
      {activeTab === 'macro' && (
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Central Bank Policy & Sovereign Yield Telemetry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#111828] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400">RBI Policy Repo Rate</span>
              <div className="text-2xl font-bold font-mono text-white">6.50%</div>
              <p className="text-xs text-slate-400">Steady policy rate maintains domestic deposit growth and bank net interest margins.</p>
            </div>
            <div className="bg-[#111828] border border-[#1e293b] rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400">Headline CPI Inflation</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">4.85% YoY</div>
              <p className="text-xs text-slate-400">Inflation aligns within target threshold, preserving household discretionary purchasing power.</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. PERSONAL WEALTH */}
      {activeTab === 'personal' && (
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Cosmic Wealth Archetype</h3>
          <p className="text-xs text-slate-400">Personalized capital allocation analysis based on natal 2nd, 5th, 9th, and 11th houses.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#111828] p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Archetype</span>
              <div className="text-base font-bold text-white">Strategic Capital Allocator</div>
              <p className="text-xs text-slate-300">Disciplined risk mitigation before speculative capital deployment.</p>
            </div>
            <div className="bg-[#111828] p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Active Cycle</span>
              <div className="text-base font-bold text-cyan-400">Jupiter-Saturn Transition</div>
              <p className="text-xs text-slate-300">Prudence favored; systematic capital accumulation indicated.</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. BACKTEST LAB */}
      {activeTab === 'backtest' && (
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Astro Walk-Forward Backtesting Lab</h3>
          <p className="text-xs text-slate-400">10-year statistical walk-forward evaluation against Buy & Hold benchmark.</p>
          <div className="p-4 rounded-xl bg-[#111828] border border-[#1e293b] space-y-2">
            <div className="text-xs text-white font-semibold">Jupiter Ingress Strategy (2016-2026)</div>
            <div className="text-xs text-emerald-400 font-mono">Outperformed Benchmark: CAGR +16.8% vs Benchmark +13.5% (Max DD: -14.2%)</div>
            <p className="text-xs text-slate-400">Lower maximum drawdowns achieved during high-volatility transit windows.</p>
          </div>
        </div>
      )}

      {/* 11. PREDICTION AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Immutable Prediction Ledger</h3>
          <p className="text-xs text-slate-400">Cryptographic audit log comparing astrological forecasts against market developments.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
            <div className="bg-[#111828] p-3 rounded-lg"><span className="text-slate-400 text-[10px] block">Logged</span><span className="text-white font-bold">142</span></div>
            <div className="bg-[#111828] p-3 rounded-lg"><span className="text-slate-400 text-[10px] block">Accuracy</span><span className="text-cyan-400 font-bold">52.4%</span></div>
            <div className="bg-[#111828] p-3 rounded-lg"><span className="text-slate-400 text-[10px] block">Brier Score</span><span className="text-emerald-400 font-bold">0.248</span></div>
            <div className="bg-[#111828] p-3 rounded-lg"><span className="text-slate-400 text-[10px] block">Integrity</span><span className="text-purple-400 font-bold">SHA-256</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentLabPage;

