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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/system-verification')) {
      return 'system-verification';
    }
    return 'home';
  });
  const [userPlan, setUserPlan] = useState<'FREE' | 'PREMIUM' | 'PRO'>('FREE');
  const [userName, setUserName] = useState('Arjun Sharma');
  const [chartContext, setChartContext] = useState<any>(null);

  // Sync initial chart context & subscription
  useEffect(() => {
    fetch('/api/astrology/chart')
      .then((res) => res.json())
      .then((data) => setChartContext(data))
      .catch(() => {});

    fetch('/api/subscription/current')
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription?.planId) {
          setUserPlan(data.subscription.planId);
        }
      })
      .catch(() => {});
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigate={setActiveTab} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} userName={userName} />;
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
        return <ProfilePage onNavigate={setActiveTab} userPlan={userPlan} />;
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
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      userPlan={userPlan}
      userName={userName}
      chartContext={chartContext}
    >
      {renderActiveView()}
    </AppShell>
  );
};

export default App;
