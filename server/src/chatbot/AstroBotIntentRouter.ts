/**
 * AstroBotIntentRouter (Universal Insight Layer v4.2.1)
 * High-precision intent classification and conversational routing across
 * all 29 canonical DeepAstro domains and follow-up contexts.
 */

export type AstroBotIntent =
  | 'GENERAL_ASTROLOGY'
  | 'KUNDLI'
  | 'PLANETARY_ANALYSIS'
  | 'DASHA'
  | 'TRANSIT'
  | 'CAREER'
  | 'BUSINESS'
  | 'FINANCE'
  | 'RELATIONSHIP'
  | 'COMPATIBILITY'
  | 'NUMEROLOGY'
  | 'PALMISTRY'
  | 'PAST_LIFE'
  | 'PAST_LIFE_DEEP'
  | 'KARMA'
  | 'SPIRITUALITY'
  | 'PANCHANG'
  | 'MUHURAT'
  | 'PREDICTION'
  | 'LIFE_PATTERN'
  | 'LIFE_PURPOSE'
  | 'RELOCATION'
  | 'NEWS'
  | 'MARKET'
  | 'ECONOMY'
  | 'WORLD_EVENTS'
  | 'REAL_TIME_ASTROLOGY'
  | 'RESEARCH'
  | 'REPORT'
  | 'GENERAL_QUESTION'
  | 'FUTURE_FORECAST'
  | 'FUTURE_YEAR'
  | 'FUTURE_MONTH'
  | 'FUTURE_CAREER'
  | 'FUTURE_LONGEVITY'
  | 'FUTURE_COMPARE'
  | 'FUTURE_PAST_SOUL';

export interface IntentRoutingResult {
  originalQuestion: string;
  primaryIntent: AstroBotIntent;
  secondaryIntents: AstroBotIntent[];
  requiresPastLifeEngine: boolean;
  requiresRealTimeMarket: boolean;
  requiresRealTimeNews: boolean;
  requiresBirthData: boolean;
  requiresEphemeris: boolean;
  requiresNumerology: boolean;
  requiresCrossEngineFusion: boolean;
  isFollowUp: boolean;
  confidence: number;
}

export interface ConversationHistoryContext {
  lastIntent?: AstroBotIntent;
  lastReadingId?: string;
  hasSoulTrace?: boolean;
  hasMarketContext?: boolean;
}

export class AstroBotIntentRouter {
  public static route(
    question: string,
    historyContext?: ConversationHistoryContext
  ): IntentRoutingResult {
    const raw = question.trim();
    const q = raw.toLowerCase();
    const secondary: AstroBotIntent[] = [];
    let isFollowUp = false;

    // 1. Follow-up detection if previous context exists
    if (historyContext?.lastIntent === 'PAST_LIFE' || historyContext?.lastIntent === 'KARMA' || historyContext?.hasSoulTrace) {
      if (/\b(what was my (profession|job|role|work)|who was i|where did i live|what karma|karmic debt|why this reading|deep soul journey|tell me more about this life)\b/i.test(q)) {
        isFollowUp = true;
        if (/\b(career|current career|work in this life|affect my career|current job)\b/i.test(q)) {
          return {
            originalQuestion: raw,
            primaryIntent: 'CAREER',
            secondaryIntents: ['PAST_LIFE', 'KARMA'],
            requiresPastLifeEngine: true,
            requiresRealTimeMarket: false,
            requiresRealTimeNews: false,
            requiresBirthData: true,
            requiresEphemeris: true,
            requiresNumerology: false,
            requiresCrossEngineFusion: true,
            isFollowUp: true,
            confidence: 0.96,
          };
        }
        return {
          originalQuestion: raw,
          primaryIntent: /deep soul journey|expand reading|infographic|full report/i.test(q) ? 'PAST_LIFE_DEEP' : 'PAST_LIFE',
          secondaryIntents: ['KARMA'],
          requiresPastLifeEngine: true,
          requiresRealTimeMarket: false,
          requiresRealTimeNews: false,
          requiresBirthData: true,
          requiresEphemeris: true,
          requiresNumerology: true,
          requiresCrossEngineFusion: false,
          isFollowUp: true,
          confidence: 0.98,
        };
      }
    }


    // 2.5 Future Intelligence Routing (CFIE v1.0.0)
    if (/\b(what did i bring from (my )?past life.*affect (my )?future|past life.*future|soul journey timeline)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_PAST_SOUL',
        secondaryIntents: ['PAST_LIFE', 'FUTURE_FORECAST', 'KARMA'],
        requiresPastLifeEngine: true,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: true,
        requiresCrossEngineFusion: true,
        isFollowUp: false,
        confidence: 0.98,
      };
    }

