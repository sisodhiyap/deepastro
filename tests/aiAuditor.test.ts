import { describe, it, expect } from 'vitest';
import { AIAuditor } from '../server/src/ai/AIAuditor.js';
import { AIResponsePayload } from '../server/src/ai/AIProvider.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('AI Auditor & Anti-Hallucination Guard', () => {
  const testBirthProfile: BirthProfileInput = {
    name: 'Test Native',
    birthDate: '1995-08-15',
    birthTime: '10:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };
  const sampleKundli = VedicAstroEngine.calculateKundli(testBirthProfile);

  it('flags dangerous financial and medical claims', () => {
    const dangerousCandidate: AIResponsePayload = {
      summary: 'This month brings guaranteed returns on all stock trades.',
      evidence: [],
      interpretation: 'Planetary alignments ensure guaranteed profit and will definitely cure all health problems.',
      confidence: 'High',
      recommendations: ['Stop taking medicine and rely on cosmic energy.'],
      remedies: [],
      disclaimer: '',
    };

    const audit = AIAuditor.audit(dangerousCandidate, sampleKundli);

    expect(audit.isValid).toBe(false);
    expect(audit.violations.length).toBeGreaterThan(0);
    expect(audit.sanitizedContent.disclaimer.length).toBeGreaterThan(30);
  });

  it('flags attempts to hallucinate contradictory planetary positions', () => {
    // If native has Libra Lagna, flag if AI claims your ascendant is in Aries
    const actualLagna = sampleKundli.ascendant.details.signName;
    const oppositeSign = actualLagna === 'Aries' ? 'Libra' : 'Aries';

    const hallucinatedCandidate: AIResponsePayload = {
      summary: 'Cosmic report for native.',
      evidence: [],
      interpretation: `Based on your chart, your ascendant is in ${oppositeSign}, which shifts your houses.`,
      confidence: 'High',
      recommendations: [],
      remedies: [],
      disclaimer: 'Valid disclaimer',
    };

    const audit = AIAuditor.audit(hallucinatedCandidate, sampleKundli);

    expect(audit.isValid).toBe(false);
    expect(audit.violations.some((v) => v.includes('hallucinated Ascendant'))).toBe(true);
  });
});
