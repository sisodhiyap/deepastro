/**
 * PipelineStageRunner
 * Manages the sequential execution and persistence of the 23 granular report generation pipeline stages.
 * Persists every stage state: PENDING, RUNNING, COMPLETED, WARNING, FAILED, BLOCKED.
 */

import { reportRepository, PipelineStageInput } from '../database/repositories/ReportRepository.js';

export const PIPELINE_STAGE_NAMES = [
  'INPUT_VALIDATION',
  'LOCATION_RESOLUTION',
  'TIMEZONE_RESOLUTION',
  'KUNDLI_CALCULATION',
  'ASTRONOMICAL_VERIFICATION',
  'PANCHANG',
  'VARGAS',
  'YOGA_ANALYSIS',
  'DOSHA_ANALYSIS',
  'DASHA_ANALYSIS',
  'TRANSITS',
  'NUMEROLOGY',
  'KNOWLEDGE_RETRIEVAL',
  'AI_INTERPRETATION',
  'AI_CROSS_CHECK',
  'CLAIM_AUDIT',
  'SAFETY_AUDIT',
  'REPORT_COMPOSITION',
  'HTML_RENDER',
  'PDF_GENERATION',
  'PDF_ROUNDTRIP',
  'PDF_LAYOUT_QA',
  'INTEGRITY_GATE',
] as const;

export type PipelineStageName = typeof PIPELINE_STAGE_NAMES[number];

export interface StageExecutionContext {
  reportId: string;
  runId: string;
  emitProgress?: (stage: PipelineStageInput) => void;
}

export class PipelineStageRunner {
  private context: StageExecutionContext;
  private currentStageIndex = 0;

  constructor(context: StageExecutionContext) {
    this.context = context;
  }

  public async runStage<T>(
    stageName: PipelineStageName,
    executor: () => Promise<T>
  ): Promise<T> {
    const stageOrder = ++this.currentStageIndex;
    const stageId = `stg_${this.context.reportId}_${stageOrder}`;
    const startTime = Date.now();

    const stageRecord: PipelineStageInput = {
      id: stageId,
      runId: this.context.runId,
      reportId: this.context.reportId,
      stageName,
      stageOrder,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      message: `Executing stage ${stageName}...`,
    };

    await reportRepository.savePipelineStage(stageRecord);
    if (this.context.emitProgress) this.context.emitProgress(stageRecord);

    try {
      const result = await executor();
      const durationMs = Date.now() - startTime;

      stageRecord.status = 'COMPLETED';
      stageRecord.durationMs = durationMs;
      stageRecord.completedAt = new Date().toISOString();
      stageRecord.message = `Stage ${stageName} completed in ${durationMs}ms.`;

      await reportRepository.savePipelineStage(stageRecord);
      if (this.context.emitProgress) this.context.emitProgress(stageRecord);

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      stageRecord.status = 'FAILED';
      stageRecord.durationMs = durationMs;
      stageRecord.completedAt = new Date().toISOString();
      stageRecord.message = `Stage ${stageName} failed: ${err.message || String(err)}`;

      await reportRepository.savePipelineStage(stageRecord);
      if (this.context.emitProgress) this.context.emitProgress(stageRecord);

      throw err;
    }
  }
}
