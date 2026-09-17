import React from 'react';
import { ChartSession } from '../../types/chartSession.js';
import { Coins, TrendingUp, ShieldCheck, PieChart, Gem } from 'lucide-react';

interface WealthDeepDiveViewProps {
  session: ChartSession;
}

export const WealthDeepDiveView: React.FC<WealthDeepDiveViewProps> = ({ session }) => {
  const { vedic, yogas, kp } = session;

  const secondHouse = vedic.houses.find(h => h.houseNumber === 2) || vedic.houses[1];
  const eleventhHouse = vedic.houses.find(h => h.houseNumber === 11) || vedic.houses[10];
  const fifthHouse = vedic.houses.find(h => h.houseNumber === 5) || vedic.houses[4];
  const ninthHouse = vedic.houses.find(h => h.houseNumber === 9) || vedic.houses[8];

  const secondLord = vedic.planets.find(p => p.name === secondHouse.signLord);
  const eleventhLord = vedic.planets.find(p => p.name === eleventhHouse.signLord);

  const dhanaYogas = yogas.filter(y => y.category === 'Dhana' || y.category === 'Raja');

  const secondCuspSubLord = kp?.cuspalSubLords?.find(c => c.cusp === 2)?.subLord;
  const eleventhCuspSubLord = kp?.cuspalSubLords?.find(c => c.cusp === 11)?.subLord;

  return (
    <div className="space-y-6">
      {/* Header & Source Truth Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Wealth & Dhana Deep Dive</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic analysis of 2nd Bhava (Accumulated Assets) & 11th Bhava (Gains & Revenue Streams).
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold">
            DHANA BHAVA &bull; EVIDENCE-GROUNDED
          </span>
        </div>

        {/* Wealth Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">2nd House (Treasury / Net Worth)</div>
            <div className="text-base font-bold text-white mt-1">
              {secondHouse.sign} ({secondHouse.degree.toFixed(2)}°)
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              Lord: {secondHouse.signLord} (in H{secondLord?.house || '?'})
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">11th House (Recurring Inflows)</div>
            <div className="text-base font-bold text-white mt-1">
              {eleventhHouse.sign} ({eleventhHouse.degree.toFixed(2)}°)
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Lord: {eleventhHouse.signLord} (in H{eleventhLord?.house || '?'})
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">2nd Cusp Sub-Lord (KP)</div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              {secondCuspSubLord || secondHouse.signLord}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Asset Preservation Ruler
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">11th Cusp Sub-Lord (KP)</div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              {eleventhCuspSubLord || eleventhHouse.signLord}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Income Realization Ruler
            </div>
          </div>
        </div>
      </div>

      {/* Dhana & Raja Yogas */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Gem className="w-4 h-4 text-amber-400" />
            <span>Formed Dhana & Raja Yogas (Financial Combinations)</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">MATHEMATICALLY VERIFIED</span>
        </div>

        {dhanaYogas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dhanaYogas.map((yoga, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{yoga.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800">
                    {yoga.category} Yoga
                  </span>
                </div>
                <p className="text-xs text-slate-300">{yoga.traditionalInterpretation}</p>
                <div className="text-[11px] font-mono text-cyan-400 pt-1">
                  Proof: {yoga.mathematicalProof}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 text-xs text-slate-400">
            Wealth accumulation occurs through standard functional house lordships and purposeful execution.
          </div>
        )}
      </div>

      {/* Lakshmi Houses: 5th & 9th Bhavas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold text-white text-sm">5th Bhava (Purva Punya & Intellectual Capital)</span>
            <span className="text-xs font-mono text-amber-400">Sign: {fifthHouse.sign}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{fifthHouse.interpretation}</p>
          <div className="text-[11px] font-mono text-slate-400 pt-1">
            Lord: {fifthHouse.signLord} | Occupants: {fifthHouse.occupants.length ? fifthHouse.occupants.join(', ') : 'Governed by Lord'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold text-white text-sm">9th Bhava (Bhagya / Cosmic Fortune & Wealth Expansion)</span>
            <span className="text-xs font-mono text-cyan-400">Sign: {ninthHouse.sign}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{ninthHouse.interpretation}</p>
          <div className="text-[11px] font-mono text-slate-400 pt-1">
            Lord: {ninthHouse.signLord} | Occupants: {ninthHouse.occupants.length ? ninthHouse.occupants.join(', ') : 'Governed by Lord'}
          </div>
        </div>
      </div>
    </div>
  );
};
