/**
 * DeepAstro Brain — Intent Classifier v2
 * Classifies user queries into distinct domain and decision intents with multi-intent,
 * temporal dimension (PAST/PRESENT/FUTURE/WHAT_IF), and query refinement support.
 */

export type QueryIntent =
  | 'CAREER'
  | 'BUSINESS'
  | 'FINANCE'
  | 'RELATIONSHIP'
  | 'MARRIAGE'
  | 'EDUCATION'
  | 'FAMILY'
  | 'CHILDREN'
  | 'PROPERTY'
  | 'HEALTH_WELLNESS'
  | 'SPIRITUALITY'
  | 'PERSONAL_DEVELOPMENT'
  | 'TRAVEL'
  | 'RELOCATION'
  | 'TIMING'
  | 'MUHURTA'
  | 'COMPATIBILITY'
  | 'PERSONALITY'
  | 'LIFE_PATTERN'
  | 'PAST_EVENT'
  | 'FUTURE_PERIOD'
  | 'NUMEROLOGY'
  | 'PALMISTRY'
  | 'GENERAL_ASTROLOGY'
  | 'CURRENT_WORLD_CONTEXT'
  | 'DECISION_SUPPORT';

export type TemporalDimension = 'PAST' | 'PRESENT' | 'FUTURE' | 'WHAT_IF' | 'UNSPECIFIED';

export type QueryGrammarMode = 'WHY' | 'HOW' | 'WHETHER' | 'WHEN' | 'WHAT_IF' | 'GENERAL';

export interface IntentClassificationResult {
  primaryIntent: QueryIntent;
  intents: QueryIntent[];
  relevantHouses: number[];
  relevantGrahas: string[];
  temporalDimension: TemporalDimension;
  grammarMode: QueryGrammarMode;
  isDecisionQuery: boolean;
  isTimingQuery: boolean;
  isVagueQuery: boolean;
  refinementDomains?: string[];
  requiresPalmistry: boolean;
  requiresNumerology: boolean;
  confidence: number;
}

