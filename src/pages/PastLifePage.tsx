import React, { useState, useEffect } from 'react';
import { Sparkles, History, RefreshCw, AlertCircle, Share2, Printer, Compass, Layers, MapPin, Calendar, Clock, User } from 'lucide-react';
import { PastLifeInsightCard } from '../components/astrology/PastLifeInsightCard';
import { SoulJourneyCard } from '../components/astrology/SoulJourneyCard';
import { DeepSoulJourneyCard, SoulJourneyModuleId } from '../components/astrology/DeepSoulJourneyCard';
import { KarmicPatternsCard } from '../components/astrology/KarmicPatternsCard';
import { SoulLessonsCard } from '../components/astrology/SoulLessonsCard';
import { LifePurposeCard } from '../components/astrology/LifePurposeCard';
import { getBirthProfile, getOrFetchBirthProfile, saveBirthProfile } from '../utils/birthStorage.js';

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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`
      );
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

  const inp = "w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all";
  const label = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-b from-[#120d00]/80 to-[#0a0c14] border border-amber-500/30 p-6 shadow-2xl shadow-amber-900/20">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">BIRTH PROFILE REQUIRED</div>
            <h3 className="text-lg font-bold text-slate-100">Enter Your Birth Details</h3>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          SoulTrace Engine requires your exact birth data to calculate karmic patterns and past-life archetypes from your Vedic chart.
        </p>
        {saveSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-4xl">✨</div>
            <div className="text-sm font-bold text-amber-400">Birth profile saved! Calculating your soul journey...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}><User className="inline w-3 h-3 mr-1" />Full Name</label>
                <input className={inp} placeholder="Your full name" value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
              </div>
              <div>
                <label className={label}><span className="mr-1">⚧</span>Gender</label>
                <select className={inp} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={label}><Calendar className="inline w-3 h-3 mr-1" />Birth Date</label>
                <input type="date" className={inp} value={form.birthDate}
                  onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} required />
              </div>
              <div>
                <label className={label}><Clock className="inline w-3 h-3 mr-1" />Birth Time</label>
                <input type="time" className={inp} value={form.birthTime}
                  onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))} required />
              </div>
              <div className="sm:col-span-2">
                <label className={label}><MapPin className="inline w-3 h-3 mr-1" />Birth Place</label>
                <input className={inp} placeholder="City, Country (e.g. Mumbai, India)"
                  value={form.birthPlace}
                  onChange={e => setForm(f => ({ ...f, birthPlace: e.target.value }))}
                  onBlur={e => { if (e.target.value.length > 3) geocode(e.target.value); }}
                  required />
                {form.latitude && <p className="text-[11px] text-amber-400 mt-1 font-mono">📍 {form.latitude}, {form.longitude} (auto-detected)</p>}
              </div>
              <div>
                <label className={label}>Latitude</label>
                <input type="number" step="0.0001" className={inp} placeholder="e.g. 19.0760"
                  value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
              </div>
              <div>
                <label className={label}>Longitude</label>
                <input type="number" step="0.0001" className={inp} placeholder="e.g. 72.8777"
                  value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Timezone</label>
                <select className={inp} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                  {['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Australia/Sydney', 'Pacific/Auckland'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            {saveError && <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-xl px-3 py-2">{saveError}</div>}
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm transition-all shadow-lg shadow-amber-900/30 disabled:opacity-60">
              {saving ? '⟳ Saving...' : '✦ Save & Reveal My Soul Journey'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---
export const PastLifePage: React.FC = () => {
  const [format, setFormat] = useState<'insight_card' | 'soul_journey'>('soul_journey');
  const [activeModule, setActiveModule] = useState<SoulJourneyModuleId>('karmic_patterns');
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<any>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [needsBirthProfile, setNeedsBirthProfile] = useState(false);

  const getToken = () => localStorage.getItem('deepastro_token') || localStorage.getItem('token');

  const fetchPastLife = async (formatChoice: 'insight_card' | 'soul_journey' = format) => {
    setLoading(true);
    setError(null);
    setNeedsBirthProfile(false);
    try {
      let token = getToken();
      if (!token) {
        try {
          const gRes = await fetch('/api/auth/guest-session', { method: 'POST' });
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.token) {
              const validToken = String(gData.token);
              token = validToken;
              localStorage.setItem('deepastro_token', validToken);
              localStorage.setItem('token', validToken);
            }
          }
        } catch {}
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Read local canonical profile so user's real calculation parameters seamlessly flow into past life engine
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
        setNeedsBirthProfile(true);
        setLoading(false);
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

      const res = await fetch('/api/intelligence/past-life/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          format: formatChoice,
          birthProfile: birthProfilePayload,
        }),
      });

      // Defensive HTTP inspection & safe reading (prevents 'Unexpected end of JSON input')
      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status} ${res.statusText || 'Error'})`);
      }

      if (res.status === 401) {
        try {
          const gRes = await fetch('/api/auth/guest-session', { method: 'POST' });
          const gData = await gRes.json();
          if (gData.token) {
            localStorage.setItem('deepastro_token', gData.token);
            localStorage.setItem('token', gData.token);
            fetchPastLife(formatChoice);
            return;
          }
        } catch {}
        setError('Verification session unavailable. Please retry.');
        setLoading(false);
        return;
      }

      // Missing birth profile → show inline form
      if (!res.ok && (data?.error === 'PAST_LIFE_ANALYSIS_UNAVAILABLE' || data?.missingFields?.length > 0)) {
        setNeedsBirthProfile(true);
        setLoading(false);
        return;
      }

      if (!res.ok || (!data?.schema && !data?.data)) {
        throw new Error(data?.message || data?.error || `Failed to generate past life insight (HTTP ${res.status})`);
      }

      const activeSchema = data.schema || data.data;
      setReading(activeSchema);
      setCardData(data.card);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch('/api/intelligence/past-life/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (data?.readings) setHistory(data.readings);
    } catch {
      // Non-blocking history fetch
    }
  };

  const handleFeedback = async (sentiment: string) => {
    if (!reading) return;
    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/intelligence/past-life/${reading.id}/feedback`, {
        method: 'POST', headers, body: JSON.stringify({ sentiment }),
      });
      setFeedbackSent(sentiment);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPastLife();
    loadHistory();
  }, []);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share && reading) {
      try {
        await navigator.share({
          title: `DeepAstro Past Life: ${reading.archetype?.primary}`,
          text: `My DeepAstro past-life reading revealed the ${reading.archetype?.primary} archetype. Check out your soul journey on DeepAstro!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#04060B] text-slate-100 p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Top Header & Navigation Bar */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SOULTRACE ENGINE v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-200">
            Past Life Intelligence & Soul Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Discover the karmic themes, symbolic patterns and spiritual lessons reflected in your chart.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Format Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {(['soul_journey', 'insight_card'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFormat(f); if (!needsBirthProfile) fetchPastLife(f); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${format === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {f === 'soul_journey' ? <><Layers className="inline w-3 h-3 mr-1" />Journey</> : <><Compass className="inline w-3 h-3 mr-1" />Dossier</>}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setReading(null); setCardData(null); fetchPastLife(); }}
            disabled={loading || needsBirthProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer">
            <History className="w-3 h-3" />History
          </button>
          <button onClick={handlePrint} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all cursor-pointer">
            <Printer className="w-4 h-4" />
          </button>
          {reading && (
            <button onClick={handleShare} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all cursor-pointer">
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="max-w-5xl mx-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Past Readings</div>
          {history.map((h: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-cyan-300 font-semibold">{h.archetype?.primary || 'Soul Reading'}</span>
              <span className="text-slate-500">{h.generatedAt ? new Date(h.generatedAt).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">
        {loading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="text-sm font-mono text-cyan-300">
              CONSULTING IMMUTABLE CALCULATION CORE & JAIMINI SUTRAS...
            </div>
            <p className="text-xs text-slate-500">
              Evaluating Ketu, 12th House, Purva Punya, Atmakaraka, and Vishnu Purana philosophical themes
            </p>
          </div>
        )}

        {/* Inline Birth Profile Form */}
        {needsBirthProfile && !loading && (
          <BirthProfileForm onSaved={() => {
            setNeedsBirthProfile(false);
            fetchPastLife();
          }} />
        )}

        {error && !loading && !needsBirthProfile && (
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs space-y-3 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <div className="font-bold text-sm">Calculation Error</div>
            <p className="text-slate-300">{error}</p>
            <button onClick={() => fetchPastLife()} className="px-4 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-800/50 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && !needsBirthProfile && reading && (
          <div className="space-y-10">
            {format === 'soul_journey' ? (
              <div className="space-y-10">
                {/* Hero Feature Card: Deep Soul Journey */}
                <DeepSoulJourneyCard
                  activeModule={activeModule}
                  onSelectModule={(mod) => {
                    setActiveModule(mod);
                    setTimeout(() => {
                      const el = document.getElementById('soul-journey-active-module');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  onExploreClick={() => {
                    const el = document.getElementById('soul-journey-active-module');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  fingerprint={reading.calculationFingerprint || reading.calculation_snapshot_id}
                />

                {/* Active Interactive Module */}
                <div id="soul-journey-active-module" className="pt-2">
                  {activeModule === 'karmic_patterns' && (
                    <KarmicPatternsCard
                      data={reading.soulJourneyModules?.karmicPatterns || {}}
                      userProfile={reading.user_profile_summary}
                      onExploreInfluences={() => {
                        setActiveModule('past_life_influences');
                        setTimeout(() => {
                          const el = document.getElementById('soul-journey-active-module');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      onNavigateToKundli={() => {
                        window.location.hash = '#/kundli';
                      }}
                    />
                  )}

                  {activeModule === 'past_life_influences' && (
                    <SoulJourneyCard schema={reading} onExportPdf={handlePrint} />
                  )}

                  {activeModule === 'soul_lessons' && (
                    <SoulLessonsCard
                      data={reading.soulJourneyModules?.soulLessons || {}}
                      onExploreNext={() => {
                        setActiveModule('life_purpose');
                        setTimeout(() => {
                          const el = document.getElementById('soul-journey-active-module');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                    />
                  )}

                  {activeModule === 'life_purpose' && (
                    <LifePurposeCard
                      data={reading.soulJourneyModules?.lifePurpose || {}}
                      onReturnToJourney={() => {
                        setActiveModule('karmic_patterns');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <PastLifeInsightCard
                data={cardData || reading}
                onExportPdf={handlePrint}
                onShare={handleShare}
                onExploreSoulJourney={() => {
                  setFormat('soul_journey');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* User Resonance Feedback Panel */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-xl mx-auto">
              <div className="text-xs font-mono font-bold text-slate-300">
                HOW DOES THIS SPIRITUAL INTERPRETATION RESONATE?
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['RESONATES', 'PARTIALLY_RESONATES', 'DOES_NOT_RESONATE', 'NOT_SURE'].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleFeedback(choice)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      feedbackSent === choice
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {choice.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              {feedbackSent && (
                <div className="text-[11px] text-cyan-400 font-mono">
                  Thank you! Your feedback is recorded as an interpretive signal.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
