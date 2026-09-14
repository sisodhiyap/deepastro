import React from 'react';
import { Hash, Sparkles, ShieldCheck } from 'lucide-react';

export interface NumerologyInsightCardProps {
  data: {
    userName: string;
    lifePath: number;
    destinyNumber: number;
    soulUrge: number;
    personalityNumber: number;
    interpretation: string;
    sources: string[];
  };
}

export const NumerologyInsightCard: React.FC<NumerologyInsightCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-3 rounded-2xl bg-gradient-to-br from-[#0B0D18] via-[#101426] to-[#080912] border border-violet-500/25 p-5 shadow-2xl text-slate-100 font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-violet-300 font-bold uppercase tracking-wider">
              NUMEROLOGY PROFILE
            </div>
            <div className="text-xs text-slate-400">{data.userName}</div>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
          Life Path {data.lifePath}
        </span>
      </div>

      {/* Core Numbers Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Life Path</div>
          <div className="text-lg font-bold text-violet-300 mt-0.5">{data.lifePath}</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Destiny</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">{data.destinyNumber}</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Soul Urge</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{data.soulUrge}</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-400">Personality</div>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">{data.personalityNumber}</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Core Vibration Summary
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {data.interpretation}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-violet-400" />
          <span>Formulas: Pythagorean & Chaldean Reduction</span>
        </div>
        <span>100% Deterministic</span>
      </div>
    </div>
  );
};
