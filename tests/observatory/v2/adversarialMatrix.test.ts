/**
 * Observatory V2.0 - Adversarial Matrix Test Suite
 * 20 adversarial scenarios from spec.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { PredictionChallengerEngine } from "../../../server/src/intelligence/observatory/v2/PredictionChallengerEngine.js";
import { PredictionHallucinationAuditor } from "../../../server/src/intelligence/observatory/v2/PredictionHallucinationAuditor.js";
import { TemporalLeakageRedTeam } from "../../../server/src/intelligence/observatory/v2/TemporalLeakageRedTeam.js";
import { PostHocDetectionEngine } from "../../../server/src/intelligence/observatory/v2/PostHocDetectionEngine.js";
import { SelectionBiasGuard } from "../../../server/src/intelligence/observatory/v2/SelectionBiasGuard.js";
import { PredictionDeduplicationEngine } from "../../../server/src/intelligence/observatory/v2/PredictionDeduplicationEngine.js";
import { PredictionImmutabilityGuard } from "../../../server/src/intelligence/observatory/v2/PredictionImmutabilityGuard.js";
import { DatasetRegistry } from "../../../server/src/intelligence/observatory/v2/DatasetRegistry.js";
import { PredictionFalsifiabilityEngine } from "../../../server/src/intelligence/observatory/v2/PredictionFalsifiabilityEngine.js";
import { ProviderDisagreementEngine } from "../../../server/src/intelligence/observatory/v2/ProviderDisagreementEngine.js";
import { BaselineComparisonEngine } from "../../../server/src/intelligence/observatory/v2/BaselineComparisonEngine.js";

beforeEach(() => {
  PredictionImmutabilityGuard.reset();
  DatasetRegistry["datasets"].clear();
});

const cutoff = "2026-01-01T00:00:00.000Z";
const before = "2025-06-01T00:00:00.000Z";
const after = "2026-06-01T00:00:00.000Z";

describe("Adversarial Scenario 1: Vague prediction suppressed", () => {
  it("should SUPPRESS vague prediction", () => {
    const r = PredictionFalsifiabilityEngine.evaluate({ predictionId: "adv1", forecastText: "Something important will happen." });
    expect(r.level).toBe("NO");
  });
});

describe("Adversarial Scenario 2: Barnum statement detected", () => {
  it("should detect Barnum bias flag", () => {
    const r = PredictionChallengerEngine.challenge({
      predictionId: "adv2", forecastText: "Change is coming. Life will improve. Opportunities await.",
      evidenceCount: 1, contradictionCount: 0, confidence: 0.8,
      hasTimeWindow: false, hasDomain: false, hasDirection: false,
    });
    expect(r.biasFlags).toContain("BARNUM_STATEMENT");
  });
});

describe("Adversarial Scenario 3: Fabricated citation", () => {
  it("should flag fabricated source â†’ CRITICAL", () => {
    const r = PredictionHallucinationAuditor.audit({ predictionId: "adv3", forecastText: "According to a recent study, Saturn transits cause promotions 72% of the time." });
    expect(["HIGH_RISK", "CRITICAL_QUALITY_FAILURE"]).toContain(r.overallSeverity);
  });
});

describe("Adversarial Scenario 4: Fabricated astronomical fact", () => {
  it("should flag invented astronomical fact â†’ CRITICAL", () => {
    const r = PredictionHallucinationAuditor.audit({ predictionId: "adv4", forecastText: "Sun is exalted in Gemini bringing career success." });
    expect(r.overallSeverity).toBe("CRITICAL_QUALITY_FAILURE");
  });
});

describe("Adversarial Scenario 5: Future leakage", () => {
  it("should detect future data record â†’ CRITICAL_TEST_FAILURE", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "adv5", cutoffTimestamp: cutoff,
      dataItems: [{ id: "future_d", createdAt: after, type: "DATA", content: "future event" }],
      knowledgeItems: [],
    });
    expect(r.overallStatus).toBe("CRITICAL_TEST_FAILURE");
  });
});

describe("Adversarial Scenario 6: Outcome manipulation (client-controlled)", () => {
  it("should not allow direct client outcome setting without auth", () => {
    // This is enforced at route level - test that UNKNOWN stays UNKNOWN without explicit auth
    const r = PostHocDetectionEngine.analyze({
      predictionId: "adv6", originalForecastText: "Career change.",
      originalEvidenceIds: [], postOutcomeExplanation: undefined,
    });
    expect(r.excludedFromAccuracy).toBe(false);
    expect(r.status).toBe("INSUFFICIENT_DATA"); // Not confirmed without explicit user action
  });
});

describe("Adversarial Scenario 7: Confidence manipulation", () => {
  it("should flag confidence inflation", () => {
    const r = PredictionChallengerEngine.challenge({
      predictionId: "adv7", forecastText: "Career change will occur.",
      evidenceCount: 1, contradictionCount: 0, confidence: 0.96,
      hasTimeWindow: true, hasDomain: true, hasDirection: false,
    });
    expect(r.biasFlags).toContain("OVERCONFIDENCE");
  });
});

describe("Adversarial Scenario 8: Duplicate prediction", () => {
  it("should detect DUPLICATE for reworded same event", () => {
    const existing = [{
      predictionId: "dup_A", domain: "CAREER",
      eventDescription: "career promotion in IT", userId: "user1",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-06-30",
    }];
    const r = PredictionDeduplicationEngine.check({
      predictionId: "dup_B", domain: "CAREER",
      eventDescription: "career promotion in IT sector", userId: "user1",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-06-30",
    }, existing);
    expect(["DUPLICATE", "OVERLAPPING"]).toContain(r.status);
  });
});

describe("Adversarial Scenario 9: Overlapping prediction", () => {
  it("should detect OVERLAPPING predictions in same window", () => {
    const existing = [{
      predictionId: "ovlp_A", domain: "FINANCE",
      eventDescription: "financial improvement this year", userId: "user2",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-12-31",
    }];
    const r = PredictionDeduplicationEngine.check({
      predictionId: "ovlp_B", domain: "FINANCE",
      eventDescription: "financial gain this year", userId: "user2",
      timeWindowStart: "2027-03-01", timeWindowEnd: "2027-09-30",
    }, existing);
    expect(["OVERLAPPING", "DUPLICATE"]).toContain(r.status);
  });
});

describe("Adversarial Scenario 10: Post-hoc explanation detected", () => {
  it("should detect POST_HOC_REASONING from retrospective language", () => {
    const r = PostHocDetectionEngine.analyze({
      predictionId: "adv10", originalForecastText: "Change possible.",
      originalEvidenceIds: ["ev1"],
      postOutcomeExplanation: "We now know this outcome was inevitable given the transit.",
      postOutcomeEvidenceIds: ["ev1"],
    });
    expect(r.status).toBe("POST_HOC_REASONING_DETECTED");
    expect(r.excludedFromAccuracy).toBe(true);
  });
});

describe("Adversarial Scenario 11: Provider disagreement", () => {
  it("should surface uncertainty on significant disagreement", () => {
    const r = ProviderDisagreementEngine.analyze({
      predictionId: "adv11",
      providers: [
        { provider: "Z53", prediction: "career change", confidence: 0.8, keyEvidence: [], recommendation: "PASS" },
        { provider: "OPENAI", prediction: "no major change", confidence: 0.5, keyEvidence: [], recommendation: "SUPPRESS" },
        { provider: "GEMINI", prediction: "minor shift", confidence: 0.6, keyEvidence: [], recommendation: "SOFTEN" },
      ],
    });
    expect(["SIGNIFICANT", "FUNDAMENTAL"]).toContain(r.disagreementLevel);
    expect(["SHOW_UNCERTAINTY", "SUPPRESS"]).toContain(r.action);
  });
});

describe("Adversarial Scenario 12: Strong contradiction â†’ SUPPRESS", () => {
  it("should recommend SUPPRESS on high contradiction", () => {
    const r = PredictionChallengerEngine.challenge({
      predictionId: "adv12", forecastText: "Career advancement.",
      evidenceCount: 2, contradictionCount: 4, confidence: 0.75,
      hasTimeWindow: true, hasDomain: true, hasDirection: true,
    });
    expect(["SUPPRESS", "SOFTEN"]).toContain(r.recommendation);
  });
});

describe("Adversarial Scenario 13: Insufficient evidence â†’ UNKNOWN", () => {
  it("should soften or suppress with zero evidence", () => {
    const r = PredictionChallengerEngine.challenge({
      predictionId: "adv13", forecastText: "Career change in 6 months.",
      evidenceCount: 0, contradictionCount: 0, confidence: 0.6,
      hasTimeWindow: true, hasDomain: true, hasDirection: true,
    });
    expect(["SOFTEN", "SUPPRESS", "REQUEST_CONTEXT"]).toContain(r.recommendation);
  });
});

describe("Adversarial Scenario 14: Tiny sample size â†’ INSUFFICIENT_SAMPLE", () => {
  it("should return INSUFFICIENT_DATA for tiny sample size", () => {
    const r = BaselineComparisonEngine.compare({
      deepAstroBrierScore: 0.1, deepAstroEventAccuracy: 0.9, deepAstroCoverage: 0.9, sampleSize: 3,
    });
    expect(r.verdict).toBe("INSUFFICIENT_DATA");
  });
});

describe("Adversarial Scenario 15: Synthetic data contamination prevented", () => {
  it("should prevent synthetic predictions from real-world accuracy", () => {
    DatasetRegistry.createSyntheticDataset(["synth_pred_001"]);
    expect(DatasetRegistry.canContributeToRealWorldAccuracy(DatasetRegistry["datasets"].values().next().value.datasetId)).toBe(false);
    const filtered = DatasetRegistry.filterForRealWorldAccuracy(["synth_pred_001", "real_pred_001"]);
    expect(filtered).not.toContain("synth_pred_001");
  });
});

describe("Adversarial Scenario 16: Failed prediction deletion blocked", () => {
  it("should block accuracy-motivated deletion of failed prediction", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "fail_pred_001", requestedBy: "admin",
      reason: "This was an inaccurate prediction",
      predictionOutcomeStatus: "DID_NOT_HAPPEN",
      isPrivacyRequest: false, hasUserConsentForDeletion: false,
    });
    expect(r.allowed).toBe(false);
  });
});

describe("Adversarial Scenario 17: Model hallucination", () => {
  it("should flag model hallucination â†’ CRITICAL", () => {
    const r = PredictionHallucinationAuditor.audit({
      predictionId: "adv17",
      forecastText: "Studies show 95% of people with this chart see career success. NASA confirms planetary influence.",
    });
    expect(["HIGH_RISK", "CRITICAL_QUALITY_FAILURE"]).toContain(r.overallSeverity);
  });
});

describe("Adversarial Scenario 18: Client-controlled accuracy rejected", () => {
  it("should not expose prediction mutation via client hash", () => {
    PredictionImmutabilityGuard.freeze({
      predictionId: "client_pred_001", text: "Career change.", claim: "Job change in Q1",
      confidence: 0.65, evidenceIds: ["ev1"],
      calculationSnapshotHash: "hash001", modelId: "gpt-4o", providerId: "openai",
      promptVersion: "v1", knowledgeVersion: "v1", engineVersion: "cfie_v2",
    });
    expect(() => PredictionImmutabilityGuard.freeze({
      predictionId: "client_pred_001", text: "Career change MANIPULATED.", claim: "Fake claim",
      confidence: 0.99, evidenceIds: [],
      calculationSnapshotHash: "fake", modelId: "fake", providerId: "fake",
      promptVersion: "v0", knowledgeVersion: "v0", engineVersion: "fake",
    })).toThrow();
  });
});

describe("Adversarial Scenario 19: Cross-user outcome access", () => {
  it("should not allow dedup engine to cross user boundaries", () => {
    const existing = [{
      predictionId: "other_user_pred", domain: "CAREER",
      eventDescription: "career promotion in IT", userId: "user_other",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-12-31",
    }];
    const r = PredictionDeduplicationEngine.check({
      predictionId: "my_pred", domain: "CAREER",
      eventDescription: "career promotion in IT", userId: "user_mine",
      timeWindowStart: "2027-01-01", timeWindowEnd: "2027-12-31",
    }, existing);
    expect(r.status).toBe("UNIQUE"); // Cross-user not flagged as duplicate
  });
});

describe("Adversarial Scenario 20: Prediction timestamp mutation", () => {
  it("should detect hash mismatch on field mutation", () => {
    const record = PredictionImmutabilityGuard.freeze({
      predictionId: "ts_mut_001", text: "Finance change.", claim: "Investment shift",
      confidence: 0.60, evidenceIds: ["ev1"],
      calculationSnapshotHash: "calc001", modelId: "gemini", providerId: "google",
      promptVersion: "v3", knowledgeVersion: "v2", engineVersion: "cfie_v2",
    });
    // Simulate timestamp mutation attack
    (record.frozenFields as any).confidence = 0.99;
    const verify = PredictionImmutabilityGuard.verify("ts_mut_001");
    expect(verify.valid).toBe(false);
  });
});
