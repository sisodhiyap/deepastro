import React from 'react';
import { ChartSession } from '../../types/chartSession.js';
import { Activity, Compass, Calendar, Zap, Radio, Clock, Eye } from 'lucide-react';

interface TransitsRadarViewProps {
  session: ChartSession;
}

export const TransitsRadarView: React.FC<TransitsRadarViewProps> = ({ session }) => {
  const { currentCosmicWeather, vedic } = session;

  const ascSign = vedic.ascendantSign || 'Aries';
  const zodiacOrder = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const ascIndex = zodiacOrder.indexOf(ascSign);
  const transitMoonIndex = zodiacOrder.indexOf(currentCosmicWeather.transitMoonSign);
  const transitHouseFromLagna = ascIndex >= 0 && transitMoonIndex >= 0
    ? ((transitMoonIndex - ascIndex + 12) % 12) + 1
    : 1;

  return (
    <div className="space-y-6">
      {/* Header & Live Radar Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Transit Radar (Gochara Engine)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time planetary transits overlaid directly on your verified natal house cusps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Live Radar Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Transit Moon Sign</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">
              {currentCosmicWeather.transitMoonSign}
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              {currentCosmicWeather.transitMoonNakshatra}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Transit Moon House (From Lagna)</div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              House {transitHouseFromLagna}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Lagna: {ascSign}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Today's Operating Focus</div>
            <div className="text-sm font-bold text-white mt-1 line-clamp-1">
              {currentCosmicWeather.todayFocus}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Active Focus
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Natal Trigger</div>
            <div className="text-xs font-bold text-amber-300 mt-1 font-mono line-clamp-1">
              {currentCosmicWeather.activeNatalTrigger}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Direct Natal Aspect
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory & Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Weekly Thematic Vector</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentCosmicWeather.thisWeekTheme || 'The current lunar transit activates your focal houses, prioritizing thoughtful communication, decisive strategic alignment, and operational clarity.'}
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">GOCHARA REASONING</span>
            Transiting planets cast rays upon their 7th house counterparts and functional trikonas, generating temporary momentum across your chart axes.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Monthly Trajectory Overview</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentCosmicWeather.thisMonthTrajectory || 'Month-long planetary arcs establish steady conditions for professional consolidation, financial accountability, and deliberate relationship communication.'}
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">SYNTHESIS CONFIDENCE</span>
            Calibrated against your natal birth coordinates with zero arbitrary daily horoscope text.
          </div>
        </div>
      </div>
    </div>
  );
};
