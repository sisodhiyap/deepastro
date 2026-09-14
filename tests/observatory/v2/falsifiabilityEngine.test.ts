import { describe, it, expect } from "vitest";
import { PredictionFalsifiabilityEngine } from "../../../server/src/intelligence/observatory/v2/PredictionFalsifiabilityEngine.js";

describe("PredictionFalsifiabilityEngine", () => {
  it("should return NO for meaningless prediction", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({ predictionId: "t1", forecastText: "Something important will happen." });
    expect(r.level).toBe("NO");
    expect(r.score).toBeLessThan(0.3);
  });

  it("should return YES for fully specified prediction", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({
      predictionId: "t2",
      forecastText: "Career promotion in technology domain within Q1 2027",
      domain: "CAREER", eventDescription: "Job promotion or significant role change in technology",
      direction: "POSITIVE", timeWindowStart: "2027-01-01", timeWindowEnd: "2027-03-31",
      magnitude: "SIGNIFICANT", contextDescription: "Professional corporate environment",
    });
    expect(r.level).toBe("YES");
    expect(r.score).toBeGreaterThan(0.65);
    expect(r.missingComponents).toHaveLength(0);
  });

  it("should return PARTIAL when time window missing", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({
      predictionId: "t3",
      forecastText: "Career change in technology sector",
      domain: "CAREER", eventDescription: "Job change in technology",
      direction: "POSITIVE",
    });
    expect(r.level).toBe("PARTIAL");
    expect(r.missingComponents).toContain("TIME_WINDOW");
  });

  it("should flag missing domain as gap", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({
      predictionId: "t4", forecastText: "An event will occur within 3 months",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-03-31",
    });
    expect(r.missingComponents).toContain("DOMAIN");
  });

  it("should reject 'change is coming' as non-falsifiable", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({ predictionId: "t5", forecastText: "Change is coming soon" });
    expect(r.level).toBe("NO");
  });
});
