import { ValidatedPastLifeInput } from './PastLifeInputEngine.js';
import { PastLifeNumerologyIndicator } from './PastLifeTypes.js';

export interface NumerologyPastLifeAnalysis {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  karmicNumbers: number[];
  indicators: PastLifeNumerologyIndicator[];
  primaryVibrationTheme: string;
}

const NUMEROLOGY_THEMES: Record<number, { theme: string; lesson: string }> = {
  1: { theme: 'Pioneer, Solitary Leader, Independent Initiator', lesson: 'Learning to lead without arrogance; honoring collaborative counsel.' },
  2: { theme: 'Peacemaker, Counselor, Diplomatic Mediator', lesson: 'Developing emotional boundaries; maintaining inner peace amidst discord.' },
  3: { theme: 'Orator, Temple Artisan, Sacred Communicator', lesson: 'Directing creative and verbal gifts toward spiritual upliftment rather than vanity.' },
  4: { theme: 'Temple Builder, Disciplined Steward, Foundation Mason', lesson: 'Balancing rigid structure with cosmic flexibility; serving without bitterness.' },
  5: { theme: 'Nomadic Seeker, Merchant, Trans-Cultural Traveler', lesson: 'Transforming restless wanderlust into disciplined spiritual exploration.' },
  6: { theme: 'Community Caretaker, Healer, Compassionate Anchor', lesson: 'Releasing possessive attachments in love; serving the universal family.' },
  7: { theme: 'Mystic Sage, Solitary Scholar, Contemplative Hermit', lesson: 'Bridging profound analytical intellect with heartfelt spiritual faith.' },
  8: { theme: 'Dharmic Administrator, Resource Steward, Magistrate', lesson: 'Exercising power and abundance for public welfare rather than self-aggrandizement.' },
  9: { theme: 'Universal Humanitarian, Renunciant, Global Pilgrim', lesson: 'Cultivating universal detachment; forgiving old cycles with grace.' },
  11: { theme: 'Spiritual Visionary, Intuitive Illuminator, Mystic Guide', lesson: 'Grounding ethereal intuition into practical ethical leadership.' },
  22: { theme: 'Master Builder of Sacred Institutions, Visionary Architect', lesson: 'Erecting enduring foundations for societal upliftment.' },
  33: { theme: 'Avatar of Compassionate Service, Universal Teacher', lesson: 'Unconditional selfless service without seeking adoration.' },
};

export class PastLifeNumerologyEngine {
  private static reduceNumber(num: number, keepMaster = true): number {
    if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
    while (num > 9) {
      if (keepMaster && (num === 11 || num === 22 || num === 33)) break;
      num = String(num).split('').reduce((acc: number, digit: string) => acc + parseInt(digit, 10), 0);
    }
    return num;
  }

  public static analyze(input: ValidatedPastLifeInput): NumerologyPastLifeAnalysis {
    const dobClean = input.birthDate.replace(/\D/g, '');
    const rawSum = dobClean.split('').reduce((acc: number, c: string) => acc + parseInt(c, 10), 0);
    const lifePath = this.reduceNumber(rawSum, true);

    const nameClean = input.fullName.toUpperCase().replace(/[^A-Z]/g, '');
    const pythagoreanMap: Record<string, number> = {
      A: 1, J: 1, S: 1,
      B: 2, K: 2, T: 2,
      C: 3, L: 3, U: 3,
      D: 4, M: 4, V: 4,
      E: 5, N: 5, W: 5,
      F: 6, O: 6, X: 6,
      G: 7, P: 7, Y: 7,
      H: 8, Q: 8, Z: 8,
      I: 9, R: 9,
    };

    let destinyRaw = 0;
    let soulUrgeRaw = 0;
    const vowels = new Set(['A', 'E', 'I', 'O', 'U']);

    for (const char of nameClean) {
      const val = pythagoreanMap[char] || 0;
      destinyRaw += val;
      if (vowels.has(char)) {
        soulUrgeRaw += val;
      }
    }

    const destiny = this.reduceNumber(destinyRaw, true);
    const soulUrge = this.reduceNumber(soulUrgeRaw || 1, true);

    const karmicNumbers: number[] = [];
    const checkKarmic = (sum: number) => {
      if (sum === 13 || sum === 14 || sum === 16 || sum === 19) karmicNumbers.push(sum);
    };
    checkKarmic(rawSum);
    checkKarmic(destinyRaw);
    checkKarmic(soulUrgeRaw);

    const lpTheme = NUMEROLOGY_THEMES[lifePath] || NUMEROLOGY_THEMES[7];
    const destTheme = NUMEROLOGY_THEMES[destiny] || NUMEROLOGY_THEMES[1];
    const soulTheme = NUMEROLOGY_THEMES[soulUrge] || NUMEROLOGY_THEMES[9];

    const indicators: PastLifeNumerologyIndicator[] = [
      {
        type: 'Life Path Vibration',
        value: lifePath,
        vibration_theme: lpTheme.theme,
        karmic_lesson: lpTheme.lesson,
      },
      {
        type: 'Destiny (Soul Expression)',
        value: destiny,
        vibration_theme: destTheme.theme,
        karmic_lesson: destTheme.lesson,
      },
      {
        type: 'Soul Urge (Inner Longing)',
        value: soulUrge,
        vibration_theme: soulTheme.theme,
        karmic_lesson: soulTheme.lesson,
      },
    ];

    if (karmicNumbers.length > 0) {
      indicators.push({
        type: 'Karmic Debt Number',
        value: karmicNumbers[0],
        vibration_theme: `Karmic Debt ${karmicNumbers[0]}`,
        karmic_lesson: karmicNumbers[0] === 13
          ? 'Cultivating dedicated work ethic and patience.'
          : karmicNumbers[0] === 14
          ? 'Balancing freedom with emotional moderation.'
          : karmicNumbers[0] === 16
          ? 'Releasing intellectual or spiritual pride through humility.'
          : 'Using personal strength to empower others rather than dominate.',
      });
    }

    return {
      lifePath,
      destiny,
      soulUrge,
      karmicNumbers: Array.from(new Set(karmicNumbers)),
      indicators,
      primaryVibrationTheme: lpTheme.theme,
    };
  }
}
