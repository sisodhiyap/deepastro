/**
 * ReportStore — Persistent JSON-file-backed report storage
 * Replaces the ephemeral in-memory Map with a durable file-system store.
 * Each report is written as a JSON file under ./data/reports/<userId>/<reportId>.json
 * Each PDF (HTML) is stored under ./data/pdfs/<userId>/<reportId>.html
 *
 * On server restart, all reports survive.
 * User isolation: all queries enforce userId ownership.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredReport {
  reportId: string;
  userId: string | null;          // null = anonymous
  version: number;
  profileId: string | null;
  reportType: string;
  title: string;
  status: 'generating' | 'verified' | 'failed' | 'review_required';
  integrityStatus: 'VERIFIED' | 'VERIFIED_WITH_WARNINGS' | 'REVIEW_REQUIRED' | 'BLOCKED';
  calculationFingerprint: string;
  engineVersion: string;
  native: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    gender?: string;
  };
  reportJsonPath: string | null;   // path to full report JSON
  htmlPath: string | null;         // path to rendered HTML
  pdfPath: string | null;          // path to binary PDF (future)
  fileSizeBytes: number;
  sha256: string | null;
  qaResult: {
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
  roundTripPassed: boolean;
  pipelineStages: PipelineStageRecord[];
  auditLogPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageRecord {
  stage: string;
  status: 'queued' | 'running' | 'passed' | 'warning' | 'failed' | 'blocked';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
}

const DATA_ROOT = process.env.DEEPASTRO_DATA_PATH
  ? path.resolve(process.env.DEEPASTRO_DATA_PATH)
  : (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? path.resolve('/tmp', 'deepastro_data')
      : path.resolve(process.cwd(), 'data'));

const REPORTS_DIR = path.join(DATA_ROOT, 'reports');
const PDFS_DIR = path.join(DATA_ROOT, 'pdfs');
const JOBS_DIR = path.join(DATA_ROOT, 'jobs');

function ensureDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err: any) {
    console.warn(`[ReportStore] ensureDir caught error for ${dir}:`, err.message);
  }
}

function userDir(baseDir: string, userId: string | null): string {
  const sub = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, '_') : '_anonymous';
  const dir = path.join(baseDir, sub);
  ensureDir(dir);
  return dir;
}

export class ReportStore {
  // ─── Index ──────────────────────────────────────────────────────────────────
  // Maintains an in-memory index (rebuilt on startup) for fast listing
  private static index: Map<string, StoredReport> = new Map();
  private static initialized = false;

  public static initialize() {
    if (this.initialized) return;
    ensureDir(REPORTS_DIR);
    ensureDir(PDFS_DIR);
    ensureDir(JOBS_DIR);
    this.rebuildIndex();
    this.initialized = true;
  }

  private static rebuildIndex() {
    this.index.clear();
    if (!fs.existsSync(REPORTS_DIR)) return;
    // Walk user subdirs
    for (const userDirName of fs.readdirSync(REPORTS_DIR)) {
      const userPath = path.join(REPORTS_DIR, userDirName);
      if (!fs.statSync(userPath).isDirectory()) continue;
      for (const file of fs.readdirSync(userPath)) {
        if (!file.endsWith('.json')) continue;
        try {
          const raw = fs.readFileSync(path.join(userPath, file), 'utf-8');
          const rec = JSON.parse(raw) as StoredReport;
          this.index.set(rec.reportId, rec);
        } catch {
          // skip corrupt files
        }
      }
    }
  }

  // ─── Create ─────────────────────────────────────────────────────────────────
  public static create(params: {
    userId: string | null;
    reportType: string;
    native: StoredReport['native'];
    engineVersion?: string;
    calculationFingerprint?: string;
  }): StoredReport {
    this.initialize();
    const reportId = `rpt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const rec: StoredReport = {
      reportId,
      userId: params.userId,
      version: 1,
      profileId: null,
      reportType: params.reportType,
      title: `DeepAstro Report — ${params.native.name}`,
      status: 'generating',
      integrityStatus: 'REVIEW_REQUIRED',
      calculationFingerprint: params.calculationFingerprint || '',
      engineVersion: params.engineVersion || '2.4.0-lahiri',
      native: params.native,
      reportJsonPath: null,
      htmlPath: null,
      pdfPath: null,
      fileSizeBytes: 0,
      sha256: null,
      qaResult: { passed: false, warnings: [], errors: [] },
      roundTripPassed: false,
      pipelineStages: [],
      auditLogPath: null,
      createdAt: now,
      updatedAt: now,
    };
    this.persist(rec);
    return rec;
  }

  // ─── Update ─────────────────────────────────────────────────────────────────
  public static update(reportId: string, updates: Partial<StoredReport>): StoredReport | null {
    this.initialize();
    const existing = this.index.get(reportId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, reportId, updatedAt: new Date().toISOString() };
    this.persist(updated);
    return updated;
  }

  // ─── Save HTML content ───────────────────────────────────────────────────────
  public static saveHtml(reportId: string, userId: string | null, html: string): string {
    this.initialize();
    const dir = userDir(PDFS_DIR, userId);
    const htmlPath = path.join(dir, `${reportId}.html`);
    fs.writeFileSync(htmlPath, html, 'utf-8');
    const sha256 = crypto.createHash('sha256').update(html).digest('hex');
    const fileSizeBytes = Buffer.byteLength(html, 'utf-8');
    this.update(reportId, { htmlPath, sha256, fileSizeBytes });
    return htmlPath;
  }

  // ─── Read HTML content ───────────────────────────────────────────────────────
  public static readHtml(reportId: string, userId: string | null): string | null {
    this.initialize();
    const rec = this.index.get(reportId);
    if (!rec) return null;
    // Ownership check
    if (rec.userId !== null && rec.userId !== userId) return null;
    if (!rec.htmlPath || !fs.existsSync(rec.htmlPath)) return null;
    return fs.readFileSync(rec.htmlPath, 'utf-8');
  }

  // ─── Get single report (with ownership check) ────────────────────────────────
  public static get(reportId: string, userId: string | null): StoredReport | null {
    this.initialize();
    const rec = this.index.get(reportId);
    if (!rec) return null;
    if (rec.userId !== null && rec.userId !== userId) return null;
    return rec;
  }

  // ─── Get by ID without ownership check (admin use only) ─────────────────────
  public static getById(reportId: string): StoredReport | null {
    this.initialize();
    return this.index.get(reportId) || null;
  }

  // ─── List all reports for a user ─────────────────────────────────────────────
  public static listByUser(userId: string): StoredReport[] {
    this.initialize();
    return Array.from(this.index.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ─── Delete (with ownership check) ───────────────────────────────────────────
  public static delete(reportId: string, userId: string): boolean {
    this.initialize();
    const rec = this.index.get(reportId);
    if (!rec || rec.userId !== userId) return false;

    // Remove HTML file
    if (rec.htmlPath && fs.existsSync(rec.htmlPath)) {
      try { fs.unlinkSync(rec.htmlPath); } catch { /* ignore */ }
    }
    // Remove report JSON
    const rDir = userDir(REPORTS_DIR, userId);
    const jsonPath = path.join(rDir, `${reportId}.json`);
    if (fs.existsSync(jsonPath)) {
      try { fs.unlinkSync(jsonPath); } catch { /* ignore */ }
    }
    this.index.delete(reportId);
    return true;
  }

  // ─── Persist to disk ─────────────────────────────────────────────────────────
  private static persist(rec: StoredReport) {
    this.index.set(rec.reportId, rec);
    const dir = userDir(REPORTS_DIR, rec.userId);
    const filePath = path.join(dir, `${rec.reportId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rec, null, 2), 'utf-8');
  }

  // ─── Update pipeline stage ───────────────────────────────────────────────────
  public static updateStage(
    reportId: string,
    stage: string,
    status: PipelineStageRecord['status'],
    message?: string,
    startedAt?: string
  ): void {
    this.initialize();
    const rec = this.index.get(reportId);
    if (!rec) return;
    const now = new Date().toISOString();
    const stages = [...rec.pipelineStages];
    const existingIdx = stages.findIndex((s) => s.stage === stage);
    const stageRec: PipelineStageRecord = {
      stage,
      status,
      startedAt: startedAt || now,
      completedAt: ['passed', 'failed', 'warning', 'blocked'].includes(status) ? now : undefined,
      durationMs: startedAt ? Date.now() - new Date(startedAt).getTime() : undefined,
      message,
    };
    if (existingIdx >= 0) stages[existingIdx] = stageRec;
    else stages.push(stageRec);
    this.update(reportId, { pipelineStages: stages });
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────
  public static stats() {
    this.initialize();
    const all = Array.from(this.index.values());
    return {
      total: all.length,
      verified: all.filter((r) => r.integrityStatus === 'VERIFIED').length,
      failed: all.filter((r) => r.status === 'failed').length,
      generating: all.filter((r) => r.status === 'generating').length,
    };
  }
}
