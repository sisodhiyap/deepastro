import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface DashaPeriodUI {
  planet: string;
  durationYears: number;
  startDate: string;
  endDate: string;
  antardashas?: DashaPeriodUI[];
}

interface DashaTimelineProps {
  currentMahadasha: DashaPeriodUI;
  currentAntardasha: DashaPeriodUI;
  allMahadashas: DashaPeriodUI[];
  className?: string;
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({
  currentMahadasha,
  currentAntardasha,
  allMahadashas,
  className = '',
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Active Dasha Banner */}
      <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-violet-950/30 p-5 overflow-hidden shadow-glow-cyan/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Active Vimshottari Cosmic Period
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-cosmic-text mt-1">
              {currentMahadasha.planet} Mahadasha &bull; {currentAntardasha.planet} Antardasha
            </h3>
            <p className="text-xs text-cosmic-muted mt-0.5">
              Active span: {formatDate(currentMahadasha.startDate)} to {formatDate(currentMahadasha.endDate)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-cosmic-surface border border-cosmic-border text-center">
              <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Sub-Lord</span>
              <span className="text-sm font-bold text-cosmic-gold">{currentAntardasha.planet}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cosmic-surface border border-cosmic-border text-center">
              <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Duration</span>
              <span className="text-sm font-bold text-cyan-400">{Math.round(currentMahadasha.durationYears)} Yrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 120-Year Mahadashas Sequential Grid */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Complete 120-Year Timeline
        </h4>

        <div className="space-y-2">
          {allMahadashas.map((m, idx) => {
            const isCurrent = m.planet === currentMahadasha.planet;
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={`dasha-${m.planet}-${idx}`}
                className={`rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? 'border-cyan-500/60 bg-cosmic-surface/90 shadow-sm'
                    : 'border-cosmic-border bg-cosmic-surface/50 hover:border-cosmic-border/80'
                }`}
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full py-3 px-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                        isCurrent
                          ? 'bg-cyan-500 text-black shadow-glow-cyan'
                          : 'bg-cosmic-card text-cosmic-muted border border-cosmic-border'
                      }`}
                    >
                      {m.planet.substring(0, 2)}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-cosmic-text">{m.planet} Mahadasha</span>
                      <span className="text-xs text-cosmic-muted ml-2">
                        ({formatDate(m.startDate)} – {formatDate(m.endDate)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCurrent && (
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
                        Active
                      </span>
                    )}
                    <span className="text-xs text-cosmic-muted font-mono">{Math.round(m.durationYears)} yrs</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-cosmic-muted" /> : <ChevronDown className="w-4 h-4 text-cosmic-muted" />}
                  </div>
                </button>

                {/* Expanded Antardashas */}
                {isExpanded && m.antardashas && (
                  <div className="p-4 pt-1 border-t border-cosmic-border/40 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-cosmic-card/20">
                    {m.antardashas.map((a, aIdx) => {
                      const isSubActive = isCurrent && a.planet === currentAntardasha.planet;
                      return (
                        <div
                          key={`sub-${m.planet}-${a.planet}-${aIdx}`}
                          className={`p-2 rounded-lg text-xs border ${
                            isSubActive
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold'
                              : 'border-cosmic-border/50 bg-cosmic-surface/60 text-cosmic-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cosmic-text">{a.planet}</span>
                            <span className="text-[10px]">{formatDate(a.startDate)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
