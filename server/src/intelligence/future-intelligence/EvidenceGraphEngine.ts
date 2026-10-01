/**
 * EvidenceGraphEngine.ts
 * Manages the construction, query, and deduplication of machine-readable PredictionEvidence graphs.
 */

import { PredictionEvidence } from './types.js';

export class EvidenceGraphEngine {
  /**
   * Deduplicates and orders evidence items by weight and direction.
   */
  public static compileGraph(evidenceList: PredictionEvidence[]): PredictionEvidence[] {
    const seen = new Set<string>();
    const compiled: PredictionEvidence[] = [];

    for (const item of evidenceList) {
      const key = `${item.source}::${item.rule}::${item.value}`;
      if (!seen.has(key)) {
        seen.add(key);
        compiled.push(item);
      }
    }

    // Sort descending by weight
    return compiled.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Filters evidence graph by specific life domain or source
   */
  public static filterBySource(
    graph: PredictionEvidence[],
    source: PredictionEvidence['source']
  ): PredictionEvidence[] {
    return graph.filter((e) => e.source === source);
  }
}
