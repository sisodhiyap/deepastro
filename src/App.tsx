import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell.js';
import { NavTabId } from './components/layout/Sidebar.js';
import { PastLifePage } from './pages/PastLifePage';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { KundliPage } from './pages/KundliPage.js';
import { DailyPredictionsPage } from './pages/DailyPredictionsPage.js';
import { MatchingPage } from './pages/MatchingPage.js';
import { NumerologyPage } from './pages/NumerologyPage.js';
import { PalmistryPage } from './pages/PalmistryPage.js';
import { LalKitabPage } from './pages/LalKitabPage.js';
import { PanchangPage } from './pages/PanchangPage.js';
import { MuhuratPage } from './pages/MuhuratPage.js';
import { AstrologersPage } from './pages/AstrologersPage.js';
import { SubscriptionPage } from './pages/SubscriptionPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';
import { SystemVerificationPage } from './pages/SystemVerificationPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { CosmicHubPage } from './pages/CosmicHubPage.js';
import { CosmicIntelligencePage } from './pages/CosmicIntelligencePage.js';
import { TarotPage } from './pages/TarotPage.js';
import { MyCosmosPage } from './pages/MyCosmosPage.js';
import { ChartSessionProvider } from './context/ChartSessionContext.js';

// DeepAstro 6.0 Multi-System Pages
import { WesternPage } from './pages/WesternPage.js';
import { KPAstrologyPage } from './pages/KPAstrologyPage.js';
import { InvestmentLabPage } from './pages/InvestmentLabPage.js';
import { AIAstrologerPage } from './pages/AIAstrologerPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SecurityGate } from './components/auth/SecurityGate.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';

import { AuthModal } from './components/auth/AuthModal.js';
import { CosmicSOSModal } from './components/astrology/CosmicSOSModal.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { getBirthProfile, getCalculatedChart, onChartUpdated } from './utils/birthStorage.js';

export const App: React.FC = () => {



  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined') {
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
    return saved || {
      name: 'Cosmic Seeker',
      birthDate: '1995-05-15',
      birthTime: '14:30',
      birthPlace: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      gender: 'other'
    };
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
      return window.location.pathname === '/login' || window.location.search.includes('login=true');
    }
    return false;
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
    localStorage.removeItem('deepastro_user');
    setCurrentUser(null);
    setUserName('Cosmic Seeker');
    setUserPlan('FREE');
    setShowDedicatedLogin(false);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setUserName(user.name || 'Cosmic Seeker');
    setUserPlan(user.plan || 'FREE');
    setAuthModalOpen(false);
    setShowDedicatedLogin(false);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };



  // Full-Screen Split-Screen Authentication Page
  if (showDedicatedLogin) {
    return (
      <AuthProvider>
        <LanguageProvider>
          <LoginPage 
            onSuccess={handleAuthSuccess} 
            onNavigateLanding={() => {
              setShowDedicatedLogin(false);
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
              {renderActiveView()}
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
