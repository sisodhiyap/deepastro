import {
  PastLifeInsightSchema,
  PastLifeAstrologicalIndicator,
  PastLifeNumerologyIndicator,
  PastLifeKarmicPattern,
  PastLifeCurrentLifeConnection,
} from './PastLifeTypes.js';

export class PastLifeCardEngine {
  public static formatForInsightCard(schema: PastLifeInsightSchema) {
    return {
      format: 'insight_card' as const,
      cardTitle: 'PAST LIFE INSIGHT',
      subTitle: "A GLIMPSE INTO YOUR SOUL'S JOURNEY",
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
    };
  }

  public static formatForSoulJourney(schema: PastLifeInsightSchema) {
    return {
      format: 'soul_journey' as const,
      fullSchema: schema,
    };
  }
}
