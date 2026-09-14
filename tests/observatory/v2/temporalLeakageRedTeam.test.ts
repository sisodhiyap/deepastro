import { describe, it, expect } from "vitest";
import { TemporalLeakageRedTeam } from "../../../server/src/intelligence/observatory/v2/TemporalLeakageRedTeam.js";

describe("TemporalLeakageRedTeam", () => {
  const cutoff = "2026-01-01T00:00:00.000Z";
  const beforeCutoff = "2025-12-31T23:59:59.000Z";
  const afterCutoff = "2026-06-01T00:00:00.000Z";

  it("should be CLEAN when all data is before cutoff", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "replay_01", cutoffTimestamp: cutoff,
      dataItems: [{ id: "d1", createdAt: beforeCutoff, type: "USER", content: "data" }],
      knowledgeItems: [{ id: "k1", retrievedAt: beforeCutoff, content: "knowledge" }],
    });
    expect(r.overallStatus).toBe("CLEAN");
    expect(r.leakageCount).toBe(0);
  });

  it("should detect CRITICAL_TEST_FAILURE when data is after cutoff", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "replay_02", cutoffTimestamp: cutoff,
      dataItems: [{ id: "d_future", createdAt: afterCutoff, type: "USER", content: "future data" }],
      knowledgeItems: [],
    });
    expect(r.overallStatus).toBe("CRITICAL_TEST_FAILURE");
    expect(r.leakageCount).toBeGreaterThan(0);
    expect(r.tests.some(t => t.attackVector === "FUTURE_DATA_RECORD")).toBe(true);
  });

  it("should detect future outcome injection", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "replay_03", cutoffTimestamp: cutoff,
      dataItems: [], knowledgeItems: [],
      predictionItems: [{ id: "p1", issuedAt: beforeCutoff, outcome: { confirmedAt: afterCutoff } }],
    });
    expect(r.overallStatus).toBe("CRITICAL_TEST_FAILURE");
    expect(r.tests.some(t => t.attackVector === "FUTURE_OUTCOME_INJECTION")).toBe(true);
  });

  it("should detect retrospective interpretation", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "replay_04", cutoffTimestamp: cutoff,
      dataItems: [], knowledgeItems: [],
      predictionItems: [{ id: "p2", issuedAt: afterCutoff }],
    });
    expect(r.overallStatus).toBe("CRITICAL_TEST_FAILURE");
    expect(r.tests.some(t => t.attackVector === "RETROSPECTIVE_INTERPRETATION")).toBe(true);
  });

  it("should detect knowledge leakage", () => {
    const r = TemporalLeakageRedTeam.runAllAttacks({
      replayId: "replay_05", cutoffTimestamp: cutoff,
      dataItems: [],
      knowledgeItems: [{ id: "k_future", retrievedAt: afterCutoff, content: "future knowledge" }],
    });
    expect(r.overallStatus).toBe("CRITICAL_TEST_FAILURE");
    expect(r.tests.some(t => t.attackVector === "FUTURE_KNOWLEDGE")).toBe(true);
  });
});
