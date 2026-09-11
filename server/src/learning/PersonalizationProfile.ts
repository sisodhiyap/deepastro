/**
 * Personalization Profile
 * Represents user preferences regarding astrological depth, tone, focus domains,
 * classical source transparency, and user privacy toggles.
 */

import { db, PersonalizationProfileRecord } from '../database/db.js';
export type { PersonalizationProfileRecord };

export interface PersonalizationProfileDTO {
  userId: string;
  language: string;
  readingDepth: 'summary' | 'standard' | 'in_depth' | 'research';
  tone: 'compassionate' | 'direct' | 'philosophical' | 'uplifting';
  preferredTopics: string[];
  careerFocus: boolean;
  relationshipFocus: boolean;
  financeFocus: boolean;
  spiritualFocus: boolean;
  technicalDetail: 'low' | 'medium' | 'high';
  classicalSourceVisibility: boolean;
  practicalAdvicePreference: boolean;
  fearFreeLanguage: boolean;
  personalizationEnabled: boolean;
  outcomeLearningEnabled: boolean;
  updatedAt: string;
}

export class PersonalizationProfileService {
  public static DEFAULT_PROFILE: Omit<PersonalizationProfileRecord, 'userId' | 'updatedAt'> = {
    language: 'en',
    readingDepth: 'standard',
    tone: 'philosophical',
    preferredTopics: ['career', 'personal_growth', 'relationships'],
    careerFocus: true,
    relationshipFocus: true,
    financeFocus: true,
    spiritualFocus: true,
    technicalDetail: 'medium',
    classicalSourceVisibility: true,
    practicalAdvicePreference: true,
    fearFreeLanguage: true,
    personalizationEnabled: true,
    outcomeLearningEnabled: true,
  };

  /**
   * Retrieves or initializes a user's personalization profile
   */
  public static getProfile(userId: string): PersonalizationProfileRecord {
    const existing = db.personalizationProfiles.get(userId);
    if (existing) {
      return existing;
    }

    const newProfile: PersonalizationProfileRecord = {
      userId,
      ...this.DEFAULT_PROFILE,
      updatedAt: new Date().toISOString(),
    };

    db.personalizationProfiles.set(userId, newProfile);
    return newProfile;
  }

  /**
   * Updates a user's personalization preferences
   */
  public static updateProfile(
    userId: string,
    updates: Partial<Omit<PersonalizationProfileRecord, 'userId' | 'updatedAt'>>
  ): PersonalizationProfileRecord {
    const current = this.getProfile(userId);
    const updated: PersonalizationProfileRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.personalizationProfiles.set(userId, updated);
    return updated;
  }

  /**
   * Toggles personalization or outcome learning
   */
  public static setToggles(
    userId: string,
    toggles: { personalizationEnabled?: boolean; outcomeLearningEnabled?: boolean }
  ): PersonalizationProfileRecord {
    return this.updateProfile(userId, toggles);
  }
}
