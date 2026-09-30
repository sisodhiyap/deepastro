import React from 'react';

export interface ChartPlanet {
  name: string;
  symbol: string;
  house: number; // 1-12
  isRetrograde?: boolean;
  isCombust?: boolean;
  degreeInSign?: number;
  signIndex?: number; // 0-11
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

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

interface NorthIndianChartProps {
  ascendantSignIndex: number; // 0-11 (0=Aries)
  planets: ChartPlanet[];
  size?: number;
  className?: string;
  lagnaLabel?: string; // e.g. 'LAGNA' or 'LAGNA — D9'
  chartTitle?: string;
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  ascendantSignIndex,
  planets,
  size = 420,
  className = '',
  lagnaLabel = 'LAGNA',
  chartTitle,
}) => {
  // Map planets by house (1-12)
  const planetsByHouse: Record<number, ChartPlanet[]> = {};
  for (let h = 1; h <= 12; h++) {
    planetsByHouse[h] = planets.filter((p) => p.house === h);
  }

  // Calculate sign number for each house (1-based: Aries = 1, Pisces = 12)
  const getSignNumber = (houseNumber: number) => {
    return ((ascendantSignIndex + (houseNumber - 1)) % 12) + 1;
  };

  const ascSignNumber = getSignNumber(1);
  const ascSignName = ZODIAC_SIGNS[ascendantSignIndex] || 'Aries';

  // House coordinates for text positioning in 400x400 viewBox
  const houseLabels: Record<number, { x: number; y: number; labelX: number; labelY: number }> = {
    1:  { x: 200, y: 110, labelX: 200, labelY: 160 }, // 1st House (Top Diamond)
    2:  { x: 100, y: 55,  labelX: 130, labelY: 75  }, // 2nd House
    3:  { x: 55,  y: 100, labelX: 75,  labelY: 130 }, // 3rd House
    4:  { x: 120, y: 200, labelX: 155, labelY: 200 }, // 4th House (Left Diamond)
    5:  { x: 55,  y: 300, labelX: 75,  labelY: 270 }, // 5th House
    6:  { x: 100, y: 345, labelX: 130, labelY: 325 }, // 6th House
    7:  { x: 200, y: 280, labelX: 200, labelY: 245 }, // 7th House (Bottom Diamond)
    8:  { x: 300, y: 345, labelX: 270, labelY: 325 }, // 8th House
    9:  { x: 345, y: 300, labelX: 325, labelY: 270 }, // 9th House
    10: { x: 280, y: 200, labelX: 245, labelY: 200 }, // 10th House (Right Diamond)
    11: { x: 345, y: 100, labelX: 325, labelY: 130 }, // 11th House
    12: { x: 300, y: 55,  labelX: 270, labelY: 75  }, // 12th House
  };

  return (
    <div className={`relative w-full max-w-[420px] flex flex-col items-center select-none ${className}`}>
      {chartTitle && (
        <div className="w-full flex items-center justify-between text-xs font-bold text-cosmic-muted uppercase tracking-wider mb-2 px-1">
          <span className="text-cyan-400">{chartTitle}</span>
          <span className="text-[10px] text-amber-300 font-mono">
            Asc: {ascSignNumber} {ascSignName}
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

        {/* Main Diagonals */}
        <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-border/80" />
        <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-border/80" />

        {/* Inner Diamond connecting midpoints */}
        <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="url(#diamondGlow)" strokeWidth="2" />

        <defs>
          <linearGradient id="diamondGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F5C76A" />
          </linearGradient>
        </defs>

        {/* Render 12 Houses */}
        {Object.entries(houseLabels).map(([hStr, coords]) => {
          const h = parseInt(hStr, 10);
          const signNum = getSignNumber(h);
          const occupants = planetsByHouse[h] || [];

          return (
            <g key={`house-${h}`}>
              {/* Sign Number Label in each house */}
              <text
                x={coords.labelX}
                y={coords.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-semibold fill-amber-300/90 font-mono"
              >
                {signNum}
              </text>

              {/* 1st House Unambiguous Lagna Header */}
              {h === 1 && (
                <g>
                  {/* LAGNA Header Label */}
                  <text
                    x={coords.x}
                    y={coords.y - 36}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold tracking-widest fill-cyan-300 uppercase filter drop-shadow"
                  >
                    {lagnaLabel}
                  </text>
                  {/* Sign Indicator: Sign Number & Zodiac Name */}
                  <text
                    x={coords.x}
                    y={coords.y - 22}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-amber-300 uppercase tracking-wider"
                  >
                    {ascSignNumber} {ascSignName}
                  </text>
                </g>
              )}

              {/* Occupying Planets cleanly stacked */}
              <g transform={`translate(${coords.x}, ${h === 1 ? coords.y + 4 : coords.y})`}>
                {occupants.map((p, idx) => {
                  const yOffset = (idx - (occupants.length - 1) / 2) * 14;
                  const abbrev = PLANET_ABBREV[p.name] || p.name.substring(0, 2);
                  return (
                    <text
                      key={`p-${h}-${p.name}`}
                      x="0"
                      y={yOffset}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] font-bold fill-cosmic-text hover:fill-cyan-300 transition-colors"
                    >
                      {abbrev}
                      {p.isRetrograde && <tspan className="text-[8px] fill-amber-400 font-extrabold" dx="1">(R)</tspan>}
                      {p.isCombust && <tspan className="text-[8px] fill-rose-400 font-extrabold" dx="1">(C)</tspan>}
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
