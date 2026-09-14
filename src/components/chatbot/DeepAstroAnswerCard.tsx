import React, { useRef, useState } from 'react';
import { Sparkles, Download, Calendar, CheckCircle2, AlertTriangle, Flame, Binary, Maximize2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { DeepAstroAnswerCardSpec } from '../../../server/src/chatbot/AnswerCardTypes.js';
export type { DeepAstroAnswerCardSpec };

export interface DeepAstroAnswerCardProps {
  card: DeepAstroAnswerCardSpec;
  onAskDeepAstro?: () => void;
  onDownload?: (format: 'PNG' | 'JPG' | 'PDF') => void;
}

export const DeepAstroAnswerCard: React.FC<DeepAstroAnswerCardProps> = ({
  card,
  onAskDeepAstro,
  onDownload
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async (format: 'PNG' | 'JPG' | 'PDF') => {
    if (onDownload) {
      onDownload(format);
      return;
    }

    const element = cardRef.current;
    if (!element) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a101f',
        logging: false,
      });

      const filename = `${card.id || 'DeepAstro'}_Cosmic_Card`;

      if (format === 'PDF') {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
      } else {
        const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
        const imgData = canvas.toDataURL(mimeType, 0.95);
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `${filename}.${format.toLowerCase()}`;
        a.click();
      }
    } catch (err) {
      console.error('[DeepAstroAnswerCard] Export failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCardBody = (isInsideModal: boolean = false) => (
    <div
      ref={cardRef}
      id={`deepastro-answer-card-${card.id || 'main'}`}
      className={`w-full bg-[#0a101f] text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-cyan-500/20 space-y-4 relative overflow-hidden font-sans ${
        isInsideModal ? 'max-w-2xl mx-auto' : 'max-w-full'
      }`}
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-wide bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
              DeepAstro
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase">Ask • Explore • Align</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isInsideModal && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 transition-colors"
              title="Expand in proper window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 font-medium tracking-wider whitespace-nowrap">
            Cosmic Alignment
          </span>
        </div>
      </div>

      {/* Question */}
      {card.question && (
        <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-0.5">
            Your Question
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-100 italic break-words">
            &ldquo;{card.question}&rdquo;
          </p>
        </div>
      )}

      {/* Visual concept image & summary */}
      <div className="relative group space-y-3">
        {card.visualImageUrl && (
          <div className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-slate-800/80 relative">
            <img
              src={card.visualImageUrl}
              alt={card.visualConcept || 'Cosmic Insight'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f]/90 via-[#0a101f]/20 to-transparent" />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="break-words">{card.primaryHeader}</span>
            </h2>
            {card.momentumScore && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-base sm:text-lg font-bold text-cyan-300">
                  {card.momentumScore.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {card.momentumScore.label}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
            {card.summaryText}
          </p>
        </div>
      </div>

      {/* Signals & Window Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {card.keySignals && card.keySignals.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-sm space-y-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              ★ Key Signals
            </span>
            <div className="space-y-2">
              {card.keySignals.map((sig: { type: string; title: string; description: string }, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  {getSignalIcon(sig.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-200 leading-tight">{sig.title}</p>
                    <p className="text-[10px] text-slate-400 leading-normal break-words">{sig.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {card.favourableWindow && (
          <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" /> Favourable Window
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-100">{card.favourableWindow.windowLabel}</h3>
              <p className="text-[10px] text-slate-400 mt-1 break-words">{card.favourableWindow.description}</p>
            </div>
            {card.provenanceStatus && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Status</span>
                <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/50 text-emerald-300 font-medium">
                  {card.provenanceStatus}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DeepAstro Tip */}
      {card.deepAstroTip && (
        <div className="bg-gradient-to-r from-violet-950/60 to-slate-900/60 border border-violet-500/30 p-3 rounded-2xl backdrop-blur-sm">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-violet-300 flex items-center gap-1.5 mb-0.5">
            ❤ DeepAstro Tip
          </span>
          <p className="text-xs sm:text-sm font-medium text-violet-100 italic break-words">
            &ldquo;{card.deepAstroTip}&rdquo;
          </p>
        </div>
      )}

      {/* Suggested Actions & Lucky Associations */}
      {(card.luckyAssociations || card.suggestedActions) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {card.luckyAssociations?.luckyNumber && (
            <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-violet-900/80 border border-violet-500/40 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-violet-200">
                  {card.luckyAssociations.luckyNumber.value}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-400 block">
                  Lucky Number
                </span>
                <p className="text-[10px] text-slate-300 truncate">
                  {card.luckyAssociations.luckyNumber?.note || 'Cosmic alignment'}
                </p>
              </div>
            </div>
          )}

          {card.suggestedActions && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-2xl">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-400 block mb-1">
                Suggested Actions
              </span>
              <div className="space-y-1">
                {card.suggestedActions.slice(0, 2).map((act, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action and Download Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDownload('PNG')}
            disabled={isDownloading}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all disabled:opacity-50"
            title="Download high-resolution PNG card"
          >
            <Download className="w-3 h-3 text-cyan-400" /> PNG
          </button>
          <button
            onClick={() => handleDownload('JPG')}
            disabled={isDownloading}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all disabled:opacity-50"
            title="Download high-resolution JPG card"
          >
            <Download className="w-3 h-3 text-emerald-400" /> JPG
          </button>
          <button
            onClick={() => handleDownload('PDF')}
            disabled={isDownloading}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all disabled:opacity-50"
            title="Download high-resolution PDF card"
          >
            <Download className="w-3 h-3 text-violet-400" /> PDF
          </button>
        </div>

        {onAskDeepAstro && (
          <button
            onClick={onAskDeepAstro}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explore Further
          </button>
        )}
      </div>

      {/* Sources Footer */}
      {card.sourcesFooter && (
        <div className="pt-2 flex items-center justify-between text-[9px] text-slate-500">
          <span className="truncate">{card.sourcesFooter.sources?.join(' • ') || 'DeepAstro Vedic Engine'}</span>
          <span>{card.sourcesFooter.updatedAt || 'Realtime Verified'}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {renderCardBody(false)}

      {/* Proper Modal Window for perfect layout and zero overflow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0a101f] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100 font-satoshi">
                  Cosmic Insight Full Window
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderCardBody(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default DeepAstroAnswerCard;
