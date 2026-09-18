/**
 * DeepAstro 7.0 — Past Life Varga Engine (PastLifeVargaEngine)
 * Evaluates D1, D9 (Navamsha), and D60 (Shashtiamsa) for karmic root seeds.
 */

import { PastLifeCalculatedSnapshot } from './PastLifeCalculationAdapter.js';

export interface VargaKarmicEvaluation {
  d1Summary: string;
  d9NavamshaDharma: {
    ascendantSign: string;
    soulPurposeTheme: string;
    karmicAlignment: string;
  };
  d60Shashtiamsa: {
    status: 'COMPUTED' | 'CONSTRAINED_APPROXIMATE_TIME';
    karmicDeityOrNature?: string;
    karmicSeedPattern?: string;
    limitationNotice?: string;
  };
  supportingSignals: string[];
}

export class PastLifeVargaEngine {
  public static evaluate(snapshot: PastLifeCalculatedSnapshot): VargaKarmicEvaluation {
    const d9Sign = snapshot.d9LagnaSign;
    const d9Themes: Record<string, { theme: string; alignment: string }> = {
      Aries: { theme: 'Initiator & Dharmic Courage', alignment: 'Pioneering spiritual action and breaking stagnation.' },
      Taurus: { theme: 'Steadfast Sustainer & Harmonizer', alignment: 'Cultivating enduring values and stabilizing sacred ground.' },
      Gemini: { theme: 'Inquirer, Scribe & Bridge-Builder', alignment: 'Translating higher wisdom into accessible understanding.' },
      Cancer: { theme: 'Devotional Nurturer & Sanctuary Keeper', alignment: 'Healing ancestral emotional bonds through compassion.' },
      Leo: { theme: 'Sovereign Benefactor & Creative Leader', alignment: 'Expressing radiant ethical authority without ego attachment.' },
      Virgo: { theme: 'Selfless Servant & Meticulous Healer', alignment: 'Purifying karmic knots through disciplined service.' },
      Libra: { theme: 'Sacred Peacemaker & Just Arbitrator', alignment: 'Balancing relationship karma and mutual reciprocity.' },
      Scorpio: { theme: 'Esoteric Alchemist & Deep Transformer', alignment: 'Surrendering inner obsessions to achieve spiritual regeneration.' },
      Sagittarius: { theme: 'Righteous Guide & Philosophical Pilgrim', alignment: 'Pursuing higher cosmic law (Satya Dharma).' },
      Capricorn: { theme: 'Enduring Builder & Disciplined Ascetic', alignment: 'Building lasting structures that serve generational upliftment.' },
      Aquarius: { theme: 'Universal Humanitarian & Reformer', alignment: 'Dissolving hierarchical barriers for collective well-being.' },
      Pisces: { theme: 'Mystic Seeker & Transcendent Surrenderer', alignment: 'Merging transient identity into boundless divine awareness.' },
    };

    const d9Analysis = d9Themes[d9Sign] || d9Themes['Sagittarius'];

    // D60 Evaluation
    let d60Eval: VargaKarmicEvaluation['d60Shashtiamsa'];
    if (snapshot.d60Available) {
      // Evaluate based on Lagna degree in D60 (1/60th of 30° = 0.5° each)
      const lagnaDeg = snapshot.kundli.ascendant.degrees % 30;
      const d60Index = Math.floor(lagnaDeg * 2) + 1; // 1 to 60
      const isBeneficD60 = d60Index % 2 === 1; // Classical Shashtiamsa benefic/malefic alternation
      d60Eval = {
        status: 'COMPUTED',
        karmicDeityOrNature: isBeneficD60 ? 'Shubha (Beneficent Auspicious Seed)' : 'Ghora / Krura (Purifying Karmic Trial)',
        karmicSeedPattern: isBeneficD60
          ? 'Deep soul propensity toward ethical self-restraint, learning, and peaceful resolution inherited from ancestral vows.'
          : 'Karmic necessity to resolve past spiritual pride or unfulfilled responsibilities through present-life humility.',
      };
    } else {
      d60Eval = {
        status: 'CONSTRAINED_APPROXIMATE_TIME',
        limitationNotice: snapshot.d60LimitationNotice || 'D60 requires minute-level exactness and is conservatively held in reserve.',
      };
    }

    const supportingSignals: string[] = [
      `D9 Navamsha Lagna in ${d9Sign}: ${d9Analysis.theme}`,
      snapshot.d60Available
        ? `D60 Shashtiamsa Disposition: ${d60Eval.karmicDeityOrNature}`
        : 'D60 held in reserve to uphold strict astronomical integrity',
    ];

    return {
      d1Summary: `Ascendant in ${snapshot.kundli.ascendant.details.signName} with Ketu in House ${snapshot.ketuPlacement.house}`,
      d9NavamshaDharma: {
        ascendantSign: d9Sign,
        soulPurposeTheme: d9Analysis.theme,
        karmicAlignment: d9Analysis.alignment,
      },
      d60Shashtiamsa: d60Eval,
      supportingSignals,
    };
  }
}
