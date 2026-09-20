import React from 'react';
import { ChartPlanet } from './NorthIndianChart.js';

interface SouthIndianChartProps {
  ascendantSignIndex: number; // 0-11
  planets: ChartPlanet[];
  size?: number;
  className?: string;
}

// 12 Boxes of the South Indian grid (fixed 4x4 matrix, center 2x2 is empty)
// 0=Aries, 1=Taurus, 2=Gemini, 3=Cancer, 4=Leo, 5=Virgo, 6=Libra, 7=Scorpio, 8=Sagittarius, 9=Capricorn, 10=Aquarius, 11=Pisces
const SOUTH_GRID_CELLS: Array<{ signIndex: number; row: number; col: number; name: string }> = [
  { signIndex: 11, row: 0, col: 0, name: 'Pisces (Meena)' },
  { signIndex: 0,  row: 0, col: 1, name: 'Aries (Mesha)' },
  { signIndex: 1,  row: 0, col: 2, name: 'Taurus (Vrishabha)' },
  { signIndex: 2,  row: 0, col: 3, name: 'Gemini (Mithuna)' },
  { signIndex: 3,  row: 1, col: 3, name: 'Cancer (Karka)' },
  { signIndex: 4,  row: 2, col: 3, name: 'Leo (Simha)' },
  { signIndex: 5,  row: 3, col: 3, name: 'Virgo (Kanya)' },
  { signIndex: 6,  row: 3, col: 2, name: 'Libra (Tula)' },
  { signIndex: 7,  row: 3, col: 1, name: 'Scorpio (Vrishchika)' },
  { signIndex: 8,  row: 3, col: 0, name: 'Sagittarius (Dhanu)' },
  { signIndex: 9,  row: 2, col: 0, name: 'Capricorn (Makara)' },
  { signIndex: 10, row: 1, col: 0, name: 'Aquarius (Kumbha)' },
];

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  ascendantSignIndex,
  planets,
  size = 420,
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[420px] flex flex-col items-center select-none ${className}`}>
      <div
        style={{ width: '100%', maxWidth: size, height: 'auto', aspectRatio: '1 / 1' }}
        className="aspect-square rounded-2xl border border-cosmic-border bg-cosmic-surface/90 shadow-cosmic-card grid grid-cols-4 grid-rows-4 p-1 gap-1"
      >
        {SOUTH_GRID_CELLS.map((cell) => {
          const isAsc = cell.signIndex === ascendantSignIndex;
          const occupants = planets.filter((p) => p.signIndex === cell.signIndex);

          // Grid coordinates 1-indexed for CSS Grid
          const gridStyle: React.CSSProperties = {
            gridRowStart: cell.row + 1,
            gridColumnStart: cell.col + 1,
          };

          return (
            <div
              key={`south-cell-${cell.signIndex}`}
              style={gridStyle}
              className={`relative border border-cosmic-border/60 rounded-lg p-1.5 flex flex-col justify-between overflow-hidden transition-colors ${
                isAsc ? 'bg-cyan-500/10 border-cyan-400/60' : 'bg-cosmic-card/40'
              }`}
            >
              {/* Header: Sign indicator & Ascendant slash */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium text-cosmic-muted/80">
                  {cell.name.split(' ')[0]}
                </span>
                {isAsc && (
                  <span className="text-[9px] font-bold text-cyan-400 tracking-wider">
                    ASC (लग्न)
                  </span>
                )}
              </div>

              {/* Occupying Planets */}
              <div className="flex flex-wrap gap-1 mt-1">
                {occupants.map((p) => (
                  <span
                    key={`p-${p.name}`}
                    className="text-[10px] font-bold text-cosmic-text bg-cosmic-card/80 px-1 py-0.5 rounded border border-cosmic-border/50 flex items-center gap-0.5"
                  >
                    {p.name.substring(0, 2)}
                    {p.isRetrograde && <span className="text-[8px] text-amber-400 font-extrabold">(R)</span>}
                    {p.isCombust && <span className="text-[8px] text-rose-400 font-extrabold">(C)</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* Center 2x2 Cell (DeepAstro emblem) */}
        <div
          style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
          className="flex flex-col items-center justify-center border border-cosmic-border/40 rounded-xl bg-cosmic-bg/60 p-2 text-center"
        >
          <span className="text-xs font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 uppercase tracking-wider">
            DEEPASTRO
          </span>
          <span className="text-[9px] text-cosmic-muted uppercase tracking-widest mt-1">
            South Indian Rashi
          </span>
        </div>
      </div>
    </div>
  );
};
