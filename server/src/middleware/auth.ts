/**
 * DeepAstro Authentication Middleware
 * Handles JWT verification, user context injection, and role-based access control.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN';
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    const user = db.getUserById(decoded.userId);
    if (user) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch (err) {
    // Optional auth - do not fail if token is invalid or expired
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to access this cosmic feature.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.', code: 'USER_NOT_FOUND' });
    }
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.', code: 'INVALID_TOKEN' });
  }
}

export function requireRole(roles: Array<'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN'>) {
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
