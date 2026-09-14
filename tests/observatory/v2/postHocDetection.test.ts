import { describe, it, expect } from "vitest";
import { PostHocDetectionEngine } from "../../../server/src/intelligence/observatory/v2/PostHocDetectionEngine.js";

describe("PostHocDetectionEngine", () => {
  it("should return CLEAN when no post-outcome explanation", () => {
    const r = PostHocDetectionEngine.analyze({
      predictionId: "ph1",
      originalForecastText: "Career advancement in 3 months.",
      originalEvidenceIds: ["ev1", "ev2"],
    });
    expect(r.status).toBe("INSUFFICIENT_DATA");
    expect(r.excludedFromAccuracy).toBe(false);
  });

  it("should detect POST_HOC_REASONING when new evidence introduced", () => {
    const r = PostHocDetectionEngine.analyze({
      predictionId: "ph2",
      originalForecastText: "Career advancement in 3 months.",
      originalEvidenceIds: ["ev1"],
      postOutcomeExplanation: "As we can now see, the Saturn transit confirmed this outcome.",
      postOutcomeEvidenceIds: ["ev1", "ev_new"],
    });
    expect(r.status).toBe("POST_HOC_REASONING_DETECTED");
    expect(r.excludedFromAccuracy).toBe(true);
    expect(r.newEvidenceIntroduced.length).toBeGreaterThan(0);
  });

  it("should detect retrospective language", () => {
    const r = PostHocDetectionEngine.analyze({
      predictionId: "ph3",
      originalForecastText: "Job change possible.",
      originalEvidenceIds: ["ev1"],
      postOutcomeExplanation: "Looking back, the Jupiter transit was clearly the cause.",
      postOutcomeEvidenceIds: ["ev1"],
    });
    expect(r.status).toBe("POST_HOC_REASONING_DETECTED");
    expect(r.newEvidenceIntroduced.some(n => n.includes("looking back"))).toBe(true);
  });

  it("should produce stable hash for same forecast text", () => {
    const h1 = PostHocDetectionEngine.hashForecast("Career advancement in Q1 2027.");
    const h2 = PostHocDetectionEngine.hashForecast("Career advancement in Q1 2027.");
    expect(h1).toBe(h2);
  });

  it("should produce different hashes for different text", () => {
    const h1 = PostHocDetectionEngine.hashForecast("Career change.");
    const h2 = PostHocDetectionEngine.hashForecast("Financial change.");
    expect(h1).not.toBe(h2);
  });
});
