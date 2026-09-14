import { describe, it, expect } from 'vitest';
import {
  PredictionClaimExtractor,
  PredictionDiscriminatorEngine,
  PredictionFactCheckEngine,
  PredictionEvidenceValidator,
  PredictionContradictionEngineV2,
  PredictionConfidenceEngineV2,
  PredictionUncertaintyEngine,
  PredictionTimingAccuracyEngine,
  PredictionDirectionAccuracyEngine,
  PredictionMagnitudeEngine,
  PredictionContextAccuracyEngine,
  PredictionUsefulnessEngine,
  PredictionRealityComparisonEngineV2,
  PredictionCalibrationEngineV4,
  PredictionQualityGate,
  PredictionReleaseGate,
  PredictionSuppressionEngine,
} from '../../server/src/intelligence/observatory/index.js';

describe('DEEPASTRO OBSERVATORY — Core Intelligence Engines Suite', () => {
  it('extracts structured PredictionClaim from natural language forecast', () => {
    const claim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_test_1001',
      userId: 'user_astro_77',
      forecastText: 'Career promotion and professional breakthrough expected between March 2027 and July 2027.',
      domain: 'CAREER',
      confidence: 0.72,
    });

    expect(claim.domain).toBe('CAREER');
    expect(claim.direction).toBe('POSITIVE');
    expect(claim.eventType).toBe('CAREER_PROMOTION');
    expect(claim.testability).toBe('TESTABLE');
    expect(claim.isBarnum).toBe(false);
  });

  it('discriminator flags vague Barnum statements and overconfident wording', () => {
    expect(PredictionDiscriminatorEngine.detectBarnumStatement('You may experience changes soon.')).toBe(true);
    expect(PredictionDiscriminatorEngine.detectBarnumStatement('Something important may happen.')).toBe(true);
    expect(PredictionDiscriminatorEngine.detectBarnumStatement('Jupiter in 10th house indicates major career elevation.')).toBe(false);

    expect(PredictionDiscriminatorEngine.detectOverconfidence('You will definitely get promoted in June.')).toBe(true);
    expect(PredictionDiscriminatorEngine.detectOverconfidence('100% guaranteed wealth influx.')).toBe(true);
    expect(PredictionDiscriminatorEngine.detectOverconfidence('Favorable transit window for wealth.')).toBe(false);
  });

  it('fact-check engine distinguishes verified astronomical facts from contradictions', () => {
    const verified = PredictionFactCheckEngine.checkAstronomicalClaim({
      claimId: 'claim_1',
      statement: 'Saturn entered Pisces in early 2025',
      verifiedInEngine: true,
      astronomicalDetails: 'Saturn sidereal long = 340 deg',
    });
    expect(verified.status).toBe('VERIFIED');

    const contradicted = PredictionFactCheckEngine.checkAstronomicalClaim({
      claimId: 'claim_2',
      statement: 'Jupiter is in Aries in 2028',
      verifiedInEngine: false,
      astronomicalDetails: 'Jupiter sidereal long = 120 deg',
    });
    expect(contradicted.status).toBe('CONTRADICTED');
  });

  it('evidence validator implements strict weighted hierarchy', () => {
    const evCalc = PredictionEvidenceValidator.createEvidenceItem({
      category: 'CALCULATION',
      source: 'VSOP87 Core',
      details: 'Precise planetary longitude match',
    });
    expect(evCalc.weight).toBe(1.0);

    const evKnowledge = PredictionEvidenceValidator.createEvidenceItem({
      category: 'VERIFIED_KNOWLEDGE',
      source: 'Brihat Parashara Hora Shastra',
      details: 'Raja Yoga sloka 42',
    });
    expect(evKnowledge.weight).toBe(0.85);

    const evAI = PredictionEvidenceValidator.createEvidenceItem({
      category: 'AI_INFERENCE',
      source: 'Z53 Flash Synthesis',
      details: 'Inferred career transition',
    });
    expect(evAI.weight).toBe(0.3);

    const evalResult = PredictionEvidenceValidator.evaluateEvidenceSet([evCalc, evKnowledge, evAI]);
    expect(evalResult.hasDeterministicCalculation).toBe(true);
    expect(evalResult.hasVerifiedKnowledge).toBe(true);
    expect(evalResult.compositeScore).toBeGreaterThan(0.6);
  });

  it('contradiction engine penalizes confidence when conflicting signals exist', () => {
    const analysis = PredictionContradictionEngineV2.analyzeContradictions({
      rawConfidence: 0.85,
      supportingSignals: ['10th lord exalted', 'Vimshottari Jupiter Mahadasha'],
      contradictingSignals: ['Saturn 8th house transit affliction', 'Conflicting Jaimini Dasha period'],
    });

    expect(analysis.contradictingCount).toBe(2);
    expect(analysis.severityPenalty).toBeGreaterThan(0.2);
    expect(analysis.adjustedConfidence).toBeLessThan(0.85);
  });

  it('evaluates timing accuracy with precision scores and window deviation', () => {
    const inWindow = PredictionTimingAccuracyEngine.evaluateTiming({
      windowStart: '2027-03-01T00:00:00Z',
      windowEnd: '2027-07-31T00:00:00Z',
      observedDate: '2027-04-15T00:00:00Z',
    });
    expect(inWindow.insideWindow).toBe(true);
    expect(inWindow.deviationDays).toBe(0);

    const outWindow = PredictionTimingAccuracyEngine.evaluateTiming({
      windowStart: '2027-03-01T00:00:00Z',
      windowEnd: '2027-07-31T00:00:00Z',
      observedDate: '2027-09-15T00:00:00Z',
    });
    expect(outWindow.insideWindow).toBe(false);
    expect(outWindow.deviationDays).toBeGreaterThan(40);
  });

  it('calibration engine V4 computes Brier score, ECE, and enforces minimum sample size', () => {
    const smallSample = PredictionCalibrationEngineV4.evaluateCalibration([
      { predictionId: 'p1', predictedConfidence: 0.8, outcomeScore: 1.0 },
    ]);
    expect(smallSample.status).toBe('INSUFFICIENT_SAMPLE_SIZE');

    const validSamples = [
      { predictionId: 'p1', predictedConfidence: 0.8, outcomeScore: 1.0 },
      { predictionId: 'p2', predictedConfidence: 0.7, outcomeScore: 1.0 },
      { predictionId: 'p3', predictedConfidence: 0.6, outcomeScore: 0.5 },
      { predictionId: 'p4', predictedConfidence: 0.3, outcomeScore: 0.0 },
      { predictionId: 'p5', predictedConfidence: 0.2, outcomeScore: 0.0 },
    ];
    const calib = PredictionCalibrationEngineV4.evaluateCalibration(validSamples, 5);
    expect(calib.status).toBe('WELL_CALIBRATED');
    expect(calib.brierScore).toBeLessThan(0.1);
    expect(calib.buckets.length).toBe(10);
  });

  it('release gate suppresses unsupported predictions and softens overconfident claims', () => {
    const unsupportedClaim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_unsupported',
      userId: 'user_1',
      forecastText: 'Major wealth gain coming soon.',
      evidenceIds: [],
    });
    const decision = PredictionReleaseGate.evaluateRelease(unsupportedClaim);
    expect(decision.decision).toBe('SUPPRESS');

    const overconfidentClaim = PredictionClaimExtractor.extractFromForecast({
      predictionId: 'pred_overconf',
      userId: 'user_1',
      forecastText: 'You will definitely win the election in 2028 with 100% guarantee.',
      evidenceIds: ['ev_1', 'ev_2'],
      confidence: 0.75,
    });
    const decisionOverconf = PredictionReleaseGate.evaluateRelease(overconfidentClaim);
    expect(decisionOverconf.decision === 'SOFTEN' || decisionOverconf.decision === 'RELEASE_WITH_UNCERTAINTY').toBe(true);
  });
});
