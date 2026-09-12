/**
 * Modernized Numerology System Engine
 * Fully isolated calculation for:
 * 1. Pythagorean Numerology (Standard Western)
 * 2. Chaldean Numerology (Ancient Sound Vibration)
 *
 * Enforces zero mixing between Pythagorean and Chaldean tables.
 * Exposes step-by-step arithmetic proofs, master numbers (11, 22, 33),
 * Life Path, Expression, Soul Urge, Personality, Birthday, Maturity,
 * Personal Year, Personal Month, and Personal Day.
 */

export type NumerologyTradition = 'Pythagorean' | 'Chaldean';

export interface CalculationStep {
  name: string;
  formula: string;
  intermediateSteps: string[];
  rawSum: number;
  finalValue: number;
  isMasterNumber: boolean;
}

export interface LetterVibration {
  letter: string;
  isVowel: boolean;
  value: number;
}

export interface NumerologyAnalysisResult {
  tradition: NumerologyTradition;
  inputs: {
    fullName: string;
    birthDate: string; // YYYY-MM-DD
    targetDate: string; // YYYY-MM-DD
  };
  letterBreakdown: LetterVibration[];
  calculations: {
    lifePath: CalculationStep;
    expressionDestiny: CalculationStep;
    soulUrge: CalculationStep;
    personality: CalculationStep;
    birthdayNumber: CalculationStep;
    maturityNumber: CalculationStep;
    personalYear: CalculationStep;
    personalMonth: CalculationStep;
    personalDay: CalculationStep;
  };
  vibrations: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    birthday: number;
    maturity: number;
    personalYear: number;
    personalMonth: number;
    personalDay: number;
  };
  interpretations: {
    lifePathTitle: string;
    lifePathMeaning: string;
    expressionTitle: string;
    expressionMeaning: string;
    soulUrgeMeaning: string;
    personalYearTheme: string;
  };
  disclaimer: string;
}

// Pythagorean letter values: A=1 through I=9, J=1...
const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

// Chaldean letter values: Ancient Babylonian phonetic vibration (1 to 8, 9 is sacred)
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function reduceNumber(
  num: number,
  allowMaster: boolean = true
): { final: number; steps: string[]; isMaster: boolean } {
  const steps: string[] = [num.toString()];
  let current = num;

  while (current > 9) {
    if (allowMaster && (current === 11 || current === 22 || current === 33)) {
      return { final: current, steps, isMaster: true };
    }
    const digits = current.toString().split('').map(d => parseInt(d, 10));
    const stepStr = digits.join(' + ');
    current = digits.reduce((sum, d) => sum + d, 0);
    steps.push(stepStr + ' = ' + current);
  }

  return { final: current, steps, isMaster: false };
}

export class NumerologySystemEngine {
  public static calculate(
    fullName: string,
    birthDateStr: string,
    tradition: NumerologyTradition = 'Pythagorean',
    targetDateStr?: string
  ): NumerologyAnalysisResult {
    const table = tradition === 'Pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP;
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    const targetDate = targetDateStr || new Date().toISOString().split('T')[0];

    const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number);
    const [tYear, tMonth, tDay] = targetDate.split('-').map(Number);

    // Letter Breakdown
    const letterBreakdown: LetterVibration[] = [];
    let expressionSum = 0;
    let soulUrgeSum = 0;
    let personalitySum = 0;

    for (const char of cleanName) {
      const val = table[char] || 0;
      const isVowel = VOWELS.has(char);
      letterBreakdown.push({ letter: char, isVowel, value: val });
      expressionSum += val;
      if (isVowel) soulUrgeSum += val;
      else personalitySum += val;
    }

    // 1. Life Path Number
    // Sum year + month + day
    const yearRed = reduceNumber(bYear, false).final;
    const monthRed = reduceNumber(bMonth, false).final;
    const dayRed = reduceNumber(bDay, false).final;
    const rawLifePathSum = yearRed + monthRed + dayRed;
    const lpReduction = reduceNumber(rawLifePathSum, true);

    const lifePathStep: CalculationStep = {
      name: 'Life Path Number',
      formula: '(' + bYear + ' -> ' + yearRed + ') + (' + bMonth + ' -> ' + monthRed + ') + (' + bDay + ' -> ' + dayRed + ') = ' + rawLifePathSum,
      intermediateSteps: lpReduction.steps,
      rawSum: rawLifePathSum,
      finalValue: lpReduction.final,
      isMasterNumber: lpReduction.isMaster
    };

