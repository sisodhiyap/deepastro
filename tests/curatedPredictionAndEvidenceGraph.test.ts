/**
 * DeepAstro Curated Prediction & Evidence Graph Test Suite
 * Validates:
 * 1. Prediction Evidence Graph construction and verification.
 * 2. Strict rejection of unsupported predictions (e.g. invalid planet or false Dasha lord).
 * 3. 6-dimensional confidence model (VERIFIED, HIGH, MODERATE, LOW, INSUFFICIENT; zero fake percentages).
 * 4. "Why this prediction?" transparent evidence generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';
import { CuratedPredictionEngine } from '../server/src/learning/CuratedPredictionEngine.js';
import { PredictionEvidenceGraphEngine } from '../server/src/learning/PredictionEvidenceGraph.js';
import { db } from '../server/src/database/db.js';

describe('DeepAstro Curated Prediction & Evidence Graph Suite', () => {
  const userId = 'user_veritas_42';

  const factSet = VedicAstroEngine.createAstrologyFactSet({
    name: 'Deepti',
    birthDate: '1988-03-02',
    birthTime: '07:15',
    birthPlace: 'Agra, UP, India',
    latitude: 27.1767,
    longitude: 78.0081,
    timezone: 5.5,
  });

  const snapshot = CalculationSnapshotEngine.createSnapshot(factSet, userId);

  beforeEach(() => {
    db.predictionRecords.clear();
  });

  it('generates a curated prediction with verified evidence graph', () => {
    const prediction = CuratedPredictionEngine.generatePrediction(userId, snapshot, 'Career');

    expect(prediction.id).toBeDefined();
    expect(prediction.domain).toBe('Career');
    expect(prediction.headline).toContain('Professional Consolidation');
    expect(prediction.evidenceGraph).toBeDefined();
    expect(prediction.evidenceGraph.isSupported).toBe(true);

    // Verify evidence graph contains expected Graha and Dasha nodes
    const grahaNodes = prediction.evidenceGraph.nodes.filter(n => n.type === 'GRAHA');
    expect(grahaNodes.length).toBeGreaterThan(0);
    expect(grahaNodes.every(n => n.verified)).toBe(true);

    const dashaNode = prediction.evidenceGraph.nodes.find(n => n.type === 'DASHA');
    expect(dashaNode).toBeDefined();
    expect(dashaNode?.verified).toBe(true);
  });

  it('strictly blocks unsupported predictions from entering response', () => {
    // Attempt to build graph claiming Pluto and a false Dasha lord (Saturn when Mars is active)
    const falseGraph = PredictionEvidenceGraphEngine.buildEvidenceGraph(
      'fake_pred_999',
      'Hallucinated Prediction',
      'Finance',
      snapshot,
      {
        grahas: ['Pluto_NonExistent'],
        houses: [10],
        dashaLord: 'FalseDashaLord',
        ruleId: 'FABRICATED_RULE',
        sourceCitation: 'NonExistent Scripture',
      }
    );

    expect(falseGraph.isSupported).toBe(false);
    expect(falseGraph.unsupportedReasons).toBeDefined();
    expect(falseGraph.unsupportedReasons?.length).toBeGreaterThan(0);

    // Calling assertSupported must throw
    expect(() => {
      PredictionEvidenceGraphEngine.assertSupported(falseGraph);
    }).toThrow(/Unsupported prediction blocked from output/i);
  });

  it('enforces 6-dimensional discrete confidence model without fake percentages', () => {
    const prediction = CuratedPredictionEngine.generatePrediction(userId, snapshot, 'Relationships');
    const conf = prediction.confidence;

    const allowedLevels = ['VERIFIED', 'HIGH', 'MODERATE', 'LOW', 'INSUFFICIENT'];

    expect(allowedLevels).toContain(conf.astronomicalConfidence);
    expect(allowedLevels).toContain(conf.ruleConfidence);
    expect(allowedLevels).toContain(conf.timingConfidence);
    expect(allowedLevels).toContain(conf.interpretationConfidence);
    expect(allowedLevels).toContain(conf.personalizationConfidence);
    expect(allowedLevels).toContain(conf.outcomeEvidenceConfidence);

    // Invariant: Never output fake accuracy strings like "92.4% accurate"
    const jsonStr = JSON.stringify(conf);
    expect(jsonStr).not.toContain('%');
  });

  it('exposes "Why this prediction?" evidence without leaking hidden prompts', () => {
    const prediction = CuratedPredictionEngine.generatePrediction(userId, snapshot, 'Finance');

    const why = prediction.whyThisPrediction;
    expect(why).toBeDefined();
    expect(why.calculationEvidence).toContain('Chart fingerprint');
    expect(why.dasha).toContain('Active Mahadasha');
    expect(why.house).toBe(2);
    expect(why.rule).toBe('BPHS_BHAVA_2_DHANA_VICHARA');
    expect(why.source).toContain('Brihat Parashara Hora Shastra');

    // Asserts no LLM system prompt / chain-of-thought leaked
    expect(JSON.stringify(why)).not.toContain('You are an AI assistant');
    expect(JSON.stringify(why)).not.toContain('temperature');
  });
});
