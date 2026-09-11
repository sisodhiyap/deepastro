/**
 * Question Refinement Engine (QuestionRefinementEngine)
 * Deconstructs ambiguous user questions into structured astrological inquiries.
 * Prevents premature, generic, or vague predictive outputs.
 */

export interface QuestionIntent {
  rawQuestion: string;
  domain: 'CAREER' | 'RELATIONSHIP' | 'RELOCATION' | 'FINANCE' | 'HEALTH' | 'SPIRITUALITY' | 'GENERAL';
  isVague: boolean;
  timeHorizon?: 'IMMEDIATE_3M' | 'MEDIUM_1Y' | 'LONG_5Y' | 'UNSPECIFIED';
  specificRoleOrEntity?: string;
  targetLocation?: string;
  statusContextKnown: boolean;
}

export interface QuestionRefinementResult {
  needsClarification: boolean;
  intent: QuestionIntent;
  clarificationPrompt?: string;
  suggestedOptions?: string[];
  refinedQuestion: string;
}

export class QuestionRefinementEngine {
  public static refine(rawQuestion: string, userContext?: { employmentStatus?: string; relationshipStatus?: string }): QuestionRefinementResult {
    const q = rawQuestion.trim().toLowerCase();

    // 1. Detect Domain
    let domain: QuestionIntent['domain'] = 'GENERAL';
    if (q.includes('job') || q.includes('career') || q.includes('promotion') || q.includes('work') || q.includes('interview')) {
      domain = 'CAREER';
    } else if (q.includes('marry') || q.includes('marriage') || q.includes('spouse') || q.includes('relationship') || q.includes('love')) {
      domain = 'RELATIONSHIP';
    } else if (q.includes('move') || q.includes('relocate') || q.includes('abroad') || q.includes('travel') || q.includes('visa')) {
      domain = 'RELOCATION';
    } else if (q.includes('money') || q.includes('wealth') || q.includes('invest') || q.includes('financial')) {
      domain = 'FINANCE';
    } else if (q.includes('health') || q.includes('illness') || q.includes('surgery')) {
      domain = 'HEALTH';
    }

    // 2. Assess Vagueness
    const isVeryShort = q.split(/\s+/).length <= 6;
    const hasTimeSpec = q.includes('this year') || q.includes('soon') || q.includes('next month') || q.includes('2026') || q.includes('2027');
    const isVague = isVeryShort && !hasTimeSpec;

    const intent: QuestionIntent = {
      rawQuestion,
      domain,
      isVague,
      timeHorizon: hasTimeSpec ? 'MEDIUM_1Y' : 'UNSPECIFIED',
      statusContextKnown: !!(userContext?.employmentStatus || userContext?.relationshipStatus),
    };

    if (isVague && domain === 'CAREER' && !userContext?.employmentStatus) {
      return {
        needsClarification: true,
        intent,
        clarificationPrompt: 'To provide precise house and transit timing for your career question, could you clarify your specific focus?',
        suggestedOptions: [
          'Looking for a first job or new role',
          'Seeking promotion or growth in current company',
          'Considering shifting industry or starting a business',
        ],
        refinedQuestion: `Career transition and professional timing analysis: ${rawQuestion}`,
      };
    }

    if (isVague && domain === 'RELATIONSHIP' && !userContext?.relationshipStatus) {
      return {
        needsClarification: true,
        intent,
        clarificationPrompt: 'To examine 7th house and D9 Navamsha timing accurately, please select your context:',
        suggestedOptions: [
          'Currently single, inquiring about marriage timing',
          'In a relationship, exploring compatibility and wedding timing',
          'Navigating marriage harmony or transition',
        ],
        refinedQuestion: `Matrimonial and 7th house timing analysis: ${rawQuestion}`,
      };
    }

    return {
      needsClarification: false,
      intent,
      refinedQuestion: rawQuestion,
    };
  }
}
