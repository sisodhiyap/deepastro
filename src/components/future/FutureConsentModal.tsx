import React, { useState } from 'react';
import { ShieldAlert, Sparkles, X, ArrowRight } from 'lucide-react';

interface FutureConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (level: number) => void;
  currentLevel?: number;
}

export const FutureConsentModal: React.FC<FutureConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  currentLevel = 1,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(Math.max(currentLevel, 1));

  if (!isOpen) return null;

  const levels = [
    { level: 1, title: 'LEVEL 1: General Themes', desc: 'Overarching themes, dominant planetary periods and general guidance.' },
    { level: 2, title: 'LEVEL 2: Year-wise Forecast', desc: '10-year annual projections across major life sectors.' },
    { level: 3, title: 'LEVEL 3: Month-wise Forecast', desc: '12-month calendar breakdowns with high-potential timing windows.' },
    { level: 4, title: 'LEVEL 4: Life Domain Deep-Dives', desc: 'Detailed analysis of Career, Business, Relationships, and Finance.' },
    { level: 5, title: 'LEVEL 5: Sensitive Timing Analysis', desc: 'Critical transition windows and periods requiring heightened awareness.' },
    { level: 6, title: 'LEVEL 6: Longevity & Wellbeing', desc: 'Traditional vitality and self-care indicators (Non-medical).' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-satoshi tracking-wide">
              Explicit Future Forecast Consent
            </h3>
            <p className="text-xs text-slate-400">
              Ethical Epistemic & Psychological Safeguard
            </p>
          </div>
        </div>

        <div className="bg-[#1A1F2B] border border-slate-700/60 rounded-xl p-4 mb-6 text-sm text-slate-300 leading-relaxed">
          <p className="mb-3">
            DeepAstro can generate a detailed traditional future forecast using your chart, numerology and other supported systems. Some interpretations may discuss challenging periods or major life transitions.
          </p>
          <p className="text-xs text-cyan-300/90 font-mono">
            Would you like to reveal the detailed forecast?
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Authorized Forecast Depth
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {levels.map((lvl) => (
              <button
                key={lvl.level}
                type="button"
                onClick={() => setSelectedLevel(lvl.level)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedLevel === lvl.level
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                    : 'bg-[#1A1F2B]/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs tracking-wide mb-1">{lvl.title}</div>
                <div className="text-[11px] opacity-80 line-clamp-2">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 mb-6 text-[11px] text-amber-200/90 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Epistemic Notice:</strong> Traditional astrological indicators describe symbolic tendencies and timing potentials. They are never deterministic facts or medical diagnoses.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all"
          >
            NOT NOW
          </button>
          <button
            onClick={() => onConsent(selectedLevel)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>REVEAL MY FUTURE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
