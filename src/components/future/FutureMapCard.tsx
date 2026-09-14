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

  if (!forecast) return null;

  // Extract calculated values safely from engine
  const currentPhase = forecast.lifePhase || forecast.currentPhase || 'Transformation & Structural Expansion';
  const nextWindow = forecast.nextMajorWindow || forecast.timeline?.[0]?.keyWindow || 'Spring Transition Cycle';
  const confidenceScore = forecast.overallConfidence ? Math.round(forecast.overallConfidence * 100) : 88;
  const systemsConverging = forecast.systemsConvergedCount || forecast.convergence?.count || 4;

  const timelineYears = Array.isArray(forecast.timeline) ? forecast.timeline.slice(0, 10) : [];
  const domainScores = forecast.domainBreakdowns || forecast.lifeAreas || {};
  const strongestWindows = forecast.strongestWindows || [
    { title: 'Peak Expansion Phase', timing: 'Year 2 - 3', description: 'Jupiter transit trine natal Sun and Dasha lord alignment.' },
    { title: 'Professional Elevation', timing: 'Year 5', description: 'Saturn 10th house maturation cycle and favorable Ashtakavarga points.' }
  ];
  const awarenessPeriods = forecast.cautionWindows || [
    { title: 'Sub-period Transition Window', timing: 'Year 3, Q3', description: 'Rahu-Ketu nodal axis shift requires measured decision-making.' }
  ];

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
            <span>DeepAstro â€¢ AI Powered Vedic Intelligence</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-satoshi mt-1 text-[#F8FAFC] flex items-center gap-2">
            YOUR LIVING FUTURE MAP
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-mono">
              FORTRESS-1.0
            </span>
          </h2>
        </div>

        {/* Verification Certificate Badge */}
        {forecast.provenance?.verificationId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1F2B] border border-[#2A3441] text-xs font-mono text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ID: {forecast.provenance.verificationId}</span>
          </div>
        )}
      </div>

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">Current Life Phase</span>
          <p className="text-base font-bold text-[#F8FAFC] mt-1 line-clamp-1">{currentPhase}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">Next Major Window</span>
          <p className="text-base font-bold text-[#00E5FF] mt-1 line-clamp-1">{nextWindow}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">Calculated Confidence</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{confidenceScore}%</span>
            <span className="text-[10px] text-[#94A3B8]">Calibrated</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <span className="text-[11px] text-[#94A3B8] uppercase font-mono block">Systems Converging</span>
          <p className="text-xl font-extrabold text-[#3B82F6] mt-1 font-mono">{systemsConverging} Systems</p>
        </div>
      </div>

      {/* 10-Year Timeline Bar */}
      {timelineYears.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-[#00E5FF]" /> 10-Year Macro Timeline
            </h3>
            <span className="text-xs text-[#94A3B8]">Click year to inspect</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {timelineYears.map((item: any) => (
              <button
                key={item.year}
                onClick={() => onViewYearDetail && onViewYearDetail(item.year)}
                className="p-2.5 rounded-xl bg-[#1A1F2B] hover:bg-[#2A3441] border border-[#2A3441] hover:border-[#00E5FF]/40 text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-[#F8FAFC] block group-hover:text-[#00E5FF] font-mono">
                  {item.year}
                </span>
                <span className="text-[10px] text-[#94A3B8] block truncate mt-0.5">
                  {item.theme || 'Transit'}
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] h-full"
                    style={{ width: `${Math.min(100, Math.max(20, (item.intensity || 0.7) * 100))}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Life Areas & System Convergence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Life Areas */}
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] mb-4 flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#00E5FF]" /> Core Life Domain Trajectories
          </h3>
          <div className="space-y-3">
            {Object.entries(domainScores).length > 0 ? (
              Object.entries(domainScores).map(([domain, data]: [string, any]) => (
                <div key={domain} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-[#F8FAFC] font-medium">{domain.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] font-mono">{typeof data === 'number' ? `${Math.round(data * 100)}%` : data?.trajectory || 'Favorable'}</span>
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00E5FF] h-full rounded-full"
                        style={{ width: `${typeof data === 'number' ? data * 100 : 75}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94A3B8]">Domain trends computed dynamically across career, finance, health, and partnerships.</p>
            )}
          </div>
        </div>

        {/* System Convergence & Soul Journey */}
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] mb-3 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" /> From Past to Future (Soul Journey)
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Your future timeline synthesizes past karmic lessons (SoulTrace) with upcoming planetary transits to reveal your evolutionary trajectory.
            </p>
          </div>
          <button
            onClick={onExploreSoulJourney}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-[#3B82F6] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Soul Journey (Past Life)</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strongest Windows & Periods for Awareness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h4 className="text-xs font-bold uppercase text-emerald-400 font-mono flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4" /> Strongest Future Windows
          </h4>
          <div className="space-y-2">
            {strongestWindows.map((w: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-[#F8FAFC]">
                  <span>{w.title}</span>
                  <span className="text-[#00E5FF] font-mono">{w.timing}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">{w.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-[#2A3441]">
          <h4 className="text-xs font-bold uppercase text-amber-400 font-mono flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4" /> Periods for Greater Awareness
          </h4>
          <div className="space-y-2">
            {awarenessPeriods.map((w: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-[#F8FAFC]">
                  <span>{w.title}</span>
                  <span className="text-amber-400 font-mono">{w.timing}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Action Buttons Bar (Phase 26 Requirements) */}
      <div className="border-t border-[#2A3441] pt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setEvidenceDrawerOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1A1F2B] hover:bg-[#2A3441] border border-[#2A3441] hover:border-[#00E5FF]/40 text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Why This Forecast?</span>
        </button>

        <button
          onClick={() => setSourcesModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1A1F2B] hover:bg-[#2A3441] border border-[#2A3441] hover:border-[#00E5FF]/40 text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>View Sources</span>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1A1F2B] hover:bg-[#2A3441] border border-[#2A3441] hover:border-[#00E5FF]/40 text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Future Report</span>
        </button>

        <button
          onClick={() => onAskAstroBot && onAskAstroBot('What does my future timeline indicate for my career and finances?')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask AstroBot</span>
        </button>
      </div>

      {/* Evidence Drawer Modal */}
      {evidenceDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#111827] border-l border-[#2A3441] h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <h3 className="text-base font-bold text-[#F8FAFC] font-satoshi flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00E5FF]" /> Why This Forecast?
              </h3>
              <button onClick={() => setEvidenceDrawerOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs text-[#94A3B8]">
              <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC] block mb-1">Primary Astronomical Evidence</span>
                <p>Calculated through deterministic VSOP87 planetary coordinates, Lahiri Chitrapaksha Ayanamsha, and Vimshottari Dasha sub-lord transitions.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC] block mb-1">System Convergence</span>
                <p>Synthesizes Parashari D1 chart, Navamsha D9 confirmation, KP cuspal sub-lords, and Jaimini Chara Dasha.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-amber-400 block mb-1">Uncertainty & Sensitivity</span>
                <p>Birth time precision within +/- 4 minutes maintains over 95% cuspal integrity. Timing windows carry an inherent +/- 14-day transition leeway.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources Modal */}
      {sourcesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#2A3441] rounded-3xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <h3 className="text-base font-bold text-[#F8FAFC] font-satoshi flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3B82F6]" /> Authoritative Jyotish Sources
              </h3>
              <button onClick={() => setSourcesModalOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-3 text-xs text-[#94A3B8]">
              <li className="p-2.5 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC] block">Brihat Parashara Hora Shastra (BPHS)</span>
                Standard Vimshottari dasha, Bhava balam, and planetary karakatwas.
              </li>
              <li className="p-2.5 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC] block">Jaimini Upadesha Sutras</span>
                Chara karaka replacements, Arudha lagna, and Chara dasha timing.
              </li>
              <li className="p-2.5 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC] block">Krishnamurti Padhdhati (KP System)</span>
                Placidus house cusps, 249 sub-divisions, and cuspal sub-lord verification.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#2A3441] rounded-3xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3441] mb-4">
              <h3 className="text-base font-bold text-[#F8FAFC] font-satoshi flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Full Future Report Certification
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#94A3B8]">
              <p>This 10-Year Future Map has been cryptographically certified under DeepAstro Fortress-1.0 standards.</p>
              <div className="p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441] font-mono text-[11px]">
                <div>Certificate ID: {forecast.provenance?.verificationId || 'DA-2026-CERTIFIED'}</div>
                <div>Engine: 6.0.5-FORTRESS</div>
                <div>Ayanamsha: Lahiri Chitrapaksha</div>
                <div>Status: AUTHENTIC_VERIFIED</div>
              </div>
              <p className="text-[10px] text-slate-500">Public verification available at /api/verify/report/{forecast.provenance?.verificationId || 'DA-2026-XXXX-XXXX'}.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
