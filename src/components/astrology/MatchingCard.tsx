import React from 'react';
import { Heart, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export interface MatchingDataUI {
  personA: { name: string; moonSign: string; nakshatra: string; pada: number };
  personB: { name: string; moonSign: string; nakshatra: string; pada: number };
  totalScore: number;
  percentageScore: number;
  verdict: string;
  kootas: Array<{
    name: string;
    sanskritName: string;
    maxPoints: number;
    obtainedPoints: number;
    description: string;
  }>;
  manglikBalance: {
    personAManglik: boolean;
    personBManglik: boolean;
    isBalanced: boolean;
    notes: string;
  };
  dimensions: {
    emotionalCompatibility: string;
    communication: string;
    marriageStability: string;
    attraction: string;
    financialCompatibility: string;
    familyHarmony: string;
    growthPotential: string;
    remedies: string[];
  };
}

interface MatchingCardProps {
  data: MatchingDataUI;
  className?: string;
}

export const MatchingCard: React.FC<MatchingCardProps> = ({ data, className = '' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 28) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 21) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (score >= 18) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Scorecard Header */}
      <div className="rounded-3xl border border-cosmic-border bg-gradient-to-b from-cosmic-surface to-cosmic-card p-6 shadow-cosmic-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-cyan-400" />
              Ashtakoota Milan Compatibility
            </div>
            <h2 className="text-2xl font-display font-extrabold text-cosmic-text mt-1">
              {data.personA.name} &bull; {data.personB.name}
            </h2>
            <p className="text-xs text-cosmic-muted mt-1">
              {data.personA.nakshatra} ({data.personA.moonSign}) &times; {data.personB.nakshatra} ({data.personB.moonSign})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-3xl font-display font-black text-cosmic-text">
                {data.totalScore}
                <span className="text-lg text-cosmic-muted font-normal"> / 36</span>
              </span>
              <span className="block text-xs font-semibold text-cosmic-gold">{data.percentageScore}% Synergy</span>
            </div>
            <div className={`px-4 py-2 rounded-2xl border text-sm font-extrabold tracking-wide uppercase ${getScoreColor(data.totalScore)}`}>
              {data.verdict}
            </div>
          </div>
        </div>

        {/* Manglik Equilibrium Indicator */}
        <div className="mt-5 pt-4 border-t border-cosmic-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {data.manglikBalance.isBalanced ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-semibold text-cosmic-text">
              Manglik Polarity: {data.manglikBalance.isBalanced ? 'Harmonized' : 'Requires Sensitivity'}
            </span>
          </div>
          <span className="text-cosmic-muted text-[11px] max-w-md text-right hidden sm:inline">
            {data.manglikBalance.notes}
          </span>
        </div>
      </div>

      {/* 8 Kootas Breakdown */}
      <div className="rounded-2xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
        <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
          Ashtakoota 8 Dimensions Scorecard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.kootas.map((k) => {
            const pct = (k.obtainedPoints / k.maxPoints) * 100;
            return (
              <div key={k.name} className="p-3.5 rounded-xl border border-cosmic-border/60 bg-cosmic-card/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-cosmic-text">{k.name}</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {k.obtainedPoints} / {k.maxPoints} pts
                  </span>
                </div>
                <div className="w-full h-1.5 bg-cosmic-border rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-cosmic-muted leading-relaxed">{k.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Joint Remedies */}
      {data.dimensions.remedies.length > 0 && (
        <div className="rounded-2xl border border-cosmic-gold/30 bg-cosmic-gold/5 p-5 space-y-2.5">
          <h4 className="text-xs font-bold text-cosmic-gold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Joint Relationship Harmonization Remedies
          </h4>
          <ul className="space-y-1.5 text-xs text-cosmic-text">
            {data.dimensions.remedies.map((rem, rIdx) => (
              <li key={`rem-${rIdx}`} className="flex items-start gap-2">
                <span className="text-cosmic-gold mt-0.5">&bull;</span>
                <span>{rem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
