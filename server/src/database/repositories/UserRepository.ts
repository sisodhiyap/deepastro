/**
 * UserRepository
 * User management and credential validation with parameterized queries.
 */

import { IDatabaseClient, dbClient } from '../postgres.js';
import { UserRecord } from '../db.js';

export class UserRepository {
  private client: IDatabaseClient;
  private memoryUsers: Map<string, UserRecord> = new Map();

  constructor(client: IDatabaseClient = dbClient) {
    this.client = client;
  }

  public async createUser(user: Partial<UserRecord> & { email: string; passwordHash: string; role: 'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN' }): Promise<UserRecord> {
    const record: UserRecord = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: user.email.toLowerCase().trim(),
      passwordHash: user.passwordHash,
      role: user.role,
      isVerified: user.isVerified ?? true,
      createdAt: user.createdAt || new Date().toISOString(),
    };

    if (this.client.isLive()) {
      const sql = `
        INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      await this.client.query(sql, [
        record.id,
        record.email,
        record.passwordHash,
        record.role,
        record.isVerified,
        record.createdAt,
        record.createdAt,
      ]);
    }
    this.memoryUsers.set(record.id, record);
    return record;
  }

  public async getUserById(userId: string): Promise<UserRecord | null> {
    if (this.client.isLive()) {
      const res = await this.client.query('SELECT * FROM users WHERE id = $1 LIMIT 1;', [userId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        email: r.email,
        passwordHash: r.password_hash,
        role: r.role,
        isVerified: r.is_verified,
        createdAt: r.created_at,
      };
    }
    return this.memoryUsers.get(userId) || null;
  }

  public async getUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.toLowerCase().trim();
    if (this.client.isLive()) {
      const res = await this.client.query('SELECT * FROM users WHERE email = $1 LIMIT 1;', [normalized]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        email: r.email,
        passwordHash: r.password_hash,
        role: r.role,
        isVerified: r.is_verified,
        createdAt: r.created_at,
      };
    }
    for (const u of this.memoryUsers.values()) {
      if (u.email.toLowerCase() === normalized) return u;
    }
    return null;
  }
}

export const userRepository = new UserRepository();