    // 2. Expression / Destiny
    const expReduction = reduceNumber(expressionSum, true);
    const expressionStep: CalculationStep = {
      name: 'Expression / Destiny Number',
      formula: 'Sum of all letter vibrations (' + cleanName + ') using ' + tradition + ' table',
      intermediateSteps: expReduction.steps,
      rawSum: expressionSum,
      finalValue: expReduction.final,
      isMasterNumber: expReduction.isMaster
    };

    // 3. Soul Urge (Vowels)
    const soulReduction = reduceNumber(soulUrgeSum, true);
    const soulUrgeStep: CalculationStep = {
      name: 'Soul Urge / Heart Desire',
      formula: 'Sum of vowel vibrations (' + cleanName.split('').filter(c => VOWELS.has(c)).join(', ') + ')',
      intermediateSteps: soulReduction.steps,
      rawSum: soulUrgeSum,
      finalValue: soulReduction.final,
      isMasterNumber: soulReduction.isMaster
    };

    // 4. Personality (Consonants)
    const persReduction = reduceNumber(personalitySum, true);
    const personalityStep: CalculationStep = {
      name: 'Personality Number',
      formula: 'Sum of consonant vibrations (' + cleanName.split('').filter(c => !VOWELS.has(c)).join(', ') + ')',
      intermediateSteps: persReduction.steps,
      rawSum: personalitySum,
      finalValue: persReduction.final,
      isMasterNumber: persReduction.isMaster
    };

    // 5. Birthday Number
    const bdayReduction = reduceNumber(bDay, true);
    const birthdayStep: CalculationStep = {
      name: 'Birthday Number',
      formula: 'Day of birth (' + bDay + ')',
      intermediateSteps: bdayReduction.steps,
      rawSum: bDay,
      finalValue: bdayReduction.final,
      isMasterNumber: bdayReduction.isMaster
    };

    // 6. Maturity Number
    const rawMaturity = lpReduction.final + expReduction.final;
    const matReduction = reduceNumber(rawMaturity, true);
    const maturityStep: CalculationStep = {
      name: 'Maturity Number',
      formula: 'Life Path (' + lpReduction.final + ') + Expression (' + expReduction.final + ') = ' + rawMaturity,
      intermediateSteps: matReduction.steps,
      rawSum: rawMaturity,
      finalValue: matReduction.final,
      isMasterNumber: matReduction.isMaster
    };

    // 7. Personal Year
    const rawPYear = monthRed + dayRed + reduceNumber(tYear, false).final;
    const pyReduction = reduceNumber(rawPYear, false);
    const personalYearStep: CalculationStep = {
      name: 'Personal Year Number',
      formula: 'Birth Month (' + monthRed + ') + Birth Day (' + dayRed + ') + Current Year (' + tYear + ' -> ' + reduceNumber(tYear, false).final + ') = ' + rawPYear,
      intermediateSteps: pyReduction.steps,
      rawSum: rawPYear,
      finalValue: pyReduction.final,
      isMasterNumber: false
    };

    // 8. Personal Month
    const rawPMonth = pyReduction.final + tMonth;
    const pmReduction = reduceNumber(rawPMonth, false);
    const personalMonthStep: CalculationStep = {
      name: 'Personal Month Number',
      formula: 'Personal Year (' + pyReduction.final + ') + Current Month (' + tMonth + ') = ' + rawPMonth,
      intermediateSteps: pmReduction.steps,
      rawSum: rawPMonth,
      finalValue: pmReduction.final,
      isMasterNumber: false
    };

    // 9. Personal Day
    const rawPDay = pmReduction.final + tDay;
    const pdReduction = reduceNumber(rawPDay, false);
    const personalDayStep: CalculationStep = {
      name: 'Personal Day Number',
      formula: 'Personal Month (' + pmReduction.final + ') + Current Day (' + tDay + ') = ' + rawPDay,
      intermediateSteps: pdReduction.steps,
      rawSum: rawPDay,
      finalValue: pdReduction.final,
      isMasterNumber: false
    };

