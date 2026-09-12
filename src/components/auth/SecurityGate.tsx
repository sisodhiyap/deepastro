import React, { useState } from 'react';
import { Shield, KeyRound, Lock, Sparkles, AlertCircle, ArrowRight, Languages } from 'lucide-react';
import { Logo } from '../brand/Logo.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface SecurityGateProps {
  onUnlock: () => void;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ onUnlock }) => {
  const { language, setLanguage, t } = useLanguage();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      // POST to server-side endpoint for real secret verification
      const res = await fetch('/api/security/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        // Store signed cryptographic authorization token, NOT the plain secret
        localStorage.setItem('deepastro_security_token', data.token);
        localStorage.setItem('deepastro_security_passed', 'true');
        onUnlock();
      } else {
        setError(data.error || t('security.error'));
      }
    } catch {
      // Secure offline notification without secret disclosure
      setError('Connection issue. Please ensure server is running and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06070A] flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#2A3441_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827]/80 border border-[#2A3441] backdrop-blur-md text-xs font-medium shadow-md">
          <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'hi'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Security Gate Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111827]/80 border border-[#2A3441] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl rounded-3xl p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo size="md" showTagline={false} />
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono tracking-wider uppercase mb-4 shadow-sm shadow-cyan-950">
          <Shield className="w-3.5 h-3.5" />
          <span>{t('security.badge')}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-display">
          {t('security.title')}
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {t('security.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative text-left">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>{t('security.codePrompt')}</span>
              <span className="text-cyan-400/80 font-sans text-[11px]">(Authorized Key Required)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError(null);
                }}
                placeholder={t('security.codePlaceholder')}
                autoFocus
                className="w-full bg-[#1A1F2B] border border-[#2A3441] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 text-left animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !accessCode.trim()}
            className="w-full mt-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Verifying Access...</span>
              </span>
            ) : (
              <>
                <span>{t('security.unlockBtn')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#2A3441]/60 text-[11px] text-slate-500 flex items-center justify-center gap-2 font-mono">
          <Lock className="w-3.5 h-3.5 text-slate-600" />
          <span>{t('security.disclaimer')}</span>
        </div>
      </div>
    </div>
  );
};
