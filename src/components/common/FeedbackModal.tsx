import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: string;
  calculationFingerprint?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultModule = 'General',
  calculationFingerprint,
}) => {
  const { token } = useAuth();
  const [moduleName, setModuleName] = useState(defaultModule);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModuleName(defaultModule);
      setSuccess(false);
      setError(null);
      setMessage('');
      setRating(5);
    }
  }, [isOpen, defaultModule]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setError('Please provide at least a short description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          module: moduleName,
          category,
          message: message.trim(),
          rating,
          calculationFingerprint,
          appVersion: '7.4.0',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'calculation_issue', label: 'Calculation Observation' },
    { id: 'incorrect_birth_data', label: 'Birth Data Question' },
    { id: 'ui_problem', label: 'UI Display Issue' },
    { id: 'layout_issue', label: 'Layout / Responsiveness' },
    { id: 'confusing_result', label: 'Result Interpretation' },
    { id: 'missing_feature', label: 'Feature Request' },
    { id: 'performance_issue', label: 'Performance / Speed' },
    { id: 'general', label: 'General Experience' },
  ];

  const modules = [
    'Past Life / SoulTrace',
    'Future Intelligence / CFIE',
    'Kundli & D1 Chart',
    'KP Astrology',
    'Varga Harmonincs (D9/D60)',
    'Vimshottari Dasha',
    'Transits & Gochara',
    'Tarot Destiny',
    'Cosmic Hub & Sky',
    'General',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#111827] border border-cyan-500/30 text-slate-100 p-4 sm:p-6 shadow-2xl shadow-cyan-950/40 my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h2 id="feedback-title" className="text-base font-bold text-slate-100 font-satoshi truncate">
                Share Platform Feedback
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Help us refine calculations, UI precision, and user experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Feedback Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors touch-target-min flex items-center justify-center shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
            <div className="text-base font-bold text-cyan-300">Feedback Recorded</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Thank you for contributing to DeepAstro's high-precision cosmic intelligence engine.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Module
                </label>
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1A1F2B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-slate-400 ml-2">{rating} / 5</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                Observations & Details
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your calculation observation, layout question, or suggestions..."
                rows={4}
                required
                className="w-full bg-[#1A1F2B] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>Phase 16 Telemetry • Feedback never mutates core algorithms</span>
                <span>{message.length} / 2000</span>
              </div>
            </div>

            {calculationFingerprint && (
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 break-all">
                Attached Fingerprint: {calculationFingerprint.slice(0, 24)}...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
