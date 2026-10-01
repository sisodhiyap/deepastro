/**
 * FutureIntelligenceRepository.ts
 * Relational and in-memory persistence layer for Future Intelligence Engine (FUTURE_INTELLIGENCE_V1).
 * Supports saved charts, future forecasts, annual forecasts, and signal windows.
 */

import { IDatabaseClient, dbClient } from '../postgres.js';
import {
  db,
  SavedChartRecord,
  FutureForecastRecord,
  FutureForecastYearRecord,
  FutureForecastWindowRecord,
} from '../db.js';

export class FutureIntelligenceRepository {
  private client: IDatabaseClient;

  constructor(client: IDatabaseClient = dbClient) {
    this.client = client;
  }

  // --- Saved Charts ---
  public async saveSavedChart(chart: SavedChartRecord): Promise<SavedChartRecord> {
    db.saveSavedChart(chart);

    if (this.client.isLive()) {
      try {
        const sql = `
          INSERT INTO saved_charts (
            id, user_id, name, birth_date, birth_time, birth_place,
            latitude, longitude, timezone, gender, is_approximate_time,
            relationship, calculation_fingerprint, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            birth_date = EXCLUDED.birth_date,
            birth_time = EXCLUDED.birth_time,
            birth_place = EXCLUDED.birth_place,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            timezone = EXCLUDED.timezone,
            gender = EXCLUDED.gender,
            is_approximate_time = EXCLUDED.is_approximate_time,
            relationship = EXCLUDED.relationship,
            calculation_fingerprint = EXCLUDED.calculation_fingerprint,
            updated_at = EXCLUDED.updated_at;
        `;
        const now = new Date().toISOString();
        await this.client.query(sql, [
          chart.id,
          chart.userId,
          chart.name,
          chart.birthDate,
          chart.birthTime,
          chart.birthPlace,
          chart.latitude,
          chart.longitude,
          chart.timezone,
          chart.gender || 'Other',
          Boolean(chart.isApproximateTime),
          chart.relationship || 'Self',
          chart.calculationFingerprint || null,
          chart.createdAt || now,
          now,
        ]);
      } catch (err) {
        console.warn('[FutureRepo] Failed to persist saved chart to DB:', err);
      }
    }

    return chart;
  }

