import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Briefcase,
  Heart,
  DollarSign,
  Activity,
  Users,
  Feather,
  ArrowRight,
  PlusCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface DashboardPageProps {
  onNavigate: (tab: NavTabId) => void;
  userName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, userName = 'Cosmic Seeker' }) => {
  const [kundli, setKundli] = useState<any>(null);
  const [panchang, setPanchang] = useState<any>(null);
  const [choghadiya, setChoghadiya] = useState<any>(null);
  const [dailyDimensions, setDailyDimensions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch user's calculated chart
    fetch('/api/astrology/chart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.ascendant || data.chart?.ascendant)) {
          setKundli(data.chart || data);
        } else {
          setKundli(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setKundli(null);
        setIsLoading(false);
      });

    // 2. Fetch live astronomical Panchang for today
    fetch('/api/astrology/panchang')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPanchang(data);
      })
      .catch(() => {});

    // 3. Fetch live Auspicious Choghadiya & Daily Dimensions
    fetch('/api/cosmic/choghadiya-hora')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setChoghadiya(data);
      })
      .catch(() => {});

    fetch('/api/cosmic/daily-dimensions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDailyDimensions(data);
      })
      .catch(() => {});
  }, []);

  const chart = kundli;
  const moonSign = chart?.moonSign?.signName || chart?.planets?.find((p: any) => p.name === 'Moon')?.sign;
  const moonNakshatra = chart?.moonNakshatra?.name || chart?.planets?.find((p: any) => p.name === 'Moon')?.nakshatra;
  const ascendantSign = chart?.ascendant?.details?.signName;
  const ascendantDegree = chart?.ascendant?.details?.degreeInSign !== undefined ? `${chart.ascendant.details.degreeInSign}°` : null;
  const mahadasha = chart?.dashas?.currentMahadasha?.planet;
  const antardasha = chart?.dashas?.currentAntardasha?.planet;
  const weather = chart?.predictions?.today;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/50 p-8 h-48 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Harmonizing planetary coordinates...</span>
          </div>
        </div>
      </div>
    );
  }

  // Authentic Empty State when no real birth profile has been calculated yet
  if (!chart || !ascendantSign) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Top Greeting */}
        <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Cosmic Command Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-cosmic-text">
              Welcome, {userName}.
            </h1>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
              Your personal horoscope and real-time transit energy engine requires your exact birth coordinates.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => onNavigate('kundli')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Calculate Birth Chart</span>
            </button>
          </div>
        </div>

        {/* Empty State Callout Card */}
        <div className="rounded-3xl border border-dashed border-cosmic-border bg-cosmic-surface/40 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-cosmic-text">No Birth Profile Configured</h3>
            <p className="text-xs text-cosmic-muted leading-relaxed">
              DeepAstro calculates verified ephemeris coordinates from your exact date, time, and city of birth.
              Once calculated, your Mahadashas, Moon Nakshatra, and 6 life-energy pillars will appear here in real-time.
            </p>
          </div>
          <button
            onClick={() => onNavigate('kundli')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:border-cyan-400/50 text-xs font-bold text-cosmic-text transition-colors"
          >
            <span>Enter Birth Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Live Astronomical Panchang (Real celestial observation for today) */}
        {panchang && (
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cosmic-gold uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5" /> Today's Live Sidereal Panchang
              </div>
              <span className="text-[10px] text-cosmic-muted font-mono">{panchang.date || new Date().toISOString().split('T')[0]}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Tithi</span>
                <span className="font-bold text-cosmic-text text-sm">{panchang.tithi || 'Shukla Paksha'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Nakshatra</span>
                <span className="font-bold text-cosmic-text text-sm">{panchang.nakshatra || 'Current Nakshatra'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Vara (Day)</span>
                <span className="font-bold text-cosmic-text text-sm">{panchang.vara || 'Vara'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Yoga</span>
                <span className="font-bold text-cosmic-text text-sm">{panchang.yoga || 'Yoga'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dynamic pillars only when predictions exist
  const pillars = weather
    ? [
        { label: 'Career & Ambition', score: weather.career?.score ?? 75, icon: Briefcase, headline: weather.career?.headline || 'Active period', insight: weather.career?.insight || 'Align action with planetary lords.' },
        { label: 'Love & Harmony', score: weather.love?.score ?? 75, icon: Heart, headline: weather.love?.headline || 'Relational harmony', insight: weather.love?.insight || 'Observe Venusian transit.' },
        { label: 'Wealth & Labha', score: weather.finance?.score ?? 75, icon: DollarSign, headline: weather.finance?.headline || 'Resource flow', insight: weather.finance?.insight || 'Focus on sustainable value.' },
        { label: 'Health & Vitality', score: weather.health?.score ?? 75, icon: Activity, headline: weather.health?.headline || 'Physical vitality', insight: weather.health?.insight || 'Maintain balanced circadian habits.' },
        { label: 'Family & Roots', score: weather.family?.score ?? 75, icon: Users, headline: weather.family?.headline || 'Domestic environment', insight: weather.family?.insight || 'Ground yourself with loved ones.' },
        { label: 'Spirituality', score: weather.spirituality?.score ?? 75, icon: Feather, headline: weather.spirituality?.headline || 'Subtle awareness', insight: weather.spirituality?.insight || 'Deep introspection favored.' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Cosmic Score */}
      <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Personal Cosmic Command Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-cosmic-text">
            Good Day, {userName}.
          </h1>
          <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
            Ascendant configured in {ascendantSign}{ascendantDegree ? ` at ${ascendantDegree}` : ''}. Chart calculations verified by Swiss Ephemeris.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {weather?.overallEnergyScore !== undefined && (
            <div className="p-4 rounded-2xl bg-cosmic-surface border border-cyan-500/30 text-center min-w-[110px] shadow-glow-cyan/20">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase block tracking-wider">Cosmic Score</span>
              <span className="text-3xl font-display font-black text-cyan-400">
                {weather.overallEnergyScore}%
              </span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-cosmic-surface border border-cosmic-border text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-cosmic-muted uppercase block tracking-wider">Moon Rashi</span>
            <span className="text-sm font-extrabold text-cosmic-text mt-1 block">
              {moonSign || 'Not Available'}
            </span>
            {moonNakshatra && (
              <span className="text-[10px] text-cosmic-gold font-medium">
                {moonNakshatra}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Dasha and Transit Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Active Mahadasha</span>
            <span className="font-bold text-cosmic-text text-sm">{mahadasha || 'Vimshottari Dasha'}</span>
          </div>
          {mahadasha && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Active
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Sub-Period (Antardasha)</span>
            <span className="font-bold text-cosmic-text text-sm">{antardasha || 'Sub-Lord'}</span>
          </div>
          {antardasha && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Current
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Ascendant (Lagna)</span>
            <span className="font-bold text-cosmic-text text-sm">{ascendantSign}</span>
          </div>
          {ascendantDegree && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {ascendantDegree}
            </span>
          )}
        </div>
      </div>

      {/* Cosmic Super-App Feature Hub Showcase */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-[#0a1024] via-cosmic-surface to-[#0a1024] p-6 sm:p-7 shadow-glow-cyan/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                New Super-App Suite
              </span>
              <span className="text-xs text-cosmic-muted font-medium">Co-Star • The Pattern • Sanctuary • AstroSage</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
              Live Auspicious Sky, Life Cycles & Graha Tarot
            </h3>
            <p className="text-xs text-cosmic-muted max-w-xl">
              Real-time countdown to favorable Choghadiyas, 6-dimensional life vibe radar, 22 Graha Tarot card draw, and instant Prashna oracle.
            </p>
          </div>

          <button
            onClick={() => onNavigate('cosmic-hub')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Cosmic Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick indicators row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-cosmic-border/60">
          <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
            <span className="text-[10px] text-cosmic-muted uppercase font-bold block">Live Choghadiya</span>
            <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block truncate">
              {choghadiya?.currentChoghadiya?.name || 'Auspicious'} ({choghadiya?.currentChoghadiya?.nature || 'Active'})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
            <span className="text-[10px] text-cosmic-muted uppercase font-bold block">Planetary Hora</span>
            <span className="text-xs font-extrabold text-cyan-300 mt-0.5 block truncate">
              {choghadiya?.currentHora?.planet || 'Jupiter'} Hora
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
            <span className="text-[10px] text-cosmic-muted uppercase font-bold block">Daily Vibe Score</span>
            <span className="text-xs font-extrabold text-amber-300 mt-0.5 block">
              {dailyDimensions?.overallVibeScore || 85}% Harmonized
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
            <span className="text-[10px] text-cosmic-muted uppercase font-bold block">Power Color</span>
            <span className="text-xs font-extrabold text-white mt-0.5 block truncate">
              {dailyDimensions?.luckyMatrix?.powerColor || 'Royal Indigo'}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Core Life Pillars Grid (Rendered dynamically when predictions are generated) */}
      {pillars.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              6 Dimensions of Today's Energy
            </h2>
            <button
              onClick={() => onNavigate('predictions')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Forecast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-cosmic-border bg-cosmic-surface p-5 hover:border-cyan-500/40 transition-all duration-300 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-cosmic-text">{p.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{p.score}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-cosmic-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-cosmic-text">{p.headline}</h4>
                    <p className="text-[11px] text-cosmic-muted mt-0.5 leading-snug">{p.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-cosmic-border bg-cosmic-surface/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-cosmic-text">Daily Astrological Forecast</h4>
            <p className="text-xs text-cosmic-muted mt-0.5">
              Generate today's transits and customized 6-dimensional energetic forecast for your chart.
            </p>
          </div>
          <button
            onClick={() => onNavigate('predictions')}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/20 transition-colors shrink-0"
          >
            Generate Forecast
          </button>
        </div>
      )}

      {/* Daily Guidance & Actionable Remedies */}
      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cosmic-gold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5" /> Auspicious Windows
            </div>
            <div className="space-y-3 text-xs">
              {weather.favorableHours && (
                <div className="p-3 rounded-xl bg-cosmic-card/60 border border-cosmic-border/60 flex items-center justify-between">
                  <span className="text-cosmic-muted">Favorable Period:</span>
                  <span className="font-bold text-emerald-400">{weather.favorableHours}</span>
                </div>
              )}
              {weather.cautionHours && (
                <div className="p-3 rounded-xl bg-cosmic-card/60 border border-cosmic-border/60 flex items-center justify-between">
                  <span className="text-cosmic-muted">Caution (Rahu Kalam):</span>
                  <span className="font-bold text-amber-400">{weather.cautionHours}</span>
                </div>
              )}
              {weather.helpfulDirection && (
                <div className="p-3 rounded-xl bg-cosmic-card/60 border border-cosmic-border/60 flex items-center justify-between">
                  <span className="text-cosmic-muted">Supportive Direction:</span>
                  <span className="font-bold text-cyan-400">{weather.helpfulDirection}</span>
                </div>
              )}
            </div>
          </div>

          {weather.suggestedAction && (
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Feather className="w-3.5 h-3.5" /> Suggested Vedic Action
              </div>
              <p className="text-xs text-cosmic-text leading-relaxed">
                {weather.suggestedAction}
              </p>
              {weather.dailyMantra && (
                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-xs">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Harmonizing Mantra</span>
                  <span className="text-sm font-display font-extrabold text-cosmic-text">
                    {weather.dailyMantra}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
