import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell.js';
import { NavTabId } from './components/layout/Sidebar.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { KundliPage } from './pages/KundliPage.js';
import { DailyPredictionsPage } from './pages/DailyPredictionsPage.js';
import { MatchingPage } from './pages/MatchingPage.js';
import { NumerologyPage } from './pages/NumerologyPage.js';
import { PalmistryPage } from './pages/PalmistryPage.js';
import { LalKitabPage } from './pages/LalKitabPage.js';
import { PanchangPage } from './pages/PanchangPage.js';
import { AstrologersPage } from './pages/AstrologersPage.js';
import { SubscriptionPage } from './pages/SubscriptionPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';
import { SystemVerificationPage } from './pages/SystemVerificationPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { CosmicHubPage } from './pages/CosmicHubPage.js';
import { CosmicIntelligencePage } from './pages/CosmicIntelligencePage.js';

import { AuthModal } from './components/auth/AuthModal.js';
import { CosmicSOSModal } from './components/astrology/CosmicSOSModal.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { getBirthProfile, getCalculatedChart, onChartUpdated } from './utils/birthStorage.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/system-verification')) {
      return 'system-verification';
    }
    return 'home';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PREMIUM' | 'PRO'>('FREE');
  const [userName, setUserName] = useState(() => {
    const profile = getBirthProfile();
    return profile?.name || 'Cosmic Seeker';
  });
  const [chartContext, setChartContext] = useState<any>(() => {
    const saved = getCalculatedChart();
    return saved?.chart || saved || null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [cosmicSosOpen, setCosmicSosOpen] = useState(false);

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
          localStorage.removeItem('deepastro_token');
          setCurrentUser(null);
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
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('deepastro_token');
    setCurrentUser(null);
    setUserName('Cosmic Seeker');
    setUserPlan('FREE');
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setUserName(user.name || 'Cosmic Seeker');
    setUserPlan(user.plan || 'FREE');
    setAuthModalOpen(false);
  };

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
      case 'predictions':
        return <DailyPredictionsPage />;
      case 'matching':
        return <MatchingPage />;
      case 'numerology':
        return <NumerologyPage />;
      case 'palmistry':
        return <PalmistryPage />;
      case 'lalkitab':
        return <LalKitabPage />;
      case 'panchang':
      case 'muhurat':
        return <PanchangPage />;
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
        return <ProfilePage onNavigate={setActiveTab} userPlan={userPlan} currentUser={currentUser} onOpenAuth={handleOpenAuth} />;
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
    <>
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
        onAuthSuccess={handleAuthSuccess}
      />

      <CosmicSOSModal
        isOpen={cosmicSosOpen}
        onClose={() => setCosmicSosOpen(false)}
        chartContext={chartContext}
      />
    </>
  );
};

export default App;
