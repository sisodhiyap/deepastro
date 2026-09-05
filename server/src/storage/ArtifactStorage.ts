/**
 * ArtifactStorage
 * Dedicated abstraction separating binary and file artifacts (HTML, PDF, Images)
 * from relational database metadata.
 * Local filesystem driver with S3/R2-ready interface.
 * Never exposes raw server filesystem paths through APIs.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ArtifactSaveResult {
  storageKey: string;
  sha256: string;
  fileSizeBytes: number;
}

export interface IArtifactStorage {
  savePdf(reportId: string, version: number, buffer: Buffer): Promise<ArtifactSaveResult>;
  saveHtml(reportId: string, version: number, html: string): Promise<ArtifactSaveResult>;
  saveImage(prefix: string, id: string, buffer: Buffer, extension: string): Promise<ArtifactSaveResult>;
  getPdf(storageKey: string): Promise<Buffer | null>;
  getHtml(storageKey: string): Promise<string | null>;
  exists(storageKey: string): Promise<boolean>;
  deleteArtifact(storageKey: string): Promise<boolean>;
}

export class LocalArtifactStorage implements IArtifactStorage {
  private baseDir: string;

  constructor(baseDir?: string) {
    if (baseDir) {
      this.baseDir = path.resolve(baseDir);
    } else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.baseDir = path.resolve('/tmp', 'deepastro_artifacts');
    } else {
      this.baseDir = path.resolve(process.cwd(), 'data', 'artifacts');
    }
    this.ensureDirectory(this.baseDir);
    this.ensureDirectory(path.join(this.baseDir, 'pdfs'));
    this.ensureDirectory(path.join(this.baseDir, 'html'));
    this.ensureDirectory(path.join(this.baseDir, 'images'));
  }

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/(\.\.[\/\\])+/g, '').replace(/^[/\\]+/, '');
  }

  private toDiskPath(storageKey: string): string {
    const safeKey = this.sanitizeKey(storageKey);
    return path.join(this.baseDir, safeKey);
  }

  public async savePdf(reportId: string, version: number, buffer: Buffer): Promise<ArtifactSaveResult> {
    const storageKey = `pdfs/${reportId}_v${version}.pdf`;
    const targetPath = this.toDiskPath(storageKey);
    this.ensureDirectory(path.dirname(targetPath));

    fs.writeFileSync(targetPath, buffer);
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      storageKey,
      sha256,
      fileSizeBytes: buffer.length,
    };
  }

  public async saveHtml(reportId: string, version: number, html: string): Promise<ArtifactSaveResult> {
    const storageKey = `html/${reportId}_v${version}.html`;
    const targetPath = this.toDiskPath(storageKey);
    this.ensureDirectory(path.dirname(targetPath));

    const buffer = Buffer.from(html, 'utf-8');
    fs.writeFileSync(targetPath, buffer);
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      storageKey,
      sha256,
      fileSizeBytes: buffer.length,
    };
  }

  public async saveImage(prefix: string, id: string, buffer: Buffer, extension: string): Promise<ArtifactSaveResult> {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    const storageKey = `images/${prefix}_${id}${ext}`;
    const targetPath = this.toDiskPath(storageKey);
    this.ensureDirectory(path.dirname(targetPath));

    fs.writeFileSync(targetPath, buffer);
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      storageKey,
      sha256,
      fileSizeBytes: buffer.length,
    };
  }

  public async getPdf(storageKey: string): Promise<Buffer | null> {
    const targetPath = this.toDiskPath(storageKey);
    if (!fs.existsSync(targetPath)) return null;
    return fs.readFileSync(targetPath);
  }

  public async getHtml(storageKey: string): Promise<string | null> {
    const targetPath = this.toDiskPath(storageKey);
    if (!fs.existsSync(targetPath)) return null;
    return fs.readFileSync(targetPath, 'utf-8');
  }

  public async exists(storageKey: string): Promise<boolean> {
    const targetPath = this.toDiskPath(storageKey);
    return fs.existsSync(targetPath);
  }

  public async readArtifact(reportId: string, format: 'pdf' | 'html', version: number = 1): Promise<Buffer | null> {
    const key = format === 'pdf' ? `pdfs/${reportId}_v${version}.pdf` : `html/${reportId}_v${version}.html`;
    return this.getPdf(key);
  }

  public async deleteArtifact(storageKey: string): Promise<boolean> {
    const targetPath = this.toDiskPath(storageKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
    return false;
  }
}

export const artifactStorage = new LocalArtifactStorage();
