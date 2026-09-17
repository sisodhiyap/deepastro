import React, { useState } from 'react';
import { ChartSession, PlanetPosition } from '../../types/chartSession.js';
import { Sparkles, Moon, Compass, Star, Eye } from 'lucide-react';

interface NakshatrasViewProps {
  session: ChartSession;
}

export const NakshatrasView: React.FC<NakshatrasViewProps> = ({ session }) => {
  const { vedic } = session;
  const [selectedPlanet, setSelectedPlanet] = useState<string>('Moon');

  const moonPlanet = vedic.planets.find(p => p.name === 'Moon');
  const activePlanet = vedic.planets.find(p => p.name === selectedPlanet) || moonPlanet || vedic.planets[0];

  return (
    <div className="space-y-6">
      {/* Header & Source Truth Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Nakshatras (27 Lunar Mansions)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact stellar placements, pada harmonics, and governing nakshatra lords across 360° of the ecliptic.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
            CALCULATED &bull; LAHIRI AYANAMSA
          </span>
        </div>

        {/* Primary Lunar & Ascendant Anchors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Janma Nakshatra (Natal Moon)</div>
              <div className="text-base font-bold text-white mt-0.5">
                {vedic.moonNakshatra} &bull; Pada {vedic.moonPada}
              </div>
              <div className="text-xs text-cyan-400 font-mono mt-0.5">
                Sign: {vedic.moonSign} | Lord: {moonPlanet?.nakshatraLord || 'Jupiter'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Lagna Nakshatra (Ascendant)</div>
              <div className="text-base font-bold text-white mt-0.5">
                {vedic.ascendantNakshatra} &bull; Pada {vedic.ascendantPada}
              </div>
              <div className="text-xs text-amber-400 font-mono mt-0.5">
                Ascendant: {vedic.ascendantSign} ({vedic.ascendantDegree.toFixed(2)}°) | Lord: {vedic.ascendantLord}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planetary Lunar Mansion Distribution */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <span className="font-bold text-white text-sm">9 Grahas in their Lunar Mansions</span>
          <span className="text-xs font-mono text-slate-400">Click a planet to inspect its stellar harmonics</span>
        </div>

        {/* Planet Selection Pills */}
        <div className="flex flex-wrap gap-2">
          {vedic.planets.map((p: PlanetPosition) => (
            <button
              key={p.name}
              onClick={() => setSelectedPlanet(p.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                selectedPlanet === p.name
                  ? 'bg-cyan-500 text-black shadow-md font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.name}: {p.nakshatra}
            </button>
          ))}
        </div>

        {/* Active Selected Nakshatra Card */}
        {activePlanet && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyan-400" />
                  <span>{activePlanet.name} in {activePlanet.nakshatra} Nakshatra</span>
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Pada {activePlanet.pada} (Quarter {activePlanet.pada} of 4) &bull; Sign: {activePlanet.sign} at {activePlanet.degreeInSign.toFixed(2)}°
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 font-mono text-xs border border-slate-800">
                  Ruling Lord: {activePlanet.nakshatraLord}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-950 text-amber-400 font-mono text-xs border border-slate-800">
                  House {activePlanet.house}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1 font-mono uppercase text-[10px]">
                ASTRONOMICAL SIGNIFICATION
              </span>
              The placement of {activePlanet.name} in {activePlanet.nakshatra} (ruled by {activePlanet.nakshatraLord}) channels the deeper psychological and karmic qualities of the stellar mansion into the {activePlanet.house}th house affairs, shaping instincts, emotional temperament, and manifestation speed under {activePlanet.dignity} dignity.
            </div>
          </div>
        )}

        {/* Full 9-Planet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Planet</th>
                <th className="py-2.5 px-3">Sign</th>
                <th className="py-2.5 px-3">Degree</th>
                <th className="py-2.5 px-3">Nakshatra</th>
                <th className="py-2.5 px-3">Pada</th>
                <th className="py-2.5 px-3">Nakshatra Lord</th>
                <th className="py-2.5 px-3">House</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {vedic.planets.map((p: PlanetPosition) => (
                <tr key={p.name} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-bold text-white font-sans">{p.name}</td>
                  <td className="py-2.5 px-3">{p.sign}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{p.degreeInSign.toFixed(2)}°</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{p.nakshatra}</td>
                  <td className="py-2.5 px-3 text-slate-300">{p.pada}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.nakshatraLord}</td>
                  <td className="py-2.5 px-3 text-cyan-300">H{p.house}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
