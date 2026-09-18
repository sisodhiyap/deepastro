import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell.js';
import { NavTabId } from './components/layout/Sidebar.js';
import { LandingPage } from './pages/LandingPage.js';
import { ChartSessionProvider } from './context/ChartSessionContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { CosmicSOSModal } from './components/astrology/CosmicSOSModal.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { getBirthProfile, saveBirthProfile, getCalculatedChart, onChartUpdated } from './utils/birthStorage.js';

// Lazy-loaded heavy and secondary route components (Code-Splitting)
const MyCosmosPage = lazy(() => import('./pages/MyCosmosPage.js').then(m => ({ default: m.MyCosmosPage })));
const KundliPage = lazy(() => import('./pages/KundliPage.js').then(m => ({ default: m.KundliPage })));
const FutureIntelligencePage = lazy(() => import('./pages/FutureIntelligencePage.js').then(m => ({ default: m.FutureIntelligencePage })));
const PastLifePage = lazy(() => import('./pages/PastLifePage.js').then(m => ({ default: m.PastLifePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage.js').then(m => ({ default: m.DashboardPage })));
const DailyPredictionsPage = lazy(() => import('./pages/DailyPredictionsPage.js').then(m => ({ default: m.DailyPredictionsPage })));
const MatchingPage = lazy(() => import('./pages/MatchingPage.js').then(m => ({ default: m.MatchingPage })));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage.js').then(m => ({ default: m.NumerologyPage })));
const PalmistryPage = lazy(() => import('./pages/PalmistryPage.js').then(m => ({ default: m.PalmistryPage })));
const LalKitabPage = lazy(() => import('./pages/LalKitabPage.js').then(m => ({ default: m.LalKitabPage })));
const PanchangPage = lazy(() => import('./pages/PanchangPage.js').then(m => ({ default: m.PanchangPage })));
const MuhuratPage = lazy(() => import('./pages/MuhuratPage.js').then(m => ({ default: m.MuhuratPage })));
const AstrologersPage = lazy(() => import('./pages/AstrologersPage.js').then(m => ({ default: m.AstrologersPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage.js').then(m => ({ default: m.SubscriptionPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage.js').then(m => ({ default: m.ReportsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js').then(m => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('./pages/AdminPage.js').then(m => ({ default: m.AdminPage })));
const QAControlCenterPage = lazy(() => import('./pages/QAControlCenterPage.js').then(m => ({ default: m.QAControlCenterPage })));
const AccuracyWarRoomPage = lazy(() => import('./pages/AccuracyWarRoomPage.js').then(m => ({ default: m.AccuracyWarRoomPage })));
const SystemVerificationPage = lazy(() => import('./pages/SystemVerificationPage.js').then(m => ({ default: m.SystemVerificationPage })));
const ContactPage = lazy(() => import('./pages/ContactPage.js').then(m => ({ default: m.ContactPage })));
const CosmicHubPage = lazy(() => import('./pages/CosmicHubPage.js').then(m => ({ default: m.CosmicHubPage })));
const CosmicIntelligencePage = lazy(() => import('./pages/CosmicIntelligencePage.js').then(m => ({ default: m.CosmicIntelligencePage })));
const TarotPage = lazy(() => import('./pages/TarotPage.js').then(m => ({ default: m.TarotPage })));
const WesternPage = lazy(() => import('./pages/WesternPage.js').then(m => ({ default: m.WesternPage })));
const KPAstrologyPage = lazy(() => import('./pages/KPAstrologyPage.js').then(m => ({ default: m.KPAstrologyPage })));
const InvestmentLabPage = lazy(() => import('./pages/InvestmentLabPage.js').then(m => ({ default: m.InvestmentLabPage })));
const AIAstrologerPage = lazy(() => import('./pages/AIAstrologerPage.js').then(m => ({ default: m.AIAstrologerPage })));
const LoginPage = lazy(() => import('./pages/LoginPage.js').then(m => ({ default: m.LoginPage })));

// Cosmic loading skeleton for route transitions
const CosmicRouteSkeleton: React.FC = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-pulse">
    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shadow-glow-cyan mb-4">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
    </div>
    <div className="text-xs font-bold tracking-widest text-cyan-300 font-mono uppercase">
      Aligning Celestial Coordinates
    </div>
    <p className="text-xs text-slate-400 mt-1 max-w-sm">
      Loading cosmic intelligence module...
    </p>
  </div>
);

export const App: React.FC = () => {



  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin/qa/accuracy-war-room') || window.location.pathname.startsWith('/admin/qa/war-room')) {
        return 'qa-war-room';
      }
      if (window.location.pathname.startsWith('/admin/qa')) {
        return 'qa';
      }
      if (window.location.pathname.includes('/admin/system-verification')) {
        return 'system-verification';
      }
      if (window.location.pathname === '/login') {
        return 'profile';
      }
    }
    return 'home';
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepastro_user');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });

  const [userPlan, setUserPlan] = useState<'FREE' | 'PREMIUM' | 'PRO'>('FREE');
  const [userName, setUserName] = useState(() => {
    const profile = getBirthProfile();
    return profile?.name || 'Cosmic Seeker';
  });

  const [currentProfile, setCurrentProfile] = useState<any>(() => {
    const saved = getBirthProfile();
    return saved || null;
  });

  const [chartContext, setChartContext] = useState<any>(() => {
    const saved = getCalculatedChart();
    return saved?.chart || saved || null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [cosmicSosOpen, setCosmicSosOpen] = useState(false);
  const [showDedicatedLogin, setShowDedicatedLogin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('deepastro_user');
      const savedToken = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      // If user is not authenticated, open login page by default
      if (!savedUser && !savedToken) {
        return true;
      }
      return window.location.pathname === '/login' || window.location.search.includes('login=true');
    }
    return true;
  });

  // Verify and load authenticated user session on mount
  useEffect(() => {
    const token = localStorage.getItem('deepastro_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            setUserName(data.user.name || 'Cosmic Seeker');
            setUserPlan((data.user.plan as any) || 'FREE');
          }
          if (data.birthProfile) {
            saveBirthProfile(data.birthProfile);
            setCurrentProfile(data.birthProfile);
          }
        })
        .catch(() => {
          // Token expired or server offline
        });
    }

    // Check for saved or active chart
    fetch('/api/astrology/chart')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.chart) {
          setChartContext(data.chart);
        } else if (data && data.ascendant) {
          setChartContext(data);
        }
      })
      .catch(() => {});

    // Sync subscription tier
    fetch('/api/subscription/current')
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription?.planId) {
          setUserPlan(data.subscription.planId);
        }
      })
      .catch(() => {});

    // Listen to cross-component birth & chart updates
    const unsubscribe = onChartUpdated(({ chart, profile }) => {
      if (chart) setChartContext(chart.chart || chart);
      if (profile?.name) setUserName(profile.name);
      if (profile) setCurrentProfile(profile);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setShowDedicatedLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('deepastro_token');
    localStorage.removeItem('token');
    localStorage.removeItem('deepastro_user');
    setCurrentUser(null);
    setUserName('Cosmic Seeker');
    setUserPlan('FREE');
    setShowDedicatedLogin(true);
    setActiveTab('home');
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setUserName(user.fullName || user.name || 'Cosmic Seeker');
    setUserPlan(user.plan || 'FREE');
    setAuthModalOpen(false);
    setShowDedicatedLogin(false);
    // After registering or logging in, open main home page
    setActiveTab('home');
  };



  // Full-Screen Split-Screen Authentication Page (opens login page if unauthenticated)
  if (showDedicatedLogin && !currentUser) {
    return (
      <AuthProvider>
        <LanguageProvider>
          <LoginPage 
            onSuccess={handleAuthSuccess} 
            onNavigateLanding={() => {
              setShowDedicatedLogin(false);
              setActiveTab('home');
              if (typeof window !== 'undefined' && window.location.pathname === '/login') {
                window.history.pushState({}, '', '/');
              }
            }} 
          />
        </LanguageProvider>
      </AuthProvider>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigate={setActiveTab} />;
        case 'my-cosmos':
        return <MyCosmosPage onNavigate={(tab) => setActiveTab(tab as NavTabId)} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} userName={userName} chartContext={chartContext} />;
      case 'intelligence':
        return <CosmicIntelligencePage onNavigate={setActiveTab} chartContext={chartContext} />;
      case 'cosmic-hub':
        return <CosmicHubPage onNavigate={setActiveTab} userName={userName} />;
      case 'kundli':
        return <KundliPage />;
      case 'kp-astrology':
        return <KPAstrologyPage />;
      case 'western':
        return <WesternPage />;
      case 'investment-lab':
        return <InvestmentLabPage initialTab="market" onNavigate={setActiveTab} />;
      case 'market-pulse':
        return <InvestmentLabPage initialTab="market" onNavigate={setActiveTab} />;
      case 'financial-astrology':
        return <InvestmentLabPage initialTab="synthesis" onNavigate={setActiveTab} />;
      case 'news-intelligence':
        return <InvestmentLabPage initialTab="news" onNavigate={setActiveTab} />;
      case 'global-risk':
        return <InvestmentLabPage initialTab="geopolitical" onNavigate={setActiveTab} />;
      case 'ai-astrologer':
        return <AIAstrologerPage profile={currentProfile} />;
      case 'past-life':
        return <PastLifePage />;
      case 'future':
        return <FutureIntelligencePage />;
      case 'predictions':
        return <DailyPredictionsPage />;
      case 'matching':
        return <MatchingPage />;
      case 'tarot':
        return <TarotPage />;
      case 'numerology':
        return <NumerologyPage />;
      case 'palmistry':
        return <PalmistryPage />;
      case 'lalkitab':
        return <LalKitabPage />;
      case 'panchang':
        return <PanchangPage />;
      case 'muhurat':
        return <MuhuratPage />;
      case 'astrologers':
        return <AstrologersPage onNavigate={setActiveTab} userPlan={userPlan} />;
      case 'subscription':
        return (
          <SubscriptionPage
            currentPlan={userPlan}
            onPlanUpdated={(newPlan) => setUserPlan(newPlan as any)}
            onNavigate={setActiveTab}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return (
          <ProfilePage 
            onNavigate={setActiveTab} 
            userPlan={userPlan} 
            currentUser={currentUser} 
            onOpenAuth={handleOpenAuth} 
          />
        );
      case 'admin':
        return <AdminPage />;
      case 'qa':
      case 'qa-test-lab':
        return <QAControlCenterPage onNavigate={setActiveTab} />;
      case 'qa-war-room':
        return <AccuracyWarRoomPage />;
      case 'system-verification':
        return <SystemVerificationPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <LandingPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <ChartSessionProvider>
          <AppShell
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            userPlan={userPlan}
            userName={userName}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            chartContext={chartContext}
          >
            <ErrorBoundary fallbackTitle="Cosmic Matrix Synchronizing">
              <Suspense fallback={<CosmicRouteSkeleton />}>
                {renderActiveView()}
              </Suspense>
            </ErrorBoundary>
          </AppShell>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authModalMode}
            onAuthSuccess={(user: any) => handleAuthSuccess(user)}
          />

          <CosmicSOSModal
            isOpen={cosmicSosOpen}
            onClose={() => setCosmicSosOpen(false)}
            chartContext={chartContext}
          />
        </ChartSessionProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

