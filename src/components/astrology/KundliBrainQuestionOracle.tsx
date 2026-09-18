import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  Cpu,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getBirthProfile } from '../../utils/birthStorage.js';

interface KundliBrainQuestionOracleProps {
  chart: any;
  className?: string;
}

interface BrainAnswerState {
  directAnswer: string;
  chartIndicators?: string;
  supportingFactors?: string[];
  timing?: string;
  guidance?: string;
  provider: string;
  confidence: string;
  evidenceHash?: string;
}

const SAMPLE_QUESTIONS = [
  'How do my active Mahadasha & current transits impact my career today?',
  'What does my 7th house and Venus placement indicate for relationship harmony?',
  'Is this a favorable period for financial investments or property decisions?',
  'What are the most auspicious hours and practical remedies for me today?',
];

export const KundliBrainQuestionOracle: React.FC<KundliBrainQuestionOracleProps> = ({
  chart,
  className = '',
}) => {
  const [question, setQuestion] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'Gemini' | 'OpenAI' | 'Ollama'>('auto');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<BrainAnswerState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (queryToAsk = question) => {
    const trimmed = queryToAsk.trim();
    if (!trimmed) return;

    setIsAsking(true);
    setError(null);
    setAnswer(null);

    const profile = getBirthProfile();
    const birthDate = profile?.birthDate || chart?.profile?.birthDate || chart?.birthData?.birthDate || chart?.input?.birthDate;
    const birthTime = profile?.birthTime || chart?.profile?.birthTime || chart?.birthData?.birthTime || chart?.input?.birthTime;
    const birthPlace = profile?.birthPlace || chart?.profile?.birthPlace || chart?.birthData?.birthPlace || chart?.input?.birthPlace;
    const latitude = profile?.latitude ?? chart?.profile?.latitude ?? chart?.birthData?.latitude ?? chart?.input?.latitude;
    const longitude = profile?.longitude ?? chart?.profile?.longitude ?? chart?.birthData?.longitude ?? chart?.input?.longitude;
    const timezone = profile?.timezone ?? chart?.profile?.timezone ?? chart?.birthData?.timezone ?? chart?.input?.timezone ?? 5.5;

    if (!birthDate || !birthTime || !birthPlace || latitude === undefined || longitude === undefined) {
      setError('Please complete your birth profile with accurate birth date, time, and birthplace before querying the Oracle.');
      setIsAsking(false);
      return;
    }

    const effectiveProfile = {
      name: profile?.name || chart?.profile?.name || chart?.birthData?.name || chart?.input?.name || 'Native Seeker',
      birthDate,
      birthTime,
      birthPlace,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: Number(timezone),
      gender: profile?.gender || chart?.profile?.gender || chart?.birthData?.gender || chart?.input?.gender || 'Other',
    };

    try {
      // 1. Primary: Try DeepAstro Brain v2 analyze
      const brainRes = await fetch('/api/brain/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          birthProfile: effectiveProfile,
          allowPublicResearch: true,
        }),
      });

      if (brainRes.ok) {
        const brainData = await brainRes.json();
        if (brainData.success && brainData.brainResponse) {
          const resp = brainData.brainResponse;
          setAnswer({
            directAnswer: resp.structuredReading?.directAnswer || 'Astrological analysis computed.',
            chartIndicators: resp.structuredReading?.whatYourChartIndicates,
            supportingFactors: resp.structuredReading?.supportingFactors || [],
            timing: resp.structuredReading?.timingIndications,
            guidance: resp.structuredReading?.practicalGuidance,
            provider:
              selectedProvider === 'auto'
                ? 'DeepAstro Brain Consensus (Gemini + OpenAI + Ollama)'
                : `${selectedProvider} Engine`,
            confidence: resp.structuredReading?.whyThisReading?.confidenceSummary || 'Verified Ephemeris Grounding',
            evidenceHash: resp.calculationFingerprint,
          });
          return;
        }
      }

      // 2. Secondary: Orchestrator Chat Route (OpenAI / Gemini / Ollama)
      const chatRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chartContext: chart,
          provider: selectedProvider === 'auto' ? undefined : selectedProvider,
        }),
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setAnswer({
          directAnswer: chatData.answer?.content || chatData.answer || 'Consultation synthesized.',
          chartIndicators: chatData.chartReference
            ? `Ascendant: ${chatData.chartReference.ascendant} • Moon: ${chatData.chartReference.moonSign} • Active Dasha: ${chatData.chartReference.currentDasha}`
            : undefined,
          provider: chatData.answer?.provider || (selectedProvider === 'auto' ? 'OpenAI / Gemini AI' : selectedProvider),
          confidence: 'Verified Natal Transit Grounding',
        });
      } else {
        const err = await chatRes.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Failed to analyze question with Kundli Brain.');
      }
    } catch (err: any) {
      console.error('[KundliBrainQuestionOracle]', err);
      setError(err.message || 'Error communicating with AI Brain Oracle.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className={`rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0a122c] via-cosmic-surface to-[#0a122c] p-6 sm:p-8 shadow-glow-cyan/20 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              Multi-Model AI Brain Oracle
            </span>
            <span className="text-xs text-cosmic-muted font-mono">Gemini • OpenAI • Ollama</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Ask Questions Answered by Your Kundli
          </h3>
          <p className="text-xs text-cosmic-muted max-w-xl">
            Ask any personal, timing, or life question. DeepAstro synthesizes your natal Lagna, active Mahadasha period, planetary Gochara transits, and scriptural RAG.
          </p>
        </div>

        {/* Model Provider Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-cosmic-card/80 border border-cosmic-border shrink-0 self-start sm:self-center">
          {[
            { id: 'auto', label: 'Auto Consensus' },
            { id: 'Gemini', label: 'Gemini 1.5' },
            { id: 'OpenAI', label: 'GPT-4o' },
            { id: 'Ollama', label: 'Ollama (Local)' },
          ].map((prov) => (
            <button
              key={prov.id}
              type="button"
              onClick={() => setSelectedProvider(prov.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                selectedProvider === prov.id
                  ? 'bg-cyan-500 text-black shadow-glow-cyan/50'
                  : 'text-cosmic-muted hover:text-cosmic-text'
              }`}
            >
              {prov.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Sample Questions */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cosmic-muted block">
          Frequent Inquiries for Today's Sky:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleAsk(q);
              }}
              disabled={isAsking}
              className="px-3 py-1.5 rounded-xl bg-cosmic-card/60 hover:bg-cosmic-card border border-cosmic-border hover:border-cyan-400 text-[11px] text-cosmic-text/90 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your Kundli: e.g. What does this week's planetary transit indicate for my career?"
            disabled={isAsking}
            className="w-full bg-cosmic-card/90 border border-cosmic-border rounded-2xl pl-4 pr-32 py-3.5 text-xs text-cosmic-text placeholder:text-cosmic-muted/60 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan disabled:opacity-50 flex items-center gap-1.5"
          >
            {isAsking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Brain</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Answer Presentation Card */}
      {answer && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cosmic-card/90 p-6 space-y-4 animate-fadeIn shadow-glow-cyan/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cosmic-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Grounded Kundli Reading
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                {answer.provider}
              </span>
              <span className="text-[10px] font-mono text-cosmic-muted bg-black/30 px-2 py-0.5 rounded-full">
                {answer.confidence}
              </span>
            </div>
          </div>

          {/* Chart Context Indicator */}
          {answer.chartIndicators && (
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
              {answer.chartIndicators}
            </div>
          )}

          {/* Direct Answer */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">
              Astrological Synthesis:
            </span>
            <p className="text-xs text-cosmic-text leading-relaxed whitespace-pre-line">
              {answer.directAnswer}
            </p>
          </div>

          {/* Supporting Factors */}
          {answer.supportingFactors && answer.supportingFactors.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-cosmic-border/40">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">
                Planetary Transits &amp; Classical Factors:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {answer.supportingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-cosmic-text/90 bg-cosmic-surface/60 p-2.5 rounded-xl border border-cosmic-border/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timing & Guidance */}
          {(answer.timing || answer.guidance) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {answer.timing && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    Timing Indications (Muhurat &amp; Dasha)
                  </span>
                  <p className="text-cosmic-text leading-relaxed text-[11px]">{answer.timing}</p>
                </div>
              )}
              {answer.guidance && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Practical Astrological Advice
                  </span>
                  <p className="text-cosmic-text leading-relaxed text-[11px]">{answer.guidance}</p>
                </div>
              )}
            </div>
          )}

          {/* Provenance Stamp */}
          {answer.evidenceHash && (
            <div className="text-[10px] font-mono text-cosmic-muted flex items-center justify-between pt-2 border-t border-cosmic-border/30">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Immutable Ephemeris Passport
              </span>
              <span className="truncate max-w-[200px] text-cyan-400/80">{answer.evidenceHash}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
