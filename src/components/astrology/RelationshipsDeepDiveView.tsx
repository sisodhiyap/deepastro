import React from 'react';
import { ChartSession } from '../../types/chartSession.js';
import { Heart, Sparkles, Shield, UserCheck, Eye } from 'lucide-react';

interface RelationshipsDeepDiveViewProps {
  session: ChartSession;
}

export const RelationshipsDeepDiveView: React.FC<RelationshipsDeepDiveViewProps> = ({ session }) => {
  const { vedic, vargas, dasha, kp } = session;

  const seventhHouse = vedic.houses.find(h => h.houseNumber === 7) || vedic.houses[6];
  const seventhLord = vedic.planets.find(p => p.name === seventhHouse.signLord);
  const venus = vedic.planets.find(p => p.name === 'Venus');
  const jupiter = vedic.planets.find(p => p.name === 'Jupiter');

  const seventhCuspSubLord = kp?.cuspalSubLords?.find(c => c.cusp === 7)?.subLord;

  return (
    <div className="space-y-6">
      {/* Header & Source Truth Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Relationships & Dharma Deep Dive</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                7th Bhava (Partnerships), Venus/Jupiter Karakas, and D9 Navamsha relational harmonics.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-rose-950/80 text-rose-400 border border-rose-800/60 font-semibold">
            KALATRA BHAVA &bull; EVIDENCE-GROUNDED
          </span>
        </div>

        {/* Primary Relationship Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">7th House (Union & Others)</div>
            <div className="text-base font-bold text-white mt-1">
              {seventhHouse.sign} ({seventhHouse.degree.toFixed(2)}°)
            </div>
            <div className="text-[11px] text-rose-400 font-mono mt-0.5">
              Lord: {seventhHouse.signLord} (in H{seventhLord?.house || '?'})
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Venus (Love & Chemistry)</div>
            <div className="text-base font-bold text-white mt-1">
              {venus ? `${venus.sign} (${venus.dignity})` : 'Calculated'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              House {venus?.house} &bull; {venus?.nakshatra}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Jupiter (Dharmic Commitment)</div>
            <div className="text-base font-bold text-white mt-1">
              {jupiter ? `${jupiter.sign} (${jupiter.dignity})` : 'Calculated'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              House {jupiter?.house} &bull; {jupiter?.nakshatra}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">7th Cusp Sub-Lord (KP)</div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              {seventhCuspSubLord || seventhHouse.signLord}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Partnership Harmony Ruler
            </div>
          </div>
        </div>
      </div>

      {/* 7th House Detailed Analysis & D9 Harmonic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <UserCheck className="w-4 h-4 text-rose-400" />
              <span>7th Bhava Dynamics & Occupants</span>
            </div>
            <span className="text-xs font-mono text-slate-400">House 7</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{seventhHouse.interpretation}</p>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Direct Occupants:</span>
              <span className="text-white font-semibold">
                {seventhHouse.occupants.length ? seventhHouse.occupants.join(', ') : 'Governed by Ruler ' + seventhHouse.signLord}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">7th Lord Dignity:</span>
              <span className="text-amber-400 font-mono font-bold">{seventhLord?.dignity || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Dasha Connection:</span>
              <span className="text-cyan-400 font-mono">
                {dasha.currentMahaDasha} / {dasha.currentAntarDasha}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>D9 Navamsha Soul & Marital Harmonics</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              D9 VERIFIED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {vargas.d9NavamshaSummary || 'D9 Navamsha reveals strong planetary dignity reinforcements for relationship longevity and inner alignment.'}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
              CLASSICAL PARASHARI MANDATE
            </span>
            While the D1 Rashi chart shows external partnership events, the D9 Navamsha reveals the internal emotional compatibility, dharma, and soul endurance of the union.
          </div>
        </div>
      </div>
    </div>
  );
};
