import React from 'react';
import { Calendar, TrendingUp, Minus, AlertCircle, Compass, Sparkles } from 'lucide-react';

export interface MonthCardData {
  year: number;
  month: number;
  monthName: string;
  theme: string;
  careerTrend: 'Strong' | 'Stable' | 'Challenging' | 'Review';
  relationshipTrend: 'Strong' | 'Stable' | 'Challenging' | 'Review';
  financeTrend: 'Strong' | 'Stable' | 'Challenging' | 'Review';
  spiritualityTrend: 'Strong' | 'Stable' | 'Challenging' | 'Review';
  keyWindow: string;
  confidence: 'LOW' | 'MODERATE' | 'HIGH';
  why: string;
  supportingSystems?: string[];
}

export const FutureMonthCard: React.FC<{ data: MonthCardData }> = ({ data }) => {
  if (!data) return null;

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'Strong':
        return <span className="text-emerald-400 flex items-center gap-1 font-semibold">↑ Strong</span>;
      case 'Stable':
        return <span className="text-cyan-400 flex items-center gap-1 font-semibold">→ Stable</span>;
      case 'Review':
        return <span className="text-amber-400 flex items-center gap-1 font-semibold">⚠ Review</span>;
      default:
        return <span className="text-slate-400 flex items-center gap-1 font-semibold">• Steady</span>;
    }
  };

  const getConfidenceBadge = (conf: string) => {
    switch (conf) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">HIGH CONFIDENCE</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">MODERATE CONFIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">LOW CONFIDENCE</span>;
    }
  };

  return (
    <div className="bg-[#1A1F2B] border border-slate-800 hover:border-cyan-500/40 transition-all rounded-2xl p-5 shadow-xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h4 className="font-satoshi font-bold text-base tracking-wide uppercase text-slate-100">
            {data.monthName} {data.year}
          </h4>
        </div>
        {getConfidenceBadge(data.confidence)}
      </div>

      <div className="text-xs text-slate-300 leading-relaxed font-medium bg-[#111827]/70 p-3 rounded-xl border border-slate-800">
        {data.theme}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[#111827]/50 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Career</div>
          <div>{getTrendBadge(data.careerTrend)}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827]/50 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Relationship</div>
          <div>{getTrendBadge(data.relationshipTrend)}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827]/50 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Finance</div>
          <div>{getTrendBadge(data.financeTrend)}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827]/50 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Spirituality</div>
          <div>{getTrendBadge(data.spiritualityTrend)}</div>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
        <span className="text-cyan-400 font-bold uppercase font-mono text-[10px] block mb-0.5">Key Window:</span>
        <span className="text-slate-200 font-semibold">{data.keyWindow}</span>
      </div>

      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-semibold">Why: </span>
          <span>{data.why}</span>
        </div>
      </div>
    </div>
  );
};
