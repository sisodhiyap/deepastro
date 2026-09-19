import React, { useState, useEffect, useRef } from 'react';
import { TarotDraw, TarotSession } from '../../types/tarot.js';
import { TarotCardComponent } from './TarotCardComponent.js';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Eye, LayoutGrid, Layers } from 'lucide-react';

export interface TarotResponsiveLayoutProps {
  drawnCards: TarotDraw[];
  flippedCards: Record<string, boolean>;
  onFlipCard: (position: string) => void;
  activeSession?: TarotSession | null;
  onSelectCard?: (index: number) => void;
  className?: string;
}

export const TarotResponsiveLayout: React.FC<TarotResponsiveLayoutProps> = ({
  drawnCards,
  flippedCards,
  onFlipCard,
  activeSession,
  onSelectCard,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'spread' | 'carousel'>('spread');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation across cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!drawnCards || drawnCards.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % drawnCards.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + drawnCards.length) % drawnCards.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const activeCard = drawnCards[currentIndex];
        if (activeCard) {
          onFlipCard(activeCard.position);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawnCards, currentIndex, onFlipCard]);

  // Touch swipe handling for mobile
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % drawnCards.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + drawnCards.length) % drawnCards.length);
    }
  };

  if (!drawnCards || drawnCards.length === 0) return null;

  const currentDraw = drawnCards[currentIndex] || drawnCards[0];
  const posLabels: Record<string, { label: string; question: string }> = {
    root: { label: 'ROOT / PAST', question: 'What underlying energy has shaped this situation?' },
    present: { label: 'PRESENT / ENERGY', question: 'What cosmic frequency surrounds you now?' },
    direction: { label: 'DIRECTION / NEXT', question: 'What conscious action aligns with your destiny?' },
  };

  return (
    <div
      ref={containerRef}
      className={`w-full relative select-none overflow-x-hidden ${className}`}
      role="region"
      aria-label="Tarot Spread Interactive Arena"
    >
      {/* Mobile / Tablet View Switcher Toggle */}
      <div className="flex sm:hidden items-center justify-between mb-4 px-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Card {currentIndex + 1} of {drawnCards.length}
        </span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('carousel')}
            className={`min-h-[44px] min-w-[44px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              viewMode === 'carousel'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Switch to single-card carousel"
          >
            <Layers className="w-4 h-4" />
            <span className="sr-only">Carousel</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('spread')}
            className={`min-h-[44px] min-w-[44px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              viewMode === 'spread'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Switch to stack grid"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="sr-only">Stack</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. MOBILE FOCUSED CAROUSEL (< 768px in carousel viewMode)     */}
      {/* ============================================================ */}
      <div
        className={`md:hidden ${viewMode === 'carousel' ? 'block' : 'hidden'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col items-center justify-center py-2">
          {/* Card Label & Question */}
          <div className="mb-4 text-center px-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              CARD {currentIndex + 1} · {posLabels[currentDraw.position]?.label || currentDraw.position}
            </span>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              {posLabels[currentDraw.position]?.question}
            </p>
          </div>

          {/* Interactive Card Canvas - strictly bounded */}
          <div className="relative flex items-center justify-center w-full max-w-[280px]">
            <TarotCardComponent
              card={currentDraw.card}
              orientation={currentDraw.orientation}
              positionLabel={posLabels[currentDraw.position]?.label}
              isFlipped={flippedCards[currentDraw.position]}
              onFlip={() => onFlipCard(currentDraw.position)}
              size="md"
              className="focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-3xl"
            />
          </div>

          {/* Mobile Carousel Controls (44x44px minimum touch targets) */}
          <div className="flex items-center justify-between w-full max-w-xs mt-6 px-4">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + drawnCards.length) % drawnCards.length)}
              className="min-h-[44px] min-w-[44px] p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-400/40 active:scale-95 transition-all flex items-center justify-center shadow-lg"
              aria-label="Previous Tarot Card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {drawnCards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all`}
                  aria-label={`Go to card ${i + 1}`}
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentIndex === i
                        ? 'w-6 bg-gradient-to-r from-amber-400 to-cyan-400 shadow-[0_0_8px_rgba(245,199,106,0.8)]'
                        : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % drawnCards.length)}
              className="min-h-[44px] min-w-[44px] p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-400/40 active:scale-95 transition-all flex items-center justify-center shadow-lg"
              aria-label="Next Tarot Card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Swipe left/right or tap arrows · Tap card to flip
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. RESPONSIVE SPREAD (Desktop fan >=1200, Tablet grid, Stack) */}
      {/* ============================================================ */}
      <div
        className={`${
          viewMode === 'carousel' ? 'hidden md:block' : 'block'
        } w-full`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 justify-items-center items-start">
          {drawnCards.map((draw, idx) => {
            const isFlipped = flippedCards[draw.position];
            const meta = posLabels[draw.position] || { label: draw.position, question: '' };
            const isSelected = currentIndex === idx;

            // Deterministic fan rotation and elevation for desktop (>= 1200px)
            // Left card: -2deg, Middle card: 0deg, Right card: +2deg
            const desktopTransform =
              idx === 0
                ? 'xl:-rotate-1 xl:-translate-y-1'
                : idx === 2
                ? 'xl:rotate-1 xl:-translate-y-1'
                : 'xl:translate-y-0';

            return (
              <div
                key={draw.position}
                className={`flex flex-col items-center w-full max-w-[280px] sm:max-w-xs transition-all duration-300 ${desktopTransform}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (onSelectCard) onSelectCard(idx);
                }}
              >
                {/* Card Position Header */}
                <div className="mb-3 text-center px-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                      CARD {idx + 1} · {meta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {meta.question}
                  </p>
                </div>

                {/* Card Component Anchor */}
                <div
                  tabIndex={0}
                  role="button"
                  aria-label={`${draw.card.name} (${draw.orientation}) in ${meta.label}. Tap to flip.`}
                  className={`w-full flex justify-center rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    isSelected ? 'ring-1 ring-amber-500/30' : ''
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onFlipCard(draw.position);
                    }
                  }}
                >
                  <TarotCardComponent
                    card={draw.card}
                    orientation={draw.orientation}
                    positionLabel={meta.label}
                    isFlipped={isFlipped}
                    onFlip={() => onFlipCard(draw.position)}
                    size="md"
                    className="motion-reduce:transform-none"
                  />
                </div>

                {/* Flip status indicator button (min 44px height for accessibility) */}
                <button
                  type="button"
                  onClick={() => onFlipCard(draw.position)}
                  className="mt-3 min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-95"
                  aria-label={`Flip card ${draw.card.name}`}
                >
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  <span>{isFlipped ? 'Flip to Reveal Back' : 'Flip to Reveal Card'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
