import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar.js';
import { TopNav } from './TopNav.js';
import { Starfield } from '../common/Starfield.js';
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

  // Close drawer on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="h-[100dvh] w-full max-w-full flex bg-cosmic-bg text-cosmic-text relative overflow-hidden">
      {/* Background Celestial Star Particles */}
      <Starfield />

      {/* Desktop Left Sidebar (Permanently Fixed/Sticky on Left) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          onSelectTab(tab);
          setMobileMenuOpen(false);
        }}
        userPlan={userPlan}
        className="hidden lg:flex h-full shrink-0 z-30"
      />

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              onSelectTab(tab);
              setMobileMenuOpen(false);
            }}
            userPlan={userPlan}
            className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl safe-pt safe-pb"
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Right Side Column (Header Sticky + Only Main Content Scrolls) */}
      <div className="flex-1 h-full flex flex-col min-w-0 max-w-full relative z-10 overflow-hidden">
        {/* Sticky Header */}
        <TopNav
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={onSelectTab}
          userPlan={userPlan}
          userName={userName}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
        />

        {/* Scrollable Content Container: For full-viewport workspaces like My Cosmos, isolate layout to prevent scroll coupling */}
        {activeTab === 'my-cosmos' ? (
          <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col relative card-safe">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full min-w-0 max-w-full pb-24 lg:pb-12 card-safe">
            {children}
          </main>
        )}
      </div>

      {/* AstroBot Floating Orb Assistant */}
      <AstroBotWidget chartContext={chartContext} />

      {/* Mobile Bottom Navigation Bar with iOS safe area and touch targets */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] safe-bottom-nav border-t border-cosmic-border bg-cosmic-surface/95 backdrop-blur-xl z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <button
          onClick={() => onSelectTab('home')}
          className={`touch-target-min px-2 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'home' ? 'text-cyan-400 font-bold' : 'text-cosmic-muted'}`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] leading-none">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('dashboard')}
          className={`touch-target-min px-2 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-cosmic-muted'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] leading-none">Cosmos</span>
        </button>

        <button
          onClick={() => onSelectTab('astrologers')}
          className={`touch-target-min px-2 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'astrologers' ? 'text-cyan-400 font-bold' : 'text-cosmic-muted'}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] leading-none">Gurus</span>
        </button>

        <button
          onClick={() => onSelectTab('subscription')}
          className={`touch-target-min px-2 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'subscription' ? 'text-cyan-400 font-bold' : 'text-cosmic-muted'}`}
        >
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            PRO
          </span>
          <span className="text-[10px] leading-none">Upgrade</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`touch-target-min px-2 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-cyan-400 font-bold' : 'text-cosmic-muted'}`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] leading-none">Profile</span>
        </button>
      </nav>
    </div>
  );
};
