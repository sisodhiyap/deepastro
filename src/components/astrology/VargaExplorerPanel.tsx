import React, { useState } from 'react';
import { Layers, Star, Award, Compass, ShieldCheck, Heart, Briefcase } from 'lucide-react';

interface VargaExplorerPanelProps {
  shodashavargaDetail?: Record<string, any>;
  navamsaDeep?: any;
  dasamshaDeep?: any;
  chartStyle?: 'north' | 'south' | 'east';
}

const VARGA_LIST = [
  { code: 'd1', name: 'D1 — Rashi', domain: 'Overall Life' },
  { code: 'd2', name: 'D2 — Hora', domain: 'Wealth & Prosperity' },
  { code: 'd3', name: 'D3 — Drekkana', domain: 'Siblings & Energy' },
  { code: 'd4', name: 'D4 — Chaturthamsa', domain: 'Property & Home' },
  { code: 'd7', name: 'D7 — Saptamsa', domain: 'Children & Progeny' },
  { code: 'd9', name: 'D9 — Navamsa', domain: 'Spouse & Dharma' },
  { code: 'd10', name: 'D10 — Dasamsa', domain: 'Career & Status' },
  { code: 'd12', name: 'D12 — Dwadashamsa', domain: 'Parents & Ancestry' },
  { code: 'd16', name: 'D16 — Shodasamsa', domain: 'Vehicles & Comfort' },
  { code: 'd20', name: 'D20 — Vimsamsa', domain: 'Spiritual Practice' },
  { code: 'd24', name: 'D24 — Chaturvimsamsa', domain: 'Higher Learning' },
  { code: 'd27', name: 'D27 — Bhamsa', domain: 'Strengths & Weaknesses' },
  { code: 'd30', name: 'D30 — Trimsamsa', domain: 'Misfortunes & Debts' },
  { code: 'd40', name: 'D40 — Khavedamsa', domain: 'Maternal Lineage' },
  { code: 'd45', name: 'D45 — Akshavedamsa', domain: 'Paternal Lineage' },
  { code: 'd60', name: 'D60 — Shashtiamsa', domain: 'Past Life Karma' },
];

export const VargaExplorerPanel: React.FC<VargaExplorerPanelProps> = ({
  shodashavargaDetail = {},
  navamsaDeep,
  dasamshaDeep,
  chartStyle = 'north',
}) => {
  const [selectedVarga, setSelectedVarga] = useState<string>('d9');

  const currentChart = shodashavargaDetail[selectedVarga] || shodashavargaDetail['d9'];

  return (
    <div className="space-y-6">
      {/* Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {VARGA_LIST.map((v) => {
          const isSelected = selectedVarga === v.code;
          return (
            <button
              key={v.code}
              onClick={() => setSelectedVarga(v.code)}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition-all flex flex-col items-start gap-0.5 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-[#2A3441]'
              }`}
            >
              <span>{v.name}</span>
              <span className={`text-[10px] font-normal ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                {v.domain}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Varga Card */}
      {currentChart && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {currentChart.code} — {currentChart.sanskritName} ({currentChart.englishName})
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Lagna: {currentChart.ascendantSignName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentChart.domainSignification}</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Formula: {currentChart.formulaVersion}</span>
          </div>

          {/* Varga Planetary Placements Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A3441]">
                <tr>
                  <th className="py-2.5 px-4">Planet</th>
                  <th className="py-2.5 px-4">Sign in {currentChart.code}</th>
                  <th className="py-2.5 px-4">Sign Lord</th>
                  <th className="py-2.5 px-4">House in {currentChart.code}</th>
                  {selectedVarga === 'd9' && <th className="py-2.5 px-4 text-amber-300">Vargottama</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3441]/60">
                {currentChart.planets?.map((p: any) => (
                  <tr key={p.planet} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-bold text-white">{p.planet}</td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {p.signName} ({p.vedicSignName})
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{p.signLord}</td>
                    <td className="py-2.5 px-4 font-semibold text-cyan-300">H{p.houseInVarga}</td>
                    {selectedVarga === 'd9' && (
                      <td className="py-2.5 px-4">
                        {p.isVargottama ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ★ Vargottama
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPECIAL DEEP D9 NAVAMSA PANEL */}
      {selectedVarga === 'd9' && navamsaDeep && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1A1F2B] border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            Navamsa Deep Intelligence (Soul Dharma & Marital Axis)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-[#2A3441] space-y-2">
              <h4 className="font-bold text-white uppercase">7th House of Partnership in D9</h4>
              <p className="text-slate-300">
                Ruler: <strong className="text-cyan-300">{navamsaDeep.seventhHouseAnalysis.seventhLordD9}</strong>
              </p>
              <p className="text-slate-400">
                Occupants in D9 7th House: {navamsaDeep.seventhHouseAnalysis.occupants.join(', ') || 'Unoccupied'}
              </p>
              <p className="text-slate-400">
                Venus in D9: {navamsaDeep.seventhHouseAnalysis.venusPlacement.sign} (H{navamsaDeep.seventhHouseAnalysis.venusPlacement.house})
              </p>
              <p className="text-slate-400">
                Jupiter in D9: {navamsaDeep.seventhHouseAnalysis.jupiterPlacement.sign} (H{navamsaDeep.seventhHouseAnalysis.jupiterPlacement.house})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-[#2A3441] space-y-2">
              <h4 className="font-bold text-white uppercase">D1 + D9 Synthesis Themes</h4>
              <ul className="space-y-1 text-slate-300">
                {navamsaDeep.integratedD1D9Synthesis?.map((theme: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SPECIAL DEEP D10 DASAMSHA PANEL */}
      {selectedVarga === 'd10' && dasamshaDeep && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1A1F2B] border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Dasamsha Deep Career Intelligence (Status & Professional Karma)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-[#2A3441] space-y-2">
              <h4 className="font-bold text-white uppercase">Key Karaka Coordinates in D10</h4>
              <div className="space-y-1 text-slate-300">
                <div>Sun (Authority): H{dasamshaDeep.keyKarakas.sun.house} in {dasamshaDeep.keyKarakas.sun.sign}</div>
                <div>Saturn (Perseverance): H{dasamshaDeep.keyKarakas.saturn.house} in {dasamshaDeep.keyKarakas.saturn.sign}</div>
                <div>Mercury (Strategy): H{dasamshaDeep.keyKarakas.mercury.house} in {dasamshaDeep.keyKarakas.mercury.sign}</div>
                <div>Jupiter (Executive): H{dasamshaDeep.keyKarakas.jupiter.house} in {dasamshaDeep.keyKarakas.jupiter.sign}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-[#2A3441] space-y-2">
              <h4 className="font-bold text-white uppercase">Favorable Career Environments</h4>
              <ul className="space-y-1 text-slate-300">
                {dasamshaDeep.favorableEnvironments?.map((env: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">›</span>
                    <span>{env}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
