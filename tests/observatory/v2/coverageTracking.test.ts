import { describe, it, expect } from "vitest";
import { CoverageTrackingEngine } from "../../../server/src/intelligence/observatory/v2/CoverageTrackingEngine.js";

describe("CoverageTrackingEngine", () => {
  it("should compute coverage correctly", () => {
    const m = CoverageTrackingEngine.compute({
      totalPredictions: 100, testablePredictions: 80, confirmedOutcomes: 40,
      partialOutcomes: 10, unknownOutcomes: 50, suppressedPredictions: 10,
    });
    expect(m.coverage).toBeCloseTo(0.40, 2);
    expect(m.suppressionRate).toBeCloseTo(0.10, 2);
    expect(m.unknownRate).toBeCloseTo(0.50, 2);
  });

  it("should detect gaming through suppression", () => {
    const before = CoverageTrackingEngine.compute({
      totalPredictions: 100, testablePredictions: 80, confirmedOutcomes: 30,
      partialOutcomes: 5, unknownOutcomes: 65, suppressedPredictions: 5,
      correctPredictions: 20,
    });
    const after = CoverageTrackingEngine.compute({
      totalPredictions: 100, testablePredictions: 80, confirmedOutcomes: 30,
      partialOutcomes: 5, unknownOutcomes: 35, suppressedPredictions: 30,
      correctPredictions: 20,
    });
    const check = CoverageTrackingEngine.validateSuppression(before, after);
    expect(check.isGaming).toBe(true);
  });

  it("should report both accuracy and coverage dimensions", () => {
    const m = CoverageTrackingEngine.compute({
      totalPredictions: 50, testablePredictions: 40, confirmedOutcomes: 20,
      partialOutcomes: 5, unknownOutcomes: 25, suppressedPredictions: 0,
      correctPredictions: 16,
    });
    expect(m.precision).not.toBeNull();
    expect(m.coverage).toBeGreaterThan(0);
  });
});
