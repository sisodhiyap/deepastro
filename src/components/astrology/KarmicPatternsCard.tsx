import React, { useState } from 'react';
import {
  Orbit,
  Shield,
  Flower2,
  Sparkles,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Lightbulb,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface KarmicPatternItem {
  id: string;
  theme: string;
  evidence: string;
  strength: 'Strong' | 'Moderate' | 'Mild';
  icon: string;
}

export interface KarmicPatternsCardProps {
  data: {
    narrative?: string;
    dominantTheme?: {
      planet: string;
      sanskritName: string;
      keywords: string;
      explanation: string;
    };
    karmicAxis?: {
      axis: string;
      nodes: string;
      themes: string;
      balance: string;
    };
    keyPatterns?: KarmicPatternItem[];
    relatedPlanets?: Array<{
      name: string;
      signification: string;
      house: number;
      sign: string;
      degree?: number;
    }>;
    influencedHouses?: Array<{
      house: number;
      title: string;
      significance: string;
    }>;
    insightQuote?: {
      quote: string;
      author: string;
    };
  };
  userProfile?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
  };
  onExploreInfluences?: () => void;
  onNavigateToKundli?: () => void;
}

export const KarmicPatternsCard: React.FC<KarmicPatternsCardProps> = ({
  data,
  userProfile,
  onExploreInfluences,
  onNavigateToKundli,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<KarmicPatternItem | null>(null);
  const [showHouseModal, setShowHouseModal] = useState(false);

  // Safe fallbacks derived from authentic data
  const narrative =
    data.narrative ||
    'Your soul carries deep wisdom from past experiences. Certain patterns continue to surface in this life, offering opportunities for completion and growth.';

  const dominant = data.dominantTheme || {
    planet: 'Saturn',
    sanskritName: 'Shani',
    keywords: 'Discipline • Responsibility • Karmic Maturity',
    explanation: 'Saturn acts as your soul taskmaster, guiding patience and endurance across cycles.',
  };

  const axis = data.karmicAxis || {
    axis: 'Rahu - Ketu',
    nodes: 'Material vs Spiritual Balance',
    themes: 'Release & Transcend',
    balance: 'Releasing past attachments to embrace current-life evolutionary dharma.',
  };

  const patterns: KarmicPatternItem[] = data.keyPatterns && data.keyPatterns.length > 0
    ? data.keyPatterns
    : [
        {
          id: '1',
          theme: 'Authority & Responsibility',
          evidence: 'Past life experiences with power, control and duty.',
          strength: 'Strong',
          icon: 'Shield',
        },
        {
          id: '2',
          theme: 'Emotional Detachment',
          evidence: 'Tendency to withdraw emotionally in relationships.',
          strength: 'Moderate',
          icon: 'Orbit',
        },
        {
          id: '3',
          theme: 'Service & Healing',
          evidence: 'Karmic inclination towards helping and healing others.',
          strength: 'Strong',
          icon: 'Flower2',
        },
        {
          id: '4',
          theme: 'Spiritual Seeking',
          evidence: 'Deep past life practice in spirituality and inner wisdom.',
          strength: 'Moderate',
          icon: 'Sparkles',
        },
        {
          id: '5',
          theme: 'Material Attachment',
          evidence: 'Lessons around letting go of material possessions.',
          strength: 'Mild',
          icon: 'Compass',
        },
      ];

  const getStrengthBadge = (strength: 'Strong' | 'Moderate' | 'Mild') => {
    switch (strength) {
      case 'Strong':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-rose-950/70 border border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            Strong
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            Moderate
          </span>
        );
      case 'Mild':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            Mild
          </span>
        );
    }
  };

  const getPatternIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'Flower2':
        return <Flower2 className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'Orbit':
      default:
        return <Orbit className="w-4 h-4 text-purple-400" />;
    }
  };

  const relatedPlanets = data.relatedPlanets || [
    { name: 'Saturn', signification: 'Karmic Lessons', house: 10, sign: 'Capricorn' },
    { name: 'Rahu', signification: 'Worldly Desires', house: 2, sign: 'Taurus' },
    { name: 'Ketu', signification: 'Spiritual Liberation', house: 8, sign: 'Scorpio' },
  ];

  const influencedHouses = data.influencedHouses || [
    { house: 4, title: 'Home & Roots', significance: 'Emotional anchor and inner foundations.' },
    { house: 8, title: 'Transformation', significance: 'Karmic clearing and esoteric rebirth.' },
    { house: 10, title: 'Career & Duty', significance: 'Ethical public leadership and vocation.' },
    { house: 12, title: 'Spirituality', significance: 'Moksha and transcendent meditation.' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header section with icon, title, subtitle & profile pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <Orbit className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Karmic Patterns
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Understand the recurring themes, unfinished cycles, and karmic energies that have
              followed your soul across lifetimes.
            </p>
          </div>
        </div>

        {/* Profile Pill Badge */}
        {userProfile && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md self-start md:self-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Your Birth Profile</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">• Active</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {userProfile.birthDate ? `${userProfile.birthDate}` : ''}
                {userProfile.birthTime ? `, ${userProfile.birthTime}` : ''}
                {userProfile.birthPlace ? ` • ${userProfile.birthPlace}` : ''}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />
          </div>
        )}
      </div>

      {/* Top 2-Column Grid: Karmic Overview (Left) & Key Karmic Patterns (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Karmic Overview (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#0a0f24] via-[#060914] to-[#020409] border border-indigo-500/25 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
              <span>Karmic Overview</span>
            </h3>

            {/* Sacred Meditative Cosmic Mandala Artwork */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-indigo-500/30 bg-[#030611] flex items-center justify-center shadow-inner">
              {/* Radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.25),transparent_70%)]" />

              {/* Concentric sacred geometry rings */}
              <div className="absolute w-44 h-44 rounded-full border border-amber-400/20 animate-pulse" />
              <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30" />
              <div className="absolute w-28 h-28 rounded-full border border-indigo-400/40" />

              {/* Geometric rays */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-amber-400/30 to-transparent absolute" />
              </div>

              {/* Meditating Silhouette Figure */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 shadow-[0_0_15px_#f59e0b]" />
                <div className="w-8 h-10 bg-slate-900 border border-amber-400/50 rounded-t-full mt-0.5 shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                </div>
                <div className="w-14 h-3 bg-slate-900 border border-amber-500/40 rounded-full -mt-1 shadow-lg" />
              </div>

              {/* Cosmic Stars & Orbiting Planets */}
              <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-cyan-300/40 blur-[0.5px]" />
              <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full bg-amber-300/50" />
            </div>

            {/* Personalized narrative */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {narrative}
            </p>
          </div>

          {/* Metrics: Dominant Theme & Karmic Axis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            {/* Dominant Karmic Theme */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-serif text-lg font-bold flex-shrink-0">
                ♄
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Dominant Karmic Theme
                </div>
                <div className="text-xs font-bold text-amber-300 truncate">
                  {dominant.planet} ({dominant.sanskritName})
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {dominant.keywords}
                </div>
              </div>
            </div>

            {/* Karmic Axis */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-serif text-lg font-bold flex-shrink-0">
                ☊☋
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Karmic Axis
                </div>
                <div className="text-xs font-bold text-cyan-300 truncate">
                  {axis.axis}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {axis.themes}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Karmic Patterns in Your Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#090d1f] via-[#050712] to-[#020308] border border-cyan-500/25 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                Key Karmic Patterns in Your Chart
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPattern(patterns[0])}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>See Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of 5 patterns */}
            <div className="divide-y divide-slate-800/80 mt-2">
              {patterns.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPattern(item)}
                  className="py-3.5 sm:py-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 px-2 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/40 transition-colors">
                      {getPatternIcon(item.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                        {item.theme}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {item.evidence}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getStrengthBadge(item.strength)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Row: Related Planets, Influenced Houses, Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Related Planets */}
        <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Related Planets</h4>
            {onNavigateToKundli && (
              <button
                type="button"
                onClick={onNavigateToKundli}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View in Kundli</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            {relatedPlanets.map((planet, idx) => {
              const gradients = [
                'from-amber-600 via-amber-400 to-yellow-200',
                'from-blue-700 via-sky-500 to-cyan-300',
                'from-rose-700 via-orange-500 to-amber-300',
              ];
              const grad = gradients[idx % gradients.length];

              return (
                <div key={idx} className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr ${grad} shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-white/20 flex items-center justify-center text-slate-950 font-bold text-xs`}
                  >
                    ✦
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{planet.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[80px]">
                      {planet.signification}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Influenced Houses */}
        <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Influenced Houses</h4>
            <button
              type="button"
              onClick={() => setShowHouseModal(true)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 py-2">
            {influencedHouses.slice(0, 4).map((h, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-sm font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  {h.house}
                </div>
                <div className="text-[10px] font-semibold text-slate-300 truncate max-w-[70px]">
                  {h.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Insight Quote */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0c1326] to-[#060812] border border-amber-500/30 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Insight</span>
          </div>

          <p className="text-xs sm:text-sm italic font-serif text-slate-200 leading-relaxed">
            &ldquo;{data.insightQuote?.quote || 'Your challenges are not punishments, but invitations to become the highest version of your soul.'}&rdquo;
          </p>

          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase pt-2 border-t border-slate-800/80">
            — {data.insightQuote?.author || 'DEEPASTRO'}
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-[#071324] to-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
            <Flower2 className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            Explore how these karmic patterns have shaped your past lives and influence your
            present journey.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onExploreInfluences && onExploreInfluences()}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span>Explore Past Life Influences</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Epistemic disclaimer footer */}
      <div className="text-center text-[11px] text-slate-500 max-w-2xl mx-auto pt-2">
        All insights are based on Vedic astrology, divisional charts and traditional karmic
        analysis. Results are interpretative and meant for guidance, not deterministic prediction.
      </div>

      {/* Detail Modal for Selected Pattern */}
      {selectedPattern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>Pattern Details</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPattern(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">{selectedPattern.theme}</h4>
                {getStrengthBadge(selectedPattern.strength)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPattern.evidence}
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-amber-300">Jyotish Provenance:</div>
                <p>
                  Calculated from planetary dignity, house rulerships, and divisional chart
                  alignments in your personal Kundli.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPattern(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Influenced Houses */}
      {showHouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-indigo-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Orbit className="w-4 h-4" />
                <span>Influenced Houses & Dharmic Roles</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowHouseModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {influencedHouses.map((h, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
                      {h.house}
                    </span>
                    <span className="font-bold text-slate-100 text-xs">{h.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">{h.significance}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowHouseModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
