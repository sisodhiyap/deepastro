import React, { useState } from 'react';
import { TarotCard, TarotOrientation } from '../../types/tarot.js';
import { Sparkles, RotateCw, Compass, Shield } from 'lucide-react';

interface TarotCardComponentProps {
  card: TarotCard;
  orientation: TarotOrientation;
  positionLabel?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TarotCardComponent: React.FC<TarotCardComponentProps> = ({
  card,
  orientation,
  positionLabel,
  isFlipped = true,
  onFlip,
  className = '',
  size = 'md',
}) => {
  const isReversed = orientation === 'reversed';

  // Card dimensions per 2:3 aspect ratio
  const sizeClasses = {
    sm: 'w-40 h-60 text-xs',
    md: 'w-56 h-84 sm:w-64 sm:h-96 text-xs',
    lg: 'w-64 h-96 sm:w-72 sm:h-[432px] text-sm',
  }[size];

  return (
    <div
      className={`group perspective-[1200px] cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] ${sizeClasses} ${className}`}
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${
          isFlipped ? 'rotate-y-0' : 'rotate-y-180'
        }`}
      >
        {/* ============================================================ */}
        {/* FRONT OF CARD (Revealed)                                    */}
        {/* ============================================================ */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-slate-900 via-cosmic-card to-[#070913] p-3 sm:p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(245,199,106,0.25)] overflow-hidden ${
            isReversed ? 'border-violet-400/50 shadow-[0_0_25px_rgba(139,92,246,0.25)]' : ''
          }`}
        >
          {/* Subtle Celestial Star Background Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(0,229,255,0.3)_0%,transparent_70%)]" />

          {/* Golden Card Header: Position & Card Number */}
          <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {positionLabel || (card.arcana === 'major' ? `MAJOR ${card.number}` : card.suit?.toUpperCase())}
              </span>
            </div>

            {/* Upright / Reversed Badge */}
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isReversed
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {orientation.toUpperCase()}
            </span>
          </div>

          {/* DeepAstro Mystical Artwork Portal */}
          <div
            className={`relative z-10 my-2 flex-1 rounded-xl border border-cosmic-border/80 bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center p-3 relative overflow-hidden group-hover:border-amber-400/40 transition-colors ${
              isReversed ? 'rotate-180' : ''
            }`}
          >
            {/* Sacred Geometry Arc & Runic Rings */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
              viewBox="0 0 200 280"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="100" cy="140" r="75" stroke="rgba(245,199,106,0.4)" strokeWidth="1" strokeDasharray="4 4" />
              <polygon points="100,65 175,190 25,190" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
              <polygon points="100,215 25,90 175,90" stroke="rgba(245,199,106,0.3)" strokeWidth="1" />
              <circle cx="100" cy="140" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>

            {/* Central Iconic Cosmic Symbol */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 border border-amber-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(245,199,106,0.3)]">
              {card.iconSymbol}
            </div>

            {/* Element & Graha Badge in Art Frame */}
            <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                {card.element} Element
              </span>
              {card.correspondences.astrologicalSign && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-amber-500/30">
                  {card.correspondences.astrologicalSign}
                </span>
              )}
            </div>
          </div>

          {/* Card Title & Keywords */}
          <div className="relative z-10 pt-1 text-center space-y-1">
            <h4 className="font-display font-black text-sm sm:text-base text-white tracking-wide">
              {card.name}
            </h4>

            {/* Astrological / Vedic Analogy Line */}
            {card.correspondences.vedicAnalogy && (
              <p className="text-[10px] text-cosmic-muted truncate" title={card.correspondences.vedicAnalogy}>
                Vedic: <span className="text-amber-300/90">{card.correspondences.vedicAnalogy}</span>
              </p>
            )}

            {/* Primary Keywords Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
              {(isReversed ? card.reversed.keywords : card.upright.keywords).slice(0, 2).map((kw, i) => (
                <span
                  key={i}
                  className="text-[8px] sm:text-[9px] font-bold text-cosmic-text/90 bg-slate-800/80 px-1.5 py-0.5 rounded-md border border-cosmic-border"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BACK OF CARD (Face Down)                                    */}
        {/* ============================================================ */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0B1024] via-[#050711] to-[#0B1024] p-4 flex flex-col items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Ornate Gold Border Line */}
          <div className="absolute inset-2 rounded-xl sm:rounded-2xl border border-amber-400/30 pointer-events-none" />

          {/* Top Mystic Brand Header */}
          <div className="relative z-10 text-center pt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-300">
              DEEPASTRO
            </span>
          </div>

          {/* Central Sacred Sri Yantra & Celestial Compass */}
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/40 flex items-center justify-center bg-radial-gradient shadow-[0_0_25px_rgba(245,199,106,0.3)]">
            <svg
              className="w-16 h-16 text-amber-300/80 animate-spin-slow"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
              <polygon points="50,15 85,75 15,75" />
              <polygon points="50,85 15,25 85,25" />
              <circle cx="50" cy="50" r="15" fill="rgba(0,229,255,0.2)" />
              <circle cx="50" cy="50" r="4" fill="currentColor" />
            </svg>
          </div>

          {/* Bottom Tap to Reveal Callout */}
          <div className="relative z-10 text-center pb-2 flex items-center gap-1 text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Tap to Awaken</span>
          </div>
        </div>
      </div>
    </div>
  );
};
