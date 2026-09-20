import React from 'react';
import {
  Infinity as InfinityIcon,
  Compass,
  ArrowRight,
  Briefcase,
  Target,
  Sparkles,
  Clock,
  Lightbulb,
} from 'lucide-react';

export interface LifePurposeCardProps {
  data: {
    coreDirection?: {
      title: string;
      explanation: string;
      indicators: string[];
    };
    careerAndContribution?: {
      title: string;
      explanation: string;
      indicators: string[];
    };
    growthDirection?: {
      title: string;
      explanation: string;
      indicators: string[];
    };
    currentDashaContext?: string;
    transitContext?: string;
    practicalReflection?: string;
  };
  onReturnToJourney?: () => void;
}

export const LifePurposeCard: React.FC<LifePurposeCardProps> = ({
  data,
  onReturnToJourney,
}) => {
  const core = data.coreDirection || {
    title: 'Dharmic Alignment of Soul Guide & Cosmic Ascendant',
    explanation: 'Your soul has chosen this lifetime to bridge inner contemplation with ethical outer responsibility.',
    indicators: ['Ascendant Vitality', 'Atmakaraka Soul Alignment', '9th House Dharma'],
  };

  const career = data.careerAndContribution || {
    title: 'Vocational Mastery & Purposeful Service',
    explanation: 'Your vocational contribution thrives when work involves depth, problem-solving, and mentoring others.',
    indicators: ['Amatyakaraka Profession', '10th House Duty'],
  };

  const growth = data.growthDirection || {
    title: 'Evolutionary Edge: Rahu Frontier Expansion',
    explanation: 'Engaging courageously with new frontiers without severing spiritual anchors.',
    indicators: ['Rahu Axis', 'Unfolding Karma'],
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_25px_rgba(168,85,247,0.25)]">
            <InfinityIcon className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Life Purpose
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Align with your higher journey, understand your soul's contribution edge, and navigate
              active karmic dharmas derived from your birth chart.
            </p>
          </div>
        </div>
      </div>

      {/* Top 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Core Purpose Direction (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#140a24] via-[#0b0515] to-[#04020a] border border-purple-500/30 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                CORE DHARMIC DIRECTION
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-purple-200 leading-snug">
              {core.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {core.explanation}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Astrological Pillars:
              </div>
              <div className="flex flex-wrap gap-2">
                {core.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-purple-500/30 text-purple-300 font-mono"
                  >
                    ✦ {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dasha & Transit context */}
          {(data.currentDashaContext || data.transitContext) && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Cosmic Timing & Dasha Unfolding</span>
              </div>
              {data.currentDashaContext && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {data.currentDashaContext}
                </p>
              )}
              {data.transitContext && (
                <p className="text-[11px] text-slate-400 italic">
                  {data.transitContext}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Career & Growth Frontier (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#090d21] via-[#050714] to-[#020308] border border-cyan-500/25 shadow-xl flex flex-col justify-between space-y-6">
          {/* Career Section */}
          <div className="space-y-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Career & Contribution Themes</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">{career.title}</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {career.explanation}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {career.indicators.map((ind, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Growth Direction */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4 text-sky-400" />
              <span>Evolutionary Growth Direction</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">{growth.title}</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {growth.explanation}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {growth.indicators.map((ind, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practical Reflection */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#130b24] to-[#080512] border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider mb-1">
              Dharmic Reflection
            </div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              &ldquo;{data.practicalReflection || 'True purpose is not an external destination to reach, but an inner frequency of conscious dedication brought to everything you touch.'}&rdquo;
            </p>
          </div>
        </div>

        {onReturnToJourney && (
          <button
            type="button"
            onClick={onReturnToJourney}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors flex-shrink-0"
          >
            <span>Back to Journey Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
