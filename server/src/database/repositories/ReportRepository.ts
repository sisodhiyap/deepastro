/**
 * ReportRepository
 * Primary database repository for report metadata, immutable versions,
 * pipeline stages, claims, verification results, and artifact records.
 * Uses parameterized queries to eliminate SQL injection.
 */

import { IDatabaseClient, dbClient } from '../postgres.js';

export interface CreateReportParams {
  id: string;
  userId: string | null;
  profileId?: string | null;
  calculationId?: string | null;
  generationRequestId: string;
  reportType: string;
  title: string;
  status: 'GENERATING' | 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'REVIEW_REQUIRED' | 'BLOCKED' | 'FAILED';
  integrityStatus: 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'REVIEW_REQUIRED' | 'BLOCKED';
  integrityScore?: number;
  calculationFingerprint: string;
  engineVersion: string;
  ephemerisVersion: string;
  ruleEngineVersion: string;
  promptVersion: string;
  rendererVersion: string;
  nativeData: any;
}

export interface ReportRecord extends CreateReportParams {
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportVersionRecord {
  id: string;
  reportId: string;
  versionNumber: number;
  reportPayload: any;
  calculationFingerprint: string;
  engineVersion: string;
  ephemerisVersion: string;
  ruleEngineVersion: string;
  aiModelsUsed: string[];
  promptVersion: string;
  rendererVersion: string;
  createdAt: string;
}

export interface PipelineStageInput {
  id: string;
  runId: string;
  reportId: string;
  stageName: string;
  stageOrder: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'WARNING' | 'FAILED' | 'BLOCKED';
  message?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ClaimInput {
  id: string;
  reportId: string;
  claimId: string;
  text: string;
  claimType: 'FACTUAL' | 'INTERPRETIVE' | 'REMEDIAL' | 'PREDICTIVE';
  sourceIds: string[];
  calculationReferences: string[];
  ruleReferences: string[];
  modelOrigin: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'VERIFIED' | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'BLOCKED' | 'REQUIRES_REVIEW';
  reviewNotes?: string;
}

export interface PDFArtifactInput {
  id: string;
  reportId: string;
  versionId?: string | null;
  storagePath: string;
  sha256: string;
  fileSizeBytes: number;
  mimeType?: string;
  pageCount: number;
  rendererVersion: string;
  binarySignatureVerified?: boolean;
  roundTripPassed: boolean;
  qaStatus: 'PASS' | 'WARNINGS' | 'FAILED';
  qaDetails: any;
}

export interface AIExecutionInput {
  id: string;
  reportId?: string | null;
  userId?: string | null;
  feature: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostCents: number;
  latencyMs: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'MODEL_UNAVAILABLE' | 'INVALID_JSON' | 'REJECTED';
  errorDetails?: string;
}

export class ReportRepository {
  private client: IDatabaseClient;
  // In-memory fallback map for test runs when Postgres is offline
  private memoryReports: Map<string, ReportRecord> = new Map();
  private memoryVersions: Map<string, ReportVersionRecord[]> = new Map();
  private memoryStages: Map<string, PipelineStageInput[]> = new Map();
  private memoryClaims: Map<string, ClaimInput[]> = new Map();
  private memoryArtifacts: Map<string, PDFArtifactInput[]> = new Map();

  constructor(client: IDatabaseClient = dbClient) {
    this.client = client;
  }

  public async createReport(params: CreateReportParams): Promise<ReportRecord> {
    const record: ReportRecord = {
      ...params,
      integrityScore: params.integrityScore || 0,
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.client.isLive()) {
      const sql = `
        INSERT INTO reports (
          id, user_id, profile_id, calculation_id, generation_request_id,
          report_type, title, status, integrity_status, integrity_score,
          calculation_fingerprint, engine_version, ephemeris_version,
          rule_engine_version, prompt_version, renderer_version, current_version,
          native_data, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *;
      `;
      const values = [
        record.id,
        record.userId,
        record.profileId || null,
        record.calculationId || null,
        record.generationRequestId,
        record.reportType,
        record.title,
        record.status,
        record.integrityStatus,
        record.integrityScore,
        record.calculationFingerprint,
        record.engineVersion,
        record.ephemerisVersion,
        record.ruleEngineVersion,
        record.promptVersion,
        record.rendererVersion,
        record.currentVersion,
        JSON.stringify(record.nativeData),
        record.createdAt,
        record.updatedAt,
      ];
      await this.client.query(sql, values);
    }

    this.memoryReports.set(record.id, record);
    return record;
  }

