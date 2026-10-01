import { describe, it, expect, beforeEach } from 'vitest';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { VargaForecastEngine } from '../server/src/intelligence/future-intelligence/VargaForecastEngine.js';
import { EvidenceGraphEngine } from '../server/src/intelligence/future-intelligence/EvidenceGraphEngine.js';
import { AIEvidenceValidator } from '../server/src/intelligence/future-intelligence/AIEvidenceValidator.js';
import { PredictionNarrativeEngine } from '../server/src/intelligence/future-intelligence/PredictionNarrativeEngine.js';
import { PredictionEvidence } from '../server/src/intelligence/future-intelligence/types.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO FUTURE INTELLIGENCE — EVIDENCE GRAPH & AI AUDIT', () => {
  const testUserId = 'usr_test_evidence_001';

  beforeEach(() => {
    db.birthProfiles.set(testUserId, {
      id: 'prof_test_ev_1',
      userId: testUserId,
      fullName: 'Rohan Mehta',
      birthDate: '1988-12-05',
      birthTime: '17:45',
      birthPlace: 'Ahmedabad, India',
      latitude: 23.0225,
      longitude: 72.5714,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. D9 Navamsha refines relationships while D10 Dashamsha refines career only', async () => {
    const context = await ChartContextResolver.resolve(testUserId, 'primary');

    const careerEval = VargaForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', {
      mahadasha: 'Jupiter',
      antardasha: 'Saturn',
    });

    const relEval = VargaForecastEngine.evaluateDomain(context, 'RELATIONSHIP_ACTIVATION', {
      mahadasha: 'Jupiter',
      antardasha: 'Venus',
    });

    // Career evaluation must contain D1 and D10 signals, but NOT D9
    expect(careerEval.d1Signal).toBeDefined();
    expect(careerEval.d10Signal).toBeDefined();
    expect(careerEval.d9Signal).toBeUndefined();

    // Relationship evaluation must contain D1 and D9 signals, but NOT D10
    expect(relEval.d1Signal).toBeDefined();
    expect(relEval.d9Signal).toBeDefined();
    expect(relEval.d10Signal).toBeUndefined();
  });

  it('2. EvidenceGraphEngine compiles and sorts evidence by weight', () => {
    const rawEvidence: PredictionEvidence[] = [
      { source: 'NUMEROLOGY', rule: 'Personal Year', value: 'Year 5', weight: 0.10, direction: 'SUPPORTIVE' },
      { source: 'DASHA', rule: 'Mahadasha Cycle', value: 'Jupiter cycle', weight: 0.50, direction: 'SUPPORTIVE' },
      { source: 'TRANSIT', rule: 'Saturn Gochara', value: 'Saturn in Pisces', weight: 0.32, direction: 'NEUTRAL' },
      { source: 'NUMEROLOGY', rule: 'Personal Year', value: 'Year 5', weight: 0.10, direction: 'SUPPORTIVE' }, // Duplicate
    ];

    const compiled = EvidenceGraphEngine.compileGraph(rawEvidence);

    // Duplicates removed
    expect(compiled.length).toBe(3);
    // Highest weight first
    expect(compiled[0].source).toBe('DASHA');
    expect(compiled[0].weight).toBe(0.50);
    expect(compiled[2].source).toBe('NUMEROLOGY');
    expect(compiled[2].weight).toBe(0.10);
  });

  it('3. AIEvidenceValidator rejects ungrounded astrological hallucinations', () => {
    const validEvidence: PredictionEvidence[] = [
      { source: 'DASHA', rule: 'Jupiter Rule', value: 'Jupiter Mahadasha in Cancer', weight: 0.35, direction: 'SUPPORTIVE' },
    ];

    // Hallucinated text mentions Saturn and Pisces, which are NOT in the evidence
    const hallucinatedText = 'During this period, Saturn transiting through Pisces creates great obstacles.';
    const audit = AIEvidenceValidator.validate(hallucinatedText, validEvidence);

    expect(audit.isValid).toBe(false);
    expect(audit.ungroundedTerms).toContain('Planet: Saturn');
    expect(audit.ungroundedTerms).toContain('Zodiac Sign: Pisces');
  });

  it('4. AIEvidenceValidator accepts text strictly grounded in evidence', () => {
    const validEvidence: PredictionEvidence[] = [
      { source: 'DASHA', rule: 'Jupiter Rule', value: 'Jupiter operates in Cancer Navamsha', weight: 0.35, direction: 'SUPPORTIVE' },
    ];

    const groundedText = 'Jupiter operates in Cancer Navamsha, offering expansive guidance.';
    const audit = AIEvidenceValidator.validate(groundedText, validEvidence);

    expect(audit.isValid).toBe(true);
    expect(audit.ungroundedTerms.length).toBe(0);
  });

  it('5. PredictionNarrativeEngine returns fallback when evidence is empty', () => {
    const result = PredictionNarrativeEngine.synthesizeDomainNarrative('Career', []);
    expect(result.narrative).toContain('Insufficient calculated evidence');
  });
});
