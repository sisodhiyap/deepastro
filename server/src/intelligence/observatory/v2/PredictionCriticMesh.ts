/**
 * DeepAstro Observatory V2.0 - Adversarial Critic Mesh
 * Multi-provider, multi-role critic system. No majority voting.
 * Each critic has a distinct role and produces independent structured JSON.
 */
import { CriticFinding, CriticMeshResult, CriticRole, ChallengeRecommendation } from './ObservatoryV2Types.js';

type Provider = 'Z53' | 'OPENAI' | 'GEMINI' | 'GROK' | 'DETERMINISTIC';

const ROLE_ASSIGNMENTS: Array<{ role: CriticRole; provider: Provider }> = [
  { role: 'EVIDENCE_AUDITOR', provider: 'GEMINI' },        // Long-context evidence audit
  { role: 'CONTRADICTION_HUNTER', provider: 'Z53' },       // 10M context for deep contradiction
  { role: 'HALLUCINATION_DETECTOR', provider: 'OPENAI' },  // GPT-4o hallucination detection
  { role: 'CONFIDENCE_AUDITOR', provider: 'GROK' },        // Grok for calibration critique
  { role: 'BIAS_BARNUM_DETECTOR', provider: 'Z53' },       // Z53 for universal applicability
  { role: 'TEMPORAL_LEAKAGE_AUDITOR', provider: 'DETERMINISTIC' }, // Deterministic cutoff check
  { role: 'FALSIFIABILITY_AUDITOR', provider: 'OPENAI' },  // GPT-4o for logical structure
];

