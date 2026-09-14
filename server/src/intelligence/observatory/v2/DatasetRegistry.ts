/**
 * DeepAstro Observatory V2.0 - Dataset Registry
 * Strictly separates synthetic, calibration, historical, and real user datasets.
 * INVARIANT: SYNTHETIC_TEST_DATA MUST NEVER contribute to real-world accuracy statistics.
 */
import { DatasetType, DatasetRecord } from './ObservatoryV2Types.js';

export class DatasetRegistry {
  private static datasets: Map<string, DatasetRecord> = new Map();

  public static register(record: DatasetRecord): void {
    this.datasets.set(record.datasetId, Object.freeze({ ...record }));
  }

  public static getById(datasetId: string): DatasetRecord | undefined {
    const r = this.datasets.get(datasetId);
    return r ? { ...r } : undefined;
  }

  public static canContributeToRealWorldAccuracy(datasetId: string): boolean {
    const record = this.datasets.get(datasetId);
    if (!record) return false;
    if (record.type !== 'REAL_USER_OBSERVATIONS') return false;
    return record.canContributeToRealWorldAccuracy === true;
  }

  public static filterForRealWorldAccuracy(predictionIds: string[]): string[] {
    const protectedIds = new Set<string>();
    for (const dataset of this.datasets.values()) {
      if (!dataset.canContributeToRealWorldAccuracy) {
        for (const id of dataset.predictionIds) protectedIds.add(id);
      }
    }
    return predictionIds.filter(id => !protectedIds.has(id));
  }

  public static classifyPrediction(predictionId: string): DatasetType | 'UNREGISTERED' {
    for (const dataset of this.datasets.values()) {
      if (dataset.predictionIds.includes(predictionId)) return dataset.type;
    }
    return 'UNREGISTERED';
  }

  public static validateContamination(
    predictionIds: string[],
    intendedType: DatasetType
  ): { contaminated: boolean; contaminated_ids: string[]; reason: string } {
    const contaminated: string[] = [];
    for (const id of predictionIds) {
      const type = this.classifyPrediction(id);
      if (type !== intendedType && type !== 'UNREGISTERED') {
        contaminated.push(id);
      }
    }
    return {
      contaminated: contaminated.length > 0,
      contaminated_ids: contaminated,
      reason: contaminated.length > 0
        ? `CONTAMINATION DETECTED: ${contaminated.length} predictions from wrong dataset type`
        : 'Dataset clean â€” no cross-type contamination',
    };
  }

  public static createSyntheticDataset(predictionIds: string[]): DatasetRecord {
    const record: DatasetRecord = {
      datasetId: `dataset_synthetic_${Date.now()}`,
      type: 'SYNTHETIC_TEST_DATA',
      predictionIds,
      canContributeToRealWorldAccuracy: false,
      createdAt: new Date().toISOString(),
    };
    this.register(record);
    return record;
  }

  public static createRealUserDataset(predictionIds: string[]): DatasetRecord {
    const record: DatasetRecord = {
      datasetId: `dataset_real_${Date.now()}`,
      type: 'REAL_USER_OBSERVATIONS',
      predictionIds,
      canContributeToRealWorldAccuracy: true,
      createdAt: new Date().toISOString(),
    };
    this.register(record);
    return record;
  }
}
