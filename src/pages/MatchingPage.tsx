import { PlaceSelector } from '../components/common/PlaceSelector.js';
import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { MatchingCard, MatchingDataUI } from '../components/astrology/MatchingCard.js';
import { MarriageCompatibilityCard } from '../components/astrology/MarriageCompatibilityCard.js';
import { MarriageCompatibilityReport } from '../../server/src/astrology/MarriageCompatibilityEngine.js';
import { getBirthProfile } from '../utils/birthStorage.js';

export const MatchingPage: React.FC = () => {
  const [partnerA, setPartnerA] = useState(() => {
    const saved = getBirthProfile();
    return {
      name: saved?.name || '',
      birthDate: saved?.birthDate || '',
      birthTime: saved?.birthTime || '',
      birthPlace: saved?.birthPlace || '',
      latitude: saved?.latitude ? String(saved.latitude) : '28.6139',
      longitude: saved?.longitude ? String(saved.longitude) : '77.2090',
      timezone: saved?.timezone ? String(saved.timezone) : '5.5',
      gender: saved?.gender || 'Male',
    };
  });

  const [partnerB, setPartnerB] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: '19.0760',
    longitude: '72.8777',
    timezone: '5.5',
    gender: 'Female',
  });

  const [result, setResult] = useState<MatchingDataUI | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<MarriageCompatibilityReport | null>(null);
  const [deepSynastry, setDeepSynastry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runMatchingWith = async (aData = partnerA, bData = partnerB) => {
    if (!aData.birthDate || !aData.birthTime || !bData.birthDate || !bData.birthTime) {
      setErrorMessage('Please enter both birth date and birth time for Partner A and Partner B.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const matchRes = await fetch('/api/matching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personA: aData, personB: bData }),
      });

      if (matchRes.ok) {
        const data = await matchRes.json();
        setResult(data);
        if (data.compatibilityReport) {
          setCompatibilityReport(data.compatibilityReport);
        }
        if (data.deepSynastry) {
          setDeepSynastry(data.deepSynastry);
        }
      } else {
        const err = await matchRes.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to analyze matching. Please check birth inputs.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with matching engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatch = () => runMatchingWith();

  const applyPreset = (type: 'favorable' | 'challenging') => {
    if (type === 'favorable') {
      const a = {
        name: 'Arjun Sharma',
        birthDate: '1992-03-12',
        birthTime: '10:15',
        birthPlace: 'New Delhi, India',
        latitude: '28.6139',
        longitude: '77.2090',
        timezone: '5.5',
        gender: 'Male',
      };
      const b = {
        name: 'Priya Mehta',
        birthDate: '1994-08-25',
        birthTime: '18:40',
        birthPlace: 'Jaipur, India',
        latitude: '26.9124',
        longitude: '75.7873',
        timezone: '5.5',
        gender: 'Female',
      };
      setPartnerA(a);
      setPartnerB(b);
      runMatchingWith(a, b);
    } else {
      const a = {
        name: 'Rahul Verma',
        birthDate: '1990-06-05',
        birthTime: '09:20',
        birthPlace: 'Lucknow, India',
        latitude: '26.8467',
        longitude: '80.9462',
        timezone: '5.5',
        gender: 'Male',
      };
      const b = {
        name: 'Neha Singh',
        birthDate: '1993-11-14',
        birthTime: '23:45',
        birthPlace: 'Bhopal, India',
        latitude: '23.2599',
        longitude: '77.4126',
        timezone: '5.5',
        gender: 'Female',
      };
      setPartnerA(a);
      setPartnerB(b);
      runMatchingWith(a, b);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-cyan-400" /> Sacred Astrological Union
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Kundli Milan &amp; Compatibility
        </h1>
        <p className="text-xs text-cosmic-muted">
          Comprehensive 36-point Ashtakoota analysis and Kuja (Manglik) equilibrium.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Presets: Favorable vs Challenging (Matches Reference Design) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0E131F] border border-cyan-500/20 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            Instant Test Scenarios:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('favorable')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 transition shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5"
          >
            <span>💙 Favorable: Arjun &amp; Priya (Souls Aligned)</span>
          </button>
          <button
            onClick={() => applyPreset('challenging')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900/70 border border-rose-500/40 transition shadow-[0_0_12px_rgba(244,63,94,0.25)] flex items-center gap-1.5"
          >
            <span>💔 Challenging: Rahul &amp; Neha (Different Paths)</span>
          </button>
        </div>
      </div>

      {/* Dual Partner Input Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner A */}
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
            <h3 className="text-sm font-bold text-cosmic-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
              Partner A Details
            </h3>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Groom / Primary</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="text-cosmic-muted block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="Enter Groom / Primary name"
                value={partnerA.name}
                onChange={(e) => setPartnerA({ ...partnerA, name: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Date</label>
              <input
                type="date"
                value={partnerA.birthDate}
                onChange={(e) => setPartnerA({ ...partnerA, birthDate: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Time</label>
              <input
                type="time"
                value={partnerA.birthTime}
                onChange={(e) => setPartnerA({ ...partnerA, birthTime: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="col-span-2">
              <PlaceSelector
                value={partnerA.birthPlace}
                latitude={partnerA.latitude}
                longitude={partnerA.longitude}
                timezone={partnerA.timezone}
                onChange={({ birthPlace, latitude, longitude, timezone }) => {
                  setPartnerA((prev) => ({
                    ...prev,
                    birthPlace,
                    latitude,
                    longitude,
                    timezone,
                  }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Partner B */}
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
            <h3 className="text-sm font-bold text-cosmic-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">2</span>
              Partner B Details
            </h3>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Bride / Partner</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="text-cosmic-muted block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="Enter Bride / Partner name"
                value={partnerB.name}
                onChange={(e) => setPartnerB({ ...partnerB, name: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Date</label>
              <input
                type="date"
                value={partnerB.birthDate}
                onChange={(e) => setPartnerB({ ...partnerB, birthDate: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Time</label>
              <input
                type="time"
                value={partnerB.birthTime}
                onChange={(e) => setPartnerB({ ...partnerB, birthTime: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="col-span-2">
              <PlaceSelector
                value={partnerB.birthPlace}
                latitude={partnerB.latitude}
                longitude={partnerB.longitude}
                timezone={partnerB.timezone}
                onChange={({ birthPlace, latitude, longitude, timezone }) => {
                  setPartnerB((prev) => ({
                    ...prev,
                    birthPlace,
                    latitude,
                    longitude,
                    timezone,
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleMatch}
          disabled={isLoading}
          className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-sm uppercase tracking-wider transition-all shadow-glow-cyan flex items-center gap-2"
        >
          <span>{isLoading ? 'Calculating Ashtakoota...' : 'Analyze Kundli Compatibility'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Result Display: Production Marriage Compatibility Card */}
      {(compatibilityReport || result) ? (
        <div className="space-y-8 animate-fadeIn">
          {compatibilityReport ? (
            <MarriageCompatibilityCard
              report={compatibilityReport}
              onPrint={() => window.print()}
            />
          ) : result ? (
            <MatchingCard data={result} />
          ) : null}

          {/* The Pattern-Style Deep Psychological Dynamics Breakdown */}
          {deepSynastry && (
            <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-b from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 space-y-6 shadow-glow-cyan/10 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      The Pattern Synergy
                    </span>
                    <span className="text-xs font-mono text-cyan-300">4-Quadrant Relational Matrix</span>
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    Bond Archetype: {deepSynastry.archetype}
                  </h3>
                  <p className="text-xs text-cosmic-muted">
                    Beyond mathematical Guna Milan: deep psychological bonding, friction catalysts, and evolutionary growth.
                  </p>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-cosmic-card border border-cosmic-border text-center sm:text-right min-w-[140px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cosmic-muted block">
                    Total Synergy Bond
                  </span>
                  <span className="text-3xl font-display font-black text-violet-400">
                    {deepSynastry.overallBondScore}%
                  </span>
                </div>
              </div>

              {/* 4 Quadrants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase">Soul Resonance</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deepSynastry.quadrants.soulResonance.score}% ({deepSynastry.quadrants.soulResonance.verdict})
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted leading-relaxed">
                    {deepSynastry.quadrants.soulResonance.summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase">Communication Chemistry</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deepSynastry.quadrants.communicationFlow.score}% ({deepSynastry.quadrants.communicationFlow.verdict})
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted leading-relaxed">
                    {deepSynastry.quadrants.communicationFlow.summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 uppercase">Passion & Friction</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deepSynastry.quadrants.passionAndFriction.score}% ({deepSynastry.quadrants.passionAndFriction.verdict})
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted leading-relaxed">
                    {deepSynastry.quadrants.passionAndFriction.summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">Long-Term Growth</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deepSynastry.quadrants.longTermGrowth.score}% ({deepSynastry.quadrants.longTermGrowth.verdict})
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted leading-relaxed">
                    {deepSynastry.quadrants.longTermGrowth.summary}
                  </p>
                </div>
              </div>

              {/* Keys to Thrive & Sacred Contract */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <strong className="text-emerald-300 block font-bold text-sm">
                    How to Nurture This Connection:
                  </strong>
                  <ul className="space-y-1 text-cosmic-muted">
                    {deepSynastry.keysToThrive.map((key: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{key}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/30 space-y-2">
                  <strong className="text-violet-300 block font-bold text-sm">
                    Sacred Soul Contract:
                  </strong>
                  <p className="text-violet-100/80 leading-relaxed italic">
                    "{deepSynastry.sacredContract}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-3xl border border-dashed border-cosmic-border bg-cosmic-surface/40 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-cosmic-text">Enter Both Partner Profiles</h3>
            <p className="text-xs text-cosmic-muted max-w-md mx-auto leading-relaxed">
              Fill in birth coordinates for both partners above or pick an instant preset to calculate the 36 Guna Ashtakoota score, Nadi Dosha, Bhakoot, and Manglik equilibrium.
            </p>
          </div>
        )
      )}
    </div>
  );
};
