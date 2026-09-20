import React from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  Lightbulb,
} from 'lucide-react';

export interface SoulLessonsCardProps {
  data: {
    primaryLesson?: {
      title: string;
      reason: string;
      indicators: string[];
    };
    secondaryLessons?: Array<{
      title: string;
      reason: string;
      indicators: string[];
    }>;
    supportingPlanets?: Array<{
      planet: string;
      role: string;
      placement: string;
    }>;
    supportingHouses?: number[];
    dashaContext?: string;
    practicalReflection?: string;
  };
  onExploreNext?: () => void;
}

export const SoulLessonsCard: React.FC<SoulLessonsCardProps> = ({
  data,
  onExploreNext,
}) => {
  const primary = data.primaryLesson || {
    title: 'Cultivating spiritual humility, transcending ego-centric authority, and leading through selfless duty.',
    reason: 'Derived from Atmakaraka with highest sidereal longitude in your personal Kundli.',
    indicators: ['Atmakaraka Soul King Placement', 'Navamsha (D9) Resonance', 'Purva Punya (5th House)'],
  };

  const secondary = data.secondaryLessons || [
    {
      title: 'Patient Endurance & Duty Without Resentment',
      reason: 'Anchored by Saturnian discipline and karmic maturity.',
      indicators: ['Saturn Placement', 'Karmic Taskmaster'],
    },
    {
      title: 'Releasing Over-Attachment to Past Comfort Zones',
      reason: 'Ketu placement indicates mastery that must not become a refuge from active dharma.',
      indicators: ['Ketu Nakshatra', 'Spiritual Release'],
    },
    {
      title: 'Embracing Evolutionary Growth in Unfamiliar Terrain',
      reason: 'Rahu points toward the frontier your soul is challenged to integrate.',
      indicators: ['Rahu Axis', 'Evolutionary Edge'],
    },
  ];

  const planets = data.supportingPlanets || [
    { planet: 'Sun', role: 'Soul Identity (Atmakaraka)', placement: 'Aries House 1' },
    { planet: 'Saturn', role: 'Karmic Taskmaster', placement: 'Capricorn House 10' },
    { planet: 'Ketu', role: 'Past Mastery & Release', placement: 'Scorpio House 8' },
    { planet: 'Rahu', role: 'Evolutionary Edge', placement: 'Taurus House 2' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Soul Lessons
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Identify what your soul is here to learn, the planetary indicators guiding your
              evolution, and the spiritual qualities being awakened.
            </p>
          </div>
        </div>
      </div>

      {/* Top 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Primary Soul Lesson (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#181102] via-[#0d0902] to-[#04040a] border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRIMARY SOUL LESSON
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-amber-200 leading-snug">
              {primary.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {primary.reason}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Astrological Indicators Used:
              </div>
              <div className="flex flex-wrap gap-2">
                {primary.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-amber-500/30 text-amber-300 font-mono"
                  >
                    ✦ {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dasha Context */}
          {data.dashaContext && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Active Dasha Catalyst</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {data.dashaContext}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Secondary Karmic Lessons (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#0a0e20] via-[#050711] to-[#020308] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Secondary Lessons & Conscious Evolution</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </h3>

            <div className="divide-y divide-slate-800/80 mt-2">
              {secondary.map((sec, idx) => (
                <div key={idx} className="py-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <h4 className="text-sm font-bold text-slate-100">{sec.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                    {sec.reason}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pl-6 pt-1">
                    {sec.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: Planetary Anchors & Practical Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Planetary Anchors */}
        <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Planetary Signifiers & Roles</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planets.map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">{p.planet}</span>
                  <span className="text-[10px] font-mono text-slate-500">{p.placement}</span>
                </div>
                <p className="text-[11px] text-slate-400">{p.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Reflection */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#120e03] to-[#090b14] border border-amber-500/30 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Practical Spiritual Reflection</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{data.practicalReflection || 'Reflect upon moments where you feel the impulse to react with past habits. Choosing patience, conscious discernment, and non-attachment transforms ancient vows into living liberation.'}&rdquo;
          </p>

          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase pt-2 border-t border-slate-800">
            — SOUL GUIDANCE &bull; DEEPASTRO
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-[#120d04] to-slate-900/90 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        <p className="text-xs sm:text-sm text-slate-200 font-medium">
          Ready to align your learned wisdom with your overarching cosmic purpose in this lifetime?
        </p>

        <button
          type="button"
          onClick={() => onExploreNext && onExploreNext()}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span>Align Life Purpose</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
