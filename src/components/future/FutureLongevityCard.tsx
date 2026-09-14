import React from 'react';
import { HeartPulse, ShieldAlert, Sparkles, Activity, Clock, AlertCircle } from 'lucide-react';

export interface LongevityCardData {
  title?: string;
  summary: string;
  vitalityIndicators: {
    system: string;
    factor: string;
    assessment: string;
    observation: string;
  }[];
  selfCareWindows: {
    startYear: number;
    endYear: number;
    intensity: 'Mild' | 'Moderate' | 'Heightened';
    focusArea: string;
    recommendation: string;
  }[];
  lifestyleReflections: string[];
  disclaimer: string;
  confidence: number;
}

export const FutureLongevityCard: React.FC<{ data: LongevityCardData }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full max-w-4xl bg-[#111827] border border-cyan-500/30 rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-satoshi text-slate-100 tracking-wide">
              LONGEVITY & WELLBEING
            </h3>
            <p className="text-xs text-slate-400">
              Traditional Vitality & Preventative Health-Span Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#1A1F2B] px-3 py-1.5 rounded-full border border-slate-700">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Confidence:</span>
          <span className="text-cyan-300 font-mono font-bold">{Math.round((data.confidence || 0.75) * 100)}%</span>
        </div>
      </div>

      <div className="bg-[#1A1F2B] p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
        {data.summary}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Traditional Vitality Indicators
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.vitalityIndicators?.map((v, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>{v.system}</span>
                <span className="text-cyan-300 font-semibold">{v.assessment}</span>
              </div>
              <div className="text-xs font-bold text-slate-200">{v.factor}</div>
              <div className="text-[11px] text-slate-300 line-clamp-3">{v.observation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Periods for Mindful Self-Care
        </h4>
        <div className="space-y-2">
          {data.selfCareWindows?.map((w, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#1A1F2B]/80 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {w.startYear} - {w.endYear}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{w.focusArea}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {w.intensity} Intensity
                  </span>
                </div>
                <div className="text-xs text-slate-300">{w.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Lifestyle & Vitality Reflections
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.lifestyleReflections?.map((r, i) => (
            <div key={i} className="text-xs text-slate-300 bg-[#1A1F2B]/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-xs flex items-start gap-2.5 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200">Non-Medical Disclaimer: </span>
          {data.disclaimer || "This is a traditional astrological interpretation and is not a medical assessment or prediction of lifespan or death."}
        </div>
      </div>
    </div>
  );
};
