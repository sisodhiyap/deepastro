/**
 * KP Event Promise Engine
 * Evaluates the natal promise of major life events using Cuspal Sub-Lord analysis
 * and 4-Level planetary significators.
 */

import { KPCuspItem } from '../kp/kpCuspEngine.js';
import { PlanetSignificators } from '../significators/fourLevelSignificators.js';
import {
  CuspalSubLordJudgementEngine,
  CSLJudgementResult,
  PromiseStatus,
} from '../significators/cuspalSubLordJudgement.js';
import {
  EventRulesRegistry,
  LifeEventDomain,
  EventRuleDefinition,
} from './eventRulesRegistry.js';

export interface EventPromiseEvaluation {
  domain: LifeEventDomain;
  title: string;
  primaryCusp: number;
  cuspSubLord: string;
  subSubLord: string;
  status: PromiseStatus;
  strengthScore: number; // 0 to 100
  confidence: number;
  supportingHousesSignified: number[];
  challengingHousesSignified: number[];
  evidence: string[];
  traditionalBasis: string;
}

export class KPEventPromiseEngine {
  /**
   * Evaluates the promise for a specific life event domain
   */
  public static evaluateDomain(params: {
    domain: LifeEventDomain;
    cusps: KPCuspItem[];
    significators: Record<string, PlanetSignificators>;
  }): EventPromiseEvaluation {
    const { domain, cusps, significators } = params;
    const rule = EventRulesRegistry.getRule(domain);

    const targetCusp = cusps.find((c) => c.cusp === rule.primaryCusp);
    if (!targetCusp) {
      throw new Error(`KP_EVENT_EVAL_ERROR: Cusp ${rule.primaryCusp} not found for domain ${domain}`);
    }

    const judgement = CuspalSubLordJudgementEngine.evaluateHousePromise({
      targetHouse: rule.primaryCusp,
      cuspSubLord: targetCusp.subLord,
      significators,
      supportingHouses: rule.supportingHouses,
      challengingHouses: rule.challengingHouses,
    });

    let strengthScore = 50;
    if (judgement.status === 'PROMISED') strengthScore = 90 + Math.min(10, judgement.supportingHousesSignified.length * 3);
    else if (judgement.status === 'FAVORABLE') strengthScore = 75 + Math.min(10, judgement.supportingHousesSignified.length * 3);
    else if (judgement.status === 'DELAYED') strengthScore = 55;
    else if (judgement.status === 'MIXED') strengthScore = 48;
    else if (judgement.status === 'DENIED') strengthScore = 20;

    return {
      domain,
      title: rule.title,
      primaryCusp: rule.primaryCusp,
      cuspSubLord: targetCusp.subLord,
      subSubLord: targetCusp.subSubLord,
      status: judgement.status,
      strengthScore,
      confidence: judgement.confidence,
      supportingHousesSignified: judgement.supportingHousesSignified,
      challengingHousesSignified: judgement.challengingHousesSignified,
      evidence: judgement.evidence,
      traditionalBasis: rule.traditionalRationale,
    };
  }

  /**
   * Evaluates all standard life events in the registry
   */
  public static evaluateAllEvents(params: {
    cusps: KPCuspItem[];
    significators: Record<string, PlanetSignificators>;
  }): Record<LifeEventDomain, EventPromiseEvaluation> {
    const domains = EventRulesRegistry.listAllDomains();
    const result: Partial<Record<LifeEventDomain, EventPromiseEvaluation>> = {};

    for (const d of domains) {
      result[d] = this.evaluateDomain({
        domain: d,
        cusps: params.cusps,
        significators: params.significators,
      });
    }

    return result as Record<LifeEventDomain, EventPromiseEvaluation>;
  }
}
