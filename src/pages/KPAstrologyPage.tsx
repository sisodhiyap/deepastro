import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Compass, Target, HelpCircle, RefreshCw, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { getBirthProfile } from '../utils/birthStorage.js';

export const KPAstrologyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cusps' | 'significators' | 'prashna' | 'btr' | 'promise'>('cusps');
  const [kpChart, setKpChart] = useState<any>(null);
  const [significators, setSignificators] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Prashna state
  const [horaryNumber, setHoraryNumber] = useState(108);
  const [prashnaResult, setPrashnaResult] = useState<any>(null);

  // Event Promise state
  const [selectedEvent, setSelectedEvent] = useState('JOB_PROMOTION');
  const [eventPromiseResult, setEventPromiseResult] = useState<any>(null);

  // BTR state
  const [btrResult, setBtrResult] = useState<any>(null);

  const profile = getBirthProfile();

  const loadKPData = async () => {
    setLoading(true);
    try {
      const birthDate = profile?.birthDate || '1995-10-24';
      const birthTime = profile?.birthTime || '11:45';
      const latitude = profile?.latitude || 28.6139;
      const longitude = profile?.longitude || 77.2090;

      // 1. Fetch KP Chart
      const chartRes = await fetch('/api/astrology/kp-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude })
      });
      const cData = await chartRes.json();
      if (cData.kpChart) setKpChart(cData.kpChart);

      // 2. Fetch Significators
      const sigRes = await fetch('/api/astrology/kp-significators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude })
      });
      const sData = await sigRes.json();
      if (sData.significators) setSignificators(sData.significators);

      // 3. Fetch BTR
      const btrRes = await fetch('/api/astrology/kp-btr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude })
      });
      const bData = await btrRes.json();
      if (bData.btr) setBtrResult(bData.btr);
    } catch (err) {
      console.error('Failed to load KP data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPData();
  }, []);

  const handleRunPrashna = async () => {
    try {
      const res = await fetch('/api/astrology/kp-prashna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horaryNumber,
          latitude: profile?.latitude || 28.6139,
          longitude: profile?.longitude || 77.2090
        })
      });
      const data = await res.json();
      if (data.prashna) setPrashnaResult(data.prashna);
    } catch (err) {
      console.error('Prashna execution error:', err);
    }
  };

  const handleTestPromise = async () => {
    try {
      const res = await fetch('/api/astrology/event-promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventRuleId: selectedEvent,
          birthDate: profile?.birthDate || '1995-10-24',
          birthTime: profile?.birthTime || '11:45',
          latitude: profile?.latitude || 28.6139,
          longitude: profile?.longitude || 77.2090
        })
      });
      const data = await res.json();
      if (data.promise) setEventPromiseResult(data.promise);
    } catch (err) {
      console.error('Event promise error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3441] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              DEEPASTRO 6.0 KP PRECISION SYSTEM
            </span>
            <span className="text-xs text-slate-400">Krishnamurti Padhdhati • 249 Sub Table Calculus</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            KP Astrology & Cuspal Sub-Lord Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Deterministic Placidus house cusps, 4-tier significator hierarchy matrix, ruling planets, Prashna horary, and event promise calculus.
          </p>
        </div>

        <button
          onClick={loadKPData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate Cusps
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3441] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cusps')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'cusps'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          12 Placidus Cusps & Sub-Lords
        </button>
        <button
          onClick={() => setActiveTab('significators')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'significators'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4-Level Significators
        </button>
        <button
          onClick={() => setActiveTab('promise')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'promise'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Event Promise Verification
        </button>
        <button
          onClick={() => setActiveTab('prashna')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'prashna'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          KP Prashna Horary (1-249)
        </button>
        <button
          onClick={() => setActiveTab('btr')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'btr'
              ? 'bg-[#1A1F2B] text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Birth Time Rectification (BTR)
        </button>
      </div>

      {/* Tab 1: Cusps */}
      {activeTab === 'cusps' && kpChart && (
        <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              12 Placidus House Cusps (KP Ayanamsha)
            </h3>
            <span className="text-xs text-slate-400">Sign Lord • Star Lord • Sub Lord • Sub-Sub Lord</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1F2B] text-slate-400 border-b border-[#2A3441]">
                <tr>
                  <th className="p-3">Cusp</th>
                  <th className="p-3">Longitude</th>
                  <th className="p-3">Sign</th>
                  <th className="p-3">Sign Lord</th>
                  <th className="p-3">Nakshatra</th>
                  <th className="p-3">Star Lord</th>
                  <th className="p-3 text-cyan-400 font-bold">Sub Lord</th>
                  <th className="p-3">Sub-Sub Lord</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3441]/50 text-slate-300 font-mono">
                {kpChart.cusps?.map((c: any) => (
                  <tr key={c.cuspNumber} className="hover:bg-[#1A1F2B]/40 transition">
                    <td className="p-3 font-bold text-white">House {c.cuspNumber}</td>
                    <td className="p-3 text-cyan-300">{c.degreeFormatted || c.longitude?.toFixed(2) + '°'}</td>
                    <td className="p-3 font-sans text-slate-200">{c.signName}</td>
                    <td className="p-3 font-sans">{c.signLord}</td>
                    <td className="p-3 font-sans text-slate-400">{c.nakshatraName}</td>
                    <td className="p-3 font-sans text-amber-300">{c.starLord}</td>
                    <td className="p-3 font-sans text-cyan-400 font-bold bg-cyan-950/20">{c.subLord}</td>
                    <td className="p-3 font-sans text-purple-300">{c.subSubLord || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 4-Level Significators */}
      {activeTab === 'significators' && significators && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">4-Level Planetary Significator Hierarchy</h3>
            <p className="text-xs text-slate-400 mb-4">
              Level 1 (Strongest: Planet in star of house occupant) ➔ Level 2 (House occupant) ➔ Level 3 (Planet in star of house owner) ➔ Level 4 (House owner).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(significators.planetarySignificators || {}).map(([planet, sigs]: [string, any]) => (
                <div key={planet} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2A3441] pb-1.5">
                    <span className="font-bold text-white text-xs">{planet}</span>
                    <span className="text-[10px] text-slate-400">All Levels: {sigs.allHouses?.join(', ') || 'None'}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-cyan-400">Level 1 (Star of Occ):</span> <span className="font-mono text-white">{sigs.level1?.join(', ') || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-emerald-400">Level 2 (Occupant):</span> <span className="font-mono text-white">{sigs.level2?.join(', ') || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-amber-400">Level 3 (Star of Owner):</span> <span className="font-mono text-white">{sigs.level3?.join(', ') || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-purple-400">Level 4 (Owner):</span> <span className="font-mono text-white">{sigs.level4?.join(', ') || '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Event Promise */}
      {activeTab === 'promise' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">KP Life Event Promise Calculus</h3>
            <p className="text-xs text-slate-400">
              Evaluates primary cusp sub-lord connectivity against supporting houses vs detrimental negation houses.
            </p>
            <div className="flex items-center gap-3">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-[#1A1F2B] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2"
              >
                <option value="JOB_PROMOTION">Career Promotion (H2, H6, H10, H11)</option>
                <option value="FOREIGN_TRAVEL">Foreign Relocation (H3, H9, H12)</option>
                <option value="MARRIAGE_UNION">Marriage Union (H2, H7, H11)</option>
                <option value="PROPERTY_PURCHASE">Real Estate Purchase (H4, H11, H12)</option>
                <option value="HIGHER_EDUCATION">Higher Education / Doctorate (H4, H9, H11)</option>
              </select>
              <button
                onClick={handleTestPromise}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
              >
                Verify Cuspal Promise
              </button>
            </div>

            {eventPromiseResult && (
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-xl p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{eventPromiseResult.ruleName}</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    eventPromiseResult.status === 'PROMISED_POSITIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {eventPromiseResult.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{eventPromiseResult.summary}</div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-[#111827] p-2.5 rounded">
                    <span className="text-emerald-400 font-semibold">Supporting Houses Active:</span>
                    <div className="font-mono text-slate-200 mt-1">{eventPromiseResult.supportingHouses?.join(', ') || 'None'}</div>
                  </div>
                  <div className="bg-[#111827] p-2.5 rounded">
                    <span className="text-rose-400 font-semibold">Detrimental Houses:</span>
                    <div className="font-mono text-slate-200 mt-1">{eventPromiseResult.detrimentalHouses?.join(', ') || 'None'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Prashna */}
      {activeTab === 'prashna' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">KP Prashna Horary Chart (1 to 249)</h3>
            <p className="text-xs text-slate-400">
              Enter any horary query seed number between 1 and 249 to calculate the instant Prashna Ascendant and sub-division arc.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={249}
                value={horaryNumber}
                onChange={(e) => setHoraryNumber(Number(e.target.value))}
                className="w-24 bg-[#1A1F2B] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2 font-mono"
              />
              <button
                onClick={handleRunPrashna}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition"
              >
                Cast Prashna Chart
              </button>
            </div>

            {prashnaResult && (
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-xl p-4 space-y-2 mt-4 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Prashna Ascendant:</span> <span className="font-mono text-cyan-400 font-bold">{prashnaResult.ascendantLongitude?.toFixed(2)}° ({prashnaResult.signName})</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sign Lord:</span> <span className="font-mono text-white">{prashnaResult.signLord}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Star Lord:</span> <span className="font-mono text-amber-300">{prashnaResult.starLord}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sub Lord:</span> <span className="font-mono text-emerald-400 font-bold">{prashnaResult.subLord}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: BTR */}
      {activeTab === 'btr' && btrResult && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">KP Ruling Planets & Birth Time Rectification (BTR)</h3>
            <p className="text-xs text-slate-400">
              Ruling Planets at time of consultation compared with Natal Ascendant and Moon sub-lords to establish exact birth minute authenticity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Asc Star Lord</span><span className="text-white font-bold">{btrResult.ascendantStarLord || 'Jupiter'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Asc Sub Lord</span><span className="text-cyan-400 font-bold">{btrResult.ascendantSubLord || 'Saturn'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Moon Star Lord</span><span className="text-amber-300 font-bold">{btrResult.moonStarLord || 'Mercury'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Moon Sub Lord</span><span className="text-emerald-400 font-bold">{btrResult.moonSubLord || 'Venus'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPAstrologyPage;
