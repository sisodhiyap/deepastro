import React from 'react';
import {
  Sparkles,
  Compass,
  Sun,
  Heart,
  Hash,
  Hand,
  Flame,
  Users,
  Bot,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Lock,
} from 'lucide-react';
import { Logo } from '../components/brand/Logo.js';
import { NavTabId } from '../components/layout/Sidebar.js';

interface LandingPageProps {
  onNavigate: (tab: NavTabId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const services = [
    {
      id: 'kundli' as NavTabId,
      title: 'Vedic Kundli & Vargas',
      desc: 'High-precision sidereal calculations for D1 Rashi, D9 Navamsa, D10 Dashamsha, and 12 Bhavas using Lahiri Ayanamsha.',
      icon: Sparkles,
      color: 'from-cyan-500/20 to-indigo-500/10 border-cyan-500/30',
      cta: 'Generate Kundli',
    },
    {
      id: 'predictions' as NavTabId,
      title: 'Daily Cosmic Weather',
      desc: 'Personalized transits mapped to your natal Moon and Ascendant across Career, Finance, Love, and Health.',
      icon: Sun,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      cta: 'View Horoscope',
    },
    {
      id: 'matching' as NavTabId,
      title: 'Kundli Matching (36 Pts)',
      desc: 'Ashtakoota Milan analyzing Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi, and Manglik equilibrium.',
      icon: Heart,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
      cta: 'Match Horoscopes',
    },
    {
      id: 'numerology' as NavTabId,
      title: 'Numerology Vibrations',
      desc: 'Chaldean & Pythagorean calculations for Life Path, Destiny, Soul Urge, and Personal Year vibrational cycles.',
      icon: Hash,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      cta: 'Calculate Numbers',
    },
    {
      id: 'palmistry' as NavTabId,
      title: 'Palmistry Vision AI',
      desc: 'Upload clear palm photos for structured traditional analysis of Heart, Head, Life, Fate lines, and major mounts.',
      icon: Hand,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      cta: 'Scan Palm Photo',
    },
    {
      id: 'lalkitab' as NavTabId,
      title: 'Lal Kitab & Remedies',
      desc: 'Authentic 1952 remedial traditions, planetary debts, charity measures, and lifestyle modifications.',
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/10 border-orange-500/30',
      cta: 'Explore Remedies',
    },
    {
      id: 'astrologers' as NavTabId,
      title: 'Certified Gurus & Astrologers',
      desc: 'Elite Parashari, KP, and Vastu masters with verified credentials and direct call/chat consultations.',
      icon: Users,
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
      cta: 'Meet Astrologers',
    },
    {
      id: 'reports' as NavTabId,
      title: 'Executive PDF Reports',
      desc: 'Bespoke downloadable Kundli and transit dossiers with deep tabular breakdowns and traditional scripture grounding.',
      icon: FileText,
      color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30',
      cta: 'Download Reports',
    },
  ];

  return (
    <div className="space-y-16 py-4 w-full">
      {/* Hero Section */}
      <section className="relative space-y-6 pt-4 pb-8 overflow-hidden w-full text-left">
        {/* Atmospheric ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cosmic-card/60 backdrop-blur-md shadow-glow-cyan/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-cosmic-text uppercase">
            The Modern Vedic Operating System
          </span>
        </div>

        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-cosmic-text leading-[1.1]">
            Your Cosmos Has a Story.{' '}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400">
              DeepAstro Helps You Read It.
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-cosmic-muted max-w-2xl font-normal leading-relaxed">
            Ancient Vedic wisdom, precise planetary calculations, and modern AI intelligence—united in one personal cosmic experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('kundli')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-glow-cyan flex items-center justify-center gap-2"
          >
            <span>Create My Kundli</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-cosmic-border bg-cosmic-surface hover:border-cyan-500/50 text-cosmic-text font-display font-bold text-sm uppercase tracking-wider transition-all duration-300"
          >
            Explore Dashboard
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs text-cosmic-muted">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Deterministic Vedic Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Zero Astronomical Hallucinations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
            <span>Multi-Model AI Cross-Checking</span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-6 w-full">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Universal Intelligence</h2>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-cosmic-text">
            Everything You Need To Navigate Your Karma
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className={`rounded-3xl border p-6 bg-gradient-to-b ${svc.color} backdrop-blur-xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-cosmic-card transition-all duration-300 group`}
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-cosmic-card border border-cosmic-border/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-cosmic-text mb-2">{svc.title}</h4>
                  <p className="text-xs text-cosmic-muted leading-relaxed mb-6">{svc.desc}</p>
                </div>

                <button
                  onClick={() => onNavigate(svc.id)}
                  className="w-full py-2.5 rounded-xl border border-cosmic-border bg-cosmic-surface/80 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 text-xs font-bold text-cosmic-text transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{svc.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vedic Engine Architectural Pillar */}
      <section className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-bold text-cosmic-gold uppercase tracking-widest">
            Core Engineering Principle
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
            Deterministic Math as Single Source of Truth
          </h2>
          <p className="text-sm text-cosmic-muted leading-relaxed">
            AI models are renowned for hallucinating numbers, planetary degrees, and dates. At DeepAstro, our astronomical calculations are performed by our proprietary, deterministic Vedic calculation engine using Lahiri Ayanamsha (Chitra Paksha).
          </p>
          <p className="text-sm text-cosmic-muted leading-relaxed">
            AI models (OpenAI, Gemini, Grok, and local on-device Ollama with DeepSeek-R1) are used exclusively for synthesis, empathetic explanations, deep reasoning, and cross-checking against classical Parashari shastras. The calculations remain rock solid.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('kundli')}
              className="px-6 py-3 rounded-xl bg-cosmic-card border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500 hover:text-black transition-all"
            >
              Verify Calculations in Kundli Engine
            </button>
          </div>
        </div>
      </section>

      {/* Pricing / Subscriptions Preview */}
      <section className="space-y-6 w-full">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Cosmic Access Plans</h2>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-cosmic-text">
            Simple, Transparent Cosmic Tiers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">Free Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-cosmic-text mt-1">Cosmic Seeker</h4>
              <div className="text-3xl font-display font-black text-cosmic-text mt-4">
                ₹0 <span className="text-xs text-cosmic-muted font-normal">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-cosmic-muted mt-6">
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Kundli & Moon sign
                </li>
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Daily Horoscope weather
                </li>
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Browse certified astrologers
                </li>
                <li className="flex items-center gap-2 text-rose-400/80">
                  <Lock className="w-4 h-4" /> Direct contact hidden until upgraded
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('kundli')}
              className="mt-8 w-full py-3 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-text hover:border-cyan-400 transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="rounded-3xl border-2 border-cyan-500 bg-gradient-to-b from-cosmic-surface to-cyan-950/20 p-7 flex flex-col justify-between relative shadow-glow-cyan/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold uppercase tracking-widest">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Premium Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-cosmic-text mt-1">Cosmic Voyager</h4>
              <div className="text-3xl font-display font-black text-cosmic-text mt-4">
                ₹499 <span className="text-xs text-cosmic-muted font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-cosmic-text mt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Complete Kundli (D1, D9, D10)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 120-Year Vimshottari Timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 36-Point Ashtakoota Milan
                </li>
                <li className="flex items-center gap-2 font-bold text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Unlocked Astrologer Phone & WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Unlimited AI AstroBot Assistant
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('subscription')}
              className="mt-8 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan"
            >
              Ascend to Premium
            </button>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Pro Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-cosmic-text mt-1">Cosmic Sovereign</h4>
              <div className="text-3xl font-display font-black text-cosmic-text mt-4">
                ₹1,499 <span className="text-xs text-cosmic-muted font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-cosmic-muted mt-6">
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" /> Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" /> Multi-Model AI Cross-Checking
                </li>
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" /> 1 Free Monthly Consultation
                </li>
                <li className="flex items-center gap-2 text-cosmic-text">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" /> Family Chart Vault (10 Kundlis)
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('subscription')}
              className="mt-8 w-full py-3 rounded-xl border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-xs font-bold text-violet-300 transition-colors"
            >
              Explore Sovereign
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cosmic-border/80 pt-12 pb-8 space-y-8 select-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo size="md" showTagline={true} />
          <div className="flex flex-wrap gap-6 text-xs text-cosmic-muted font-medium">
            <button onClick={() => onNavigate('kundli')} className="hover:text-cyan-400 transition-colors">Kundli</button>
            <button onClick={() => onNavigate('astrologers')} className="hover:text-cyan-400 transition-colors">Astrologers</button>
            <button onClick={() => onNavigate('subscription')} className="hover:text-cyan-400 transition-colors">Subscriptions</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors">Contact</button>
            <button onClick={() => onNavigate('profile')} className="hover:text-cyan-400 transition-colors">Privacy & Security</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-cosmic-border/40 text-xs text-cosmic-muted">
          <p>© 2026 DeepAstro. All Rights Reserved.</p>
          <p className="font-semibold text-cosmic-text">
            Designed & Created by <span className="text-cyan-400">Prashant Sisodhiya</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
