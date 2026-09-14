import { describe, it, expect, beforeEach } from "vitest";
import { DomainCalibrationEngine } from "../../../server/src/intelligence/observatory/v2/DomainCalibrationEngine.js";

describe("DomainCalibrationEngine", () => {
  beforeEach(() => { DomainCalibrationEngine.reset(); });

  it("should return INSUFFICIENT_SAMPLE when less than 5 samples", () => {
    DomainCalibrationEngine.addSample("CAREER", 0.7, 1);
    DomainCalibrationEngine.addSample("CAREER", 0.6, 0);
    const r = DomainCalibrationEngine.getReport("CAREER");
    expect(r.status).toBe("INSUFFICIENT_SAMPLE");
    expect(r.brierScore).toBeNull();
  });

  it("should compute Brier score with sufficient samples", () => {
    for (let i = 0; i < 6; i++) DomainCalibrationEngine.addSample("FINANCE", 0.7, i < 4 ? 1 : 0);
    const r = DomainCalibrationEngine.getReport("FINANCE");
    expect(r.status).toBe("SUFFICIENT");
    expect(r.brierScore).not.toBeNull();
    expect(r.brierScore!).toBeGreaterThan(0);
  });

  it("should track domains independently", () => {
    for (let i = 0; i < 6; i++) DomainCalibrationEngine.addSample("CAREER", 0.8, 1);
    for (let i = 0; i < 6; i++) DomainCalibrationEngine.addSample("RELATIONSHIPS", 0.5, 0);
    const career = DomainCalibrationEngine.getReport("CAREER");
    const rel = DomainCalibrationEngine.getReport("RELATIONSHIPS");
    expect(career.brierScore).not.toEqual(rel.brierScore);
  });

  it("should return all domain reports", () => {
    const all = DomainCalibrationEngine.getAllReports();
    expect(all.length).toBeGreaterThan(5);
  });
});
