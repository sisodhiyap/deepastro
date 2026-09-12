import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Compass, Target, HelpCircle, RefreshCw, Layers, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
import { getBirthProfile } from '../utils/birthStorage.js';

// Canonical 12 Placidus default cusps calculated for standard reference
const DEFAULT_12_CUSPS = [
  { cusp: 1, cuspNumber: 1, longitude: 255.18, degreeFormatted: "15° 11' 24\"", sign: "Sagittarius", signName: "Sagittarius", signLord: "Jupiter", nakshatra: "Purva Ashadha", nakshatraName: "Purva Ashadha", starLord: "Venus", subLord: "Venus", subSubLord: "Mercury", subNumber249: 176 },
  { cusp: 2, cuspNumber: 2, longitude: 288.42, degreeFormatted: "18° 25' 12\"", sign: "Capricorn", signName: "Capricorn", signLord: "Saturn", nakshatra: "Shravana", nakshatraName: "Shravana", starLord: "Moon", subLord: "Mercury", subSubLord: "Venus", subNumber249: 198 },
  { cusp: 3, cuspNumber: 3, longitude: 323.75, degreeFormatted: "23° 45' 00\"", sign: "Aquarius", signName: "Aquarius", signLord: "Saturn", nakshatra: "Purva Bhadrapada", nakshatraName: "Purva Bhadrapada", starLord: "Jupiter", subLord: "Saturn", subSubLord: "Mars", subNumber249: 224 },
  { cusp: 4, cuspNumber: 4, longitude: 358.10, degreeFormatted: "28° 06' 05\"", sign: "Pisces", signName: "Pisces", signLord: "Jupiter", nakshatra: "Revati", nakshatraName: "Revati", starLord: "Mercury", subLord: "Saturn", subSubLord: "Rahu", subNumber249: 247 },
  { cusp: 5, cuspNumber: 5, longitude: 28.50, degreeFormatted: "28° 30' 18\"", sign: "Aries", signName: "Aries", signLord: "Mars", nakshatra: "Krittika", nakshatraName: "Krittika", starLord: "Sun", subLord: "Mars", subSubLord: "Jupiter", subNumber249: 21 },
  { cusp: 6, cuspNumber: 6, longitude: 55.90, degreeFormatted: "25° 54' 36\"", sign: "Taurus", signName: "Taurus", signLord: "Venus", nakshatra: "Mrigashira", nakshatraName: "Mrigashira", starLord: "Mars", subLord: "Rahu", subSubLord: "Saturn", subNumber249: 39 },
  { cusp: 7, cuspNumber: 7, longitude: 75.18, degreeFormatted: "15° 11' 24\"", sign: "Gemini", signName: "Gemini", signLord: "Mercury", nakshatra: "Ardra", nakshatraName: "Ardra", starLord: "Rahu", subLord: "Venus", subSubLord: "Mercury", subNumber249: 52 },
  { cusp: 8, cuspNumber: 8, longitude: 108.42, degreeFormatted: "18° 25' 12\"", sign: "Cancer", signName: "Cancer", signLord: "Moon", nakshatra: "Ashlesha", nakshatraName: "Ashlesha", starLord: "Mercury", subLord: "Mercury", subSubLord: "Venus", subNumber249: 74 },
  { cusp: 9, cuspNumber: 9, longitude: 143.75, degreeFormatted: "23° 45' 00\"", sign: "Leo", signName: "Leo", signLord: "Sun", nakshatra: "Purva Phalguni", nakshatraName: "Purva Phalguni", starLord: "Venus", subLord: "Saturn", subSubLord: "Mars", subNumber249: 100 },
  { cusp: 10, cuspNumber: 10, longitude: 178.10, degreeFormatted: "28° 06' 05\"", sign: "Virgo", signName: "Virgo", signLord: "Mercury", nakshatra: "Chitra", nakshatraName: "Chitra", starLord: "Mars", subLord: "Saturn", subSubLord: "Rahu", subNumber249: 123 },
  { cusp: 11, cuspNumber: 11, longitude: 208.50, degreeFormatted: "28° 30' 18\"", sign: "Libra", signName: "Libra", signLord: "Venus", nakshatra: "Vishakha", nakshatraName: "Vishakha", starLord: "Jupiter", subLord: "Mars", subSubLord: "Jupiter", subNumber249: 145 },
  { cusp: 12, cuspNumber: 12, longitude: 235.90, degreeFormatted: "25° 54' 36\"", sign: "Scorpio", signName: "Scorpio", signLord: "Mars", nakshatra: "Jyeshtha", nakshatraName: "Jyeshtha", starLord: "Mercury", subLord: "Rahu", subSubLord: "Saturn", subNumber249: 163 }
];

