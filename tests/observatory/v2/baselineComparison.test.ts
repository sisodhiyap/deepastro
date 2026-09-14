import { describe, it, expect } from "vitest";
import { BaselineComparisonEngine } from "../../../server/src/intelligence/observatory/v2/BaselineComparisonEngine.js";

describe("BaselineComparisonEngine", () => {
  it("should return INSUFFICIENT_DATA with small sample", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.15, deepAstroEventAccuracy: 0.6, deepAstroCoverage: 0.8, sampleSize: 5,
    });
    expect(r.verdict).toBe("INSUFFICIENT_DATA");
    expect(r.baselines).toHaveLength(0);
  });

  it("should produce 5 baselines with sufficient sample", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.15, deepAstroEventAccuracy: 0.65, deepAstroCoverage: 0.85, sampleSize: 20,
    });
    expect(r.baselines).toHaveLength(5);
    expect(r.baselines.map(b => b.model)).toContain("BASELINE_RANDOM");
    expect(r.baselines.map(b => b.model)).toContain("DETERMINISTIC_FLOOR");
  });

  it("should compute improvement over random", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.18, deepAstroEventAccuracy: 0.60, deepAstroCoverage: 0.80, sampleSize: 20,
    });
    expect(r.improvementOverRandom).toBeDefined();
    expect(r.improvementOverRandom).toBeCloseTo(0.60 - 0.5, 2);
  });

  it("should not claim success with no improvement", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.28, deepAstroEventAccuracy: 0.48, deepAstroCoverage: 0.60, sampleSize: 20,
    });
    expect(["NO_IMPROVEMENT", "BEATS_RANDOM"]).toContain(r.verdict);
  });
});
