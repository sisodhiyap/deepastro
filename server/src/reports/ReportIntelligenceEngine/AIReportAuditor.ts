/**
 * AI Report Auditor
 * Validates AI interpretation candidates against the authoritative FactLedger.
 * Enforces zero hallucinations, zero medical diagnosis, zero guaranteed outcomes,
 * and eliminates raw LLM reasoning tags (<think>).
 */

import { FactLedger } from './FactLedger.js';

export interface AuditCheckResult {
  isApproved: boolean;
  sanitizedText: string;
  violations: string[];
}

export class AIReportAuditor {
  private static FORBIDDEN_PATTERNS = [
    { regex: /<think>[\s\S]*?<\/think>/gi, reason: 'Raw LLM internal reasoning tag detected' },
    { regex: /guaranteed (returns|profit|wealth|outcome|success)/i, reason: 'Guaranteed financial claim' },
    { regex: /diagnosed with|you will develop (cancer|disease|diabetes)/i, reason: 'Medical diagnosis claim' },
    { regex: /will definitely (die|divorce|perish|go bankrupt)/i, reason: 'Fatalistic prediction claim' },
    { regex: /stop (medication|doctor|treatment)/i, reason: 'Medical interference' },
  ];

  public static auditInterpretation(
    text: string,
    ledger: FactLedger,
    allowedPlanets: string[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
  ): AuditCheckResult {
    const violations: string[] = [];
    let sanitizedText = text;

    // 1. Strip and detect any raw reasoning tags
    if (/<think>/i.test(sanitizedText)) {
      violations.push('Raw <think> tags found in AI output.');
      sanitizedText = sanitizedText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    // 2. Safety and fatalism regex scan
    for (const rule of this.FORBIDDEN_PATTERNS) {
      if (rule.regex.test(sanitizedText)) {
        violations.push(rule.reason);
      }
    }

    // 3. Astronomical Fact Ledger Cross-Check
    // If AI mentions Lagna, it must match the verified Lagna in the ledger
    const verifiedLagna = ledger.getFactValue<string>('astronomy.lagnaSign');
    if (verifiedLagna) {
      const wrongLagnaMatch = sanitizedText.match(/ascendant is in (Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/i);
      if (wrongLagnaMatch && wrongLagnaMatch[1].toLowerCase() !== verifiedLagna.toLowerCase()) {
        violations.push(`AI hallucinated Ascendant sign '${wrongLagnaMatch[1]}' (Verified Lagna is '${verifiedLagna}').`);
      }
    }

    // If AI mentions Moon sign, it must match verified Moon sign
    const verifiedMoon = ledger.getFactValue<string>('astronomy.moonSign');
    if (verifiedMoon) {
      const wrongMoonMatch = sanitizedText.match(/Moon is in (Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/i);
      if (wrongMoonMatch && wrongMoonMatch[1].toLowerCase() !== verifiedMoon.toLowerCase()) {
        violations.push(`AI hallucinated Moon sign '${wrongMoonMatch[1]}' (Verified Moon is '${verifiedMoon}').`);
      }
    }

    return {
      isApproved: violations.length === 0,
      sanitizedText,
      violations,
    };
  }
}
