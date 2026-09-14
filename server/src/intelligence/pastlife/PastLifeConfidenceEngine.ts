import { AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
import { PastLifeConfidenceLevel } from './PastLifeTypes.js';

export class PastLifeConfidenceEngine {
  public static calculate(
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis,
    isMixed: boolean
  ): {
    overall: PastLifeConfidenceLevel;
    astrology: PastLifeConfidenceLevel;
    numerology: PastLifeConfidenceLevel;
    textual_context: PastLifeConfidenceLevel;
    birth_time_reliability: 'HIGH' | 'MODERATE' | 'LOW' | 'UNRELIABLE';
    score_percent: number;
    uncertainty_notes: string[];
  } {
    const notes: string[] = [];
    let baseScore = 88; // solid baseline with accurate astronomical engine

    if (astro.d60Reliability === 'UNRELIABLE') {
      baseScore -= 18;
      notes.push('Birth time marked approximate: D60 micro-varga calculations excluded to prevent spurious specificity.');
    }

    if (isMixed) {
      baseScore -= 6;
      notes.push('Multi-system indicators reveal dual karmic currents (contemplation vs. action), calibrated as a mixed archetype.');
    }

    notes.push('Past-life interpretations represent symbolic spiritual readings derived from Jyotish tradition, not empirical historical records.');

    const score_percent = Math.max(40, Math.min(95, baseScore));

    const overall: PastLifeConfidenceLevel =
      score_percent >= 85
        ? 'VERY_HIGH'
        : score_percent >= 75
        ? 'HIGH'
        : score_percent >= 60
        ? 'MODERATE'
        : 'LOW';

    return {
      overall,
      astrology: astro.astrologyConfidence,
      numerology: 'MODERATE',
      textual_context: 'HIGH',
      birth_time_reliability: astro.d60Reliability,
      score_percent,
      uncertainty_notes: notes,
    };
  }
}
