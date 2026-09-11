/**
 * DeepAstro 3.1 — Context Relevance Engine (ContextRelevanceEngine)
 * Evaluates, ranks, and filters stored user context to prevent prompt context dumping.
 * Enforces the strict Personal Context Priority hierarchy:
 * USER-CONFIRMED CURRENT GOAL >
 * USER-CONFIRMED RECENT EVENT >
 * USER PREFERENCE >
 * USER-CONFIRMED HISTORICAL EVENT >
 * CALCULATED FACT >
 * CLASSICAL INTERPRETATION >
 * WORLD FACT >
 * AI SUGGESTION
 */

import { IntentCategory } from './IntelligenceTypes.js';

export interface ScoredContextItem {
  id: string;
  category:
    | 'GOAL'
    | 'RECENT_EVENT'
    | 'PREFERENCE'
    | 'HISTORICAL_EVENT'
    | 'CALCULATED_FACT'
    | 'CLASSICAL_RULE'
    | 'WORLD_FACT'
    | 'AI_SUGGESTION';
  content: string;
  domain: string;
  relevanceScore: number; // 0.0 - 1.0
  userConfirmed: boolean;
  priorityRank: number; // 1 (highest) to 8 (lowest)
  rationale: string;
}

export class ContextRelevanceEngine {
  public static filterAndRankContext(params: {
    intent: IntentCategory;
    items: Array<{
      id: string;
      category: ScoredContextItem['category'];
      content: string;
      domain?: string;
      date?: string;
      userConfirmed?: boolean;
    }>;
    maxItems?: number;
  }): ScoredContextItem[] {
    const { intent, items, maxItems = 6 } = params;
    const scored: ScoredContextItem[] = [];

    const nowYear = new Date().getFullYear();

    for (const item of items) {
      const itemDomain = (item.domain || '').toUpperCase();
      const intentStr = intent.toUpperCase();

      // Domain match scoring
      let domainMatch = 0.5;
      if (itemDomain && intentStr.includes(itemDomain)) {
        domainMatch = 1.0;
      } else if (
        (intentStr.includes('CAREER') || intentStr.includes('JOB')) &&
        (itemDomain.includes('CAREER') || itemDomain.includes('JOB') || itemDomain.includes('BUSINESS'))
      ) {
        domainMatch = 0.95;
      } else if (
        (intentStr.includes('RELATIONSHIP') || intentStr.includes('MARRIAGE')) &&
        (itemDomain.includes('RELATIONSHIP') || itemDomain.includes('MARRIAGE'))
      ) {
        domainMatch = 0.95;
      } else if (
        (intentStr.includes('RELOCATION') || intentStr.includes('TRAVEL')) &&
        (itemDomain.includes('MOVE') || itemDomain.includes('LOCATION') || itemDomain.includes('CITY'))
      ) {
        domainMatch = 0.95;
      }

      // Priority ranking according to mandate
      let priorityRank = 8;
      let baseWeight = 0.3;

      switch (item.category) {
        case 'GOAL':
          priorityRank = 1;
          baseWeight = 1.0;
          break;
        case 'RECENT_EVENT':
          priorityRank = 2;
          baseWeight = 0.92;
          break;
        case 'PREFERENCE':
          priorityRank = 3;
          baseWeight = 0.85;
          break;
        case 'HISTORICAL_EVENT':
          priorityRank = 4;
          baseWeight = 0.78;
          break;
        case 'CALCULATED_FACT':
          priorityRank = 5;
          baseWeight = 0.72;
          break;
        case 'CLASSICAL_RULE':
          priorityRank = 6;
          baseWeight = 0.65;
          break;
        case 'WORLD_FACT':
          priorityRank = 7;
          baseWeight = 0.55;
          break;
        case 'AI_SUGGESTION':
        default:
          priorityRank = 8;
          baseWeight = 0.35;
          break;
      }

      // Recency multiplier for events
      let recencyMultiplier = 1.0;
      if (item.date) {
        const itemYear = parseInt(item.date.substring(0, 4), 10);
        if (!isNaN(itemYear)) {
          const diff = Math.max(0, nowYear - itemYear);
          recencyMultiplier = Math.max(0.6, 1.0 - diff * 0.04);
        }
      }

      // User confirmed gate: unconfirmed AI suggestions cannot outrank confirmed facts
      const confirmationMultiplier = item.userConfirmed ? 1.1 : 0.6;
      const relevanceScore = Math.min(
        1.0,
        Number((baseWeight * domainMatch * recencyMultiplier * confirmationMultiplier).toFixed(3))
      );

      // Only items with meaningful relevance to the current query are included
      if (domainMatch >= 0.4 && relevanceScore >= 0.18) {
        scored.push({
          id: item.id,
          category: item.category,
          content: item.content,
          domain: itemDomain,
          relevanceScore,
          userConfirmed: Boolean(item.userConfirmed),
          priorityRank,
          rationale: `Domain match ${domainMatch}, priority rank ${priorityRank}, confirmation: ${Boolean(item.userConfirmed)}`,
        });
      }
    }

    // Sort primarily by priorityRank (ascending: 1 is top priority), then by relevanceScore (descending)
    scored.sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      return b.relevanceScore - a.relevanceScore;
    });

    return scored.slice(0, maxItems);
  }
}
