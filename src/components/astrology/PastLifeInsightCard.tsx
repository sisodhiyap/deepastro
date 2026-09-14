import React from 'react';
import { Sparkles, Moon, Compass, Sun, Shield, BookOpen, Heart, Eye, Award, Feather } from 'lucide-react';

export interface PastLifeInsightCardProps {
  data: {
    userProfile: {
      name: string;
      dob: string;
      tob: string;
      pob: string;
    };
    summary: string;
    archetype?: string;
    visualTheme?: string;
    astrologicalHighlights: { label: string; value: string }[];
    numerologyHighlights: { label: string; value: number | string }[];
    vedicWisdomQuote: { source: string; theme: string };
    keyThemes: string[];
    karmicConnections: { pattern: string; currentLife: string }[];
    currentLifeInfluence: { area: string; guidance: string }[];
    soulMessage: string;
    disclaimer: string;
  };
  onExportPdf?: () => void;
  onShare?: () => void;
}

export const PastLifeInsightCard: React.FC<PastLifeInsightCardProps> = ({ data, onExportPdf, onShare }) => {
  return (
    <div id="past-life-card-a" className="relative w-full max-w-4xl mx-auto rounded-3xl p-6 md:p-10 bg-gradient-to-b from-[#0B0F1C] via-[#080B14] to-[#04060A] border-2 border-amber-400/40 shadow-[0_0_60px_rgba(245,158,11,0.18)] text-slate-100 font-sans select-none overflow-hidden">
      {/* Background Starry Aura & Subtle Cosmic Mandala */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Golden Border Filigree */}
      <div className="absolute top-3 left-3 right-3 bottom-3 border border-amber-400/20 rounded-2xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-10 text-center space-y-2 mb-8">
        <div className="flex items-center justify-between px-2 text-xs font-mono text-amber-300/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-bold text-amber-300">DeepAstro</span>
          </div>
          <div className="italic text-amber-200/70 text-[11px] hidden sm:block">
            "Not just who you are, but where you have been, and why you are here."
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
            SOULTRACE v1.0
          </div>
        </div>

        <div className="pt-2">
          <div className="inline-block p-2 rounded-full bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-1">
            <span className="text-xl">🕉️</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase">
            PAST LIFE INSIGHT
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-widest text-amber-300/80 uppercase">
            A GLIMPSE INTO YOUR SOUL'S JOURNEY
          </p>
        </div>
      </div>

      {/* Row 1: Profile + Central Visual + Summary */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Box 1: Your Soul Profile */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>YOUR SOUL PROFILE</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-semibold w-12 shrink-0">Name:</span>
                <span className="text-slate-100 font-bold truncate">{data.userProfile.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-semibold w-12 shrink-0">DOB:</span>
                <span className="text-slate-300">{data.userProfile.dob}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-semibold w-12 shrink-0">Time:</span>
                <span className="text-slate-300">{data.userProfile.tob}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-semibold w-12 shrink-0">Place:</span>
                <span className="text-slate-300 truncate">{data.userProfile.pob}</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] italic text-amber-300/70 border-t border-amber-500/20 pt-2 text-center">
            "Every soul carries a story written in the stars."
          </div>
        </div>

        {/* Box 2: Central Visual (Generated Dynamic Cosmic Artwork) */}
        <div className="relative rounded-xl overflow-hidden border border-amber-400/40 bg-gradient-to-b from-amber-950/20 to-slate-950 flex flex-col items-center justify-center p-4 text-center min-h-[190px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25),transparent_75%)] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-200/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            <div className="text-xs font-mono font-bold tracking-wider text-amber-200 uppercase">
              {data.visualTheme || 'TEMPLE SANCTUM'}
            </div>
            <div className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-tight">
              Luminous sanctuary of contemplation under starry celestial coordinates
            </div>
          </div>
        </div>

        {/* Box 3: Past Life Summary */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>PAST LIFE SUMMARY</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-6">
              {data.summary}
            </p>
          </div>
          <div className="text-[11px] italic text-amber-300/70 border-t border-amber-500/20 pt-2 text-center">
            "The soul never forgets what the mind cannot remember."
          </div>
        </div>
      </div>

      {/* Row 2: Astrological Insights + Numerology Insights + Wisdom from Vedas & Puranas */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Astrological Insights */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Moon className="w-4 h-4 text-amber-400" />
            <span>ASTROLOGICAL INSIGHTS</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {data.astrologicalHighlights.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400 truncate max-w-[140px]">{item.label}</span>
                <span className="text-amber-200 font-medium text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic pt-1">
            Planetary placements reveal strong karmic patterns carried across births.
          </p>
        </div>

        {/* Numerology Insights */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>NUMEROLOGY INSIGHTS</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {data.numerologyHighlights.map((num, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">{num.label}</span>
                <span className="text-amber-300 font-bold font-mono">#{num.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic pt-1">
            Numbers carry the vibrational signature of your soul's prior experience.
          </p>
        </div>

        {/* Wisdom from Vedas & Puranas */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Feather className="w-4 h-4 text-amber-400" />
            <span>WISDOM FROM VEDAS & PURANAS</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div>
              <div className="text-amber-300 font-semibold">{data.vedicWisdomQuote.source}</div>
              <div className="text-slate-300 leading-snug text-[10px] mt-0.5">{data.vedicWisdomQuote.theme}</div>
            </div>
            <div className="border-t border-slate-800/80 pt-1.5">
              <div className="text-amber-300 font-semibold">Vishnu Purana Insight</div>
              <div className="text-slate-400 text-[10px] leading-snug mt-0.5">
                Continuity of dharmic duty and non-attachment to transient physical identities.
              </div>
            </div>
          </div>
          <p className="text-[10px] text-amber-300/70 italic pt-1">
            Ancient wisdom illuminates the path of your soul's evolution.
          </p>
        </div>
      </div>

      {/* Row 3: Key Themes + Karmic Connections + How It Influences Current Life */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Key Themes */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>KEY THEMES FROM PAST LIFE</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            {data.keyThemes.slice(0, 4).map((th, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{th}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Karmic Connections */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 text-amber-400" />
            <span>KARMIC CONNECTIONS</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            {data.karmicConnections.slice(0, 3).map((kc, i) => (
              <div key={i} className="border-b border-slate-800/80 pb-1">
                <div className="text-amber-200 font-semibold">{kc.pattern}</div>
                <div className="text-slate-400 text-[10px] leading-tight mt-0.5">{kc.currentLife}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Influences Current Life */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-400/25 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>CURRENT LIFE INFLUENCE</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {data.currentLifeInfluence.slice(0, 3).map((inf, i) => (
              <div key={i} className="text-[10px] text-slate-300">
                <span className="text-amber-300 font-semibold">{inf.area}: </span>
                <span className="text-slate-400">{inf.guidance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Soul's Message Banner */}
      <div className="relative z-10 p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-600/15 border-2 border-amber-400/50 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-6">
        <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest mb-1.5">
          <span>✨</span>
          <span>YOUR SOUL'S MESSAGE</span>
          <span>✨</span>
        </div>
        <div className="text-base sm:text-lg font-serif italic text-amber-100 max-w-2xl mx-auto leading-snug">
          {data.soulMessage}
        </div>
        <div className="text-[11px] text-amber-300/80 mt-2">
          You have carried wisdom across lifetimes. Now it is time to live it, heal it, and share it.
        </div>
      </div>

      {/* Footer Badges & Logo */}
      <div className="relative z-10 border-t border-amber-500/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[10px] text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1 text-amber-300/90 font-mono">
            <Shield className="w-3 h-3 text-amber-400" /> REAL DATA
          </span>
          <span>•</span>
          <span className="text-slate-300">DEEP ASTROLOGY (Your chart, your story)</span>
          <span>•</span>
          <span className="text-slate-300">ANCIENT WISDOM (Vedas • Puranas • Karma)</span>
        </div>

        <div className="flex items-center gap-3">
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Export PDF
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
            >
              Share Card
            </button>
          )}
        </div>
      </div>

      <div className="text-[9px] text-center text-slate-500 mt-3 italic">
        {data.disclaimer}
      </div>
    </div>
  );
};
