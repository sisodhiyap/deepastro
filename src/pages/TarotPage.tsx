import React, { useState, useEffect } from 'react';
import {
  TarotCard,
  TarotDraw,
  TarotSession,
  TarotInterpretation,
  TarotQuestionCategory,
  AstroTarotContext,
} from '../types/tarot.js';
import { TAROT_DECK } from '../data/tarotDeck.js';
import {
  executeShuffleToDestiny,
  getDailyTarotCard,
  getJournalHistory,
  saveToJournalStorage,
  deleteFromJournalStorage,
  toggleFavoriteJournal,
  DEFAULT_ASTRO_CONTEXT,
} from '../services/tarotEngine.js';
import { TarotCardComponent } from '../components/tarot/TarotCardComponent.js';
import { TarotShuffleAnimation } from '../components/tarot/TarotShuffleAnimation.js';
import {
  Sparkles,
  RotateCw,
  Compass,
  BookOpen,
  Sun,
  Moon,
  Bookmark,
  Share2,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Zap,
  Star,
  Trash2,
  X,
  Calendar,
} from 'lucide-react';

// ----------------------------------------------------------------
// Question category display map
// ----------------------------------------------------------------
const QUESTION_CATEGORIES: { id: TarotQuestionCategory; label: string; icon: string }[] = [
  { id: 'GENERAL LIFE', label: 'General Life', icon: '🌌' },
  { id: 'LOVE & RELATIONSHIPS', label: 'Love & Union', icon: '❤️' },
  { id: 'CAREER & PURPOSE', label: 'Career & Mission', icon: '💼' },
  { id: 'FINANCE & ABUNDANCE', label: 'Finance & Wealth', icon: '💰' },
  { id: 'FAMILY & HARMONY', label: 'Family & Home', icon: '🏡' },
  { id: 'DECISION & CROSSROADS', label: 'Decision Making', icon: '⚖️' },
  { id: 'PERSONAL GROWTH', label: 'Personal Growth', icon: '🌱' },
  { id: 'SPIRITUALITY', label: 'Spirituality', icon: '✨' },
  { id: "TODAY'S ENERGY", label: "Today's Energy", icon: '☀️' },
  { id: 'FUTURE DIRECTION', label: 'Future Direction', icon: '🧭' },
  { id: 'SURPRISE ME', label: 'Surprise Me', icon: '🎲' },
];

