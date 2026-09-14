import { PastLifeSourceReference } from './PastLifeTypes.js';

export class PastLifeVedicKnowledgeEngine {
  private static readonly CANONICAL_SOURCES: PastLifeSourceReference[] = [
    {
      sourceId: 'SRC-BPHS-032',
      title: 'Brihat Parashara Hora Shastra',
      authorOrTradition: 'Maharishi Parashara',
      sectionOrChapter: 'Chapter 32: Karakadhyaya (Sutra 1-24)',
      philosophicalTheme: 'Atmakaraka as the Supreme Ruler of the Soul in the Natal Chart',
      translationMetadata: 'Academic Sanskrit translation with Santhanam commentary',
      provenance: 'Classical Jyotish Canon (Public Domain / Verified)',
    },
    {
      sourceId: 'SRC-BPHS-044',
      title: 'Brihat Parashara Hora Shastra',
      authorOrTradition: 'Maharishi Parashara',
      sectionOrChapter: 'Chapter 44: Shashtiamsa Phala (D60)',
      philosophicalTheme: 'Evaluation of subtle past-life merits (Purva Punya) and karmic debts through divisional harmony',
      translationMetadata: 'Traditional Nirnaya Sagar Edition',
      provenance: 'Classical Jyotish Canon (Public Domain / Verified)',
    },
    {
      sourceId: 'SRC-JUS-001',
      title: 'Jaimini Upadesha Sutras',
      authorOrTradition: 'Maharishi Jaimini',
      sectionOrChapter: 'Adhyaya 1, Pada 1-2: Karakamsa Nirupana',
      philosophicalTheme: 'The soul orientation, spiritual inclinations, and past-life disposition indicated by the Karakamsa',
      translationMetadata: 'Sanskrit sutras with Neelakantha commentary',
      provenance: 'Classical Upadesha Canon (Verified)',
    },
    {
      sourceId: 'SRC-BG-006',
      title: 'Bhagavad Gita',
      authorOrTradition: 'Vyasa / Krishna-Arjuna Samvada',
      sectionOrChapter: 'Chapter 6, Shlokas 41-44 (Yogabhrashta)',
      philosophicalTheme: 'Persistence of accumulated spiritual intellect across successive incarnations (Tatra tam buddhisamyogam labhate paurvadehikam)',
      translationMetadata: 'Standard Sanskrit recension with Shankaracharya commentary',
      provenance: 'Prasthana Trayi / Canonical Scripture (Verified)',
    },
    {
      sourceId: 'SRC-PHALA-015',
      title: 'Phaladeepika',
      authorOrTradition: 'Mantreswara',
      sectionOrChapter: 'Adhyaya 15: Bhavaphala Nirupana (House 5 & 12)',
      philosophicalTheme: 'The 5th house as repository of Purva Janma Punya (accumulated spiritual credit)',
      translationMetadata: 'Gopesh Kumar Ojha critical edition',
      provenance: 'Medieval Jyotish Classic (Verified)',
    },
  ];

  public static getReferencesForIndicators(atmakarakaPlanet: string, ketuHouse: number): PastLifeSourceReference[] {
    const refs: PastLifeSourceReference[] = [
      this.CANONICAL_SOURCES[0], // BPHS Karakadhyaya
      this.CANONICAL_SOURCES[2], // Jaimini
      this.CANONICAL_SOURCES[3], // Gita Yogabhrashta
    ];

    if (ketuHouse === 12 || ketuHouse === 5 || ketuHouse === 8) {
      refs.push(this.CANONICAL_SOURCES[4]); // Phaladeepika
    }

    return refs;
  }
}
