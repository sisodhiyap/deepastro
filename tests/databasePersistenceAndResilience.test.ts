import { describe, it, expect } from 'vitest';
import { dbClient } from '../server/src/database/postgres.js';

describe('Phase 3 & 4 — Database Persistence and Resilience Contract', () => {
  it('executes full transactional CRUD cycle without data loss', async () => {
    const testTable = 'test_persistence_harness';
    const testId = `snap_${Date.now()}_test`;

    // 1. CREATE
    const createRes = await dbClient.query(`CREATE TABLE IF NOT EXISTS ${testTable} (id TEXT PRIMARY KEY, value TEXT, metadata TEXT)`);
    expect(createRes).toBeDefined();

    // 2. INSERT / WRITE
    const insertRes = await dbClient.query(
      `INSERT INTO ${testTable} (id, value, metadata) VALUES ($1, $2, $3)`,
      [testId, 'Payload_Alpha', 'Meta_1']
    );
    expect(insertRes.rowCount).toBe(1);

    // 3. READ
    const readRes = await dbClient.query(`SELECT * FROM ${testTable} WHERE id = $1`, [testId]);
    expect(readRes.rowCount).toBe(1);
    expect(readRes.rows[0].id).toBe(testId);
    expect(readRes.rows[0].value).toBe('Payload_Alpha');

    // 4. UPDATE
    const updateRes = await dbClient.query(
      `UPDATE ${testTable} SET value = $1 WHERE id = $2`,
      ['Payload_Beta', testId]
    );
    expect(updateRes.rowCount).toBe(1);

    // Verify Updated Value
    const verifyRead = await dbClient.query(`SELECT * FROM ${testTable} WHERE id = $1`, [testId]);
    expect(verifyRead.rows[0].value).toBe('Payload_Beta');

    // 5. DELETE
    const deleteRes = await dbClient.query(`DELETE FROM ${testTable} WHERE id = $1`, [testId]);
    expect(deleteRes.rowCount).toBe(1);

    // Verify record is gone
    const postDeleteRead = await dbClient.query(`SELECT * FROM ${testTable} WHERE id = $1`, [testId]);
    expect(postDeleteRead.rowCount).toBe(0);

    // 6. CLEANUP
    await dbClient.query(`DROP TABLE IF EXISTS ${testTable}`);
  });

  it('reports deterministic database mode without crashing', () => {
    const mode = dbClient.getDatabaseMode();
    expect(['postgres', 'in-memory']).toContain(mode);
    expect(typeof dbClient.isLive()).toBe('boolean');
  });
});
