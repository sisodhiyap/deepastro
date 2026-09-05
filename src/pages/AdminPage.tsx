import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Bot, Zap, DollarSign, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setFeatureFlags(data.featureFlags || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleFlag = async (key: string) => {
    const updated = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(updated);

    try {
      await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags: updated }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Platform Operations
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Admin Command Center & AI Telemetry
        </h1>
        <p className="text-xs text-cosmic-muted">
          Real-time SaaS telemetry, AI provider tokens, cost tracking, and dynamic feature toggles.
        </p>
      </div>

      {metrics && (
        <div className="space-y-8">
          {/* SaaS Core KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">Total Users</span>
              <span className="text-2xl font-display font-black text-cosmic-text block">{metrics.overview.totalUsers}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+18% this week</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">Active Subscribers</span>
              <span className="text-2xl font-display font-black text-cyan-400 block">{metrics.overview.activeSubscriptions}</span>
              <span className="text-[10px] text-cyan-300 font-semibold">MRR: ₹{(metrics.overview.monthlyRecurringRevenueCents / 100).toLocaleString()}</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">Total AI Requests</span>
              <span className="text-2xl font-display font-black text-violet-400 block">{metrics.overview.totalAiRequests}</span>
              <span className="text-[10px] text-cosmic-muted font-semibold">Mesh failover active</span>
            </div>

            <div className="p-5 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-1">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase">Estimated AI Cost</span>
              <span className="text-2xl font-display font-black text-cosmic-gold block">${metrics.overview.estimatedAiCostUSD.toFixed(2)}</span>
              <span className="text-[10px] text-cosmic-muted font-semibold">{metrics.overview.totalAiTokensUsed.toLocaleString()} tokens</span>
            </div>
          </div>

          {/* AI Providers Breakdown */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              Multi-Model Mesh Distribution (OpenAI &bull; Gemini &bull; Grok &bull; Ollama Local)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {Object.entries(metrics.aiUsageByProvider).map(([provider, stats]: [string, any]) => (
                <div key={provider} className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cosmic-text text-sm">{provider}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-1 text-cosmic-muted text-[11px]">
                    <div className="flex justify-between">
                      <span>Requests Processed:</span>
                      <span className="font-mono font-bold text-cosmic-text">{stats.requests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens Consumed:</span>
                      <span className="font-mono font-bold text-cosmic-text">{stats.tokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Feature Flags */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              Live Feature Flags (No Redeployment Required)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <div
                  key={key}
                  onClick={() => toggleFlag(key)}
                  className="p-3.5 rounded-xl border border-cosmic-border/80 bg-cosmic-card/40 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-colors"
                >
                  <span className="font-bold capitalize text-cosmic-text">{key} Engine</span>
                  {enabled ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      Enabled <ToggleRight className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      Disabled <ToggleLeft className="w-5 h-5" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
