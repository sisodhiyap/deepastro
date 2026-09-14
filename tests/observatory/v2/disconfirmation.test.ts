import { describe, it, expect, beforeEach } from "vitest";
import { DisconfirmationEngine } from "../../../server/src/intelligence/observatory/v2/DisconfirmationEngine.js";

describe("DisconfirmationEngine", () => {
  beforeEach(() => { DisconfirmationEngine.reset(); });

  it("should compute disconfirmation rate correctly", () => {
    for (let i = 0; i < 10; i++) {
      DisconfirmationEngine.recordChallenge({ hadWeakness: i < 3, wasSoftened: i < 2, wasSuppressed: false, wasContradicted: false });
    }
    const m = DisconfirmationEngine.getMetrics();
    expect(m.totalChallenged).toBe(10);
    expect(m.weaknessesFound).toBe(3);
    expect(m.disconfirmationRate).toBeCloseTo(0.30, 2);
    expect(m.healthStatus).toBe("HEALTHY");
  });

  it("should flag SUSPICIOUSLY_CLEAN when zero challenges from large set", () => {
    for (let i = 0; i < 10; i++) {
      DisconfirmationEngine.recordChallenge({ hadWeakness: false, wasSoftened: false, wasSuppressed: false, wasContradicted: false });
    }
    const m = DisconfirmationEngine.getMetrics();
    expect(m.healthStatus).toBe("SUSPICIOUSLY_CLEAN");
  });

  it("should track suppressed and softened counts", () => {
    DisconfirmationEngine.recordChallenge({ hadWeakness: true, wasSoftened: true, wasSuppressed: false, wasContradicted: false });
    DisconfirmationEngine.recordChallenge({ hadWeakness: true, wasSoftened: false, wasSuppressed: true, wasContradicted: false });
    const m = DisconfirmationEngine.getMetrics();
    expect(m.softened).toBe(1);
    expect(m.suppressed).toBe(1);
  });
});
