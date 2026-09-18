/**
 * DeepAstro 7.0 — Past Life Card Engine (PastLifeCardEngine)
 * Builds the SoulTrace Four Pillars, evidence matrix, uncertainty explorer,
 * and calibrated action buttons.
 */

import {
  PastLifeInsightSchema,
  PastLifeAstrologicalIndicator,
  PastLifeNumerologyIndicator,
  PastLifeKarmicPattern,
  PastLifeCurrentLifeConnection,
} from './PastLifeTypes.js';

export interface FourPillarsData {
  originTheme: { title: string; description: string; source: string };
  karmicPattern: { title: string; description: string; source: string };
  carriedStrength: { title: string; description: string; source: string };
  presentLifeLesson: { title: string; description: string; source: string };
}

export interface PastLifeCardFormattedData {
  format: 'insight_card';
  cardTitle: 'PAST LIFE INSIGHT';
  subTitle: 'PAST LIFE INTELLIGENCE';
  archetype: string;
  fourPillars: FourPillarsData;
  whyThisReading: Array<{ indicator: string; source: string; explanation: string }>;
  whatCouldChangeThis: {
    uncertaintyNotes: string[];
    birthTimeSensitivity: string;
    contradictingSignals: string[];
  };
  convergence: {
    score: number;
    category: string;
    disclaimer: string;
  };
  actionButtons: Array<{ id: string; label: string; action: string }>;
  userProfile: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
  };
  summary: string;
  visualTheme: string;
  artworkPrompt: string;
  astrologicalHighlights: Array<{ label: string; value: string }>;
  numerologyHighlights: Array<{ label: string; value: number | string }>;
  vedicWisdomQuote: { source: string; theme: string };
  keyThemes: string[];
  karmicConnections: Array<{ pattern: string; currentLife: string }>;
  currentLifeInfluence: Array<{ area: string; guidance: string }>;
  soulMessage: string;
  disclaimer: string;
  rawSchema?: any;
}

