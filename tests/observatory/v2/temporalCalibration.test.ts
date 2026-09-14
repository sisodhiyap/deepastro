import { describe, it, expect, beforeEach } from "vitest";
import { TemporalCalibrationEngine } from "../../../server/src/intelligence/observatory/v2/TemporalCalibrationEngine.js";

describe("TemporalCalibrationEngine", () => {
  beforeEach(() => { TemporalCalibrationEngine.reset(); });

  it("should return INSUFFICIENT_SAMPLE for horizon with <3 samples", () => {
    TemporalCalibrationEngine.addSample({ horizon: "1M", predictedDate: "2027-02-01", confirmed: true });
    const r = TemporalCalibrationEngine.getReport("1M");
    expect(r.status).toBe("INSUFFICIENT_SAMPLE");
  });

  it("should compute outcomeRate with sufficient samples", () => {
    for (let i = 0; i < 4; i++) {
      TemporalCalibrationEngine.addSample({ horizon: "3M", predictedDate: "2027-04-01", confirmed: i < 2 });
    }
    const r = TemporalCalibrationEngine.getReport("3M");
    expect(r.status).toBe("SUFFICIENT");
    expect(r.outcomeRate).toBeCloseTo(0.5, 1);
  });

  it("should apply different tolerance per horizon", () => {
    const r1 = TemporalCalibrationEngine.getReport("1M");
    const r5 = TemporalCalibrationEngine.getReport("5Y");
    expect(r5.uncertaintyBand).toBeGreaterThan(r1.uncertaintyBand);
  });
});
