/**
 * DeepAstro Phase 5 — Personalization Engine
 * 
 * Strict Invariants:
 * 1. Uses ONLY:
 *    - User-confirmed facts (from PersonalLifeGraph)
 *    - User preferences
 *    - Previous explicit questions
 *    - Confirmed prediction outcomes
 *    - Confirmed milestones
 *    - Communication preferences (length, depth, language, tone, chart detail, remedies, timeline)
 * 
 * 2. PROHIBITED INFERENCES (Zero Tolerance):
 *    - Religion / Faith
 *    - Political beliefs / Affiliations
 *    - Specific medical conditions / Diagnoses
 *    - Exact wealth / Net worth / Financial status
 *    - Sexual orientation / Gender identity
 *    - Race / Ethnicity / Caste
 *    - Criminal history / Legal infractions
 *    - Sensitive or protected personal traits
 * 
 * 3. Immutable Constants:
 *    - Personalization CANNOT alter astronomical calculations, Julian Day, or Swiss Ephemeris.
 *    - Personalization CANNOT alter canonical Jyotish rules or mathematical formulas.
 */

import { PersonalLifeGraph, LifeNode } from '../intelligence/PersonalLifeGraph.js';
import { db } from '../database/db.js';

export interface CommunicationPreferences {
  preferredAnswerLength: 'CONCISE' | 'BALANCED' | 'COMPREHENSIVE';
  technicalDepth: 'ACCESSIBLE' | 'INTERMEDIATE' | 'SCHOLARLY';
  language: string; // e.g. 'en', 'hi'
  tone: 'PRAGMATIC' | 'CONTEMPLATIVE' | 'EMPOWERING' | 'ACADEMIC';
  chartDetailLevel: 'ESSENTIAL' | 'MODERATE' | 'FULL_VARGA';
  remedyDetail: 'NONE' | 'PHILOSOPHICAL_ONLY' | 'CLASSICAL_DETAILED';
  timelineDetail: 'BROAD_QUARTERS' | 'MONTHLY_DETAILED';
}

export interface PersonalizedContext {
  userId: string;
  confirmedFacts: string[];
  confirmedMilestones: string[];
  pastInquiryThemes: string[];
  communication: CommunicationPreferences;
  safetyCheckPassed: boolean;
  prohibitedInferenceViolations: string[];
}

export class PersonalizationEngine {
  // Disallowed sensitive inference categories (Phase 5 Section 15)
  private static readonly PROHIBITED_INFERENCE_KEYWORDS = [
    'RELIGION', 'HINDU', 'MUSLIM', 'CHRISTIAN', 'JEWISH', 'SIKH', 'BUDDHIST', 'ATHEIST',
    'POLITICS', 'POLITICAL', 'PARTY', 'VOTING', 'LEFT_WING', 'RIGHT_WING', 'CONSERVATIVE', 'LIBERAL',
    'DIAGNOSIS', 'CANCER', 'DEPRESSION', 'MEDICAL_CONDITION', 'MEDICAL CONDITION', 'CHRONIC_ILLNESS', 'SURGERY',
    'WEALTH_AMOUNT', 'NET_WORTH', 'NET WORTH', 'POVERTY', 'RICH', 'MILLIONAIRE',
    'SEXUAL_ORIENTATION', 'SEXUAL ORIENTATION', 'HOMOSEXUAL', 'GAY', 'LESBIAN', 'STRAIGHT', 'BISEXUAL', 'QUEER',
    'RACE', 'ETHNICITY', 'CASTE', 'SKIN_COLOR',
    'CRIMINAL', 'ARREST', 'CRIME', 'JAIL', 'PRISON', 'ILLEGAL_ACT'
  ];

  public static readonly DEFAULT_COMMUNICATION: CommunicationPreferences = {
    preferredAnswerLength: 'BALANCED',
    technicalDepth: 'INTERMEDIATE',
    language: 'en',
    tone: 'EMPOWERING',
    chartDetailLevel: 'MODERATE',
    remedyDetail: 'PHILOSOPHICAL_ONLY',
    timelineDetail: 'MONTHLY_DETAILED',
  };

