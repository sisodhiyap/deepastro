/**
 * DeepAstro pgvector Contradiction Investigation Script
 * Connects via PostgresService (same connection used by system verification)
 * and executes comprehensive catalog and operator checks.
 * NEVER prints credentials or passwords.
 */

import dotenv from 'dotenv';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import { PostgresService } from './PostgresService.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function runInvestigationOnPool(pool: pkg.Pool, modeName: string) {
  const report: Record<string, any> = { mode: modeName };

  let client: pkg.PoolClient;
  try {
    client = await pool.connect();
  } catch (err: any) {
    report.connectionStatus = 'FAILED_TO_CONNECT';
    report.connectionError = err.message;
    return report;
  }

  try {
    // 1. Identify database
    const dbRes = await client.query('SELECT current_database();');
    const userRes = await client.query('SELECT current_user;');
    const schemaRes = await client.query('SELECT current_schema();');
    const verRes = await client.query('SELECT version();');
    const spRes = await client.query('SHOW search_path;');

    report.database = dbRes.rows[0].current_database;
    report.user = userRes.rows[0].current_user;
    report.schema = schemaRes.rows[0].current_schema;
    report.version = verRes.rows[0].version.split(',')[0];
    report.searchPath = spRes.rows[0].search_path;

    // 2. Extensions in pg_extension
    const extRes = await client.query('SELECT extname, extversion FROM pg_extension ORDER BY extname;');
    report.installedExtensions = extRes.rows;

    // Extensions with schema namespace
    const extSchemaRes = await client.query(`
      SELECT n.nspname AS schema_name, e.extname, e.extversion
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      ORDER BY n.nspname, e.extname;
    `);
    report.extensionsBySchema = extSchemaRes.rows;

    // Available extensions
    const availRes = await client.query(`
      SELECT name, default_version, installed_version
      FROM pg_available_extensions
      WHERE name = 'vector';
    `);
    report.availableVectorExtension = availRes.rows;

    // 3. Vector Type in pg_type
    const typeRes = await client.query(`
      SELECT t.typname, n.nspname AS schema_name, t.typlen, t.typbyval
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'vector';
    `);
    report.vectorTypeInPgType = typeRes.rows;
    report.vectorTypeExists = typeRes.rows.length > 0;

    // 4. Cosine Operator Test
    try {
      const cosineRes = await client.query("SELECT '[1,0,0]'::vector <=> '[0,1,0]'::vector AS cosine_distance;");
      report.cosineTest = {
        success: true,
        distance: cosineRes.rows[0].cosine_distance,
      };
    } catch (err: any) {
      report.cosineTest = {
        success: false,
        error: err.message,
      };
    }

    // 5. HNSW Operator Class Test
    const hnswRes = await client.query(`
      SELECT opcname, opcnamespace::regnamespace::text AS schema_name
      FROM pg_opclass
      WHERE opcname LIKE '%hnsw%' OR opcname LIKE '%vector%';
    `);
    report.hnswOpClasses = hnswRes.rows;

    // 6. Schema Migrations Table Check
    try {
      const migRes = await client.query(`
        SELECT version, name, applied_at
        FROM schema_migrations
        ORDER BY applied_at ASC;
      `);
      report.schemaMigrations = migRes.rows;
    } catch (err: any) {
      report.schemaMigrations = { error: err.message };
    }

    // 7. Check if knowledge_chunks table has embedding column
    try {
      const colRes = await client.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding';
      `);
      report.knowledgeChunksEmbeddingColumn = colRes.rows;
    } catch (err: any) {
      report.knowledgeChunksEmbeddingColumn = { error: err.message };
    }

  } finally {
    client.release();
  }

  return report;
}

async function main() {
  console.log('=== DEEPASTRO PGVECTOR CONTRADICTION INVESTIGATION ===\n');

  // Test 1: Standard pool (Port 6543)
  const pool6543 = PostgresService.getPool();
  console.log('--- Querying Port 6543 (Transaction Pooler) ---');
  const report6543 = await runInvestigationOnPool(pool6543, '6543_POOLER');

  // Test 2: Direct session connection (Port 5432)
  console.log('\n--- Checking Port 5432 (Direct/Session Connection) ---');
  let report5432: any = { mode: '5432_DIRECT' };
  const baseConnStr = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '';

  if (baseConnStr.includes(':6543')) {
    const directConnStr = baseConnStr.replace(':6543', ':5432');
    try {
      const u = new URL(directConnStr);
      const directPool = new Pool({
        host: u.hostname,
        port: 5432,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, '') || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      report5432 = await runInvestigationOnPool(directPool, '5432_DIRECT');
      await directPool.end();
    } catch (err: any) {
      report5432.connectionStatus = 'FAILED_OR_NOT_AVAILABLE';
      report5432.error = err.message;
    }
  } else {
    report5432.connectionStatus = 'NOT_CONFIGURED';
  }

  console.log('\n=== INVESTIGATION RAW RESULTS (SANITIZED) ===\n');
  console.log(JSON.stringify({ pooler6543: report6543, direct5432: report5432 }, null, 2));
}

main().catch((err) => {
  console.error('Fatal error during investigation:', err);
  process.exit(1);
});
