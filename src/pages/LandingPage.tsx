import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sun,
  Heart,
  Hash,
  Hand,
  Flame,
  Users,
  FileText,
  Lock,
  Clock,
  Compass,
  Orbit,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { Logo } from '../components/brand/Logo.js';
import { NavTabId } from '../components/layout/Sidebar.js';
import { DEEPASTRO_ARTWORK } from '../constants/deepastroAssets.js';

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
      color: 'from-amber-500/15 via-[#0c101a] to-amber-950/20 border-amber-500/30',
      cta: 'Generate Kundli',
      image: DEEPASTRO_ARTWORK.kundliVedicChart.src,
      badge: 'Lahiri Ephemeris',
    },
    {
      id: 'astrologers' as NavTabId,
      title: 'Certified Gurus & AI Sage',
      desc: 'Elite Parashari, KP, and Vastu masters plus explainable multi-model Vedic AI oracle cross-checking.',
      icon: Users,
      color: 'from-violet-500/15 via-[#0c101a] to-violet-950/20 border-violet-500/30',
      cta: 'Consult Gurus & AI',
      image: DEEPASTRO_ARTWORK.aiAstrologerSanctuary.src,
      badge: 'Neural Oracle',
    },
    {
      id: 'future-intelligence' as NavTabId,
      title: 'Future Intelligence Lab',
      desc: 'Longitudinal Vimshottari progression and structural house activations revealing your personal 120-year timeline gates.',
      icon: Zap,
      color: 'from-cyan-500/15 via-[#0c101a] to-cyan-950/20 border-cyan-500/30',
      cta: 'Explore Future Lab',
      image: DEEPASTRO_ARTWORK.futureIntelligence.src,
      badge: 'Timeline Gates',
    },
    {
      id: 'predictions' as NavTabId,
      title: 'Daily Cosmic Weather',
      desc: 'Personalized transits mapped to your natal Moon and Ascendant across Career, Finance, Love, and Health.',
      icon: Sun,
      color: 'from-amber-500/15 via-[#0c101a] to-orange-950/20 border-amber-500/30',
      cta: 'View Daily Weather',
      image: DEEPASTRO_ARTWORK.planetaryInsightsTransits.src,
      badge: 'Live Gochara',
    },
    {
      id: 'matching' as NavTabId,
      title: 'Kundli Milan (36 Gunas)',
      desc: 'Ashtakoota Milan analyzing Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi, and Manglik equilibrium.',
      icon: Heart,
      color: 'from-rose-500/15 via-[#0c101a] to-rose-950/20 border-rose-500/30',
      cta: 'Match Horoscopes',
      image: DEEPASTRO_ARTWORK.matchingCosmicUnion.src,
      badge: '36 Gunas',
    },
    {
      id: 'palmistry' as NavTabId,
      title: 'Palmistry Vision AI',
      desc: 'Upload clear palm photos for structured traditional analysis of Heart, Head, Life, Fate lines, and major mounts.',
      icon: Hand,
      color: 'from-emerald-500/15 via-[#0c101a] to-emerald-950/20 border-emerald-500/30',
      cta: 'Scan Palm Photo',
      image: DEEPASTRO_ARTWORK.palmistrySacredGeometry.src,
      badge: 'Biometric Shastra',
    },
    {
      id: 'lalkitab' as NavTabId,
      title: 'Lal Kitab & Remedial Altar',
      desc: 'Authentic 1952 remedial traditions, planetary debts, charity measures, and lifestyle modifications.',
      icon: Flame,
      color: 'from-orange-500/15 via-[#0c101a] to-red-950/20 border-orange-500/30',
      cta: 'Explore Remedies',
      image: DEEPASTRO_ARTWORK.lalKitabRemedialAltar.src,
      badge: 'Elemental Alchemy',
    },
    {
      id: 'numerology' as NavTabId,
      title: 'Numerology Sacred Matrix',
      desc: 'Chaldean & Pythagorean calculations for Life Path, Destiny, Soul Urge, and Personal Year vibrational cycles.',
      icon: Hash,
      color: 'from-blue-500/15 via-[#0c101a] to-blue-950/20 border-blue-500/30',
      cta: 'Calculate Vibrations',
      image: DEEPASTRO_ARTWORK.numerologySacredMatrix.src,
      badge: 'Vibrational Matrix',
    },
    {
      id: 'panchang' as NavTabId,
      title: 'Panchang & Auspicious Muhurat',
      desc: 'Daily solilunar coordinates, Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, and planetary Hora timing finder.',
      icon: Calendar,
      color: 'from-amber-500/15 via-[#0c101a] to-amber-950/20 border-amber-500/30',
      cta: 'Check Shubh Muhurat',
      image: DEEPASTRO_ARTWORK.nakshatraCosmicKnowledge.src,
      badge: 'Kala Shastra',
    },
    {
      id: 'kp-astrology' as NavTabId,
      title: 'KP Sub-Lord Radar',
      desc: 'Krishnamurti Paddhati 1-249 sub-lord coordinates, planetary significators, and cuspal geometry.',
      icon: Compass,
      color: 'from-cyan-500/15 via-[#0c101a] to-indigo-950/20 border-cyan-500/30',
      cta: 'Analyze KP Chart',
      image: DEEPASTRO_ARTWORK.kpAstrologyRadar.src,
      badge: 'Sub-Lord Engine',
    },
    {
      id: 'western' as NavTabId,
      title: 'Western Tropical Matrix',
      desc: 'Tropical zodiac system, Placidus house system, planetary aspect grid, and major astrological transits.',
      icon: Orbit,
      color: 'from-purple-500/15 via-[#0c101a] to-purple-950/20 border-purple-500/30',
      cta: 'View Tropical Chart',
      image: DEEPASTRO_ARTWORK.westernTropicalMatrix.src,
      badge: 'Tropical Placidus',
    },
    {
      id: 'reports' as NavTabId,
      title: 'Executive PDF Dossiers',
      desc: 'Bespoke downloadable Kundli and transit dossiers with deep tabular breakdowns and traditional scripture grounding.',
      icon: FileText,
      color: 'from-indigo-500/15 via-[#0c101a] to-indigo-950/20 border-indigo-500/30',
      cta: 'Download Reports',
      image: DEEPASTRO_ARTWORK.reportsCosmicJourney.src,
      badge: 'Gold Publication',
    },
  ];

  return (
    <div className="space-y-16 py-4 w-full">
      {/* Hero Section: Text on Left, Cosmic Artwork Banner on Right with Dark Left-to-Right Gradient */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#07090e] via-[#0d121c] to-[#07090e] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.08)]">
        {/* Ambient atmospheric background glows */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[350px] bg-gradient-to-br from-amber-500/15 via-blue-500/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[460px] relative z-10">
          {/* Left Column: Headline, Description, CTAs, Highlights */}
          <div className="lg:col-span-6 xl:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-300 uppercase font-mono">
                The Modern Vedic Operating System
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-display font-black tracking-tight text-white leading-[1.12] font-serif">
                Your Cosmos Has a Story.{' '}
                <span className="block bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]">
                  DeepAstro Helps You Read It.
                </span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-slate-300/95 font-normal leading-relaxed max-w-xl">
                Ancient Vedic wisdom, precise planetary calculations, and modern AI intelligence — united in one personal cosmic experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => onNavigate('kundli')}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Create My Kundli</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl border border-slate-700 bg-cosmic-surface/90 hover:border-amber-400/60 hover:text-amber-300 text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 active:scale-[0.98]"
              >
                Explore Dashboard
              </button>
            </div>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-2 text-[11px] sm:text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Deterministic Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero Hallucinations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Multi-Model AI Cross-Checking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Artwork with Dark Left-to-Right Gradient Blend */}
          <div className="lg:col-span-6 xl:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[380px] lg:min-h-[460px] overflow-hidden rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            {/* The Image */}
            <img
              src="/images/deepastro/hero-page.png"
              alt="DeepAstro Celestial Observatory"
              className="w-full h-full object-cover object-center lg:object-right transition-transform duration-1000 hover:scale-105"
            />

            {/* Crucial: Dark Gradient from Left to Right (fades image into dark background on the left side) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 via-35% to-transparent pointer-events-none" />

            {/* Top and Bottom soft vignetting */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/50 via-transparent to-transparent pointer-events-none" />

            {/* Floating Celestial Badge */}
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/75 border border-amber-400/40 backdrop-blur-md flex items-center gap-2 text-[10px] font-mono text-amber-300 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>CANONICAL VEDIC OBSERVATORY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Organized in 4 Columns with Picture on Top, Text Below, and CTA) */}
      <section className="space-y-8 w-full text-left">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold font-mono text-amber-300 uppercase tracking-widest">
            <Layers className="w-3 h-3" /> Core Vedic Modules
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white font-serif tracking-tight">
            Everything You Need To Navigate Your Karma
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Explore authentic sidereal computations, multi-model AI interpretation, and remedial traditions crafted for your destiny journey.
          </p>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className={`rounded-3xl border overflow-hidden bg-gradient-to-b ${svc.color} backdrop-blur-xl flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(245,158,11,0.18)] transition-all duration-300 group`}
              >
                {/* 1. Pic in Top */}
                <div className="relative w-full h-44 sm:h-48 overflow-hidden rounded-t-3xl bg-slate-950">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c101a] via-[#0c101a]/30 to-transparent" />
                  {svc.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/75 border border-amber-400/40 text-amber-300 tracking-wider backdrop-blur-md shadow-md">
                      {svc.badge}
                    </span>
                  )}
                </div>

                {/* 2. Text in Below */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-display font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {svc.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300/90 leading-relaxed font-normal line-clamp-3">
                      {svc.desc}
                    </p>
                  </div>

                  {/* 3. With a CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(svc.id)}
                      className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-transparent hover:from-amber-400 hover:to-yellow-400 hover:text-black hover:border-amber-400 text-xs font-bold text-amber-300 tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    >
                      <span>{svc.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vedic Engine Architectural Pillar */}
      <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-8 sm:p-12 relative overflow-hidden text-left shadow-lg">
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
            Core Engineering Principle
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white font-serif">
            Deterministic Math as Single Source of Truth
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            AI models are renowned for hallucinating numbers, planetary degrees, and dates. At DeepAstro, our astronomical calculations are performed by our proprietary, deterministic Vedic calculation engine using Lahiri Ayanamsha (Chitra Paksha).
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            AI models (OpenAI, Gemini, Grok, and local on-device Ollama with DeepSeek-R1) are used exclusively for synthesis, empathetic explanations, deep reasoning, and cross-checking against classical Parashari shastras. The calculations remain rock solid.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('kundli')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              Verify Calculations in Kundli Engine
            </button>
          </div>
        </div>
      </section>

      {/* Pricing / Subscriptions Preview */}
      <section className="space-y-6 w-full text-left">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Cosmic Access Plans</h2>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white font-serif">
            Simple, Transparent Cosmic Tiers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="rounded-3xl border border-slate-800 bg-cosmic-surface p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Free Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-white mt-1">Cosmic Seeker</h4>
              <div className="text-3xl font-display font-black text-white mt-4 font-serif">
                ₹0 <span className="text-xs text-slate-400 font-normal">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mt-6">
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Kundli & Moon sign
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Daily Horoscope weather
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Browse certified astrologers
                </li>
                <li className="flex items-center gap-2 text-rose-400/80">
                  <Lock className="w-4 h-4" /> Direct contact hidden until upgraded
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('kundli')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-700 bg-cosmic-card text-xs font-bold text-white hover:border-amber-400 transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-cosmic-surface to-amber-950/20 p-7 flex flex-col justify-between relative shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[10px] font-extrabold uppercase tracking-widest shadow-md">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Premium Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-white mt-1">Cosmic Voyager</h4>
              <div className="text-3xl font-display font-black text-amber-300 mt-4 font-serif">
                ₹499 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 mt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Complete Kundli (D1, D9, D10)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 120-Year Vimshottari Timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 36-Point Ashtakoota Milan
                </li>
                <li className="flex items-center gap-2 font-bold text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Unlocked Astrologer Phone & WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Unlimited AI AstroBot Assistant
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('subscription')}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
            >
              Ascend to Premium
            </button>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-slate-800 bg-cosmic-surface p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">Pro Tier</span>
              <h4 className="text-2xl font-display font-extrabold text-white mt-1">Cosmic Sovereign</h4>
              <div className="text-3xl font-display font-black text-white mt-4 font-serif">
                ₹1,499 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mt-6">
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Multi-Model AI Cross-Checking
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 1 Free Monthly Consultation
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Family Chart Vault (10 Kundlis)
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('subscription')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-700 bg-cosmic-card hover:border-amber-400 text-xs font-bold text-white transition-colors"
            >
              Explore Sovereign
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-12 pb-8 space-y-8 select-none text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo size="md" showTagline={true} />
          <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => onNavigate('kundli')} className="hover:text-amber-400 transition-colors">Kundli</button>
            <button onClick={() => onNavigate('astrologers')} className="hover:text-amber-400 transition-colors">Astrologers</button>
            <button onClick={() => onNavigate('subscription')} className="hover:text-amber-400 transition-colors">Subscriptions</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">Contact</button>
            <button onClick={() => onNavigate('profile')} className="hover:text-amber-400 transition-colors">Privacy & Security</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <p>© 2026 DeepAstro. All Rights Reserved.</p>
          <p className="font-semibold text-slate-300">
            Designed & Created by <span className="text-amber-400 font-bold">Prashant Sisodhiya</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
