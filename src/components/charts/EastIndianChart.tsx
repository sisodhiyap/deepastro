import React from 'react';
import { ChartPlanet } from './NorthIndianChart.js';

interface EastIndianChartProps {
  ascendantSignIndex: number;
  planets: ChartPlanet[];
  size?: number;
  className?: string;
  lagnaLabel?: string;
  chartTitle?: string;
}

const PLANET_ABBREV: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

const EAST_SIGNS = [
  { signIndex: 0,  signNum: 1,  name: 'Aries', coords: { x: 200, y: 70 }, labelCoords: { x: 200, y: 40 } },
  { signIndex: 1,  signNum: 2,  name: 'Taurus', coords: { x: 320, y: 70 }, labelCoords: { x: 320, y: 40 } },
  { signIndex: 2,  signNum: 3,  name: 'Gemini', coords: { x: 340, y: 150 }, labelCoords: { x: 340, y: 130 } },
  { signIndex: 3,  signNum: 4,  name: 'Cancer', coords: { x: 340, y: 250 }, labelCoords: { x: 340, y: 230 } },
  { signIndex: 4,  signNum: 5,  name: 'Leo', coords: { x: 320, y: 340 }, labelCoords: { x: 320, y: 365 } },
  { signIndex: 5,  signNum: 6,  name: 'Virgo', coords: { x: 200, y: 340 }, labelCoords: { x: 200, y: 365 } },
  { signIndex: 6,  signNum: 7,  name: 'Libra', coords: { x: 80,  y: 340 }, labelCoords: { x: 80,  y: 365 } },
  { signIndex: 7,  signNum: 8,  name: 'Scorpio', coords: { x: 60,  y: 250 }, labelCoords: { x: 60,  y: 230 } },
  { signIndex: 8,  signNum: 9,  name: 'Sagittarius', coords: { x: 60,  y: 150 }, labelCoords: { x: 60,  y: 130 } },
  { signIndex: 9,  signNum: 10, name: 'Capricorn', coords: { x: 80,  y: 70 }, labelCoords: { x: 80,  y: 40 } },
  { signIndex: 10, signNum: 11, name: 'Aquarius', coords: { x: 140, y: 130 }, labelCoords: { x: 140, y: 110 } },
  { signIndex: 11, signNum: 12, name: 'Pisces', coords: { x: 260, y: 130 }, labelCoords: { x: 260, y: 110 } },
];

export const EastIndianChart: React.FC<EastIndianChartProps> = ({
  ascendantSignIndex,
  planets,
  size = 420,
  className = '',
  lagnaLabel = 'LAGNA',
  chartTitle,
}) => {
  const planetsBySign: Record<number, ChartPlanet[]> = {};
  for (let s = 0; s < 12; s++) {
    planetsBySign[s] = planets.filter((p) => p.signIndex === s);
  }

  return (
    <div className={`relative w-full max-w-[420px] flex flex-col items-center select-none ${className}`}>
      {chartTitle && (
        <div className="w-full flex items-center justify-between text-xs font-bold text-cosmic-muted uppercase tracking-wider mb-2 px-1">
          <span className="text-cyan-400">{chartTitle}</span>
          <span className="text-[10px] text-amber-300 font-mono">
            Asc: {ascendantSignIndex + 1} ({EAST_SIGNS.find(s => s.signIndex === ascendantSignIndex)?.name})
          </span>
        </div>
      )}
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

        {/* 12 Signs & Occupants */}
        {EAST_SIGNS.map((s) => {
          const isAsc = s.signIndex === ascendantSignIndex;
          const occupants = planetsBySign[s.signIndex] || [];

          return (
            <g key={`east-sign-${s.signIndex}`}>
              <text
                x={s.labelCoords.x}
                y={s.labelCoords.y}
                textAnchor="middle"
                className={`text-[9px] font-bold ${isAsc ? 'fill-cyan-300' : 'fill-amber-300/70'}`}
              >
                {s.signNum} {s.name.substring(0, 3)} {isAsc && `★ ${lagnaLabel}`}
              </text>

              {/* Occupants */}
              <g transform={`translate(${s.coords.x}, ${s.coords.y})`}>
                {occupants.map((p, idx) => {
                  const yOffset = (idx - (occupants.length - 1) / 2) * 12;
                  const abbrev = PLANET_ABBREV[p.name] || p.name.substring(0, 2);
                  return (
                    <text
                      key={`east-p-${p.name}`}
                      x="0"
                      y={yOffset}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-cosmic-text"
                    >
                      {abbrev}
                      {p.isRetrograde && <tspan className="text-[7px] fill-amber-400 font-extrabold">(R)</tspan>}
                      {p.isCombust && <tspan className="text-[7px] fill-rose-400 font-extrabold">(C)</tspan>}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
