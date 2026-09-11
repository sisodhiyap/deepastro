/**
 * DeepAstro Insight Ranking Engine
 * Prioritizes candidate astrological insights by relevance, timing urgency,
 * and evidence strength, returning the top 3–5 items to prevent cognitive fatigue.
 */

export interface CandidateInsight {
  id: string;
  title: string;
  domain: string;
  summary: string;
  relevanceScore: number; // 0.0 - 1.0
  urgencyScore: number;   // 0.0 - 1.0
  evidenceCount: number;
}

export class InsightRankingEngine {
  public static rankInsights(candidates: CandidateInsight[], limit: number = 5): CandidateInsight[] {
    const scored = candidates.map((c) => {
      // Priority formula: 50% relevance + 30% urgency + 20% evidence density
      const finalRank = c.relevanceScore * 0.5 + c.urgencyScore * 0.3 + Math.min(1.0, c.evidenceCount / 5) * 0.2;
      return {
        ...c,
        finalRank,
      };
    });

    scored.sort((a, b) => (b as any).finalRank - (a as any).finalRank);
    return scored.slice(0, Math.max(3, limit));
  }
}
