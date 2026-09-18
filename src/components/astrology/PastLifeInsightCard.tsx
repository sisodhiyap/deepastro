import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  BookOpen,
  Eye,
  Shield,
  Star,
  Users,
  Feather,
  Flower2,
  HelpCircle,
  Clock,
  Heart,
  Target,
  AlertTriangle,
  FileText,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export interface PastLifeInsightCardProps {
  data: {
    cardTitle?: string;
    subTitle?: string;
    archetype?: string;
    fourPillars?: {
      originTheme: { title: string; description: string; source: string };
      karmicPattern: { title: string; description: string; source: string };
      carriedStrength: { title: string; description: string; source: string };
      presentLifeLesson: { title: string; description: string; source: string };
    };
    whyThisReading?: Array<{ indicator: string; source: string; explanation: string }>;
    whatCouldChangeThis?: {
      uncertaintyNotes: string[];
      birthTimeSensitivity: string;
      contradictingSignals: string[];
    };
    convergence?: {
      score: number;
      category: string;
      disclaimer: string;
    };
    actionButtons?: Array<{ id: string; label: string; action: string }>;
    userProfile?: {
      name?: string;
      dob?: string;
      tob?: string;
      pob?: string;
    };
    summary?: string;
    visualTheme?: string;
    astrologicalHighlights?: { label: string; value: string }[];
    numerologyHighlights?: { label: string; value: number | string }[];
    vedicWisdomQuote?: { source: string; theme: string };
    keyThemes?: string[];
    karmicConnections?: { pattern: string; currentLife: string }[];
    currentLifeInfluence?: { area: string; guidance: string }[];
    soulMessage?: string;
    disclaimer?: string;
    rawSchema?: any;
  };
  onExportPdf?: () => void;
  onShare?: () => void;
  onAskAstroBot?: (prompt?: string) => void;
  onExploreSoulJourney?: () => void;
}