  public async getSavedCharts(userId: string): Promise<SavedChartRecord[]> {
    if (this.client.isLive()) {
      try {
        const res = await this.client.query(
          'SELECT * FROM saved_charts WHERE user_id = $1 ORDER BY created_at ASC;',
          [userId]
        );
        if (res.rows && res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            birthDate: r.birth_date instanceof Date ? r.birth_date.toISOString().split('T')[0] : String(r.birth_date),
            birthTime: String(r.birth_time || '').slice(0, 5),
            birthPlace: r.birth_place,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            timezone: Number(r.timezone),
            gender: r.gender,
            isApproximateTime: Boolean(r.is_approximate_time),
            relationship: r.relationship || 'Self',
            calculationFingerprint: r.calculation_fingerprint,
            createdAt: r.created_at,
          }));
        }
      } catch (err) {
        console.warn('[FutureRepo] Failed to query saved charts from DB:', err);
      }
    }

    return db.getSavedCharts(userId);
  }

  public async getSavedChartById(chartId: string, userId?: string): Promise<SavedChartRecord | null> {
    if (this.client.isLive()) {
      try {
        const sql = userId
          ? 'SELECT * FROM saved_charts WHERE id = $1 AND user_id = $2 LIMIT 1;'
          : 'SELECT * FROM saved_charts WHERE id = $1 LIMIT 1;';
        const params = userId ? [chartId, userId] : [chartId];
        const res = await this.client.query(sql, params);
        if (res.rows && res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            name: r.name,
            birthDate: r.birth_date instanceof Date ? r.birth_date.toISOString().split('T')[0] : String(r.birth_date),
            birthTime: String(r.birth_time || '').slice(0, 5),
            birthPlace: r.birth_place,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            timezone: Number(r.timezone),
            gender: r.gender,
            isApproximateTime: Boolean(r.is_approximate_time),
            relationship: r.relationship || 'Self',
            calculationFingerprint: r.calculation_fingerprint,
            createdAt: r.created_at,
          };
        }
      } catch (err) {
        console.warn('[FutureRepo] Failed to query saved chart by id from DB:', err);
      }
    }

    const mem = db.getSavedChart(chartId);
    if (!mem) return null;
    if (userId && mem.userId !== userId) return null;
    return mem;
  }

  // --- Forecast Persistence ---
  public async saveForecast(
    forecast: FutureForecastRecord,
    years: FutureForecastYearRecord[],
    windows: FutureForecastWindowRecord[]
  ): Promise<void> {
    // 1. In-memory
    db.saveFutureForecast(forecast);
    db.saveFutureForecastYears(years);
    db.saveFutureForecastWindows(windows);

    // 2. PostgreSQL
    if (this.client.isLive()) {
      try {
        await this.client.query(
          `INSERT INTO future_forecasts (
            id, user_id, chart_id, calculation_fingerprint, prediction_version,
            forecast_horizon, start_date, end_date, summary_theme, signal_strength,
            confidence_level, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            summary_theme = EXCLUDED.summary_theme,
            signal_strength = EXCLUDED.signal_strength,
            confidence_level = EXCLUDED.confidence_level,
            updated_at = EXCLUDED.updated_at;`,
          [
            forecast.id,
            forecast.userId,
            forecast.chartId,
            forecast.calculationFingerprint,
            forecast.predictionVersion,
            forecast.forecastHorizon,
            forecast.startDate,
            forecast.endDate,
            forecast.summaryTheme,
            forecast.signalStrength,
            forecast.confidenceLevel,
            JSON.stringify(forecast.metadata || {}),
            forecast.createdAt,
            forecast.updatedAt,
          ]
        );

        for (const yr of years) {
          await this.client.query(
            `INSERT INTO future_forecast_years (
              id, forecast_id, year, theme, career, finance, relationships,
              health, family, education, travel, spirituality, signal_strength,
              confidence_score, active_dasha, major_transits, key_planets,
              d9_signals, d10_signals, numerology_signals, important_windows,
              caution_windows, supportive_periods, evidence_json, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            ON CONFLICT (id) DO NOTHING;`,
            [
              yr.id,
              yr.forecastId,
              yr.year,
              yr.theme,
              yr.career,
              yr.finance,
              yr.relationships,
              yr.health,
              yr.family,
              yr.education,
              yr.travel,
              yr.spirituality,
              yr.signalStrength,
              yr.confidenceScore,
              yr.activeDasha,
              JSON.stringify(yr.majorTransits || []),
              JSON.stringify(yr.keyPlanets || []),
              JSON.stringify(yr.d9Signals || []),
              JSON.stringify(yr.d10Signals || []),
              JSON.stringify(yr.numerologySignals || {}),
              JSON.stringify(yr.importantWindows || []),
              JSON.stringify(yr.cautionWindows || []),
              JSON.stringify(yr.supportivePeriods || []),
              JSON.stringify(yr.evidenceJson || []),
              yr.createdAt,
            ]
          );
        }

        for (const win of windows) {
          await this.client.query(
            `INSERT INTO future_forecast_windows (
              id, forecast_id, start_date, peak_date, end_date, category,
              theme, signal_strength, convergence_factor, evidence_json, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING;`,
            [
              win.id,
              win.forecastId,
              win.startDate,
              win.peakDate,
              win.endDate,
              win.category,
              win.theme,
              win.signalStrength,
              win.convergenceFactor,
              JSON.stringify(win.evidenceJson || []),
              win.createdAt,
            ]
          );
        }
      } catch (err) {
        console.warn('[FutureRepo] Failed to persist forecast to DB:', err);
      }
    }
  }

  public async getForecastById(forecastId: string): Promise<{
    forecast: FutureForecastRecord | null;
    years: FutureForecastYearRecord[];
    windows: FutureForecastWindowRecord[];
  }> {
    const memForecast = db.getFutureForecast(forecastId);
    if (memForecast) {
      return {
        forecast: memForecast,
        years: db.getFutureForecastYears(forecastId),
        windows: db.getFutureForecastWindows(forecastId),
      };
    }

    if (this.client.isLive()) {
      try {
        const res = await this.client.query(
          'SELECT * FROM future_forecasts WHERE id = $1 LIMIT 1;',
          [forecastId]
        );
        if (res.rows && res.rows.length > 0) {
          const r = res.rows[0];
          const forecast: FutureForecastRecord = {
            id: r.id,
            userId: r.user_id,
            chartId: r.chart_id,
            calculationFingerprint: r.calculation_fingerprint,
            predictionVersion: r.prediction_version,
            forecastHorizon: r.forecast_horizon,
            startDate: r.start_date instanceof Date ? r.start_date.toISOString().split('T')[0] : String(r.start_date),
            endDate: r.end_date instanceof Date ? r.end_date.toISOString().split('T')[0] : String(r.end_date),
            summaryTheme: r.summary_theme,
            signalStrength: r.signal_strength,
            confidenceLevel: r.confidence_level,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          };

          const yrRes = await this.client.query(
            'SELECT * FROM future_forecast_years WHERE forecast_id = $1 ORDER BY year ASC;',
            [forecastId]
          );
          const years: FutureForecastYearRecord[] = yrRes.rows.map((yr: any) => ({
            id: yr.id,
            forecastId: yr.forecast_id,
            year: Number(yr.year),
            theme: yr.theme,
            career: yr.career,
            finance: yr.finance,
            relationships: yr.relationships,
            health: yr.health,
            family: yr.family,
            education: yr.education,
            travel: yr.travel,
            spirituality: yr.spirituality,
            signalStrength: yr.signal_strength,
            confidenceScore: Number(yr.confidence_score),
            activeDasha: yr.active_dasha,
            majorTransits: typeof yr.major_transits === 'string' ? JSON.parse(yr.major_transits) : yr.major_transits,
            keyPlanets: typeof yr.key_planets === 'string' ? JSON.parse(yr.key_planets) : yr.key_planets,
            d9Signals: typeof yr.d9_signals === 'string' ? JSON.parse(yr.d9_signals) : yr.d9_signals,
            d10Signals: typeof yr.d10_signals === 'string' ? JSON.parse(yr.d10_signals) : yr.d10_signals,
            numerologySignals: typeof yr.numerology_signals === 'string' ? JSON.parse(yr.numerology_signals) : yr.numerology_signals,
            importantWindows: typeof yr.important_windows === 'string' ? JSON.parse(yr.important_windows) : yr.important_windows,
            cautionWindows: typeof yr.caution_windows === 'string' ? JSON.parse(yr.caution_windows) : yr.caution_windows,
            supportivePeriods: typeof yr.supportive_periods === 'string' ? JSON.parse(yr.supportive_periods) : yr.supportive_periods,
            evidenceJson: typeof yr.evidence_json === 'string' ? JSON.parse(yr.evidence_json) : yr.evidence_json,
            createdAt: yr.created_at,
          }));

          const winRes = await this.client.query(
            'SELECT * FROM future_forecast_windows WHERE forecast_id = $1 ORDER BY start_date ASC;',
            [forecastId]
          );
          const windows: FutureForecastWindowRecord[] = winRes.rows.map((w: any) => ({
            id: w.id,
            forecastId: w.forecast_id,
            startDate: w.start_date instanceof Date ? w.start_date.toISOString().split('T')[0] : String(w.start_date),
            peakDate: w.peak_date instanceof Date ? w.peak_date.toISOString().split('T')[0] : String(w.peak_date),
            endDate: w.end_date instanceof Date ? w.end_date.toISOString().split('T')[0] : String(w.end_date),
            category: w.category,
            theme: w.theme,
            signalStrength: w.signal_strength,
            convergenceFactor: Number(w.convergence_factor),
            evidenceJson: typeof w.evidence_json === 'string' ? JSON.parse(w.evidence_json) : w.evidence_json,
            createdAt: w.created_at,
          }));

          return { forecast, years, windows };
        }
      } catch (err) {
        console.warn('[FutureRepo] Failed to query forecast from DB:', err);
      }
    }

    return { forecast: null, years: [], windows: [] };
  }

  public async getCachedForecast(
    userId: string,
    chartId: string,
    fingerprint: string,
    horizon: string
  ): Promise<{
    forecast: FutureForecastRecord | null;
    years: FutureForecastYearRecord[];
    windows: FutureForecastWindowRecord[];
  }> {
    const mem = db.getFutureForecastByFingerprint(userId, chartId, fingerprint, horizon);
    if (mem) {
      return {
        forecast: mem,
        years: db.getFutureForecastYears(mem.id),
        windows: db.getFutureForecastWindows(mem.id),
      };
    }

    if (this.client.isLive()) {
      try {
        const res = await this.client.query(
          `SELECT id FROM future_forecasts 
           WHERE user_id = $1 AND chart_id = $2 AND calculation_fingerprint = $3 AND forecast_horizon = $4 
           ORDER BY created_at DESC LIMIT 1;`,
          [userId, chartId, fingerprint, horizon]
        );
        if (res.rows && res.rows.length > 0) {
          return this.getForecastById(res.rows[0].id);
        }
      } catch (err) {
        console.warn('[FutureRepo] Error looking up cached forecast:', err);
      }
    }

    return { forecast: null, years: [], windows: [] };
  }
}

export const futureIntelligenceRepository = new FutureIntelligenceRepository();