export class IntentClassifier {
  /**
   * Classifies user input text into structured query intents with temporal orientation
   */
  public static classify(question: string, options?: { hasPalmImage?: boolean }): IntentClassificationResult {
    const q = question.toLowerCase().trim();
    const intents = new Set<QueryIntent>();
    const relevantHouses = new Set<number>();
    const relevantGrahas = new Set<string>();

    // 0. Detect Vague Inquiries Requiring Refinement
    const vaguePatterns = [
      'what will happen to me',
      'tell me my future',
      'what is going to happen',
      'predict my life',
      'tell me everything',
      'what does future hold',
    ];
    const isVagueQuery = vaguePatterns.some((pattern) => q.includes(pattern));
    const refinementDomains = isVagueQuery
      ? ['CAREER', 'RELATIONSHIP', 'FINANCE', 'EDUCATION', 'HEALTH_WELLNESS', 'RELOCATION', 'SPIRITUALITY']
      : undefined;

    // 1. Temporal Orientation & Grammar Mode
    let temporalDimension: TemporalDimension = 'UNSPECIFIED';
    let grammarMode: QueryGrammarMode = 'GENERAL';

    if (/\b(why did|in the past|previous|last year|earlier|historical|failed in|happened in)\b/.test(q)) {
      temporalDimension = 'PAST';
      intents.add('PAST_EVENT');
      intents.add('LIFE_PATTERN');
    } else if (/\b(should i take|or|option a|option b|either|what if|whether to)\b/.test(q)) {
      temporalDimension = 'WHAT_IF';
      grammarMode = 'WHAT_IF';
      intents.add('DECISION_SUPPORT');
    } else if (/\b(will i|future|upcoming|next year|in 20\d\d|when will|going to happen)\b/.test(q)) {
      temporalDimension = 'FUTURE';
      intents.add('FUTURE_PERIOD');
    } else if (/\b(now|currently|at present|today|this month|right now)\b/.test(q)) {
      temporalDimension = 'PRESENT';
    }

    if (/^why\b|\bwhy did\b/.test(q)) grammarMode = 'WHY';
    else if (/^how\b|\bhow can\b|\bhow will\b/.test(q)) grammarMode = 'HOW';
    else if (/^when\b|\bwhen will\b|\bwhat time\b|\bwhich month\b/.test(q)) grammarMode = 'WHEN';
    else if (/^whether\b|\bshould i\b|\bwould it be\b/.test(q)) grammarMode = 'WHETHER';

    // 2. Career, Job Change & Business
    if (/\b(job|career|work|profession|promotion|boss|office|company|employment|vocation|resignation|switch job)\b/.test(q)) {
      intents.add('CAREER');
      relevantHouses.add(10);
      relevantHouses.add(6);
      relevantHouses.add(2);
      relevantGrahas.add('Sun');
      relevantGrahas.add('Saturn');
      relevantGrahas.add('Mercury');
    }

    if (/\b(business|startup|venture|entrepreneur|client|partner|trade|enterprise|founder)\b/.test(q)) {
      intents.add('BUSINESS');
      relevantHouses.add(7);
      relevantHouses.add(10);
      relevantHouses.add(11);
      relevantGrahas.add('Mercury');
      relevantGrahas.add('Jupiter');
    }

    // 3. Finance & Wealth
    if (/\b(money|wealth|finance|investment|rich|stocks|property|asset|salary|income|debt|savings)\b/.test(q)) {
      intents.add('FINANCE');
      relevantHouses.add(2);
      relevantHouses.add(11);
      relevantHouses.add(8);
      relevantGrahas.add('Jupiter');
      relevantGrahas.add('Venus');
    }

    // 4. Relationships & Marriage
    if (/\b(love|relationship|dating|partner|boyfriend|girlfriend|crush|breakup|affair)\b/.test(q)) {
      intents.add('RELATIONSHIP');
      relevantHouses.add(5);
      relevantHouses.add(7);
      relevantGrahas.add('Venus');
      relevantGrahas.add('Moon');
    }

    if (/\b(marry|married|marriage|wedding|spouse|husband|wife|divorce|in-laws|remarriage)\b/.test(q)) {
      intents.add('MARRIAGE');
      relevantHouses.add(7);
      relevantHouses.add(2);
      relevantHouses.add(8);
      relevantGrahas.add('Venus');
      relevantGrahas.add('Jupiter');
    }

    // 5. Children & Progeny
    if (/\b(child|children|son|daughter|kid|kids|pregnancy|conceive|conceiving|progeny|baby)\b/.test(q)) {
      intents.add('CHILDREN');
      relevantHouses.add(5);
      relevantHouses.add(9);
      relevantHouses.add(2);
      relevantGrahas.add('Jupiter');
    }

    // 6. Property & Real Estate
    if (/\b(property|land|flat|apartment|home purchase|real estate|house purchase|buying a house|plot)\b/.test(q)) {
      intents.add('PROPERTY');
      relevantHouses.add(4);
      relevantHouses.add(11);
      relevantGrahas.add('Mars');
      relevantGrahas.add('Venus');
    }

    // 7. Relocation & Travel
    if (/\b(move|relocate|abroad|foreign|visa|immigration|city|country|travel|flight|settlement)\b/.test(q)) {
      intents.add('RELOCATION');
      intents.add('TRAVEL');
      relevantHouses.add(9);
      relevantHouses.add(12);
      relevantHouses.add(3);
      relevantHouses.add(4);
      relevantGrahas.add('Rahu');
      relevantGrahas.add('Moon');
    }

    // 8. Education & Personal Development
    if (/\b(study|exam|degree|university|college|course|phd|education|learning|admission)\b/.test(q)) {
      intents.add('EDUCATION');
      relevantHouses.add(4);
      relevantHouses.add(5);
      relevantHouses.add(9);
      relevantGrahas.add('Mercury');
      relevantGrahas.add('Jupiter');
    }

    if (/\b(mindset|habits|purpose|personal growth|development|self-improvement|meditation)\b/.test(q)) {
      intents.add('PERSONAL_DEVELOPMENT');
      relevantHouses.add(1);
      relevantHouses.add(9);
      relevantGrahas.add('Sun');
      relevantGrahas.add('Jupiter');
    }

    // 9. Health & Wellness
    if (/\b(health|illness|disease|surgery|recovery|doctor|medical|wellness|vitality|fitness)\b/.test(q)) {
      intents.add('HEALTH_WELLNESS');
      relevantHouses.add(1);
      relevantHouses.add(6);
      relevantHouses.add(8);
      relevantGrahas.add('Sun');
      relevantGrahas.add('Mars');
      relevantGrahas.add('Saturn');
    }

    // 10. Spirituality
    if (/\b(spiritual|moksha|karma|dharma|meditation|guru|temple|pilgrimage|deity|sadhana)\b/.test(q)) {
      intents.add('SPIRITUALITY');
      relevantHouses.add(9);
      relevantHouses.add(12);
      relevantHouses.add(8);
      relevantGrahas.add('Jupiter');
      relevantGrahas.add('Ketu');
    }

    // 11. Timing & Muhurta
    if (/\b(when|timing|which month|what year|date|auspicious|muhurta|shubh)\b/.test(q)) {
      intents.add('TIMING');
      if (/\b(auspicious|muhurta|shubh|ceremony|launch date)\b/.test(q)) {
        intents.add('MUHURTA');
      }
    }

    // 12. Decision Support
    if (/\b(should i|decision|choice|option|versus|vs|stay or leave|choose)\b/.test(q)) {
      intents.add('DECISION_SUPPORT');
    }

    // 13. Palmistry & Numerology
    const requiresPalmistry = Boolean(options?.hasPalmImage) || /\b(palm|hand|mount|heart line|head line|life line|fate line)\b/.test(q);
    if (requiresPalmistry) {
      intents.add('PALMISTRY');
    }

    const requiresNumerology = /\b(numerology|life path|birth number|destiny number|personal year|name number)\b/.test(q);
    if (requiresNumerology) {
      intents.add('NUMEROLOGY');
    }

    // Fallback if no specific domain matched
    if (intents.size === 0) {
      intents.add('GENERAL_ASTROLOGY');
      relevantHouses.add(1);
      relevantGrahas.add('Sun');
      relevantGrahas.add('Jupiter');
    }

    const primaryIntent = Array.from(intents)[0];

    return {
      primaryIntent,
      intents: Array.from(intents),
      relevantHouses: Array.from(relevantHouses).sort((a, b) => a - b),
      relevantGrahas: Array.from(relevantGrahas),
      temporalDimension,
      grammarMode,
      isDecisionQuery: intents.has('DECISION_SUPPORT') || temporalDimension === 'WHAT_IF',
      isTimingQuery: intents.has('TIMING') || grammarMode === 'WHEN',
      isVagueQuery,
      refinementDomains,
      requiresPalmistry,
      requiresNumerology,
      confidence: isVagueQuery ? 0.65 : 0.95,
    };
  }
}
