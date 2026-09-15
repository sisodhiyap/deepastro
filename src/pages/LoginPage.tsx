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
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Languages
} from 'lucide-react';
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
  
  // View modes: 'signin' | 'register' | 'forgot'
  const [viewMode, setViewMode] = useState<'signin' | 'register' | 'forgot'>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      const regRes = await register(fullName || 'Cosmic Seeker', email, password);
      setIsSubmitting(false);
      if (regRes.success && regRes.user) {
        onSuccess(regRes.user);
      } else {
        setErrorMessage(regRes.error || 'Registration failed.');
      }
      return;
    }

    // Standard sign in flow
    const loginRes = await login(
      email.trim(),
      password,
      'user',
      ''
    );
    setIsSubmitting(false);

    if (loginRes.success && loginRes.user) {
      onSuccess(loginRes.user);
    } else {
      setErrorMessage(loginRes.error || t('error.invalidCredentials') || 'Invalid credentials.');
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
      setErrorMessage(t('error.googleFailed') || 'Google sign-in could not be completed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col lg:flex-row select-none relative overflow-x-hidden font-sans">
      {/* ============================================================ */}
      {/* LEFT PANEL: Hero Cosmic Artwork Poster (~52% width on desktop)*/}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] min-h-[360px] sm:min-h-[480px] lg:min-h-screen bg-[#07090e] overflow-hidden flex items-center justify-center">
        {/* Crisp Poster Artwork with embedded branding and graphics */}
        <img
          src="/images/deepastro-cosmic-login.webp"
          alt="DeepAstro Cosmic Intelligence Artwork"
          className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-1000 scale-100 hover:scale-[1.02]"
          onError={(e: any) => {
            e.currentTarget.src = '/images/deepastro-cosmic-login.jpg';
          }}
        />

        {/* Subtle Right Edge Fade on Desktop to blend seamlessly into right panel */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent via-[#07090e]/40 to-[#07090e] pointer-events-none" />

        {/* Subtle Bottom Edge Fade on Mobile */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#07090e] pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Sleek Cosmic Sign-In Card (~48% width)         */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[48%] xl:w-[46%] min-h-screen bg-[#07090e] flex flex-col justify-between items-center px-6 sm:px-10 lg:px-12 py-6 sm:py-8 relative z-10">
        {/* Top Bar: Home Link, Language & Member Toggle */}
        <div className="w-full max-w-[440px] flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            {onNavigateLanding && (
              <button
                type="button"
                onClick={onNavigateLanding}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0d121c] border border-[#1e293b] text-[11px]">
              <Languages className="w-3 h-3 text-cyan-400 ml-1.5 mr-1" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded ${
                  language === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded ${
                  language === 'hi' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HI
              </button>
            </div>
          </div>

          {/* Top-Right: Not a member yet? Create Account */}
          <div className="text-right">
            {viewMode === 'signin' ? (
              <span className="text-slate-400 text-xs">
                Not a member yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline ml-0.5"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span className="text-slate-400 text-xs">
                Already a member?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline ml-0.5"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[440px] my-auto py-6">
          <div className="bg-[#0c101a]/95 border border-[#1a2333] rounded-[24px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(14,165,233,0.06)] backdrop-blur-xl">
            {/* Heading */}
            <div className="text-center sm:text-left mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {viewMode === 'signin' ? 'Welcome to DeepAstro' : viewMode === 'register' ? 'Create Your Account' : 'Reset Password'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                {viewMode === 'signin' 
                  ? 'Sign in to continue your cosmic journey' 
                  : viewMode === 'register' 
                  ? 'Join DeepAstro to reveal your cosmic destiny' 
                  : 'Enter your email to receive recovery instructions'}
              </p>
            </div>
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration: Full Name */}
              {viewMode === 'register' && (
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-[#080c14] border border-[#1a2333] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-[#080c14] border border-[#1a2333] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* Password Input */}
              {viewMode !== 'forgot' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full bg-[#080c14] border border-[#1a2333] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>


                  {/* Forgot Password Link */}
                  {viewMode === 'signin' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('forgot');
                          setErrorMessage(null);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-xs hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Submit Button: Gradient with Glow */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#7928ca] hover:brightness-110 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,198,255,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {viewMode === 'signin' ? 'Sign In' : viewMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider & Google Login (for User Access) */}
            {viewMode === 'signin' && (
              <div className="space-y-4 pt-3">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-[#1a2333]" />
                  <span className="text-[11px] font-mono text-slate-500 tracking-wider">OR</span>
                  <div className="h-[1px] flex-1 bg-[#1a2333]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-sm flex items-center justify-center gap-3 shadow-md transition-all hover:shadow-lg"
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
                  <span>Continue with Google</span>
                </button>
              </div>
            )}


          </div>
        </div>

        {/* Cosmic Footer */}
        <div className="w-full flex items-center justify-center gap-3 py-3 text-[10px] text-slate-500 font-mono tracking-widest uppercase select-none">
          <span className="w-8 h-[1px] bg-slate-800" />
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>THE UNIVERSE KNOWS YOU BETTER</span>
          <span className="w-8 h-[1px] bg-slate-800" />
        </div>
      </div>
    </div>
  );
};