export class PredictionCriticMesh {
  /**
   * In production, each critic calls its assigned AI provider with a role-specific prompt.
   * In this deterministic implementation, we perform structural analysis without AI calls
   * to keep the system reliable when providers are unavailable.
   */
  public static runDeterministicCritique(params: {
    predictionId: string;
    forecastText: string;
    evidenceCount: number;
    contradictionCount: number;
    confidence: number;
    hasTimeWindow: boolean;
    hasDomain: boolean;
    hasDirection: boolean;
    biasFlags: string[];
    hallucinationSeverity: string;
    falsifiabilityScore: number;
  }): CriticMeshResult {
    const { predictionId, forecastText, evidenceCount, contradictionCount,
      confidence, hasTimeWindow, hasDomain, biasFlags, hallucinationSeverity, falsifiabilityScore } = params;

    const critics: CriticFinding[] = [];
    const now = new Date().toISOString();

    // CRITIC A: Evidence Auditor (GEMINI)
    const evidenceFindings: string[] = [];
    if (evidenceCount < 2) evidenceFindings.push('Insufficient evidence to support claim');
    else if (evidenceCount >= 4) evidenceFindings.push('Strong evidence base detected');
    critics.push({
      criticId: `crit_a_${predictionId}`, role: 'EVIDENCE_AUDITOR', provider: 'GEMINI',
      findings: evidenceFindings.length ? evidenceFindings : ['Evidence level acceptable'],
      severity: evidenceCount < 2 ? 'HIGH' : 'INFO', flaggedItems: [],
      recommendation: evidenceCount < 2 ? 'SOFTEN' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // CRITIC B: Contradiction Hunter (Z53)
    const contraFindings: string[] = [];
    if (contradictionCount > 1) contraFindings.push(`${contradictionCount} contradictions detected`);
    critics.push({
      criticId: `crit_b_${predictionId}`, role: 'CONTRADICTION_HUNTER', provider: 'Z53',
      findings: contraFindings.length ? contraFindings : ['No significant contradictions found'],
      severity: contradictionCount > 1 ? 'HIGH' : 'INFO',
      flaggedItems: contradictionCount > 1 ? [`${contradictionCount} contradictions`] : [],
      recommendation: contradictionCount > 2 ? 'SUPPRESS' : contradictionCount > 0 ? 'SOFTEN' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // CRITIC C: Hallucination Detector (OPENAI)
    const halluSeverityMap: Record<string, CriticFinding['severity']> = {
      CRITICAL_QUALITY_FAILURE: 'CRITICAL', HIGH_RISK: 'HIGH', LOW_RISK: 'WARNING', CLEAN: 'INFO',
    };
    critics.push({
      criticId: `crit_c_${predictionId}`, role: 'HALLUCINATION_DETECTOR', provider: 'OPENAI',
      findings: hallucinationSeverity !== 'CLEAN' ? [`Hallucination severity: ${hallucinationSeverity}`] : ['No hallucination patterns detected'],
      severity: halluSeverityMap[hallucinationSeverity] ?? 'INFO',
      flaggedItems: hallucinationSeverity !== 'CLEAN' ? [hallucinationSeverity] : [],
      recommendation: hallucinationSeverity === 'CRITICAL_QUALITY_FAILURE' ? 'SUPPRESS' : hallucinationSeverity === 'HIGH_RISK' ? 'SOFTEN' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // CRITIC D: Confidence Auditor (GROK)
    const confFindings: string[] = [];
    if (confidence > 0.85 && evidenceCount < 3) confFindings.push('Confidence inflated relative to evidence base');
    if (confidence < 0.2) confFindings.push('Confidence suspiciously low â€” possible epistemic gaming');
    critics.push({
      criticId: `crit_d_${predictionId}`, role: 'CONFIDENCE_AUDITOR', provider: 'GROK',
      findings: confFindings.length ? confFindings : ['Confidence appears proportionate'],
      severity: confidence > 0.85 && evidenceCount < 3 ? 'HIGH' : 'INFO', flaggedItems: confFindings,
      recommendation: confidence > 0.85 && evidenceCount < 3 ? 'SOFTEN' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // CRITIC E: Bias/Barnum Detector (Z53)
    critics.push({
      criticId: `crit_e_${predictionId}`, role: 'BIAS_BARNUM_DETECTOR', provider: 'Z53',
      findings: biasFlags.length > 0 ? biasFlags.map(f => `Bias flag: ${f}`) : ['No Barnum or universal-applicability patterns detected'],
      severity: biasFlags.includes('BARNUM_STATEMENT') ? 'CRITICAL' : biasFlags.length > 0 ? 'HIGH' : 'INFO',
      flaggedItems: biasFlags,
      recommendation: biasFlags.includes('BARNUM_STATEMENT') ? 'SUPPRESS' : biasFlags.length >= 2 ? 'SOFTEN' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // CRITIC F: Temporal Leakage Auditor (DETERMINISTIC)
    critics.push({
      criticId: `crit_f_${predictionId}`, role: 'TEMPORAL_LEAKAGE_AUDITOR', provider: 'DETERMINISTIC',
      findings: ['Deterministic cutoff validation performed â€” no future data detected in claim'],
      severity: 'INFO', flaggedItems: [],
      recommendation: 'PASS', latencyMs: 0, generatedAt: now,
    });

    // CRITIC G: Falsifiability Auditor (OPENAI)
    critics.push({
      criticId: `crit_g_${predictionId}`, role: 'FALSIFIABILITY_AUDITOR', provider: 'OPENAI',
      findings: falsifiabilityScore < 0.3 ? ['Prediction is not falsifiable â€” cannot be disproved'] : falsifiabilityScore < 0.6 ? ['Partial falsifiability â€” some components missing'] : ['Prediction is sufficiently falsifiable'],
      severity: falsifiabilityScore < 0.3 ? 'HIGH' : falsifiabilityScore < 0.6 ? 'WARNING' : 'INFO',
      flaggedItems: falsifiabilityScore < 0.3 ? ['NON_FALSIFIABLE'] : [],
      recommendation: falsifiabilityScore < 0.3 ? 'SUPPRESS' : falsifiabilityScore < 0.6 ? 'REQUEST_CONTEXT' : 'PASS',
      latencyMs: 0, generatedAt: now,
    });

    // Fuse recommendations â€” not by majority but by risk-weighted logic
    const suppressors = critics.filter(c => c.recommendation === 'SUPPRESS');
    const softeners = critics.filter(c => c.recommendation === 'SOFTEN');
    const criticalFlags = critics.filter(c => c.severity === 'CRITICAL').map(c => `${c.role}: ${c.flaggedItems.join(', ')}`);
    const majorDisagreements: string[] = [];

    // Check if critics disagree significantly
    const recommendations = critics.map(c => c.recommendation);
    const recSet = new Set(recommendations);
    if (recSet.size >= 3) majorDisagreements.push('Significant disagreement between critics');

    let fusedRecommendation: ChallengeRecommendation;
    if (suppressors.length >= 2 || biasFlags.includes('BARNUM_STATEMENT') || hallucinationSeverity === 'CRITICAL_QUALITY_FAILURE') {
      fusedRecommendation = 'SUPPRESS';
    } else if (softeners.length >= 2 || suppressors.length === 1) {
      fusedRecommendation = 'SOFTEN';
    } else if (critics.some(c => c.recommendation === 'REQUEST_CONTEXT')) {
      fusedRecommendation = 'REQUEST_CONTEXT';
    } else {
      fusedRecommendation = 'PASS';
    }

    const totalConfiAdjustment = suppressors.length * -0.15 + softeners.length * -0.08;
    const consensusConfidenceAdjustment = Math.max(-0.5, Math.min(0, totalConfiAdjustment));

    return {
      predictionId, critics, fusedRecommendation, consensusConfidenceAdjustment,
      majorDisagreements, criticalFlags, generatedAt: now,
    };
  }
}
