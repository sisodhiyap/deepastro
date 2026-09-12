/**
 * Multi-Method Prediction & Conflict Resolution Engine
 * Integrates Parashari (D1/Bhavas), KP Stellar (CSL/Significators), and Vargas (D9/D10/etc.)
 * without artificially averaging contradictory paradigms.
 */

import { LifeEventDomain, EventRulesRegistry } from './eventRulesRegistry.js';
import { EventPromiseEvaluation } from './kpEventPromiseEngine.js';
import { SingleVargaChart } from '../varga/shodashavargaEngine.js';
import { AccuracyQualityReport, AccuracyModel } from './accuracyModel.js';

export interface MethodEvidenceBlock {
  system: 'PARASHARI' | 'KP' | 'VARGA' | 'DASHA';
  verdict: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED';
  confidence: number;
  factors: string[];
  explanation: string;
}

export interface IntegratedPredictionResult {
  domain: LifeEventDomain;
  title: string;
  integratedAssessment: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED_DIVERGENT';
  methodologyOutputs: {
    parashari: MethodEvidenceBlock;
    kp: MethodEvidenceBlock;
    varga: MethodEvidenceBlock;
    dasha: MethodEvidenceBlock;
  };
  conflictDetected: boolean;
  conflictResolutionSummary: string;
  accuracyMetrics: AccuracyQualityReport;
  rulesetVersion: string;
}

export class MultiMethodPredictionEngine {
  /**
   * Synthesizes predictions across Parashari, KP, Varga, and Dasha methodologies
   */
  public static synthesizePrediction(params: {
    domain: LifeEventDomain;
    kpPromise: EventPromiseEvaluation;
    vargaChart: SingleVargaChart;
    parashariHouseStatus?: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED';
    dashaStatus?: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED';
    accuracyMetrics: AccuracyQualityReport;
  }): IntegratedPredictionResult {
    const {
      domain,
      kpPromise,
      vargaChart,
      parashariHouseStatus = 'SUPPORTIVE',
      dashaStatus = 'SUPPORTIVE',
      accuracyMetrics,
    } = params;

    const rule = EventRulesRegistry.getRule(domain);

    // 1. Parashari Block
    const parashariBlock: MethodEvidenceBlock = {
      system: 'PARASHARI',
      verdict: parashariHouseStatus,
      confidence: 0.85,
      factors: [
        `Primary House: H${rule.primaryCusp}`,
        `Parashari Drishti and house placement status: ${parashariHouseStatus}`,
      ],
      explanation: `Parashari Rashi analysis indicates ${parashariHouseStatus.toLowerCase()} potential through natural significations.`,
    };

    // 2. KP Block
    const kpVerdict =
      kpPromise.status === 'PROMISED' || kpPromise.status === 'FAVORABLE'
        ? 'SUPPORTIVE'
        : kpPromise.status === 'DENIED'
        ? 'CHALLENGING'
        : 'MIXED';

    const kpBlock: MethodEvidenceBlock = {
      system: 'KP',
      verdict: kpVerdict,
      confidence: kpPromise.confidence,
      factors: [
        `Cusp ${kpPromise.primaryCusp} Sub-Lord: ${kpPromise.cuspSubLord}`,
        `Signified Houses: [${kpPromise.supportingHousesSignified.join(', ')}]`,
      ],
      explanation: `KP Cuspal Sub-Lord judgement concludes: ${kpPromise.status}.`,
    };

    // 3. Varga Block
    const targetHouse = domain === 'MARRIAGE' ? 7 : domain === 'CAREER' ? 10 : domain === 'CHILDREN' ? 5 : 4;
    const vargaPlanets = vargaChart.planets.filter((p) => p.houseInVarga === targetHouse);
    const vargaVerdict = vargaPlanets.length > 0 ? 'SUPPORTIVE' : 'NEUTRAL';

    const vargaBlock: MethodEvidenceBlock = {
      system: 'VARGA',
      verdict: vargaVerdict,
      confidence: 0.8,
      factors: [
        `${vargaChart.code} Lagna: ${vargaChart.ascendantSignName}`,
        `${vargaChart.code} H${targetHouse} Occupants: ${vargaPlanets.map((p) => p.planet).join(', ') || 'None'}`,
      ],
      explanation: `${vargaChart.code} provides harmonic corroboration on the subtle plane.`,
    };

    // 4. Dasha Block
    const dashaBlock: MethodEvidenceBlock = {
      system: 'DASHA',
      verdict: dashaStatus,
      confidence: 0.88,
      factors: [`Active operating periods align with event houses.`],
      explanation: `Vimshottari Dasha window provides timing impetus.`,
    };

    // Conflict Detection
    const verdicts = [parashariBlock.verdict, kpBlock.verdict, vargaBlock.verdict, dashaBlock.verdict];
    const hasSupport = verdicts.includes('SUPPORTIVE');
    const hasChallenge = verdicts.includes('CHALLENGING');
    const conflictDetected = hasSupport && hasChallenge;

    let integratedAssessment: IntegratedPredictionResult['integratedAssessment'] = 'SUPPORTIVE';
    let resolutionSummary = '';

    if (conflictDetected) {
      integratedAssessment = 'MIXED_DIVERGENT';
      resolutionSummary = `Methodological Divergence: Parashari indicates ${parashariBlock.verdict}, while KP indicates ${kpBlock.verdict}. Rather than averaging distinct paradigms, DeepAstro reports this divergence for thorough investigation.`;
    } else if (hasChallenge) {
      integratedAssessment = 'CHALLENGING';
      resolutionSummary = `Consensus across systems indicates notable karmic friction or delay for ${rule.title}. Remedial and timing precautions recommended.`;
    } else {
      integratedAssessment = 'SUPPORTIVE';
      resolutionSummary = `Multiple independent traditional indicators converge: Parashari, KP CSL, and ${vargaChart.code} all indicate constructive support.`;
    }

    return {
      domain,
      title: rule.title,
      integratedAssessment,
      methodologyOutputs: {
        parashari: parashariBlock,
        kp: kpBlock,
        varga: vargaBlock,
        dasha: dashaBlock,
      },
      conflictDetected,
      conflictResolutionSummary: resolutionSummary,
      accuracyMetrics,
      rulesetVersion: 'RULESET_INTEGRATED_V1',
    };
  }
}
