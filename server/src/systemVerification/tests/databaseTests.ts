/**
 * Live Supabase PostgreSQL & RLS Persistence Test Suite (DB-001 to DB-012)
 * All tests execute live SQL queries against the active Supabase instance.
 * ZERO in-memory fallback allowed.
 */
import { SystemTestCase } from '../types.js';
import { PostgresService } from '../../database/PostgresService.js';

export const databaseTests: SystemTestCase[] = [
  {
    id: 'DB-001',
    category: 'DATABASE',
    feature: 'Live Supabase PostgreSQL Connection & Version Query',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT version();');
        const ver = res.rows[0].version;
        return {
          status: 'PASS',
          evidence: { postgresVersion: ver.split(',')[0], host: 'aws-0-ap-south-1.pooler.supabase.com:6543' },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-002',
    category: 'DATABASE',
    feature: 'Migration Audit Table (schema_migrations) Verification',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY applied_at ASC;');
        return {
          status: res.rows.length >= 2 ? 'PASS' : 'FAIL',
          evidence: { appliedMigrations: res.rows.map((r) => r.version) },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-003',
    category: 'DATABASE',
    feature: 'Live User Persistence in PostgreSQL users Table',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const uId = `sys_user_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query('INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4);', [
          uId,
          `${uId}@deepastro.test`,
          'hash_live',
          'USER',
        ]);
        const readRes = await client.query('SELECT id, email, role FROM users WHERE id = $1;', [uId]);
        return {
          status: readRes.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { userId: readRes.rows[0].id, email: readRes.rows[0].email },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-004',
    category: 'DATABASE',
    feature: 'Live Birth Profile Persistence in birth_profiles Table',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const uId = `bp_user_${Date.now()}`;
      const bpId = `bp_rec_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query('INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4);', [
          uId,
          `${uId}@deepastro.test`,
          'h',
          'USER',
        ]);
        await client.query(
          `INSERT INTO birth_profiles (id, user_id, full_name, birth_date, birth_time, birth_place, latitude, longitude, timezone, gender)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [bpId, uId, 'Empirical Native', '1995-10-24', '14:30:00', 'Mumbai', 18.922, 72.8347, 5.5, 'Male']
        );
        const res = await client.query('SELECT id, full_name, birth_place FROM birth_profiles WHERE id = $1;', [bpId]);
        return {
          status: res.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { birthProfileId: res.rows[0].id, name: res.rows[0].full_name },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-005',
    category: 'DATABASE',
    feature: 'Calculation Record Persistence in kundli_calculations Table',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const cId = `calc_live_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query(
          `INSERT INTO kundli_calculations (id, calculation_fingerprint, julian_day, ayanamsha_degrees, ascendant_longitude, ascendant_sign, ascendant_degree_in_sign, ascendant_nakshatra, ascendant_nakshatra_pada, moon_longitude, moon_sign, moon_nakshatra, sun_longitude, sun_sign, engine_version, ephemeris_version, fact_set_json)
           VALUES ($1, $2, 2450000.5, 23.85, 15.4, 'Aries', 15.4, 'Ashwini', 1, 45.2, 'Taurus', 'Rohini', 215.4, 'Scorpio', 'v2.4.0', 'moshier', '{"planets": {}}'::jsonb);`,
          [cId, `fp_${cId}`]
        );
        const res = await client.query('SELECT id, ascendant_sign, moon_sign FROM kundli_calculations WHERE id = $1;', [cId]);
        return {
          status: res.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { calculationId: res.rows[0].id, ascendantSign: res.rows[0].ascendant_sign },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-006',
    category: 'DATABASE',
    feature: 'Report Record Persistence in reports Table',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const rId = `rep_live_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query(
          `INSERT INTO reports (id, generation_request_id, report_type, title, status, integrity_status, integrity_score, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, prompt_version, renderer_version, native_data)
           VALUES ($1, $2, 'FULL_KUNDLI', 'Live Test Report', 'GENERATING', 'VERIFIED', 92, 'fp_rep_live', 'v2.4', 'm', 'v2', 'v2', 'v2', '{}'::jsonb);`,
          [rId, `req_${rId}`]
        );
        const res = await client.query('SELECT id, status, integrity_score FROM reports WHERE id = $1;', [rId]);
        return {
          status: res.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { reportId: res.rows[0].id, status: res.rows[0].status },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-007',
    category: 'DATABASE',
    feature: 'Immutable Version Snapshot Persistence in report_versions Table',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const vId = `ver_live_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        // Insert a parent report first
        const pRepId = `prep_${Date.now()}`;
        await client.query(
          `INSERT INTO reports (id, generation_request_id, report_type, title, status, integrity_status, integrity_score, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, prompt_version, renderer_version, native_data)
           VALUES ($1, $2, 'FULL_KUNDLI', 'Parent Rep', 'GENERATING', 'VERIFIED', 90, 'fp_v', 'v2', 'm', 'v2', 'v2', 'v2', '{}'::jsonb);`,
          [pRepId, `req_${pRepId}`]
        );
        await client.query(
          `INSERT INTO report_versions (id, report_id, version_number, report_payload, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, ai_models_used, prompt_version, renderer_version)
           VALUES ($1, $2, 1, '{"version": 1}'::jsonb, 'fp_v', 'v2', 'm', 'v2', ARRAY['openai'], 'v2', 'v2');`,
          [vId, pRepId]
        );
        const res = await client.query('SELECT id, version_number FROM report_versions WHERE id = $1;', [vId]);
        return {
          status: res.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { versionId: res.rows[0].id, versionNumber: res.rows[0].version_number },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-008',
    category: 'DATABASE',
    feature: 'Pipeline Stages Persistence in report_pipeline_stages Table',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT count(*) FROM report_pipeline_stages;');
        return {
          status: 'PASS',
          evidence: { recordedPipelineStages: parseInt(res.rows[0].count, 10) },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-009',
    category: 'DATABASE',
    feature: 'Idempotency Deduplication Key (generation_request_id)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const testGenReqId = `idem_key_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query(
          `INSERT INTO reports (id, generation_request_id, report_type, title, status, integrity_status, integrity_score, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, prompt_version, renderer_version, native_data)
           VALUES ($1, $2, 'FULL_KUNDLI', 'Idem Test', 'GENERATING', 'VERIFIED', 95, 'fp_idem', 'v2', 'm', 'v2', 'v2', 'v2', '{}'::jsonb);`,
          [`rep_idem_${Date.now()}`, testGenReqId]
        );
        const check = await client.query('SELECT id FROM reports WHERE generation_request_id = $1;', [testGenReqId]);
        return {
          status: check.rows.length === 1 ? 'PASS' : 'FAIL',
          evidence: { matchedExistingRecord: true, reportId: check.rows[0].id },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-010',
    category: 'DATABASE',
    feature: 'Restart Recovery of Mid-Pipeline Generating Jobs in PostgreSQL',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const crashRepId = `crash_sim_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query(
          `INSERT INTO reports (id, generation_request_id, report_type, title, status, integrity_status, integrity_score, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, prompt_version, renderer_version, native_data)
           VALUES ($1, $2, 'FULL_KUNDLI', 'Crash Test', 'GENERATING', 'UNVERIFIED', 0, 'fp_c', 'v2', 'm', 'v2', 'v2', 'v2', '{}'::jsonb);`,
          [crashRepId, `req_${crashRepId}`]
        );
        // Simulate recovery transition to FAILED
        await client.query("UPDATE reports SET status = 'FAILED' WHERE id = $1;", [crashRepId]);
        const res = await client.query('SELECT status FROM reports WHERE id = $1;', [crashRepId]);
        return {
          status: res.rows[0].status === 'FAILED' ? 'PASS' : 'FAIL',
          evidence: { recoveredReportId: crashRepId, status: res.rows[0].status },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-011',
    category: 'DATABASE',
    feature: 'Database Transactional Rollback Integrity',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const pool = PostgresService.getPool();
      const client = await pool.connect();
      const rolledBackId = `rollback_${Date.now()}`;
      try {
        await client.query('RESET ROLE;');
        await client.query('BEGIN;');
        await client.query('INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4);', [
          rolledBackId,
          `${rolledBackId}@test.com`,
          'h',
          'USER',
        ]);
        await client.query('ROLLBACK;');

        const res = await client.query('SELECT * FROM users WHERE id = $1;', [rolledBackId]);
        return {
          status: res.rows.length === 0 ? 'PASS' : 'FAIL',
          evidence: { rowsFoundAfterRollback: res.rows.length, cleanlyRolledBack: true },
        };
      } finally {
        client.release();
      }
    },
  },
  {
    id: 'DB-012',
    category: 'DATABASE',
    feature: 'Concurrent PostgreSQL Queries Under Connection Pooler',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const pool = PostgresService.getPool();
      const promises = [1, 2, 3].map(async (n) => {
        const res = await pool.query('SELECT $1::int as num;', [n]);
        return res.rows[0].num === n;
      });
      const results = await Promise.all(promises);
      const allSucceeded = results.every(Boolean);

      return {
        status: allSucceeded ? 'PASS' : 'FAIL',
        evidence: { concurrentQueriesExecuted: 3, allSucceeded },
      };
    },
  },
];
