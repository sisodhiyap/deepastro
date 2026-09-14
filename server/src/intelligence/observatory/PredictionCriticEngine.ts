/**
 * DeepAstro Prediction Critic Engine
 * Formulates counter-hypotheses and tests whether alternative explanations explain the evidence.
 */

import { PredictionClaim } from './ObservatoryTypes.js';

export interface CriticReview {
  claimId: string;
  counterHypotheses: string[];
  vulnerabilityAreas: string[];
  severityRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedSoftenPhrasing?: string;
}

export class PredictionCriticEngine {
  public static review(claim: PredictionClaim): CriticReview {
    const counterHypotheses: string[] = [];
    const vulnerabilities: string[] = [];

    if (claim.direction === 'POSITIVE') {
      counterHypotheses.push(`Saturn or Rahu transit friction could delay or transform expected ${claim.domain} growth.`);
    } else {
      counterHypotheses.push(`Jupiterian benefic aspect from 9th house may alleviate anticipated ${claim.domain} stress.`);
    }

    if (claim.isOverconfident) {
      vulnerabilities.push('Absolute wording invites falsification failure on minor timing shifts.');
    }

    if (claim.isBarnum) {
      vulnerabilities.push('General psychological validation without verifiable empirical anchor.');
    }

    let severityRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (claim.isBarnum && claim.isOverconfident) severityRating = 'CRITICAL';
    else if (claim.isOverconfident || claim.contradictionIds.length > 2) severityRating = 'HIGH';
    else if (claim.contradictionIds.length > 0) severityRating = 'MEDIUM';

    let recommendedSoftenPhrasing: string | undefined;
    if (claim.isOverconfident) {
      recommendedSoftenPhrasing = `Indications suggest a favorable window for ${claim.domain}, though personal effort and concurrent transits remain critical.`;
    }

    return {
      claimId: claim.claimId,
      counterHypotheses,
      vulnerabilityAreas: vulnerabilities,
      severityRating,
      recommendedSoftenPhrasing,
    };
  }
}
