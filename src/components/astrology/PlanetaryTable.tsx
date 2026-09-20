import React from 'react';

export interface PlanetaryTableItem {
  name: string;
  sanskritName: string;
  symbol: string;
  signName: string;
  degreeInSign: number;
  minutes: number;
  seconds: number;
  house: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  nakshatra: {
    name: string;
    pada: number;
    lord: string;
  };
}

interface PlanetaryTableProps {
  planets: PlanetaryTableItem[];
  className?: string;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets, className = '' }) => {
  return (
    <div className={`table-responsive overflow-x-auto rounded-2xl border border-cosmic-border bg-cosmic-surface shadow-cosmic-card ${className}`}>
      <table className="w-full min-w-[580px] text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-cosmic-border bg-cosmic-card/80 text-cosmic-muted uppercase tracking-wider font-semibold">
            <th className="py-3.5 px-4">Planet (Graha)</th>
            <th className="py-3.5 px-4">Sign (Rashi)</th>
            <th className="py-3.5 px-4">Degrees</th>
            <th className="py-3.5 px-4 text-center">House</th>
            <th className="py-3.5 px-4">Nakshatra (Pada)</th>
            <th className="py-3.5 px-4">Dignity</th>
            <th className="py-3.5 px-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cosmic-border/50 text-cosmic-text font-medium">
          {planets.map((p) => {
            const isBeneficDignity = ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.dignity);
            const isMaleficDignity = p.dignity === 'Debilitated';

            return (
              <tr key={p.name} className="hover:bg-cosmic-card/50 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cosmic-card flex items-center justify-center text-cyan-400 font-bold border border-cosmic-border">
                    {p.symbol}
                  </span>
                  <div>
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[10px] text-cosmic-muted block">{p.sanskritName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-cosmic-text">
                  {p.signName}
                </td>
                <td className="py-3 px-4 text-cosmic-muted font-mono">
                  {p.degreeInSign}° {p.minutes}' {p.seconds}"
                </td>
                <td className="py-3 px-4 text-center font-bold text-cyan-400">
                  H{p.house}
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-cosmic-text">{p.nakshatra.name}</span>
                  <span className="text-[10px] text-cosmic-gold ml-1.5 font-bold">Pada {p.nakshatra.pada}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isBeneficDignity
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isMaleficDignity
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-cosmic-card text-cosmic-muted border border-cosmic-border'
                    }`}
                  >
                    {p.dignity}
                  </span>
                </td>
                <td className="py-3 px-4 text-center space-x-1">
                  {p.isRetrograde && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      RETRO
                    </span>
                  )}
                  {p.isCombust && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      COMBUST
                    </span>
                  )}
                  {!p.isRetrograde && !p.isCombust && (
                    <span className="text-cosmic-muted text-[10px]">Direct</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
