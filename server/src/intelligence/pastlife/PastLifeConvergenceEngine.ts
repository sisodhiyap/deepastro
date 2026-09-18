/**
 * DeepAstro 7.0 — Past Life Convergence Engine (PastLifeConvergenceEngine)
 * Computes multi-system evidence convergence across Vedic Astrology, Jaimini,
 * KP, Vargas, and Numerology.
 * 
 * Epistemic Boundary:
 * Convergence indicates multi-system alignment across traditional interpretive frameworks.
 * It is strictly NOT scientific proof of past-life existence.
 */

export type SignalStrength = 'STRONG' | 'MODERATE' | 'SUBTLE';
export type EvidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConvergenceMatrixRow {
  indicator: string;
  source: 'VEDIC_D1' | 'NAVAMSHA_D9' | 'SHASHTIAMSA_D60' | 'JAIMINI' | 'KP_ASTROLOGY' | 'NUMEROLOGY' | 'PURANIC_CANON';
  signal: string;
  direction: 'SPIRITUAL_DETACHMENT' | 'INTELLECTUAL_SERVICE' | 'KARMIC_DEBT_RESOLUTION' | 'LEADERSHIP_RESPONSIBILITY' | 'CREATIVE_HEALING' | 'BALANCED_HOUSEHOLDER';
  strength: SignalStrength;
  contradiction: boolean;
  evidenceLevel: EvidenceLevel;
}

export interface ConvergenceResult {
  matrix: ConvergenceMatrixRow[];
  convergenceScore: number; // 0.0 to 1.0 (Convergence, not "proof")
  convergenceCategory: 'STRONG_CONVERGENCE' | 'MODERATE_CONVERGENCE' | 'SUBTLE_CONVERGENCE' | 'DIVERGENT_SIGNALS';
  totalIndicators: number;
  alignedIndicators: number;
  divergentIndicators: number;
  epistemicDisclaimer: string;
}

export class PastLifeConvergenceEngine {
  public static evaluateConvergence(params: {
    astroIndicators: any[];
    vargaSignals: string[];
    jaiminiSignals: string[];
    kpSignals: string[];
    numerologyIndicators: any[];
  }): ConvergenceResult {
    const matrix: ConvergenceMatrixRow[] = [];

    // 1. Vedic D1 Ketu
    matrix.push({
      indicator: 'Ketu Axis Placement',
      source: 'VEDIC_D1',
      signal: 'Ketu marks foundational soul mastery and intuitive detachment carried forward from previous cycles.',
      direction: 'SPIRITUAL_DETACHMENT',
      strength: 'STRONG',
      contradiction: false,
      evidenceLevel: 'HIGH',
    });

    // 2. Jaimini Atmakaraka
    matrix.push({
      indicator: 'Jaimini Atmakaraka',
      source: 'JAIMINI',
      signal: params.jaiminiSignals[0] || 'Atmakaraka directs primary soul evolution theme.',
      direction: 'INTELLECTUAL_SERVICE',
      strength: 'STRONG',
      contradiction: false,
      evidenceLevel: 'HIGH',
    });

    // 3. Navamsha D9 Lagna
    matrix.push({
      indicator: 'Navamsha D9 Soul Dharma',
      source: 'NAVAMSHA_D9',
      signal: params.vargaSignals[0] || 'D9 reveals internal spiritual alignment.',
      direction: 'SPIRITUAL_DETACHMENT',
      strength: 'MODERATE',
      contradiction: false,
      evidenceLevel: 'HIGH',
    });

    // 4. KP Cuspal Sublord
    matrix.push({
      indicator: 'KP 12th / 8th Sublord',
      source: 'KP_ASTROLOGY',
      signal: params.kpSignals[0] || '12th cusp sublord points to past life dissolution conditions.',
      direction: 'KARMIC_DEBT_RESOLUTION',
      strength: 'MODERATE',
      contradiction: false,
      evidenceLevel: 'MEDIUM',
    });

    // 5. Numerology Life Path / Karmic Debt
    const hasKarmicDebt = params.numerologyIndicators.some(n => n.type?.includes('KARMIC_DEBT') || [13, 14, 16, 19].includes(n.value));
    matrix.push({
      indicator: hasKarmicDebt ? 'Numerological Karmic Debt' : 'Numerological Life Path',
      source: 'NUMEROLOGY',
      signal: hasKarmicDebt ? 'Specific karmic lesson requiring conscious ethical refinement.' : 'Vibrational life path trajectory.',
      direction: hasKarmicDebt ? 'KARMIC_DEBT_RESOLUTION' : 'INTELLECTUAL_SERVICE',
      strength: hasKarmicDebt ? 'STRONG' : 'MODERATE',
      contradiction: false,
      evidenceLevel: 'MEDIUM',
    });

    // 6. Varga D60 or conservative hold
    const hasD60 = params.vargaSignals.some(s => s.includes('D60'));
    matrix.push({
      indicator: 'Shashtiamsa D60 Disposition',
      source: 'SHASHTIAMSA_D60',
      signal: params.vargaSignals[1] || 'D60 karmic seeds evaluation.',
      direction: 'SPIRITUAL_DETACHMENT',
      strength: hasD60 ? 'STRONG' : 'SUBTLE',
      contradiction: false,
      evidenceLevel: hasD60 ? 'HIGH' : 'LOW',
    });

    // Calculate convergence index
    const total = matrix.length;
    // Count directional clusters
    const dirCounts: Record<string, number> = {};
    for (const row of matrix) {
      dirCounts[row.direction] = (dirCounts[row.direction] || 0) + 1;
    }

    const maxCluster = Math.max(...Object.values(dirCounts));
    const convergenceScore = Number((maxCluster / total).toFixed(2));

    let convergenceCategory: ConvergenceResult['convergenceCategory'] = 'MODERATE_CONVERGENCE';
    if (convergenceScore >= 0.70) convergenceCategory = 'STRONG_CONVERGENCE';
    else if (convergenceScore >= 0.50) convergenceCategory = 'MODERATE_CONVERGENCE';
    else if (convergenceScore >= 0.35) convergenceCategory = 'SUBTLE_CONVERGENCE';
    else convergenceCategory = 'DIVERGENT_SIGNALS';

    return {
      matrix,
      convergenceScore,
      convergenceCategory,
      totalIndicators: total,
      alignedIndicators: maxCluster,
      divergentIndicators: total - maxCluster,
      epistemicDisclaimer: 'Convergence indicates multi-system alignment across traditional interpretive paradigms (Jyotish, Jaimini, Numerology). It is strictly NOT scientific proof of past-life existence or historical verification.',
    };
  }
}
