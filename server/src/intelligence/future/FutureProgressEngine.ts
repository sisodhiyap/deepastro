/**
 * FutureProgressEngine.ts
 * DeepAstro Future Intelligence 8.0 - User Progress & Habit Tracking Engine
 *
 * Securely persists user progress for remedies started/completed, habits,
 * personal goals, and reflection notes with strict tenant isolation by userId.
 * Backed by PostgreSQL with robust in-memory fallback.
 */

import { pool } from '../../database/postgres.js';
import crypto from 'node:crypto';

export interface UserProgressItem {
  id: string;
  userId: string;
  category: 'REMEDY' | 'HABIT' | 'GOAL' | 'REFLECTION' | 'NOTE';
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  planetTargeted?: string;
  domain?: string;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class FutureProgressEngine {
  private static memoryStore: Map<string, UserProgressItem[]> = new Map();
  private static tableInitialized = false;

  private static async ensureTable(): Promise<void> {
    if (this.tableInitialized) return;
    this.tableInitialized = true;
    try {
      if (pool) {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS future_user_progress (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            category VARCHAR(32) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
            planet_targeted VARCHAR(32),
            domain VARCHAR(32),
            target_date VARCHAR(64),
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )`,
          []
        );
      }
    } catch (err) {
      console.warn('[FutureProgressEngine] Table init warning, continuing with memory store:', err);
    }
  }

  public static async createItem(
    userId: string,
    data: {
      category: 'REMEDY' | 'HABIT' | 'GOAL' | 'REFLECTION' | 'NOTE';
      title: string;
      description?: string;
      planetTargeted?: string;
      domain?: string;
      targetDate?: string;
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    }
  ): Promise<UserProgressItem> {
    await this.ensureTable();
    const now = new Date().toISOString();
    const id = `prog_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const item: UserProgressItem = {
      id,
      userId,
      category: data.category,
      title: data.title,
      description: data.description || '',
      status: data.status || 'IN_PROGRESS',
      planetTargeted: data.planetTargeted,
      domain: data.domain,
      targetDate: data.targetDate,
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (pool) {
        await pool.query(
          `INSERT INTO future_user_progress (id, user_id, category, title, description, status, planet_targeted, domain, target_date, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            item.id,
            item.userId,
            item.category,
            item.title,
            item.description,
            item.status,
            item.planetTargeted || null,
            item.domain || null,
            item.targetDate || null,
          ]
        );
      }
    } catch (err) {
      console.warn('[FutureProgressEngine] Postgres insert warning:', err);
    }

    const list = this.memoryStore.get(userId) || [];
    list.unshift(item);
    this.memoryStore.set(userId, list);

    return item;
  }

  public static async getItemsByUser(userId: string): Promise<UserProgressItem[]> {
    await this.ensureTable();
    try {
      if (pool) {
        const res = await pool.query(
          `SELECT id, user_id as "userId", category, title, description, status, planet_targeted as "planetTargeted", domain, target_date as "targetDate", completed_at as "completedAt", created_at as "createdAt", updated_at as "updatedAt"
           FROM future_user_progress
           WHERE user_id = $1
           ORDER BY created_at DESC LIMIT 100`,
          [userId]
        );
        if (res.rows && res.rows.length > 0) {
          return res.rows;
        }
      }
    } catch (err) {
      console.warn('[FutureProgressEngine] Postgres select warning:', err);
    }

    return this.memoryStore.get(userId) || [];
  }

  public static async updateItem(
    userId: string,
    itemId: string,
    updates: Partial<UserProgressItem>
  ): Promise<UserProgressItem | null> {
    await this.ensureTable();
    const now = new Date().toISOString();
    const completedAt = updates.status === 'COMPLETED' ? now : undefined;

    try {
      if (pool) {
        const res = await pool.query(
          `UPDATE future_user_progress
           SET status = COALESCE($1, status),
               description = COALESCE($2, description),
               completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END,
               updated_at = NOW()
           WHERE id = $3 AND user_id = $4
           RETURNING id, user_id as "userId", category, title, description, status, planet_targeted as "planetTargeted", domain, target_date as "targetDate", completed_at as "completedAt", created_at as "createdAt", updated_at as "updatedAt"`,
          [updates.status || null, updates.description || null, itemId, userId]
        );
        if (res.rows && res.rows.length > 0) {
          return res.rows[0];
        }
      }
    } catch (err) {
      console.warn('[FutureProgressEngine] Postgres update warning:', err);
    }

    const list = this.memoryStore.get(userId) || [];
    const idx = list.findIndex((i) => i.id === itemId && i.userId === userId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...updates,
        completedAt: updates.status === 'COMPLETED' ? now : list[idx].completedAt,
        updatedAt: now,
      };
      this.memoryStore.set(userId, list);
      return list[idx];
    }

    return null;
  }

  public static async deleteItem(userId: string, itemId: string): Promise<boolean> {
    await this.ensureTable();
    try {
      if (pool) {
        await pool.query(
          `DELETE FROM future_user_progress WHERE id = $1 AND user_id = $2`,
          [itemId, userId]
        );
      }
    } catch (err) {
      console.warn('[FutureProgressEngine] Postgres delete warning:', err);
    }

    const list = this.memoryStore.get(userId) || [];
    const filtered = list.filter((i) => !(i.id === itemId && i.userId === userId));
    this.memoryStore.set(userId, filtered);
    return true;
  }
}
