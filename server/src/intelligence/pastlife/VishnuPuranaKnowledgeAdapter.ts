import { PastLifeSourceReference } from './PastLifeTypes.js';

export class VishnuPuranaKnowledgeAdapter {
  private static readonly PURANA_REFERENCES: PastLifeSourceReference[] = [
    {
      sourceId: 'SRC-VP-001',
      title: 'Vishnu Purana',
      authorOrTradition: 'Maharishi Parashara',
      sectionOrChapter: 'Book 1, Chapters 17-20: Prahlada Charitam',
      philosophicalTheme: 'The continuity of dharmic devotion and moral fortitude across adversity and changing embodiments',
      translationMetadata: 'H.H. Wilson academic translation, revised by Manmatha Nath Dutt',
      provenance: 'Mahapurana Canon (Public Domain / Verified)',
    },
    {
      sourceId: 'SRC-VP-002',
      title: 'Vishnu Purana',
      authorOrTradition: 'Maharishi Parashara',
      sectionOrChapter: 'Book 2, Chapters 13-16: Jada Bharata Samvada',
      philosophicalTheme: 'The immortal, unblemished nature of the Atman (Soul) and non-attachment to transient past identities',
      translationMetadata: 'Gita Press Sanskrit-English Edition',
      provenance: 'Mahapurana Canon (Public Domain / Verified)',
    },
    {
      sourceId: 'SRC-VP-003',
      title: 'Vishnu Purana',
      authorOrTradition: 'Maharishi Parashara',
      sectionOrChapter: 'Book 3, Chapter 7-8: Varna & Ashrama Dharma',
      philosophicalTheme: 'Selfless performance of one\'s natural duty (Swadharma) as the supreme path of spiritual purification',
      translationMetadata: 'Chowkhamba Sanskrit Series',
      provenance: 'Mahapurana Canon (Public Domain / Verified)',
    },
  ];

  public static getPhilosophicalInsight(theme: string): {
    references: PastLifeSourceReference[];
    summary: string;
    dharmaLesson: string;
  } {
    const refs = [this.PURANA_REFERENCES[1], this.PURANA_REFERENCES[0]];

    return {
      references: refs,
      summary: 'In the Vishnu Purana, Maharishi Parashara explains that while external forms and temporal roles change, the inner consciousness retains its dharmic orientation. Individual past experiences serve not as rigid destiny, but as symbolic milestones toward spiritual liberation.',
      dharmaLesson: 'Act with dedication to truth and compassionate duty without becoming entangled in the pride of past accomplishments or sorrow over old trials.',
    };
  }
}
