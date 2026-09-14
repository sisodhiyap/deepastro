import React from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Sparkles, Tag } from 'lucide-react';

export interface NewsInsightCardData {
  headline: string;
  source: string;
  provider: string;
  publishedAt: string;
  fetchedAt: string;
  dataAgeSeconds?: number;
  freshnessStatus: 'LIVE' | 'FRESH' | 'DELAYED' | 'CACHED' | 'STALE' | 'UNAVAILABLE';
  category: string;
  summary: string;
  sourceUrl?: string;
  personalRelevance?: string;
  epistemicDisclaimer: string;
}

export interface NewsInsightCardProps {
  data: NewsInsightCardData;
}

export const NewsInsightCard: React.FC<NewsInsightCardProps> = ({ data }) => {
  const getStatusBadge = () => {
    switch (data.freshnessStatus) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> LIVE WIRE
          </span>
        );
      case 'FRESH':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> FRESH
          </span>
        );
      case 'CACHED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> CACHED SNAPSHOT
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> ARCHIVAL / STALE
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-3 rounded-2xl bg-gradient-to-br from-[#0A0E1A] via-[#0C1222] to-[#070A12] border border-indigo-500/25 p-5 shadow-2xl text-slate-100 font-sans space-y-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">
              VERIFIED NEWS INTELLIGENCE
            </div>
            <div className="text-[11px] text-slate-400">{data.source}</div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Category tag */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
          <Tag className="w-3 h-3 text-indigo-400" /> {data.category}
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-base font-bold text-white leading-snug tracking-tight">
        {data.headline}
      </h3>

      {/* Summary */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/70">
        {data.summary}
      </p>

      {/* Personal Relevance */}
      {data.personalRelevance && (
        <div className="space-y-1 bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Contextual Relevance
          </div>
          <p className="text-xs text-indigo-100/90 leading-relaxed">
            {data.personalRelevance}
          </p>
        </div>
      )}

      {/* Source link & timestamps */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Wire: {data.provider}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Published: {new Date(data.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Read wire <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="text-[9px] text-slate-500 leading-tight border-t border-slate-800/40 pt-2">
        {data.epistemicDisclaimer}
      </div>
    </div>
  );
};
