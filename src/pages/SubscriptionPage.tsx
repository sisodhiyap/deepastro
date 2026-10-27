import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, Zap, Receipt, Download, ExternalLink } from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';
import { CosmicCheckoutModal, InvoiceData } from '../components/subscription/CosmicCheckoutModal.js';
import { useAuth } from '../context/AuthContext.js';

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
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState(currentPlan);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    id: 'PREMIUM' | 'PRO';
    name: string;
    price: string;
    amount: number;
  }>({
    id: 'PREMIUM',
    name: 'Cosmic Voyager',
    price: '₹499',
    amount: 499,
  });

  // Recent Invoices State
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  useEffect(() => {
    setActivePlan(currentPlan);
  }, [currentPlan]);

  // Fetch recent invoices
  useEffect(() => {
    fetch('/api/subscription/invoices', {
      headers: {
        ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.invoices) {
          setInvoices(data.invoices);
        }
      })
      .catch(() => {});
  }, [activePlan]);

  const handleCtaClick = (tierId: 'FREE' | 'PREMIUM' | 'PRO', tierName: string, price: string) => {
    if (tierId === 'FREE') return;

    const amountNumber = tierId === 'PRO' ? 1499 : 499;
    setSelectedPlanForCheckout({
      id: tierId,
      name: tierName,
      price: price,
      amount: amountNumber,
    });
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = (newPlan: 'PREMIUM' | 'PRO', invoice: InvoiceData) => {
    setActivePlan(newPlan);
    onPlanUpdated?.(newPlan);
    setInvoices((prev) => [invoice, ...prev]);
    setUpgradeMessage(
      `Congratulations! Successfully ascended to DeepAstro ${invoice.planName} tier! Invoice #${invoice.invoiceNumber} generated.`
    );
    setTimeout(() => setUpgradeMessage(null), 8000);
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
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" /> Entitlement & Gateway Management
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white font-serif tracking-tight">
          DeepAstro Cosmic Privileges
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Upgrade your celestial subscription with instant UPI QR, GPay, Debit & Credit cards via Razorpay or Stripe. Unlock verified astrologer direct contacts, high-order divisional charts, and deep future intelligence.
        </p>
      </div>

      {upgradeMessage && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2.5 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
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
                  ? 'border-2 border-amber-400 bg-gradient-to-b from-cosmic-surface via-[#141a29] to-amber-950/20 shadow-[0_0_35px_rgba(245,158,11,0.2)]'
                  : isCurrent
                  ? 'border-2 border-emerald-500/60 bg-gradient-to-b from-cosmic-surface to-emerald-950/20 shadow-lg'
                  : 'border border-cosmic-border bg-cosmic-surface hover:border-amber-400/50 shadow-md'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-amber-500/30">
                  Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80 font-mono">
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Tier
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-white font-serif">{tier.price}</span>
                  <span className="text-xs text-slate-400">{tier.period}</span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{tier.description}</p>

                <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-200">
                    {tier.features.map((feat, fIdx) => (
                      <li key={`feat-${fIdx}`} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            tier.isPopular ? 'text-amber-400' : isCurrent ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                        <span className={feat.includes('UNLOCKED') ? 'font-bold text-amber-300' : ''}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  disabled={isCurrent}
                  onClick={() => handleCtaClick(tier.id, tier.name, tier.price)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 cursor-default font-bold'
                      : tier.isPopular
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25 active:scale-[0.98]'
                      : 'border border-slate-700 bg-cosmic-card hover:border-amber-400 text-white active:scale-[0.98]'
                  }`}
                >
                  {isCurrent ? 'Current Active Plan' : tier.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Gateway Security Badges */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-black/40 grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant UPI & QR</h4>
            <p className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM & UPI AutoPay</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Debit & Credit Cards</h4>
            <p className="text-[11px] text-slate-400">RuPay, Visa, Mastercard, Amex with 3D Secure OTP</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bank-Grade Security</h4>
            <p className="text-[11px] text-slate-400">PCI-DSS Level 1 & 256-bit SSL encrypted checkout</p>
          </div>
        </div>
      </div>

      {/* Invoices History (if any) */}
      {invoices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Your Tax Invoices & Payment Receipts
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-cosmic-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-300">{inv.invoiceNumber}</td>
                    <td className="p-3.5">{new Date(inv.paidAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-white">{inv.planName}</td>
                    <td className="p-3.5">{inv.method} ({inv.gateway.toUpperCase()})</td>
                    <td className="p-3.5 font-bold text-white">₹{inv.amount}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cosmic Checkout Modal */}
      <CosmicCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        planId={selectedPlanForCheckout.id}
        planName={selectedPlanForCheckout.name}
        planPrice={selectedPlanForCheckout.price}
        amountNumber={selectedPlanForCheckout.amount}
        onSuccess={handleCheckoutSuccess}
        initialEmail={user?.email || ''}
        initialName={user?.name || ''}
      />
    </div>
  );
};
