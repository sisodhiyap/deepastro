import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  BookOpen,
  Eye,
  Shield,
  Star,
  Users,
  Feather,
  Flower2,
  HelpCircle,
  Clock,
  Heart,
  Target
} from 'lucide-react';

export interface PastLifeInsightCardProps {
  data: {
    userProfile?: {
      name?: string;
      dob?: string;
      tob?: string;
      pob?: string;
    };
    summary?: string;
    archetype?: string;
    visualTheme?: string;
    astrologicalHighlights?: { label: string; value: string }[];
    numerologyHighlights?: { label: string; value: number | string }[];
    vedicWisdomQuote?: { source: string; theme: string };
    keyThemes?: string[];
    karmicConnections?: { pattern: string; currentLife: string }[];
    currentLifeInfluence?: { area: string; guidance: string }[];
    soulMessage?: string;
    disclaimer?: string;
    rawSchema?: any;
  };
  onExportPdf?: () => void;
  onShare?: () => void;
}

export const PastLifeInsightCard: React.FC<PastLifeInsightCardProps> = ({ data, onExportPdf, onShare }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'astrology' | 'karma' | 'wisdom'>('astrology');

  if (!data) return null;

  const archetype = data.archetype || data.rawSchema?.archetype?.primary || 'Seeker of Sacred Truth';
  const soulLesson = data.rawSchema?.archetype?.soulLesson || data.soulMessage || 'Awakening transcendent consciousness across cycles of time.';
  const karmicPattern = data.karmicConnections?.[0]?.pattern || data.rawSchema?.karmicPatterns?.[0]?.pattern || 'Ketu 12th House / Moksha Axis Orientation';
  const karmicCurrent = data.karmicConnections?.[0]?.currentLife || 'Intuitive detachment and seeking inner spiritual equilibrium.';
  const quoteText = data.vedicWisdomQuote?.theme || 'You are not just this life, You are a timeless soul...';
  const quoteSource = data.vedicWisdomQuote?.source || 'Vishnu Purana & Vedic Wisdom';

  return (
    <div id="past-soul-journey-card-root" className="w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#090E1C] via-[#060813] to-[#030409] border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.18)] text-slate-100 font-sans relative overflow-hidden p-6 sm:p-10 select-none">
      {/* Background Cosmic Radiance */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP PILLS: Discover Your Stories & Powered by Vedic Wisdom */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
        <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Discover Your Stories</span>
        </div>

        <div className="px-4 py-1.5 rounded-full bg-purple-600/20 border border-purple-400/40 text-purple-300 text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md shadow-purple-500/10">
          <Flower2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Powered by Vedic Wisdom</span>
        </div>
      </div>

      {/* MAIN TITLE & SUBTITLE */}
      <div className="relative z-10 space-y-2 mb-8">
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-purple-100 to-amber-200 tracking-tight">
          Past Soul Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Explore your past lives, karmic patterns and soul evolution through the ancient wisdom of Vedic Astrology.
        </p>
      </div>

      {/* EPISTEMIC SAFETY & TRADITIONAL FRAMING */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 mb-6 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold text-amber-300">Epistemic Note: </span>
          Traditional Jyotish interpretations of past life (Ketu, Rahu, Atmakaraka, D60) provide symbolic and philosophical archetypes for spiritual reflection. They are never deterministic historical facts. Your destiny remains guided by conscious choice and free will.
        </p>
      </div>

      {/* HERO SECTION: CELESTIAL CIRCULAR PORTAL & 4 FEATURE PILLARS */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* LEFT / CENTER: 4 FEATURE PILLARS */}
        <div className="lg:col-span-6 space-y-4">
          {/* Pillar 1: Ketu */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400/60 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              <Flower2 className="w-5 h-5 text-purple-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-100 font-serif">Ketu · Past Karmic Seed</h3>
              <p className="text-xs text-purple-300/90 font-medium">Spiritual Memory & Deep-Rooted Instincts</p>
              <p className="text-[11px] text-slate-400 line-clamp-2">{data.rawSchema?.ketuData?.significance || 'Intuitive detachment and subconscious wisdom carried across cycles.'}</p>
            </div>
          </div>

          {/* Pillar 2: Rahu */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-100 font-serif">Rahu · Growth Vector</h3>
              <p className="text-xs text-cyan-300/90 font-medium">Current Incarnation Evolutionary Edge</p>
              <p className="text-[11px] text-slate-400 line-clamp-2">{data.rawSchema?.rahuData?.significance || 'Dynamic expansion into uncharted areas of personal evolution.'}</p>
            </div>
          </div>

          {/* Pillar 3: Atmakaraka */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-100 font-serif">Atmakaraka · Soul Motif</h3>
              <p className="text-xs text-amber-300/90 font-medium">{data.rawSchema?.atmakarakaData ? `${data.rawSchema.atmakarakaData.planet} (${data.rawSchema.atmakarakaData.signName || 'Core'})` : 'Primary Soul Planet'}</p>
              <p className="text-[11px] text-slate-400 line-clamp-2">{data.rawSchema?.atmakarakaData?.soulLesson || soulLesson}</p>
            </div>
          </div>

          {/* Pillar 4: 12th House */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Feather className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-100 font-serif">12th House · Moksha Axis</h3>
              <p className="text-xs text-emerald-300/90 font-medium">Transcendence & Subconscious Imprints</p>
              <p className="text-[11px] text-slate-400 line-clamp-2">{data.rawSchema?.house12Data?.significance || 'Liberation, inner meditation, and releasing attachment.'}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: CELESTIAL CIRCULAR WHEEL PORTAL ARTWORK WITH MEDITATING SEEKER */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 border-amber-400/30 bg-gradient-to-b from-[#131b38] via-[#0c1228] to-[#070b18] flex items-center justify-center shadow-2xl shadow-purple-900/40 p-4">
            {/* Outer Zodiac & Portal Rings */}
            <div className="absolute inset-2 rounded-full border border-purple-400/20 animate-spin-slow pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-amber-400/20 pointer-events-none" />
            
            {/* Vignette Nodes Around Circle (representing archetypal epochs) */}
            <div className="absolute top-2 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-[10px] text-amber-300">🏛️</div>
            <div className="absolute bottom-2 w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-[10px] text-cyan-300">⛵</div>
            <div className="absolute left-2 w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/60 flex items-center justify-center text-[10px] text-purple-300">⚔️</div>
            <div className="absolute right-2 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-[10px] text-emerald-300">🪷</div>

            {/* Central Portal Glow */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-400/50 flex flex-col items-center justify-center text-center p-3 shadow-inner">
              <div className="text-2xl mb-1">🧘‍♂️</div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">SOULTRACE</div>
              <div className="text-[9px] text-slate-400 font-mono">D60 Shashtiamsha</div>
            </div>
          </div>
        </div>
      </div>

      {/* SOUL QUOTE BLOCK */}
      <div className="relative z-10 p-5 rounded-2xl bg-black/40 backdrop-blur-md border-l-4 border-l-amber-400 border border-slate-800/80 mb-8 space-y-1">
        <p className="text-sm sm:text-base font-serif italic text-amber-200">
          “{quoteText}”
        </p>
        <p className="text-[11px] font-mono tracking-wider text-amber-400/80">
          — {quoteSource}
        </p>
      </div>

      {/* GENUINE VEDIC & ASTRONOMICAL PROVENANCE TELEMETRY */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-slate-800/80 py-4 mb-8 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="font-mono font-bold text-amber-300 text-xs flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>D60 Shashtiamsha</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">CALCULATED HARMONIC</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="font-mono font-bold text-purple-300 text-xs flex items-center justify-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Ketu & Atmakaraka Axis</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">VERIFIED ASTRONOMICAL</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="font-mono font-bold text-cyan-300 text-xs flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interpretive Framework</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">TRADITIONAL SYMBOLIC</div>
        </div>
      </div>

      {/* PRIMARY CTA: EXPLORE YOUR PAST LIFE */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-3 cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>{expanded ? 'Collapse Soul Journey' : 'Explore Your Past Life'}</span>
          {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </button>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          UNLOCK THE WISDOM WITHIN
        </span>
      </div>

      {/* EXPANDED DEEP DOSSIER SECTION */}
      {expanded && (
        <div className="relative z-10 mt-8 pt-8 border-t border-slate-800 space-y-6 animate-fadeIn">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { key: 'astrology', label: 'Astrological Indicators' },
              { key: 'karma', label: 'Karmic Connections' },
              { key: 'wisdom', label: 'Vedic Guidance' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Astrological Indicators */}
          {activeTab === 'astrology' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Array.isArray(data.astrologicalHighlights) && data.astrologicalHighlights.length > 0 ? (
                data.astrologicalHighlights.map((h, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-amber-300 font-mono font-bold">{h.label}</div>
                    <div className="text-slate-300">{h.value}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400">
                  Evaluated via Ketu 12th House, D60 Shashtiamsha, Atmakaraka and Purva Punya 5th House.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Karmic Connections */}
          {activeTab === 'karma' && (
            <div className="space-y-3 text-xs">
              {Array.isArray(data.karmicConnections) && data.karmicConnections.length > 0 ? (
                data.karmicConnections.map((kc, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-cyan-300 font-mono font-bold">Karmic Root: {kc.pattern}</div>
                    <div className="text-slate-300">Present Life Reflection: {kc.currentLife}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400">
                  No lingering contradictory karmic debts identified.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Vedic Guidance */}
          {activeTab === 'wisdom' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="text-purple-300 font-bold font-serif text-sm">Soul Directive</div>
                <p className="text-slate-300 leading-relaxed">{soulLesson}</p>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                {data.disclaimer || 'Vedic SoulTrace interpretations provide philosophical perspectives for spiritual contemplation.'}
              </div>
            </div>
          )}

          {/* Export & Share buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Insight</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
