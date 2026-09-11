/**
 * DeepAstro User Preference Engine
 * Tracks user personalization preferences (depth, language, preferred systems)
 * to tailor presentation without modifying underlying astrological truth.
 */

import { ReadingDepth } from './IntelligenceTypes.js';

export interface UserPreferences {
  userId: string;
  readingDepth: ReadingDepth;
  language: string;
  preferredSystems: ('PARASHARI' | 'JAIMINI' | 'KP' | 'NUMEROLOGY' | 'PALMISTRY')[];
  showTechnicalCitations: boolean;
  expandContradictionsByDefault: boolean;
  lastUpdated: string;
}

export class UserPreferenceEngine {
  private static preferences: Map<string, UserPreferences> = new Map();

  public static getPreferences(userId: string): UserPreferences {
    let pref = this.preferences.get(userId);
    if (!pref) {
      pref = {
        userId,
        readingDepth: 'STANDARD',
        language: 'en',
        preferredSystems: ['PARASHARI', 'JAIMINI', 'KP'],
        showTechnicalCitations: false,
        expandContradictionsByDefault: true,
        lastUpdated: new Date().toISOString(),
      };
      this.preferences.set(userId, pref);
    }
    return pref;
  }

  public static updatePreferences(userId: string, update: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...update,
      userId,
      lastUpdated: new Date().toISOString(),
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  public static purgeUser(userId: string): void {
    this.preferences.delete(userId);
  }
}
