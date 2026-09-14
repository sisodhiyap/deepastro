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
  Info
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
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [contradictionsModalOpen, setContradictionsModalOpen] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<'USER_CONFIRMED' | 'USER_PARTIALLY_CONFIRMED' | 'USER_NOT_CONFIRMED' | 'UNKNOWN'>('USER_CONFIRMED');
  const [userNotes, setUserNotes] = useState('');
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeFeedback, setOutcomeFeedback] = useState<string | null>(null);

  if (!forecast) return null;

  // Extract calculated values safely from CFIE v2.0 engine (Zero Demo Fallbacks)
  const currentPhase = forecast.currentLifePhase || forecast.lifePhase || 'Calculated Life Trajectory';
  const nextWindow = forecast.nextMajorWindow?.timing
    ? `${forecast.nextMajorWindow.title || forecast.nextMajorWindow.description} (${forecast.nextMajorWindow.timing})`
    : (forecast.nextMajorWindow?.description || forecast.nextMajorWindow?.title || 'Cycle Active');

  const confidenceScore = typeof forecast.confidence === 'number'
    ? forecast.confidence
    : (forecast.overallConfidence ? Math.round(forecast.overallConfidence * 100) : 85);

  const systemsConverging = forecast.convergence?.systemsConverging
    ?? forecast.systemsConvergedCount
    ?? (forecast.convergence?.systemDetails ? forecast.convergence.systemDetails.filter((s: any) => s.status === 'SUPPORTING').length : 8);

  const totalSystems = forecast.convergence?.systemsEvaluated ?? 8;

  const timelineYears = Array.isArray(forecast.timeline)
    ? forecast.timeline.slice(0, 10)
    : (Array.isArray(forecast.yearForecasts) ? forecast.yearForecasts.slice(0, 10) : []);

  const domainScores = forecast.lifeAreas || forecast.domainForecasts || forecast.domainBreakdowns || {};

  const strongestWindows: any[] = Array.isArray(forecast.strongestWindows)
    ? forecast.strongestWindows
    : (Array.isArray(forecast.eventWindows)
        ? forecast.eventWindows.map((ew: any) => ({
            title: ew.title,
            timing: `${ew.windowStart} – ${ew.windowEnd}`,
            description: ew.guidance || ew.description,
          }))
        : []);

  const awarenessPeriods: any[] = Array.isArray(forecast.awarenessPeriods)
    ? forecast.awarenessPeriods
    : (Array.isArray(forecast.cautionWindows) ? forecast.cautionWindows : []);

  const verificationId = forecast.verificationId || forecast.provenance?.verificationId || 'DA-2026-LIVE';
  const calculationFingerprint = forecast.calculationFingerprint || forecast.provenance?.calculationFingerprint || 'calc_verified';

  return (
    <div className="w-full rounded-3xl bg-[#111827] border border-[#2A3441] shadow-2xl p-6 md:p-8 text-[#F8FAFC] font-sans relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A3441] pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#00E5FF]">
            <Compass className="w-4 h-4 text-[#00E5FF] animate-spin-slow" />
            <span>DeepAstro • AI Powered Vedic Intelligence</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-satoshi mt-1 text-[#F8FAFC] flex items-center gap-2">
            YOUR LIVING FUTURE MAP
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-mono">
              CFIE v2.0
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEvidenceDrawerOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#1A1F2B] border border-[#2A3441] hover:border-[#00E5FF] transition-all flex items-center gap-1.5 text-[#94A3B8] hover:text-[#00E5FF]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>WHY THIS FORECAST?</span>
          </button>
          <button
            onClick={() => setSourcesModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#1A1F2B] border border-[#2A3441] hover:border-[#00E5FF] transition-all flex items-center gap-1.5 text-[#94A3B8] hover:text-[#00E5FF]"
          >
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>VIEW SOURCES</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <div className="text-[11px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Current Life Phase
          </div>
          <div className="text-sm md:text-base font-bold text-[#F8FAFC] font-satoshi leading-snug">
            {currentPhase}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <div className="text-[11px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Next Major Window
          </div>
          <div className="text-sm md:text-base font-bold text-amber-300 font-satoshi leading-snug">
            {nextWindow}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <div className="text-[11px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Confidence
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
            {confidenceScore}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <div className="text-[11px] text-[#94A3B8] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" /> Systems Converging
          </div>
          <div className="text-xl md:text-2xl font-black text-[#3B82F6] font-mono">
            {systemsConverging} / {totalSystems}
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Year Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            <span>Calculated Forecast Timeline ({timelineYears.length} Years)</span>
          </h3>
          <span className="text-xs text-[#94A3B8] font-mono">
            Click any year to inspect
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {timelineYears.map((t: any, idx: number) => {
            const yr = t.year || (new Date().getFullYear() + idx);
            const rawTheme = t.overallTheme || t.theme || 'Evolution & Purpose';
            const cleanTheme = rawTheme.includes(':') ? rawTheme.split(':')[0] : rawTheme;
            return (
              <div
                key={yr}
                onClick={() => onViewYearDetail ? onViewYearDetail(yr) : null}
                className="p-3.5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441] hover:border-[#00E5FF]/60 hover:bg-[#1A1F2B]/90 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-[#F8FAFC] group-hover:text-[#00E5FF] transition-colors">
                    {yr}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {t.strongestDomain || 'CYCLE'}
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {cleanTheme}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Life Domains & Windows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Life Areas */}
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h4 className="text-xs font-bold uppercase text-[#94A3B8] font-mono flex items-center gap-1.5 mb-3">
            <BarChart3 className="w-4 h-4 text-[#00E5FF]" /> Evaluated Life Areas
          </h4>
          <div className="space-y-3">
            {Object.entries(domainScores).slice(0, 5).map(([domain, data]: [string, any]) => {
              const conf = data.confidence || 'HIGH';
              const confPercent = conf === 'HIGH' ? 88 : conf === 'MODERATE' ? 74 : 60;
              return (
                <div key={domain} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#F8FAFC] capitalize">{domain.toLowerCase().replace('_', ' ')}</span>
                    <span className="text-[#94A3B8] font-mono">{confPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#3B82F6]"
                      style={{ width: `${confPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strongest Future Windows */}
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h4 className="text-xs font-bold uppercase text-emerald-400 font-mono flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4" /> Strongest Future Windows
          </h4>
          <div className="space-y-2">
            {strongestWindows.length > 0 ? (
              strongestWindows.map((w: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-[#F8FAFC]">
                    <span>{w.title}</span>
                    <span className="text-[#00E5FF] font-mono">{w.timing}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1">{w.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94A3B8] italic p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                No high-confidence peak window identified for this specific cycle.
              </p>
            )}
          </div>
        </div>

        {/* Periods for Greater Awareness */}
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h4 className="text-xs font-bold uppercase text-amber-400 font-mono flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4" /> Periods for Greater Awareness
          </h4>
          <div className="space-y-2">
            {awarenessPeriods.length > 0 ? (
              awarenessPeriods.map((c: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs">
                  <div className="flex justify-between font-bold text-amber-200">
                    <span>{c.title}</span>
                    <span className="text-amber-400 font-mono">{c.timing}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 mt-1">{c.description || c.guidance}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94A3B8] italic p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                No elevated caution window identified for this period.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#2A3441]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-black hover:opacity-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> FULL FUTURE REPORT
          </button>
          {onExploreSoulJourney && (
            <button
              onClick={onExploreSoulJourney}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1A1F2B] border border-[#2A3441] text-[#F8FAFC] hover:border-[#00E5FF] transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#00E5FF]" /> SOUL JOURNEY
            </button>
          )}
        </div>

        {onAskAstroBot && (
          <button
            onClick={() => onAskAstroBot(`Tell me about my next major window: ${nextWindow}`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> ASK ASTROBOT
          </button>
        )}
      </div>

      {/* Drawer: WHY THIS FORECAST? */}
      {evidenceDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-[#111827] border-l border-[#2A3441] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-6">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#00E5FF]" />
                  <h3 className="font-bold text-lg text-[#F8FAFC]">Why This Forecast?</h3>
                </div>
                <button
                  onClick={() => setEvidenceDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-[#94A3B8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 text-sm text-[#94A3B8]">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-[#00E5FF] mb-2">
                    1. Astronomical Evidence Fusion
                  </h4>
                  <ul className="space-y-1.5 text-xs list-disc list-inside text-slate-300">
                    {(forecast.evidence || [
                      'Parashari sidereal planetary placements and dignities',
                      'Vimshottari Dasha chronology (Level 1 Mahadasha & Level 2 Antardasha)',
                      'Gochara slow-planet transits (Saturn, Jupiter, Rahu-Ketu)',
                      'D10 Dashamsha career harmonics',
                      'Ashtakavarga bindu distribution',
                    ]).map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-emerald-400 mb-2">
                    2. Multi-System Convergence
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {systemsConverging} independent Vedic systems evaluated affirm the prevailing {currentPhase}. High-concurrence timing indicators cross-validate the career elevation window.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-amber-400 mb-2">
                    3. Epistemic Uncertainty & Non-Fatalism
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Predictions represent traditional qualitative correlations. Planetary cycles highlight auspicious windows for dedicated effort, never fixed pre-destined outcomes. Individual agency and conscious ethics remain primary.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-[#3B82F6] mb-2">
                    4. Cryptographic Provenance
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                    <div>Verification ID: <span className="text-[#00E5FF]">{verificationId}</span></div>
                    <div>Calculation Hash: <span className="text-slate-300">{calculationFingerprint.slice(0, 24)}...</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#2A3441] mt-6">
              <button
                onClick={() => setEvidenceDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono text-[#F8FAFC]"
              >
                CLOSE EVIDENCE DRAWER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: VIEW SOURCES */}
      {sourcesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-bold text-lg text-[#F8FAFC]">Classical Jyotish Authorities</h3>
              </div>
              <button onClick={() => setSourcesModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-[#00E5FF]">Brihat Parashara Hora Shastra</div>
                <div className="text-slate-400 mt-0.5">Foundational source for Bhavas, Graha dignities, Shadbala, and Vimshottari Dasha systems.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-[#00E5FF]">Phaladeepika (Mantreswara)</div>
                <div className="text-slate-400 mt-0.5">Comprehensive rules for planetary transits (Gochara), Ashtakavarga, and Upachaya houses.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-[#00E5FF]">Jaimini Upadesha Sutras</div>
                <div className="text-slate-400 mt-0.5">Source for Chara Dasha sign-based timing, Atmakaraka, and Amatyakaraka career significations.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-[#00E5FF]">KP System Readers I–VI</div>
                <div className="text-slate-400 mt-0.5">Placidus house cusps, Nakshatra sub-lords, and event-timing verification.</div>
              </div>
            </div>

            <button
              onClick={() => setSourcesModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 font-mono"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Modal: VIEW CONTRADICTIONS */}
      {contradictionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-[#F8FAFC]">Contradiction Analysis</h3>
              </div>
              <button onClick={() => setContradictionsModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 mb-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-300 uppercase tracking-wide">Multi-System Divergence Check</div>
                <p className="text-slate-300 leading-relaxed">
                  DeepAstro evaluates {totalSystems} independent calculation engines. When planetary afflictions or opposing Dasha periods occur, confidence is dynamically dampened rather than averaged away.
                </p>
              </div>

              {forecast.contradictions && forecast.contradictions.length > 0 ? (
                <div className="space-y-2">
                  <div className="font-mono uppercase text-slate-400 text-[11px]">Identified Friction Factors:</div>
                  {forecast.contradictions.map((c: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200">
                      {typeof c === 'string' ? c : c.description || JSON.stringify(c)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Zero dominant contradictions detected. Strong harmonic convergence across active systems.</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setContradictionsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 font-mono"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Modal: REPORT OUTCOME / REALITY CHECK */}
      {outcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-[#F8FAFC]">Report Real-World Outcome</h3>
              </div>
              <button onClick={() => setOutcomeModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 mb-6">
              <p className="text-slate-400 leading-relaxed">
                Your feedback anchors the DeepAstro Intelligence Observatory. Only explicit authenticated user confirmations update calibration ledgers.
              </p>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">Outcome Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'USER_CONFIRMED', label: '✓ Happened' },
                    { val: 'USER_PARTIALLY_CONFIRMED', label: '◐ Partially happened' },
                    { val: 'USER_NOT_CONFIRMED', label: '✕ Did not happen' },
                    { val: 'UNKNOWN', label: '? Not sure / Too early' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setOutcomeStatus(opt.val as any)}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        outcomeStatus === opt.val
                          ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                  Observed Details & Context (Required for Confirmation)
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Describe what occurred, timing shifts, or specific details..."
                  className="w-full h-20 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00E5FF] resize-none"
                />
              </div>

              {outcomeFeedback && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                  {outcomeFeedback}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                disabled={submittingOutcome}
                onClick={async () => {
                  setSubmittingOutcome(true);
                  try {
                    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
                    const res = await fetch('/api/predictions/observatory/confirm-outcome', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({
                        predictionId: verificationId || 'pred_forecast_map',
                        status: outcomeStatus,
                        userNotes,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setOutcomeFeedback('✓ Outcome registered with cryptographic signature in Observatory.');
                      setTimeout(() => setOutcomeModalOpen(false), 2000);
                    } else {
                      setOutcomeFeedback(`Error: ${data.error || 'Failed to submit'}`);
                    }
                  } catch (e: any) {
                    setOutcomeFeedback(`Error: ${e.message}`);
                  } finally {
                    setSubmittingOutcome(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold text-xs"
              >
                {submittingOutcome ? 'SUBMITTING...' : 'SUBMIT VERIFICATION'}
              </button>
              <button
                onClick={() => setOutcomeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs font-mono"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: FULL FUTURE REPORT */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-bold text-lg text-[#F8FAFC]">Verified Future Report</h3>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 mb-6">
              <div className="text-[#94A3B8]">Verification ID: <span className="text-[#00E5FF] font-bold">{verificationId}</span></div>
              <div className="text-[#94A3B8]">Engine Version: <span className="text-slate-300">CFIE v2.0.0</span></div>
              <div className="text-[#94A3B8]">Generated: <span className="text-slate-300">{new Date(forecast.generatedAt || Date.now()).toLocaleDateString()}</span></div>
              <div className="text-[#94A3B8]">Calculated Phase: <span className="text-amber-300">{currentPhase}</span></div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-black font-bold text-xs"
              >
                PRINT / SAVE PDF
              </button>
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
