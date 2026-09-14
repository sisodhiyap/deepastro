/**
 * DeepAstro Observatory V2.0 - Falsifiability Engine
 * Determines whether a prediction can actually be tested against reality.
 * Rejects meaningless predictions: "Something important will happen."
 */
import { FalsifiabilityLevel, FalsifiabilityResult } from './ObservatoryV2Types.js';

export class PredictionFalsifiabilityEngine {
  private static readonly MEANINGLESS_PATTERNS = [
    /^something (important|significant|big) will happen/i,
    /^change is coming/i,
    /^(your )?life will (improve|get better|change)/i,
    /^(great )?opportunities await/i,
    /^challenges may arise/i,
    /^a period of (growth|change|transition)/i,
    /^things will (change|improve|get better)/i,
  ];

  public static evaluate(params: {
    predictionId: string;
    forecastText: string;
    domain?: string;
    eventDescription?: string;
    direction?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
    magnitude?: string;
    contextDescription?: string;
  }): FalsifiabilityResult {
    const {
      predictionId, forecastText, domain, eventDescription,
      direction, timeWindowStart, timeWindowEnd, magnitude, contextDescription
    } = params;

    const hasDomain = !!(domain && domain !== 'GENERAL' && domain !== 'OTHER');
    const hasEvent = !!(eventDescription && eventDescription.trim().length > 10);
    const hasDirection = !!(direction && ['POSITIVE', 'CHALLENGING', 'NEUTRAL'].includes(direction));
    const hasTimeWindow = !!(timeWindowStart && timeWindowEnd);
    const hasMagnitude = !!(magnitude && ['SUBTLE', 'MODERATE', 'SIGNIFICANT', 'TRANSFORMATIVE'].includes(magnitude));
    const hasContext = !!(contextDescription && contextDescription.trim().length > 5);

    const isMeaningless = this.MEANINGLESS_PATTERNS.some(p => p.test(forecastText.trim()));

    const missingComponents: string[] = [];
    if (!hasDomain) missingComponents.push('DOMAIN');
    if (!hasEvent) missingComponents.push('EVENT');
    if (!hasDirection) missingComponents.push('DIRECTION');
    if (!hasTimeWindow) missingComponents.push('TIME_WINDOW');
    if (!hasMagnitude) missingComponents.push('MAGNITUDE');
    if (!hasContext) missingComponents.push('CONTEXT');

    let score = 0;
    if (hasDomain) score += 0.2;
    if (hasEvent) score += 0.25;
    if (hasDirection) score += 0.15;
    if (hasTimeWindow) score += 0.25;
    if (hasMagnitude) score += 0.1;
    if (hasContext) score += 0.05;
    if (isMeaningless) score = Math.min(score, 0.1);

    let level: FalsifiabilityLevel;
    if (isMeaningless || score < 0.3) level = 'NO';
    else if (score < 0.65 || missingComponents.length >= 3) level = 'PARTIAL';
    else level = 'YES';

    let reason = '';
    if (isMeaningless) reason = 'Prediction matches meaningless/universal pattern â€” untestable as stated';
    else if (level === 'YES') reason = 'Prediction contains sufficient specificity to be tested';
    else if (level === 'PARTIAL') reason = `Missing components reduce testability: ${missingComponents.join(', ')}`;
    else reason = `Insufficient specificity (score: ${score.toFixed(2)}), missing: ${missingComponents.join(', ')}`;

    return {
      predictionId, level, hasDomain, hasEvent, hasDirection,
      hasTimeWindow, hasMagnitude, hasContext, missingComponents, reason, score,
    };
  }
}
