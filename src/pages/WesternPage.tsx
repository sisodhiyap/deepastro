import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Eye, ShieldCheck, Heart, User, Layers, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';
import { getBirthProfile } from '../utils/birthStorage.js';

export const WesternPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chart' | 'aspects' | 'synastry' | 'archetypes'>('chart');
  const [houseSystem, setHouseSystem] = useState<'Placidus' | 'WholeSign' | 'Equal'>('Placidus');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [synastryResult, setSynastryResult] = useState<any>(null);
  const [archetypeResult, setArchetypeResult] = useState<any>(null);

  // Partner data for synastry
  const [partnerDate, setPartnerDate] = useState('1996-05-15');
  const [partnerTime, setPartnerTime] = useState('14:30');
  const [partnerName, setPartnerName] = useState('Partner Solar');

  const profile = getBirthProfile();

  const fetchWesternChart = async () => {
    setLoading(true);
    try {
      const birthDate = profile?.birthDate || '1995-10-24';
      const birthTime = profile?.birthTime || '11:45';
      const latitude = profile?.latitude || 28.6139;
      const longitude = profile?.longitude || 77.2090;

      const res = await fetch('/api/astrology/western/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude, houseSystem })
      });
      const data = await res.json();
      if (data.chart) {
        setChartData(data.chart);
        // Also fetch archetypes
        const archRes = await fetch('/api/astrology/western/archetypes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart: data.chart })
        });
        const archData = await archRes.json();
        if (archData.profile) setArchetypeResult(archData.profile);
      }
    } catch (err) {
      console.error('Failed to load Western chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWesternChart();
  }, [houseSystem]);

  const handleRunSynastry = async () => {
    if (!chartData) return;
    try {
      // Calculate partner chart first
      const pRes = await fetch('/api/astrology/western/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate: partnerDate, birthTime: partnerTime, latitude: 19.076, longitude: 72.877, houseSystem: 'Placidus' })
      });
      const pData = await pRes.json();
      if (pData.chart) {
        const synRes = await fetch('/api/astrology/western/synastry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personA: { name: profile?.name || 'Primary Seeker', chart: chartData },
            personB: { name: partnerName, chart: pData.chart }
          })
        });
        const synData = await synRes.json();
        if (synData.synastry) setSynastryResult(synData.synastry);
      }
    } catch (err) {
      console.error('Failed to compute synastry:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3441] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              DEEPASTRO 6.0 TROPICAL ENGINE
            </span>
            <span className="text-xs text-slate-400">Swiss Ephemeris Precision • Placidus Semi-Arc</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Western Tropical Astrology & Aspect Matrix
          </h1>
          <p className="text-sm text-slate-400">
            High-precision Tropical coordinates, Placidus/Whole/Equal cusps, geometric aspect mechanics, and psychological archetypes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">House System:</label>
          <select
            value={houseSystem}
            onChange={(e) => setHouseSystem(e.target.value as any)}
            className="bg-[#111827] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="Placidus">Placidus (Time Semi-Arc)</option>
            <option value="WholeSign">Whole Sign (Equal 30° Signs)</option>
            <option value="Equal">Equal House (30° from Ascendant)</option>
          </select>
          <button
            onClick={fetchWesternChart}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3441] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('chart')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeSubTab === 'chart'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tropical Natal Chart
        </button>
        <button
          onClick={() => setActiveSubTab('aspects')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeSubTab === 'aspects'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Geometric Aspects ({chartData?.aspects?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('archetypes')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeSubTab === 'archetypes'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Psychological Archetypes
        </button>
        <button
          onClick={() => setActiveSubTab('synastry')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeSubTab === 'synastry'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Synastry & Inter-Aspects
        </button>
      </div>

      {/* Tab 1: Tropical Chart */}
      {activeSubTab === 'chart' && chartData && (
        <div className="space-y-6">
          {/* Angles Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Ascendant (ASC)</span>
              <div className="text-base font-bold text-cyan-400 mt-0.5">
                {chartData.angles.ascendant.sign} {chartData.angles.ascendant.degree.toFixed(2)}°
              </div>
              <div className="text-[11px] text-slate-500">1st House Cusp</div>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Midheaven (MC)</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {chartData.angles.midheaven.sign} {chartData.angles.midheaven.degree.toFixed(2)}°
              </div>
              <div className="text-[11px] text-slate-500">10th House Cusp / Zenith</div>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Descendant (DSC)</span>
              <div className="text-base font-bold text-purple-400 mt-0.5">
                {chartData.angles.descendant.sign} {chartData.angles.descendant.degree.toFixed(2)}°
              </div>
              <div className="text-[11px] text-slate-500">7th House Cusp / Other</div>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Imum Coeli (IC)</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {chartData.angles.imumCoeli.sign} {chartData.angles.imumCoeli.degree.toFixed(2)}°
              </div>
              <div className="text-[11px] text-slate-500">4th House Cusp / Root</div>
            </div>
          </div>

          {/* Planetary Table */}
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Tropical Planetary Longitudes & House Placements
              </h3>
              <span className="text-xs text-slate-400">10 Primary Celestial Bodies + Chiron & North Node</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1F2B] text-slate-400 border-b border-[#2A3441]">
                  <tr>
                    <th className="p-3">Celestial Body</th>
                    <th className="p-3">Sign</th>
                    <th className="p-3">Degree</th>
                    <th className="p-3">House</th>
                    <th className="p-3">Motion</th>
                    <th className="p-3">Element</th>
                    <th className="p-3">Modality</th>
                    <th className="p-3">Dignity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3441]/50 text-slate-300">
                  {chartData.planets.map((p: any) => (
                    <tr key={p.name} className="hover:bg-[#1A1F2B]/40 transition">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <span className="text-base text-cyan-400 font-serif">{p.symbol}</span>
                        {p.name}
                      </td>
                      <td className="p-3 font-medium text-slate-200">{p.sign}</td>
                      <td className="p-3 font-mono text-cyan-300">
                        {p.degreeInSign.toFixed(2)}° ({p.minutes}' {p.seconds}")
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          H{p.house}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.isRetrograde ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800 text-[10px] font-bold">
                            RETROGRADE ({p.speed}°/d)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[11px]">Direct ({p.speed}°/d)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.element === 'Fire' ? 'bg-amber-950 text-amber-400' :
                          p.element === 'Earth' ? 'bg-emerald-950 text-emerald-400' :
                          p.element === 'Air' ? 'bg-sky-950 text-sky-400' : 'bg-blue-950 text-blue-400'
                        }`}>
                          {p.element}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{p.modality}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-medium ${
                          p.dignity === 'Rulership' ? 'text-amber-400 font-bold' :
                          p.dignity === 'Exaltation' ? 'text-cyan-400 font-bold' :
                          p.dignity === 'Detriment' || p.dignity === 'Fall' ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {p.dignity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Geometric Aspects */}
      {activeSubTab === 'aspects' && chartData && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Geometric Planetary Aspects</h3>
            <p className="text-xs text-slate-400 mb-4">
              Major classical aspect relationships calculated with applying vs separating orb mechanics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chartData.aspects.map((asp: any, idx: number) => (
                <div key={idx} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">
                      {asp.planet1} ⇄ {asp.planet2}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asp.aspectType === 'Trine' || asp.aspectType === 'Sextile'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : asp.aspectType === 'Square' || asp.aspectType === 'Opposition'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {asp.aspectType} ({asp.exactAngle}°)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Actual: {asp.actualAngle}°</span>
                    <span className="font-mono text-cyan-400">Orb: {asp.orb}°</span>
                    <span className={`text-[10px] font-semibold ${asp.isApplying ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {asp.isApplying ? 'Applying (Tightening)' : 'Separating (Waning)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Psychological Archetypes */}
      {activeSubTab === 'archetypes' && archetypeResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-xs text-amber-400 font-semibold font-mono uppercase">The Solar Ego & Drive</span>
              <h4 className="text-lg font-bold text-white">{archetypeResult.bigThree.sun.theme}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{archetypeResult.bigThree.sun.coreDrive}</p>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-xs text-cyan-400 font-semibold font-mono uppercase">The Lunar Emotional Need</span>
              <h4 className="text-lg font-bold text-white">{archetypeResult.bigThree.moon.theme}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{archetypeResult.bigThree.moon.emotionalNeed}</p>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-2">
              <span className="text-xs text-purple-400 font-semibold font-mono uppercase">The Ascending Interface</span>
              <h4 className="text-lg font-bold text-white">{archetypeResult.bigThree.ascendant.theme}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{archetypeResult.bigThree.ascendant.outwardStyle}</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Archetypal Vectors of Consciousness</h3>
            <div className="space-y-3">
              {archetypeResult.keyArchetypes.map((ka: any, idx: number) => (
                <div key={idx} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">{ka.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">{ka.placement}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{ka.narrative}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-300/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{archetypeResult.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Tab 4: Synastry */}
      {activeSubTab === 'synastry' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Compare With Partner (Synastry Inter-Aspects)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">Partner Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs rounded px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Birth Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={partnerDate}
                  onChange={(e) => setPartnerDate(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs rounded px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Birth Time</label>
                <input
                  type="time"
                  value={partnerTime}
                  onChange={(e) => setPartnerTime(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs rounded px-3 py-2 text-white mt-1"
                />
              </div>
            </div>
            <button
              onClick={handleRunSynastry}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
            >
              Compute Synastry Resonance
            </button>
          </div>

          {synastryResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Harmonious Resonance</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{synastryResult.resonanceMetrics.harmoniousScore}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Magnetic Chemistry</span>
                  <div className="text-xl font-bold text-purple-400 mt-1">{synastryResult.resonanceMetrics.chemistryScore}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Intellectual Communication</span>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{synastryResult.resonanceMetrics.communicationScore}%</div>
                </div>
                <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-3.5 text-center">
                  <span className="text-[11px] text-slate-400">Dynamic Growth Edge</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">{synastryResult.resonanceMetrics.dynamicGrowthScore}%</div>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-white mb-3">Calculated Cross-Chart Inter-Aspects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                  {synastryResult.interAspects.map((asp: any, idx: number) => (
                    <div key={idx} className="bg-[#1A1F2B] border border-[#2A3441] rounded p-2.5 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{asp.theme}</span>
                        <div className="text-[11px] text-slate-400">{asp.planetA} ⇄ {asp.planetB}</div>
                      </div>
                      <span className="font-mono text-cyan-400 text-xs">{asp.actualAngle}° (Orb {asp.orb}°)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400">
                {synastryResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WesternPage;
