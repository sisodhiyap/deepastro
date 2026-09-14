import { AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
import { PastLifeEvidenceScore } from './PastLifeTypes.js';

export class PastLifeEvidenceEngine {
  public static compileEvidence(
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis
  ): PastLifeEvidenceScore[] {
    const scores: PastLifeEvidenceScore[] = [];

    // 1. Ketu Evidence
    scores.push({
      indicator: 'Ketu in House ' + astro.ketuData.house,
      system: 'VEDIC_ASTROLOGY',
      weight: 85,
      direction: astro.ketuData.house === 12 || astro.ketuData.house === 8 || astro.ketuData.house === 4
        ? 'SPIRITUAL_CONTEMPLATION'
        : astro.ketuData.house === 9 || astro.ketuData.house === 5
        ? 'SCHOLARSHIP_WISDOM'
        : 'DUTY_AND_SERVICE',
      supportingFactors: [`Ketu in ${astro.ketuData.signName}`, `Dispositor ${astro.ketuData.dispositor}`],
      contradictingFactors: [],
      confidence: 'HIGH',
    });

    // 2. Atmakaraka Evidence
    scores.push({
      indicator: 'Atmakaraka ' + astro.atmakarakaData.planet,
      system: 'JAIMINI',
      weight: 90,
      direction: ['Jupiter', 'Mercury'].includes(astro.atmakarakaData.planet)
        ? 'KNOWLEDGE_TEACHING'
        : ['Sun', 'Mars'].includes(astro.atmakarakaData.planet)
        ? 'LEADERSHIP_STEWARDSHIP'
        : ['Venus', 'Moon'].includes(astro.atmakarakaData.planet)
        ? 'COMPASSION_HEALING'
        : 'ENDURANCE_AUSTERITY',
      supportingFactors: [`House ${astro.atmakarakaData.house} placement`, `Sign ${astro.atmakarakaData.signName}`],
      contradictingFactors: [],
      confidence: 'HIGH',
    });

    // 3. 12th House Evidence
    scores.push({
      indicator: '12th House of Moksha',
      system: 'VEDIC_ASTROLOGY',
      weight: 75,
      direction: astro.house12Data.occupants.length > 0 ? 'ACTIVE_SOLITUDE' : 'SUBTLE_CONTEMPLATION',
      supportingFactors: [
        `12th Lord ${astro.house12Data.lord}`,
        astro.house12Data.occupants.length > 0 ? `Occupants: ${astro.house12Data.occupants.join(', ')}` : 'Unoccupied contemplative sign',
      ],
      contradictingFactors: [],
      confidence: 'MODERATE',
    });

    // 4. Numerology Evidence
    scores.push({
      indicator: 'Life Path ' + num.lifePath,
      system: 'NUMEROLOGY',
      weight: 65,
      direction: num.primaryVibrationTheme,
      supportingFactors: [`Destiny number ${num.destiny}`, `Soul urge ${num.soulUrge}`],
      contradictingFactors: [],
      confidence: 'MODERATE',
    });

    // 5. Vedic Canon Grounding
    scores.push({
      indicator: 'BPHS & Jaimini Sutra Integration',
      system: 'VEDIC_CANON',
      weight: 80,
      direction: 'CANONICAL_PROVENANCE',
      supportingFactors: ['Atmakaraka doctrine (BPHS Ch. 32)', 'Purva Punya evaluation (Phaladeepika Ch. 15)'],
      contradictingFactors: [],
      confidence: 'HIGH',
    });

    return scores;
  }
}
