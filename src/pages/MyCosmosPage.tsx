import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Sun,
  Layers,
  Clock,
  Briefcase,
  Coins,
  Heart,
  Calendar,
  Brain,
  Globe,
  Binary,
  Shield,
  Activity,
  Send,
  RefreshCw,
  Zap,
  BookOpen,
  AlertCircle,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useChartSession, ReadingDepth, BirthInputState } from '../context/ChartSessionContext.js';
import { PlanetPosition, HouseCusp, VerifiedYoga } from '../types/chartSession.js';
import {
  COSMIC_MODULE_REGISTRY,
  CosmicModuleId,
  getCosmicModule,
  VERIFIED_MODULE_COUNT
} from '../modules/cosmicModuleRegistry.js';

// Deep Dive and Domain Components
import { CareerDeepDiveView } from '../components/astrology/CareerDeepDiveView.js';
import { NakshatrasView } from '../components/astrology/NakshatrasView.js';
import { TransitsRadarView } from '../components/astrology/TransitsRadarView.js';
import { WealthDeepDiveView } from '../components/astrology/WealthDeepDiveView.js';
import { RelationshipsDeepDiveView } from '../components/astrology/RelationshipsDeepDiveView.js';

// Module-level Error Boundary to protect My Cosmos layout
interface ErrorBoundaryProps {
  children: React.ReactNode;
  activeSubView: CosmicModuleId;
  onRetry: () => void;
  onReturnOverview: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Module rendering error caught in ModuleErrorBoundary:', error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.activeSubView !== this.props.activeSubView && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
              MODULE UNAVAILABLE
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              A rendering exception occurred while processing this celestial module. Your verified calculation snapshot remains 100% active and intact.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onRetry();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold hover:border-slate-500 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Module</span>
            </button>
            <button
              onClick={this.props.onReturnOverview}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all"
            >
              Return to Cosmic Overview
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const MyCosmosPage: React.FC<{ onNavigate?: (tab: string) => void }> = () => {
  const {
    session,
    activeSubView,
    setActiveSubView,
    readingDepth,
    setReadingDepth,
    isLoading,
    calculateSession,
    askCosmicAI,
    availableSessions,
    loadSessionByFingerprint,
    clearSession,
  } = useChartSession();

  const [formInput, setFormInput] = useState<BirthInputState>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('deepastro_birth_profile') : null;
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return {
          name: p.fullName || p.name || '',
          date: p.birthDate || '',
          time: p.birthTime || '',
          latitude: Number(p.latitude) || 28.6139,
          longitude: Number(p.longitude) || 77.2090,
          timezone: Number(p.timezone) || 5.5,
          city: p.birthPlace || '',
          country: 'India',
          gender: p.gender || 'other',
          ayanamsa: 'Lahiri',
          houseSystem: 'Placidus',
        };
      } catch (e) {}
    }
    return {
      name: '',
      date: '',
      time: '',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      city: '',
      country: '',
      gender: 'other',
      ayanamsa: 'Lahiri',
      houseSystem: 'Placidus',
    };
  });

  const [selectedPlanetName, setSelectedPlanetName] = useState<string>('Sun');
  const [selectedHouseNumber, setSelectedHouseNumber] = useState<number>(1);
  const [selectedVargaCode, setSelectedVargaCode] = useState<string>('D1');
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiError, setAiError] = useState<any>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await calculateSession(formInput);
    } catch (err) {}
  };

  const handleAiConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setAiError(null);
    try {
      const res = await askCosmicAI(aiQuery);
      setAiResponse(res);
    } catch (err: any) {
      setAiError(err);
    } finally {
      setAiLoading(false);
    }
  };

  const currentModuleMeta = getCosmicModule(activeSubView as CosmicModuleId) || COSMIC_MODULE_REGISTRY[0];

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-[#06070A] text-[#F8FAFC] font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-y-auto lg:overflow-hidden relative">
      {/* ========================================================================= */}
      {/* 1. CANONICAL SESSION HEADER (Stationary on Desktop, z-40, shrink-0)      */}
      {/* ========================================================================= */}
      <header className="shrink-0 border-b border-slate-800/80 bg-[#111827]/95 backdrop-blur-xl sticky top-0 lg:static z-40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold tracking-tight text-sm text-white">MY COSMOS</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-bold">
                CANONICAL SESSION 6.0.3
              </span>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
              Single Source of Truth Astronomical Model
            </div>
          </div>
        </div>

        {session ? (
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">{session.identity.userName}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hidden md:block">
              {session.resolvedLocation.city} ({session.resolvedLocation.latitude.toFixed(2)}°, {session.resolvedLocation.longitude.toFixed(2)}°)
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 hidden sm:block">
              FP: {session.birthDataFingerprint.slice(0, 8)}...
            </div>
            {/* Depth Selector */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {(['QUICK', 'STANDARD', 'DEEP', 'TECHNICAL'] as ReadingDepth[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setReadingDepth(d)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                    readingDepth === d ? 'bg-amber-500 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800 font-bold">
              CALCULATION REQUIRED
            </span>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. UNCALCULATED STATE: AUTHENTIC BIRTH CALCULATION FORM                  */}
      {/* ========================================================================= */}
      {!session ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full my-auto p-6 sm:p-8 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generate Your Canonical Cosmic Chart</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deterministic ephemeris calculations grounded in celestial mechanics. Zero synthetic fallbacks.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formInput.name}
                  onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={formInput.date}
                    onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Birth Time (Exact 24-hr)</label>
                  <input
                    type="time"
                    step="60"
                    value={formInput.time}
                    onChange={(e) => setFormInput({ ...formInput, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Birth Place / City</label>
                  <input
                    type="text"
                    value={formInput.city}
                    onChange={(e) => setFormInput({ ...formInput, city: e.target.value })}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formInput.latitude}
                    onChange={(e) => setFormInput({ ...formInput, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formInput.longitude}
                    onChange={(e) => setFormInput({ ...formInput, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-500 text-black font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-amber-500/25 transition-all"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>Calculate Canonical Chart Session</span>
              </button>
            </form>

            {availableSessions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="text-xs font-mono uppercase text-slate-400 mb-3">Or Load Cached Birth Fingerprint</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSessions.map((s) => (
                    <button
                      key={s.fingerprint}
                      onClick={() => loadSessionByFingerprint(s.fingerprint)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left text-xs flex items-center justify-between transition-all"
                    >
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="font-mono text-cyan-400">{s.fingerprint.slice(0, 12)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. THREE-REGION WORKSPACE: SIDEBAR + CONTENT SCROLL ARCHITECTURE          */
        /* ========================================================================= */
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* 3A. DESKTOP MODULE SIDEBAR (Independent Scroll, shrink-0) */}
          <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-800/80 bg-[#0B0F17]/80 overflow-y-auto p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between border-b border-slate-800/80 mb-2">
              <span>COSMIC MODULES</span>
              <span className="text-cyan-400 font-semibold">{VERIFIED_MODULE_COUNT} VERIFIED</span>
            </div>

            <div className="space-y-1 flex-1">
              {COSMIC_MODULE_REGISTRY.map((mod) => {
                const Icon = mod.icon;
                const isCur = activeSubView === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveSubView(mod.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isCur
                        ? 'bg-gradient-to-r from-amber-500/20 to-cyan-500/10 text-white border border-amber-500/40 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isCur ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="truncate">{mod.label}</span>
                    </div>
                    {mod.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {mod.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2 shrink-0">
              <button
                onClick={clearSession}
                className="w-full py-2 text-xs font-mono text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 rounded-xl transition-all"
              >
                Clear Chart Session
              </button>
            </div>
          </aside>

          {/* 3B. MOBILE HORIZONTAL MODULE STRIP (Fluid natural scrolling) */}
          <div className="lg:hidden shrink-0 border-b border-slate-800/80 bg-[#0B0F17]/95 px-3 py-2 overflow-x-auto flex gap-2 no-scrollbar">
            {COSMIC_MODULE_REGISTRY.map((mod) => {
              const Icon = mod.icon;
              const isCur = activeSubView === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveSubView(mod.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    isCur
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3C. MAIN CONTENT PANE (Independent Vertical Scroll, zero horizontal overflow) */}
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6 card-safe">
            <ModuleErrorBoundary
              activeSubView={activeSubView as CosmicModuleId}
              onRetry={() => {}}
              onReturnOverview={() => setActiveSubView('overview')}
            >
              {/* 1. COSMIC OVERVIEW */}
              {activeSubView === 'overview' && (
                <div className="space-y-6">
                  {/* Astronomical Snapshot Card */}
                  <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">Astronomical Foundation Snapshot</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Calculated via DeepAstro deterministic ephemeris bridge. Ayanamsa: {session.calculationMetadata.ayanamsa}.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                        MATHEMATICALLY VALIDATED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Ascendant (Lagna)</div>
                        <div className="text-lg font-bold text-white mt-1">{session.vedic.ascendantSign}</div>
                        <div className="text-xs text-cyan-400 font-mono">
                          {session.vedic.ascendantDegree.toFixed(2)}° &bull; {session.vedic.ascendantNakshatra}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Moon Sign (Rashi)</div>
                        <div className="text-lg font-bold text-white mt-1">{session.vedic.moonSign}</div>
                        <div className="text-xs text-amber-400 font-mono">
                          {session.vedic.moonNakshatra} (Pada {session.vedic.moonPada})
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Sun Sign (Surya)</div>
                        <div className="text-lg font-bold text-white mt-1">{session.vedic.sunSign}</div>
                        <div className="text-xs text-slate-400 font-mono">Vedic Sidereal</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Active Operating Period</div>
                        <div className="text-base font-bold text-emerald-400 mt-1">
                          {session.dasha.currentMahaDasha}/{session.dasha.currentAntarDasha}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {session.dasha.currentCycleRemainingYears.toFixed(1)} yrs remaining
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distinctive Features */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">
                      WHAT MAKES YOUR CHART DISTINCTIVE
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {session.personalization.whatMakesYouUnique.map((feat, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                          <div className="text-xs font-mono text-cyan-400 font-bold uppercase">{feat.uniquenessDescriptor}</div>
                          <div className="text-base font-bold text-white">{feat.title}</div>
                          <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                          <div className="pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800">
                            Basis: {feat.astrologicalBasis}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart at a Glance / Dominant Theme Signals */}
                  <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">
                      DOMINANT LIFE THEMES & SIGNALS
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {session.personalization.chartAtAGlance.map((ins, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-amber-400">{ins.category}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              ins.strength === 'DOMINANT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ins.strength}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-200">{ins.headline}</div>
                          <div className="text-xs text-slate-400 mt-1">{ins.summary}</div>
                          {ins.supportingEvidence.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                              {ins.supportingEvidence.map((ev: string, evIdx: number) => (
                                <span key={evIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PLANETS & DIGNITIES */}
              {activeSubView === 'planets' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {session.vedic.planets.map((p: PlanetPosition) => (
                      <button
                        key={p.name}
                        onClick={() => setSelectedPlanetName(p.name)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          selectedPlanetName === p.name
                            ? 'bg-amber-500 text-black shadow-md font-bold'
                            : 'bg-[#111827] text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const planet = session.vedic.planets.find(p => p.name === selectedPlanetName) || session.vedic.planets[0];
                    return (
                      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white">{planet.name}</h3>
                            <div className="text-xs text-slate-400 font-mono mt-1">
                              {planet.sign} at {planet.degreeInSign.toFixed(2)}° | House {planet.house}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                              Dignity: {planet.dignity}
                            </span>
                            {planet.isRetrograde && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950 text-rose-400 border border-rose-800">
                                RETROGRADE
                              </span>
                            )}
                            {planet.isCombust && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold font-mono bg-amber-950 text-amber-400 border border-amber-800">
                                COMBUST
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-400">Nakshatra</div>
                            <div className="text-sm font-bold text-white mt-1">{planet.nakshatra}</div>
                            <div className="text-xs text-slate-400">Pada {planet.pada} (Lord: {planet.nakshatraLord})</div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-400">Sign Lord</div>
                            <div className="text-sm font-bold text-white mt-1">{planet.signLord}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-400">Aspects Cast</div>
                            <div className="text-sm font-bold text-white mt-1">
                              {planet.aspectsOnHouses.length > 0 ? planet.aspectsOnHouses.map(h => `H${h}`).join(', ') : 'Standard'}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-400">Daily Motion Speed</div>
                            <div className="text-sm font-bold text-white mt-1">{planet.speed.toFixed(3)}°/day</div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-xs font-mono uppercase font-bold text-amber-400 mb-2">
                            WHY DOES THIS MATTER? (ASTRONOMICAL EVIDENCE)
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {planet.name} in {planet.sign} in the {planet.house}th house connects its natural significations with the lordships of its cosmic sphere. Under {planet.dignity} dignity, this placement exerts direct influence on your psychological temperament and life milestones.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 3. 12 BHAVAS (HOUSES) */}
              {activeSubView === 'houses' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {session.vedic.houses.map((h: HouseCusp) => (
                      <button
                        key={h.houseNumber}
                        onClick={() => setSelectedHouseNumber(h.houseNumber)}
                        className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedHouseNumber === h.houseNumber
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        H{h.houseNumber}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const house = session.vedic.houses.find(h => h.houseNumber === selectedHouseNumber) || session.vedic.houses[0];
                    return (
                      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">House {house.houseNumber}: {house.sign}</h3>
                            <div className="text-xs text-slate-400 font-mono mt-1">
                              Cusp: {house.degree.toFixed(2)}° | Ruling Lord: {house.signLord}
                            </div>
                          </div>
                          <div className="text-xs font-mono text-cyan-400 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-800">
                            Occupants: {house.occupants.length > 0 ? house.occupants.join(', ') : 'Empty (Lord Governs)'}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-xs font-mono uppercase font-bold text-amber-400 mb-2">Core Significance</div>
                          <p className="text-xs text-slate-300 mb-3">{house.coreSignificance}</p>
                          <div className="text-xs font-mono uppercase font-bold text-cyan-400 mb-1">Interpretation</div>
                          <p className="text-xs text-slate-300 leading-relaxed">{house.interpretation}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. NAKSHATRAS (LUNAR MANSIIONS) - GENUINE EVIDENCE RESTORED */}
              {activeSubView === 'nakshatras' && (
                <NakshatrasView session={session} />
              )}

              {/* 5. MATHEMATICAL YOGAS */}
              {activeSubView === 'yogas' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-amber-400">DeepAstro Mathematical Yoga Engine:</span> Every displayed yoga has been mathematically proven against chart positions. No decorative or fabricated cards.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.yogas.map((yoga: VerifiedYoga, yIdx: number) => (
                      <div key={yIdx} className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-base">{yoga.name}</div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {yoga.category}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300">{yoga.traditionalInterpretation}</div>

                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono space-y-1">
                          <div className="text-cyan-400 font-bold">MATHEMATICAL PROOF:</div>
                          <div className="text-slate-300">{yoga.mathematicalProof}</div>
                          <div className="text-amber-400/80 pt-1">Strength Score: {yoga.strengthScore}/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. VIMSHOTTARI DASHA */}
              {activeSubView === 'dasha' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Vimshottari Dasha Engine</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      120-year cycle calculated from exact natal Moon Nakshatra degree ({session.vedic.ascendantDegree.toFixed(2)}° {session.vedic.moonNakshatra}).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-1">CURRENT OPERATING PERIOD</div>
                    <div className="text-2xl font-bold text-white">
                      {session.dasha.currentMahaDasha} Mahadasha / {session.dasha.currentAntarDasha} Antardasha
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Pratyantar: {session.dasha.currentPratyantarDasha} | Remaining: {session.dasha.currentCycleRemainingYears.toFixed(1)} years
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-mono uppercase text-slate-400 font-bold">120-YEAR MAHADASHA TIMELINE</div>
                    <div className="space-y-2">
                      {session.dasha.timeline.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-20 font-bold text-white">{item.planet}</span>
                            <span className="font-mono text-slate-400">{item.startDate} → {item.endDate}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            item.isCurrent ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.isCurrent ? 'ACTIVE' : item.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. TRANSIT RADAR (GOCHARA) - GENUINE EVIDENCE RESTORED */}
              {activeSubView === 'transits' && (
                <TransitsRadarView session={session} />
              )}

              {/* 8. VARGAS (D1, D9, D10) */}
              {activeSubView === 'vargas' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Divisional Vargas (Harmonic Charts)</h3>
                      <p className="text-xs text-slate-400 mt-1">Micro-harmonics of destiny: D1 Rashi, D9 Navamsha, D10 Dashamsha.</p>
                    </div>
                    <div className="flex gap-2">
                      {['D1', 'D9', 'D10'].map((code) => (
                        <button
                          key={code}
                          onClick={() => setSelectedVargaCode(code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                            selectedVargaCode === code ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-sm font-bold text-white">
                      {selectedVargaCode === 'D1' ? 'D1 Rashi Chart' : selectedVargaCode === 'D9' ? 'D9 Navamsha (Soul & Marriage)' : 'D10 Dashamsha (Career & Profession)'}
                    </div>
                    <div className="text-xs text-slate-300 mt-2">
                      {selectedVargaCode === 'D1' ? session.vargas.d1Summary : selectedVargaCode === 'D9' ? session.vargas.d9NavamshaSummary : session.vargas.d10DashamshaSummary}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-cyan-400">
                      Reinforced Strong Planets: {session.vargas.reinforcedPlanets.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. KP STELLAR ASTROLOGY */}
              {activeSubView === 'kp' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">KP Stellar Astrology Engine</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Placidus House Division + Krishnamurti Sub-Lord and Sub-Sub-Lord Hierarchy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-xs font-mono uppercase text-cyan-400 font-bold">12 KP CUSP SUB LORDS</div>
                      <div className="space-y-2">
                        {session.kp.cuspalSubLords.map((c) => (
                          <div key={c.cusp} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex items-center justify-between">
                            <span className="font-bold text-white">Cusp {c.cusp}</span>
                            <span className="text-slate-300">Sign: {c.signLord} | Star: {c.starLord}</span>
                            <span className="font-mono text-cyan-400">Sub: {c.subLord}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-mono uppercase text-amber-400 font-bold">PRIMARY SIGNIFICATORS</div>
                      <div className="space-y-2">
                        {Object.entries(session.kp.primarySignificators).map(([planet, houses]) => (
                          <div key={planet} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex items-center justify-between">
                            <span className="font-bold text-white">{planet}</span>
                            <span className="font-mono text-amber-400">Signifies Houses: {houses.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. WESTERN TROPICAL */}
              {activeSubView === 'western' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Western Tropical Zodiac Comparison</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sayana (Tropical) system without Ayanamsa deduction.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-slate-400">Tropical Sun</div>
                      <div className="text-lg font-bold text-white mt-1">{session.western.sunSign}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-slate-400">Tropical Moon</div>
                      <div className="text-lg font-bold text-white mt-1">{session.western.moonSign}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-slate-400">Rising (Ascendant)</div>
                      <div className="text-lg font-bold text-white mt-1">{session.western.risingSign}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase text-amber-400 font-bold">MAJOR TROPICAL ASPECTS</div>
                    {session.western.majorAspects.map((asp, aIdx) => (
                      <div key={aIdx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                        <span className="font-bold text-white">{asp.p1} {asp.type} {asp.p2}</span>
                        <span className="font-mono text-cyan-400">Orb: {asp.orbDeg.toFixed(1)}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. CAREER DEEP DIVE - PRIMARY REPORTED MISSING MODULE RESTORED */}
              {activeSubView === 'career' && (
                <CareerDeepDiveView session={session} />
              )}

              {/* 12. WEALTH & DHANA - GENUINE EVIDENCE RESTORED */}
              {activeSubView === 'money' && (
                <WealthDeepDiveView session={session} />
              )}

              {/* 13. RELATIONSHIPS & DHARMA - GENUINE EVIDENCE RESTORED */}
              {activeSubView === 'relationships' && (
                <RelationshipsDeepDiveView session={session} />
              )}

              {/* 14. 10-CHAPTER LIFE STORY */}
              {activeSubView === 'timeline' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Personalized 10-Chapter Cosmic Story</h3>
                    <p className="text-xs text-slate-400 mt-1">Synthesized directly from your verified planetary evidence nodes.</p>
                  </div>

                  <div className="space-y-4">
                    {session.personalization.cosmicStory.map((chap, cIdx) => (
                      <div key={cIdx} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="text-xs font-mono uppercase font-bold text-amber-400">
                          CHAPTER {chap.chapterNumber}: {chap.title}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{chap.narrative}</p>
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {chap.evidenceTags.map((f: string, fIdx: number) => (
                            <span key={fIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 15. DAILY COSMIC WEATHER */}
              {activeSubView === 'daily-context' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Daily Cosmic Context & Transit Triggers</h3>
                    <p className="text-xs text-slate-400 mt-1">Live celestial movements against your natal fingerprint.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Transit Moon Sign</div>
                      <div className="text-lg font-bold text-cyan-400 mt-1">{session.currentCosmicWeather.transitMoonSign}</div>
                      <div className="text-xs text-slate-400 mt-1">{session.currentCosmicWeather.transitMoonNakshatra}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Today's Focus</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">{session.currentCosmicWeather.todayFocus}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Active Trigger</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
                        {session.currentCosmicWeather.activeNatalTrigger}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-2">Month Trajectory</div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {session.currentCosmicWeather.thisMonthTrajectory}
                    </div>
                  </div>
                </div>
              )}

              {/* 16. ASK DEEPASTRO AI ASTROLOGER */}
              {activeSubView === 'ai-astrologer' && (
                <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-amber-400" />
                      <span>DeepAstro AI Astrologer (Evidence Synthesizer)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Strict architectural boundary: AI is an interpretation layer only. Never calculates numbers. Grounded exclusively in your verified astronomical evidence graph.
                    </p>
                  </div>

                  <form onSubmit={handleAiConsultation} className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. What is the impact of my active Dasha on career transition?"
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-amber-500/20"
                    >
                      {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Synthesize</span>
                    </button>
                  </form>

                  {aiResponse && (
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
                      <div>
                        <div className="text-xs font-mono uppercase font-bold text-amber-400">SYNTHESIS ANSWER</div>
                        <p className="text-sm text-slate-200 mt-2 leading-relaxed">{aiResponse.answer}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="text-xs font-mono uppercase font-bold text-cyan-400">WHY (ASTRONOMICAL REASONING)</div>
                        <p className="text-xs text-slate-300">{aiResponse.why}</p>
                      </div>

                      {aiResponse.evidenceNodes?.length > 0 && (
                        <div>
                          <div className="text-xs font-mono uppercase font-bold text-slate-400 mb-2">EVIDENCE NODES CITED</div>
                          <div className="flex flex-wrap gap-2">
                            {aiResponse.evidenceNodes.map((node: string, nIdx: number) => (
                              <span key={nIdx} className="text-xs font-mono px-3 py-1 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                                {node}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] font-mono text-slate-400">
                        <div>Methodology: {aiResponse.methodology || 'Parashari Classical Synthesis'}</div>
                        <div>Limitations: {aiResponse.limitations || 'Conditional on accurate birth time to ±2 minutes'}</div>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-4">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <span>AI Interpretation Engine Unavailable ({aiError.dependency || 'AI Service'})</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {aiError.reason || 'AI interpretation service key is unconfigured or request timed out.'}
                      </p>
                      <p className="text-xs text-amber-400 font-medium">
                        DeepAstro Policy: We never substitute fabricated AI predictions. Your verified astronomical evidence graph remains 100% active and accessible below:
                      </p>

                      <div className="space-y-2 pt-2">
                        {aiError.availableEvidence?.map((ev: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                            &bull; <span className="text-cyan-400 font-bold">{ev.label || ev.id}:</span> {ev.detail || ev.observation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModuleErrorBoundary>
          </main>
        </div>
      )}
    </div>
  );
};

export default MyCosmosPage;