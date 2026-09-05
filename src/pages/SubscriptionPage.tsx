import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface SubscriptionPageProps {
  currentPlan?: string;
  onPlanUpdated?: (newPlan: string) => void;
  onNavigate: (tab: NavTabId) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  currentPlan = 'FREE',
  onPlanUpdated,
  onNavigate,
}) => {
  const [activePlan, setActivePlan] = useState(currentPlan);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const handleUpgrade = async (targetPlanId: 'FREE' | 'PREMIUM' | 'PRO') => {
    setIsUpgrading(true);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: targetPlanId }),
      });

      if (res.ok) {
        const data = await res.json();
        setActivePlan(targetPlanId);
        onPlanUpdated?.(targetPlanId);
        setUpgradeMessage(`Successfully transitioned to ${targetPlanId} tier! All entitlements active.`);
        setTimeout(() => setUpgradeMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const tiers = [
    {
      id: 'FREE' as const,
      name: 'Cosmic Seeker',
      price: '₹0',
      period: 'Forever free',
      description: 'Foundational planetary awareness and basic horoscope insight.',
      features: [
        'Core Kundli (Ascendant, Sun & Moon sign)',
        'Daily Horoscope cosmic weather',
        'Basic Life Path Numerology calculations',
        'Browse certified astrologer profiles',
        'Direct astrologer phone/WhatsApp locked',
      ],
      cta: 'Current Plan',
    },
    {
      id: 'PREMIUM' as const,
      name: 'Cosmic Voyager',
      price: '₹499',
      period: '/ month',
      description: 'Comprehensive Vedic analysis, divisional vargas, and unlocked astrologer contact.',
      features: [
        'Complete Vedic Kundli (D1, D9 Navamsa, D10 Dashamsha)',
        'Full 120-Year Vimshottari Dasha timeline',
        '36-Point Ashtakoota Milan & Manglik checks',
        'Panchang & Auspicious Shubh Muhurat finder',
        'Palmistry Vision AI image inspection',
        'UNLOCKED Astrologer Phone, WhatsApp & Email',
        'Unlimited AI AstroBot chat with Vedic grounding',
        'Instant PDF dossier downloads',
      ],
      isPopular: true,
      cta: 'Ascend to Premium',
    },
    {
      id: 'PRO' as const,
      name: 'Cosmic Sovereign',
      price: '₹1,499',
      period: '/ month',
      description: 'Enterprise spiritual intelligence with multi-model cross-checking and consultation perks.',
      features: [
        'Everything included in Premium tier',
        'Multi-Model AI Cross-Checking (OpenAI + Gemini + Grok)',
        '1 Free 30-min Video Consultation per month',
        'Priority booking access with master astrologers',
        'Family Vault (Store & analyze up to 10 Kundlis)',
        'Bespoke annual destiny dossier report',
      ],
      cta: 'Ascend to Sovereign',
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cosmic-surface text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" /> Entitlement Management
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          DeepAstro Cosmic Privileges
        </h1>
        <p className="text-xs text-cosmic-muted leading-relaxed">
          Upgrade your celestial subscription to unlock direct astrologer phone & WhatsApp contact, comprehensive divisional charts, and multi-model AI cross-checking.
        </p>
      </div>

      {upgradeMessage && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{upgradeMessage}</span>
        </div>
      )}

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const isCurrent = activePlan === tier.id;

          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                tier.isPopular
                  ? 'border-2 border-cyan-500 bg-gradient-to-b from-cosmic-surface to-cyan-950/20 shadow-glow-cyan/20'
                  : 'border border-cosmic-border bg-cosmic-surface hover:border-cosmic-border/80'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold uppercase tracking-widest shadow-glow-cyan">
                  Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cosmic-muted">
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Active Tier
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-cosmic-text">{tier.price}</span>
                  <span className="text-xs text-cosmic-muted">{tier.period}</span>
                </div>

                <p className="text-xs text-cosmic-muted mt-3 leading-relaxed">{tier.description}</p>

                <div className="mt-6 pt-6 border-t border-cosmic-border/60 space-y-3">
                  <span className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5 text-xs text-cosmic-text">
                    {tier.features.map((feat, fIdx) => (
                      <li key={`feat-${fIdx}`} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          tier.isPopular ? 'text-cyan-400' : 'text-emerald-400'
                        }`} />
                        <span className={feat.includes('UNLOCKED') ? 'font-bold text-cyan-300' : ''}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handleUpgrade(tier.id)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                    isCurrent
                      ? 'bg-cosmic-card border border-cosmic-border text-cosmic-muted cursor-default'
                      : tier.isPopular
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow-cyan'
                      : 'border border-cosmic-border bg-cosmic-card hover:border-cyan-400 text-cosmic-text'
                  }`}
                >
                  {isCurrent ? 'Current Active Tier' : tier.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
