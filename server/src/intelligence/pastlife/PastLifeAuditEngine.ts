import { PastLifeInsightSchema, PastLifeUserFeedback } from './PastLifeTypes.js';

export interface PastLifeAuditRecord {
  auditId: string;
  userId: string;
  readingId: string;
  calculationSnapshotId: string;
  engineVersion: string;
  knowledgeVersion: string;
  confidence: string;
  sourceCount: number;
  timestamp: string;
}

export class PastLifeAuditEngine {
  private static auditLogs: PastLifeAuditRecord[] = [];
  private static readingsStore: Map<string, PastLifeInsightSchema> = new Map();
  private static feedbackStore: PastLifeUserFeedback[] = [];

  public static record(schema: PastLifeInsightSchema): void {
    this.readingsStore.set(schema.id, schema);
    this.auditLogs.push({
      auditId: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: schema.user_id,
      readingId: schema.id,
      calculationSnapshotId: schema.calculation_snapshot_id,
      engineVersion: schema.provenance.engine_version,
      knowledgeVersion: schema.provenance.knowledge_version,
      confidence: schema.confidence.overall,
      sourceCount: schema.vedic_references.length + schema.purana_references.length,
      timestamp: new Date().toISOString(),
    });
  }

  public static getReadingById(readingId: string): PastLifeInsightSchema | undefined {
    return this.readingsStore.get(readingId);
  }

  public static getUserReadings(userId: string): PastLifeInsightSchema[] {
    return Array.from(this.readingsStore.values())
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
  }

  public static verifyUserAccess(readingId: string, requestingUserId: string): { allowed: boolean; reading?: PastLifeInsightSchema } {
    const reading = this.readingsStore.get(readingId);
    if (!reading) return { allowed: false };
    const allowed = reading.user_id === requestingUserId;
    return { allowed, reading: allowed ? reading : undefined };
  }

  public static recordFeedback(feedback: PastLifeUserFeedback): void {
    this.feedbackStore.push(feedback);
  }

  public static getObservatoryMetrics(): {
    totalReadings: number;
    feedbackCount: number;
    averageConfidence: string;
    archetypeDistribution: Record<string, number>;
  } {
    const readings = Array.from(this.readingsStore.values());
    const distribution: Record<string, number> = {};

    readings.forEach((r) => {
      const arch = r.archetype.primary;
      distribution[arch] = (distribution[arch] || 0) + 1;
    });

    return {
      totalReadings: readings.length,
      feedbackCount: this.feedbackStore.length,
      averageConfidence: readings.length > 0 ? 'HIGH' : 'N/A',
      archetypeDistribution: distribution,
    };
  }
}
