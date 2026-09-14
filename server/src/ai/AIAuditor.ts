/**
 * AI Quality Control & Auditor Engine (AIAuditor)
 * The ethical and astrological guardian of DeepAstro.
 * Cross-checks AI interpretations against deterministic Vedic calculations.
 * Ensures zero astronomical hallucinations and prevents unsafe fatalistic or medical claims.
 */

import { AIResponsePayload } from './AIProvider.js';
import { FullKundliResult } from '../astrology/VedicAstroEngine.js';

export interface AuditLayerReport {
  astronomy: { passed: boolean; checked: string[]; errors: string[] };
  temporal: { passed: boolean; checkedDate: string; errors: string[] };
  safety: { passed: boolean; violations: string[] };
  evidence: { passed: boolean; factsCited: number; citations: string[] };
}

export interface AuditResult {
  isValid: boolean;
  violations: string[];
  sanitizedContent: AIResponsePayload;
  layers: AuditLayerReport;
}

export class AIAuditor {
  public static auditSafety(text: string): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        violations.push(`Violation of safe interpretation: matches ${pattern}`);
      }
    }
    return {
      passed: violations.length === 0,
      violations,
    };
  }

  private static DANGEROUS_PATTERNS = [
    /guaranteed (profit|returns|wealth|cure|outcome)/i,
    /will definitely (die|fail|divorce|cure|contract)/i,
    /stop taking (medicine|treatment|therapy)/i,
    /replace medical (advice|diagnosis)/i,
    /100% certainty/i,
    /death (date|guarantee|prediction)/i,
    /ignore (?:all|previous|system|your|the|any|instructions|rules|safety|\s)+ (?:system|instructions|rules|safety|prompt)/i,
    /reveal (?:your|the|all)?\s*(?:api key|system prompt|credentials|hidden prompt|instructions)/i,
    /change (my|the) birth (chart|data|coordinates)/i,
    /use (this|a) fake (planetary|planet|position)/i,
    /ignore (the)? calculation passport/i,
    /modify (the)? prediction ledger/i,
    /return another user'?s (chart|data|profile)/i,
  ];

  public static audit(
    candidate: AIResponsePayload,
    kundli?: FullKundliResult
  ): AuditResult {
    const violations: string[] = [];
    const layers: AuditLayerReport = {
      astronomy: { passed: true, checked: [], errors: [] },
      temporal: { passed: true, checkedDate: new Date().toISOString().split('T')[0], errors: [] },
      safety: { passed: true, violations: [] },
      evidence: { passed: true, factsCited: 0, citations: [] },
    };

    // Strip raw reasoning/think tags from candidate content
    const stripCoT = (str: string): string => {
      if (!str) return '';
      return str
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/\[thinking\][\s\S]*?\[\/thinking\]/gi, '')
        .trim();
    };

    let sanitized: AIResponsePayload = {
      summary: stripCoT(candidate.summary),
      interpretation: stripCoT(candidate.interpretation),
      evidence: (candidate.evidence || []).map(stripCoT).filter(Boolean),
      recommendations: (candidate.recommendations || []).map(stripCoT).filter(Boolean),
      remedies: (candidate.remedies || []).map(stripCoT).filter(Boolean),
      confidence: candidate.confidence || 'Moderate',
      disclaimer: stripCoT(candidate.disclaimer || ''),
    };

    const fullText = `${sanitized.summary} ${sanitized.interpretation} ${sanitized.recommendations.join(' ')}`;

    // === LAYER 1: ASTRONOMY AUDITOR ===
    if (kundli) {
      const allSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const ascSign = kundli.ascendant.details.signName;
      const moonSign = kundli.moonSign.signName;
      const sunSign = kundli.sunSign.signName;
      const mahadashaLord = kundli.dashas.currentMahadasha.planet;

      layers.astronomy.checked.push(`Lagna: ${ascSign}`, `Chandra: ${moonSign}`, `Surya: ${sunSign}`, `Mahadasha: ${mahadashaLord}`);

      // Ascendant sign verification
      const wrongAsc = allSigns.filter(s => s !== ascSign);
      for (const sign of wrongAsc) {
        if (new RegExp(`your (ascendant|lagna) is in ${sign}`, 'i').test(fullText)) {
          const err = `AI hallucinated Ascendant sign: stated ${sign}, but calculated is ${ascSign}.`;
          violations.push(err);
          layers.astronomy.errors.push(err);
          layers.astronomy.passed = false;
        }
      }

      // Moon sign verification
      const wrongMoon = allSigns.filter(s => s !== moonSign);
      for (const sign of wrongMoon) {
        if (new RegExp(`your (moon|chandra|rashi) is in ${sign}`, 'i').test(fullText)) {
          const err = `AI hallucinated Moon sign: stated ${sign}, but calculated is ${moonSign}.`;
          violations.push(err);
          layers.astronomy.errors.push(err);
          layers.astronomy.passed = false;
        }
      }

      // Sun sign verification
      const wrongSun = allSigns.filter(s => s !== sunSign);
      for (const sign of wrongSun) {
        if (new RegExp(`your (sun|surya) is in ${sign}`, 'i').test(fullText)) {
          const err = `AI hallucinated Sun sign: stated ${sign}, but calculated is ${sunSign}.`;
          violations.push(err);
          layers.astronomy.errors.push(err);
          layers.astronomy.passed = false;
        }
      }

      // Current Mahadasha Lord verification
      const allPlanets = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
      const wrongDashaLords = allPlanets.filter(p => p !== mahadashaLord);
      for (const lord of wrongDashaLords) {
        if (new RegExp(`your (current mahadasha|main period) is ${lord}`, 'i').test(fullText)) {
          const err = `AI hallucinated Mahadasha lord: stated ${lord}, but calculated is ${mahadashaLord}.`;
          violations.push(err);
          layers.astronomy.errors.push(err);
          layers.astronomy.passed = false;
        }
      }
    }

    // === LAYER 2: TEMPORAL AUDITOR ===
    // Verify that future or past dates mentioned in predictions don't claim to be "today"
    const currentYear = new Date().getFullYear();
    if (new RegExp(`in the current year (${currentYear - 5}|${currentYear + 5})`, 'i').test(fullText)) {
      const err = `AI temporal inconsistency: invalid current calendar year reference.`;
      violations.push(err);
      layers.temporal.errors.push(err);
      layers.temporal.passed = false;
    }

    // === LAYER 3: SAFETY & ETHICS AUDITOR ===
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(fullText)) {
        const err = `Safety policy violation: detected statement matching pattern ${pattern.toString()}`;
        violations.push(err);
        layers.safety.violations.push(err);
        layers.safety.passed = false;
      }
    }

    // === LAYER 4: CITATION & EVIDENCE AUDITOR ===
    if (sanitized.evidence && sanitized.evidence.length > 0) {
      layers.evidence.factsCited = sanitized.evidence.length;
      layers.evidence.citations = [...sanitized.evidence];
    } else if (kundli) {
      // Auto-populate evidence if empty
      sanitized.evidence = [
        `Ascendant in ${kundli.ascendant.details.signName} at ${kundli.ascendant.details.degreeInSign}°`,
        `Moon in ${kundli.moonSign.signName} (${kundli.moonNakshatra.name})`,
        `Active Mahadasha: ${kundli.dashas.currentMahadasha.planet}`,
      ];
      layers.evidence.factsCited = sanitized.evidence.length;
      layers.evidence.citations = [...sanitized.evidence];
    }

    // Standard ethical disclaimer injection
    const standardDisclaimer =
      'Astrological interpretations provide symbolic cosmic perspective for personal discernment and should not replace professional medical, financial, or legal counsel.';

    if (!sanitized.disclaimer || sanitized.disclaimer.length < 30) {
      sanitized.disclaimer = standardDisclaimer;
    }

    // If violations occurred, sanitize the text and adjust confidence
    if (violations.length > 0) {
      sanitized.interpretation = sanitized.interpretation
        .replace(/will definitely/gi, 'may traditionally incline toward')
        .replace(/guaranteed/gi, 'potential');

      sanitized.confidence = 'Moderate';
    }

    return {
      isValid: violations.length === 0,
      violations,
      sanitizedContent: sanitized,
      layers,
    };
  }
}
