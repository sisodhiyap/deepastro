import React, { useState, useEffect } from 'react';
import { Hash, Sparkles, Sun, Palette, Calendar, AlertCircle } from 'lucide-react';

export const NumerologyPage: React.FC = () => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If user has an active chart saved, pre-populate their real credentials
    fetch('/api/astrology/chart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const bd = data?.birthData || data?.chart?.birthData;
        if (bd?.name && bd?.birthDate) {
          setName(bd.name);
          setBirthDate(bd.birthDate);
          calculateNumerology(bd.name, bd.birthDate);
        }
      })
      .catch(() => {});
  }, []);

  const calculateNumerology = async (calcName = name, calcDob = birthDate) => {
    if (!calcName.trim() || !calcDob.trim()) {
      setErrorMessage('Please enter both your full name and date of birth.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/numerology/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: calcName, birthDate: calcDob }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to calculate numerology.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with numerology engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Hash className="w-3.5 h-3.5" /> Vibrational Science
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Chaldean &amp; Pythagorean Numerology
        </h1>
        <p className="text-xs text-cosmic-muted">
          Decode your Life Path, Destiny, Soul Urge, and vibrational harmonics.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Bar */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 shadow-cosmic-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateNumerology();
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end"
        >
          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Full Legal Name</label>
            <input
              type="text"
              placeholder="e.g. Vikram Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition-all shadow-glow-cyan"
            >
              {isLoading ? 'Calculating...' : 'Decode Vibrations'}
            </button>
          </div>
        </form>
      </div>

      {report ? (
        <div className="space-y-8">
          {/* Key Vibrational Numbers Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Life Path (Bhagyank)', val: report.lifePathNumber, sub: 'Core Purpose', color: 'from-cyan-500/20 to-indigo-500/10 border-cyan-500/40 text-cyan-400' },
              { label: 'Birth Number (Mulank)', val: report.birthNumber, sub: 'Innate Talents', color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400' },
              { label: 'Destiny (Expression)', val: report.destinyNumber, sub: 'Outward Career', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-400' },
              { label: 'Soul Urge (Vowels)', val: report.soulUrgeNumber, sub: 'Heart Desire', color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-400' },
              { label: 'Personality (Outer)', val: report.personalityNumber, sub: 'First Impression', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400' },
              { label: 'Personal Year', val: report.personalYear, sub: 'Current Cycle', color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400' },
            ].map((num) => (
              <div
                key={num.label}
                className={`p-4 rounded-2xl border bg-gradient-to-b ${num.color} text-center space-y-1`}
              >
                <span className="text-[10px] font-bold text-cosmic-muted uppercase block leading-tight">
                  {num.label}
                </span>
                <span className={`text-3xl sm:text-4xl font-display font-black block ${num.color.split(' ').pop()}`}>
                  {num.val}
                </span>
                <span className="text-[9px] text-cosmic-muted block">{num.sub}</span>
              </div>
            ))}
          </div>

          {/* Deep Life Path & Destiny Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Life Path Archetype #{report.lifePathNumber}
              </span>
              <p className="text-xs text-cosmic-text leading-relaxed">
                {report.interpretations?.lifePathOverview}
              </p>
            </div>

            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-3">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">
                Destiny &amp; Expression Resonance #{report.destinyNumber}
              </span>
              <p className="text-xs text-cosmic-text leading-relaxed">
                {report.interpretations?.destinyOverview}
              </p>
            </div>
          </div>

          {/* Harmonizing Elements Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Ruling Planet</span>
                <span className="font-bold text-cosmic-text text-sm">{report.rulingPlanet}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center gap-3">
              <Palette className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Lucky Colors</span>
                <span className="font-bold text-cosmic-text text-sm">{report.luckyColors?.join(', ')}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Favorable Days</span>
                <span className="font-bold text-cosmic-text text-sm">{report.luckyDays?.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-3xl border border-dashed border-cosmic-border bg-cosmic-surface/40 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Hash className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-cosmic-text">Enter Your Name &amp; Birth Date</h3>
            <p className="text-xs text-cosmic-muted max-w-md mx-auto leading-relaxed">
              Enter your full legal name and date of birth above to calculate your Life Path (Bhagyank), Mulank, Destiny, and Chaldean vowel resonances.
            </p>
          </div>
        )
      )}
    </div>
  );
};
