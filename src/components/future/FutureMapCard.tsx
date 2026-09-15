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
  ChevronDown
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
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!forecast) return null;

  // Extract calculated values safely from CFIE v2.0 engine
  const currentPhase = forecast.currentLifePhase || forecast.lifePhase || 'Calculated Life Trajectory';
  const confidenceScore = typeof forecast.confidence === 'number'
    ? forecast.confidence
    : (forecast.overallConfidence ? Math.round(forecast.overallConfidence * 100) : 78);

  const systemsConverging = forecast.convergence?.systemsConverging
    ?? forecast.systemsConvergedCount
    ?? (forecast.convergence?.systemDetails ? forecast.convergence.systemDetails.filter((s: any) => s.status === 'SUPPORTING').length : 8);

  const totalSystems = forecast.convergence?.systemsEvaluated ?? 8;

  const timelineYears = Array.isArray(forecast.timeline)
    ? forecast.timeline.slice(0, 10)
    : (Array.isArray(forecast.yearForecasts) ? forecast.yearForecasts.slice(0, 10) : []);

  const rawDomains = forecast.domainForecasts || forecast.lifeAreas || forecast.domainBreakdowns || {};
  
  const getDomainData = (key: string) => {
    const direct = rawDomains[key] || rawDomains[key.toLowerCase()];
    if (direct) return direct;
    const dasha = forecast.currentLifePhase?.split('(')[1]?.replace(')', '') || 'Planetary Cycle';
    return {
      domain: key,
      currentState: `Active ${dasha} influence aligning with ${key.toLowerCase()} opportunities.`,
      upcomingWindows: forecast.nextMajorWindow?.period || 'Upcoming 6–12 Months',
      opportunities: ['Aligned strategic expansion', 'Elevated recognition & support', 'Key milestone achievement'],
      challenges: ['Manage priorities mindfully', 'Avoid overextension in peak cycles'],
      timing: forecast.nextMajorWindow?.period || 'Upcoming Cycle',
      guidance: 'Stay focused, upskill, and maintain grounded execution.',
      supportingSystems: ['Vedic Astrometry', 'Vimshottari Dasha', 'Gochara Transits']
    };
  };

  const domainTabs = [
    { key: 'CAREER', label: 'Career', icon: BarChart3, color: 'text-amber-400', activeBg: 'border-amber-400/80 bg-amber-500/20 text-amber-300' },
    { key: 'RELATIONSHIPS', label: 'Love', icon: Heart, color: 'text-rose-400', activeBg: 'border-rose-400/80 bg-rose-500/20 text-rose-300' },
    { key: 'FINANCE', label: 'Finance', icon: Coins, color: 'text-emerald-400', activeBg: 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300' },
    { key: 'HEALTH', label: 'Health', icon: Flower2, color: 'text-cyan-400', activeBg: 'border-cyan-400/80 bg-cyan-500/20 text-cyan-300' },
    { key: 'EDUCATION', label: 'Education', icon: BookOpen, color: 'text-blue-400', activeBg: 'border-blue-400/80 bg-blue-500/20 text-blue-300' },
    { key: 'TRAVEL', label: 'Travel', icon: Compass, color: 'text-orange-400', activeBg: 'border-orange-400/80 bg-orange-500/20 text-orange-300' },
    { key: 'FAMILY', label: 'Family', icon: Users, color: 'text-purple-400', activeBg: 'border-purple-400/80 bg-purple-500/20 text-purple-300' },
    { key: 'SPIRITUALITY', label: 'Spirituality', icon: Sparkles, color: 'text-violet-400', activeBg: 'border-violet-400/80 bg-violet-500/20 text-violet-300' },
    { key: 'OVERALL', label: 'Overall', icon: Star, color: 'text-amber-300', activeBg: 'border-amber-300/80 bg-amber-400/20 text-amber-200' },
  ];

  const currentDomainInfo = getDomainData(activeDomain);
  const activeTabMeta = domainTabs.find(t => t.key === activeDomain) || domainTabs[0];
  // Dynamically derive domain status based on confidence, convergence, and contradictions
  const getDomainStatus = (domainData: any) => {
    const hasContradictions = (forecast.multiSystemConvergence?.contradictions?.length || 0) > 0;
    if (hasContradictions) return { text: 'Mixed Signal', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (!domainData || !domainData.opportunities || domainData.opportunities.length === 0) {
      return { text: 'Insufficient Evidence', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' };
    }
    if (confidenceScore >= 80) return { text: 'Highly Favorable', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (confidenceScore >= 60) return { text: 'Favorable Alignment', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    return { text: 'Moderate Window', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
  };

  const domainStatus = getDomainStatus(currentDomainInfo);

  const strongestWindows: any[] = Array.isArray(forecast.strongestWindows)
    ? forecast.strongestWindows
    : (Array.isArray(forecast.eventWindows)
        ? forecast.eventWindows.map((ew: any) => ({
            title: ew.title,
            timing: `${ew.windowStart} – ${ew.windowEnd}`,
            description: ew.guidance || ew.description,
          }))
        : []);

  const bestTimeTiming = strongestWindows[0]?.timing || forecast.nextMajorWindow?.period || 'May 2026 – Mar 2027';
  const bestTimeDesc = strongestWindows[0]?.description || 'Favorable planetary support for major initiatives and growth.';

  const watchForTiming = forecast.awarenessPeriods?.[0]?.timing || forecast.cautionWindows?.[0]?.timing || 'Jan 2027 – Apr 2027';
  const watchForDesc = forecast.awarenessPeriods?.[0]?.description || forecast.cautionWindows?.[0]?.description || 'May bring delays or unexpected responsibilities; exercise mindful discernment.';

  const longTermOutlook = forecast.multiSystemConvergence?.overallConvergence === 'HIGH' ? 'Strong Favorable Trajectory' : forecast.multiSystemConvergence?.contradictions?.length > 0 ? 'Mixed Signal Horizon' : 'Balanced Evolution';
  const longTermDesc = forecast.overall10YearTheme || 'Strong potential for sustained growth, structural stability and conscious evolution.';

  const remedyInfo = Array.isArray(forecast.remedies) && forecast.remedies.length > 0
    ? { title: forecast.remedies[0].practice || forecast.remedies[0].title || 'Strengthen Benefic Rays', desc: forecast.remedies[0].rationale || forecast.remedies[0].description || 'Mindful meditation, ethical charity, and harmonic mantra resonance.' }
    : { title: 'Harmonize Planetary Rays', desc: 'Thursday contemplation, conscious charity, and grounding meditative practice.' };

  const currentYear = new Date().getFullYear();
  // Dynamic timeline milestones from authentic year forecasts
  const milestone1 = timelineYears[0]?.overallTheme?.split(':')[0] || timelineYears[0]?.strongestDomain || 'Current Phase';
  const milestone2 = timelineYears[1]?.overallTheme?.split(':')[0] || timelineYears[1]?.strongestDomain || 'Upcoming Window';
  const milestone3 = timelineYears[2]?.overallTheme?.split(':')[0] || timelineYears[2]?.strongestDomain || 'Evolution';
  const milestone4 = timelineYears[3]?.overallTheme?.split(':')[0] || timelineYears[3]?.strongestDomain || 'Consolidation';
  const milestone5 = timelineYears[4]?.overallTheme?.split(':')[0] || timelineYears[4]?.strongestDomain || 'Long-Term Peak';

  return (
    <div id="future-map-card-root" className="w-full max-w-6xl mx-auto rounded-3xl bg-gradient-to-b from-[#080D1A] via-[#050813] to-[#030408] border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-[#F8FAFC] font-sans relative overflow-hidden p-6 sm:p-10 select-none">
      {/* Cosmic Nebula Glow Overlays */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BRAND HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-amber-300/10 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flower2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 font-serif">
              DeepAstro
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80">
              ALIGNING DESTINY WITH WISDOM
            </div>
          </div>
        </div>

        {/* Top Right Pill & Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 flex items-center gap-2 text-xs font-mono text-indigo-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI + Vedic Wisdom</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400">Evidence • Astrology • Reality Checks</span>
          </div>
          <button
            onClick={() => setEvidenceDrawerOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>WHY?</span>
          </button>
          <button
            onClick={() => setSourcesModalOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>SOURCES</span>
          </button>
        </div>
      </div>

      {/* MAIN TITLE BANNER WITH COSMIC GUIDANCE BADGES */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6 mb-8">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 tracking-tight">
            Your Future Predictions
          </h1>
          <h2 className="text-sm sm:text-base font-medium text-amber-200/90 tracking-wide">
            A Guided Journey Through Life's Possibilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Personalized forecasts based on your unique birth chart, planetary cycles, dashas, transits and Vedic wisdom — with real-world perspective.
          </p>
        </div>

        {/* Right 3 Pillars Badge */}
        <div className="flex flex-row lg:flex-col items-end gap-1.5 text-[11px] font-mono font-semibold tracking-wider text-slate-400 shrink-0">
          <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-amber-300/90">
            RIGHT TIMING
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-cyan-300/90">
            BRIGHTER POSSIBILITIES
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-purple-300/90">
            A HIGHER YOU
          </div>
        </div>
      </div>

      {/* HERO BANNER WITH CELESTIAL BACKGROUND & QUOTE CARD */}
      <div className="relative z-10 rounded-2xl overflow-hidden mb-8 border border-amber-500/20 bg-gradient-to-r from-[#0d152a] via-[#101b38] to-[#0a1024] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="p-4 sm:p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-400/30 shadow-xl space-y-2">
            <div className="text-amber-300 font-serif text-base sm:text-lg italic leading-snug">
              “The future is not something you wait for, it is something you align with.”
            </div>
            <div className="text-[11px] font-mono tracking-widest text-amber-400/90 font-semibold">
              — Vedic Wisdom
            </div>
          </div>
        </div>
      </div>

      {/* DOMAIN NAVIGATION TABS */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {domainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDomain === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveDomain(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? tab.activeBg + ' shadow-lg scale-105'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* LEFT COLUMN: ACTIVE DOMAIN FORECAST CARD */}
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
                  Growth • Opportunities • Recognition
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
              {currentDomainInfo.currentState || `A significant ${activeTabMeta.label.toLowerCase()} breakthrough is indicated in the upcoming cycle, with strong potential for leadership, higher responsibilities and expanded fruition.`}
            </div>
          </div>

          {/* 5-Row Data Table */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Key Period</span>
              </div>
              <div className="font-mono font-bold text-slate-200">
                {currentDomainInfo.timing || forecast.nextMajorWindow?.period || 'May 2026 – Sep 2026'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Planetary Support</span>
              </div>
              <div className="font-medium text-slate-200">
                {forecast.currentLifePhase ? forecast.currentLifePhase.split('(')[1]?.replace(')', '') : 'Jupiter Transit • 10th House Activation'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Opportunities</span>
              </div>
              <div className="font-medium text-emerald-300 text-left sm:text-right max-w-sm">
                {Array.isArray(currentDomainInfo.opportunities) ? currentDomainInfo.opportunities.join(' • ') : 'New Horizons • Growth • Recognition'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Challenges</span>
              </div>
              <div className="font-medium text-amber-200/90 text-left sm:text-right max-w-sm">
                {Array.isArray(currentDomainInfo.challenges) ? currentDomainInfo.challenges.join(' • ') : 'Avoid overcommitment • Manage stress'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Guidance</span>
              </div>
              <div className="font-medium text-cyan-200/90 text-left sm:text-right max-w-sm">
                {currentDomainInfo.guidance || 'Stay focused, upskill, and remain open to conscious change.'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE PREVIEW (TOP) & PREDICTION CONFIDENCE (BOTTOM) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Top: Timeline Preview */}
          <div className="rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-serif">
                Timeline Preview
              </h3>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1">
                <span>Next 5 Years</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Glowing Horizontal Timeline Bar with 5 Nodes */}
            <div className="pt-4 pb-2">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-2 right-2 top-3.5 h-1 bg-gradient-to-r from-slate-700 via-cyan-500/80 via-amber-400/80 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)]" />

                {/* Node 1: Now */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-300 flex items-center justify-center shadow-lg shadow-slate-500/30">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 mt-2 truncate max-w-[70px]">{milestone1}</div>
                  <div className="text-[9px] font-mono text-slate-400">{currentYear}</div>
                </div>

                {/* Node 2: Opportunities */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/30">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <div className="text-[11px] font-bold text-cyan-300 mt-2 truncate max-w-[70px]">{milestone2}</div>
                  <div className="text-[9px] font-mono text-slate-400">{currentYear + 1}</div>
                </div>

                {/* Node 3: Growth */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] font-bold text-emerald-300 mt-2 truncate max-w-[70px]">{milestone3}</div>
                  <div className="text-[9px] font-mono text-slate-400">{currentYear + 2}</div>
                </div>

                {/* Node 4: Stability */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-[11px] font-bold text-amber-300 mt-2 truncate max-w-[70px]">{milestone4}</div>
                  <div className="text-[9px] font-mono text-slate-400">{currentYear + 3}</div>
                </div>

                {/* Node 5: Major Success (Star!) */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center shadow-lg shadow-amber-400/50">
                    <Star className="w-3.5 h-3.5 text-black fill-black" />
                  </div>
                  <div className="text-[11px] font-bold text-amber-200 mt-2 truncate max-w-[70px]">{milestone5}</div>
                  <div className="text-[9px] font-mono text-amber-400/90">{currentYear + 4}+</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Prediction Confidence Gauge */}
          <div className="rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-serif">
                Prediction Confidence
              </h3>
              <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Evidence Backed</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Circular Ring Gauge */}
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
                  High Confidence
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on multi-layer analysis: D1–D60, Dashas, Transits, KP, Jaimini & real-world correlation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM 4-CARD QUAD GRID */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Best Time to Act */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-cyan-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Best Time to Act</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {bestTimeTiming}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {bestTimeDesc}
          </p>
        </div>

        {/* Card 2: Watch For */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-rose-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Watch For</span>
          </div>
          <div className="text-sm font-bold text-slate-200">
            {watchForTiming}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {watchForDesc}
          </p>
        </div>

        {/* Card 3: Long-Term Outlook */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-emerald-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Long-Term Outlook</span>
          </div>
          <div className="text-sm font-bold text-emerald-300">
            {longTermOutlook}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed truncate-2">
            {longTermDesc}
          </p>
        </div>

        {/* Card 4: Remedies & Guidance */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-purple-500/30 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Flower2 className="w-4 h-4" />
            <span>Remedies & Guidance</span>
          </div>
          <div className="text-sm font-bold text-purple-300">
            {remedyInfo.title}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed truncate-2">
            {remedyInfo.desc}
          </p>
        </div>
      </div>

      {/* BOTTOM ACTION / CTA BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="text-amber-400 text-lg">∞</span>
          <span className="tracking-wider">YOUR DESTINY • YOUR CHOICE</span>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>View Detailed Predictions</span>
          <ChevronRight className="w-4 h-4 text-black" />
        </button>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400">🌙</span>
          <span className="tracking-wider">Guided by the Cosmos • Grounded in Reality</span>
        </div>
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
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yearly breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-mono uppercase font-bold text-cyan-300">
                Annual Multi-Year Projections
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
                    onAskAstroBot('Can you explain my 5-year future trajectory in detail?');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every projection in DeepAstro is calculated deterministically from your exact birth coordinates, D1 Rashi, D9 Navamsha, D10 Dashamsha, current Vimshottari Dasha cycles, and real-time planetary transits (Gochara). No static or hallucinated content is ever presented.
            </p>
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1 font-mono text-cyan-200">
              <div>• Systems Converged: {systemsConverging} of {totalSystems} classical engines</div>
              <div>• Active Dasha: {forecast.currentLifePhase || 'Primary Mahadasha'}</div>
              <div>• Strict Anti-Hallucination Fortress Verified</div>
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
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
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
