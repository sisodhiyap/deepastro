import { describe, it, expect, beforeEach } from "vitest";
import { DatasetRegistry } from "../../../server/src/intelligence/observatory/v2/DatasetRegistry.js";

describe("DatasetRegistry", () => {
  beforeEach(() => { DatasetRegistry["datasets"].clear(); });

  it("should prevent SYNTHETIC_TEST_DATA from contributing to real-world accuracy", () => {
    const ds = DatasetRegistry.createSyntheticDataset(["pred_synth_01", "pred_synth_02"]);
    expect(ds.canContributeToRealWorldAccuracy).toBe(false);
    expect(DatasetRegistry.canContributeToRealWorldAccuracy(ds.datasetId)).toBe(false);
  });

  it("should allow REAL_USER_OBSERVATIONS to contribute to accuracy", () => {
    const ds = DatasetRegistry.createRealUserDataset(["pred_real_01"]);
    expect(ds.canContributeToRealWorldAccuracy).toBe(true);
  });

  it("should filter out synthetic predictions from real-world accuracy sets", () => {
    DatasetRegistry.createSyntheticDataset(["pred_synth_01"]);
    DatasetRegistry.createRealUserDataset(["pred_real_01"]);
    const filtered = DatasetRegistry.filterForRealWorldAccuracy(["pred_synth_01", "pred_real_01"]);
    expect(filtered).not.toContain("pred_synth_01");
    expect(filtered).toContain("pred_real_01");
  });

  it("should detect contamination across dataset types", () => {
    DatasetRegistry.createSyntheticDataset(["pred_synth_01"]);
    const result = DatasetRegistry.validateContamination(["pred_synth_01", "pred_real_new"], "REAL_USER_OBSERVATIONS");
    expect(result.contaminated).toBe(true);
    expect(result.contaminated_ids).toContain("pred_synth_01");
  });
});
