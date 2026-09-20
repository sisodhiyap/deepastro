import React from 'react';
import { ChartPlanet } from './NorthIndianChart.js';

interface EastIndianChartProps {
  ascendantSignIndex: number;
  planets: ChartPlanet[];
  size?: number;
  className?: string;
}

export const EastIndianChart: React.FC<EastIndianChartProps> = ({
  ascendantSignIndex,
  planets,
  size = 420,
  className = '',
}) => {
  // Signs in East Indian chart are fixed in triangles/rectangles around central diagonals
  const planetsBySign: Record<number, ChartPlanet[]> = {};
  for (let s = 0; s < 12; s++) {
    planetsBySign[s] = planets.filter((p) => p.signIndex === s);
  }

  return (
    <div className={`relative w-full max-w-[420px] flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        style={{ width: '100%', maxWidth: size, height: 'auto', aspectRatio: '1 / 1' }}
        className="w-full aspect-square rounded-2xl border border-cosmic-border bg-cosmic-surface/90 shadow-cosmic-card"
      >
        {/* Outer Square */}
        <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-border" />
        
        {/* Diagonals */}
        <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-border/80" />
        <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-border/80" />

        {/* Hourglass inner cross */}
        <line x1="10" y1="200" x2="390" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-cosmic-border/60" />
        <line x1="200" y1="10" x2="200" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-cosmic-border/60" />

        {/* Center Label */}
        <circle cx="200" cy="200" r="28" fill="#0B1020" stroke="#00E5FF" strokeWidth="1.5" />
        <text x="200" y="196" textAnchor="middle" className="text-[9px] font-bold fill-cyan-400">
          EAST
        </text>
        <text x="200" y="208" textAnchor="middle" className="text-[8px] font-medium fill-cosmic-muted">
          INDIAN
        </text>

        {/* Sign Markers & Planets placed in quadrants */}
        <text x="200" y="45" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
          Aries (Mesha) {ascendantSignIndex === 0 && '★ Lagna'}
        </text>
        <text x="330" y="100" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Taurus
        </text>
        <text x="330" y="200" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Gemini
        </text>
        <text x="330" y="300" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Cancer
        </text>
        <text x="200" y="370" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Leo
        </text>
        <text x="70" y="300" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Virgo
        </text>
        <text x="70" y="200" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Libra
        </text>
        <text x="70" y="100" textAnchor="middle" className="text-[10px] font-bold fill-cosmic-muted">
          Scorpio
        </text>
      </svg>
    </div>
  );
};
