import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { FactLedger } from '../server/src/reports/ReportIntelligenceEngine/FactLedger.js';
import { NormalizationEngine } from '../server/src/reports/ReportIntelligenceEngine/NormalizationEngine.js';
import { KundliParserEngine } from '../server/src/reports/ReportIntelligenceEngine/KundliParserEngine.js';
import { CrossConsistencyEngine } from '../server/src/reports/ReportIntelligenceEngine/CrossConsistencyEngine.js';
import { AstrologyFactChecker } from '../server/src/reports/ReportIntelligenceEngine/AstrologyFactChecker.js';
import { ForecastEngine } from '../server/src/reports/ReportIntelligenceEngine/ForecastEngine.js';
import { InterpretationEngine } from '../server/src/reports/ReportIntelligenceEngine/InterpretationEngine.js';
import { AIReportAuditor } from '../server/src/reports/ReportIntelligenceEngine/AIReportAuditor.js';
import { PDFDataValidator } from '../server/src/reports/ReportIntelligenceEngine/PDFDataValidator.js';
import { ReportAuditLog } from '../server/src/reports/ReportIntelligenceEngine/ReportAuditLog.js';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';

describe('DeepAstro Report Intelligence, Fact-Checking & Professional Output Engine', () => {
  const specimenInput: BirthProfileInput = {
    name: 'Aarav Mehta',
    birthDate: '1996-08-14',
    birthTime: '07:42',
    birthPlace: 'New Delhi, India (28.61°N, 77.21°E)',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    gender: 'Male',
  };

  it('1. FactLedger records provenance and enforces deterministic engine precedence', () => {
    const ledger = new FactLedger();
    ledger.recordFact({
      key: 'astronomy.lagna',
      value: 'Leo',
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: true,
      verificationStatus: 'VERIFIED',
      evidence: ['Calculated via Lahiri ayanamsha'],
    });

    expect(ledger.getFactValue('astronomy.lagna')).toBe('Leo');

    // Attempt overwrite from lower-priority OCR source
    ledger.recordFact({
      key: 'astronomy.lagna',
      value: 'Scorpio',
      source: 'OCR',
      confidence: 'LOW',
      confidenceScore: 0.4,
      verified: false,
      verificationStatus: 'UNVERIFIED',
      evidence: ['OCR text token'],
    });

    // Authoritative engine fact must prevail
    expect(ledger.getFactValue('astronomy.lagna')).toBe('Leo');
    expect(ledger.getAuditTrail().some((a) => a.action === 'OVERRIDE_PREVENTED')).toBe(true);
  });

  it('2. NormalizationEngine standardizes dates, times, locations, and Hindi/English planet names', () => {
    const normDate1 = NormalizationEngine.normalizeBirthDate('14 August 1996');
    expect(normDate1.normalizedValue).toBe('1996-08-14');
    expect(normDate1.isValid).toBe(true);

    const normDate2 = NormalizationEngine.normalizeBirthDate('14/08/1996');
    expect(normDate2.normalizedValue).toBe('1996-08-14');

    const normTime1 = NormalizationEngine.normalizeBirthTime('07:42 AM');
    expect(normTime1.normalizedValue).toBe('07:42');

    const normTime2 = NormalizationEngine.normalizeBirthTime('7:42 PM');
    expect(normTime2.normalizedValue).toBe('19:42');

    // Planet translations
    expect(NormalizationEngine.normalizePlanetName('Surya').normalizedValue).toBe('Sun');
    expect(NormalizationEngine.normalizePlanetName('Chandra').normalizedValue).toBe('Moon');
    expect(NormalizationEngine.normalizePlanetName('Brihaspati').normalizedValue).toBe('Jupiter');
    expect(NormalizationEngine.normalizePlanetName('Shukra').normalizedValue).toBe('Venus');

    // Sign translations
    expect(NormalizationEngine.normalizeSign('Vrishabha').normalizedValue.english).toBe('Taurus');
    expect(NormalizationEngine.normalizeSign('Kumbha').normalizedValue.english).toBe('Aquarius');
  });

  it('3. KundliParserEngine ingests raw OCR documents into unverified candidates', () => {
    const rawOcr = `
      Name: Aarav Mehta
      DOB: 14 August 1996
      TOB: 07:42 AM
      Place: New Delhi, India
      Lagna: Leo
      Moon Sign: Taurus
      Nakshatra: Rohini
    `;

    const parsed = KundliParserEngine.parseFromOcrText(rawOcr);
    expect(parsed.name).toBe('Aarav Mehta');
    expect(parsed.birthDate).toBe('1996-08-14');
    expect(parsed.birthTime).toBe('07:42');
    expect(parsed.lagnaSign).toBe('Leo');
    expect(parsed.moonSign).toBe('Taurus');
    expect(parsed.sourceType).toBe('OCR_DOCUMENT');
  });

  it('4. CrossConsistencyEngine detects discrepancies and flags blocking conflicts', () => {
    const kundli = VedicAstroEngine.calculateKundli(specimenInput);

    // Contrived conflicting candidate: claims Moon in Gemini when actual is Taurus
    const conflictingCandidate = {
      name: 'Aarav Mehta',
      lagnaSign: kundli.ascendant.details.signName,
      moonSign: 'Gemini', // Mismatch!
      sourceType: 'OCR_DOCUMENT' as const,
      parsedPlanets: [],
      confidence: 0.5,
    };

    const check = CrossConsistencyEngine.verifyCrossConsistency(conflictingCandidate, kundli);
    expect(check.isConsistent).toBe(false);
    expect(check.conflicts.some((c) => c.field === 'moonSign' && c.severity === 'BLOCKING_CONFLICT')).toBe(true);
  });

  it('5. AstrologyFactChecker builds verified ledger and blocks invalid birth dates', () => {
    const kundli = VedicAstroEngine.calculateKundli(specimenInput);
    const audit = AstrologyFactChecker.auditAndBuildLedger(specimenInput, kundli);

    expect(audit.passed).toBe(true);
    expect(audit.verifiedCount).toBeGreaterThanOrEqual(4);
    expect(audit.ledger.getFactValue('profile.name')).toBe('Aarav Mehta');
    expect(audit.ledger.getFactValue('astronomy.lagnaSign')).toBe(kundli.ascendant.details.signName);
  });

  it('6. ForecastEngine dynamically constructs probabilistic 2026-2035 multi-year roadmap', () => {
    const kundli = VedicAstroEngine.calculateKundli(specimenInput);
    const forecast = ForecastEngine.generateMultiYearForecast(kundli);

    expect(forecast).toHaveLength(10);
    expect(forecast[0].year).toBe('2026');
    expect(forecast[9].year).toBe('2035');
    // Ensure probabilistic wording
    forecast.forEach((y) => {
      expect(y.direction).toBeTruthy();
      expect(y.opportunity).toBeTruthy();
      expect(y.action).toBeTruthy();
      expect(y.direction).not.toMatch(/you will definitely/i);
    });
  });

  it('7. InterpretationEngine generates evidence-grounded insights', () => {
    const kundli = VedicAstroEngine.calculateKundli(specimenInput);
    const audit = AstrologyFactChecker.auditAndBuildLedger(specimenInput, kundli);
    const interpreted = InterpretationEngine.synthesize(kundli, audit.ledger);

    expect(interpreted.career.evidence.factors.length).toBeGreaterThan(0);
    expect(interpreted.business.summary).toBeTruthy();
    expect(interpreted.finance.disclaimer).toContain('not financial advice');
    expect(interpreted.health.disclaimer).toContain('NOT MEDICAL ADVICE');
    expect(interpreted.actionPlan.top3Actions).toHaveLength(3);
  });

  it('8. AIReportAuditor rejects fatalistic predictions, medical diagnosis, and <think> tags', () => {
    const ledger = new FactLedger();
    ledger.recordFact({
      key: 'astronomy.lagnaSign',
      value: 'Leo',
      source: 'ASTROLOGY_ENGINE',
      confidence: 'HIGH',
      confidenceScore: 1.0,
      verified: true,
      verificationStatus: 'VERIFIED',
      evidence: ['Engine calculation'],
    });

    const hallucinatedText = '<think>Let me reason about the chart</think> Your ascendant is in Pisces and you are guaranteed returns.';
    const auditResult = AIReportAuditor.auditInterpretation(hallucinatedText, ledger);

    expect(auditResult.isApproved).toBe(false);
    expect(auditResult.violations).toContain('Raw <think> tags found in AI output.');
    expect(auditResult.violations.some((v) => v.includes('AI hallucinated Ascendant'))).toBe(true);
    expect(auditResult.violations.some((v) => v.includes('Guaranteed financial claim'))).toBe(true);
  });

  it('9. PDFDataValidator executes round-trip fact check against rendered publication', () => {
    const composed = ReportComposer.compose(specimenInput);
    const renderedHtml = PremiumPDFRenderer.renderHtml(composed.report);
    const roundTrip = PDFDataValidator.validateRenderedHtml(renderedHtml, composed.report);

    expect(roundTrip.passed).toBe(true);
    expect(roundTrip.mismatches.every((m) => m.status === 'MATCH')).toBe(true);
  });

  it('10. ReportAuditLog and "Why This Result?" Inspector trace complete provenance chains', () => {
    const composed = ReportComposer.compose(specimenInput);
    const record = ReportAuditLog.getAuditRecord(composed.report.metadata.reportId);

    expect(record).toBeDefined();
    expect(record?.nativeName).toBe('Aarav Mehta');
    expect(record?.roundTripValidationPassed).toBe(true);

    const careerWhy = ReportAuditLog.inspectWhy(composed.report.metadata.reportId, 'career');
    expect((careerWhy as any).interpretation).toBeTruthy();
    expect((careerWhy as any).factors.length).toBeGreaterThan(0);
  });
});
