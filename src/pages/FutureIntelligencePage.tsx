import { FutureMapCard } from '../components/future/FutureMapCard';
import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Sparkles,
  ShieldAlert,
  Activity,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  HeartPulse,
  Briefcase,
  DollarSign,
  Heart,
  Brain,
  Download,
  Filter,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  BarChart3,
  Lock,
  AlertCircle
} from 'lucide-react';
import { FutureInsightCard } from '../components/future/FutureInsightCard';
import { FutureYearCard, YearCardData } from '../components/future/FutureYearCard';
import { FutureMonthCard, MonthCardData } from '../components/future/FutureMonthCard';
import { FutureLongevityCard, LongevityCardData } from '../components/future/FutureLongevityCard';
import { FutureConsentModal } from '../components/future/FutureConsentModal';
import { getBirthProfile } from '../utils/birthStorage.js';


// --- Inline Birth Profile Form ---
const BirthProfileForm: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [form, setForm] = React.useState({
    fullName: '', birthDate: '', birthTime: '', birthPlace: '',
    latitude: '', longitude: '', timezone: 'Asia/Kolkata', gender: 'Male',
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const geocode = async (place: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`);
      const data = await res.json();
      if (data[0]) {
        setForm(f => ({ ...f, latitude: parseFloat(data[0].lat).toFixed(4), longitude: parseFloat(data[0].lon).toFixed(4) }));
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError(null);
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/auth/birth-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          fullName: form.fullName, birthDate: form.birthDate, birthTime: form.birthTime,
          birthPlace: form.birthPlace, latitude: parseFloat(form.latitude) || 0,
          longitude: parseFloat(form.longitude) || 0, timezone: form.timezone, gender: form.gender,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || d.details || `HTTP ${res.status}`); }
      setSaveSuccess(true);
      setTimeout(() => onSaved(), 900);
    } catch (err: any) { setSaveError(err.message || 'Failed to save profile'); }
    finally { setSaving(false); }
  };

  const inp = "w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all";
  const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 flex items-start justify-center p-6 pt-12">
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl bg-gradient-to-b from-[#0a1020]/80 to-[#0a0c14] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-900/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">BIRTH PROFILE REQUIRED</div>
              <h3 className="text-lg font-bold text-slate-100">Enter Your Birth Details</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            The Cosmic Future Intelligence Engine calculates personalized 3/5/10-year timelines strictly from your real birth data.
          </p>
          {saveSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="text-4xl">🌟</div>
              <div className="text-sm font-bold text-cyan-400">Birth profile saved! Generating your future timeline...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Full Name</label>
                  <input className={inp} placeholder="Your full name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Gender</label>
                  <select className={inp} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Birth Date</label>
                  <input type="date" className={inp} value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Birth Time</label>
                  <input type="time" className={inp} value={form.birthTime} onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Birth Place</label>
                  <input className={inp} placeholder="City, Country (e.g. Delhi, India)" value={form.birthPlace}
                    onChange={e => setForm(f => ({ ...f, birthPlace: e.target.value }))}
                    onBlur={e => { if (e.target.value.length > 3) geocode(e.target.value); }} required />
                  {form.latitude && <p className="text-[11px] text-cyan-400 mt-1 font-mono">📍 {form.latitude}, {form.longitude}</p>}
                </div>
                <div>
                  <label className={lbl}>Latitude</label>
                  <input type="number" step="0.0001" className={inp} placeholder="e.g. 28.6139" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Longitude</label>
                  <input type="number" step="0.0001" className={inp} placeholder="e.g. 77.2090" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Timezone</label>
                  <select className={inp} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                    {['Asia/Kolkata','Asia/Dubai','Asia/Singapore','America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Paris','Australia/Sydney','Pacific/Auckland'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
              {saveError && <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-xl px-3 py-2">{saveError}</div>}
              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm transition-all shadow-lg disabled:opacity-60">
                {saving ? '⟳ Saving...' : '🌟 Save & Generate My Future Timeline'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export type FuturePageState =
  | 'AUTH_REQUIRED'
  | 'PREMIUM_REQUIRED'
  | 'CONSENT_REQUIRED'
  | 'BIRTH_PROFILE_REQUIRED'
  | 'READY'
  | 'GENERATING'
  | 'SUCCESS'
  | 'ERROR';

export const FutureIntelligencePage: React.FC = () => {
  const [pageState, setPageState] = useState<FuturePageState>('GENERATING');
  const [forecastData, setForecastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'years' | 'months' | 'domains' | 'longevity' | 'compare'>('overview');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [compareYearA, setCompareYearA] = useState<number>(2026);
  const [compareYearB, setCompareYearB] = useState<number>(2027);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [revealLevel, setRevealLevel] = useState<number>(1);
  const [horizonYears, setHorizonYears] = useState<3 | 5 | 10>(10);

  const fetchForecast = async (overrideConsentLevel?: number) => {
    setPageState('GENERATING');
    setError(null);

    try {
      let token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      if (!token) {
        try {
          const guestRes = await fetch('/api/auth/guest-session', { method: 'POST' });
          if (guestRes.ok) {
            const guestData = await guestRes.json();
            if (guestData.token) {
              const validToken = String(guestData.token);
              token = validToken;
              localStorage.setItem('deepastro_token', validToken);
              localStorage.setItem('token', validToken);
            }
          }
        } catch {
          // Continue with guest payload
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const lvlStr = `LEVEL_${overrideConsentLevel !== undefined ? overrideConsentLevel : revealLevel || 1}`;
      const horizonStr = horizonYears === 3 ? '3_YEARS' : horizonYears === 5 ? '5_YEARS' : '10_YEARS';

      // Read local birth profile so user's real calculation parameters seamlessly flow into future engine
      const localProfile = getBirthProfile();
      if (!localProfile || !localProfile.birthDate || !localProfile.birthTime) {
        setPageState('BIRTH_PROFILE_REQUIRED');
        return;
      }

      const birthProfilePayload = {
        fullName: localProfile.name || 'Cosmic Native',
        birthDate: localProfile.birthDate,
        birthTime: localProfile.birthTime,
        birthPlace: localProfile.birthPlace || 'Calculated Location',
        latitude: parseFloat(localProfile.latitude as any) || 28.6139,
        longitude: parseFloat(localProfile.longitude as any) || 77.2090,
        timezone: localProfile.timezone || 'Asia/Kolkata',
        gender: localProfile.gender || 'Male',
      };

      const res = await fetch('/api/future/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          horizon: horizonStr,
          requestedLevel: lvlStr,
          consentGranted: true,
          birthProfile: birthProfilePayload,
        }),
      });

      if (res.status === 401) {
        // Refresh token via guest session and retry automatically
        const gRes = await fetch('/api/auth/guest-session', { method: 'POST' });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.token) {
            localStorage.setItem('deepastro_token', gData.token);
            localStorage.setItem('token', gData.token);
            fetchForecast(overrideConsentLevel);
            return;
          }
        }
        setPageState('AUTH_REQUIRED');
        return;
      }

      const rawText = await res.text();
      let body: any = {};
      try {
        body = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      if (res.status === 403) {
        if (body.error === 'FUTURE_CONSENT_REQUIRED') {
          setPageState('CONSENT_REQUIRED');
          return;
        }
        setError(body.details || body.error || 'Access to Future Intelligence requires verification.');
        setPageState('ERROR');
        return;
      }

      if (res.status === 422) {
        setPageState('BIRTH_PROFILE_REQUIRED');
        return;
      }

      if (!res.ok) {
        throw new Error(body.error || body.details || `HTTP ${res.status}: Failed to generate future forecast`);
      }

      const payload = body.data || body;
      setForecastData(payload);
      if (payload?.revealLevel) {
        const parsed = parseInt(payload.revealLevel.replace('LEVEL_', ''), 10);
        if (!isNaN(parsed)) setRevealLevel(parsed);
      }
      setPageState('SUCCESS');
    } catch (err: any) {
      console.error('Failed to fetch future forecast:', err);
      setError(err.message || 'Unable to connect to Cosmic Future Intelligence Engine.');
      setPageState('ERROR');
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [horizonYears]);

  const handleConsentSubmit = async (level: number) => {
    setIsConsentModalOpen(false);
    setRevealLevel(level);
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      if (!token) {
        setPageState('AUTH_REQUIRED');
        return;
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch('/api/future/consent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          consentGranted: true,
          level: `LEVEL_${level}`,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.details || 'Failed to record consent');
      }
      // Explicit consent recorded successfully on server; now generate forecast
      fetchForecast(level);
    } catch (e: any) {
      console.warn('Consent sync error:', e);
      setError(e.message || 'Failed to record ethical opt-in consent.');
      setPageState('ERROR');
    }
  };

  if (pageState === 'AUTH_REQUIRED') {
    return (
      <div className="min-h-screen bg-[#06070A] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#111827] border border-cyan-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              UNRESTRICTED ACCESS • NO AUTH REQUIRED
            </span>
            <h2 className="text-2xl font-black font-satoshi text-slate-100">
              Access Living Future Intelligence
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              DeepAstro computes personalized 3/5/10-year timelines derived strictly from your verified birth data. Continue instantly as a cosmic guest or sign in.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/auth/guest-session', { method: 'POST' });
                  const data = await res.json();
                  if (data.token) {
                    localStorage.setItem('deepastro_token', data.token);
                    localStorage.setItem('token', data.token);
                    fetchForecast();
                    return;
                  }
                } catch {}
                fetchForecast();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-black font-bold text-sm shadow-xl hover:opacity-95 transition-all"
            >
              ✦ Continue as Guest (Instant Access)
            </button>
            <a
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1A1F2B] border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-all text-center"
            >
              Sign In to Your Account
            </a>
          </div>
        </div>
      </div>
    );
  }



  if (pageState === 'CONSENT_REQUIRED') {
    return (
      <div className="min-h-screen bg-[#06070A] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#111827] border border-cyan-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              ETHICAL CONSENT PROTOCOL
            </span>
            <h2 className="text-2xl font-black font-satoshi text-slate-100">
              Review & Opt-In Required
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cosmic Future Intelligence synthesizes multi-year life vectors. In alignment with Jyotish ethics, please review disclosure levels and confirm your consent before calculations commence.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsConsentModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-satoshi text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              Review & Continue
            </button>
          </div>
        </div>
        <FutureConsentModal
          isOpen={isConsentModalOpen}
          onClose={() => setIsConsentModalOpen(false)}
          onConsent={handleConsentSubmit}
          currentLevel={revealLevel}
        />
      </div>
    );
  }

  if (pageState === 'BIRTH_PROFILE_REQUIRED') {
    return (
      <BirthProfileForm onSaved={() => {
        fetchForecast();
      }} />
    );
  }

  const yearlyTimeline = forecastData?.yearForecasts || [];
  const monthlyTimeline = forecastData?.monthForecasts || [];
  const selectedYearObj = yearlyTimeline.find((y: any) => y.year === selectedYear) || yearlyTimeline[0];
  const domainDict = forecastData?.domainForecasts || {};
  const domainList = Object.entries(domainDict).map(([domain, data]: [string, any]) => ({
    domain,
    ...data,
  }));

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 py-8 px-4 md:px-8 space-y-8 font-inter">
      {/* Header Bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            <span>DeepAstro CFIE v1.0.0 • Pro Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-satoshi tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            FUTURE INTELLIGENCE
          </h1>
          <p className="text-xs text-slate-400">
            Structured, evidence-grounded multi-system future outlook
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsConsentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A1F2B] hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Reveal Level {revealLevel}</span>
          </button>

          <div className="flex rounded-xl bg-[#111827] p-1 border border-slate-800 text-xs font-mono">
            {([3, 5, 10] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizonYears(h)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  horizonYears === h
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}Y
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchForecast()}
            disabled={pageState === 'GENERATING'}
            className="p-2 rounded-xl bg-[#1A1F2B] border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all"
            title="Recalculate Snapshot"
          >
            <RefreshCw className={`w-4 h-4 ${pageState === 'GENERATING' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {[
          { id: 'overview', label: 'My Future Map', icon: Compass },
          { id: 'years', label: 'Yearly Forecast', icon: Calendar },
          { id: 'months', label: 'Monthly Timeline', icon: Clock },
          { id: 'domains', label: 'Life Domains', icon: Layers },
          { id: 'longevity', label: 'Longevity & Wellbeing', icon: HeartPulse },
          { id: 'compare', label: 'Compare Years', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1F2B]/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        {pageState === 'GENERATING' ? (
          <div className="py-24 text-center space-y-4">
            <Compass className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-200">
              Synthesizing Multi-System Future Intelligence...
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Running independent passes across Vedic D1-D60, Dasha, transits, KP sub-lords, Jaimini, and numerology cycles.
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchForecast()}
              className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: OVERVIEW HERO */}
            {activeView === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                <FutureMapCard
                  forecast={{
                    ...forecastData,
                    lifePhase: forecastData?.currentLifePhase,
                    nextMajorWindow: forecastData?.nextMajorWindow,
                    timeline: yearlyTimeline.map((y: any) => ({
                      year: y.year,
                      theme: y.overallTheme,
                      intensity: y.intensityScore ? y.intensityScore / 100 : 0.75,
                      strongestDomain: y.strongestDomain,
                      activeDasha: y.activeDasha,
                      confidence: y.confidence,
                    })),
                    domainForecasts: forecastData?.domainForecasts,
                    monthForecasts: forecastData?.monthForecasts,
                    provenance: forecastData?.provenance,
                  }}
                  onViewYearDetail={(yr) => {
                    setSelectedYear(yr);
                    setActiveView('years');
                  }}
                  onExploreSoulJourney={() => {
                    window.location.hash = '#/past-life';
                  }}
                  onAskAstroBot={(prompt) => {
                    const evt = new CustomEvent('astrobot:open', { detail: { prompt } });
                    window.dispatchEvent(evt);
                  }}
                />
                <FutureInsightCard
                  data={{
                    currentPhase: forecastData?.currentLifePhase || 'Consolidation & Intentionality Phase',
                    overallTheme: forecastData?.overall10YearTheme || 'Strategic Evolution and Purpose Realization',
                    nextMajorWindow: forecastData?.nextMajorWindow?.period || 'Q3–Q4 Upcoming',
                    forecastHorizonYears: horizonYears,
                    careerOutlook: domainDict.CAREER?.outlook || 'Structured progression through merit and disciplined skill elevation.',
                    relationshipOutlook: domainDict.RELATIONSHIP?.outlook || 'Harmonious reciprocity supported by open, conscious communication.',
                    financeOutlook: domainDict.FINANCE?.outlook || 'Systematic asset accumulation with prudent risk mitigation.',
                    growthOutlook: domainDict.PERSONAL_GROWTH?.outlook || 'Internal maturation and philosophical clarity.',
                    spiritualityOutlook: domainDict.SPIRITUALITY?.outlook || 'Deepened contemplative grounding and adherence to dharma.',
                    healthSpanOutlook: domainDict.HEALTHSPAN?.outlook || 'Enduring vitality sustained by balanced routines and preventive self-care.',
                    timeline: yearlyTimeline.map((y: any) => ({
                      year: y.year,
                      overallTheme: y.overallTheme,
                      strongestDomain: y.strongestDomain || 'CAREER',
                      importantWindow: y.strongWindows || 'Mid-Year',
                      confidence: y.confidence || 'MODERATE',
                    })),
                    remedyHighlights: (forecastData?.remedies || []).slice(0, 3).map((r: any) => ({
                      category: r.category,
                      title: r.name,
                      practice: r.description,
                    })),
                    confidenceScore: 0.85,
                    convergenceLevel: forecastData?.multiSystemConvergence?.overallConvergence || 'HIGH',
                    disclaimer: forecastData?.disclaimer || 'Traditional multi-system forecasting suggests potentials and is never a guaranteed factual prediction.',
                  }}
                  onSelectYear={(yr) => {
                    setSelectedYear(yr);
                    setActiveView('years');
                  }}
                  onOpenLongevity={() => setActiveView('longevity')}
                  onOpenReport={() => setActiveView('domains')}
                />
              </div>
            )}

            {/* VIEW 2: YEARLY FORECAST */}
            {activeView === 'years' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    Select Forecast Year ({horizonYears}-Year Horizon)
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto">
                    {yearlyTimeline.map((y: any) => (
                      <button
                        key={y.year}
                        onClick={() => setSelectedYear(y.year)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                          selectedYear === y.year
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-[#1A1F2B] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedYearObj ? (
                  <FutureYearCard
                    data={{
                      year: selectedYearObj.year,
                      overallTheme: selectedYearObj.overallTheme,
                      career: selectedYearObj.careerOutlook,
                      finance: selectedYearObj.financeOutlook,
                      relationship: selectedYearObj.relationshipOutlook,
                      healthSpan: selectedYearObj.healthSpanOutlook,
                      spirituality: selectedYearObj.spiritualityOutlook,
                      personalGrowth: selectedYearObj.personalGrowthOutlook,
                      opportunities: selectedYearObj.opportunities || [],
                      challenges: selectedYearObj.challenges || [],
                      strongWindows: [selectedYearObj.strongWindows],
                      cautionWindows: [selectedYearObj.cautionWindows],
                      confidence: selectedYearObj.confidence || 'MODERATE',
                      evidence: [
                        { system: 'Synthesis', description: selectedYearObj.evidenceSummary }
                      ],
                      uncertainty: 'Variations in birth time or personal choices may adjust timing windows by several weeks.',
                      whatCouldChangeThis: [
                        'Birth-time precision adjustments',
                        'Proactive decisions altering trajectory',
                        'External macro-economic climate shifts',
                      ],
                    }}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">No data available for this year.</div>
                )}
              </div>
            )}

            {/* VIEW 3: MONTHLY TIMELINE */}
            {activeView === 'months' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-satoshi text-slate-100">
                      12-Month Calendar Breakdown ({selectedYear})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dynamic monthly themes derived from active transits, Dasha sub-periods, and numerology.
                    </p>
                  </div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-[#1A1F2B] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                  >
                    {yearlyTimeline.map((y: any) => (
                      <option key={y.year} value={y.year}>{y.year}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {monthlyTimeline.map((m: any, idx: number) => (
                    <FutureMonthCard
                      key={idx}
                      data={{
                        year: m.year,
                        month: m.month,
                        monthName: m.monthName,
                        theme: m.monthlyTheme,
                        careerTrend: m.careerSignal === 'GROWTH' ? 'Strong' : 'Stable',
                        relationshipTrend: m.relationshipSignal === 'HARMONY' ? 'Strong' : 'Stable',
                        financeTrend: m.financeSignal === 'EXPANSION' ? 'Strong' : 'Review',
                        spiritualityTrend: m.spiritualitySignal === 'INTENSIVE' ? 'Strong' : 'Stable',
                        keyWindow: m.keyWindow,
                        confidence: m.confidence || 'MODERATE',
                        why: m.why,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 4: LIFE DOMAINS */}
            {activeView === 'domains' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold font-satoshi text-slate-100">
                    Comprehensive Life Domain Outlooks
                  </h3>
                  <p className="text-xs text-slate-400">
                    Individual assessments across all 15 life sectors with active opportunity & caution windows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainList.map((d: any, idx: number) => (
                    <div key={idx} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <span className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wide">
                          {d.domain}
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#1A1F2B] border border-slate-700 text-slate-300">
                          Trajectory: {d.trajectory}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-medium">
                        {d.outlook}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                          <strong className="block text-[10px] uppercase font-mono mb-0.5">Key Windows:</strong>
                          <span>{d.upcomingWindows || 'Mid-Term Focus'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-cyan-300">
                          <strong className="block text-[10px] uppercase font-mono mb-0.5">Primary Houses:</strong>
                          <span>{d.supportingIndicators?.houses?.join(', ') || 'Traditional'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: LONGEVITY & WELLBEING */}
            {activeView === 'longevity' && (
              <div className="space-y-6 animate-fadeIn">
                <FutureLongevityCard
                  data={forecastData?.longevityHealthspan ? {
                    summary: forecastData.longevityHealthspan.vitalityTheme,
                    vitalityIndicators: (forecastData.longevityHealthspan.resilienceIndicators || []).map((r: any) => ({
                      system: 'Vedic / Ephemeris',
                      factor: r.indicator,
                      assessment: r.status,
                      observation: r.traditionalTheme,
                    })),
                    selfCareWindows: (forecastData.longevityHealthspan.selfCareWindows || []).map((w: any) => ({
                      startYear: w.startYear,
                      endYear: w.endYear,
                      intensity: w.intensity,
                      focusArea: w.focusArea,
                      recommendation: w.recommendation,
                    })),
                    lifestyleReflections: forecastData.longevityHealthspan.lifestyleRecommendations || [],
                    disclaimer: forecastData.longevityHealthspan.epistemicDisclaimer,
                    confidence: 0.85,
                  } : {
                    summary: 'Traditional astrological analysis focuses on planetary vitality, physical endurance, and identifying cyclical phases where restorative self-care and balanced living should be prioritized.',
                    vitalityIndicators: [
                      { system: 'Vedic Lagna', factor: 'Lagna Lord & Sun', assessment: 'Resilient', observation: 'Strong natural karaka placement indicating sound foundational vitality.' },
                      { system: 'D9 Navamsha', factor: 'Lagna Navamsha', assessment: 'Harmonious', observation: 'Supports long-term recovery and energetic resilience.' },
                      { system: 'Ayurdaya Tradition', factor: 'Saturn & 8th Lord', assessment: 'Disciplined', observation: 'Emphasizes longevity fostered through daily routines and stress management.' },
                    ],
                    selfCareWindows: [
                      { startYear: 2027, endYear: 2028, intensity: 'Moderate', focusArea: 'Digestive & Nervous Rest', recommendation: 'Schedule regular recovery cycles during peak professional transitions.' },
                      { startYear: 2031, endYear: 2032, intensity: 'Mild', focusArea: 'Joint & Skeletal Mobility', recommendation: 'Incorporate daily low-impact movement and meditative disciplines.' },
                    ],
                    lifestyleReflections: [
                      'Prioritize consistent circadian sleep cycles during high dasha transitions.',
                      'Incorporate cooling ayurvedic nutrition during intense Mars or Sun transits.',
                      'Maintain regular checkups with qualified healthcare professionals.',
                    ],
                    disclaimer: 'This is a traditional astrological interpretation and is not a medical assessment or prediction of lifespan or death.',
                    confidence: 0.85,
                  }}
                />
              </div>
            )}

            {/* VIEW 6: COMPARE YEARS */}
            {activeView === 'compare' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold font-satoshi text-slate-100">
                      Multi-Year Comparison Engine
                    </h3>
                    <p className="text-xs text-slate-400">
                      Contrast planetary configurations and domain trajectories between two target years.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={compareYearA}
                      onChange={(e) => setCompareYearA(Number(e.target.value))}
                      className="bg-[#1A1F2B] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                    >
                      {yearlyTimeline.map((y: any) => (
                        <option key={y.year} value={y.year}>{y.year}</option>
                      ))}
                    </select>
                    <span className="text-slate-500 font-bold text-xs">VS</span>
                    <select
                      value={compareYearB}
                      onChange={(e) => setCompareYearB(Number(e.target.value))}
                      className="bg-[#1A1F2B] border border-blue-500/40 rounded-xl px-3 py-1.5 text-xs text-blue-300 font-mono"
                    >
                      {yearlyTimeline.map((y: any) => (
                        <option key={y.year} value={y.year}>{y.year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[compareYearA, compareYearB].map((yr, colIdx) => {
                    const yObj = yearlyTimeline.find((y: any) => y.year === yr);
                    if (!yObj) return null;
                    return (
                      <div
                        key={yr}
                        className={`bg-[#111827] border rounded-2xl p-6 space-y-4 shadow-xl ${
                          colIdx === 0 ? 'border-cyan-500/30' : 'border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="font-mono font-black text-2xl text-slate-100">{yr}</span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#1A1F2B] border border-slate-700 text-cyan-300">
                            Confidence: {yObj.confidence}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          <strong className="block text-cyan-400 font-mono uppercase text-[10px] mb-1">Theme:</strong>
                          {yObj.overallTheme}
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-[#1A1F2B]/60 border border-slate-800">
                            <span className="font-bold text-cyan-300 block mb-0.5">Career:</span>
                            <span className="text-slate-300">{yObj.careerOutlook}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#1A1F2B]/60 border border-slate-800">
                            <span className="font-bold text-pink-300 block mb-0.5">Relationship:</span>
                            <span className="text-slate-300">{yObj.relationshipOutlook}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#1A1F2B]/60 border border-slate-800">
                            <span className="font-bold text-emerald-300 block mb-0.5">Finance:</span>
                            <span className="text-slate-300">{yObj.financeOutlook}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Consent Modal */}
      <FutureConsentModal
        isOpen={isConsentModalOpen}
        currentLevel={revealLevel}
        onClose={() => setIsConsentModalOpen(false)}
        onConsent={handleConsentSubmit}
      />
    </div>
  );
};
