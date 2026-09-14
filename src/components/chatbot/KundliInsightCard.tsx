import React from 'react';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

export interface KundliInsightCardProps {
  data: {
    userName: string;
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    nakshatraLord: string;
    currentMahadasha: string;
    keyPlanets: Array<{
      name: string;
      sign: string;
      house: number | string;
      degree: string;
    }>;
    sources: string[];
  };
}

export const KundliInsightCard: React.FC<KundliInsightCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-3 rounded-2xl bg-gradient-to-br from-[#090D1A] via-[#0D152A] to-[#060914] border border-cyan-500/25 p-5 shadow-2xl text-slate-100 font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              NATAL KUNDLI INSIGHT
            </div>
            <div className="text-xs text-slate-400">{data.userName}</div>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          {data.currentMahadasha} Dasha
        </span>
      </div>

      {/* Core Trinities */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-mono text-slate-400">Ascendant</div>
          <div className="text-xs font-bold text-white mt-0.5">{data.ascendant}</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-mono text-slate-400">Moon Sign</div>
          <div className="text-xs font-bold text-cyan-300 mt-0.5">{data.moonSign}</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-mono text-slate-400">Nakshatra</div>
          <div className="text-xs font-bold text-violet-300 mt-0.5">{data.nakshatra}</div>
        </div>
      </div>

      {/* Planetary Dignity Table */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Key Planetary Placements
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {data.keyPlanets.map((p, idx) => (
            <div key={idx} className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span className="font-semibold text-slate-300">{p.name}</span>
              <span className="text-cyan-300 text-[11px]">{p.sign} (H{p.house})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>Ephemeris: {data.sources[0] || 'Swiss Ephemeris'}</span>
        </div>
        <span>Calculated Deterministically</span>
      </div>
    </div>
  );
};
