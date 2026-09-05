/**
 * PostgresService Facade
 * Provides static and instance access to the PostgresService client and pool.
 */
import { PostgresService as BasePostgresService, dbClient } from './postgres.js';
import pg from 'pg';

export class PostgresService extends BasePostgresService {
  public static getPool(): pg.Pool {
    return dbClient.getPool();
  }

  public static async query<T = any>(sql: string, params?: any[]) {
    return dbClient.query<T>(sql, params);
  }
}

export { dbClient };
export default dbClient;
