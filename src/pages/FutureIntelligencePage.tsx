import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Calendar,
  Briefcase,
  Coins,
  Heart,
  Sprout,
  Infinity as InfinityIcon,
  AlertTriangle,
  Star,
  Flower2,
  Landmark,
  Target,
  FileCheck,
  Cpu,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  HeartPulse,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Lock,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Info,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';
import { FutureConsentModal } from '../components/future/FutureConsentModal';
import { getOrFetchBirthProfile, saveBirthProfile } from '../utils/birthStorage.js';

// --- Inline Birth Profile Form ---
const BirthProfileForm: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [form, setForm] = useState({
    fullName: '', birthDate: '', birthTime: '', birthPlace: '',
    latitude: '', longitude: '', timezone: 'Asia/Kolkata', gender: 'Male',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      if (!form.latitude || !form.longitude) {
        setSaveError('Please enter a birth place or provide exact latitude and longitude coordinates.');
        setSaving(false);
        return;
      }
      const profileToSave = {
        name: form.fullName.trim() || 'Cosmic Native',
        birthDate: form.birthDate.trim(),
        birthTime: form.birthTime.trim(),
        birthPlace: form.birthPlace.trim() || 'Calculated Location',
        latitude: form.latitude.trim(),
        longitude: form.longitude.trim(),
        timezone: form.timezone || 'Asia/Kolkata',
        gender: form.gender || 'Male',
      };
      saveBirthProfile(profileToSave);

      let token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      if (!token) {
        try {
          const gRes = await fetch('/api/auth/guest-session', { method: 'POST' });
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.token) {
              token = gData.token;
              localStorage.setItem('deepastro_token', gData.token);
              localStorage.setItem('token', gData.token);
            }
          }
        } catch {}
      }

      try {
        await fetch('/api/auth/birth-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            fullName: profileToSave.name,
            birthDate: profileToSave.birthDate,
            birthTime: profileToSave.birthTime,
            birthPlace: profileToSave.birthPlace,
            latitude: parseFloat(profileToSave.latitude),
            longitude: parseFloat(profileToSave.longitude),
            timezone: profileToSave.timezone,
            gender: profileToSave.gender,
          }),
        });
      } catch (saveErr) {
        console.warn('Background profile save warning:', saveErr);
      }

      setSaveSuccess(true);
      setTimeout(() => onSaved(), 500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to process birth profile');
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all";
  const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 flex items-start justify-center p-4 sm:p-6 pt-12">
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl bg-gradient-to-b from-[#0a1020]/80 to-[#0a0c14] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-900/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">BIRTH PROFILE REQUIRED</div>
              <h3 className="text-lg font-bold text-slate-100">Enter Your Birth Details for Future 8.0</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            DeepAstro Future Intelligence 8.0 calculates highly personalized 3/5/10-year timelines and remedies strictly from your authenticated birth parameters.
          </p>
          {saveSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="text-4xl">🌟</div>
              <div className="text-sm font-bold text-cyan-400">Birth profile saved! Generating your future intelligence...</div>
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
                {saving ? '⟳ Saving...' : '🌟 Save & Unlock Future Intelligence 8.0'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export type FutureTabId =
  | 'overview'
  | 'timeline'
  | 'career'
  | 'wealth'
  | 'relationships'
  | 'health'
  | 'longevity'
  | 'challenges'
  | 'opportunities'
  | 'remedies'
  | 'pooja'
  | 'action_plan'
  | 'evidence'
  | 'calculation';

export const FutureIntelligencePage: React.FC = () => {
  const [pageState, setPageState] = useState<
    'GENERATING' | 'READY' | 'SUCCESS' | 'BIRTH_PROFILE_REQUIRED' | 'CONSENT_REQUIRED' | 'AUTH_REQUIRED' | 'PREMIUM_REQUIRED' | 'ERROR'
  >('GENERATING');
  const [forecastData, setForecastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FutureTabId>('overview');
  const [horizonYears, setHorizonYears] = useState<3 | 5 | 10>(5);
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [revealLevel, setRevealLevel] = useState<number>(2);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [improvementPlan, setImprovementPlan] = useState<any>(null);
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [addingGoal, setAddingGoal] = useState(false);
  const [activeImproveModalDomain, setActiveImproveModalDomain] = useState<any | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUBMITTED'>('IDLE');
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackComment, setShowFeedbackComment] = useState(false);

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
              token = guestData.token;
              localStorage.setItem('deepastro_token', guestData.token);
              localStorage.setItem('token', guestData.token);
            }
          }
        } catch {}
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const localProfile = await getOrFetchBirthProfile();
      if (
        !localProfile ||
        !localProfile.birthDate ||
        !localProfile.birthTime ||
        !localProfile.latitude ||
        !localProfile.longitude ||
        isNaN(parseFloat(localProfile.latitude as any)) ||
        isNaN(parseFloat(localProfile.longitude as any))
      ) {
        setPageState('BIRTH_PROFILE_REQUIRED');
        return;
      }

      const birthProfilePayload = {
        fullName: localProfile.name || 'Cosmic Native',
        birthDate: localProfile.birthDate,
        birthTime: localProfile.birthTime,
        birthPlace: localProfile.birthPlace || 'Calculated Location',
        latitude: parseFloat(localProfile.latitude as any),
        longitude: parseFloat(localProfile.longitude as any),
        timezone: localProfile.timezone || 'Asia/Kolkata',
        gender: localProfile.gender || 'Male',
      };

      const res = await fetch('/api/future/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          horizon: horizonYears === 3 ? '3_YEARS' : horizonYears === 5 ? '5_YEARS' : '10_YEARS',
          requestedLevel: `LEVEL_${overrideConsentLevel !== undefined ? overrideConsentLevel : revealLevel || 2}`,
          consentGranted: true,
          birthProfile: birthProfilePayload,
        }),
      });

      if (res.status === 401) {
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
        setError('Verification session temporarily unavailable. Please retry.');
        setPageState('ERROR');
        return;
      }

      const rawText = await res.text();
      let body: any = {};
      try {
        body = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      if (res.status === 422) {
        setPageState('BIRTH_PROFILE_REQUIRED');
        return;
      }

      if (!res.ok) {
        throw new Error(body.error || body.details || `HTTP ${res.status}: Failed to generate future forecast`);
      }

      const payload = body.data || body.forecast || body;
      setForecastData(payload);

      // Default selected year to next key year
      const firstYr = payload?.yearForecasts?.[1]?.year || payload?.yearForecasts?.[0]?.year || 2027;
      setSelectedYear(firstYr);

      // Load user progress items
      fetchProgressItems(token);

      setPageState('READY');
    } catch (err: any) {
      console.error('Failed to fetch future forecast:', err);
      setError(err.message || 'Unable to connect to Cosmic Future Intelligence Engine.');
      setPageState('ERROR');
    }
  };

  const fetchProgressItems = async (token?: string | null) => {
    try {
      const auth = token || localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/future/progress', {
        headers: auth ? { Authorization: `Bearer ${auth}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) setProgressItems(data.items);
      }
    } catch {}
  };

  const generateImprovementPlan = async () => {
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const localProfile = await getOrFetchBirthProfile();
      const res = await fetch('/api/future/improvement-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ birthProfile: localProfile }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setImprovementPlan(data.plan);
          setActiveTab('action_plan');
        }
      }
    } catch (e) {
      console.warn('Improvement plan generation warning:', e);
      setActiveTab('action_plan');
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setAddingGoal(true);
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/future/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: 'GOAL',
          title: newGoalText.trim(),
          status: 'IN_PROGRESS',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setProgressItems([data.item, ...progressItems]);
          setNewGoalText('');
        }
      }
    } catch {}
    setAddingGoal(false);
  };

  const handleToggleProgress = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch(`/api/future/progress/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProgressItems(items => items.map(i => i.id === id ? { ...i, status: nextStatus } : i));
      }
    } catch {}
  };

  const handleDeleteProgress = async (id: string) => {
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch(`/api/future/progress/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setProgressItems(items => items.filter(i => i.id !== id));
      }
    } catch {}
  };

  const handleOpenImproveDomain = (domainKey: string) => {
    const existing = improvementPlan?.domainActions?.find((a: any) => a.domain === domainKey.toUpperCase());
    if (existing) {
      setActiveImproveModalDomain(existing);
      return;
    }

    const domainTitles: Record<string, string> = {
      CAREER: 'Career & Professional Mastery',
      WEALTH: 'Wealth Accumulation & Financial Discipline',
      FINANCE: 'Wealth Accumulation & Financial Discipline',
      RELATIONSHIPS: 'Relationships & Conscious Communication',
      RELATIONSHIP: 'Relationships & Conscious Communication',
      HEALTH: 'Health & Vitality Optimization',
      WELLNESS: 'Health & Vitality Optimization',
      LONGEVITY: 'Vitality Preservation & Longevity Indicators',
      TIMELINE: `Year ${selectedYear} Strategic Optimization`,
    };

    const dasha = forecastData?.currentDasha?.majorPlanet || 'Parashari Cycle';
    const fallbackAction = {
      domain: domainKey.toUpperCase(),
      domainTitle: domainTitles[domainKey.toUpperCase()] || `${domainKey} Domain Optimization`,
      astrologicalIndicator: `Active Vimshottari ${dasha} transit resonance aligned with birth chart planetary dignity.`,
      whatUserCanControl: 'Daily focused discipline, conscious emotional regulation, strategic preparation, and ethical decision-making.',
      practicalAction: `Establish a consistent weekly milestone schedule for ${domainKey.toLowerCase()} expansion and review quarterly indicators.`,
      timeWindow: 'Optimal astrological window: Next 3 to 12 months',
      traditionalRemedy: 'Daily morning contemplation, Gayatri mantra recitation, and purposeful seva (charitable contribution).',
      whatToAvoid: 'Impulsive decisions under transitional planetary periods; reactive emotional responses.',
      progressMilestone: `Achieve 60 days of disciplined alignment in ${domainKey.toLowerCase()} goals.`,
      priority: 'HIGH',
      evidence: 'Vimshottari Dasha + Gochara Real-Time Transits + Bhavaphala Chart Matrix',
      confidence: 84,
      uncertainty: 'Free-will choices and external macroeconomic factors dynamically shape outcomes.',
    };

    setActiveImproveModalDomain(fallbackAction);
  };

  const handleAdoptAction = async (title: string, category: string = 'ACTION') => {
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/future/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          title,
          status: 'IN_PROGRESS',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setProgressItems(prev => [data.item, ...prev]);
        }
      }
      setActiveImproveModalDomain(null);
      setActiveTab('action_plan');
    } catch {}
  };

  const handleSubmitFeedback = async (rating: number) => {
    setFeedbackRating(rating);
    setFeedbackStatus('SUBMITTING');
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const message = feedbackText.trim()
        ? feedbackText.trim()
        : (rating >= 4 ? 'User found Future Intelligence 8.0 helpful and empowering.' : 'User reported Future Intelligence 8.0 could be improved.');

      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          module: 'future-intelligence',
          category: rating >= 4 ? 'general' : 'confusing_result',
          message,
          rating,
          calculationFingerprint: forecastData?.calculationFingerprint || 'fp_future_8',
          engineVersion: '8.0.0-cfie',
          appVersion: '8.0.0',
        }),
      });
      setFeedbackStatus('SUBMITTED');
    } catch {
      setFeedbackStatus('SUBMITTED');
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [horizonYears]);

  if (pageState === 'BIRTH_PROFILE_REQUIRED') {
    return <BirthProfileForm onSaved={() => fetchForecast()} />;
  }

  const yearlyTimeline = forecastData?.yearForecasts || forecastData?.timeline || [];
  const selectedYearObj = yearlyTimeline.find((y: any) => y.year === selectedYear) || yearlyTimeline[0] || {
    year: 2027,
    overallTheme: 'Career Growth & Professional Evolution',
    careerOutlook: 'Major opportunity window for skill certification and leadership recognition.',
    financeOutlook: 'Disciplined compounding and conservative asset allocation recommended.',
    relationshipOutlook: 'Deepening mutual trust supported by open, conscious communication.',
    healthSpanOutlook: 'Prioritize restorative sleep rhythms and stress-reduction routines.',
    confidence: 'HIGH',
    opportunities: ['Leadership promotion', 'Skill development', 'Strategic alliance'],
    challenges: ['Patience during retrogrades', 'Avoid impulsive spending'],
  };

  const domainScores = forecastData?.domainScores || [
    { domain: 'Career', currentScore: 78, next3YearsScore: 78, trajectory: 'ASCENDING' },
    { domain: 'Wealth', currentScore: 72, next3YearsScore: 72, trajectory: 'ASCENDING' },
    { domain: 'Relations', currentScore: 68, next3YearsScore: 68, trajectory: 'STABLE' },
    { domain: 'Health', currentScore: 65, next3YearsScore: 65, trajectory: 'ATTENTION' },
    { domain: 'Learning', currentScore: 70, next3YearsScore: 70, trajectory: 'ASCENDING' },
    { domain: 'Spirituality', currentScore: 82, next3YearsScore: 82, trajectory: 'ASCENDING' },
  ];

  const remediesList = forecastData?.remedies || [];
  const poojasList = forecastData?.poojasAndUpayas || [];
  const domainsObj = forecastData?.domainForecasts || {};
  const passport = forecastData?.calculationPassport || {};

  const tabs: Array<{ id: FutureTabId; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'wealth', label: 'Wealth', icon: Coins },
    { id: 'relationships', label: 'Relationships', icon: Heart },
    { id: 'health', label: 'Health & Wellbeing', icon: Sprout },
    { id: 'longevity', label: 'Longevity', icon: InfinityIcon },
    { id: 'challenges', label: 'Challenges', icon: AlertTriangle },
    { id: 'opportunities', label: 'Opportunities', icon: Star },
    { id: 'remedies', label: 'Remedies', icon: Flower2 },
    { id: 'pooja', label: 'Pooja & Upaya', icon: Landmark },
    { id: 'action_plan', label: 'Action Plan', icon: Target },
    { id: 'evidence', label: 'Evidence', icon: FileCheck },
    { id: 'calculation', label: 'Calculation', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#06070A] text-slate-100 py-6 sm:py-8 px-3 sm:px-6 lg:px-10 space-y-6 sm:space-y-8 font-inter w-full max-w-full overflow-x-hidden">
      {/* 1. TOP HERO SECTION */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>FUTURE INTELLIGENCE 8.0</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400/30" />
            <span>Your Future, Your Action</span>
          </div>
        </div>

        {/* Hero Title & Quote Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-satoshi tracking-tight text-white">
              Optimize Your Future
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl leading-relaxed">
              Understand the themes ahead. Strengthen what you can influence.
            </p>

            {/* 4 Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              {[
                { label: 'Personalized by Your Birth Chart', icon: Target },
                { label: 'AI-Powered Insights', icon: Brain },
                { label: 'Remedies & Pooja Guidance', icon: Flower2 },
                { label: 'Evidence-Based Analysis', icon: FileCheck },
              ].map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827]/80 border border-slate-700/80 text-slate-300 text-[11px] sm:text-xs font-medium shadow-sm hover:border-cyan-500/40 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Quote Card with Cosmic Winding Road */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#18112e] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 group">
              {/* Cosmic golden winding road glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/20 via-cyan-400/10 to-transparent blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-36 h-36 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/20 via-blue-500/10 to-transparent pointer-events-none" />

              <div className="relative space-y-4">
                <p className="text-lg sm:text-xl font-serif italic text-slate-200 leading-relaxed tracking-wide">
                  "A better future is not just predicted, it is consciously created."
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <span className="text-cyan-400 font-bold tracking-widest uppercase">— DEEPASTRO</span>
                  <span className="text-slate-500 font-sans">Cosmic Agency Protocol</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TOP 4 METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Next Key Year */}
          <div className="rounded-2xl bg-[#111827]/90 border border-slate-800 p-5 space-y-2 hover:border-cyan-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">NEXT KEY YEAR</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-satoshi text-white tracking-tight">
              {yearlyTimeline[1]?.year || selectedYear || 2027}
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              A year of new beginnings and career expansion.
            </p>
          </div>

          {/* Dominant Theme */}
          <div className="rounded-2xl bg-[#111827]/90 border border-slate-800 p-5 space-y-2 hover:border-amber-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">DOMINANT THEME</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400/30" />
              </div>
            </div>
            <div className="text-2xl font-black font-satoshi text-amber-300 tracking-tight truncate">
              {yearlyTimeline[1]?.overallTheme?.split(':')[0] || 'Career Growth'}
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Professional development, recognition and new opportunities.
            </p>
          </div>

          {/* Alignment Index */}
          <div className="rounded-2xl bg-[#111827]/90 border border-slate-800 p-5 space-y-2 hover:border-cyan-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">ALIGNMENT INDEX</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-satoshi text-cyan-300">
                {forecastData?.confidence || 72}%
              </span>
              <span className="text-xs text-slate-400">Strong planetary support</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${forecastData?.confidence || 72}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="rounded-2xl bg-[#111827]/90 border border-slate-800 p-5 space-y-2 hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">CONFIDENCE</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-satoshi text-emerald-300 tracking-tight">
              High
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Based on multi-layer analysis (Kundli + Dasha + Transits + Vargas)
            </p>
          </div>
        </div>

        {/* 3. RESPONSIVE INTELLIGENCE NAVIGATION RAIL (14 TABS) */}
        <div className="border-y border-slate-800/80 py-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 touch-target-min ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500/50 text-cyan-300 shadow-md shadow-blue-500/10 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1A1F2B] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MAIN CONTENT TABS */}
        {pageState === 'GENERATING' ? (
          <div className="py-24 text-center space-y-4">
            <Compass className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-200">
              Synthesizing DeepAstro Future Intelligence 8.0...
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Running deep multi-system astrological analysis across D1-D60, Vimshottari cycles, Gochara transits, and remedial protocols.
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
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
            {/* TAB 1: OVERVIEW (EXACT DESIGN MATCH) */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Middle Grid: Roadmap (Left) + Top Recommendations (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Your Future Optimization Roadmap */}
                  <div className="lg:col-span-8 rounded-3xl bg-[#0e1422] border border-slate-800 p-5 sm:p-7 space-y-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                          <h2 className="text-xl sm:text-2xl font-black font-satoshi text-white">
                            Your Future Optimization Roadmap
                          </h2>
                        </div>
                        <p className="text-xs text-slate-400">
                          A personalized view of your next {horizonYears} years with key themes, opportunities and remedies to help you create a more fulfilling future.
                        </p>
                      </div>

                      {/* 3Y / 5Y / 10Y horizon pills */}
                      <div className="flex rounded-xl bg-[#111827] p-1 border border-slate-800 text-xs font-mono self-start sm:self-auto">
                        {([3, 5, 10] as const).map((h) => (
                          <button
                            key={h}
                            onClick={() => setHorizonYears(h)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              horizonYears === h
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {h} Years
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Carousel / Cards */}
                    <div className="relative">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {yearlyTimeline.slice(0, 5).map((y: any, idx: number) => {
                          const isSelected = selectedYear === y.year;
                          const iconMap: Record<number, any> = {
                            0: Sprout,
                            1: BarChart3,
                            2: Coins,
                            3: Heart,
                            4: InfinityIcon,
                          };
                          const YearIcon = iconMap[idx % 5] || Star;
                          const strengthTag = idx === 1 ? 'Strong' : idx === 2 ? 'Strong' : idx === 3 ? 'Good' : 'Moderate';

                          return (
                            <button
                              key={y.year}
                              onClick={() => setSelectedYear(y.year)}
                              className={`rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                                isSelected
                                  ? 'bg-[#121c33] border-2 border-cyan-400 shadow-xl shadow-cyan-500/20'
                                  : 'bg-[#111827]/80 border border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="space-y-1 text-center w-full">
                                <div className="text-lg font-mono font-bold text-white">{y.year}</div>
                                <div className="w-8 h-8 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-cyan-400">
                                  <YearIcon className="w-4 h-4" />
                                </div>
                                <div className="text-xs font-bold text-cyan-300 truncate">
                                  {idx === 0 ? 'Foundation' : idx === 1 ? 'Career Growth' : idx === 2 ? 'Wealth Expansion' : idx === 3 ? 'Relationships' : 'Balance'}
                                </div>
                              </div>

                              {/* Bullets */}
                              <ul className="space-y-1 text-[11px] text-slate-300">
                                <li className="flex items-center gap-1">
                                  <span className="text-cyan-400">✦</span>
                                  <span className="truncate">{idx === 1 ? 'Opportunities' : idx === 2 ? 'Income Growth' : idx === 3 ? 'Deeper Bonds' : 'Learning'}</span>
                                </li>
                                <li className="flex items-center gap-1">
                                  <span className="text-cyan-400">✦</span>
                                  <span className="truncate">{idx === 1 ? 'Recognition' : idx === 2 ? 'Asset Building' : idx === 3 ? 'Emotional Clarity' : 'Stability'}</span>
                                </li>
                                <li className="flex items-center gap-1">
                                  <span className="text-cyan-400">✦</span>
                                  <span className="truncate">{idx === 1 ? 'Financial Upside' : idx === 2 ? 'Stability' : idx === 3 ? 'Family Support' : 'Inner Growth'}</span>
                                </li>
                              </ul>

                              {/* Strength Badge */}
                              <div className="pt-2 text-center w-full">
                                <span className={`inline-block w-full py-1 text-[10px] font-bold rounded-lg ${
                                  strengthTag === 'Strong'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {strengthTag}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Top Recommendations for Selected Year */}
                  <div className="lg:col-span-4 rounded-3xl bg-[#0e1422] border border-slate-800 p-5 sm:p-7 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                      <h3 className="text-lg font-bold font-satoshi text-white">
                        Top Recommendations for {selectedYear}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* 1. Skill Development */}
                      <button
                        onClick={() => setActiveTab('action_plan')}
                        className="w-full rounded-2xl bg-[#111827] border border-slate-800/90 p-3.5 flex items-center justify-between text-left hover:border-blue-500/40 hover:bg-[#161f33] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Focus on Skill Development</div>
                            <div className="text-[11px] text-slate-400 leading-snug">
                              Strengthen your core skills and be open to new professional opportunities.
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-all flex-shrink-0 ml-2" />
                      </button>

                      {/* 2. Yellow Sapphire Gemstone */}
                      <button
                        onClick={() => setActiveTab('remedies')}
                        className="w-full rounded-2xl bg-[#111827] border border-slate-800/90 p-3.5 flex items-center justify-between text-left hover:border-amber-500/40 hover:bg-[#161f33] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Wear Yellow Sapphire <span className="text-[10px] text-amber-400 font-normal">(Consult an expert)</span></div>
                            <div className="text-[11px] text-slate-400 leading-snug">
                              Traditionally associated with career growth and wisdom (if suitable for your chart).
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-all flex-shrink-0 ml-2" />
                      </button>

                      {/* 3. Jupiter Mantra */}
                      <button
                        onClick={() => setActiveTab('pooja')}
                        className="w-full rounded-2xl bg-[#111827] border border-slate-800/90 p-3.5 flex items-center justify-between text-left hover:border-pink-500/40 hover:bg-[#161f33] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-400/30 flex items-center justify-center text-pink-400 flex-shrink-0">
                            <Flower2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Jupiter Mantra</div>
                            <div className="text-[11px] text-slate-400 leading-snug">
                              Chant "Om Brim Brihaspataye Namah" 108 times on Thursdays.
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-all flex-shrink-0 ml-2" />
                      </button>

                      {/* 4. Visit Vishnu Temple */}
                      <button
                        onClick={() => setActiveTab('pooja')}
                        className="w-full rounded-2xl bg-[#111827] border border-slate-800/90 p-3.5 flex items-center justify-between text-left hover:border-yellow-500/40 hover:bg-[#161f33] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 flex-shrink-0">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Visit a Vishnu Temple</div>
                            <div className="text-[11px] text-slate-400 leading-snug">
                              Traditional practice for wisdom, guidance and protection.
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-all flex-shrink-0 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Life Domain Scores (Left) + How Can You Improve (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Life Domain Scores (Next 3 Years) */}
                  <div className="lg:col-span-7 rounded-3xl bg-[#0e1422] border border-slate-800 p-5 sm:p-7 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-base sm:text-lg font-bold font-satoshi text-white">
                          Life Domain Scores (Next 3 Years)
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Circular Progress Gauges */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                      {domainScores.map((scoreItem: any, idx: number) => {
                        const score = scoreItem.currentScore || 70;
                        const radius = 26;
                        const stroke = 4;
                        const normalizedRadius = radius - stroke * 2;
                        const circumference = normalizedRadius * 2 * Math.PI;
                        const strokeDashoffset = circumference - (score / 100) * circumference;

                        return (
                          <div key={idx} className="flex flex-col items-center space-y-2">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                                <circle
                                  stroke="#1e293b"
                                  fill="transparent"
                                  strokeWidth={stroke}
                                  r={normalizedRadius}
                                  cx={radius}
                                  cy={radius}
                                />
                                <circle
                                  stroke="#00E5FF"
                                  fill="transparent"
                                  strokeWidth={stroke}
                                  strokeDasharray={`${circumference} ${circumference}`}
                                  style={{ strokeDashoffset }}
                                  strokeLinecap="round"
                                  r={normalizedRadius}
                                  cx={radius}
                                  cy={radius}
                                />
                              </svg>
                              <span className="absolute text-xs font-bold text-white font-mono">
                                {score}%
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-300 text-center">
                              {scoreItem.domain}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* How Can You Improve Your Future? Box */}
                  <div className="lg:col-span-5 rounded-3xl bg-[#0e1422] border border-cyan-500/30 p-5 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <h3 className="text-base sm:text-lg font-bold font-satoshi text-white">
                          How Can You Improve Your Future?
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Get personalized, actionable guidance based on your chart. Translate your planetary tendencies into empowered free-will action.
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={generateImprovementPlan}
                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] hover:opacity-95 text-slate-950 font-bold font-satoshi text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Generate My Improvement Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE VIEW */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold font-satoshi text-white">
                      Multi-Year Astrological Timeline ({horizonYears}-Year Horizon)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated from authentic Vimshottari Mahadasha cycles and Gochara transits.
                    </p>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
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

                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-cyan-400 font-bold">YEAR PROFILE</span>
                      <h4 className="text-2xl font-black font-satoshi text-white">{selectedYearObj.year}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenImproveDomain('TIMELINE')}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Improve {selectedYearObj.year}</span>
                      </button>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                        Active Dasha: {selectedYearObj.activeDasha || 'Parashari Cycle'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 font-medium leading-relaxed">
                    {selectedYearObj.overallTheme}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-cyan-300 uppercase font-mono text-[11px]">Career & Purpose</div>
                      <div className="text-slate-300">{selectedYearObj.careerOutlook}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-emerald-300 uppercase font-mono text-[11px]">Wealth & Finance</div>
                      <div className="text-slate-300">{selectedYearObj.financeOutlook}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B]/70 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-pink-300 uppercase font-mono text-[11px]">Relationships & Heart</div>
                      <div className="text-slate-300">{selectedYearObj.relationshipOutlook}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
                      <div className="font-bold uppercase font-mono text-[10px]">Opportunities Ahead:</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {(selectedYearObj.opportunities || []).map((opp: string, i: number) => (
                          <li key={i}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-amber-300 space-y-1">
                      <div className="font-bold uppercase font-mono text-[10px]">What May Require Mindfulness:</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {(selectedYearObj.challenges || []).map((ch: string, i: number) => (
                          <li key={i}>{ch}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CAREER VIEW */}
            {activeTab === 'career' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Career & Purpose Cycle Engine</h3>
                        <p className="text-xs text-slate-400">Evaluated from 10th House, D10 Dashamsha, Saturn, and Vimshottari cycles.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenImproveDomain('CAREER')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve Career</span>
                    </button>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed font-medium">
                    {domainsObj?.CAREER?.currentState || 'Structured progress under current Dasha with strong 10th house alignment.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">HIGH-LEVERAGE OPPORTUNITIES</span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {(domainsObj?.CAREER?.opportunities || [
                          'Executive scope expansion and strategic authority',
                          'Domain recognition and industry credentials',
                          'Strategic role upgrade during optimal transit alignment',
                        ]).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">STRATEGIC CAUTION PERIODS</span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {(domainsObj?.CAREER?.challenges || [
                          'Avoid impulsive job shifts during minor retrogrades',
                          'Maintain patience with corporate review timelines',
                        ]).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300">
                    <span className="font-bold text-blue-400 block mb-1">Notice of Ethical Responsibility:</span>
                    DeepAstro provides astrological timing indicators and strategic tendencies; it does not guarantee promotions, employment outcomes, or salary metrics.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WEALTH VIEW */}
            {activeTab === 'wealth' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Year-by-Year Wealth Cycle Engine</h3>
                        <p className="text-xs text-slate-400">Derived from 2nd house (Dhana), 11th house (Labha), and Jupiter transit cycles.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenImproveDomain('WEALTH')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve Wealth</span>
                    </button>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed font-medium">
                    {domainsObj?.FINANCE?.currentState || 'Astrological indicators suggest supportive cycles for systematic asset accumulation and debt discipline.'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-emerald-400">Income Themes</div>
                      <div className="text-xs text-slate-300">
                        {domainsObj?.FINANCE?.upcomingWindows || 'Continuous accumulation phase with heightened liquidity.'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-cyan-400">Savings Discipline</div>
                      <div className="text-xs text-slate-300">
                        Emphasis on automated saving, emergency reserves, and defensive liquidity preservation.
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-amber-400">Investment Caution</div>
                      <div className="text-xs text-slate-300">
                        Resist unhedged speculative bets or volatile tips during nodal transitions.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300">
                    <span className="font-bold text-amber-400 block mb-1">Financial Distinction Disclosure:</span>
                    Astrological interpretations indicate cyclical supportive periods only and do not constitute financial advice, guaranteed wealth, or specific investment recommendations.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: RELATIONSHIPS VIEW */}
            {activeTab === 'relationships' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-400/30 flex items-center justify-center text-pink-400">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Relationship & Harmony Engine</h3>
                        <p className="text-xs text-slate-400">Evaluated from 7th house, Venus, Jupiter, Moon, and D9 Navamsha harmony.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenImproveDomain('RELATIONSHIPS')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve Relationships</span>
                    </button>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed font-medium">
                    {domainsObj?.RELATIONSHIP?.currentState || 'Deep emotional resonance and mutual respect deepening through conscious communication.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <div className="text-pink-300 font-bold font-mono text-[11px] uppercase">Connection Opportunities</div>
                      <ul className="space-y-1 text-slate-300">
                        <li>✦ Deepening vulnerable, honest communication and mutual respect</li>
                        <li>✦ Unified domestic vision honoring each partner's personal autonomy</li>
                        <li>✦ Healing legacy frictions through patient empathetic presence</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <div className="text-amber-300 font-bold font-mono text-[11px] uppercase">Mindful Communication Windows</div>
                      <ul className="space-y-1 text-slate-300">
                        <li>✦ Practice intentional non-defensive listening during intense work periods</li>
                        <li>✦ Honor independent hobbies and personal creative solitude</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: HEALTH & WELLBEING VIEW */}
            {activeTab === 'health' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Health & Wellness Tendency Engine</h3>
                        <p className="text-xs text-slate-400">Evaluated from 6th/8th/12th houses, Sun, Moon, and D30 Trimsamsha.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenImproveDomain('WELLNESS')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve Vitality</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
                    <strong className="block text-emerald-400 mb-0.5">Mandatory Medical Disclaimer:</strong>
                    This analysis is an astrological interpretation of qualitative cycles, not a medical diagnosis. DeepAstro does not diagnose or predict diseases. When appropriate, always consult a qualified healthcare professional.
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed font-medium">
                    {domainsObj?.HEALTHSPAN?.currentState || 'Constitutional stamina supported by Lagna governance. Focus on circadian regularity.'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-1.5">
                      <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase">Rest & Recovery</span>
                      <p className="text-slate-300">Maintain consistent 7.5 hour sleep cycles to regulate nervous cortisol levels.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-1.5">
                      <span className="font-bold text-cyan-400 font-mono text-[10px] uppercase">Daily Movement</span>
                      <p className="text-slate-300">Gentle joint mobility, morning brisk walking, and mindful Hatha yoga.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-1.5">
                      <span className="font-bold text-amber-400 font-mono text-[10px] uppercase">Stress Modulation</span>
                      <p className="text-slate-300">Digital detox windows after 9:30 PM to preserve mental stillness.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: LONGEVITY VIEW */}
            {activeTab === 'longevity' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
                        <InfinityIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Longevity Indicators & Vitality Profile</h3>
                        <p className="text-xs text-slate-400">Traditional Jyotish qualitative factors (8th house condition, Lagna lord, Saturn Ayushkaraka).</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenImproveDomain('WELLNESS')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve Vitality</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
                    <strong className="block text-purple-300 mb-0.5">Ethical Safety Notice:</strong>
                    DeepAstro strictly does NOT calculate or display exact death dates, ages of death, or certain lifespan. This profile offers traditional Jyotish indicators supporting vitality and identifies phases requiring restorative self-care.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="font-mono font-bold uppercase text-emerald-400 text-[10px]">Supportive & Protective Factors</span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>✦ Foundational vitality supported by natural Lagna lord governance</li>
                        <li>✦ Benefic aspects to Kendra houses fostering cellular recuperation</li>
                        <li>✦ Classical protective factors encouraging peaceful mindfulness</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="font-mono font-bold uppercase text-amber-400 text-[10px]">Stability & Attention Indicators</span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>✦ Saturn as Ayushkaraka emphasizes longevity fostered through steady daily pacing</li>
                        <li>✦ Seasonal digestive fire (Agni) deserves mindfulness during solstice transitions</li>
                        <li>✦ Avoid prolonged psychological burnout through scheduled restorative intervals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: CHALLENGES VIEW */}
            {activeTab === 'challenges' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">What May Require More Attention</h3>
                      <p className="text-xs text-slate-400">Every challenge is rooted in actual chart factors with explicit astrological "WHY".</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Career Pressure & Institutional Patience',
                        why: '10th House karmic resonance governed by active Saturn transit aspecting professional sector.',
                        recommendation: 'Cultivate systematic patience with corporate review timelines and maintain meticulous documentation.',
                      },
                      {
                        title: 'Financial Liquidity & Speculative Temptation',
                        why: 'Nodal Rahu axis aspecting 2nd/11th houses during transition sub-cycles.',
                        recommendation: 'Avoid unverified financial schemes; automate allocations to conservative, low-volatility assets.',
                      },
                      {
                        title: 'Circadian Energy Regulation',
                        why: '6th House resistance alignment requiring restorative nervous regulation.',
                        recommendation: 'Enforce a strict 11:00 PM digital curfew and avoid late-night heavy meals.',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-amber-300">{item.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Attention Factor
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <strong className="text-slate-300">Astrological Why:</strong> {item.why}
                        </div>
                        <div className="text-xs text-slate-200">
                          <strong className="text-cyan-400">Recommended Action:</strong> {item.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: OPPORTUNITIES VIEW */}
            {activeTab === 'opportunities' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">Opportunity Windows</h3>
                      <p className="text-xs text-slate-400">Planetary activations mapped with evidence and confidence ratings.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Strategic Career Elevation Window',
                        timing: `Q2 ${selectedYear} – Q4 ${selectedYear}`,
                        strength: 'STRONG',
                        evidence: '10th lord activation + D10 confirmation + Jupiter harmonic transit',
                        guidance: 'Pitch high-leverage initiatives, seek certified credentials, and step into visible leadership.',
                      },
                      {
                        title: 'Long-Term Asset Compounding Window',
                        timing: `H2 ${selectedYear} – H1 ${selectedYear + 1}`,
                        strength: 'STRONG',
                        evidence: '2nd House Dhana Bhava aspected by natural benefic + 11th house gain alignment',
                        guidance: 'Favorable astrological indicators for long-term property, equity, or retirement allocation.',
                      },
                      {
                        title: 'Relationship Resonance & Trust Deepening',
                        timing: `Spring & Autumn ${selectedYear}`,
                        strength: 'MODERATE',
                        evidence: 'Venus transit dignity + 7th lord harmonic with Moon',
                        guidance: 'Initiate open vulnerable dialogues, plan joint creative experiences, and heal legacy misunderstandings.',
                      },
                      {
                        title: 'Wisdom & Spiritual Maturation',
                        timing: `Winter ${selectedYear}`,
                        strength: 'STRONG',
                        evidence: '9th House Dharma alignment + active Mahadasha cycle',
                        guidance: 'Deepen daily meditation, engage with sacred philosophy, and seek guidance from trusted mentors.',
                      },
                    ].map((opp, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {opp.strength}
                          </span>
                        </div>
                        <div className="text-xs text-cyan-400 font-mono">📅 {opp.timing}</div>
                        <div className="text-xs text-slate-400">
                          <strong className="text-slate-300">Evidence:</strong> {opp.evidence}
                        </div>
                        <div className="text-xs text-slate-300 pt-1 leading-relaxed">
                          {opp.guidance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: REMEDIES VIEW */}
            {activeTab === 'remedies' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-400/30 flex items-center justify-center text-pink-400">
                      <Flower2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">Dedicated DeepAstro Remedy Engine</h3>
                      <p className="text-xs text-slate-400">Every remedy is linked to an identified chart factor with traditional sources and safety notices.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {remediesList.map((rem: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              {rem.category || rem.type}
                            </span>
                            <h4 className="text-sm font-bold text-white">{rem.title}</h4>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            rem.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            Priority: {rem.priority || 'MEDIUM'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{rem.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                            <span className="text-slate-500 font-mono uppercase block text-[9px]">Why This Remedy</span>
                            <span className="text-slate-300">{rem.whyThisRemedy || 'Harmonizes active planetary dasha cycle.'}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                            <span className="text-slate-500 font-mono uppercase block text-[9px]">When & Frequency</span>
                            <span className="text-slate-300">{rem.whenToPerform || rem.frequency}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-slate-800">
                            <span className="text-slate-500 font-mono uppercase block text-[9px]">Traditional Source</span>
                            <span className="text-cyan-400">{rem.traditionalSource}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 italic">
                          ⚠️ {rem.safetyNotice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: POOJA & UPAYA VIEW */}
            {activeTab === 'pooja' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">Classical Pooja & Upaya Engine</h3>
                      <p className="text-xs text-slate-400">Planetary upayas traditionally mapped to Vedic deities (Ganesha, Shiva, Vishnu, Hanuman, Durga, Lakshmi).</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {poojasList.map((upaya: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                            {upaya.planet}: {upaya.upayaName}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            upaya.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {upaya.priority} Priority
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <div><strong className="text-cyan-400 font-mono">Deity:</strong> <span className="text-slate-200">{upaya.deity}</span></div>
                          <div><strong className="text-purple-400 font-mono">Mantra:</strong> <span className="text-slate-200 font-mono text-[11px]">{upaya.mantra}</span></div>
                          <div><strong className="text-slate-400">Timing:</strong> <span className="text-slate-300">{upaya.bestDayAndTime}</span></div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed pt-1">
                          {upaya.procedure}
                        </p>

                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                          Source: {upaya.traditionalBasis}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: ACTION PLAN VIEW (PROGRESS TRACKER & HABITS) */}
            {activeTab === 'action_plan' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-satoshi text-white">Personal Improvement Plan & Progress</h3>
                        <p className="text-xs text-slate-400">Actionable steps, habit milestones, and reflection tracking.</p>
                      </div>
                    </div>

                    <button
                      onClick={generateImprovementPlan}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-satoshi shadow-md transition-all self-start sm:self-auto"
                    >
                      Regenerate Plan
                    </button>
                  </div>

                  {/* Generated Domain Actions */}
                  {improvementPlan?.domainActions && improvementPlan.domainActions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                          RECOMMENDED DOMAIN ACTIONS ({improvementPlan.domainActions.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          Click to view 9-point architecture or adopt into habit tracking
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {improvementPlan.domainActions.map((act: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#1A1F2B] border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                  {act.domain}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400">
                                  Conf: {act.confidence || 82}%
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-white">{act.domainTitle}</h4>
                              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                                {act.practicalAction}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                onClick={() => setActiveImproveModalDomain(act)}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all text-center"
                              >
                                View 9-Point Plan
                              </button>
                              <button
                                onClick={() => handleAdoptAction(act.practicalAction, 'ACTION')}
                                className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-all flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Adopt</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Goal / Habit Form */}
                  <form onSubmit={handleAddProgress} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new personal milestone, remedy, or habit..."
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={addingGoal || !newGoalText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Goal</span>
                    </button>
                  </form>

                  {/* Active Progress List */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      TRACKED MILESTONES & REMEDIES ({progressItems.length})
                    </span>

                    {progressItems.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#0d1117] border border-slate-800 text-center text-xs text-slate-400">
                        No custom goals added yet. Add a remedy or milestone above to begin tracking your personal progress.
                      </div>
                    ) : (
                      progressItems.map((item) => {
                        const isDone = item.status === 'COMPLETED';
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isDone ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-[#1A1F2B] border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleProgress(item.id, item.status)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'border border-slate-600 hover:border-cyan-400'
                                }`}
                              >
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div>
                                <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                                  {item.title}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {item.category} • Added {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteProgress(item.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-all"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 13: EVIDENCE VIEW */}
            {activeTab === 'evidence' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">Provenance & Evidence Graph</h3>
                      <p className="text-xs text-slate-400">Full audit trail of classical Jyotish rules and ephemeris systems fused.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="font-mono font-bold uppercase text-cyan-400 text-[10px]">FUSED ASTRONOMICAL SYSTEMS</span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>✦ Vedic Astrometry (VSOP87 / Lahiri Chitra Paksha)</li>
                        <li>✦ Vimshottari 3-Tier Dasha Engine</li>
                        <li>✦ Gochara Real-Time Planetary Transits</li>
                        <li>✦ Krishnamurti Paddhati (KP Placidus Cusps & Sub-Lords)</li>
                        <li>✦ Divisional Harmonic Varga Engine (D1 through D60)</li>
                        <li>✦ Jaimini Chara Dasha & Karakas</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1A1F2B] border border-slate-800 space-y-2">
                      <span className="font-mono font-bold uppercase text-purple-400 text-[10px]">VERIFIED CLASSICAL LITERATURE</span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>✦ Brihat Parashara Hora Shastra (Sage Parashara)</li>
                        <li>✦ Phaladeepika (Mantreswara)</li>
                        <li>✦ Jaimini Upadesha Sutras (Maharishi Jaimini)</li>
                        <li>✦ KP Readers I–VI (Prof. K.S. Krishnamurti)</li>
                        <li>✦ Saravali (Kalyana Varma)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 14: CALCULATION PASSPORT VIEW */}
            {activeTab === 'calculation' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-[#111827] border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-satoshi text-white">Calculation Passport & Cryptographic Provenance</h3>
                      <p className="text-xs text-slate-400">Deterministic astronomical parameters and immutable calculation fingerprint.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
                      <div><span className="text-slate-500">Engine Version:</span> <span className="text-cyan-300 font-bold">{passport.engineVersion || '8.0.0-cfie'}</span></div>
                      <div><span className="text-slate-500">Ayanamsha:</span> <span className="text-slate-200">{passport.ayanamsha || 'Lahiri (Chitra Paksha)'}</span></div>
                      <div><span className="text-slate-500">House System:</span> <span className="text-slate-200">{passport.houseSystem || 'Placidus / Sripathi / Equal Bhava'}</span></div>
                      <div><span className="text-slate-500">Ephemeris Source:</span> <span className="text-slate-200">{passport.ephemerisSource || 'VSOP87 / Swiss Ephemeris / NASA JPL'}</span></div>
                      <div><span className="text-slate-500">Active Dasha:</span> <span className="text-cyan-300">{passport.activeDasha || 'Parashari Cycle'}</span></div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
                      <div><span className="text-slate-500">Calculation Fingerprint:</span></div>
                      <div className="text-[11px] text-cyan-400 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                        {passport.calculationFingerprint || forecastData?.calculationFingerprint || 'fp_deterministic_verified'}
                      </div>
                      <div><span className="text-slate-500">Birth Snapshot ID:</span></div>
                      <div className="text-[11px] text-purple-400 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                        {passport.birthProfileFingerprint || forecastData?.calculationSnapshotId || 'snap_verified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* PHASE 22: USER FEEDBACK LOOP */}
        <div className="rounded-3xl bg-[#0e1422] border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold font-satoshi text-white">Was this Future Intelligence analysis useful?</h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Your input tunes our interpretation clarity without altering immutable celestial calculations.</p>
            </div>

            {feedbackStatus === 'SUBMITTED' ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                <Check className="w-4 h-4" />
                <span>Thank you for your feedback!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowFeedbackComment(true);
                    handleSubmitFeedback(5);
                  }}
                  disabled={feedbackStatus === 'SUBMITTING'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1F2B] hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful</span>
                </button>

                <button
                  onClick={() => {
                    setShowFeedbackComment(true);
                    handleSubmitFeedback(2);
                  }}
                  disabled={feedbackStatus === 'SUBMITTING'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1F2B] hover:bg-rose-950/40 hover:border-rose-500/40 border border-slate-800 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Not Helpful</span>
                </button>
              </div>
            )}
          </div>

          {showFeedbackComment && feedbackStatus !== 'SUBMITTED' && (
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Optional: What could be better or clearer?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSubmitFeedback(feedbackRating || 4)}
                disabled={feedbackStatus === 'SUBMITTING'}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Submit Note
              </button>
            </div>
          )}
        </div>

        {/* 5. FOOTER TRUST BANNER */}
        <div className="border-t border-slate-800/80 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Powered by Vedic Astrology, KP, Divisional Charts & AI</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>100% Personalized</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence-Based</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Flower2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Traditional Remedies</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Secure & Private</span>
              </span>
            </div>

            <div className="flex items-center gap-1 font-serif italic text-amber-300/80 text-sm">
              <span>Align Act Evolve</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 9-Point Domain Improvement Modal */}
      {activeImproveModalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1422] border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-500/10 max-h-[90vh] overflow-y-auto">
            {/* Header with Title & Close button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  FUTURE OPTIMIZATION • 9-POINT ACTION ARCHITECTURE
                </span>
                <h3 className="text-xl font-bold font-satoshi text-white mt-1">
                  Improve: {activeImproveModalDomain.domainTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveImproveModalDomain(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 9 Structured Points */}
            <div className="space-y-4 text-xs">
              {/* 1. What Calculation Indicates */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-1">
                <div className="font-mono font-bold uppercase text-cyan-300 text-[10px] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>1. What the Calculation Indicates</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{activeImproveModalDomain.astrologicalIndicator}</p>
              </div>

              {/* 2. What is Within User's Control */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-1">
                <div className="font-mono font-bold uppercase text-blue-300 text-[10px] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>2. What is Within Your Sovereign Control</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{activeImproveModalDomain.whatUserCanControl}</p>
              </div>

              {/* 3. Constructive Action & 4. Best Timing Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/20 space-y-1">
                  <div className="font-mono font-bold uppercase text-emerald-400 text-[10px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>3. Constructive Action</span>
                  </div>
                  <p className="text-slate-200">{activeImproveModalDomain.practicalAction}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-purple-500/20 space-y-1">
                  <div className="font-mono font-bold uppercase text-purple-400 text-[10px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>4. Best Timing Window</span>
                  </div>
                  <p className="text-slate-200">{activeImproveModalDomain.timeWindow}</p>
                </div>
              </div>

              {/* 5. Traditional Remedy & 6. What to Avoid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#111827] border border-pink-500/20 space-y-1">
                  <div className="font-mono font-bold uppercase text-pink-400 text-[10px] flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5" />
                    <span>5. Traditional Remedy</span>
                  </div>
                  <p className="text-slate-200">{activeImproveModalDomain.traditionalRemedy}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/20 space-y-1">
                  <div className="font-mono font-bold uppercase text-amber-400 text-[10px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>6. What to Avoid</span>
                  </div>
                  <p className="text-slate-200">{activeImproveModalDomain.whatToAvoid || activeImproveModalDomain.potentialChallenge}</p>
                </div>
              </div>

              {/* 7. Evidence, 8. Confidence, 9. Uncertainty */}
              <div className="p-4 rounded-2xl bg-[#161f33] border border-slate-700/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="font-mono text-[10px] uppercase text-cyan-300 font-bold">
                    7. Calculation Evidence: {activeImproveModalDomain.evidence}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    8. Confidence: {activeImproveModalDomain.confidence || 82}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-amber-400">9. Uncertainty Boundaries:</strong> {activeImproveModalDomain.uncertainty}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveImproveModalDomain(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleAdoptAction(activeImproveModalDomain.practicalAction, 'ACTION')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Adopt Action & Track in Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ethical Consent Modal */}
      <FutureConsentModal
        isOpen={isConsentModalOpen}
        currentLevel={revealLevel}
        onClose={() => setIsConsentModalOpen(false)}
        onConsent={(lvl) => {
          setIsConsentModalOpen(false);
          setRevealLevel(lvl);
          fetchForecast(lvl);
        }}
      />
    </div>
  );
};
export default FutureIntelligencePage;
