import { FutureInsightCard } from '../future/FutureInsightCard.js';
import { FutureYearCard } from '../future/FutureYearCard.js';
import { FutureMonthCard } from '../future/FutureMonthCard.js';
import { FutureLongevityCard } from '../future/FutureLongevityCard.js';
import React, { useState } from 'react';
import { PastLifeInsightCard } from '../astrology/PastLifeInsightCard.js';
import { SoulJourneyCard } from '../astrology/SoulJourneyCard.js';
import { DeepAstroAnswerCard } from './DeepAstroAnswerCard.js';
import { MarketInsightCard } from './MarketInsightCard.js';
import { NewsInsightCard } from './NewsInsightCard.js';
import { KundliInsightCard } from './KundliInsightCard.js';
import { NumerologyInsightCard } from './NumerologyInsightCard.js';
import { AlertTriangle, Sparkles, BookOpen, Layers } from 'lucide-react';

export interface UniversalInsightCardProps {
  card: {
    type:
      | 'PAST_LIFE_INSIGHT'
      | 'SOUL_JOURNEY'
      | 'MARKET_INSIGHT'
      | 'NEWS_INSIGHT'
      | 'DEEPASTRO_ANSWER'
      | 'KUNDLI_INSIGHT'
      | 'NUMEROLOGY_INSIGHT'
      | 'FUTURE_INSIGHT'
      | 'FUTURE_YEAR'
      | 'FUTURE_MONTH'
      | 'FUTURE_LONGEVITY'
      | string;
    data: any;
  };
  actions?: string[];
  onActionClick?: (action: string) => void;
}

export const UniversalInsightCardEngine: React.FC<UniversalInsightCardProps> = ({
  card,
  actions = [],
  onActionClick,
}) => {
  const [showDeepSoulJourney, setShowDeepSoulJourney] = useState(false);

  if (!card || !card.data) return null;

  // Placeholder protection gate: scan stringified data for unresolved mustache templates
  const rawString = JSON.stringify(card.data);
  if (/\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/.test(rawString)) {
    return (
      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Card generation blocked: Unresolved template variable detected.</span>
      </div>
    );
  }

  const renderCardContent = () => {
    switch (card.type) {
      case 'PAST_LIFE_INSIGHT':
        return (
          <div className="space-y-4">
            <PastLifeInsightCard data={card.data} />
            {showDeepSoulJourney && card.data.rawSchema && (
              <div className="pt-4 border-t border-amber-500/20">
                <div className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Expanded Deep Soul Journey Infographic
                </div>
                <SoulJourneyCard schema={card.data.rawSchema} />
              </div>
            )}
          </div>
        );

      case 'SOUL_JOURNEY':
        return <SoulJourneyCard schema={card.data} />;

      case 'MARKET_INSIGHT':
        return <MarketInsightCard data={card.data} />;

      case 'NEWS_INSIGHT':
        return <NewsInsightCard data={card.data} />;

      case 'KUNDLI_INSIGHT':
        return <KundliInsightCard data={card.data} />;

      case 'NUMEROLOGY_INSIGHT':
        return <NumerologyInsightCard data={card.data} />;

            case 'FUTURE_INSIGHT':
        return <FutureInsightCard data={card.data} />;

      case 'FUTURE_YEAR':
        return <FutureYearCard data={card.data} />;

      case 'FUTURE_MONTH':
        return <FutureMonthCard data={card.data} />;

      case 'FUTURE_LONGEVITY':
        return <FutureLongevityCard data={card.data} />;

      case 'DEEPASTRO_ANSWER':
      default:
        return <DeepAstroAnswerCard card={card.data} />;
    }
  };

  const handleAction = (act: string) => {
    if (act === 'Deep Soul Journey') {
      setShowDeepSoulJourney((prev) => !prev);
    }
    if (onActionClick) {
      onActionClick(act);
    }
  };

  return (
    <div className="w-full space-y-3">
      {renderCardContent()}

      {/* Interactive Action Buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {actions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => handleAction(act)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {act === 'Deep Soul Journey' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ) : act === 'Why this reading?' ? (
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
              <span>{act === 'Deep Soul Journey' && showDeepSoulJourney ? 'Collapse Soul Journey' : act}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
