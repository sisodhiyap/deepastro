import React, { useState, useEffect } from 'react';
import { Sparkles, History, RefreshCw, AlertCircle, Share2, Printer, Compass, Layers } from 'lucide-react';
import { PastLifeInsightCard } from '../components/astrology/PastLifeInsightCard';
import { SoulJourneyCard } from '../components/astrology/SoulJourneyCard';

export const PastLifePage: React.FC = () => {
  const [format, setFormat] = useState<'insight_card' | 'soul_journey'>('insight_card');
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<any>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  const fetchPastLife = async (formatChoice: 'insight_card' | 'soul_journey' = format) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/intelligence/past-life/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ format: formatChoice }),
      });

      const data = await res.json();
      if (!res.ok || !data.schema) {
        throw new Error(data.message || data.error || 'Failed to generate past life insight');
      }

      setReading(data.schema);
      setCardData(data.card);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/intelligence/past-life/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.readings) {
        setHistory(data.readings);
      }
    } catch (e) {}
  };

  const handleFeedback = async (sentiment: string) => {
    if (!reading) return;
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/intelligence/past-life/${reading.id}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sentiment }),
      });
      setFeedbackSent(sentiment);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPastLife();
    loadHistory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && reading) {
      try {
        await navigator.share({
          title: `DeepAstro Past Life: ${reading.archetype?.primary}`,
          text: `My DeepAstro past-life reading revealed the ${reading.archetype?.primary} archetype. Check out your soul journey on DeepAstro!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#04060B] text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Top Header & Navigation Bar */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>SOULTRACE ENGINE v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
            Past Life Intelligence & Soul Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Discover the karmic themes, symbolic patterns and spiritual lessons reflected in your chart.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Format Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setFormat('insight_card');
                if (reading) fetchPastLife('insight_card');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                format === 'insight_card'
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Soul Insight
            </button>
            <button
              onClick={() => {
                setFormat('soul_journey');
                if (reading) fetchPastLife('soul_journey');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                format === 'soul_journey'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deep Soul Journey
            </button>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reading History"
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={() => fetchPastLife()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Recalculate Reading"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="max-w-5xl mx-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
            <span>PAST SOULTRACE READINGS ({history.length})</span>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
              Close
            </button>
          </div>
          {history.length === 0 ? (
            <div className="text-xs text-slate-500">No previous readings found in this session.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setReading(item);
                    setShowHistory(false);
                  }}
                  className="p-3 rounded-xl bg-slate-950 hover:border-amber-500/40 border border-slate-800 text-xs space-y-1 cursor-pointer transition-all"
                >
                  <div className="font-bold text-amber-300 truncate">{item.archetype?.primary}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(item.generated_at).toLocaleDateString()} &bull; {item.confidence?.overall}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto space-y-6">
        {loading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-sm font-mono text-amber-300">
              CONSULTING IMMUTABLE CALCULATION CORE & JAIMINI SUTRAS...
            </div>
            <p className="text-xs text-slate-500">
              Evaluating Ketu, 12th House, Purva Punya, Atmakaraka, and Vishnu Purana philosophical themes
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs space-y-2 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <div className="font-bold text-sm">Birth Data Incomplete</div>
            <p className="text-slate-300">{error}</p>
            <p className="text-slate-400 text-[11px]">
              Please ensure your birth date, time, and coordinates are saved in your profile.
            </p>
          </div>
        )}

        {!loading && !error && reading && (
          <div>
            {format === 'insight_card' && cardData ? (
              <PastLifeInsightCard data={cardData} onExportPdf={handlePrint} onShare={handleShare} />
            ) : (
              <SoulJourneyCard schema={reading} onExportPdf={handlePrint} />
            )}

            {/* User Resonance Feedback Panel */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-xl mx-auto">
              <div className="text-xs font-mono font-bold text-slate-300">
                HOW DOES THIS SPIRITUAL INTERPRETATION RESONATE?
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['RESONATES', 'PARTIALLY_RESONATES', 'DOES_NOT_RESONATE', 'NOT_SURE'].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleFeedback(choice)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      feedbackSent === choice
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {choice.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              {feedbackSent && (
                <div className="text-[11px] text-emerald-400 font-mono">
                  Thank you! Your feedback is recorded as an interpretive signal.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
