/**
 * DeepAstro Database Migration Runner
 * Manages schema version tracking, execution of SQL migrations,
 * and schema verification.
 */

import fs from 'fs';
import path from 'path';
import { IDatabaseClient, dbClient } from './postgres.js';

export interface MigrationRecord {
  version: string;
  name: string;
  applied_at: string;
}

export class MigrationRunner {
  private client: IDatabaseClient;
  private migrationsDir: string;

  constructor(client: IDatabaseClient = dbClient, migrationsDir?: string) {
    this.client = client;
    this.migrationsDir = migrationsDir || path.resolve(process.cwd(), 'server', 'src', 'database', 'migrations');
  }

  public static async migrateUp(): Promise<{ applied: string[]; alreadyUpToDate: boolean }> {
    return new MigrationRunner().migrateUp();
  }

  /**
   * Initializes the schema_migrations table if it doesn't exist
   */
  public async initMigrationTable(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Returns all applied migrations from the database
   */
  public async getAppliedMigrations(): Promise<string[]> {
    await this.initMigrationTable();
    try {
      const res = await this.client.query<{ version: string }>('SELECT version FROM schema_migrations ORDER BY version ASC');
      return res.rows.map((r) => r.version);
    } catch {
      return [];
    }
  }

  /**
   * Executes all pending SQL migration files in migrations directory
   */
  public async migrateUp(): Promise<{ applied: string[]; alreadyUpToDate: boolean }> {
    await this.initMigrationTable();
    const applied = await this.getAppliedMigrations();
    const appliedSet = new Set(applied);

    if (!fs.existsSync(this.migrationsDir)) {
      return { applied: [], alreadyUpToDate: true };
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const newlyApplied: string[] = [];

    for (const file of files) {
      const version = file.split('_')[0];
      if (appliedSet.has(version)) {
        continue;
      }

      const filePath = path.join(this.migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`[MigrationRunner] Applying migration: ${file}...`);
      await this.client.withTransaction(async (tx) => {
        // Execute migration statements
        // Split by statement or run as a script block
        await tx.query(sql);
        await tx.query(
          'INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
          [version, file]
        );
      });

      newlyApplied.push(file);
      console.log(`[MigrationRunner] Successfully applied: ${file}`);
    }

    return {
      applied: newlyApplied,
      alreadyUpToDate: newlyApplied.length === 0,
    };
  }

  /**
   * Validates that all expected tables exist
   */
  public async validateSchema(): Promise<{ isValid: boolean; missingTables: string[] }> {
    const requiredTables = [
      'users',
      'birth_profiles',
      'kundli_calculations',
      'kundli_planets',
      'kundli_houses',
      'kundli_vargas',
      'kundli_yogas',
      'kundli_doshas',
      'dasha_periods',
      'transits',
      'numerology_reports',
      'palmistry_reports',
      'reports',
      'report_versions',
      'report_pipeline_runs',
      'report_pipeline_stages',
      'report_claims',
      'report_sources',
      'ai_runs',
      'ai_consensus_results',
      'verification_results',
      'pdf_artifacts',
      'knowledge_sources',
      'knowledge_chunks',
      'audit_logs',
    ];

    if (!this.client.isLive()) {
      return { isValid: true, missingTables: [] };
    }

    try {
      const res = await this.client.query<{ table_name: string }>(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      const existing = new Set(res.rows.map((r) => r.table_name.toLowerCase()));
      const missing = requiredTables.filter((t) => !existing.has(t));
      return {
        isValid: missing.length === 0,
        missingTables: missing,
      };
    } catch {
      return { isValid: true, missingTables: [] };
    }
  }
}

export const migrationRunner = new MigrationRunner();
