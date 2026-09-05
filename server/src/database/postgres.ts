/**
 * DeepAstro PostgreSQL Database Client & Connection Pool
 * Provides robust connection management, parameterized queries,
 * transaction boundary support, and in-memory mock fallback for local tests.
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { EnvLoader } from '../config/envLoader.js';
const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  withTransaction<T>(callback: (client: IDatabaseClient) => Promise<T>): Promise<T>;
  isLive(): boolean;
  close(): Promise<void>;
}

class InMemoryFallbackClient implements IDatabaseClient {
  private tables: Map<string, Map<string, any>> = new Map();

  constructor() {
    // Initialized in-memory storage for test/fallback runs
  }

  public isLive(): boolean {
    return false;
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    // Basic mock query handler for tests running without an active Postgres instance
    const cleanSql = sql.trim().replace(/;$/, '');
    
    if (/^CREATE TABLE/i.test(cleanSql)) {
      const match = cleanSql.match(/CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)/i) ||
                    cleanSql.match(/CREATE TABLE\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const tbl = match[1].toLowerCase();
        if (!this.tables.has(tbl)) this.tables.set(tbl, new Map());
      }
      return { rows: [], rowCount: 0 };
    }

    if (/^SELECT\s+version\s+FROM\s+schema_migrations/i.test(cleanSql)) {
      const migrationsTable = this.tables.get('schema_migrations') || new Map();
      const rows = Array.from(migrationsTable.values()) as T[];
      return { rows, rowCount: rows.length };
    }

    if (/^INSERT INTO schema_migrations/i.test(cleanSql)) {
      let migrationsTable = this.tables.get('schema_migrations');
      if (!migrationsTable) {
        migrationsTable = new Map();
        this.tables.set('schema_migrations', migrationsTable);
      }
      const [version, name] = params;
      migrationsTable.set(version, { version, name, applied_at: new Date().toISOString() });
      return { rows: [], rowCount: 1 };
    }

    // Default return
    return { rows: [], rowCount: 0 };
  }

  public async withTransaction<T>(callback: (client: IDatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  public async close(): Promise<void> {
    this.tables.clear();
  }
}

export class PostgresService implements IDatabaseClient {
  private pool: pg.Pool | null = null;
  private fallback: InMemoryFallbackClient = new InMemoryFallbackClient();
  private isConnected = false;

  constructor() {
    this.initPool();
  }

  private initPool(): void {
    if (this.pool) return;
    if (!process.env.DATABASE_URL && !process.env.SUPABASE_DATABASE_URL) {
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
      dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
      try {
        EnvLoader.load();
      } catch (e) {
        // Continue gracefully
      }
    }
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    if (connectionString && connectionString.trim().length > 0) {
      try {
        let poolConfig: any;
        if (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://')) {
          const u = new URL(connectionString);
          poolConfig = {
            host: u.hostname,
            port: parseInt(u.port, 10) || 5432,
            user: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
            database: u.pathname.replace(/^\//, '') || 'postgres',
            ssl: connectionString.includes('supabase') || connectionString.includes('sslmode=require')
              ? { rejectUnauthorized: false }
              : undefined,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          };
        } else {
          poolConfig = { connectionString };
        }
        this.pool = new Pool(poolConfig);
        this.isConnected = true;
        this.pool.on('error', (err) => {
          console.warn('[PostgresService] Pool error, maintaining resilient operations:', err.message);
        });
      } catch (err) {
        console.warn('[PostgresService] Could not initialize Postgres pool:', err);
      }
    }
  }

  public getPool(): pg.Pool {
    if (!this.pool) {
      this.initPool();
    }
    if (!this.pool) {
      throw new Error('[PostgresService] Connection pool is not initialized');
    }
    return this.pool;
  }

  public isLive(): boolean {
    return this.isConnected;
  }

  public async checkConnection(): Promise<boolean> {
    if (!this.pool) {
      this.initPool();
    }
    if (!this.pool) {
      this.isConnected = false;
      return false;
    }
    try {
      const res = await this.pool.query('SELECT 1 as live');
      this.isConnected = res.rows.length > 0;
      return this.isConnected;
    } catch (err: any) {
      this.isConnected = false;
      return false;
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.pool) {
      this.initPool();
    }
    if (this.pool && this.isConnected) {
      try {
        const res = await this.pool.query(sql, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length,
        };
      } catch (err: any) {
        throw new Error(`[PostgresService] Query Error: ${err.message} | SQL: ${sql}`);
      }
    }
    return this.fallback.query<T>(sql, params);
  }

  public async withTransaction<T>(callback: (client: IDatabaseClient) => Promise<T>): Promise<T> {
    if (this.pool && this.isConnected) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const wrappedClient: IDatabaseClient = {
          query: async (sql, params) => {
            const res = await client.query(sql, params);
            return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
          },
          withTransaction: () => {
            throw new Error('Nested transactions not supported');
          },
          isLive: () => true,
          close: async () => {},
        };
        const result = await callback(wrappedClient);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    return this.fallback.withTransaction(callback);
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
    await this.fallback.close();
  }
}

export const dbClient = new PostgresService();
