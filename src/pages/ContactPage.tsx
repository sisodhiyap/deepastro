import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, HelpCircle, CheckCircle2, Send, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Support',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedTicket(data.ticketId);
        setFormData({ name: '', email: '', phone: '', category: 'Support', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Direct Communications
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Contact DeepAstro
        </h1>
        <p className="text-xs text-cosmic-muted">
          Reach our dedicated spiritual engineering support, astrologer partnership desk, or executive team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-cosmic-text">Send Us a Celestial Inquiry</h3>
            <p className="text-xs text-cosmic-muted">
              We respond to all verified inquiries within one cosmic solar cycle (24 hours).
            </p>
          </div>

          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-cosmic-text">Inquiry Dispatched Successfully</h4>
              <p className="text-xs text-cosmic-muted">
                Reference Ticket ID: <span className="text-cyan-400 font-mono">{submittedTicket}</span>
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-3 text-xs text-cyan-400 font-semibold hover:underline block mx-auto"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-cosmic-muted block mb-1 font-semibold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                    placeholder="Arjun Sharma"
                  />
                </div>

                <div>
                  <label className="text-cosmic-muted block mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                    placeholder="arjun@deepastro.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-cosmic-muted block mb-1 font-semibold">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-cosmic-muted block mb-1 font-semibold">Inquiry Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Support">General Support</option>
                    <option value="Partnership">Astrologer Partnership</option>
                    <option value="Billing">Subscription & Billing</option>
                    <option value="Enterprise">API & Enterprise Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl p-3.5 text-cosmic-text focus:outline-none focus:border-cyan-400 resize-none"
                  placeholder="How can our cosmic team assist your journey?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Corporate & Headquarters Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-5">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Communication Channels
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5" />
                <div>
                  <span className="font-bold text-cosmic-text block">Support Email</span>
                  <span className="text-cosmic-muted">support@deepastro.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-bold text-cosmic-text block">Corporate Hotline</span>
                  <span className="text-cosmic-muted">+91 (11) 4920-3800</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-violet-400 mt-0.5" />
                <div>
                  <span className="font-bold text-cosmic-text block">Astrologer Partnership Desk</span>
                  <span className="text-cosmic-muted">gurus@deepastro.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 text-xs space-y-2 text-cosmic-muted leading-relaxed">
            <h4 className="text-xs font-bold text-cosmic-text">Platform Credits</h4>
            <p>DeepAstro &bull; Decode Your Life. Discover Your Cosmos.</p>
            <p className="font-bold text-cosmic-text">
              Designed & Created by <span className="text-cyan-400">Prashant Sisodhiya</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
