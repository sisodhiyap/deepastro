/**
 * ReportIntegrityEngine
 * The strict quality gate for DeepAstro reports.
 * Enforces the integrity contract before any report is finalized as VERIFIED.
 * Never bypasses the gate.
 */

export interface IntegrityGateInputs {
  calculationPassed: boolean;
  verificationStatus: 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'REVIEW_REQUIRED' | 'CALCULATION_CONFLICT';
  rulesEvaluated: boolean;
  claimsAuditPassed: boolean;
  unsupportedClaimsCount: number;
  blockedClaimsCount: number;
  safetyPassed: boolean;
  safetyViolations: string[];
  pdfGenerated: boolean;
  pdfRoundTripPassed: boolean;
  pdfQAPassed: boolean;
  ownershipValid: boolean;
}

export interface IntegrityCheckDetail {
  checkId: string;
  name: string;
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface IntegrityGateResult {
  finalStatus: 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'REVIEW_REQUIRED' | 'BLOCKED';
  deepAstroReportIntegrity: number; // 0-100 Score strictly named "DeepAstro Report Integrity"
  isDownloadAllowed: boolean;
  checks: IntegrityCheckDetail[];
  blockingReasons: string[];
  warnings: string[];
}

export class ReportIntegrityEngine {
  public static evaluateGate(inputs: IntegrityGateInputs): IntegrityGateResult {
    const checks: IntegrityCheckDetail[] = [];
    const blockingReasons: string[] = [];
    const warnings: string[] = [];

    // 1. Calculation Check
    checks.push({
      checkId: 'CHK_CALC_01',
      name: 'Deterministic Astronomical Calculation',
      passed: inputs.calculationPassed,
      severity: 'CRITICAL',
      message: inputs.calculationPassed
        ? 'Planetary degrees and houses computed deterministically.'
        : 'Astronomical calculation failed or yielded corrupt coordinate values.',
    });
    if (!inputs.calculationPassed) blockingReasons.push('Deterministic calculation failed.');

    // 2. Astronomical Independent Verification
    const verificationPass = inputs.verificationStatus === 'VERIFIED' || inputs.verificationStatus === 'VERIFIED_WITH_WARNINGS';
    checks.push({
      checkId: 'CHK_ASTRO_VERIFY_02',
      name: 'Astronomical Verification Engine',
      passed: verificationPass,
      severity: 'CRITICAL',
      message: `Independent recalculation returned ${inputs.verificationStatus}.`,
    });
    if (inputs.verificationStatus === 'CALCULATION_CONFLICT') {
      blockingReasons.push('Independent astronomical recalculation detected a calculation conflict.');
    } else if (inputs.verificationStatus === 'REVIEW_REQUIRED') {
      warnings.push('Astronomical verification requires astrologer review.');
    }

    // 3. Formal Jyotish Rules
    checks.push({
      checkId: 'CHK_RULES_03',
      name: 'Formal Jyotish Rule Evaluation',
      passed: inputs.rulesEvaluated,
      severity: 'HIGH',
      message: inputs.rulesEvaluated
        ? 'Classical yoga, dosha, and dignity rules formally evaluated.'
        : 'Rule evaluation omitted or unverified.',
    });
    if (!inputs.rulesEvaluated) warnings.push('Jyotish rule engine did not evaluate all required rules.');

    // 4. Claims Audit
    const claimsPass = inputs.claimsAuditPassed && inputs.blockedClaimsCount === 0;
    checks.push({
      checkId: 'CHK_CLAIMS_04',
      name: 'Claim-Level Fact Checking',
      passed: claimsPass,
      severity: 'CRITICAL',
      message: `Audit completed with ${inputs.unsupportedClaimsCount} unsupported and ${inputs.blockedClaimsCount} blocked claims.`,
    });
    if (inputs.blockedClaimsCount > 0) {
      blockingReasons.push(`${inputs.blockedClaimsCount} generated claim(s) were flagged as blocked/unsupported.`);
    } else if (inputs.unsupportedClaimsCount > 0) {
      warnings.push(`${inputs.unsupportedClaimsCount} claim(s) lack direct scriptural or mathematical citation.`);
    }

    // 5. Safety Audit
    const safetyViolations = inputs.safetyViolations || [];
    checks.push({
      checkId: 'CHK_SAFETY_05',
      name: 'Ethics and Safety Audit',
      passed: inputs.safetyPassed,
      severity: 'CRITICAL',
      message: inputs.safetyPassed
        ? 'Zero medical diagnosis, fatalistic claims, or guaranteed wealth predictions.'
        : `Safety violations detected: ${safetyViolations.length > 0 ? safetyViolations.join(', ') : 'Ethics/Safety policy violations'}`,
    });
    if (!inputs.safetyPassed) {
      blockingReasons.push(`Safety gate failed: ${safetyViolations.length > 0 ? safetyViolations.join('; ') : 'Prohibited fatalistic or non-probabilistic claims detected'}`);
    }

    // 6. PDF Generation
    checks.push({
      checkId: 'CHK_PDF_GEN_06',
      name: 'Binary PDF Artifact Generation',
      passed: inputs.pdfGenerated,
      severity: 'CRITICAL',
      message: inputs.pdfGenerated ? 'Valid %PDF- binary generated.' : 'PDF binary generation failed.',
    });
    if (!inputs.pdfGenerated) blockingReasons.push('Binary PDF document was not generated.');

    // 7. PDF Round-Trip Verification
    checks.push({
      checkId: 'CHK_PDF_ROUNDTRIP_07',
      name: 'PDF Text Extraction Round-Trip',
      passed: inputs.pdfRoundTripPassed,
      severity: 'CRITICAL',
      message: inputs.pdfRoundTripPassed
        ? 'Extracted PDF metrics match Report JSON verbatim.'
        : 'PDF text extraction failed or exhibited coordinate drift.',
    });
    if (!inputs.pdfRoundTripPassed) blockingReasons.push('PDF round-trip verification failed.');

    // 8. PDF Visual QA
    checks.push({
      checkId: 'CHK_PDF_QA_08',
      name: 'PDF Visual QA & Structure Inspection',
      passed: inputs.pdfQAPassed,
      severity: 'HIGH',
      message: inputs.pdfQAPassed ? 'All pages, tables, glyphs, and headings verified.' : 'Visual QA flagged structure issues.',
    });
    if (!inputs.pdfQAPassed) warnings.push('PDF visual QA detected warnings or structural anomalies.');

    // 9. Ownership Verification
    checks.push({
      checkId: 'CHK_OWNERSHIP_09',
      name: 'User Scoping & Ownership Gate',
      passed: inputs.ownershipValid,
      severity: 'CRITICAL',
      message: inputs.ownershipValid ? 'Report ownership properly scoped.' : 'Invalid ownership assignment.',
    });
    if (!inputs.ownershipValid) blockingReasons.push('User ownership check failed.');

    // Determine Final Status
    let finalStatus: IntegrityGateResult['finalStatus'];
    if (blockingReasons.length > 0) {
      finalStatus = 'BLOCKED';
    } else if (warnings.length > 0 || inputs.verificationStatus === 'VERIFIED_WITH_WARNINGS') {
      finalStatus = 'VERIFIED_WITH_WARNINGS';
    } else {
      finalStatus = 'VERIFIED';
    }

    // Calculate DeepAstro Report Integrity Score (0-100)
    let score = 100;
    if (!inputs.calculationPassed) score -= 40;
    if (inputs.verificationStatus === 'CALCULATION_CONFLICT') score -= 30;
    if (inputs.verificationStatus === 'VERIFIED_WITH_WARNINGS') score -= 10;
    if (!inputs.rulesEvaluated) score -= 15;
    if (inputs.blockedClaimsCount > 0) score -= 25;
    if (inputs.unsupportedClaimsCount > 0) score -= inputs.unsupportedClaimsCount * 5;
    if (!inputs.safetyPassed) score -= 40;
    if (!inputs.pdfGenerated) score -= 20;
    if (!inputs.pdfRoundTripPassed) score -= 25;
    if (!inputs.pdfQAPassed) score -= 10;
    if (!inputs.ownershipValid) score -= 30;

    const deepAstroReportIntegrity = Math.max(0, Math.min(100, score));
    const isDownloadAllowed = finalStatus !== 'BLOCKED' && inputs.pdfRoundTripPassed && inputs.pdfGenerated;

    return {
      finalStatus,
      deepAstroReportIntegrity,
      isDownloadAllowed,
      checks,
      blockingReasons,
      warnings,
    };
  }
}
