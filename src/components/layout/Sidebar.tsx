import React from 'react';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  Sun,
  Flame,
  FileText,
  Bookmark,
  Users,
  Heart,
  Briefcase,
  Layers,
  Hand,
  Hash,
  Bot,
  User,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { Logo } from '../brand/Logo.js';

export type NavTabId =
  | 'home'
  | 'dashboard'
  | 'intelligence'
  | 'cosmic-hub'
  | 'kundli'
  | 'predictions'
  | 'matching'
  | 'tarot'
  | 'numerology'
  | 'palmistry'
  | 'lalkitab'
  | 'panchang'
  | 'muhurat'
  | 'astrologers'
  | 'subscription'
  | 'reports'
  | 'profile'
  | 'admin'
  | 'system-verification'
  | 'contact';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  userPlan?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userPlan = 'FREE',
  className = '',
}) => {
  const sections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'home' as NavTabId, label: 'Cosmic Portal (Home)', icon: Compass },
        { id: 'dashboard' as NavTabId, label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'intelligence' as NavTabId, label: 'Cosmic Intelligence', icon: Brain, badge: 'v3.0' },
        { id: 'cosmic-hub' as NavTabId, label: 'Cosmic Hub & Sky', icon: Sparkles, badge: 'LIVE' },
        { id: 'kundli' as NavTabId, label: 'Vedic Kundli & Vargas', icon: Sparkles },
        { id: 'predictions' as NavTabId, label: 'Daily Predictions', icon: Sun },
        { id: 'matching' as NavTabId, label: 'Kundli Milan (36 Pts)', icon: Heart },
      ],
    },
    {
      title: 'ANCIENT DIVINATION',
      items: [
        { id: 'tarot' as NavTabId, label: 'DeepAstro Tarot Engine', icon: Sparkles, badge: 'NEW' },
        { id: 'numerology' as NavTabId, label: 'Numerology Vibrations', icon: Hash },
        { id: 'palmistry' as NavTabId, label: 'Palmistry Vision AI', icon: Hand },
        { id: 'lalkitab' as NavTabId, label: 'Lal Kitab & Remedies', icon: Flame },
        { id: 'panchang' as NavTabId, label: 'Panchang (5 Limbs)', icon: Calendar },
        { id: 'muhurat' as NavTabId, label: 'Shubh Muhurat Finder', icon: Clock },
      ],
    },
    {
      title: 'MARKETPLACE & SAAS',
      items: [
        { id: 'astrologers' as NavTabId, label: 'Certified Astrologers', icon: Users, badge: 'Protected' },
        { id: 'subscription' as NavTabId, label: 'Subscriptions & Tiers', icon: CreditCard, badge: userPlan },
        { id: 'reports' as NavTabId, label: 'PDF Dossier Reports', icon: FileText },
        { id: 'profile' as NavTabId, label: 'Profile & Privacy', icon: User },
        { id: 'admin' as NavTabId, label: 'Admin Command Center', icon: ShieldCheck },
        { id: 'system-verification' as NavTabId, label: 'System Verification', icon: ShieldCheck, badge: 'Audit' },
        { id: 'contact' as NavTabId, label: 'Support & Partnership', icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside
      className={`w-64 h-screen relative border-r-2 border-amber-400/50 shadow-[4px_0_35px_rgba(245,158,11,0.22)] bg-cosmic-surface/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto select-none shrink-0 ${className}`}
    >
      {/* Golden Stroke Luminescent Neon Edge (Right Border Accent) */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/20 via-amber-400 to-amber-600/20 shadow-[0_0_16px_rgba(245,199,106,0.85)] pointer-events-none z-30" />

      {/* Atmospheric Golden Ambient Halo */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/8 via-amber-500/3 to-transparent pointer-events-none blur-xl z-0" />

      {/* Brand Header with Golden Stroke Divider */}
      <div className="relative z-10 p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/10">
        <Logo size="md" showTagline={true} />
      </div>

      {/* Navigation Sections */}
      <div className="relative z-10 flex-1 py-4 px-3 space-y-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="flex items-center gap-2 px-3 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,199,106,0.9)]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80 block">
                {sec.title}
              </span>
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,199,106,0.25)]'
                      : 'text-cosmic-text/80 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(245,199,106,0.15)]'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]'
                          : 'text-cosmic-muted group-hover:text-amber-300 group-hover:scale-105'
                      }`}
                    />
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`relative z-10 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'PRO'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                          : item.badge === 'PREMIUM'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* ============================================================ */}
                  {/* Water Animation at Lower of Button on Hover / Active State   */}
                  {/* ============================================================ */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-3 overflow-hidden rounded-b-xl pointer-events-none transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    {/* Aquatic Pool Gradient Reservoir */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/35 via-cyan-400/15 to-transparent" />

                    {/* Primary Flowing Water Wave */}
                    <div className="absolute -bottom-1 left-0 w-[200%] h-4 animate-water-wave-1 opacity-90 pointer-events-none">
                      <svg
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="w-full h-full text-cyan-400 fill-current"
                      >
                        <path d="M0,25 C150,75 350,-20 500,40 C650,100 850,-10 1000,45 C1150,100 1200,30 1200,30 L1200,120 L0,120 Z" />
                      </svg>
                    </div>

                    {/* Secondary Golden-Aqua Shimmer Wave */}
                    <div className="absolute -bottom-1 left-0 w-[200%] h-4 animate-water-wave-2 opacity-70 pointer-events-none">
                      <svg
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="w-full h-full text-amber-300 fill-current"
                      >
                        <path d="M0,45 C200,90 400,-10 600,50 C800,110 1000,20 1200,60 L1200,120 L0,120 Z" />
                      </svg>
                    </div>

                    {/* Water Meniscus Surface Beam */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_8px_rgba(0,229,255,0.9)] animate-water-surface" />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Subscription Tier Banner with Golden Frame */}
      <div className="relative z-10 p-4 border-t border-amber-500/30 bg-gradient-to-t from-amber-950/20 via-cosmic-card/80 to-transparent">
        <div className="p-3 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-purple-950/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Orbit</span>
            <span className="text-[10px] font-extrabold text-amber-300 drop-shadow-[0_0_6px_rgba(245,199,106,0.6)]">
              {userPlan} Plan
            </span>
          </div>
          <p className="text-[11px] text-cosmic-muted mt-1 leading-tight">
            {userPlan === 'FREE'
              ? 'Upgrade to unlock direct phone & WhatsApp astrologer access.'
              : 'Full cosmic privileges and multi-model AI activated.'}
          </p>
          {userPlan === 'FREE' && (
            <button
              onClick={() => onSelectTab('subscription')}
              className="mt-2.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              Ascend to Premium
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
