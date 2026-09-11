import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, token: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' ? { email, password, fullName } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Authentication failed.');
      }

      setSuccess(mode === 'register' ? 'Account created successfully!' : 'Cosmic welcome back!');
      if (data.token) {
        localStorage.setItem('deepastro_token', data.token);
      }
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl border border-cosmic-border bg-cosmic-surface shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-xl text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-card/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            {mode === 'register' ? 'Sovereign Account Creation' : 'Secure Cosmic Session'}
          </div>
          <h2 className="text-2xl font-display font-extrabold text-cosmic-text">
            {mode === 'register' ? 'Join DeepAstro' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-cosmic-muted">
            {mode === 'register'
              ? 'Create your personalized identity to calculate, persist, and verify your horoscope.'
              : 'Sign in to access your birth profiles, dossiers, and cosmic predictions.'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-cosmic-muted font-semibold block">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-cosmic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl pl-10 pr-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-cosmic-muted font-semibold block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cosmic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="seeker@deepastro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl pl-10 pr-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-cosmic-muted font-semibold block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cosmic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl pl-10 pr-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan disabled:opacity-50 mt-2"
          >
            {isLoading
              ? 'Authenticating Celestial Identity...'
              : mode === 'register'
              ? 'Create Cosmic Profile'
              : 'Sign In to DeepAstro'}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center pt-2 border-t border-cosmic-border/60 text-xs text-cosmic-muted">
          {mode === 'register' ? (
            <span>
              Already have a celestial profile?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
