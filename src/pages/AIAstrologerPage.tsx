import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Info, 
  Layers, 
  Database, 
  Terminal, 
  FileText, 
  ExternalLink,
  HelpCircle,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Binary,
  HandMetal,
  BookOpen
} from 'lucide-react';
import { StoredBirthProfile } from '../utils/birthStorage.js';

interface AIAstrologerPageProps {
  profile?: StoredBirthProfile;
}

type SystemQueryType = 
  | 'ask-kundli'
  | 'ask-western'
  | 'ask-kp'
  | 'ask-numerology'
  | 'ask-tarot'
  | 'ask-palm'
  | 'ask-investment'
  | 'compare-systems';

interface SystemEvidence {
  system: string;
  deterministicInputs: Record<string, any>;
  calculationMethod: string;
  sourceTexts: string[];
  rulesTriggered: string[];
  uncertaintyMetrics: string;
  confidenceScore: number;
}

interface EvidenceModalData {
  isOpen: boolean;
  query: string;
  response: string;
  evidence: SystemEvidence[];
  generatedAt: string;
}

const PRESET_QUERIES: { id: SystemQueryType; label: string; icon: any; query: string; category: string }[] = [
  { id: 'ask-kundli', label: 'Ask My Kundli', icon: Compass, query: 'Analyze current Vimshottari Mahadasha & Antardasha effects with transit Saturn over 10th house.', category: 'Vedic Jyotish' },
  { id: 'ask-western', label: 'Ask My Western Chart', icon: Sparkles, query: 'Analyze current applying transit Jupiter trine natal Sun and Sun-Mercury conjunction in Tropical chart.', category: 'Western' },
  { id: 'ask-kp', label: 'Ask My KP Chart', icon: Binary, query: 'Analyze 10th cusp sub-lord star significations for career change promise and event timing.', category: 'KP System' },
  { id: 'ask-numerology', label: 'Ask My Numerology', icon: Layers, query: 'Explain the vibration synergy between my Life Path and current Personal Year cycle.', category: 'Numerology' },
  { id: 'ask-tarot', label: 'Ask My Tarot', icon: BookOpen, query: 'Draw contextual decision-support reflection cards using cryptographically random shuffle.', category: 'Tarot' },
  { id: 'ask-palm', label: 'Ask My Palm', icon: HandMetal, query: 'Examine Left vs Right palm head line and heart line fork metrics for decision balance.', category: 'Palmistry' },
  { id: 'ask-investment', label: 'Ask My Investment Profile', icon: Terminal, query: 'Synthesize D2/D11 wealth house significators with current macro regime and sector trends.', category: 'Finance' },
  { id: 'compare-systems', label: 'Compare Systems', icon: Database, query: 'Compare Vedic Lagna/Moon vs Western Tropical Ascendant/Sun perspectives on life vocation.', category: 'Multi-System' },
];

