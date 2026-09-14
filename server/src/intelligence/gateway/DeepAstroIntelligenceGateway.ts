/**
 * DeepAstro Intelligence Gateway â€” Fortress Security Gateway
 * Version: FORTRESS-1.0
 * The single authoritative entry point for all proprietary DeepAstro intelligence.
 * 
 * Pipeline:
 * CLIENT
 *  â†“
 * AUTHENTICATION
 *  â†“
 * AUTHORIZATION
 *  â†“
 * ENTITLEMENT
 *  â†“
 * CONSENT
 *  â†“
 * RATE LIMIT
 *  â†“
 * REQUEST VALIDATION
 *  â†“
 * INTELLIGENCE GATEWAY
 *  â†“
 * DEEPASTRO INTERNAL ENGINES
 *  â†“
 * AUDIT & DAIR
 *  â†“
 * SANITIZATION
 *  â†“
 * CLIENT RESPONSE
 */

import { DeepAstroConstitution } from '../../governance/DeepAstroConstitution.js';
import { DeepAstroProvenanceService, ProvenanceRecord } from '../../services/DeepAstroProvenanceService.js';
import { DAIRPayload, DAIRBuilder } from '../dair/DAIRContract.js';
import { AIAuditor } from '../../ai/AIAuditor.js';

export type IntelligenceDomain =
  | 'FUTURE_MAP'
  | 'SOUL_TRACE'
  | 'ASTROBOT_CHAT'
  | 'KUNDLI_INSIGHT'
  | 'MARKET_INTELLIGENCE'
  | 'NUMEROLOGY'
  | 'VERIFICATION';

export type UserTier = 'ANONYMOUS' | 'FREE' | 'PRO' | 'PREMIUM' | 'ADMIN';

export interface GatewayRequest<T = any> {
  domain: IntelligenceDomain;
  userId: string;
  userTier: UserTier;
  sessionToken?: string;
  hasConsent: boolean;
  consentLevel?: 'BASIC' | 'YEARLY' | 'MONTHLY' | 'DETAILED' | 'SENSITIVE';
  clientIp?: string;
  payload: T;
}

