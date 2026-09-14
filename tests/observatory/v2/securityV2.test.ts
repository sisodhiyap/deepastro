import { describe, it, expect, beforeEach } from "vitest";
import { PredictionImmutabilityGuard } from "../../../server/src/intelligence/observatory/v2/PredictionImmutabilityGuard.js";
import { SelectionBiasGuard } from "../../../server/src/intelligence/observatory/v2/SelectionBiasGuard.js";
import { PredictionDeduplicationEngine } from "../../../server/src/intelligence/observatory/v2/PredictionDeduplicationEngine.js";
import { DatasetRegistry } from "../../../server/src/intelligence/observatory/v2/DatasetRegistry.js";

beforeEach(() => { PredictionImmutabilityGuard.reset(); DatasetRegistry["datasets"].clear(); });

describe("Security V2", () => {
  it("client cannot set prediction_id on an already-frozen prediction", () => {
    PredictionImmutabilityGuard.freeze({
      predictionId: "sec_001", text: "Career change.", claim: "Job change",
      confidence: 0.65, evidenceIds: ["ev1"], calculationSnapshotHash: "ch1",
      modelId: "gpt-4o", providerId: "openai", promptVersion: "v1",
      knowledgeVersion: "v1", engineVersion: "cfie_v2",
    });
    expect(() => PredictionImmutabilityGuard.freeze({
      predictionId: "sec_001", text: "Injected text.", claim: "Injected claim",
      confidence: 0.99, evidenceIds: [], calculationSnapshotHash: "injected",
      modelId: "malicious", providerId: "attacker", promptVersion: "v0",
      knowledgeVersion: "v0", engineVersion: "evil",
    })).toThrow(/already frozen/);
  });

  it("client cannot override confidence field", () => {
    const r = PredictionImmutabilityGuard.freeze({
      predictionId: "sec_002", text: "Finance.", claim: "Investment", confidence: 0.60,
      evidenceIds: [], calculationSnapshotHash: "h2", modelId: "gemini", providerId: "google",
      promptVersion: "v1", knowledgeVersion: "v1", engineVersion: "cfie_v2",
    });
    expect(r.frozenFields.confidence).toBe(0.60);
    // Attempt override
    (r.frozenFields as any).confidence = 0.99;
    const verify = PredictionImmutabilityGuard.verify("sec_002");
    expect(verify.valid).toBe(false);
  });

  it("IDOR: user B cannot access user A dedup records (cross-tenant)", () => {
    const userA = [{ predictionId: "A_pred", domain: "CAREER", eventDescription: "career growth", userId: "user_A", timeWindowStart: "2027-01-01", timeWindowEnd: "2027-12-31" }];
    const r = PredictionDeduplicationEngine.check({ predictionId: "B_pred", domain: "CAREER", eventDescription: "career growth", userId: "user_B", timeWindowStart: "2027-01-01", timeWindowEnd: "2027-12-31" }, userA);
    expect(r.status).toBe("UNIQUE"); // Cross-tenant isolation preserved
  });

  it("client cannot manipulate accuracy by injecting synthetic as real", () => {
    const ds = DatasetRegistry.createSyntheticDataset(["synth_p_01"]);
    expect(ds.canContributeToRealWorldAccuracy).toBe(false);
    // Direct mutation attempt
    (ds as any).canContributeToRealWorldAccuracy = true;
    // DatasetRegistry.canContributeToRealWorldAccuracy reads from internal Map, not the returned object
    expect(DatasetRegistry.canContributeToRealWorldAccuracy(ds.datasetId)).toBe(false);
  });

  it("failed prediction deletion blocked by SelectionBiasGuard", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "failed_001", requestedBy: "admin",
      reason: "This prediction was wrong",
      predictionOutcomeStatus: "CONTRADICTED",
      isPrivacyRequest: false, hasUserConsentForDeletion: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("BLOCKED");
  });
});
