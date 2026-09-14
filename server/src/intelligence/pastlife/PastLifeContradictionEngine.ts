import { PastLifeEvidenceScore, PastLifeContradiction } from './PastLifeTypes.js';

export class PastLifeContradictionEngine {
  public static evaluate(evidence: PastLifeEvidenceScore[]): {
    hasContradiction: boolean;
    contradictions: PastLifeContradiction[];
    isMixedArchetype: boolean;
    synthesisNote?: string;
  } {
    const contradictions: PastLifeContradiction[] = [];

    const hasAscetic = evidence.some(
      (e) => e.direction.includes('SPIRITUAL') || e.direction.includes('CONTEMPLATION') || e.direction.includes('AUSTERITY')
    );
    const hasLeadership = evidence.some(
      (e) => e.direction.includes('LEADERSHIP') || e.direction.includes('STEWARDSHIP') || e.direction.includes('ADMINISTRATION')
    );

    if (hasAscetic && hasLeadership) {
      contradictions.push({
        conflict: 'Tension between monastic/ascetic seclusion and royal/administrative duty in chart indicators.',
        resolution: 'Harmonized as a Dharmic Counselor or Philosopher-Leader who held worldly responsibility while maintaining deep personal spiritual detachment.',
        archetype_adjustment: 'MIXED_ARCHETYPE (Leader-Seeker / Dharmic Administrator)',
      });
    }

    return {
      hasContradiction: contradictions.length > 0,
      contradictions,
      isMixedArchetype: contradictions.length > 0,
      synthesisNote: contradictions.length > 0
        ? 'Your chart reflects dual energetic currents: an inner impulse toward contemplation balanced by a karmic legacy of duty and leadership.'
        : undefined,
    };
  }
}
