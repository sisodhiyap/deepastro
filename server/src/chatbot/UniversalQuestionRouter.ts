export type QuestionDomain =
  | 'ASTROLOGY'
  | 'VEDIC'
  | 'KP'
  | 'KP_PRASHNA'
  | 'WESTERN_ASTROLOGY'
  | 'NUMEROLOGY'
  | 'PALMISTRY'
  | 'TAROT'
  | 'CAREER'
  | 'RELATIONSHIP'
  | 'MONEY'
  | 'FINANCE'
  | 'MARKET'
  | 'MACRO'
  | 'NEWS'
  | 'POLITICS'
  | 'GEOPOLITICS'
  | 'WEATHER'
  | 'SCIENCE'
  | 'TECHNOLOGY'
  | 'GENERAL_KNOWLEDGE'
  | 'EDUCATION'
  | 'TRAVEL'
  | 'TIME'
  | 'DATE'
  | 'CALCULATION'
  | 'RESEARCH'
  | 'IMAGE_ANALYSIS'
  | 'PERSONALIZATION';

export interface QuestionIntent {
  originalQuestion: string;
  primaryDomain: QuestionDomain;
  secondaryDomains: QuestionDomain[];
  requiresCurrentData: boolean;
  requiresBirthData: boolean;
  requiresChartSession: boolean;
  requiresExternalSources: boolean;
  requiresCalculation: boolean;
  requiresImage: boolean;
  requiresFactCheck: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class UniversalQuestionRouter {
  public static route(question: string): QuestionIntent {
    const q = question.toLowerCase();
    const secondary: QuestionDomain[] = [];
    let primary: QuestionDomain = 'GENERAL_KNOWLEDGE';
    let requiresCurrentData = false;
    let requiresBirthData = false;
    let requiresChartSession = false;
    let requiresExternalSources = false;
    let requiresCalculation = false;
    let requiresFactCheck = false;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (/\b(today|now|latest|current|recent|live|this week|right now|what happened|price|weather|forecast)\b/.test(q)) {
      requiresCurrentData = true;
      requiresExternalSources = true;
    }

    if (/\b(weather|rain|temperature|humidity|storm|wind|climate|celsius|forecast)\b/.test(q)) {
      primary = 'WEATHER';
      requiresExternalSources = true;
      requiresCurrentData = true;
      if (/\b(astro|sign|cosmic|transits?)\b/.test(q)) {
        secondary.push('ASTROLOGY');
      }
    } else if (/\b(nifty|sensex|stock|market|share|crypto|bitcoin|bull|bear|vix|rally|crash|etf|gold|silver|crude|brent)\b/.test(q)) {
      primary = 'MARKET';
      requiresCurrentData = true;
      requiresExternalSources = true;
      requiresFactCheck = true;
      riskLevel = 'HIGH';
      if (/\b(astro|dasha|transit|planetary|kundli|chart)\b/.test(q)) {
        secondary.push('FINANCE');
        secondary.push('ASTROLOGY');
        requiresBirthData = true;
        requiresChartSession = true;
      }
    } else if (/\b(prashna|horary|1-249|249|seed number)\b/.test(q) || (/\bwill i\b/.test(q) && /\b(job|promotion|recover|win|marry)\b/.test(q) && /\b(\d{1,3})\b/.test(q))) {
      primary = 'KP_PRASHNA';
      secondary.push('KP');
      requiresCalculation = true;
    } else if (/\b(kp|sub lord|cusp|cuspal|star lord|nakshatra lord)\b/.test(q)) {
      primary = 'KP';
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(tarot|card|draw|celtic cross|spread)\b/.test(q)) {
      primary = 'TAROT';
    } else if (/\b(palm|palmistry|hand|mount|lifeline|heartline|headline)\b/.test(q)) {
      primary = 'PALMISTRY';
    } else if (/\b(numerology|life path|destiny number|name number|personal year)\b/.test(q)) {
      primary = 'NUMEROLOGY';
      requiresCalculation = true;
    } else if (/\b(western|tropical|placidus|aspect|square|trine|opposition|ascendant in leo)\b/.test(q)) {
      primary = 'WESTERN_ASTROLOGY';
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(news|rbi|sebi|election|minister|war|government|announcement|headline)\b/.test(q)) {
      primary = 'NEWS';
      requiresCurrentData = true;
      requiresExternalSources = true;
      requiresFactCheck = true;
    } else if (/\b(career|job|promotion|interview|profession|boss|salary|office)\b/.test(q)) {
      primary = 'CAREER';
      secondary.push('VEDIC');
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(marriage|partner|spouse|relationship|love|divorce|dating)\b/.test(q)) {
      primary = 'RELATIONSHIP';
      secondary.push('VEDIC');
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(money|wealth|property|finance|loan|debt|bank)\b/.test(q)) {
      primary = 'MONEY';
      secondary.push('VEDIC');
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(dasha|kundli|transit|varga|yoga|graha|nakshatra|rashi|jyotish|shani|rahu|ketu|jupiter)\b/.test(q)) {
      primary = 'VEDIC';
      secondary.push('ASTROLOGY');
      requiresBirthData = true;
      requiresChartSession = true;
      requiresCalculation = true;
    } else if (/\b(quantum|physics|gravity|relativity|biology|chemistry|black hole|eclipse|galaxy|sun|moon scientific)\b/.test(q)) {
      primary = 'SCIENCE';
      requiresFactCheck = true;
    }

    return {
      originalQuestion: question,
      primaryDomain: primary,
      secondaryDomains: secondary,
      requiresCurrentData,
      requiresBirthData,
      requiresChartSession,
      requiresExternalSources,
      requiresCalculation,
      requiresImage: true,
      requiresFactCheck,
      riskLevel
    };
  }
}
