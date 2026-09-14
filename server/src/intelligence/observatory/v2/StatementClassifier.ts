/**
 * DeepAstro Observatory V2.0 - Statement Classifier
 * Classifies every forecast statement into: FACT, CALCULATION, TRADITIONAL_INTERPRETATION,
 * AI_INFERENCE, SPECULATION, OVERCONFIDENT, or UNKNOWN.
 */
import { StatementClass, ClassifiedStatement } from './ObservatoryV2Types.js';

export class StatementClassifier {
  private static readonly CALCULATION_PATTERNS = [
    /\b(is at|located at|positioned at|degree|degrees?|sign of|in (aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces))\b/i,
    /\b(dasha|antardasha|mahadasha|gochara|transit|ayanamsha|julian|ascendant|lagna)\b/i,
    /\b(\d+Â°|\d+\.\d+Â°|house \d+)\b/i,
  ];
  private static readonly TRADITIONAL_PATTERNS = [
    /\b(traditional(ly)?|classical(ly)?|according to (jyotish|vedic|parashari|brihat|bphs|hora)|classically|shastra|classical text)\b/i,
    /\b(jyotish associates|vedic tradition|classical rule|ancient text|historical interpretation)\b/i,
  ];
  private static readonly OVERCONFIDENT_PATTERNS = [
    /\b(definitely will|guaranteed|100%|without (any )?doubt|absolutely will|certainly will|will definitely|surely happen)\b/i,
  ];
  private static readonly SPECULATION_PATTERNS = [
    /\b(possibly|perhaps|might|could|may|speculate|conjecture|unclear|uncertain|we cannot know)\b/i,
  ];
  private static readonly AI_INFERENCE_PATTERNS = [
    /\b(this may (correspond|suggest|indicate|relate)|analysis suggests|synthesis indicates|model infers|ai assessment|based on (pattern|synthesis))\b/i,
  ];

  public static classify(statementId: string, text: string): ClassifiedStatement {
    // Priority order: CALCULATION > TRADITIONAL > OVERCONFIDENT > AI_INFERENCE > SPECULATION > FACT > UNKNOWN
    let classification: StatementClass = 'UNKNOWN';
    let justification = 'No pattern matched';
    let requiresEvidence = true;

    if (this.CALCULATION_PATTERNS.some(p => p.test(text))) {
      classification = 'CALCULATION';
      justification = 'Contains deterministic ephemeris or astronomical positioning language';
      requiresEvidence = false;
    } else if (this.TRADITIONAL_PATTERNS.some(p => p.test(text))) {
      classification = 'TRADITIONAL_INTERPRETATION';
      justification = 'References classical Jyotish rules or traditional text citations';
      requiresEvidence = true;
    } else if (this.OVERCONFIDENT_PATTERNS.some(p => p.test(text))) {
      classification = 'OVERCONFIDENT';
      justification = 'Uses certainty language unsupported by evidence hierarchy';
      requiresEvidence = true;
    } else if (this.AI_INFERENCE_PATTERNS.some(p => p.test(text))) {
      classification = 'AI_INFERENCE';
      justification = 'Probabilistic AI synthesis of multiple astrological signals';
      requiresEvidence = true;
    } else if (this.SPECULATION_PATTERNS.some(p => p.test(text))) {
      classification = 'SPECULATION';
      justification = 'Hedged or uncertain language indicating speculative content';
      requiresEvidence = true;
    } else if (text.length > 0) {
      classification = 'FACT';
      justification = 'Appears to be a factual claim â€” requires external verification';
      requiresEvidence = true;
    }

    const confidence =
      classification === 'CALCULATION' ? 0.95 :
      classification === 'TRADITIONAL_INTERPRETATION' ? 0.85 :
      classification === 'OVERCONFIDENT' ? 0.90 :
      classification === 'AI_INFERENCE' ? 0.80 :
      classification === 'SPECULATION' ? 0.75 : 0.5;

    return { statementId, text, classification, confidence, justification, requiresEvidence };
  }

  public static classifyAll(statements: Array<{ id: string; text: string }>): ClassifiedStatement[] {
    return statements.map(s => this.classify(s.id, s.text));
  }
}
