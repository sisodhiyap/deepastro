import { describe, it, expect, beforeEach } from "vitest";
import { KnowledgeSourceVerifier } from "../../../server/src/intelligence/observatory/v2/KnowledgeSourceVerifier.js";

describe("KnowledgeSourceVerifier", () => {
  beforeEach(() => { KnowledgeSourceVerifier.reset(); });

  it("should verify clean claim correctly", () => {
    KnowledgeSourceVerifier.register({
      sourceId: "ks1", sourceType: "CLASSICAL_TEXT", sourceVersion: "v1",
      retrievedAt: "2026-01-01T00:00:00Z", verificationStatus: "VERIFIED",
      claimText: "Saturn in 10th house brings career discipline",
    });
    const r = KnowledgeSourceVerifier.verify("ks1", "Saturn in 10th house brings career discipline");
    expect(r.valid).toBe(true);
    expect(r.hashMatch).toBe(true);
    expect(r.status).toBe("VERIFIED");
  });

  it("should detect tampered claim via hash mismatch", () => {
    KnowledgeSourceVerifier.register({
      sourceId: "ks2", sourceType: "RESEARCH", sourceVersion: "v1",
      retrievedAt: "2026-01-01T00:00:00Z", verificationStatus: "VERIFIED",
      claimText: "Original claim text",
    });
    const r = KnowledgeSourceVerifier.verify("ks2", "Tampered claim text");
    expect(r.valid).toBe(false);
    expect(r.hashMatch).toBe(false);
    expect(r.status).toBe("CONTRADICTED");
  });

  it("should block UNVERIFIED â†’ VERIFIED promotion without evidence", () => {
    KnowledgeSourceVerifier.register({
      sourceId: "ks3", sourceType: "AI_SYNTHESIS", sourceVersion: "v1",
      retrievedAt: "2026-01-01T00:00:00Z", verificationStatus: "UNVERIFIED",
      claimText: "Unverified AI claim",
    });
    const r = KnowledgeSourceVerifier.attemptPromotion("ks3", "VERIFIED");
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("require explicit verification");
  });

  it("should block CONTRADICTED â†’ VERIFIED promotion", () => {
    KnowledgeSourceVerifier.register({
      sourceId: "ks4", sourceType: "AI_SYNTHESIS", sourceVersion: "v1",
      retrievedAt: "2026-01-01T00:00:00Z", verificationStatus: "CONTRADICTED",
      claimText: "Contradicted claim",
    });
    const r = KnowledgeSourceVerifier.attemptPromotion("ks4", "VERIFIED");
    expect(r.allowed).toBe(false);
  });
});
