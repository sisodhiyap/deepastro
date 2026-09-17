import { UniversalInsightCardEngine } from '../chatbot/UniversalInsightCardEngine.js';
import { useAuth } from '../../hooks/useAuth.js';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Trash2, ShieldCheck, ChevronRight, Cpu, Check, ChevronDown, ChevronUp, AlertTriangle, Compass, HelpCircle, Bookmark, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  evidence?: string[];
  recommendations?: string[];
  remedies?: string[];
  disclaimer?: string;
  timestamp: string;
  whyThisReading?: {
    primaryFactors: string[];
    supportingFactors?: string[];
    contradictions?: any[];
    confidence?: string;
    timingBasis?: string;
    limitations?: string;
  };
  confidence?: string;
  followUpQuestions?: string[];
  observedPatterns?: string[];
  // DeepAstro 3.1 Additions
  answerabilityStatus?: string;
  memoryProposal?: { content: string; type: string };
  memorySaved?: boolean;
  card?: { type: string; data: any };
  card_type?: string;
  actions?: string[];
}

interface AstroBotWidgetProps {
  chartContext?: any;
}

export const AstroBotWidget: React.FC<AstroBotWidgetProps> = ({ chartContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'Ollama' | 'OpenAI' | 'Gemini' | 'Grok'>('Ollama');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1:7b');
  const [installedOllamaModels, setInstalledOllamaModels] = useState<string[]>([]);
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const { user, token } = useAuth();
  const [loadingStage, setLoadingStage] = useState<string>('Analyzing your query...');

  const handleConfirmMemory = async (msgId: string, proposal: { content: string; type: string }) => {
    try {
      await fetch('/api/intelligence/confirm-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE',
          type: proposal.type,
          content: proposal.content,
          userId: 'user_default',
        }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, memorySaved: true } : m))
      );
    } catch (err) {
      console.error('Failed to confirm memory', err);
    }
  };

  const handleDismissMemory = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, memoryProposal: undefined } : m))
    );
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Namaste. I am AstroBot, your personal cosmic intelligence assistant. I am powered by deterministic Vedic chart calculations and local Ollama reasoning. How may I illuminate your celestial path today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Fetch available AI models & Ollama status
  useEffect(() => {
    fetch('/api/ai/models')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsOllamaConnected(Boolean(data.isOllamaConnected));
          if (data.activeOllamaModel) {
            setSelectedModel(data.activeOllamaModel);
          }
          const ollamaProv = data.providers?.find((p: any) => p.name === 'Ollama');
          if (ollamaProv && Array.isArray(ollamaProv.models)) {
            setInstalledOllamaModels(ollamaProv.models.map((m: any) => m.name));
            if (ollamaProv.models.length > 0 && !data.activeOllamaModel) {
              setSelectedModel(ollamaProv.models[0].name);
            }
          }
          if (data.defaultProvider) {
            setSelectedProvider(data.defaultProvider);
          }
        }
      })
      .catch(() => {
        // graceful offline fallback
      });
  }, []);

  const suggestedQuestions = [
    "What does my current Mahadasha indicate?",
    "Explain my 7th house and marriage potential simply.",
    "Why am I experiencing career friction?",
    "What daily mantra balances my Moon sign?",
  ];

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || query).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      // Section 1: Invoke Universal Chat Service Gateway (v4.2.1)
      setLoadingStage('Connecting to DeepAstro Universal Intelligence...');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let universalRes: Response | null = null;
      try {
        universalRes = await fetch('/api/ai/universal-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: messageText,
            query: messageText,
            birthProfile: chartContext || undefined,
            userId: user?.id,
          }),
        });
      } catch {
        // Universal chat network fallback
      }

      if (universalRes && universalRes.ok) {
        const resJson = await universalRes.json();
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: resJson.answer || resJson.directAnswer || 'DeepAstro intelligence synthesized.',
          card: resJson.card || undefined,
          card_type: resJson.card_type,
          actions: resJson.actions || [],
          evidence: Array.isArray(resJson.evidence) ? resJson.evidence.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)) : undefined,
          confidence: resJson.confidence >= 0.9 ? 'HIGH' : 'MODERATE',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        return;
      }

      // Fallback attempt DeepAstro Master Intelligence Analyze endpoint
      const intelRes = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageText,
          question: messageText,
          message: messageText,
          userId: user?.id || 'user_default',
        }),
      });

      if (intelRes.ok) {
        const intelJson = await intelRes.json();
        const ans = intelJson.intelligence || intelJson.data || intelJson.answer;
        if (ans) {
          const answerText = ans.directAnswer || ans.answer || ans.summary || ans.interpretation || (typeof ans === 'string' ? ans : 'Cosmic analysis processed.');
          const whyFactors = ans.whyThisReading?.primaryFactors || ans.why?.primaryFactors || [];
          const rawEvidence = ans.evidence || [];
          const formattedEvidence = Array.isArray(rawEvidence)
            ? rawEvidence.map((e: any) => typeof e === 'string' ? e : `${e.system || 'System'}: ${e.finding || e.description || ''}`)
            : [];
          const combinedEvidence = [...whyFactors, ...formattedEvidence];

          const botMsg: ChatMessage = {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: answerText,
            evidence: combinedEvidence.length > 0 ? combinedEvidence : undefined,
            recommendations: ans.actionableAdvice?.dailyPractices || ans.recommendations?.practicalActionSteps || ans.recommendations || [],
            remedies: ans.actionableAdvice?.recommendedRemedies || ans.recommendations?.traditionalSpiritualRemedies || ans.remedies || [],
            confidence: ans.confidence || ans.confidenceScore || 0.95,
            whyThisReading: ans.whyThisReading || ans.why ? {
              primaryFactors: ans.whyThisReading?.primaryFactors || ans.why?.primaryFactors || [],
              supportingFactors: ans.whyThisReading?.supportingFactors || ans.why?.supportingFactors || [],
              contradictions: ans.whyThisReading?.contradictions || ans.contradictions || [],
              confidence: ans.confidence || 0.95,
              timingBasis: ans.timingWindow?.basis,
              limitations: ans.limitations,
            } : undefined,
            followUpQuestions: (ans.suggestedFollowUps && ans.suggestedFollowUps.length > 0)
              ? ans.suggestedFollowUps
              : (ans.followUpQuestions || ans.clarificationsNeeded || []),
            observedPatterns: ans.lifePatternsObserved ? ans.lifePatternsObserved.map((p: any) => typeof p === 'string' ? p : p.description) : undefined,
            disclaimer: ans.limitations || ans.disclaimer,
            answerabilityStatus: ans.answerabilityStatus || 'ANSWERABLE_HIGH_CONFIDENCE',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, botMsg]);
          return;
        }
      }

      // Fallback to general AI chat endpoint
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          chartContext,
          provider: selectedProvider,
          model: selectedProvider === 'Ollama' ? selectedModel : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload = data.answer;

        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: payload.interpretation || payload.summary,
          evidence: payload.evidence,
          recommendations: payload.recommendations,
          remedies: payload.remedies,
          disclaimer: payload.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Cosmic service interruption');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: 'The celestial frequencies experienced a momentary drift. Your deterministic chart data remains secure; please rephrase or ask again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Orb Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Summon AstroBot"
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 text-black shadow-glow-cyan hover:scale-105 active:scale-95 transition-all duration-300 group flex items-center gap-2.5"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping" />
        </div>
        <span className="font-display font-extrabold text-xs tracking-wider uppercase text-black hidden sm:inline">
          AstroBot
        </span>
      </button>

      {/* AstroBot Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 ${isExpanded ? 'w-[calc(100vw-2rem)] sm:w-[720px] max-h-[85vh] h-[85vh]' : 'w-[calc(100vw-2rem)] sm:w-[420px] max-h-[600px] h-[80vh]'} flex flex-col rounded-3xl border border-cosmic-border bg-cosmic-surface/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-float">
          {/* Header */}
          <div className="p-4 border-b border-cosmic-border flex items-center justify-between bg-cosmic-card/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center text-black font-extrabold shadow-glow-cyan">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-cosmic-text flex items-center gap-1.5">
                  AstroBot <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-cosmic-muted">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Grounded in Deterministic Vedic Chart</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-cosmic-muted hover:text-rose-400 hover:bg-cosmic-card transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Minimize window" : "Expand window"}
                className="p-1.5 rounded-lg text-cosmic-muted hover:text-cyan-400 hover:bg-cosmic-card transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-card transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Engine & Reasoning Selector Bar */}
          <div className="px-3.5 py-1.5 border-b border-cosmic-border/60 bg-cosmic-card/40 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isOllamaConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                )}
              </span>
              <span className="text-cosmic-muted font-medium">Engine:</span>
              <button
                type="button"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cosmic-surface/80 px-2 py-0.5 rounded-md border border-cosmic-border/60"
              >
                <span className="truncate max-w-[140px]">
                  {selectedProvider === 'Ollama' ? `Ollama: ${selectedModel}` : selectedProvider}
                </span>
                <ChevronDown className="w-3 h-3 text-cosmic-muted" />
              </button>
            </div>

            <div className="text-[10px] font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              {selectedProvider === 'Ollama' ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-sans tracking-tight">
                  LOCAL ENGINE
                </span>
              ) : (
                <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 font-sans tracking-tight">
                  CLOUD AI
                </span>
              )}
            </div>
          </div>

          {/* Model Selector Dropdown */}
          {showModelSelector && (
            <div className="p-3 border-b border-cosmic-border bg-cosmic-card/95 backdrop-blur-md space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cosmic-muted">
                <span>Select Reasoning & Work Model</span>
                <button
                  type="button"
                  onClick={() => setShowModelSelector(false)}
                  className="hover:text-cosmic-text text-cosmic-muted"
                >
                  Close
                </button>
              </div>

              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  <span>Local Ollama Models ({isOllamaConnected ? 'Connected' : 'Offline'})</span>
                </div>

                {installedOllamaModels.length > 0 ? (
                  installedOllamaModels.map((modelName) => (
                    <button
                      key={modelName}
                      type="button"
                      onClick={() => {
                        setSelectedProvider('Ollama');
                        setSelectedModel(modelName);
                        setShowModelSelector(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        selectedProvider === 'Ollama' && selectedModel === modelName
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                          : 'hover:bg-cosmic-surface text-cosmic-text'
                      }`}
                    >
                      <span className="font-mono text-[11px] truncate">{modelName}</span>
                      {selectedProvider === 'Ollama' && selectedModel === modelName && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider('Ollama');
                      setSelectedModel('deepseek-r1:7b');
                      setShowModelSelector(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs text-cosmic-text hover:bg-cosmic-surface"
                  >
                    <span className="font-mono text-[11px]">deepseek-r1:7b (Local Default)</span>
                  </button>
                )}

                <div className="text-[10px] text-violet-400 font-semibold pt-1">Cloud Mesh Models</div>
                {(['OpenAI', 'Gemini', 'Grok'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setSelectedProvider(prov);
                      setShowModelSelector(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      selectedProvider === prov
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold'
                        : 'hover:bg-cosmic-surface text-cosmic-text'
                    }`}
                  >
                    <span>{prov} Cloud</span>
                    {selectedProvider === prov && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`${!isUser && m.card ? 'w-full max-w-full' : 'max-w-[85%]'} p-3.5 rounded-2xl leading-relaxed ${

                      isUser
                        ? 'bg-cyan-500 text-black font-semibold rounded-br-none shadow-glow-cyan/20'
                        : 'bg-cosmic-card border border-cosmic-border text-cosmic-text rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Universal Insight Card */}
                    {!isUser && m.card && (
                      <div className="mt-3 w-full">
                        <UniversalInsightCardEngine
                          card={m.card}
                          actions={m.actions}
                          onActionClick={(action) => {
                            if (action === 'Why this reading?') {
                              setExpandedWhyId((prev) => (prev === m.id ? null : m.id));
                            } else if (action === 'Save Reading') {
                              handleConfirmMemory(m.id, {
                                type: 'SAVED_INTERPRETATION',
                                content: m.text,
                              });
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Grounded Evidence Chunks */}
                    {m.evidence && m.evidence.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-cosmic-border/50 text-[10px] text-cosmic-muted">
                        <span className="font-bold text-cyan-400 block mb-1">Chart Alignments:</span>
                        {m.evidence.map((ev, eIdx) => (
                          <div key={`ev-${eIdx}`} className="flex items-center gap-1 mt-0.5">
                            <ChevronRight className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Remedies */}
                    {m.remedies && m.remedies.length > 0 && (
                      <div className="mt-2 text-[10px] text-cosmic-gold font-medium">
                        <strong>Remedy:</strong> {m.remedies.join(', ')}
                      </div>
                    )}

                    {/* Confidence & Why This Reading Drawer Trigger */}
                    {!isUser && (m.whyThisReading || m.confidence || m.answerabilityStatus) && (
                      <div className="mt-2.5 pt-2 border-t border-cosmic-border/60 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {m.confidence && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                m.confidence === 'HIGH'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : m.confidence === 'MODERATE'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              Confidence: {m.confidence}
                            </span>
                          )}

                          {m.answerabilityStatus && (
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              {m.answerabilityStatus === 'NEEDS_CLARIFICATION'
                                ? 'Clarification Needed'
                                : m.answerabilityStatus}
                            </span>
                          )}
                        </div>

                        {m.whyThisReading && (
                          <button
                            type="button"
                            onClick={() => setExpandedWhyId(expandedWhyId === m.id ? null : m.id)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors ml-auto"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Why this reading?</span>
                            {expandedWhyId === m.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Expanded Why This Reading Explanation Panel */}
                    {!isUser && expandedWhyId === m.id && m.whyThisReading && (
                      <div className="mt-2.5 p-3 rounded-xl bg-cosmic-surface/90 border border-cyan-500/30 text-[10px] space-y-2 animate-fadeIn">
                        {/* Primary Factors */}
                        {m.whyThisReading.primaryFactors && m.whyThisReading.primaryFactors.length > 0 && (
                          <div>
                            <span className="font-bold text-cyan-300 block mb-1">Primary Astrological Factors:</span>
                            <ul className="space-y-1 list-disc list-inside text-cosmic-text">
                              {m.whyThisReading.primaryFactors.map((f, fIdx) => (
                                <li key={`pf-${fIdx}`}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Supporting Factors */}
                        {m.whyThisReading.supportingFactors && m.whyThisReading.supportingFactors.length > 0 && (
                          <div>
                            <span className="font-bold text-violet-300 block mb-1">Supporting Convergences:</span>
                            <ul className="space-y-0.5 list-disc list-inside text-cosmic-muted">
                              {m.whyThisReading.supportingFactors.map((sf, sfIdx) => (
                                <li key={`sf-${sfIdx}`}>{sf}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Contradictions / System Divergence */}
                        {m.whyThisReading.contradictions && m.whyThisReading.contradictions.length > 0 && (
                          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            <span className="font-bold flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3" />
                              System Divergences (No False Consensus):
                            </span>
                            <div className="space-y-1 text-[9px] text-amber-200">
                              {m.whyThisReading.contradictions.map((c: any, cIdx: number) => (
                                <p key={`c-${cIdx}`}>
                                  {typeof c === 'string'
                                    ? c
                                    : `${c.systemA} vs ${c.systemB}: ${c.topic} (${c.resolutionApproach})`}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observed Life Patterns */}
                        {m.observedPatterns && m.observedPatterns.length > 0 && (
                          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            <span className="font-bold flex items-center gap-1 mb-1">
                              <Compass className="w-3 h-3" />
                              Observed Life Pattern:
                            </span>
                            {m.observedPatterns.map((pat, pIdx) => (
                              <p key={`pat-${pIdx}`} className="text-[9px] text-cyan-100">
                                {pat}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Limitations Note */}
                        {m.disclaimer && (
                          <p className="text-[9px] text-cosmic-muted italic pt-1 border-t border-cosmic-border/40">
                            {m.disclaimer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clarifying / Suggested Follow-up Chips */}
                  {!isUser && m.followUpQuestions && m.followUpQuestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                      {m.followUpQuestions.slice(0, 3).map((fq, fqIdx) => (
                        <button
                          key={`fq-${fqIdx}`}
                          type="button"
                          onClick={() => handleSend(fq)}
                          className="text-[10px] text-left px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1"
                        >
                          <HelpCircle className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Sovereign Memory Confirmation UX ("Remember this?") */}
                  {!isUser && m.memoryProposal && !m.memorySaved && (
                    <div className="mt-2 p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between gap-2 text-[10px] max-w-[85%] animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-violet-300 min-w-0">
                        <Bookmark className="w-3 h-3 text-violet-400 shrink-0" />
                        <span className="truncate">Remember: "{m.memoryProposal.content.substring(0, 35)}..."?</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleConfirmMemory(m.id, m.memoryProposal!)}
                          className="px-2 py-0.5 rounded bg-violet-500 hover:bg-violet-400 text-white font-bold text-[9px] transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissMemory(m.id)}
                          className="px-2 py-0.5 rounded bg-cosmic-surface hover:bg-cosmic-card text-cosmic-muted text-[9px] transition-colors"
                        >
                          Not now
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-cosmic-muted mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cosmic-muted bg-cosmic-card p-3 rounded-2xl max-w-[70%] border border-cosmic-border">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Consulting classical astrological sources...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-cosmic-border/40 bg-cosmic-card/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={`sq-${idx}`}
                onClick={() => handleSend(sq)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full border border-cosmic-border bg-cosmic-surface hover:border-cyan-400 hover:text-cyan-300 transition-colors text-cosmic-muted flex-shrink-0"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-cosmic-border bg-cosmic-surface flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your Kundli, Dasha, career..."
              className="flex-1 bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-xs text-cosmic-text placeholder:text-cosmic-muted focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-cyan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
