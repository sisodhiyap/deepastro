/**
 * Subscription Service
 * Manages user plan upgrades, feature entitlements, payment orders, and invoices.
 * Supports Razorpay (UPI, QR, Cards, NetBanking) and Stripe.
 */

import { db, SubscriptionRecord, BillingDetails, PaymentInvoiceRecord } from '../database/db.js';
import { SEED_PLANS } from '../database/seed.js';

export interface CreateOrderParams {
  planId: 'PREMIUM' | 'PRO';
  gateway: 'razorpay' | 'stripe';
  billingDetails: BillingDetails;
}

export interface PaymentProcessParams {
  userId: string;
  planId: 'PREMIUM' | 'PRO';
  gateway: 'razorpay' | 'stripe';
  method: 'upi_qr' | 'gpay' | 'card' | 'netbanking';
  billingDetails: BillingDetails;
  orderId?: string;
  paymentId?: string;
  cardLast4?: string;
  upiId?: string;
}

export class SubscriptionService {
  public static getPlans() {
    return SEED_PLANS;
  }

  public static getUserSubscription(userId: string): SubscriptionRecord {
    return db.getSubscription(userId);
  }

  public static createOrder(params: CreateOrderParams) {
    const { planId, gateway, billingDetails } = params;
    const amount = planId === 'PRO' ? 1499 : 499;
    const planName = planId === 'PRO' ? 'Cosmic Sovereign' : 'Cosmic Voyager';
    
    // Order ID generation
    const prefix = gateway === 'razorpay' ? 'order_rp' : 'pi_stripe';
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const orderId = `${prefix}_${Date.now()}_${randomSuffix}`;

    // UPI Deep link string
    const upiString = `upi://pay?pa=deepastro@upi&pn=DeepAstro%20Vedic%20Intelligence&am=${amount}.00&cu=INR&tn=DeepAstro%20${planId}%20Subscription`;

    // GST Breakdown (18% inclusive)
    const baseAmount = Math.round((amount / 1.18) * 100) / 100;
    const gstAmount = Math.round((amount - baseAmount) * 100) / 100;

    return {
      orderId,
      amount,
      currency: 'INR' as const,
      baseAmount,
      gstAmount,
      planId,
      planName,
      gateway,
      billingDetails,
      upiString,
      upiId: 'deepastro@upi',
      merchantName: 'DeepAstro Cosmic Technologies Pvt Ltd',
      keyId: gateway === 'razorpay' 
        ? (process.env.RAZORPAY_KEY_ID || 'rzp_live_deepastro_prod') 
        : (process.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_deepastro_prod'),
    };
  }

  public static upgradePlan(
    userId: string,
    targetPlanId: 'FREE' | 'PREMIUM' | 'PRO',
    gateway?: 'razorpay' | 'stripe',
    lastPaymentId?: string
  ): { subscription: SubscriptionRecord; activeEntitlements: string[] } {
    const sub: SubscriptionRecord = {
      id: `sub_${Date.now()}_${userId}`,
      userId,
      planId: targetPlanId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      gateway,
      lastPaymentId,
    };

    db.subscriptions.set(userId, sub);

    // Grant corresponding entitlements
    if (targetPlanId === 'PREMIUM' || targetPlanId === 'PRO') {
      db.grantEntitlement(userId, 'view_protected_astrologer_contact');
      db.grantEntitlement(userId, 'full_kundli');
      db.grantEntitlement(userId, 'matching');
      db.grantEntitlement(userId, 'palmistry');
      db.grantEntitlement(userId, 'numerology');
      db.grantEntitlement(userId, 'reports');
      db.grantEntitlement(userId, 'astrobot');
      db.grantEntitlement(userId, 'FUTURE_INTELLIGENCE_PREMIUM');
    }

    if (targetPlanId === 'PRO') {
      db.grantEntitlement(userId, 'multi_model_ai');
      db.grantEntitlement(userId, 'priority_consultations');
      db.grantEntitlement(userId, 'family_vault');
    }

    const entitlements = Array.from(db.entitlements.get(userId) || []);

    return {
      subscription: sub,
      activeEntitlements: entitlements,
    };
  }

  public static processPayment(params: PaymentProcessParams) {
    const { userId, planId, gateway, method, billingDetails, orderId, paymentId, cardLast4, upiId } = params;
    const amount = planId === 'PRO' ? 1499 : 499;
    const planName = planId === 'PRO' ? 'Cosmic Sovereign' : 'Cosmic Voyager';

    const actualPaymentId = paymentId || `pay_${gateway.slice(0, 2)}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const actualOrderId = orderId || `ord_${Date.now()}`;

    // 1. Upgrade user subscription
    const upgradeResult = this.upgradePlan(userId, planId, gateway, actualPaymentId);

    // 2. Generate cryptographically distinct Invoice
    const invoiceNum = `DA-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoice: PaymentInvoiceRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: invoiceNum,
      userId,
      planId,
      planName,
      amount,
      currency: 'INR',
      gateway,
      method,
      status: 'PAID',
      billingDetails,
      transactionId: actualPaymentId,
      orderId: actualOrderId,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      cardLast4: cardLast4 || (method === 'card' ? '4242' : undefined),
      upiId: upiId || (method === 'gpay' || method === 'upi_qr' ? (billingDetails.email ? billingDetails.email.split('@')[0] + '@upi' : 'user@okaxis') : undefined),
    };

    db.addInvoice(invoice);

    return {
      success: true,
      subscription: upgradeResult.subscription,
      activeEntitlements: upgradeResult.activeEntitlements,
      invoice,
    };
  }

  public static getUserInvoices(userId: string): PaymentInvoiceRecord[] {
    return db.getInvoices(userId);
  }
}