export class PastLifeCardEngine {
  public static formatForInsightCard(schema: PastLifeInsightSchema & { convergence?: any }): PastLifeCardFormattedData {
    const originTitle = schema.setting.environment || 'Contemplative Hermitage & Sacred Ground';
    const originDesc = schema.narrative.summary || 'A life dedicated to the systematic preservation of sacred principles.';

    const karmicTitle = schema.karmic_patterns[0]?.pattern || 'Ketu-Rahu Evolutionary Axis';
    const karmicDesc = schema.karmic_patterns[0]?.current_life_expression || 'Balancing spiritual intuition with worldly responsibilities.';

    const strengthTitle = schema.themes[0] || 'Deep Introspective Discernment';
    const strengthDesc = `Carried forward from ${schema.archetype.primary.replace(/_/g, ' ')} mastery, providing instinctive ethical clarity.`;

    const lessonTitle = schema.unfinished_lessons[0] || 'Harmonizing Selfless Service and Personal Dharma';
    const lessonDesc = schema.narrative.soul_message || 'Transforming past vows into compassionate present-day action.';

    const fourPillars: FourPillarsData = {
      originTheme: { title: originTitle, description: originDesc, source: 'Vedic D1 & Ketu Nakshatra' },
      karmicPattern: { title: karmicTitle, description: karmicDesc, source: 'Jaimini Atmakaraka & 12th Bhava' },
      carriedStrength: { title: strengthTitle, description: strengthDesc, source: 'Navamsha D9 & Numerology' },
      presentLifeLesson: { title: lessonTitle, description: lessonDesc, source: 'Vimshottari Dasha & Puranic Context' },
    };

    const whyThisReading = schema.astrological_indicators.slice(0, 4).map((ind: PastLifeAstrologicalIndicator) => ({
      indicator: ind.indicator,
      source: 'Vedic Ephemeris & Jaimini Sutras',
      explanation: `${ind.placement}: ${ind.significance}`,
    }));

    const whatCouldChangeThis = {
      uncertaintyNotes: schema.uncertainty_notes || [
        'Symbolic interpretation grounded in classical Jyotish tradition; not empirically provable.',
      ],
      birthTimeSensitivity: schema.user_profile_summary.birthTime
        ? 'A shift of more than 5 minutes modifies the Navamsha and Shashtiamsa divisional cusps.'
        : 'Approximate birth time limits fine-grained D60 analysis.',
      contradictingSignals: schema.contradictions.map(c => `${c.conflict}: ${c.resolution}`),
    };

    const actionButtons = [
      { id: 'deep_journey', label: 'Deep Soul Journey', action: 'OPEN_DEEP_JOURNEY' },
      { id: 'why_reading', label: 'Why This Reading?', action: 'VIEW_EVIDENCE' },
      { id: 'view_evidence', label: 'View Evidence', action: 'VIEW_EVIDENCE' },
      { id: 'view_contradictions', label: 'View Contradictions', action: 'VIEW_CONTRADICTIONS' },
      { id: 'compare_present', label: 'Compare with Present', action: 'COMPARE_PRESENT' },
      { id: 'save_reading', label: 'Save Reading', action: 'SAVE_READING' },
      { id: 'generate_report', label: 'Generate Report', action: 'GENERATE_REPORT' },
      { id: 'ask_astrobot', label: 'Ask AstroBot', action: 'ASK_ASTROBOT' },
    ];

    const convergenceScore = (schema as any).convergence?.convergenceScore ?? 0.85;
    const convergenceCat = (schema as any).convergence?.convergenceCategory ?? 'STRONG_CONVERGENCE';

    return {
      format: 'insight_card',
      cardTitle: 'PAST LIFE INSIGHT',
      subTitle: 'PAST LIFE INTELLIGENCE',
      archetype: schema.archetype.primary.replace(/_/g, ' '),
      fourPillars,
      whyThisReading,
      whatCouldChangeThis,
      convergence: {
        score: convergenceScore,
        category: convergenceCat,
        disclaimer: 'Convergence denotes structural agreement among implemented astrological, numerological, and textual models. It is strictly not empirical proof.',
      },
      actionButtons,
      userProfile: {
        name: schema.user_profile_summary.name,
        dob: schema.user_profile_summary.birthDate,
        tob: schema.user_profile_summary.birthTime,
        pob: schema.user_profile_summary.birthPlace,
      },
      summary: schema.narrative.summary,
      visualTheme: schema.visual_direction.theme,
      artworkPrompt: schema.visual_direction.artwork_prompt,
      astrologicalHighlights: schema.astrological_indicators.slice(0, 5).map((ind: PastLifeAstrologicalIndicator) => ({
        label: ind.indicator,
        value: ind.placement,
      })),
      numerologyHighlights: schema.numerology_indicators.map((num: PastLifeNumerologyIndicator) => ({
        label: num.type,
        value: num.value,
      })),
      vedicWisdomQuote: {
        source: schema.vedic_references[0]?.title || 'Brihat Parashara Hora Shastra',
        theme: schema.vedic_references[0]?.philosophicalTheme || 'Atmakaraka as Soul Indicator',
      },
      keyThemes: schema.themes,
      karmicConnections: schema.karmic_patterns.map((p: PastLifeKarmicPattern) => ({
        pattern: p.pattern,
        currentLife: p.current_life_expression,
      })),
      currentLifeInfluence: schema.current_life_connections.map((c: PastLifeCurrentLifeConnection) => ({
        area: c.area.toUpperCase(),
        guidance: c.actionable_guidance,
      })),
      soulMessage: schema.narrative.soul_message,
      disclaimer: schema.epistemic_notice,
      rawSchema: schema,
    };
  }

  public static formatForSoulJourney(schema: PastLifeInsightSchema) {
    return {
      format: 'soul_journey' as const,
      fullSchema: schema,
    };
  }
}
