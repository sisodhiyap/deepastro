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
} from 'lucide-react';
import { Logo } from '../brand/Logo.js';

export type NavTabId =
  | 'home'
  | 'dashboard'
  | 'kundli'
  | 'predictions'
  | 'matching'
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
        { id: 'kundli' as NavTabId, label: 'Vedic Kundli & Vargas', icon: Sparkles },
        { id: 'predictions' as NavTabId, label: 'Daily Predictions', icon: Sun },
        { id: 'matching' as NavTabId, label: 'Kundli Milan (36 Pts)', icon: Heart },
      ],
    },
    {
      title: 'ANCIENT DIVINATION',
      items: [
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
      className={`w-64 h-screen border-r border-cosmic-border bg-cosmic-surface/90 flex flex-col justify-between overflow-y-auto select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-cosmic-border/80">
        <Logo size="md" showTagline={true} />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cosmic-muted/70 px-3 block mb-1.5">
              {sec.title}
            </span>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan/20'
                      : 'text-cosmic-text/80 hover:text-cosmic-text hover:bg-cosmic-card/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-cosmic-muted group-hover:text-cyan-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'PRO'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : item.badge === 'PREMIUM'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-cosmic-card text-cosmic-muted border border-cosmic-border'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Subscription Tier Banner */}
      <div className="p-4 border-t border-cosmic-border/80 bg-cosmic-card/40">
        <div className="p-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-violet-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Current Orbit</span>
            <span className="text-[10px] font-extrabold text-cosmic-gold">{userPlan} Plan</span>
          </div>
          <p className="text-[11px] text-cosmic-muted mt-1 leading-tight">
            {userPlan === 'FREE'
              ? 'Upgrade to unlock direct phone & WhatsApp astrologer access.'
              : 'Full cosmic privileges and multi-model AI activated.'}
          </p>
          {userPlan === 'FREE' && (
            <button
              onClick={() => onSelectTab('subscription')}
              className="mt-2.5 w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan"
            >
              Ascend to Premium
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
