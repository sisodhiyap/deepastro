/**
 * DoshaRemedyEngine.ts
 * Integrates existing DeepAstro Dosha diagnostics with period-specific ethical remedies.
 * Provides traditional grounding, mantra, charity, and mindfulness practices.
 * Strictly avoids medical, legal, or guaranteed outcomes.
 */

import { CanonicalPredictionContext, PredictionEvidence } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export interface ActiveDoshaContext {
  doshaName: string;
  intensity: 'MILD' | 'MODERATE' | 'STRONG';
  isPeriodActivated: boolean;
  affectedLifeAreas: string[];
  traditionalRemedies: Array<{
    category: 'MANTRA' | 'SEVA_CHARITY' | 'MINDFULNESS_DISCIPLINE' | 'RITUAL_REFLECTION';
    title: string;
    description: string;
    traditionalBasis: string;
  }>;
  evidence: PredictionEvidence;
}

export class DoshaRemedyEngine {
  /**
   * Identifies doshas active during a future period and attaches canonical ethical remedies.
   */
  public static evaluateDoshaContext(
    context: CanonicalPredictionContext,
    activeLords: { mahadasha: PlanetName; antardasha: PlanetName },
    periodLabel: string
  ): ActiveDoshaContext[] {
    const list: ActiveDoshaContext[] = [];
    const doshas = context.doshas;
    if (!doshas) return list;

    // 1. Manglik Dosha
    if (doshas.manglik?.isManglik) {
      const isMarsActive = activeLords.mahadasha === 'Mars' || activeLords.antardasha === 'Mars';
      list.push({
        doshaName: 'Kuja / Manglik Alignment',
        intensity: isMarsActive ? 'STRONG' : 'MODERATE',
        isPeriodActivated: isMarsActive,
        affectedLifeAreas: ['Partnerships', 'Temperament Balance', 'Collaborative Rhythm'],
        traditionalRemedies: [
          {
            category: 'MINDFULNESS_DISCIPLINE',
            title: 'Cooling Mindful Communication',
            description: 'Pause before reactive discussions in personal relationships. Practice active listening during Mars-influenced phases.',
            traditionalBasis: 'Brihat Parashara Hora Shastra — Channeling Kuja vitality into righteous discipline rather than impulsive friction.',
          },
          {
            category: 'MANTRA',
            title: 'Hanuman Chalisa / Mangal Gayatri',
            description: 'Recitation of classical solar/martial verses on Tuesday mornings for courage, inner fortitude, and harmony.',
            traditionalBasis: 'Traditional Jyotish Upaya practice for soothing fiery tendencies.',
          },
          {
            category: 'SEVA_CHARITY',
            title: 'Tuesday Voluntary Service',
            description: 'Support blood donation drives, emergency responders, or provide warm wholesome meals to community workers.',
            traditionalBasis: 'Redistribution of martial heat into benevolent social service.',
          },
        ],
        evidence: {
          source: 'DOSHA',
          rule: 'Manglik Balance Rule',
          value: `Mangal alignment active (${isMarsActive ? 'Direct Mars period' : 'Ambient natal disposition'}). Focus on patience and balanced partnership dialogue.`,
          weight: isMarsActive ? 0.20 : 0.10,
          direction: 'CHALLENGING',
        },
      });
    }

    // 2. Kaal Sarp / Nodal Axis Intensity
    if (doshas.kaalSarp?.hasKaalSarp) {
      const isNodalActive = ['Rahu', 'Ketu'].includes(activeLords.mahadasha) || ['Rahu', 'Ketu'].includes(activeLords.antardasha);
      list.push({
        doshaName: 'Kaal Sarp Yoga / Nodal Axis Concentration',
        intensity: isNodalActive ? 'STRONG' : 'MODERATE',
        isPeriodActivated: isNodalActive,
        affectedLifeAreas: ['Karmic Acceleration', 'Ambition vs Detachment', 'Unconventional Paths'],
        traditionalRemedies: [
          {
            category: 'MINDFULNESS_DISCIPLINE',
            title: 'Grounded Daily Anchor Routine',
            description: 'Maintain strict sleep and morning meditation routines to anchor fluctuating psychological tides during nodal cycles.',
            traditionalBasis: 'Phaladeepika — Grounded Earth alignment stabilizes Rahu and Ketu waves.',
          },
          {
            category: 'MANTRA',
            title: 'Maha Mrityunjaya Japa',
            description: 'Traditional contemplation on inner peace and steady awareness.',
            traditionalBasis: 'Classical Jyotish remediation for resolving deep sub-conscious knots.',
          },
          {
            category: 'SEVA_CHARITY',
            title: 'Environmental or Animal Seva',
            description: 'Feed birds and stray animals on Saturdays and Wednesdays without expectation of reward.',
            traditionalBasis: 'Traditional Lal Kitab practice for pacifying shadowy nodal fluctuations.',
          },
        ],
        evidence: {
          source: 'DOSHA',
          rule: 'Nodal Karmic Axis Rule',
          value: `Nodal focus intensified during ${periodLabel}. Seek clarity in contracts and avoid speculative shortcuts.`,
          weight: isNodalActive ? 0.22 : 0.10,
          direction: 'CHALLENGING',
        },
      });
    }

    // 3. Sade Sati (Saturn Transit relative to Natal Moon)
    if (doshas.sadeSati?.isActive || (doshas.sadeSati as any)?.isSadeSati) {
      list.push({
        doshaName: 'Shani Sade Sati Cycle',
        intensity: 'STRONG',
        isPeriodActivated: true,
        affectedLifeAreas: ['Endurance', 'Structural Responsibility', 'Maturity & Patience'],
        traditionalRemedies: [
          {
            category: 'MINDFULNESS_DISCIPLINE',
            title: 'Disciplined Long-Term Architecture',
            description: 'Accept healthy responsibilities without resentment. Focus on slow, unhurried compounding in career and personal duties.',
            traditionalBasis: 'Brihat Samhita — Shani rewards perseverance, humility, and meticulous ethical integrity.',
          },
          {
            category: 'SEVA_CHARITY',
            title: 'Saturday Seva for the Elderly and Laborers',
            description: 'Volunteer support or donate footwear, warm blankets, and oil to elders and unhoused laborers.',
            traditionalBasis: 'Traditional Parashari Saturn seva aligning with the karmic archetype of Shani.',
          },
          {
            category: 'MANTRA',
            title: 'Shani Gayatri / Om Sham Shanaischaraya Namah',
            description: 'Recited with slow, calm awareness on Saturday evenings at twilight.',
            traditionalBasis: 'Traditional Vedic Shani pacification.',
          },
        ],
        evidence: {
          source: 'DOSHA',
          rule: 'Sade Sati Transformation Cycle',
          value: `Saturn transits natal Moon sector during ${periodLabel}: A foundational period for spiritual resilience and enduring character building.`,
          weight: 0.25,
          direction: 'CHALLENGING',
        },
      });
    }

    return list;
  }
}