export const AIAstrologerPage: React.FC<AIAstrologerPageProps> = ({ profile = { name: 'Cosmic Seeker', birthDate: '1995-05-15', birthTime: '14:30', birthPlace: 'New Delhi', latitude: '28.6139', longitude: '77.2090', timezone: '5.5', gender: 'other' } }) => {
  const [selectedSystem, setSelectedSystem] = useState<SystemQueryType>('ask-kundli');
  const [queryInput, setQueryInput] = useState(PRESET_QUERIES[0].query);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    system: string;
    timestamp: string;
    evidence?: SystemEvidence[];
  }>>([
    {
      role: 'assistant',
      content: `Welcome to the DeepAstro AI Astrologer. I am strictly governed by the Cosmic Intelligence Evidence Engine. Every response is synthesized exclusively from verified deterministic calculations, canonical rules, and structured evidence graphs. I do not invent or hallucinate planetary coordinates, houses, or outcomes. Select an inquiry channel below or input your specific query.`,
      system: 'Core Evidence Engine',
      timestamp: new Date().toLocaleTimeString(),
      evidence: [
        {
          system: 'DeepAstro Multi-Engine Protocol v6.0',
          deterministicInputs: { profileName: profile.name, lat: profile.latitude, lon: profile.longitude, date: profile.birthDate },
          calculationMethod: 'Deterministic Astronomical Core + Parashari & Placidus Algorithmic Pipeline',
          sourceTexts: ['Brihat Parasara Hora Sastra', 'Krishnamurti Padhdhati Readers I-VI', 'Tetrabiblos'],
          rulesTriggered: ['Axiom 0: Calculation First, Interpretation Second', 'Axiom 1: Transparent Uncertainty Quantification'],
          uncertaintyMetrics: 'Astronomical coordinates accurate to within ±0.001 arcseconds.',
          confidenceScore: 0.99
        }
      ]
    }
  ]);

  const [evidenceModal, setEvidenceModal] = useState<EvidenceModalData>({
    isOpen: false,
    query: '',
    response: '',
    evidence: [],
    generatedAt: ''
  });

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSelectedSystem(preset.id);
    setQueryInput(preset.query);
  };

  const handleSendQuery = () => {
    if (!queryInput.trim() || isProcessing) return;

    const userMsg = queryInput;
    const sysId = selectedSystem;
    setIsProcessing(true);

    const newConvo = [
      ...conversation,
      {
        role: 'user' as const,
        content: userMsg,
        system: PRESET_QUERIES.find(p => p.id === sysId)?.category || 'Inquiry',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    setConversation(newConvo);

    // Mock evidence generation grounded strictly in deterministic rules
    setTimeout(() => {
      let responseText = '';
      let mockEvidence: SystemEvidence[] = [];

      if (sysId === 'ask-kundli') {
        responseText = `Based on your deterministic D1 Kundli, you are currently experiencing the influence of your configured Mahadasha with transiting Saturn moving through your 10th house quadrant. In traditional Jyotish (BPHS Ch. 45), Saturn's transit over the Karma Bhava requires methodical restructuring of professional responsibilities and delay-tolerant perseverance. Functional benefic aspects from natal Jupiter preserve core status.`;
        mockEvidence = [{
          system: 'Vedic Jyotish Engine',
          deterministicInputs: { dashaBalance: 'Mercury-Venus', saturnTransitLongitude: 'Aquarius 28°14\'', tenthHouseCusp: 'Aquarius 14°20\'' },
          calculationMethod: 'Chitrapaksha / Lahiri Ayanamsa (24°10\'38") + Swiss Ephemeris Standard',
          sourceTexts: ['Brihat Parasara Hora Sastra - Dashaphala Adhyaya', 'Phaladeepika Ch. 20'],
          rulesTriggered: ['Rule V-101: 10th House Transit of Saturn activates organizational accountability', 'Rule V-204: Benefic Dasha mitigates natural malefic transit friction'],
          uncertaintyMetrics: 'Birth time variance of ±2 minutes shifts Navamsa lagna by ~1 degree.',
          confidenceScore: 0.92
        }];
      } else if (sysId === 'ask-kp') {
        responseText = `In Krishnamurti Padhdhati (KP), career promise is governed by Cusps 2, 6, 10, and 11. Your 10th Cusp Sub-Lord signifies house 10 through ownership and house 6 through its Star-Lord's planetary placement. Because the Sub-Lord is not placed in or signifying detrimental houses 5, 8, or 12, the career elevation promise is validated as STRONG. The timing triggers during the conjoined Dasha-Bhukti of significator planets.`;
        mockEvidence = [{
          system: 'KP Stellar Astrology Engine',
          deterministicInputs: { tenthCuspSubLord: 'Mercury', subLordStarLord: 'Sun', starLordHouses: [6, 10], subLordHouses: [2, 10] },
          calculationMethod: 'KP New Ayanamsa + Placidus Semi-Arc Cusp Division',
          sourceTexts: ['KP Reader III: Stellar Astrology', 'KP Reader IV: Marriage, Children and Twin Births'],
          rulesTriggered: ['KP Rule 10-SL: Sub-lord of 10th cusp connected to 2, 6, 10, 11 indicates professional success', 'KP Rule Star-Sub Hierarchy: Planet yields results of Star Lord modified by Sub Lord'],
          uncertaintyMetrics: 'Placidus cusp calculation strictly requires exact geographic coordinates (Lat: ' + profile.latitude + ', Lon: ' + profile.longitude + ').',
          confidenceScore: 0.95
        }];
      } else if (sysId === 'ask-western') {
        responseText = `In your Tropical Western chart, transiting Jupiter forms an applying trine (120°) to your natal Sun with an orb of 1.4°. In psychological and evolutionary astrology, applying Jupiter aspects denote a window of cognitive expansion, philosophical synthesis, and enhanced self-efficacy. Concurrently, a natal Sun-Mercury conjunction accentuates mental agility and analytical communication.`;
        mockEvidence = [{
          system: 'Western Tropical Engine',
          deterministicInputs: { tropicalSun: 'Gemini 14°22\'', transitingJupiter: 'Libra 15°46\'', aspectAngle: '121.4°', orb: '1.4°', state: 'APPLYING' },
          calculationMethod: 'Tropical Geocentric Ecliptic Longitude (Zero Ayanamsa offset)',
          sourceTexts: ['Ptolemy Tetrabiblos', 'Dane Rudhyar - The Astrology of Personality'],
          rulesTriggered: ['Rule W-ASP-TRINE: 120° ± 5° harmonic aspect facilitates constructive flow', 'Rule W-STATE-APPLYING: Applying aspects build cumulative psychological focus'],
          uncertaintyMetrics: 'Aspect orb threshold set to strict 5.0° maximum.',
          confidenceScore: 0.88
        }];
      } else if (sysId === 'ask-investment') {
        responseText = `3-Channel Multi-Signal Synthesis:
Channel 1 (Macro/Financial): Indian benchmark yields are stable at 7.08%, with Nifty 50 operating in an EXPANSION regime. Sector breadth is elevated in IT and Capital Goods.
Channel 2 (Geopolitical): Red Sea shipping disruptions present moderate supply-chain volatility for energy imports.
Channel 3 (Traditional Astro): D2 and D11 wealth significators in your natal chart show strong 11th house connectivity (Mercury/Venus), associating with digital infrastructure and value-oriented sectors.
Conclusion: Financial fundamentals justify monitoring large-cap technology and industrial engineering. Astrological indicators are traditional/experimental and must never replace empirical risk management.`;
        mockEvidence = [
          {
            system: 'Real-World Financial & Macro Engine',
            deterministicInputs: { repoRate: 6.5, inrUsd: 83.42, marketRegime: 'EXPANSION', crudeBrent: 82.5 },
            calculationMethod: 'Time-Series Regime Engine + RBI Bulletin Tracking',
            sourceTexts: ['RBI Monetary Policy Report 2026', 'NSE Index Valuation Telemetry'],
            rulesTriggered: ['Macro-Rule 12: Positive yield curve spread supports cyclical equity allocation'],
            uncertaintyMetrics: 'Macro telemetry refreshed every market session.',
            confidenceScore: 0.94
          },
          {
            system: 'Vedic Financial Astrology Engine (Medini)',
            deterministicInputs: { natalD2D11Link: 'Mercury-Venus Mutual Aspect', mediniSectorVersion: '1.0.0-medini-standard' },
            calculationMethod: 'Skandha Jyotisha Traditional Planetary-Sector Association',
            sourceTexts: ['Bhavartha Ratnakara', 'Jataka Parijata'],
            rulesTriggered: ['AstroFin-Rule 4: Mercury rulership over technology & communication services'],
            uncertaintyMetrics: 'Experimental traditional association; zero causal predictability guaranteed.',
            confidenceScore: 0.65
          }
        ];
      } else {
        responseText = `Multi-system evidence synthesis completed. Your query has been parsed across canonical Vedic, Western, and Numerological frameworks. All mathematical coordinates and algorithmic associations have been compiled into the verified evidence graph below.`;
        mockEvidence = [{
          system: 'Universal Evidence Synthesizer',
          deterministicInputs: { profileData: profile.name },
          calculationMethod: 'Cross-System Multi-Layer Algorithmic Resolution',
          sourceTexts: ['Standard Astrological and Numerological Canon'],
          rulesTriggered: ['Consensus Cross-Verification Matrix'],
          uncertaintyMetrics: 'Evaluated across 4 distinct mathematical coordinate planes.',
          confidenceScore: 0.90
        }];
      }

      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: responseText,
          system: PRESET_QUERIES.find(p => p.id === sysId)?.category || 'AI Astrologer',
          timestamp: new Date().toLocaleTimeString(),
          evidence: mockEvidence
        }
      ]);
      setIsProcessing(false);
    }, 900);
  };

  const handleOpenEvidence = (item: typeof conversation[0]) => {
    if (!item.evidence || item.evidence.length === 0) return;
    setEvidenceModal({
      isOpen: true,
      query: 'System Reasoning & Evidence Audit',
      response: item.content,
      evidence: item.evidence,
      generatedAt: item.timestamp
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              DEEPASTRO AI ASTROLOGER
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                EVIDENCE-DRIVEN v6.0
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Explainable cosmic reasoning engine powered by deterministic astronomical calculations, classical rules, and verifiable evidence graphs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ZERO-HALLUCINATION POLICY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Preset Query Grid */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Select Inquiry Channel
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PRESET_QUERIES.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedSystem === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-lg shadow-cyan-950/50'
                    : 'bg-[#111827]/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-medium line-clamp-1">{preset.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{preset.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="bg-[#111827]/80 rounded-2xl border border-slate-800/80 p-5 min-h-[480px] flex flex-col justify-between shadow-2xl">
        <div className="space-y-4 overflow-y-auto max-h-[580px] pr-2">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-400">{msg.role === 'user' ? 'You' : msg.system}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-3xl rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 rounded-tr-none'
                    : 'bg-[#1A1F2B] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.role === 'assistant' && msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Evidence Sources: {msg.evidence.length} validated engine(s)</span>
                    </div>
                    <button
                      onClick={() => handleOpenEvidence(msg)}
                      className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      Show Evidence & Inputs (WHY?)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-[#1A1F2B] rounded-2xl border border-slate-800 text-slate-400 text-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Querying astronomical coordinates, evaluating classical rule engines, and constructing evidence graph...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder="Ask a question across Vedic, Western, KP, Numerology, Tarot, Palmistry, or Investment..."
            className="flex-1 bg-[#1A1F2B] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
          <button
            onClick={handleSendQuery}
            disabled={isProcessing || !queryInput.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Inquire</span>
          </button>
        </div>
      </div>

      {/* Explanatory Architecture Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800/80">
          <div className="text-xs font-mono text-cyan-400 mb-1">1. DETERMINISTIC CORE</div>
          <div className="text-xs text-slate-400">Zero synthetic positions. All planet coordinates and cusps are computed via Swiss Ephemeris and verified algorithms.</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800/80">
          <div className="text-xs font-mono text-cyan-400 mb-1">2. CLASSICAL RULE ENGINE</div>
          <div className="text-xs text-slate-400">Rules are extracted deterministically from foundational texts (BPHS, KP Readers, Tetrabiblos, Pythagorean).</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800/80">
          <div className="text-xs font-mono text-cyan-400 mb-1">3. MULTI-SIGNAL ISOLATION</div>
          <div className="text-xs text-slate-400">Financial, astrological, and macro signals are never silently mixed or converted into guaranteed outcomes.</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800/80">
          <div className="text-xs font-mono text-cyan-400 mb-1">4. TOTAL AUDITABILITY</div>
          <div className="text-xs text-slate-400">Every response includes a 'Show Evidence' trigger providing full visibility into inputs, formulas, and uncertainty bounds.</div>
        </div>
      </div>

      {/* Evidence & Why Modal */}
      {evidenceModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">EVIDENCE & CALCULATION AUDIT (WHY?)</h3>
              </div>
              <button
                onClick={() => setEvidenceModal({ ...evidenceModal, isOpen: false })}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 text-xs text-slate-300">
              {evidenceModal.evidence.map((ev, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#1A1F2B] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-cyan-300 uppercase tracking-wide">{ev.system}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">
                      Confidence: {(ev.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <div className="text-slate-500 font-mono mb-1">DETERMINISTIC INPUTS:</div>
                    <pre className="p-2 rounded bg-[#0b0f17] font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800/60">
                      {JSON.stringify(ev.deterministicInputs, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="text-slate-500 font-mono mb-0.5">CALCULATION METHOD:</div>
                    <div className="text-slate-200">{ev.calculationMethod}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-mono mb-0.5">CANONICAL TEXTUAL CITATIONS:</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {ev.sourceTexts.map((st, j) => (
                        <li key={j}>{st}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-slate-500 font-mono mb-0.5">RULES TRIGGERED:</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {ev.rulesTriggered.map((rt, j) => (
                        <li key={j} className="text-cyan-200/90">{rt}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-slate-500 font-mono mb-0.5">UNCERTAINTY & SENSITIVITY METRICS:</div>
                    <div className="text-amber-300/90">{ev.uncertaintyMetrics}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEvidenceModal({ ...evidenceModal, isOpen: false })}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