// ----------------------------------------------------------------
// Tarot Journal Modal (inline, no separate file needed)
// ----------------------------------------------------------------
const TarotJournalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectReading: (s: TarotSession) => void;
}> = ({ isOpen, onClose, onSelectReading }) => {
  const [readings, setReadings] = useState<TarotSession[]>([]);
  const [filterFav, setFilterFav] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTarget, setNoteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setReadings(getJournalHistory());
  }, [isOpen]);

  if (!isOpen) return null;

  const displayed = filterFav ? readings.filter((r) => r.favorite) : readings;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFromJournalStorage(id);
    setReadings(getJournalHistory());
  };

  const handleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteJournal(id);
    setReadings(getJournalHistory());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-amber-500/30 bg-[#0c101d] text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold tracking-wide text-amber-200">My Tarot Destiny Journal</h2>
              <p className="text-xs text-slate-400">Chronological cosmic consultations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterFav(!filterFav)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                filterFav ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFav ? 'fill-amber-400 text-amber-400' : ''}`} />
              Favorites
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40 text-amber-400" />
              <p className="text-sm">No recorded Tarot sessions yet.</p>
              <p className="text-xs mt-1">Shuffle to Destiny and save your reading.</p>
            </div>
          ) : (
            displayed.map((session) => (
              <div
                key={session.sessionId}
                onClick={() => { onSelectReading(session); onClose(); }}
                className="p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                      {session.questionCategory}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleFav(session.sessionId, e)}
                      className={`p-1.5 rounded hover:bg-slate-800 ${session.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Star className={`w-4 h-4 ${session.favorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.sessionId, e)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  {session.drawnCards.map((c) => (
                    <div key={c.position} className="p-2 rounded-lg bg-[#070913] border border-slate-800/80 text-center">
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block">{c.position}</span>
                      <span className="text-xs font-bold text-amber-300 truncate block">{c.card.name}</span>
                      <span className={`text-[9px] px-1.5 rounded mt-1 inline-block ${c.orientation === 'reversed' ? 'bg-purple-950/60 text-purple-300' : 'bg-amber-950/40 text-amber-300'}`}>
                        {c.orientation}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{session.interpretation.story}</p>

                {noteTarget === session.sessionId ? (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add personal reflection..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => {
                        const updated = readings.map((r) =>
                          r.sessionId === session.sessionId ? { ...r, notes: noteText } : r
                        );
                        saveToJournalStorage({ ...session, notes: noteText });
                        setReadings(getJournalHistory());
                        setNoteTarget(null);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
                    >
                      Save
                    </button>
                    <button onClick={() => setNoteTarget(null)} className="text-xs text-slate-400 hover:text-slate-200">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-1.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setNoteTarget(session.sessionId); setNoteText(session.notes || ''); }}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 font-medium"
                    >
                      {session.notes ? '✏️ Edit Note' : '+ Add Note'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// MAIN TAROT PAGE
// ================================================================
export const TarotPage: React.FC = () => {
  const [stage, setStage] = useState<'landing' | 'shuffling' | 'revealing' | 'result'>('landing');
  const [selectedCategory, setSelectedCategory] = useState<TarotQuestionCategory>('GENERAL LIFE');
  const [astroWeighting, setAstroWeighting] = useState(true);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [activeSession, setActiveSession] = useState<TarotSession | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({
    root: false,
    present: false,
    direction: false,
  });

  const [dailyDraw, setDailyDraw] = useState<{ card: TarotCard; orientation: 'upright' | 'reversed'; date: string } | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);

  useEffect(() => {
    const daily = getDailyTarotCard('deepastro_user_1');
    setDailyDraw(daily);
  }, []);

  const handleStartShuffle = () => {
    setIsSaved(false);
    setFlippedCards({ root: false, present: false, direction: false });
    setStage('shuffling');
  };

  const handleShuffleComplete = () => {
    try {
      const session = executeShuffleToDestiny({
        userId: 'deepastro_user_1',
        category: selectedCategory,
        question: `What cosmic perspective should I receive regarding my ${selectedCategory.toLowerCase()}?`,
        astroContext: DEFAULT_ASTRO_CONTEXT,
        applyAstroWeighting: astroWeighting,
      });
      setActiveSession(session);
      setStage('revealing');

      setTimeout(() => setFlippedCards((prev) => ({ ...prev, root: true })), 400);
      setTimeout(() => setFlippedCards((prev) => ({ ...prev, present: true })), 1100);
      setTimeout(() => setFlippedCards((prev) => ({ ...prev, direction: true })), 1800);
      setTimeout(() => setStage('result'), 2400);
    } catch (err) {
      console.error('Tarot draw error:', err);
      setStage('landing');
    }
  };

  const handleSaveToJournal = () => {
    if (!activeSession) return;
    saveToJournalStorage(activeSession);
    setIsSaved(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleLoadFromJournal = (session: TarotSession) => {
    setActiveSession(session);
    setFlippedCards({ root: true, present: true, direction: true });
    setStage('result');
  };

  const catLabel = QUESTION_CATEGORIES.find((q) => q.id === selectedCategory)?.label || 'General Life';

  return (
    <div className="min-h-full bg-[#06070A] text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono tracking-widest uppercase">
              DEEPASTRO TAROT ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
              78 CARDS · CRYPTO RNG
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-300 bg-clip-text text-transparent mt-1">
            Three Cards. One Moment. A New Perspective.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Your validated astrology shapes the context. The cards reveal the cosmic mirror.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {dailyDraw && (
            <button
              onClick={() => setShowDailyModal(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Card of the Day
            </button>
          )}
          <button
            onClick={() => setIsJournalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            My Tarot Journal
          </button>
        </div>
      </div>

      {/* ─── SHUFFLE ANIMATION ─── */}
      {stage === 'shuffling' && (
        <div className="py-12">
          <TarotShuffleAnimation onComplete={handleShuffleComplete} questionCategory={catLabel} />
        </div>
      )}

      {/* ─── LANDING ─── */}
      {stage === 'landing' && (
        <div className="max-w-4xl mx-auto py-8 flex flex-col items-center text-center">
          {/* Deck Visual */}
          <div className="relative my-8 group cursor-pointer" onClick={handleStartShuffle}>
            <div className="absolute -inset-8 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />
            <div className="relative w-52 h-80 rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-[#0c1020] via-[#111827] to-[#05070e] p-5 shadow-[0_0_40px_rgba(245,199,106,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:border-amber-300">
              <div className="w-full h-full rounded-2xl border border-amber-400/30 flex flex-col items-center justify-between p-4 relative overflow-hidden">
                <div className="flex items-center justify-between w-full text-[10px] uppercase font-mono tracking-widest text-amber-300">
                  <span>DEEPASTRO</span>
                  <span>78 CARDS</span>
                </div>
                <div className="w-24 h-24 rounded-full border border-amber-400/40 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '24s' }} />
                  <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-200">SACRED RUNES</span>
                  <p className="text-[10px] text-slate-400">TOUCH TO AWAKEN</p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Category Selector */}
          <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                What would you like guidance about?
              </span>
              <span className="text-[11px] text-slate-400">Optional Focus</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,199,106,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Astrology Context Bias (±12% max)</span>
              </div>
              <button
                onClick={() => setAstroWeighting(!astroWeighting)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                  astroWeighting
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {astroWeighting ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleStartShuffle}
            className="px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(245,199,106,0.4)] hover:shadow-[0_0_45px_rgba(245,199,106,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
            ✦ SHUFFLE TO DESTINY
          </button>
          <p className="text-[11px] text-slate-500 mt-3 font-mono">
            Cryptographically secure entropy seed · 3 unique cards drawn without replacement
          </p>
        </div>
      )}

      {/* ─── REVEALING & RESULT ─── */}
      {(stage === 'revealing' || stage === 'result') && activeSession && (
        <div className="max-w-6xl mx-auto py-6 space-y-8">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">Reading Query:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                {catLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSaveToJournal}
                disabled={isSaved}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {isSaved ? 'Saved to Journal' : 'Save Reading'}
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'Link Copied!' : 'Share'}
              </button>
              <button
                onClick={handleStartShuffle}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Shuffle Again
              </button>
            </div>
          </div>

          {/* 3-Card Spread */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {activeSession.drawnCards.map((draw, idx) => {
              const isFlipped = flippedCards[draw.position];
              const posLabel = draw.position === 'root' ? 'ROOT / PAST' : draw.position === 'present' ? 'PRESENT / ENERGY' : 'DIRECTION / NEXT';
              const posQuestion = draw.position === 'root'
                ? 'What energy has shaped this situation?'
                : draw.position === 'present'
                ? 'What energy surrounds you now?'
                : 'What direction should you consciously consider?';

              return (
                <div key={draw.position} className="flex flex-col items-center w-full max-w-xs">
                  <div className="mb-3 text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400/90">
                      CARD {idx + 1} · {posLabel}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{posQuestion}</p>
                  </div>
                  <TarotCardComponent
                    card={draw.card}
                    orientation={draw.orientation}
                    positionLabel={posLabel}
                    isFlipped={isFlipped}
                    onFlip={() => setFlippedCards((prev) => ({ ...prev, [draw.position]: !prev[draw.position] }))}
                    size="md"
                  />
                </div>
              );
            })}
          </div>

          {/* Connecting Flow Bar */}
          <div className="flex items-center justify-center gap-3 text-xs text-amber-300/70 font-mono tracking-widest uppercase">
            <span>Root Energy</span>
            <span>━━━━━▶</span>
            <span>Present Synthesis</span>
            <span>━━━━━▶</span>
            <span>Conscious Direction</span>
          </div>

          {/* Interpretation Sections */}
          {activeSession.interpretation && (
            <div className="space-y-6">
              {/* Narrative Story */}
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-[#111827] p-6 sm:p-8 shadow-[0_0_35px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2.5 pb-4 border-b border-amber-500/20 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-wide text-amber-200 uppercase">Your Destiny Narrative</h2>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
                  {activeSession.interpretation.story}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
                  {activeSession.drawnCards.map((d, i) => (
                    <div key={d.position} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {i === 0 ? 'Root Energy' : i === 1 ? 'Present Pivot' : 'Direction Vector'}
                      </span>
                      <p className={`text-xs font-semibold mt-0.5 ${i === 0 ? 'text-amber-300' : i === 1 ? 'text-cyan-300' : 'text-purple-300'}`}>
                        {d.card.name} ({d.orientation})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cosmic Cross-Reading */}
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#091122]/90 to-[#111827] p-6 sm:p-8 shadow-[0_0_35px_rgba(0,229,255,0.1)]">
                <div className="flex items-center gap-2.5 pb-4 border-b border-cyan-500/20 mb-4">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-wide text-cyan-200 uppercase">Cosmic Cross-Reading</h2>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeSession.interpretation.cosmicCrossReading}
                </p>
                <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed">
                  <span className="font-bold text-cyan-300">Ethical Note: </span>
                  Astrological observations are deterministically calculated. Tarot provides symbolic reflection, not guaranteed outcomes. Both systems are presented separately.
                </div>
              </div>

              {/* Key Message + Reflection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Key Message
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">{activeSession.interpretation.keyMessage}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Recommended Action</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeSession.interpretation.actionStep}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Reading Relevance</span>
                    <span className="font-bold text-emerald-400 uppercase tracking-wide">{activeSession.interpretation.relevance}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      Contemplative Question
                    </h3>
                    <blockquote className="p-3.5 rounded-xl bg-cyan-950/20 border-l-2 border-cyan-400 text-xs sm:text-sm text-cyan-100 font-medium italic mb-4">
                      "{activeSession.interpretation.reflectionQuestion}"
                    </blockquote>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Divination Principle: </span>
                    Tarot provides symbolic perspective and introspective clarity. Outcomes remain in your conscious free will and daily discernment.
                  </div>
                </div>
              </div>

              {/* Pattern Analysis */}
              {activeSession.interpretation.patternAnalysis && (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>Major Arcana: <strong className="text-amber-300">{activeSession.interpretation.patternAnalysis.majorCount}</strong></span>
                    <span>Minor Arcana: <strong className="text-slate-200">{activeSession.interpretation.patternAnalysis.minorCount}</strong></span>
                    <span>Reversed: <strong className="text-purple-300">{activeSession.interpretation.patternAnalysis.reversedCount}</strong></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 max-w-sm">
                    {activeSession.interpretation.patternAnalysis.elementalBalance}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── CARD OF THE DAY MODAL ─── */}
      {showDailyModal && dailyDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-amber-400/50 bg-[#0c1020] p-6 text-center shadow-[0_0_50px_rgba(245,199,106,0.3)]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-4">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              DAILY COSMIC TAROT CARD
            </div>
            <div className="flex justify-center my-3">
              <TarotCardComponent
                card={dailyDraw.card}
                orientation={dailyDraw.orientation}
                positionLabel="CARD OF THE DAY"
                isFlipped={true}
                size="md"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-amber-200">{dailyDraw.card.name}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {dailyDraw.orientation === 'upright'
                  ? dailyDraw.card.upright.meaning
                  : dailyDraw.card.reversed.meaning}
              </p>
            </div>
            <button
              onClick={() => setShowDailyModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Close Daily Insight
            </button>
          </div>
        </div>
      )}

      {/* ─── JOURNAL MODAL ─── */}
      <TarotJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSelectReading={handleLoadFromJournal}
      />
    </div>
  );
};
