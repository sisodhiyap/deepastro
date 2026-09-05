/**
 * DeepAstro Entitlement Middleware
 * Enforces subscription-tier gating and protected resource authorization server-side.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { db } from '../database/db.js';

export function requireEntitlement(featureKey: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Please sign in or create an account to unlock this feature.',
        code: 'AUTH_REQUIRED',
        featureKey,
      });
    }

    const hasAccess = db.hasEntitlement(req.user.userId, featureKey);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'This feature is available to Premium and Pro cosmic subscribers.',
        code: 'UPGRADE_REQUIRED',
        requiredFeature: featureKey,
        currentPlan: db.getSubscription(req.user.userId).planId,
      });
    }

    next();
  };
}
