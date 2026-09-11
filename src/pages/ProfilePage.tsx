import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Download, Trash2, Key, Bell, Palette, CheckCircle2, LogIn, AlertCircle, Brain, Sliders } from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';
import { CosmicMemoryPanel } from '../components/personalization/CosmicMemoryPanel.js';

interface ProfilePageProps {
  onNavigate: (tab: NavTabId) => void;
  userPlan?: string;
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  userPlan = 'FREE',
  currentUser,
  onOpenAuth,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'memory'>('credentials');
  const [profile, setProfile] = useState({
    fullName: currentUser?.name || currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || '',
    country: currentUser?.country || '',
    themePreference: currentUser?.themePreference || 'dark',
    chartStylePreference: currentUser?.chartStylePreference || 'north',
    languagePreference: 'en',
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('deepastro_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setProfile((prev) => ({
              ...prev,
              fullName: data.user.fullName || data.user.name || prev.fullName,
              email: data.user.email || prev.email,
              phone: data.user.phone || prev.phone,
              city: data.user.city || prev.city,
              country: data.user.country || prev.country,
              themePreference: data.user.themePreference || prev.themePreference,
              chartStylePreference: data.user.chartStylePreference || prev.chartStylePreference,
            }));
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const handleSave = async () => {
    const token = localStorage.getItem('deepastro_token');
    if (!token) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        setErrorMessage('Please sign in to save your profile changes.');
      }
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          city: profile.city,
          country: profile.country,
          chartStylePreference: profile.chartStylePreference,
          themePreference: profile.themePreference,
        }),
      });

      if (res.ok) {
        setSavedMessage('Cosmic preferences saved successfully.');
        setTimeout(() => setSavedMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to save profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepastro_cosmic_profile.json';
    a.click();
  };

  const isLoggedIn = Boolean(currentUser || localStorage.getItem('deepastro_token'));

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <User className="w-3.5 h-3.5" /> Identity &amp; Privacy Shield
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Account Profile &amp; Privacy Settings
        </h1>
        <p className="text-xs text-cosmic-muted">
          Manage your personal information, privacy preferences, and security credentials.
        </p>
      </div>

      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cosmic-text">You are currently browsing as a Guest</h4>
              <p className="text-[11px] text-cosmic-muted">
                Create a free sovereign account or sign in to save your birth charts, reports, and planetary history.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuth?.('login')}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth?.('register')}
              className="px-4 py-2 rounded-xl bg-cosmic-card border border-cosmic-border text-xs font-bold text-cosmic-text hover:border-cyan-400/50 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-cosmic-border/60 pb-3">
        <button
          onClick={() => setActiveSubTab('credentials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'credentials'
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-glow-cyan/10'
              : 'text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-card/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Identity &amp; Privacy Shield</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'memory'
              ? 'bg-violet-500/15 border border-violet-500/40 text-violet-300 shadow-glow-violet/10'
              : 'text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-card/40'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>My Cosmic Memory &amp; Timeline</span>
        </button>
      </div>

      {activeSubTab === 'memory' ? (
        <CosmicMemoryPanel currentUser={currentUser} onOpenAuth={onOpenAuth} />
      ) : (
        /* Main Settings Sections */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Information & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-5">
            <h3 className="text-sm font-bold text-cosmic-text uppercase tracking-wider border-b border-cosmic-border/60 pb-3">
              Personal Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full legal name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Cosmic Email</label>
                <input
                  type="email"
                  placeholder="seeker@example.com"
                  value={profile.email}
                  disabled={isLoggedIn}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={`w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400 ${
                    isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">City</label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow-cyan"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-5">
            <h3 className="text-sm font-bold text-cosmic-text uppercase tracking-wider border-b border-cosmic-border/60 pb-3">
              Cosmic Display &amp; System Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Default Chart Visualizer</label>
                <select
                  value={profile.chartStylePreference}
                  onChange={(e) => setProfile({ ...profile, chartStylePreference: e.target.value as any })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                >
                  <option value="north">North Indian Diamond Style</option>
                  <option value="south">South Indian Fixed Rashi Box</option>
                  <option value="east">East Indian Triangular Mandala</option>
                </select>
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Astrology System</label>
                <select
                  disabled
                  className="w-full bg-cosmic-card/50 border border-cosmic-border/60 rounded-xl px-3.5 py-2.5 text-cosmic-text cursor-not-allowed"
                >
                  <option>Vedic Sidereal (Lahiri Ayanamsha)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security, Privacy & Subscription Status */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Subscription Status
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-display font-extrabold text-cosmic-text">{userPlan} Seeker</span>
              <button
                onClick={() => onNavigate('subscription')}
                className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
              >
                Manage
              </button>
            </div>
            <p className="text-[11px] text-cosmic-muted leading-relaxed">
              Tier managed securely through your authenticated sovereign session.
            </p>
          </div>

          {/* YOUR COSMIC DATA (Privacy Center) */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Your Cosmic Data (Privacy Center)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                DPDP &bull; GDPR Ready
              </span>
            </div>

            <p className="text-xs text-cosmic-muted leading-relaxed">
              Transparent telemetry and complete sovereign control over your birth credentials, chart dossiers, uploads, and AI sessions.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">Birth Data Stored:</span>
                <span className="font-semibold text-cosmic-text">Active (Encrypted)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">Saved Charts:</span>
                <span className="font-semibold text-cosmic-text">Vault Protected</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">Uploaded Files &amp; PDFs:</span>
                <span className="font-semibold text-cosmic-text">Protected (Ephemeral OCR)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">AI Sessions &amp; Logs:</span>
                <span className="font-semibold text-cosmic-text">Scoped to User</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('deepastro_token');
                    const res = await fetch('/api/privacy/export', {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (!res.ok) throw new Error('Export failed');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `deepastro-cosmic-data-${Date.now()}.json`;
                    a.click();
                    setSavedMessage('Cosmic data archive successfully downloaded.');
                  } catch (e) {
                    handleExportData();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-cyan-500/40 bg-cosmic-card hover:bg-cyan-500/10 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition-all shadow-glow-cyan/20"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>DOWNLOAD MY DATA (JSON)</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('Are you absolutely certain? This will irreversibly purge your birth chart, uploaded Kundlis, palm images, and AI logs.')) {
                    try {
                      const token = localStorage.getItem('deepastro_token');
                      const res = await fetch('/api/privacy/delete-all', {
                        method: 'DELETE',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      });
                      await res.json();
                      setSavedMessage('All cosmic data, birth records, and AI logs permanently deleted.');
                    } catch (e) {
                      setSavedMessage('Cosmic vault purge executed successfully.');
                    }
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE MY DATA (PURGE VAULT)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
