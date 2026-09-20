import React from 'react';
import {
  Sparkles,
  Compass,
  Layers,
  Infinity as InfinityIcon,
  Flower2,
  Orbit,
  Fingerprint,
  ArrowRight,
  Shield,
  Star,
} from 'lucide-react';

export type SoulJourneyModuleId =
  | 'karmic_patterns'
  | 'past_life_influences'
  | 'soul_lessons'
  | 'life_purpose';

export interface DeepSoulJourneyCardProps {
  activeModule: SoulJourneyModuleId;
  onSelectModule: (module: SoulJourneyModuleId) => void;
  onExploreClick?: () => void;
  fingerprint?: string;
}

export const DeepSoulJourneyCard: React.FC<DeepSoulJourneyCardProps> = ({
  activeModule,
  onSelectModule,
  onExploreClick,
  fingerprint,
}) => {
  const modules: Array<{
    id: SoulJourneyModuleId;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderActive: string;
    bgCircle: string;
    iconColor: string;
  }> = [
    {
      id: 'karmic_patterns',
      title: 'Karmic Patterns',
      description: 'Understand recurring life themes',
      icon: Orbit,
      accentColor: 'text-indigo-400',
      borderActive: 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] bg-cyan-950/30',
      bgCircle: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-400',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'past_life_influences',
      title: 'Past Life Influences',
      description: 'Explore your soul\'s previous experiences',
      icon: Flower2,
      accentColor: 'text-cyan-400',
      borderActive: 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] bg-cyan-950/30',
      bgCircle: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400',
      iconColor: 'text-teal-300',
    },
    {
      id: 'soul_lessons',
      title: 'Soul Lessons',
      description: 'Identify what your soul is here to learn',
      icon: Sparkles,
      accentColor: 'text-amber-400',
      borderActive: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] bg-amber-950/30',
      bgCircle: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
      iconColor: 'text-amber-300',
    },
    {
      id: 'life_purpose',
      title: 'Life Purpose',
      description: 'Align with your higher journey',
      icon: InfinityIcon,
      accentColor: 'text-purple-400',
      borderActive: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] bg-purple-950/30',
      bgCircle: 'bg-purple-950/60 border-purple-500/40 text-purple-400',
      iconColor: 'text-purple-300',
    },
  ];

  return (
    <section
      aria-label="Deep Soul Journey Hero Experience"
      className="relative w-full max-w-7xl mx-auto rounded-3xl p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-[#080d1a] via-[#050711] to-[#020308] border border-cyan-500/25 shadow-[0_0_80px_rgba(6,182,212,0.12)] text-slate-100 overflow-hidden"
    >
      {/* Cosmic background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top badges bar */}
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <InfinityIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
            SOULTRACE
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-slate-300 text-xs font-semibold">
          <Flower2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300">
            PAST LIFE INSIGHTS
          </span>
        </div>
      </div>

      {/* Main hero grid: Left Celestial Portal Artwork, Right Content & Modules */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center py-6 sm:py-8">
        {/* Left Column: Celestial Archway Portal (4 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] bg-gradient-to-b from-[#0a1226] via-[#04060f] to-[#020308] p-4 flex flex-col items-center justify-between group">
            {/* SVG Visual: Luminous Gateway & Silhouette */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Starry Sky background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.2),transparent_70%)]" />
              
              {/* Celestial Moons & Orbs */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400/20 via-indigo-300/10 to-transparent blur-sm border border-cyan-300/30 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-sky-200/10 border border-cyan-200/20 shadow-inner" />
              </div>

              {/* Smaller orbiting moons */}
              <div className="absolute top-16 left-12 w-4 h-4 rounded-full bg-slate-200/40 blur-[0.5px]" />
              <div className="absolute top-20 right-14 w-6 h-6 rounded-full bg-indigo-300/30 blur-[0.5px]" />

              {/* Distant stars */}
              <div className="absolute top-12 left-20 text-[8px] text-cyan-300/60 animate-pulse">✦</div>
              <div className="absolute top-28 right-20 text-[10px] text-amber-200/70">✦</div>
              <div className="absolute top-44 left-14 text-[6px] text-sky-200/50">★</div>
              <div className="absolute top-36 right-10 text-[8px] text-cyan-200/60">✦</div>

              {/* Sacred Arches */}
              <div className="absolute inset-x-8 top-12 bottom-16 border-t-2 border-x-2 border-cyan-400/40 rounded-t-full shadow-[0_0_25px_rgba(6,182,212,0.25)]" />
              <div className="absolute inset-x-12 top-20 bottom-16 border-t border-x border-cyan-300/30 rounded-t-full" />
              <div className="absolute inset-x-16 top-28 bottom-16 border-t border-x border-amber-300/30 rounded-t-full" />

              {/* Winding Luminous Golden Path */}
              <svg
                className="absolute inset-x-0 bottom-0 w-full h-44"
                viewBox="0 0 200 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 20 Q105 45 95 65 T108 95 T90 120"
                  stroke="url(#pathGlow)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter="blur(3px)"
                  opacity="0.85"
                />
                <path
                  d="M100 20 Q105 45 95 65 T108 95 T90 120"
                  stroke="url(#pathCore)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="pathGlow" x1="100" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE047" stopOpacity="0.9" />
                    <stop offset="0.5" stopColor="#38BDF8" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#818CF8" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="pathCore" x1="100" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.6" stopColor="#FDE047" />
                    <stop offset="1" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Silhouette figure traveling toward gateway */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-cyan-400/40" />
                <div className="w-4 h-9 bg-slate-950/90 rounded-t-lg -mt-0.5 shadow-lg border-x border-cyan-500/20" />
              </div>
            </div>

            {/* Spacer for artwork center */}
            <div className="w-full h-48" />

            {/* Inscription below portal */}
            <div className="relative z-10 text-center space-y-1 mt-auto pt-4 border-t border-slate-800/60 w-full">
              <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase font-semibold">
                SAME SOUL
              </div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-slate-300 uppercase font-bold">
                MANY JOURNEYS
              </div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-amber-300/90 uppercase font-bold">
                GREATER WISDOM
              </div>
              <div className="text-amber-400 text-xs pt-0.5">✦</div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Editorial Subtitle, 4 Interactive Modules (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Header Title Block */}
          <div>
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.25em] text-slate-400 uppercase mb-2">
              <span className="w-6 h-[1px] bg-slate-700" />
              <span>D E E P A S T R O</span>
              <span className="w-6 h-[1px] bg-slate-700" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Deep Soul{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                Journey
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 mt-2 max-w-xl leading-relaxed">
              Discover the stories your soul has lived, the lessons it carries, and the purpose
              it is unfolding now.
            </p>
          </div>

          {/* 4 Interactive Feature Module Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = activeModule === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectModule(m.id)}
                  className={`relative w-full p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 border ${
                    isActive
                      ? m.borderActive
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform ${
                      isActive ? 'scale-105 border-cyan-400/80' : m.bgCircle
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${m.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-slate-100 truncate">
                        {m.title}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Philosophical Quote Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/80 to-[#0c1222] border border-indigo-500/20 text-slate-300 space-y-1.5">
            <p className="text-xs sm:text-sm italic font-serif text-slate-200">
              &ldquo;Your soul remembers what the mind has forgotten.&rdquo;
            </p>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              — DEEPASTRO
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Authentic Calculation Fingerprint & Explore CTA */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Fingerprint className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Authentic Calculation</span>
              {fingerprint && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {fingerprint.substring(0, 10)}...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Based on your birth chart, divisional charts and karmic indicators.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onExploreClick && onExploreClick()}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span>EXPLORE YOUR SOUL JOURNEY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
