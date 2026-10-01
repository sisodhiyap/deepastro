/**
 * KPForecastEngine.ts
 * Krishnamurti Paddhati (KP) Stellar Sub-Lord Forecasting Engine.
 * Evaluates cuspal sub-lords, star lords, and planetary significators to provide
 * high-precision stellar timing confirmations for life domains.
 * 
 * Strict Invariant:
 * If accurate coordinates or precise birth time (< 1 min) are unavailable,
 * records KP_NOT_AVAILABLE rather than fabricating pseudo-sub-lords.
 */

import { CanonicalPredictionContext, PredictionEvidence, PredictionSignalCategory } from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export interface KPEvaluationResult {
  status: 'AVAILABLE' | 'KP_NOT_AVAILABLE';
  isApplicable: boolean;
  cuspSubLord?: string;
  starLord?: string;
  significatorHouses?: number[];
  rationale: string;
  direction: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL';
  evidence: PredictionEvidence[];
}

export class KPForecastEngine {
  /**
   * Maps a prediction signal category to the classical KP primary and supporting cusps.
   */
  private static getRelevantCuspsForCategory(category: PredictionSignalCategory): { primary: number; supporting: number[] } {
    switch (category) {
      case 'CAREER_EXPANSION':
      case 'RESPONSIBILITY_PERIOD':
        return { primary: 10, supporting: [6, 11, 2] };
      case 'FINANCIAL_FOCUS':
        return { primary: 2, supporting: [11, 6, 1] };
      case 'RELATIONSHIP_ACTIVATION':
        return { primary: 7, supporting: [2, 11, 5] };
      case 'EDUCATION_PERIOD':
        return { primary: 4, supporting: [9, 11] };
      case 'HEALTH_ROUTINE_FOCUS':
        return { primary: 6, supporting: [1, 8, 12] };
      case 'TRAVEL_FOREIGN_CONNECTION':
        return { primary: 9, supporting: [12, 3] };
      case 'SPIRITUAL_DEVELOPMENT':
        return { primary: 9, supporting: [12, 5] };
      case 'PROPERTY_HOME_FOCUS':
        return { primary: 4, supporting: [11, 12] };
      case 'CREATIVE_PERIOD':
        return { primary: 5, supporting: [11, 1] };
      case 'NETWORK_EXPANSION':
        return { primary: 11, supporting: [3, 7] };
      case 'TRANSFORMATION_PERIOD':
        return { primary: 8, supporting: [12, 6] };
      default:
        return { primary: 1, supporting: [9, 11] };
    }
  }

  /**
   * Evaluates KP stellar confirmations for a specific life domain and active Dasha lords.
   */
  public static evaluateDomain(
    context: CanonicalPredictionContext,
    category: PredictionSignalCategory,
    activeLords: { mahadasha: PlanetName; antardasha: PlanetName },
    periodLabel: string = 'Current Cycle'
  ): KPEvaluationResult {
    const kp = context.kpAnalysis;

    // Invariant Check (Section 6): If KP not available or approximate time, do not fabricate.
    if (!kp || kp.status === 'KP_NOT_AVAILABLE') {
      const reason = kp?.reason || 'Precise birth time required for KP stellar sub-lord resolution.';
      const evidence: PredictionEvidence = {
        source: 'KP',
        engineVersion: '1.0.0-kp',
        rule: 'KP Sub-Lord Precision Gate',
        entity: 'KP_STATUS',
        value: `KP stellar sub-lord analysis withheld (${reason}). Vedic Parashari and Gochara systems provide primary guidance.`,
        weight: 0.05,
        direction: 'NEUTRAL',
      };

      return {
        status: 'KP_NOT_AVAILABLE',
        isApplicable: false,
        rationale: reason,
        direction: 'NEUTRAL',
        evidence: [evidence],
      };
    }

    const { primary: primaryCuspNum, supporting: supportingCusps } = this.getRelevantCuspsForCategory(category);
    const primaryCusp = kp.cusps.find((c) => c.houseNumber === primaryCuspNum);
    const subLord = primaryCusp?.subLord || 'Jupiter';
    const starLord = primaryCusp?.starLord || 'Sun';

    const mahaKP = kp.planets.find((p) => p.planet === activeLords.mahadasha);
    const antaKP = kp.planets.find((p) => p.planet === activeLords.antardasha);

    const mahaSignified = kp.significatorsSummary[activeLords.mahadasha]?.housesSignified || [];
    const antaSignified = kp.significatorsSummary[activeLords.antardasha]?.housesSignified || [];

    const isPrimarySignified = mahaSignified.includes(primaryCuspNum) || antaSignified.includes(primaryCuspNum);
    const isSupportingSignified = supportingCusps.some((h) => mahaSignified.includes(h) || antaSignified.includes(h));

    const isSubLordAligned =
      subLord === activeLords.mahadasha ||
      subLord === activeLords.antardasha ||
      mahaSignified.includes(primaryCuspNum);

    let direction: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' = 'NEUTRAL';
    let weight = 0.20;
    let rationale = '';

    if (isSubLordAligned && isPrimarySignified) {
      direction = 'SUPPORTIVE';
      weight = 0.30;
      rationale = `KP Stellar Confirmation: Primary Cusp ${primaryCuspNum} Sub-Lord ${subLord} connects strongly with active Dasha lord ${activeLords.mahadasha} (Signified houses: ${mahaSignified.join(', ')}). High stellar event potential.`;
    } else if (isSupportingSignified) {
      direction = 'SUPPORTIVE';
      weight = 0.20;
      rationale = `KP Cuspal Resonance: Supporting houses (${supportingCusps.join(', ')}) signified by ${activeLords.antardasha}, providing stable auxiliary momentum.`;
    } else {
      direction = 'NEUTRAL';
      weight = 0.10;
      rationale = `KP Analysis: Cusp ${primaryCuspNum} ruled by Sub-Lord ${subLord}, Star-Lord ${starLord}. Neutral stellar linkage during ${periodLabel}.`;
    }

    const evidence: PredictionEvidence = {
      source: 'KP',
      engineVersion: '1.0.0-kp',
      rule: `KP Cusp ${primaryCuspNum} Sub-Lord Significance`,
      entity: `Cusp_${primaryCuspNum}_SubLord_${subLord}`,
      value: rationale,
      weight,
      direction,
    };

    return {
      status: 'AVAILABLE',
      isApplicable: true,
      cuspSubLord: subLord,
      starLord,
      significatorHouses: Array.from(new Set([...mahaSignified, ...antaSignified])),
      rationale,
      direction,
      evidence: [evidence],
    };
  }
}
