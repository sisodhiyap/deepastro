import { describe, it, expect } from "vitest";
import { PredictionQualityVectorEngine } from "../../../server/src/intelligence/observatory/v2/PredictionQualityVectorEngine.js";

describe("PredictionQualityVectorEngine", () => {
  const baseParams = {
    predictionId: "qv_test_01",
    evidenceCount: 4, contradictionCount: 0, confidence: 0.72,
    hasTimeWindow: true, hasDomain: true, hasDirection: true, hasMagnitude: true,
    isFalsifiable: true, falsifiabilityScore: 0.8, hallucinationRisk: 0.0,
    modelAgreementScore: 0.9, hasCalculationAnchor: true, usedPostCutoffData: false,
    biasFlags: [], unsupportedClaimRate: 0.05, overconfidentLanguage: false,
  };

  it("should return all 14 dimensions", () => {
    const v = PredictionQualityVectorEngine.compute(baseParams);
    expect(v).toHaveProperty("evidence_quality");
    expect(v).toHaveProperty("testability");
    expect(v).toHaveProperty("timing_precision");
    expect(v).toHaveProperty("event_specificity");
    expect(v).toHaveProperty("context_specificity");
    expect(v).toHaveProperty("confidence_calibration");
    expect(v).toHaveProperty("contradiction_level");
    expect(v).toHaveProperty("unsupported_claim_risk");
    expect(v).toHaveProperty("hallucination_risk");
    expect(v).toHaveProperty("bias_risk");
    expect(v).toHaveProperty("falsifiability");
    expect(v).toHaveProperty("model_agreement");
    expect(v).toHaveProperty("calculation_integrity");
    expect(v).toHaveProperty("temporal_integrity");
  });

  it("should never return a single collapsed score", () => {
    const v = PredictionQualityVectorEngine.compute(baseParams);
    expect(v).not.toHaveProperty("overallScore");
    expect(v).not.toHaveProperty("totalScore");
  });

  it("should set temporal_integrity to 0 when post-cutoff data used", () => {
    const v = PredictionQualityVectorEngine.compute({ ...baseParams, usedPostCutoffData: true });
    expect(v.temporal_integrity).toBe(0.0);
    expect(v.notes.some(n => n.includes("CRITICAL"))).toBe(true);
  });

  it("should reduce confidence_calibration for overconfident language", () => {
    const normal = PredictionQualityVectorEngine.compute(baseParams);
    const overconf = PredictionQualityVectorEngine.compute({ ...baseParams, overconfidentLanguage: true });
    expect(overconf.confidence_calibration).toBeLessThan(normal.confidence_calibration);
  });

  it("should increase contradiction_level proportionally", () => {
    const low = PredictionQualityVectorEngine.compute({ ...baseParams, contradictionCount: 0 });
    const high = PredictionQualityVectorEngine.compute({ ...baseParams, contradictionCount: 3 });
    expect(high.contradiction_level).toBeGreaterThan(low.contradiction_level);
  });

  it("should cap all dimensions between 0 and 1", () => {
    const v = PredictionQualityVectorEngine.compute(baseParams);
    const dims = [v.evidence_quality, v.testability, v.timing_precision, v.event_specificity,
      v.context_specificity, v.confidence_calibration, v.contradiction_level,
      v.unsupported_claim_risk, v.hallucination_risk, v.bias_risk, v.falsifiability,
      v.model_agreement, v.calculation_integrity, v.temporal_integrity];
    for (const d of dims) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    }
  });
});
