/**
 * DeepAstro User Intent Engine
 * Granularly classifies queries into 28 domains, extracts time horizons,
 * emotional tone, urgency, depth, and the core user objective.
 */

import { IntentCategory, TimeHorizon, UrgencyLevel, EmotionalTone, ReadingDepth } from './IntelligenceTypes.js';

export interface ParsedUserIntent {
  primaryCategory: IntentCategory;
  secondaryCategories: IntentCategory[];
  timeHorizon: TimeHorizon;
  urgency: UrgencyLevel;
  emotionalTone: EmotionalTone;
  requestedDepth: ReadingDepth;
  userObjective: string;
  isVague: boolean;
}

export class UserIntentEngine {
  public static classifyIntent(query: string, preferredDepth: ReadingDepth = 'STANDARD'): ParsedUserIntent {
    const q = query.toLowerCase().trim();

    const categories: IntentCategory[] = [];

    // Category detection rules
    if (/\b(should i|decision|choice|choose|option a|option b|select between)\b/.test(q)) {
      categories.push('DECISION');
    }
    if (/\b(job|work|career|promotion|boss|office|salary|raise|hire|hired|profession)\b/.test(q)) {
      categories.push('CAREER');
      if (/\b(job|switch|quit|interview|offer)\b/.test(q)) categories.push('JOB');
    }
    if (/\b(business|startup|company|venture|client|contract|partnership)\b/.test(q)) {
      categories.push('BUSINESS');
    }
    if (/\b(money|wealth|finance|investment|stock|crypto|debt|loan|property|asset|rich)\b/.test(q)) {
      categories.push('MONEY');
    }
    if (/\b(love|relationship|dating|partner|boyfriend|girlfriend|ex|crush|breakup|divorce)\b/.test(q)) {
      categories.push('RELATIONSHIP');
    }
    if (/\b(marry|marriage|wedding|spouse|husband|wife|matrimony|milan)\b/.test(q)) {
      categories.push('MARRIAGE');
    }
    if (/\b(family|parent|mother|father|child|children|son|daughter|brother|sister)\b/.test(q)) {
      categories.push('FAMILY');
    }
    if (/\b(study|exam|college|university|degree|education|admission|learn|student)\b/.test(q)) {
      categories.push('EDUCATION');
    }
    if (/\b(health|illness|disease|surgery|recovery|doctor|energy|diet|vitality)\b/.test(q)) {
      categories.push('HEALTH');
    }
    if (/\b(spiritual|meditation|dharma|karma|guru|enlightenment|soul|moksha)\b/.test(q)) {
      categories.push('SPIRITUALITY');
    }
    if (/\b(move|relocat(e|ing|ion)|shift|city|country|abroad|foreign|settle|visa)\b/.test(q)) {
      categories.push('RELOCATION');
    }
    if (/\b(travel|trip|journey|flight|vacation)\b/.test(q)) {
      categories.push('TRAVEL');
    }
    if (/\b(when|time|timing|date|year|month|window|period|shubh|auspicious)\b/.test(q)) {
      categories.push('TIMING');
    }
    if (/\b(who am i|personality|nature|traits|strength|weakness|temperament)\b/.test(q)) {
      categories.push('PERSONALITY');
    }
    if (/\b(pattern|cycle|repeat|always happens|recurring|history)\b/.test(q)) {
      categories.push('LIFE_PATTERN');
    }
    if (/\b(past|happened|in 20\d\d|previous|replay|why did)\b/.test(q)) {
      categories.push('PAST_EVENT');
    }
    if (/\b(future|next year|upcoming|what lies ahead|prediction|forecast)\b/.test(q)) {
      categories.push('FUTURE_PERIOD');
    }
    if (/\b(compatibility|match|synastry|kundli milan|gun milan)\b/.test(q)) {
      categories.push('COMPATIBILITY');
    }
    if (/\b(today|daily|day ahead|current vibe|daily guidance)\b/.test(q)) {
      categories.push('DAILY_GUIDANCE');
    }
    if (/\b(muhurta|muhurat|auspicious time|best time to start)\b/.test(q)) {
      categories.push('MUHURTA');
    }
    if (/\b(panchang|tithi|nakshatra|rahu kalam|choghadiya)\b/.test(q)) {
      categories.push('PANCHANGA');
    }
    if (/\b(numerology|life path|name number|expression number)\b/.test(q)) {
      categories.push('NUMEROLOGY');
    }
    if (/\b(palm|palmistry|hand|mount|line of life|head line|heart line)\b/.test(q)) {
      categories.push('PALMISTRY');
    }
    if (/\b(chart|kundli|dasha|house|lord|planet|graha|aspect|yoga|dosha)\b/.test(q)) {
      categories.push('GENERAL_ASTROLOGY');
    }
    if (/\b(report|pdf|dossier|download|summary)\b/.test(q)) {
      categories.push('REPORT');
    }
    if (/\b(research|population|economy|climate|infrastructure|cost of living)\b/.test(q)) {
      categories.push('RESEARCH');
    }

    const primaryCategory: IntentCategory = categories[0] || 'GENERAL_ASTROLOGY';
    const secondaryCategories: IntentCategory[] = categories.slice(1);

    // Time horizon detection
    let timeHorizon: TimeHorizon = 'NEXT_6_MONTHS';
    if (/\b(today|tonight|now|this morning|this evening)\b/.test(q)) timeHorizon = 'IMMEDIATE_TODAY';
    else if (/\b(this week|weekend|next few days)\b/.test(q)) timeHorizon = 'THIS_WEEK';
    else if (/\b(this month|next month|next 30 days)\b/.test(q)) timeHorizon = 'NEXT_MONTH';
    else if (/\b(next 3 months|quarter|upcoming quarter)\b/.test(q)) timeHorizon = 'NEXT_3_MONTHS';
    else if (/\b(6 months|half year)\b/.test(q)) timeHorizon = 'NEXT_6_MONTHS';
    else if (/\b(next year|this year|12 months|2026|2027)\b/.test(q)) timeHorizon = 'NEXT_YEAR';
    else if (/\b(5 years|long term|decade|future)\b/.test(q)) timeHorizon = 'NEXT_5_YEARS';
    else if (/\b(past|history|in 20\d\d|before|last year)\b/.test(q)) timeHorizon = 'HISTORICAL_PAST';
    else if (/\b(life|lifetime|overall|destiny)\b/.test(q)) timeHorizon = 'LIFETIME';

    // Urgency level
    let urgency: UrgencyLevel = 'MODERATE';
    if (/\b(urgent|emergency|immediately|asap|today|critical|deadline|tomorrow)\b/.test(q)) urgency = 'HIGH';
    else if (/\b(crisis|desperate|disaster|cannot wait)\b/.test(q)) urgency = 'CRITICAL';
    else if (/\b(general|curious|someday|wondering|just asking)\b/.test(q)) urgency = 'LOW';

    // Emotional tone
    let emotionalTone: EmotionalTone = 'OBJECTIVE';
    if (/\b(scared|worried|anxious|nervous|fear|stress|panic)\b/.test(q)) emotionalTone = 'ANXIOUS';
    else if (/\b(hope|excited|looking forward|optimistic|dream)\b/.test(q)) emotionalTone = 'HOPEFUL';
    else if (/\b(lost|confused|stuck|don't know|unclear|dilemma)\b/.test(q)) emotionalTone = 'CONFUSED';
    else if (/\b(ready|decided|action|plan|execute)\b/.test(q)) emotionalTone = 'DECISIVE';
    else if (/\b(skeptical|doubt|really|prove|fake)\b/.test(q)) emotionalTone = 'SKEPTICAL';

    // Requested depth
    let requestedDepth: ReadingDepth = preferredDepth;
    if (/\b(brief|short|quick|simple|nutshell|one line|summary)\b/.test(q)) requestedDepth = 'BEGINNER';
    else if (/\b(in-depth|detailed|technical|deep dive|full breakdown|shastra|degrees|varga|sources)\b/.test(q)) requestedDepth = 'EXPERT';

    // Vague question detection
    const isVague = q.length < 25 && /^(will i|am i|can i|is it good|what about me|tell me my future|success)\??$/i.test(q);

    // Formulate clean objective
    let userObjective = `Seek guidance regarding ${primaryCategory.toLowerCase()} considerations.`;
    if (primaryCategory === 'CAREER' && categories.includes('TIMING')) {
      userObjective = 'Identify higher-support astronomical windows for professional career progression.';
    } else if (primaryCategory === 'DECISION') {
      userObjective = 'Objectively evaluate alternatives against astrological and personal constraints.';
    } else if (primaryCategory === 'RELATIONSHIP') {
      userObjective = 'Examine interpersonal dynamics, emotional timing, and mutual growth themes.';
    }

    return {
      primaryCategory,
      secondaryCategories,
      timeHorizon,
      urgency,
      emotionalTone,
      requestedDepth,
      userObjective,
      isVague,
    };
  }
}
