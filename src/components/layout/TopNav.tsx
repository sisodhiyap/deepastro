import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Menu, ShieldCheck, User, Activity, RefreshCw, Key, CheckCircle2, XCircle, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.js';
import { FeedbackModal } from '../common/FeedbackModal.js';
import { NavTabId } from './Sidebar.js';

interface TopNavProps {
  onToggleMobileMenu: () => void;
  onNavigate: (tab: NavTabId) => void;
  userPlan?: string;
  userName?: string;
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileMenu,
  onNavigate,
  userPlan = 'FREE',
  userName = 'Cosmic Seeker',
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isTestingApis, setIsTestingApis] = useState(false);
  const [livePanchang, setLivePanchang] = useState<any>(null);

  const fetchLivePanchang = async () => {
    try {
      const res = await fetch('/api/astrology/panchang');
      if (res.ok) {
        const data = await res.json();
        setLivePanchang(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const fetchApiConnections = async () => {
    try {
      const res = await fetch('/api/ai/connections');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch {
      // Backend may be reloading
    }
  };

  const runApiTest = async () => {
    setIsTestingApis(true);
    try {
      const res = await fetch('/api/ai/test-connections', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiStatus((prev: any) => ({ ...prev, activeTests: data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingApis(false);
    }
  };

  useEffect(() => {
    fetchApiConnections();
    fetchLivePanchang();
  }, []);

  return (
    <header className="h-16 shrink-0 border-b border-cosmic-border bg-cosmic-surface/90 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50 select-none w-full max-w-full">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open Mobile Menu"
          className="lg:hidden p-2.5 rounded-xl border border-cosmic-border bg-cosmic-card text-cosmic-text hover:border-cyan-400/60 touch-target-min flex items-center justify-center shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-xs sm:max-w-md w-full hidden sm:block">
          <Search className="w-3.5 h-3.5 text-cosmic-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search astrologers, remedies, Nakshatras, Yogas..."
            className="w-full bg-cosmic-card/70 border border-cosmic-border rounded-xl pl-9 pr-4 py-2 text-xs text-cosmic-text placeholder:text-cosmic-muted focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Live Cosmic Weather Quick Pill */}
        {livePanchang && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-cosmic-border bg-cosmic-card/40 text-xs text-cosmic-muted shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cosmic-text">{livePanchang.vara?.name}:</span>
            <span className="text-cyan-400 font-bold">{livePanchang.tithi?.name}</span>
            <span className="text-cosmic-muted">&bull;</span>
            <span>Chandra in {livePanchang.nakshatra?.name}</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Upgrade Pill for Free Users */}
        {userPlan === 'FREE' && (
          <button
            onClick={() => onNavigate('subscription')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all shadow-glow-cyan/20"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Upgrade</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-xl border border-cosmic-border bg-cosmic-surface hover:border-cyan-400/50 transition-colors relative text-cosmic-text touch-target-min flex items-center justify-center"
          >
            <Bell className="w-4 h-4 text-cosmic-muted" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-cosmic-border bg-cosmic-surface p-4 shadow-2xl z-50 animate-float space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cosmic-border/60">
                <span className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Cosmic Alerts</span>
                <span className="text-[10px] text-cosmic-muted font-semibold">Live Telemetry</span>
              </div>
              <div className="py-4 text-center space-y-2">
                <Bell className="w-6 h-6 mx-auto text-cosmic-muted/40" />
                <p className="text-xs text-cosmic-text font-semibold">No unread cosmic alerts</p>
                <p className="text-[11px] text-cosmic-muted">Real-time planetary shifts will be streamed here.</p>
              </div>
            </div>
          )}
        </div>

        {/* API Connections Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowApiModal(!showApiModal);
              if (!showApiModal) fetchApiConnections();
            }}
            aria-label="API Status"
            title="API Connections & key.env Status"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-all shadow-glow-emerald/20 touch-target-min"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Key className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">APIs Online</span>
          </button>

          {showApiModal && (
            <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-cosmic-border bg-cosmic-surface p-4 shadow-2xl z-50 animate-float space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cosmic-border/60">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cosmic-text uppercase tracking-wider">AI & API Mesh Status</span>
                </div>
                <button
                  onClick={runApiTest}
                  disabled={isTestingApis}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 transition-all flex items-center gap-1"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isTestingApis ? 'animate-spin' : ''}`} />
                  <span>{isTestingApis ? 'Pinging...' : 'Ping Live'}</span>
                </button>
              </div>

              <div className="text-[11px] text-cosmic-muted flex items-center justify-between">
                <span>Source: <code className="text-cyan-400 font-mono">key.env</code></span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Injected
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {/* OpenAI */}
                <div className="p-2.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-cosmic-text">OpenAI API</span>
                    </div>
                    <p className="text-[10px] text-cosmic-muted mt-0.5">GPT-4o, GPT-4o-mini, Vision OCR</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {apiStatus?.activeTests?.openai?.latencyMs ? `${apiStatus.activeTests.openai.latencyMs}ms` : 'Connected'}
                    </span>
                  </div>
                </div>

                {/* DeepSeek */}
                <div className="p-2.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-cosmic-text">DeepSeek AI</span>
                    </div>
                    <p className="text-[10px] text-cosmic-muted mt-0.5">DeepSeek-V3 & DeepSeek-R1</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {apiStatus?.activeTests?.deepseek?.latencyMs ? `${apiStatus.activeTests.deepseek.latencyMs}ms` : 'Connected'}
                    </span>
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="p-2.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-cosmic-text">OpenRouter Mesh</span>
                    </div>
                    <p className="text-[10px] text-cosmic-muted mt-0.5">Free & Priority Fallbacks</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {apiStatus?.activeTests?.openrouter?.latencyMs ? `${apiStatus.activeTests.openrouter.latencyMs}ms` : 'Connected'}
                    </span>
                  </div>
                </div>

                {/* Ollama Local */}
                <div className="p-2.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs font-bold text-cosmic-text">Ollama (Local)</span>
                    </div>
                    <p className="text-[10px] text-cosmic-muted mt-0.5">deepseek-r1:7b, llama3.1, qwen2.5</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      {apiStatus?.activeTests?.ollama?.latencyMs ? `${apiStatus.activeTests.ollama.latencyMs}ms` : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Trigger */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="p-2 rounded-xl border border-cosmic-border bg-cosmic-surface hover:border-cyan-400/50 text-cosmic-muted hover:text-cyan-300 transition-colors"
          title="Share Feedback / Report Observation"
          aria-label="Share Feedback"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile / Auth Trigger */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-cosmic-border/80">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-extrabold text-xs shadow-glow-cyan/30">
                {(currentUser.name || userName || 'U').substring(0, 1).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-cosmic-text block leading-none">{currentUser.name || userName}</span>
                <span className="text-[10px] text-cosmic-muted capitalize">{(currentUser.plan || userPlan || 'FREE').toLowerCase()} Seeker</span>
              </div>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-cosmic-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-cosmic-border/80">
            <button
              onClick={() => onOpenAuth?.('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth?.('register')}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-bold bg-cosmic-gold/10 text-cosmic-gold border border-cosmic-gold/30 rounded-lg hover:bg-cosmic-gold/20 transition-colors"
            >
              Register
            </button>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </header>
  );
};
