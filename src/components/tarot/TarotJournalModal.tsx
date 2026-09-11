import React, { useState } from 'react';
import { TarotSavedReading } from '../../types/tarot.js';
import {
  getTarotReadings,
  deleteTarotReading,
  toggleFavoriteTarotReading,
  addNoteToTarotReading,
} from '../../services/tarotEngine.js';
import { TAROT_DECK } from '../../data/tarotDeck.js';
import { X, Trash2, Star, BookOpen, Calendar, Compass, Sparkles, MessageSquare, Save } from 'lucide-react';

interface TarotJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReading?: (reading: TarotSavedReading) => void;
}

export const TarotJournalModal: React.FC<TarotJournalModalProps> = ({
  isOpen,
  onClose,
  onSelectReading,
}) => {
  const [readings, setReadings] = useState<TarotSavedReading[]>(() => getTarotReadings());
  const [activeNoteSessionId, setActiveNoteSessionId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [filterFav, setFilterFav] = useState<boolean>(false);

  if (!isOpen) return null;

  const refreshList = () => {
    setReadings(getTarotReadings());
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTarotReading(sessionId);
    refreshList();
  };

  const handleToggleFav = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteTarotReading(sessionId);
    refreshList();
  };

  const handleSaveNote = (sessionId: string) => {
    addNoteToTarotReading(sessionId, noteText);
    setActiveNoteSessionId(null);
    setNoteText('');
    refreshList();
  };

  const displayedReadings = filterFav
    ? readings.filter((r) => r.isFavorite)
    : readings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-[#0c101d] text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-amber-200">My Tarot Destiny Journal</h2>
              <p className="text-xs text-slate-400">Chronological cosmic consultations & card reflections</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterFav(!filterFav)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                filterFav
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFav ? 'fill-amber-400 text-amber-400' : ''}`} />
              Favorites ({readings.filter((r) => r.isFavorite).length})
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Readings */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {displayedReadings.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40 text-amber-400" />
              <p className="text-sm font-medium">No recorded Tarot sessions yet.</p>
              <p className="text-xs mt-1">Shuffle to Destiny and save your insights into your personal journal.</p>
            </div>
          ) : (
            displayedReadings.map((reading) => {
              const dateStr = new Date(reading.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={reading.sessionId}
                  onClick={() => onSelectReading && onSelectReading(reading)}
                  className="p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        {reading.questionCategory || reading.question}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleFav(reading.sessionId, e)}
                        className={`p-1.5 rounded hover:bg-slate-800 ${
                          reading.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Favorite"
                      >
                        <Star className={`w-4 h-4 ${reading.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(reading.sessionId, e)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Drawn Cards Preview */}
                  <div className="grid grid-cols-3 gap-2 my-2">
                    {reading.cards.map((c) => {
                      const cardMeta = TAROT_DECK.find((cd) => cd.id === c.cardId);
                      return (
                        <div
                          key={c.position}
                          className="p-2 rounded-lg bg-[#070913] border border-slate-800/80 flex flex-col items-center text-center"
                        >
                          <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400">
                            {c.position}
                          </span>
                          <span className="text-xs font-bold text-amber-300 truncate w-full mt-0.5">
                            {cardMeta?.name || c.cardId}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 rounded mt-1 ${
                              c.orientation === 'reversed'
                                ? 'bg-purple-950/60 text-purple-300'
                                : 'bg-amber-950/40 text-amber-300'
                            }`}
                          >
                            {c.orientation}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interpretation Snapshot */}
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                    {reading.interpretation.narrativeStory}
                  </p>

                  {/* Note Section */}
                  {reading.userNote && (
                    <div className="mt-2.5 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="italic">{reading.userNote}</span>
                    </div>
                  )}

                  {/* Add Note Button / Input */}
                  {activeNoteSessionId === reading.sessionId ? (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Add personal reflection note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleSaveNote(reading.sessionId)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        onClick={() => setActiveNoteSessionId(null)}
                        className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNoteSessionId(reading.sessionId);
                          setNoteText(reading.userNote || '');
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 font-medium"
                      >
                        {reading.userNote ? 'Edit Note' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
