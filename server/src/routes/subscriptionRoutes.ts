/**
 * Subscription & Payment Gateway Routes
 * Handles Razorpay (UPI, GPay QR, Cards, NetBanking) and Stripe checkout flows,
 * order creation, cryptographic invoice generation, and tier entitlement activation.
 */

import { Router, Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../database/db.js';

const router = Router();

// GET /api/subscription/plans
router.get('/plans', (_req: Request, res: Response) => {
  const plans = SubscriptionService.getPlans();
  return res.json({ plans });
});

// GET /api/subscription/current
router.get('/current', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.json({
      subscription: {
        id: 'sub_guest',
        userId: 'guest',
        planId: 'FREE',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  const sub = SubscriptionService.getUserSubscription(userId);
  return res.json({ subscription: sub });
});

// POST /api/subscription/create-order
router.post('/create-order', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, gateway = 'razorpay', billingDetails } = req.body;

    if (!['PREMIUM', 'PRO'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid paid plan tier requested.' });
    }

    if (!billingDetails || !billingDetails.fullName || !billingDetails.email) {
      return res.status(400).json({ error: 'Billing details (Full Name and Email) are required.' });
    }

    const order = SubscriptionService.createOrder({
      planId,
      gateway: gateway === 'stripe' ? 'stripe' : 'razorpay',
      billingDetails,
    });

    return res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create payment order.', details: err.message });
  }
});

// POST /api/subscription/verify-payment
router.post('/verify-payment', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      planId,
      gateway = 'razorpay',
      method = 'upi_qr',
      billingDetails,
      orderId,
      paymentId,
      cardLast4,
      upiId,
    } = req.body;

    if (!['PREMIUM', 'PRO'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan tier.' });
    }

    // Determine user ID: from session, or resolve from billing email
    let userId = req.user?.userId;
    if (!userId) {
      if (billingDetails?.email) {
        const existing = db.getUserByEmail(billingDetails.email);
        if (existing) {
          userId = existing.id;
        } else {
          userId = 'usr_' + Buffer.from(billingDetails.email).toString('hex').slice(0, 12);
        }
      } else {
        userId = 'usr_guest_' + Date.now();
      }
    }

    const result = SubscriptionService.processPayment({
      userId,
      planId,
      gateway: gateway === 'stripe' ? 'stripe' : 'razorpay',
      method,
      billingDetails: billingDetails || {
        fullName: 'DeepAstro Patron',
        email: 'subscriber@deepastro.com',
        phone: '+91 9876543210',
        address: 'Cosmic Gateway',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      orderId,
      paymentId,
      cardLast4,
      upiId,
    });

    return res.json({
      message: `Payment verified successfully! Welcome to DeepAstro ${result.invoice.planName}.`,
      ...result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify payment.', details: err.message });
  }
});

// POST /api/subscription/upgrade (Direct upgrade fallback)
router.post('/upgrade', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_guest_' + Date.now();
    const { planId } = req.body;

    if (!['FREE', 'PREMIUM', 'PRO'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid cosmic plan tier.' });
    }

    const result = SubscriptionService.upgradePlan(userId, planId);

    return res.json({
      message: `Successfully ascended to DeepAstro ${planId} tier.`,
      ...result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process subscription upgrade.', details: err.message });
  }
});

// GET /api/subscription/invoices
router.get('/invoices', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.json({ invoices: [] });
  const invoices = SubscriptionService.getUserInvoices(userId);
  return res.json({ invoices });
});

export default router;
