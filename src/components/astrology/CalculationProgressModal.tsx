import React from 'react';
import { Sparkles, Compass, CheckCircle2 } from 'lucide-react';

interface CalculationProgressModalProps {
  isOpen: boolean;
  step: number; // 0 to 5
  message: string;
  progressPercent: number;
}

export const CALCULATION_STEPS = [
  { label: 'Harmonizing Swiss & Vedic Ephemeris', sub: 'Calibrating Lahiri Ayanamsha (Chitra Paksha)' },
  { label: 'Resolving Geographic Coordinates', sub: 'Topocentric Latitude, Longitude & Sidereal Time (LST)' },
  { label: 'Plotting Ascendant & 12 Bhava Houses', sub: 'Exact degree cusps and geometric diamond boundaries' },
  { label: 'Computing Planetary Longitudes & Dashas', sub: 'Vimshottari Dasha periods & divisional vargas' },
  { label: 'Synthesizing Numerology & Lal Kitab', sub: 'Chaldean sound frequencies and planetary remedies' },
  { label: 'Complete Kundli Successfully Plotted!', sub: '100% authentic astronomical precision verified' },
];

export const CalculationProgressModal: React.FC<CalculationProgressModalProps> = ({
  isOpen,
  step,
  message,
  progressPercent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0e162e] to-[#080d1e] p-6 sm:p-8 shadow-glow-cyan text-center space-y-6">
        {/* Animated Compass / Astrolabe */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan/50">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Title & Live Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Calculating Authentic Astrology</span>
          </div>
          <h3 className="text-xl font-display font-extrabold text-white">
            {CALCULATION_STEPS[step]?.label || 'Computing Planetary Geometry'}
          </h3>
          <p className="text-xs text-cosmic-muted max-w-xs mx-auto">
            {message || CALCULATION_STEPS[step]?.sub || 'Aligning exact degrees and minutes of arc...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span>Ephemeris Telemetry</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-cosmic-card rounded-full overflow-hidden border border-cosmic-border">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Checkpoints */}
        <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-cosmic-border/60">
          {[0, 1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-cyan-400 shadow-glow-cyan/50' : 'bg-cosmic-border/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
