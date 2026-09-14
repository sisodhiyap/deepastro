import { describe, it, expect } from "vitest";
import { StatementClassifier } from "../../../server/src/intelligence/observatory/v2/StatementClassifier.js";

describe("StatementClassifier", () => {
  it("should classify ephemeris fact as CALCULATION", () => {
    const r = StatementClassifier.classify("s1", "Jupiter is at 15 degrees Taurus in the 10th house");
    expect(r.classification).toBe("CALCULATION");
    expect(r.requiresEvidence).toBe(false);
  });

  it("should classify dasha reference as CALCULATION", () => {
    const r = StatementClassifier.classify("s2", "Currently in Saturn Mahadasha Rahu Antardasha period");
    expect(r.classification).toBe("CALCULATION");
  });

  it("should classify classical Jyotish rule as TRADITIONAL_INTERPRETATION", () => {
    const r = StatementClassifier.classify("s3", "Traditional Jyotish associates Saturn in the 10th house with career discipline");
    expect(r.classification).toBe("TRADITIONAL_INTERPRETATION");
    expect(r.requiresEvidence).toBe(true);
  });

  it("should classify 'may suggest' as AI_INFERENCE", () => {
    const r = StatementClassifier.classify("s4", "This may correspond with career changes based on synthesis analysis");
    expect(r.classification).toBe("AI_INFERENCE");
  });

  it("should classify 'possibly' as SPECULATION", () => {
    const r = StatementClassifier.classify("s5", "Possibly a change could occur in the coming months");
    expect(r.classification).toBe("SPECULATION");
  });

  it("should classify overconfident language", () => {
    const r = StatementClassifier.classify("s6", "Your promotion will definitely happen in the next month without doubt");
    expect(r.classification).toBe("OVERCONFIDENT");
  });

  it("should classify all statements in batch", () => {
    const stmts = [
      { id: "b1", text: "Jupiter is at 12 degrees" },
      { id: "b2", text: "According to Jyotish tradition this indicates prosperity" },
      { id: "b3", text: "This analysis suggests career growth" },
    ];
    const results = StatementClassifier.classifyAll(stmts);
    expect(results).toHaveLength(3);
    expect(results[0].classification).toBe("CALCULATION");
    expect(results[1].classification).toBe("TRADITIONAL_INTERPRETATION");
    expect(results[2].classification).toBe("AI_INFERENCE");
  });
});
