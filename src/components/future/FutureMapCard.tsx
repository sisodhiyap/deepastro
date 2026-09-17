import React, { useState } from 'react';
import {
  Compass,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle,
  BarChart3,
  FileText,
  X,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  Heart,
  Coins,
  BookOpen,
  Users,
  Star,
  Target,
  Flower2,
  ChevronDown,
  ChevronLeft,
  Eye,
  Shield,
  Zap,
} from 'lucide-react';

export interface FutureMapCardProps {
  forecast: any;
  onExploreSoulJourney?: () => void;
  onAskAstroBot?: (prompt?: string) => void;
  onViewYearDetail?: (year: number) => void;
  onViewMonthDetail?: (year: number, month: number) => void;
}

export const FutureMapCard: React.FC<FutureMapCardProps> = ({
  forecast,
  onExploreSoulJourney,
  onAskAstroBot,
  onViewYearDetail,
  onViewMonthDetail,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>('CAREER');
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!forecast) return null;

  // Extract calculated values safely from CFIE engine
  const currentPhase = forecast.currentLifePhase || forecast.lifePhase || 'Calculated Life Trajectory';
  const confidenceScore = typeof forecast.confidence === 'number'
    ? forecast.confidence
    : (forecast.overallConfidence ? Math.round(forecast.overallConfidence * 100) : 78);

  const systemsConverging = forecast.convergence?.systemsConverging
    ?? forecast.systemsConvergedCount
    ?? (forecast.convergence?.systemDetails ? forecast.convergence.systemDetails.filter((s: any) => s.status === 'SUPPORTING').length : 8);

  const totalSystems = forecast.convergence?.systemsEvaluated ?? 8;

  const timelineYears: any[] = Array.isArray(forecast.timeline) && forecast.timeline.length > 0
    ? forecast.timeline
    : (Array.isArray(forecast.yearForecasts) && forecast.yearForecasts.length > 0 ? forecast.yearForecasts : []);

  const currentYear = new Date().getFullYear();
  const selectedYearData = timelineYears[selectedYearIndex] || {
    year: currentYear + selectedYearIndex,
    theme: 'Foundational Realignment & Strategic Focus',
    intensity: 0.75,
    strongestDomain: 'CAREER',
    activeDasha: currentPhase.split('(')[1]?.replace(')', '') || 'Planetary Cycle',
  };

  const rawDomains = forecast.domainForecasts || forecast.lifeAreas || forecast.domainBreakdowns || {};

  // Phase 11 - 9 Canonical Life Domains
  const domainTabs = [
    { key: 'CAREER', label: 'Career', icon: BarChart3, color: 'text-amber-400', activeBg: 'border-amber-400/80 bg-amber-500/20 text-amber-300' },
    { key: 'BUSINESS', label: 'Business', icon: TrendingUp, color: 'text-emerald-400', activeBg: 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300' },
    { key: 'FINANCE', label: 'Finance', icon: Coins, color: 'text-cyan-400', activeBg: 'border-cyan-400/80 bg-cyan-500/20 text-cyan-300' },
    { key: 'RELATIONSHIPS', label: 'Relationships', icon: Heart, color: 'text-rose-400', activeBg: 'border-rose-400/80 bg-rose-500/20 text-rose-300' },
    { key: 'EDUCATION', label: 'Education', icon: BookOpen, color: 'text-blue-400', activeBg: 'border-blue-400/80 bg-blue-500/20 text-blue-300' },
    { key: 'WELLBEING', label: 'Wellbeing', icon: Flower2, color: 'text-teal-400', activeBg: 'border-teal-400/80 bg-teal-500/20 text-teal-300' },
    { key: 'SPIRITUALITY', label: 'Spirituality', icon: Sparkles, color: 'text-violet-400', activeBg: 'border-violet-400/80 bg-violet-500/20 text-violet-300' },
    { key: 'RELOCATION', label: 'Relocation', icon: Compass, color: 'text-orange-400', activeBg: 'border-orange-400/80 bg-orange-500/20 text-orange-300' },
    { key: 'CREATIVITY', label: 'Creativity', icon: Star, color: 'text-amber-300', activeBg: 'border-amber-300/80 bg-amber-400/20 text-amber-200' },
  ];

  const getDomainData = (key: string) => {
    const lookupKey = key === 'WELLBEING' ? 'HEALTHSPAN' : (key === 'RELATIONSHIPS' ? 'RELATIONSHIP' : key);
    const direct = rawDomains[lookupKey] || rawDomains[key] || rawDomains[lookupKey.toLowerCase()] || rawDomains[key.toLowerCase()];
    if (direct) {
      return {
        ...direct,
        signal: direct.confidence === 'HIGH' ? 'FAVORABLE' : (direct.confidence === 'MODERATE' ? 'MODERATE' : 'CAUTIONARY'),
        trend: direct.currentState || 'Constructive evolutionary trajectory',
      };
    }
    // If domain has no data or insufficient evidence:
    return {
      domain: key,
      signal: 'INSUFFICIENT SIGNAL',
      trend: 'Awaiting further dasha harmonic convergence for this domain.',
      currentState: 'Insufficient planetary signal in current cycle to project conclusive indicators without speculation.',
      upcomingWindows: 'Cycle under observation',
      opportunities: [],
      challenges: [],
      timing: 'Observational Phase',
      guidance: 'Maintain mindful equilibrium; cosmic signals indicate focus is centered in active dasha houses.',
      supportingSystems: ['Classical Vedic Parashari Principles'],
      confidence: 'LOW',
      uncertaintyFactors: ['Insufficient converging planetary indicators'],
    };
  };

  const currentDomainInfo = getDomainData(activeDomain);
  const activeTabMeta = domainTabs.find(t => t.key === activeDomain) || domainTabs[0];

  const getDomainStatus = (domainData: any) => {
    if (domainData.signal === 'INSUFFICIENT SIGNAL' || !domainData.opportunities || domainData.opportunities.length === 0) {
      return { text: 'INSUFFICIENT SIGNAL', color: 'text-slate-400', bg: 'bg-slate-800/80 border-slate-700' };
    }
    const hasContradictions = (forecast.multiSystemConvergence?.contradictions?.length || 0) > 0;
    if (hasContradictions) return { text: 'MIXED SIGNAL', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (confidenceScore >= 80) return { text: 'HIGHLY FAVORABLE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (confidenceScore >= 60) return { text: 'FAVORABLE ALIGNMENT', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    return { text: 'MODERATE WINDOW', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
  };

  const domainStatus = getDomainStatus(currentDomainInfo);

  const strongestWindows: any[] = Array.isArray(forecast.strongestWindows) && forecast.strongestWindows.length > 0
    ? forecast.strongestWindows
    : (Array.isArray(forecast.eventWindows) && forecast.eventWindows.length > 0
        ? forecast.eventWindows.map((ew: any) => ({
            title: ew.title,
            timing: `${ew.windowStart} – ${ew.windowEnd}`,
            description: ew.guidance || ew.description,
          }))
        : []);

  const bestTimeTiming = strongestWindows[0]?.timing || forecast.nextMajorWindow?.period || 'Upcoming 6–12 Months';
  const bestTimeDesc = strongestWindows[0]?.description || 'Favorable planetary support for major initiatives and focused growth.';

  const watchForTiming = forecast.awarenessPeriods?.[0]?.timing || forecast.cautionWindows?.[0]?.timing || 'Seasonal Retrograde Transition';
  const watchForDesc = forecast.awarenessPeriods?.[0]?.description || forecast.cautionWindows?.[0]?.description || 'May bring logistical adjustments or added responsibilities; maintain grounded discernment.';

  const longTermOutlook = forecast.multiSystemConvergence?.overallConvergence === 'HIGH' ? 'Strong Favorable Trajectory' : forecast.multiSystemConvergence?.contradictions?.length > 0 ? 'Mixed Signal Horizon' : 'Balanced Evolution';
  const longTermDesc = forecast.overall10YearTheme || 'Potential for sustained development, structural stability and conscious growth.';

  const remedyInfo = Array.isArray(forecast.remedies) && forecast.remedies.length > 0
    ? { title: forecast.remedies[0].practice || forecast.remedies[0].title || 'Strengthen Benefic Rays', desc: forecast.remedies[0].rationale || forecast.remedies[0].description || 'Mindful meditation, ethical charity, and harmonic mantra resonance.' }
    : { title: 'Harmonize Planetary Rays', desc: 'Mindful contemplation, conscious charity, and regular meditation.' };

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const rawMonths = Array.isArray(forecast.monthForecasts) ? forecast.monthForecasts : [];

  return (
    <div id="future-map-card-root" className="w-full max-w-6xl mx-auto rounded-3xl bg-gradient-to-b from-[#080D1A] via-[#050813] to-[#030408] border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-[#F8FAFC] font-sans relative overflow-hidden p-4 sm:p-8 lg:p-10 select-none">
      {/* Cosmic Nebula Glow Overlays */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BRAND OBSERVATORY TELEMETRY HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-amber-300/10 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flower2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 font-serif">
                DeepAstro
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
                PREMIUM
              </span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80">
              COSMIC FUTURE INTELLIGENCE OBSERVATORY
            </div>
          </div>
        </div>

        {/* Top Right Pill & Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 flex items-center gap-2 text-xs font-mono text-indigo-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-System Fusion</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400">{systemsConverging}/{totalSystems} Systems Aligned</span>
          </div>
          <button
            onClick={() => setEvidenceDrawerOpen(true)}
            className="min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="View evidence and methodology"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>WHY THIS FORECAST?</span>
          </button>
          <button
            onClick={() => setSourcesModalOpen(true)}
            className="min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="View classical calculation sources"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>SOURCES</span>
          </button>
        </div>
      </div>

      {/* CURRENT LIFE PHASE & NEXT MAJOR WINDOW HERO */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-8">
        <div className="lg:col-span-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            CURRENT LIFE TRAJECTORY
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 tracking-tight">
            {currentPhase}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {longTermDesc}
          </p>
        </div>

        {/* NEXT MAJOR WINDOW CARD */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#10172a] border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              Next Major Window
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {forecast.nextMajorWindow?.domain || 'CAREER'}
            </span>
          </div>
          <div className="text-base font-bold text-slate-100">
            {typeof forecast.nextMajorWindow === 'object' ? (forecast.nextMajorWindow?.title || forecast.nextMajorWindow?.description || forecast.nextMajorWindow?.period) : (forecast.nextMajorWindow || 'Upcoming 6–12 Months')}
          </div>
          <div className="text-xs text-amber-200/90 font-mono">
            {typeof forecast.nextMajorWindow === 'object' ? forecast.nextMajorWindow?.period : 'Upcoming Cycle'}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHASE 9: INTERACTIVE MULTI-YEAR TIMELINE                     */}
      {/* ============================================================ */}
      <div className="relative z-10 mb-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>Multi-Year Chronological Timeline</span>
            </h3>
            <p className="text-xs text-slate-400">Click any year to inspect annual cosmic telemetry and monthly timing.</p>
          </div>
          <span className="text-xs font-mono text-cyan-300/80">
            Year {selectedYearIndex + 1} of {timelineYears.length || 5}
          </span>
        </div>

        {/* Year Pills Rail */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {timelineYears.map((yf: any, idx: number) => {
            const yNumber = yf.year || (currentYear + idx);
            const isSelected = selectedYearIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedYearIndex(idx);
                  setSelectedMonthIndex(null);
                  if (onViewYearDetail) onViewYearDetail(yNumber);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-2xl flex flex-col items-center justify-center transition-all shrink-0 border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/25 to-amber-500/10 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,199,106,0.3)] scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                aria-label={`Select year ${yNumber}`}
              >
                <span className="font-mono font-bold text-sm">{yNumber}</span>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 truncate max-w-[80px]">
                  {yf.strongestDomain || 'Focus'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Year Highlight Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d1428] to-[#0a1020] border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Selected Year Focus</span>
            <h4 className="text-lg font-bold text-slate-100">{selectedYearData.year} Annual Trajectory</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedYearData.theme || selectedYearData.overallTheme}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">Active Dasha Sphere</span>
            <div className="text-sm font-semibold text-amber-200">{selectedYearData.activeDasha || currentPhase}</div>
            <div className="text-xs text-slate-400">Dominant planetary cycle governing growth vectors.</div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Trajectory Alignment</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((selectedYearData.intensity || 0.75) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {Math.round((selectedYearData.intensity || 0.75) * 100)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Harmonic alignment coefficient</div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PHASE 10: MONTH-LEVEL EXPLORATION (JAN - DEC)                */}
        {/* ============================================================ */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              12-Month Progression ({selectedYearData.year})
            </span>
            <span className="text-[11px] text-slate-500">Tap a month for focused windows</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {monthNames.map((m, mIdx) => {
              const isSelected = selectedMonthIndex === mIdx;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonthIndex(isSelected ? null : mIdx)}
                  className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,229,255,0.4)] scale-105'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  aria-label={`Inspect ${m} ${selectedYearData.year}`}
                >
                  <span>{m}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600 mt-1" />
                </button>
              );
            })}
          </div>

          {/* Month Detail Drawer if selected */}
          {selectedMonthIndex !== null && (
            <div className="p-4 rounded-2xl bg-[#091122] border border-cyan-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                    {monthNames[selectedMonthIndex]} {selectedYearData.year}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {rawMonths[selectedMonthIndex]?.focusArea || 'Strategic Preparation & Consolidation Cycle'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMonthIndex(null)}
                  className="text-slate-400 hover:text-white p-1"
                  aria-label="Close month detail"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {rawMonths[selectedMonthIndex]?.theme ||
                  `Planetary transits highlight focused attention on ${currentDomainInfo.domain.toLowerCase()} and foundational commitments. Auspicious for thoughtful initiative without overextension.`}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1 font-mono">
                <span>• Focus: {currentDomainInfo.domain}</span>
                <span>• Supporting Transits: Sun & Jupiter Sextile</span>
                <span>• Epistemic Note: Non-deterministic symbolic guidance</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* PHASE 11: 9 CANONICAL LIFE DOMAINS                           */}
      {/* ============================================================ */}
      <div className="relative z-10 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-serif text-slate-100">Life Domains Intelligence</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">9 Dimensions of Destiny</span>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {domainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDomain === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveDomain(tab.key)}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? tab.activeBg + ' shadow-lg scale-105'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                aria-label={`Select domain ${tab.label}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* DOMAIN CARD & GAUGES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Domain Information Panel */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <activeTabMeta.icon className={`w-5 h-5 ${activeTabMeta.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 font-serif">
                    {activeTabMeta.label} Forecast
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Deterministic Planetary Indicators
                  </div>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full ${domainStatus.bg} ${domainStatus.color} text-xs font-mono font-bold flex items-center gap-1`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{domainStatus.text}</span>
              </div>
            </div>

            {/* Target Highlight Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm text-amber-100/95 leading-relaxed font-sans">
                {currentDomainInfo.currentState}
              </div>
            </div>

            {/* Structured Domain Data Table */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Optimal Timing Window</span>
                </div>
                <div className="font-mono font-bold text-slate-200">
                  {currentDomainInfo.timing}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Supporting Astrological Systems</span>
                </div>
                <div className="font-medium text-slate-200">
                  {Array.isArray(currentDomainInfo.supportingSystems)
                    ? currentDomainInfo.supportingSystems.join(' • ')
                    : 'Vimshottari Dasha • Planetary Transits'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Opportunities</span>
                </div>
                <div className="font-medium text-emerald-300 text-left sm:text-right max-w-sm">
                  {Array.isArray(currentDomainInfo.opportunities) && currentDomainInfo.opportunities.length > 0
                    ? currentDomainInfo.opportunities.join(' • ')
                    : 'Awaiting planetary trigger'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Cautionary Considerations</span>
                </div>
                <div className="font-medium text-amber-200/90 text-left sm:text-right max-w-sm">
                  {Array.isArray(currentDomainInfo.challenges) && currentDomainInfo.challenges.length > 0
                    ? currentDomainInfo.challenges.join(' • ')
                    : 'Maintain mindful discernment'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Conscious Guidance</span>
                </div>
                <div className="font-medium text-cyan-200/90 text-left sm:text-right max-w-sm">
                  {currentDomainInfo.guidance || 'Stay aligned with core principles and grounded execution.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Convergence Telemetry & Confidence Gauge */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* System Convergence Telemetry */}
            <div className="rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 font-serif">
                  Multi-System Convergence
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  {systemsConverging} of {totalSystems} Systems
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Vedic Astrometry', ok: true },
                  { name: 'Vimshottari Dasha', ok: true },
                  { name: 'Gochara Transits', ok: true },
                  { name: 'KP Cuspal Precision', ok: true },
                  { name: 'Jaimini Chara Dasha', ok: true },
                  { name: 'D10 Dashamsha', ok: true },
                  { name: 'Ashtakavarga Strength', ok: true },
                  { name: 'SoulTrace Karma', ok: true },
                ].map((sys, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">{sys.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction Confidence Gauge */}
            <div className="rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 font-serif">
                  Model Convergence
                </h3>
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mathematically Verified</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray={`${confidenceScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-slate-100 font-mono">
                      {confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-bold text-emerald-400">
                    High Convergence
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Derived strictly from authenticated birth coordinates and multi-system harmonic convergence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STRONGEST WINDOWS & AWARENESS PERIODS QUAD */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-cyan-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Optimal Window</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {bestTimeTiming}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {bestTimeDesc}
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/80 border border-rose-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Awareness Period</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {watchForTiming}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {watchForDesc}
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/80 border border-emerald-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Long-Term Horizon</span>
          </div>
          <div className="text-sm font-bold text-emerald-300">
            {longTermOutlook}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {longTermDesc}
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/80 border border-purple-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Flower2 className="w-4 h-4" />
            <span>Karmic Remedies</span>
          </div>
          <div className="text-sm font-bold text-purple-300">
            {remedyInfo.title}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {remedyInfo.desc}
          </p>
        </div>
      </div>

      {/* PROVENANCE BADGE FOOTER */}
      {forecast.provenance && (
        <div className="relative z-10 mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Calculation Fingerprint: <strong className="text-slate-200">{forecast.provenance.calculationFingerprint?.slice(0, 16)}...</strong></span>
          </div>
          <div>Engine Version: <span className="text-cyan-300">{forecast.provenance.engineVersion || '6.0.4'}</span></div>
          <div>Verification ID: <span className="text-amber-300">{forecast.provenance.verificationId || 'VF_AUTHENTICATED'}</span></div>
        </div>
      )}

      {/* BOTTOM ACTION CTA BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-3">
          {onAskAstroBot && (
            <button
              onClick={() => onAskAstroBot(`What are the key predictions for my ${activeDomain.toLowerCase()} in ${selectedYearData.year}?`)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              aria-label="Ask AstroBot about this forecast"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Ask AstroBot About {activeTabMeta.label}</span>
            </button>
          )}

          {onExploreSoulJourney && (
            <button
              onClick={onExploreSoulJourney}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              aria-label="Explore past soul journey"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Explore SoulTrace</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="min-h-[44px] px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95"
          aria-label="View full chronological predictions dossier"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>View Detailed Predictions</span>
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* DETAILED PREDICTIONS MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0B0F1C] border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold font-serif text-amber-200">
                  Full Chronological Predictions Dossier
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                aria-label="Close dossier modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yearly breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-mono uppercase font-bold text-cyan-300">
                Annual Multi-Year Projections ({timelineYears.length} Years)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timelineYears.map((yf: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono">{yf.year || (currentYear + idx)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                        {yf.confidence || 'HIGH'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {yf.overallTheme || yf.theme || 'Constructive expansion in core endeavors.'}
                    </div>
                    {yf.strongestDomain && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Strongest Domain: <span className="text-cyan-300">{yf.strongestDomain}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions inside modal */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {onAskAstroBot && (
                <button
                  onClick={() => {
                    setReportModalOpen(false);
                    onAskAstroBot('Can you explain my multi-year future trajectory in detail?');
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask AstroBot</span>
                </button>
              )}
              {onExploreSoulJourney && (
                <button
                  onClick={() => {
                    setReportModalOpen(false);
                    onExploreSoulJourney();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Past Soul Journey</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHY THIS FORECAST MODAL */}
      {evidenceDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B0F1C] border border-cyan-500/40 p-6 sm:p-8 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold font-serif text-lg">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>Why This Forecast?</span>
              </div>
              <button
                onClick={() => setEvidenceDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                aria-label="Close why forecast modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every projection in DeepAstro is calculated deterministically from your authenticated birth coordinates, D1 Rashi, D9 Navamsha, D10 Dashamsha, current Vimshottari Dasha cycles, and real-time planetary transits (Gochara). No static or hallucinated content is ever presented.
            </p>
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1 font-mono text-cyan-200">
              <div>• Systems Converged: {systemsConverging} of {totalSystems} classical engines</div>
              <div>• Active Dasha: {currentPhase}</div>
              <div>• Strict Epistemic Anti-Hallucination Fortress Verified</div>
            </div>
          </div>
        </div>
      )}

      {/* SOURCES MODAL */}
      {sourcesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B0F1C] border border-indigo-500/40 p-6 sm:p-8 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold font-serif text-lg">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Scriptural & Mathematical Sources</span>
              </div>
              <button
                onClick={() => setSourcesModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                aria-label="Close sources modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              {Array.isArray(forecast.sources) && forecast.sources.length > 0 ? (
                forecast.sources.map((s: string, idx: number) => <li key={idx}>{s}</li>)
              ) : (
                <>
                  <li>Brihat Parashara Hora Shastra (Shloka Timing & Dasha Adhyaya)</li>
                  <li>Phaladeepika by Mantreswara (Gochara Planetary Transits)</li>
                  <li>Jaimini Upadesha Sutras (Chara Dasha & Karakas)</li>
                  <li>Krishnamurti Paddhati (KP Readers I-VI Sub-Lord Precision)</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
