/**
 * NumerologyForecastEngine.ts
 * Integrates dynamic future Personal Years and Months using DeepAstro's canonical NumerologyEngine.
 * Enforces: Secondary corroborative signal only; never overrides the Vedic chart.
 */

import { CanonicalPredictionContext, PredictionEvidence } from './types.js';

function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

const PERSONAL_YEAR_THEMES: Record<number, { theme: string; focus: string }> = {
  1: { theme: 'New Beginnings & Initiative', focus: 'Action, starting ventures, bold personal leadership.' },
  2: { theme: 'Patience, Alliances & Diplomacy', focus: 'Collaboration, partnership consolidation, intuitive balance.' },
  3: { theme: 'Creative Expansion & Communication', focus: 'Expression, social connectivity, artistic projects.' },
  4: { theme: 'Systematic Building & Discipline', focus: 'Foundation setting, hard work, financial prudence.' },
  5: { theme: 'Adaptability, Change & Freedom', focus: 'Dynamic transformation, travel, pivot opportunities.' },
  6: { theme: 'Family, Responsibility & Harmony', focus: 'Domestic focus, caregiving, community commitments.' },
  7: { theme: 'Introspection, Wisdom & Spirituality', focus: 'Research, spiritual study, inner contemplation.' },
  8: { theme: 'Empowerment, Career & Material Harvest', focus: 'Executive leadership, financial ambition, achievement.' },
  9: { theme: 'Culmination, Release & Transformation', focus: 'Completion of 9-year cycle, charity, letting go.' },
};

export class NumerologyForecastEngine {
  /**
   * Computes dynamic Personal Year for any future target year.
   */
  public static calculatePersonalYear(
    context: CanonicalPredictionContext,
    targetYear: number
  ): {
    personalYear: number;
    theme: string;
    focus: string;
    evidence: PredictionEvidence;
  } {
    const [bYear, bMonth, bDay] = context.birthDate.split('-').map(Number);
    const birthNumber = reduceToSingleDigit(bDay || 1);
    const monthDigit = reduceToSingleDigit(bMonth || 1);
    const targetYearDigit = reduceToSingleDigit(targetYear);

    const personalYear = reduceToSingleDigit(birthNumber + monthDigit + targetYearDigit);
    const meta = PERSONAL_YEAR_THEMES[personalYear] || PERSONAL_YEAR_THEMES[1];

    const evidence: PredictionEvidence = {
      source: 'NUMEROLOGY',
      rule: 'Dynamic Chaldean/Pythagorean Personal Year Cycle',
      value: `Personal Year ${personalYear}: ${meta.theme}. ${meta.focus}`,
      weight: 0.10,
      direction: 'SUPPORTIVE',
    };

    return {
      personalYear,
      theme: meta.theme,
      focus: meta.focus,
      evidence,
    };
  }

  /**
   * Computes dynamic Personal Month for any target year and month.
   */
  public static calculatePersonalMonth(
    context: CanonicalPredictionContext,
    targetYear: number,
    targetMonth: number // 1-12
  ): {
    personalMonth: number;
    theme: string;
  } {
    const { personalYear } = this.calculatePersonalYear(context, targetYear);
    const monthDigit = reduceToSingleDigit(targetMonth);
    const personalMonth = reduceToSingleDigit(personalYear + monthDigit);
    const meta = PERSONAL_YEAR_THEMES[personalMonth] || PERSONAL_YEAR_THEMES[1];

    return {
      personalMonth,
      theme: `Personal Month ${personalMonth} (${meta.theme})`,
    };
  }
}
