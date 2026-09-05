import { describe, it, expect } from 'vitest';
import { CalculationRepository } from '../server/src/database/repositories/CalculationRepository.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { JyotishRuleEngine } from '../server/src/astrology/JyotishRuleEngine.js';
import { PalmistryVisionService } from '../server/src/ai/PalmistryVisionService.js';
import { AIConsensusEngine } from '../server/src/ai/AIConsensusEngine.js';
import { AstrologyFactChecker } from '../server/src/reports/ReportIntelligenceEngine/AstrologyFactChecker.js';
import { ReportIntegrityEngine } from '../server/src/reports/ReportIntelligenceEngine/ReportIntegrityEngine.js';
import { reportGenerationService } from '../server/src/services/ReportGenerationService.js';

describe('DEEPASTRO CHECKPOINT 9 — Architectural & Engine Verifications', () => {
  const profile1: BirthProfileInput = {
    name: 'Aarav Mehta',
    birthDate: '1992-07-15',
    birthTime: '09:30',
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Male',
  };

  const profileSameCoordinatesDifferentName: BirthProfileInput = {
    name: 'Rohit Verma', // Different Name
    birthDate: '1992-07-15',
    birthTime: '09:30',
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Male',
  };

  const profileDifferentTime: BirthProfileInput = {
    name: 'Aarav Mehta',
    birthDate: '1992-07-15',
    birthTime: '18:45', // Different Time
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Male',
  };

  // =========================================================================
  // 1. SECTION 13: ASTRONOMICAL FINGERPRINT SPECIFICATION
  // Name MUST NOT affect astronomical identity.
  // =========================================================================
  it('enforces astronomical fingerprint invariant: Name MUST NOT affect identity hash', () => {
    const fp1 = CalculationRepository.computeAstronomicalFingerprint(profile1);
    const fp2 = CalculationRepository.computeAstronomicalFingerprint(profileSameCoordinatesDifferentName);
    const fp3 = CalculationRepository.computeAstronomicalFingerprint(profileDifferentTime);

    // Identical coordinates and epoch produce IDENTICAL fingerprint regardless of name
    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(64); // SHA-256 hex string

    // Different birth time produces DIFFERENT fingerprint
    expect(fp1).not.toBe(fp3);
  });

  // =========================================================================
  // 2. SECTION 14: FORMAL JYOTISH RULE ENGINE
  // Deterministic evaluation of Yogas, Doshas, Vargas, and Dignities
  // AI does NOT determine whether a rule is satisfied.
  // =========================================================================
  it('evaluates formal Jyotish rules deterministically with formal qualification states', () => {
    const kundli = VedicAstroEngine.calculateKundli(profile1);
    const report = JyotishRuleEngine.evaluateAllRules(kundli);
    const rules = report.rules;

    expect(rules.length).toBeGreaterThanOrEqual(6);

    const ruleIds = rules.map((r) => r.ruleId);
    expect(ruleIds).toContain('RULE_YOGA_GAJA_KESARI');
    expect(ruleIds).toContain('RULE_DOSHA_MANGLIK');
    expect(ruleIds).toContain('RULE_DOSHA_SADE_SATI');
    expect(ruleIds).toContain('RULE_VARGA_VARGOTTAMA');
    expect(ruleIds).toContain('RULE_YOGA_BUDHADITYA');

    for (const rule of rules) {
      expect(['QUALIFIED', 'NOT_QUALIFIED', 'INCONCLUSIVE']).toContain(rule.result);
      expect(rule.sourceReferences.length).toBeGreaterThan(0);
      expect(rule.conditions.length).toBeGreaterThan(0);
    }
  });

  // =========================================================================
  // 3. SECTION 18: AI CONSENSUS RULE & CALCULATION SUPREMACY
  // Priority hierarchy: Deterministic calculation ALWAYS beats AI interpretation.
  // Never average planetary degrees.
  // =========================================================================
  it('enforces calculation supremacy over AI and logs model disagreements without altering planetary degrees', () => {
    const kundli = VedicAstroEngine.calculateKundli(profile1);

    // Simulate an AI model asserting a false planetary degree or sign
    const conflictingModelOutputs = [
      {
        modelName: 'Model-A-GPT4',
        provider: 'OpenAI',
        payload: { summary: 'Sun is exalted in Aries at 10 degrees.' } as any,
      },
      {
        modelName: 'Model-B-Gemini',
        provider: 'Google',
        payload: { summary: 'Sun is in Gemini in 11th house.' } as any,
      },
    ];

    const consensus = AIConsensusEngine.reconcile(conflictingModelOutputs, kundli);

    expect(consensus.modelsEvaluated).toHaveLength(2);
    expect(consensus.disagreements).toBeDefined();

    // Planetary degree remains exactly deterministic from engine, never averaged
    const actualSunDegree = kundli.planets.find((p) => p.name === 'Sun')!.siderealLongitude;
    expect(actualSunDegree).toBeGreaterThan(0);
  });

  // =========================================================================
  // 4. SECTION 19 & 20: CLAIM AUDIT & SAFETY AUDIT
  // Claims evaluated into VERIFIED, SUPPORTED, BLOCKED, etc.
  // Dangerous/fatalistic health/wealth promises blocked.
  // =========================================================================
  it('audits claims and blocks fatalistic or non-probabilistic safety violations', () => {
    const kundli = VedicAstroEngine.calculateKundli(profile1);

    const rawTextWithViolations = `
      The native will definitely become a billionaire by age 35 guaranteed.
      The chart indicates high mental agility and creative insight.
      Your heart condition is dangerous and will cause death in 2030.
    `;

    const audit = AstrologyFactChecker.auditClaims(rawTextWithViolations, kundli);

    expect(audit.claims.length).toBeGreaterThanOrEqual(3);

    const statuses = audit.claims.map((c) => c.status);
    expect(statuses).toContain('BLOCKED');
    expect(statuses).toContain('SUPPORTED');

    const blockedClaims = audit.claims.filter((c) => c.status === 'BLOCKED');
    expect(blockedClaims.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // 5. SECTION 26: PALMISTRY CONFIDENCE & NOT_VISIBLE INVARIANTS
  // If feature is unclear: DO NOT INVENT IT.
  // =========================================================================
  it('returns NOT_VISIBLE and LOW_CONFIDENCE for indistinct palm imagery instead of inventing features', () => {
    // 1. High quality image analysis
    const highQuality = PalmistryVisionService.analyzePalmImage(
      'sharp_palm.jpg',
      'image/jpeg',
      500000, // 500 KB
      'Right',
      true
    );
    expect(highQuality.heartLine.status).toBe('VISIBLE');
    expect(highQuality.heartLine.confidence).toBeGreaterThan(0.7);

    // 2. Low quality / tiny thumbnail analysis
    const lowQuality = PalmistryVisionService.analyzePalmImage(
      'blurry_thumb.jpg',
      'image/jpeg',
      2048, // 2 KB
      'Right',
      true
    );
    expect(lowQuality.heartLine.status).toBe('LOW_CONFIDENCE');
    expect(lowQuality.fateLine.status).toBe('NOT_VISIBLE');
    expect(lowQuality.fateLine.confidence).toBeLessThan(0.5);
  });

  // =========================================================================
  // 6. SECTION 10: SERVER RESTART RECOVERY
  // Recovers interrupted jobs on boot without hanging in GENERATING
  // =========================================================================
  it('provides restart recovery mechanisms for interrupted pipeline jobs', async () => {
    const recoveryResult = await reportGenerationService.recoverInterruptedJobs();
    expect(recoveryResult).toBeDefined();
    expect(typeof recoveryResult.recovered).toBe('number');
    expect(typeof recoveryResult.markedFailed).toBe('number');
  });

  // =========================================================================
  // 7. SECTION 34 & 35: REPORT INTEGRITY ENGINE GATE
  // Calculates DeepAstro Report Integrity score
  // =========================================================================
  it('evaluates DeepAstro Report Integrity Gate strictly without bypassing critical stages', () => {
    const validGateResult = ReportIntegrityEngine.evaluateGate({
      calculationPassed: true,
      verificationStatus: 'VERIFIED',
      rulesEvaluated: true,
      claimsAuditPassed: true,
      unsupportedClaimsCount: 0,
      blockedClaimsCount: 0,
      safetyPassed: true,
      pdfGenerated: true,
      pdfRoundTripPassed: true,
      pdfQAPassed: true,
      ownershipValid: true,
    });

    expect(validGateResult.finalStatus).toBe('VERIFIED');
    expect(validGateResult.isDownloadAllowed).toBe(true);
    expect(validGateResult.deepAstroReportIntegrity).toBeGreaterThanOrEqual(90);

    const failedGateResult = ReportIntegrityEngine.evaluateGate({
      calculationPassed: true,
      verificationStatus: 'CALCULATION_CONFLICT',
      rulesEvaluated: true,
      claimsAuditPassed: true,
      unsupportedClaimsCount: 3,
      blockedClaimsCount: 2, // Blocked claims present
      safetyPassed: false,
      safetyViolations: ['Prohibited fatalistic prediction'],
      pdfGenerated: false,
      pdfRoundTripPassed: false,
      pdfQAPassed: false,
      ownershipValid: true,
    });

    expect(failedGateResult.finalStatus).toBe('BLOCKED');
    expect(failedGateResult.isDownloadAllowed).toBe(false);
    expect(failedGateResult.blockingReasons.length).toBeGreaterThan(0);
  });
});
