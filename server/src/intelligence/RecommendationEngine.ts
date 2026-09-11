/**
 * DeepAstro Recommendation Engine
 * Formulates ethical, evidence-based recommendations strictly separating
 * traditional mindfulness remedies from practical real-world actions.
 * Never uses fear, manipulates, or prescribes costly rituals.
 */

export interface ActionableRecommendations {
  domain: string;
  practicalActions: string[];
  traditionalRemedies: string[];
  mindfulnessGuidance: string;
}

export class RecommendationEngine {
  public static generateRecommendations(
    domain: string,
    dashaLord: string,
    antardashaLord: string
  ): ActionableRecommendations {
    const d = domain.toUpperCase();

    const practicalActions: string[] = [];
    const traditionalRemedies: string[] = [];

    if (d === 'CAREER' || d === 'JOB') {
      practicalActions.push('Audit and refine your core professional portfolio highlighting quantitative achievements.');
      practicalActions.push('Initiate high-signal conversations with mentors before finalizing binding contracts.');
      traditionalRemedies.push(`Practice morning Surya Namaskar (Sun salutations) or silent contemplation at dawn to align with the solar current.`);
      traditionalRemedies.push(`Chant or reflect upon the mantra "Om Budhaya Namah" to clear communicative ambiguities.`);
    } else if (d === 'RELATIONSHIP' || d === 'MARRIAGE') {
      practicalActions.push('Set clear, respectful personal boundaries while cultivating active listening.');
      practicalActions.push('Dedicate uninterrupted quality time for shared creative or domestic activities.');
      traditionalRemedies.push(`Cultivate Venusian (Shukra) harmony through intentional gratitude and creating aesthetic peace in personal spaces.`);
      traditionalRemedies.push(`Practice 10 minutes of evening breathwork (Pranayama) to soothe the lunar emotional current.`);
    } else {
      practicalActions.push('Establish a disciplined daily schedule prioritizing focused operational deep work.');
      practicalActions.push('Maintain an objective journal of key decisions to observe personal patterns over time.');
      traditionalRemedies.push(`Spend 15 minutes in quiet meditation during sunrise or sunset transitions (Sandhyavandanam spirit).`);
      traditionalRemedies.push(`Express gratitude for existing blessings before initiating new endeavors.`);
    }

    return {
      domain,
      practicalActions,
      traditionalRemedies,
      mindfulnessGuidance: `Current planetary climate under ${dashaLord}-${antardashaLord} favors intentional mindfulness, ethical conduct, and balanced effort.`,
    };
  }
}
