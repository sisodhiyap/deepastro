/**
 * DeepAstro Question Understanding & Refinement Engine
 * Disambiguates vague queries, decomposes them into actionable dimensions,
 * and formulates at most 1–3 high-value clarifying questions when necessary.
 */

import { ParsedUserIntent } from './UserIntentEngine.js';
import { UserStructuredContext } from './IntelligenceTypes.js';

export interface QuestionDecomposition {
  originalQuery: string;
  isAmbiguous: boolean;
  clarifyingQuestions: string[];
  inferredDimensions: {
    domainFocus: string;
    impliedTimeHorizon: string;
    coreDilemma: string;
  };
}

export class QuestionUnderstandingEngine {
  public static decomposeQuestion(
    query: string,
    intent: ParsedUserIntent,
    userContext?: UserStructuredContext
  ): QuestionDecomposition {
    const q = query.trim();
    const clarifyingQuestions: string[] = [];
    let isAmbiguous = false;

    // Detect vague archetypes
    if (intent.isVague || /^(will i be successful|what does my future hold|tell me about my life|is my life good)\??$/i.test(q)) {
      isAmbiguous = true;

      // Only ask if user has not already supplied context
      if (!userContext?.career?.currentRole && !userContext?.career?.activeGoals?.length) {
        clarifyingQuestions.push('Which life domain are you most focused on right now? (e.g., career transition, personal relationship, or financial stability)');
      }
      if (!userContext?.decisionContext?.deadline) {
        clarifyingQuestions.push('Are you planning around a specific upcoming time window, or looking at the general macro phase?');
      }
      if (!userContext?.career?.knownConstraints?.length) {
        clarifyingQuestions.push('What specific decision or opportunity is currently in front of you?');
      }
    } else if (/^(should i do it|what should i choose|help me decide)\??$/i.test(q)) {
      isAmbiguous = true;
      clarifyingQuestions.push('What are the specific options you are choosing between (e.g., Option A vs. Option B)?');
      clarifyingQuestions.push('What is the deadline or decision horizon you are working toward?');
    }

    return {
      originalQuery: q,
      isAmbiguous: clarifyingQuestions.length > 0,
      clarifyingQuestions: clarifyingQuestions.slice(0, 3), // Max 1-3
      inferredDimensions: {
        domainFocus: intent.primaryCategory,
        impliedTimeHorizon: intent.timeHorizon,
        coreDilemma: intent.userObjective,
      },
    };
  }
}
