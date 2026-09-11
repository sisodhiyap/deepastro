/**
 * Numerology Correlation Engine
 * Fuses Vedic astrological themes with Numerological vibrational cycles.
 * 
 * Strict Invariant:
 * Compares symbolic themes across systems without claiming empirical proof or causation.
 * Explains that systems arrive at themes through distinct methodologies.
 */

import { NumerologyReport } from '../astrology/NumerologyEngine.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface SystemCorrelation {
  vedicTheme: string;
  numerologyTheme: string;
  correlationType: 'STRONGLY_ALIGNED' | 'COMPLEMENTARY' | 'NUANCED_TENSION';
  synthesis: string;
  confidenceSummary: string;
}

export class NumerologyCorrelationEngine {
  /**
   * Correlates an authoritative CalculationSnapshot with a NumerologyReport
   */
  public static correlate(
    snapshot: CalculationSnapshot,
    numerology: NumerologyReport,
    activeMahadasha?: string
  ): SystemCorrelation {
    const lagnaSign = snapshot.ascendant.sign;
    const lifePath = numerology.lifePathNumber;
    const personalYear = numerology.personalYear;
    const dasha = activeMahadasha || 'Active Dasha';

    // 1. Analyze Vedic Core Focus
    let vedicTheme = `Lagna in ${lagnaSign} under ${dasha} planetary period`;
    if (['Aries', 'Leo', 'Sagittarius'].includes(lagnaSign)) {
      vedicTheme += ' emphasizes dynamic initiative, leadership, and bold creative visibility.';
    } else if (['Taurus', 'Virgo', 'Capricorn'].includes(lagnaSign)) {
      vedicTheme += ' emphasizes pragmatic consolidation, disciplined material security, and systematic execution.';
    } else if (['Gemini', 'Libra', 'Aquarius'].includes(lagnaSign)) {
      vedicTheme += ' emphasizes intellectual networking, conceptual clarity, and social alignment.';
    } else {
      vedicTheme += ' emphasizes intuitive discernment, emotional depth, and spiritual alignment.';
    }

    // 2. Analyze Numerology Core Focus
    let numerologyTheme = `Life Path ${lifePath} in Personal Year ${personalYear}`;
    if (personalYear === 1 || personalYear === 5) {
      numerologyTheme += ' signals a vigorous cycle of new beginnings, rapid evolution, and adventurous initiative.';
    } else if (personalYear === 4 || personalYear === 8) {
      numerologyTheme += ' signals structural discipline, executive accountability, and manifesting tangible results.';
    } else if (personalYear === 7) {
      numerologyTheme += ' signals deep introspection, study, philosophical calibration, and inner development.';
    } else {
      numerologyTheme += ' signals relational harmony, collaboration, and creative expression.';
    }

    // 3. Determine Correlation Classification
    let correlationType: SystemCorrelation['correlationType'] = 'COMPLEMENTARY';
    let synthesis = '';

    const isVedicActive = ['Aries', 'Leo', 'Sagittarius'].includes(lagnaSign);
    const isNumActive = personalYear === 1 || personalYear === 5;

    if (isVedicActive && isNumActive) {
      correlationType = 'STRONGLY_ALIGNED';
      synthesis =
        'Both Vedic astrology and Numerology converge on the theme of active outward initiative and pioneering courage, although they reach this insight through sidereal planetary geometry and vibrational frequency arithmetic respectively.';
    } else if (
      (['Taurus', 'Virgo', 'Capricorn'].includes(lagnaSign) && (personalYear === 4 || personalYear === 8)) ||
      (['Cancer', 'Scorpio', 'Pisces'].includes(lagnaSign) && personalYear === 7)
    ) {
      correlationType = 'STRONGLY_ALIGNED';
      synthesis =
        'Both systems strongly agree on focused consolidation and deep personal mastery during this phase, reinforcing consistent behavioral guidance across diverse traditional paradigms.';
    } else {
      correlationType = 'COMPLEMENTARY';
      synthesis =
        'The systems provide complementary perspectives: while your Vedic chart emphasizes structural alignment and planetary timing, your numerological cycle emphasizes the psychological readiness for developmental change.';
    }

    return {
      vedicTheme,
      numerologyTheme,
      correlationType,
      synthesis,
      confidenceSummary: 'Vedic (Astronomical ephemeris) + Numerology (Pythagorean/Chaldean reduction)',
    };
  }
}
