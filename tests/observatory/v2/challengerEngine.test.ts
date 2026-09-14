import { describe, it, expect } from "vitest";
import { PredictionChallengerEngine } from "../../../server/src/intelligence/observatory/v2/PredictionChallengerEngine.js";

describe("PredictionChallengerEngine", () => {
  const highQualityParams = {
    predictionId: "test_001",
    forecastText: "Career advancement opportunity in the technology sector during Saturn-Jupiter period within the next 3 months.",
    evidenceCount: 5, contradictionCount: 0, confidence: 0.72,
    hasTimeWindow: true, hasDomain: true, hasDirection: true,
  };
  const barnumParams = {
    predictionId: "test_002",
    forecastText: "Something important will happen. Change is coming. Your life will improve.",
    evidenceCount: 1, contradictionCount: 0, confidence: 0.9,
    hasTimeWindow: false, hasDomain: false, hasDirection: false,
  };

  it("should PASS a high-quality specific prediction", () => {
    const result = PredictionChallengerEngine.challenge(highQualityParams);
    expect(result.predictionId).toBe("test_001");
    expect(["PASS", "REQUEST_CONTEXT"]).toContain(result.recommendation);
    expect(result.testabilityScore).toBeGreaterThan(0.5);
  });

  it("should SUPPRESS a Barnum statement", () => {
    const result = PredictionChallengerEngine.challenge(barnumParams);
    expect(["SUPPRESS", "SOFTEN"]).toContain(result.recommendation);
    expect(result.biasFlags).toContain("BARNUM_STATEMENT");
    expect(result.testabilityScore).toBeLessThan(0.4);
  });

  it("should detect overconfidence when evidence is low", () => {
    const result = PredictionChallengerEngine.challenge({
      ...highQualityParams, confidence: 0.95, evidenceCount: 1,
    });
    expect(result.biasFlags).toContain("OVERCONFIDENCE");
    expect(["SOFTEN", "SUPPRESS"]).toContain(result.recommendation);
  });

  it("should ask for context when time window is missing", () => {
    const result = PredictionChallengerEngine.challenge({
      ...highQualityParams, hasTimeWindow: false,
    });
    expect(["REQUEST_CONTEXT", "SOFTEN"]).toContain(result.recommendation);
  });

  it("should produce all required fields in PredictionChallengeResult", () => {
    const result = PredictionChallengerEngine.challenge(highQualityParams);
    expect(result).toHaveProperty("strengths");
    expect(result).toHaveProperty("weaknesses");
    expect(result).toHaveProperty("supportingEvidence");
    expect(result).toHaveProperty("contradictoryEvidence");
    expect(result).toHaveProperty("assumptions");
    expect(result).toHaveProperty("alternativeInterpretations");
    expect(result).toHaveProperty("falsificationConditions");
    expect(result).toHaveProperty("confidenceCritique");
    expect(result).toHaveProperty("overallRisk");
  });

  it("should include falsification conditions", () => {
    const result = PredictionChallengerEngine.challenge(highQualityParams);
    expect(result.falsificationConditions.length).toBeGreaterThan(0);
  });
});
