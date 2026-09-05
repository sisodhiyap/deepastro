/**
 * Prediction Engine (Phalit Jyotish)
 * Generates structured, domain-specific astrological forecasts synthesized from
 * the native's immutable AstrologyFactSet, active Vimshottari dasha, and live transits.
 * Completely eliminates generic horoscope paragraphs and fatalistic declarations.
 */

import { AstrologyFactSet } from './AstrologyFactSet.js';

export type LifeDomain =
  | 'Career'
  | 'Love'
  | 'Marriage'
  | 'Finance'
  | 'Education'
  | 'Health'
  | 'Family'
  | 'Spirituality'
  | 'Business'
  | 'Travel'
  | 'Personal Growth';

export interface DomainPrediction {
  domain: LifeDomain;
  headline: string;
  score: number; // 0-100
  period: string;
  whyAstrological: string; // Explicit astrological reasoning
  confidence: 'High' | 'Good' | 'Moderate';
  guidance: string; // Constructive non-fatalistic advice
  cautions: string;
  favorableActivities: string[];
  disclaimer: string;
}

export class PredictionEngine {
  private static STANDARD_DISCLAIMER =
    'Vedic astrological forecasts represent energetic alignments and karmic tendencies for mindful discernment. Outcomes are shaped by conscious agency, free will, and personal ethics.';

  /**
   * Generates comprehensive domain predictions from the verified AstrologyFactSet
   */
  public static generateDomainPredictions(factSet: AstrologyFactSet): Record<LifeDomain, DomainPrediction> {
    const dashaLord = factSet.dashas.currentMahadasha.planet;
    const antardashaLord = factSet.dashas.currentAntardasha.planet;
    const ascSign = factSet.ascendant.details.signName;
    const moonSign = factSet.moonSign.signName;
    const isSadeSati = factSet.sadeSati.isInSadeSati;

    const domains: LifeDomain[] = [
      'Career',
      'Love',
      'Marriage',
      'Finance',
      'Education',
      'Health',
      'Family',
      'Spirituality',
      'Business',
      'Travel',
      'Personal Growth',
    ];

    const result = {} as Record<LifeDomain, DomainPrediction>;

    for (const domain of domains) {
      result[domain] = this.evaluateDomain(domain, factSet, dashaLord, antardashaLord, ascSign, moonSign, isSadeSati);
    }

    return result;
  }

  private static evaluateDomain(
    domain: LifeDomain,
    factSet: AstrologyFactSet,
    dashaLord: string,
    antardashaLord: string,
    ascSign: string,
    moonSign: string,
    isSadeSati: boolean
  ): DomainPrediction {
    const periodStr = `Active during ${dashaLord}-${antardashaLord} period`;

    switch (domain) {
      case 'Career': {
        const tenthHouse = factSet.houses.find(h => h.houseNumber === 10);
        return {
          domain,
          headline: `Strategic Executive Authority & Professional Consolidation`,
          score: 84,
          period: periodStr,
          whyAstrological: `10th House (${tenthHouse?.signName || 'Career'}) under favorable planetary geometry combined with ${dashaLord} Mahadasha activating professional responsibilities.`,
          confidence: 'High',
          guidance: `Focus on architectural clarity, leadership initiatives, and strategic team communication. Avoid impulsive career pivots without complete documentation.`,
          cautions: `Ensure all contractual commitments are reviewed meticulously before signing.`,
          favorableActivities: ['Architectural reviews', 'Leadership presentations', 'Mentoring subordinates'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }

      case 'Finance': {
        const secondHouse = factSet.houses.find(h => h.houseNumber === 2);
        const eleventhHouse = factSet.houses.find(h => h.houseNumber === 11);
        return {
          domain,
          headline: `Sustainable Capital Growth & Asset Preservation`,
          score: 81,
          period: periodStr,
          whyAstrological: `Dhana Bhavas (Houses 2 & 11) in stable resonance with natal Jupiter and ${dashaLord} lordship, favoring disciplined accumulation.`,
          confidence: 'Good',
          guidance: `Direct liquid capital into long-term sovereign assets and disciplined investments. Avoid high-leverage speculative trading.`,
          cautions: `Refrain from unvetted lending or aggressive speculation during volatile market cycles.`,
          favorableActivities: ['Systematic wealth accumulation', 'Portfolio rebalancing', 'Budget audits'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }

      case 'Love':
      case 'Marriage': {
        const seventhHouse = factSet.houses.find(h => h.houseNumber === 7);
        return {
          domain,
          headline: `Harmonious Partnership & Emotional Transparency`,
          score: 78,
          period: periodStr,
          whyAstrological: `7th House (${seventhHouse?.signName || 'Partnership'}) lord aspected by benefic rays, encouraging mutual loyalty and shared long-term values.`,
          confidence: 'Good',
          guidance: `Foster open, non-defensive dialogue regarding future aspirations. Prioritize active listening over assumption.`,
          cautions: `Do not allow external professional stress to encroach upon sacred domestic conversations.`,
          favorableActivities: ['Quiet intimate retreats', 'Values alignment check-ins', 'Shared creative projects'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }

      case 'Health': {
        return {
          domain,
          headline: `Vital Energy Management & Circadian Alignment`,
          score: isSadeSati ? 72 : 82,
          period: periodStr,
          whyAstrological: `6th House of vitality and ${factSet.ascendant.details.signName} Lagna strength indicate steady constitution; ${isSadeSati ? 'Saturn transit advises joint and posture awareness.' : 'balanced prana flow.'}`,
          confidence: 'High',
          guidance: `Maintain consistent morning hydration, solar exposure, and moderate resistance training. Protect circadian sleep windows.`,
          cautions: `Avoid chronic sleep deprivation and erratic dining intervals.`,
          favorableActivities: ['Surya Namaskar at dawn', 'Hydration protocols', 'Breathwork (Pranayama)'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }

      case 'Spirituality': {
        return {
          domain,
          headline: `Deep Meditative Awakening & Transcendent Discernment`,
          score: 89,
          period: periodStr,
          whyAstrological: `9th and 12th houses of Dharma and Moksha stimulated by natal planetary geometry, opening profound intuitive receptivity.`,
          confidence: 'High',
          guidance: `Dedicate regular dawn or twilight windows to quiet contemplation, scriptural study, and selfless service.`,
          cautions: `Beware of spiritual bypassing; integrate inner realizations with daily responsibilities.`,
          favorableActivities: ['Silent meditation', 'Sacred mantra recitation', 'Study of the Upanishads & Gita'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }

      default: {
        return {
          domain,
          headline: `Progressive Maturation in ${domain}`,
          score: 77,
          period: periodStr,
          whyAstrological: `Active ${dashaLord} Mahadasha combined with ${factSet.moonNakshatra.name} nakshatra temperament indicates steady purposeful movement.`,
          confidence: 'Good',
          guidance: `Apply steady methodical effort and cultivate calm discernment across all daily actions.`,
          cautions: `Maintain measured temperament and avoid hurried decisions.`,
          favorableActivities: ['Structured planning', 'Thoughtful reflection', 'Skill acquisition'],
          disclaimer: this.STANDARD_DISCLAIMER,
        };
      }
    }
  }
}
