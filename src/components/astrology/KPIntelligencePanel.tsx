import React, { useState } from 'react';
import { getBirthProfile } from '../../utils/birthStorage.js';
import {
  Compass,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

interface KPIntelligencePanelProps {
  kpData: any;
  chartStyle?: 'north' | 'south' | 'east';
  onShowEvidence?: () => void;
}

export const KPIntelligencePanel: React.FC<KPIntelligencePanelProps> = ({
  kpData,
  chartStyle = 'north',
  onShowEvidence,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cusps' | 'sublords' | 'matrix' | 'promises' | 'timing' | 'ruling' | 'prashna' | 'rectify'
  >('cusps');

  const [expandedCell, setExpandedCell] = useState<{ house: number; planet: string } | null>(null);

  // Prashna Form State
  const [prashnaQuestion, setPrashnaQuestion] = useState('Will this professional project succeed?');
  const [prashnaSeed, setPrashnaSeed] = useState(108);
  const [prashnaResult, setPrashnaResult] = useState<any>(null);
  const [isPrashnaLoading, setIsPrashnaLoading] = useState(false);

  // Rectification Form State
  const [knownEvents, setKnownEvents] = useState([
    { domain: 'CAREER', eventDate: '2021-06-15', description: 'Major Career Transition' },
    { domain: 'MARRIAGE', eventDate: '2023-11-20', description: 'Marriage / Solemnization' },
  ]);
  const [rectificationResult, setRectificationResult] = useState<any>(null);
  const [isRectifying, setIsRectifying] = useState(false);

  if (!kpData || kpData.status === 'KP_NOT_AVAILABLE') {
    return (
      <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-lg">KP Stellar Intelligence Restricted</h3>
        </div>
        <p className="text-sm opacity-90 leading-relaxed">
          Krishnamurti Paddhati (KP) sub-lord calculations mandate high birth-time precision (accuracy &lt; 1 minute).
          The profile is marked as approximate birth time, which invalidates micro-cuspal sub-lord boundaries.
        </p>
      </div>
    );
  }

  const cusps: any[] = kpData.cusps || [];
  const planets: any[] = kpData.planets || [];
  const matrix: any[] = kpData.matrix || [];
  const rp = kpData.rulingPlanets;
  const eventPromises = kpData.eventPromises || {};
  const eventWindows = kpData.eventWindows || [];

  const handleRunPrashna = async () => {
    setIsPrashnaLoading(true);
    try {
      const res = await fetch('/api/astrology/prashna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prashnaQuestion,
          seedNumber: prashnaSeed,
          latitude: kpData.metadata?.latitude || 28.6139,
          longitude: kpData.metadata?.longitude || 77.209,
          timezone: 5.5,
          targetDomain: 'CAREER',
        }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setPrashnaResult(data.prashna);
      }
    } catch (e) {
      console.error('Prashna failed', e);
    } finally {
      setIsPrashnaLoading(false);
    }
  };

  const handleRunRectification = async () => {
    setIsRectifying(true);
    try {
      const res = await fetch('/api/astrology/rectification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: kpData.metadata?.birthDate || getBirthProfile()?.birthDate || getBirthProfile()?.date || '1995-05-15',
          birthTime: kpData.metadata?.birthTime || getBirthProfile()?.birthTime || getBirthProfile()?.time || '12:00',
          latitude: kpData.metadata?.latitude || 28.6139,
          longitude: kpData.metadata?.longitude || 77.209,
          timezone: 5.5,
          knownEvents,
          windowMinutes: 30,
        }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setRectificationResult(data.rectification);
      }
    } catch (e) {
      console.error('Rectification failed', e);
    } finally {
      setIsRectifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KP Header Sub-nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3441]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              KP STELLAR INTELLIGENCE
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Placidus • Sub-Lord 249
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic Cuspal Sub-Lord (CSL) and 4-Level Significator Engine
            </p>
          </div>
        </div>

        {onShowEvidence && (
          <button
            onClick={onShowEvidence}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            SHOW EVIDENCE CHAIN
          </button>
        )}
      </div>

      {/* KP Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2A3441] pb-3">
        {[
          { id: 'cusps', label: '12 CUSPS (CSL)' },
          { id: 'sublords', label: 'PLANETARY SUBS' },
          { id: 'matrix', label: 'SIGNIFICATOR MATRIX' },
          { id: 'promises', label: 'EVENT PROMISES' },
          { id: 'timing', label: 'EVENT TIMING' },
          { id: 'ruling', label: 'RULING PLANETS' },
          { id: 'prashna', label: 'KP PRASHNA (1–249)' },
          { id: 'rectify', label: 'RECTIFICATION' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              activeSubTab === tab.id
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-[#1A1F2B] text-slate-400 hover:text-white border border-[#2A3441]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 12 CUSPS TABLE */}
      {activeSubTab === 'cusps' && (
        <div className="rounded-2xl bg-[#111827] border border-[#2A3441] overflow-hidden">
          <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              12 Placidus House Cusps & Sub-Lord Hierarchy
            </h3>
            <span className="text-xs text-slate-400">Continuous Vimshottari Fractions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A3441]">
                <tr>
                  <th className="py-3 px-4">Cusp</th>
                  <th className="py-3 px-4">Sidereal Longitude</th>
                  <th className="py-3 px-4">Sign</th>
                  <th className="py-3 px-4">Sign Lord</th>
                  <th className="py-3 px-4">Nakshatra</th>
                  <th className="py-3 px-4">Star Lord</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">Sub Lord (CSL)</th>
                  <th className="py-3 px-4">Sub-Sub Lord</th>
                  <th className="py-3 px-4">Span</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3441]/60">
                {cusps.map((c) => (
                  <tr key={c.cusp} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">House {c.cusp}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {Math.floor(c.longitude)}° {Math.floor((c.longitude % 1) * 60)}' {Math.floor((((c.longitude % 1) * 60) % 1) * 60)}"
                    </td>
                    <td className="py-3 px-4 text-slate-200">{c.sign}</td>
                    <td className="py-3 px-4 text-slate-300">{c.signLord}</td>
                    <td className="py-3 px-4 text-slate-300">{c.nakshatra} (P{c.pada})</td>
                    <td className="py-3 px-4 text-slate-300">{c.starLord}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300 bg-cyan-500/5">{c.subLord}</td>
                    <td className="py-3 px-4 text-slate-400">{c.subSubLord}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{c.houseSpan?.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PLANETARY SUB-LORDS */}
      {activeSubTab === 'sublords' && (
        <div className="rounded-2xl bg-[#111827] border border-[#2A3441] overflow-hidden">
          <div className="p-4 border-b border-[#2A3441]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              KP Planetary Coordinates & Stellar Governance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A3441]">
                <tr>
                  <th className="py-3 px-4">Planet</th>
                  <th className="py-3 px-4">KP Longitude</th>
                  <th className="py-3 px-4">Placidus House</th>
                  <th className="py-3 px-4">Sign</th>
                  <th className="py-3 px-4">Sign Lord</th>
                  <th className="py-3 px-4">Nakshatra</th>
                  <th className="py-3 px-4">Star Lord</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">Sub Lord</th>
                  <th className="py-3 px-4">Houses Owned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3441]/60">
                {planets.map((p) => (
                  <tr key={p.planet} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                      {p.planet}
                      {p.isRetrograde && (
                        <span className="text-[10px] text-amber-400 font-mono">(R)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.formattedDegree}</td>
                    <td className="py-3 px-4 font-semibold text-white">H{p.houseOccupied}</td>
                    <td className="py-3 px-4 text-slate-200">{p.sign}</td>
                    <td className="py-3 px-4 text-slate-300">{p.signLord}</td>
                    <td className="py-3 px-4 text-slate-300">{p.nakshatra}</td>
                    <td className="py-3 px-4 text-slate-300">{p.starLord}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300 bg-cyan-500/5">{p.subLord}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {p.housesOwned?.length > 0 ? p.housesOwned.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 12x9 SIGNIFICATOR MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111827] border border-[#2A3441] overflow-hidden">
            <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  12 Houses × 9 Planets Significator Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any cell to inspect the exact 4-level audit trail
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">✓</span> Primary (L1/L2)
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">○</span> Secondary (L3/L4)
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-600 font-bold">—</span> None
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A3441]">
                  <tr>
                    <th className="py-3 px-4 text-left">House</th>
                    {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map((pl) => (
                      <th key={pl} className="py-3 px-2">
                        {pl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3441]/60">
                  {matrix.map((row) => (
                    <tr key={row.house} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-white text-left">
                        House {row.house}
                      </td>
                      {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map((pl) => {
                        const cell = row.planets?.[pl];
                        const isPrimary = cell?.grade === 'PRIMARY';
                        const isSecondary = cell?.grade === 'SECONDARY';

                        return (
                          <td
                            key={pl}
                            onClick={() => setExpandedCell({ house: row.house, planet: pl })}
                            className={`py-2.5 px-2 cursor-pointer transition-all ${
                              isPrimary
                                ? 'text-emerald-400 font-bold bg-emerald-500/10 hover:bg-emerald-500/20'
                                : isSecondary
                                ? 'text-cyan-400 font-semibold bg-cyan-500/5 hover:bg-cyan-500/15'
                                : 'text-slate-600 hover:bg-slate-800/40'
                            }`}
                          >
                            {cell?.symbol || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drill-down Detail Modal/Card */}
          {expandedCell && (
            <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-cyan-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Audit Trace: {expandedCell.planet} → House {expandedCell.house}
                </h4>
                <button
                  onClick={() => setExpandedCell(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <div className="text-xs text-slate-300 space-y-1 pt-1">
                {matrix
                  .find((r) => r.house === expandedCell.house)
                  ?.planets?.[expandedCell.planet]?.reasons?.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{r}</span>
                    </div>
                  )) || <div>No direct significator link identified.</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EVENT PROMISES */}
      {activeSubTab === 'promises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(eventPromises).map(([domain, prom]: [string, any]) => {
            const isFavorable = prom.status === 'PROMISED' || prom.status === 'FAVORABLE';
            const isDelayed = prom.status === 'DELAYED';
            const isDenied = prom.status === 'DENIED';

            return (
              <div
                key={domain}
                className={`p-5 rounded-2xl border transition-all ${
                  isFavorable
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isDelayed
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isDenied
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-[#111827] border-[#2A3441]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{prom.title}</h4>
                    <p className="text-xs text-slate-400">
                      Primary Cusp: H{prom.primaryCusp} (CSL: <span className="text-cyan-300 font-semibold">{prom.cuspSubLord}</span>)
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                      isFavorable
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isDelayed
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isDenied
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {prom.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 mb-3">
                  {prom.evidence?.map((ev: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Confidence: {(prom.confidence * 100).toFixed(0)}%</span>
                  <span className="italic">{prom.traditionalBasis}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: EVENT TIMING WINDOWS */}
      {activeSubTab === 'timing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3441]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Ranked Astrological Timing Windows
            </h3>
            <p className="text-xs text-slate-400">
              Convergence of Mahadasha, Bhukti (Antardasha), and Antara with KP significators.
            </p>
          </div>

          <div className="space-y-3">
            {eventWindows.map((win: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#111827] border border-[#2A3441] hover:border-cyan-500/40 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {win.windowLabel}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {new Date(win.startDate).toLocaleDateString()} — {new Date(win.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Convergence Score: <strong className="text-white">{win.convergenceScore}/100</strong>
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-1">
                  <span>
                    MD: <strong className="text-white">{win.mahadashaLord}</strong>
                  </span>
                  <span>
                    AD: <strong className="text-white">{win.bhuktiLord}</strong>
                  </span>
                  <span>
                    PD: <strong className="text-white">{win.antaraLord}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  {win.evidence?.map((ev: string, i: number) => (
                    <div key={i}>• {ev}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RULING PLANETS */}
      {activeSubTab === 'ruling' && rp && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3441] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Ruling Planets (RP Snapshot)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ruleset: {rp.ruleset} • Moment of Query</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">{new Date(rp.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-center">
              <span className="text-[10px] text-slate-400 uppercase">Day Lord (Vara)</span>
              <p className="text-sm font-bold text-white mt-1">{rp.weekdayLord}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-center">
              <span className="text-[10px] text-slate-400 uppercase">Asc Sign Lord</span>
              <p className="text-sm font-bold text-white mt-1">{rp.ascendantSignLord}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-center">
              <span className="text-[10px] text-slate-400 uppercase">Asc Star Lord</span>
              <p className="text-sm font-bold text-cyan-300 mt-1">{rp.ascendantStarLord}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-center">
              <span className="text-[10px] text-slate-400 uppercase">Moon Sign Lord</span>
              <p className="text-sm font-bold text-white mt-1">{rp.moonSignLord}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-center">
              <span className="text-[10px] text-slate-400 uppercase">Moon Star Lord</span>
              <p className="text-sm font-bold text-cyan-300 mt-1">{rp.moonStarLord}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <strong>Consolidated Priority RP Hierarchy: </strong>
            {rp.rulingPlanets?.join(' → ')}
          </div>
        </div>
      )}

      {/* TAB 7: KP PRASHNA 1-249 */}
      {activeSubTab === 'prashna' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              KP Horary (Prashna) 1–249 Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly isolated from natal chart. Seed number fixes the Ascendant sub-division.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Query / Question</label>
              <input
                type="text"
                value={prashnaQuestion}
                onChange={(e) => setPrashnaQuestion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seed Number (1–249)</label>
              <input
                type="number"
                min="1"
                max="249"
                value={prashnaSeed}
                onChange={(e) => setPrashnaSeed(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-white text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleRunPrashna}
            disabled={isPrashnaLoading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isPrashnaLoading ? 'Calculating Horary Chart...' : 'Cast Horary Chart'}
          </button>

          {prashnaResult && (
            <div className="p-4 rounded-xl bg-[#1A1F2B] border border-cyan-500/30 space-y-2 mt-4">
              <h4 className="text-xs font-bold text-white uppercase">
                Prashna Result for Seed #{prashnaResult.seedNumber}
              </h4>
              <p className="text-xs text-slate-300">
                Ascendant Cusp: {prashnaResult.horaryAscendant?.sign} ({prashnaResult.horaryAscendant?.nakshatra}) • Star Lord: {prashnaResult.horaryAscendant?.starLord} • CSL: <strong className="text-cyan-300">{prashnaResult.horaryAscendant?.subLord}</strong>
              </p>
              {prashnaResult.eventPromise && (
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  Domain Status: <strong className="text-emerald-400">{prashnaResult.eventPromise.status}</strong> ({prashnaResult.eventPromise.strengthScore}% strength)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: BIRTH TIME RECTIFICATION */}
      {activeSubTab === 'rectify' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Birth Time Rectification Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Correlates known life milestones against temporal sub-lord shifts across ±15 to ±30 minutes.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Recorded Life Events</label>
            {knownEvents.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-[#1A1F2B] border border-[#2A3441] text-cyan-300 font-mono">
                  {ev.domain}
                </span>
                <span className="px-2 py-1 rounded bg-[#1A1F2B] border border-[#2A3441] text-slate-300 font-mono">
                  {ev.eventDate}
                </span>
                <span className="text-slate-400">{ev.description}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRunRectification}
            disabled={isRectifying}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {isRectifying ? 'Analyzing Candidate Timings...' : 'Run Candidate Rectification'}
          </button>

          {rectificationResult && (
            <div className="p-4 rounded-xl bg-[#1A1F2B] border border-cyan-500/30 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase">Best-Fit Birth Time Window</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Confidence: {(rectificationResult.bestFitWindow.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-lg font-mono font-extrabold text-cyan-300">
                {rectificationResult.bestFitWindow.recommendedTime}
              </div>
              <p className="text-xs text-slate-400">
                Sensitivity Rating: <strong className="text-white">{rectificationResult.sensitivity}</strong>.
                Presented as an astrological inference, not historical certainty.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
