import React from 'react';
import { Sparkles, Download, Calendar, CheckCircle2, AlertTriangle, Flame, Binary } from 'lucide-react';
import type { DeepAstroAnswerCardSpec } from '../../../server/src/chatbot/AnswerCardTypes.js';
export type { DeepAstroAnswerCardSpec };

export interface DeepAstroAnswerCardProps {
  card: DeepAstroAnswerCardSpec;
  onAskDeepAstro?: () => void;
  onDownload?: (format: 'PNG' | 'WebP' | 'PDF') => void;
}

export const DeepAstroAnswerCard: React.FC<DeepAstroAnswerCardProps> = ({
  card,
  onAskDeepAstro,
  onDownload
}) => {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'growth':
        return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      case 'caution':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'milestone':
        return <Flame className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />;
      default:
        return <Binary className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
    }
  };
  const handleDownload = (format: 'PNG' | 'WebP' | 'PDF') => {
    if (onDownload) {
      onDownload(format);
      return;
    }
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.id}_DeepAstro_Card.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="deepastro-answer-card"
      className="max-w-[480px] mx-auto bg-[#0a101f] text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/20 space-y-5 relative overflow-hidden font-sans"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
              DeepAstro
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">Ask • Explore • Align</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 font-medium tracking-wider">
            Your Universe Answers Here
          </span>
        </div>
      </div>
      <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
        <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-slate-400 block mb-1">
          Your Question
        </span>
        <p className="text-sm font-medium text-slate-100 italic">
          &ldquo;{card.question}&rdquo;
        </p>
      </div>

      <div className="relative group">
        <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-800/80 relative">
          <img
            src={card.visualImageUrl}
            alt={card.visualConcept}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f]/90 via-[#0a101f]/20 to-transparent" />
        </div>

        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {card.primaryHeader}
            </h2>
            {card.momentumScore &&
              <div className="flex items-center gap-2">
                <span className="text-lg heading-font font-bold text-cyan-300">
                  {card.momentumScore.percentage}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {card.momentumScore.label}
                </span>
              </div>
            }
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {card.summaryText}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-sm">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 flex items-center gap-1.5 mb-2">
            ★ Key Signals
          </span>
          <div className="space-y-2.5">
            {card.keySignals.map((sig: { type: string; title: string; description: string }, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                {getSignalIcon(sig.type)}
                <div>
                  <p className="text-[12px] font-semibold text-slate-200">{sig.title}</p>
                  <p className="text-[11px] text-slate-400">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {card.favourableWindow && (
          <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Favourable Window
              </span>
              <h3 className="text-sm font-bold text-slate-100">{card.favourableWindow.windowLabel}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{card.favourableWindow.description}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Status</span>
              <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/50 text-emerald-300 font-medium">
                {card.provenanceStatus}
              </span>
            </div>
          </div>
        )}
      </div>
      {card.deepAstroTip && (
        <div className="bg-gradient-to-r from-violet-950/60 to-slate-900/60 border border-violet-500/30 p-3.5 rounded-2xl backdrop-blur-sm">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-violet-300 flex items-center gap-1.5 mb-1">
            ❤ DeepAstro Tip
          </span>
          <p className="text-sm font-medium text-violet-100 italic">
            &ldquo;{card.deepAstroTip}&rdquo;
          </p>
        </div>
      )}

      {(card.luckyAssociations || card.suggestedActions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {card.luckyAssociations?.luckyNumber && (
            <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-violet-900/80 border border-violet-500/40 flex items-center justify-center shrink-0">
                <span className="text-lg heading-font font-bold text-violet-200">
                  {card.luckyAssociations.luckyNumber.value}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block">
                  Lucky Number
                </span>
                <p className="text-[11px] text-slate-300">
                  {card.luckyAssociations.luckyNumber?.note || 'Cosmic alignment'}
                </p>
              </div>
            </div>
          )}

          {card.suggestedActions && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-1">
                Suggested Actions
              </span>
              <div className="space-y-1">
                {card.suggestedActions.slice(0, 2).map((act, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('PNG')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> PNG

          </button>
          <button
            onClick={() => handleDownload('PDF')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" /> PDF
          </button>
        </div>

        <button
          onClick={onAskDeepAstro}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          ✅ Ask DeepAstro
        </button>
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span>{card.sourcesFooter.sources.join(' ‪ ')}</span>
        <span>{card.sourcesFooter.updatedAt}</span>
      </div>
    </div>
  );
};

export default DeepAstroAnswerCard;
