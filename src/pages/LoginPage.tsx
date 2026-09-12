import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  KeyRound, 
  AlertCircle,
  Compass,
  Brain,
  Layers,
  Cpu,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { Logo } from '../components/brand/Logo.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  onSuccess: (user: any) => void;
  onNavigateLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateLanding }) => {
  const { language, setLanguage, t } = useLanguage();
  const { login, register, loginWithGoogle } = useAuth();
  
  // Access mode: user vs admin
  const [accessType, setAccessType] = useState<'user' | 'admin'>('user');
  
  // View modes: 'signin' | 'register' | 'forgot'
  const [viewMode, setViewMode] = useState<'signin' | 'register' | 'forgot'>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (viewMode === 'forgot') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage('If an account exists for this email, you will receive password reset instructions.');
      }, 650);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (viewMode === 'register') {
      // Public Registration: only allowed for standard USER accounts
      const regRes = await register(fullName || 'Cosmic Seeker', email, password);
      setIsSubmitting(false);
      if (regRes.success && regRes.user) {
        onSuccess(regRes.user);
      } else {
        setErrorMessage(regRes.error || 'Registration failed.');
      }
      return;
    }

    // Sign in flow with server-side role validation
    const loginRes = await login(email, password, accessType);
    setIsSubmitting(false);

    if (loginRes.success && loginRes.user) {
      onSuccess(loginRes.user);
    } else {
      setErrorMessage(loginRes.error || t('error.invalidCredentials'));
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const googleRes = await loginWithGoogle();
    setIsSubmitting(false);

    if (googleRes.success && googleRes.user) {
      onSuccess(googleRes.user);
    } else {
      setErrorMessage(t('error.googleFailed'));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06070A] text-slate-100 flex flex-col lg:flex-row select-none relative overflow-x-hidden font-sans">
      {/* Top Header Controls (Language switch + Back to portal) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
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

        {onNavigateLanding && (
          <button
            onClick={onNavigateLanding}
            className="px-3 py-1.5 rounded-xl bg-[#111827]/80 border border-[#2A3441] text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Portal Home
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* LEFT PANEL: 55% Cinematic Hero Cosmic Artwork Experience    */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[55%] min-h-[460px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-slate-950">
        {/* Background Artwork Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/deepastro-cosmic-login.webp"
            alt="DeepAstro Cosmic Intelligence Artwork"
            className="w-full h-full object-cover object-center lg:object-left filter brightness-95 contrast-105 transition-transform duration-1000 scale-100 hover:scale-105"
            onError={(e: any) => {
              e.currentTarget.src = '/images/deepastro-cosmic-login.jpg';
            }}
          />
          {/* Gradients to merge seamlessly into dark UI */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-transparent to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#06070A] hidden lg:block" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <Logo size="md" showTagline={false} />
            <p className="text-[10px] tracking-[0.25em] text-cyan-300/80 uppercase font-mono mt-1.5 font-bold">
              {t('hero.tagline')}
            </p>
          </div>

          {/* Inspirational Editorial Quote */}
          <div className="hidden sm:block max-w-xs text-right text-slate-300/90 pr-2 pt-1 font-serif italic text-xs leading-relaxed drop-shadow-md">
            <div>{t('hero.quote')}</div>
            <div className="text-[10px] text-cyan-400/90 uppercase tracking-widest font-mono mt-1 not-italic font-bold">
              {t('hero.author')}
            </div>
          </div>
        </div>

        {/* Center / Mid Alignment Editorial Copy */}
        <div className="relative z-10 my-auto py-8">
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {t('hero.align')}
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 font-display drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {t('hero.understand')}
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {t('hero.evolve')}
            </h2>
          </div>

          <div className="mt-5 space-y-1 font-mono text-xs uppercase tracking-[0.25em] text-cyan-200/90 drop-shadow">
            <div>{t('hero.subtext1')}</div>
            <div>{t('hero.subtext2')}</div>
            <div>{t('hero.subtext3')}</div>
          </div>
        </div>

        {/* Bottom Feature Capabilities Strip */}
        <div className="relative z-10 pt-4 border-t border-slate-700/50 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="p-2 rounded-lg bg-[#111827]/70 border border-slate-700 text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              {t('hero.feature1')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="p-2 rounded-lg bg-[#111827]/70 border border-slate-700 text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              {t('hero.feature2')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="p-2 rounded-lg bg-[#111827]/70 border border-slate-700 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              {t('hero.feature3')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="p-2 rounded-lg bg-[#111827]/70 border border-slate-700 text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              {t('hero.feature4')}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: 45% Refined Dark Glassmorphic Authentication Card */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 lg:p-12 z-10">
        <div className="w-full max-w-md bg-[#111827]/70 border border-slate-800/80 rounded-[24px] p-7 sm:p-8 backdrop-blur-[24px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-6">
          
          {/* Header Title & Subtitle */}
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                {accessType === 'admin' ? t('auth.adminPortal') : t('auth.welcome')}
              </h1>
              {accessType === 'admin' && (
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                  PRIVILEGED
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {accessType === 'admin' ? t('auth.adminSubtitle') : t('auth.signinToContinue')}
            </p>
          </div>

          {/* Access Switcher: [ User Access ] [ Admin Access ] */}
          <div className="p-1 rounded-2xl bg-[#06070A]/80 border border-[#2A3441] grid grid-cols-2 gap-1 relative">
            <button
              type="button"
              onClick={() => {
                setAccessType('user');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                accessType === 'user'
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('auth.userAccess')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccessType('admin');
                setViewMode('signin'); // Admins cannot freely register
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                accessType === 'admin'
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t('auth.adminAccess')}</span>
            </button>
          </div>

          {/* Inline Alert / Success Notification */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {viewMode === 'register' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-[#1A1F2B] border border-[#2A3441] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={accessType === 'admin' ? t('auth.adminIdPlaceholder') : t('auth.emailPlaceholder')}
                  required
                  className="w-full bg-[#1A1F2B] border border-[#2A3441] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {viewMode !== 'forgot' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    className="w-full bg-[#1A1F2B] border border-[#2A3441] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password Row */}
            {viewMode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#2A3441] bg-[#1A1F2B] text-cyan-500 focus:ring-cyan-500/40"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>{t('auth.signingIn')}</span>
                </span>
              ) : (
                <>
                  <span>
                    {viewMode === 'signin'
                      ? t('auth.signIn')
                      : viewMode === 'register'
                      ? 'Complete Registration →'
                      : t('auth.sendResetLink')}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider & Google Login (For standard User Access) */}
          {accessType === 'user' && viewMode === 'signin' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-[#2A3441]" />
                <span className="text-[11px] font-mono text-slate-500 tracking-wider">
                  {t('auth.or')}
                </span>
                <div className="h-[1px] flex-1 bg-[#2A3441]" />
              </div>

              {/* Genuine Google Authentication Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition-all hover:shadow-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('auth.continueWithGoogle')}</span>
              </button>
            </div>
          )}

          {/* Registration / Back to Login Switcher (Available for standard User Access only) */}
          {accessType === 'user' && (
            <div className="pt-2 text-center text-xs text-slate-400">
              {viewMode === 'signin' ? (
                <div>
                  <span>{t('auth.notMember')} </span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('register');
                      setErrorMessage(null);
                    }}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    {t('auth.createAccount')}
                  </button>
                </div>
              ) : (
                <div>
                  <span>{t('auth.alreadyMember')} </span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('signin');
                      setErrorMessage(null);
                    }}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    {t('auth.backToSignIn')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin Mode Note */}
          {accessType === 'admin' && (
            <div className="pt-1 text-center text-[11px] text-slate-500 font-mono">
              Administrative credentials are authenticated directly against database records.
            </div>
          )}

          {/* Cosmic Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            <span className="w-4 h-[1px] bg-slate-700" />
            <Sparkles className="w-3 h-3 text-cyan-500/80" />
            <span>{t('auth.footerUniverse')}</span>
            <span className="w-4 h-[1px] bg-slate-700" />
          </div>

        </div>
      </div>
    </div>
  );
};
