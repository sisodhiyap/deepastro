import { describe, it, expect } from "vitest";
import { ProviderDisagreementEngine } from "../../../server/src/intelligence/observatory/v2/ProviderDisagreementEngine.js";

describe("ProviderDisagreementEngine", () => {
  it("should return NONE with single provider", () => {
    const r = ProviderDisagreementEngine.analyze({
      predictionId: "pd1",
      providers: [{ provider: "Z53", prediction: "career change", confidence: 0.75, keyEvidence: [], recommendation: "PASS" }],
    });
    expect(r.disagreementLevel).toBe("NONE");
    expect(r.action).toBe("NO_CHANGE");
  });

  it("should detect SIGNIFICANT disagreement with diverging recs", () => {
    const r = ProviderDisagreementEngine.analyze({
      predictionId: "pd2",
      providers: [
        { provider: "Z53", prediction: "change", confidence: 0.8, keyEvidence: [], recommendation: "PASS" },
        { provider: "OPENAI", prediction: "no change", confidence: 0.3, keyEvidence: [], recommendation: "SUPPRESS" },
        { provider: "GEMINI", prediction: "minor", confidence: 0.6, keyEvidence: [], recommendation: "SOFTEN" },
      ],
    });
    expect(["SIGNIFICANT", "FUNDAMENTAL"]).toContain(r.disagreementLevel);
    expect(r.confidenceAdjustment).toBeLessThan(0);
  });

  it("should SUPPRESS when majority say SUPPRESS", () => {
    const r = ProviderDisagreementEngine.analyze({
      predictionId: "pd3",
      providers: [
        { provider: "Z53", prediction: "x", confidence: 0.8, keyEvidence: [], recommendation: "SUPPRESS" },
        { provider: "OPENAI", prediction: "y", confidence: 0.3, keyEvidence: [], recommendation: "SUPPRESS" },
        { provider: "GEMINI", prediction: "z", confidence: 0.6, keyEvidence: [], recommendation: "PASS" },
      ],
    });
    expect(r.action).toBe("SUPPRESS");
  });
});
