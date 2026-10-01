/**
 * VargaForecastEngine.ts
 * Rigorous divisional chart (Shodashavarga) analysis engine for Future Intelligence.
 * Enforces:
 * - D1 = Primary physical/concrete life context
 * - D9 (Navamsha) = Deeper dharma, marriage, inner development, planetary strength refinement (never overrides D1)
 * - D10 (Dashamsha) = Professional authority, leadership, career elevation
 * - Selective relevant Vargas: D2 (Wealth), D4 (Home/Real Estate), D20 (Spirituality), D24 (Higher Learning), D30 (Adversity), D60 (Karmic Origin).
 */

import { CanonicalPredictionContext, PredictionEvidence, PredictionSignalCategory } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export interface VargaEvaluationResult {
  category: PredictionSignalCategory;
  d1Signal: string;
  d9Signal?: string;
  d10Signal?: string;
  specificVargaSignal?: string;
  vargaConvergence: 'HIGH' | 'MODERATE' | 'LOW';
  evidence: PredictionEvidence[];
}

export class VargaForecastEngine {
  /**
   * Refines a life domain prediction using selective classical Vargas.
   */
  public static evaluateDomain(
    context: CanonicalPredictionContext,
    category: PredictionSignalCategory,
    activeLords: { mahadasha: PlanetName; antardasha: PlanetName }
  ): VargaEvaluationResult {
    const evidence: PredictionEvidence[] = [];

    // 1. D1 Primary Baseline
    const d1Maha = context.d1.find((p) => p.name === activeLords.mahadasha);
    const d1Anta = context.d1.find((p) => p.name === activeLords.antardasha);

    const d1Signal = `D1 Baseline: Mahadasha lord ${activeLords.mahadasha} placed in House ${d1Maha?.house || 'N/A'}, Antardasha lord ${activeLords.antardasha} in House ${d1Anta?.house || 'N/A'}.`;
    evidence.push({
      source: 'D1' as any,
      rule: 'D1 Primary Anchor Rule',
      value: d1Signal,
      weight: 0.50,
      direction: 'SUPPORTIVE',
    });

    let d9Signal: string | undefined = undefined;
    let d10Signal: string | undefined = undefined;
    let specificVargaSignal: string | undefined = undefined;
    let vargaConvergence: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

    // 2. D9 Navamsha Refinement (Strictly for relationships, marriage, inner development, and soul maturity)
    if (category === 'RELATIONSHIP_ACTIVATION' || category === 'SPIRITUAL_DEVELOPMENT') {
      const d9Maha = context.d9?.find((v) => v.planet === activeLords.mahadasha);
      const d9Anta = context.d9?.find((v) => v.planet === activeLords.antardasha);

      const d9Sign = d9Maha?.signName || 'Neutral';
      const isVargottama = d1Maha && d9Maha && d1Maha.signName === d9Maha.signName;

      d9Signal = `D9 Navamsa: ${activeLords.mahadasha} operates in ${d9Sign} Navamsha${isVargottama ? ' (Vargottama - Exceptional Core Strength)' : ''}. Confirms emotional depth and relationship karma.`;
      
      evidence.push({
        source: 'D9',
        rule: isVargottama ? 'Navamsha Vargottama Strength' : 'Navamsha Dharmic Refinement',
        value: d9Signal,
        weight: 0.25,
        direction: isVargottama ? 'SUPPORTIVE' : 'NEUTRAL',
      });

      if (isVargottama) vargaConvergence = 'HIGH';
    }

    // 3. D10 Dashamsha Refinement (Strictly for career, profession, status, leadership)
    if (category === 'CAREER_EXPANSION' || category === 'RESPONSIBILITY_PERIOD') {
      const d10Maha = context.d10?.find((v) => v.planet === activeLords.mahadasha);
      const d10Anta = context.d10?.find((v) => v.planet === activeLords.antardasha);

      const isAuspicious = d10Maha && [1, 4, 7, 10, 5, 9, 11].includes((d10Maha.house || (d10Maha.signIndex + 1)));

      d10Signal = `D10 Dashamsha: ${activeLords.mahadasha} positioned in ${d10Maha?.signName || 'Career sign'}. Professional karma reinforces worldly leadership and workplace responsibility.`;

      evidence.push({
        source: 'D10',
        rule: 'Dashamsha Professional Authority Rule',
        value: d10Signal,
        weight: 0.20,
        direction: isAuspicious ? 'SUPPORTIVE' : 'NEUTRAL',
      });

      if (isAuspicious) vargaConvergence = 'HIGH';
    }

    // 4. Other Specific Vargas (D2 Wealth, D4 Property, D24 Education, D20 Spirituality, D30 Adversity)
    if (category === 'FINANCIAL_FOCUS' && context.allVargas?.d2_hora) {
      const d2 = context.allVargas.d2_hora.find((v) => v.planet === activeLords.mahadasha);
      if (d2) {
        specificVargaSignal = `D2 Hora: ${d2.planet} resides in ${d2.signName} Hora (Resource accumulation).`;
        evidence.push({
          source: 'VARGA',
          rule: 'D2 Hora Wealth Refinement',
          value: specificVargaSignal,
          weight: 0.10,
          direction: 'SUPPORTIVE',
        });
      }
    } else if (category === 'PROPERTY_HOME_FOCUS' && context.allVargas?.d4_chaturthamsha) {
      const d4 = context.allVargas.d4_chaturthamsha.find((v) => v.planet === activeLords.mahadasha);
      if (d4) {
        specificVargaSignal = `D4 Chaturthamsha: ${d4.planet} in ${d4.signName} signifies physical real estate and domestic roots.`;
        evidence.push({
          source: 'VARGA',
          rule: 'D4 Property & Home Foundation',
          value: specificVargaSignal,
          weight: 0.10,
          direction: 'SUPPORTIVE',
        });
      }
    } else if (category === 'EDUCATION_PERIOD' && context.allVargas?.d24_chaturvimshamsha) {
      const d24 = context.allVargas.d24_chaturvimshamsha.find((v) => v.planet === activeLords.mahadasha);
      if (d24) {
        specificVargaSignal = `D24 Siddhamsa: ${d24.planet} activates intellectual synthesis and higher academic credentials.`;
        evidence.push({
          source: 'VARGA',
          rule: 'D24 Intellectual Acuity',
          value: specificVargaSignal,
          weight: 0.10,
          direction: 'SUPPORTIVE',
        });
      }
    } else if (category === 'SPIRITUAL_DEVELOPMENT' && context.allVargas?.d20_vimshamsha) {
      const d20 = context.allVargas.d20_vimshamsha.find((v) => v.planet === activeLords.mahadasha);
      if (d20) {
        specificVargaSignal = `D20 Vimshamsha: ${d20.planet} in ${d20.signName} deepens meditative devotion and upasana.`;
        evidence.push({
          source: 'VARGA',
          rule: 'D20 Spiritual Devotion',
          value: specificVargaSignal,
          weight: 0.10,
          direction: 'SUPPORTIVE',
        });
      }
    }

    return {
      category,
      d1Signal,
      d9Signal,
      d10Signal,
      specificVargaSignal,
      vargaConvergence,
      evidence,
    };
  }
}
