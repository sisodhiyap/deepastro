import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Compass,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { getCalculatedChart, getBirthProfile, onChartUpdated } from '../utils/birthStorage.js';
import { generateDynamicLalKitabRemedies, DynamicLalKitabRemedy } from '../utils/lalKitabEngine.js';

export const LalKitabPage: React.FC = () => {
  const [chart, setChart] = useState<any>(() => getCalculatedChart());
  const [birthProfile, setBirthProfile] = useState<any>(() => getBirthProfile());

  const [completedRemedies, setCompletedRemedies] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('deepastro_remedies_progress');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  useEffect(() => {
    // 1. Initial check
    const local = getCalculatedChart();
    if (local) setChart(local.chart || local);

    // 2. Fetch from backend if available
    fetch('/api/astrology/chart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.ascendant || data.chart?.ascendant)) {
          setChart(data.chart || data);
        }
      })
      .catch(() => {});

    // 3. Listen to cross-page updates
    const unsubscribe = onChartUpdated(({ chart: updatedChart, profile: updatedProfile }) => {
      if (updatedChart) setChart(updatedChart.chart || updatedChart);
      if (updatedProfile) setBirthProfile(updatedProfile);
    });

    return () => unsubscribe();
  }, []);

  const toggleRemedy = (id: string) => {
    setCompletedRemedies((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('deepastro_remedies_progress', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const remedies: DynamicLalKitabRemedy[] = generateDynamicLalKitabRemedies(chart);
  const nativeName = birthProfile?.name || chart?.birthData?.name || chart?.input?.name || 'Your Birth Chart';

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" /> Traditional Red Book Remedies
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Lal Kitab Diagnostics &amp; Remedies Tracker
        </h1>
        <p className="text-xs text-cosmic-muted">
          Ancient pragmatic astrological measures customized strictly for {nativeName} based on actual planetary house placements.
        </p>
      </div>

      {/* Chart Placement Status Banner */}
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-cosmic-surface to-orange-500/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-amber/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              {chart ? `Active Chart: ${nativeName}` : 'Universal Foundational Measures'}
            </h4>
            <p className="text-xs text-cosmic-muted">
              {chart
                ? `Evaluating all 9 Grahas across your 12 Bhavas (${remedies.length} specific prescriptions plotted).`
                : 'Showing core foundational Lal Kitab measures. Calculate your Kundli to plot bespoke remedies.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
            1952 Samhita
          </span>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 flex items-start gap-4 text-xs">
        <BookOpen className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-cosmic-text">Traditional Remedial Philosophy</h4>
          <p className="text-cosmic-muted leading-relaxed">
            Lal Kitab remedies work by realigning elemental energies (air, water, fire, earth, metal) through self-discipline, respect for elders, and non-harming charity. They never require animal sacrifice, fear-based pledges, or commercial talismans.
          </p>
        </div>
      </div>

      {/* Remedies Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
            Active Astrological Remedial Protocols ({remedies.length})
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            {Object.values(completedRemedies).filter(Boolean).length} / {remedies.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remedies.map((rem) => {
            const isDone = Boolean(completedRemedies[rem.id]);

            return (
              <div
                key={rem.id}
                onClick={() => toggleRemedy(rem.id)}
                className={`rounded-3xl border p-6 transition-all duration-300 cursor-pointer space-y-4 select-none relative overflow-hidden ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 shadow-glow-cyan/10'
                    : 'border-cosmic-border bg-cosmic-surface hover:border-orange-500/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/30">
                        {rem.planet}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        H{rem.house}
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-bold font-display transition-colors ${
                        isDone ? 'text-emerald-300 line-through' : 'text-cosmic-text'
                      }`}
                    >
                      {rem.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle completion"
                    className="text-cosmic-muted hover:text-emerald-400 transition-colors shrink-0 mt-0.5"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-cosmic-border hover:border-orange-400" />
                    )}
                  </button>
                </div>

                {/* Instructions */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-cosmic-muted uppercase font-bold block">Method of Performance:</span>
                  <p className="text-cosmic-text leading-relaxed bg-cosmic-card/50 p-3 rounded-xl border border-cosmic-border/60">
                    {rem.instructions}
                  </p>
                </div>

                {/* Astrological Rationale */}
                <div className="text-[11px] text-cosmic-muted/90 flex items-start gap-2 bg-black/20 p-2.5 rounded-xl border border-cosmic-border/40">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{rem.astrologicalRationale}</span>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-cosmic-border/40 text-cosmic-muted">
                  <div>
                    <span className="font-semibold text-cosmic-text">Duration: </span>
                    <span>{rem.duration}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-400">Precaution: </span>
                    <span className="truncate">{rem.precautions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
