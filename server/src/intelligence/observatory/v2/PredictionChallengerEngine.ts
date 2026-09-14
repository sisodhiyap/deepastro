/**
 * DeepAstro Observatory V2.0 - Prediction Challenger Engine
 * 15-question adversarial challenge framework. Every significant prediction
 * is challenged before release to detect weaknesses, biases, and unsupported claims.
 */
import {
  PredictionChallengeResult, ChallengeRecommendation, BiasFlagType
} from './ObservatoryV2Types.js';

export class PredictionChallengerEngine {
  private static readonly BARNUM_PHRASES = [
    'something important', 'change is coming', 'life will improve',
    'opportunities await', 'challenges may arise', 'significant events',
    'you will experience', 'things will change', 'a period of growth',
  ];

  private static readonly OVERCONFIDENT_PHRASES = [
    'definitely', 'guaranteed', '100%', 'certainly will', 'without doubt',
    'absolutely', 'will definitely', 'surely', 'without fail',
  ];

  public static challenge(params: {
    predictionId: string;
    forecastText: string;
    evidenceCount: number;
    contradictionCount: number;
    confidence: number;
    hasTimeWindow: boolean;
    hasDomain: boolean;
    hasDirection: boolean;
  }): PredictionChallengeResult {
    const {
      predictionId, forecastText, evidenceCount, contradictionCount,
      confidence, hasTimeWindow, hasDomain, hasDirection
    } = params;

    const text = forecastText.toLowerCase();
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const supportingEvidence: string[] = [];
    const contradictoryEvidence: string[] = [];
    const assumptions: string[] = [];
    const alternativeInterpretations: string[] = [];
    const falsificationConditions: string[] = [];
    const biasFlags: BiasFlagType[] = [];

    // Q1: What evidence supports this?
    if (evidenceCount >= 3) strengths.push(`${evidenceCount} supporting evidence signals found`);
    else weaknesses.push(`Only ${evidenceCount} evidence signal(s) â€” weak foundation`);

    // Q2: What evidence contradicts it?
    if (contradictionCount > 0) {
      contradictoryEvidence.push(`${contradictionCount} contradictory signal(s) detected`);
      weaknesses.push('Contradictory evidence present â€” confidence should be reduced');
    } else {
      strengths.push('No direct contradictions detected');
    }

    // Q3: What assumptions are being made?
    assumptions.push('Assumes current dasha lord operates at its typical significations');
    assumptions.push('Assumes transiting planets manifest at median historical strength');
    if (!hasTimeWindow) assumptions.push('No explicit timing window â€” timing assumption implicit');

    // Q4: Is the prediction testable?
    if (!hasTimeWindow || !hasDomain) {
      weaknesses.push('Missing time window or domain â€” reduces testability');
    } else {
      strengths.push('Contains time window and domain â€” testable prediction');
    }

    // Q5: Is timing meaningful?
    if (!hasTimeWindow) weaknesses.push('No explicit timing window provided');
    else falsificationConditions.push('If event does not occur within stated window, prediction fails');

    // Q6: Is wording too broad?
    const isBroad = this.BARNUM_PHRASES.some(p => text.includes(p));
    if (isBroad) {
      biasFlags.push('BARNUM_STATEMENT');
      weaknesses.push('Wording is too broad â€” could apply to almost anyone');
    }

    // Q7: Could this be a Barnum statement?
    if (isBroad) biasFlags.push('UNIVERSAL_APPLICABILITY');

    // Q8: Could this be confirmation bias?
    if (evidenceCount < 2 && confidence > 0.7) {
      biasFlags.push('CONFIRMATION_BIAS');
      weaknesses.push('High confidence with little evidence â€” potential confirmation bias');
    }

    // Q9: Could this be post-hoc reasoning?
    // (Detected at outcome stage by PostHocDetectionEngine)
    assumptions.push('Assumes forecast interpretation was not influenced by known outcomes');

    // Q10: Universal applicability check
    const universalCount = this.BARNUM_PHRASES.filter(p => text.includes(p)).length;
    if (universalCount >= 2) weaknesses.push('Multiple universal-applicability phrases detected');

    // Q11: What evidence would disprove this?
    falsificationConditions.push('If event does not occur in stated domain within window â†’ CONTRADICTED');
    falsificationConditions.push('If direction is opposite to predicted â†’ CONTRADICTED');
    if (!hasDomain) falsificationConditions.push('Without domain specification, falsification is difficult');

    // Q12: Alternative interpretations?
    alternativeInterpretations.push('Current dasha may indicate internal/psychological change rather than external event');
    alternativeInterpretations.push('Transit strength may manifest at sub-threshold level');
    if (!hasDirection) alternativeInterpretations.push('Without direction, both positive and challenging outcomes match');

    // Q13: Is confidence justified?
    let confidenceCritique = '';
    if (confidence > 0.85 && evidenceCount < 3) {
      biasFlags.push('OVERCONFIDENCE');
      weaknesses.push('Confidence exceeds evidence base');
      confidenceCritique = `Stated confidence ${Math.round(confidence * 100)}% appears inflated given only ${evidenceCount} evidence signal(s)`;
    } else if (confidence >= 0.5 && evidenceCount >= 3) {
      confidenceCritique = `Confidence ${Math.round(confidence * 100)}% is proportionate to evidence base`;
      strengths.push('Confidence is proportionate to evidence');
    } else {
      confidenceCritique = `Confidence ${Math.round(confidence * 100)}% should be verified against calibration data`;
    }

    // Q14: Is there sufficient independent signal?
    const overconfidentWording = this.OVERCONFIDENT_PHRASES.some(p => text.includes(p));
    if (overconfidentWording) {
      biasFlags.push('OVERCONFIDENCE');
      weaknesses.push('Overconfident language detected ("definitely", "guaranteed", etc.)');
    }

    // Q15: Is the forecast unnecessarily deterministic?
    if (confidence > 0.9) {
      weaknesses.push('Forecast is unnecessarily deterministic for an inherently uncertain domain');
      biasFlags.push('OVERCONFIDENCE');
    }

    // Compute testability score
    let testabilityScore = 0.5;
    if (hasTimeWindow) testabilityScore += 0.2;
    if (hasDomain) testabilityScore += 0.15;
    if (hasDirection) testabilityScore += 0.1;
    if (isBroad) testabilityScore -= 0.3;
    if (universalCount >= 2) testabilityScore -= 0.15;
    testabilityScore = Math.max(0, Math.min(1, testabilityScore));

    // Recommendation
    let recommendation: ChallengeRecommendation;
    const criticalBiases = biasFlags.filter(f => f === 'BARNUM_STATEMENT' || f === 'OVERCONFIDENCE');
    if (contradictionCount >= 3 || (contradictionCount > 0 && contradictionCount >= evidenceCount)) {
      recommendation = contradictionCount > evidenceCount ? 'SUPPRESS' : 'SOFTEN';
    } else if (evidenceCount === 0) {
      recommendation = 'SUPPRESS';
    } else if (weaknesses.length >= 4 || universalCount >= 2) {
      recommendation = 'SUPPRESS';
    } else if (criticalBiases.length >= 2 || (confidence > 0.85 && evidenceCount < 2)) {
      recommendation = 'SOFTEN';
    } else if (!hasTimeWindow || !hasDomain) {
      recommendation = 'REQUEST_CONTEXT';
    } else {
      recommendation = 'PASS';
    }

    const overallRisk: PredictionChallengeResult['overallRisk'] =
      recommendation === 'SUPPRESS' ? 'CRITICAL' :
      recommendation === 'SOFTEN' ? 'HIGH' :
      recommendation === 'REQUEST_CONTEXT' ? 'MEDIUM' : 'LOW';

    return {
      predictionId, challengedAt: new Date().toISOString(),
      strengths, weaknesses, supportingEvidence, contradictoryEvidence,
      assumptions, alternativeInterpretations, falsificationConditions,
      biasFlags: [...new Set(biasFlags)], testabilityScore,
      confidenceCritique, recommendation, overallRisk,
    };
  }
}