  public async getReport(reportId: string): Promise<ReportRecord | null> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM reports WHERE id = $1 LIMIT 1;';
      const res = await this.client.query(sql, [reportId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        profileId: r.profile_id,
        calculationId: r.calculation_id,
        generationRequestId: r.generation_request_id,
        reportType: r.report_type,
        title: r.title,
        status: r.status,
        integrityStatus: r.integrity_status,
        integrityScore: r.integrity_score,
        calculationFingerprint: r.calculation_fingerprint,
        engineVersion: r.engine_version,
        ephemerisVersion: r.ephemeris_version,
        ruleEngineVersion: r.rule_engine_version,
        promptVersion: r.prompt_version,
        rendererVersion: r.renderer_version,
        currentVersion: r.current_version,
        nativeData: typeof r.native_data === 'string' ? JSON.parse(r.native_data) : r.native_data,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
    return this.memoryReports.get(reportId) || null;
  }

  public async getReportByRequestId(requestId: string): Promise<ReportRecord | null> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM reports WHERE generation_request_id = $1 LIMIT 1;';
      const res = await this.client.query(sql, [requestId]);
      if (res.rows.length === 0) return null;
      return this.getReport(res.rows[0].id);
    }
    for (const r of this.memoryReports.values()) {
      if (r.generationRequestId === requestId) return r;
    }
    return null;
  }

