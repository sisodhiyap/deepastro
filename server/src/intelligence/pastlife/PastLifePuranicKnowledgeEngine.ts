/**
 * DeepAstro 7.0 — Past Life Puranic Knowledge Engine (PastLifePuranicKnowledgeEngine)
 * Grounded references to classical Puranic literature (Vishnu Purana, Srimad Bhagavatam)
 * providing ethical and spiritual context for karmic themes without historical fabrication.
 */

export interface PuranicKnowledgeNode {
  purana: 'Vishnu Purana' | 'Srimad Bhagavatam' | 'Garuda Purana' | 'Brihadaranyaka Upanishad';
  section: string;
  corePrinciple: string;
  symbolicApplication: string;
  provenance: string;
}

export class PastLifePuranicKnowledgeEngine {
  private static readonly REPOSITORY: PuranicKnowledgeNode[] = [
    {
      purana: 'Vishnu Purana',
      section: 'Book II, Chapter 13 (Bharata Upakhyana)',
      corePrinciple: 'Vasana (Subtle Tendency) Continuity',
      symbolicApplication: 'The soul carries inward impressions and unfulfilled contemplation across births, transforming prior devotion into present wisdom.',
      provenance: 'Critical Edition, Gitapress Gorakhpur / Classical Jyotish Canon',
    },
    {
      purana: 'Srimad Bhagavatam',
      section: 'Canto 3, Chapter 31 (Garbha Gita & Soul Trajectory)',
      corePrinciple: 'Punarjanma & Karmic Prarabdha',
      symbolicApplication: 'The circumstances of birth, innate affinities, and natural moral intuitions are shaped by conscious choices in preceding karmic cycles.',
      provenance: 'Bhagavata Purana Sanskrit Recension',
    },
    {
      purana: 'Brihadaranyaka Upanishad',
      section: 'Chapter IV, Brahmana 4, Verse 5',
      corePrinciple: 'Yat-kamo bhavati tat-kratu bhavati (As one desires, so one resolves; as one acts, so one becomes)',
      symbolicApplication: 'Human destiny unfolds strictly through the compounding momentum of intentional action (Karma) and underlying spiritual resolve.',
      provenance: 'Mukhya Upanishadic Canon with Shankara Bhashya',
    },
    {
      purana: 'Garuda Purana',
      section: 'Preta Khanda, Chapter 32 (Dharma & Rinanubandha)',
      corePrinciple: 'Rinanubandha (Karmic Relationships of Reciprocity)',
      symbolicApplication: 'Enduring affection or recurrent friction with key souls reflects unresolved debts of service, forgiveness, and mutual assistance.',
      provenance: 'Garuda Purana Dharma Shastra Section',
    },
  ];

  public static getPuranicContext(dominantTheme: string): PuranicKnowledgeNode[] {
    const norm = dominantTheme.toLowerCase();
    if (norm.includes('relationship') || norm.includes('mirror') || norm.includes('debt')) {
      return [this.REPOSITORY[3], this.REPOSITORY[0]];
    }
    if (norm.includes('scholar') || norm.includes('intellect') || norm.includes('teacher')) {
      return [this.REPOSITORY[2], this.REPOSITORY[0]];
    }
    return [this.REPOSITORY[0], this.REPOSITORY[1], this.REPOSITORY[2]];
  }
}
