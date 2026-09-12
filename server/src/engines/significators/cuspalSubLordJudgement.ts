/**
 * KP Cuspal Sub-Lord (CSL) Judgement Engine
 * Implements evaluateHousePromise() to assess the promise of any house/matter.
 * Evaluates the CSL's star lord and significations against supporting and challenging houses.
 */

import { PlanetSignificators } from './fourLevelSignificators.js';

export type PromiseStatus = 'PROMISED' | 'FAVORABLE' | 'DELAYED' | 'DENIED' | 'MIXED';

export interface CSLJudgementResult {
  targetHouse: number;
  cuspSubLord: string;
  status: PromiseStatus;
  confidence: number; // Internal calculation consistency (0.0 - 1.0)
  supportingHousesSignified: number[];
  challengingHousesSignified: number[];
  supportingHousesConfigured: number[];
  challengingHousesConfigured: number[];
  evidence: string[];
}

export class CuspalSubLordJudgementEngine {
  /**
   * Evaluates the promise of a house based on its Cuspal Sub-Lord
   */
  public static evaluateHousePromise(params: {
    targetHouse: number;
    cuspSubLord: string;
    significators: Record<string, PlanetSignificators>;
    supportingHouses: number[];
    challengingHouses: number[];
    methodology?: 'KP_STANDARD' | 'KP_STRICT';
  }): CSLJudgementResult {
    const {
      targetHouse,
      cuspSubLord,
      significators,
      supportingHouses,
      challengingHouses,
      methodology = 'KP_STANDARD',
    } = params;

    const subLordSig = significators[cuspSubLord];
    const evidence: string[] = [];

    if (!subLordSig) {
      return {
        targetHouse,
        cuspSubLord,
        status: 'MIXED',
        confidence: 0.5,
        supportingHousesSignified: [],
        challengingHousesSignified: [],
        supportingHousesConfigured: supportingHouses,
        challengingHousesConfigured: challengingHouses,
        evidence: [`Cuspal Sub-Lord ${cuspSubLord} data not available in planetary significators.`],
      };
    }

    // Check which supporting houses are signified by the CSL
    const supportingSignified = supportingHouses.filter((h) => subLordSig.allHouses.includes(h));
    // Check which challenging houses are signified by the CSL
    const challengingSignified = challengingHouses.filter((h) => subLordSig.allHouses.includes(h));

    evidence.push(
      `Cusp ${targetHouse} Sub-Lord is ${cuspSubLord}.`,
      `${cuspSubLord} signifies houses: [${subLordSig.allHouses.join(', ')}].`
    );

    if (supportingSignified.length > 0) {
      evidence.push(`Supports target matter through signified houses: [${supportingSignified.join(', ')}].`);
    }
    if (challengingSignified.length > 0) {
      evidence.push(`Presents friction/delay through signified challenging houses: [${challengingSignified.join(', ')}].`);
    }

    // Determine Status & Confidence
    let status: PromiseStatus = 'MIXED';
    let confidence = 0.6;

    const supportCount = supportingSignified.length;
    const challengeCount = challengingSignified.length;

    if (supportCount >= 2 && challengeCount === 0) {
      status = 'PROMISED';
      confidence = 0.92;
      evidence.push(`Verdict: Matter is strongly promised with zero detrimental house connections.`);
    } else if (supportCount >= 1 && challengeCount === 0) {
      status = 'FAVORABLE';
      confidence = 0.82;
      evidence.push(`Verdict: Favorable promise supported by key significators.`);
    } else if (supportCount >= 1 && challengeCount >= 1) {
      status = supportCount > challengeCount ? 'DELAYED' : 'MIXED';
      confidence = 0.72;
      evidence.push(
        status === 'DELAYED'
          ? `Verdict: Matter is promised but subject to delay/testing due to challenging significators.`
          : `Verdict: Mixed indications with balanced supportive and challenging factors.`
      );
    } else if (supportCount === 0 && challengeCount >= 1) {
      status = 'DENIED';
      confidence = 0.85;
      evidence.push(`Verdict: Challenged/Denied by classical KP rules due to dominant adverse house significations.`);
    } else {
      status = 'MIXED';
      confidence = 0.55;
      evidence.push(`Verdict: Neutral/insufficient direct cusp connection for this matter.`);
    }

    return {
      targetHouse,
      cuspSubLord,
      status,
      confidence,
      supportingHousesSignified: supportingSignified,
      challengingHousesSignified: challengingSignified,
      supportingHousesConfigured: supportingHouses,
      challengingHousesConfigured: challengingHouses,
      evidence,
    };
  }
}