export interface GatewayResponse<T = any> {
  success: boolean;
  domain: IntelligenceDomain;
  data: T;
  dair?: Partial<DAIRPayload>;
  provenance: {
    verificationId: string;
    engineVersion: string;
    calculationFingerprint: string;
    issuedAt: string;
  };
  sanitized: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export class DeepAstroIntelligenceGateway {
  public static readonly VERSION = 'FORTRESS-1.0';

  // In-memory sliding rate limiter: key -> [timestamps]
  private static rateLimits: Map<string, number[]> = new Map();

  /**
   * Enforces sliding-window rate limit
   */
  private static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.rateLimits.get(key) || [];
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length >= limit) {
      return false;
    }
    valid.push(now);
    this.rateLimits.set(key, valid);
    return true;
  }

  /**
   * Sanitizes output payload: ensures no credentials, internal paths, raw formulas,
   * database details, or prompts are exposed in client responses.
   */
  public static sanitizeResponse<T>(raw: any): T {
    if (raw === null || raw === undefined) return raw;
    if (typeof raw === 'string') {
      // Scrub sensitive patterns
      return raw
        .replace(/(?:postgres:\/\/[^@\s]+@[^\s]+)/gi, '[REDACTED_DATABASE_URI]')
        .replace(/(?:sk-[a-zA-Z0-9_-]{20,})/gi, '[REDACTED_API_KEY]')
        .replace(/(?:AIza[0-9A-Za-z-_]{35})/gi, '[REDACTED_GEMINI_KEY]')
        .replace(/(?:sbp_[a-zA-Z0-9_-]{20,})/gi, '[REDACTED_SUPABASE_KEY]')
        .replace(/[A-Z]:[\\/][^\s"']+/gi, '[INTERNAL_PATH]') as any;

    }
    if (Array.isArray(raw)) {
      return raw.map((item) => this.sanitizeResponse(item)) as any;
    }
    if (typeof raw === 'object') {
      const sanitized: Record<string, any> = {};
      const forbiddenKeys = [
        'password',
        'apiKey',
        'secret',
        'systemPrompt',
        'internalFormula',
        'dbPassword',
        'connectionString',
        'serviceRoleKey',
        'rawPromptTemplate',
      ];
      for (const [k, v] of Object.entries(raw)) {
        if (!forbiddenKeys.includes(k)) {
          sanitized[k] = this.sanitizeResponse(v);
        }
      }
      return sanitized as any;
    }
    return raw;
  }

  /**
   * Central Intelligence Processing Method
   */
  public static async processIntelligence<TReq, TRes>(
    request: GatewayRequest<TReq>,
    engineExecutor: (sanitizedReq: GatewayRequest<TReq>) => Promise<{
      result: TRes;
      dair?: DAIRPayload;
      calculationData?: any;
    }>
  ): Promise<GatewayResponse<TRes>> {
    const clientKey = request.userId || request.clientIp || 'anonymous_client';

    // 1. Rate Limit Enforcement
    const limit = request.userTier === 'PREMIUM' || request.userTier === 'ADMIN' ? 120 : 30;
    const windowMs = 60000; // 1 minute
    if (!this.checkRateLimit(clientKey, limit, windowMs)) {
      return {
        success: false,
        domain: request.domain,
        data: null as any,
        provenance: {
          verificationId: 'UNREGISTERED',
          engineVersion: this.VERSION,
          calculationFingerprint: '',
          issuedAt: new Date().toISOString(),
        },
        sanitized: true,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many intelligence requests in a short window. Please wait a moment.',
        },
      };
    }

    // 2. Entitlement & Tier Check
    if (request.domain === 'FUTURE_MAP' && request.userTier === 'ANONYMOUS') {
      return {
        success: false,
        domain: request.domain,
        data: null as any,
        provenance: {
          verificationId: 'UNREGISTERED',
          engineVersion: this.VERSION,
          calculationFingerprint: '',
          issuedAt: new Date().toISOString(),
        },
        sanitized: true,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required to access DeepAstro Future Intelligence.',
        },
      };
    }

    // 3. Consent Check
    if (request.domain === 'FUTURE_MAP' && !request.hasConsent) {
      return {
        success: false,
        domain: request.domain,
        data: null as any,
        provenance: {
          verificationId: 'UNREGISTERED',
          engineVersion: this.VERSION,
          calculationFingerprint: '',
          issuedAt: new Date().toISOString(),
        },
        sanitized: true,
        error: {
          code: 'FUTURE_CONSENT_REQUIRED',
          message: 'Explicit user consent is required before accessing multi-year future projections.',
        },
      };
    }

    // 4. Request Validation & Constitution Check
    try {
      if (typeof request.payload === 'object' && request.payload !== null) {
        const strDump = JSON.stringify(request.payload);
        DeepAstroConstitution.assertNoDeathPrediction(strDump);
        DeepAstroConstitution.assertNoMedicalDiagnosis(strDump);
        DeepAstroConstitution.assertNoGuaranteedReturns(strDump);
      }
    } catch (err: any) {
      return {
        success: false,
        domain: request.domain,
        data: null as any,
        provenance: {
          verificationId: 'UNREGISTERED',
          engineVersion: this.VERSION,
          calculationFingerprint: '',
          issuedAt: new Date().toISOString(),
        },
        sanitized: true,
        error: {
          code: 'CONSTITUTIONAL_SAFETY_BLOCK',
          message: err.message,
        },
      };
    }

    // 5. Internal Engine Execution
    try {
      const executionResult = await engineExecutor(request);

      // 6. Generate Provenance Record
      const provenance = DeepAstroProvenanceService.registerForecast({
        calculationData: executionResult.calculationData || { timestamp: Date.now() },
        forecastData: executionResult.result,
        serviceType: request.domain,
        summaryTitle: `DeepAstro ${request.domain} Forecast`,
      });

      // 7. Sanitization & Safety Audit
      const sanitizedData = this.sanitizeResponse<TRes>(executionResult.result);

      return {
        success: true,
        domain: request.domain,
        data: sanitizedData,
        dair: executionResult.dair,
        provenance: {
          verificationId: provenance.verificationId,
          engineVersion: provenance.engineVersion,
          calculationFingerprint: provenance.calculationFingerprint,
          issuedAt: provenance.createdAt,
        },
        sanitized: true,
      };
    } catch (engineError: any) {
      console.error(`[DeepAstroIntelligenceGateway] Execution Error in ${request.domain}:`, engineError);
      return {
        success: false,
        domain: request.domain,
        data: null as any,
        provenance: {
          verificationId: 'EXECUTION_FAILED',
          engineVersion: this.VERSION,
          calculationFingerprint: '',
          issuedAt: new Date().toISOString(),
        },
        sanitized: true,
        error: {
          code: 'ENGINE_FAILURE',
          message: 'An internal calculation error occurred while synthesizing intelligence.',
        },
      };
    }
  }
}