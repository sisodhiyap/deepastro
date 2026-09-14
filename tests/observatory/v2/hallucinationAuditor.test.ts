import { describe, it, expect } from "vitest";
import { PredictionHallucinationAuditor } from "../../../server/src/intelligence/observatory/v2/PredictionHallucinationAuditor.js";

describe("PredictionHallucinationAuditor", () => {
  it("should return CLEAN for a normal forecast", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "h1",
      forecastText: "Saturn in Aquarius during Jupiter Mahadasha may bring career restructuring.",
    });
    expect(r.overallSeverity).toBe("CLEAN");
    expect(r.detectedHallucinations).toHaveLength(0);
  });

  it("should detect FABRICATED_SOURCE â†’ CRITICAL_QUALITY_FAILURE", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "h2",
      forecastText: "According to a recent study, astrology predicts career outcomes with 85% accuracy.",
    });
    expect(r.overallSeverity).toBe("CRITICAL_QUALITY_FAILURE");
    const fabricated = r.detectedHallucinations.find(h => h.type === "FABRICATED_SOURCE" || h.type === "UNSUPPORTED_STATISTIC");
    expect(fabricated).toBeDefined();
  });

  it("should detect FALSE_CERTAINTY â†’ HIGH_RISK or CRITICAL", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "h3",
      forecastText: "Your promotion is guaranteed to occur. Astrology has proven this 100% accurate.",
    });
    expect(["HIGH_RISK", "CRITICAL_QUALITY_FAILURE"]).toContain(r.overallSeverity);
  });

  it("should detect invented astronomical fact â†’ CRITICAL_QUALITY_FAILURE", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "h4",
      forecastText: "Sun is exalted in Gemini and this brings financial success.",
    });
    expect(r.overallSeverity).toBe("CRITICAL_QUALITY_FAILURE");
    expect(r.detectedHallucinations.some(h => h.type === "INVENTED_ASTRONOMICAL_FACT")).toBe(true);
  });

  it("should detect unsupported statistic", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "h5",
      forecastText: "In 93% of cases, this planetary combination leads to marriage.",
    });
    expect(["HIGH_RISK", "CRITICAL_QUALITY_FAILURE"]).toContain(r.overallSeverity);
    expect(r.detectedHallucinations.some(h => h.type === "UNSUPPORTED_STATISTIC")).toBe(true);
  });
});
