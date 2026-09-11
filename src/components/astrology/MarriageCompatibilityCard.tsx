import React, { useState } from 'react';
import { MarriageCompatibilityReport } from '../../../server/src/astrology/MarriageCompatibilityEngine';

interface Props {
  report: MarriageCompatibilityReport;
  onPrint?: () => void;
}

export const MarriageCompatibilityCard: React.FC<Props> = ({ report, onPrint }) => {
  const [showKootas, setShowKootas] = useState(false);
  const [showDiscussionTopics, setShowDiscussionTopics] = useState(false);

  const isFavorable = report.state === 'favorable' || report.overallScore >= 60;
  const { partnerA, partnerB, keyMetrics, dimensions, deepDive, matchResult, branding } = report;

  return (
    <div
      className={`relative w-full rounded-[28px] md:rounded-[32px] overflow-hidden text-slate-100 font-sans shadow-[0_12px_60px_-15px_rgba(0,0,0,0.8)] border transition-all duration-300 ${
        isFavorable
          ? 'border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(0,229,255,0.15)]'
          : 'border-rose-500/30 shadow-[0_0_50px_-12px_rgba(244,63,94,0.15)]'
      }`}
      style={{
        background: isFavorable
          ? 'radial-gradient(130% 100% at 50% 0%, #0F172A 0%, #06070A 50%, #030406 100%)'
          : 'radial-gradient(130% 100% at 50% 0%, #1F0E16 0%, #080306 50%, #020103 100%)',
      }}
    >
      {/* Subtle Starfield & Celestial Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          background: isFavorable ? 'rgba(6, 182, 212, 0.12)' : 'rgba(244, 63, 94, 0.12)',
        }}
      />

      <div className="relative z-10 p-5 md:p-8 lg:p-9 flex flex-col gap-6">

        {/* 1. TOP HEADER BRANDING */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg"
              style={{
                background: isFavorable
                  ? 'linear-gradient(135deg, #06B6D4, #2563EB)'
                  : 'linear-gradient(135deg, #F43F5E, #7C2D12)',
                boxShadow: isFavorable ? '0 0 14px rgba(6,182,212,0.6)' : '0 0 14px rgba(244,63,94,0.6)',
              }}
            >
              <span className="text-white text-sm">☽</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                  DeepAstro
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border"
                  style={{
                    color: isFavorable ? '#00E5FF' : '#F43F5E',
                    borderColor: isFavorable ? 'rgba(0,229,255,0.4)' : 'rgba(244,63,94,0.4)',
                    background: isFavorable ? 'rgba(0,229,255,0.1)' : 'rgba(244,63,94,0.1)',
                  }}
                >
                  {isFavorable ? 'SOULS ALIGNED' : 'DIFFERENT PATHS'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic font-serif block mt-0.5">
                {branding.quote}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] md:text-xs font-semibold tracking-wide uppercase text-slate-400">
              {branding.subHeader}
            </span>
          </div>
        </div>

        {/* 2. HERO CINEMATIC ARTWORK & FLOATING BADGE */}
        <div
          className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border flex flex-col items-center justify-center py-10 px-4 min-h-[220px] md:min-h-[260px] shadow-2xl"
          style={{
            borderColor: isFavorable ? 'rgba(0,229,255,0.25)' : 'rgba(244,63,94,0.25)',
            background: isFavorable
              ? 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(6,11,25,0.95) 100%)'
              : 'linear-gradient(180deg, rgba(35,10,18,0.8) 0%, rgba(12,3,6,0.95) 100%)',
          }}
        >
          {/* Floating Overall Compatibility Badge (Top Right) */}
          <div className="absolute top-4 right-4 z-20">
            <div
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-center p-2 shadow-2xl border"
              style={{
                background: isFavorable
                  ? 'radial-gradient(circle, #0F2D3D 0%, #03141F 100%)'
                  : 'radial-gradient(circle, #380C14 0%, #170407 100%)',
                borderColor: isFavorable ? '#00E5FF' : '#F43F5E',
                boxShadow: isFavorable ? '0 0 20px rgba(0,229,255,0.4)' : '0 0 20px rgba(244,63,94,0.4)',
              }}
            >
              <span className="text-xl md:text-2xl font-black text-white leading-none">
                {report.overallScore}%
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-300 font-semibold uppercase tracking-tight mt-1 leading-tight">
                Overall Compatibility
              </span>
            </div>
          </div>

          {/* Cinematic SVG Artwork: Garland Exchange vs Back-to-Back */}
          <div className="relative flex flex-col items-center justify-center my-auto z-10">
            {isFavorable ? (
              // Favorable Wedding Garland Exchange Artwork
              <div className="relative w-48 h-32 md:w-64 md:h-36 flex items-center justify-center">
                {/* Celestial Zodiac Wheel in background */}
                <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-[spin_100s_linear_infinite]" />
                
                {/* Temple Pillars Silhouette SVG */}
                <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                  {/* Temple Mandap Arch */}
                  <path d="M 20 90 L 20 30 Q 100 0 180 30 L 180 90" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />
                  {/* Garland Floral Loop in Gold/Red */}
                  <path d="M 65 50 Q 100 85 135 50" fill="none" stroke="#F43F5E" strokeWidth="4" strokeDasharray="3 3" />
                  <path d="M 65 50 Q 100 85 135 50" fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="2 4" />
                  {/* Groom Figure Left */}
                  <circle cx="60" cy="35" r="14" fill="#0EA5E9" fillOpacity="0.8" />
                  <path d="M 45 60 Q 60 48 75 60 L 75 90 L 45 90 Z" fill="#38BDF8" fillOpacity="0.5" />
                  <rect x="52" y="24" width="16" height="6" rx="2" fill="#F59E0B" />
                  {/* Bride Figure Right */}
                  <circle cx="140" cy="37" r="13" fill="#EC4899" fillOpacity="0.8" />
                  <path d="M 125 60 Q 140 48 155 60 L 155 90 L 125 90 Z" fill="#F43F5E" fillOpacity="0.5" />
                  <path d="M 130 24 Q 140 20 150 24 L 140 30 Z" fill="#FBBF24" />
                  {/* Star Sparkles */}
                  <circle cx="100" cy="40" r="2" fill="#FDE047" className="animate-ping" />
                  <circle cx="90" cy="20" r="1.5" fill="#38BDF8" />
                  <circle cx="110" cy="22" r="1.5" fill="#F472B6" />
                </svg>
              </div>
            ) : (
              // Challenging Back-to-Back Artwork
              <div className="relative w-48 h-32 md:w-64 md:h-36 flex items-center justify-center">
                {/* Lightning / Split Line */}
                <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  {/* Broken Celestial Arch */}
                  <path d="M 20 90 L 20 35 Q 70 10 95 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
                  <path d="M 180 90 L 180 35 Q 130 10 105 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
                  {/* Lightning Crack in Center */}
                  <path d="M 100 5 L 96 35 L 104 50 L 97 75 L 101 95" fill="none" stroke="#FBBF24" strokeWidth="2.5" className="animate-pulse" />
                  {/* Groom Left Facing Away */}
                  <circle cx="65" cy="38" r="14" fill="#64748B" fillOpacity="0.8" />
                  <path d="M 50 62 Q 65 52 80 62 L 80 90 L 50 90 Z" fill="#475569" fillOpacity="0.6" />
                  <rect x="56" y="27" width="16" height="5" rx="2" fill="#D97706" />
                  {/* Bride Right Facing Away */}
                  <circle cx="135" cy="40" r="13" fill="#991B1B" fillOpacity="0.8" />
                  <path d="M 120 62 Q 135 52 150 62 L 150 90 L 120 90 Z" fill="#7F1D1D" fillOpacity="0.6" />
                </svg>
              </div>
            )}
          </div>

          {/* Match Result Banner Text */}
          <div className="mt-2 text-center z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>{matchResult.centerIcon}</span>
              <span>Match Result</span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mt-0.5"
              style={{
                color: matchResult.color,
                textShadow: `0 0 20px ${matchResult.color}60`,
              }}
            >
              {matchResult.headline}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium mt-0.5">
              {matchResult.subHeadline}
            </p>
          </div>
        </div>

        {/* 3. PROFILES BAR: GROOM & BRIDE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center rounded-2xl p-4 bg-[#0F1420] border border-slate-800">

          {/* Groom Profile (md:col-span-5) */}
          <div className="md:col-span-5 flex items-center gap-3.5">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-cyan-400/80 bg-cyan-950/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <span className="text-xl md:text-2xl">🤵</span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center">
                ♂
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm md:text-base font-bold text-white truncate">
                {partnerA.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {partnerA.birthDate}, {partnerA.birthTime}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {partnerA.birthPlace}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium mt-0.5">
                <span>{partnerA.zodiacGlyph} {partnerA.ascendantSign}</span>
                <span className="text-slate-600">•</span>
                <span>{partnerA.nakshatra}</span>
              </div>
            </div>
          </div>

          {/* Center Connection (md:col-span-1) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2 text-center">
            <span className="text-2xl">{matchResult.centerIcon}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5 leading-tight font-medium max-w-[70px]">
              {matchResult.centerMotto}
            </span>
          </div>

          {/* Bride Profile (md:col-span-5) */}
          <div className="md:col-span-5 flex items-center justify-end gap-3.5 text-right">
            <div className="min-w-0 order-1 md:order-1">
              <h4 className="text-sm md:text-base font-bold text-white truncate">
                {partnerB.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {partnerB.birthDate}, {partnerB.birthTime}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {partnerB.birthPlace}
              </p>
              <div className="flex items-center justify-end gap-1.5 text-[11px] text-pink-300 font-medium mt-0.5">
                <span>{partnerB.zodiacGlyph} {partnerB.ascendantSign}</span>
                <span className="text-slate-600">•</span>
                <span>{partnerB.nakshatra}</span>
              </div>
            </div>
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-pink-400/80 bg-pink-950/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(236,72,153,0.4)] order-2">
              <span className="text-xl md:text-2xl">👰</span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-black text-[10px] font-black flex items-center justify-center">
                ♀
              </span>
            </div>
          </div>

        </div>

        {/* 4. KEY METRICS ROW (Ashtakoota, Mangal Dosha, Nadi) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

          {/* Ashtakoota */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span>✦</span> Ashtakoota Matching
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-2xl font-black text-white font-mono">
                {keyMetrics.ashtakoota.score}
              </span>
              <span className="text-sm text-slate-400">/ {keyMetrics.ashtakoota.maxScore}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(keyMetrics.ashtakoota.score / 36.0) * 100}%`,
                  backgroundColor: keyMetrics.ashtakoota.color,
                  boxShadow: `0 0 10px ${keyMetrics.ashtakoota.color}`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
              <span>Status:</span>
              <span style={{ color: keyMetrics.ashtakoota.color }}>
                {keyMetrics.ashtakoota.verdict}
              </span>
            </div>
          </div>

          {/* Mangal Dosha */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span>🛡️</span> Mangal Dosha
              </span>
            </div>
            <div className="my-2">
              <span
                className="inline-flex items-center gap-1.5 text-base font-bold px-2.5 py-1 rounded-xl border"
                style={{
                  color: keyMetrics.mangalDosha.badgeColor,
                  borderColor: `${keyMetrics.mangalDosha.badgeColor}40`,
                  backgroundColor: `${keyMetrics.mangalDosha.badgeColor}15`,
                }}
              >
                {keyMetrics.mangalDosha.isBalanced ? '✓' : '⚠️'} {keyMetrics.mangalDosha.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {keyMetrics.mangalDosha.description}
            </p>
          </div>

          {/* Nadi Compatibility */}
          <div className="rounded-2xl p-4 bg-[#111726] border border-slate-800 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span>🧬</span> Nadi Compatibility
              </span>
            </div>
            <div className="my-2">
              <span
                className="inline-flex items-center gap-1.5 text-base font-bold px-2.5 py-1 rounded-xl border"
                style={{
                  color: keyMetrics.nadiCompatibility.badgeColor,
                  borderColor: `${keyMetrics.nadiCompatibility.badgeColor}40`,
                  backgroundColor: `${keyMetrics.nadiCompatibility.badgeColor}15`,
                }}
              >
                {keyMetrics.nadiCompatibility.isCompatible ? '✓ Compatible' : '❌ Not Compatible'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {keyMetrics.nadiCompatibility.description}
            </p>
          </div>

        </div>

        {/* 5. RELATIONSHIP DIMENSION PILLS (Emotional, Mental, Physical, Financial, Spiritual, Family) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {dimensions.map((dim) => (
            <div
              key={dim.name}
              className="rounded-2xl p-3 bg-[#111726] border border-slate-800 flex flex-col justify-between shadow-md"
            >
              <div
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: dim.color }}
              >
                <span>{dim.icon === 'Heart' ? '♥' : dim.icon === 'Brain' ? '🧠' : dim.icon === 'Coins' ? '💰' : dim.icon === 'Flower2' ? '🪷' : dim.icon === 'Home' ? '🏠' : '✨'}</span>
                <span className="truncate">{dim.name}</span>
              </div>
              <div className="text-xl font-bold text-white mt-1.5 font-mono">
                {dim.score}<span className="text-xs text-slate-400 font-normal">/10</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${dim.score * 10}%`,
                    backgroundColor: dim.color,
                    boxShadow: `0 0 8px ${dim.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 6. DEEP DIVE: FAVORABLE vs CHALLENGING PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Main Core Breakdown Panel (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-2xl p-4 md:p-5 bg-[#111726] border border-slate-800 shadow-lg flex flex-col justify-between">
            {isFavorable ? (
              // Favorable: Why This Marriage Works
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">
                  <span>✦</span> Why This Marriage Works
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {deepDive.whyItWorks?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              // Challenging: Potential Challenges
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">
                  <span>❌</span> Potential Challenges
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {deepDive.potentialChallenges?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Secondary Outcome & Advice Panel (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {isFavorable ? (
              <>
                {/* Life Outlook Together */}
                <div className="relative rounded-2xl p-4 bg-gradient-to-br from-[#064E3B]/30 to-[#022C22]/50 border border-emerald-500/40 shadow-md flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    <span>✨</span> Life Outlook Together
                  </div>
                  <p className="text-xs md:text-sm italic font-serif text-emerald-100/90 leading-relaxed z-10 my-auto">
                    {deepDive.lifeOutlook}
                  </p>
                  <div className="absolute -bottom-3 -right-3 text-emerald-500/20 text-6xl select-none pointer-events-none">
                    🌿
                  </div>
                </div>

                {/* Verdict */}
                <div className="rounded-2xl p-3.5 bg-[#0C121E] border border-cyan-500/30 flex items-center gap-3 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✔
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                      Verdict
                    </span>
                    <span className="text-xs text-slate-300">
                      {deepDive.verdict}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Possible Effects If Ignored */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-[#451A03]/40 to-[#18181B] border border-amber-500/30 shadow-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                    <span>⚠️</span> Possible Effects If Ignored
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {deepDive.possibleEffectsIfIgnored?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation */}
                <div className="rounded-2xl p-3.5 bg-[#170E16] border border-rose-500/30 flex items-start gap-3 shadow-md">
                  <span className="text-xl">🪷</span>
                  <div>
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                      Recommendation
                    </span>
                    <span className="text-xs text-slate-300 leading-relaxed">
                      {deepDive.recommendations}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* 7. INTERACTIVE DRAWERS & EXPANDABLES */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowKootas(!showKootas)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-cyan-500/40 transition"
            >
              {showKootas ? 'Hide 8-Koota Breakdown' : 'View 8-Koota Breakdown (36 Gunas)'}
            </button>

            <button
              onClick={() => setShowDiscussionTopics(!showDiscussionTopics)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-cyan-500/40 transition"
            >
              {showDiscussionTopics ? 'Hide Discussion Topics' : 'What To Discuss Before Marriage'}
            </button>
          </div>

          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition flex items-center gap-1.5"
            >
              <span>📄 Download Compatibility Dossier</span>
            </button>
          )}
        </div>

        {/* 8-Koota Breakdown Accordion */}
        {showKootas && (
          <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Detailed 36 Guna Ashtakoota Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {report.kootas.map((k) => (
                <div key={k.name} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate">{k.name.split('(')[0]}</span>
                    <span className="font-mono text-cyan-300 font-bold">{k.obtainedPoints}/{k.maxPoints}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{k.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-Marital Discussion Topics Accordion */}
        {showDiscussionTopics && (
          <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 space-y-2.5 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Crucial Conversations Before Marriage
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {report.preMaritalDiscussionTopics.map((topic, idx) => (
                <li key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 8. FOOTER BAR */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
          <span>{report.branding.tagline}</span>
          <span>{isFavorable ? 'Better People • Happier Marriages • Brighter Futures' : 'Know • Understand • Choose Wisely'}</span>
        </div>

      </div>
    </div>
  );
};
