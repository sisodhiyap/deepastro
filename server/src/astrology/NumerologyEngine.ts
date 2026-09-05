/**
 * Numerology Engine
 * Computes core vibrational numbers based on Pythagorean and Chaldean systems:
 * - Life Path Number (Bhagyank)
 * - Birth Number (Mulank)
 * - Destiny / Expression Number (Namank)
 * - Soul Urge Number (Vowels)
 * - Personality Number (Consonants)
 * - Personal Year Number
 * - Lucky Numbers, Colors, and Days
 */

export interface NumerologyReport {
  name: string;
  birthDate: string;
  birthNumber: number;      // Mulank (1-9)
  lifePathNumber: number;   // Bhagyank (1-9, 11, 22, 33)
  destinyNumber: number;    // Expression
  soulUrgeNumber: number;   // Vowels
  personalityNumber: number;// Consonants
  personalYear: number;
  luckyNumbers: number[];
  luckyDays: string[];
  luckyColors: string[];
  rulingPlanet: string;
  interpretations: {
    lifePathOverview: string;
    destinyOverview: string;
    soulUrgeOverview: string;
    personalYearTheme: string;
  };
}

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

function reduceToSingleDigit(num: number, keepMaster: boolean = false): number {
  if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
  while (num > 9) {
    if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
    num = num
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

const PLANET_NUMBER_MAP: Record<number, { planet: string; days: string[]; colors: string[]; lucky: number[] }> = {
  1: { planet: 'Surya (Sun)', days: ['Sunday', 'Monday'], colors: ['Golden', 'Orange', 'Yellow'], lucky: [1, 10, 19, 28] },
  2: { planet: 'Chandra (Moon)', days: ['Monday', 'Sunday'], colors: ['White', 'Cream', 'Silver'], lucky: [2, 11, 20, 29] },
  3: { planet: 'Guru (Jupiter)', days: ['Thursday', 'Tuesday'], colors: ['Yellow', 'Saffron', 'Purple'], lucky: [3, 12, 21, 30] },
  4: { planet: 'Rahu (Uranus)', days: ['Sunday', 'Saturday'], colors: ['Electric Blue', 'Grey'], lucky: [4, 13, 22, 31] },
  5: { planet: 'Budha (Mercury)', days: ['Wednesday', 'Friday'], colors: ['Green', 'Emerald', 'Turquoise'], lucky: [5, 14, 23] },
  6: { planet: 'Shukra (Venus)', days: ['Friday', 'Tuesday'], colors: ['Pink', 'White', 'Diamond Glow'], lucky: [6, 15, 24] },
  7: { planet: 'Ketu (Neptune)', days: ['Monday', 'Thursday'], colors: ['White', 'Pale Green', 'Smoky Quartz'], lucky: [7, 16, 25] },
  8: { planet: 'Shani (Saturn)', days: ['Saturday', 'Wednesday'], colors: ['Deep Blue', 'Black', 'Dark Purple'], lucky: [8, 17, 26] },
  9: { planet: 'Mangala (Mars)', days: ['Tuesday', 'Thursday'], colors: ['Red', 'Crimson', 'Coral'], lucky: [9, 18, 27] },
};

export function calculateNumerology(name: string, day: number, month: number, year: number): NumerologyReport {
  // 1. Birth Number (Mulank)
  const birthNumber = reduceToSingleDigit(day);

  // 2. Life Path Number (Bhagyank)
  const totalBirthSum = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
  const lifePathNumber = reduceToSingleDigit(totalBirthSum, true);

  // 3. Clean Name
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');

  let totalNameSum = 0;
  let vowelSum = 0;
  let consonantSum = 0;

  for (const char of cleanName) {
    const val = CHALDEAN_MAP[char] || 0;
    totalNameSum += val;
    if (VOWELS.has(char)) {
      vowelSum += val;
    } else {
      consonantSum += val;
    }
  }

  const destinyNumber = reduceToSingleDigit(totalNameSum);
  const soulUrgeNumber = reduceToSingleDigit(vowelSum);
  const personalityNumber = reduceToSingleDigit(consonantSum);

  // 4. Personal Year
  const currentYear = new Date().getFullYear();
  const personalYear = reduceToSingleDigit(birthNumber + reduceToSingleDigit(month) + reduceToSingleDigit(currentYear));

  const planetInfo = PLANET_NUMBER_MAP[birthNumber] || PLANET_NUMBER_MAP[1];

  const LIFE_PATH_THEMES: Record<number, string> = {
    1: 'The Independent Pioneer: Initiator, leader, bold visionary possessing self-reliant courage.',
    2: 'The Harmonious Diplomat: Intuitive mediator, empathic partner, seeker of peace and unity.',
    3: 'The Creative Luminary: Radiant communicator, artist, bringer of joy and expressive charisma.',
    4: 'The Master Builder: Pragmatic, disciplined architect of lasting security and systematic order.',
    5: 'The Free Catalyst: Adaptable explorer, dynamic communicator embracing change and expansive liberty.',
    6: 'The Cosmic Nurturer: Compassionate guardian, healer, loving anchor of family and community balance.',
    7: 'The Mystic Seeker: Philosophical truth-seeker, introspective researcher penetrating cosmic mysteries.',
    8: 'The Sovereign Manifestor: Command over material resources, executive mastery, karmic justice and balance.',
    9: 'The Universal Philanthropist: Selfless humanitarian, wisdom-bearer transcending personal ego.',
    11: 'Master Intuitive 11: Spiritual illumination, visionary channel uniting earthly and divine realms.',
    22: 'Master Architect 22: Translating grand spiritual blueprints into tangible worldwide reality.',
    33: 'Master Teacher 33: Selfless devotion, unconditional love, and elevation of human consciousness.',
  };

  return {
    name,
    birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    birthNumber,
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    personalYear,
    luckyNumbers: planetInfo.lucky,
    luckyDays: planetInfo.days,
    luckyColors: planetInfo.colors,
    rulingPlanet: planetInfo.planet,
    interpretations: {
      lifePathOverview: LIFE_PATH_THEMES[lifePathNumber] || LIFE_PATH_THEMES[1],
      destinyOverview: `Destiny vibration ${destinyNumber} reveals your core evolutionary vocation and outward talent expression in society.`,
      soulUrgeOverview: `Heart's desire vibration ${soulUrgeNumber} exposes your subconscious emotional longing and spiritual yearnings.`,
      personalYearTheme: `Personal Year ${personalYear} emphasizes a concentrated vibrational cycle of growth, renewal, and focused actions.`,
    },
  };
}