    const TITLES: Record<number, string> = {
      1: 'The Independent Leader',
      2: 'The Diplomatic Peacemaker',
      3: 'The Creative Communicator',
      4: 'The Methodical Builder',
      5: 'The Dynamic Visionary & Adventurer',
      6: 'The Responsible Harmonizer & Caregiver',
      7: 'The Analytical Seeker & Mystic',
      8: 'The Sovereign Architect of Abundance',
      9: 'The Universal Humanitarian',
      11: 'Master 11 - The Illuminator & Intuitive Channel',
      22: 'Master 22 - The Master Architect & Global Builder',
      33: 'Master 33 - The Master Teacher & Compassionate Avatar'
    };

    const MEANINGS: Record<number, string> = {
      1: 'Drive for autonomous pioneering, strong willpower, originality, and self-directed executive initiative.',
      2: 'Gift for partnership, acute sensitivity to subtleties, collaborative mediation, and intuitive diplomacy.',
      3: 'Vibrant self-expression, creative ideation, social charm, artistic optimism, and verbal eloquence.',
      4: 'Structural discipline, high work ethic, practical realism, enduring patience, and organizational mastery.',
      5: 'Appetite for sensory variety, transformative exploration, quick adaptability, and progressive freedom.',
      6: 'Protective guardianship, family sanctuary, aesthetic elegance, balanced justice, and community service.',
      7: 'Deep contemplation, metaphysical inquiry, technical specialization, solitude, and research focus.',
      8: 'Organizational authority, material mastery, financial governance, high executive stamina, and ethical power.',
      9: 'Compassionate generosity, global consciousness, philosophical closure, and selfless artistic contribution.',
      11: 'High nervous sensitivity, spiritual breakthroughs, lightning intuition, and inspiring visionary counsel.',
      22: 'Grounded manifestation of large-scale systems, practical engineering of ambitious ideals into enduring reality.',
      33: 'Elevated compassion, transformative spiritual mentorship, and selfless upliftment of collective welfare.'
    };

    const YEAR_THEMES: Record<number, string> = {
      1: 'A year of new beginnings, planting seeds, bold initiative, and independent action.',
      2: 'A year of patience, cooperation, building alliances, and quiet consolidation.',
      3: 'A year of creative expansion, active socialization, self-expression, and joy.',
      4: 'A year of discipline, hard work, laying solid foundations, and pragmatic organization.',
      5: 'A year of exciting pivots, unexpected transitions, adaptability, and personal freedom.',
      6: 'A year centered around home, domestic harmony, community responsibilities, and emotional nurturing.',
      7: 'A year of spiritual introspection, deep learning, rest, research, and self-discovery.',
      8: 'A year of career empowerment, financial harvest, executive accountability, and material rewards.',
      9: 'A year of completion, clearing out the old, philosophical synthesis, and charitable forgiveness.'
    };

    return {
      tradition,
      inputs: {
        fullName,
        birthDate: birthDateStr,
        targetDate
      },
      letterBreakdown,
      calculations: {
        lifePath: lifePathStep,
        expressionDestiny: expressionStep,
        soulUrge: soulUrgeStep,
        personality: personalityStep,
        birthdayNumber: birthdayStep,
        maturityNumber: maturityStep,
        personalYear: personalYearStep,
        personalMonth: personalMonthStep,
        personalDay: personalDayStep
      },
      vibrations: {
        lifePath: lpReduction.final,
        expression: expReduction.final,
        soulUrge: soulReduction.final,
        personality: persReduction.final,
        birthday: bdayReduction.final,
        maturity: matReduction.final,
        personalYear: pyReduction.final,
        personalMonth: pmReduction.final,
        personalDay: pdReduction.final
      },
      interpretations: {
        lifePathTitle: TITLES[lpReduction.final] || ('Vibration ' + lpReduction.final),
        lifePathMeaning: MEANINGS[lpReduction.final] || 'Harmonic vibrational pattern.',
        expressionTitle: TITLES[expReduction.final] || ('Expression ' + expReduction.final),
        expressionMeaning: MEANINGS[expReduction.final] || 'Expression resonance.',
        soulUrgeMeaning: MEANINGS[soulReduction.final] || 'Soul urge resonance.',
        personalYearTheme: YEAR_THEMES[pyReduction.final] || 'Yearly cycle theme.'
      },
      disclaimer: 'Calculated strictly according to classical ' + tradition + ' numerology axioms. Numerology is a symbolic and reflective tool for personal introspection and pattern recognition; it is not an empirical physical science.'
    };
  }
}
