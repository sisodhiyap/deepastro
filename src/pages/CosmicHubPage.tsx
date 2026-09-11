import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Compass,
  Clock,
  Activity,
  Heart,
  Briefcase,
  Users,
  Feather,
  ShieldAlert,
  Share2,
  RefreshCw,
  HelpCircle,
  Eye,
  CheckCircle2,
  Layers,
  Flame,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { CosmicStoryCardModal } from '../components/astrology/CosmicStoryCardModal.js';
import { CosmicSOSModal } from '../components/astrology/CosmicSOSModal.js';
import { NavTabId } from '../components/layout/Sidebar.js';

interface CosmicHubPageProps {
  onNavigate?: (tab: NavTabId) => void;
  userName?: string;
}

export const CosmicHubPage: React.FC<CosmicHubPageProps> = ({ onNavigate, userName = 'Cosmic Seeker' }) => {
  const [activeTab, setActiveTab] = useState<
    'vibe' | 'timing' | 'sky' | 'choghadiya' | 'tarot' | 'prashna'
  >('vibe');

  const [isLoading, setIsLoading] = useState(true);
  const [liveSky, setLiveSky] = useState<any[]>([]);
  const [choghadiyaData, setChoghadiyaData] = useState<any>(null);
  const [moonPhase, setMoonPhase] = useState<any>(null);
  const [dailyDimensions, setDailyDimensions] = useState<any>(null);
  const [dailyTarot, setDailyTarot] = useState<any>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [sadeSatiMatrix, setSadeSatiMatrix] = useState<any>(null);
  const [lifeCycles, setLifeCycles] = useState<any[]>([]);
  const [chartContext, setChartContext] = useState<any>(null);

  // Prashna Oracle State
  const [prashnaQuestion, setPrashnaQuestion] = useState('');
  const [prashnaResult, setPrashnaResult] = useState<any>(null);
  const [prashnaLoading, setPrashnaLoading] = useState(false);

  // Modals
  const [storyCardOpen, setStoryCardOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Ticking countdown seconds for Choghadiya
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [skyRes, chogRes, moonRes, dimRes, tarotRes, sadeRes, chartRes, cycleRes] = await Promise.all([
          fetch('/api/cosmic/live-sky').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/choghadiya-hora').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/moon-phase').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/daily-dimensions').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/daily-tarot').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/sade-sati-matrix').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/astrology/chart').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cosmic/life-cycles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (skyRes?.planets) setLiveSky(skyRes.planets);
        if (chogRes) {
          setChoghadiyaData(chogRes);
          setCountdownSeconds(chogRes.remainingSecondsInCurrent || 0);
        }
        if (moonRes) setMoonPhase(moonRes);
        if (dimRes) setDailyDimensions(dimRes);
        if (tarotRes) setDailyTarot(tarotRes);
        if (sadeRes) setSadeSatiMatrix(sadeRes);
        if (chartRes?.chart || chartRes?.ascendant) setChartContext(chartRes.chart || chartRes);
        if (cycleRes?.cycles) setLifeCycles(cycleRes.cycles);
      } catch (err) {
        console.error('Failed to load cosmic features', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Ticking countdown timer for Choghadiya window
  useEffect(() => {
    if (countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownSeconds]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handlePrashnaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prashnaQuestion.trim() || prashnaLoading) return;

    setPrashnaLoading(true);
    try {
      const res = await fetch('/api/cosmic/prashna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prashnaQuestion }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrashnaResult(data);
      }
    } catch (err) {
      console.error('Prashna inquiry failed', err);
    } finally {
      setPrashnaLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-fadeIn">
        <div className="h-64 rounded-3xl border border-cosmic-border bg-cosmic-surface/50 p-8 flex items-center justify-center animate-pulse">
          <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Harmonizing real-time celestial coordinates...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentChog = choghadiyaData?.currentChoghadiya;
  const currentHora = choghadiyaData?.currentHora;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Banner & Command Bar */}
      <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Vedic Cosmic Hub & Celestial Observatory
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-cosmic-text">
            The Cosmos in Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
            Synthesizing the world's most powerful astrology features: real-time planetary transits, auspicious Choghadiya clocks, life cycle chapters, and the 22 Graha Tarot oracle.
          </p>
        </div>

        {/* Global Action Chips */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Quick Choghadiya Badge */}
          {currentChog && (
            <div className="px-4 py-2 rounded-2xl bg-cosmic-surface border border-cosmic-border flex items-center gap-2.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <span className="text-[10px] text-cosmic-muted font-bold block uppercase tracking-wider">
                  Live Choghadiya
                </span>
                <span className="text-xs font-extrabold text-white">
                  {currentChog.name} ({currentChog.nature})
                </span>
              </div>
            </div>
          )}

          {/* Cosmic Story Card Trigger */}
          <button
            onClick={() => setStoryCardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Story Card</span>
          </button>

          {/* Cosmic SOS Button */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs hover:bg-red-500/30 transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Cosmic SOS</span>
          </button>
        </div>
      </div>

      {/* Feature Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-cosmic-border/60 select-none">
        {[
          { id: 'vibe' as const, label: '🌟 Vibe & Dimensions', badge: 'Co-Star' },
          { id: 'timing' as const, label: '⏳ Your Timing & Cycles', badge: 'The Pattern' },
          { id: 'sky' as const, label: '🌌 Live Sky & Transits', badge: 'TimePassages' },
          { id: 'choghadiya' as const, label: '🕒 Auspicious Clock & Moon', badge: 'Chani' },
          { id: 'tarot' as const, label: '🎴 Tarot & Graha Oracle', badge: 'Sanctuary' },
          { id: 'prashna' as const, label: '🔮 Instant Prashna Oracle', badge: 'AstroSage' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold shadow-glow-cyan'
                : 'bg-cosmic-surface/70 text-cosmic-muted hover:text-white hover:bg-cosmic-surface border border-cosmic-border/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-extrabold ${
                activeTab === tab.id ? 'bg-black/30 text-white' : 'bg-cosmic-card text-cyan-300'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: 🌟 VIBE & DIMENSIONS (Co-Star Style) */}
      {activeTab === 'vibe' && dailyDimensions && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Vibe Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vibe Score Card */}
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Daily Cosmic Vibe
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Harmonized
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold font-display bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  {dailyDimensions.overallVibeScore}%
                </span>
                <span className="text-xs text-cosmic-muted font-medium">Cosmic Fluidity</span>
              </div>

              <p className="text-xs text-cosmic-muted leading-relaxed italic border-t border-cosmic-border/50 pt-3">
                {dailyDimensions.dailyCosmicQuote}
              </p>
            </div>

            {/* Lucky Cosmic Matrix */}
            <div className="md:col-span-2 rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cosmic Lucky Matrix
                </span>
                <span className="text-xs text-cosmic-muted">Grounded in Today's Nakshatra</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-cosmic-card/70 border border-cosmic-border">
                  <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Lucky Numbers</span>
                  <span className="text-sm font-mono font-extrabold text-cyan-300">
                    {dailyDimensions.luckyMatrix.luckyNumbers.join(' • ')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-cosmic-card/70 border border-cosmic-border">
                  <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Power Color</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dailyDimensions.luckyMatrix.powerColorHex }}
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {dailyDimensions.luckyMatrix.powerColor}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cosmic-card/70 border border-cosmic-border">
                  <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Lucky Direction</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {dailyDimensions.luckyMatrix.luckyDirection}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-cosmic-card/70 border border-cosmic-border">
                  <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Auspicious Hour</span>
                  <span className="text-xs font-bold text-emerald-300 truncate block">
                    {dailyDimensions.luckyMatrix.auspiciousHourWindow}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                <strong className="block text-cyan-300 font-bold mb-1">Today's Affirmation:</strong>
                "{dailyDimensions.luckyMatrix.dailyAffirmation}"
              </div>
            </div>
          </div>

          {/* 6-Dimensional Radar Breakdown */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-4">
              <div>
                <h3 className="text-lg font-display font-extrabold text-white">
                  6-Dimensional Life Energy Radar
                </h3>
                <p className="text-xs text-cosmic-muted">
                  Mathematical alignment across your mental, emotional, social, and spiritual planes.
                </p>
              </div>
              <button
                onClick={() => setStoryCardOpen(true)}
                className="px-4 py-2 rounded-xl bg-cosmic-surface border border-cosmic-border text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Radar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyDimensions.dimensions.map((dim: any) => (
                <div
                  key={dim.key}
                  className="p-5 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{dim.label}</span>
                    <span className="text-sm font-mono font-extrabold text-cyan-400">{dim.score}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-cosmic-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-cosmic-muted">
                    <span className="font-semibold text-cosmic-text">{dim.vibe}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{dim.rulingInfluence}</span>
                  </div>

                  <p className="text-xs text-cosmic-muted leading-relaxed border-t border-cosmic-border/40 pt-2">
                    {dim.highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Co-Star Style Do's and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-extrabold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Cosmic Do's for Today
              </div>
              <div className="space-y-3">
                {dailyDimensions.dosAndDonts.dos.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-cosmic-card/60 border border-emerald-500/20 flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div className="text-xs space-y-1">
                      <p className="text-white font-medium">{item.text}</p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-300 font-mono">
                        <span>Window: {item.optimalTime}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className="rounded-3xl border border-red-500/30 bg-red-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-display font-extrabold text-sm uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                Cosmic Don'ts (Friction Traps)
              </div>
              <div className="space-y-3">
                {dailyDimensions.dosAndDonts.donts.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-cosmic-card/60 border border-red-500/20 flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <div className="text-xs space-y-1">
                      <p className="text-white font-medium">{item.text}</p>
                      <div className="flex items-center gap-2 text-[10px] text-red-300 font-mono">
                        <span>Caution: {item.warningTime}</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ⏳ YOUR TIMING & LIFE CYCLES (The Pattern Style) */}
      {activeTab === 'timing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              The Pattern Life Timing Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Active Karmic Chapters & Evolutionary Timing
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl">
              Understand the macro chapters governing your life. Each cycle carries a specific psychological curriculum, a shadow trap to navigate, and an evolutionary gift.
            </p>
          </div>

          {lifeCycles.length === 0 ? (
            <div className="rounded-3xl border border-cosmic-border/60 bg-cosmic-surface/40 p-10 text-center space-y-4">
              <Clock className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
              <h3 className="text-lg font-display font-bold text-white">Natal Birth Profile Required</h3>
              <p className="text-xs sm:text-sm text-cosmic-muted max-w-md mx-auto">
                Evolutionary life cycles and karmic chapters require your verified birth date, time, and coordinates to calculate Vimshottari Mahadasha timing.
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('profile')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Configure Birth Profile
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {lifeCycles.map((cycle: any) => (
                <div
                  key={cycle.id}
                  className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 sm:p-8 space-y-6 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/50 pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                        {cycle.theme}
                      </span>
                      <h3 className="text-xl font-display font-extrabold text-white mt-1">
                        {cycle.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-extrabold font-mono text-cyan-300">
                          Day {cycle.currentDayInCycle}
                        </span>
                        <span className="text-xs text-cosmic-muted font-mono">/ {cycle.totalDaysInCycle}</span>
                      </div>
                      <span className="text-[10px] text-cosmic-muted uppercase tracking-wider block">
                        {cycle.progressPercentage}% Completed
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-cosmic-card overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400"
                        style={{ width: `${cycle.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-cosmic-muted">
                      <span>Initiation: {cycle.startDate}</span>
                      <span>Integration: {cycle.endDate}</span>
                    </div>
                  </div>

                  {/* Narrative Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-cosmic-card/80 border border-cosmic-border space-y-2">
                      <strong className="text-white block font-bold text-sm">
                        Psychological Focus
                      </strong>
                      <p className="text-cosmic-muted leading-relaxed">
                        {cycle.psychologicalFocus}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <strong className="text-emerald-300 block font-bold text-sm">
                        Evolutionary Gift
                      </strong>
                      <p className="text-emerald-100/80 leading-relaxed">
                        {cycle.evolutionaryGift}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                      <strong className="text-red-300 block font-bold text-sm">
                        Shadow Trap to Avoid
                      </strong>
                      <p className="text-red-100/80 leading-relaxed">
                        {cycle.shadowTrap}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                      <strong className="text-cyan-300 block font-bold text-sm">
                        Actionable Guidance
                      </strong>
                      <p className="text-cyan-100/80 leading-relaxed">
                        {cycle.actionableGuidance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 🌌 LIVE SKY & TRANSITS (TimePassages Style) */}
      {activeTab === 'sky' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Live Sidereal Astronomical Ephemeris (Lahiri)
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Real-Time Planetary Coordinates in the Sky
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
              Direct astronomical positions of the 9 Navagrahas calculated via VSOP87 & ELP-2000 theory for this exact moment.
            </p>
          </div>

          {/* Planetary Radar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSky.map((p) => (
              <div
                key={p.name}
                className="p-5 rounded-3xl bg-cosmic-surface/70 border border-cosmic-border space-y-3 hover:border-cyan-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-serif text-cyan-400">{p.symbol}</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{p.name}</h4>
                      <span className="text-[10px] text-cosmic-muted font-mono">{p.sanskritName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.isRetrograde && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                        Rx (Retrograde)
                      </span>
                    )}
                    {p.isCombust && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Combust
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cosmic-card border border-cosmic-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.formattedPosition}</span>
                  <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                    {p.nakshatra} (P{p.pada})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-cosmic-muted pt-1">
                  <span>Speed: {p.speed}°/day</span>
                  <span className="font-mono text-cyan-400">Aspects Houses: {p.aspectsHouses.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3-Phase Sade Sati Matrix (AstroSage Style) */}
          {sadeSatiMatrix && (
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/50 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    AstroSage 7.5-Year Lifecycle
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    Shani Sade Sati Transit Matrix
                  </h3>
                  <p className="text-xs text-cosmic-muted">
                    Saturn currently in <strong>{sadeSatiMatrix.currentSaturnSign}</strong> • Your Moon in{' '}
                    <strong>{sadeSatiMatrix.moonSign}</strong>
                  </p>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-cosmic-card border border-cosmic-border text-left sm:text-right">
                  <span className="text-[10px] text-cosmic-muted font-bold block uppercase tracking-wider">
                    Current Status
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      sadeSatiMatrix.isInSadeSati ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {sadeSatiMatrix.activePhase}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sadeSatiMatrix.phases.map((ph: any, i: number) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all ${
                      ph.isActive
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-cosmic-card/60 border-cosmic-border text-cosmic-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-extrabold">{ph.phase}</span>
                      {ph.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300">
                          Active Phase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 block mb-2">{ph.houseFromMoon}</span>
                    <p className="text-xs leading-relaxed">{ph.theme}</p>
                  </div>
                ))}
              </div>

              {/* Classical Remedies */}
              <div className="p-4 rounded-2xl bg-cosmic-card/70 border border-cosmic-border space-y-2">
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider block">
                  Authoritative Shani Mitigation Remedies
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-cosmic-muted">
                  {sadeSatiMatrix.remedies.map((rem: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: 🕒 AUSPICIOUS CLOCK & MOON (Chani & Drik Panchang Style) */}
      {activeTab === 'choghadiya' && choghadiyaData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Live Countdown Clock */}
          <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-card via-cosmic-surface to-cosmic-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Live Choghadiya Auspicious Clock
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Current Hour: <span className="text-cyan-400">{currentChog?.name}</span> ({currentChog?.nature})
              </h3>
              <p className="text-xs text-cosmic-muted">
                Ruled by {currentChog?.rulingPlanet} • Time window: {currentChog?.startTime} – {currentChog?.endTime}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cosmic-card border border-cosmic-border flex flex-col items-center justify-center text-center space-y-1 min-w-[200px]">
              <span className="text-[10px] text-cosmic-muted uppercase font-bold tracking-wider">
                Time Remaining in Window
              </span>
              <span className="text-3xl font-mono font-extrabold text-emerald-400">
                {formatCountdown(countdownSeconds)}
              </span>
              <span className="text-[10px] text-cyan-300 font-medium">
                Next: {choghadiyaData.nextChoghadiya?.name} ({choghadiyaData.nextChoghadiya?.startTime})
              </span>
            </div>
          </div>

          {/* Planetary Hora */}
          {currentHora && (
            <div className="p-5 rounded-3xl bg-cosmic-surface/60 border border-cosmic-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Active Planetary Hora
                </span>
                <h4 className="text-lg font-bold text-white">
                  {currentHora.planet} Hora ({currentHora.sanskritName})
                </h4>
                <p className="text-xs text-cosmic-muted">
                  Energy: {currentHora.energy} • Valid {currentHora.startTime} – {currentHora.endTime}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <span className="text-[10px] text-cosmic-muted uppercase font-bold block">
                  Best For Right Now:
                </span>
                <span className="text-cyan-300 font-semibold block">
                  {currentHora.favorableActivities.join(' • ')}
                </span>
              </div>
            </div>
          )}

          {/* Choghadiya Day and Night Timelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Day Slots */}
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Day Choghadiya (Sunrise to Sunset)
                </h4>
                <span className="text-[10px] text-cosmic-muted font-mono">8 Equal Spans</span>
              </div>

              <div className="space-y-2">
                {choghadiyaData.daySlots.map((slot: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      slot.isActive
                        ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-sm'
                        : 'bg-cosmic-card/50 border-cosmic-border/60 text-cosmic-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          slot.nature.includes('Highly')
                            ? 'bg-emerald-400'
                            : slot.nature.includes('Auspicious')
                            ? 'bg-cyan-400'
                            : slot.nature === 'Neutral'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <div>
                        <span className="font-bold text-white">{slot.name}</span>
                        <span className="text-[10px] text-cosmic-muted ml-2">({slot.nature})</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-cosmic-text">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Night Slots */}
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  Night Choghadiya (Sunset to Sunrise)
                </h4>
                <span className="text-[10px] text-cosmic-muted font-mono">8 Equal Spans</span>
              </div>

              <div className="space-y-2">
                {choghadiyaData.nightSlots.map((slot: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      slot.isActive
                        ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-sm'
                        : 'bg-cosmic-card/50 border-cosmic-border/60 text-cosmic-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          slot.nature.includes('Highly')
                            ? 'bg-emerald-400'
                            : slot.nature.includes('Auspicious')
                            ? 'bg-cyan-400'
                            : slot.nature === 'Neutral'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <div>
                        <span className="font-bold text-white">{slot.name}</span>
                        <span className="text-[10px] text-cosmic-muted ml-2">({slot.nature})</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-cosmic-text">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Moon Phase & Manifestation Rituals (Chani Style) */}
          {moonPhase && (
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/50 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Chani Lunar Ritual Engine
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    {moonPhase.phaseName}
                  </h3>
                  <p className="text-xs text-cosmic-muted">
                    Moon in <strong>{moonPhase.moonSign}</strong> ({moonPhase.moonNakshatra}) • Lunar Age:{' '}
                    {moonPhase.lunarAgeDays} days
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-display font-extrabold text-white">
                      {moonPhase.illuminationPercentage}%
                    </span>
                    <span className="text-[10px] text-cosmic-muted block uppercase">Illuminated</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Moon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Ritual Guide Card */}
              <div className="p-5 rounded-2xl bg-cosmic-card border border-cosmic-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{moonPhase.ritualGuide.title}</h4>
                  <span className="text-xs text-cyan-300 font-mono font-bold">
                    {moonPhase.ritualGuide.gemstoneOrElement}
                  </span>
                </div>
                <p className="text-xs text-cosmic-muted leading-relaxed">
                  {moonPhase.ritualGuide.focus}
                </p>
                <div className="p-3 rounded-xl bg-cosmic-surface/80 border border-cosmic-border text-xs text-cyan-300 font-mono">
                  Mantra: {moonPhase.ritualGuide.mantra}
                </div>
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-white block">Step-by-step ritual instructions:</span>
                  <ul className="space-y-1 text-xs text-cosmic-muted">
                    {moonPhase.ritualGuide.instructions.map((inst: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: 🎴 TAROT & VEDIC GRAHA ORACLE (Sanctuary Style) */}
      {activeTab === 'tarot' && dailyTarot && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Sanctuary 3D Celestial Oracle Deck
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              Daily Graha Tarot of the Day
            </h2>
            <p className="text-xs text-cosmic-muted">
              Classical Major Arcana archetypes mapped directly to their Vedic planetary rulers, deities, and micro-rituals.
            </p>
          </div>

          {/* Interactive Card */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              onClick={() => setIsCardFlipped((f) => !f)}
              className="group cursor-pointer perspective-1000 w-72 sm:w-80 h-[440px]"
            >
              <div
                className={`relative w-full h-full duration-700 preserve-3d transition-transform rounded-3xl shadow-2xl ${
                  isCardFlipped ? 'rotate-y-180' : ''
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-b from-[#111827] via-[#0b0f19] to-[#030712] border-2 border-cyan-500/40 p-6 flex flex-col justify-between items-center text-center shadow-glow-cyan"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-full flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                    <span>CARD #{dailyTarot.id}</span>
                    <span>{dailyTarot.vedicGraha}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-300 text-3xl">
                      ✦
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-extrabold text-white">
                        {dailyTarot.cardName}
                      </h3>
                      <span className="text-xs text-amber-300 font-medium block mt-1">
                        {dailyTarot.vedicDeity}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-full text-xs text-cosmic-muted italic">
                    "{dailyTarot.archetype}"
                  </div>

                  <span className="text-[11px] text-cyan-400/80 font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Tap card to reveal deep wisdom
                  </span>
                </div>

                {/* Back of Card (Flipped) */}
                <div
                  className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#050b14] to-[#020617] border-2 border-amber-500/40 p-6 flex flex-col justify-between text-left rotate-y-180 shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-base font-bold text-white">{dailyTarot.cardName}</h4>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                        {dailyTarot.isReversed ? 'Reversed' : 'Upright'}
                      </span>
                    </div>

                    <p className="text-xs text-cosmic-text leading-relaxed">
                      {dailyTarot.isReversed ? dailyTarot.reversedMeaning : dailyTarot.uprightMeaning}
                    </p>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      <strong className="block text-amber-300 font-bold mb-1">Cosmic Insight:</strong>
                      {dailyTarot.cosmicInsight}
                    </div>

                    <div className="text-xs space-y-1">
                      <strong className="text-white block font-bold">Today's Micro-Ritual:</strong>
                      <p className="text-cosmic-muted">{dailyTarot.microRitual}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-center">
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">
                      {dailyTarot.beejaMantra}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCardFlipped((f) => !f)}
              className="px-5 py-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isCardFlipped ? 'Flip Back to Front' : 'Flip to Read Meaning'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: 🔮 INSTANT PRASHNA ORACLE (AstroSage Horary Style) */}
      {activeTab === 'prashna' && (
        <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AstroSage Horary Divination
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              Instant Prashna Kundli
            </h2>
            <p className="text-xs text-cosmic-muted">
              Have a pressing life question? The exact instant you ask, the planetary alignment carries the answer. Ask with single-minded focus.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handlePrashnaSubmit}
            className="rounded-3xl border border-cosmic-border bg-cosmic-surface/80 p-6 sm:p-8 space-y-4 shadow-cosmic-card"
          >
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Enter Your Burning Question
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={prashnaQuestion}
                onChange={(e) => setPrashnaQuestion(e.target.value)}
                placeholder="e.g. Will my business partnership close this month?"
                className="flex-1 px-4 py-3 rounded-2xl bg-cosmic-card border border-cosmic-border text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={prashnaLoading || !prashnaQuestion.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-50"
              >
                {prashnaLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Divine Answer</span>
              </button>
            </div>
          </form>

          {/* Prashna Result Card */}
          {prashnaResult && (
            <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-cosmic-surface to-cosmic-card p-6 sm:p-8 space-y-6 shadow-glow-cyan animate-fadeIn">
              <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Prashna Lagna: {prashnaResult.prashnaLagna} ({prashnaResult.prashnaLagnaDegree}°)
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-white mt-1">
                    "{prashnaResult.question}"
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-extrabold font-mono text-cyan-300">
                    {prashnaResult.karyaSiddhiPercentage}%
                  </span>
                  <span className="text-[10px] text-cosmic-muted uppercase block">Karya Siddhi Score</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cosmic-card border border-cosmic-border">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Astrological Verdict:
                </span>
                <p className="text-sm font-bold text-white">{prashnaResult.verdict}</p>
                <p className="text-xs text-cosmic-muted mt-2 leading-relaxed">
                  {prashnaResult.recommendation}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Planetary Signatures:
                </span>
                <ul className="space-y-1.5 text-xs text-cosmic-muted">
                  {prashnaResult.astrologicalSignatures.map((sig: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
                {prashnaResult.shubhMuhuratWindow}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CosmicStoryCardModal
        isOpen={storyCardOpen}
        onClose={() => setStoryCardOpen(false)}
        vibeScore={dailyDimensions?.overallVibeScore || 85}
        quote={dailyDimensions?.dailyCosmicQuote || 'The stars incline, they do not compel.'}
        userName={userName}
        moonSign={chartContext?.moonSign?.signName || 'Taurus'}
        powerColor={dailyDimensions?.luckyMatrix?.powerColor}
        powerColorHex={dailyDimensions?.luckyMatrix?.powerColorHex}
        luckyNumbers={dailyDimensions?.luckyMatrix?.luckyNumbers}
        dimensions={dailyDimensions?.dimensions}
      />

      <CosmicSOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        chartContext={chartContext}
      />
    </div>
  );
};
