import React, { useState, useEffect } from 'react';
import {
  Brain,
  Calendar,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Bookmark,
} from 'lucide-react';

interface CosmicMemoryPanelProps {
  currentUser?: any;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const CosmicMemoryPanel: React.FC<CosmicMemoryPanelProps> = ({ onOpenAuth }) => {
  const [profile, setProfile] = useState<any>({
    tone: 'RESPECTFUL',
    depth: 'DEEP',
    focusDomains: ['Career', 'Spirituality'],
    fearFreeLanguage: true,
    personalizationEnabled: true,
  });

  const [memories, setMemories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Memory Form
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState('CURRENT_PRIORITY');
  const [newMemoryContent, setNewMemoryContent] = useState('');

  // New Event Form
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState('CAREER_CHANGE');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('deepastro_token') : null;

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const [profileRes, memRes, evRes] = await Promise.all([
        fetch('/api/personalization/profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/personalization/memory', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/personalization/events', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.profile) setProfile(pData.profile);
      }
      if (memRes.ok) {
        const mData = await memRes.json();
        if (mData.memories) setMemories(mData.memories);
      }
      if (evRes.ok) {
        const eData = await evRes.json();
        if (eData.events) setEvents(eData.events);
      }
    } catch (err: any) {
      console.error('Failed to load personalization data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const updateProfileSettings = async (updates: Partial<typeof profile>) => {
    if (!token) {
      onOpenAuth?.('login');
      return;
    }
    const updated = { ...profile, ...updates };
    setProfile(updated);
    try {
      const res = await fetch('/api/personalization/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showNotification('success', 'Personalization preferences updated.');
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to update preferences.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Network error.');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;
    if (!token) {
      onOpenAuth?.('login');
      return;
    }

    try {
      const res = await fetch('/api/personalization/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category: newMemoryCategory,
          content: newMemoryContent.trim(),
          source: 'USER_EXPLICIT',
          confidence: 'VERIFIED',
          userConfirmed: true,
          memoryType: 'FACT',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMemories([data.memory, ...memories]);
        setNewMemoryContent('');
        setShowAddMemory(false);
        showNotification('success', 'Cosmic memory anchor saved.');
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Could not save memory.');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleForgetMemory = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/personalization/memory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== id));
        showNotification('success', 'Cosmic memory forgotten.');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleForgetAll = async () => {
    if (!token) return;
    if (!confirm('Forget all active memories? Classical astrological birth charts will remain untouched.')) return;

    try {
      const res = await fetch('/api/personalization/memory', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMemories([]);
        showNotification('success', 'Clean Slate applied: All memories forgotten.');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;
    if (!token) {
      onOpenAuth?.('login');
      return;
    }

    try {
      const res = await fetch('/api/personalization/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          eventDate: newEventDate,
          eventType: newEventType,
          title: newEventTitle.trim(),
          description: newEventDesc.trim(),
          userConfirmation: true,
          privacyState: 'ACTIVE',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents([...events, data.event].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventDesc('');
        setShowAddEvent(false);
        showNotification('success', 'Milestone saved with historical Dasha correlation.');
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to save event.');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const toggleFocusDomain = (domain: string) => {
    const current = profile.focusDomains || [];
    const updated = current.includes(domain)
      ? current.filter((d: string) => d !== domain)
      : [...current, domain];
    updateProfileSettings({ focusDomains: updated });
  };

  if (!token) {
    return (
      <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface text-center space-y-3">
        <Brain className="w-8 h-8 text-cyan-400 mx-auto" />
        <h3 className="text-sm font-bold text-cosmic-text">Cosmic Memory &amp; Personalization Vault</h3>
        <p className="text-xs text-cosmic-muted max-w-md mx-auto">
          Sign in to activate your sovereign AI memory, calibrate tone, and track life milestone correlations with Vimshottari Dashas.
        </p>
        <button
          onClick={() => onOpenAuth?.('login')}
          className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-all shadow-glow-cyan"
        >
          Sign In to Access Memory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Banner: Sovereign Memory State */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-cosmic-surface to-violet-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cosmic-text flex items-center gap-2">
                My Cosmic Memory (Sovereign Context)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  Tenant Isolated
                </span>
              </h3>
              <p className="text-xs text-cosmic-muted">
                Your AI astrologer remembers only what you explicitly confirm. Never shared across accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateProfileSettings({ personalizationEnabled: !profile.personalizationEnabled })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                profile.personalizationEnabled
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : 'bg-cosmic-card border-cosmic-border text-cosmic-muted'
              }`}
            >
              {profile.personalizationEnabled ? <ToggleRight className="w-4 h-4 text-cyan-400" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{profile.personalizationEnabled ? 'Personalization Active' : 'Personalization Off'}</span>
            </button>
          </div>
        </div>

        {/* Core Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          {/* Tone */}
          <div className="p-3.5 rounded-2xl bg-cosmic-card/60 border border-cosmic-border space-y-1.5">
            <label className="text-cosmic-muted font-bold block text-[11px] uppercase tracking-wider">Tone of Voice</label>
            <select
              value={profile.tone}
              onChange={(e) => updateProfileSettings({ tone: e.target.value as any })}
              className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-2.5 py-1.5 text-cosmic-text text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="RESPECTFUL">Traditional &amp; Respectful</option>
              <option value="DIRECT">Direct &amp; Action-Oriented</option>
              <option value="COMPASSIONATE">Compassionate &amp; Gentle</option>
              <option value="ANALYTICAL">Technical &amp; Analytical</option>
            </select>
          </div>

          {/* Depth */}
          <div className="p-3.5 rounded-2xl bg-cosmic-card/60 border border-cosmic-border space-y-1.5">
            <label className="text-cosmic-muted font-bold block text-[11px] uppercase tracking-wider">Astrological Depth</label>
            <select
              value={profile.depth}
              onChange={(e) => updateProfileSettings({ depth: e.target.value as any })}
              className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-2.5 py-1.5 text-cosmic-text text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="ESSENTIAL">Essential (Digestible)</option>
              <option value="DEEP">Deep (Classical Vargas &amp; Dashas)</option>
              <option value="RESEARCH">Research (Ephemeris &amp; Math Citations)</option>
            </select>
          </div>

          {/* Fear-Free Toggle */}
          <div className="p-3.5 rounded-2xl bg-cosmic-card/60 border border-cosmic-border flex items-center justify-between">
            <div>
              <span className="font-bold text-cosmic-text block text-xs">Fear-Free Language</span>
              <span className="text-[10px] text-cosmic-muted">Replaces fatalistic fear with constructive remedies</span>
            </div>
            <button
              onClick={() => updateProfileSettings({ fearFreeLanguage: !profile.fearFreeLanguage })}
              className="text-cyan-400"
            >
              {profile.fearFreeLanguage ? <ToggleRight className="w-6 h-6 text-cyan-400" /> : <ToggleLeft className="w-6 h-6 text-cosmic-muted" />}
            </button>
          </div>
        </div>

        {/* Focus Domains */}
        <div className="pt-1 space-y-2">
          <span className="text-[11px] font-bold text-cosmic-muted uppercase tracking-wider block">
            Focus Areas of Life
          </span>
          <div className="flex flex-wrap gap-2">
            {['Career', 'Marriage', 'Spirituality', 'Wealth', 'Health', 'Education', 'Travel'].map((domain) => {
              const isSelected = profile.focusDomains?.includes(domain);
              return (
                <button
                  key={domain}
                  onClick={() => toggleFocusDomain(domain)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan/10'
                      : 'bg-cosmic-card border border-cosmic-border text-cosmic-muted hover:text-cosmic-text'
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Memory Items Section */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-cosmic-text flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              Active Cosmic Memory Anchors ({memories.length})
            </h4>
            <p className="text-[11px] text-cosmic-muted">
              Confirmed life facts and preferences the AI references during predictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMemory(!showAddMemory)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
            {memories.length > 0 && (
              <button
                onClick={handleForgetAll}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Forget All</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Memory Form */}
        {showAddMemory && (
          <form onSubmit={handleAddMemory} className="p-4 rounded-2xl bg-cosmic-card/70 border border-cyan-500/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Category</label>
                <select
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value)}
                  className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs"
                >
                  <option value="CURRENT_PRIORITY">Current Priority</option>
                  <option value="CONFIRMED_FACT">Confirmed Fact</option>
                  <option value="LIFE_GOAL">Life Goal</option>
                  <option value="USER_CORRECTION">Correction / Clarification</option>
                  <option value="REMEDY_TRACKING">Remedy Tracking</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Memory Description</label>
                <input
                  type="text"
                  placeholder="e.g. Preparing for a leadership promotion in Q4 2026"
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddMemory(false)}
                className="px-3 py-1.5 rounded-xl text-cosmic-muted hover:text-cosmic-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 shadow-glow-cyan"
              >
                Save Memory
              </button>
            </div>
          </form>
        )}

        {/* Memory Items List */}
        {memories.length === 0 ? (
          <div className="py-8 text-center text-cosmic-muted text-xs border border-dashed border-cosmic-border/60 rounded-2xl">
            No memories stored yet. Add an explicit priority or milestone to anchor your personalized readings.
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-2xl bg-cosmic-card/40 border border-cosmic-border/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                      {mem.category}
                    </span>
                    <span className="text-[10px] text-cosmic-muted">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-cosmic-text font-medium">{mem.content}</p>
                </div>

                <button
                  onClick={() => handleForgetMemory(mem.id)}
                  title="Forget this memory"
                  className="p-2 rounded-xl text-cosmic-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Life Events Timeline Section */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-cosmic-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Life Event Timeline &amp; Dasha Correlator ({events.length})
            </h4>
            <p className="text-[11px] text-cosmic-muted">
              Historical milestones cross-referenced against your Vimshottari planetary periods.
            </p>
          </div>

          <button
            onClick={() => setShowAddEvent(!showAddEvent)}
            className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        {/* Add Event Form */}
        {showAddEvent && (
          <form onSubmit={handleAddEvent} className="p-4 rounded-2xl bg-cosmic-card/70 border border-violet-500/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Milestone Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Event Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs"
                >
                  <option value="CAREER_CHANGE">Career / Promotion</option>
                  <option value="MARRIAGE">Marriage / Relationship</option>
                  <option value="RELOCATION">Relocation / Foreign Travel</option>
                  <option value="HEALTH_EVENT">Health Milestone</option>
                  <option value="FINANCIAL_EVENT">Major Financial Milestone</option>
                  <option value="EDUCATION">Education / Graduation</option>
                  <option value="SPIRITUAL_AWAKENING">Spiritual Awakening</option>
                  <option value="CHILD_BIRTH">Childbirth</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Promoted to VP of Engineering"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-cosmic-muted font-bold block text-[10px] uppercase">Notes (Optional)</label>
              <input
                type="text"
                placeholder="Details of the transition..."
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="w-full bg-cosmic-surface border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddEvent(false)}
                className="px-3 py-1.5 rounded-xl text-cosmic-muted hover:text-cosmic-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-violet-500 text-white font-bold hover:bg-violet-400"
              >
                Correlate &amp; Save
              </button>
            </div>
          </form>
        )}

        {/* Events Timeline */}
        {events.length === 0 ? (
          <div className="py-8 text-center text-cosmic-muted text-xs border border-dashed border-cosmic-border/60 rounded-2xl">
            No milestones added yet. Add major life events (graduation, marriage, promotion) to reveal historical Dasha activations.
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-violet-500/20">
            {events.map((ev) => (
              <div key={ev.id} className="relative pl-9 text-xs">
                <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-violet-400 border-2 border-cosmic-surface" />
                <div className="p-3.5 rounded-2xl bg-cosmic-card/40 border border-cosmic-border/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cosmic-text">{ev.title}</span>
                    <span className="text-[10px] text-cosmic-muted font-mono">{ev.eventDate}</span>
                  </div>

                  {ev.description && <p className="text-cosmic-muted text-[11px]">{ev.description}</p>}

                  {ev.correlatedDasha && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-300">
                        Historical Dasha: {ev.correlatedDasha.mahadasha} / {ev.correlatedDasha.antardasha}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
