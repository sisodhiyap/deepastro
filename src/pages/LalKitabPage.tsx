import React, { useState } from 'react';
import { Flame, CheckCircle2, Circle, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export const LalKitabPage: React.FC = () => {
  const [completedRemedies, setCompletedRemedies] = useState<Record<string, boolean>>({
    'rem-1': true,
  });

  const remedies = [
    {
      id: 'rem-1',
      planet: 'Surya (Sun)',
      category: 'Charity & Water',
      title: 'Copper Coin & Water Offering at Dawn',
      instructions: 'Offer fresh water with a pinch of red kumkum and whole rice grains in a copper vessel facing East within 1 hour of sunrise.',
      duration: '43 consecutive days',
      precautions: 'Do not step over the spilled water; let it soak into soil or potted plants.',
    },
    {
      id: 'rem-2',
      planet: 'Chandra (Moon)',
      category: 'Mother & Silver',
      title: 'Blessing from Mother & Solid Silver Square',
      instructions: 'Keep a small solid square piece of pure silver in your wallet or locker, and seek blessings from maternal elders on Mondays.',
      duration: 'Ongoing lifestyle measure',
      precautions: 'Do not gift away the silver piece once sanctified.',
    },
    {
      id: 'rem-3',
      planet: 'Mangala (Mars)',
      category: 'Brotherhood & Sweets',
      title: 'Sweet Roti Offering to Earth',
      instructions: 'Bake sweet rotis made with wheat flour and jaggery on an inverted iron griddle (Tawa) and feed stray cattle or dogs.',
      duration: '7 consecutive Tuesdays',
      precautions: 'Do not consume sweet rotis yourself during the remedy cycle.',
    },
    {
      id: 'rem-4',
      planet: 'Shani (Saturn)',
      category: 'Service & Laborers',
      title: 'Mustard Oil Shadow Offering (Chhaya Daan)',
      instructions: 'Look at your reflection in a bowl of mustard oil on Saturday morning and donate it to a street cleaner or Shani temple.',
      duration: '8 Saturdays',
      precautions: 'Do not bring the donated oil back into your home kitchen.',
    },
  ];

  const toggleRemedy = (id: string) => {
    setCompletedRemedies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" /> Traditional Red Book Remedies
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Lal Kitab Diagnostics & Remedies Tracker
        </h1>
        <p className="text-xs text-cosmic-muted">
          Ancient pragmatic astrological measures based on the 1952 remedial traditions.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 flex items-start gap-4 text-xs">
        <BookOpen className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-cosmic-text">Traditional Remedial Philosophy</h4>
          <p className="text-cosmic-muted leading-relaxed">
            Lal Kitab remedies work by realigning elemental energies (air, water, fire, earth, metal) through self-discipline, respect for elders, and non-harming charity. They do not replace moral conduct or medical care.
          </p>
        </div>
      </div>

      {/* Remedies Checklist */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
          Active Astrological Remedial Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remedies.map((rem) => {
            const isDone = Boolean(completedRemedies[rem.id]);

            return (
              <div
                key={rem.id}
                className={`rounded-2xl border p-5 transition-all duration-300 space-y-3 ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-cosmic-border bg-cosmic-surface hover:border-cosmic-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    {rem.planet} &bull; {rem.category}
                  </span>
                  <button
                    onClick={() => toggleRemedy(rem.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-cosmic-text"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-cosmic-muted" />
                    )}
                    <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-cosmic-text">{rem.title}</h4>
                  <p className="text-xs text-cosmic-muted mt-1 leading-relaxed">{rem.instructions}</p>
                </div>

                <div className="pt-2 border-t border-cosmic-border/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-cosmic-muted gap-2">
                  <span><strong>Duration:</strong> {rem.duration}</span>
                  <span className="text-amber-400/90 text-right"><strong>Precaution:</strong> {rem.precautions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
