import { describe, it, expect } from "vitest";
import { SelectionBiasGuard } from "../../../server/src/intelligence/observatory/v2/SelectionBiasGuard.js";

describe("SelectionBiasGuard", () => {
  it("should BLOCK accuracy-motivated deletion", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "p1", requestedBy: "admin",
      reason: "This prediction was wrong and inaccurate",
      predictionOutcomeStatus: "USER_NOT_CONFIRMED",
      isPrivacyRequest: false, hasUserConsentForDeletion: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("BLOCKED");
  });

  it("should BLOCK removal of failed prediction without privacy request", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "p2", requestedBy: "admin",
      reason: "User requested removal",
      predictionOutcomeStatus: "CONTRADICTED",
      isPrivacyRequest: false, hasUserConsentForDeletion: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.requiresPrivacyRequest).toBe(true);
  });

  it("should ALLOW legitimate privacy deletion with user consent", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "p3", requestedBy: "user",
      reason: "GDPR deletion request",
      predictionOutcomeStatus: "CONTRADICTED",
      isPrivacyRequest: true, hasUserConsentForDeletion: true,
    });
    expect(r.allowed).toBe(true);
  });

  it("should BLOCK privacy deletion without user consent", () => {
    const r = SelectionBiasGuard.validateRemovalRequest({
      predictionId: "p4", requestedBy: "admin",
      reason: "Privacy deletion",
      predictionOutcomeStatus: "USER_NOT_CONFIRMED",
      isPrivacyRequest: true, hasUserConsentForDeletion: false,
    });
    expect(r.allowed).toBe(false);
  });
});
