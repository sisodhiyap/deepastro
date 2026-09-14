import { describe, it, expect } from 'vitest';
import {
  PredictionClaimExtractor,
  PredictionQualityGate,
  PredictionReleaseGate,
  PredictionAIJudge,
  PredictionCriticEngine,
  PredictionRedTeamEngine,
} from '../../server/src/intelligence/observatory/index.js';

describe('DEEPASTRO OBSERVATORY — Golden Cases Suite', () => {
  it('Golden Case 1: High Evidence & Testable Claim -> RELEASE', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_golden_high_evidence',
      userId: 'user_golden',
      forecastText: 'Significant career expansion and promotion window between March 2027 and June 2027.',
      domain: 'CAREER',
      confidence: 0.82,
      evidenceIds: ['ev_d10_exaltation', 'ev_jupiter_transit_10th', 'ev_vimshottari_dasha_favorable'],
    });

    const quality = PredictionQualityGate.evaluateQuality(claim);
    expect(quality.compositeScore).toBeGreaterThan(0.7);

    const release = PredictionReleaseGate.evaluateRelease(claim);
    expect(release.decision).toBe('RELEASE');

    const critique = PredictionAIJudge.evaluate(claim);
    expect(critique.isSupported).toBe(true);
    expect(critique.isTestable).toBe(true);
  });

  it('Golden Case 2: Zero Evidence Claim -> SUPPRESS', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_golden_zero_evidence',
      userId: 'user_golden',
      forecastText: 'Career elevation in 2027.',
      domain: 'CAREER',
      evidenceIds: [],
    });

    const release = PredictionReleaseGate.evaluateRelease(claim);
    expect(release.decision).toBe('SUPPRESS');
    expect(release.userFacingExplanation).toContain('does not have enough evidence');
  });

  it('Golden Case 3: High Contradiction Claim -> Suppressed or Penalized', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_golden_contradiction',
      userId: 'user_golden',
      forecastText: 'Financial breakthrough in late 2027.',
      domain: 'FINANCE',
      evidenceIds: ['ev_venus_2nd'],
      contradictionIds: ['contra_saturn_aspect', 'contra_rahu_conjunction', 'contra_jaimini_maraka'],
    });

    const release = PredictionReleaseGate.evaluateRelease(claim);
    expect(release.decision).toBe('SUPPRESS');
  });

  it('Golden Case 4: Vague / Barnum Claim -> Red Team Downward Revision', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_golden_barnum',
      userId: 'user_golden',
      forecastText: 'You may experience changes and something important may happen.',
      evidenceIds: ['ev_moon_transit'],
    });

    const redTeam = PredictionRedTeamEngine.scan(claim);
    expect(redTeam.passed).toBe(false);
    expect(redTeam.flags).toContain('BARNUM_STATEMENT_DETECTED');
  });

  it('Golden Case 5: Overconfident Language -> Softened / Critic Warning', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_golden_overconfident',
      userId: 'user_golden',
      forecastText: 'You will definitely get married in November 2027 with 100% guarantee.',
      domain: 'RELATIONSHIPS',
      evidenceIds: ['ev_jupiter_7th'],
    });

    const critic = PredictionCriticEngine.review(claim);
    expect(critic.severityRating).toBe('HIGH');
    expect(critic.recommendedSoftenPhrasing).toBeDefined();
  });
});
