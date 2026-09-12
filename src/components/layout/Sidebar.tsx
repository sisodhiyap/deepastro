import React from 'react';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  Sun,
  Flame,
  FileText,
  Users,
  Heart,
  Briefcase,
  Layers,
  Hand,
  Hash,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Brain,
  Globe2,
  TrendingUp,
  LineChart,
  Binary,
  Radio
} from 'lucide-react';
import { Logo } from '../brand/Logo.js';

export type NavTabId =
  | 'home'
  | 'dashboard'
  | 'intelligence'
  | 'cosmic-hub'
  | 'kundli'
  | 'kp-astrology'
  | 'western'
  | 'predictions'
  | 'matching'
  | 'tarot'
  | 'numerology'
  | 'palmistry'
  | 'ai-astrologer'
  | 'market-pulse'
  | 'financial-astrology'
  | 'investment-lab'
  | 'news-intelligence'
  | 'global-risk'
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
        { id: 'intelligence' as NavTabId, label: 'Cosmic Intelligence', icon: Brain, badge: 'v6.0' },
        { id: 'cosmic-hub' as NavTabId, label: 'Cosmic Hub & Sky', icon: Sparkles, badge: 'LIVE' },
        { id: 'kundli' as NavTabId, label: 'Vedic Kundli & Vargas', icon: Sparkles },
        { id: 'kp-astrology' as NavTabId, label: 'KP Astrology Engine', icon: Binary, badge: 'STELLAR' },
        { id: 'western' as NavTabId, label: 'Western Tropical Chart', icon: Globe2, badge: 'NEW' },
        { id: 'predictions' as NavTabId, label: 'Daily Predictions', icon: Sun },
        { id: 'matching' as NavTabId, label: 'Kundli Milan (36 Pts)', icon: Heart },
      ],
    },
    {
      title: 'FINANCIAL & MACRO INTELLIGENCE',
      items: [
        { id: 'investment-lab' as NavTabId, label: 'Investment Research Lab', icon: LineChart, badge: 'LAB' },
        { id: 'market-pulse' as NavTabId, label: 'Market Pulse & Radar', icon: TrendingUp },
        { id: 'financial-astrology' as NavTabId, label: 'Mundane & Cycle Engine', icon: Briefcase },
        { id: 'news-intelligence' as NavTabId, label: 'News & Fact Verification', icon: Radio },
        { id: 'global-risk' as NavTabId, label: 'Geopolitical Risk Radar', icon: ShieldCheck },
      ],
    },
    {
      title: 'ANCIENT DIVINATION & AI REASONING',
      items: [
        { id: 'ai-astrologer' as NavTabId, label: 'DeepAstro AI Astrologer', icon: Brain, badge: 'WHY?' },
        { id: 'tarot' as NavTabId, label: 'DeepAstro Tarot Engine', icon: Sparkles, badge: 'CRYPTO' },
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
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/20 via-amber-400 to-amber-600/20 shadow-[0_0_16px_rgba(245,199,106,0.85)] pointer-events-none z-30" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/8 via-amber-500/3 to-transparent pointer-events-none blur-xl z-0" />

      {/* Brand Header */}
      <div className="relative z-10 p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/10">
        <Logo size="md" showTagline={true} />
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-amber-300/80 px-1">
          <span>COSMIC ENGINE</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">v6.0</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="relative z-10 p-3 space-y-6 flex-1">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-950/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 p-4 border-t border-slate-800/80 bg-[#06070A]/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400 font-mono">
          <span>PRECISION CORE</span>
          <span className="text-emerald-400 font-semibold">100% PASS</span>
        </div>
        <div className="text-[10px] text-slate-600">
          SEBI Disclaimers Active • Evidence 1st
        </div>
      </div>
    </aside>
  );
};
