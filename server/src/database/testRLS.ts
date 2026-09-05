import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function testRLS() {
  const url = new URL(process.env.DATABASE_URL!);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Connected. Setting up strict RLS policies...');

  await client.query(`
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reports FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS reports_tenant_isolation ON reports;
    CREATE POLICY reports_tenant_isolation ON reports
      FOR ALL TO authenticated, anon, public
      USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
      );

    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO authenticated;
  `);

  const userA = 'usr_test_a';
  const userB = 'usr_test_b';
  const repB = 'rep_test_b_' + Date.now();

  // Insert test records with admin bypass
  await client.query('BEGIN;');
  await client.query("SELECT set_config('app.is_admin', 'true', true);");
  await client.query(`
    INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, 'h', 'USER') ON CONFLICT DO NOTHING;
  `, [userA, `${userA}@test.com`]);
  await client.query(`
    INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, 'h', 'USER') ON CONFLICT DO NOTHING;
  `, [userB, `${userB}@test.com`]);
  await client.query(`
    INSERT INTO reports (id, user_id, generation_request_id, report_type, title, status, integrity_status, integrity_score, calculation_fingerprint, engine_version, ephemeris_version, rule_engine_version, prompt_version, renderer_version, native_data)
    VALUES ($1, $2, $3, 'FULL_KUNDLI', 'B', 'VERIFIED', 'VERIFIED', 90, 'fp', 'v', 'e', 'r', 'p', 'r', '{}'::jsonb);
  `, [repB, userB, 'req_' + repB]);
  await client.query('COMMIT;');

  console.log('Test records inserted. Testing User A isolation...');

  // Test User A context as non-superuser authenticated role
  await client.query('BEGIN;');
  await client.query('SET ROLE authenticated;');
  await client.query("SELECT set_config('request.jwt.claims', '{\"sub\": \"" + userA + "\"}', true);");
  await client.query("SELECT set_config('app.current_user_id', $1, true);", [userA]);
  await client.query("SELECT set_config('app.is_admin', 'false', true);");

  const selRes = await client.query('SELECT * FROM reports WHERE id = $1;', [repB]);
  console.log('User A SELECT on User B report rows returned:', selRes.rows.length);

  const updRes = await client.query("UPDATE reports SET status = 'FAILED' WHERE id = $1;", [repB]);
  console.log('User A UPDATE on User B report rows affected:', updRes.rowCount);

  const delRes = await client.query('DELETE FROM reports WHERE id = $1;', [repB]);
  console.log('User A DELETE on User B report rows affected:', delRes.rowCount);

  // Test Admin context
  await client.query("SELECT set_config('app.is_admin', 'true', true);");
  const admRes = await client.query('SELECT * FROM reports WHERE id = $1;', [repB]);
  console.log('Admin SELECT on User B report rows returned:', admRes.rows.length);

  await client.query('ROLLBACK;');
  await client.end();
}

testRLS().catch(console.error);
