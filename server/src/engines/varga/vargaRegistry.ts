/**
 * Complete Varga Registry — RULESET_VARGA_PARASHARI_V1
 * Canonical specification of Divisional Charts from D1 through D60.
 * Details classical source, mathematical division formula, supported status, and life domain.
 */

export interface VargaDefinition {
  division: number;
  code: string;
  sanskritName: string;
  englishName: string;
  source: 'BPHS' | 'Jaimini' | 'Tajika' | 'Phaladeepika';
  formulaVersion: string;
  domainSignification: string;
  isShodashavarga: boolean;
  supported: boolean;
}

export const VARGA_REGISTRY: Record<number, VargaDefinition> = {
  1: {
    division: 1,
    code: 'D1',
    sanskritName: 'Rashi',
    englishName: 'Natal Sign Chart',
    source: 'BPHS',
    formulaVersion: 'BPHS-D1-Canonical',
    domainSignification: 'Physical body, general existence, life trajectory, overall vitality.',
    isShodashavarga: true,
    supported: true,
  },
  2: {
    division: 2,
    code: 'D2',
    sanskritName: 'Hora',
    englishName: 'Wealth & Prosperity',
    source: 'BPHS',
    formulaVersion: 'BPHS-D2-Parashari',
    domainSignification: 'Wealth, movable assets, monetary resources, family heritage.',
    isShodashavarga: true,
    supported: true,
  },
  3: {
    division: 3,
    code: 'D3',
    sanskritName: 'Drekkana',
    englishName: 'Siblings & Courage',
    source: 'BPHS',
    formulaVersion: 'BPHS-D3-Standard',
    domainSignification: 'Siblings, courage, vitality, sports, adventurous initiatives, physical energy.',
    isShodashavarga: true,
    supported: true,
  },
  4: {
    division: 4,
    code: 'D4',
    sanskritName: 'Chaturthamsa',
    englishName: 'Property & Destiny',
    source: 'BPHS',
    formulaVersion: 'BPHS-D4-Standard',
    domainSignification: 'Fixed assets, landed property, real estate, home, domestic peace, fortune.',
    isShodashavarga: true,
    supported: true,
  },
  7: {
    division: 7,
    code: 'D7',
    sanskritName: 'Saptamsa',
    englishName: 'Children & Progeny',
    source: 'BPHS',
    formulaVersion: 'BPHS-D7-Standard',
    domainSignification: 'Children, progeny, descendants, creative fertility, grandchildren.',
    isShodashavarga: true,
    supported: true,
  },
  9: {
    division: 9,
    code: 'D9',
    sanskritName: 'Navamsa',
    englishName: 'Dharma & Spouse',
    source: 'BPHS',
    formulaVersion: 'BPHS-D9-Standard',
    domainSignification: 'Spouse, marriage, inner potential, soul destiny, dharma, post-30 maturity.',
    isShodashavarga: true,
    supported: true,
  },
  10: {
    division: 10,
    code: 'D10',
    sanskritName: 'Dasamsa',
    englishName: 'Profession & Status',
    source: 'BPHS',
    formulaVersion: 'BPHS-D10-Standard',
    domainSignification: 'Career, profession, public status, authority, leadership, achievements.',
    isShodashavarga: true,
    supported: true,
  },
  12: {
    division: 12,
    code: 'D12',
    sanskritName: 'Dwadashamsa',
    englishName: 'Parents & Ancestry',
    source: 'BPHS',
    formulaVersion: 'BPHS-D12-Standard',
    domainSignification: 'Parents, maternal and paternal lineage, ancestral karma, heritage.',
    isShodashavarga: true,
    supported: true,
  },
  16: {
    division: 16,
    code: 'D16',
    sanskritName: 'Shodasamsa',
    englishName: 'Vehicles & Happiness',
    source: 'BPHS',
    formulaVersion: 'BPHS-D16-Standard',
    domainSignification: 'Conveyances, luxury, pleasures, accidents with vehicles, inner contentment.',
    isShodashavarga: true,
    supported: true,
  },
  20: {
    division: 20,
    code: 'D20',
    sanskritName: 'Vimsamsa',
    englishName: 'Spiritual Life & Upasana',
    source: 'BPHS',
    formulaVersion: 'BPHS-D20-Standard',
    domainSignification: 'Spiritual devotion, meditation, mantra siddhi, philosophical attainment.',
    isShodashavarga: true,
    supported: true,
  },
  24: {
    division: 24,
    code: 'D24',
    sanskritName: 'Chaturvimsamsa',
    englishName: 'Higher Knowledge & Intellect',
    source: 'BPHS',
    formulaVersion: 'BPHS-D24-Standard',
    domainSignification: 'Academic achievements, higher learning, intellectual capacity, skill mastery.',
    isShodashavarga: true,
    supported: true,
  },
  27: {
    division: 27,
    code: 'D27',
    sanskritName: 'Saptavimsamsa (Bhamsa)',
    englishName: 'Strengths & Weaknesses',
    source: 'BPHS',
    formulaVersion: 'BPHS-D27-Standard',
    domainSignification: 'Subconscious strengths, physical and mental stamina, inherent endurance.',
    isShodashavarga: true,
    supported: true,
  },
  30: {
    division: 30,
    code: 'D30',
    sanskritName: 'Trimsamsa',
    englishName: 'Misfortunes & Adversities',
    source: 'BPHS',
    formulaVersion: 'BPHS-D30-Standard',
    domainSignification: 'Miseries, chronic diseases, misfortunes, psychological challenges, karmic debts.',
    isShodashavarga: true,
    supported: true,
  },
  40: {
    division: 40,
    code: 'D40',
    sanskritName: 'Khavedamsa',
    englishName: 'Maternal Legacy & Auspiciousness',
    source: 'BPHS',
    formulaVersion: 'BPHS-D40-Standard',
    domainSignification: 'Auspicious and inauspicious karmic effects, maternal heritage, deep fortunes.',
    isShodashavarga: true,
    supported: true,
  },
  45: {
    division: 45,
    code: 'D45',
    sanskritName: 'Akshavedamsa',
    englishName: 'Paternal Legacy & Character',
    source: 'BPHS',
    formulaVersion: 'BPHS-D45-Standard',
    domainSignification: 'Overall character purity, paternal lineage karma, moral integrity.',
    isShodashavarga: true,
    supported: true,
  },
  60: {
    division: 60,
    code: 'D60',
    sanskritName: 'Shashtiamsa',
    englishName: 'Past Karma & Destiny Blueprint',
    source: 'BPHS',
    formulaVersion: 'BPHS-D60-Standard',
    domainSignification: 'Root past life karma, individual differentiation (sensitive to seconds of birth).',
    isShodashavarga: true,
    supported: true,
  },
};

export class VargaRegistry {
    public static getDefinition(division: number): VargaDefinition {
    const def = VARGA_REGISTRY[division];
    if (def) {
      return { ...def };
    }
    return {
      division,
      code: `D${division}`,
      sanskritName: `Harmonic D${division}`,
      englishName: `Division ${division}`,
      source: 'BPHS',
      formulaVersion: `BPHS-Harmonic-D${division}`,
      domainSignification: `Subtle harmonic resonance division ${division}.`,
      isShodashavarga: false,
      supported: true,
    };
  }

  public static listShodashavargas(): VargaDefinition[] {
    return Object.values(VARGA_REGISTRY).filter((v) => v.isShodashavarga);
  }

  public static listAllSupported(): VargaDefinition[] {
    return Object.values(VARGA_REGISTRY).filter((v) => v.supported);
  }
}
