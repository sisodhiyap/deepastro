import React, { useState } from 'react';
import { X, Share2, Download, Check, Sparkles, Star } from 'lucide-react';
import { Logo } from '../brand/Logo.js';

interface CosmicStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  vibeScore: number;
  quote: string;
  userName: string;
  moonSign?: string;
  powerColor?: string;
  powerColorHex?: string;
  luckyNumbers?: number[];
  dimensions?: Array<{ label: string; score: number }>;
}

export const CosmicStoryCardModal: React.FC<CosmicStoryCardModalProps> = ({
  isOpen,
  onClose,
  vibeScore,
  quote,
  userName,
  moonSign = 'Chandra Rashi',
  powerColor = 'Royal Indigo',
  powerColorHex = '#6366F1',
  luckyNumbers = [3, 7, 9],
  dimensions = [],
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `🌌 DeepAstro Cosmic Snapshot for ${userName} (${new Date().toLocaleDateString()})
⚡ Daily Cosmic Vibe: ${vibeScore}%
🌙 Moon Sign: ${moonSign}
🎨 Power Color: ${powerColor}
🔢 Lucky Numbers: ${luckyNumbers.join(', ')}
✨ Daily Insight: ${quote}
Decode your cosmos at DeepAstro.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-cosmic-card border border-cosmic-border rounded-3xl p-6 shadow-2xl text-cosmic-text overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-cosmic-muted hover:text-white bg-cosmic-surface/60 border border-cosmic-border/50 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Card Itself (Styled for Story / Social Share) */}
        <div
          id="cosmic-story-card"
          className="relative rounded-2xl bg-gradient-to-b from-[#0f172a] via-[#050b14] to-[#020617] border border-cyan-500/30 p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5"
        >
          {/* Subtle starfield particles */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
            <Logo size="sm" showTagline={false} />
            <span className="text-[10px] font-mono text-cyan-400/90 tracking-widest uppercase">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* User & Vibe Score */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-bold text-cosmic-muted tracking-widest uppercase block">
                Cosmic Alignment
              </span>
              <h3 className="text-xl font-display font-extrabold text-white">{userName}</h3>
              <span className="text-xs text-cyan-300 font-medium">{moonSign} Moon</span>
            </div>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold font-display bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                {vibeScore}%
              </span>
              <span className="text-[10px] text-cosmic-muted block uppercase tracking-wider font-semibold">
                Daily Vibe
              </span>
            </div>
          </div>

          {/* Dimensions Bars */}
          {dimensions.length > 0 && (
            <div className="space-y-2 py-2 border-y border-white/10 relative z-10">
              {dimensions.slice(0, 4).map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="text-cosmic-muted text-[11px]">{d.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 w-6 text-right">{d.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quote */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 relative z-10">
            <p className="text-xs italic text-slate-200 leading-relaxed font-serif">
              {quote}
            </p>
          </div>

          {/* Lucky Matrix Badges */}
          <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-cosmic-muted block">Power Color</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white/40"
                  style={{ backgroundColor: powerColorHex }}
                />
                <span className="text-xs font-semibold text-white truncate">{powerColor}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-cosmic-muted block">Lucky Numbers</span>
              <span className="text-xs font-semibold text-cyan-300 mt-0.5 block font-mono">
                {luckyNumbers.join(' • ')}
              </span>
            </div>
          </div>

          {/* Card Footer Tag */}
          <div className="text-center pt-2 relative z-10">
            <span className="text-[10px] tracking-widest uppercase font-mono text-cosmic-muted/70">
              deepastro.com • deterministic jyotish intelligence
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 hover:opacity-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Share Snapshot'}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-cosmic-surface border border-cosmic-border text-xs font-bold text-cosmic-muted hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
