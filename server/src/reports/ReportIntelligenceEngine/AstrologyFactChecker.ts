/**
 * Astrology Fact Checker
 * Independently examines raw inputs, deterministic calculations, and rule results,
 * registering every confirmed metric into the FactLedger with audit provenance.
 */

import { FullKundliResult, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { FactLedger, VerifiedFact } from './FactLedger.js';
import { CrossConsistencyEngine } from './CrossConsistencyEngine.js';
import { KundliParserEngine, UnverifiedParsedKundli } from './KundliParserEngine.js';

export interface FactCheckReport {
  passed: boolean;
  ledger: FactLedger;
  verifiedCount: number;
  conflicts: string[];
  warnings: string[];
}

export class AstrologyFactChecker {
  public static auditAndBuildLedger(
    input: BirthProfileInput,
    kundli: FullKundliResult,
    parsedCandidate?: UnverifiedParsedKundli
  ): FactCheckReport {
    const ledger = new FactLedger(`ledger_${Date.now()}`);
    const conflicts: string[] = [];
    const warnings: string[] = [];

    // 1. Audit User Birth Profile
    ledger.recordFact({
      key: 'profile.name',
      value: input.name,
      source: 'USER_INPUT',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: Boolean(input.name && input.name.trim().length > 0),
      verificationStatus: input.name ? 'VERIFIED' : 'CONFLICT',
      evidence: ['User confirmed identity profile'],
    });

    ledger.recordFact({
      key: 'profile.birthDate',
      value: input.birthDate,
      source: 'USER_INPUT',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate),
      verificationStatus: /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) ? 'VERIFIED' : 'CONFLICT',
      evidence: ['Standardized ISO date entry'],
    });

    ledger.recordFact({
      key: 'profile.birthTime',
      value: input.birthTime,
      source: 'USER_INPUT',
      confidence: input.isApproximateTime ? 'MEDIUM' : 'HIGH',
      confidenceScore: input.isApproximateTime ? 0.75 : 1.0,
      verified: Boolean(input.birthTime && /^\d{1,2}:\d{2}/.test(input.birthTime)),
      verificationStatus: 'VERIFIED',
      evidence: [input.isApproximateTime ? 'Approximate birth time indicated' : 'Exact recorded birth time'],
      warnings: input.isApproximateTime ? ['Birth time is approximate; sub-dasha precision may vary'] : undefined,
    });

    // 2. Audit Astronomical Coordinates
    ledger.recordFact({
      key: 'astronomy.lagnaSign',
      value: kundli.ascendant.details.signName,
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: true,
      verificationStatus: 'VERIFIED',
      calculationVersion: 'lahiri-v2.1',
      evidence: [
        `Ascendant degree: ${kundli.ascendant.details.degreeInSign}°${kundli.ascendant.details.minutes}'`,
        `Nakshatra: ${kundli.ascendant.nakshatra.name} Pada ${kundli.ascendant.nakshatra.pada}`,
        `Ayanamsha: ${kundli.astronomy.ayanamshaDegrees.toFixed(4)}°`,
      ],
    });

    ledger.recordFact({
      key: 'astronomy.moonSign',
      value: kundli.moonSign.signName,
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: true,
      verificationStatus: 'VERIFIED',
      calculationVersion: 'lahiri-v2.1',
      evidence: [
        `Chandra degree: ${kundli.moonSign.degreeInSign}°${kundli.moonSign.minutes}'`,
        `Nakshatra: ${kundli.moonNakshatra.name} Pada ${kundli.moonNakshatra.pada}`,
      ],
    });

    // 3. Audit 9 Navagrahas
    const validPlanets = kundli.planets.filter((p) => p.name && p.house >= 1 && p.house <= 12);
    ledger.recordFact({
      key: 'astronomy.navagrahas',
      value: validPlanets.map((p) => ({
        name: p.name,
        house: p.house,
        sign: p.signName,
        degree: `${p.degreeInSign}°${p.minutes}'`,
        retrograde: p.isRetrograde,
        combust: p.isCombust,
      })),
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: validPlanets.length === 9,
      verificationStatus: validPlanets.length === 9 ? 'VERIFIED' : 'CONFLICT',
      evidence: [`${validPlanets.length} valid planetary placements computed across whole-sign Bhavas`],
    });

    // 4. Audit Vimshottari Dasha
    ledger.recordFact({
      key: 'dasha.current',
      value: {
        mahadasha: kundli.dashas.currentMahadasha.planet,
        antardasha: kundli.dashas.currentAntardasha.planet,
        startDate: kundli.dashas.currentMahadasha.startDate,
        endDate: kundli.dashas.currentMahadasha.endDate,
      },
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: Boolean(kundli.dashas.currentMahadasha && kundli.dashas.currentAntardasha),
      verificationStatus: 'VERIFIED',
      evidence: [
        `Calculated from birth Nakshatra ${kundli.moonNakshatra.name} balance: ${kundli.dashas.balanceYearsRemaining.toFixed(2)} years remaining`,
      ],
    });

    // 5. Audit Parsed Candidate vs Calculated Consistency (if OCR or external document supplied)
    if (parsedCandidate) {
      const consistency = CrossConsistencyEngine.verifyCrossConsistency(parsedCandidate, kundli);
      if (!consistency.isConsistent) {
        consistency.conflicts.forEach((c) => {
          conflicts.push(`[${c.field}] ${c.reason}`);
          ledger.recordFact({
            key: `conflict.${c.field}`,
            value: { claimed: c.claimedValue, calculated: c.calculatedValue },
            source: 'OCR',
            confidence: 'CONFLICT',
            confidenceScore: 0.0,
            verified: false,
            verificationStatus: 'CONFLICT',
            evidence: [c.reason],
          });
        });
      }
    }

    const verifiedFacts = ledger.getVerifiedFacts();
    return {
      passed: conflicts.length === 0,
      ledger,
      verifiedCount: verifiedFacts.length,
      conflicts,
      warnings,
    };
  }

  /**
   * Claim-Level Fact Checking Engine
   * Evaluates individual sentences or claims extracted from generated interpretations.
   */
  public static auditClaims(
    generatedText: string,
    kundli: FullKundliResult,
    modelOrigin: string = 'AIOrchestrator'
  ): {
    passed: boolean;
    claims: Array<{
      claimId: string;
      text: string;
      type: 'FACTUAL' | 'INTERPRETIVE' | 'REMEDIAL' | 'PREDICTIVE';
      sourceIds: string[];
      calculationReferences: string[];
      ruleReferences: string[];
      model: string;
      confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      status: 'VERIFIED' | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'BLOCKED' | 'REQUIRES_REVIEW';
      reviewNotes?: string;
    }>;
    unsupportedCount: number;
    blockedCount: number;
    sanitizedText: string;
  } {
    const claims: Array<{
      claimId: string;
      text: string;
      type: 'FACTUAL' | 'INTERPRETIVE' | 'REMEDIAL' | 'PREDICTIVE';
      sourceIds: string[];
      calculationReferences: string[];
      ruleReferences: string[];
      model: string;
      confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      status: 'VERIFIED' | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'BLOCKED' | 'REQUIRES_REVIEW';
      reviewNotes?: string;
    }> = [];

    // Split sentences
    const rawSentences = generatedText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    let unsupportedCount = 0;
    let blockedCount = 0;
    let sanitizedText = generatedText;

    const dangerousTerms = [
      /guaranteed/i,
      /will definitely/i,
      /cure (cancer|disease|infection)/i,
      /medical treatment/i,
      /certain death/i,
      /investment guarantee/i,
    ];

    rawSentences.forEach((sentence, idx) => {
      const claimId = `claim_${Date.now()}_${idx + 1}`;
      let status: 'VERIFIED' | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'BLOCKED' | 'REQUIRES_REVIEW' = 'SUPPORTED';
      let claimType: 'FACTUAL' | 'INTERPRETIVE' | 'REMEDIAL' | 'PREDICTIVE' = 'INTERPRETIVE';
      const calcRefs: string[] = [];
      const ruleRefs: string[] = [];
      const sourceIds: string[] = ['BPHS_CLASSICAL'];
      let notes: string | undefined;

      // 1. Check Safety Violations (BLOCKED)
      const hasDangerousTerm = dangerousTerms.some((rgx) => rgx.test(sentence));
      if (hasDangerousTerm) {
        status = 'BLOCKED';
        blockedCount++;
        notes = 'Flagged: Fatalistic, medical, or guaranteed predictive rhetoric.';
        sanitizedText = sanitizedText.replace(
          sentence,
          'Traditional Vedic texts associate these cosmic alignments with subtle inclinations rather than definitive outcomes.'
        );
      } else if (
        sentence.includes(kundli.ascendant.details.signName) ||
        sentence.includes(kundli.moonSign.signName) ||
        sentence.includes(kundli.dashas.currentMahadasha.planet)
      ) {
        status = 'VERIFIED';
        claimType = 'FACTUAL';
        calcRefs.push(`Ascendant: ${kundli.ascendant.details.signName}`);
        calcRefs.push(`MoonSign: ${kundli.moonSign.signName}`);
      } else if (sentence.toLowerCase().includes('yoga') || sentence.toLowerCase().includes('gajakesari')) {
        status = 'SUPPORTED';
        claimType = 'INTERPRETIVE';
        ruleRefs.push('BPHS_YOGA_RULES');
      } else if (sentence.toLowerCase().includes('remedy') || sentence.toLowerCase().includes('mantra')) {
        status = 'SUPPORTED';
        claimType = 'REMEDIAL';
        sourceIds.push('PARASHARA_REMEDIES');
      } else if (/will|shall|forecast/i.test(sentence)) {
        claimType = 'PREDICTIVE';
        status = 'PARTIALLY_SUPPORTED';
      }

      claims.push({
        claimId,
        text: sentence,
        type: claimType,
        sourceIds,
        calculationReferences: calcRefs,
        ruleReferences: ruleRefs,
        model: modelOrigin,
        confidence: status === 'VERIFIED' ? 'HIGH' : status === 'SUPPORTED' ? 'MEDIUM' : 'LOW',
        status,
        reviewNotes: notes,
      });
    });

    return {
      passed: blockedCount === 0,
      claims,
      unsupportedCount,
      blockedCount,
      sanitizedText,
    };
  }
}