  public async listUserReports(userId: string): Promise<ReportRecord[]> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC;';
      const res = await this.client.query(sql, [userId]);
      return res.rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        profileId: r.profile_id,
        calculationId: r.calculation_id,
        generationRequestId: r.generation_request_id,
        reportType: r.report_type,
        title: r.title,
        status: r.status,
        integrityStatus: r.integrity_status,
        integrityScore: r.integrity_score,
        calculationFingerprint: r.calculation_fingerprint,
        engineVersion: r.engine_version,
        ephemerisVersion: r.ephemeris_version,
        ruleEngineVersion: r.rule_engine_version,
        promptVersion: r.prompt_version,
        rendererVersion: r.renderer_version,
        currentVersion: r.current_version,
        nativeData: typeof r.native_data === 'string' ? JSON.parse(r.native_data) : r.native_data,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return Array.from(this.memoryReports.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  public async deleteReport(reportId: string, userId: string): Promise<boolean> {
    const existing = await this.getReport(reportId);
    if (!existing || existing.userId !== userId) {
      return false;
    }

    if (this.client.isLive()) {
      await this.client.query('DELETE FROM reports WHERE id = $1 AND user_id = $2;', [reportId, userId]);
    }
    this.memoryReports.delete(reportId);
    return true;
  }

  public async createVersion(params: {
    id: string;
    reportId: string;
    versionNumber: number;
    reportPayload: any;
    calculationFingerprint: string;
    engineVersion: string;
    ephemerisVersion: string;
    ruleEngineVersion: string;
    aiModelsUsed: string[];
    promptVersion: string;
    rendererVersion: string;
  }): Promise<ReportVersionRecord> {
    const version: ReportVersionRecord = {
      ...params,
      createdAt: new Date().toISOString(),
    };

    if (this.client.isLive()) {
      const sql = `
        INSERT INTO report_versions (
          id, report_id, version_number, report_payload, calculation_fingerprint,
          engine_version, ephemeris_version, rule_engine_version, ai_models_used,
          prompt_version, renderer_version, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;
      await this.client.query(sql, [
        version.id,
        version.reportId,
        version.versionNumber,
        JSON.stringify(version.reportPayload),
        version.calculationFingerprint,
        version.engineVersion,
        version.ephemerisVersion,
        version.ruleEngineVersion,
        version.aiModelsUsed,
        version.promptVersion,
        version.rendererVersion,
        version.createdAt,
      ]);
    }

    const versions = this.memoryVersions.get(version.reportId) || [];
    versions.push(version);
    this.memoryVersions.set(version.reportId, versions);

    // Update current version in parent report
    const parent = await this.getReport(version.reportId);
    if (parent) {
      parent.currentVersion = Math.max(parent.currentVersion, version.versionNumber);
      parent.updatedAt = new Date().toISOString();
      if (this.client.isLive()) {
        await this.client.query('UPDATE reports SET current_version = $1, updated_at = $2 WHERE id = $3;', [
          parent.currentVersion,
          parent.updatedAt,
          parent.id,
        ]);
      }
    }

    return version;
  }

  public async getVersions(reportId: string): Promise<ReportVersionRecord[]> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM report_versions WHERE report_id = $1 ORDER BY version_number ASC;';
      const res = await this.client.query(sql, [reportId]);
      return res.rows.map((r: any) => ({
        id: r.id,
        reportId: r.report_id,
        versionNumber: r.version_number,
        reportPayload: typeof r.report_payload === 'string' ? JSON.parse(r.report_payload) : r.report_payload,
        calculationFingerprint: r.calculation_fingerprint,
        engineVersion: r.engine_version,
        ephemerisVersion: r.ephemeris_version,
        ruleEngineVersion: r.rule_engine_version,
        aiModelsUsed: r.ai_models_used || [],
        promptVersion: r.prompt_version,
        rendererVersion: r.renderer_version,
        createdAt: r.created_at,
      }));
    }
    return this.memoryVersions.get(reportId) || [];
  }

  public async savePipelineStage(stage: PipelineStageInput): Promise<void> {
    if (this.client.isLive()) {
      if (stage.runId) {
        try {
          await this.client.query(`
            INSERT INTO report_pipeline_runs (id, report_id, status, started_at)
            VALUES ($1, $2, 'RUNNING', CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO NOTHING;
          `, [stage.runId, stage.reportId]);
        } catch {
          // ignore or fallback
        }
      }

      const sql = `
        INSERT INTO report_pipeline_stages (
          id, run_id, report_id, stage_name, stage_order, status,
          message, duration_ms, started_at, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          message = EXCLUDED.message,
          duration_ms = EXCLUDED.duration_ms,
          completed_at = EXCLUDED.completed_at;
      `;
      await this.client.query(sql, [
        stage.id,
        stage.runId,
        stage.reportId,
        stage.stageName,
        stage.stageOrder,
        stage.status,
        stage.message || null,
        stage.durationMs || null,
        stage.startedAt || new Date().toISOString(),
        stage.completedAt || null,
      ]);
    }
    const stages = this.memoryStages.get(stage.reportId) || [];
    const idx = stages.findIndex((s) => s.id === stage.id);
    if (idx >= 0) stages[idx] = stage;
    else stages.push(stage);
    this.memoryStages.set(stage.reportId, stages);
  }

  public async getPipelineStages(reportId: string): Promise<PipelineStageInput[]> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM report_pipeline_stages WHERE report_id = $1 ORDER BY stage_order ASC;';
      const res = await this.client.query(sql, [reportId]);
      return res.rows.map((r: any) => ({
        id: r.id,
        runId: r.run_id,
        reportId: r.report_id,
        stageName: r.stage_name,
        stageOrder: r.stage_order,
        status: r.status,
        message: r.message,
        durationMs: r.duration_ms,
        startedAt: r.started_at,
        completedAt: r.completed_at,
      }));
    }
    return this.memoryStages.get(reportId) || [];
  }

  public async saveVerification(params: {
    id: string;
    calculationId: string;
    overallStatus: string;
    integrityScore: number;
    checks: any[];
    conflicts: string[];
    warnings: string[];
    calculationHash: string;
  }): Promise<void> {
    if (this.client.isLive()) {
      let calcId = params.calculationId;
      try {
        const findRes = await this.client.query(
          'SELECT id FROM kundli_calculations WHERE id = $1 OR calculation_fingerprint = $1 LIMIT 1;',
          [params.calculationId]
        );
        if (findRes.rows.length > 0) {
          calcId = findRes.rows[0].id;
        }
      } catch {
        // fallback to original
      }

      const sql = `
        INSERT INTO verification_results (
          id, calculation_id, overall_status, integrity_score, checks,
          conflicts, warnings, calculation_hash, verified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `;
      await this.client.query(sql, [
        params.id,
        calcId,
        params.overallStatus,
        params.integrityScore,
        JSON.stringify(params.checks),
        params.conflicts,
        params.warnings,
        params.calculationHash,
      ]);
    }
  }

  public async saveClaims(claims: ClaimInput[]): Promise<void> {
    if (claims.length === 0) return;
    if (this.client.isLive()) {
      for (const c of claims) {
        const sql = `
          INSERT INTO report_claims (
            id, report_id, claim_id, text, claim_type, source_ids,
            calculation_references, rule_references, model_origin,
            confidence, status, review_notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP);
        `;
        await this.client.query(sql, [
          c.id,
          c.reportId,
          c.claimId,
          c.text,
          c.claimType,
          c.sourceIds,
          c.calculationReferences,
          c.ruleReferences,
          c.modelOrigin,
          c.confidence,
          c.status,
          c.reviewNotes || null,
        ]);
      }
    }
    const reportId = claims[0].reportId;
    const existing = this.memoryClaims.get(reportId) || [];
    this.memoryClaims.set(reportId, [...existing, ...claims]);
  }

  public async getClaims(reportId: string): Promise<ClaimInput[]> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM report_claims WHERE report_id = $1 ORDER BY created_at ASC;';
      const res = await this.client.query(sql, [reportId]);
      return res.rows.map((r: any) => ({
        id: r.id,
        reportId: r.report_id,
        claimId: r.claim_id,
        text: r.text,
        claimType: r.claim_type,
        sourceIds: r.source_ids || [],
        calculationReferences: r.calculation_references || [],
        ruleReferences: r.rule_references || [],
        modelOrigin: r.model_origin,
        confidence: r.confidence,
        status: r.status,
        reviewNotes: r.review_notes,
      }));
    }
    return this.memoryClaims.get(reportId) || [];
  }

  public async saveAIExecution(execution: AIExecutionInput): Promise<void> {
    if (this.client.isLive()) {
      const sql = `
        INSERT INTO ai_runs (
          id, report_id, user_id, feature, provider, model, prompt_tokens,
          completion_tokens, total_tokens, estimated_cost_cents, latency_ms,
          status, error_details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP);
      `;
      await this.client.query(sql, [
        execution.id,
        execution.reportId || null,
        execution.userId || null,
        execution.feature,
        execution.provider,
        execution.model,
        execution.promptTokens,
        execution.completionTokens,
        execution.totalTokens,
        execution.estimatedCostCents,
        execution.latencyMs,
        execution.status,
        execution.errorDetails || null,
      ]);
    }
  }

  public async savePDFArtifact(artifact: PDFArtifactInput): Promise<void> {
    if (this.client.isLive()) {
      const sql = `
        INSERT INTO pdf_artifacts (
          id, report_id, version_id, storage_path, sha256, file_size_bytes,
          mime_type, page_count, renderer_version, binary_signature_verified,
          round_trip_passed, qa_status, qa_details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP);
      `;
      await this.client.query(sql, [
        artifact.id,
        artifact.reportId,
        artifact.versionId || null,
        artifact.storagePath,
        artifact.sha256,
        artifact.fileSizeBytes,
        artifact.mimeType || 'application/pdf',
        artifact.pageCount,
        artifact.rendererVersion,
        artifact.binarySignatureVerified ?? true,
        artifact.roundTripPassed,
        artifact.qaStatus,
        JSON.stringify(artifact.qaDetails),
      ]);
    }
    const list = this.memoryArtifacts.get(artifact.reportId) || [];
    list.push(artifact);
    this.memoryArtifacts.set(artifact.reportId, list);
  }

  public async getPDFArtifact(reportId: string): Promise<PDFArtifactInput | null> {
    if (this.client.isLive()) {
      const sql = 'SELECT * FROM pdf_artifacts WHERE report_id = $1 ORDER BY created_at DESC LIMIT 1;';
      const res = await this.client.query(sql, [reportId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        reportId: r.report_id,
        versionId: r.version_id,
        storagePath: r.storage_path,
        sha256: r.sha256,
        fileSizeBytes: r.file_size_bytes,
        mimeType: r.mime_type,
        pageCount: r.page_count,
        rendererVersion: r.renderer_version,
        binarySignatureVerified: r.binary_signature_verified,
        roundTripPassed: r.round_trip_passed,
        qaStatus: r.qa_status,
        qaDetails: typeof r.qa_details === 'string' ? JSON.parse(r.qa_details) : r.qa_details,
      };
    }
    const list = this.memoryArtifacts.get(reportId);
    return list && list.length > 0 ? list[list.length - 1] : null;
  }
}

export const reportRepository = new ReportRepository();
