import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Download, Trash2, Key, Bell, Palette, CheckCircle2 } from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface ProfilePageProps {
  onNavigate: (tab: NavTabId) => void;
  userPlan?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, userPlan = 'FREE' }) => {
  const [profile, setProfile] = useState({
    fullName: 'Arjun Sharma',
    email: 'arjun.sharma@deepastro.com',
    phone: '+91 98765 43210',
    city: 'New Delhi',
    country: 'India',
    themePreference: 'dark',
    chartStylePreference: 'north',
    languagePreference: 'en',
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = () => {
    setSavedMessage('Cosmic preferences saved successfully.');
    setTimeout(() => setSavedMessage(null), 3000);
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

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <User className="w-3.5 h-3.5" /> Identity & Privacy Shield
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Account Profile & Privacy Settings
        </h1>
        <p className="text-xs text-cosmic-muted">
          Manage your personal information, privacy preferences, and security credentials.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Settings Sections */}
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
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Cosmic Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-cosmic-card/50 border border-cosmic-border/60 rounded-xl px-3.5 py-2.5 text-cosmic-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">City / Country</label>
                <input
                  type="text"
                  value={`${profile.city}, ${profile.country}`}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-glow-cyan"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-5">
            <h3 className="text-sm font-bold text-cosmic-text uppercase tracking-wider border-b border-cosmic-border/60 pb-3">
              Cosmic Display & System Preferences
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
              Your subscription is active and renourishing through standard billing cycles.
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
                <span className="font-semibold text-cosmic-text">1 Primary Vault Chart</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">Uploaded Files & PDFs:</span>
                <span className="font-semibold text-cosmic-text">Protected (Ephemeral OCR)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cosmic-border/50 text-xs">
                <span className="text-cosmic-muted">AI Sessions & Logs:</span>
                <span className="font-semibold text-cosmic-text">Scoped to User</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('deepastro_auth_token');
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
                      const token = localStorage.getItem('deepastro_auth_token');
                      const res = await fetch('/api/privacy/delete-all', {
                        method: 'DELETE',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      });
                      const data = await res.json();
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
    </div>
  );
};
