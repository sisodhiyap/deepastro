/**
 * ContradictionEngine.ts
 * Rigorously checks for contrasting chart dynamics (e.g. Benefic Dasha expansion vs Saturn transit friction).
 * Preserves tension transparently rather than artificially smoothing predictions.
 */

import { PredictionEvidence, PredictionSignalCategory } from './types.js';

export interface ContradictionAnalysis {
  category: PredictionSignalCategory;
  hasContradiction: boolean;
  supportiveCount: number;
  challengingCount: number;
  tensionSummary?: string;
  synthesizedOutcome: string;
}

export class ContradictionEngine {
  /**
   * Analyzes an evidence array for a domain and generates an honest synthesis of supportive vs pressure factors.
   */
  public static evaluateEvidence(
    category: PredictionSignalCategory,
    evidenceList: PredictionEvidence[]
  ): ContradictionAnalysis {
    const supportive = evidenceList.filter((e) => e.direction === 'SUPPORTIVE');
    const challenging = evidenceList.filter((e) => e.direction === 'CHALLENGING');

    const hasContradiction = supportive.length > 0 && challenging.length > 0;

    let tensionSummary: string | undefined = undefined;
    let synthesizedOutcome = 'Favorable alignment with steady progress.';

    if (hasContradiction) {
      const supThemes = supportive.map((s) => s.value).slice(0, 2).join('; ');
      const chalThemes = challenging.map((c) => c.value).slice(0, 2).join('; ');
      tensionSummary = `Contrasting Signals: Positive catalytic push [${supThemes}] coincides with structural resistance or duty [${chalThemes}].`;

      if (category === 'CAREER_EXPANSION' || category === 'RESPONSIBILITY_PERIOD') {
        synthesizedOutcome = 'Expansion with increased responsibility: Significant opportunities emerge, requiring rigorous operational discipline and patient endurance.';
      } else if (category === 'FINANCIAL_FOCUS') {
        synthesizedOutcome = 'Growth alongside heightened caution: Inflow of resources accompanied by demands for structured budgeting and resisting hasty speculation.';
      } else if (category === 'RELATIONSHIP_ACTIVATION') {
        synthesizedOutcome = 'Deepening bonds through maturity: New interpersonal chapters that require working through boundaries and clarifying mutual commitments.';
      } else if (category === 'HEALTH_ROUTINE_FOCUS') {
        synthesizedOutcome = 'Vitality supported by deliberate routine: Good recovery potential provided daily sleep, hydration, and stress-reduction are strictly observed.';
      } else {
        synthesizedOutcome = 'Dynamic maturation: Tangible progress gained by navigating through deliberate, constructive friction.';
      }
    } else if (challenging.length > 0) {
      synthesizedOutcome = 'Consolidation phase: Prioritize endurance, inner reflection, and maintenance over aggressive expansion.';
    } else {
      synthesizedOutcome = 'Clear supportive window: Unhindered momentum favoring purposeful initiative.';
    }

    return {
      category,
      hasContradiction,
      supportiveCount: supportive.length,
      challengingCount: challenging.length,
      tensionSummary,
      synthesizedOutcome,
    };
  }
}
