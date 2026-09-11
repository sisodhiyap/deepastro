/**
 * Real User Personalization Engine (RealUserPersonalizationEngine)
 * Learns user communication preferences, preferred depth, and topics.
 *
 * Strict Privacy & Safety Barrier:
 * STRICTLY BARS inferring or recording sensitive characteristics:
 * - Religion
 * - Political beliefs
 * - Sexual orientation
 * - Medical diagnoses / specific health conditions
 * - Criminal records
 * - Race / ethnicity
 * - Exact financial balance / wealth amounts
 * - Mental health evaluations
 */

export interface PersonalizationPreferences {
  userId: string;
  preferredDepth: 'CONCISE' | 'BALANCED' | 'SCHOLARLY_EXHAUSTIVE';
  preferredLanguage: string;
  preferredReadingStructure: 'CHRONOLOGICAL' | 'THEMATIC' | 'PRACTICAL_ACTIONABLE';
  frequentlyInquiredTopics: string[];
  showMethodologyPassports: boolean;
  updatedAt: string;
}

export class RealUserPersonalizationEngine {
  private static userPrefs: Map<string, PersonalizationPreferences> = new Map();

  private static PROHIBITED_INFERENCE_PATTERNS = [
    /\breligion\b/i,
    /\bmuslim|hindu|christian|jewish|buddhist|atheist\b/i,
    /\bpolitical|democrat|republican|bjp|congress|leftist|rightist\b/i,
    /\bsexual orientation|homosexual|heterosexual|bisexual\b/i,
    /\bcriminal|arrested|felony\b/i,
    /\brace|caste|ethnicity\b/i,
    /\bbipolar|schizophrenia|depression diagnosis\b/i,
    /\bnet worth in bank|account balance\b/i,
  ];

  public static resetStore(): void {
    this.userPrefs.clear();
  }

  public static getPreferences(userId: string): PersonalizationPreferences {
    const existing = this.userPrefs.get(userId);
    if (existing) return { ...existing };

    const defaultPrefs: PersonalizationPreferences = {
      userId,
      preferredDepth: 'BALANCED',
      preferredLanguage: 'en',
      preferredReadingStructure: 'THEMATIC',
      frequentlyInquiredTopics: [],
      showMethodologyPassports: true,
      updatedAt: new Date().toISOString(),
    };
    this.userPrefs.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  public static updatePreferences(userId: string, updates: Partial<PersonalizationPreferences>): PersonalizationPreferences {
    const current = this.getPreferences(userId);

    // Scan any added topics for prohibited inferences
    if (updates.frequentlyInquiredTopics) {
      for (const topic of updates.frequentlyInquiredTopics) {
        for (const pattern of this.PROHIBITED_INFERENCE_PATTERNS) {
          if (pattern.test(topic)) {
            throw new Error(`PROHIBITED_SENSITIVE_TRAIT_INFERENCE: Inferences regarding religion, politics, medical diagnoses, criminal history, or sexual orientation are strictly prohibited.`);
          }
        }
      }
    }

    const updated: PersonalizationPreferences = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };

    this.userPrefs.set(userId, updated);
    return updated;
  }

  public static deleteUserData(userId: string): boolean {
    return this.userPrefs.delete(userId);
  }
}
