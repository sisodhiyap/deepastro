/**
 * DeepAstro Brain — Research Planner
 * Determines required analytical systems, chart factors, memory scopes,
 * and external research needs before generating an answer.
 */

import { IntentClassifier, IntentClassificationResult } from './IntentClassifier.js';

export interface ResearchPlan {
  question: string;
  intent: IntentClassificationResult;
  requiredChartFactors: string[];
  requiredRules: string[];
  requiredSystems: Array<'VEDIC' | 'JAIMINI' | 'KP' | 'NUMEROLOGY' | 'PALMISTRY' | 'PANCHANG'>;
  requiredMemoryCategories: string[];
  requiresLifeEvents: boolean;
  requiresWebResearch: boolean;
  requiresPalmistry: boolean;
  requiresNumerology: boolean;
  uncertainties: string[];
}

export class ResearchPlanner {
  /**
   * Plans the multi-system intelligence retrieval for a user question
   */
  public static plan(
    question: string,
    options?: {
      hasPalmImage?: boolean;
      allowPublicResearch?: boolean;
      preferredSystems?: string[];
    }
  ): ResearchPlan {
    const intent = IntentClassifier.classify(question, { hasPalmImage: options?.hasPalmImage });
    const requiredSystems: ResearchPlan['requiredSystems'] = ['VEDIC', 'PANCHANG'];
    const requiredChartFactors: string[] = [];
    const requiredRules: string[] = [];
    const requiredMemoryCategories: string[] = ['goals', 'preferences'];
    const uncertainties: string[] = [];

    // 1. Identify Required Systems based on intent and options
    if (intent.intents.includes('CAREER') || intent.intents.includes('BUSINESS')) {
      requiredSystems.push('JAIMINI'); // Amatyakaraka analysis is invaluable for career
      requiredChartFactors.push('10th House (Karma Bhava)', '10th Lord placement', 'D10 Dasamsha Chart', 'Saturn & Jupiter Transits');
      requiredRules.push('BPHS_H10_EXALTATION', 'BPHS_AMATYAKARAKA_STRENGTH');
      requiredMemoryCategories.push('confirmed_life_events');
    }

    if (intent.intents.includes('MARRIAGE') || intent.intents.includes('RELATIONSHIP')) {
      requiredSystems.push('JAIMINI'); // Darakaraka & Upapada Lagna
      requiredChartFactors.push('7th House (Kalatra Bhava)', 'Venus dignity', 'D9 Navamsha Chart', 'Upapada Lagna');
      requiredRules.push('BPHS_H7_L7_KENDRA', 'JAIMINI_UPAPADA_SUSTENANCE');
    }

    if (intent.intents.includes('TIMING') || intent.intents.includes('MUHURTA')) {
      requiredSystems.push('KP');
      requiredChartFactors.push('Current Antardasha Lord', 'Current Pratyantardasha', 'Lunar Tithi', 'Gochar Transit Degrees');
      uncertainties.push('Precise life event timing is subject to free will, environment, and personal decision readiness.');
    }

    if (intent.requiresNumerology || options?.preferredSystems?.includes('NUMEROLOGY')) {
      requiredSystems.push('NUMEROLOGY');
      requiredChartFactors.push('Life Path Number', 'Personal Year Cycle');
    }

    if (intent.requiresPalmistry || options?.hasPalmImage) {
      requiredSystems.push('PALMISTRY');
      requiredChartFactors.push('Fate Line Clarity', 'Sun Mount Prominence', 'Head Line Curvature');
    }

    // Determine if current public research is useful (e.g. for industry or relocation questions)
    const requiresWebResearch =
      Boolean(options?.allowPublicResearch) &&
      (intent.intents.includes('BUSINESS') || intent.intents.includes('RELOCATION') || intent.intents.includes('CURRENT_WORLD_CONTEXT'));

    const requiresLifeEvents =
      intent.intents.includes('CAREER') || intent.intents.includes('LIFE_PATTERN') || intent.intents.includes('PAST_EVENT');

    return {
      question,
      intent,
      requiredChartFactors: Array.from(new Set(requiredChartFactors)),
      requiredRules: Array.from(new Set(requiredRules)),
      requiredSystems: Array.from(new Set(requiredSystems)),
      requiredMemoryCategories: Array.from(new Set(requiredMemoryCategories)),
      requiresLifeEvents,
      requiresWebResearch,
      requiresPalmistry: intent.requiresPalmistry,
      requiresNumerology: requiredSystems.includes('NUMEROLOGY'),
      uncertainties,
    };
  }
}
