import React from 'react';
import { Sparkles, Heart, Compass, ShieldCheck, Star, Calendar, Flame, AlertCircle } from 'lucide-react';
import { NorthIndianChart } from '../charts/NorthIndianChart.js';
import { SouthIndianChart } from '../charts/SouthIndianChart.js';
import { EastIndianChart } from '../charts/EastIndianChart.js';
import { mapVargaChartToChartPlanets } from '../../utils/vargaChartMapper.js';
import { VargaChart, VargaPlanet } from '../../types/astrology.js';

interface NavamsaD9ViewProps {
  kundli: any;
  chartStyle: 'north' | 'south' | 'east';
  onRecalculate?: () => void;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function formatDegreeMinutes(degrees: number): string {
  if (isNaN(degrees)) return "00°00'";
  const deg = Math.floor(degrees % 30);
  const min = Math.floor((degrees - Math.floor(degrees)) * 60);
  return `${deg.toString().padStart(2, '0')}°${min.toString().padStart(2, '0')}'`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export const NavamsaD9View: React.FC<NavamsaD9ViewProps> = ({
  kundli,
  chartStyle,
  onRecalculate,
}) => {
  if (!kundli) return null;

  // Canonical D1 Ascendant
  const d1AscIndex = kundli.ascendant?.details?.signIndex ?? kundli.ascendant?.signIndex ?? 0;
  const d1AscSignName = kundli.ascendant?.details?.sign || ZODIAC_SIGNS[d1AscIndex];
  const d1AscDeg = kundli.ascendant?.degrees ?? 0;
  const d1LagnaFormatted = `${d1AscSignName} ${formatDegreeMinutes(d1AscDeg)}`;

  // Canonical D9 Varga Chart: strictly prioritize navamsaDeep.d9Chart or shodashavargaDetail.d9
  const d9Chart: VargaChart | undefined = kundli.navamsaDeep?.d9Chart || kundli.shodashavargaDetail?.d9 || kundli.shodashavarga?.d9;
  
  // D9 Ascendant: NEVER use D1 Ascendant
  const d9AscIndex = d9Chart?.ascendantSignIndex !== undefined ? d9Chart.ascendantSignIndex : ((d1AscIndex * 9) % 12);
  const d9AscSignName = d9Chart?.ascendantSignName || ZODIAC_SIGNS[d9AscIndex];
  // Projected D9 degree within Navamsa sign: (d1AscDeg % 3.333333) * 9
  const d9AscDeg = ((d1AscDeg % (30.0 / 9.0)) * 9.0);
  const d9LagnaFormatted = `${d9AscSignName} ${formatDegreeMinutes(d9AscDeg)}`;

  // Map planets for visual rendering
  const d1Planets = kundli.planets || [];
  const d9ChartPlanets = mapVargaChartToChartPlanets(d9Chart, d1Planets);

  // Check legacy calculation passport
  const isLegacyNode = kundli.passport && (
    kundli.passport.nodeModel === 'MEAN_NODE' ||
    !kundli.passport.nodeCalculationVersion ||
    kundli.passport.nodeCalculationVersion !== 'MEEUS_TRUE_NODE_V1'
  );

  // Dasha summary values
  const currentM = kundli.dashas?.currentMahadasha;
  const currentA = kundli.dashas?.currentAntardasha;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Legacy Node Notice if applicable */}
      {isLegacyNode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="font-bold block text-sm">Legacy Calculation Detected</strong>
              <span>This chart was created before the Meeus True Osculating Node upgrade. Recalculate to align D1 & D9 with sub-arcminute celestial precision.</span>
            </div>
          </div>
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold whitespace-nowrap"
            >
              Recalculate Chart
            </button>
          )}
        </div>
      )}

      {/* Header Quick Insights Bar */}
      <div className="p-5 rounded-2xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-[#131b2e] to-cosmic-surface flex flex-wrap items-center justify-between gap-4 shadow-cosmic-card">
        {/* Lagna Coordinate Summaries */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="space-y-0.5">
            <span className="text-[10px] text-cosmic-muted uppercase tracking-widest font-mono font-bold block">
              D1 Rashi Lagna
            </span>
            <span className="text-base font-extrabold text-cyan-300 font-display">
              {d1LagnaFormatted}
            </span>
            <span className="text-[10px] text-cosmic-muted block">
              Sign #{d1AscIndex + 1} &bull; Physical Self
            </span>
          </div>

          <div className="h-9 w-px bg-cosmic-border/60 hidden sm:block" />

          <div className="space-y-0.5">
            <span className="text-[10px] text-amber-300 uppercase tracking-widest font-mono font-bold block">
              D9 Navamsa Lagna
            </span>
            <span className="text-base font-extrabold text-amber-300 font-display">
              {d9LagnaFormatted}
            </span>
            <span className="text-[10px] text-cosmic-muted block">
              Sign #{d9AscIndex + 1} &bull; Soul Dharma & Marriage
            </span>
          </div>
        </div>

        {/* Current Active Dasha Capsule */}
        {currentM && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-cosmic-card border border-cyan-500/30">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-xs">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                Active Vimshottari Period
              </span>
              <span className="font-bold text-cosmic-text">
                {currentM.planet} / {currentA?.planet || '—'}
              </span>
              <span className="text-[10px] text-cosmic-muted ml-2">
                (Ends: {formatDate(currentA?.endDate || currentM.endDate)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Chart Comparison: Desktop Side-by-Side, Mobile Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: D1 Lagna / Rashi Chart */}
        <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/60 space-y-4 flex flex-col items-center shadow-cosmic-card">
          <div className="w-full flex items-center justify-between pb-3 border-b border-cosmic-border/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                D1 — LAGNA / RASHI CHART
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              Asc: {d1AscSignName} ({d1AscIndex + 1})
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            {chartStyle === 'north' && (
              <NorthIndianChart
                ascendantSignIndex={d1AscIndex}
                planets={d1Planets}
                size={390}
                lagnaLabel="LAGNA"
                chartTitle="D1 — Rashi"
              />
            )}
            {chartStyle === 'south' && (
              <SouthIndianChart
                ascendantSignIndex={d1AscIndex}
                planets={d1Planets}
                size={390}
                lagnaLabel="LAGNA"
                chartTitle="D1 — Rashi"
              />
            )}
            {chartStyle === 'east' && (
              <EastIndianChart
                ascendantSignIndex={d1AscIndex}
                planets={d1Planets}
                size={390}
                lagnaLabel="LAGNA"
                chartTitle="D1 — Rashi"
              />
            )}
          </div>
          <p className="text-[11px] text-cosmic-muted text-center italic">
            Physical embodiment, core personality, and worldly manifestations
          </p>
        </div>

        {/* RIGHT: D9 Navamsa Chart */}
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-cosmic-surface/60 space-y-4 flex flex-col items-center shadow-cosmic-card">
          <div className="w-full flex items-center justify-between pb-3 border-b border-cosmic-border/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                D9 — NAVAMSA CHART
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-300 font-semibold">
              D9 Asc: {d9AscSignName} ({d9AscIndex + 1})
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            {chartStyle === 'north' && (
              <NorthIndianChart
                ascendantSignIndex={d9AscIndex}
                planets={d9ChartPlanets}
                size={390}
                lagnaLabel="LAGNA — D9"
                chartTitle="D9 — Navamsa"
              />
            )}
            {chartStyle === 'south' && (
              <SouthIndianChart
                ascendantSignIndex={d9AscIndex}
                planets={d9ChartPlanets}
                size={390}
                lagnaLabel="LAGNA — D9"
                chartTitle="D9 — Navamsa"
              />
            )}
            {chartStyle === 'east' && (
              <EastIndianChart
                ascendantSignIndex={d9AscIndex}
                planets={d9ChartPlanets}
                size={390}
                lagnaLabel="LAGNA — D9"
                chartTitle="D9 — Navamsa"
              />
            )}
          </div>
          <p className="text-[11px] text-amber-200/70 text-center italic">
            Soul purpose, dharmic destiny, spouse characteristics, and second half of life
          </p>
        </div>
      </div>

      {/* D9 Planetary Placement Table */}
      <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface space-y-4 shadow-cosmic-card">
        <div className="flex items-center justify-between pb-3 border-b border-cosmic-border/60">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              D9 Navamsa Planetary Placement Table
            </h3>
            <p className="text-xs text-cosmic-muted mt-0.5">
              Exact harmonic sign and house positions computed strictly relative to D9 Ascendant ({d9AscSignName})
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 font-bold">
            9 Navagrahas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A3441]">
              <tr>
                <th className="py-3 px-4">Planet</th>
                <th className="py-3 px-4">D1 Sign</th>
                <th className="py-3 px-4">D9 Sign</th>
                <th className="py-3 px-4">D9 House</th>
                <th className="py-3 px-4">Degree</th>
                <th className="py-3 px-4">Nakshatra</th>
                <th className="py-3 px-4">Motion</th>
                <th className="py-3 px-4 text-amber-300">Vargottama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]/60">
              {d1Planets.map((baseP: any) => {
                const vargaP = d9Chart?.planets?.find((p) => p.planet === baseP.name);
                const d1SignIdx = Math.floor(Number(baseP.siderealLongitude || 0) / 30.0);
                const d1SignName = ZODIAC_SIGNS[d1SignIdx] || baseP.sign || '—';
                const d9SignIdx = vargaP ? vargaP.signIndex : 0;
                const d9SignName = vargaP ? vargaP.signName : '—';
                const d9House = vargaP ? vargaP.houseInVarga : (((d9SignIdx - d9AscIndex + 12) % 12) + 1);
                const isVargottama = vargaP?.isVargottama || (d1SignIdx === d9SignIdx);
                const degInSign = Number(baseP.siderealLongitude || 0) % 30.0;
                const nakName = baseP.nakshatraName || baseP.nakshatra?.name || '—';
                const pada = baseP.pada || baseP.nakshatra?.pada || '—';

                return (
                  <tr key={`d9-table-${baseP.name}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cosmic-card border border-cosmic-border flex items-center justify-center font-mono text-[11px] font-bold text-cyan-400">
                        {baseP.name.substring(0, 2)}
                      </span>
                      <span>{baseP.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {d1SignName} (#{d1SignIdx + 1})
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">
                      {d9SignName} (#{d9SignIdx + 1})
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      House {d9House}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatDegreeMinutes(degInSign)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {nakName} (P{pada})
                    </td>
                    <td className="py-3 px-4">
                      {baseP.isRetrograde ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          (R) Retrograde
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isVargottama ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-max shadow-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Vargottama</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* D9 Deep Intelligence Section */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#111827] via-[#151c2e] to-[#111827] space-y-6 shadow-cosmic-card">
        <div className="flex items-center justify-between pb-3 border-b border-cosmic-border/60">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>D9 Navamsa Deep Intelligence & Synthesis</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Classical Parashari
          </span>
        </div>

        {/* 4 Diagnostic Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: D9 Lagna Signification */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cosmic-border space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>D9 Lagna ({d9AscSignName})</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Ascendant in {d9AscSignName} indicates your core spiritual temperament and marital inclinations in the mature phase of life.
            </p>
          </div>

          {/* Card 2: 7th House Axis & Lord */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cosmic-border space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>D9 7th House & Ruler</span>
            </div>
            <p className="text-slate-300">
              Ruler:{' '}
              <strong className="text-cyan-300 font-bold">
                {kundli.navamsaDeep?.seventhHouseAnalysis?.seventhLordD9 || ZODIAC_SIGNS[(d9AscIndex + 6) % 12]}
              </strong>
            </p>
            <p className="text-slate-400 text-[11px]">
              Occupants: {kundli.navamsaDeep?.seventhHouseAnalysis?.occupants?.join(', ') || 'Unoccupied'}
            </p>
          </div>

          {/* Card 3: Venus & Jupiter Dignity */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cosmic-border space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Venus & Jupiter in D9</span>
            </div>
            <p className="text-slate-300">
              Venus: <strong className="text-purple-300 font-semibold">{kundli.navamsaDeep?.seventhHouseAnalysis?.venusPlacement?.sign || '—'} (H{kundli.navamsaDeep?.seventhHouseAnalysis?.venusPlacement?.house || '—'})</strong>
            </p>
            <p className="text-slate-300">
              Jupiter: <strong className="text-amber-300 font-semibold">{kundli.navamsaDeep?.seventhHouseAnalysis?.jupiterPlacement?.sign || '—'} (H{kundli.navamsaDeep?.seventhHouseAnalysis?.jupiterPlacement?.house || '—'})</strong>
            </p>
          </div>

          {/* Card 4: Vargottama Planets */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cosmic-border space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase">
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vargottama Planets</span>
            </div>
            {kundli.navamsaDeep?.vargottamaPlanets?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {kundli.navamsaDeep.vargottamaPlanets.map((pl: string) => (
                  <span key={pl} className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]">
                    ★ {pl}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">No planets posited in identical sign between D1 & D9.</p>
            )}
          </div>
        </div>

        {/* Pushkara Navamsa & Integrated Synthesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Pushkara Navamsa List */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cosmic-border space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Pushkara Navamsa Auspiciousness</span>
            </h4>
            <div className="space-y-2">
              {kundli.navamsaDeep?.pushkaraPlanets?.filter((p: any) => p.isPushkara)?.length > 0 ? (
                kundli.navamsaDeep.pushkaraPlanets
                  .filter((p: any) => p.isPushkara)
                  .map((p: any) => (
                    <div key={p.planet} className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{p.planet} in {p.navamsaSign}</span>
                      <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">Pushkara Blessed</span>
                    </div>
                  ))
              ) : (
                <p className="text-slate-400 leading-relaxed">
                  No planets posited in classical Pushkara Navamsa degrees. Planets derive strength through natural house dignity and Shadbala.
                </p>
              )}
            </div>
          </div>

          {/* D1 + D9 Integrated Synthesis */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cosmic-border space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>D1 + D9 Integrated Synthesis Themes</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              {kundli.navamsaDeep?.integratedD1D9Synthesis?.map((theme: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{theme}</span>
                </li>
              )) || (
                <li className="text-slate-400">Synthesis available on full chart generation.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
