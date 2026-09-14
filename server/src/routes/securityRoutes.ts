/**
 * Server-Side Security Gate Router
 * Validates DEEPASTRO_ACCESS_SECRET on the server side only.
 * Issues signed verification tokens so secrets are never sent to or held in browser clients.
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to equalize timing profile
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}


const router = Router();

// Retrieve authorization secret from server-side environment variables ONLY.
// Default fallback provides strict development capability while production MUST set DEEPASTRO_ACCESS_SECRET.
const ACCESS_SECRET = process.env.DEEPASTRO_ACCESS_SECRET || 'Deep1904';
const JWT_SECURITY_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';
const SECURITY_TOKEN_COOKIE = 'deepastro_sec_gate';

interface SecurityVerifyPayload {
  authorized: boolean;
  timestamp: number;
}

// RATE LIMITING ARCHITECTURE NOTE (CF-007):
// This implementation uses an in-memory Map which is per-process.
// On serverless deployments (Vercel), each cold start creates a new Map instance.
// This means rate limiting is NOT globally consistent across concurrent instances.
// For globally consistent rate limiting, set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
// Without Redis: rate limiting provides per-instance protection only (documented limitation).
// In-memory brute force rate limiter: max 5 failed attempts per IP per 10 minutes
interface RateLimitBucket {
  attempts: number;
  blockedUntil: number;
}
const rateLimits = new Map<string, RateLimitBucket>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimits.get(ip) || { attempts: 0, blockedUntil: 0 };

  if (bucket.blockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function recordAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const bucket = rateLimits.get(ip) || { attempts: 0, blockedUntil: 0 };

  if (success) {
    rateLimits.delete(ip);
    return;
  }

  bucket.attempts += 1;
  if (bucket.attempts >= 5) {
    bucket.blockedUntil = now + 10 * 60 * 1000; // block for 10 minutes
    bucket.attempts = 0;
  }
  rateLimits.set(ip, bucket);
}

// POST /api/security/verify
router.post('/verify', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, retryAfterSeconds } = checkRateLimit(clientIp);

  if (!allowed) {
    return res.status(429).json({
      success: false,
      error: `Too many failed authorization attempts. Access locked for ${retryAfterSeconds} seconds.`,
      code: 'RATE_LIMITED',
    });
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    recordAttempt(clientIp, false);
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required.',
      code: 'CODE_REQUIRED',
    });
  }

  // Constant-time comparison simulation to prevent timing attacks
  const trimmedCode = code.trim();
  const isMatch = safeCompare(trimmedCode, ACCESS_SECRET);

  if (!isMatch) {
    recordAttempt(clientIp, false);
    return res.status(401).json({
      success: false,
      error: 'Invalid authorization code.',
      code: 'UNAUTHORIZED_ACCESS_CODE',
    });
  }

  recordAttempt(clientIp, true);

  // Sign cryptographic proof of gate passage valid for 7 days
  const token = jwt.sign(
    { authorized: true, timestamp: Date.now() },
    JWT_SECURITY_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Cosmic security gate unlocked successfully.',
    token,
  });
});

// GET /api/security/status
router.get('/status', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ unlocked: false });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECURITY_SECRET) as SecurityVerifyPayload;
    if (decoded && decoded.authorized) {
      return res.json({ unlocked: true });
    }
  } catch {
    // expired or invalid token
  }

  return res.json({ unlocked: false });
});

// POST /api/security/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Security gate locked.' });
});

export default router;

