import React, { useState } from 'react';
import { Compass, Sparkles, Calendar, ChevronRight, Activity, ShieldCheck, Heart, Briefcase, DollarSign, Brain, HeartPulse, HelpCircle } from 'lucide-react';

export interface FutureInsightCardProps {
  data: {
    currentPhase: string;
    overallTheme: string;
    nextMajorWindow: string;
    forecastHorizonYears: number;
    careerOutlook: string;
    relationshipOutlook: string;
    financeOutlook: string;
    growthOutlook: string;
    spiritualityOutlook: string;
    healthSpanOutlook: string;
    timeline: {
      year: number;
      overallTheme: string;
      strongestDomain: string;
      importantWindow: string;
      confidence: 'LOW' | 'MODERATE' | 'HIGH';
    }[];
    remedyHighlights: {
      category: string;
      title: string;
      practice: string;
    }[];
    confidenceScore: number;
    convergenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
    disclaimer: string;
  };
  onSelectYear?: (year: number) => void;
  onOpenLongevity?: () => void;
  onOpenReport?: () => void;
}

export const FutureInsightCard: React.FC<FutureInsightCardProps> = ({
  data,
  onSelectYear,
  onOpenLongevity,
  onOpenReport,
}) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);

  if (!data) return null;

  const currentYearObj = data.timeline?.[selectedYearIndex] || data.timeline?.[0];

  return (
    <div className="w-full max-w-5xl bg-gradient-to-b from-[#111827] to-[#0A0E17] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>DeepAstro Cosmic Future Intelligence Engine</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-satoshi tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            YOUR FUTURE MAP
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A TRADITIONAL MULTI-SYSTEM FORECAST
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#1A1F2B] border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Convergence: <strong>{data.convergenceLevel}</strong></span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-[#1A1F2B] border border-slate-700 text-xs font-mono text-slate-300">
            Confidence: <strong className="text-cyan-400">{Math.round((data.confidenceScore || 0.8) * 100)}%</strong>
          </div>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Current Life Phase</div>
          <div className="text-sm font-bold text-slate-100">{data.currentPhase}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">Overall Theme</div>
          <div className="text-sm font-bold text-slate-100">{data.overallTheme}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-emerald-500/30 space-y-1.5 bg-emerald-950/10">
          <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Next Major Window</div>
          <div className="text-sm font-bold text-emerald-200">{data.nextMajorWindow}</div>
        </div>
      </div>

      {/* Horizontal Timeline: 10 Years */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" /> Multi-Year Forecast Horizon ({data.timeline?.length || 10} Years)
          </span>
          <span>Click year to focus</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {data.timeline?.map((t, idx) => (
            <button
              key={t.year}
              onClick={() => {
                setSelectedYearIndex(idx);
                if (onSelectYear) onSelectYear(t.year);
              }}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all w-32 ${
                selectedYearIndex === idx
                  ? 'bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#1A1F2B]/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-mono font-black text-sm tracking-wide mb-0.5">{t.year}</div>
              <div className="text-[10px] uppercase font-semibold text-cyan-300 truncate">{t.strongestDomain}</div>
              <div className="text-[9px] text-slate-400 mt-1 truncate">{t.confidence} CONF</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Selected Year Highlight Card */}
      {currentYearObj && (
        <div className="p-5 rounded-2xl bg-[#111827] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
                {currentYearObj.year} SPOTLIGHT
              </span>
              <span className="text-xs text-slate-400 font-medium">Domain: {currentYearObj.strongestDomain}</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Window: {currentYearObj.importantWindow}</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-medium">
            {currentYearObj.overallTheme}
          </div>
        </div>
      )}

      {/* Domain Forecast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
            <Briefcase className="w-3.5 h-3.5" /> Career
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.careerOutlook}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-pink-400 uppercase">
            <Heart className="w-3.5 h-3.5" /> Relationships
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.relationshipOutlook}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
            <DollarSign className="w-3.5 h-3.5" /> Finance
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.financeOutlook}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase">
            <Brain className="w-3.5 h-3.5" /> Personal Growth
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.growthOutlook}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Spirituality
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.spiritualityOutlook}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/50 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
            <HeartPulse className="w-3.5 h-3.5" /> Wellbeing
          </div>
          <div className="text-xs text-slate-300 line-clamp-3">{data.healthSpanOutlook}</div>
        </div>
      </div>

      {/* Traditional Remedies & Actions */}
      {data.remedyHighlights && data.remedyHighlights.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#1A1F2B]/40 border border-slate-800 space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            Traditional Harmonic Practices (Remedies)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {data.remedyHighlights.map((r, i) => (
              <div key={i} className="text-xs bg-[#111827] p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-300 block">{r.category}</span>
                <span className="font-bold text-slate-200 block text-xs">{r.title}</span>
                <span className="text-[11px] text-slate-400 line-clamp-2">{r.practice}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer & Epistemic Disclaimer */}
      <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Epistemic Safety: Probabilistic indicators, non-deterministic.</span>
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="text-cyan-400 hover:underline text-[11px]"
          >
            {showDisclaimer ? 'Hide' : 'Read Full Notice'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {onOpenLongevity && (
            <button
              onClick={onOpenLongevity}
              className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs transition-colors"
            >
              Longevity & Wellbeing
            </button>
          )}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold transition-colors"
            >
              View Full Report
            </button>
          )}
        </div>
      </div>

      {showDisclaimer && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-300">Traditional Forecasting Framework</p>
          <p>{data.disclaimer}</p>
        </div>
      )}
    </div>
  );
};
