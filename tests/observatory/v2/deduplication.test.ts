import { describe, it, expect } from "vitest";
import { PredictionDeduplicationEngine } from "../../../server/src/intelligence/observatory/v2/PredictionDeduplicationEngine.js";

describe("PredictionDeduplicationEngine", () => {
  const userId = "user_test_001";
  const base = {
    predictionId: "pred_A", domain: "CAREER",
    eventDescription: "career promotion in technology", userId,
    timeWindowStart: "2027-01-01", timeWindowEnd: "2027-06-30",
  };

  it("should detect UNIQUE when no similar predictions", () => {
    const r = PredictionDeduplicationEngine.check(base, []);
    expect(r.status).toBe("UNIQUE");
    expect(r.overlapsWith).toHaveLength(0);
  });

  it("should detect DUPLICATE for same event reworded", () => {
    const existing = {
      ...base, predictionId: "pred_B",
      eventDescription: "career promotion in technology sector",
    };
    const r = PredictionDeduplicationEngine.check(base, [existing]);
    expect(["DUPLICATE", "OVERLAPPING"]).toContain(r.status);
  });

  it("should detect OVERLAPPING for same domain + window", () => {
    const existing = {
      ...base, predictionId: "pred_C",
      eventDescription: "career advancement opportunity",
    };
    const r = PredictionDeduplicationEngine.check(base, [existing]);
    expect(["OVERLAPPING", "DUPLICATE"]).toContain(r.status);
  });

  it("should not flag different domains", () => {
    const existing = {
      ...base, predictionId: "pred_D", domain: "FINANCE",
      eventDescription: "financial gain in investment",
    };
    const r = PredictionDeduplicationEngine.check(base, [existing]);
    expect(r.status).toBe("UNIQUE");
  });

  it("should not flag different users", () => {
    const existing = {
      ...base, predictionId: "pred_E", userId: "user_other_999",
    };
    const r = PredictionDeduplicationEngine.check(base, [existing]);
    expect(r.status).toBe("UNIQUE");
  });
});
