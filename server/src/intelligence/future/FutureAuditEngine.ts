import { pool } from '../../database/postgres.js';

export interface FutureAuditRecord {
  id: string;
  forecastId: string;
  userId: string;
  calculationFingerprint: string;
  horizon: string;
  requestedLevel: string;
  timestamp: string;
  ipMasked?: string;
}

export class FutureAuditEngine {
  private static store: Map<string, FutureAuditRecord> = new Map();
  private static forecastsByUser: Map<string, any[]> = new Map();

  public static record(params: {
    forecastId: string;
    userId: string;
    calculationFingerprint: string;
    horizon: string;
    requestedLevel: string;
  }): FutureAuditRecord {
    const id = `faud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: FutureAuditRecord = {
      id,
      forecastId: params.forecastId,
      userId: params.userId,
      calculationFingerprint: params.calculationFingerprint,
      horizon: params.horizon,
      requestedLevel: params.requestedLevel,
      timestamp: new Date().toISOString(),
    };
    this.store.set(id, record);
    return record;
  }

  public static async saveForecast(userId: string, forecast: any): Promise<void> {
    const list = this.forecastsByUser.get(userId) || [];
    list.push(forecast);
    this.forecastsByUser.set(userId, list.slice(-10)); // Keep up to 10 in memory

    try {
      if (pool) {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS future_forecasts (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            horizon VARCHAR(32) NOT NULL,
            fingerprint VARCHAR(64) NOT NULL,
            forecast_payload JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );`
        );
        await pool.query(
          `INSERT INTO future_forecasts (id, user_id, horizon, fingerprint, forecast_payload, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET forecast_payload = EXCLUDED.forecast_payload;`,
          [
            forecast.id || forecast.forecastId || `fc_${Date.now()}`,
            userId,
            forecast.horizon || '10_YEARS',
            forecast.calculationFingerprint || forecast.provenance?.calculationFingerprint || 'fp_deterministic',
            JSON.stringify(forecast),
          ]
        );
      }
    } catch {
      // Gracefully continue with in-memory persistence
    }
  }

  public static async getLatestForecast(userId: string): Promise<any | null> {
    try {
      if (pool) {
        const res = await pool.query(
          `SELECT forecast_payload FROM future_forecasts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;`,
          [userId]
        );
        if (res.rows.length > 0) {
          const payload = res.rows[0].forecast_payload;
          return typeof payload === 'string' ? JSON.parse(payload) : payload;
        }
      }
    } catch {
      // Fall back to in-memory
    }
    const list = this.forecastsByUser.get(userId);
    return list && list.length > 0 ? list[list.length - 1] : null;
  }

  public static verifyOwnership(forecastUserId: string, requestingUserId: string): boolean {
    if (!requestingUserId || !forecastUserId) return false;
    return forecastUserId === requestingUserId;
  }
}
