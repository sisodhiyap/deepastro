/**
 * DeepAstro Observatory & Admin QA Access Guard
 * Enforces strict environment boundaries, anti-bypass protection,
 * revocable QA sessions, granular role permissions, and production firewalling.
 *
 * INVARIANTS:
 * 1. QA_MODE is strictly FALSE in production.
 * 2. Bypass headers (x-dev-bypass, x-qa-bypass, x-admin-bypass) are immediately rejected.
 * 3. Client cannot manipulate role, isAdmin, or confidence.
 * 4. QA sessions are short-lived, server-authoritative, and revocable.
 * 5. Test data is strictly labeled SYNTHETIC_TEST and isolated from real metrics.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export type QAPermission =
  | 'OBSERVATORY_READ'
  | 'OBSERVATORY_TEST'
  | 'PREDICTION_AUDIT_READ'
  | 'CALIBRATION_READ'
  | 'FACTCHECK_READ'
  | 'DISCRIMINATOR_TEST'
  | 'AI_CRITIC_TEST'
  | 'FUTURE_ENGINE_TEST'
  | 'MODEL_COMPARISON_READ'
  | 'REDTEAM_TEST'
  | 'SYSTEM_HEALTH_READ';

export const QA_ALLOWED_PERMISSIONS: readonly QAPermission[] = [
  'OBSERVATORY_READ',
  'OBSERVATORY_TEST',
  'PREDICTION_AUDIT_READ',
  'CALIBRATION_READ',
  'FACTCHECK_READ',
  'DISCRIMINATOR_TEST',
  'AI_CRITIC_TEST',
  'FUTURE_ENGINE_TEST',
  'MODEL_COMPARISON_READ',
  'REDTEAM_TEST',
  'SYSTEM_HEALTH_READ',
] as const;

export const QA_FORBIDDEN_PERMISSIONS = [
  'USER_DATA_DELETE',
  'PRODUCTION_DEPLOY',
  'BILLING_ADMIN',
  'SECRET_READ',
  'DATABASE_ADMIN',
] as const;

export interface QASessionRecord {
  sessionId: string;
  userId: string;
  email: string;
  role: 'DEEPASTRO_QA_ADMIN';
  permissions: QAPermission[];
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent?: string;
}

export interface QAAuditLogEntry {
  id: string;
  qa_user_id: string;
  action: string;
  route: string;
  timestamp: string;
  environment: string;
  result: 'SUCCESS' | 'REJECTED' | 'RATE_LIMITED' | 'ERROR';
  request_id: string;
}

export class AdminQAAccessGuard {
  private static readonly activeSessions: Map<string, QASessionRecord> = new Map();
  private static readonly failedAttempts: Map<string, { count: number; blockedUntil: number }> = new Map();
  private static readonly auditLogs: QAAuditLogEntry[] = [];
  private static generatedDevSecretHash: string | null = null;
  private static generatedDevSecretPlain: string | null = null;

  private static getJwtSecret(): string {
    return process.env.JWT_QA_SECRET || process.env.JWT_SECRET || 'deepastro_qa_secure_matrix_key_2026';
  }

  /**
   * Initializes dev/preview QA credentials securely if not set via environment.
   * Stored only as SHA-256 hash in memory — never plaintext in persistent DB.
   */
  public static initCredentials(): { email: string; isGenerated: boolean } {
    const email = process.env.DEEPASTRO_QA_EMAIL || 'qa-admin@deepastro.internal';

    if (process.env.DEEPASTRO_QA_SECRET) {
      this.generatedDevSecretHash = crypto
        .createHash('sha256')
        .update(process.env.DEEPASTRO_QA_SECRET)
        .digest('hex');
      this.generatedDevSecretPlain = null;
      return { email, isGenerated: false };
    }

    if (!this.generatedDevSecretHash && !this.isStrictProduction()) {
      // Auto-generate high-entropy developer secret for local testing
      const randomSecret = 'QA_' + crypto.randomBytes(16).toString('hex');
      this.generatedDevSecretPlain = randomSecret;
      this.generatedDevSecretHash = crypto
        .createHash('sha256')
        .update(randomSecret)
        .digest('hex');
      return { email, isGenerated: true };
    }

    return { email, isGenerated: false };
  }

  /**
   * Retrieves the generated dev secret ONCE for local terminal output during startup.
   */
  public static getOneTimeDevSecret(): string | null {
    const secret = this.generatedDevSecretPlain;
    this.generatedDevSecretPlain = null; // Clear after retrieval
    return secret;
  }

  /**
   * Evaluates if current runtime environment is strict production.
   */
  public static isStrictProduction(): boolean {
    if (process.env.DEEPASTRO_SIMULATE_PROD === 'true') return true;
    return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
  }

  /**
   * Determines whether QA mode is actively permitted.
   * Must be false in strict production unless explicitly configured with preview override.
   */
  public static isQAModeEnabled(): boolean {
    if (this.isStrictProduction()) {
      return false;
    }
    // In production node_env without simulate prod, ensure explicit DEEPASTRO_QA_MODE=true and preview env
    if (process.env.NODE_ENV === 'production') {
      return process.env.VERCEL_ENV === 'preview' && process.env.DEEPASTRO_QA_MODE === 'true';
    }
    // In development or test environments
    return process.env.DEEPASTRO_QA_MODE !== 'false';
  }

  /**
   * Constant-time credential verification
   */
  public static verifyCredentials(email: string, secret: string): boolean {
    this.initCredentials();
    const expectedEmail = (process.env.DEEPASTRO_QA_EMAIL || 'qa-admin@deepastro.internal').toLowerCase().trim();
    if (email.toLowerCase().trim() !== expectedEmail) {
      return false;
    }

    if (!this.generatedDevSecretHash) {
      return false;
    }

    const inputHash = crypto.createHash('sha256').update(secret).digest('hex');
    const bufA = Buffer.from(inputHash, 'utf-8');
    const bufB = Buffer.from(this.generatedDevSecretHash, 'utf-8');

    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Rate limiting: max 5 failed attempts per IP per 10 minutes
   */
  public static checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.failedAttempts.get(ip);
    if (!record) return { allowed: true, retryAfterSeconds: 0 };

    if (record.blockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000) };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  public static recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const record = this.failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.blockedUntil = now + 10 * 60 * 1000; // 10 minute lock
    }
    this.failedAttempts.set(ip, record);
  }

  public static clearFailedAttempts(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  /**
   * Creates a signed, server-authoritative QA session
   */
  public static createSession(params: {
    email: string;
    ip: string;
    userAgent?: string;
  }): { token: string; session: QASessionRecord } {
    const sessionId = `qa_sess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const userId = `qa_usr_${crypto.randomBytes(6).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 2 * 60 * 60 * 1000; // 2 hour duration

    const session: QASessionRecord = {
      sessionId,
      userId,
      email: params.email,
      role: 'DEEPASTRO_QA_ADMIN',
      permissions: [...QA_ALLOWED_PERMISSIONS],
      createdAt: now,
      expiresAt,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    this.activeSessions.set(sessionId, session);

    const token = jwt.sign(
      {
        sessionId,
        userId,
        email: params.email,
        role: 'DEEPASTRO_QA_ADMIN',
        permissions: session.permissions,
        isQA: true,
      },
      this.getJwtSecret(),
      { expiresIn: '2h' }
    );

    return { token, session };
  }

  /**
   * Verifies and resolves an active QA session
   */
  public static verifySession(token: string): QASessionRecord | null {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret()) as any;
      if (!decoded || decoded.role !== 'DEEPASTRO_QA_ADMIN' || !decoded.sessionId) {
        return null;
      }

      const session = this.activeSessions.get(decoded.sessionId);
      if (!session) return null;

      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(decoded.sessionId);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Revokes a specific QA session
   */
  public static revokeSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Revokes all active QA sessions
   */
  public static revokeAllSessions(): void {
    this.activeSessions.clear();
  }

  /**
   * Logs a sanitized QA audit event (no secrets, tokens, or passwords)
   */
  public static logAudit(params: {
    qa_user_id: string;
    action: string;
    route: string;
    result: 'SUCCESS' | 'REJECTED' | 'RATE_LIMITED' | 'ERROR';
  }): void {
    const entry: QAAuditLogEntry = {
      id: `qa_aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      qa_user_id: params.qa_user_id,
      action: params.action,
      route: params.route,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      result: params.result,
      request_id: crypto.randomBytes(6).toString('hex'),
    };
    this.auditLogs.push(entry);
    if (this.auditLogs.length > 300) {
      this.auditLogs.shift();
    }
  }

  public static getAuditLogs(): QAAuditLogEntry[] {
    return [...this.auditLogs].reverse();
  }

  /**
   * EXPRESS MIDDLEWARE: Anti-Bypass Firewall
   * Strictly inspects and rejects all legacy/unsafe bypass attempts.
   */
  public static antiBypassFirewall = (req: Request, res: Response, next: NextFunction): void => {
    const headers = req.headers;
    const query = req.query as Record<string, any>;
    const body = (req.body || {}) as Record<string, any>;

    // 1. Reject bypass headers
    if (
      headers['x-dev-bypass'] ||
      headers['x-qa-bypass'] ||
      headers['x-admin-bypass'] ||
      headers['x-bypass-auth']
    ) {
      res.status(403).json({
        error: 'Security Gate: Bypass headers are strictly prohibited.',
        code: 'BYPASS_PROHIBITED',
      });
      return;
    }

    // 2. Reject query parameter bypasses
    if (
      query.bypass === 'true' ||
      query.admin === 'true' ||
      query.role === 'admin' ||
      query.isQA === 'true'
    ) {
      res.status(403).json({
        error: 'Security Gate: Query parameter privilege escalation prohibited.',
        code: 'PARAM_ESCALATION_PROHIBITED',
      });
      return;
    }

    // 3. Reject client-controlled role or isAdmin injection in non-auth routes
    if (
      body.role === 'ADMIN' ||
      body.role === 'SUPER_ADMIN' ||
      body.role === 'DEEPASTRO_QA_ADMIN' ||
      body.isAdmin === true
    ) {
      const path = req.path || '';
      if (!path.includes('/login') && !path.includes('/register') && !path.includes('/auth') && !path.includes('/provision-admin')) {
        res.status(403).json({
          error: 'Security Gate: Client-supplied role manipulation rejected.',
          code: 'ROLE_MANIPULATION_PROHIBITED',
        });
        return;
      }
    }

    // 4. Production Firewall: Block QA routes entirely in production if QA mode is disabled
    const path = req.path || '';
    if (path.startsWith('/api/admin/qa') || path.startsWith('/admin/qa')) {
      if (!AdminQAAccessGuard.isQAModeEnabled()) {
        res.status(404).json({
          error: 'Not found',
          code: 'ENDPOINT_NOT_FOUND',
        });
        return;
      }
    }

    next();
  };

  /**
   * EXPRESS MIDDLEWARE: Require QA or Admin authorization
   * Allows either standard ADMIN / SUPER_ADMIN or DEEPASTRO_QA_ADMIN
   */
  public static requireQAOrAdmin = (req: any, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.deepastro_qa_session) {
      token = req.cookies.deepastro_qa_session;
    } else if (req.headers && req.headers.cookie) {
      const match = (req.headers.cookie as string).match(/deepastro_qa_session=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      res.status(401).json({
        error: 'Authentication required. Please provide QA or Admin session token.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // 1. Try resolving QA session
    const qaSession = AdminQAAccessGuard.verifySession(token);
    if (qaSession) {
      req.user = {
        userId: qaSession.userId,
        email: qaSession.email,
        role: 'DEEPASTRO_QA_ADMIN',
        isQA: true,
        permissions: qaSession.permissions,
      };
      next();
      return;
    }

    // 2. Try resolving standard Admin JWT
    try {
      const jwtSecret = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';
      const decoded = jwt.verify(token, jwtSecret) as any;
      if (decoded && (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN')) {
        req.user = {
          userId: decoded.userId || 'admin_user',
          email: decoded.email || 'admin@deepastro.com',
          role: decoded.role,
          isQA: false,
          permissions: [...QA_ALLOWED_PERMISSIONS],
        };
        next();
        return;
      }
    } catch {
      // Token invalid or expired
    }

    res.status(403).json({
      error: 'Insufficient permissions. Authorized QA or Admin role required.',
      code: 'FORBIDDEN_QA_ACCESS',
    });
  };

  /**
   * EXPRESS MIDDLEWARE: Enforce specific QA permission and block forbidden ones
   */
  public static requirePermission = (permission: QAPermission) => {
    return (req: any, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
        return;
      }

      if ((QA_FORBIDDEN_PERMISSIONS as readonly string[]).includes(permission as string)) {
        res.status(403).json({
          error: `Permission ${permission} is forbidden in QA testing mode.`,
          code: 'FORBIDDEN_QA_ACTION',
        });
        return;
      }

      if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
        next();
        return;
      }

      const permissions = req.user.permissions || [];
      if (!permissions.includes(permission)) {
        res.status(403).json({
          error: `Missing required QA permission: ${permission}`,
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      next();
    };
  };

  /**
   * Reset internal session and attempt state (Used by test suites)
   */
  public static resetStateForTesting(): void {
    this.activeSessions.clear();
    this.failedAttempts.clear();
    this.auditLogs.length = 0;
    this.generatedDevSecretHash = null;
    this.generatedDevSecretPlain = null;
  }
}
