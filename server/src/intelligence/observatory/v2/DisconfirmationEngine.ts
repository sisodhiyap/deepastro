/**
 * DeepAstro Observatory V2.0 - Disconfirmation Engine
 * The system must actively search for evidence that DeepAstro is WRONG.
 * INVARIANT: A healthy system must NOT have zero challenges.
 * Tracks DISCONFIRMATION_RATE.
 */
import { DisconfirmationMetrics } from './ObservatoryV2Types.js';

export class DisconfirmationEngine {
  private static totalChallenged = 0;
  private static weaknessesFound = 0;
  private static softened = 0;
  private static suppressed = 0;
  private static contradicted = 0;

  public static recordChallenge(params: {
    hadWeakness: boolean;
    wasSoftened: boolean;
    wasSuppressed: boolean;
    wasContradicted: boolean;
  }): void {
    this.totalChallenged++;
    if (params.hadWeakness) this.weaknessesFound++;
    if (params.wasSoftened) this.softened++;
    if (params.wasSuppressed) this.suppressed++;
    if (params.wasContradicted) this.contradicted++;
  }

  public static getMetrics(): DisconfirmationMetrics {
    const total = Math.max(1, this.totalChallenged);
    const disconfirmationRate = this.weaknessesFound / total;

    let healthStatus: DisconfirmationMetrics['healthStatus'];
    if (disconfirmationRate < 0.02 && total >= 10) healthStatus = 'SUSPICIOUSLY_CLEAN';
    else if (disconfirmationRate > 0.6) healthStatus = 'OVER_CHALLENGED';
    else healthStatus = 'HEALTHY';

    return {
      totalChallenged: this.totalChallenged,
      weaknessesFound: this.weaknessesFound,
      softened: this.softened,
      suppressed: this.suppressed,
      contradicted: this.contradicted,
      disconfirmationRate: +disconfirmationRate.toFixed(4),
      healthStatus, computedAt: new Date().toISOString(),
    };
  }

  public static reset(): void {
    this.totalChallenged = 0;
    this.weaknessesFound = 0;
    this.softened = 0;
    this.suppressed = 0;
    this.contradicted = 0;
  }
}
