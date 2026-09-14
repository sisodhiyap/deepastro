import React, { useState } from 'react';
import { Calendar, HelpCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';

export interface YearCardData {
  year: number;
  overallTheme: string;
  career: string;
  business?: string;
  finance: string;
  relationship: string;
  family?: string;
  education?: string;
  healthSpan: string;
  spirituality: string;
  relocation?: string;
  personalGrowth?: string;
  opportunities: string[];
  challenges: string[];
  strongWindows: string[];
  cautionWindows: string[];
  confidence: 'LOW' | 'MODERATE' | 'HIGH';
  evidence: {
    system: string;
    description: string;
  }[];
  uncertainty: string;
  whatCouldChangeThis?: string[];
}

export const FutureYearCard: React.FC<{ data: YearCardData }> = ({ data }) => {
  const [showWhy, setShowWhy] = useState(false);

  if (!data) return null;

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'HIGH':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MODERATE':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#111827] border border-slate-800 hover:border-cyan-500/30 transition-all rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black font-mono text-xl shadow-lg shadow-cyan-500/20">
            {data.year}
          </div>
          <div>
            <h3 className="text-lg font-bold font-satoshi text-slate-100 tracking-wide">
              Annual Outlook
            </h3>
            <p className="text-xs text-slate-400">Multi-System Traditional Synthesis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold ${getConfidenceColor(data.confidence)}`}>
            CONFIDENCE: {data.confidence}
          </span>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showWhy ? 'Hide Why' : 'Why This Forecast?'}</span>
            {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="bg-[#1A1F2B] p-4 rounded-xl border border-slate-800">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">Core Theme</div>
        <div className="text-sm font-semibold text-slate-200 leading-relaxed">{data.overallTheme}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase">Career & Calling</div>
          <div className="text-xs text-slate-300 leading-relaxed">{data.career}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-pink-400 uppercase">Relationships & Bonds</div>
          <div className="text-xs text-slate-300 leading-relaxed">{data.relationship}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase">Finance & Assets</div>
          <div className="text-xs text-slate-300 leading-relaxed">{data.finance}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase">Spirituality & Inner Growth</div>
          <div className="text-xs text-slate-300 leading-relaxed">{data.spirituality}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">Health-Span & Self-Care</div>
          <div className="text-xs text-slate-300 leading-relaxed">{data.healthSpan}</div>
        </div>
        {data.personalGrowth && (
          <div className="p-3.5 rounded-xl bg-[#1A1F2B]/60 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-bold text-indigo-400 uppercase">Personal Growth</div>
            <div className="text-xs text-slate-300 leading-relaxed">{data.personalGrowth}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strong Windows
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.strongWindows?.map((w, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Caution / Reflection Windows
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.cautionWindows?.map((w, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showWhy && (
        <div className="p-5 rounded-xl bg-[#0B0F19] border border-cyan-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Grounded Evidence & Methodology
          </div>
          <div className="space-y-2">
            {data.evidence?.map((e, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#111827] border border-slate-800 text-xs">
                <span className="font-mono font-bold text-cyan-400">{e.system}: </span>
                <span className="text-slate-300">{e.description}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 bg-[#111827]/60 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-300">Uncertainty Evaluation: </span>
            {data.uncertainty}
          </div>
          {data.whatCouldChangeThis && data.whatCouldChangeThis.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                What Could Change This Outlook?
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                {data.whatCouldChangeThis.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
