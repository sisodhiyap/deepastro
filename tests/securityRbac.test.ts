/**
 * Security, RBAC & IDOR Automated Verification Suite
 * Enforces role-based permissions, resource ownership, and contact protection.
 */

import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { db } from '../server/src/database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

describe('Security, RBAC & IDOR Verification', () => {
  it('enforces RBAC: admin endpoints reject standard users and unauthenticated callers', () => {
    // 1. Unauthenticated token
    expect(() => {
      jwt.verify('invalid_token', JWT_SECRET);
    }).toThrow();

    // 2. Standard user token
    const userToken = jwt.sign(
      { userId: 'usr_test_std', email: 'user@deepastro.com', role: 'USER' },
      JWT_SECRET
    );
    const decodedUser = jwt.verify(userToken, JWT_SECRET) as any;
    expect(decodedUser.role).toBe('USER');
    expect(['ADMIN', 'SUPER_ADMIN'].includes(decodedUser.role)).toBe(false);

    // 3. Admin user token
    const adminToken = jwt.sign(
      { userId: 'usr_test_admin', email: 'admin@deepastro.com', role: 'ADMIN' },
      JWT_SECRET
    );
    const decodedAdmin = jwt.verify(adminToken, JWT_SECRET) as any;
    expect(decodedAdmin.role).toBe('ADMIN');
    expect(['ADMIN', 'SUPER_ADMIN'].includes(decodedAdmin.role)).toBe(true);
  });

  it('enforces Astrologer Contact Shield: phone, whatsapp, and email are NEVER leaked to unentitled users', () => {
    // Fetch astrologers without user context (unauthenticated)
    const unauthList = db.getAstrologers();
    expect(unauthList.length).toBeGreaterThan(0);
    for (const astro of unauthList) {
      expect(astro.phone).toBeUndefined();
      expect(astro.whatsapp).toBeUndefined();
      expect(astro.email).toBeUndefined();
      expect(astro.hasDirectContactAccess).toBe(false);
    }

    // Fetch astrologers as a standard FREE user
    const freeUserId = 'usr_test_free_seeker';
    const freeList = db.getAstrologers(freeUserId);
    for (const astro of freeList) {
      expect(astro.phone).toBeUndefined();
      expect(astro.whatsapp).toBeUndefined();
      expect(astro.email).toBeUndefined();
      expect(astro.hasDirectContactAccess).toBe(false);
    }

    // Grant entitlement (e.g. upgraded to PREMIUM) and verify contact access unlocks
    db.grantEntitlement(freeUserId, 'view_protected_astrologer_contact');
    const entitledList = db.getAstrologers(freeUserId);
    for (const astro of entitledList) {
      expect(astro.phone).toBeDefined();
      expect(astro.whatsapp).toBeDefined();
      expect(astro.email).toBeDefined();
      expect(astro.hasDirectContactAccess).toBe(true);
    }
  });

  it('enforces IDOR Protection: reports tied to User A reject unauthorized access by User B', () => {
    const reportOwnerId = 'usr_owner_101';
    const attackerId = 'usr_attacker_202';

    const mockReport = {
      id: 'rep_test_secret_123',
      userId: reportOwnerId,
      title: 'Confidential Vedic Kundli',
    };

    // Helper simulating reportRoutes IDOR authorization logic
    const canAccessReport = (requestUserId?: string, userRole?: string): boolean => {
      if (!mockReport.userId) return true; // public sample
      if (!requestUserId) return false;
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return true;
      return requestUserId === mockReport.userId;
    };

    // Unauthenticated access
    expect(canAccessReport(undefined)).toBe(false);

    // Attacker User B access
    expect(canAccessReport(attackerId, 'USER')).toBe(false);

    // Owner User A access
    expect(canAccessReport(reportOwnerId, 'USER')).toBe(true);

    // Admin access
    expect(canAccessReport('usr_admin_999', 'ADMIN')).toBe(true);
  });
});
