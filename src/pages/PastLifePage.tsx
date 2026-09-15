import React, { useState, useEffect } from 'react';
import { Sparkles, History, RefreshCw, AlertCircle, Share2, Printer, Compass, Layers, MapPin, Calendar, Clock, User } from 'lucide-react';
import { PastLifeInsightCard } from '../components/astrology/PastLifeInsightCard';
import { SoulJourneyCard } from '../components/astrology/SoulJourneyCard';

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
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/auth/birth-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          fullName: form.fullName,
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          birthPlace: form.birthPlace,
          latitude: parseFloat(form.latitude) || 0,
          longitude: parseFloat(form.longitude) || 0,
          timezone: form.timezone,
          gender: form.gender,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || d.details || `HTTP ${res.status}`);
      }
      setSaveSuccess(true);
      setTimeout(() => onSaved(), 900);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
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
  const [format, setFormat] = useState<'insight_card' | 'soul_journey'>('insight_card');
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
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/intelligence/past-life/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ format: formatChoice }),
      });

      const data = await res.json();

      // Missing birth profile → show inline form
      if (!res.ok && (data.error === 'PAST_LIFE_ANALYSIS_UNAVAILABLE' || data.missingFields?.length > 0)) {
        setNeedsBirthProfile(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.schema) {
        throw new Error(data.message || data.error || 'Failed to generate past life insight');
      }

      setReading(data.schema);
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
      const data = await res.json();
      if (res.ok && data.readings) setHistory(data.readings);
    } catch (e) {}
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
    <div className="min-h-screen bg-[#04060B] text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Top Header & Navigation Bar */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>SOULTRACE ENGINE v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
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
            {(['insight_card', 'soul_journey'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFormat(f); if (!needsBirthProfile) fetchPastLife(f); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${format === f ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {f === 'insight_card' ? <><Compass className="inline w-3 h-3 mr-1" />Card</> : <><Layers className="inline w-3 h-3 mr-1" />Journey</>}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setReading(null); setCardData(null); fetchPastLife(); }}
            disabled={loading || needsBirthProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all">
            <History className="w-3 h-3" />History
          </button>
          <button onClick={handlePrint} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all">
            <Printer className="w-4 h-4" />
          </button>
          {reading && (
            <button onClick={handleShare} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all">
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
              <span className="text-amber-300 font-semibold">{h.archetype?.primary || 'Soul Reading'}</span>
              <span className="text-slate-500">{h.generatedAt ? new Date(h.generatedAt).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto space-y-6">
        {loading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-sm font-mono text-amber-300">
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
          <div>
            {format === 'insight_card' && cardData ? (
              <PastLifeInsightCard data={cardData} onExportPdf={handlePrint} onShare={handleShare} />
            ) : (
              <SoulJourneyCard schema={reading} onExportPdf={handlePrint} />
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
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {choice.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              {feedbackSent && (
                <div className="text-[11px] text-emerald-400 font-mono">
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
