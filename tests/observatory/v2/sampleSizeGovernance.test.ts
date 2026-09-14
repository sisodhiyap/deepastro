import { describe, it, expect } from "vitest";
import { BaselineComparisonEngine } from "../../../server/src/intelligence/observatory/v2/BaselineComparisonEngine.js";
import { DomainCalibrationEngine } from "../../../server/src/intelligence/observatory/v2/DomainCalibrationEngine.js";

describe("Sample Size Governance", () => {
  it("should return INSUFFICIENT_DATA when N < 10 in baseline comparison", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.05, deepAstroEventAccuracy: 0.95, deepAstroCoverage: 1.0, sampleSize: 3,
    });
    expect(r.verdict).toBe("INSUFFICIENT_DATA");
    // No misleading stats like "95% accurate" from 3 predictions
  });

  it("should enforce minimum sample in domain calibration", () => {
    DomainCalibrationEngine.reset();
    DomainCalibrationEngine.addSample("CAREER", 0.9, 1);
    DomainCalibrationEngine.addSample("CAREER", 0.8, 1);
    const r = DomainCalibrationEngine.getReport("CAREER");
    expect(r.status).toBe("INSUFFICIENT_SAMPLE");
    expect(r.brierScore).toBeNull();
    expect(r.eventAccuracy).toBeNull();
  });
});