  /**
   * Builds personalized context strictly from confirmed facts, respecting anti-inference boundaries
   */
  public static buildPersonalizedContext(
    userId: string,
    untrustedInputPrompt?: string
  ): PersonalizedContext {
    // 1. Fetch user-confirmed life nodes
    const confirmedNodes = PersonalLifeGraph.getConfirmedNodes(userId);
    const confirmedFacts = confirmedNodes
      .filter((n) => n.type !== 'MILESTONE')
      .map((n) => `${n.type}: ${n.title} (${n.dateStart || 'Undated'})`);

    const confirmedMilestones = confirmedNodes
      .filter((n) => n.type === 'MILESTONE')
      .map((n) => `${n.title} (${n.dateStart})`);

    // 2. Fetch past inquiry themes from DB questions safely
    const pastQuestions = (db as any).pastQueries?.get(userId) || [];
    const pastInquiryThemes: string[] = Array.from(
      new Set(pastQuestions.slice(-10).map((q: any) => String(q.domain || 'GENERAL')))
    );

    // 3. Retrieve communication preferences
    const profile = db.personalizationProfiles.get(userId);
    const communication: CommunicationPreferences = {
      preferredAnswerLength: profile?.readingDepth === 'summary' ? 'CONCISE' : profile?.readingDepth === 'in_depth' ? 'COMPREHENSIVE' : 'BALANCED',
      technicalDepth: profile?.technicalDetail === 'high' ? 'SCHOLARLY' : profile?.technicalDetail === 'low' ? 'ACCESSIBLE' : 'INTERMEDIATE',
      language: profile?.language || 'en',
      tone: profile?.tone === 'direct' ? 'PRAGMATIC' : profile?.tone === 'uplifting' ? 'EMPOWERING' : 'CONTEMPLATIVE',
      chartDetailLevel: profile?.classicalSourceVisibility ? 'FULL_VARGA' : 'MODERATE',
      remedyDetail: profile?.practicalAdvicePreference ? 'CLASSICAL_DETAILED' : 'PHILOSOPHICAL_ONLY',
      timelineDetail: 'MONTHLY_DETAILED',
    };

    // 4. Run Anti-Inference Audit on context and any untrusted proposed additions
    const violations: string[] = [];
    const textToCheck = `${confirmedFacts.join(' ')} ${untrustedInputPrompt || ''}`.toUpperCase();

    for (const kw of this.PROHIBITED_INFERENCE_KEYWORDS) {
      if (textToCheck.includes(kw)) {
        violations.push(`Attempted inference or tracking of prohibited sensitive category: ${kw}`);
      }
    }

    return {
      userId,
      confirmedFacts,
      confirmedMilestones,
      pastInquiryThemes,
      communication,
      safetyCheckPassed: violations.length === 0,
      prohibitedInferenceViolations: violations,
    };
  }

  /**
   * Adapts communication style safely based on explicit user feedback
   */
  public static adaptCommunication(
    userId: string,
    feedback: {
      tooLong?: boolean;
      tooTechnical?: boolean;
      prefersRemedies?: boolean;
      newLanguage?: string;
    }
  ): CommunicationPreferences {
    const profile = db.personalizationProfiles.get(userId);
    const updatedDepth = feedback.tooLong ? 'summary' : profile?.readingDepth || 'standard';
    const updatedTechnical = feedback.tooTechnical ? 'low' : profile?.technicalDetail || 'medium';

    if (profile) {
      profile.readingDepth = updatedDepth;
      profile.technicalDetail = updatedTechnical;
      if (feedback.newLanguage) profile.language = feedback.newLanguage;
      db.personalizationProfiles.set(userId, profile);
    }

    return {
      preferredAnswerLength: updatedDepth === 'summary' ? 'CONCISE' : 'BALANCED',
      technicalDepth: updatedTechnical === 'low' ? 'ACCESSIBLE' : 'INTERMEDIATE',
      language: feedback.newLanguage || profile?.language || 'en',
      tone: 'EMPOWERING',
      chartDetailLevel: updatedTechnical === 'low' ? 'ESSENTIAL' : 'MODERATE',
      remedyDetail: feedback.prefersRemedies ? 'CLASSICAL_DETAILED' : 'PHILOSOPHICAL_ONLY',
      timelineDetail: 'MONTHLY_DETAILED',
    };
  }
}
