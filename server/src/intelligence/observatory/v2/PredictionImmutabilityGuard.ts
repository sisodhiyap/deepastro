/**
 * DeepAstro Observatory V2.0 - Prediction Immutability Guard
 * Once issued, a prediction is frozen. Only outcome/evaluation/diagnosis/review may be appended.
 * INVARIANT: Historical predictions must remain reproducible. SHA-256 content hash enforced.
 */
import { ImmutablePredictionRecord } from './ObservatoryV2Types.js';
import { createHash } from 'crypto';

export class PredictionImmutabilityGuard {
  private static records: Map<string, ImmutablePredictionRecord> = new Map();

  private static hashFrozenFields(fields: ImmutablePredictionRecord['frozenFields']): string {
    return createHash('sha256').update(JSON.stringify(fields)).digest('hex');
  }

  public static freeze(params: {
    predictionId: string;
    text: string; claim: string; confidence: number; evidenceIds: string[];
    calculationSnapshotHash: string; modelId: string; providerId: string;
    promptVersion: string; knowledgeVersion: string; engineVersion: string;
  }): ImmutablePredictionRecord {
    if (this.records.has(params.predictionId)) {
      throw new Error(`PredictionImmutabilityGuard: prediction '${params.predictionId}' is already frozen. No update allowed.`);
    }

    const frozenFields: ImmutablePredictionRecord['frozenFields'] = {
      text: params.text, claim: params.claim, confidence: params.confidence,
      evidenceIds: [...params.evidenceIds], calculationSnapshotHash: params.calculationSnapshotHash,
      modelId: params.modelId, providerId: params.providerId,
      promptVersion: params.promptVersion, knowledgeVersion: params.knowledgeVersion,
      engineVersion: params.engineVersion,
    };

    const contentHash = this.hashFrozenFields(frozenFields);
    const record: ImmutablePredictionRecord = {
      predictionId: params.predictionId,
      contentHash, issuedAt: new Date().toISOString(),
      frozenFields, appendedRecords: [],
    };

    this.records.set(params.predictionId, record);
    return record;
  }

  public static append(
    predictionId: string,
    type: 'OUTCOME' | 'EVALUATION' | 'DIAGNOSIS' | 'REVIEW',
    data: Record<string, unknown>,
    appendedBy: string
  ): void {
    const record = this.records.get(predictionId);
    if (!record) throw new Error(`PredictionImmutabilityGuard: prediction '${predictionId}' not found`);
    record.appendedRecords.push({ type, data, appendedAt: new Date().toISOString(), appendedBy });
  }

  public static verify(predictionId: string): { valid: boolean; reason: string } {
    const record = this.records.get(predictionId);
    if (!record) return { valid: false, reason: 'Prediction not found in immutability registry' };
    const currentHash = this.hashFrozenFields(record.frozenFields);
    if (currentHash !== record.contentHash) {
      return { valid: false, reason: `CRITICAL: Content hash mismatch â€” frozen fields were mutated! Expected ${record.contentHash}, got ${currentHash}` };
    }
    return { valid: true, reason: 'Content hash verified. Prediction is immutable and intact.' };
  }

  public static getRecord(predictionId: string): ImmutablePredictionRecord | undefined {
    return this.records.get(predictionId);
  }

  public static reset(): void { this.records.clear(); }
}
