/**
 * DeepAstro Personal User Context Engine
 * Manages structured, consent-grounded user contexts across career, relationship,
 * education, location, and decision frameworks.
 */

import { UserStructuredContext } from './IntelligenceTypes.js';

export class ContextEngine {
  private static userContexts: Map<string, UserStructuredContext> = new Map();

  public static getContext(userId: string): UserStructuredContext {
    let ctx = this.userContexts.get(userId);
    if (!ctx) {
      ctx = this.createDefaultContext(userId);
      this.userContexts.set(userId, ctx);
    }
    return ctx;
  }

  public static updateCareerContext(
    userId: string,
    update: Partial<UserStructuredContext['career']> & { userConfirmed?: boolean }
  ): UserStructuredContext {
    const ctx = this.getContext(userId);
    ctx.career = {
      ...ctx.career,
      ...update,
      userConfirmed: update.userConfirmed ?? ctx.career.userConfirmed,
      updatedAt: new Date().toISOString(),
    };
    ctx.lastUpdated = new Date().toISOString();
    return ctx;
  }

  public static updateRelationshipContext(
    userId: string,
    update: Partial<UserStructuredContext['relationship']> & { userConfirmed?: boolean }
  ): UserStructuredContext {
    const ctx = this.getContext(userId);
    ctx.relationship = {
      ...ctx.relationship,
      ...update,
      userConfirmed: update.userConfirmed ?? ctx.relationship.userConfirmed,
      updatedAt: new Date().toISOString(),
    };
    ctx.lastUpdated = new Date().toISOString();
    return ctx;
  }

  public static updateLocationContext(
    userId: string,
    update: Partial<UserStructuredContext['location']> & { userConfirmed?: boolean }
  ): UserStructuredContext {
    const ctx = this.getContext(userId);
    ctx.location = {
      ...ctx.location,
      ...update,
      userConfirmed: update.userConfirmed ?? ctx.location.userConfirmed,
      updatedAt: new Date().toISOString(),
    };
    ctx.lastUpdated = new Date().toISOString();
    return ctx;
  }

  public static updateDecisionContext(
    userId: string,
    update: Partial<UserStructuredContext['decisionContext']> & { userConfirmed?: boolean }
  ): UserStructuredContext {
    const ctx = this.getContext(userId);
    ctx.decisionContext = {
      ...ctx.decisionContext,
      ...update,
      userConfirmed: update.userConfirmed ?? ctx.decisionContext.userConfirmed,
      updatedAt: new Date().toISOString(),
    };
    ctx.lastUpdated = new Date().toISOString();
    return ctx;
  }

  public static purgeUser(userId: string): void {
    this.userContexts.delete(userId);
  }

  public static getAuthoritativeFacts(userId: string): string[] {
    const ctx = this.getContext(userId);
    const facts: string[] = [];

    if (ctx.career.userConfirmed && ctx.career.currentRole) {
      facts.push(`User confirmed role: ${ctx.career.currentRole}${ctx.career.industry ? ` in ${ctx.career.industry}` : ''}`);
    }
    if (ctx.career.userConfirmed && ctx.career.activeGoals?.length) {
      facts.push(`User confirmed career goals: ${ctx.career.activeGoals.join(', ')}`);
    }
    if (ctx.relationship.userConfirmed && ctx.relationship.status) {
      facts.push(`User confirmed relationship status: ${ctx.relationship.status}`);
    }
    if (ctx.location.userConfirmed && ctx.location.currentCity) {
      facts.push(`User confirmed current residence: ${ctx.location.currentCity}`);
    }
    if (ctx.decisionContext.userConfirmed && ctx.decisionContext.question) {
      facts.push(`Active confirmed decision: ${ctx.decisionContext.question}`);
    }

    return facts;
  }

  private static createDefaultContext(userId: string): UserStructuredContext {
    const now = new Date().toISOString();
    return {
      userId,
      career: {
        userConfirmed: false,
        source: 'INITIAL_STATE',
        updatedAt: now,
      },
      relationship: {
        userConfirmed: false,
        source: 'INITIAL_STATE',
        updatedAt: now,
      },
      education: {
        userConfirmed: false,
        source: 'INITIAL_STATE',
        updatedAt: now,
      },
      location: {
        userConfirmed: false,
        source: 'INITIAL_STATE',
        updatedAt: now,
      },
      decisionContext: {
        userConfirmed: false,
        source: 'INITIAL_STATE',
        updatedAt: now,
      },
      lastUpdated: now,
    };
  }
}
