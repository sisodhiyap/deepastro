import { describe, it, expect } from 'vitest';
import { MarriageCompatibilityEngine } from '../server/src/astrology/MarriageCompatibilityEngine.js';
import { BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('Marriage Compatibility Intelligence Engine Suite', () => {
  // Couple 1: Arjun & Priya (Favorable Match - Aries Ashwini & Virgo Hasta)
  const arjunSharma: BirthProfileInput = {
    name: 'Arjun Sharma',
    birthDate: '1992-03-12',
    birthTime: '10:15',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
  };

  const priyaMehta: BirthProfileInput = {
    name: 'Priya Mehta',
    birthDate: '1994-08-25',
    birthTime: '18:40',
    birthPlace: 'Jaipur, India',
    latitude: 26.9124,
    longitude: 75.7873,
    timezone: 5.5,
    gender: 'Female',
  };

  // Couple 2: Rahul & Neha (Challenging Match - Gemini Ardra & Scorpio Anuradha)
  const rahulVerma: BirthProfileInput = {
    name: 'Rahul Verma',
    birthDate: '1990-06-05',
    birthTime: '09:20',
    birthPlace: 'Lucknow, India',
    latitude: 26.8467,
    longitude: 80.9462,
    timezone: 5.5,
    gender: 'Male',
  };

  const nehaSingh: BirthProfileInput = {
    name: 'Neha Singh',
    birthDate: '1993-11-14',
    birthTime: '23:45',
    birthPlace: 'Bhopal, India',
    latitude: 23.2599,
    longitude: 77.4126,
    timezone: 5.5,
    gender: 'Female',
  };

  it('1. Generates authentic Favorable Match report with complete metadata', () => {
    const report = MarriageCompatibilityEngine.analyze(arjunSharma, priyaMehta);

    expect(report.compatibilityId).toBeDefined();
    expect(report.partnerA.name).toBe('Arjun Sharma');
    expect(report.partnerB.name).toBe('Priya Mehta');

    expect(report.overallScore).toBeGreaterThanOrEqual(65);
    expect(report.keyMetrics.ashtakoota.score).toBeGreaterThanOrEqual(18);
    expect(report.keyMetrics.ashtakoota.maxScore).toBe(36);

    // Deep dive must be favorable
    expect(report.deepDive.type).toBe('favorable');
    expect(report.deepDive.whyItWorks).toBeDefined();
    expect(report.deepDive.whyItWorks!.length).toBeGreaterThanOrEqual(4);
    expect(report.deepDive.lifeOutlook).toBeDefined();
    expect(report.deepDive.verdict).toBeDefined();
  });

  it('2. Accurately identifies Challenging Match characteristics without fatalism', () => {
    const report = MarriageCompatibilityEngine.analyze(rahulVerma, nehaSingh);

    expect(report.overallScore).toBeLessThan(65);
    expect(report.deepDive.type).toBe('challenging');
    expect(report.deepDive.potentialChallenges).toBeDefined();
    expect(report.deepDive.potentialChallenges!.length).toBeGreaterThanOrEqual(4);
    expect(report.deepDive.possibleEffectsIfIgnored).toBeDefined();
    expect(report.deepDive.recommendations).toBeDefined();

    // Verify non-fatalistic language
    const fullText = JSON.stringify(report).toLowerCase();
    expect(fullText).not.toContain('will die');
    expect(fullText).not.toContain('definitely divorce');
    expect(fullText).not.toContain('fatal accident');
  });

  it('3. Generates all 6 Relationship Dimensions strictly bounded within 1 to 10', () => {
    const report = MarriageCompatibilityEngine.analyze(arjunSharma, priyaMehta);

    expect(report.dimensions.length).toBe(6);
    for (const dim of report.dimensions) {
      expect(dim.score).toBeGreaterThanOrEqual(1);
      expect(dim.score).toBeLessThanOrEqual(10);
      expect(dim.insight).toBeDefined();
      expect(dim.color).toBeDefined();
    }
  });

  it('4. Provides practical pre-marital discussion topics', () => {
    const report = MarriageCompatibilityEngine.analyze(arjunSharma, priyaMehta);

    expect(report.preMaritalDiscussionTopics).toBeDefined();
    expect(report.preMaritalDiscussionTopics.length).toBeGreaterThanOrEqual(4);
    expect(report.traditionalRemedies).toBeDefined();
    expect(report.traditionalRemedies.length).toBeGreaterThanOrEqual(2);
  });
});
