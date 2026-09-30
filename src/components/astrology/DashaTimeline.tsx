import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DashaPeriod, PratyantardashaPeriod } from '../../types/astrology.js';

interface DashaTimelineProps {
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha?: PratyantardashaPeriod;
  allMahadashas: DashaPeriod[];
  ianaTimeZone?: string;
  birthTimezoneOffset?: number;
  className?: string;
}

function formatDashaDate(iso: string | undefined, timeZone?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  try {
    const opts: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    if (timeZone) {
      opts.timeZone = timeZone;
    }
    return new Intl.DateTimeFormat('en-US', opts).format(d);
  } catch {
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

function formatDurationBetween(startIso: string, endIso: string): string {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return '—';

  const totalDays = Math.round((e - s) / (24 * 60 * 60 * 1000));
  const years = Math.floor(totalDays / 365.25);
  const remainingDaysAfterYears = totalDays % 365.25;
  const months = Math.floor(remainingDaysAfterYears / 30.4375);
  const days = Math.round(remainingDaysAfterYears % 30.4375);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  if (days > 0 && years === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  return parts.length > 0 ? parts.join(' ') : `${totalDays} days`;
}

function calculateRemainingTime(endIso: string): { text: string; isPast: boolean } {
  const now = Date.now();
  const end = new Date(endIso).getTime();
  if (isNaN(end)) return { text: '—', isPast: false };

  const diffMs = end - now;
  if (diffMs <= 0) return { text: 'Period Completed', isPast: true };

  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const years = Math.floor(totalDays / 365.25);
  const remDays = totalDays % 365.25;
  const months = Math.floor(remDays / 30.4375);
  const days = Math.floor(remDays % 30.4375);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  return { text: parts.join(', '), isPast: false };
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({
  currentMahadasha,
  currentAntardasha,
  currentPratyantardasha,
  allMahadashas = [],
  ianaTimeZone = 'Asia/Kolkata',
  className = '',
}) => {
  const [expandedMIndex, setExpandedMIndex] = useState<number | null>(null);
  const [expandedAKey, setExpandedAKey] = useState<string | null>(null);

  // Validation before rendering
  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if (!currentMahadasha?.startDate || !currentMahadasha?.endDate) {
      errs.push('Current Mahadasha has missing dates');
    }
    if (new Date(currentMahadasha?.startDate).getTime() >= new Date(currentMahadasha?.endDate).getTime()) {
      errs.push('Current Mahadasha start date is after end date');
    }
    for (const m of allMahadashas) {
      if (isNaN(new Date(m.startDate).getTime()) || isNaN(new Date(m.endDate).getTime())) {
        errs.push(`Mahadasha ${m.planet} has invalid dates`);
      }
    }
    return errs;
  }, [currentMahadasha, allMahadashas]);

  const remainingMahadasha = calculateRemainingTime(currentMahadasha?.endDate);
  const remainingAntardasha = calculateRemainingTime(currentAntardasha?.endDate);
  const remainingPratyantar = currentPratyantardasha ? calculateRemainingTime(currentPratyantardasha.endDate) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Validation Warning if any date corrupted */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Timeline Warning: {validationErrors.join(' • ')}</span>
        </div>
      )}

      {/* Timezone Transparency Label */}
      <div className="flex flex-wrap items-center justify-between text-xs text-cosmic-muted border-b border-cosmic-border/60 pb-3 gap-2">
        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          Vimshottari 120-Year Planetary Cycles
        </span>
        <span className="font-mono text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          Dates shown in local birth timezone ({ianaTimeZone})
        </span>
      </div>

      {/* P0 REQUIREMENT: Comprehensive Active Dasha Banner */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-indigo-950/30 to-violet-950/40 p-6 shadow-glow-cyan/20 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Currently Active Dasha Hierarchy</span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
            Active Now
          </span>
        </div>

        {/* 3-Tier Grid + Remaining Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Level 1: Mahadasha */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cosmic-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              1. Current Mahadasha
            </span>
            <div className="text-lg font-black text-white font-display">
              {currentMahadasha?.planet}
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>Start: <strong className="text-white">{formatDashaDate(currentMahadasha?.startDate, ianaTimeZone)}</strong></div>
              <div>End: <strong className="text-white">{formatDashaDate(currentMahadasha?.endDate, ianaTimeZone)}</strong></div>
              <div>Span: <span className="text-cyan-300 font-mono font-semibold">{currentMahadasha?.durationYears?.toFixed(1)} years</span></div>
            </div>
          </div>

          {/* Level 2: Antardasha */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cosmic-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
              2. Current Antardasha
            </span>
            <div className="text-lg font-black text-violet-300 font-display">
              {currentMahadasha?.planet} / {currentAntardasha?.planet}
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>Start: <strong className="text-white">{formatDashaDate(currentAntardasha?.startDate, ianaTimeZone)}</strong></div>
              <div>End: <strong className="text-white">{formatDashaDate(currentAntardasha?.endDate, ianaTimeZone)}</strong></div>
              <div>Span: <span className="text-violet-300 font-mono font-semibold">{formatDurationBetween(currentAntardasha?.startDate, currentAntardasha?.endDate)}</span></div>
            </div>
          </div>

          {/* Level 3: Pratyantardasha */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cosmic-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              3. Current Pratyantardasha
            </span>
            <div className="text-lg font-black text-amber-300 font-display">
              {currentMahadasha?.planet} / {currentAntardasha?.planet} / {currentPratyantardasha?.planet || '—'}
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>Start: <strong className="text-white">{formatDashaDate(currentPratyantardasha?.startDate || currentAntardasha?.startDate, ianaTimeZone)}</strong></div>
              <div>End: <strong className="text-white">{formatDashaDate(currentPratyantardasha?.endDate || currentAntardasha?.endDate, ianaTimeZone)}</strong></div>
              <div>Span: <span className="text-amber-300 font-mono font-semibold">{currentPratyantardasha ? `${currentPratyantardasha.durationDays} days` : '—'}</span></div>
            </div>
          </div>

          {/* Time Remaining in Current Period */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-slate-900/90 border border-cyan-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Remaining Duration
            </span>
            <div className="text-sm font-extrabold text-white">
              {remainingAntardasha.isPast ? 'Antardasha Complete' : remainingAntardasha.text}
            </div>
            <div className="space-y-1 text-slate-300 text-[11px] pt-1 border-t border-slate-800">
              <div>In Sub-Period: <span className="text-cyan-300 font-semibold">{remainingAntardasha.text}</span></div>
              <div>In Major Cycle: <span className="text-slate-400">{remainingMahadasha.text}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Sequential 120-Year Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Complete Vimshottari Mahadashas &amp; Antardashas</span>
          </h4>
          <span className="text-[11px] text-cosmic-muted">
            Click any Mahadasha row to inspect nested Antardashas &amp; Pratyantardashas
          </span>
        </div>

        <div className="space-y-2">
          {allMahadashas.map((m, mIdx) => {
            const isCurrentM = m.planet === currentMahadasha?.planet;
            const isExpandedM = expandedMIndex === mIdx;

            return (
              <div
                key={`maha-${m.planet}-${mIdx}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCurrentM
                    ? 'border-cyan-500/70 bg-cosmic-surface/90 shadow-md shadow-cyan-500/10'
                    : 'border-cosmic-border bg-cosmic-surface/50 hover:border-cosmic-border/80'
                }`}
              >
                {/* Mahadasha Header Row */}
                <button
                  type="button"
                  onClick={() => setExpandedMIndex(isExpandedM ? null : mIdx)}
                  className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                        isCurrentM
                          ? 'bg-cyan-500 text-black shadow-glow-cyan'
                          : 'bg-cosmic-card text-cosmic-muted border border-cosmic-border'
                      }`}
                    >
                      {m.planet.substring(0, 2)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{m.planet} Mahadasha</span>
                        {isCurrentM && (
                          <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cosmic-muted font-mono mt-0.5">
                        {formatDashaDate(m.startDate, ianaTimeZone)} &mdash; {formatDashaDate(m.endDate, ianaTimeZone)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span className="text-xs text-cyan-400 font-mono font-bold">
                      {m.durationYears.toFixed(1)} yrs
                    </span>
                    {isExpandedM ? (
                      <ChevronUp className="w-4 h-4 text-cosmic-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cosmic-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded Antardashas */}
                {isExpandedM && m.antardashas && (
                  <div className="p-4 border-t border-cosmic-border/40 bg-slate-950/60 space-y-2.5">
                    <div className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider px-1">
                      Antardashas under {m.planet} Mahadasha ({m.antardashas.length} sub-periods)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {m.antardashas.map((a, aIdx) => {
                        const isSubActive = isCurrentM && a.planet === currentAntardasha?.planet;
                        const aKey = `${m.planet}-${a.planet}-${aIdx}`;
                        const isExpandedA = expandedAKey === aKey;

                        return (
                          <div
                            key={aKey}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              isSubActive
                                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                                : 'border-cosmic-border/60 bg-cosmic-surface/80 text-cosmic-text hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>
                                {m.planet} / {a.planet}
                              </span>
                              {isSubActive && (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                  Current
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-cosmic-muted mt-1 space-y-0.5 font-mono">
                              <div>Start: {formatDashaDate(a.startDate, ianaTimeZone)}</div>
                              <div>End: {formatDashaDate(a.endDate, ianaTimeZone)}</div>
                              <div className="text-cyan-400/90 font-semibold pt-0.5">
                                Duration: {formatDurationBetween(a.startDate, a.endDate)}
                              </div>
                            </div>

                            {/* Pratyantardasha toggle */}
                            {a.pratyantardashas && a.pratyantardashas.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedAKey(isExpandedA ? null : aKey)}
                                className="w-full mt-2 pt-1.5 border-t border-cosmic-border/40 text-[10px] font-semibold text-cosmic-muted hover:text-cyan-300 flex items-center justify-between"
                              >
                                <span>Level 3 (Pratyantar)</span>
                                {isExpandedA ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}

                            {/* Expanded Pratyantardashas */}
                            {isExpandedA && a.pratyantardashas && (
                              <div className="mt-2 pt-2 border-t border-cosmic-border/40 space-y-1.5 bg-slate-900/60 p-2 rounded-lg">
                                {a.pratyantardashas.map((p, pIdx) => {
                                  const isPratyActive = isSubActive && p.planet === currentPratyantardasha?.planet;
                                  return (
                                    <div
                                      key={`p-${aKey}-${p.planet}-${pIdx}`}
                                      className={`p-1.5 rounded flex items-center justify-between text-[10px] ${
                                        isPratyActive ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-300'
                                      }`}
                                    >
                                      <span>{p.planet}</span>
                                      <span className="font-mono text-slate-400">
                                        {formatDashaDate(p.startDate, ianaTimeZone)} ({p.durationDays}d)
                                      </span>
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
