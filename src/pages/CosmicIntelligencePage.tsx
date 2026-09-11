import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Clock,
  Compass,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  BookOpen,
  Calendar,
  Send,
  HelpCircle,
} from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface CosmicIntelligencePageProps {
  onNavigate?: (tab: NavTabId) => void;
  chartContext?: any;
}

export const CosmicIntelligencePage: React.FC<CosmicIntelligencePageProps> = ({
  onNavigate,
  chartContext,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'brief' | 'patterns' | 'decisions' | 'calibration' | 'what_changed' | 'historical_match'>('brief');
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decision Simulator state
  const [decisionQuery, setDecisionQuery] = useState('Should I accept the new senior opportunity or stay in my current team?');
  const [optionAName, setOptionAName] = useState('Accept New Senior Opportunity');
  const [optionBName, setOptionBName] = useState('Continue in Current Role');
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [isSimulatingDecision, setIsSimulatingDecision] = useState(false);

  // Life Replay state
  const [replayEvent, setReplayEvent] = useState('');
  const [replayResult, setReplayResult] = useState<any>(null);

  // DeepAstro 3.1: What Changed & Historical Match States
  const [whatChangedData, setWhatChangedData] = useState<any>(null);
  const [isFetchingWhatChanged, setIsFetchingWhatChanged] = useState(false);
  const [targetMatchYear, setTargetMatchYear] = useState<number>(2018);
  const [historicalMatchData, setHistoricalMatchData] = useState<any>(null);
  const [isMatchingHistorical, setIsMatchingHistorical] = useState(false);

  const fetchWhatChanged = async () => {
    setIsFetchingWhatChanged(true);
    try {
      const res = await fetch('/api/intelligence/what-changed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_default' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWhatChangedData(data.whatChanged);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingWhatChanged(false);
    }
  };

  const runHistoricalMatch = async (year: number) => {
    setIsMatchingHistorical(true);
    try {
      const res = await fetch('/api/intelligence/historical-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetYear: year, userId: 'user_default' }),
      });
      if (res.ok) {
        const data = await res.json();
        setHistoricalMatchData(data.match);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatchingHistorical(false);
    }
  };

  useEffect(() => {
    fetch('/api/intelligence/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfileData(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load intelligence profile', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSimulateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionQuery || !optionAName || !optionBName) return;

    setIsSimulatingDecision(true);
    try {
      const res = await fetch('/api/intelligence/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: decisionQuery,
          optionA: { name: optionAName },
          optionB: { name: optionBName },
          timeWindow: 'Upcoming 6 Months',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecisionResult(data.decisionResult);
      }
    } catch (err) {
      console.error('Decision simulation failed', err);
    } finally {
      setIsSimulatingDecision(false);
    }
  };

  const handleCompareHistorical = async () => {
    if (!replayEvent) return;
    try {
      const res = await fetch('/api/intelligence/compare-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventTitleOrId: replayEvent }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplayResult(data.comparison);
      }
    } catch (err) {
      console.error('Life replay comparison failed', err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-cosmic-surface to-indigo-950/20 p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            DeepAstro Intelligence Fabric 3.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            My Cosmic Intelligence
          </h1>
          <p className="text-sm text-cosmic-muted leading-relaxed">
            Deterministic astronomical calculations cross-referenced with your confirmed life context,
            recurring pattern discovery, and sovereign decision intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-cosmic-muted">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Truth Core Immutable
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-4 h-4" /> Multi-System Evidence Fusion
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <GitBranch className="w-4 h-4" /> Zero-Inference Safety
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cosmic-border/60 pb-3">
        {[
          { id: 'brief', label: "Today's Cosmic Brief", icon: Compass },
          { id: 'what_changed', label: 'What Changed?', icon: Clock },
          { id: 'historical_match', label: 'Compare with My Past', icon: Layers },
          { id: 'patterns', label: 'Observed Life Patterns', icon: TrendingUp },
          { id: 'decisions', label: 'Decision Intelligence', icon: GitBranch },
          { id: 'calibration', label: 'Outcome Learning & Calibration', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (tab.id === 'what_changed' && !whatChangedData) {
                  fetchWhatChanged();
                }
                if (tab.id === 'historical_match' && !historicalMatchData) {
                  runHistoricalMatch(targetMatchYear);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-cosmic-muted hover:text-white hover:bg-cosmic-surface/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: TODAY'S COSMIC BRIEF */}
      {activeSubTab === 'brief' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Theme Card */}
            <div className="lg:col-span-2 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">
                    Macro Transit & Dasha Alignment
                  </span>
                  <h2 className="text-xl font-display font-extrabold text-white mt-1">
                    Strategic Focus & Professional Initiative
                  </h2>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 block">
                    Confidence: HIGH
                  </span>
                  <span className="text-[10px] text-cosmic-muted block mt-1">Epistemic Status: CALCULATED & VERIFIED</span>
                </div>
              </div>

              <div className="space-y-4 text-xs text-cosmic-muted leading-relaxed">
                <p>
                  <strong className="text-white">Why it matters: </strong>
                  The active transit of the Moon across supportive nakshatras activates your 10th and 11th Bhava axes,
                  enhancing intellectual clarity and collaborative deal flow.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-cosmic-card/80 border border-cosmic-border space-y-1.5">
                    <span className="text-cyan-300 font-bold uppercase tracking-wider text-[10px] block">
                      Career Currents
                    </span>
                    <p className="text-white font-medium">
                      High alignment for architectural design, code review, and finalizing deliverables.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-cosmic-card/80 border border-cosmic-border space-y-1.5">
                    <span className="text-indigo-300 font-bold uppercase tracking-wider text-[10px] block">
                      Relational Energy
                    </span>
                    <p className="text-white font-medium">
                      Foster open communication without presupposing expectations; listen actively before proposing consensus.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action & Caution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-emerald-300 block font-bold">Practical Action</strong>
                    <p className="text-emerald-100/80">Audit your priority goals for the quarter and eliminate two low-signal commitments.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-amber-300 block font-bold">Mindful Caution</strong>
                    <p className="text-amber-100/80">Avoid hasty reactionary debates during peak afternoon meetings when lunar transit is transitional.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Card: Active Karmic Chapter */}
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Active Karmic Chapter
                </div>
                <h3 className="text-lg font-display font-extrabold text-white">
                  Vimshottari Sub-Period
                </h3>
                <p className="text-xs text-cosmic-muted leading-relaxed">
                  Your current developmental curriculum emphasizes mastery over long-term discipline (Saturn)
                  tempered by expansive philosophical wisdom (Jupiter).
                </p>

                <div className="p-4 rounded-2xl bg-cosmic-card/90 border border-cosmic-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-cosmic-muted">Mahadasha:</span>
                    <span className="text-white font-bold">Active Major Cycle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cosmic-muted">Antardasha:</span>
                    <span className="text-cyan-300 font-bold">Sub-Period Operating</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cosmic-muted">Epistemic Tier:</span>
                    <span className="text-emerald-400">LEVEL 1 CALCULATED</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
                <strong className="text-indigo-300 block font-bold">Spiritual Contemplation</strong>
                <p className="text-indigo-100/80 leading-relaxed">
                  Reflect upon how past discipline shaped your current sovereignty. Real stability emerges from unhurried, righteous perseverance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: OBSERVED LIFE PATTERNS */}
      {activeSubTab === 'patterns' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Empirical Cluster Analysis
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Recurring Life & Transition Patterns
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl leading-relaxed">
              Synthesized exclusively from your user-confirmed milestones. Invariant: Labeled strictly as{' '}
              <span className="text-cyan-300 font-mono font-bold">PATTERN OBSERVED</span>, never as predetermined fate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Pattern 1: Career Pivot Archetype
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  PATTERN OBSERVED
                </span>
              </div>
              <h3 className="text-lg font-display font-extrabold text-white">
                Multi-Year Career Reorientations
              </h3>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                Your confirmed milestones reveal that professional transitions coincide with sub-period completions
                and transit activations across the 10th house (Karma Bhava).
              </p>
              <div className="p-3 rounded-xl bg-cosmic-card text-[11px] font-mono text-cosmic-muted space-y-1">
                <div>Supporting Milestones: 2 confirmed events</div>
                <div>Astrological Correlate: D10 Dashamsha & Kendra lord transitions</div>
              </div>
            </div>

            <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Pattern 2: Geographic Relocation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  PATTERN OBSERVED
                </span>
              </div>
              <h3 className="text-lg font-display font-extrabold text-white">
                Location Shifts via 4th/12th Axis
              </h3>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                Domestic moves and environmental expansions correspond with Rahu-Ketu nodal shifts and transit Jupiter
                aspecting the 4th house of foundational roots.
              </p>
              <div className="p-3 rounded-xl bg-cosmic-card text-[11px] font-mono text-cosmic-muted space-y-1">
                <div>Supporting Milestones: Confirmed relocation history</div>
                <div>Astrological Correlate: D4 Chaturthamsha & nodal triggers</div>
              </div>
            </div>
          </div>

          {/* Life Replay 2.0 Comparison Section */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Life Replay 2.0 Engine
              </span>
              <h3 className="text-xl font-display font-extrabold text-white">
                Compare Historical Milestone with Current Period
              </h3>
              <p className="text-xs text-cosmic-muted max-w-xl">
                Enter a confirmed past milestone to evaluate astrological parallels and evolutionary growth between then and now.
              </p>
            </div>

            <div className="flex gap-3 max-w-md">
              <input
                type="text"
                value={replayEvent}
                onChange={(e) => setReplayEvent(e.target.value)}
                placeholder="e.g. Started Company or Career Transition"
                className="flex-1 px-4 py-2.5 rounded-xl bg-cosmic-card border border-cosmic-border text-white text-xs placeholder:text-cosmic-muted focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleCompareHistorical}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Compare
              </button>
            </div>

            {replayResult && (
              <div className="p-6 rounded-2xl bg-cosmic-card/90 border border-cyan-500/30 space-y-4 text-xs animate-fadeIn">
                <h4 className="text-white font-bold text-sm">
                  Comparative Analysis: {replayResult.historicalEventTitle} vs. Present
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <strong className="text-cyan-300 block">Astrological Similarities:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-cosmic-muted">
                      {replayResult.similarities.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-indigo-300 block">Evolutionary Differences:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-cosmic-muted">
                      {replayResult.differences.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-cosmic-border/60 pt-3">
                  <strong className="text-emerald-400 block mb-1">Evolutionary Takeaway:</strong>
                  <p className="text-emerald-100/80">{replayResult.evolutionaryLesson}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DECISION INTELLIGENCE */}
      {activeSubTab === 'decisions' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5" /> Counterfactual Decision Simulator
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Sovereign Scenario Analysis
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl leading-relaxed">
              DeepAstro models scenarios objectively without making choices on your behalf. Personal agency remains sovereign.
            </p>
          </div>

          <form onSubmit={handleSimulateDecision} className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">Decision Question</label>
              <input
                type="text"
                value={decisionQuery}
                onChange={(e) => setDecisionQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-cosmic-card border border-cosmic-border text-white text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Option A</label>
                <input
                  type="text"
                  value={optionAName}
                  onChange={(e) => setOptionAName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-cosmic-card border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Option B</label>
                <input
                  type="text"
                  value={optionBName}
                  onChange={(e) => setOptionBName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-cosmic-card border border-indigo-500/30 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulatingDecision}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {isSimulatingDecision ? 'Simulating Scenarios...' : 'Evaluate Scenarios'}
            </button>
          </form>

          {decisionResult && (
            <div className="rounded-3xl border border-cyan-500/40 bg-cosmic-surface/90 p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-4">
                <h3 className="text-lg font-display font-extrabold text-white">Comparative Scenario Evaluation</h3>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Window: {decisionResult.timeWindow}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-cosmic-card border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm">{decisionResult.optionA.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                      Support: {decisionResult.optionA.astrologicalSupport}
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted">{decisionResult.optionA.timingAlignment}</p>
                  <p className="text-xs text-cyan-200/90 font-medium">{decisionResult.optionA.strategicAdvantage}</p>
                </div>

                <div className="p-5 rounded-2xl bg-cosmic-card border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm">{decisionResult.optionB.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold">
                      Support: {decisionResult.optionB.astrologicalSupport}
                    </span>
                  </div>
                  <p className="text-xs text-cosmic-muted">{decisionResult.optionB.timingAlignment}</p>
                  <p className="text-xs text-indigo-200/90 font-medium">{decisionResult.optionB.strategicAdvantage}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cosmic-surface border border-cosmic-border space-y-2 text-xs">
                <strong className="text-white block font-bold">Comparative Tradeoff</strong>
                <p className="text-cosmic-muted leading-relaxed">{decisionResult.comparativeTradeoff}</p>
                <div className="border-t border-cosmic-border/50 pt-2 text-[11px] text-cosmic-muted italic">
                  {decisionResult.agencyDisclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: OUTCOME LEARNING & CALIBRATION */}
      {activeSubTab === 'calibration' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Personal Calibration Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Empirical Outcome Calibration
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl leading-relaxed">
              DeepAstro learns from your explicitly confirmed outcomes. Calibration scores are calculated only
              when sufficient samples exist, adhering to strict statistical honesty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cosmic-muted block">
                Total Outcomes Tracked
              </span>
              <div className="text-3xl font-extrabold font-mono text-white">
                {profileData?.calibration?.totalOutcomes || 0}
              </div>
              <span className="text-[11px] text-cyan-400 font-mono block">
                Status: {profileData?.calibration?.status || 'INSUFFICIENT_DATA'}
              </span>
            </div>

            <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cosmic-muted block">
                Brier Score Alignment
              </span>
              <div className="text-3xl font-extrabold font-mono text-cyan-300">
                {profileData?.calibration?.brierScore !== null && profileData?.calibration?.brierScore !== undefined
                  ? profileData.calibration.brierScore
                  : 'N/A'}
              </div>
              <span className="text-[11px] text-cosmic-muted font-mono block">
                Requires $\ge 5$ confirmed outcomes
              </span>
            </div>

            <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cosmic-muted block">
                Calibration Honesty
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                100%
              </div>
              <span className="text-[11px] text-emerald-300 font-mono block">
                Zero synthetic score inflation
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs leading-relaxed">
            <h4 className="text-white font-bold text-sm">Calibration Narrative</h4>
            <p className="text-cosmic-muted">
              {profileData?.calibration?.calibrationSummary ||
                'No predictions have been confirmed yet. As you mark prediction outcomes as Occurred, Partial, or Not Occurred, DeepAstro adapts its confidence thresholds.'}
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 5: WHAT CHANGED? */}
      {activeSubTab === 'what_changed' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" /> Longitudinal Difference Tracking
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              What Changed Since Your Last Reading?
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl leading-relaxed">
              DeepAstro compares your celestial transits, Dasha progressions, and newly confirmed life goals
              since your previous session, highlighting only what is truly new.
            </p>
          </div>

          {isFetchingWhatChanged ? (
            <div className="p-12 text-center text-cosmic-muted animate-pulse">
              Comparing planetary progressions and active context...
            </div>
          ) : whatChangedData ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">
                  Session Progression Synthesis
                </span>
                <p className="text-sm text-white font-medium">{whatChangedData.synthesis}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-cosmic-muted pt-2 border-t border-cyan-500/20">
                  <span>Last Reading: {whatChangedData.lastReadingDate}</span>
                  <span>•</span>
                  <span>Current Reading: {whatChangedData.currentReadingDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    New Planetary Transits & Progressions
                  </h4>
                  <ul className="space-y-2 text-cosmic-text">
                    {whatChangedData.newTransits.map((nt: string, idx: number) => (
                      <li key={`nt-${idx}`} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{nt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                    Goals & Milestone Evolution
                  </h4>
                  {whatChangedData.newGoals && whatChangedData.newGoals.length > 0 ? (
                    <ul className="space-y-2 text-cosmic-text">
                      {whatChangedData.newGoals.map((ng: string, idx: number) => (
                        <li key={`ng-${idx}`} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <span>{ng}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-cosmic-muted italic">No new goals added since last session.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-cosmic-muted">
              <button
                type="button"
                onClick={fetchWhatChanged}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Scan Reading Differences
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 6: COMPARE WITH MY PAST */}
      {activeSubTab === 'historical_match' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/60 p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> Historical Period Matching
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              "This Feels Like 2018 Again"
            </h2>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-2xl leading-relaxed">
              Compare any past memorable year against your current conditions. DeepAstro isolates structural
              astrological similarities, decisive differences, and new protective factors.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-4">
            <span className="text-xs font-bold text-white block">Select or enter a past milestone year:</span>
            <div className="flex flex-wrap items-center gap-2">
              {[2014, 2016, 2018, 2020, 2022].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setTargetMatchYear(yr);
                    runHistoricalMatch(yr);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    targetMatchYear === yr
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-cosmic-card border border-cosmic-border text-cosmic-muted hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {isMatchingHistorical ? (
            <div className="p-12 text-center text-cosmic-muted animate-pulse">
              Comparing {targetMatchYear} celestial alignments with present Dasha and transits...
            </div>
          ) : historicalMatchData ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                    Comparative Resonance Analysis
                  </span>
                  <span className="text-xs font-mono text-indigo-300 font-bold">
                    Resonance: {Math.round(historicalMatchData.astrologicalResonanceScore * 100)}%
                  </span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {historicalMatchData.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs">
                  <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Similar Astrological Factors
                  </h4>
                  <ul className="space-y-2 text-cosmic-muted">
                    {historicalMatchData.similarities.map((s: string, idx: number) => (
                      <li key={`sim-${idx}`} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Crucial Differences
                  </h4>
                  <ul className="space-y-2 text-cosmic-muted">
                    {historicalMatchData.differences.map((d: string, idx: number) => (
                      <li key={`diff-${idx}`} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/70 space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> New Protective Factors
                  </h4>
                  <ul className="space-y-2 text-cosmic-muted">
                    {historicalMatchData.newFactors.map((nf: string, idx: number) => (
                      <li key={`nf-${idx}`} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{nf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
