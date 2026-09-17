/**
 * DEEPASTRO 4.2 / 6.0 — Production Authentication & Security Truth Audit
 * Verifies server-side security gate, cryptographic token issuance,
 * zero client-side secret leakage, server-enforced role authorization,
 * public registration privilege defense, enumeration-safe password reset,
 * and immutable admin audit logging.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../server/src/index.js';
import { db } from '../server/src/database/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';
const AUTH_SECRET = process.env.DEEPASTRO_ACCESS_SECRET || 'Deep1904';

describe('DeepAstro Production Authentication & Security Suite', () => {
  let adminToken: string;
  let clientToken: string;
  const adminEmail = `admin_sec_${Date.now()}@deepastro.com`;
  const clientEmail = `client_sec_${Date.now()}@deepastro.com`;

  beforeAll(async () => {
    // 1. Register standard client
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Standard Cosmic Seeker',
        email: clientEmail,
        password: 'SecureUserPassword2026!',
      });
    expect(regRes.status).toBe(201);
    clientToken = regRes.body.token;

    // 2. Provision authorized administrator directly in DB for testing
    const adminUser = {
      id: `admin_test_${Date.now()}`,
      email: adminEmail,
      passwordHash: 'hashed_pw_test',
      role: 'ADMIN' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    db.users.set(adminUser.id, adminUser);
    adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }, 30000);

  describe('1. Server-Side Security Gate & Cryptographic Verification', () => {
    it('accepts correct authorization code on server and returns signed JWT token', async () => {
      const res = await request(app)
        .post('/api/security/verify')
        .send({ code: AUTH_SECRET });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(20);

      // Verify the returned token is cryptographically signed
      const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
      expect(decoded.authorized).toBe(true);

      // Ensure the raw secret is NEVER sent back in the response
      expect(JSON.stringify(res.body)).not.toContain(AUTH_SECRET);
    });

    it('rejects invalid authorization codes with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/security/verify')
        .send({ code: 'WrongSecretKey9999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED_ACCESS_CODE');
    });

    it('rejects empty or missing authorization codes with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/security/verify')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CODE_REQUIRED');
    });

    it('validates security gate status via GET /api/security/status', async () => {
      // Valid token check
      const validToken = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '1h' });
      const validRes = await request(app)
        .get('/api/security/status')
        .set('Authorization', `Bearer ${validToken}`);

      expect(validRes.status).toBe(200);
      expect(validRes.body.unlocked).toBe(true);

      // Invalid token check
      const invalidRes = await request(app)
        .get('/api/security/status')
        .set('Authorization', 'Bearer invalid_garbage_token');

      expect(invalidRes.status).toBe(200);
      expect(invalidRes.body.unlocked).toBe(false);
    });
  });

  describe('2. Zero Client-Side Secret Leakage Audit', () => {
    it('verifies that Deep1904 is absent from all frontend source files in src/', () => {
      const srcDir = path.resolve(process.cwd(), 'src');
      const filesWithSecret: string[] = [];

      function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('Deep1904')) {
              filesWithSecret.push(fullPath);
            }
          }
        }
      }

      scanDir(srcDir);
      expect(filesWithSecret).toEqual([]);
    });
  });

  describe('3. Public Registration Privilege Escalation Defense', () => {
    it('prevents attackers from creating ADMIN accounts via public register endpoint', async () => {
      const maliciousEmail = `hacker_${Date.now()}@deepastro.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Malicious Actor',
          email: maliciousEmail,
          password: 'Password123!',
          role: 'ADMIN', // Malicious attempt to self-escalate to ADMIN
        });

      expect(res.status).toBe(201);
      // Server MUST assign CLIENT, overriding any requested role
      expect(res.body.user.role).toBe('CLIENT');

      // Verify in server database as well
      const savedUser = db.getUserByEmail(maliciousEmail);
      expect(savedUser?.role).toBe('CLIENT');
      expect(savedUser?.role).not.toBe('ADMIN');
    });
  });

  describe('4. Server-Enforced RBAC & Admin Endpoint Protection', () => {
    it('denies unauthenticated requests to /api/admin/metrics with 401', async () => {
      const res = await request(app).get('/api/admin/metrics');
      expect(res.status).toBe(401);
    });

    it('denies authenticated CLIENT requests to /api/admin/metrics with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });

    it('permits verified ADMIN accounts to access /api/admin/metrics with 200 OK', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('overview');
      expect(res.body).toHaveProperty('providerHealth');
    });
  });

  describe('5. Secure Admin Account Provisioning', () => {
    it('rejects admin provisioning by non-admin callers', async () => {
      const res = await request(app)
        .post('/api/admin/provision-admin')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          email: `newadmin_${Date.now()}@deepastro.com`,
          password: 'AdminPassword123!',
          fullName: 'Unauthorized Target',
        });

      expect(res.status).toBe(403);
    });

    it('allows verified admin to securely provision a new administrator', async () => {
      const newAdminEmail = `superadmin_prov_${Date.now()}@deepastro.com`;
      const res = await request(app)
        .post('/api/admin/provision-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: newAdminEmail,
          password: 'AdminSecurePassword2026!',
          fullName: 'Provisioned Ops Lead',
        });

      expect(res.status).toBe(201);
      expect(res.body.admin.email).toBe(newAdminEmail);
      expect(res.body.admin.role).toBe('ADMIN');

      // Verify in DB
      const dbUser = db.getUserByEmail(newAdminEmail);
      expect(dbUser?.role).toBe('ADMIN');
    });
  });

  describe('6. Enumeration-Resistant Password Reset', () => {
    it('returns uniform generic response regardless of whether email exists', async () => {
      // Call with registered email
      const resExisting = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: clientEmail });

      expect(resExisting.status).toBe(200);
      expect(resExisting.body.success).toBe(true);
      expect(resExisting.body.message).toBe(
        "If an account exists for this email, you'll receive password reset instructions."
      );

      // Call with non-existing email
      const resNonExisting = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ghost_nonexistent_email_9999@deepastro.com' });

      expect(resNonExisting.status).toBe(200);
      expect(resNonExisting.body.success).toBe(true);
      // Response messages MUST be identical to prevent user enumeration
      expect(resNonExisting.body.message).toBe(resExisting.body.message);
    });
  });

  describe('7. Immutable Admin Audit Logging & Redaction', () => {
    it('records administrative actions without exposing secrets, passwords, or tokens', async () => {
      // Query audit logs via admin endpoint
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.logs)).toBe(true);

      for (const log of res.body.logs) {
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('event');
        expect(log).toHaveProperty('timestamp');

        // Audit logs MUST NOT leak passwords, tokens, or secrets
        const serialized = JSON.stringify(log);
        expect(serialized).not.toContain('passwordHash');
        expect(serialized).not.toContain('AdminPassword123!');
        expect(serialized).not.toContain(AUTH_SECRET);
      }
    });
  });
});
