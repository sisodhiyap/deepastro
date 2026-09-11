/**
 * DeepAstro Explanation Engine
 * Formulates structured "Why This Reading" explanations grounded in verified
 * calculation passports, classical shastras, and active transits.
 * Supports BEGINNER, STANDARD, and EXPERT modes.
 */

import {
  WhyThisReadingPayload,
  EvidenceSignal,
  ContradictionDetail,
  ConfidenceLevel,
  ReadingDepth,
} from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export class ExplanationEngine {
  public static buildExplanation(params: {
    snapshot: CalculationSnapshot;
    domain: string;
    signals: EvidenceSignal[];
    contradictions: ContradictionDetail[];
    confidence: ConfidenceLevel;
    timingBasis: string;
    depth?: ReadingDepth;
  }): WhyThisReadingPayload {
    const { snapshot, domain, signals, contradictions, confidence, timingBasis, depth = 'STANDARD' } = params;

    const primaryFactors: string[] = [];
    const supportingFactors: string[] = [];
    const relevantRules: string[] = [];
    const sources: string[] = [];

    for (const s of signals) {
      if (s.strength >= 0.8) {
        primaryFactors.push(`${s.system}: ${s.factor}`);
      } else {
        supportingFactors.push(`${s.system}: ${s.factor}`);
      }
      relevantRules.push(s.evidence);
      if (!sources.includes(s.source)) sources.push(s.source);
    }

    const dashaFactors = `Active Mahadasha of ${snapshot.dashas.currentMahadasha} with Antardasha of ${snapshot.dashas.currentAntardasha}.`;
    const transitFactors = `Gochara Lunar activation in ${snapshot.panchang?.nakshatra?.name || 'sidereal'} with current major planetary transits.`;
    const relevantVarga = domain.toUpperCase() === 'CAREER' ? 'D10 Dashamsha' : 'D9 Navamsha';

    let limitations = 'Astrological interpretation identifies energetic climates and optimal timing windows; free will, character, and deliberate effort determine personal outcomes.';
    if (depth === 'EXPERT') {
      limitations += ' Subject to planetary avastha dignities and topocentric horizon refraction factors.';
    }

    return {
      primaryFactors,
      supportingFactors,
      relevantRules,
      dashaFactors,
      transitFactors,
      relevantVarga,
      contradictions,
      evidenceSources: sources,
      timingBasis,
      confidence,
      limitations,
    };
  }
}
