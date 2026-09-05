import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { MatchingCard, MatchingDataUI } from '../components/astrology/MatchingCard.js';

export const MatchingPage: React.FC = () => {
  const [partnerA, setPartnerA] = useState({
    name: 'Aarav Sharma',
    birthDate: '1992-04-12',
    birthTime: '09:30',
    birthPlace: 'New Delhi',
    latitude: '28.6139',
    longitude: '77.2090',
    timezone: '5.5',
    gender: 'Male',
  });

  const [partnerB, setPartnerB] = useState({
    name: 'Pooja Iyer',
    birthDate: '1995-11-20',
    birthTime: '14:15',
    birthPlace: 'Chennai',
    latitude: '13.0827',
    longitude: '80.2707',
    timezone: '5.5',
    gender: 'Female',
  });

  const [result, setResult] = useState<MatchingDataUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/matching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personA: partnerA, personB: partnerB }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleMatch();
  }, []);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-cyan-400" /> Sacred Astrological Union
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Kundli Milan & Compatibility
        </h1>
        <p className="text-xs text-cosmic-muted">
          Comprehensive 36-point Ashtakoota analysis and Kuja (Manglik) equilibrium.
        </p>
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
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Place (City)</label>
              <input
                type="text"
                value={partnerA.birthPlace}
                onChange={(e) => setPartnerA({ ...partnerA, birthPlace: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
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
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Place (City)</label>
              <input
                type="text"
                value={partnerB.birthPlace}
                onChange={(e) => setPartnerB({ ...partnerB, birthPlace: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
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

      {/* Result Display */}
      {result && <MatchingCard data={result} />}
    </div>
  );
};
