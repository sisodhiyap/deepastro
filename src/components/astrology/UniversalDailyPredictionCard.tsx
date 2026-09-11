import React, { useState, useEffect } from 'react';
import { DailyPredictionCardData } from '../../../server/src/astrology/DailyPredictionEngine';
import { getBirthProfile, getCalculatedChart, onChartUpdated } from '../../utils/birthStorage';

interface Props {
  onOpenFullHoroscope?: () => void;
  onSwitchProfile?: () => void;
  overrideDate?: Date;
}

// 12 Classical Zodiac Constellation & Avatar Artwork Glyphs
const ZODIAC_AVATARS: Record<string, {
  svgPath: string;
  gradient: [string, string];
  glowColor: string;
}> = {
  Aries: {
    svgPath: 'M12 4c-3.5 0-6.5 2.5-7.5 6-1-1.5-1.5-3.5-1.5-5.5C3 3 2 3 2 4.5c0 4 3 8 7 8 1 0 2-.5 3-1.5 1 1 2 1.5 3 1.5 4 0 7-4 7-8 0-1.5-1-1.5-1-1.5 0 2-.5 4-1.5 5.5-1-3.5-4-6-7.5-6z',
    gradient: ['#F59E0B', '#EF4444'],
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  Taurus: {
    svgPath: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0-5C8 2 5 4.5 5 8c0 1 .5 2 1 3a7 7 0 0112 0c.5-1 1-2 1-3 0-3.5-3-6-7-6z',
    gradient: ['#10B981', '#059669'],
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  Gemini: {
    svgPath: 'M7 3h10v2H7V3zm2 4h2v10H9V7zm4 0h2v10h-2V7zm-6 12h10v2H7v-2z',
    gradient: ['#06B6D4', '#3B82F6'],
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  Cancer: {
    svgPath: 'M8 6a4 4 0 100 8c2.5 0 4-1.5 5-3a6 6 0 01-5-5zm8 12a4 4 0 100-8c-2.5 0-4 1.5-5 3a6 6 0 015 5z',
    gradient: ['#E2E8F0', '#94A3B8'],
    glowColor: 'rgba(226, 232, 240, 0.4)',
  },
  Leo: {
    svgPath: 'M8 9a4 4 0 118 0c0 2-1.5 3.5-3 4.5 1.5 1 3 2.5 3 4.5a3 3 0 11-6 0c0-1.5 1-2.5 2-3.5-1.5-1-4-2-4-5.5z',
    gradient: ['#FBBF24', '#D97706'],
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  Virgo: {
    svgPath: 'M6 4v11a3 3 0 006 0V4h2v11a5 5 0 01-10 0V4h2zm8 0v8a3 3 0 006 0V4h-2v8a1 1 0 11-2 0V4h-2z',
    gradient: ['#10B981', '#047857'],
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  Libra: {
    svgPath: 'M4 17h16v2H4v-2zm8-13a6 6 0 00-6 6h3a3 3 0 016 0h3a6 6 0 00-6-6zm-8 8h16v2H4v-2z',
    gradient: ['#38BDF8', '#818CF8'],
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  Scorpio: {
    svgPath: 'M5 4v11a3 3 0 006 0V4h2v11a3 3 0 006 0V4h-2v11a1 1 0 11-2 0V4h-2v11a1 1 0 11-2 0V4H5zm14 11l3 3-1.5 1.5L19 18v-3z',
    gradient: ['#DC2626', '#991B1B'],
    glowColor: 'rgba(220, 38, 38, 0.4)',
  },
  Sagittarius: {
    svgPath: 'M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14V4zM5 19l6-6 1.4 1.4-6 6H5v-1.4z',
    gradient: ['#FACC15', '#EA580C'],
    glowColor: 'rgba(250, 204, 21, 0.4)',
  },
  Capricorn: {
    svgPath: 'M6 5a3 3 0 016 0v7a2 2 0 004 0V9a2 2 0 114 0v3a4 4 0 01-8 0V5a1 1 0 00-2 0v11H6V5z',
    gradient: ['#3B82F6', '#1E3A8A'],
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  Aquarius: {
    svgPath: 'M3 8l3-3 4 4 4-4 4 4 3-3v2.8l-3 3-4-4-4 4-4-4-3 3V8zm0 7l3-3 4 4 4-4 4 4 3-3v2.8l-3 3-4-4-4 4-4-4-3 3V15z',
    gradient: ['#06B6D4', '#2563EB'],
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  Pisces: {
    svgPath: 'M6 4c2 3 3 6.5 3 10s-1 7-3 10h2c2-3 3-6.5 3-10s-1-7-3-10H6zm12 0c-2 3-3 6.5-3 10s1 7 3 10h-2c-2-3-3-6.5-3-10s1-7 3-10h2zM4 13h16v2H4v-2z',
    gradient: ['#14B8A6', '#8B5CF6'],
    glowColor: 'rgba(20, 184, 166, 0.4)',
  },
};

export const UniversalDailyPredictionCard: React.FC<Props> = ({
  onOpenFullHoroscope,
  onSwitchProfile,
  overrideDate,
}) => {
  const [cardData, setCardData] = useState<DailyPredictionCardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = getBirthProfile();

      const res = await fetch('/api/astrology/predictions/daily-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(profile || {}),
          targetDate: overrideDate ? overrideDate.toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.card) {
        setCardData(data.card);
      } else {
        throw new Error(data.details?.[0] || data.error || 'Failed to calculate daily card');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
    const unsub = onChartUpdated(() => {
      fetchCard();
    });
    return unsub;
  }, [overrideDate]);

  if (loading) {
    return (
      <div className="w-full rounded-[28px] bg-[#07080D] border border-cyan-500/20 p-8 shadow-2xl flex flex-col items-center justify-center min-h-[480px]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-wide text-cyan-200">
          Calculating Ephemeris & Synthesizing Daily Prediction...
        </p>
        <p className="text-xs text-slate-500 mt-1">Grounding with natal Kundli and live transits</p>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="w-full rounded-[28px] bg-[#07080D] border border-rose-500/20 p-8 shadow-2xl flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3 text-xl">
          ⚠️
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">Calculation Offline</h3>
        <p className="text-xs text-slate-400 max-w-md mb-4">{error || 'Unable to compute prediction card'}</p>
        <button
          onClick={fetchCard}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
        >
          Retry Calculation
        </button>
      </div>
    );
  }

  const { identity, scores, luckyElements, planetaryInfluences, auspiciousTimings, advice, affirmation, mantra, aiInsight, header, mainPrediction } = cardData;
  const avatar = ZODIAC_AVATARS[identity.zodiacSign] || ZODIAC_AVATARS['Aries'];

  return (
    <div
      className="relative w-full rounded-[28px] md:rounded-[32px] overflow-hidden text-slate-100 font-sans shadow-[0_12px_60px_-15px_rgba(0,0,0,0.8)] border border-cyan-500/25 transition-all duration-300"
      style={{
        background: 'radial-gradient(130% 100% at 50% 0%, #0F172A 0%, #06070A 50%, #030406 100%)',
      }}
    >
      {/* Background Starfield & Subtle Nebulae */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Card Content */}
      <div className="relative z-10 p-5 md:p-8 lg:p-9 flex flex-col gap-6">

        {/* 1. TOP BRANDING BAR */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              <span className="text-white text-sm">☽</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                  DeepAstro
                </span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/50">
                  TM
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 block mt-0.5 font-medium">
                Discover a Brighter You
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] md:text-[11px] font-semibold tracking-widest uppercase text-slate-400">
              Astrology • AI • A Brighter Tomorrow
            </span>
          </div>
        </div>

        {/* 2. HERO SECTION: ZODIAC MEDALLION + MAIN PREDICTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* Left Zodiac Medallion Column (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col items-center text-center justify-center p-4">
            {/* Celestial Circular Medallion */}
            <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center">
              {/* Outer Radiance Ring */}
              <div
                className="absolute inset-0 rounded-full border border-amber-400/30 animate-[spin_60s_linear_infinite]"
                style={{
                  boxShadow: `0 0 35px ${avatar.glowColor}`,
                }}
              />
              {/* Secondary Concentric Ring */}
              <div className="absolute inset-2 rounded-full border border-amber-500/20 border-dashed animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Inner Cosmic Disc */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#030712] border-2 border-amber-400/60 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                {/* Micro Star Flare */}
                <div className="absolute top-2 right-6 w-1 h-1 bg-amber-200 rounded-full shadow-[0_0_8px_#FDE047]" />
                <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-cyan-200 rounded-full shadow-[0_0_8px_#38BDF8]" />

                {/* Zodiac SVG Avatar */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]"
                    style={{
                      color: avatar.gradient[0],
                    }}
                  >
                    <path d={avatar.svgPath} />
                  </svg>
                </div>

                {/* Symbol Glyphs */}
                <span className="text-xl md:text-2xl text-amber-300/80 font-serif">
                  {identity.zodiacSymbol}
                </span>
              </div>
            </div>

            {/* Zodiac Name & Trait Details */}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-3 font-serif">
              {identity.zodiacSign}
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
              {identity.dateRange}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300/90 font-medium mt-1">
              {identity.traits.map((t, idx) => (
                <React.Fragment key={t}>
                  <span>{t}</span>
                  {idx < identity.traits.length - 1 && <span className="text-slate-600">•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Switch Profile / Chart Button */}
            <button
              onClick={onSwitchProfile}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-cyan-500/40 transition shadow-sm"
            >
              <span>⇄</span> Change Sign / Profile
            </button>
          </div>

          {/* Right Main Prediction Column (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Header with Sun Icon & Date Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl text-amber-400">☀️</span>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {header.title}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-slate-300">
                  🗓️ {header.formattedDate}
                </div>
                <div className="text-[11px] text-cyan-300/90 flex items-center gap-1 justify-end">
                  <span>{header.moonPhase}</span>
                </div>
              </div>
            </div>

            {/* Motto */}
            <p className="text-xs italic text-slate-400 font-serif -mt-2">
              "{header.motto}"
            </p>

            {/* Main Personalized Narrative */}
            <p className="text-sm md:text-[14.5px] leading-relaxed text-slate-200 font-normal">
              {mainPrediction.predictionText}
            </p>

            {/* Category Score Cards + Today's Vibe */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-1">
              
              {/* Overall Score */}
              <div className="rounded-2xl p-3 bg-[#131926] border border-emerald-500/20 flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="text-amber-400">★</span> Overall
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {scores.overall.score}<span className="text-xs text-slate-400 font-normal">/10</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_8px_#10B981]"
                    style={{ width: `${scores.overall.score * 10}%` }}
                  />
                </div>
              </div>

              {/* Love Score */}
              <div className="rounded-2xl p-3 bg-[#131926] border border-pink-500/20 flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-1.5 text-xs text-pink-400 font-medium">
                  <span>♥</span> Love
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {scores.love.score}<span className="text-xs text-slate-400 font-normal">/10</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full shadow-[0_0_8px_#EC4899]"
                    style={{ width: `${scores.love.score * 10}%` }}
                  />
                </div>
              </div>

              {/* Career Score */}
              <div className="rounded-2xl p-3 bg-[#131926] border border-cyan-500/20 flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                  <span>▣</span> Career
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {scores.career.score}<span className="text-xs text-slate-400 font-normal">/10</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_#06B6D4]"
                    style={{ width: `${scores.career.score * 10}%` }}
                  />
                </div>
              </div>

              {/* Health Score */}
              <div className="rounded-2xl p-3 bg-[#131926] border border-emerald-500/20 flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span>✦</span> Health
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {scores.health.score}<span className="text-xs text-slate-400 font-normal">/10</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_8px_#34D399]"
                    style={{ width: `${scores.health.score * 10}%` }}
                  />
                </div>
              </div>

              {/* Today's Vibe Mini-Card */}
              <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-2xl p-3 bg-gradient-to-br from-[#2E1065]/50 to-[#170E38]/80 border border-purple-500/30 flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                  <span className="text-pink-400 text-sm">🪷</span> Today's Vibe
                </div>
                <div className="text-[11px] text-purple-200 mt-1.5 leading-tight space-y-0.5">
                  {cardData.vibe.keywords.map((k) => (
                    <div key={k} className="font-medium">• {k}</div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3. MIDDLE ROW: LUCKY ELEMENTS + PLANETARY INFLUENCE + AUSPICIOUS TIMINGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">

          {/* Lucky Elements */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
              <span>★</span> Lucky Elements
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Color */}
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full shadow-md border border-white/20 mb-1.5"
                  style={{ backgroundColor: luckyElements.color.hex, boxShadow: `0 0 10px ${luckyElements.color.hex}` }}
                />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Color</span>
                <span className="text-xs font-bold text-white truncate max-w-full">{luckyElements.color.name}</span>
              </div>
              {/* Number */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs shadow-[0_0_10px_#06B6D4] mb-1.5">
                  {luckyElements.number}
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Number</span>
                <span className="text-xs font-bold text-white">{luckyElements.number}</span>
              </div>
              {/* Gemstone */}
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full shadow-md border border-amber-300/30 mb-1.5 flex items-center justify-center text-xs"
                  style={{ backgroundColor: luckyElements.gemstone.hex, boxShadow: `0 0 10px ${luckyElements.gemstone.hex}` }}
                >
                  💎
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Gemstone</span>
                <span className="text-xs font-bold text-white truncate max-w-[70px]">{luckyElements.gemstone.name.split('/')[0].trim()}</span>
              </div>
              {/* Metal */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-400 text-slate-200 font-bold flex items-center justify-center text-xs shadow-md mb-1.5">
                  🪙
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Metal</span>
                <span className="text-xs font-bold text-white truncate max-w-[70px]">{luckyElements.metal.name.split('/')[0].trim()}</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 text-center mt-3 italic">
              Traditional Astrological Association
            </div>
          </div>

          {/* Planetary Influence */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">
              <span>✦</span> Planetary Influence
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {planetaryInfluences.slice(0, 4).map((p) => (
                <div key={p.planet} className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full shadow-lg border border-white/20 mb-1.5"
                    style={{
                      backgroundColor: p.color,
                      boxShadow: `0 0 10px ${p.color}`,
                    }}
                  />
                  <span className="text-xs font-bold text-white">{p.planet}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${p.status === 'Neutral' ? 'text-slate-400' : 'text-emerald-400'}`}>
                    {p.status} {p.direction}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 text-center mt-3">
              Top Gochara Transits & Dasha Lords
            </div>
          </div>

          {/* Auspicious Timings */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              <span>🕒</span> Auspicious Timings
            </div>
            <div className="space-y-2">
              {auspiciousTimings.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-200">{t.window}</span>
                  <span className="text-[11px] text-slate-400 text-right truncate ml-2 max-w-[130px]" title={t.label}>
                    {t.label.split('&')[0].trim()}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 text-right mt-2">
              Local solar calculation (Panchang)
            </div>
          </div>

        </div>

        {/* 4. BOTTOM ROW: TODAY'S ADVICE + AFFIRMATION + TODAY'S MANTRA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Today's Advice */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5">
              <span>💡</span> Today's Advice
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {advice.slice(0, 4).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 text-xs leading-tight mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Affirmation Card with Botanical Leaf Accent */}
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-[#064E3B]/30 to-[#022C22]/50 border border-emerald-500/40 shadow-md flex flex-col justify-between overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
              <span>💚</span> Affirmation
            </div>
            <p className="text-xs md:text-sm italic font-serif text-emerald-100/90 leading-relaxed z-10 my-auto">
              {affirmation}
            </p>
            {/* Watermark leaf */}
            <div className="absolute -bottom-4 -right-4 text-emerald-500/20 text-7xl select-none pointer-events-none">
              🌿
            </div>
          </div>

          {/* Today's Mantra Card with Sunset Meditator Silhouette */}
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-[#7C2D12]/40 via-[#451A03]/60 to-[#18181B] border border-amber-500/40 shadow-md flex flex-col justify-between overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 z-10">
              <span className="text-sm">ॐ</span> Today's Mantra
            </div>

            <div className="my-auto z-10 text-center">
              <div className="text-base font-bold text-amber-300 font-serif">
                {mantra.sanskrit}
              </div>
              <div className="text-xs text-orange-200/90 font-medium italic mt-0.5">
                {mantra.transliteration}
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                {mantra.purpose}
              </p>
            </div>

            {/* Meditator Silhouette Background Effect */}
            <div className="absolute right-2 bottom-1 opacity-25 text-5xl select-none pointer-events-none">
              🧘
            </div>
          </div>

        </div>

        {/* 5. FOOTER: AI INSIGHT BAR & VIEW FULL HOROSCOPE */}
        <div className="rounded-2xl p-3.5 bg-[#0C101B] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-xs shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              ✦
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-300 mr-2 uppercase tracking-wide">
                AI Insight
              </span>
              <span className="text-xs text-slate-300 italic">
                {aiInsight.text}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenFullHoroscope}
            className="w-full md:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>View Full Horoscope</span>
            <span>→</span>
          </button>
        </div>

        {/* 6. SUBTLE FOOTER METADATA */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
          <span>DeepAstro | AI-Powered Astrology. For a Better You.</span>
          <span>Explore • Understand • Evolve</span>
        </div>

      </div>
    </div>
  );
};
