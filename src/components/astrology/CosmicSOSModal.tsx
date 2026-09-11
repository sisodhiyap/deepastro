import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Heart, Wind, Sparkles, CheckCircle2, Volume2, RefreshCw } from 'lucide-react';

interface CosmicSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartContext?: any;
}

export const CosmicSOSModal: React.FC<CosmicSOSModalProps> = ({ isOpen, onClose, chartContext }) => {
  const [activeTab, setActiveTab] = useState<'calm' | 'diagnosis' | 'remedy'>('calm');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Guided 4-7-8 Breathing Loop
  useEffect(() => {
    if (!isOpen) return;

    let timer: any;
    if (breathPhase === 'Inhale') {
      if (breathCount > 1) {
        timer = setTimeout(() => setBreathCount((c) => c - 1), 1000);
      } else {
        setBreathPhase('Hold');
        setBreathCount(7);
      }
    } else if (breathPhase === 'Hold') {
      if (breathCount > 1) {
        timer = setTimeout(() => setBreathCount((c) => c - 1), 1000);
      } else {
        setBreathPhase('Exhale');
        setBreathCount(8);
      }
    } else if (breathPhase === 'Exhale') {
      if (breathCount > 1) {
        timer = setTimeout(() => setBreathCount((c) => c - 1), 1000);
      } else {
        setCyclesCompleted((c) => c + 1);
        setBreathPhase('Inhale');
        setBreathCount(4);
      }
    }

    return () => clearTimeout(timer);
  }, [isOpen, breathPhase, breathCount]);

  if (!isOpen) return null;

  const moonSign = chartContext?.moonSign?.signName || 'Chandra';
  const dashaLord = chartContext?.dashas?.currentMahadasha?.planet || 'Karmic Ruler';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-cosmic-card via-cosmic-surface to-[#0a0f1d] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/40 text-cosmic-text overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cosmic-border pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white">
                  Cosmic SOS First Aid
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                  Instant Calm
                </span>
              </div>
              <p className="text-xs text-cosmic-muted">
                Immediate planetary stabilization, guided breathwork, and Vedic pacification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cosmic-muted hover:text-white hover:bg-cosmic-border/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-b border-cosmic-border/50 pb-3 relative z-10">
          <button
            onClick={() => setActiveTab('calm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calm'
                ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold shadow-md'
                : 'text-cosmic-muted hover:text-white bg-cosmic-surface/60'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            4-7-8 Breathwork
          </button>
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'diagnosis'
                ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold shadow-md'
                : 'text-cosmic-muted hover:text-white bg-cosmic-surface/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Planetary Diagnostic
          </button>
          <button
            onClick={() => setActiveTab('remedy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'remedy'
                ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold shadow-md'
                : 'text-cosmic-muted hover:text-white bg-cosmic-surface/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Instant Remedies
          </button>
        </div>

        {/* Tab 1: 4-7-8 Breathwork */}
        {activeTab === 'calm' && (
          <div className="py-6 flex flex-col items-center text-center space-y-6 relative z-10 animate-fadeIn">
            <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 border-cyan-400 bg-cyan-500/10'
                    : breathPhase === 'Hold'
                    ? 'scale-105 border-amber-400 bg-amber-500/10'
                    : 'scale-90 border-red-400/80 bg-red-500/10'
                }`}
              />

              {/* Center counter circle */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-cosmic-card border border-cosmic-border flex flex-col items-center justify-center shadow-inner space-y-1">
                <span className="text-xs font-bold tracking-wider text-cosmic-muted uppercase">
                  {breathPhase}
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-white">
                  {breathCount}
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  Cycle {cyclesCompleted + 1}
                </span>
              </div>
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-white">
                {breathPhase === 'Inhale' && 'Slowly inhale through your nose into your belly...'}
                {breathPhase === 'Hold' && 'Gently hold your breath in calm stillness...'}
                {breathPhase === 'Exhale' && 'Exhale completely with an open sigh, releasing all tension...'}
              </h3>
              <p className="text-xs text-cosmic-muted">
                The 4-7-8 harmonic rhythm immediately calms the vagus nerve and aligns with lunar prana.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmic-surface/80 border border-cosmic-border flex items-center gap-3 text-left w-full">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-cyan-300 block">Vedic Calming Beej Sound:</span>
                <span className="font-mono text-cosmic-text">"OM SHAM SHANAISHCHARAYA NAMAH" • "OM SOM SOMAYA NAMAH"</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Planetary Diagnostic */}
        {activeTab === 'diagnosis' && (
          <div className="py-6 space-y-4 relative z-10 animate-fadeIn text-sm">
            <div className="p-4 rounded-2xl bg-cosmic-surface/70 border border-cosmic-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Why You Feel Agitated or Overwhelmed Right Now
                </span>
                <span className="text-[10px] font-bold text-cosmic-muted">Real-Time Astrological Anchor</span>
              </div>
              <p className="text-xs sm:text-sm text-cosmic-text leading-relaxed">
                When sudden panic or emotional turbulence arises, it is rarely random. In classical Jyotish, acute stress is triggered when transiting Grahas (such as Mars or Saturn) cast an aspect on your natal <strong>{moonSign} Moon</strong> or your <strong>8th/12th house</strong> of subconscious processing, especially under the active rulership of your <strong>{dashaLord}</strong> dasha.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-cosmic-surface/40 border border-cosmic-border">
                <span className="text-[11px] font-bold text-amber-300 block mb-1">Cosmic Truth:</span>
                <p className="text-xs text-cosmic-muted">
                  The discomfort you feel is emotional contraction, not a true emergency. Your nervous system is reacting to planetary turbulence.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cosmic-surface/40 border border-cosmic-border">
                <span className="text-[11px] font-bold text-cyan-300 block mb-1">Golden Directive:</span>
                <p className="text-xs text-cosmic-muted">
                  Do NOT make irreversible decisions, send emotional texts, or initiate confrontations while in this transit window.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Instant Remedies */}
        {activeTab === 'remedy' && (
          <div className="py-6 space-y-3 relative z-10 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-cosmic-surface/80 border border-cosmic-border flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">1. Drink a Full Glass of Cold Water</strong>
                <p className="text-cosmic-muted">
                  Water is ruled by Chandra (the Moon). Slowly sipping cold water physically resets heart-rate variability and grounds overheated Mars fire.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmic-surface/80 border border-cosmic-border flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">2. 60 Seconds of Barefoot Earthing</strong>
                <p className="text-cosmic-muted">
                  Step onto natural earth, stone, or a cool floor barefoot. Connect with Prithvi Tattva (Earth element) to discharge mental static.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmic-surface/80 border border-cosmic-border flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">3. Sound Frequency Shielding</strong>
                <p className="text-cosmic-muted">
                  Chant "OM" aloud 7 times, feeling the vibration in your solar plexus and crown. It neutralizes negative thought loops instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-cosmic-border/60 flex items-center justify-between text-xs text-cosmic-muted relative z-10">
          <span>You are safe. This transit is temporary and transformative.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold hover:opacity-95 transition-opacity"
          >
            I Feel Grounded
          </button>
        </div>
      </div>
    </div>
  );
};