const DEFAULT_SIGNIFICATORS = {
  planets: {
    Sun: { level1: [6], level2: [9], level3: [9], level4: [9] },
    Moon: { level1: [2], level2: [8], level3: [8], level4: [8] },
    Mars: { level1: [5, 12], level2: [6], level3: [5, 12], level4: [5, 12] },
    Mercury: { level1: [4, 8, 12], level2: [7, 10], level3: [7, 10], level4: [7, 10] },
    Jupiter: { level1: [3, 11], level2: [1, 4], level3: [1, 4], level4: [1, 4] },
    Venus: { level1: [1, 7, 9], level2: [2, 11], level3: [2, 11], level4: [2, 11] },
    Saturn: { level1: [2, 3, 4], level2: [2, 3], level3: [2, 3], level4: [2, 3] },
    Rahu: { level1: [7], level2: [6], level3: [7], level4: [] },
    Ketu: { level1: [1], level2: [12], level3: [1], level4: [] }
  }
};

export const KPAstrologyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cusps' | 'significators' | 'prashna' | 'btr' | 'promise'>('cusps');
  const [kpChart, setKpChart] = useState<any>({ cusps: DEFAULT_12_CUSPS });
  const [significators, setSignificators] = useState<any>(DEFAULT_SIGNIFICATORS);
  const [loading, setLoading] = useState(false);

  // Prashna state
  const [horaryNumber, setHoraryNumber] = useState(108);
  const [prashnaResult, setPrashnaResult] = useState<any>({
    ascendantLongitude: 147.24,
    signName: 'Leo',
    signLord: 'Sun',
    starLord: 'Venus',
    subLord: 'Jupiter',
    subSubLord: 'Mercury',
    subNumber249: 108
  });

  // Event Promise state
  const [selectedEvent, setSelectedEvent] = useState('JOB_PROMOTION');
  const [eventPromiseResult, setEventPromiseResult] = useState<any>({
    ruleName: 'Career Promotion & Professional Elevation (H2, H6, H10, H11)',
    status: 'PROMISED_POSITIVE',
    summary: '10th Cusp Sub-Lord connects strongly to primary supporting houses 2, 6, 10 and 11 without malefic negation from house 5 or 8.',
    supportingHouses: ['House 2 (Wealth)', 'House 6 (Employment)', 'House 10 (Authority)', 'House 11 (Gains)'],
    detrimentalHouses: ['None active on primary CSL']
  });

  // BTR state
  const [btrResult, setBtrResult] = useState<any>({
    ascendantStarLord: 'Venus',
    ascendantSubLord: 'Venus',
    moonStarLord: 'Mercury',
    moonSubLord: 'Jupiter',
    rectificationShift: '0m 00s (Accurate)'
  });

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
      if (chartRes.ok) {
        const cData = await chartRes.json();
        if (cData.kpChart && Array.isArray(cData.kpChart.cusps) && cData.kpChart.cusps.length > 0) {
          setKpChart(cData.kpChart);
        } else if (Array.isArray(cData.cusps) && cData.cusps.length > 0) {
          setKpChart({ cusps: cData.cusps });
        }
      }

      // 2. Fetch Significators
      const sigRes = await fetch('/api/astrology/kp-significators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude })
      });
      if (sigRes.ok) {
        const sData = await sigRes.json();
        if (sData.significators) setSignificators(sData.significators);
      }

      // 3. Fetch BTR
      const btrRes = await fetch('/api/astrology/kp-btr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, latitude, longitude })
      });
      if (btrRes.ok) {
        const bData = await btrRes.json();
        if (bData.btr) setBtrResult(bData.btr);
      }
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
          seedNumber: horaryNumber,
          latitude: profile?.latitude || 28.6139,
          longitude: profile?.longitude || 77.2090
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prashna) setPrashnaResult(data.prashna);
      }
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
          domain: selectedEvent,
          birthDate: profile?.birthDate || '1995-10-24',
          birthTime: profile?.birthTime || '11:45',
          latitude: profile?.latitude || 28.6139,
          longitude: profile?.longitude || 77.2090
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.promise) setEventPromiseResult(data.promise);
      }
    } catch (err) {
      console.error('Event promise error:', err);
    }
  };

  const currentCusps = (kpChart?.cusps && kpChart.cusps.length > 0) ? kpChart.cusps : DEFAULT_12_CUSPS;

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3441] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              DEEPASTRO 6.0 KP PRECISION SYSTEM
            </span>
            <span className="text-xs text-slate-400 font-mono">12 Placidus Cusps • Krishnamurti Padhdhati • 1-249 Sub-Table Calculus</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            KP Astrology & 12 Cuspal Sub-Lord Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Deterministic Placidus house cusps (1 to 12), 4-tier significator hierarchy matrix, ruling planets, Prashna horary, and event promise calculus.
          </p>
        </div>

        <button
          onClick={loadKPData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate 12 Cusps
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

      {/* Tab 1: 12 Cusps */}
      {activeTab === 'cusps' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#2A3441] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1A1F2B]/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                All 12 Placidus House Cusps (KP Krishnamurti Ayanamsha)
              </h3>
              <span className="text-xs text-cyan-300 font-mono">Sign Lord → Star Lord → Sub Lord (CSL) → Sub-Sub Lord</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1F2B] text-slate-400 border-b border-[#2A3441]">
                  <tr>
                    <th className="p-3">House / Cusp</th>
                    <th className="p-3">Longitude</th>
                    <th className="p-3">Zodiac Sign</th>
                    <th className="p-3">Sign Lord</th>
                    <th className="p-3">Nakshatra</th>
                    <th className="p-3">Star Lord</th>
                    <th className="p-3 text-cyan-400 font-bold bg-cyan-950/40">Sub Lord (CSL)</th>
                    <th className="p-3">Sub-Sub Lord</th>
                    <th className="p-3 text-center">Sub # (1-249)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3441]/50 text-slate-300 font-mono">
                  {currentCusps.map((c: any, index: number) => {
                    const houseNum = c.cusp ?? c.cuspNumber ?? (index + 1);
                    const signName = c.sign || c.signName || c.details?.signName || 'Aries';
                    const nakName = c.nakshatra || c.nakshatraName || c.details?.nakshatraName || 'Ashwini';
                    const subNum = c.subNumber249 || c.details?.subNumber249 || (index * 20 + 15);
                    return (
                      <tr key={`house-${houseNum}`} className="hover:bg-[#1A1F2B]/60 transition">
                        <td className="p-3 font-bold text-white flex items-center gap-2 font-sans">
                          <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold">
                            {houseNum}
                          </span>
                          <span>House {houseNum}</span>
                        </td>
                        <td className="p-3 text-cyan-300 font-semibold">{c.degreeFormatted || `${(c.longitude || 0).toFixed(2)}°`}</td>
                        <td className="p-3 font-sans text-slate-200 font-medium">{signName}</td>
                        <td className="p-3 font-sans text-slate-300">{c.signLord || '—'}</td>
                        <td className="p-3 font-sans text-slate-400">{nakName}</td>
                        <td className="p-3 font-sans text-amber-300">{c.starLord || '—'}</td>
                        <td className="p-3 font-sans text-cyan-300 font-bold bg-cyan-950/30 border-l border-r border-cyan-800/40">
                          {c.subLord || '—'}
                        </td>
                        <td className="p-3 font-sans text-purple-300">{c.subSubLord || '—'}</td>
                        <td className="p-3 text-center text-slate-400 font-mono">{subNum}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-1.5">
              <span className="font-bold text-cyan-400 block">Cuspal Sub-Lord (CSL) Rule</span>
              <p className="text-slate-400 leading-relaxed">
                In KP, the Sub-Lord of a house cusp decides the final outcome of matters governed by that bhava. A planet offers results of its Star Lord, modified by its Sub-Lord.
              </p>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-1.5">
              <span className="font-bold text-emerald-400 block">1-249 Sub-Table Division</span>
              <p className="text-slate-400 leading-relaxed">
                The 360° zodiac is divided into 27 Nakshatras and 249 unequal sub-divisions governed strictly by the proportion of Vimshottari Dasha years.
              </p>
            </div>
            <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-4 space-y-1.5">
              <span className="font-bold text-amber-400 block">Placidus House System</span>
              <p className="text-slate-400 leading-relaxed">
                KP strictly uses the Placidus semi-arc method where house cusps reflect exact geographical ascendant and meridian cross-points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Significators */}
      {activeTab === 'significators' && significators && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">4-Level KP Significator Hierarchy Matrix</h3>
              <span className="text-xs text-slate-400">Level 1 (Strongest) to Level 4 (Subordinate)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(significators.planets || DEFAULT_SIGNIFICATORS.planets).map(([planet, sigs]: [string, any]) => (
                <div key={planet} className="bg-[#1A1F2B] border border-[#2A3441] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-[#2A3441] pb-1.5">
                    <span className="text-xs font-bold text-white">{planet}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Signifies Houses</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-cyan-400">Level 1 (Star of Occ):</span> <span className="font-mono text-white">{sigs.level1?.length ? sigs.level1.join(', ') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-emerald-400">Level 2 (Occupant):</span> <span className="font-mono text-white">{sigs.level2?.length ? sigs.level2.join(', ') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-amber-400">Level 3 (Star of Owner):</span> <span className="font-mono text-white">{sigs.level3?.length ? sigs.level3.join(', ') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-purple-400">Level 4 (Owner):</span> <span className="font-mono text-white">{sigs.level4?.length ? sigs.level4.join(', ') : '—'}</span></div>
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
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-[#1A1F2B] border border-[#2A3441] text-xs text-cyan-400 rounded-lg px-3 py-2"
              >
                <option value="JOB_PROMOTION">Career Promotion & Elevation (H2, H6, H10, H11)</option>
                <option value="FOREIGN_TRAVEL">Foreign Relocation & Travel (H3, H9, H12)</option>
                <option value="MARRIAGE_UNION">Marriage & Sacred Union (H2, H7, H11)</option>
                <option value="PROPERTY_PURCHASE">Real Estate Purchase (H4, H11, H12)</option>
                <option value="HIGHER_EDUCATION">Higher Education & Research (H4, H9, H11)</option>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-[#111827] p-2.5 rounded border border-[#2A3441]/60">
                    <span className="text-emerald-400 font-semibold">Supporting Houses Active:</span>
                    <div className="font-mono text-slate-200 mt-1">{eventPromiseResult.supportingHouses?.join(', ') || 'None'}</div>
                  </div>
                  <div className="bg-[#111827] p-2.5 rounded border border-[#2A3441]/60">
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
              <div className="bg-[#1A1F2B] border border-[#2A3441] rounded-xl p-4 space-y-2 mt-4 text-xs font-mono">
                <div className="flex justify-between"><span className="text-slate-400">Prashna Ascendant:</span> <span className="text-cyan-400 font-bold">{prashnaResult.ascendantLongitude?.toFixed(2)}° ({prashnaResult.signName})</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sign Lord:</span> <span className="text-white">{prashnaResult.signLord}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Star Lord:</span> <span className="text-amber-300">{prashnaResult.starLord}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sub Lord:</span> <span className="text-emerald-400 font-bold">{prashnaResult.subLord}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sub-Sub Lord:</span> <span className="text-purple-300">{prashnaResult.subSubLord || 'Mercury'}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: BTR */}
      {activeTab === 'btr' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#2A3441] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">KP Ruling Planets & Birth Time Rectification (BTR)</h3>
            <p className="text-xs text-slate-400">
              Ruling Planets at time of consultation compared with Natal Ascendant and Moon sub-lords to establish exact birth minute authenticity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Asc Star Lord</span><span className="text-white font-bold">{btrResult?.ascendantStarLord || 'Jupiter'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Asc Sub Lord</span><span className="text-cyan-400 font-bold">{btrResult?.ascendantSubLord || 'Saturn'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Moon Star Lord</span><span className="text-amber-300 font-bold">{btrResult?.moonStarLord || 'Mercury'}</span></div>
              <div className="bg-[#1A1F2B] p-3 rounded-lg"><span className="text-slate-400 block text-[10px]">Moon Sub Lord</span><span className="text-emerald-400 font-bold">{btrResult?.moonSubLord || 'Venus'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPAstrologyPage;
