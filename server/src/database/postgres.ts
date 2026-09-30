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
    const cleanSql = sql.trim().replace(/;$/, '');
    
    // 1. CREATE TABLE
    if (/^CREATE TABLE/i.test(cleanSql)) {
      const match = cleanSql.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (match) {
        const tbl = match[1].toLowerCase();
        if (!this.tables.has(tbl)) this.tables.set(tbl, new Map());
      }
      return { rows: [], rowCount: 0 };
    }

    // 2. DROP TABLE
    if (/^DROP TABLE/i.test(cleanSql)) {
      const match = cleanSql.match(/DROP TABLE\s+(?:IF EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (match) {
        const tbl = match[1].toLowerCase();
        this.tables.delete(tbl);
      }
      return { rows: [], rowCount: 0 };
    }

    // 3. Schema migrations query
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
      migrationsTable.set(String(version), { version, name, applied_at: new Date().toISOString() });
      return { rows: [], rowCount: 1 };
    }

    // 4. Generic INSERT INTO [table]
    const insertMatch = cleanSql.match(/^INSERT INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES/i);
    if (insertMatch) {
      const tbl = insertMatch[1].toLowerCase();
      let tableMap = this.tables.get(tbl);
      if (!tableMap) {
        tableMap = new Map();
        this.tables.set(tbl, tableMap);
      }
      const cols = insertMatch[2].split(',').map(c => c.trim().toLowerCase());
      const row: any = {};
      cols.forEach((col, idx) => {
        row[col] = params[idx] !== undefined ? params[idx] : null;
      });
      const id = row.id || row.key || String(params[0] ?? Date.now());
      tableMap.set(String(id), row);
      return { rows: [row as T], rowCount: 1 };
    }

    // 5. Generic SELECT FROM [table]
    const selectMatch = cleanSql.match(/^SELECT\s+.*?\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?/i);
    if (selectMatch) {
      const tbl = selectMatch[1].toLowerCase();
      const tableMap = this.tables.get(tbl) || new Map();
      let rows = Array.from(tableMap.values());
      if (selectMatch[2] && params.length > 0) {
        rows = rows.filter(r => {
          return Object.values(r).some(v => v === params[0] || String(v) === String(params[0]));
        });
      }
      return { rows: rows as T[], rowCount: rows.length };
    }

    // 6. Generic UPDATE [table]
    const updateMatch = cleanSql.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (updateMatch) {
      const tbl = updateMatch[1].toLowerCase();
      const tableMap = this.tables.get(tbl) || new Map();
      let updatedCount = 0;
      for (const [key, row] of tableMap.entries()) {
        if (params.length > 1 && String(row.id || key) === String(params[params.length - 1])) {
          tableMap.set(key, { ...row, value: params[0], updated_at: new Date().toISOString() });
          updatedCount++;
        }
      }
      return { rows: [], rowCount: updatedCount };
    }

    // 7. Generic DELETE FROM [table]
    const deleteMatch = cleanSql.match(/^DELETE FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
    if (deleteMatch) {
      const tbl = deleteMatch[1].toLowerCase();
      const tableMap = this.tables.get(tbl);
      if (!tableMap) return { rows: [], rowCount: 0 };
      if (!deleteMatch[2] || params.length === 0) {
        const count = tableMap.size;
        tableMap.clear();
        return { rows: [], rowCount: count };
      }
      let deleted = 0;
      for (const [key, row] of Array.from(tableMap.entries())) {
        if (String(row.id || key) === String(params[0]) || Object.values(row).some(v => v === params[0])) {
          tableMap.delete(key);
          deleted++;
        }
      }
      return { rows: [], rowCount: deleted };
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
  private lastReconnectAttempt = 0;

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
            connectionTimeoutMillis: 5000,
          };
        } else {
          poolConfig = { connectionString, connectionTimeoutMillis: 5000 };
        }
        this.pool = new Pool(poolConfig);
        this.isConnected = true;
        this.pool.on('error', (err) => {
          console.warn('[PostgresService] Pool background error, switching to resilient fallback:', err.message);
          this.isConnected = false;
        });
      } catch (err) {
        console.warn('[PostgresService] Could not initialize Postgres pool:', err);
        this.isConnected = false;
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

  public getDatabaseMode(): 'postgres' | 'in-memory' {
    return this.isConnected ? 'postgres' : 'in-memory';
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

    // Auto-reconnect: if disconnected, periodically test if remote database returned
    if (this.pool && !this.isConnected && (Date.now() - this.lastReconnectAttempt > 30000)) {
      this.lastReconnectAttempt = Date.now();
      try {
        const check = await this.pool.query('SELECT 1 as live');
        if (check.rows.length > 0) {
          this.isConnected = true;
          console.info('[PostgresService] Remote database reconnected successfully. Active mode: postgres');
        }
      } catch {
        // Keep in fallback mode
      }
    }

    if (this.pool && this.isConnected) {
      try {
        const res = await this.pool.query(sql, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length,
        };
      } catch (err: any) {
        if (
          err.code === 'ENOTFOUND' ||
          err.code === 'ECONNREFUSED' ||
          err.code === 'ETIMEDOUT' ||
          err.message?.includes('ENOTFOUND') ||
          err.message?.includes('ECONNREFUSED') ||
          err.message?.includes('getaddrinfo')
        ) {
          console.warn(JSON.stringify({
            event: 'DATABASE_FALLBACK_ACTIVATED',
            reason: err.message,
            databaseMode: 'in-memory',
            timestamp: new Date().toISOString()
          }));
          this.isConnected = false;
          return this.fallback.query<T>(sql, params);
        }
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

export const pool = {
  query: (sql: string, params: any[] = []) => dbClient.query(sql, params)
};
