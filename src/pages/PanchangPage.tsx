import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

export const PanchangPage: React.FC = () => {
  const [panchang, setPanchang] = useState<any>(null);
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/astrology/panchang').then((r) => r.json()),
      fetch('/api/astrology/muhurat').then((r) => r.json()),
    ])
      .then(([pData, mData]) => {
        setPanchang(pData);
        setMuhurats(mData.muhurats || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" /> Pancha Anga
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Vedic Panchang & Shubh Muhurat
        </h1>
        <p className="text-xs text-cosmic-muted">
          Daily solar and lunar calendar coordinates, Rahu Kalam, and auspicious windows.
        </p>
      </div>

      {panchang && (
        <div className="space-y-8">
          {/* The 5 Limbs Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1 text-center">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">1. Tithi (Lunar Day)</span>
              <span className="text-lg font-bold text-cosmic-text block">{panchang.tithi.name}</span>
              <span className="text-[11px] text-cyan-400 font-semibold">{panchang.tithi.paksha}</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1 text-center">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">2. Vara (Weekday)</span>
              <span className="text-lg font-bold text-cosmic-text block">{panchang.vara.name}</span>
              <span className="text-[11px] text-amber-400 font-semibold">{panchang.vara.sanskritName}</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1 text-center">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">3. Nakshatra</span>
              <span className="text-lg font-bold text-cosmic-text block">{panchang.nakshatra.name}</span>
              <span className="text-[11px] text-violet-400 font-semibold">Pada {panchang.nakshatra.pada} &bull; {panchang.nakshatra.lord}</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1 text-center">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">4. Yoga (Solilunar)</span>
              <span className="text-lg font-bold text-cosmic-text block">{panchang.yoga.name}</span>
              <span className={`text-[11px] font-semibold ${panchang.yoga.isAuspicious ? 'text-emerald-400' : 'text-amber-400'}`}>
                {panchang.yoga.isAuspicious ? 'Shubha (Auspicious)' : 'Inauspicious'}
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1 text-center">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">5. Karana (Half-Tithi)</span>
              <span className="text-lg font-bold text-cosmic-text block">{panchang.karana.name}</span>
              <span className="text-[11px] text-cosmic-muted font-semibold">{panchang.karana.type}</span>
            </div>
          </div>

          {/* Timings & Inauspicious Clocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Abhijit Muhurat</span>
              <span className="text-sm font-bold text-cosmic-text">{panchang.timings.abhijitMuhurat.start} – {panchang.timings.abhijitMuhurat.end}</span>
              <p className="text-[10px] text-cosmic-muted">Prime auspicious window of the solar day.</p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/5 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rahu Kalam (Avoid)</span>
              <span className="text-sm font-bold text-cosmic-text">{panchang.timings.rahuKalam.start} – {panchang.timings.rahuKalam.end}</span>
              <p className="text-[10px] text-cosmic-muted">Refrain from launching new commercial contracts.</p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Yamaganda</span>
              <span className="text-sm font-bold text-cosmic-text">{panchang.timings.yamaganda.start} – {panchang.timings.yamaganda.end}</span>
              <p className="text-[10px] text-cosmic-muted">Period of delay and obstruction.</p>
            </div>

            <div className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/5 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Gulika Kalam</span>
              <span className="text-sm font-bold text-cosmic-text">{panchang.timings.gulika.start} – {panchang.timings.gulika.end}</span>
              <p className="text-[10px] text-cosmic-muted">Actions initiated repeat frequently.</p>
            </div>
          </div>

          {/* Auspicious Muhurats for Life Events */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              Shubh Muhurat Auspices for Major Activities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {muhurats.map((m, idx) => (
                <div key={`muh-${idx}`} className="rounded-2xl border border-cosmic-border bg-cosmic-surface p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-cosmic-text">{m.activity}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      m.status === 'Auspicious'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cosmic-card/60 border border-cosmic-border/50 text-xs">
                    <span className="text-cosmic-muted block text-[10px]">Optimal Window</span>
                    <span className="font-bold text-cyan-400">{m.recommendedWindow}</span>
                  </div>
                  <p className="text-xs text-cosmic-muted leading-relaxed">{m.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
