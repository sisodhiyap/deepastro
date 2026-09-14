/**
 * DeepAstro Prediction Discriminator Engine
 * Distinguishes testable, falsifiable predictions from vague, non-falsifiable Barnum statements.
 * Prevents vague claims from artificially gaming accuracy metrics.
 */

import { ClaimTestability } from './ObservatoryTypes.js';

export class PredictionDiscriminatorEngine {
  private static readonly BARNUM_PATTERNS = [
    /you may experience changes/i,
    /something important may happen/i,
    /your life could improve/i,
    /you may meet someone/i,
    /opportunities will come your way/i,
    /expect the unexpected/i,
    /transitions are possible/i,
    /energy is shifting/i,
    /trust your intuition/i,
  ];

  private static readonly OVERCONFIDENCE_PATTERNS = [
    /\bdefinitely\b/i,
    /\bcertain\b/i,
    /\bguaranteed\b/i,
    /\bwill happen\b/i,
    /\b100%\b/i,
    /\bno doubt\b/i,
    /\bimpossible to fail\b/i,
  ];

  public static detectBarnumStatement(text: string): boolean {
    if (!text || text.trim().length === 0) return true;
    return this.BARNUM_PATTERNS.some((pattern) => pattern.test(text));
  }

  public static detectOverconfidence(text: string): boolean {
    if (!text) return false;
    return this.OVERCONFIDENCE_PATTERNS.some((pattern) => pattern.test(text));
  }

  public static classifyTestability(params: {
    claimText: string;
    hasTimeWindow: boolean;
    isBarnum: boolean;
    hasContradiction?: boolean;
    hasEvidence?: boolean;
  }): ClaimTestability {
    const { claimText, hasTimeWindow, isBarnum, hasContradiction, hasEvidence = true } = params;

    if (!hasEvidence) return 'UNSUPPORTED';
    if (hasContradiction) return 'CONTRADICTORY';
    if (isBarnum) return 'VAGUE';
    if (!hasTimeWindow) return 'NON_FALSIFIABLE';

    const words = claimText.trim().split(/\s+/);
    if (words.length < 4) return 'VAGUE';

    const hasSpecificDomain = /(career|business|finance|relationship|health|marriage|relocation|wealth|promotion|professional)/i.test(claimText);
    const hasDirectionalAction = /(expand|breakthrough|growth|elevation|contract|shift|promote|promotion|acquire|relocate|launch|settle|conclude|accelerate|gain|progress)/i.test(claimText);

    if (hasSpecificDomain && hasDirectionalAction && hasTimeWindow) {
      return 'TESTABLE';
    }

    return 'PARTIALLY_TESTABLE';
  }
}
