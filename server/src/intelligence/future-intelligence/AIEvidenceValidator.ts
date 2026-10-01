/**
 * AIEvidenceValidator.ts
 * Strict auditor that checks any AI-generated narrative against the deterministic calculation evidence.
 * Rejects or flags narratives containing astrological entities not grounded in the verified evidence JSON.
 */

import { PredictionEvidence } from './types.js';

export interface AIAuditResult {
  isValid: boolean;
  ungroundedTerms: string[];
  rejectionReason?: string;
}

const KNOWN_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const KNOWN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];
const KNOWN_VARGAS = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60', 'Navamsha', 'Dashamsha'];

export class AIEvidenceValidator {
  /**
   * Validates that all astrological claims in narrativeText originate from calculated evidence.
   */
  public static validate(
    narrativeText: string,
    evidenceList: PredictionEvidence[]
  ): AIAuditResult {
    if (!narrativeText || narrativeText.trim() === '') {
      return { isValid: false, ungroundedTerms: [], rejectionReason: 'Empty narrative text.' };
    }

    const ungrounded: string[] = [];
    const evidenceString = JSON.stringify(evidenceList).toLowerCase();

    // Check Planets mentioned in text
    for (const p of KNOWN_PLANETS) {
      const regex = new RegExp(`\\b${p}\\b`, 'i');
      if (regex.test(narrativeText)) {
        if (!evidenceString.includes(p.toLowerCase())) {
          ungrounded.push(`Planet: ${p}`);
        }
      }
    }

    // Check Signs mentioned in text
    for (const s of KNOWN_SIGNS) {
      const regex = new RegExp(`\\b${s}\\b`, 'i');
      if (regex.test(narrativeText)) {
        if (!evidenceString.includes(s.toLowerCase())) {
          ungrounded.push(`Zodiac Sign: ${s}`);
        }
      }
    }

    // Check Vargas mentioned in text
    for (const v of KNOWN_VARGAS) {
      const regex = new RegExp(`\\b${v}\\b`, 'i');
      if (regex.test(narrativeText)) {
        if (!evidenceString.includes(v.toLowerCase())) {
          ungrounded.push(`Varga: ${v}`);
        }
      }
    }

    if (ungrounded.length > 0) {
      return {
        isValid: false,
        ungroundedTerms: ungrounded,
        rejectionReason: `AI narrative references ungrounded astrological entities: ${ungrounded.join(', ')}`,
      };
    }

    return { isValid: true, ungroundedTerms: [] };
  }
}
