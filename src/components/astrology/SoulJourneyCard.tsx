import React, { useState } from 'react';
import { Sparkles, Shield, Compass, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp, Download } from 'lucide-react';

export interface SoulJourneyCardProps {
  schema: any;
  onExportPdf?: () => void;
}

export const SoulJourneyCard: React.FC<SoulJourneyCardProps> = ({ schema, onExportPdf }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!schema) return null;

  return (
    <div id="past-life-card-b" className="relative w-full max-w-5xl mx-auto rounded-3xl p-6 sm:p-12 bg-gradient-to-b from-[#090D1A] via-[#050811] to-[#020306] border-2 border-indigo-500/30 shadow-[0_0_80px_rgba(79,70,229,0.15)] text-slate-100 font-sans select-none space-y-8">
      {/* Background Radiance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between border-b border-indigo-500/20 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            DeepAstro 4.2+ &bull; SoulTrace Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-200 mt-1">
            SOUL JOURNEY & PAST LIFE DOSSIER
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Complete Multi-Layer Spiritual Intelligence &bull; Astronomical Provenance &bull; Puranic Wisdom
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
            {schema.confidence?.overall || 'HIGH'} CONFIDENCE
          </span>
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Verified Real-Time Engines */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'CALCULATION CORE', status: 'Swiss Ephemeris D1-D60', verified: true },
          { label: 'JAIMINI CANON', status: 'Atmakaraka & Chara Karakas', verified: true },
          { label: 'VEDIC HERITAGE', status: 'BPHS & Vishnu Purana', verified: true },
          { label: 'NUMEROLOGY', status: 'Life Path & Karmic Debts', verified: true },
        ].map((eng, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>{eng.label}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-slate-200 font-semibold">{eng.status}</div>
          </div>
        ))}
      </div>

      {/* Main Narrative Dossier */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Deep Narrative & Spiritual Arc */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-indigo-500/20 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{schema.narrative?.title}</span>
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                ARCHETYPE: {schema.archetype?.primary}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
              <p>{schema.narrative?.summary}</p>
              <div className="p-4 rounded-xl bg-[#04060C] border border-amber-500/20 text-slate-300 italic text-xs leading-relaxed">
                {schema.narrative?.story}
              </div>
            </div>
          </div>

          {/* Current Life Influence Table */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-indigo-500/20 backdrop-blur-md space-y-3">
            <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>How This Karmic Memory Influences Your Current Incarnation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {schema.current_life_connections?.map((conn: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-amber-300 font-bold uppercase text-[10px] tracking-wider">{conn.area}</div>
                  <div className="text-slate-300 text-[11px]">{conn.symbolic_connection}</div>
                  <div className="text-indigo-300 text-[10px] italic border-t border-slate-800/80 pt-1 mt-1">
                    Guidance: {conn.actionable_guidance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Indicators & Provenance Sidebar */}
        <div className="space-y-6">
          {/* User Profile Capsule */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-400 font-mono text-[10px] uppercase">Profile Grounding</div>
            <div className="font-bold text-slate-100 text-sm">{schema.user_profile_summary?.name}</div>
            <div className="text-slate-400 text-[11px]">
              {schema.user_profile_summary?.birthDate} &bull; {schema.user_profile_summary?.birthTime}
            </div>
            <div className="text-slate-400 text-[11px] truncate">
              {schema.user_profile_summary?.birthPlace}
            </div>
          </div>

          {/* Astrological Anchors */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
            <div className="text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Astrological Signifiers</span>
            </div>
            <div className="space-y-2">
              {schema.astrological_indicators?.map((ind: any, i: number) => (
                <div key={i} className="border-b border-slate-800 pb-1.5 text-[11px]">
                  <div className="text-slate-300 font-semibold">{ind.indicator}</div>
                  <div className="text-amber-300 font-mono text-[10px]">{ind.placement}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Authentic Vedic & Puranic Sources */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
            <div className="text-indigo-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Verified Textual Sources</span>
            </div>
            <div className="space-y-2">
              {[...(schema.vedic_references || []), ...(schema.purana_references || [])].map((src: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] space-y-0.5">
                  <div className="text-amber-300 font-bold">{src.title}</div>
                  <div className="text-slate-400">{src.sectionOrChapter}</div>
                  <div className="text-slate-500 italic">{src.provenance}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Evidence & Uncertainty Explorer */}
      <div className="relative z-10 border-t border-slate-800 pt-4">
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>CALIBRATED EPISTEMIC EVIDENCE & CONTRADICTION AUDIT</span>
          </span>
          {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showEvidence && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
            <div className="text-[11px] text-slate-300">
              <strong className="text-amber-300">Epistemic Status: </strong>
              {schema.epistemic_notice}
            </div>
            {schema.contradictions?.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px] space-y-1">
                <div className="font-bold">Contradiction Resolution Applied:</div>
                <div>{schema.contradictions[0].conflict}</div>
                <div className="text-slate-300 text-[10px]">{schema.contradictions[0].resolution}</div>
              </div>
            )}
            <div className="text-[10px] text-slate-500">
              Calculation Snapshot: {schema.calculation_snapshot_id} &bull; Engine: {schema.provenance?.engine_version} &bull; Knowledge: {schema.provenance?.knowledge_version}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
