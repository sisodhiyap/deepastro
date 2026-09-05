import React, { useState, useEffect } from 'react';
import { Users, Star, Phone, MessageCircle, Mail, Lock, ShieldCheck, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface AstrologersPageProps {
  onNavigate: (tab: NavTabId) => void;
  userPlan?: string;
}

export const AstrologersPage: React.FC<AstrologersPageProps> = ({ onNavigate, userPlan = 'FREE' }) => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [hasDirectAccess, setHasDirectAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAstroForBooking, setSelectedAstroForBooking] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchAstrologers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/astrologers');
      if (res.ok) {
        const data = await res.json();
        setAstrologers(data.astrologers);
        setHasDirectAccess(data.hasDirectContactAccess);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, [userPlan]);

  const handleBookConsultation = async () => {
    if (!selectedAstroForBooking) return;
    try {
      const res = await fetch('/api/astrologers/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astrologerId: selectedAstroForBooking.id,
          consultationType: 'Video',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          notes: 'Initial natal chart reading',
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedAstroForBooking(null);
          setBookingSuccess(false);
          fetchAstrologers(); // Refresh contact details
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Certified Guru Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
            Consult Master Astrologers
          </h1>
          <p className="text-xs text-cosmic-muted">
            Connect directly with authenticated Parashari, KP, and Lal Kitab practitioners.
          </p>
        </div>

        {/* Protection Shield Banner */}
        <div className="px-4 py-2 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-cosmic-text block">Server-Verified Protection</span>
            <span className="text-[10px] text-cosmic-muted">
              {hasDirectAccess ? 'Direct Contact Unlocked' : 'Contact Details Shielded'}
            </span>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {astrologers.map((astro) => {
          const canSeeContact = Boolean(astro.phone || astro.whatsapp || astro.email);

          return (
            <div
              key={astro.id}
              className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 shadow-cosmic-card space-y-6"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start gap-4">
                  <img
                    src={astro.avatarUrl}
                    alt={astro.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-cosmic-border shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-cosmic-text truncate">{astro.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{astro.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold block">
                      {astro.experienceYears} Years Rigorous Practice
                    </span>
                    <span className="text-[11px] text-cosmic-muted block mt-0.5">
                      {astro.languages.join(' &bull; ')}
                    </span>
                  </div>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {astro.specialties.map((spec: string) => (
                    <span
                      key={spec}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cosmic-card border border-cosmic-border text-cosmic-muted"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-xs text-cosmic-muted leading-relaxed">{astro.bio}</p>

                {/* Rate Info */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-cosmic-card/60 border border-cosmic-border/60 text-xs">
                  <span className="text-cosmic-muted">Consultation Fee</span>
                  <span className="font-bold text-cosmic-text">
                    ₹{astro.pricePerMinuteCents / 100} <span className="text-[10px] text-cosmic-muted font-normal">/ minute</span>
                  </span>
                </div>
              </div>

              {/* Contact Area (Protected by Server-Side Authorization) */}
              <div className="pt-4 border-t border-cosmic-border/60">
                {canSeeContact ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Direct Contact Unlocked (Cosmic Privilege)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <a
                        href={`tel:${astro.phone}`}
                        className="p-2.5 rounded-xl border border-cosmic-border bg-cosmic-card hover:border-cyan-400 text-xs font-bold text-cosmic-text flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${astro.whatsapp?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:${astro.email}`}
                        className="p-2.5 rounded-xl border border-cosmic-border bg-cosmic-card hover:border-cyan-400 text-xs font-bold text-cosmic-text flex items-center justify-center gap-2 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-violet-400" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-cosmic-text">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Direct Phone, WhatsApp & Email Protected</span>
                    </div>
                    <p className="text-[11px] text-cosmic-muted leading-tight">
                      Astrologer contact channels are unmasked exclusively for Premium & Pro subscribers or booked consultations.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onNavigate('subscription')}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan"
                      >
                        Upgrade Subscription
                      </button>
                      <button
                        onClick={() => setSelectedAstroForBooking(astro)}
                        className="px-4 py-2 rounded-xl border border-cosmic-border bg-cosmic-surface hover:border-cyan-400 text-xs font-bold text-cosmic-text transition-colors"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedAstroForBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-cosmic-text">
                Book Consultation with {selectedAstroForBooking.name}
              </h3>
              <p className="text-xs text-cosmic-muted">
                Booking a session unlocks direct phone and WhatsApp contact channels immediately.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-cosmic-text">Consultation Confirmed!</h4>
                <p className="text-xs text-cosmic-muted">Direct contact credentials unlocked.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <span className="text-cosmic-muted">Session Duration</span>
                  <span className="font-bold text-cosmic-text">30 Minutes Video / Audio</span>
                </div>
                <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-between">
                  <span className="text-cosmic-muted">Total Amount</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    ₹{(selectedAstroForBooking.pricePerMinuteCents * 30) / 100}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedAstroForBooking(null)}
                    className="flex-1 py-2.5 rounded-xl border border-cosmic-border text-cosmic-muted hover:text-cosmic-text font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookConsultation}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider shadow-glow-cyan"
                  >
                    Confirm & Unlock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
