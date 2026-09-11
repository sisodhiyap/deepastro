import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Moon, Sun, Orbit, CheckCircle } from 'lucide-react';

interface TarotShuffleAnimationProps {
  onComplete: () => void;
  questionCategory?: string;
}

export const TarotShuffleAnimation: React.FC<TarotShuffleAnimationProps> = ({
  onComplete,
  questionCategory = 'General Life',
}) => {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);

  const phases = [
    { title: '78 CARDS AWAKEN', sub: 'Summoning the full Major & Minor Arcana archetype fields...', icon: Orbit },
    { title: 'ASTROLOGY ALIGNED', sub: `Harmonizing with current transits & question: ${questionCategory}`, icon: Compass },
    { title: 'SHUFFLING DESTINY...', sub: 'Cryptographically shuffling cosmic entropy & probability matrix...', icon: Sparkles },
    { title: '3 CARDS SELECTED', sub: 'Root · Present · Direction crystallized for your consciousness.', icon: CheckCircle },
  ];

  useEffect(() => {
    // Total animation runs ~2.8 seconds across the 4 stages
    const timer1 = setTimeout(() => setPhaseIndex(1), 700);
    const timer2 = setTimeout(() => setPhaseIndex(2), 1400);
    const timer3 = setTimeout(() => setPhaseIndex(3), 2100);
    const timer4 = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const CurrentIcon = phases[phaseIndex].icon;

  return (
    <div className="relative w-full max-w-2xl mx-auto py-12 px-6 flex flex-col items-center justify-center text-center select-none">
      {/* Background Cosmic Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '12s' }} />
        <div className="absolute w-96 h-96 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-purple-500/10 animate-pulse" />
      </div>

      {/* Shuffling Deck Visual Container */}
      <div className="relative w-48 h-72 sm:w-56 sm:h-84 flex items-center justify-center my-6">
        {/* Fan of glowing Tarot card backs shifting dynamically */}
        {[-30, -18, -6, 6, 18, 30].map((deg, i) => (
          <div
            key={i}
            className="absolute w-40 h-60 sm:w-48 sm:h-72 rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-[#0c1020] via-cosmic-card to-[#04060b] shadow-[0_0_20px_rgba(245,199,106,0.18)] transition-all duration-500"
            style={{
              transform: `rotate(${deg * (phaseIndex % 2 === 0 ? 1 : -0.7)}deg) translate(${
                phaseIndex === 2 ? Math.sin(i * 1.5) * 20 : 0
              }px, ${phaseIndex === 2 ? Math.cos(i * 1.5) * 15 : 0}px)`,
              opacity: 0.7 + i * 0.05,
              zIndex: i,
            }}
          >
            {/* Mystic Geometric Back Pattern */}
            <div className="w-full h-full p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-full border border-amber-400/30 flex items-center justify-center">
                <div className="w-12 h-12 rotate-45 border border-cyan-400/40 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Central Burst Icon */}
        <div className="relative z-20 w-16 h-16 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(245,199,106,0.6)] animate-pulse">
          <CurrentIcon className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        DEEPASTRO SECURE TAROT ENGINE
      </div>

      {/* Phase Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-300 bg-clip-text text-transparent mb-2">
        {phases[phaseIndex].title}
      </h2>
      <p className="text-sm text-slate-300 max-w-md mx-auto">
        {phases[phaseIndex].sub}
      </p>

      {/* Progress Bar Indicator */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-300 transition-all duration-700 ease-out"
          style={{ width: `${((phaseIndex + 1) / phases.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