    if (/\b(compare 20\d\d and 20\d\d|compare years|20\d\d vs 20\d\d)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_COMPARE',
        secondaryIntents: ['FUTURE_FORECAST'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    if (/\b(longevity|lifespan|health-span|healthspan|how long will i live|when will i die)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_LONGEVITY',
        secondaryIntents: ['FUTURE_FORECAST', 'GENERAL_ASTROLOGY'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.96,
      };
    }

    if (/\b(break down.*month by month|month by month|monthly forecast|monthly breakdown|what will month.*be like)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_MONTH',
        secondaryIntents: ['FUTURE_FORECAST'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: true,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    if (/\b(what (about|will|does).*20\d\d|forecast for 20\d\d|year 20\d\d|in 20\d\d)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_YEAR',
        secondaryIntents: ['FUTURE_FORECAST'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: true,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.96,
      };
    }

    if (/\b(what is my future|show me my future|my future(?!\s+(career|job|marriage|partner|spouse|relationship|finance|money|business))|future forecast|next 10 years|next ten years|cosmic future|future map)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'FUTURE_FORECAST',
        secondaryIntents: ['GENERAL_ASTROLOGY', 'PREDICTION'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: true,
        requiresCrossEngineFusion: true,
        isFollowUp: false,
        confidence: 0.97,
      };
    }

    // 2. Past Life & Karma Detection
    if (/\b(past life|past lives|previous life|previous birth|who was i before|soul journey|soul trace|soultrace|reincarnation|past incarnation)\b/i.test(q)) {
      if (/\b(deep|expand|full report|journey card|infographic)\b/i.test(q)) {
        return {
          originalQuestion: raw,
          primaryIntent: 'PAST_LIFE_DEEP',
          secondaryIntents: ['PAST_LIFE', 'KARMA', 'SPIRITUALITY'],
          requiresPastLifeEngine: true,
          requiresRealTimeMarket: false,
          requiresRealTimeNews: false,
          requiresBirthData: true,
          requiresEphemeris: true,
          requiresNumerology: true,
          requiresCrossEngineFusion: false,
          isFollowUp: false,
          confidence: 0.98,
        };
      }
      return {
        originalQuestion: raw,
        primaryIntent: 'PAST_LIFE',
        secondaryIntents: ['KARMA', 'SPIRITUALITY'],
        requiresPastLifeEngine: true,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: true,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.97,
      };
    }

    if (/\b(karma|karmic debt|karmic pattern|karmic carryover|past karma|prarabdha|sanchita)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'KARMA',
        secondaryIntents: ['PAST_LIFE', 'SPIRITUALITY'],
        requiresPastLifeEngine: true,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.94,
      };
    }

    // 3. Real-Time Market & Economy
    const hasMarketWord = /\b(market|nifty|sensex|stock|stocks|equity|share price|indices|rally|crash|bear|bull|vix)\b/i.test(q);
    const hasAstroWord = /\b(affect my chart|affect me|my chart|my career|kundli|transit|dasha|planetary|horoscope)\b/i.test(q);

    if (hasMarketWord && hasAstroWord) {
      return {
        originalQuestion: raw,
        primaryIntent: 'REAL_TIME_ASTROLOGY',
        secondaryIntents: ['MARKET', 'CAREER', 'FINANCE'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: true,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: true,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    if (hasMarketWord || /\b(how is the market today|today\'s market|market today|stock price|trading session)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'MARKET',
        secondaryIntents: ['ECONOMY', 'FINANCE'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: true,
        requiresRealTimeNews: false,
        requiresBirthData: false,
        requiresEphemeris: false,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.96,
      };
    }

    // 4. Real-Time News & World Events
    const hasNewsWord = /\b(news|headline|headlines|breaking news|world events|what happened today|what\'s happening in the world)\b/i.test(q);
    if (hasNewsWord && /\b(matters to me|affect me|for me|my life)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'NEWS',
        secondaryIntents: ['WORLD_EVENTS', 'LIFE_PATTERN'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: true,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: true,
        isFollowUp: false,
        confidence: 0.94,
      };
    }

    if (hasNewsWord || /\b(what is today\'s news|today\'s news|current events)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'NEWS',
        secondaryIntents: ['WORLD_EVENTS'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: true,
        requiresBirthData: false,
        requiresEphemeris: false,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    // 5. Kundli & Planetary Analysis
    if (/\b(show me my kundli|my kundli|birth chart|natal chart|ascendant|lagna|planetary positions)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'KUNDLI',
        secondaryIntents: ['PLANETARY_ANALYSIS'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.96,
      };
    }

    // 6. Dasha & Transits
    if (/\b(dasha|current dasha|mahadasha|antardasha|vimshottari|planetary period)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'DASHA',
        secondaryIntents: ['TRANSIT', 'PREDICTION'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.97,
      };
    }

    if (/\b(transit|planetary transit|gochar|saturn transit|jupiter transit|rahu transit)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'TRANSIT',
        secondaryIntents: ['PREDICTION'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    // 7. Career & Business
    if (/\b(career|job|promotion|salary|will i change jobs|change job|boss|profession|future career)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'CAREER',
        secondaryIntents: ['BUSINESS', 'FINANCE'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    if (/\b(business|startup|entrepreneur|partnership|start my business|new venture)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'BUSINESS',
        secondaryIntents: ['CAREER', 'FINANCE', 'MUHURAT'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.94,
      };
    }

    // 8. Relationship & Compatibility
    if (/\b(compatibility|compare me with|partner|synastry|gun milan|ashtakoot|kundli match)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'COMPATIBILITY',
        secondaryIntents: ['RELATIONSHIP'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.96,
      };
    }

    if (/\b(relationship|love|marriage|spouse|partner|breakup|divorce|dating|repeat.*relationship pattern)\b/i.test(q)) {
      const isPattern = /\b(pattern|repeat|cycle)\b/i.test(q);
      return {
        originalQuestion: raw,
        primaryIntent: isPattern ? 'LIFE_PATTERN' : 'RELATIONSHIP',
        secondaryIntents: isPattern ? ['RELATIONSHIP', 'KARMA'] : ['LIFE_PATTERN'],
        requiresPastLifeEngine: isPattern,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: isPattern,
        isFollowUp: false,
        confidence: 0.94,
      };
    }

    // 9. Numerology
    if (/\b(numerology|life path|destiny number|name number|expression number|birth number)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'NUMEROLOGY',
        secondaryIntents: ['PREDICTION'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: false,
        requiresNumerology: true,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.97,
      };
    }

    // 10. Palmistry
    if (/\b(palm|palmistry|hand analysis|mounts|heart line|life line|head line)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'PALMISTRY',
        secondaryIntents: ['GENERAL_ASTROLOGY'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: false,
        requiresEphemeris: false,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.92,
      };
    }

    // 11. Panchang & Muhurat
    if (/\b(panchang|tithi|nakshatra today|rahu kalam|choghadiya|daily panchang)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'PANCHANG',
        secondaryIntents: ['MUHURAT'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: false,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.95,
      };
    }

    if (/\b(muhurat|auspicious time|good time to|shubh muhurat|propitious timing)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'MUHURAT',
        secondaryIntents: ['PANCHANG', 'BUSINESS'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.94,
      };
    }

    // 12. General Astrology / Horoscope / Prediction
    if (/\b(horoscope today|today\'s horoscope|daily horoscope|my prediction|what is happening in my life)\b/i.test(q)) {
      return {
        originalQuestion: raw,
        primaryIntent: 'PREDICTION',
        secondaryIntents: ['TRANSIT', 'DASHA'],
        requiresPastLifeEngine: false,
        requiresRealTimeMarket: false,
        requiresRealTimeNews: false,
        requiresBirthData: true,
        requiresEphemeris: true,
        requiresNumerology: false,
        requiresCrossEngineFusion: false,
        isFollowUp: false,
        confidence: 0.93,
      };
    }

    return {
      originalQuestion: raw,
      primaryIntent: 'GENERAL_QUESTION',
      secondaryIntents: ['GENERAL_ASTROLOGY'],
      requiresPastLifeEngine: false,
      requiresRealTimeMarket: false,
      requiresRealTimeNews: false,
      requiresBirthData: false,
      requiresEphemeris: false,
      requiresNumerology: false,
      requiresCrossEngineFusion: false,
      isFollowUp: false,
      confidence: 0.85,
    };
  }
}
