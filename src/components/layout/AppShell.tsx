import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar.js';
import { TopNav } from './TopNav.js';
import { Starfield } from '../common/Starfield.js';
import { CosmicPlanets } from '../common/CosmicPlanets.js';
import { AstroBotWidget } from '../bot/AstroBotWidget.js';
import { Home, Sparkles, Bot, Users, User } from 'lucide-react';

interface AppShellProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  userPlan?: string;
  userName?: string;
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
  chartContext?: any;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  userPlan = 'FREE',
  userName = 'Cosmic Seeker',
  currentUser,
  onOpenAuth,
  onLogout,
  chartContext,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cosmic-bg text-cosmic-text relative overflow-x-hidden">
      {/* Background Celestial Star Particles */}
      <Starfield />

      {/* Futuristic Slow-Drifting Cosmic Planets (80% Opacity) */}
      <CosmicPlanets />

      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          onSelectTab(tab);
          setMobileMenuOpen(false);
        }}
        userPlan={userPlan}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40"
      />

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              onSelectTab(tab);
              setMobileMenuOpen(false);
            }}
            userPlan={userPlan}
            className="relative z-10 w-72"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10 pb-20 lg:pb-8">
        <TopNav
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={onSelectTab}
          userPlan={userPlan}
          userName={userName}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* AstroBot Floating Orb Assistant */}
      <AstroBotWidget chartContext={chartContext} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-cosmic-border bg-cosmic-surface/95 backdrop-blur-xl z-40 flex items-center justify-around px-2">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-cyan-400' : 'text-cosmic-muted'}`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-cosmic-muted'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Cosmos</span>
        </button>

        <button
          onClick={() => onSelectTab('astrologers')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'astrologers' ? 'text-cyan-400' : 'text-cosmic-muted'}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Gurus</span>
        </button>

        <button
          onClick={() => onSelectTab('subscription')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'subscription' ? 'text-cyan-400' : 'text-cosmic-muted'}`}
        >
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            PRO
          </span>
          <span className="text-[10px] font-semibold">Upgrade</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-cyan-400' : 'text-cosmic-muted'}`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  );
};
