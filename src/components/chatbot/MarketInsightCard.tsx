import React from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Activity, Info, RefreshCw } from 'lucide-react';

export interface MarketInsightCardData {
  symbol: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  marketStatus: string;
  timestamp: string;
  dataAgeSeconds?: number;
  freshnessStatus: 'LIVE' | 'FRESH' | 'DELAYED' | 'CACHED' | 'STALE' | 'UNAVAILABLE';
  provenanceSource: string;
  whyItMatters: string;
  astrologicalContext: string;
  epistemicDisclaimer: string;
}

export interface MarketInsightCardProps {
  data: MarketInsightCardData;
  onRefresh?: () => void;
}

export const MarketInsightCard: React.FC<MarketInsightCardProps> = ({ data, onRefresh }) => {
  const isPositive = data.change >= 0;
  const isUnavailable = data.freshnessStatus === 'UNAVAILABLE';

  const getStatusBadge = () => {
    switch (data.freshnessStatus) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> LIVE
          </span>
        );
      case 'DELAYED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> 15-MIN DELAYED
          </span>
        );
      case 'FRESH':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> FRESH EOD
          </span>
        );
      case 'CACHED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> CACHED
          </span>
        );
      case 'STALE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> STALE DATA
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> DATA UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-3 rounded-2xl bg-gradient-to-br from-[#0B0F1C] via-[#0D1426] to-[#080B14] border border-cyan-500/20 p-5 shadow-2xl text-slate-100 font-sans space-y-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {data.exchange} MARKET INTELLIGENCE
            </div>
            <div className="text-sm font-semibold text-slate-200">{data.symbol}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              title="Refresh quote"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Price Display */}
      {isUnavailable ? (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs">
          Live market quote is temporarily unavailable from exchange gateways. Please try again later.
        </div>
      ) : (
        <div className="flex items-baseline justify-between bg-slate-900/40 rounded-xl p-3.5 border border-slate-800">
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {data.currency === 'INR' ? '₹' : '$'}{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Session: <span className="text-slate-200 uppercase font-semibold">{data.marketStatus}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.percentChange.toFixed(2)}%)</span>
          </div>
        </div>
      )}

      {/* Why it matters */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wide">
          <Info className="w-3.5 h-3.5" /> Empirical Overview
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          {data.whyItMatters}
        </p>
      </div>

      {/* Astrological Context */}
      {data.astrologicalContext && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" /> Traditional Astrological Correlation
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
            {data.astrologicalContext}
          </p>
        </div>
      )}

      {/* Footer / Provenance */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>Feed: {data.provenanceSource}</span>
        </div>
        <div>{new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</div>
      </div>

      <div className="text-[9px] text-slate-500 leading-tight border-t border-slate-800/40 pt-2">
        {data.epistemicDisclaimer}
      </div>
    </div>
  );
};
