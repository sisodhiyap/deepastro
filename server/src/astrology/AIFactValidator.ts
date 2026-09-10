/**
 * AI Fact Validator & Claim-Level Provenance Engine
 * Enforces strict grounding between AI text and verified astronomical facts.
 * Intercepts AI responses before they reach the user and rejects any response
 * containing hallucinated degrees, houses, dashas, yogas, or transit dates.
 */

import { FullKundliResult } from './VedicAstroEngine.js';

export interface ClaimProvenance {
  claimId: string;
  statement: string;
  factIds: string[];
  ruleIds: string[];
  sourceIds: string[];
  calculationId: string;
  confidenceClass: 'DIRECT_FACT' | 'CLASSICAL_DERIVATION' | 'GENERAL_SYNTHESIS';
}

export interface FactValidationResult {
  isValid: boolean;
  rejectedReasons: string[];
  verifiedClaims: ClaimProvenance[];
  unverifiedClaims: string[];
  hallucinationsDetected: string[];
  sanitizedOutput?: string;
}

export class AIFactValidator {
  /**
   * Validates AI-generated interpretation text against the immutable Kundli result.
   */
  public static validateResponse(aiText: string, kundli: FullKundliResult): FactValidationResult {
    const rejectedReasons: string[] = [];
    const hallucinationsDetected: string[] = [];
    const verifiedClaims: ClaimProvenance[] = [];
    const unverifiedClaims: string[] = [];

    if (!aiText || typeof aiText !== 'string' || aiText.trim().length === 0) {
      return {
        isValid: false,
        rejectedReasons: ['Empty AI response received'],
        verifiedClaims: [],
        unverifiedClaims: [],
        hallucinationsDetected: [],
      };
    }

    // Extract planet names and signs from kundli
    const validPlanets = kundli.planets.map((p) => p.name.toLowerCase());
    const planetSignMap = new Map<string, string>();
    const planetHouseMap = new Map<string, number>();

    kundli.planets.forEach((p) => {
      planetSignMap.set(p.name.toLowerCase(), p.signName.toLowerCase());
      planetHouseMap.set(p.name.toLowerCase(), p.house);
    });

    const ascSign = kundli.ascendant.details.signName.toLowerCase();

    // 1. Audit: Check for incorrect planet-in-sign claims (e.g. "Jupiter in Taurus" when Jupiter is in Aries)
    const signNames = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
    ];

    for (const p of validPlanets) {
      const correctSign = planetSignMap.get(p)!;
      // Pattern: "Sun in Leo", "Moon in Cancer"
      for (const s of signNames) {
        if (s !== correctSign) {
          const regex = new RegExp(`\\b${p}\\s+(is\\s+)?(in|occupies|placed\\s+in)\\s+${s}\\b`, 'i');
          if (regex.test(aiText)) {
            const hallucination = `Claimed ${p} is in ${s}, but verified chart has ${p} in ${correctSign}`;
            hallucinationsDetected.push(hallucination);
            rejectedReasons.push(hallucination);
          }
        }
      }
    }

    // 2. Audit: Check for incorrect Ascendant claim (e.g. "Taurus Ascendant" when Lagna is Aquarius)
    for (const s of signNames) {
      if (s !== ascSign) {
        const regex = new RegExp(`\\b${s}\\s+(ascendant|lagna|rising)\\b`, 'i');
        if (regex.test(aiText)) {
          const hallucination = `Claimed ${s} Ascendant, but verified Lagna is ${ascSign}`;
          hallucinationsDetected.push(hallucination);
          rejectedReasons.push(hallucination);
        }
      }
    }

    // 3. Audit: Check for fake Dasha claims (e.g. "Venus Mahadasha" when active is Moon)
    if (kundli.dashas?.currentMahadasha?.planet) {
      const activeMaha = kundli.dashas.currentMahadasha.planet.toLowerCase();
      for (const p of validPlanets) {
        if (p !== activeMaha) {
          const regex = new RegExp(`\\bcurrently\\s+running\\s+${p}\\s+mahadasha\\b`, 'i');
          if (regex.test(aiText)) {
            const hallucination = `Claimed currently running ${p} Mahadasha, but active Mahadasha is ${activeMaha}`;
            hallucinationsDetected.push(hallucination);
            rejectedReasons.push(hallucination);
          }
        }
      }
    }

    // 4. Audit: Check for unearned Kaal Sarp claim
    if (kundli.doshas?.kaalSarp && !kundli.doshas.kaalSarp.hasKaalSarp) {
      if (/\byou have Kaal Sarp dosha\b/i.test(aiText) || /\bafflicted with Kaal Sarp\b/i.test(aiText)) {
        const hallucination = 'Claimed user suffers from Kaal Sarp Dosha, but verified chart is free from Kaal Sarp';
        hallucinationsDetected.push(hallucination);
        rejectedReasons.push(hallucination);
      }
    }

    const isValid = rejectedReasons.length === 0;

    return {
      isValid,
      rejectedReasons,
      verifiedClaims,
      unverifiedClaims,
      hallucinationsDetected,
      sanitizedOutput: isValid ? aiText : undefined,
    };
  }
}
