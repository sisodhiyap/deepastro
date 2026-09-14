/**
 * DeepAstro Authentication Middleware
 * Handles Supabase auth token verification and custom JWT verification,
 * user context injection, and role-based access control.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { supabaseAdmin } from '../database/supabaseServer.js';
import { AdminQAAccessGuard } from '../security/AdminQAAccessGuard.js';
import { AuthBootstrapService } from '../services/AuthBootstrapService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN' | 'DEEPASTRO_QA_ADMIN';
  provider?: string;
  fullName?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Verifies a token, checking:
 * 1. QA static guard session
 * 2. Supabase Auth token (via supabaseAdmin.auth.getUser)
 * 3. DeepAstro internal JWT
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  // 1. Check QA session guard
  const qaSession = AdminQAAccessGuard.verifySession(token);
  if (qaSession) {
    return {
      userId: qaSession.userId,
      email: qaSession.email,
      role: qaSession.role,
      provider: 'QA_GUARD',
    };
  }

  // 2. Check Supabase Auth JWT
  try {
    const { data: sbData, error: sbError } = await supabaseAdmin.auth.getUser(token);
    if (!sbError && sbData?.user) {
      const sbUser = sbData.user;
      const email = sbUser.email || '';
      const fullName = (sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0] || 'Cosmic Seeker').trim();
      const avatarUrl = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '';

      // Server-side profile bootstrap ensures database consistency
      const { user } = await AuthBootstrapService.ensureUserProfile({
        authUserId: sbUser.id,
        email,
        fullName,
        avatarUrl,
        role: 'CLIENT',
      });

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName,
        provider: sbUser.app_metadata?.provider || 'supabase',
      };
    }
  } catch (err) {
    // Continue to standard JWT fallback
  }

  // 3. Fallback to DeepAstro custom JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    const user = db.getUserById(decoded.userId);
    if (user) {
      const profile = db.getProfile(user.id);
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: profile?.fullName,
        provider: 'local_jwt',
      };
    }
  } catch (err) {
    // Token invalid
  }

  return null;
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Optional auth - do not fail
  }
  next();
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required. Please log in to access this cosmic feature.',
        code: 'AUTH_REQUIRED',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.', code: 'INVALID_TOKEN' });
  }
}

export function requireRole(roles: Array<'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN' | 'DEEPASTRO_QA_ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.', code: 'AUTH_REQUIRED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions for this administrative endpoint.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}