import { describe, it, expect, beforeEach } from "vitest";
import { PredictionImmutabilityGuard } from "../../../server/src/intelligence/observatory/v2/PredictionImmutabilityGuard.js";

describe("PredictionImmutabilityGuard", () => {
  beforeEach(() => { PredictionImmutabilityGuard.reset(); });

  const baseParams = {
    predictionId: "immut_001", text: "Career advancement in Q1 2027",
    claim: "Job promotion within 3 months", confidence: 0.72,
    evidenceIds: ["ev1", "ev2"],
    calculationSnapshotHash: "abc123", modelId: "gpt-4o",
    providerId: "openai", promptVersion: "v2.1",
    knowledgeVersion: "v1.0", engineVersion: "cfie_v2",
  };

  it("should freeze a prediction and verify hash", () => {
    const record = PredictionImmutabilityGuard.freeze(baseParams);
    expect(record.contentHash).toBeDefined();
    const verify = PredictionImmutabilityGuard.verify("immut_001");
    expect(verify.valid).toBe(true);
  });

  it("should throw on duplicate freeze attempt", () => {
    PredictionImmutabilityGuard.freeze(baseParams);
    expect(() => PredictionImmutabilityGuard.freeze(baseParams)).toThrow();
  });

  it("should allow outcome append without modifying frozen fields", () => {
    PredictionImmutabilityGuard.freeze(baseParams);
    PredictionImmutabilityGuard.append("immut_001", "OUTCOME", { status: "USER_CONFIRMED" }, "user_001");
    const record = PredictionImmutabilityGuard.getRecord("immut_001")!;
    expect(record.appendedRecords).toHaveLength(1);
    expect(record.appendedRecords[0].type).toBe("OUTCOME");
    // Original frozen fields must be unchanged
    expect(record.frozenFields.text).toBe("Career advancement in Q1 2027");
    const verify = PredictionImmutabilityGuard.verify("immut_001");
    expect(verify.valid).toBe(true);
  });

  it("should detect hash mismatch if frozen fields mutated externally", () => {
    const record = PredictionImmutabilityGuard.freeze(baseParams);
    // Simulate tampering
    (record.frozenFields as any).confidence = 0.99;
    const verify = PredictionImmutabilityGuard.verify("immut_001");
    expect(verify.valid).toBe(false);
    expect(verify.reason).toContain("hash mismatch");
  });
});
