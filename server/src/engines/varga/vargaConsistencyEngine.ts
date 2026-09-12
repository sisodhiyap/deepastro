/**
 * Varga Consistency Engine
 * Cross-validates multiple astrological perspectives (D1 + Varga + KP + Dasha)
 * to build an integrated evidence stack across critical life domains.
 */

import { SingleVargaChart } from './shodashavargaEngine.js';
import { EventPromiseEvaluation } from '../eventPrediction/kpEventPromiseEngine.js';
import { LifeEventDomain } from '../eventPrediction/eventRulesRegistry.js';

export interface MethodEvidenceItem {
  methodology: 'PARASHARI_D1' | 'VARGA' | 'KP_STELLAR' | 'DASHA' | 'TRANSIT';
  verdict: 'SUPPORTIVE' | 'CHALLENGING' | 'NEUTRAL' | 'MIXED';
  keyFactors: string[];
  summary: string;
}

export interface DomainConsistencyReport {
  domain: LifeEventDomain;
  title: string;
  overallConsensus: 'HIGH_AGREEMENT' | 'MODERATE_AGREEMENT' | 'DIVERGENT' | 'MIXED';
  stack: MethodEvidenceItem[];
  integratedConclusion: string;
}

export class VargaConsistencyEngine {
  /**
   * Compares D1, Varga, KP, and Dasha signals for a specific domain
   */
  public static evaluateConsistency(params: {
    domain: LifeEventDomain;
    kpPromise: EventPromiseEvaluation;
    vargaChart: SingleVargaChart;
    dashaSummary?: string;
  }): DomainConsistencyReport {
    const { domain, kpPromise, vargaChart, dashaSummary } = params;

    const stack: MethodEvidenceItem[] = [];

    // 1. KP Perspective
    stack.push({
      methodology: 'KP_STELLAR',
      verdict:
        kpPromise.status === 'PROMISED' || kpPromise.status === 'FAVORABLE'
          ? 'SUPPORTIVE'
          : kpPromise.status === 'DENIED'
          ? 'CHALLENGING'
          : 'MIXED',
      keyFactors: [
        `Cusp ${kpPromise.primaryCusp} Sub-Lord: ${kpPromise.cuspSubLord}`,
        `Signified houses: [${kpPromise.supportingHousesSignified.join(', ')}]`,
      ],
      summary: `KP Cuspal Sub-Lord judgement indicates ${kpPromise.status}.`,
    });

    // 2. Varga Perspective (D9 for Marriage, D10 for Career, D4 for Property, D7 for Children, etc.)
    const relevantHouse = domain === 'MARRIAGE' ? 7 : domain === 'CAREER' ? 10 : domain === 'CHILDREN' ? 5 : 4;
    const vargaPlanetsInHouse = vargaChart.planets.filter((p) => p.houseInVarga === relevantHouse).map((p) => p.planet);

    stack.push({
      methodology: 'VARGA',
      verdict: vargaPlanetsInHouse.length > 0 ? 'SUPPORTIVE' : 'NEUTRAL',
      keyFactors: [
        `${vargaChart.code} Lagna: ${vargaChart.ascendantSignName}`,
        `${vargaChart.code} H${relevantHouse} Occupants: ${vargaPlanetsInHouse.length > 0 ? vargaPlanetsInHouse.join(', ') : 'Unoccupied'}`,
      ],
      summary: `${vargaChart.code} provides foundational structural confirmation for ${domain.toLowerCase()} indicators.`,
    });

    // 3. Dasha Perspective
    if (dashaSummary) {
      stack.push({
        methodology: 'DASHA',
        verdict: 'SUPPORTIVE',
        keyFactors: [dashaSummary],
        summary: `Vimshottari Dasha period facilitates activation.`,
      });
    }

    // Determine consensus
    const verdicts = stack.map((s) => s.verdict);
    const supportiveCount = verdicts.filter((v) => v === 'SUPPORTIVE').length;
    const challengingCount = verdicts.filter((v) => v === 'CHALLENGING').length;

    let consensus: DomainConsistencyReport['overallConsensus'] = 'MODERATE_AGREEMENT';
    let conclusion = '';

    if (supportiveCount === stack.length) {
      consensus = 'HIGH_AGREEMENT';
      conclusion = `Multiple independent traditional indicators (KP Cuspal Sub-Lord, ${vargaChart.code} divisional chart, and Dasha) converge in strong mutual support.`;
    } else if (challengingCount > 0 && supportiveCount > 0) {
      consensus = 'DIVERGENT';
      conclusion = `Indicators diverge: KP indicates ${kpPromise.status}, while divisional factors show alternate dynamics. Investigate specific sub-period factors.`;
    } else {
      consensus = 'MIXED';
      conclusion = `Balanced indicators across systems; timing depends heavily on operational Antardashas.`;
    }

    return {
      domain,
      title: kpPromise.title,
      overallConsensus: consensus,
      stack,
      integratedConclusion: conclusion,
    };
  }
}