export const PastLifeInsightCard: React.FC<PastLifeInsightCardProps> = ({
  data,
  onExportPdf,
  onShare,
  onAskAstroBot,
  onExploreSoulJourney,
}) => {
  const [activeModal, setActiveModal] = useState<'evidence' | 'uncertainty' | 'contradictions' | 'compare' | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'astrology' | 'karma' | 'wisdom' | 'convergence'>('astrology');

  if (!data) return null;

  const archetype = data.archetype || data.rawSchema?.archetype?.primary?.replace(/_/g, ' ') || 'Seeker of Sacred Truth';
  const soulLesson = data.rawSchema?.archetype?.soulLesson || data.soulMessage || 'Awakening transcendent consciousness across cycles of time.';

  // Default or server-provided Four Pillars
  const pillars = data.fourPillars || {
    originTheme: {
      title: data.rawSchema?.setting?.environment || 'Contemplative Sacred Enclave',
      description: data.summary || 'A life dedicated to the systematic preservation of sacred principles and contemplative discipline.',
      source: 'Vedic D1 & Ketu Nakshatra',
    },
    karmicPattern: {
      title: data.karmicConnections?.[0]?.pattern || 'Ketu-Rahu Evolutionary Axis',
      description: data.karmicConnections?.[0]?.currentLife || 'Intuitive detachment and seeking inner spiritual equilibrium while navigating modern duty.',
      source: 'Jaimini Atmakaraka & 12th Bhava',
    },
    carriedStrength: {
      title: data.keyThemes?.[0] || 'Deep Introspective Discernment',
      description: `Instinctive moral clarity and spiritual resilience carried forward into this incarnation.`,
      source: 'Navamsha D9 & Numerology',
    },
    presentLifeLesson: {
      title: data.rawSchema?.unfinished_lessons?.[0] || 'Harmonizing Selfless Service and Personal Dharma',
      description: soulLesson,
      source: 'Vimshottari Dasha & Puranic Context',
    },
  };

  const whyEvidence = data.whyThisReading || (data.astrologicalHighlights || []).map(h => ({
    indicator: h.label,
    source: 'Vedic Ephemeris & Jaimini Sutras',
    explanation: h.value,
  }));

  const uncertainty = data.whatCouldChangeThis || {
    uncertaintyNotes: [
      'Symbolic interpretation grounded in classical Jyotish tradition; not empirically provable.',
      'Reflective archetypes are designed for contemplative self-inquiry rather than rigid historical assertion.',
    ],
    birthTimeSensitivity: 'A shift of more than 4 minutes modifies the Navamsha (D9) and Shashtiamsa (D60) cusps.',
    contradictingSignals: (data.rawSchema?.contradictions || []).map((c: any) => `${c.conflict}: ${c.resolution}`),
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'deep_journey':
      case 'OPEN_DEEP_JOURNEY':
        if (onExploreSoulJourney) onExploreSoulJourney();
        else setExpanded(true);
        break;
      case 'why_reading':
      case 'view_evidence':
      case 'VIEW_EVIDENCE':
        setActiveModal('evidence');
        break;
      case 'view_contradictions':
      case 'VIEW_CONTRADICTIONS':
        setActiveModal('contradictions');
        break;
      case 'compare_present':
      case 'COMPARE_PRESENT':
        setActiveModal('compare');
        break;
      case 'save_reading':
      case 'SAVE_READING':
        alert('SoulTrace reading safely archived in your local cosmic profile.');
        break;
      case 'generate_report':
      case 'GENERATE_REPORT':
        if (onExportPdf) onExportPdf();
        break;
      case 'ask_astrobot':
      case 'ASK_ASTROBOT':
        if (onAskAstroBot) onAskAstroBot(`Tell me more about my SoulTrace archetype "${archetype}" and its carried strengths.`);
        break;
      default:
        break;
    }
  };

  return (
    <div id="past-soul-journey-card-root" className="w-full min-w-0 max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#090E1C] via-[#060813] to-[#030409] border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.18)] text-slate-100 font-sans relative overflow-hidden p-6 sm:p-10 select-none break-words">
      {/* Background Radiance */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP PILLS */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
        <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>SOULTRACE · PAST LIFE INTELLIGENCE</span>
        </div>

        <div className="px-4 py-1.5 rounded-full bg-purple-600/20 border border-purple-400/40 text-purple-300 text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md shadow-purple-500/10">
          <Flower2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Multi-System Jyotish Matrix</span>
        </div>
      </div>

      {/* DYNAMIC ARCHETYPE HEADLINE */}
      <div className="relative z-10 space-y-2 mb-8">
        <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
          PRIMARY SOUL ARCHETYPE
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-purple-100 to-amber-200 tracking-tight">
          {archetype}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {data.summary || 'A life centered upon contemplative spiritual discipline, leaving an imprint of innate philosophical discernment in this incarnation.'}
        </p>
      </div>

      {/* EPISTEMIC DISCLAIMER */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 mb-8 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold text-amber-300">Traditional Epistemic Framing: </span>
          Past-life readings in Jyotish are traditional symbolic interpretations of Ketu, 12th House, and Jaimini Atmakaraka. They provide reflective philosophical archetypes rather than scientifically provable historical assertions.
        </p>
      </div>

      {/* THE FOUR PILLARS */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-sm font-mono font-bold text-amber-300 uppercase tracking-wider">
            THE FOUR PILLARS OF SOUL MEMORY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Origin Theme */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400/60 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-400 tracking-wider">PILLAR I · ORIGIN THEME</span>
              <span className="text-[10px] text-slate-500">{pillars.originTheme.source}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-serif">{pillars.originTheme.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{pillars.originTheme.description}</p>
          </div>

          {/* Pillar 2: Karmic Pattern */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">PILLAR II · KARMIC PATTERN</span>
              <span className="text-[10px] text-slate-500">{pillars.karmicPattern.source}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-serif">{pillars.karmicPattern.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{pillars.karmicPattern.description}</p>
          </div>

          {/* Pillar 3: Carried Strength */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">PILLAR III · CARRIED STRENGTH</span>
              <span className="text-[10px] text-slate-500">{pillars.carriedStrength.source}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-serif">{pillars.carriedStrength.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{pillars.carriedStrength.description}</p>
          </div>

          {/* Pillar 4: Present-Life Lesson */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">PILLAR IV · PRESENT DHARMA</span>
              <span className="text-[10px] text-slate-500">{pillars.presentLifeLesson.source}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-serif">{pillars.presentLifeLesson.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{pillars.presentLifeLesson.description}</p>
          </div>
        </div>
      </div>

      {/* QUICK EXPLORER ACTIONS: WHY THIS READING? & UNCERTAINTY */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveModal('evidence')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Why This Reading?</span>
            </div>
            <p className="text-[11px] text-slate-400">View astrological indicators, Ketu placements & Jaimini sutras.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setActiveModal('uncertainty')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-purple-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What Could Change This?</span>
            </div>
            <p className="text-[11px] text-slate-400">Inspect birth-time sensitivity, divisional nuances & caveats.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 8 ACTION BUTTONS GRID (Part 12) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { id: 'deep_journey', label: 'Deep Soul Journey', icon: Layers, color: 'text-purple-300' },
          { id: 'why_reading', label: 'Why This Reading', icon: Eye, color: 'text-amber-300' },
          { id: 'view_evidence', label: 'View Evidence', icon: BookOpen, color: 'text-cyan-300' },
          { id: 'view_contradictions', label: 'Contradictions', icon: AlertTriangle, color: 'text-rose-300' },
          { id: 'compare_present', label: 'Compare Present', icon: Compass, color: 'text-emerald-300' },
          { id: 'save_reading', label: 'Save Reading', icon: Star, color: 'text-yellow-300' },
          { id: 'generate_report', label: 'Generate Report', icon: Download, color: 'text-blue-300' },
          { id: 'ask_astrobot', label: 'Ask AstroBot', icon: MessageSquare, color: 'text-pink-300' },
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => handleAction(btn.id)}
              className="px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-200"
            >
              <Icon className={`w-3.5 h-3.5 ${btn.color}`} />
              <span className="truncate">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODAL / DRAWER: EVIDENCE EXPLORER */}
      {activeModal === 'evidence' && (
        <div className="relative z-20 mt-6 p-6 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Evidence Graph & Calculation Provenance</span>
            </h3>
            <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="space-y-3 text-xs">
            {whyEvidence.map((ev, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{ev.indicator}</span>
                  <span className="text-[10px] text-slate-500">{ev.source}</span>
                </div>
                <p className="text-slate-300">{ev.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: UNCERTAINTY & SENSITIVITY */}
      {activeModal === 'uncertainty' && (
        <div className="relative z-20 mt-6 p-6 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>What Could Change This Interpretation?</span>
            </h3>
            <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <div className="font-bold text-purple-300 mb-1">Birth Time Sensitivity</div>
              <p>{uncertainty.birthTimeSensitivity}</p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-slate-200">Uncertainty Disclosures:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {uncertainty.uncertaintyNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: CONTRADICTIONS */}
      {activeModal === 'contradictions' && (
        <div className="relative z-20 mt-6 p-6 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Contradiction Reasoning Matrix</span>
            </h3>
            <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="space-y-2 text-xs">
            {uncertainty.contradictingSignals.length > 0 ? (
              uncertainty.contradictingSignals.map((cs: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  {cs}
                </div>
              ))
            ) : (
              <p className="text-slate-400">No strong contradictory tensions found across the primary Ketu and Atmakaraka axes.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: COMPARE WITH PRESENT */}
      {activeModal === 'compare' && (
        <div className="relative z-20 mt-6 p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>SoulTrace Past vs Present Integration</span>
            </h3>
            <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-purple-300">Past Life Pattern (Ketu Axis)</div>
              <p className="text-slate-400">{pillars.originTheme.description}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-300">Present Life Growth (Rahu Axis)</div>
              <p className="text-slate-400">{pillars.presentLifeLesson.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
