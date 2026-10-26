import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, AlertTriangle, CheckCircle2, Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { getBirthProfile } from '../utils/birthStorage.js';
import { DEEPASTRO_ARTWORK } from '../constants/deepastroAssets.js';
import { FeatureArtworkBanner } from '../components/common/FeatureArtworkBanner.js';

export const PanchangPage: React.FC = () => {
  const [panchang, setPanchang] = useState<any>(null);
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const profile = getBirthProfile();
  const lat = profile?.latitude ? parseFloat(profile.latitude) : 28.6139;
  const lon = profile?.longitude ? parseFloat(profile.longitude) : 77.2090;
  const tz = profile?.timezone ? parseFloat(profile.timezone) : 5.5;
  const locationLabel = profile?.birthPlace || 'New Delhi, India (Default)';

  const fetchPanchangData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const panchangUrl = `/api/astrology/panchang?lat=${lat}&lon=${lon}&tz=${tz}&date=${selectedDate}`;
      const muhuratUrl = `/api/astrology/muhurat?date=${selectedDate}`;

      const [pRes, mRes] = await Promise.all([
        fetch(panchangUrl),
        fetch(muhuratUrl),
      ]);

      if (!pRes.ok) {
        const pErr = await pRes.json().catch(() => ({}));
        throw new Error(pErr.error || pErr.details || 'Failed to fetch Panchang calculations.');
      }

      const pData = await pRes.json();
      if (!pData || !pData.tithi || !pData.vara || !pData.nakshatra) {
        throw new Error('Panchang calculation returned incomplete planetary coordinates.');
      }

      setPanchang(pData);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMuhurats(mData.muhurats || []);
      }
    } catch (err: any) {
      console.error('[PanchangPage] Error fetching Panchang:', err);
      setErrorMessage(err.message || 'Unable to compute Vedic Panchang for this date.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPanchangData();
  }, [selectedDate]);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 27 Nakshatras & Solilunar Panchang Feature Artwork Banner */}
      <FeatureArtworkBanner
        artwork={DEEPASTRO_ARTWORK.nakshatraCosmicKnowledge}
        variant="banner"
        priority={false}
        asH1={true}
        titleOverride="27 Nakshatras & Vedic Panchang"
        badgeOverride="27 NAKSHATRAS & KALA SHASTRA"
        descriptionOverride="Daily solar and lunar calendar coordinates, Rahu Kalam, Nakshatra padas, and auspicious timing windows."
      >
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-1.5 text-xs text-cosmic-muted">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px] text-slate-200">{locationLabel}</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cosmic-text focus:outline-none focus:border-cyan-400"
          />
        </div>
      </FeatureArtworkBanner>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-bold text-cosmic-text">Calculating Solilunar Ephemeris & Panchang...</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchPanchangData}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : panchang ? (
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
      ) : null}
    </div>
  );
};
