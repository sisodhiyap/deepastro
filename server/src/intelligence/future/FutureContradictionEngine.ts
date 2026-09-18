/**
 * DeepAstro 7.0 — Future Contradiction Engine (FutureContradictionEngine)
 * Identifies and articulates diverging signals across dasha, transits, and vargas.
 */

export interface FutureContradictionItem {
  id: string;
  sourceA: string;
  sourceB: string;
  divergenceDescription: string;
  reconciledGuidance: string;
  impactOnConfidence: 'SLIGHT_REDUCTION' | 'MODERATE_CAUTION' | 'HIGH_UNCERTAINTY';
}

export class FutureContradictionEngine {
  public static detectContradictions(
    dashaStatus: string,
    transitStatus: string,
    isSadeSati: boolean
  ): FutureContradictionItem[] {
    const contradictions: FutureContradictionItem[] = [];

    if (dashaStatus === 'SUPPORTING' && transitStatus === 'CHALLENGING') {
      contradictions.push({
        id: 'cont_dasha_transit_divergence',
        sourceA: 'Vimshottari Dasha (Internal Capacity)',
        sourceB: 'Gochara Transits (External Friction)',
        divergenceDescription: 'Operating dasha lord encourages bold professional elevation, while current transits introduce operational delays or friction.',
        reconciledGuidance: 'Proceed with strategic planning and skills mastery, but avoid premature public launches or overleveraging before supportive transit windows align.',
        impactOnConfidence: 'MODERATE_CAUTION',
      });
    }

    if (dashaStatus === 'SUPPORTING' && isSadeSati) {
      contradictions.push({
        id: 'cont_sade_sati_dasha',
        sourceA: 'Vimshottari Dasha Growth Phase',
        sourceB: 'Saturn Sade Sati Maturation Cycle',
        divergenceDescription: 'Expansionary dasha energy operates concurrently with Saturn\'s demand for emotional sobriety and meticulous responsibility.',
        reconciledGuidance: 'Channel expansionary ambition through structured, highly ethical channels with zero tolerance for shortcuts.',
        impactOnConfidence: 'SLIGHT_REDUCTION',
      });
    }

    return contradictions;
  }
}
