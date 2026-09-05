import React, { useState, useEffect } from 'react';
import { Sun, Calendar, Clock, Compass, Sparkles, Briefcase, Heart, DollarSign, Activity, Users, Feather, ShieldAlert, CheckCircle2, ChevronRight, Moon, Orbit } from 'lucide-react';

export const DailyPredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'thisWeek' | 'thisMonth'>('today');
  const [kundliData, setKundliData] = useState<any>(null);
  const [factSet, setFactSet] = useState<any>(null);
  const [domainPredictions, setDomainPredictions] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('Career');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch base chart and deep domain predictions
    Promise.all([
      fetch('/api/astrology/chart').then((res) => res.json()),
      fetch('/api/astrology/predictions/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).then((res) => res.json()),
    ])
      .then(([chartRes, domainRes]) => {
        setKundliData(chartRes);
        if (domainRes && domainRes.predictions) {
          setFactSet(domainRes.factSet);
          setDomainPredictions(domainRes.predictions);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const predictions = kundliData?.predictions;
  const current = predictions ? predictions[activeTab] : null;

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'tomorrow' as const, label: 'Tomorrow' },
    { key: 'thisWeek' as const, label: 'This Week' },
    { key: 'thisMonth' as const, label: 'This Month' },
  ];

  const domainList = [
    'Career',
    'Love',
    'Marriage',
    'Finance',
    'Education',
    'Health',
    'Family',
    'Spirituality',
    'Business',
    'Travel',
    'Personal Growth',
  ];

  const activeDomainData = domainPredictions ? domainPredictions[selectedDomain] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5" /> Real-Time Transit Intelligence (Gochara)
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Today in Your Cosmos
        </h1>
        <p className="text-xs text-cosmic-muted">
          Dynamic astronomical transits cross-referenced against your natal Lagna, Moon, and active Vimshottari Dasha.
        </p>
      </div>

      {/* Cosmic Pulse Cards: Moon, Dasha, Transits, Muhurat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moon Influence */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Moon Influence</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">Chandra</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {kundliData?.moonSign?.signName || 'Taurus'}
          </div>
          <p className="text-[11px] text-cosmic-muted">
            Nakshatra: <span className="text-cosmic-text font-medium">{kundliData?.moonNakshatra?.name || 'Rohini'}</span> (Pada {kundliData?.moonNakshatra?.pada || 2})
          </p>
        </div>

        {/* Current Active Dasha */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Orbit className="w-3.5 h-3.5" /> Active Dasha</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">Vimshottari</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {kundliData?.dashas?.currentMahadasha?.planet || 'Jupiter'} Mahadasha
          </div>
          <p className="text-[11px] text-cosmic-muted">
            Antardasha: <span className="text-cosmic-text font-medium">{kundliData?.dashas?.currentAntardasha?.planet || 'Saturn'}</span>
          </p>
        </div>

        {/* Transits & Sade Sati */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Saturn Gochara</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Gochara</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {factSet?.sadeSati?.isInSadeSati ? 'Sade Sati Active' : 'No Sade Sati'}
          </div>
          <p className="text-[11px] text-cosmic-muted truncate">
            {factSet?.sadeSati?.currentPhase || 'Saturn transiting harmonious houses'}
          </p>
        </div>

        {/* Auspicious Windows */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Abhijit Muhurat</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Panchang</span>
          </div>
          <div className="text-lg font-display font-extrabold text-emerald-400">
            11:52 AM - 12:44 PM
          </div>
          <p className="text-[11px] text-cosmic-muted">
            Rahu Kalam: <span className="text-amber-400 font-medium">{current?.cautionHours || '04:30 PM - 06:00 PM'}</span>
          </p>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cosmic-surface border border-cosmic-border w-fit text-xs font-bold">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-xl transition-all ${
              activeTab === t.key
                ? 'bg-cyan-500 text-black shadow-glow-cyan'
                : 'text-cosmic-muted hover:text-cosmic-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="space-y-8">
          {/* Energy Summary Banner */}
          <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-cosmic-card">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Cosmic Energy Quotient &bull; {current.period}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-cosmic-text">
                Favorable Planetary Momentum
              </h2>
              <p className="text-xs text-cosmic-muted mt-1 max-w-xl">
                Benefic planetary aspects stimulate creative insight and decisive execution across your active Mahadasha.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cosmic-surface border border-cyan-500/30 text-center min-w-[120px] shadow-glow-cyan/20">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Vitality Score</span>
              <span className="text-3xl font-display font-black text-cyan-400">
                {current.overallEnergyScore}%
              </span>
            </div>
          </div>

          {/* Core Life Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'Career & Ambition', data: current.career, icon: Briefcase },
              { label: 'Wealth & Assets', data: current.finance, icon: DollarSign },
              { label: 'Love & Intimacy', data: current.love, icon: Heart },
              { label: 'Health & Energy', data: current.health, icon: Activity },
              { label: 'Family Harmony', data: current.family, icon: Users },
              { label: 'Spiritual Clarity', data: current.spirituality, icon: Feather },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="rounded-2xl border border-cosmic-border bg-cosmic-surface p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-cosmic-text">{p.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{p.data?.score}%</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-cosmic-text">{p.data?.headline}</h4>
                    <p className="text-[11px] text-cosmic-muted mt-1 leading-snug">{p.data?.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timings & Mantra Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Favorable Hours</span>
              <span className="text-base font-bold text-cosmic-text block">{current.favorableHours}</span>
              <p className="text-[11px] text-cosmic-muted leading-tight">Optimal period for critical negotiations, creative output, and agreements.</p>
            </div>

            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Caution Hours (Rahu Kalam)</span>
              <span className="text-base font-bold text-cosmic-text block">{current.cautionHours}</span>
              <p className="text-[11px] text-cosmic-muted leading-tight">Postpone major financial commitments or contentious confrontations.</p>
            </div>

            <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Harmonizing Mantra</span>
              <span className="text-base font-display font-extrabold text-cosmic-text block">{current.dailyMantra}</span>
              <p className="text-[11px] text-cosmic-muted leading-tight">Chant 108 times at sunrise facing {current.helpfulDirection}.</p>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 10: 11 DEEP DOMAIN PREDICTIONS EXPLORER */}
      {domainPredictions && (
        <div className="space-y-6 pt-6 border-t border-cosmic-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 11 Astrological Life Domains
            </div>
            <h2 className="text-2xl font-display font-extrabold text-cosmic-text">
              Grounded Domain Forecasts & Guidance
            </h2>
            <p className="text-xs text-cosmic-muted">
              Deep Parashari interpretations with astrological citations and non-fatalistic practical guidance.
            </p>
          </div>

          {/* Domain selector pills */}
          <div className="flex flex-wrap gap-2">
            {domainList.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDomain === domain
                    ? 'bg-cyan-500 text-black shadow-glow-cyan'
                    : 'bg-cosmic-surface border border-cosmic-border text-cosmic-muted hover:text-cosmic-text'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Active Domain Detail Card */}
          {activeDomainData && (
            <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Domain Focus &bull; {activeDomainData.domain}
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-cosmic-text">
                    {activeDomainData.headline}
                  </h3>
                  <span className="text-[11px] text-cosmic-muted block mt-0.5">
                    Active Window: {activeDomainData.period} &bull; Confidence: {activeDomainData.confidence}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-cosmic-card border border-cyan-500/20 text-center">
                    <span className="text-[10px] text-cosmic-muted uppercase block">Potential</span>
                    <span className="text-xl font-display font-black text-cyan-400">{activeDomainData.score}%</span>
                  </div>
                </div>
              </div>

              {/* Astrological Rationale (Why) */}
              <div className="p-4 rounded-2xl bg-cosmic-card/60 border border-cosmic-border space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Astrological Rationale (Why)
                </span>
                <p className="text-xs text-cosmic-text leading-relaxed">
                  {activeDomainData.whyAstrological}
                </p>
              </div>

              {/* Guidance & Cautions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Constructive Guidance
                  </span>
                  <p className="text-cosmic-text leading-relaxed">{activeDomainData.guidance}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Cosmic Cautions
                  </span>
                  <p className="text-cosmic-text leading-relaxed">{activeDomainData.cautions}</p>
                </div>
              </div>

              {/* Favorable Activities */}
              {activeDomainData.favorableActivities?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cosmic-muted uppercase tracking-wider block">
                    Favorable Actions for this Period:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeDomainData.favorableActivities.map((act: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-cosmic-card border border-cosmic-border text-[11px] text-cosmic-text">
                        &bull; {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[10px] text-cosmic-muted border-t border-cosmic-border/40 pt-3 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cosmic-muted shrink-0 mt-0.5" />
                <span>{activeDomainData.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
