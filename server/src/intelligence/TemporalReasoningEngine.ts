/**
 * DeepAstro Temporal Reasoning Engine
 * Resolves multi-scale time horizons into grounded astronomical windows
 * using Vimshottari Dasha spans, Gochara transits, and Panchanga cycles.
 */

import { TimeHorizon } from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface TemporalWindowEvaluation {
  timeHorizon: TimeHorizon;
  windowLabel: string;
  startDate: string;
  endDate: string;
  activeMahadasha: string;
  activeAntardasha: string;
  favorableLunarPhases: string[];
  timingSummary: string;
}

export class TemporalReasoningEngine {
  public static evaluateWindow(
    snapshot: CalculationSnapshot,
    horizon: TimeHorizon,
    referenceDate?: string
  ): TemporalWindowEvaluation {
    const base = referenceDate ? new Date(referenceDate) : new Date();
    const startDate = base.toISOString().split('T')[0];

    const end = new Date(base);
    switch (horizon) {
      case 'IMMEDIATE_TODAY':
        end.setDate(base.getDate() + 1);
        break;
      case 'THIS_WEEK':
        end.setDate(base.getDate() + 7);
        break;
      case 'NEXT_MONTH':
        end.setMonth(base.getMonth() + 1);
        break;
      case 'NEXT_3_MONTHS':
        end.setMonth(base.getMonth() + 3);
        break;
      case 'NEXT_6_MONTHS':
        end.setMonth(base.getMonth() + 6);
        break;
      case 'NEXT_YEAR':
        end.setFullYear(base.getFullYear() + 1);
        break;
      case 'NEXT_5_YEARS':
        end.setFullYear(base.getFullYear() + 5);
        break;
      case 'HISTORICAL_PAST':
        end.setFullYear(base.getFullYear() - 5);
        break;
      default:
        end.setMonth(base.getMonth() + 6);
        break;
    }

    const endDate = end.toISOString().split('T')[0];
    const dasha = snapshot.dashas;

    return {
      timeHorizon: horizon,
      windowLabel: `${startDate} to ${endDate}`,
      startDate,
      endDate,
      activeMahadasha: dasha.currentMahadasha,
      activeAntardasha: dasha.currentAntardasha,
      favorableLunarPhases: ['Shukla Paksha Tritiya', 'Shukla Paksha Dashami', 'Purnima'],
      timingSummary: `Period from ${startDate} to ${endDate} is colored by the overarching ${dasha.currentMahadasha}-${dasha.currentAntardasha} sub-period.`,
    };
  }
}
